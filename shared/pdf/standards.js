(() => {
  "use strict";
  const CM = 72 / 2.54;
  window.DOC_TIT_PDF_STANDARDS = Object.freeze({
    page: Object.freeze({ format: "a4", orientation: "portrait", marginCm: 1.5, usableWidthCm: 18 }),
    rgi: Object.freeze({
      headerWidthCm: 18,
      headerColumnsCm: Object.freeze([4.5, 9, 4.5]),
      headerUnitPt: 9,
      headerDocumentPt: 9,
      headerPeriodPt: 9,
      centralTitlePt: 23,
      centralSupplementPt: 10,
      signatureColumnsCm: Object.freeze([6, 6, 6]),
      coverPageNumber: false
    }),
    tables: Object.freeze({
      bodyFontPt: 10,
      captionFontPt: 11,
      noteFontPt: 10,
      rowPageBreak: "avoid",
      repeatHeader: true,
      apaHorizontalRules: true
    }),
    cmToPt(value) { return Number(value || 0) * CM; }
  });
})();
