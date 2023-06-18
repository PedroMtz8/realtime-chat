// Importar las dependencias
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');

// Crear una instancia de la aplicación de Express
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Ruta principal
/* app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
}); */
app.use(cors());
// Manejar la conexión de sockets
io.on('connection', (socket) => {
  console.log('Un usuario se ha conectado');

  // Manejar el evento de mensaje enviado
  socket.on('chat message', (msg) => {
    console.log('Mensaje recibido: ' + msg);

    // Enviar el mensaje a todos los clientes conectados
    io.emit('chat message', msg);
  });

  // Manejar el evento de escritura (typing)
  socket.on('typing', () => {
    // Enviar un mensaje de que el usuario está escribiendo a todos los clientes excepto al que está escribiendo
    socket.broadcast.emit('typing', true);
  });

/*   socket.on('', () => {

  }) */

  // Manejar la desconexión del usuario
  socket.on('disconnect', () => {
    console.log('Un usuario se ha desconectado');

    // Enviar un mensaje de que el usuario ha dejado de escribir al desconectarse
    socket.broadcast.emit('typing', false);
  });
});


// Iniciar el servidor
const port = 3000;
server.listen(port, () => {
  console.log('Servidor escuchando en el puerto ' + port);
});
