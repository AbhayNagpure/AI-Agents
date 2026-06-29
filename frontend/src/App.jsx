import { useState } from 'react'
import './App.css'

function App() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am connected to the internal database. Who would you like me to look up?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    
    // 1. Add user's message to the chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      // 2. Call our Express Agent API
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: userMessage })
      });

      const data = await response.json();

      // 3. Add the Agent's reply to the chat
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error connecting to the server.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      
      <div className="chat-header">
        <h2>Database Support Agent</h2>
      </div>

      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message-wrapper ${msg.role === 'user' ? 'user-wrapper' : 'assistant-wrapper'}`}>
            <div className={`message-bubble ${msg.role === 'user' ? 'user-bubble' : 'assistant-bubble'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message-wrapper assistant-wrapper">
            <div className="message-bubble assistant-bubble loading">
              Agent is querying the database...
            </div>
          </div>
        )}
      </div>

      <form className="chat-input-form" onSubmit={sendMessage}>
        <input 
          type="text" 
          placeholder="Ask about users by ID or plan..." 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !input.trim()}>
          Send
        </button>
      </form>

    </div>
  )
}

export default App
