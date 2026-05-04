-- SQLite DDL aligned with prisma/schema.prisma (local prototype)

CREATE TABLE organizations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    organization_id INTEGER REFERENCES organizations(id),
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role VARCHAR(20) DEFAULT 'technician',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE hardware_boxes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    box_name VARCHAR(50) NOT NULL UNIQUE,
    token VARCHAR(255) NOT NULL,
    secret VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cars (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    organization_id INTEGER REFERENCES organizations(id),
    brand VARCHAR(50),
    model VARCHAR(50),
    year INTEGER,
    vin VARCHAR(17),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_hardware (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    hardware_box_id INTEGER REFERENCES hardware_boxes(id),
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, hardware_box_id)
);

CREATE TABLE simulations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    car_id INTEGER REFERENCES cars(id),
    hardware_box_id INTEGER REFERENCES hardware_boxes(id),
    csv_data TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
