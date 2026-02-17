
const canvas=document.getElementById("pongCanvas");
const ctx=canvas.getContext("2d");
const FPS=24;
let mode="local";
let state={};

function toggleMode(){
const toggle=document.getElementById("modeToggle");
mode=toggle.checked?"lan":"local";
document.getElementById("modeText").innerText="Mode: "+mode.toUpperCase();
}

function startGame(){
const max=document.getElementById("maxScore").value;
fetch("/start?max="+max);
}

function finishGame(){ fetch("/finish"); }

function fetchState(){
fetch("/state.json")
.then(r=>r.json())
.then(data=>{
state=data;
draw();
updateInfo();
if(state.winner!="") showPopup(state.winner+" venceu!");
});
}

function updateInfo(){
document.getElementById("playerInfo").innerText=
"Player1="+state.p1+" | Player2="+state.p2;
}

function draw(){
ctx.clearRect(0,0,320,240);
ctx.fillStyle="white";
ctx.fillRect(10,state.lY,10,40);
ctx.fillRect(300,state.rY,10,40);
ctx.fillRect(state.bX,state.bY,8,8);
ctx.fillText(state.lS,120,20);
ctx.fillText(state.rS,200,20);
}

function sendLocal(player,delta){
fetch("/input?p="+player+"&d="+delta);
}

function sendLAN(delta){
fetch("/input?d="+delta);
}

document.addEventListener("keydown",e=>{

if(mode==="local"){
if(e.key==="w") sendLocal(1,-6);
if(e.key==="s") sendLocal(1,6);
if(e.key==="ArrowUp") sendLocal(2,-6);
if(e.key==="ArrowDown") sendLocal(2,6);
}

if(mode==="lan"){
if(e.key==="w") sendLAN(-6);
if(e.key==="s") sendLAN(6);
if(e.key==="ArrowUp") sendLAN(-6);
if(e.key==="ArrowDown") sendLAN(6);
}

});

function showPopup(text){
document.getElementById("winnerText").innerText=text;
document.getElementById("popup").classList.remove("hidden");
}

function closePopup(){
document.getElementById("popup").classList.add("hidden");
}

setInterval(fetchState,1000/FPS);
