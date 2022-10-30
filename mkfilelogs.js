import * as readline from "node:readline";
import * as fs from "fs";

const FILE_LOG = "./file/access_tmp.log";

async function processLineByLine() {
  const fileStream = fs.createReadStream(FILE_LOG);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    if (/89.123.1.41/i.test(line)) {
      await fs.appendFile(
        "./file/89.123.1.41_requests.log",
        line + "\n",
        (err) => {
          if (err) console.log(data);
        }
      );
    } else if (/34.48.240.111/i.test(line)) {
      await fs.appendFile(
        "./file/34.48.240.111_requests.log",
        line + "\n",
        (err) => {
          if (err) console.log(data);
        }
      );
    }
  }
}

processLineByLine();
