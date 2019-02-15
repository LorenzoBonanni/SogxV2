console.clear();
let index = 0;
const socket = io.connect('http://127.0.0.1:7777');
let musicPlayer;
let pause = true;
let timer = new Timer();
let styleElem = document.head.appendChild(document.createElement("style"));


class MusicPlayer {
    constructor(songs) {
        // dom
        this.prevBtn = document.getElementById('prev');
        this.pauseBtn = document.getElementById('pause');
        this.playBtn = document.getElementById('play');
        this.nextBtn = document.getElementById('next');
        this.randomBtn = document.getElementById('random');
        this.repeatBtn = document.getElementById('repeat');
        this.repeat1Btn = document.getElementById('repeat-1');
        this.endTime = document.getElementsByClassName('end-time')[0];

        // event listener
        this.prevBtn.addEventListener('click', ()=>{this.previous()});
        this.playBtn.addEventListener('click', ()=>{this.play()});
        this.pauseBtn.addEventListener('click', ()=>{this.pause()});
        this.nextBtn.addEventListener('click', ()=>{this.next()});
        this.randomBtn.addEventListener('click', ()=>{this.random()});
        this.repeatBtn.addEventListener('click', ()=>{this.repeat()});
        this.repeat1Btn.addEventListener('click', ()=>{this.repeat1()});

        //other
        this.sound = null;
        this.songs = songs;

        this.load();
    }

    play() {
        if (this.sound) {
            this.sound.play();
            console.log('playing');
            // hide play and show pause button
            this.playBtn.style.display = "none";
            this.pauseBtn.style.display = "block";
            // duration
            let [integer, float] = ((this.sound.duration()/60).toFixed(2)).split('.');
            this.endTime.textContent = integer + ':' + float;
            timer.start();
            pause = false;
        }
    }

    pause() {
        if (this.sound) {
            this.sound.pause();
            console.log('stopped');
            this.playBtn.style.display = "block";
            this.pauseBtn.style.display = "none";
            timer.pause();
            pause = true;
        }
    }

    next() {
        if (this.sound) {
            index++;
            if (index>this.songs.length-1){
                index=0;
            }
            console.log('next');
            this.pause();
            socket.emit("get_song", this.songs[index]);
            socket.on('audio-stream', (stream, data) => {
                let parts = [];
                stream.on('data', (chunk) =>{
                    parts.push(chunk);
                });
                stream.on('end', () =>{
                    this.sound.changeSrc((window.URL || window.webkitURL).createObjectURL(new Blob(parts)));
                });
            });
            timer.stop();
        }
    }

    previous() {
        if (this.sound) {
            index--;
            if (index<0){
                index = this.songs.length-1;
            }
            this.pause();
            socket.emit("get_song", this.songs[index]);
            console.log('emittt' + this.songs[index]);
            ss(socket).on('audio-stream', (stream, data) => {
                let parts = [];
                stream.on('data', (chunk) =>{
                    parts.push(chunk);
                });
                stream.on('end', () =>{
                    this.sound.changeSrc((window.URL || window.webkitURL).createObjectURL(new Blob(parts)));
                });
            });
            timer.stop();
        }
    }

    load() {
        console.log('loaded');
        socket.emit("get_song", this.songs[index]);
        console.log('emittt' + this.songs[index]);
        ss(socket).on('audio-stream', (stream, data) => {
            let parts = [];
            stream.on('data', (chunk) =>{
                parts.push(chunk);
            });
            stream.on('end', () =>{
                console.log((window.URL || window.webkitURL).createObjectURL(new Blob(parts)));
                this.sound = new Howl({
                    src: (window.URL || window.webkitURL).createObjectURL(new Blob(parts)),
                    format: ['mp3']
                });
            });
        });
    }

    repeat() {
        this.repeatBtn.style.display = "none";
        this.repeat1Btn.style.display = "block";
        this.sound._loop = false;
    }

    repeat1() {
        this.repeatBtn.style.display = "block";
        this.repeat1Btn.style.display = "none";
        this.sound._loop = true;
    }

    random() {

    }
}

// SOCKET
socket.on('connect', () => {
    console.log('connected');
});

socket.on('songs', (songs) => {
    musicPlayer ? musicPlayer.songs = songs : musicPlayer = new MusicPlayer(songs);
    console.log(musicPlayer.songs)
});

socket.on('disconnect', () => {
    console.log('disconnected')
});

// shortcuts
document.addEventListener("keydown", (event) => {
    // right arrow
    if (event.which === 39) {
        musicPlayer.next()
    // left arrow
    } else if (event.which === 37) {
        musicPlayer.previous()
    // spacebar
    } else if (event.which === 32) {
        if (pause) {
            musicPlayer.play()
        } else {
            musicPlayer.pause()
        }
    }
});

// song timeline
timer.addEventListener('secondsUpdated', (e) => {
    let pointer = document.getElementsByClassName("timescope-dot")[0];
    let current_time = document.getElementsByClassName("current-time")[0];
    current_time.textContent = timer.getTimeValues().toString(['minutes', 'seconds']);
    // duration
    let duration_seconds = musicPlayer.sound.duration();
    // percentage = curr_time : duration = x :100 ---> (curr_time*100)/duration
    let percentage = ((timer.getTimeValues().minutes*60 + timer.getTimeValues().seconds)*100)/duration_seconds;
    pointer.style.left = Math.round(percentage) + '%';
    styleElem.innerHTML = "span.timescope:after{width: " +  Math.round(percentage) + '%' + "    !important;}"
});


window.onload = (e)=>{
    alert("loading");
    let songs_ul = document.getElementsByClassName("player-list")[0];
    let li = null;
    if (musicPlayer) {
        musicPlayer.songs.forEach((song)=>{
            song = song.substring(0, song.length - 3);
            if (song === musicPlayer.songs[index]) {
                // TODO get copertina titolo e autore
                console.log("testtttttttttttttttttt")
            } else {
                li = document.createElement("li");
                li.innerHTML = "<img class=\"list-cover\" src=\"https://s3-us-west-2.amazonaws.com/s.cdpn.io/329679/music-player-freebie-a1.png\">" +
                    "<div class=\"list-info\">" +
                    "<div class=\"info-title\">" + song + "</div>" +
                    "<div class=\"info-artist\">" + "Artista" + "</div>" +
                    "</div>";
                songs_ul.appendChild(li);
            }
        });
    }
};
