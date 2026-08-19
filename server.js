const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

// 메모리 내 별 데이터 저장소
let stars = [];

io.on('connection', (socket) => {
  console.log('클라이언트 연결됨:', socket.id);

  // 접속 시 기존 별 목록 전달
  socket.emit('initStars', stars);

  // 모바일 또는 PC에서 닉네임 제출 시
  socket.on('submitNickname', (nickname) => {
    const newStar = {
      id: Date.now() + Math.random().toString(36).substr(2, 4),
      nickname: nickname || '별',
      name: nickname || '별'
    };
    stars.push(newStar);
    
    // 연결된 모든 전광판/모바일에 동시에 데이터 방송
    io.emit('newStarAdded', newStar);
    io.emit('newStar', newStar);
  });

  // 개별 별 삭제
  socket.on('deleteStar', (starId) => {
    stars = stars.filter(s => s.id !== starId);
    io.emit('starDeleted', starId);
  });

  // 전체 데이터 초기화
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
