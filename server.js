const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static('public'));

let stars = [];

io.on('connection', (socket) => {
    socket.emit('initStars', stars);

    socket.on('submitNickname', (nickname) => {
        const newStar = {
            id: socket.id + '_' + Date.now(),
            nickname: nickname || '별'
        };
        stars.push(newStar);
        io.emit('newStarAdded', newStar);
    });

    // 개별 별 삭제 이벤트 처리
    socket.on('deleteStar', (starId) => {
        stars = stars.filter(star => star.id !== starId);
        io.emit('starDeleted', starId);
    });

    socket.on('resetData', () => {
        stars = [];
        io.emit('initStars', stars);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`서버 구동 중: http://localhost:${PORT}`);
});