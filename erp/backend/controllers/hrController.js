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

// --- Leave Management ---

export const getAllLeaves = (req, res) => {
    const sql = `SELECT * FROM leaves ORDER BY created_at DESC`;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        // Transform for frontend consistency if needed
        const leaves = rows.map(leave => ({
            id: leave.id,
            employeeId: leave.employee_id,
            employeeName: leave.employee_name,
            department: leave.department, // Return department
            type: leave.type,
            startDate: leave.start_date,
            endDate: leave.end_date,
            days: Math.ceil((new Date(leave.end_date) - new Date(leave.start_date)) / (1000 * 60 * 60 * 24)) + 1,
            reason: leave.reason,
            status: leave.status,
            requestedOn: leave.created_at,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(leave.employee_name)}&background=random`
        }));
        res.json(leaves);
    });
};

export const createLeave = (req, res) => {
    const { employeeId, employeeName, type, startDate, endDate, reason } = req.body;
    const id = uuidv4();

    const sql = `INSERT INTO leaves (id, employee_id, employee_name, type, start_date, end_date, reason) VALUES (?, ?, ?, ?, ?, ?, ?)`;

    db.run(sql, [id, employeeId, employeeName, type, startDate, endDate, reason], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id, status: 'Pending', message: 'Leave requested successfully' });
    });
};

export const updateLeaveStatus = (req, res) => {
    const { status } = req.body;
    const sql = `UPDATE leaves SET status = ? WHERE id = ?`;

    db.run(sql, [status, req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, status });
    });
};
