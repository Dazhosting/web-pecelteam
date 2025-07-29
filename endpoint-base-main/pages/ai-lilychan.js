// File: pages/index.js (atau file halaman chat Anda)

import { useState, useEffect, useRef } from 'react';

export default function TanyaLilyPage() {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentQuestion = question.trim();
    if (!currentQuestion) return;

    setQuestion('');
    setError('');
    
    // Simpan pertanyaan user ke state SEBELUM mengirim ke API
    const newHistory = [...chatHistory, { text: currentQuestion, type: 'user' }];
    setChatHistory(newHistory);
    setIsLoading(true);

    try {
      // 1. UBAH FETCH MENJADI METODE POST
      const response = await fetch('/api/ai/ai-lilychan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // 2. KIRIM PERTANYAAN BARU DAN RIWAYAT SEBELUMNYA
        body: JSON.stringify({
          question: currentQuestion,
          history: chatHistory // Kirim riwayat chat sebelum pertanyaan baru
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Aduh, ada yang error nih! Maaf yaa.');
      }

      // Tambahkan jawaban AI ke riwayat chat
      setChatHistory(prev => [...prev, { text: data.result, type: 'ai' }]);

    } catch (err) {
      const errorMessage = err.message;
      setError(errorMessage);
      setChatHistory(prev => [...prev, { text: `Oops! ${errorMessage}`, type: 'error' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // ... (bagian return JSX dan style tidak perlu diubah, tetap sama seperti sebelumnya) ...
  return (
    <>
      <div className="chat-container">
        <header className="chat-header">
          <h1>Tanya Lily-chan AI (o^▽^o)</h1>
        </header>

        <main className="chat-body">
          {chatHistory.map((message, index) => (
            <div key={index} className={`message-wrapper ${message.type}-wrapper`}>
              <div className={`message-bubble ${message.type}-bubble`}>
                {message.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="message-wrapper ai-wrapper">
              <div className="message-bubble ai-bubble typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </main>

        <footer className="chat-footer">
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ketik pesanmu..."
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading || !question}>
              Kirim
            </button>
          </form>
        </footer>
      </div>

      {/* CSS untuk styling halaman */}
      <style jsx>{`
        .chat-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          max-width: 800px;
          margin: 0 auto;
          background-color: #e5ddd5;
          background-image: url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png');
          font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif;
        }
        .chat-header {
          padding: 10px 20px;
          background-color: #075e54;
          color: white;
          text-align: center;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .chat-header h1 {
          font-size: 1.2rem;
          margin: 0;
        }
        .chat-body {
          flex-grow: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .message-wrapper {
          display: flex;
          width: 100%;
        }
        .user-wrapper {
          justify-content: flex-end;
        }
        .ai-wrapper, .error-wrapper {
          justify-content: flex-start;
        }
        .message-bubble {
          padding: 8px 14px;
          border-radius: 18px;
          max-width: 75%;
          line-height: 1.5;
          word-wrap: break-word;
          box-shadow: 0 1px 1px rgba(0,0,0,0.05);
        }
        .user-bubble {
          background-color: #dcf8c6;
          border-top-right-radius: 4px;
        }
        .ai-bubble {
          background-color: #ffffff;
          border-top-left-radius: 4px;
        }
        .error-bubble {
          background-color: #ffebee;
          color: #c62828;
          border: 1px solid #ef9a9a;
          border-top-left-radius: 4px;
        }
        .chat-footer {
          padding: 10px 20px;
          background-color: transparent;
        }
        .chat-footer form {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        .chat-footer input {
          flex-grow: 1;
          padding: 12px 18px;
          border-radius: 24px;
          border: none;
          font-size: 1rem;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        .chat-footer button {
          padding: 12px;
          width: 48px;
          height: 48px;
          border: none;
          background-color: #128c7e;
          color: white;
          font-size: 0;
          border-radius: 50%;
          cursor: pointer;
          transition: background-color 0.2s;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white' width='24px' height='24px'%3E%3Cpath d='M2.01 21L23 12 2.01 3 2 10l15 2-15 2z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: center;
        }
        .chat-footer button:hover {
          background-color: #075e54;
        }
        .chat-footer button:disabled {
          background-color: #b0c4de;
          cursor: not-allowed;
        }
        .typing-indicator span {
          height: 8px;
          width: 8px;
          background-color: #9E9E9E;
          border-radius: 50%;
          display: inline-block;
          animation: bounce 1.4s infinite ease-in-out both;
        }
        .typing-indicator span:nth-of-type(1) { animation-delay: -0.32s; }
        .typing-indicator span:nth-of-type(2) { animation-delay: -0.16s; }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1.0); }
        }
      `}</style>
    </>
  );
                }
