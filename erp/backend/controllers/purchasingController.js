import db from '../db.js';
import { v4 as uuidv4 } from 'uuid';

// --- Vendors ---
export const getVendors = (req, res) => {
    const sql = `SELECT 
        id, 
        company_name as companyName, 
        contact_person as contactPerson, 
        email, 
        phone, 
        address, 
        rating, 
        status 
    FROM vendors ORDER BY created_at DESC`;

    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};

export const createVendor = (req, res) => {
    const { companyName, contactPerson, email, phone, address, rating, status } = req.body;
    const id = uuidv4();

    const sql = `INSERT INTO vendors (id, company_name, contact_person, email, phone, address, rating, status) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    const params = [id, companyName, contactPerson, email, phone, address, rating || 5, status || 'Active'];

    db.run(sql, params, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id, companyName, contactPerson, email, phone, address, rating, status });
    });
};

export const updateVendor = (req, res) => {
    const { updates } = req.body;
    // Simplified update logic similar to products/customers
    const data = req.body.updates || req.body;

    const keys = Object.keys(data);
    if (keys.length === 0) return res.json({});

    const fields = keys.map((key) => {
        if (key === 'companyName') return 'company_name = ?';
        if (key === 'contactPerson') return 'contact_person = ?';
        return `${key} = ?`;
    });

    const values = keys.map(k => data[k]);
    values.push(req.params.id);

    const sql = `UPDATE vendors SET ${fields.join(', ')} WHERE id = ?`;

    db.run(sql, values, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: req.params.id, ...data });
    });
};

export const deleteVendor = (req, res) => {
    db.run("DELETE FROM vendors WHERE id = ?", [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Deleted successfully' });
    });
};

// ... POs and Bills logic to be added if strictly required, but for "Complete Backend" 
// adhering to the mockDataService structure, Vendors is the main CRUD there for now.
// The task plan lists "Implement Purchasing Module (Vendors, POs)".

// --- Purchase Orders (POs) ---
export const getPurchaseOrders = (req, res) => {
    const sql = `SELECT 
        id, 
        po_number as poNumber, 
        vendor, 
        date, 
        expected_date as expectedDate, 
        amount, 
        status 
    FROM purchase_orders ORDER BY date DESC`;

    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};

export const createPurchaseOrder = (req, res) => {
    const { vendor, date, expectedDate, amount, status } = req.body;
    const id = uuidv4();
    const poNumber = `PO-${Math.floor(10000 + Math.random() * 90000)}`;

    const sql = `INSERT INTO purchase_orders (id, po_number, vendor, date, expected_date, amount, status) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;

    // vendor might be ID or name depending on frontend
    const params = [id, poNumber, vendor, date, expectedDate, amount, status || 'Draft'];

    db.run(sql, params, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id, poNumber, vendor, date, expectedDate, amount, status });
    });
};

export const updatePurchaseOrder = (req, res) => {
    const data = req.body.updates || req.body;
    const keys = Object.keys(data);
    if (keys.length === 0) return res.json({});

    const fields = keys.map((key) => {
        if (key === 'expectedDate') return 'expected_date = ?';
        return `${key} = ?`;
    });

    const values = keys.map(k => data[k]);
    values.push(req.params.id);

    const sql = `UPDATE purchase_orders SET ${fields.join(', ')} WHERE id = ?`;

    db.run(sql, values, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: req.params.id, ...data });
    });
};

export const deletePurchaseOrder = (req, res) => {
    db.run("DELETE FROM purchase_orders WHERE id = ?", [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Deleted successfully' });
    });
};

// --- Bills ---
export const getBills = (req, res) => {
    const sql = `SELECT 
       id, 
       bill_number as billNumber, 
       vendor, 
       date, 
       due_date as dueDate, 
       amount, 
       status 
   FROM bills ORDER BY date DESC`;

    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};

export const createBill = (req, res) => {
    const { vendor, date, dueDate, amount, status } = req.body;
    const id = uuidv4();
    const billNumber = `BILL-${Math.floor(10000 + Math.random() * 90000)}`;

    const sql = `INSERT INTO bills (id, bill_number, vendor, date, due_date, amount, status) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`;

    const params = [id, billNumber, vendor, date, dueDate, amount, status || 'Pending'];

    db.run(sql, params, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id, billNumber, vendor, date, dueDate, amount, status });
    });
};

export const updateBill = (req, res) => {
    const data = req.body.updates || req.body;
    const keys = Object.keys(data);
    if (keys.length === 0) return res.json({});

    const fields = keys.map((key) => {
        if (key === 'dueDate') return 'due_date = ?';
        return `${key} = ?`;
    });

    const values = keys.map(k => data[k]);
    values.push(req.params.id);

    const sql = `UPDATE bills SET ${fields.join(', ')} WHERE id = ?`;

    db.run(sql, values, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: req.params.id, ...data });
    });
};

export const deleteBill = (req, res) => {
    db.run("DELETE FROM bills WHERE id = ?", [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Deleted successfully' });
    });
};
