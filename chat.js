import http from "http";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { Server as io } from "socket.io";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = http.createServer((request, response) => {
  if (request.method === "GET") {
    const filePath = path.join(__dirname, "chats.html");
    const readStream = fs.createReadStream(filePath);
    readStream.pipe(response);
  } else if (request.method === "POST") {
    let data = "";
    request.on("data", (chunk) => {
      data += chunk;
    });
    request.on("end", () => {
      const parsedData = JSON.parse(data);
      console.log(parsedData);
      response.writeHead(200, { "Content-Type": "json" });
      response.end(data);
    });
  } else {
    response.statusCode = 405;
    response.end();
  }
});

const ios = new io(app);
let name;
ios.on("connection", function (socket) {
  //console.log(socket);
  name = `Client${Math.ceil(Math.random() * 100)}`;
  console.log("New connection");

  socket.broadcast.emit("NEW_CONN_EVENT", {
    msg: `${name} connected`,
  });

  socket.on("CLIENT_MSG", (data) => {
    socket.emit("SERVER_MSG", { name: name, msg: data.msg });
    socket.broadcast.emit("SERVER_MSG", { name: name, msg: data.msg });
  });
  socket.on("disconnect", (reason) => {
    socket.broadcast.emit("NEW_CONN_EVENT", { msg: `${name} is disconnect` });
  });
});
app.listen(3000, "localhost");
