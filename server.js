const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(express.static('public'));

// 모바일 페이지 라우팅
app.get('/mobile', (req, res) => {
  res.sendFile(__dirname + '/public/mobile.html');
});

// 실시간 별빛 데이터 보관 (메모리)
let stars = [];

io.on('connection', (socket) => {
  // 처음 접속한 전광판에 기존 별빛 목록 전달
  socket.emit('initStars', stars);

  // 모바일에서 별빛 전송 신호를 받았을 때
  socket.on('addStar', (data) => {
    const newStar = {
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      name: data.name,
      x: Math.floor(Math.random() * 80) + 10, // 좌우 위치 (%)
      y: Math.floor(Math.random() * 70) + 15  // 상하 위치 (%)
    };
    stars.push(newStar);
    
    // 연결된 모든 화면(전광판)으로 새 별빛 방송(Broadcast)
    io.emit('newStar', newStar);
  });

  // 관리자 초기화 명령 시
  socket.on('clearStars', () => {
    stars = [];
    io.emit('resetStars');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
