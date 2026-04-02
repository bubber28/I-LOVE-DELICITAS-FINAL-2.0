// ==================================================
// BOTÃO FLUTUANTE DE ACOMPANHAMENTO DE PEDIDO
// Versão: suporte a guest_id, texto personalizado
// ==================================================
(async function() {
  const SUPABASE_URL = 'https://bizrnjpmsyxdsflgpxcl.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_l4xxVaXF8srM0JldOJob0Q_2ZRrXFdR';
  const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  let activeOrder = null;
  let button = null;

  async function fetchActiveOrder(userId, guestId) {
    if (userId) {
      const { data, error } = await supabaseClient
        .from('orders')
        .select('id, status')
        .eq('user_id', userId)
        .in('status', ['received', 'preparing', 'ready', 'delivery'])
        .order('created_at', { ascending: false })
        .limit(1);
      if (error || !data || data.length === 0) return null;
      return data[0];
    } else if (guestId) {
      const { data, error } = await supabaseClient
        .from('orders')
        .select('id, status')
        .eq('guest_id', guestId)
        .in('status', ['received', 'preparing', 'ready', 'delivery'])
        .order('created_at', { ascending: false })
        .limit(1);
      if (error || !data || data.length === 0) return null;
      return data[0];
    }
    return null;
  }

  function createButton(order) {
    if (button) button.remove();
    button = document.createElement('div');
    button.id = 'floating-order-btn';
    button.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px; background: #ae2f34; color: white; padding: 12px 20px; border-radius: 9999px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); cursor: pointer; font-family: 'Be Vietnam Pro', sans-serif; font-weight: bold; transition: transform 0.2s;">
        <span class="material-symbols-outlined" style="font-size: 20px;">delivery_tracking</span>
        <span>Acompanhe seu pedido Aqui</span>
        <span class="material-symbols-outlined" style="font-size: 18px;">chevron_right</span>
      </div>
    `;
    button.style.position = 'fixed';
    button.style.bottom = '20px';
    button.style.right = '20px';
    button.style.zIndex = '1000';
    button.addEventListener('click', () => {
      window.location.href = `/acompanhamento?id=${order.id}`;
    });
    document.body.appendChild(button);
  }

  async function init() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    const userId = session?.user?.id || null;
    const guestId = localStorage.getItem('guest_id');
    activeOrder = await fetchActiveOrder(userId, guestId);
    if (activeOrder) createButton(activeOrder);

    // Real-time: se houver alteração no pedido (status ou novo pedido)
    let filter = '';
    if (userId) filter = `user_id=eq.${userId}`;
    else if (guestId) filter = `guest_id=eq.${guestId}`;
    else return;

    const channel = supabaseClient
      .channel('floating-order')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: filter
      }, async () => {
        const newOrder = await fetchActiveOrder(userId, guestId);
        if (newOrder) {
          if (!activeOrder || activeOrder.id !== newOrder.id || activeOrder.status !== newOrder.status) {
            activeOrder = newOrder;
            createButton(activeOrder);
          }
        } else {
          if (button) button.remove();
          button = null;
          activeOrder = null;
        }
      })
      .subscribe();
    window.addEventListener('beforeunload', () => supabaseClient.removeChannel(channel));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
