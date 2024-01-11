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


module.exports = {
  getUserById,
  getUserByName,
  getAllUsers,
  deleteUser,
  createUser,
  editUser,
  importData,
  getLatestDataByImei
};