const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

let stars = [];

io.on('connection', (socket) => {
  console.log('클라이언트 연결됨:', socket.id);

  socket.emit('initStars', stars);

  socket.on('submitNickname', (nickname) => {
    const newStar = {
      id: Date.now() + Math.random().toString(36).substr(2, 4),
      nickname: nickname || '별',
      name: nickname || '별'
    };
    stars.push(newStar);
    
    // 단일 이벤트 전송
    io.emit('newStarAdded', newStar);
  });

  socket.on('deleteStar', (starId) => {
    stars = stars.filter(s => s.id !== starId);
    io.emit('starDeleted', starId);
  });

  socket.on('resetData', () => {
    stars = [];
    io.emit('resetStars');
  });

  socket.on('clearStars', () => {
    stars = [];
    io.emit('resetStars');
  });

  socket.on('disconnect', () => {
    console.log('클라이언트 연결 해제:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});
