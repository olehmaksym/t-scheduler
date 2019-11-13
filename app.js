const time = document.getElementById('time');
let date = new Date();

class Schedule {
  constructor(interval, startTime, endTime, bus, buses, type) {
    this.bus = bus;
    this.buses = buses;
    this.interval = interval; // minutes
    this.startTime = startTime;
    this.endTime = endTime;
    this.type = type;
  }

  get timeSlots() {
    const timeSlots = [];
    const start = new Date().setHours(this.startTime.h, this.startTime.m, 0, 0);
    const end = new Date().setHours(this.endTime.h, this.endTime.m, 0, 0);
    let now = start;
    let flight = this.bus - 1;

    while (now <= end) {
      flight = flight < this.buses ? ++flight : 1;
      timeSlots.push({ time: new Date(now), flight });
      now = new Date(now).setMinutes(new Date(now).getMinutes() + this.interval);
    }

    return timeSlots;
  }
}

function creteEmptyColumn(q) {
  const columns = [];

  for (let i = 0; i < q; i++) {
    columns.push('<td></td>');
  }

  console.log('columns', columns);
  return columns;
}

function toUserTime(date) {
  return `${date.getHours()}:${date.getMinutes() ? date.getMinutes() : '00' }`
}

function creteTable(schedule) {
  const rows = [];
  const slots = schedule.timeSlots;
  const table = document.getElementById('table');

  const thead = [...Array(schedule.buses).keys()]
    .map(key => `<th>${++key}</th>`)
    .join('');

  while (slots.length) {
    if (slots[0].flight !== 1) {
      rows.push(slots.splice(0, schedule.buses - schedule.bus + 1));
    } else {
      rows.push(slots.splice(0, schedule.buses));
    }
  }

  const mapRow = row => row.map(column => `<td>${toUserTime(column.time)}</td>`);

  const drawTrow = row => {
    let cells = [];

    if (row[0].flight !== 1) {
      cells = creteEmptyColumn(schedule.bus - 1)
    }

    cells = [...cells, ...mapRow(row)];
    return cells.join('');
  };

  const tbody = rows.map(row => `<tr>${drawTrow(row)}</tr>`).join('');
  
  table.innerHTML = `<thead><tr>${thead}</tr></thead><tbody>${tbody}</tbody>`;
}

const SCHEDULE_TYPE = [
  [15, { h: 6, m: 55}, { h: 21, m: 30 }, 7, 8, 'workDay'], // Lviv
  [15, { h: 6, m: 25}, { h: 20, m: 10 }, 1, 8, 'workDay'], // Stavchany
  [24, { h: 7, m: 12}, { h: 21, m: 30 }, 4, 5, 'holiday'], // Lviv
  [24, { h: 7, m: 0}, { h: 20, m: 12 }, 1, 5, 'holiday'], // Stavchany
]

function getScheduleType() {
  const isHoliday = date.getDay() === 0;

  console.log('isHoliday', isHoliday, location.hash);
  if (isHoliday) {
    switch (location.hash) {
      case '#lviv': return SCHEDULE_TYPE[2];
      case '#stavchany': return SCHEDULE_TYPE[3];
    }
  } else {
    switch (location.hash) {
      case '#lviv': return SCHEDULE_TYPE[0];
      case '#stavchany': return SCHEDULE_TYPE[1];
    }
  }
}

function main() {
  if (!location.hash) {
    location.hash = '#lviv';
  }

  console.log('getScheduleType', getScheduleType());

  const schedule = new Schedule(...getScheduleType());

  creteTable(schedule);
}

function updateTime() {
  date = new Date();
  time.innerText = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
}

setInterval(updateTime, 1000);

window.onload = main;
window.addEventListener("hashchange", main);