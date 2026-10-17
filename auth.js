
'use strict';
// Google Identity Services: token OAuth usado somente para consultar a identidade no Google.
// Nenhum token, email ou perfil é persistido no IndexedDB ou enviado ao servidor do PWA.
// IMPORTANTE: autenticação de interface não equivale a controle de acesso seguro aos dados locais.
window.CarteiraAuth = (() => {
  let tokenClient = null;
  let activeToken = null;
  let identity = null;
  const $ = id => document.getElementById(id);
  const message = text => { $('authMessage').textContent = text; };
  function showApp(profile) {
    identity = profile;
    $('authGate').hidden = true;
    $('appShell').hidden = false;
  }
  function showLogin() {
    identity = null;
    $('appShell').hidden = true;
    $('authGate').hidden = false;
  }
  function loadGoogleScript() {
    return new Promise((resolve, reject) => {
      if (window.google?.accounts?.oauth2) return resolve();
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error('Não foi possível carregar o Google. Verifique sua conexão.'));
      document.head.appendChild(script);
    });
  }
  async function begin() {
    const clientId = window.CARTEIRA_GOOGLE_CLIENT_ID || '';
    if (!clientId || clientId.includes('COLE_SEU_CLIENT_ID')) {
      message('Configuração pendente: adicione seu Client ID do Google no arquivo auth-config.js.');
      return;
    }
    if (!navigator.onLine) { message('Conecte-se à internet para autenticar sua conta Google.'); return; }
    try {
      message('Abrindo login Google…');
      await loadGoogleScript();
      tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: clientId, scope: 'openid email profile',
        callback: async response => {
          if (response.error || !response.access_token) { message('Login não concluído. Tente novamente.'); return; }
          try {
            const res = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {headers: {Authorization: `Bearer ${response.access_token}`}, cache:'no-store'});
            if (!res.ok) throw Error('Não foi possível validar o perfil Google.');
            const profile = await res.json();
            if (!profile.sub || !profile.email_verified) throw Error('Conta Google não verificada.');
            activeToken = response.access_token;
            showApp({sub:profile.sub, email:profile.email});
            message('Login concluído.');
          } catch (error) { message(error.message); }
        },
        error_callback: () => message('Login cancelado ou bloqueado pelo navegador.')
      });
      tokenClient.requestAccessToken({prompt:'select_account'});
    } catch (error) { message(error.message); }
  }
  function signOut() {
    if (activeToken && window.google?.accounts?.oauth2) google.accounts.oauth2.revoke(activeToken, () => {});
    activeToken = null;
    showLogin();
    message('Sessão encerrada. Os dados locais permanecem neste dispositivo.');
  }
  function init() {
    showLogin();
    $('googleSignIn').addEventListener('click', begin);
    $('signOut').addEventListener('click', signOut);
    if (!navigator.onLine) message('Sem internet: login Google exige conexão. Seus dados locais não foram apagados.');
  }
  return {init, getProfile:() => identity};
})();
