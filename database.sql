-- Hydro-IOT Database Schema Configuration
-- To initialize: mysql -u username -p < database.sql

CREATE DATABASE IF NOT EXISTS hydro_iot;
USE hydro_iot;

-- 1. Contact Form Messages
CREATE TABLE IF NOT EXISTS contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    subject VARCHAR(150),
    message TEXT NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Sensor Data Log (for Dashboard Real-Time Feeds)
CREATE TABLE IF NOT EXISTS sensor_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tank_id VARCHAR(50) NOT NULL,
    water_level_pct DECIMAL(5,2) NOT NULL,    -- Water Level in % (0 - 100)
    current_capacity INT NOT NULL,            -- Current volume in Liters
    max_capacity INT DEFAULT 5000,            -- Tank capacity in Liters
    water_quality_tds INT NOT NULL,           -- Total Dissolved Solids in ppm
    temperature_c DECIMAL(4,1) NOT NULL,      -- Water temperature in Celsius
    flow_rate_lpm DECIMAL(5,2) DEFAULT 0.00,  -- Water flow rate (Liters per min)
    pump_status ENUM('ON', 'OFF') DEFAULT 'OFF',
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Device Registration / Status
CREATE TABLE IF NOT EXISTS iot_devices (
    device_id VARCHAR(50) PRIMARY KEY,
    device_name VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    status ENUM('ONLINE', 'OFFLINE') DEFAULT 'ONLINE',
    last_ping TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert dummy data for sensor logs and status
INSERT INTO iot_devices (device_id, device_name, location, status) VALUES
('DEV-IOT-T1', 'Main Storage Tank Sensor', 'Roof Area A', 'ONLINE'),
('DEV-IOT-T2', 'Rainwater Tank Sensor', 'Basement Block B', 'ONLINE');

INSERT INTO sensor_data (tank_id, water_level_pct, current_capacity, water_quality_tds, temperature_c, flow_rate_lpm, pump_status) VALUES
('DEV-IOT-T1', 78.50, 3925, 142, 24.5, 12.4, 'ON'),
('DEV-IOT-T2', 45.20, 2260, 210, 23.8, 0.0, 'OFF');
