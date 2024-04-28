var connection = require('./db_connection')

function getUserById(id, callback) {
  const sql = 'SELECT * FROM users WHERE id = ?';
  connection.query(sql, [id], (err, rows) => {
    if (err) throw err;
    callback(rows[0]);
  });
}
function getUserByName(name, callback) {
  const sql = 'SELECT * FROM users WHERE name = ?';
  connection.query(sql, [name], (err, rows) => {
    if (err) throw err;
    callback(rows[0]);
  });
}
function getAllUsers(callback){
  const sql = 'SELECT * FROM users';
  connection.query(sql, (err, rows) => {
    if (err) throw err;
    callback(rows);
  });

}
function deleteUser(id){
  const sql = 'DELETE FROM users WHERE id = ?';
  connection.query(sql, [id], (err, rows) => {
    if (err) throw err;
  });
}

function createUser(username, password, role) {
  const sql = 'INSERT INTO users (name, password, role) VALUES (?, ?, ?)';
  connection.query(sql, [username, password, role], (err, rows) => {
    if (err) throw err;
  });
}

function editUser(id, username, password, role) {
  const sql = `UPDATE users
SET name = ?, password = ?, role = ?
WHERE id = ?;`
connection.query(sql, [username, password, role, id], (err, rows) => {
    if (err) throw err;
  });
}

function importData(data, callback) {
  const sql = `
    INSERT INTO data (
      airtemp, airhum, windspeed, winddirection, atmopres, rainamount, solarrad,
      soilhum1, soilhum2, soiltemp1, soiltemp2, signalval, battery, solar,
      intemp, inhum, inatmopres, imei
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    data.airtemp, data.airhum, data.windspeed, data.winddirection, data.atmopres,
    data.rainamount, data.solarrad, data.soilhum1, data.soilhum2, data.soiltemp1,
    data.soiltemp2, data.signal, data.battery, data.solar, data.intemp, data.inhum,
    data.inatmopres, data.imei
  ];

  connection.query(sql, values, (err, result) => {
    if (err) throw err;
    callback(result);
  });
}


function getLatestDataByImei(imei) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT *
      FROM data
      WHERE imei = ?
      ORDER BY datetime DESC
      LIMIT 1
    `;

    connection.query(sql, [imei], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows[0]);
      }
    });
  });
}

function getAverageAirTempForLastSevenDays(imei, days = 7, avgparam1 = "airtemp", avgparam2="airhum") {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT DATE(datetime) AS date, AVG(${avgparam1}) AS avg_${avgparam1}, AVG(${avgparam2}) AS avg_${avgparam2}
      FROM data
      WHERE imei = ?
        AND datetime >= DATE_SUB(CURDATE(), INTERVAL ${days} DAY)
        AND datetime < DATE(CURDATE())
      GROUP BY DATE(datetime)
      ORDER BY date DESC;
    `;

    connection.query(sql, [imei], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        const result = [];
        const airhumResult = [];
        const dates = [];
        const today = new Date();
        for (let i = 0; i < days; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          const dateString = date.toISOString().split('T')[0];
          
          const matchingRow = rows.find(row => new Date(row.date).toISOString().split('T')[0] === dateString);
          if (matchingRow) {
            result.push(matchingRow.avg_airtemp.toFixed(0));
            airhumResult.push(matchingRow.avg_airhum.toFixed(0));
            dates.push(new Date(dateString).toLocaleDateString('en-GB').split('/').join('.').split('.').slice(0, 2).join('.'));
          } else {
            result.push(0);
            airhumResult.push(0);
            dates.push("00.00");
          }
        }

        const arrAirTemp = [result[0], ...result.slice(1, -1).reduce((acc, curr, index) => {
          if (index < 5) {
              acc.push(curr);
          }
          return acc;
      }, []), result[result.length - 1]];

      const arrAirHum = [airhumResult[0], ...airhumResult.slice(1, -1).reduce((acc, curr, index) => {
          if (index < 5) {
              acc.push(curr);
          }
          return acc;
      }, []), airhumResult[airhumResult.length - 1]];

      const arrDates = [dates[0], ...dates.slice(1, -1).reduce((acc, curr, index) => {
          if (index < 5) {
              acc.push(curr);
          }
          return acc;
      }, []), dates[dates.length - 1]];

        const resultObj = {}
        resultObj[avgparam1] = arrAirTemp
        resultObj[avgparam2] = arrAirHum
        resultObj['dates'] = arrDates
      
        resolve(resultObj);
      }
    });
  });
}

function getLatestDataByImeiAndFieldname(imei, fieldname) {
  console.log("FIELDNAME: " + fieldname)
  return new Promise((resolve, reject) => {
    

    const sql = `
    SELECT 
    AVG(CASE WHEN TIME(datetime) >= '00:00' AND TIME(datetime) < '03:00' THEN ${fieldname} ELSE NULL END) AS avg_00_03,
    AVG(CASE WHEN TIME(datetime) >= '03:00' AND TIME(datetime) < '06:00' THEN ${fieldname} ELSE NULL END) AS avg_03_06,
    AVG(CASE WHEN TIME(datetime) >= '06:00' AND TIME(datetime) < '09:00' THEN ${fieldname} ELSE NULL END) AS avg_06_09,
    AVG(CASE WHEN TIME(datetime) >= '09:00' AND TIME(datetime) < '12:00' THEN ${fieldname} ELSE NULL END) AS avg_09_12,
    AVG(CASE WHEN TIME(datetime) >= '12:00' AND TIME(datetime) < '14:00' THEN ${fieldname} ELSE NULL END) AS avg_12_14,
    AVG(CASE WHEN TIME(datetime) >= '14:00' AND TIME(datetime) < '16:00' THEN ${fieldname} ELSE NULL END) AS avg_14_16,
    AVG(CASE WHEN TIME(datetime) >= '16:00' AND TIME(datetime) < '18:00' THEN ${fieldname} ELSE NULL END) AS avg_16_18,
    AVG(CASE WHEN TIME(datetime) >= '18:00' AND TIME(datetime) < '22:00' THEN ${fieldname} ELSE NULL END) AS avg_18_22,
    AVG(CASE WHEN TIME(datetime) >= '22:00' AND TIME(datetime) < '23:59' THEN ${fieldname} ELSE NULL END) AS avg_22_00
    FROM 
        data
    WHERE 
        DATE(datetime) = CURDATE() - INTERVAL 1 DAY
        AND imei = ?;
    `;

    connection.query(sql, [imei], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        const rowData = rows.map(row => {
          const roundedRow = [];
          roundedRow.push(parseFloat(row.avg_00_03).toFixed(0));
          roundedRow.push(parseFloat(row.avg_03_06).toFixed(0));
          roundedRow.push(parseFloat(row.avg_06_09).toFixed(0));
          roundedRow.push(parseFloat(row.avg_09_12).toFixed(0));
          roundedRow.push(parseFloat(row.avg_12_14).toFixed(0));
          roundedRow.push(parseFloat(row.avg_14_16).toFixed(0));
          roundedRow.push(parseFloat(row.avg_16_18).toFixed(0));
          roundedRow.push(parseFloat(row.avg_18_22).toFixed(0));
          roundedRow.push(parseFloat(row.avg_22_00).toFixed(0));
          return roundedRow;
      });

        
        resolve(rowData);
      }
    });
  });
}

function createSubscriber(endpoint, expirationTime, p256dh_key, auth_key) {
  const sql = 'INSERT INTO subscribers (endpoint, expirationTime, p256dh_key, auth_key) VALUES (?, ?, ?, ?)';
  connection.query(sql, [endpoint, expirationTime, p256dh_key, auth_key], (err, rows) => {
    if (err) throw err;
  });
}
function getSubscribers(callback) {
  const sql = 'SELECT * FROM subscribers ';
  connection.query(sql, (err, rows) => {
    if (err) throw err;
    const remappedArray = rows.map(item => ({
      endpoint: item.endpoint,
      expirationTime: item.expirationTime,
      keys: {
        p256dh: item.p256dh_key,
        auth: item.auth_key
      }
    }));
    callback(remappedArray);
  });
}
function deleteSubscriber(auth_key) {
  const sql = 'DELETE FROM subscribers WHERE auth_key = ?';
  connection.query(sql, [auth_key], (err, rows) => {
    if (err) throw err;
  });
}








module.exports = {
  getUserById,
  getUserByName,
  getAllUsers,
  deleteUser,
  createUser,
  editUser,
  importData,
  getLatestDataByImei,
  getAverageAirTempForLastSevenDays,
  getLatestDataByImeiAndFieldname,
  createSubscriber,
  getSubscribers,
  deleteSubscriber
};