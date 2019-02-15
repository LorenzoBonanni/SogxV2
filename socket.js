const Socket = require('socket.io');
const ss = require('socket.io-stream');
const path = require('path');
const fs = require('fs');

let sockets = {};
let songs = [];

populateSongs = () => {
    const folder = './public/music';
    const fs = require('fs');

    fs.readdir(folder, (err, files) => {
        songs = files
    });
};

socket_connection = (server) => {
    const io = Socket(server);
    io.on('connection', (socket) => {
        sockets[socket.id] = socket;
        io.emit('songs', songs);
        socket.on('disconnect', (reason) => {
            console.log('disconnected' + ' ' + socket.id);
            delete sockets[socket.id];
        });
        socket.on('get_song', (filename) => {
            populateSongs();
            io.emit('songs', songs);
            console.log("filename: " + filename);
            let file_path = path.join(__dirname, '/public/music', filename);
            console.log('path: ' + file_path);
            let stream = ss.createStream();
            ss(socket).emit('audio-stream', stream, { name: file_path });
            fs.createReadStream(file_path).pipe(stream);
        });
    });
};

initSocket = (server) => {
    // create server socket
    populateSongs();
    socket_connection(server);
};

module.exports = initSocket;