const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const socketIO = require('socket.io');
const http = require('http');
const server = http.createServer(app);
const io = socketIO(server);


app.use("/web", express.static(__dirname + "/web"))
app.use(express.json()); // Добавьте эту строку для разбора тела запроса в формате JSON

app.get("/", (req, res) => {
  res.redirect("/web/html/index.html"); // Перенаправление на страницу "menu.html"
});

app.get("*", (req, res) => {
  console.log(`Запрошенный адрес: ${req.url}`);

  const filePath = req.url.substr(1);
  fs.access(filePath, fs.constants.R_OK, (err) => {
    if (err) {
      res.status(404).send("Resource not found!");
    } else {  

      fs.createReadStream(filePath).pipe(res);
    }
  });
});




const paintedBlocks = [];
const players = [];
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
function random(number1, number2) {
  return Math.floor(Math.random() * (number2 - number1 + 1)) + number1;
}
io.on('connection', function (socket) {

  let o = {
    id: socket.id,
    x: 0, 
    y:0, 
  }
  players.push(o);
  socket.emit("new block",paintedBlocks)
  socket.emit("plr",{g:o,h:players})
    socket.emit("player positions",{p:players})

  socket.on("disconnect", () => {
    const index = players.findIndex(player => player.id === socket.id);
    if (index !== -1) {
      players.splice(index, 1);
      // Отправляем обновленные координаты после отключения игрока
      io.emit("player positions", players);
    }
    
  });
  socket.on("delete", (data) => {
    const index = paintedBlocks.findIndex(o => o.id === data);
    if (index !== -1) {
      paintedBlocks.splice(index, 1);
    }
  });
  socket.on("get block",(data) =>{
    
    io.emit("get blocks",paintedBlocks)
  })
  socket.on("delete block",(data) =>{
    
    let p = paintedBlocks.find(o=> o.id===data.id)

    p.state = "fs"
    io.emit("new block",paintedBlocks)
  })
  socket.on("new block",(data) =>{
    paintedBlocks.push(data)
    io.emit("new block",paintedBlocks)
  })
  // Обработчик события "player move"
  socket.on("player move", (data) => {
    // Обновляем позицию игрока
    const player = players.find(player => player.id === socket.id);
    if (player) {
      const newX =  data.x + player.x;
      const newY = data.y + player.y;
      player.x = newX;
      player.y = newY;
      io.emit("player positions", {p:players,h:{x:data.x,y:data.y}} );
    }
  });

});


