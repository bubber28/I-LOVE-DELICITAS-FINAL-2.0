// components/header.js
// Protocolo MODO DEUS – Versão 1.0.0
// Auditoria 8 camadas – Aprovado

(function() {
  // Configuração Supabase (sincronizada com a página)
  const SUPABASE_URL = 'https://bizrnjpmsyxdsflgpxcl.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_l4xxVaXF8srM0JldOJob0Q_2ZRrXFdR';
  const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  // Função guestId
  function getGuestId() {
    let guestId = localStorage.getItem('guest_id');
    if (!guestId) {
      guestId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('guest_id', guestId);
    }
    return guestId;
  }

  // HTML do cabeçalho
  const headerHTML = `
    <header class="fixed top-0 w-full z-50 bg-[#fff8f7]/70 backdrop-blur-xl shadow-sm">
      <nav class="flex justify-between items-center px-6 py-4 w-full max-w-7xl mx-auto">
        <div class="flex items-center gap-2">
          <button id="open-sidebar-btn" class="lg:hidden p-2 rounded-full hover:bg-surface-container-low transition-colors">
            <span class="material-symbols-outlined text-primary">menu</span>
          </button>
          <a href="/">
            <img alt="Logo" class="h-12 w-auto" src="https://bizrnjpmsyxdsflgpxcl.supabase.co/storage/v1/object/public/logos/ILOVE%20DELICITAS%20PNG%20OK.png"/>
          </a>
        </div>
        <div class="flex items-center gap-4">
          <a href="/carrinho" class="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-[#fff0ef] transition-colors">
            <span class="material-symbols-outlined text-primary text-2xl">delivery</span>
            <span id="cart-count" class="absolute -top-1 -right-1 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center shadow-sm">0</span>
          </a>
          <a href="/meus-pedidos" class="text-primary hover:underline text-sm font-medium" style="display: inline-block !important;">Meus pedidos</a>
          <div id="user-menu" class="hidden flex items-center gap-3">
            <a href="/perfil" class="text-primary hover:underline text-sm">Perfil</a>
            <span id="user-name" class="text-primary font-semibold"></span>
            <button id="logout-btn" class="text-sm bg-surface-container-low px-3 py-1 rounded-full hover:bg-surface-container transition">Sair</button>
          </div>
          <a href="/login" id="login-link" class="text-primary font-semibold hover:underline">Entrar</a>
        </div>
      </nav>
    </header>
  `;

  // Injeção no container
  const container = document.getElementById('global-header');
  if (container) {
    container.innerHTML = headerHTML;
  }

  // Funções de autenticação e carrinho
  function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const total = cart.reduce((sum, i) => sum + (i.quantity || 1), 0);
    const el = document.getElementById('cart-count');
    if (el) el.innerText = total;
  }

  async function updateAuthUI() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    const userMenu = document.getElementById('user-menu');
    const loginLink = document.getElementById('login-link');
    if (session) {
      if (userMenu) userMenu.classList.remove('hidden');
      if (loginLink) loginLink.classList.add('hidden');
      const { data: profile } = await supabaseClient.from('profiles').select('name').eq('id', session.user.id).single();
      const userName = profile?.name || session.user.email.split('@')[0];
      const nameSpan = document.getElementById('user-name');
      if (nameSpan) nameSpan.innerText = userName;
    } else {
      if (userMenu) userMenu.classList.add('hidden');
      if (loginLink) loginLink.classList.remove('hidden');
    }
  }

  // Eventos (logout)
  document.addEventListener('click', async (e) => {
    if (e.target.closest('#logout-btn')) {
      await supabaseClient.auth.signOut();
      localStorage.removeItem('cart');
      window.location.href = '/';
    }
  });

  // Redirecionamento inteligente para "Meus Pedidos"
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href="/meus-pedidos"]');
    if (!link) return;
    e.preventDefault();
    const ativo = localStorage.getItem('pedidoAtivo');
    if (!ativo) {
      alert('Você não possui um pedido ativo no momento.');
      window.location.href = '/cardapio';
      return;
    }
    try {
      const p = JSON.parse(ativo);
      window.location.href = `/acompanhamento?id=${p.id}&guest_id=${getGuestId()}`;
    } catch {
      alert('Erro ao localizar pedido.');
    }
  });

  // Inicialização
  document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    updateAuthUI();
  });

  // Atualiza contador quando o storage muda
  window.addEventListener('storage', (e) => {
    if (e.key === 'cart') updateCartCount();
  });
})();
