var express = require('express');
var auth = require('./rules/authCheck');
var router = express.Router();
const passport = require('passport');

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

router.post('/uploadData', (req, res) => {
  // Print the received data
  console.log('Received POST data:', req.body);

  // Send a response (you can customize this as needed)
  res.status(200).send('Data received successfully');
});

router.post('/getStationData/:id', checkSession, (req, res) => {
  const id = req.params.id;
  const user = req.user
  

  var data = {
    "stationID": "Station1",
    "airTemp": "25.5 °C",
    "airHumi": "19.1 %",
    "windSpeed": "5 km/h",
    "windDirection": "20° North",
    "airPressure": "1010 hPa",
    "rainAmount": "12.27 mm",
    "irradiation": "1500 kW/m²",
    "SH1": "25%",
    "SH2": "23%",
    "SHA": "24%", // Mora zaokruzeno na INT
    "ST1": "15.5 °C",
    "ST2": "17.5 °C",
    "STA": "16 °C", // Mora zaokruzeno na INT
    "L7DA":  [ {
      "name": "Temperature",
      "data": [22, 21, 24, 20, 19, 21, 23],

    },
    {
      "name": "Humdity",
      "data": [12, 11, 13, 10, 14, 11, 10],
    }, 
    {
      "categories": [
        "21.11",
        "22.11",
        "23.11",
        "24.11",
        "25.11",
        "26.11",
        "27.11"
      ]
    },
    ],
    "L24H": {
      "categories": ["2021-12-01", "2021-12-02", "2021-12-03", "2021-12-04", "2021-12-05", "2021-12-06", "2021-12-07", "2021-12-07", "2021-12-07"],
      "series": [
        {
          "name": "Temperature °C",
          "data": [30, 25, 40, 10, 23, 17, 18, 20, 22],
        }
      ],
      "OtherAverage": {
        "Humidity": "30 %", // Replace with the actual average value
        "Wind": "3 km/h", // Replace with the actual average value
        "Pressure": "1080 hPa", // Replace with the actual average value
        "Rain": "12.01 mm" // Replace with the actual average value
      }
    },
    "systemData": {
      "Online": false,
      "Signal": {
        "status": "-",
        "value": "80 %"
      },
      "Battery": {
        "status": "11.9 V",
        "value": "87 %"
      },
      "Solar": {
        "status": "12.6 V",
        "value": "80 %"
      },
      "Temperature": {
        "status": "-",
        "value": "25 °C"
      },
      "Humidity": {
        "status": "-",
        "value": "30 %"
      },
      "Pressure": {
        "status": "-",
        "value": "1080 hPa"
      },
    }


  }

  if(id !== "Station1"){
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
