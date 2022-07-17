const { SerialPort, Readline } = require('serialport')
const { ReadlineParser } = require('@serialport/parser-readline')
const Table = require("cli-table3");
const port = new SerialPort({
  path: '/dev/ttyUSB0',
  baudRate: 9600,
  autoOpen: false,
})

let tables = {};
port.open(function (err) {
  if (err) {
    return console.log('Error opening port: ', err.message)
  }

  // Because there's no callback to write, write errors will be emitted on the port:
  port.write('main screen turn on')
})

// The open event is always emitted
port.on('open', function () {
  // open logic
  console.log("Opened");
})
// Read data that is available but keep the stream in "paused mode"
port.on('readable', function () {
  port.read();
  // console.log('Data:', port.read())
})

// Switches the port into "flowing mode"
port.on('data', function (data) {
  // console.log('Data:', data)
})

// Pipe the data into another stream (like a parser or standard out)
const lineStream = port.pipe(new ReadlineParser({
  delimiter: "\r\n"
})
)

function createTable(header, data) {
  let table = new Table({
    head: header,
    style: {
      head: ["blue"]
    }
  });
  table.push(data);
  return table.toString();
}
function draw() {
  console.clear();
  // console.log(tables);
  let keys = Object.keys(tables);
  keys.forEach((element) => {
    if(tables[element].hasOwnProperty("data"))
      console.log(createTable(tables[element].header, tables[element].data));

  })
}
lineStream.on("data", (data) => {
  data = data.replace(/[^\w\s,.#]/gi, "").replace("\n","");
  let incommingArray = data.split(",");
  // console.log(data);
  if (!tables.hasOwnProperty(incommingArray[0]) && incommingArray[0].length >= 1) {
    tables[incommingArray[0]] = {};
    tables[incommingArray[0]].header = incommingArray;
    // tables[incommingArray[0]].header[0] = "ID";
  }
  else if (tables.hasOwnProperty(incommingArray[0])) {
    tables[incommingArray[0]].data = incommingArray;
    draw();
  }
  // console.log(data)
});