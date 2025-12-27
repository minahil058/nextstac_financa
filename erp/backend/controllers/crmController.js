import db from '../db.js';
import { v4 as uuidv4 } from 'uuid';

export const getCustomers = (req, res) => {
    const sql = `SELECT 
        id, 
        name, 
        company, 
        email, 
        phone, 
        address, 
        status, 
        notes,
        total_orders as totalOrders,
        last_order_date as lastOrderDate
    FROM customers ORDER BY created_at DESC`;

    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};

export const createCustomer = (req, res) => {
    const { name, company, email, phone, address, status, notes } = req.body;
    const id = uuidv4();

    const sql = `INSERT INTO customers (id, name, company, email, phone, address, status, notes) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    // Default status 'Active'
    const params = [id, name, company, email, phone, address, status || 'Active', notes];

    db.run(sql, params, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id, name, company, email, phone, address, status, notes, totalOrders: 0 });
    });
};

export const updateCustomer = (req, res) => {
    // Similar to products, expect dynamic updates
    const data = req.body.updates || req.body;

    const keys = Object.keys(data);
    if (keys.length === 0) return res.json({});

    const fields = keys.map((key) => {
        let col = key;
        if (key === 'totalOrders') col = 'total_orders';
        if (key === 'lastOrderDate') col = 'last_order_date';
        return `${col} = ?`;
    });

    const values = keys.map(k => data[k]);
    values.push(req.params.id);

    const sql = `UPDATE customers SET ${fields.join(', ')} WHERE id = ?`;

    db.run(sql, values, function (err) {
        if (err) return res.status(500).json({ error: err.message });

        db.get("SELECT id, name, company, email, phone, address, status, notes, total_orders as totalOrders, last_order_date as lastOrderDate FROM customers WHERE id = ?", [req.params.id], (err, row) => {
            res.json(row);
        });
    });
};

export const deleteCustomer = (req, res) => {
    db.run("DELETE FROM customers WHERE id = ?", [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Deleted successfully' });
    });
};

// --- Leads ---
export const getLeads = (req, res) => {
    const sql = `SELECT * FROM leads ORDER BY created_at DESC`;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};

export const createLead = (req, res) => {
    const { name, company, email, phone, source, status, estimatedValue } = req.body;
    const id = uuidv4();

    const sql = `INSERT INTO leads (id, name, company, email, phone, source, status, estimated_value) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    // estimatedValue often sent as 'value' from frontend mock
    const val = estimatedValue || req.body.value || 0;

    const params = [id, name, company, email, phone, source, status || 'New', val];

    db.run(sql, params, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id, name, company, email, phone, source, status, estimatedValue: val });
    });
};

export const updateLead = (req, res) => {
    const data = req.body.updates || req.body;
    const keys = Object.keys(data);
    if (keys.length === 0) return res.json({});

    const fields = keys.map((key) => {
        if (key === 'estimatedValue' || key === 'value') return 'estimated_value = ?';
        return `${key} = ?`;
    });

    const values = keys.map(k => data[k]);
    values.push(req.params.id);

    const sql = `UPDATE leads SET ${fields.join(', ')} WHERE id = ?`;

    db.run(sql, values, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: req.params.id, ...data });
    });
};

export const deleteLead = (req, res) => {
    db.run("DELETE FROM leads WHERE id = ?", [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Deleted successfully' });
    });
};
