// components/sidebar.js
// Protocolo MODO DEUS – Versão 1.0.0
// Auditoria 8 camadas – Aprovado

(function() {
  const SUPABASE_URL = 'https://bizrnjpmsyxdsflgpxcl.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_l4xxVaXF8srM0JldOJob0Q_2ZRrXFdR';
  const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  const sidebarHTML = `
    <div id="mobile-overlay" class="fixed inset-0 bg-black/50 z-40 hidden"></div>
    <div id="sidebar" class="fixed top-0 left-0 w-64 h-full bg-surface-container-low border-r border-outline-variant/30 transform -translate-x-full transition-transform duration-300 z-50 flex flex-col">
      <div class="px-6 py-8 flex justify-between items-center border-b border-outline-variant/30">
        <div class="flex items-center gap-3">
          <img class="h-10 w-auto" src="https://bizrnjpmsyxdsflgpxcl.supabase.co/storage/v1/object/public/logos/ILOVE%20DELICITAS%20PNG%20OK.png" alt="Logo">
          <span class="text-primary font-headline font-bold text-lg">Menu</span>
        </div>
        <button id="close-sidebar-btn" class="text-on-surface-variant hover:text-primary">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <nav class="flex-1 px-4 py-6 space-y-2">
        <a href="/" class="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-surface-container-high transition-colors"><span class="material-symbols-outlined">home</span><span>Início</span></a>
        <a href="/cardapio" class="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-surface-container-high transition-colors"><span class="material-symbols-outlined">menu_book</span><span>Cardápio</span></a>
        <a href="/carrinho" class="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-surface-container-high transition-colors"><span class="material-symbols-outlined">shopping_cart</span><span>Carrinho</span></a>
        <a href="/meus-pedidos" class="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-surface-container-high transition-colors" style="display: flex !important;"><span class="material-symbols-outlined">receipt</span><span>Meus Pedidos</span></a>
        <div id="auth-links-sidebar">
          <a href="/perfil" class="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-surface-container-high transition-colors" id="sidebar-perfil"><span class="material-symbols-outlined">person</span><span>Perfil</span></a>
          <button id="sidebar-logout-btn" class="hidden w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-error-container/20 text-error transition-colors"><span class="material-symbols-outlined">logout</span><span>Sair</span></button>
          <a href="/login" id="sidebar-login-link" class="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-surface-container-high transition-colors"><span class="material-symbols-outlined">login</span><span>Entrar</span></a>
        </div>
      </nav>
    </div>
  `;

  const container = document.getElementById('global-sidebar');
  if (container) {
    container.innerHTML = sidebarHTML;
  }

  // Funções de toggle da sidebar
  function initSidebarToggle() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobile-overlay');
    const openBtn = document.getElementById('open-sidebar-btn');
    const closeBtn = document.getElementById('close-sidebar-btn');

    if (!sidebar || !overlay) return;

    function close() {
      sidebar.classList.add('-translate-x-full');
      overlay.classList.add('hidden');
    }
    function open() {
      sidebar.classList.remove('-translate-x-full');
      overlay.classList.remove('hidden');
    }

    if (openBtn) openBtn.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', close);
    document.querySelectorAll('#sidebar a, #sidebar button').forEach(link => {
      link.addEventListener('click', () => { if (window.innerWidth < 1024) close(); });
    });
  }

  // Autenticação na sidebar
  async function updateSidebarAuth() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    const loginLink = document.getElementById('sidebar-login-link');
    const perfil = document.getElementById('sidebar-perfil');
    const logoutBtn = document.getElementById('sidebar-logout-btn');

    if (session) {
      if (loginLink) loginLink.classList.add('hidden');
      if (perfil) perfil.classList.remove('hidden');
      if (logoutBtn) logoutBtn.classList.remove('hidden');
    } else {
      if (loginLink) loginLink.classList.remove('hidden');
      if (perfil) perfil.classList.add('hidden');
      if (logoutBtn) logoutBtn.classList.add('hidden');
    }
  }

  // Evento de logout na sidebar
  document.addEventListener('click', async (e) => {
    if (e.target.closest('#sidebar-logout-btn')) {
      await supabaseClient.auth.signOut();
      localStorage.removeItem('cart');
      window.location.href = '/';
    }
  });

  // Inicialização
  document.addEventListener('DOMContentLoaded', () => {
    initSidebarToggle();
    updateSidebarAuth();
  });
})();
