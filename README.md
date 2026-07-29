# Overwork

A real-time **multiplayer browser game** with a Node.js backend, Socket.IO sync, and pixel-art office theme.

Players join rooms from a lobby, compete on a shared map with a countdown timer, and see live score updates.

---

## Highlights

| Area | Details |
|------|---------|
| **Realtime** | Socket.IO rooms, lobby broadcast, in-game sync |
| **Backend** | Express + HTTP server |
| **Frontend** | HTML / JS clients under `public/` |
| **Views** | EJS templates |
| **Art** | Custom / pixel assets under `Assets/` |

---

## Features

- Lobby with available rooms
- Create / join multiplayer rooms
- Timed rounds (server-side clock)
- Live player positions and scores
- Pixel-art office sprites and UI assets

---

## Tech stack

- Node.js
- Express
- Socket.IO
- EJS
- Vanilla JavaScript (browser client)

---

## Project structure

```
Overwork/
├── server/           # Express + Socket.IO game server
│   ├── server.js
│   └── package.json
├── public/           # Static client scripts / pages
├── views/            # EJS templates
└── Assets/           # Pixel art and sprites
```

---

## How to run

### Requirements

- Node.js 18+ (recommended)

### Setup

```bash
git clone https://github.com/JerryHung1103/Overwork.git
cd Overwork/server
npm install
npm start
```

Open the game in your browser:

```
http://localhost:8000
```

`npm start` uses `nodemon` so the server reloads on file changes during development.

---

## Notes for recruiters

This project demonstrates fullstack realtime programming: room management, websocket events, shared game state, and a playable client UI — not just a static webpage.

---

## License

Personal / academic project. Assets under `Assets/PixelOffice` retain their original license files where present.
