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

        // Leaves
        db.run(`CREATE TABLE IF NOT EXISTS leaves (
            id TEXT PRIMARY KEY,
            employee_id TEXT,
            employee_name TEXT,
            type TEXT,
            start_date DATETIME,
            end_date DATETIME,
            reason TEXT,
            status TEXT DEFAULT 'Pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(employee_id) REFERENCES users(id)
        )`);

        // --- Inventory ---
        db.run(`CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            sku TEXT UNIQUE NOT NULL,
            category TEXT,
            price REAL NOT NULL,
            stock INTEGER DEFAULT 0,
            min_stock INTEGER DEFAULT 10,
            supplier TEXT,
            status TEXT DEFAULT 'Active',
            last_updated DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // --- CRM ---
        db.run(`CREATE TABLE IF NOT EXISTS customers (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            company TEXT,
            email TEXT,
            phone TEXT,
            address TEXT,
            status TEXT,
            notes TEXT,
            total_orders INTEGER DEFAULT 0,
            last_order_date DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // --- Finance ---
        db.run(`CREATE TABLE IF NOT EXISTS invoices (
            id TEXT PRIMARY KEY,
            invoice_number TEXT UNIQUE NOT NULL,
            customer_name TEXT,
            date DATETIME,
            due_date DATETIME,
            amount REAL,
            status TEXT CHECK(status IN ('Paid', 'Pending', 'Overdue')),
            items_count INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS invoice_items (
            id TEXT PRIMARY KEY,
            invoice_id TEXT,
            product_id TEXT,
            description TEXT,
            quantity INTEGER,
            unit_price REAL,
            amount REAL,
            FOREIGN KEY(invoice_id) REFERENCES invoices(id)
        )`);

        // Outgoing Payments (Vendor Payments)
        db.run(`CREATE TABLE IF NOT EXISTS payments (
            id TEXT PRIMARY KEY,
            payment_number TEXT UNIQUE,
            vendor TEXT, 
            amount REAL,
            date DATETIME,
            method TEXT,
            status TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // --- CRM (Leads) ---
        db.run(`CREATE TABLE IF NOT EXISTS leads (
            id TEXT PRIMARY KEY,
            name TEXT,
            company TEXT,
            email TEXT,
            phone TEXT,
            source TEXT, 
            status TEXT CHECK(status IN ('New', 'Contacted', 'Qualified', 'Lost')),
            estimated_value REAL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // --- Purchasing (POs & Bills) ---
        db.run(`CREATE TABLE IF NOT EXISTS purchase_orders (
            id TEXT PRIMARY KEY,
            po_number TEXT UNIQUE NOT NULL,
            vendor_id TEXT,
            vendor TEXT, -- De-normalized or just string if loose
            date DATETIME,
            expected_date DATETIME,
            amount REAL,
            status TEXT CHECK(status IN ('Draft', 'Ordered', 'Received', 'Cancelled')),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS bills (
            id TEXT PRIMARY KEY,
            bill_number TEXT UNIQUE NOT NULL,
            vendor_id TEXT,
            vendor TEXT,
            date DATETIME,
            due_date DATETIME,
            amount REAL,
            status TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Vendors
        db.run(`CREATE TABLE IF NOT EXISTS vendors (
            id TEXT PRIMARY KEY,
            company_name TEXT NOT NULL,
            contact_person TEXT,
            email TEXT,
            phone TEXT,
            address TEXT,
            rating INTEGER,
            status TEXT DEFAULT 'Active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
