class Schedule {
  constructor(interval, startTime, endTime, bus, buses, type, extraSlots = []) {
    this.bus = bus;
    this.buses = buses;
    this.interval = interval; // minutes
    this.startTime = startTime;
    this.endTime = endTime;
    this.type = type;
    this.extraSlots = extraSlots;
  }

  get timeSlots() {
    const timeSlots = [];
    const start = new Date().setHours(this.startTime.h, this.startTime.m, 0, 0);
    const end = new Date().setHours(this.endTime.h, this.endTime.m, 0, 0);
    let now = start;
    let flight = this.bus - 1;

    while (now <= end) {
      flight = flight < this.buses ? ++flight : 1;
      timeSlots.push({ time: now, flight });
      now = new Date(now).setMinutes(new Date(now).getMinutes() + this.interval);
    }

    if (this.extraSlots.length) {
      this.extraSlots.forEach(slot => {
        flight = flight < this.buses ? ++flight : 1;
        timeSlots.push({ time: new Date().setHours(slot.h, slot.m, 0, 0), flight })
      })
    }

    return timeSlots;
  }
}

const SCHEDULE_TYPE = [
  [15, { h: 6, m: 55}, { h: 20, m: 40 }, 7, 8, 'workDay', [{ h: 21, m: 0 }, { h: 21, m: 30 }]], // Lviv
  [15, { h: 6, m: 25}, { h: 20, m: 10 }, 1, 8, 'workDay'], // Stavchany
  [24, { h: 7, m: 12}, { h: 20, m: 0 }, 4, 5, 'holiday', [{ h: 20, m: 30 }, { h: 21, m: 0 }, { h: 21, m: 30 }]], // Lviv
  [24, { h: 7, m: 0}, { h: 20, m: 12 }, 1, 5, 'holiday'], // Stavchany
];

let DATE = new Date();
let SCHEDULE = null;
let IS_HOLIDAY = DATE.getDay() === 0 || DATE.getDay() === 6;

document.getElementById("checkbox").checked = IS_HOLIDAY;

function setHoliday(e) {
  IS_HOLIDAY = e.checked;
  changeDestination();
}

function getScheduleType() {
  if (IS_HOLIDAY) {
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

function creteEmptyColumn(q) {
  const columns = [];

  for (let i = 0; i < q; i++) {
    columns.push('<td></td>');
  }

  return columns;
}

function toUserTime(date) {
  const time = new Date(date);
  return `${time.getHours()}:${time.getMinutes() ? time.getMinutes() : '00' }`
}

function creteTable() {
  const schedule = SCHEDULE;
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

function findBus() {
  const schedule = SCHEDULE;
  const lastElm = document.querySelector('.last');
  const nextElm = document.querySelector('.next');
  const nextIndex = schedule.timeSlots.findIndex(slot => slot.time > DATE);

  if (nextIndex !== -1) {
    const last = schedule.timeSlots[nextIndex - 1];
    const next = schedule.timeSlots[nextIndex];
  
    lastElm.innerHTML = `
      <time>${toUserTime(last.time)}</time>
      <b>${last.flight}</b>`;
    nextElm.innerHTML = `
      <time>${toUserTime(next.time)}</time>
      <b>${next.flight}</b>`;
  } else {
    lastElm.innerHTML = `<time>00:00</time>`;
    nextElm.innerHTML = `<time>00:00</time>`;
  }
}

function main() {
  if (!location.hash) {
    location.hash = '#lviv';
  }

  SCHEDULE = new Schedule(...getScheduleType());

  setInterval(findBus, 60 * 1000);
  findBus();
  creteTable();
}

function changeDestination() {
  SCHEDULE = new Schedule(...getScheduleType());

  findBus();
  creteTable()
}

function updateTime() {
  const time = document.getElementById('time');

  DATE = new Date();
  time.innerText = `${DATE.toLocaleTimeString()}`;
}

setInterval(updateTime, 1000);

window.onload = main;
window.addEventListener("hashchange", changeDestination);