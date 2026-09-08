(() => {
  "use strict";
  // Shared DOC-TIT sidebar navigation · v3

  const LAST_DOCUMENT_KEY = "doc-tit-last-document";

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

  function rememberDocument(documentId) {
    if (!documentId) return;
    try { localStorage.setItem(LAST_DOCUMENT_KEY, documentId); } catch (_) {}
  }

  function renderNavigation(container) {
    const docs = Array.isArray(window.DOC_TIT_DOCUMENTS) ? window.DOC_TIT_DOCUMENTS : [];
    if (!docs.length) return;

    const activeId = activeDocumentId();
    rememberDocument(activeId);
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
        link.innerHTML = `<span class="doc-tit-nav-dot" aria-hidden="true"></span><span>${doc.shortTitle || doc.title}</span>`;
        link.addEventListener("click", () => rememberDocument(doc.id));
        if (doc.id === activeId) link.setAttribute("aria-current", "page");
        links.appendChild(link);
      });

      container.appendChild(section);
    });
  }

  function cleanLegacySidebar() {
    document.querySelectorAll(".nav-back, .sidebar > a[href='../']").forEach(el => el.remove());

    document.querySelectorAll(".sidebar").forEach(sidebar => {
      Array.from(sidebar.childNodes).forEach(node => {
        if (node.nodeType === Node.TEXT_NODE && String(node.textContent || "").includes("\\n")) {
          node.remove();
        }
      });
    });

    document.querySelectorAll(".brand span").forEach(el => {
      el.textContent = "Gestión documental";
    });
  }

  function fixSummaryGrammar() {
    const el = document.querySelector("#periodDocumentSummary");
    if (!el) return;
    const match = String(el.textContent || "").match(/^(\d+) documentos · (\d+) generados$/);
    if (!match) return;
    const docs = Number(match[1]);
    const generated = Number(match[2]);
    el.textContent = `${docs} ${docs === 1 ? "documento" : "documentos"} · ${generated} ${generated === 1 ? "generado" : "generados"}`;
  }

  function openComplexivoDirect() {
    if (activeDocumentId() !== "complexivo") return;
    const dashboard = document.querySelector("#dashboardView");
    const documentView = document.querySelector("#documentView");
    if (documentView?.classList.contains("active") && !dashboard?.classList.contains("active")) return;

    const trigger = document.querySelector('#processMenu [data-doc="plan-examen-complexivo"]');
    if (trigger) trigger.click();
  }

  function keepComplexivoDirect() {
    if (activeDocumentId() !== "complexivo") return;

    const dashboard = document.querySelector("#dashboardView");
    if (dashboard) {
      const observer = new MutationObserver(() => {
        fixSummaryGrammar();
        if (dashboard.classList.contains("active")) {
          window.setTimeout(openComplexivoDirect, 0);
        }
      });
      observer.observe(dashboard, { attributes: true, attributeFilter: ["class"], childList: true, subtree: true });
    }

    const periodSelect = document.querySelector("#periodSelect");
    periodSelect?.addEventListener("change", () => window.setTimeout(openComplexivoDirect, 0));

    window.setTimeout(openComplexivoDirect, 0);
  }

  function init() {
    document.querySelectorAll("[data-doc-tit-navigation]").forEach(renderNavigation);
    cleanLegacySidebar();
    fixSummaryGrammar();
    keepComplexivoDirect();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
