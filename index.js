const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');


const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(path.join(__dirname, 'static')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'static', 'home.html'));
});

app.get('/chat/:chatId', (req, res) => {
  res.sendFile(path.join(__dirname, 'static', 'group.html'));
});



io.sockets.on('connection', (socket) => {

  socket.on('room', (roomName) => {
   
    socket.join(roomName);
    console.log(`User joined room: ${roomName}`);
    

});


  socket.on('chat message', (data) => {
    console.log(data);
    // Use io.to(roomName).emit instead of io.sockets.in(data.roomName).emit
    console.log(io.sockets.adapter.rooms.has(data.roomName));
    io.to(data.roomName).emit('chat message', { sender: data.sender, msg: data.msg });
  });
  

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = 3000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
