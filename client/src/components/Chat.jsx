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

  const hideTypingStatus = () => {
    setTypingStatus('');
  };

  const handleMessageSubmit = (e) => {
    e.preventDefault();
    // const message = inputValue.trim();

    localStorage.setItem("username", form.name)

    const data = {
      name: form.name,
      message: form.message,
    }

    if (form.message) {
      socket.emit('chat message', data);
      setForm({
        ...form,
        message: "",
      })
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
      socket.emit('typing', form);
      clearTimeout(typingTimer);
      typingTimer = setTimeout(hideTypingStatus, 500);
    }
  };

  let typingTimer;

  useEffect(() => {
    socket.on('chat message', (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
      setTypingStatus("");
    });

    socket.on('typing', (typing) => {
      if (typing) {
        setTypingStatus(typing.name + ' está escribiendo...');
      }
      clearTimeout(typingTimer);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      typingTimer = setTimeout(hideTypingStatus, 1000);
    });

    socket.on('connect', () => {
      socket.emit('client connected');
    });

    socket.on('disconnect', () => {
      socket.emit('client disconnected');
    });


    return () => {
      socket.off('chat message');
      socket.off('typing');
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);
  return (
    <div style={{ paddingLeft: "20px" }} >
      <ul id="messages" style={{ listStyleType: "none" }}>
        {messages.map((data, index) => (
          <div key={index} style={{ display: "flex", flexDirection: "column" }} >
            <li style={{ fontWeight: 700, color: "lightsteelblue" }}>{data.name}</li>
            <li style={{ marginLeft: "10px" }} >{data.message}</li>
          </div>
        ))}
      </ul>
      <form onSubmit={handleMessageSubmit}
        style={{ display: "flex", flexDirection: "column", width: "max-content", gap: "5px" }} >
        <div style={{ display: "flex", flexDirection: "column", width: "230px", marginTop: "20px", }} >
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
            style={{ padding: "3px" }}
            onChange={handleInputChange}
          />
        </div>
        <div style={{ display: "flex", gap: "5px" }} >
          <button type="submit"
            style={{ cursor: "pointer" }}
          >
            Enviar
          </button>
          <button
            style={{ cursor: "pointer", padding: "3px" }}
            onClick={() => {
              localStorage.removeItem("username")
              setForm({
                ...form,
                name: "",
              })
            }}
          >
            Cambiar username
          </button>
        </div>
      </form>
      <p id="typing-status" style={{ marginTop: "10px" }} >{typingStatus}</p>
    </div>
  )
}