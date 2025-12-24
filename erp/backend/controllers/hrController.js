import db from '../db.js';
import { v4 as uuidv4 } from 'uuid';

export const getAllEmployees = (req, res) => {
    const sql = `SELECT 
        id, 
        first_name as firstName, 
        last_name as lastName, 
        email, 
        position, 
        department_name as department, 
        salary, 
        status, 
        avatar_url as avatar, 
        phone, 
        address, 
        join_date as joinDate,
        updated_at as updatedAt
    FROM employees ORDER BY created_at DESC`;

    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};

export const getEmployeeById = (req, res) => {
    const sql = `SELECT 
        id, 
        first_name as firstName, 
        last_name as lastName, 
        email, 
        position, 
        department_name as department, 
        salary, 
        status, 
        avatar_url as avatar, 
        phone, 
        address, 
        join_date as joinDate,
        updated_at as updatedAt
    FROM employees WHERE id = ?`;

    db.get(sql, [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Employee not found' });
        res.json(row);
    });
};

export const createEmployee = (req, res) => {
    const { firstName, lastName, email, position, department, salary, status, avatar, phone, address } = req.body;
    const id = uuidv4();
    const joinDate = new Date().toISOString();

    const sql = `INSERT INTO employees (id, first_name, last_name, email, position, department_name, salary, status, avatar_url, phone, address, join_date) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const params = [id, firstName, lastName, email, position, department, salary, status || 'Active', avatar, phone, address, joinDate];

    db.run(sql, params, function (err) {
        if (err) return res.status(500).json({ error: err.message });

        const newEmp = { id, firstName, lastName, email, position, department, salary, status, avatar, phone, address, joinDate };
        res.status(201).json(newEmp);
    });
};

export const updateEmployee = (req, res) => {
    const { updates } = req.body;

    if (!updates || Object.keys(updates).length === 0) {
        return res.json({});
    }

    const keys = Object.keys(updates);
    const fields = keys.map((key) => {
        let col = key;
        if (key === 'firstName') col = 'first_name';
        if (key === 'lastName') col = 'last_name';
        if (key === 'department') col = 'department_name';
        if (key === 'avatar') col = 'avatar_url';
        return `${col} = ?`;
    });

    const values = keys.map(k => updates[k]);
    values.push(req.params.id);

    const sql = `UPDATE employees SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

    console.log('Update SQL:', sql, values);

    db.run(sql, values, function (err) {
        if (err) {
            console.error('Update Error:', err);
            return res.status(500).json({ error: err.message });
        }

        const returnSql = `SELECT 
            id, 
            first_name as firstName, 
            last_name as lastName, 
            email, 
            position, 
            department_name as department, 
            salary, 
            status, 
            avatar_url as avatar, 
            phone, 
            address, 
            join_date as joinDate,
            updated_at as updatedAt
        FROM employees WHERE id = ?`;

        db.get(returnSql, [req.params.id], (err, row) => {
            res.json(row);
        });
    });
};

export const deleteEmployee = (req, res) => {
    db.run("DELETE FROM employees WHERE id = ?", [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Deleted successfully' });
    });
};
