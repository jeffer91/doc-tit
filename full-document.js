(() => {
  const SOURCE_PAGE_COUNT = 45;
  let templatePromise = null;

  function esc(v){
    return String(v == null ? "" : v).replace(/[&<>"']/g, function(m){
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m];
    });
  }

  function normalizeHeading(v){
    return String(v || "")
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
      .replace(/[^a-z0-9]+/g," ")
      .trim();
  }

  function lowerPeriod(name){
    var s=String(name||"");
    return s ? s.charAt(0).toLowerCase()+s.slice(1) : s;
  }

  async function decodeTemplatePages(){
    if(templatePromise) return templatePromise;
    templatePromise=(async function(){
      var chunks=window.DOC_TIT_TEMPLATE_CHUNKS || [];
      if(chunks.length !== 4 || chunks.some(function(x){return !x;})){
        throw new Error("Plantilla completa no disponible.");
      }
      if(typeof DecompressionStream === "undefined"){
        throw new Error("Usa Chrome o Edge actualizado para generar la planificación completa.");
      }
      var binary=atob(chunks.join(""));
      var bytes=new Uint8Array(binary.length);
      for(var i=0;i<binary.length;i++) bytes[i]=binary.charCodeAt(i);
      var stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
      var text=await new Response(stream).text();
      var pages=JSON.parse(text);
      if(!Array.isArray(pages) || pages.length !== SOURCE_PAGE_COUNT){
        throw new Error("La plantilla base no contiene las 45 páginas esperadas.");
      }
      return pages;
    })();
    return templatePromise;
  }

  function replacePeriod(text, period){
    var current=String(period.name||"");
    var lower=lowerPeriod(current);
    return String(text||"")
      .replace(/Octubre\s+2025\s+A\s+Marzo\s+2026/gi,current)
      .replace(/octubre\s+2025\s*[–-]\s*marzo\s+2026/gi,lower)
      .replace(/octubre\s+2025\s+a\s+marzo\s+2026/gi,lower);
  }

  function headerHtml(pageNo,total,ctx){
    var logo=ctx.assets && ctx.assets.logo;
    var logoHtml=logo
      ? "<img src='"+logo+"' alt='Logo institucional'>"
      : "<span>LOGO<br>INSTITUCIONAL</span>";
    return ""
      +"<div class='institutional-header-v3'>"
      +"  <div class='ih3-logo'>"+logoHtml+"</div>"
      +"  <div class='ih3-unit'>UNIDAD DE TITULACIÓN Y EFICIENCIA TERMINAL</div>"
      +"  <div class='ih3-code'>Código:<br><b>"+esc(ctx.code)+"</b></div>"
      +"  <div class='ih3-document'><b>Planificación De Examen Complexivo</b><br>"+esc(ctx.period.name)+"</div>"
      +"</div>"
      +"<div class='apa-page-number'>Página "+pageNo+" de "+total+"</div>";
  }

  function stripSourcePage(text,pageNo,period){
    var raw=replacePeriod(text,period);
    var lines=raw.split(/\r?\n/);
    var clean=[];
    lines.forEach(function(line){
      var t=line.trim();
      if(!t) return;
      if(/^Página\s+\d+\s+de\s+45$/i.test(t)) return;
      if(/^UNIDAD TITULACIÓN Y EFICIENCIA/i.test(t)) return;
      if(/^TERMINAL$/i.test(t)) return;
      if(/^Código:/i.test(t)) return;
      if(/^UTET-RGI/i.test(t)) return;
      if(/^Versión:/i.test(t)) return;
      if(/^Fecha de Elaboración:/i.test(t)) return;
      if(/^\d{1,2}\s*-\s*[A-Za-zÁÉÍÓÚáéíóúÑñ]+\s*-\s*\d{4}$/i.test(t)) return;
      if(/^Planificación De Examen Complexivo/i.test(t)) return;
      if(/^Octubre\s+2025\s+A\s+Marzo\s+2026/i.test(t)) return;
      if(new RegExp("^"+String(period.name||"").replace(/[.*+?^$()|[\]\\]/g,"\\$&"),"i").test(t)) return;
      clean.push(t);
    });
    if(pageNo===6){
      var idx=clean.findIndex(function(x){return /^3\.\s*METODOLOGÍA/i.test(x);});
      if(idx>=0) clean=clean.slice(idx);
    }
    return clean;
  }

  function blockType(line){
    if(/^\d+\.\d+\.\d+\.?\s+/.test(line)) return "h3";
    if(/^\d+\.\d+\.?\s+/.test(line)) return "h2";
    if(/^\d+\.\s+/.test(line)) return "h1";
    if(/^[•]/.test(line) || /^o\s+/.test(line)) return "bullet";
    if(/^(Descripción|Objetivo|Características|Requisitos|Condiciones|Beneficios|Procedimiento|Importancia|Estructura|Duración|Modalidad online|Consideraciones técnicas|Asignación por carrera|Distribución por sedes|Ponderación y aprobación):?/i.test(line)) return "emphasis";
    return "p";
  }

  function parseBlocks(text,pageNo,period){
    var lines=stripSourcePage(text,pageNo,period);
    var blocks=[];
    var paragraph=[];

    function flush(){
      if(!paragraph.length) return;
      var joined=paragraph.join(" ").replace(/\s+/g," ").trim();
      if(joined){
        if(pageNo>=44){
          blocks.push({type:"ref",text:joined});
        }else{
          blocks.push({type:"p",text:joined});
        }
      }
      paragraph=[];
    }

    lines.forEach(function(line){
      var type=blockType(line);
      if(type==="p"){
        paragraph.push(line);
      }else{
        flush();
        blocks.push({type:type,text:line});
      }
    });
    flush();
    return splitLongBlocks(blocks);
  }

  function splitLongBlocks(blocks){
    var out=[];
    blocks.forEach(function(b){
      if((b.type==="p" || b.type==="ref") && b.text.length>900){
        var sentences=b.text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [b.text];
        var buf="";
        sentences.forEach(function(s){
          var next=(buf+" "+s.trim()).trim();
          if(next.length>760 && buf){
            out.push({type:b.type,text:buf});
            buf=s.trim();
          }else{
            buf=next;
          }
        });
        if(buf) out.push({type:b.type,text:buf});
      }else{
        out.push(b);
      }
    });
    return out;
  }

  function blockCost(b){
    var len=(b.text||"").length;
    if(b.type==="h1") return len+260;
    if(b.type==="h2") return len+220;
    if(b.type==="h3") return len+190;
    if(b.type==="emphasis") return len+150;
    if(b.type==="bullet") return len+120;
    if(b.type==="ref") return len+80;
    return len+150;
  }

  function paginateBlocks(blocks){
    var maxUnits=1280;
    var pages=[];
    var current=[];
    var units=0;
    blocks.forEach(function(b){
      var cost=blockCost(b);
      if(current.length && units+cost>maxUnits){
        pages.push(current);
        current=[];
        units=0;
      }
      current.push(b);
      units+=cost;
    });
    if(current.length) pages.push(current);
    return pages;
  }

  function renderBlock(b){
    if(b.type==="h1") return "<h1 class='apa-h1'>"+esc(b.text)+"</h1>";
    if(b.type==="h2") return "<h2 class='apa-h2'>"+esc(b.text)+"</h2>";
    if(b.type==="h3") return "<h3 class='apa-h3'>"+esc(b.text)+"</h3>";
    if(b.type==="bullet") return "<div class='apa-bullet'>"+esc(b.text)+"</div>";
    if(b.type==="emphasis") return "<div class='apa-emphasis'>"+esc(b.text)+"</div>";
    if(b.type==="ref") return "<p class='apa-reference'>"+esc(b.text)+"</p>";
    return "<p class='apa-p'>"+esc(b.text)+"</p>";
  }

  function blocksHtml(blocks){
    return "<div class='apa-content'>"+blocks.map(renderBlock).join("")+"</div>";
  }

  function formatDateLong(v){
    if(!v) return "";
    var d=new Date(v+"T12:00:00");
    return new Intl.DateTimeFormat("es-EC",{day:"2-digit",month:"long",year:"numeric"}).format(d);
  }

  function formatDateShort(v){
    if(!v) return "";
    var d=new Date(v+"T12:00:00");
    return new Intl.DateTimeFormat("es-EC",{day:"2-digit",month:"2-digit",year:"numeric"}).format(d);
  }

  function totals(distribution){
    var byPlace={};
    var total=0;
    (distribution||[]).forEach(function(r){
      var n=Number(r.count)||0;
      var p=r.place||"Sin lugar";
      byPlace[p]=(byPlace[p]||0)+n;
      total+=n;
    });
    return {byPlace:byPlace,total:total};
  }

  function coverBody(ctx){
    return ""
      +"<div class='cover-v3'>"
      +"<h1>Planificación De Examen Complexivo</h1>"
      +"<h2>"+esc(ctx.period.name)+"</h2>"
      +"<div class='cover-meta'><b>Código:</b> "+esc(ctx.code)+"</div>"
      +"<div class='cover-meta'><b>Fecha de elaboración:</b> "+esc(formatDateLong(ctx.period.start))+"</div>"
      +"<p>Unidad de Titulación y Eficiencia Terminal</p>"
      +"</div>";
  }

  function introBodies(ctx){
    var t=totals(ctx.distribution);
    var places=Object.keys(t.byPlace).join(", ");
    var p=lowerPeriod(ctx.period.name);
    return [
      "<div class='apa-content'>"
      +"<h1 class='apa-h1'>1. Introducción</h1>"
      +"<p class='apa-p'>El examen complexivo constituye una modalidad de evaluación integral orientada a verificar que el estudiante articule los conocimientos, habilidades y competencias desarrollados durante su trayectoria académica y pueda aplicarlos de manera pertinente en situaciones vinculadas con su perfil de egreso. Su planificación requiere coordinar componentes académicos, administrativos, tecnológicos y logísticos, de modo que la evaluación se ejecute bajo criterios comunes, con trazabilidad documental y con condiciones equivalentes para los participantes.</p>"
      +"<p class='apa-p'>La presente planificación corresponde al período "+esc(p)+" y organiza el proceso desde el cierre de las actividades académicas y la verificación de requisitos hasta el desarrollo de los núcleos de preparación, la aplicación del examen complexivo, el registro de resultados y la eventual instancia de supletorio. El documento funciona como marco general de actuación y se complementa con cronogramas operativos específicos para cada fase.</p>"
      +"<p class='apa-p'>La planificación se sustenta en un enfoque teórico-práctico. El componente teórico permite valorar conocimientos esenciales y capacidad de análisis, mientras que el componente práctico busca evidenciar la aplicación de saberes frente a problemas, casos o situaciones propias del campo profesional. Esta integración permite que la evaluación no se limite a la reproducción de contenidos, sino que observe la capacidad del estudiante para argumentar, resolver y tomar decisiones de manera fundamentada.</p>"
      +"<p class='apa-p'>La organización del período considera además la distribución real de estudiantes. Para esta planificación se registran "+t.total+" estudiantes, distribuidos entre "+esc(places)+". Esta información permite dimensionar la demanda operativa, prever espacios, organizar jornadas y articular la participación de las carreras sin alterar los nombres oficiales registrados para cada grupo.</p>"
      +"</div>",
      "<div class='apa-content'>"
      +"<p class='apa-p'>El alcance del documento comprende la metodología del proceso, las responsabilidades institucionales, los requisitos de titulación, la preparación mediante seminarios o núcleos, la descripción de los componentes del examen, la distribución de estudiantes, los criterios para la asignación de recursos, la gestión de imponderables, los criterios de evaluación y el cierre del proceso. Cada apartado se relaciona con los demás para asegurar una ejecución ordenada y verificable.</p>"
      +"<p class='apa-p'>La coordinación entre la Unidad de Titulación y Eficiencia Terminal, las coordinaciones de carrera, Secretaría Académica, las unidades de apoyo y los docentes evaluadores es indispensable para mantener la continuidad del proceso. La planificación establece responsabilidades diferenciadas y evita que las decisiones operativas se adopten de manera aislada, particularmente en aspectos como la validación de requisitos, el uso de plataformas, la logística de espacios, la evaluación y el registro de calificaciones.</p>"
      +"<p class='apa-p'>Asimismo, se consideran criterios de inclusión, accesibilidad y contingencia. La institución debe prever mecanismos de atención frente a situaciones justificadas que puedan afectar la participación del estudiante o la ejecución de una jornada, procurando que cualquier ajuste conserve los principios académicos del proceso y quede debidamente documentado.</p>"
      +"<p class='apa-p'>En consecuencia, esta planificación se concibe como un instrumento de gestión académica y de control del proceso de titulación. Su finalidad no es únicamente establecer fechas, sino integrar las condiciones, responsables, recursos y criterios necesarios para que el examen complexivo se desarrolle de forma coherente, transparente y alineada con el perfil profesional de cada carrera.</p>"
      +"</div>"
    ];
  }

  function legalBodies(ctx){
    var p=lowerPeriod(ctx.period.name);
    return [
      "<div class='apa-content'>"
      +"<h1 class='apa-h1'>2. Base legal</h1>"
      +"<p class='apa-p'>La planificación del examen complexivo para el período "+esc(p)+" se enmarca en la normativa nacional de educación superior y en la regulación institucional aplicable al proceso de titulación. La base legal permite vincular la planificación operativa con los derechos del estudiante, las finalidades del sistema de educación superior y las obligaciones institucionales relacionadas con la evaluación, egreso, titulación y registro de títulos.</p>"
      +"<p class='apa-p'>La Constitución de la República del Ecuador constituye el marco superior de referencia. El documento institucional de base identifica el artículo 344 dentro del régimen educativo y el artículo 350 como fundamento de las finalidades de la educación superior, entre ellas la formación académica y profesional, la investigación, la innovación y la generación de soluciones para los problemas del país. Estos principios orientan la organización de procesos académicos que deben asegurar calidad, pertinencia y formación integral.</p>"
      +"<p class='apa-p'>En relación con los derechos estudiantiles, la Ley Orgánica de Educación Superior (LOES) reconoce el derecho a acceder, permanecer, egresar y titularse conforme a los méritos académicos y sin discriminación. Para la planificación del examen complexivo, este principio exige que las condiciones de participación, evaluación, información y acceso a los recursos se definan previamente y se apliquen de manera consistente.</p>"
      +"</div>",
      "<div class='apa-content'>"
      +"<p class='apa-p'>La planificación institucional de referencia incorpora además el artículo 85 de la LOES como sustento de la responsabilidad de las instituciones de educación superior respecto de la validez y pertinencia de los procesos académicos y de titulación. Bajo esta lógica, el examen complexivo debe responder al perfil de egreso de cada carrera y permitir una comprobación integral de los aprendizajes alcanzados.</p>"
      +"<p class='apa-p'>El Reglamento General a la LOES también forma parte del marco utilizado por la planificación. El documento base cita su artículo 19 en relación con la información de graduados y el registro de títulos en los sistemas nacionales correspondientes. Esta obligación refuerza la necesidad de mantener trazabilidad desde la habilitación del estudiante hasta la consolidación final de resultados y documentación.</p>"
      +"<p class='apa-p'>En el ámbito institucional, el Reglamento del Área de Titulación establece la finalidad y alcance del proceso. El artículo 3, citado en la planificación de referencia, orienta la titulación hacia la validación de competencias adquiridas durante la formación profesional y su relación con el perfil de egreso, la resolución de problemas y el desarrollo de propuestas aplicadas.</p>"
      +"<p class='apa-p'>De igual manera, el artículo 47 del Reglamento del Área de Titulación define el examen complexivo como una evaluación integral de la preparación teórico-práctica del estudiante. La planificación adopta esta estructura al diferenciar el componente teórico y el componente práctico, manteniendo mecanismos específicos de preparación, aplicación y evaluación para cada uno.</p>"
      +"</div>",
      "<div class='apa-content'>"
      +"<p class='apa-p'>La aplicación de este marco normativo implica que el proceso no puede limitarse al momento de rendición del examen. Debe incluir la verificación previa de requisitos académicos, documentales y financieros; el cumplimiento de las obligaciones institucionales relacionadas con vinculación, prácticas preprofesionales y lengua extranjera cuando correspondan; la preparación académica; la organización logística; la evaluación; el registro de resultados; y la atención de situaciones excepcionales debidamente justificadas.</p>"
      +"<p class='apa-p'>La normativa institucional también exige que las responsabilidades sean identificables. Por ello, la planificación distribuye funciones entre la Unidad de Titulación y Eficiencia Terminal, coordinaciones de carrera, Secretaría Académica, unidades de apoyo, docentes y demás actores que intervienen en el proceso. Esta asignación permite mantener control, seguimiento y evidencia sobre cada fase.</p>"
      +"<p class='apa-p'>En concordancia con los principios de calidad y transparencia, los cronogramas, listados de estudiantes, registros de asistencia, instrumentos de evaluación, resultados e incidencias deben conservar una relación verificable con el período académico correspondiente. De este modo, la base legal no se presenta únicamente como una enumeración normativa, sino como el fundamento que orienta las decisiones académicas y operativas contenidas en el presente documento.</p>"
      +"<p class='apa-p'>En consecuencia, cualquier procedimiento complementario que se derive de esta planificación deberá observar la normativa vigente y los reglamentos institucionales aplicables al momento de su ejecución. Cuando exista una actualización normativa, la institución deberá aplicar la disposición vigente y dejar constancia de los ajustes que correspondan en los documentos operativos del proceso.</p>"
      +"</div>"
    ];
  }

  function scheduleBody(ctx){
    var rows=(ctx.schedule||[]).map(function(r){
      return "<tr><td>"+esc(r.activity)+"</td><td>"+formatDateShort(r.start)+"</td><td>"+formatDateShort(r.end)+"</td></tr>";
    }).join("");
    return ""
      +"<div class='apa-content'>"
      +"<h2 class='apa-h2'>3.10. Cronogramas</h2>"
      +"<p class='apa-p'>El cronograma general del proceso organiza las fechas de las principales fases del examen complexivo y constituye la referencia temporal para los documentos operativos complementarios.</p>"
      +"<table class='apa-table'><thead><tr><th>Actividad</th><th>Fecha inicio</th><th>Fecha fin</th></tr></thead><tbody>"+rows+"</tbody></table>"
      +"<p class='apa-p'>Los cronogramas complementarios de desarrollo de núcleos y de rendición del examen detallarán, cuando corresponda, la distribución por carrera, lugar, fecha, hora, laboratorio y responsables, sin sustituir la planificación general del período.</p>"
      +"</div>";
  }

  function distributionTable(rows){
    return "<table class='apa-table'><thead><tr><th>Carrera</th><th>Lugar</th><th>Cant.</th></tr></thead><tbody>"
      +(rows||[]).map(function(r){
        return "<tr><td>"+esc(r.career)+"</td><td>"+esc(r.place)+"</td><td>"+(Number(r.count)||0)+"</td></tr>";
      }).join("")
      +"</tbody></table>";
  }

  function distributionBody1(ctx){
    return ""
      +"<div class='apa-content apa-compact-table-page'>"
      +"<h1 class='apa-h1'>7. Distribución de estudiantes por carrera y nivel</h1>"
      +"<p class='apa-p'>La distribución del período se determina a partir de la cantidad de estudiantes registrada por carrera y del lugar previsto para la ejecución del proceso. Los nombres de las carreras se conservan exactamente como constan en el registro institucional.</p>"
      +distributionTable((ctx.distribution||[]).slice(0,13))
      +"</div>";
  }

  function distributionBody2(ctx){
    var t=totals(ctx.distribution);
    var summary=Object.entries(t.byPlace).map(function(x){return esc(x[0])+": <b>"+x[1]+"</b>";}).join(" · ");
    var places=Object.keys(t.byPlace).join(", ");
    return ""
      +"<div class='apa-content apa-compact-table-page'>"
      +distributionTable((ctx.distribution||[]).slice(13))
      +"<p class='table-summary'><b>Resumen:</b> "+summary+" · <b>Total general: "+t.total+"</b></p>"
      +"<h1 class='apa-h1'>8. Asignación de laboratorios y capacidad</h1>"
      +"<p class='apa-p'>La asignación de espacios para el período "+esc(lowerPeriod(ctx.period.name))+" se realizará considerando la cantidad de estudiantes, los requerimientos técnicos de cada carrera y la disponibilidad institucional en "+esc(places)+". La definición exacta de laboratorio, fecha, hora y responsables corresponde al cronograma operativo de rendición.</p>"
      +"</div>";
  }

  function tocEntries(headingPages){
    function p(title,fallback){
      return headingPages[normalizeHeading(title)] || fallback || "";
    }
    return [
      ["1. Introducción",1,p("1. Introducción",4)],
      ["2. Base legal",1,p("2. Base legal",6)],
      ["3. Metodología",1,p("3. METODOLOGÍA")],
      ["3.1. Enfoque Metodológico",2,p("3.1. Enfoque Metodológico")],
      ["3.2. Fase de Inducción al Proceso",2,p("3.2. Fase de Inducción al Proceso")],
      ["3.3. Fase de Diseño del Examen Complexivo",2,p("3.3. Fase de Diseño del Examen Complexivo")],
      ["3.4. Fase de Organización y Distribución",2,p("3.4. Fase de Organización y Distribución")],
      ["3.5. Fase de Preparación: Seminarios de Titulación",2,p("3.5. Fase de Preparación: Seminarios de Titulación")],
      ["3.6. Fase de Aplicación del Examen Complexivo",2,p("3.6. Fase de Aplicación del Examen Complexivo")],
      ["3.7. Fase de Evaluación y Retroalimentación",2,p("3.7. Fase de Evaluación y Retroalimentación")],
      ["3.8. Coordinación y Mejora Continua",2,p("3.8. Coordinación y Mejora Continua")],
      ["3.9. Responsables por Fase del Proceso",2,p("3.9. Responsables por Fase del Proceso")],
      ["3.10. Cronogramas",2,p("3.10. Cronogramas")],
      ["4. Requisitos para Titulación",1,p("4. Requisitos para Titulación")],
      ["4.1. Requisitos Académicos",2,p("4.1. Requisitos Académicos")],
      ["4.1.1. Malla Curricular Completa",3,p("4.1.1. Malla Curricular Completa")],
      ["4.1.2. Materias Transversales",3,p("4.1.2. Materias Transversales")],
      ["4.1.3. Materias Autónomas",3,p("4.1.3. Materias Autónomas")],
      ["4.2. Requisitos de Documentación",2,p("4.2. Requisitos de Documentación")],
      ["4.2.1. Modalidades Híbrida, Presencial y Online",3,p("4.2.1. Modalidades Híbrida, Presencial y Online")],
      ["4.3. Requisitos Financieros",2,p("4.3. Requisitos Financieros")],
      ["4.3.1. Cronograma de Pagos del Proceso de Titulación",3,p("4.3.1. Cronograma de Pagos del Proceso de Titulación")],
      ["4.3.2. Políticas de Descuento y Condiciones Especiales",3,p("4.3.2. Políticas de Descuento y Condiciones Especiales")],
      ["4.3.3. Requisitos Financieros Generales",3,p("4.3.3. Requisitos Financieros Generales")],
      ["4.4. Vinculación con la Sociedad",2,p("4.4. Vinculación con la Sociedad")],
      ["4.5. Prácticas Preprofesionales",2,p("4.5. Prácticas Preprofesionales")],
      ["4.6. Requisito de Lengua Extranjera",2,p("4.6. Requisito de Lengua Extranjera")],
      ["4.7. Actualización de Datos",2,p("4.7. Actualización de Datos")],
      ["5. Descripción del Examen Complexivo",1,p("5. Descripción del Examen Complexivo")],
      ["5.1. Componente Teórico",2,p("5.1. Componente Teórico")],
      ["5.2. Componente Práctico",2,p("5.2. Componente Práctico")],
      ["6. Seminarios de Titulación",1,p("6. SEMINARIOS DE TITULACIÓN")],
      ["7. Distribución de Estudiantes por Carrera y Nivel",1,p("7. Distribución de estudiantes por carrera y nivel")],
      ["8. Asignación de Laboratorios y Capacidad",1,p("8. Asignación de laboratorios y capacidad")],
      ["9. Imponderables",1,p("9. Imponderables")],
      ["10. Criterios de Evaluación",1,p("10. Criterios de Evaluación")],
      ["10.1. Componente Teórico",2,p("10.1. Componente Teórico")],
      ["10.2. Componente Práctico",2,p("10.2. Componente Práctico")],
      ["10.3. Nota Final del Examen Complexivo",2,p("10.3. Nota Final del Examen Complexivo")],
      ["11. Resumen General",1,p("11. RESUMEN GENERAL")],
      ["12. Bibliografía",1,p("12. BIBLIOGRAFÍA")]
    ];
  }

  function tocBody(entries,title){
    return "<div class='toc-v3'><h1>"+esc(title)+"</h1>"
      +entries.map(function(e){
        return "<div class='toc-row toc-level-"+e[1]+"'><span class='toc-label'>"+esc(e[0])+"</span><span class='toc-dots'></span><span class='toc-page'>"+esc(e[2])+"</span></div>";
      }).join("")
      +"</div>";
  }

  async function buildPages(ctx){
    var source=await decodeTemplatePages();
    var pages=[];
    var headingPages={};

    pages.push({kind:"cover",body:coverBody(ctx)});
    pages.push({kind:"toc",body:""});
    pages.push({kind:"toc",body:""});

    headingPages[normalizeHeading("1. Introducción")]=4;
    introBodies(ctx).forEach(function(body){pages.push({kind:"content",body:body});});

    headingPages[normalizeHeading("2. Base legal")]=6;
    legalBodies(ctx).forEach(function(body){pages.push({kind:"content",body:body});});

    for(var sourcePage=6;sourcePage<=45;sourcePage++){
      var firstOutputPage=pages.length+1;

      if(sourcePage===13){
        headingPages[normalizeHeading("3.10. Cronogramas")]=firstOutputPage;
        pages.push({kind:"content",body:scheduleBody(ctx)});
        continue;
      }

      if(sourcePage===37){
        headingPages[normalizeHeading("7. Distribución de estudiantes por carrera y nivel")]=firstOutputPage;
        pages.push({kind:"content",body:distributionBody1(ctx)});
        continue;
      }

      if(sourcePage===38){
        headingPages[normalizeHeading("8. Asignación de laboratorios y capacidad")]=firstOutputPage;
        pages.push({kind:"content",body:distributionBody2(ctx)});
        continue;
      }

      var blocks=parseBlocks(source[sourcePage-1],sourcePage,ctx.period);
      var chunks=paginateBlocks(blocks);
      chunks.forEach(function(chunk){
        var pageNumber=pages.length+1;
        chunk.forEach(function(b){
          if(b.type==="h1" || b.type==="h2" || b.type==="h3"){
            var key=normalizeHeading(b.text);
            if(!headingPages[key]) headingPages[key]=pageNumber;
          }
        });
        pages.push({kind:"content",body:blocksHtml(chunk)});
      });
    }

    var entries=tocEntries(headingPages);
    pages[1].body=tocBody(entries.slice(0,22),"Índice");
    pages[2].body=tocBody(entries.slice(22),"Índice (continuación)");

    return pages;
  }

  async function render(ctx){
    var pages=await buildPages(ctx);
    var total=pages.length;
    return pages.map(function(p,i){
      var n=i+1;
      return "<section class='paper-page' data-page='"+n+"'>"
        +headerHtml(n,total,ctx)
        +"<div class='page-body-v3'>"+p.body+"</div>"
        +"</section>";
    }).join("");
  }

  function resizeImage(file,maxW,maxH){
    maxW=maxW||1200;
    maxH=maxH||600;
    return new Promise(function(resolve,reject){
      if(!file){resolve(null);return;}
      if(!/^image\//.test(file.type)){reject(new Error("Selecciona un archivo de imagen."));return;}
      var reader=new FileReader();
      reader.onerror=function(){reject(new Error("No se pudo leer la imagen."));};
      reader.onload=function(){
        var img=new Image();
        img.onerror=function(){reject(new Error("La imagen no es válida."));};
        img.onload=function(){
          var scale=Math.min(1,maxW/img.width,maxH/img.height);
          var w=Math.max(1,Math.round(img.width*scale));
          var h=Math.max(1,Math.round(img.height*scale));
          var canvas=document.createElement("canvas");
          canvas.width=w; canvas.height=h;
          canvas.getContext("2d").drawImage(img,0,0,w,h);
          var type=file.type==="image/png"?"image/png":"image/jpeg";
          resolve(canvas.toDataURL(type,type==="image/jpeg"?0.9:undefined));
        };
        img.src=reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  window.DocTitFullDocument={
    render:render,
    resizeImage:resizeImage,
    decodeTemplatePages:decodeTemplatePages
  };
})();