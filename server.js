/**
 * Hydro-IOT - Node/Express Server with MySQL database integration
 * 
 * Instructions to run:
 * 1. Initialize npm in the workspace: npm init -y
 * 2. Install dependencies: npm install express mysql2 dotenv cors
 * 3. Configure your database details in a .env file:
 *    DB_HOST=localhost
 *    DB_USER=root
 *    DB_PASSWORD=your_password
 *    DB_NAME=hydro_iot
 *    PORT=5000
 * 4. Run database.sql inside your MySQL database.
 * 5. Run server: node server.js
 */

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL Database Connection Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hydro_iot',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to MySQL Database:', err.message);
        console.log('Ensure MySQL is running and your DB configurations are correct.');
    } else {
        console.log('Successfully connected to MySQL database: ' + (process.env.DB_NAME || 'hydro_iot'));
        connection.release();
    }
});

// API Routes

// 1. Submit contact message (Saves to database)
app.post('/api/contact', (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: 'Required fields missing: name, email, message' });
    }

    const query = 'INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)';
    pool.execute(query, [name, email, subject || '', message], (err, results) => {
        if (err) {
            console.error('Error executing query:', err.message);
            return res.status(500).json({ success: false, message: 'Database saving failed' });
        }
        res.status(200).json({ success: true, message: 'Message sent successfully!', insertId: results.insertId });
    });
});

// 2. Fetch live sensor data (Used by dashboard preview)
app.get('/api/sensors', (req, res) => {
    const query = 'SELECT * FROM sensor_data ORDER BY recorded_at DESC LIMIT 1';
    pool.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching sensor data:', err.message);
            // Fallback mock response if database isn't connected so frontend works
            return res.status(200).json({
                success: true,
                isMock: true,
                data: {
                    tank_id: 'DEV-IOT-T1',
                    water_level_pct: 78.50,
                    current_capacity: 3925,
                    max_capacity: 5000,
                    water_quality_tds: 142,
                    temperature_c: 24.5,
                    flow_rate_lpm: 12.4,
                    pump_status: 'ON',
                    recorded_at: new Date()
                }
            });
        }
        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'No sensor logs found.' });
        }
        res.status(200).json({ success: true, data: results[0] });
    });
});

// 3. Update dashboard sensor values (IoT Simulation endpoint)
app.post('/api/sensors/update', (req, res) => {
    const { tank_id, water_level_pct, current_capacity, water_quality_tds, temperature_c, flow_rate_lpm, pump_status } = req.body;

    const query = `INSERT INTO sensor_data 
        (tank_id, water_level_pct, current_capacity, water_quality_tds, temperature_c, flow_rate_lpm, pump_status) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`;

    pool.execute(query, [
        tank_id || 'DEV-IOT-T1',
        water_level_pct,
        current_capacity,
        water_quality_tds,
        temperature_c,
        flow_rate_lpm,
        pump_status || 'OFF'
    ], (err, results) => {
        if (err) {
            console.error('Error inserting log:', err.message);
            return res.status(500).json({ success: false, message: 'Failed to update sensor values.' });
        }
        res.status(201).json({ success: true, message: 'Sensor logs uploaded!', insertId: results.insertId });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Hydro-IOT Backend service running on port ${PORT}`);
});
