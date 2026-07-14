/* =========================================================================
   ZIVELO — Admin auth (prototipo)
   -------------------------------------------------------------------------
   Prototipo funcional: valida contra una credencial fija y persiste la
   sesión en session/localStorage. Ya está aislado en un solo archivo para
   que migrar a autenticación real sea sencillo.

   ➜ PARA CONECTAR SUPABASE AUTH REAL (más adelante):
     const sb = supabase.createClient(URL, ANON_KEY);
     login()   -> await sb.auth.signInWithPassword({ email, password })
     logout()  -> await sb.auth.signOut()
     isAuthed()-> const { data } = await sb.auth.getSession(); return !!data.session
   Login.html y Admin.html llaman a estos mismos métodos — no cambia la UI.
   ========================================================================= */
(function () {
  "use strict";
  var KEY = "zivelo-admin-session";
  var DEMO_EMAIL = "admin@zivelo.dev";
  var DEMO_PASS = "zivelo";

  function isAuthed() {
    return sessionStorage.getItem(KEY) === "1" || localStorage.getItem(KEY) === "1";
  }
  function login(email, pass, remember) {
    var ok = (email || "").trim().toLowerCase() === DEMO_EMAIL && pass === DEMO_PASS;
    if (ok) {
      if (remember) localStorage.setItem(KEY, "1");
      else sessionStorage.setItem(KEY, "1");
    }
    return ok;
  }
  function logout() {
    sessionStorage.removeItem(KEY);
    localStorage.removeItem(KEY);
  }
  function requireAuth(loginPage) {
    if (!isAuthed()) window.location.replace(loginPage || "Login.html");
  }

  window.ZiveloAuth = {
    DEMO_EMAIL: DEMO_EMAIL, DEMO_PASS: DEMO_PASS,
    isAuthed: isAuthed, login: login, logout: logout, requireAuth: requireAuth
  };
})();
