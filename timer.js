import EventEmitter from "events";

// Формат даты чч:мм ГГГГ-ММ-ДД

let [time, date] = process.argv.splice(2);

let emitter = new EventEmitter();

let timerSettings = {
  dateFrom: Date.now(),
  dateTo: Date.parse(`${date}T${time}`),
};

emitter.on("start", (payload) => console.log(`Таймер ${payload} запущен!`));
emitter.on("stop", (payload) => console.log(`Таймер ${payload} остановлен!`));
emitter.on("tick", ({ days, hours, minutes, seconds }) =>
  console.log(
    `До выбранной даты осталось: ${days} дней, ${hours} часов, ${minutes} минут, ${seconds} секунд`
  )
);

class Timer {
  constructor({ dateFrom, dateTo }) {
    this.from = dateFrom;
    this.to = dateTo;
  }
  render() {
    let ms = this.to - this.from,
      countdown = {
        seconds: Math.floor((ms / 1000) % 60),
        minutes: Math.floor((ms / (1000 * 60)) % 60),
        hours: Math.floor((ms / (1000 * 60 * 60)) % 24),
        days: Math.floor(ms / (1000 * 60 * 60 * 24)),
      };

    emitter.emit("tick", countdown);
  }
  start() {
    if (this.check()) {
      this.timer = setInterval(() => {
        this.from = Date.now();
        if (this.check()) {
          this.render();
        } else {
          this.stop();
        }
      }, 1000);
      emitter.emit("start", this.timer);
      this.render();
    }
  }
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      emitter.emit("stop", this.timer);
    }
  }
  check() {
    if (this.to && this.to > this.from) {
      return true;
    }

    if (this.to && this.to < this.from) {
      console.log("Дата не может быть меньше текущей!");
    }

    if (!this.to) {
      console.log("Неверный формат даты!");
    }

    return false;
  }
}
let timer = new Timer(timerSettings);

timer.start();
