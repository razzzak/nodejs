import fs from "fs";
import path, { dirname, join } from "path";
import http from "http";
import url, { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isFile = (path) => fs.lstatSync(path).isFile();

(async () => {
  http
    .createServer((request, response) => {
      const filePath = join(
        process.cwd(),
        request.url.replace(/\[\.\.]/gi, "..")
      );
      if (!fs.existsSync(filePath)) {
        return response.end("Not found");
      }

      if (isFile(filePath)) {
        return fs.createReadStream(filePath, "utf8").pipe(response);
      }

      const links = fs
        .readdirSync(filePath)
        .map((filename) => [join(request.url, filename), filename])
        .map(
          ([filepath, filename]) =>
            `<li><a href="${filepath}">${filename}</a></li>`
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
    })
    .listen(3000);
})();
