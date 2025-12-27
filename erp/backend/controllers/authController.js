import db from '../db.js';
import { v4 as uuidv4 } from 'uuid';

export const login = (req, res) => {
    const { email, password } = req.body;

    db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });

        if (!row) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Mock password check
        if (password !== row.password_hash) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const { password_hash, ...user } = row;
        res.json({ token: 'mock-jwt-token', user });
    });
};

export const register = (req, res) => {
    const { name, email, password, role, department } = req.body; // Accept department
    console.log('Registering user:', { name, email, role, department }); // Debug log

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate role
    const allowedRoles = ['super_admin', 'ecommerce_admin', 'dev_admin', 'user'];
    const userRole = allowedRoles.includes(role) ? role : 'user'; // Default to 'user' if invalid or missing

    db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (row) return res.status(400).json({ error: 'Email already exists' });

        const id = uuidv4();
        // In a real app, hash the password here.
        // For now, storing as is to match existing mock authentication.
        const password_hash = password;
        const status = 'Active';

        // Determine Department automatically for Admins
        let finalDepartment = department;
        if (role === 'ecommerce_admin') finalDepartment = 'E-commerce';
        if (role === 'dev_admin') finalDepartment = 'Web Development';

        const stmt = db.prepare("INSERT INTO users (id, name, email, password_hash, role, status, department) VALUES (?, ?, ?, ?, ?, ?, ?)");
        stmt.run(id, name, email, password_hash, userRole, status, finalDepartment, function (err) {
            if (err) return res.status(500).json({ error: err.message });

            const user = { id, name, email, role: userRole, status, avatar_url: null, department: finalDepartment };
            res.status(201).json({ token: 'mock-jwt-token', user });
        });
        stmt.finalize();
    });
};
