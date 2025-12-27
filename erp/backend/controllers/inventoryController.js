import db from '../db.js';
import { v4 as uuidv4 } from 'uuid';

export const getProducts = (req, res) => {
    // frontend expects: name, sku, category, price, stock, minStock, status, supplier
    const sql = `SELECT 
        id, 
        name, 
        sku, 
        category, 
        price, 
        stock, 
        min_stock as minStock, 
        supplier, 
        status, 
        last_updated as lastUpdated 
    FROM products ORDER BY created_at DESC`;

    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};

export const createProduct = (req, res) => {
    const { name, sku, category, price, stock, minStock, status, supplier } = req.body;
    const id = uuidv4();
    const lastUpdated = new Date().toISOString();

    const sql = `INSERT INTO products (id, name, sku, category, price, stock, min_stock, supplier, status, last_updated) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    // minStock default 10 if not provided
    const params = [id, name, sku, category, price, stock || 0, minStock || 10, supplier, status || 'Active', lastUpdated];

    db.run(sql, params, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id, name, sku, category, price, stock, minStock, supplier, status, lastUpdated });
    });
};

export const updateProduct = (req, res) => {
    const { updates } = req.body; // mockDataService sends { id, data: updates } or just updates as body? 
    // In ProductList.jsx: updateProductMutation.mutate({ id: selectedProduct.id, data });
    // So req.body likely contains the data object directly if we coordinate with updated service.

    // Let's assume req.body IS the updates object for simplicity, or we check if 'updates' key exists.
    // Standard Rest: PUT/PATCH /api/products/:id -> body is the data.

    const data = req.body.updates || req.body;

    // Dynamic update query
    const keys = Object.keys(data);
    if (keys.length === 0) return res.json({});

    const fields = keys.map((key) => {
        let col = key;
        if (key === 'minStock') col = 'min_stock';
        if (key === 'lastUpdated') col = 'last_updated';
        return `${col} = ?`;
    });

    const values = keys.map(k => data[k]);
    values.push(new Date().toISOString()); // Always update last_updated
    fields.push('last_updated = ?');

    values.push(req.params.id);

    const sql = `UPDATE products SET ${fields.join(', ')} WHERE id = ?`;

    db.run(sql, values, function (err) {
        if (err) return res.status(500).json({ error: err.message });

        // Return updated object
        db.get("SELECT id, name, sku, category, price, stock, min_stock as minStock, supplier, status, last_updated as lastUpdated FROM products WHERE id = ?", [req.params.id], (err, row) => {
            res.json(row);
        });
    });
};

export const deleteProduct = (req, res) => {
    db.run("DELETE FROM products WHERE id = ?", [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Deleted successfully' });
    });
};
