import fs from "fs";
import path, { dirname, join } from "path";
import http from "http";
import url, { fileURLToPath } from "url";
import { Server as io } from "socket.io";
import { Worker } from "worker_threads";
//ВВОД РЕГУЛЯРКИ ЧЕРЕЗ ПРОБЕЛ node server.js REGEXP, выражение записываем без  слешей и флагов
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const [pattern] = process.argv.splice(2);

const finderREG = (patternFind, pathFile) => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(join(__dirname, "search-worker.js"), {
      workerData: { pattern: patternFind, path: pathFile },
    });
    worker.on("message", resolve);
    worker.on("error", reject);
  });
};

const isFile = (path) => fs.lstatSync(path).isFile();

const app = http.createServer((request, response) => {
  const filePath = join(process.cwd(), request.url.replace(/\[\.\.]/gi, ".."));
  if (!fs.existsSync(filePath)) {
    return response.end("Not found");
  }

  if (isFile(filePath)) {
    if (!pattern) {
      console.log(`Вы не ввели регулярное выражение! Читаем файл ${filePath}`);
    } else {
      finderREG(pattern, filePath)
        .then((result) => console.log(result.result))
        .catch((err) => console.error(err));
    }
    return fs.createReadStream(filePath, "utf8").pipe(response);
  }

  const links = fs
    .readdirSync(filePath)
    .map((filename) => [join(request.url, filename), filename])
    .map(
      ([filepath, filename]) => `<li><a href="${filepath}">${filename}</a></li>`
    )
    .concat([`<li><a href="[..]/">..</a></li>`])
    .join("");

  const html = fs
    .readFileSync(join(__dirname, "index.html"), "utf8")
    .replace(/{{ content }}/gi, links);

  response.writeHead(200, {
    "Content-Type": "text/html",
  });
  response.end(html);
});

const ios = new io(app);
ios.on("connection", function (socket) {
  socket.emit("NEW_CONN_EVENT", {
    msg: `${ios.engine.clientsCount} on connect`,
  });
});

app.listen(3000);
