import React, { useState, useRef, useEffect } from 'react';

const Chatbot = () => {
  const [mensagem, setMensagem] = useState('');
  const [conversa, setConversa] = useState([
    { remetente: 'bot', texto: 'Olá! Sou o assistente de recomendações de livros. Como posso ajudar você hoje?' }
  ]);
  const [carregando, setCarregando] = useState(false);
  const [aberto, setAberto] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversa]);

  const enviarMensagem = async (e) => {
    e.preventDefault();
    if (!mensagem.trim()) return;
    const novaConversa = [...conversa, { remetente: 'user', texto: mensagem }];
    setConversa(novaConversa);
    setMensagem('');
    setCarregando(true);
    try {
      const resp = await fetch('http://localhost:5000/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensagem })
      });
      const data = await resp.json();
      setConversa(c => [...c, { remetente: 'bot', texto: data.resposta }]);
    } catch (err) {
      setConversa(c => [...c, { remetente: 'bot', texto: 'Erro ao conectar com o assistente.' }]);
    }
    setCarregando(false);
  };

  const toggleChat = () => {
    setAberto(!aberto);
  };

  if (!aberto) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={toggleChat}
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110"
          title="Abrir chat de recomendações"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="flex flex-col h-[500px] max-w-md w-full mx-auto border rounded-lg shadow-lg bg-white">
        {/* Header do chat */}
        <div className="flex items-center justify-between p-3 bg-blue-500 text-white rounded-t-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="font-medium">Assistente de Livros</span>
          </div>
          <button
            onClick={toggleChat}
            className="text-white hover:text-gray-200 transition-colors"
            title="Fechar chat"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Área de mensagens */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
          {conversa.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.remetente === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`px-4 py-2 rounded-lg max-w-[80%] text-sm whitespace-pre-line ${msg.remetente === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>{msg.texto}</div>
            </div>
          ))}
          {carregando && (
            <div className="flex justify-start">
              <div className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 text-sm animate-pulse">Digitando...</div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Formulário de envio */}
        <form onSubmit={enviarMensagem} className="flex p-2 border-t bg-white">
          <input
            type="text"
            className="flex-1 px-3 py-2 border rounded-l focus:outline-none focus:ring"
            placeholder="Digite sua mensagem..."
            value={mensagem}
            onChange={e => setMensagem(e.target.value)}
            disabled={carregando}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-r hover:bg-blue-600 disabled:opacity-50"
            disabled={carregando || !mensagem.trim()}
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot; 