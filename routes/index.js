var express = require('express');
var auth = require('./rules/authCheck');
var router = express.Router();
const passport = require('passport');
var pool = require('../database/queries')

const sampleData = {
  airtemp: 25.5,
  airhum: 60,
  windspeed: 15,
  winddirection: 180,
  atmopres: 1015,
  rainamount: 5.5,
  solarrad: 800,
  soilhum1: 40,
  soilhum2: 35,
  soiltemp1: 22,
  soiltemp2: 20,
  signal: 80,
  battery: 90,
  solar: 12,
  intemp: 22.5,
  inhum: 55,
  inatmopres: 1010,
  imei: '123456789012345'
};

const realSampleData = {
  "common_list":[
     {
        "id":"0x02",
        "val":"21.0",
        "unit":"C"
     },
     {
        "id":"0x07",
        "val":"53%"
     },
     {
        "id":"3",
        "val":"21.0",
        "unit":"C"
     },
     {
        "id":"0x05",
        "val":"21.0",
        "unit":"C"
     },
     {
        "id":"0x03",
        "val":"11.1",
        "unit":"C"
     },
     {
        "id":"0x04",
        "val":"21.0",
        "unit":"C"
     },
     {
        "id":"0x0B",
        "val":"0.0 m/s"
     },
     {
        "id":"0x0C",
        "val":"0.0 m/s"
     },
     {
        "id":"0x19",
        "val":"2.0 m/s"
     },
     {
        "id":"0x15",
        "val":"0.13 W/m2"
     },
     {
        "id":"0x17",
        "val":"0"
     },
     {
        "id":"0x0A",
        "val":"2"
     }
  ],
  "rain":[
     {
        "id":"0x0D",
        "val":"0.5 mm"
     },
     {
        "id":"0x0E",
        "val":"0.0 mm/Hr"
     },
     {
        "id":"0x10",
        "val":"0.5 mm"
     },
     {
        "id":"0x11",
        "val":"0.5 mm"
     },
     {
        "id":"0x12",
        "val":"0.5 mm"
     },
     {
        "id":"0x13",
        "val":"0.5 mm",
        "battery":"0"
     }
  ],
  "wh25":[
     {
        "intemp":"21.6",
        "unit":"C",
        "inhumi":"49%",
        "abs":"1024.0 hPa",
        "rel":"1024.0 hPa"
     }
  ],
  "signal":"AT+CSQ +CSQ: 25,99 OK",
  "imei":"AT+GSN 1010100001 OK",
  "battery":"1",
  "spanel":"1",
  "sht1":"1",
  "sht2":"1" }

function getItemValueById(array, id) {
    const item = array.find(item => item.id === id);
    return item ? item.val : null;
}

function windDirection(degrees) {
  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

function getLast7Days() {
  const today = new Date();
  const result = [];

  // Start from yesterday and go back 7 days
  for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      result.push(dateString);
  }

  return result.reverse();
}
function convertToReadableDate(dateString) {
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', timeZoneName: 'short' };
  return date.toLocaleDateString('en-US', options);
}
function calculateAverage(row) {
  const sum = row.reduce((acc, value) => acc + parseFloat(value), 0);
  return sum / row.length;
}
function isDataOlderThanThreeHours(data) {
  const currentTime = new Date();
  
  const dataTime = new Date(data.datetime);

  const timeDifference = currentTime - dataTime;
  const threeHoursInMilliseconds = 3 * 60 * 60 * 1000;

  if (timeDifference > threeHoursInMilliseconds) {
      return true;
  } else {
      return false;
  }
}

/* GET home page. */
router.get('/', auth.done, function(req, res, next) {
  return res.render('front', { name: req.user.name, role: req.user.role });
   
 });

router.get('/settings', auth.done, function(req, res, next) {
 return res.render('index', { name: req.user.name, role: req.user.role });
  
});

router.get('/login', auth.not, function(req, res, next) {
 return res.render('login', { title: 'Login' });
});



router.post('/login', auth.not, passport.authenticate('local', {
  failureFlash: true,
}), (req, res, next) => {
  const sessionID = req.sessionID;

  const username = req.user; // Access the username

  // Log the username to the console
  console.log('User logged in:', username);

  // Successful login response
  return res.status(200).json({ sessionID, message: 'Login successful' });
});

router.get('/logout', auth.done, function(req, res) {
  req.logOut(function(err) {
    if (err) {
      return next(err);
    }
   return res.redirect('/login');
  });
});

const checkSession = (req, res, next) => {
  if (req.session && req.sessionID) {
    // Session is valid
    return next();
  } else {
    // Session is not valid
    return res.status(401).json({ message: 'Invalid session ID' });
  }
};

// Route to check session validity
router.post('/check-session', checkSession, (req, res) => {
  res.status(200).json({ message: 'Session is valid' });
});

function rawBody(req, res, next) {
  req.setEncoding('utf8');
  req.rawBody = '';
  req.on('data', function(chunk) {
    req.rawBody += chunk;
  });
  req.on('end', function(){
    next();
  });
}

router.post('/uploadData', rawBody, (req, res) => {

  
  //const base64Json = req.params.values;



  //console.log(req.params.values)
  const jsonString = req.rawBody;
  

  const modifiedString = decodeURIComponent(jsonString);



 

  //console.log(modifiedString)
 
  const jsonObject = JSON.parse(modifiedString);

  const recivedData = jsonObject

  console.log(recivedData)


  const adaptedData = {}

  adaptedData.airtemp = getItemValueById(recivedData.commonlist, "0x02").replace(/[^\d.]/g, '')
  adaptedData.airhum = getItemValueById(recivedData.commonlist, "0x07").replace(/[^\d.]/g, '')
  adaptedData.windspeed = getItemValueById(recivedData.commonlist, "0x0B").replace(/[^\d.]/g, '')
  adaptedData.winddirection = getItemValueById(recivedData.commonlist, "0x0A") .replace(/[^\d.]/g, '')
  adaptedData.rainamount = getItemValueById(recivedData.rain, "0x0D").replace(/[^\d.]/g, '')
  adaptedData.solarrad = getItemValueById(recivedData.commonlist, "0x15").replace(/[^\d.]/g, '')
  adaptedData.atmopres = recivedData.wh25[0].abs.replace(/[^\d.]/g, '')

  adaptedData.soilhum1 = recivedData.sht1.match(/\d+\.\d+$/)[0]; //treba parsovati
  adaptedData.soilhum2 = recivedData.sht2.match(/\d+\.\d+$/)[0]; //
  adaptedData.soiltemp1 = recivedData.sht1.match(/^\d+\.\d+/)[0]; //
  adaptedData.soiltemp2 = recivedData.sht2.match(/^\d+\.\d+/)[0]; // ova cetri

  const parseSignal = recivedData.signal.replace(/AT\+CSQ|\+CSQ:|OK/g, '') ;
  adaptedData.signal =  parseSignal.match(/\d{2},\d{2}/)?.[0].replace(/,/g, '.') || "0" // ; //replace(/[^\d,]/g, '').replace(/,/g, '.') 
  adaptedData.signal =  /^\d.+$/.test(adaptedData.signal) ? adaptedData.signal : '0'

  adaptedData.battery = recivedData.battery
  adaptedData.solar = recivedData.spanel
  adaptedData.intemp = recivedData.wh25[0].intemp
  adaptedData.inhum = recivedData.wh25[0].inhumi.replace(/[^\d.]/g, '')
  adaptedData.inatmopres = recivedData.wh25[0].abs.replace(/[^\d.]/g, '')

  adaptedData.imei =  recivedData.imei.match(/\d{15}/)?.[0] || "0";//replace(/^AT\+GSN\s+| OK$/g, '') 
  adaptedData.imei =  /^\d+$/.test(adaptedData.imei) ? adaptedData.imei : '0'


  console.log(adaptedData)


  pool.importData(adaptedData, (err, result) => {
    console.log(result)
  })
  // Print the received data
  //console.log('Received POST data:', req.rawBody);

 

  // Send a response (you can customize this as needed)
  res.status(200).send('Data received successfully');
});

router.post('/getStationData/:id',/* checkSession ,*/ async (req, res) => {
  const id = req.params.id;
  const user = req.user;
  const days30 = req.body.days30
  var daysavg = 7

  const param7days = req.body.param7days !== undefined && req.body.param7days.trim() !== "" ? req.body.param7days : "airtemp";

  const paramNamesList = [{"airtemp": "Temperature °C"}, {"airhum": "Humidity %"}, 
                     {"windspeed": "Wind km/h"},  {"rainamount": "Rain mm"}]

  const paramList = ["airtemp", "airhum", "windspeed", "rainamount"];   

  const isValidParam = paramList.includes(param7days);
  if (!isValidParam) {
    console.log(`${param7days} is not a valid parameter.`);
    // Set param7days to "airhum" if it's not a valid parameter
    param7days = "airhum";
  }

  const paramName = paramNamesList.find(param => param[param7days])


  console.log(paramName[param7days])
  
  const stations = {
    "Station1": "868715034997472",
    "Station2": "868715034997514",
    "Station3": "868715034924559",
    "Station4": "868715034995740",
  }

  console.log(days30)
  if(days30 == 'true'){
    daysavg = 30;
    console.log("Oujes")
  }

  
  const dataStation = await pool.getLatestDataByImei(stations[id])

  const avg7days = await pool.getAverageAirTempForLastSevenDays(stations[id], daysavg)

  console.log(avg7days)

  const avg24h = await pool.getLatestDataByImeiAndFieldname(stations[id], param7days)


  const humRow = await pool.getLatestDataByImeiAndFieldname(stations[id], "airhum")
  const hum24h = calculateAverage(humRow[0]).toFixed(0)

  const windRow = await pool.getLatestDataByImeiAndFieldname(stations[id], "windspeed")
  const wind24h = calculateAverage(windRow[0]).toFixed(2)

  const atmoRow = await pool.getLatestDataByImeiAndFieldname(stations[id], "atmopres")
  const atmo24h = calculateAverage(atmoRow[0]).toFixed(0)

  const rainRow = await pool.getLatestDataByImeiAndFieldname(stations[id], "rainamount")
  const rain24h = calculateAverage(rainRow[0]).toFixed(2)

 
  
  
  var data = {
    "datetime": convertToReadableDate(dataStation.datetime),
    "stationID": id,
    "airTemp": dataStation.airtemp + " °C",
    "airHumi": dataStation.airhum + " %",
    "windSpeed": dataStation.windspeed + " km/h",
    "windDirection": dataStation.winddirection  + "° " + windDirection(dataStation.winddirection), //kako strana svijeta?
    "airPressure": dataStation.atmopres + " hPa",
    "rainAmount": dataStation.rainamount + " mm",
    "irradiation": dataStation.solarrad*1000 + " kW/m²", //vjv treba W/m kvadratni
    "SH1": dataStation.soilhum1 + "%",
    "SH2": dataStation.soilhum2 + "%",
    "SHA": ((dataStation.soilhum1 + dataStation.soilhum2)/2.0).toFixed(0) + "%", // Mora zaokruzeno na INT prosjek
    "ST1": dataStation.soiltemp1 + " °C",
    "ST2": dataStation.soiltemp2 + " °C",
    "STA": ((dataStation.soiltemp1 + dataStation.soiltemp2)/2.0).toFixed(0) + " °C", // Mora zaokruzeno na INT
    "L7DA":  [ {
      "name": "Temperature",
      "data": avg7days.airtemp,

    },
    {
      "name": "Humdity",
      "data": avg7days.airhum,
    }, 
    {
      "categories": avg7days.dates,
    },
    ],
    "L24H": {
      "categories": ["00:00h", "03:00h", "06:00h", "09:00h", "12:00h", "14:00h", "16:00h", "19:00h", "22:00h"],
      "series": [
        {
          "name": paramName[param7days],
          "data": avg24h[0],
        }
      ],
      "OtherAverage": {
        "Humidity": hum24h + " %", // Replace with the actual average value
        "Wind": wind24h + " km/h", // Replace with the actual average value
        "Pressure": atmo24h + " hPa", // Replace with the actual average value
        "Rain": rain24h + " mm" // Replace with the actual average value
      }
    },
    "systemData": {
      "Online": !isDataOlderThanThreeHours(dataStation),
      "Signal": {
        "status": "-",
        "value": ((dataStation.signalval * 100)/35).toFixed(1) + " %"
      },
      "Battery": {
        "status": dataStation.battery + " V",
        "value": (dataStation.battery < 11.5) ? "0 %" : (((dataStation.battery - 11.5) * 100) / (13 - 11.5)).toFixed(1) + " %"
      },
      "Solar": {
        "status": dataStation.solar + " V",
        "value": (((dataStation.solar) / 18) * 100).toFixed(1) + " %"
      },
      "Temperature": {
        "status": "-",
        "value": dataStation.intemp + " °C"
      },
      "Humidity": {
        "status": "-",
        "value": dataStation.inhum + " %"
      },
      "Pressure": {
        "status": "-",
        "value": dataStation.inatmopres  + " hPa"
      },
    }


  }



  
  

  if(id === undefined){
    data  =  {
      "stationID": "",
      "airTemp": "",
      "airHumi": "",
      "windSpeed": "",
      "windDirection": "",
      "airPressure": "",
      "rainAmount": "",
      "irradiation": "",
      "SH1": "",
      "SH2": "",
      "SHA": "",
      "ST1": "",
      "ST2": "",
      "STA": "",
      "L7DA":  [ {
        "name": "Temperature",
        "data": [0, 0, 0, 0, 0, 0, 0],
        "categories": ["2021-11-21", "2021-11-22", "2021-11-23", "2021-11-24", "2021-11-25", "2021-11-26", "2021-11-27"],
      },
      {
        "name": "Humdity",
        "data": [0, 0, 0, 0, 0, 0, 0],
      }]
  
    }
  }
  
  res.json(data);
});



module.exports = router;
