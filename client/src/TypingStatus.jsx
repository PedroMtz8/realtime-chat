
import { useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', { transports: ['websocket', 'polling', 'flashsocket'] });

export default function TypingStatus({typingStatus}){
  const [typingStatus, setTypingStatus] = useState('');
  

  // useEffect(() => {
  //   socket.on('typing', () => {
  //     setTypingStatus('Alguien está escribiendo...');
  //     clearTimeout(typingTimer);
  //     // eslint-disable-next-line react-hooks/exhaustive-deps
  //     typingTimer = setTimeout(hideTypingStatus, 2000);
  //   });
  // },[])
  return (
    <p id="typing-status">{ typingStatus}</p>
  )
}