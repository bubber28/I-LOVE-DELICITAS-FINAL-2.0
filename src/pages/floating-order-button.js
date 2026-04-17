// ==================================================
// BOTÃO FLUTUANTE DE ACOMPANHAMENTO - V5.0 FINAL
// ==================================================
(async function () {
    const SUPABASE_URL = 'https://bizrnjpmsyxdsflgpxcl.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_l4xxVaXF8srM0JldOJob0Q_2ZRrXFdR';
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    let activeOrder = null;
    let button = null;
    let orderChannel = null;
    let removalTimer = null;      // Timer para remoção após entrega
    const FINAL_STATUSES = ['delivered', 'canceled'];
    const POST_DELIVERY_VISIBILITY_MS = 30 * 60 * 1000; // 30 minutos

    // 🔧 Função auxiliar para escape HTML
    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }

    // 🔧 GERA GUEST_ID PERSISTENTE
    function getGuestId() {
        let guestId = localStorage.getItem('guest_id');
        if (!guestId) {
            guestId = 'guest_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('guest_id', guestId);
        }
        return guestId;
    }

    // 🧠 BUSCA PEDIDO ATIVO APENAS PELO ID SALVO APÓS CONFIRMAÇÃO
    async function fetchActiveOrderById(orderId, userId, guestId) {
        const { data, error } = await supabaseClient
            .from('orders')
            .select('id, status, created_at, delivered_at, distance_km, customer_name, user_id, guest_id')
            .eq('id', orderId)
            .single();

        if (error || !data) {
            console.warn('❌ Fetch order by id error:', error);
            return null;
        }

        // Se o pedido já foi entregue, verificar se ainda está dentro do tempo de exibição
        if (data.status === 'delivered' && data.delivered_at) {
            const deliveredTime = new Date(data.delivered_at).getTime();
            const now = new Date().getTime();
            const diffMs = now - deliveredTime;
            if (diffMs >= POST_DELIVERY_VISIBILITY_MS) {
                console.log(`⏰ Pedido entregue há mais de ${POST_DELIVERY_VISIBILITY_MS / 60000} minutos. Não exibir botão.`);
                return null;
            }
        } else if (FINAL_STATUSES.includes(data.status)) {
            // Para status 'canceled', não exibir
            return null;
        }

        const isOwner = userId
            ? data.user_id === userId
            : (data.user_id === null && data.guest_id === guestId);

        if (!isOwner) {
            console.warn('⚠️ Pedido não pertence ao usuário/guest atual');
            return null;
        }

        return data;
    }

    // 🗑️ REMOVE COM ANIMAÇÃO SUAVE E LIMPA TIMER
    function removeButton() {
        if (removalTimer) {
            clearTimeout(removalTimer);
            removalTimer = null;
        }
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
        }, 400);
    }

    // 🎨 CRIA BOTÃO COM CSS ANIMADO
    function createButton(order) {
        if (button) button.remove();

        // ✅ INJETAR CSS ANIMAÇÕES (uma vez só)
        if (!document.getElementById('floating-btn-styles')) {
            const style = document.createElement('style');
            style.id = 'floating-btn-styles';
            style.textContent = `
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px) scale(0.9); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes fadeOutDown {
                    from { opacity: 1; transform: translateY(0) scale(1); }
                    to { opacity: 0; transform: translateY(15px) scale(0.95); }
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
        
        const customerNameEscaped = escapeHtml(order.customer_name || '');
        button.innerHTML = `
            <span class="material-symbols-outlined text-xl animate-pulse">local_shipping</span>
            <div>
                <span>Pedido #${order.id.slice(-6)}</span>
                ${customerNameEscaped ? `<br><span class="text-xs opacity-90 block">${customerNameEscaped.split(' ')[0]}</span>` : ''}
            </div>
        `;
        
        button.onclick = (e) => {
            e.preventDefault();
            window.location.href = `/acompanhamento.html?id=${order.id}`;
        };
        
        document.body.appendChild(button);
        console.log('✅ Botão criado:', order.id);
    }

    // ⏰ Agenda remoção automática para pedidos entregues
    function scheduleRemovalAfterDelivery(deliveredAt) {
        if (removalTimer) clearTimeout(removalTimer);
        const deliveredTime = new Date(deliveredAt).getTime();
        const now = new Date().getTime();
        const elapsed = now - deliveredTime;
        const remainingMs = POST_DELIVERY_VISIBILITY_MS - elapsed;
        
        if (remainingMs <= 0) {
            // Já passou do tempo, remove imediatamente
            removeButton();
            localStorage.removeItem('pedidoAtivo');
        } else {
            removalTimer = setTimeout(() => {
                console.log(`⏰ Pedido entregue há ${POST_DELIVERY_VISIBILITY_MS / 60000} minutos. Removendo botão.`);
                removeButton();
                localStorage.removeItem('pedidoAtivo');
            }, remainingMs);
        }
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
                const deliveredAt = payload.new.delivered_at;
                console.log('[FloatingBtn] Evento Realtime recebido. Novo status:', newStatus);
                
                if (newStatus === 'delivered' && deliveredAt) {
                    console.log('[FloatingBtn] Pedido entregue. Agendando remoção em 30 minutos.');
                    scheduleRemovalAfterDelivery(deliveredAt);
                } else if (newStatus === 'canceled') {
                    console.log('[FloatingBtn] Pedido cancelado. Removendo botão.');
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
            if (!ativoSalvo) {
                removeButton();
                console.log('ℹ️ [FloatingBtn] Sem pedidoAtivo, botão oculto.');
                return;
            }

            let dadosSalvos;
            try {
                dadosSalvos = JSON.parse(ativoSalvo);
            } catch (_) {
                localStorage.removeItem('pedidoAtivo');
                removeButton();
                console.log('⚠️ [FloatingBtn] pedidoAtivo inválido removido.');
                return;
            }

            if (!dadosSalvos?.id) {
                localStorage.removeItem('pedidoAtivo');
                removeButton();
                console.log('⚠️ [FloatingBtn] pedidoAtivo sem id removido.');
                return;
            }
            
            const { data: { session } } = await supabaseClient.auth.getSession();
            const userId = session?.user?.id;
            const guestId = getGuestId();

            activeOrder = await fetchActiveOrderById(dadosSalvos.id, userId, guestId);
            
            if (activeOrder) {
                console.log('✅ [FloatingBtn] Pedido ativo:', activeOrder.id);
                createButton(activeOrder);
                setupRealtime(activeOrder.id);
                
                // Se o pedido já estiver entregue (mas ainda dentro do tempo de exibição), agenda remoção
                if (activeOrder.status === 'delivered' && activeOrder.delivered_at) {
                    scheduleRemovalAfterDelivery(activeOrder.delivered_at);
                }
            } else {
                localStorage.removeItem('pedidoAtivo');
                removeButton();
                console.log('ℹ️ [FloatingBtn] Nenhum pedido ativo para pedidoAtivo salvo.');
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
        if (removalTimer) clearTimeout(removalTimer);
    });

    // 🧪 DEBUG MODE (F12 → console.testFloating())
    window.testFloating = {
        show: () => createButton({id: 'test123', customer_name: 'João'}),
        hide: () => removeButton(),
        check: init
    };

    console.log('✅ [FloatingBtn v5.0] Carregado com animações e timeout pós-entrega!');
})();
