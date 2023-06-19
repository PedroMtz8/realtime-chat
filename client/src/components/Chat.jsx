import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
const socket = io('http://localhost:3000', { transports: ['websocket', 'polling', 'flashsocket'] });

export default function Chat() {
  const [messages, setMessages] = useState([]);
  console.log(messages)
  const [inputValue, setInputValue] = useState('');
  const [inputName, setInputName] = useState('');
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

    const data = {
      message,
      inputName,
    }
    // console.log(data)

    if (message) {
      socket.emit('chat message', data);
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
    socket.on('chat message', (data) => {
      console.log(data)
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    socket.on('typing', (some) => {
      if (some) {
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
  return (
    <div>
      <ul id="messages" style={{ listStyleType: "none" }}>
        {messages.map((data, index) => (
          <div key={index} style={{ display: "flex", flexDirection: "column" }} >
            <li style={{ fontWeight: 700 }}>{data.inputName}</li>
            <p style={{ margin: 0 }} >{data.message}</p>
          </div>
        ))}
      </ul>
      <form onSubmit={handleMessageSubmit}>
        <div style={{ display: "flex", flexDirection: "column", width: "230px" }} >
          <input
            type="text"
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            id='name'
            placeholder='Ingresa tu nombre'
          />
          <input
            placeholder='Escribe tu mensaje'
            id="message-input"
            autoComplete="off"
            value={inputValue}
            onChange={handleInputChange}
          />
        </div>
        <button type="submit">Enviar</button>
      </form>
      <p id="typing-status">{typingStatus}</p>
    </div>
  )
}