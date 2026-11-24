import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://snelqloaemyrjwysenvk.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_CDoU_YvY27xZWg9wTzWkdw_a4kXAyou';
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

function showSecureLogin() {
  if (!document.querySelector('#loginModal')) {
    document.body.insertAdjacentHTML('beforeend', '<div class="modal-backdrop" id="loginModal"><aside class="login-modal"><button class="close-btn" id="closeSecureLogin">×</button><p class="eyebrow">Área restrita</p><h3>Acesso administrativo</h3><p class="login-help">Entre com o e-mail e a senha cadastrados no Supabase.</p><form id="secureLoginForm"><label>E-mail<input id="secureLoginEmail" type="email" required autocomplete="username"></label><label>Senha<input id="secureLoginPassword" type="password" required autocomplete="current-password"></label><p class="login-error" id="secureLoginError"></p><button class="btn btn-dark full" type="submit">Entrar no painel →</button></form></aside></div>');
  }
  document.querySelector('#loginModal').classList.add('open');
  document.querySelector('#closeSecureLogin').onclick = () => document.querySelector('#loginModal').classList.remove('open');
  document.querySelector('#secureLoginForm').onsubmit = async event => {
    event.preventDefault();
    const error = document.querySelector('#secureLoginError');
    error.textContent = 'Verificando...';
    const { error: authError } = await supabase.auth.signInWithPassword({ email: document.querySelector('#secureLoginEmail').value, password: document.querySelector('#secureLoginPassword').value });
    if (authError) { error.textContent = 'E-mail ou senha incorretos.'; return; }
    document.querySelector('#loginModal').classList.remove('open');
    window.renderAdmin();
    document.querySelector('#adminModal').classList.add('open');
    window.setupSiteSettings();
  };
}

window.openLogin = showSecureLogin;
document.addEventListener('DOMContentLoaded', () => {
  const adminButton = document.querySelector('#adminBtn');
  if (adminButton) adminButton.onclick = showSecureLogin;
});
