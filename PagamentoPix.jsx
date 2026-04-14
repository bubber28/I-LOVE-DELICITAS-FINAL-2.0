import React, { useState } from 'react';

function PagamentoPix() {
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      // 🔥 ATENÇÃO: Esta é a URL do seu BACKEND no Render.
      // Substitua pela URL real se ela for diferente.
      const response = await fetch('https://ilove-delicitas-admin.onrender.com/api/pagamento/pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (response.ok) {
        setQrCode(result.qr_code_base64 || result.qr_code);
      } else {
        setError(result.error || 'Erro ao gerar pagamento');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      {/* O conteúdo do seu HTML convertido vai aqui, usando as funções e estados do React */}
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
        </div>
      )}
    </div>
  );
}

export default PagamentoPix;
