// ==================================================
// BOTÃO FLUTUANTE DE ACOMPANHAMENTO - V4.1 FINAL
// ==================================================
(async function () {
    const SUPABASE_URL = 'https://bizrnjpmsyxdsflgpxcl.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_l4xxVaXF8srM0JldOJob0Q_2ZRrXFdR';
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    let activeOrder = null;
    let button = null;
    let orderChannel = null;
    
    const FINAL_STATUSES = ['delivered', 'canceled'];
    const MAX_AGE_MS = 10 * 60 * 1000;  // 10 minutos
    const MAX_DISTANCE_KM = 3;          // Geofencing 3km

    // 🔧 GERA GUEST_ID PERSISTENTE
    function getGuestId() {
        let guestId = localStorage.getItem('guest_id');
        if (!guestId) {
            guestId = 'guest_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('guest_id', guestId);
        }
        return guestId;
    }

    // 🧠 BUSCA PEDIDO ATIVO INTELIGENTE
    async function fetchActiveOrder(userId, guestId) {
        const dezMinAtras = new Date(Date.now() - MAX_AGE_MS).toISOString();
        
        let query = supabaseClient
            .from('orders')
            .select('id, status, created_at, distance_km, customer_name, user_id, guest_id')
            .not('status', 'in', `(${FINAL_STATUSES.map(s => `'${s}'`).join(',')})`)
            .gte('created_at', dezMinAtras)              // ✅ Só recentes
            .lte('distance_km', MAX_DISTANCE_KM)        // ✅ Dentro 3km
            .order('created_at', { ascending: false })
            .limit(1);

        if (userId) {
            query = query.eq('user_id', userId);
        } else {
            query = query.eq('guest_id', guestId);
        }

        const { data, error } = await query;
        if (error) {
            console.warn('❌ Fetch order error:', error);
            return null;
        }
        return data?.[0] || null;
    }

    // 🎨 CRIA BOTÃO COM CSS ANIMADO INJETADO ✅
    function createButton(order) {
        if (button) button.remove();

        // ✅ INJETAR CSS ANIMAÇÕES (uma vez só)
        if (!document.getElementById('floating-btn-styles')) {
            const style = document.createElement('style');
            style.id = 'floating-btn-styles';
            style.textContent = `
                @keyframes fadeInUp {
                    from { 
                        opacity: 0; 
                        transform: translateY(20px) scale(0.9); 
                    }
                    to { 
                        opacity: 1; 
                        transform: translateY(0) scale(1); 
                    }
                }
                @keyframes fadeOutDown {
                    from { 
                        opacity: 1; 
                        transform: translateY(0) scale(1); 
                    }
                    to { 
                        opacity: 0; 
                        transform: translateY(15px) scale(0.95); 
                    }
                }
                #floating-order-btn {
                    will-change: transform, opacity;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255,255,255,0.2);
                }
                #floating-order-btn.entering {
                    animation: fadeInUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                }
                #floating-order-btn.removing {
                    animation: fadeOutDown 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                }
            `;
            document.head.appendChild(style);
            console.log('🎨 CSS animações injetadas');
        }
        
        button = document.createElement('button');
        button.id = 'floating-order-btn';
        button.className = 'fixed bottom-6 right-6 z-[9999] bg-gradient-to-r from-[#ae2f34] via-[#d63f45] to-[#ff6b6b] text-white px-6 py-4 rounded-2xl shadow-2xl hover:shadow-3xl hover:shadow-[#ae2f34]/50 hover:-translate-y-1 active:scale-95 transition-all duration-300 flex items-center gap-3 font-bold text-sm border-0 cursor-pointer backdrop-blur-sm entering';
        
        button.innerHTML = `
            <span class="material-symbols-outlined text-xl animate-pulse">local_shipping</span>
            <div>
                <span>Pedido #${order.id.slice(-6)}</span>
                ${order.customer_name ? `<br><span class="text-xs opacity-90 block">${order.customer_name.split(' ')[0]}</span>` : ''}
            </div>
        `;
        
        button.onclick = (e) => {
            e.preventDefault();
            window.location.href = `/acompanhamento.html?id=${order.id}`;
        };
        
        document.body.appendChild(button);
        console.log('✅ Botão criado:', order.id);
    }

    // 🗑️ REMOVE COM ANIMAÇÃO SUAVE ✅
    function removeButton() {
        if (!button) return;
        
        button.classList.remove('entering');
        button.classList.add('removing');
        
        setTimeout(() => {
            if (button) {
                button.remove();
                button = null;
                activeOrder = null;
                console.log('✅ Botão removido suavemente');
            }
        }, 400); // ✅ Sync com fadeOutDown
    }

    // 📡 Realtime único para evitar eventos duplicados
    async function setupRealtime(orderId) {
        // Cleanup anterior
        if (orderChannel) {
            console.log('[FloatingBtn] Removendo canal anterior');
            await supabaseClient.removeChannel(orderChannel);
            orderChannel = null;
        }

        // Realtime principal
        orderChannel = supabaseClient
            .channel(`order-status-${orderId}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'orders',
                filter: `id=eq.${orderId}`
            }, (payload) => {
                const newStatus = payload.new.status;
                console.log('[FloatingBtn] Evento Realtime recebido. Novo status:', newStatus);
                
                if (FINAL_STATUSES.includes(newStatus)) {
                    console.log('[FloatingBtn] Pedido atingiu status final. Removendo botão.');
                    removeButton();
                    localStorage.removeItem('pedidoAtivo');
                }
            })
            .subscribe((status) => {
                console.log('[FloatingBtn] Status da conexão Realtime:', status);
            });
    }

    // 🚀 INICIALIZAÇÃO ROBUSTA
    async function init() {
        try {
            console.log('🔍 [FloatingBtn] Inicializando...');

            const ativoSalvo = localStorage.getItem('pedidoAtivo');
            if(ativoSalvo) {
                const dadosSalvos = JSON.parse(ativoSalvo);
                const { data: orderCheck } = await supabaseClient
                    .from('orders')
                    .select('status')
                    .eq('id', dadosSalvos.id)
                    .single();
                if(!orderCheck ||
                    FINAL_STATUSES.includes(orderCheck.status)) {
                    localStorage.removeItem('pedidoAtivo');
                    console.log('✅ pedidoAtivo limpo - status final');
                    return;
                }
            }
            
            const { data: { session } } = await supabaseClient.auth.getSession();
            const userId = session?.user?.id;
            const guestId = getGuestId();

            activeOrder = await fetchActiveOrder(userId, guestId);
            
            if (activeOrder) {
                console.log('✅ [FloatingBtn] Pedido ativo:', activeOrder.id);
                createButton(activeOrder);
                setupRealtime(activeOrder.id);
            } else {
                console.log('ℹ️ [FloatingBtn] Nenhum pedido ativo (10min/3km)');
            }

        } catch (error) {
            console.error('❌ [FloatingBtn] Init error:', error);
        }
    }

    // 🔥 AUTO-START + EVENTOS GLOBAIS
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // 🔄 Re-check quando volta pra aba (Page Visibility API)
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            console.log('👁️ [FloatingBtn] Aba visível - recheck');
            setTimeout(init, 1500);
        }
    });

    // 🧹 CLEANUP PROFISSIONAL
    window.addEventListener('beforeunload', () => {
        if (orderChannel) {
            supabaseClient.removeChannel(orderChannel);
            orderChannel = null;
        }
    });

    // 🧪 DEBUG MODE (F12 → console.testFloating())
    window.testFloating = {
        show: () => createButton({id: 'test123', customer_name: 'João'}),
        hide: () => removeButton(),
        check: init
    };

    console.log('✅ [FloatingBtn v4.1] Carregado com animações!');
})();
