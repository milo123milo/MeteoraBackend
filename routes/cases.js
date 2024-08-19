var express = require('express');
var auth = require('./rules/authCheck');
const webpush = require("web-push");
var router = express.Router();
const passport = require('passport');
var pool = require('../database/queries')
const cors = require('cors');
var role = require('./rules/roleCheck')
var connection = require('../database/db_connection')

const publicVapidKey =
  "BAABol4lIL0tpSskELBxy8pFcHw-uNFXoD4WfTlwvPuv4Od-FIoKQUl2kDnESPH4flCcGUfCIzZVmNvadOfMNJE";
const privateVapidKey = "vnCicF3cEqJWs7Eeq85mY_OVvsaVe5NeyAu5jUTu-HI";

webpush.setVapidDetails(
  "mailto:test@test.com",
  publicVapidKey,
  privateVapidKey
);

function sendNotf(subs, text) {

    try {
      // Create payload
        // Create payload
  
      const bodyString = text 
      const payload = JSON.stringify({ title: "Meteora Station - ", body: bodyString });
  
      // Loop through subscriptions and send notifications
      subs.forEach(async (subscription) => {
        try {
          await webpush.sendNotification(subscription, payload);
        } catch (error) {
          console.error("Error sending notification:", error);
          // Handle the error as needed, for example, logging it or notifying someone.
        }
      });
  
      //res.status(200).json({ success: true, message: 'Notifications sent successfully' });
    } catch (error) {
      console.error(error);
      //res.status(500).json({ success: false, error: 'Server Error' });
    }
}

function checkTemp3days() {
    const text = "Obiđte maslinjak i razmotrite potrebu za navodnjavanjem."
    const sql = `
    WITH ConsecutiveDays AS (
      SELECT 
        DATE(datetime) AS day, 
        COUNT(*) OVER (ORDER BY DATE(datetime) ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS three_day_count
      FROM data
      WHERE airtemp > 30
      GROUP BY DATE(datetime)
    )
    SELECT 
      CASE 
        WHEN MAX(three_day_count) >= 3 THEN 'true'
        ELSE 'false'
      END AS temperature_check
    FROM ConsecutiveDays;
    `;
    
    connection.query(sql, (err, rows) => {
      if (err) throw err;
      const result = rows[0].temperature_check === 'true';
      console.log("REZULTAT: "+result)
      if(result == true){
        pool.getSubscribers((subscribers) => {
          sendNotf(subscribers, text)
          console.log("SENT NOTF")
        });
      }
      
    });
/* ------------------------------------ */
}
function checkTemp6days() {
    const text = `Visoka temperatura u maslinjaku - primijenite navodnjavanje sistemom kap po kap u plantažnim zasadima ili sistemom zalivanja u ekstenzivnim zasadima.`
    const sql = `
    WITH ConsecutiveDays AS (
      SELECT 
        DATE(datetime) AS day, 
        COUNT(*) OVER (ORDER BY DATE(datetime) ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS three_day_count
      FROM data
      WHERE airtemp > 30
      GROUP BY DATE(datetime)
    )
    SELECT 
      CASE 
        WHEN MAX(three_day_count) >= 6 THEN 'true'
        ELSE 'false'
      END AS temperature_check
    FROM ConsecutiveDays;
    `;
    
    connection.query(sql, (err, rows) => {
      if (err) throw err;
      const result = rows[0].temperature_check === 'true';
      console.log("REZULTAT: "+result)
      if(result == true){
        pool.getSubscribers((subscribers) => {
          sendNotf(subscribers, text)
          console.log("SENT NOTF")
        });
      }
      
    });
/* ------------------------------------ */
}


module.exports = {
    checkTemp3days,
    checkTemp6days
}