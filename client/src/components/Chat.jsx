import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
const socket = io('http://localhost:3000', { transports: ['websocket', 'polling', 'flashsocket'] });

export default function Chat() {
  const username = localStorage.getItem('username');
  const [messages, setMessages] = useState([]);
  const [form, setForm] = useState({
    name: username || "",
    message: "",
  })
  const [typingStatus, setTypingStatus] = useState('');
  const [, setIsTyping] = useState(false);

  const hideTypingStatus = () => {
    setTypingStatus('');
    setIsTyping(false);
  };

  const handleMessageSubmit = (e) => {
    e.preventDefault();
    // const message = inputValue.trim();

    localStorage.setItem("username", form.name)

    const data = {
      name: form.name,
      message: form.message,
    }
    // console.log(data)

    if (form.message) {
      socket.emit('chat message', data);
      setForm({
        ...form,
        message: "",
      })
      setIsTyping(false);
      hideTypingStatus();
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    const name = e.target.name;

    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
    // setInputValue(value);

    if (value && name === "message") { // Validar si el cliente está conectado antes de enviar el evento de escritura (typing)
      socket.emit('typing', true);
      setIsTyping(true);
      clearTimeout(typingTimer);
      typingTimer = setTimeout(hideTypingStatus, 500);
    }
  };

  let typingTimer;

  useEffect(() => {
    socket.on('chat message', (data) => {
      // console.log(data)
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    socket.on('typing', (typing) => {
      if (typing) {
        setTypingStatus('Alguien está escribiendo...');
      }
      clearTimeout(typingTimer);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      typingTimer = setTimeout(hideTypingStatus, 2000);
    });

    socket.on('connect', () => {
      socket.emit('client connected');
      // setIsConnected(true); // Actualizar el estado de conexión cuando el cliente se conecta
    });

    socket.on('disconnect', () => {
      socket.emit('client disconnected');
      // setIsConnected(false); // Actualizar el estado de conexión cuando el cliente se desconecta
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
            <li style={{ fontWeight: 700 }}>{data.name}</li>
            <p style={{ margin: 0 }} >{data.message}</p>
          </div>
        ))}
      </ul>
      <form onSubmit={handleMessageSubmit}>
        <div style={{ display: "flex", flexDirection: "column", width: "230px" }} >
          {
            !username && (
              <input
                type="text"
                value={form.name}
                onChange={handleInputChange}
                id='name'
                name="name"
                placeholder='Ingresa tu nombre'
              />
            )
          }
          <input
            placeholder='Escribe tu mensaje'
            id="message-input"
            name="message"
            autoComplete="off"
            value={form.message}
            onChange={handleInputChange}
          />
        </div>
        <button type="submit">Enviar</button>
        <button onClick={() => {
          localStorage.removeItem("username")
          setForm({
            ...form,
            name: "",
          })
        }} >Cambiar username</button>
      </form>
      <p id="typing-status">{typingStatus}</p>
    </div>
  )
}