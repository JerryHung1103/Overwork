const socket = io();
let canvas=document.getElementById('canvas');
let ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled=false;
let cvw=1600;
let cvh=700;
canvas.width=1600;
canvas.height=700;


const playerWidth=240/10;
const playerHeight = 200/8;
let playerImg=new Image();
// let boxImg=new Image();
let first=true;
let socketID;

playerImg.onload=()=>{
        requestAnimationFrame(drawAnimation);
}


playerImg.src= '/image/player_sprite.png'

let PlayerArray=[];


function updatePlayer(players){
    let array=[];
    players.forEach(d=>{
        array.push( {id: d.id, player:Player(ctx,playerImg,playerWidth,playerHeight,d.x,d.y,3,20, 'stayFront')})
    })
    return array;
}
socket.on('addPlayer',(id)=>{
    
    if(first==true){
        socketID=id;
        socket.emit('constructPlayer',{id:socketID, x: Math.floor(Math.random() * 500), y:Math.floor(Math.random() * 500)})
        first=false;
    }
    console.log(socketID);
})


socket.on('updatePlayer',players=>{
    PlayerArray=updatePlayer(players);
})


 
function drawAnimation(now){
    ctx.clearRect(0,0,cvw,cvh)
    PlayerArray.forEach(d=>d.player.update(now))
    PlayerArray.forEach(d=>d.player.draw())
    requestAnimationFrame(drawAnimation);
}

document.addEventListener('keydown',event=>{
    let keycode=event.keyCode;
    switch(keycode){
        case 68:
            socket.emit('move','right');
            break;
        case 65:
            socket.emit('move','left');
            break;
        case 87:
            socket.emit('move','up');
            break;
        case 83:
            socket.emit('move','front');
            break;
    }
});


socket.on('moveByID_right',id=>{
    PlayerArray.filter(d=>d.id==id).forEach(d=>d.player.moveRight());
})
socket.on('moveByID_left',id=>{
    PlayerArray.filter(d=>d.id==id).forEach(d=>d.player.moveLeft());
})
socket.on('moveByID_up',id=>{
    PlayerArray.filter(d=>d.id==id).forEach(d=>d.player.moveUp());
})
socket.on('moveByID_front',id=>{
    PlayerArray.filter(d=>d.id==id).forEach(d=>d.player.moveFront());
})

document.addEventListener('keyup',event=>{
    let keycode=event.keyCode;
    switch(keycode){
        case 83: case 87:  case 65: case 68:socket.emit('stop','');     
    }
});

socket.on('stopByID',id=>{
    PlayerArray.filter(d=>d.id==id).forEach(d=>d.player.stop());
})

