import fs from "fs";
import path from "path";
import inquirer from "inquirer";

let currentDirectory = process.cwd();

inquirer
  .prompt([
    {
      name: "changeDir",
      type: "confirm",
      message: `Остаться в текущей директории? ${currentDirectory}`,
    },
  ])
  .then((answer) => {
    if (answer.changeDir) {
      cdf(currentDirectory);
    } else {
      inquirer
        .prompt([
          {
            name: "dirPath",
            type: "input",
            message: "Введите желаемую директорию:",
          },
        ])
        .then((answer) => {
          currentDirectory = getPath(answer.dirPath);
          cdf(currentDirectory);
        });
    }
  });

function ls(paths) {
  return fs.readdirSync(paths);
}

function isFile(name) {
  return fs.lstatSync(getPath(name)).isFile();
}

function getPath(name) {
  return path.resolve(currentDirectory, name);
}

function cdf(paths) {
  inquirer
    .prompt([
      {
        name: "fileName",
        type: "list",
        message: "Выберите файл или папку:",
        choices: ls(paths),
      },
    ])
    .then((answer) => {
      if (isFile(answer.fileName)) {
        inquirer
          .prompt([
            {
              name: "pattern",
              type: "input",
              message: "Введите регулярное выражение без флагов и слешей:",
            },
          ])
          .then((finder) => {
            if (!finder.pattern) {
              console.log(
                `Вы не ввели регулярное выражение! Читаем файл ${answer.fileName}`
              );
              fs.readFile(getPath(answer.fileName), "utf8", (err, data) => {
                console.log(data);
              });
            } else {
              fs.readFile(getPath(answer.fileName), "utf8", (err, data) => {
                let result = data.match(new RegExp(finder.pattern, "g"));
                console.log(data);
                result !== null
                  ? console.log(`Найдено ${result.length} совпадений`)
                  : console.log("Совпадений не найдено!");
              });
            }
          });
      } else {
        currentDirectory = getPath(answer.fileName);
        cdf(currentDirectory);
      }
    });
}
