const socket = io();

const gridContainer = document.getElementById('grid-container');
const block = document.getElementById('block');
const cellSize = 100;
let isMoving = false;
let state = "stone";

const playersMap = [];
const blocksMap = [];

const debounceTime = 200;
let clickTimeout = null;

socket.on("player move", (data) => {
  if (playersMap[data.id]) {
    playersMap[data.id].style.transform = `translate(${data.x}px, ${data.y}px)`;
  }
});

function random(number1, number2) {
  return Math.floor(Math.random() * (number2 - number1 + 1)) + number1;
}

socket.on("player positions", (data) => {
  const f = data.h;
isMoving = true
  data.p.forEach((player) => {
    if (!playersMap[player.id]) {
      const newPlayer = document.createElement("div");
      newPlayer.classList.add("player");
      newPlayer.classList.add("disable");
      document.getElementById("root").appendChild(newPlayer);
      playersMap[player.id] = newPlayer;
    } else {
      const playerRect = playersMap[player.id].getBoundingClientRect();

      socket.emit("get block");

      socket.on("get blocks", (blocksData) => {
        for (const cell of blocksData) {
          if (document.getElementById(cell.id).classList.contains("black")) {
            const blockRect = document.getElementById(cell.id).getBoundingClientRect();

            if (
              playerRect.left + f.x < blockRect.right &&
              playerRect.right + f.x > blockRect.left &&
              playerRect.top + f.y < blockRect.bottom &&
              playerRect.bottom + f.y > blockRect.top
            ) {
              isMoving = false
              return;
            }
          }
        }

        playersMap[player.id].style.transform = `translate(${player.x}px, ${player.y}px)`;
        isMoving = true
      });
    }
  });
});

for (let i = 0; i < 1000; i++) {
  const cell = document.createElement('div');
  cell.classList.add('cell');
  cell.id = "block_" + i;
  gridContainer.appendChild(cell);
}

function moveBlock(x = 0, y = 0) {
if (isMoving) {

    socket.emit("player move", { x, y });
}

}


let u = 2;

// Event listener for keyboard input
document.addEventListener('keydown', function(event) {


  
  switch (event.key) {
    case 'w':
    case 'W':
      moveBlock(0, -cellSize-u); // Move up by one cell size
      break;
    case 'a':
    case 'A':
      moveBlock(-cellSize-u, 0); // Move left by one cell size
      break;
    case 's':
    case 'S':
      moveBlock(0, cellSize+u); // Move down by one cell size
      break;
    case 'd':
    case 'D':
      moveBlock(cellSize+u, 0); // Move right by one cell size
      break;
  
}

});


socket.on("new block", (data)=>{
  
  data.forEach((p)=>{    
     if (p.state==="stone") {
      
    document.getElementById(p.id).style= "background-color: grey !important"
    document.getElementById(p.id).classList.add("black")

    }
    else if (p.state === "wood"){
    document.getElementById(p.id).style= "background-color: rgb(77, 57, 57) !important"
    document.getElementById(p.id).classList.add("black")

    }
    else if (p.state === "fs") {

      document.getElementById(p.id).style= "background-color: none !important"
    document.getElementById(p.id).classList.remove("black")
  socket.emit("delete",p.id)

    }
   })
  
})
document.addEventListener("click", (event) => {
  const clickedElement = event.target;
  
  if (!clickedElement.classList.contains('disable')) { 
    if (clickedElement.classList.contains('black')) {

      
  socket.emit("delete block",{id:clickedElement.id,state:state})
    } else {
      
  socket.emit("new block",{id:clickedElement.id,state:state})
  }
}
});
