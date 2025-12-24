import db from './db.js';
import { v4 as uuidv4 } from 'uuid';

const initDb = () => {
    db.serialize(() => {
        // Users
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT CHECK(role IN ('super_admin', 'ecommerce_admin', 'dev_admin', 'user')) NOT NULL,
            avatar_url TEXT,
            status TEXT DEFAULT 'Active',
            share_percentage REAL DEFAULT 0.00,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Departments
        db.run(`CREATE TABLE IF NOT EXISTS departments (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            head_of_department TEXT,
            budget REAL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Employees
        db.run(`CREATE TABLE IF NOT EXISTS employees (
            id TEXT PRIMARY KEY,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            position TEXT,
            department_id TEXT,
            department_name TEXT,
            salary REAL,
            join_date TEXT,
            status TEXT CHECK(status IN ('Active', 'On Leave', 'Terminated')),
            avatar_url TEXT,
            phone TEXT,
            address TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(department_id) REFERENCES departments(id)
        )`);

        console.log('Tables created (if not exist).');

        // Seed Data
        const adminId = uuidv4();
        db.get("SELECT count(*) as count FROM users", [], (err, row) => {
            if (err) return console.error(err.message);
            if (row.count === 0) {
                console.log('Seeding Users...');
                const stmt = db.prepare("INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)");
                stmt.run(adminId, 'Super Admin', 'admin@test.com', 'password', 'super_admin');
                stmt.finalize();
            }
        });

        // Seed Employees (Mock Data)
        db.get("SELECT count(*) as count FROM employees", [], (err, row) => {
            if (err) return console.error(err.message);
            if (row.count === 0) {
                console.log('Seeding Employees...');
                const stmt = db.prepare("INSERT INTO employees (id, first_name, last_name, email, position, department_name, salary, status, join_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
                for (let i = 0; i < 10; i++) {
                    stmt.run(
                        uuidv4(),
                        `Employee${i}`,
                        `User${i}`,
                        `emp${i}@test.com`,
                        'Developer',
                        'Development',
                        50000 + (i * 1000),
                        'Active',
                        new Date().toISOString()
                    );
                }
                stmt.finalize();
            }
        });
    });
};

initDb();
