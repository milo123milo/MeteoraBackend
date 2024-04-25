const mysql = require('mysql');
const user = require('./root')

// MySQL connection configuration
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: ''
});

// Connect to MySQL
function initDatabase(){
    connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL');

    // Check if 'meteoui' database exists, if not create it
    connection.query('CREATE DATABASE IF NOT EXISTS meteoui', (err) => {
        if (err) throw err;

        // Switch to 'meteoui' database
        connection.changeUser({ database: 'meteoui' }, (err) => {
        if (err) throw err;

        // Check if 'users' table exists, if not create it and add admin user
        const createUsersTable = `
            CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name TEXT NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL
            );
            

            `;
        connection.query(createUsersTable, (err) => {
            if (err) throw err;
            console.log('Users table checked/created');
        });

        const addAdmin = `
        INSERT INTO users (name, password, role) 
        SELECT '${user.user.name}', '${user.user.password}', '${user.user.role}'
        WHERE NOT EXISTS (SELECT * FROM users WHERE name = 'root');`
        connection.query(addAdmin, (err) => {
            if(err) throw err;
            console.log('Root admin user crearted')
        })

        });

        const createDataTable = `
        CREATE TABLE IF NOT EXISTS data (
            id SERIAL PRIMARY KEY,
            airtemp FLOAT,
            airhum FLOAT,
            windspeed FLOAT,
            winddirection FLOAT,
            atmopres FLOAT,
            rainamount FLOAT,
            solarrad FLOAT,
            soilhum1 FLOAT,
            soilhum2 FLOAT,
            soiltemp1 FLOAT,
            soiltemp2 FLOAT,
            signalval FLOAT,
            battery FLOAT,
            solar FLOAT,
            intemp FLOAT,
            inhum FLOAT,
            inatmopres FLOAT,
            imei TEXT,
            datetime TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        `;

    const createSubscribersTable = `
    CREATE TABLE IF NOT EXISTS subscribers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        endpoint TEXT,
        expirationTime TIMESTAMP NULL,
        p256dh_key TEXT,
        auth_key TEXT
    );
    `
    const createIndexImei = 'CREATE INDEX IF NOT EXISTS idx_imei ON data (imei);';
    const createIndexDatetime = 'CREATE INDEX IF NOT EXISTS idx_datetime ON data (datetime);';


        

    connection.query(createDataTable, (err) => {
        if (err) throw err;
        console.log('Data table checked/created');
    });
    connection.query(createSubscribersTable, (err) => {
        if (err) throw err;
        console.log('Subcribers table checked/created');
    });
    connection.query(createIndexImei, (err) => {
        if (err) throw err;
        console.log('Index on imei created/checked');
    });

    connection.query(createIndexDatetime, (err) => {
        if (err) throw err;
        console.log('Index on datetime created/checked');
    });


    });
    });
}

module.exports = {initDatabase}