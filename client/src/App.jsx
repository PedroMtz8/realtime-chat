import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';


const socket = io('http://localhost:3000', { transports: ['websocket', 'polling', 'flashsocket'] });

function App() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [typingStatus, setTypingStatus] = useState('');
  const [, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false); // Nueva bandera para controlar la conexión
  // console.log(isConnected)

  const hideTypingStatus = () => {
    setTypingStatus('');
    setIsTyping(false);
  };

  const handleMessageSubmit = (e) => {
    e.preventDefault();
    const message = inputValue.trim();

    if (message) {
      socket.emit('chat message', message);
      setInputValue('');
      hideTypingStatus();
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    if (value && isConnected) { // Validar si el cliente está conectado antes de enviar el evento de escritura (typing)
      socket.emit('typing', true);
      setIsTyping(true);
      clearTimeout(typingTimer);
      typingTimer = setTimeout(hideTypingStatus, 500);
    }
  };

  let typingTimer;

  useEffect(() => {
    socket.on('chat message', (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    socket.on('typing', (some) => {
      if(some){
        setTypingStatus('Alguien está escribiendo...');
      }
      clearTimeout(typingTimer);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      typingTimer = setTimeout(hideTypingStatus, 2000);
    });

    socket.on('connect', () => {
      socket.emit('client connected');
      setIsConnected(true); // Actualizar el estado de conexión cuando el cliente se conecta
    });
    
    socket.on('disconnect', () => {
      socket.emit('client disconnected');
      setIsConnected(false); // Actualizar el estado de conexión cuando el cliente se desconecta
    });
    

    return () => {
      socket.off('chat message');
      socket.off('typing');
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  // if (!isConnected && !typingStatus) return <>Cargando...</>

  return (
    <div>
      <ul id="messages">
        {messages.map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}
      </ul>
      <form onSubmit={handleMessageSubmit}>
        <input
          id="message-input"
          autoComplete="off"
          value={inputValue}
          onChange={handleInputChange}
        />
        <button type="submit">Enviar</button>
      </form>
      <p id="typing-status">{ typingStatus}</p>
    </div>
  );
}

export default App;
