(() => {
  "use strict";

  const common = Object.freeze({
    preparedBy: "Mgs. Jefferson Villarreal",
    reviewedBy: "Ing. Martha Tomalá",
    reviewedRole: "Coordinadora General de Carreras",
    approvedBy: "Dr. Alex León",
    approvedRole: "Vicerrector"
  });

  window.DOC_TIT_INSTITUTIONAL = Object.freeze({
    common,
    documents: Object.freeze({
      complexivo: Object.freeze({
        unit: "Unidad de Titulación y Eficiencia Terminal",
        preparedRole: "Coordinador de Titulación y Eficiencia Terminal"
      }),
      "articulo-academico": Object.freeze({
        unit: "Unidad de Titulación y Eficiencia Terminal",
        preparedRole: "Coordinador de Titulación y Eficiencia Terminal"
      }),
      "trabajo-titulacion": Object.freeze({
        preparedRole: "Gestor de Procesos Académicos"
      })
    }),
    resolve(documentId) {
      return Object.freeze({ ...common, ...(this.documents[documentId] || {}) });
    }
  });
})();
