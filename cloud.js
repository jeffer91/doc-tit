(() => {
  "use strict";

  const SUPABASE_URL = "https://pxlokuzauwrnvnjaahjq.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_gTZSuLEoeqjnEzZZGj-zmg_zRiIbJpi";
  const BUCKET = "doc-tit";

  if (!window.supabase?.createClient) {
    throw new Error("No se pudo cargar Supabase.");
  }

  const client = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce",
      },
    }
  );

  function sanitizeSegment(value) {
    return String(value || "")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 140) || "item";
  }

  function dataUrlToBlob(dataUrl) {
    return fetch(dataUrl).then(r => r.blob());
  }

  function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(reader.error || new Error("No se pudo leer el archivo."));
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }

  async function getSession() {
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    return data.session || null;
  }

  async function loginWithAdminPin(cedula, pin) {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-pin-login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_PUBLISHABLE_KEY,
      },
      body: JSON.stringify({ cedula, pin }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error || "No fue posible iniciar sesión.");
    }

    const tokenHash = payload.token_hash;
    if (!tokenHash) throw new Error("La sesión administrativa no devolvió un token válido.");

    const { data, error } = await client.auth.verifyOtp({
      token_hash: tokenHash,
      type: "magiclink",
    });

    if (error) throw error;
    return { session: data.session, admin: payload.admin || null };
  }

  async function logout() {
    const { error } = await client.auth.signOut();
    if (error) throw error;
  }

  async function loadWorkspace() {
    const [periodsRes, docsRes, settingsRes] = await Promise.all([
      client.from("doc_tit_periods")
        .select("period_key,name,start_date,end_date,status,updated_at")
        .order("start_date", { ascending: false }),
      client.from("doc_tit_documents")
        .select("period_key,document_key,process_code,title,document_code,schedule,distribution,smart_text,analysis,complete,generated_at,generated_file_name,generated_pages,updated_at"),
      client.from("doc_tit_settings")
        .select("key,value,updated_at")
    ]);

    if (periodsRes.error) throw periodsRes.error;
    if (docsRes.error) throw docsRes.error;
    if (settingsRes.error) throw settingsRes.error;

    return {
      periods: periodsRes.data || [],
      documents: docsRes.data || [],
      settings: settingsRes.data || [],
    };
  }

  async function upsertPeriod(period) {
    const { data: userData } = await client.auth.getUser();
    const userId = userData?.user?.id || null;

    const payload = {
      period_key: period.id,
      name: period.name,
      start_date: period.start,
      end_date: period.end,
      status: period.status || "Activo",
      created_by: userId,
      updated_at: new Date().toISOString(),
    };

    const { error } = await client.from("doc_tit_periods")
      .upsert(payload, { onConflict: "period_key" });
    if (error) throw error;
  }

  async function upsertSetting(key, value) {
    const { data: userData } = await client.auth.getUser();
    const userId = userData?.user?.id || null;

    const { error } = await client.from("doc_tit_settings").upsert({
      key,
      value,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    }, { onConflict: "key" });

    if (error) throw error;
  }

  async function upsertDocument({ period, document, data, code }) {
    const { data: userData } = await client.auth.getUser();
    const userId = userData?.user?.id || null;

    const payload = {
      period_key: period.id,
      document_key: document.id,
      process_code: document.process || document.procCode || "",
      title: document.fileTitle || document.name || "",
      document_code: code,
      schedule: Array.isArray(data.schedule) ? data.schedule : [],
      distribution: Array.isArray(data.distribution) ? data.distribution : [],
      smart_text: data.smartText || "",
      analysis: data.analysis || null,
      complete: !!data.complete,
      generated_at: data.generatedAt || null,
      generated_file_name: data.generatedFileName || null,
      generated_pages: data.generatedPages || null,
      created_by: userId,
      updated_at: new Date().toISOString(),
    };

    const { error } = await client.from("doc_tit_documents")
      .upsert(payload, { onConflict: "period_key,document_key" });

    if (error) throw error;
  }

  async function uploadAsset({ periodKey, documentKey, assetKey, dataUrl, fileName }) {
    const blob = await dataUrlToBlob(dataUrl);
    const ext = blob.type === "image/png" ? "png"
      : blob.type === "image/webp" ? "webp"
      : blob.type === "application/pdf" ? "pdf"
      : "jpg";

    const path = [
      "assets",
      sanitizeSegment(periodKey),
      sanitizeSegment(documentKey),
      `${sanitizeSegment(assetKey)}.${ext}`
    ].join("/");

    const { error: uploadError } = await client.storage
      .from(BUCKET)
      .upload(path, blob, {
        upsert: true,
        contentType: blob.type || undefined,
        cacheControl: "3600",
      });

    if (uploadError) throw uploadError;

    const { data: userData } = await client.auth.getUser();
    const userId = userData?.user?.id || null;

    const { error: metaError } = await client.from("doc_tit_assets").upsert({
      period_key: periodKey,
      document_key: documentKey,
      asset_key: assetKey,
      storage_path: path,
      file_name: fileName || `${assetKey}.${ext}`,
      mime_type: blob.type || null,
      size_bytes: blob.size,
      created_by: userId,
      updated_at: new Date().toISOString(),
    }, { onConflict: "period_key,document_key,asset_key" });

    if (metaError) throw metaError;
    return { path, blob };
  }

  async function loadAssets(periodKey, documentKey) {
    const { data: rows, error } = await client.from("doc_tit_assets")
      .select("asset_key,storage_path,mime_type")
      .eq("period_key", periodKey)
      .eq("document_key", documentKey);

    if (error) throw error;

    const assets = {};
    for (const row of rows || []) {
      if (row.asset_key === "generated_pdf") continue;
      const { data: blob, error: downloadError } = await client.storage
        .from(BUCKET)
        .download(row.storage_path);
      if (downloadError) throw downloadError;
      assets[row.asset_key] = await blobToDataUrl(blob);
    }
    return assets;
  }

  async function uploadGeneratedPdf({ periodKey, documentKey, fileName, blob }) {
    if (!(blob instanceof Blob)) throw new Error("El PDF generado no es válido.");

    const path = [
      "generated",
      sanitizeSegment(periodKey),
      sanitizeSegment(documentKey),
      sanitizeSegment(fileName)
    ].join("/");

    const { error: uploadError } = await client.storage.from(BUCKET).upload(path, blob, {
      upsert: true,
      contentType: "application/pdf",
      cacheControl: "3600",
    });
    if (uploadError) throw uploadError;

    const { data: userData } = await client.auth.getUser();
    const userId = userData?.user?.id || null;

    const { error: metaError } = await client.from("doc_tit_assets").upsert({
      period_key: periodKey,
      document_key: documentKey,
      asset_key: "generated_pdf",
      storage_path: path,
      file_name: fileName,
      mime_type: "application/pdf",
      size_bytes: blob.size,
      created_by: userId,
      updated_at: new Date().toISOString(),
    }, { onConflict: "period_key,document_key,asset_key" });

    if (metaError) throw metaError;
    return path;
  }

  window.DocTitCloud = {
    client,
    getSession,
    loginWithAdminPin,
    logout,
    loadWorkspace,
    upsertPeriod,
    upsertSetting,
    upsertDocument,
    uploadAsset,
    loadAssets,
    uploadGeneratedPdf,
  };
})();