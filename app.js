class Schedule {
  constructor(interval, bus, startTime, endTime, buses, type) {
    this.bus = bus;
    this.buses = buses;
    this.interval = interval; // minutes
    this.startTime = startTime;
    this.endTime = endTime;
    this.type = type;
  }
}

const time = document.getElementById('time');
let date = new Date();

function updateTime() {
  date = new Date();
  time.innerText = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
}

setInterval(updateTime, 1000);