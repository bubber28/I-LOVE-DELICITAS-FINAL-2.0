import React, { useState } from 'react';

function PagamentoPix() {
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentId, setPaymentId] = useState(null);
  const [polling, setPolling] = useState(null);

  const finalizarPedido = async (paymentId) => {
    try {
      // Aqui você precisa buscar os dados do pedido pendente (sessionStorage ou contexto)
      const pedidoSalvo = sessionStorage.getItem('pedidoPendente');
      if (!pedidoSalvo) {
        console.error('Nenhum pedido pendente encontrado');
        return;
      }
      const dadosPedido = JSON.parse(pedidoSalvo);
      // Chama a mesma lógica de criação do pedido (RPC)
      const response = await fetch('/api/pedidos/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...dadosPedido, paymentId })
      });
      const result = await response.json();
      if (result.orderId) {
        localStorage.setItem('pedidoAtivo', JSON.stringify({ id: result.orderId }));
        window.location.href = `/acompanhamento?id=${result.orderId}`;
      } else {
        throw new Error('Erro ao criar pedido');
      }
    } catch (err) {
      console.error('Erro ao finalizar pedido:', err);
      alert('Erro ao finalizar pedido. Tente novamente.');
    }
  };

  const iniciarPolling = (paymentId) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/pagamento/status/${paymentId}`);
        const data = await response.json();
        if (data.status === 'approved' || data.status === 'paid') {
          clearInterval(interval);
          setPolling(null);
          await finalizarPedido(paymentId);
        }
      } catch (err) {
        console.warn('Erro no polling:', err);
      }
    }, 3000);
    setPolling(interval);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    const formData = new FormData(event.target);
    const data = {
      valor: formData.get('valor'),
      descricao: formData.get('descricao'),
      email: formData.get('email'),
    };

    try {
      const response = await fetch('https://ilove-delicitas-admin.onrender.com/api/pagamento/pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (response.ok) {
        setQrCode(result.qr_code_base64 || result.qr_code);
        if (result.payment_id) {
          setPaymentId(result.payment_id);
          iniciarPolling(result.payment_id);
        }
      } else {
        setError(result.error || 'Erro ao gerar pagamento');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  // Limpa polling ao desmontar componente
  React.useEffect(() => {
    return () => {
      if (polling) clearInterval(polling);
    };
  }, [polling]);

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <input type="number" name="valor" placeholder="Valor" required step="0.01" />
        <input type="text" name="descricao" placeholder="Descrição" required />
        <input type="email" name="email" placeholder="E-mail" required />
        <button type="submit">Gerar QR Code PIX</button>
      </form>
      {loading && <p>Carregando...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {qrCode && (
        <div>
          <h3>QR Code PIX:</h3>
          {qrCode.startsWith('data:image') ? (
            <img src={qrCode} alt="QR Code PIX" />
          ) : (
            <p>{qrCode}</p>
          )}
          <p>Aguardando confirmação do pagamento... Você será redirecionado automaticamente.</p>
        </div>
      )}
    </div>
  );
}

export default PagamentoPix;
