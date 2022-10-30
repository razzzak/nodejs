import { workerData, parentPort } from "worker_threads";
import fs from "fs";
import path, { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (
  fs.lstatSync(workerData.path).isFile() &&
  path.extname(workerData.path) !== ".ico"
) {
  fs.readFile(workerData.path, "utf8", (err, data) => {
    if (err) {
      console.log(err);
    } else {
      let result = data.match(new RegExp(workerData.pattern, "g"));
      if (result !== null) {
        parentPort.postMessage({
          result: `Найдено ${result.length} совпадений`,
        });
      } else {
        parentPort.postMessage({
          result: "Совпадений не найдено!",
        });
      }
    }
  });
}
