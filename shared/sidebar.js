(() => {
  "use strict";

  function normalizePath(path) {
    let value = String(path || "/").replace(/\\/g, "/");
    if (!value.endsWith("/")) value += "/";
    return value;
  }

  function resolveBasePath() {
    const path = normalizePath(window.location.pathname);
    const marker = "/doc-tit/";
    const idx = path.indexOf(marker);
    if (idx >= 0) return path.slice(0, idx) + marker;
    return "/doc-tit/";
  }

  function activeDocumentId() {
    const explicit = document.querySelector("[data-doc-tit-navigation]")?.dataset.activeDocument;
    if (explicit) return explicit;
    const path = normalizePath(window.location.pathname);
    const match = (window.DOC_TIT_DOCUMENTS || []).find(doc => path.includes(`/${doc.id}/`));
    return match?.id || "";
  }

  function hrefFor(doc) {
    const base = resolveBasePath();
    return base + String(doc.id || "").replace(/^\/+|\/+$/g, "") + "/";
  }

  function renderNavigation(container) {
    const docs = Array.isArray(window.DOC_TIT_DOCUMENTS) ? window.DOC_TIT_DOCUMENTS : [];
    if (!docs.length) return;

    const activeId = activeDocumentId();
    const groups = new Map();
    docs.forEach(doc => {
      const key = `${doc.process}::${doc.group}`;
      if (!groups.has(key)) groups.set(key, { process: doc.process, group: doc.group, docs: [] });
      groups.get(key).docs.push(doc);
    });

    container.innerHTML = "";
    container.classList.add("doc-tit-nav");

    groups.forEach(group => {
      const section = document.createElement("section");
      section.className = "doc-tit-nav-group";
      section.innerHTML = `
        <div class="doc-tit-nav-group-title">
          <span class="doc-tit-nav-code">${group.process}</span>
          <span>${group.group}</span>
        </div>
        <div class="doc-tit-nav-links"></div>
      `;

      const links = section.querySelector(".doc-tit-nav-links");
      group.docs.forEach(doc => {
        const link = document.createElement("a");
        link.className = "doc-tit-nav-link" + (doc.id === activeId ? " active" : "");
        link.href = hrefFor(doc);
        link.dataset.documentId = doc.id;
        link.innerHTML = `<span class="doc-tit-nav-dot" aria-hidden="true"></span><span>${doc.title}</span>`;
        if (doc.id === activeId) link.setAttribute("aria-current", "page");
        links.appendChild(link);
      });

      container.appendChild(section);
    });
  }

  function init() {
    document.querySelectorAll("[data-doc-tit-navigation]").forEach(renderNavigation);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
