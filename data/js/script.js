
const canvas = document.getElementById("pongCanvas");
const ctx = canvas.getContext("2d");
const FPS = 24;
let mode = "local";
let state = {};
let myIP = "";

function setMode(m) {
  mode = m;
}

function fetchState() {
  fetch("/state.json")
    .then(r => r.json())
    .then(data => {
      state = data;
      draw();

      myIP = location.hostname;

      document.getElementById("playerInfo").innerText =
        "Player 1 = " + state.p1 + " | Player 2 = " + state.p2 +
        " | You = " + myIP;
    });
}

function draw() {
  ctx.clearRect(0, 0, 320, 240);
  ctx.fillStyle = "white";

  ctx.fillRect(10, state.lY, 10, 40);
  ctx.fillRect(300, state.rY, 10, 40);
  ctx.fillRect(state.bX, state.bY, 8, 8);

  ctx.fillText(state.lS, 120, 20);
  ctx.fillText(state.rS, 200, 20);
}

function send(delta) {
  fetch(`/input?d=${delta}`);
}

document.addEventListener("keydown", e => {

  if (mode === "local") {
    if (e.key === "w") send(-6);
    if (e.key === "s") send(6);
    if (e.key === "ArrowUp") send(-6);
    if (e.key === "ArrowDown") send(6);
  }

  if (mode === "lan") {
    if (myIP === state.p1) {
      if (e.key === "w") send(-6);
      if (e.key === "s") send(6);
    }
    if (myIP === state.p2) {
      if (e.key === "ArrowUp") send(-6);
      if (e.key === "ArrowDown") send(6);
    }
  }
});

setInterval(fetchState, 1000 / FPS);
