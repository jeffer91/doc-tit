(() => {
  "use strict";
  if (!window.supabase?.createClient || window.supabase.__docTitAuthBootstrap) return;
  const original = window.supabase.createClient.bind(window.supabase);
  window.supabase.createClient = (url, key, options = {}) => original(url, key, {
    ...options,
    auth: {
      ...(options.auth || {}),
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      storageKey: "doc-tit-admin-session"
    }
  });
  window.supabase.__docTitAuthBootstrap = true;
})();
