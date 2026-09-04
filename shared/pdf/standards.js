(() => {
  "use strict";
  const CM = 72 / 2.54;

  const baseRgi = Object.freeze({
    headerWidthCm: 18,
    headerColumnsCm: Object.freeze([4.5, 9, 4.5]),
    headerUnitPt: 9,
    headerDocumentPt: 9,
    headerPeriodPt: 9,
    headerDocumentBold: true,
    headerPeriodBold: true,
    centralTitlePt: 18,
    centralSupplementPt: 10,
    signatureColumnsCm: Object.freeze([6, 6, 6]),
    coverPageNumber: false
  });

  window.DOC_TIT_PDF_STANDARDS = Object.freeze({
    page: Object.freeze({ format: "a4", orientation: "portrait", marginCm: 1.5, usableWidthCm: 18 }),
    rgi: baseRgi,
    documentOverrides: Object.freeze({
      complexivo: Object.freeze({ centralTitlePt: 23 })
    }),
    tables: Object.freeze({
      bodyFontPt: 10,
      captionFontPt: 11,
      noteFontPt: 10,
      rowPageBreak: "avoid",
      repeatHeader: true,
      apaHorizontalRules: true,
      drawRulesAfterLastCell: true
    }),
    cmToPt(value) { return Number(value || 0) * CM; },
    resolveRgi(documentId) {
      return Object.freeze({ ...baseRgi, ...(this.documentOverrides[documentId] || {}) });
    }
  });
})();
