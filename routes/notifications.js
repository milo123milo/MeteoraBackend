var express = require('express');
var auth = require('./rules/authCheck');
const webpush = require("web-push");
var router = express.Router();
const passport = require('passport');
var pool = require('../database/queries')
const cors = require('cors');
var role = require('./rules/roleCheck')
var connection = require('../database/db_connection')
var cases = require('./cases')




const publicVapidKey =
  "BAABol4lIL0tpSskELBxy8pFcHw-uNFXoD4WfTlwvPuv4Od-FIoKQUl2kDnESPH4flCcGUfCIzZVmNvadOfMNJE";
const privateVapidKey = "vnCicF3cEqJWs7Eeq85mY_OVvsaVe5NeyAu5jUTu-HI";

webpush.setVapidDetails(
  "mailto:test@test.com",
  publicVapidKey,
  privateVapidKey
);





function notfAirTemp() {
      cases.checkTemp3days();
      cases.checkTemp6days();
  
}

function notfAirHum() {}

function notfRain() {}

function notfWind() {}

function notfSoilTemp() {}

function notfSoilHum() {}

function notfOther()  {}


module.exports = {
  notfAirTemp,
  notfAirHum,
  notfRain,
  notfWind,
  notfSoilTemp,
  notfSoilHum,
  notfOther
}