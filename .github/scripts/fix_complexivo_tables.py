from pathlib import Path
import re

# Global table renderer
p = Path("complexivo/full-document.js")
s = p.read_text(encoding="utf-8")
pattern = r'''    function autoTable\(options\)\{.*?      y=doc\.lastAutoTable\.finalY\+12;\n    \}\n\n    function reserveIndexPages\(\)\{'''
replacement = '''    function autoTable(options){
      if(typeof doc.autoTable!=="function") throw new Error("No se pudo cargar el módulo de tablas del PDF.");

      const userDidDrawPage=options.didDrawPage;
      const userDidDrawCell=options.didDrawCell;
      const institutionalGrid=!!options.institutionalGrid;
      delete options.institutionalGrid;

      options.theme=institutionalGrid?"grid":"plain";
      options.styles={
        font:"times",
        fontSize:10,
        cellPadding:{top:5,right:6,bottom:5,left:6},
        textColor:0,
        lineColor:0,
        lineWidth:institutionalGrid?0.35:0,
        overflow:"linebreak",
        valign:"top",
        ...((options.styles)||{})
      };
      options.headStyles={
        font:"times",
        fontStyle:"bold",
        fillColor:institutionalGrid?[242,242,242]:[255,255,255],
        textColor:0,
        lineColor:0,
        lineWidth:institutionalGrid?0.35:0,
        halign:"left",
        ...((options.headStyles)||{})
      };
      options.showHead="everyPage";
      options.rowPageBreak=options.rowPageBreak||"avoid";
      options.pageBreak=options.pageBreak||"auto";
      options.tableWidth=options.tableWidth||bodyW;
      options.horizontalPageBreak=false;

      options.didDrawPage=(data)=>{
        drawHeader(doc.getNumberOfPages());
        if(userDidDrawPage) userDidDrawPage(data);
      };

      options.didDrawCell=(data)=>{
        if(!institutionalGrid){
          const left=data.table.settings.margin.left;
          const tableWidth=data.table.columns.reduce((sum,column)=>sum+(Number(column.width)||0),0);
          const right=Math.min(pageW-data.table.settings.margin.right,left+tableWidth);

          if(data.section==="head" && data.column.index===0){
            doc.setDrawColor(0);
            doc.setLineWidth(0.8);
            doc.line(left,data.cell.y,right,data.cell.y);
            doc.setLineWidth(0.45);
            doc.line(left,data.cell.y+data.cell.height,right,data.cell.y+data.cell.height);
          }
          if(data.section==="body" && data.row.index===data.table.body.length-1 && data.column.index===0){
            doc.setDrawColor(0);
            doc.setLineWidth(0.8);
            doc.line(left,data.cell.y+data.cell.height,right,data.cell.y+data.cell.height);
          }
        }

        if(userDidDrawCell) userDidDrawCell(data);
      };

      doc.autoTable(options);
      y=doc.lastAutoTable.finalY+12;
    }

    function reserveIndexPages(){'''
s2, n = re.subn(pattern, replacement, s, count=1, flags=re.S)
if n != 1:
    raise SystemExit(f"No se pudo localizar autoTable: {n}")
p.write_text(s2, encoding="utf-8")

# Operational plan
p = Path("complexivo/pdf/sections/methodology/operational-plan.js")
s = p.read_text(encoding="utf-8")
s = s.replace('status:"Planificado",observations:""', 'status:"",observations:""')
pattern = r'''  ns\.parts\.methodology\.operationalPlan = function\(api\) \{.*?\n  \};\n\}\)\(\);'''
replacement = '''  ns.parts.methodology.operationalPlan = function(api) {
    const {ctx,heading,paragraph,tableCaption,tableNote,autoTable,BODY,bodyW,formatDateShort,normalize} = api;
    const entered=Array.isArray(ctx.operationalPlan)?ctx.operationalPlan:[];
    const byId=new Map(entered.map(r=>[r.id,r]));
    const schedule=Array.isArray(ctx.schedule)?ctx.schedule:[];
    const findSchedule=text=>schedule.find(r=>normalize(r.activity).includes(normalize(text)));
    const exam=findSchedule("examen complexivo");
    const supplementary=findSchedule("supletorio");

    const inferredDates=new Map();
    if(exam) inferredDates.set("exam",{start:exam.start||"",deadline:exam.end||exam.start||""});
    if(supplementary) inferredDates.set("supplementary",{start:supplementary.start||"",deadline:supplementary.end||supplementary.start||""});

    const plan=ns.operationalDefaults.map(base=>({
      ...base,
      ...(inferredDates.get(base.id)||{}),
      ...(byId.get(base.id)||{})
    }));

    const hasRealOperationalData=r=>[r.start,r.deadline,r.actualDate,r.person,r.status,r.observations].some(v=>String(v||"").trim());
    const active=plan.filter(hasRealOperationalData);
    const tracking=active.filter(r=>[r.actualDate,r.person,r.status,r.observations].some(v=>String(v||"").trim()));
    const date=v=>v?formatDateShort(v):"";
    const value=v=>String(v||"").trim();

    heading("3.11. Plan Operativo de Preparación, Configuración y Aplicación del Examen Complexivo",2,true);
    paragraph("El cronograma general establece las ventanas del período. El plan operativo incorpora únicamente actividades que ya cuentan con información real de programación o seguimiento. Las fechas del examen ordinario y del supletorio se recuperan automáticamente del cronograma general cuando están registradas.");

    if(active.length){
      heading("3.11.1. Programación operativa",3,true);
      tableCaption("Plan operativo: programación y responsables");
      autoTable({
        rowPageBreak:"avoid",
        tableWidth:bodyW,
        startY:api.getY(),
        margin:{left:BODY.left,right:BODY.right,top:BODY.top,bottom:BODY.bottom},
        head:[["Actividad","Inicio","Fecha límite","Responsable principal"]],
        body:active.map(r=>[r.activity,date(r.start),date(r.deadline),value(r.responsible)]),
        columnStyles:{0:{cellWidth:bodyW*0.38},1:{cellWidth:bodyW*0.14},2:{cellWidth:bodyW*0.14},3:{cellWidth:bodyW*0.34}},
        styles:{font:"times",fontSize:8.2,cellPadding:4,textColor:0},
        headStyles:{font:"times",fontStyle:"bold",fontSize:8.2,fillColor:[255,255,255],textColor:0}
      });
      tableNote("Las celdas sin información permanecen en blanco; no se imprimen valores ficticios ni expresiones pendientes de definición.");

      heading("3.11.2. Coordinación, productos y evidencias",3,true);
      tableCaption("Plan operativo: coordinación y evidencia esperada");
      autoTable({
        rowPageBreak:"avoid",
        tableWidth:bodyW,
        startY:api.getY(),
        margin:{left:BODY.left,right:BODY.right,top:BODY.top,bottom:BODY.bottom},
        head:[["Actividad","Coordinación necesaria","Producto esperado","Evidencia"]],
        body:active.map(r=>[r.activity,value(r.coordination),value(r.product),value(r.evidence)]),
        columnStyles:{0:{cellWidth:bodyW*0.28},1:{cellWidth:bodyW*0.27},2:{cellWidth:bodyW*0.22},3:{cellWidth:bodyW*0.23}},
        styles:{font:"times",fontSize:7.9,cellPadding:3.8,textColor:0},
        headStyles:{font:"times",fontStyle:"bold",fontSize:7.9,fillColor:[255,255,255],textColor:0}
      });
      tableNote("Las actividades aparecen únicamente cuando existe programación o seguimiento registrado para el período.");
    }

    if(tracking.length){
      heading("3.11.3. Seguimiento operativo",3,true);
      tableCaption("Seguimiento de actividades con información registrada");
      autoTable({
        rowPageBreak:"avoid",
        tableWidth:bodyW,
        startY:api.getY(),
        margin:{left:BODY.left,right:BODY.right,top:BODY.top,bottom:BODY.bottom},
        head:[["Actividad","Persona responsable","Estado","Observaciones"]],
        body:tracking.map(r=>[r.activity,value(r.person),value(r.status),value(r.observations)]),
        columnStyles:{0:{cellWidth:bodyW*0.36},1:{cellWidth:bodyW*0.24},2:{cellWidth:bodyW*0.16},3:{cellWidth:bodyW*0.24}},
        styles:{font:"times",fontSize:8.1,cellPadding:4,textColor:0},
        headStyles:{font:"times",fontStyle:"bold",fontSize:8.1,fillColor:[255,255,255],textColor:0}
      });
    }

    heading("3.11.4. Secuencia de cierre posterior al supletorio",3,true);
    paragraph("Después del examen supletorio, el proceso continúa con la consolidación de resultados, el registro de calificaciones, la verificación de estudiantes sin estado final, el respaldo de evidencias, el cierre de aulas y plataformas y la elaboración del informe final. El proceso se considera cerrado únicamente cuando estas actividades cuentan con responsable, estado y evidencia.");
  };
})();'''
s2, n = re.subn(pattern, replacement, s, count=1, flags=re.S)
if n != 1:
    raise SystemExit(f"No se pudo localizar operationalPlan: {n}")
p.write_text(s2, encoding="utf-8")

# Cache refresh
p = Path("complexivo/index.html")
s = p.read_text(encoding="utf-8")
s = s.replace("v=20260904-cover-rgi-2", "v=20260904-tables-1")
p.write_text(s, encoding="utf-8")
