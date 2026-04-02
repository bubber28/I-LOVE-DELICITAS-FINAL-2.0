// ==================================================
// BOTÃO FLUTUANTE DE ACOMPANHAMENTO DE PEDIDO (VERSÃO FINAL)
// ==================================================
(async function () {
    const SUPABASE_URL = 'https://bizrnjpmsyxdsflgpxcl.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_l4xxVaXF8srM0JldOJob0Q_2ZRrXFdR';
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    let activeOrder = null;
    let button = null;
    let orderChannel = null;
    const FINAL_STATUSES = ['delivered', 'canceled'];

    // Busca o pedido ativo mais recente, excluindo os finais
    async function fetchActiveOrder(userId, guestId) {
        let query = supabaseClient
            .from('orders')
            .select('id, status')
            .not('status', 'in', `(${FINAL_STATUSES.map(s => `'${s}'`).join(',')})`)
            .order('created_at', { ascending: false })
            .limit(1);

        if (userId) {
            query = query.eq('user_id', userId);
        } else if (guestId) {
            query = query.eq('guest_id', guestId);
        } else {
            return null;
        }

        const { data, error } = await query;
        if (error || !data || data.length === 0) return null;
        return data[0];
    }

    // Cria o botão com o visual que você pediu
    function createButton(order) {
        if (button) button.remove();
        button = document.createElement('div');
        button.id = 'floating-order-btn';
        button.innerHTML = `
            <div class="fixed bottom-5 right-5 z-50 bg-primary text-white rounded-full shadow-lg hover:bg-primary-dark transition-all duration-300 flex items-center gap-2 px-4 py-3 cursor-pointer font-bold text-sm">
                <span class="material-symbols-outlined text-xl">delivery_tracking</span>
                <span>Acompanhar pedido</span>
            </div>
        `;
        document.body.appendChild(button);
        button.addEventListener('click', () => {
            window.location.href = `/acompanhamento?id=${order.id}`;
        });
    }

    async function init() {
        const { data: { session } } = await supabaseClient.auth.getSession();
        const userId = session?.user?.id || null;
        const guestId = localStorage.getItem('guest_id');

        activeOrder = await fetchActiveOrder(userId, guestId);
        if (activeOrder) createButton(activeOrder);

        // Listener em tempo real para mudanças no status do pedido ativo
        if (activeOrder) {
            if (orderChannel) supabaseClient.removeChannel(orderChannel);
            orderChannel = supabaseClient
                .channel(`order-status-${activeOrder.id}`)
                .on('postgres_changes', {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'orders',
                    filter: `id=eq.${activeOrder.id}`
                }, (payload) => {
                    const newStatus = payload.new.status;
                    if (FINAL_STATUSES.includes(newStatus)) {
                        if (button) button.remove();
                        button = null;
                        activeOrder = null;
                        if (orderChannel) supabaseClient.removeChannel(orderChannel);
                    } else {
                        if (!button && activeOrder) createButton(activeOrder);
                    }
                })
                .subscribe();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
