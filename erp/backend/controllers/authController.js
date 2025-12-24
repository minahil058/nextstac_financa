import db from '../db.js';

export const login = (req, res) => {
    const { email, password } = req.body;

    db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });

        if (!row) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Mock password check
        if (password !== row.password_hash) {
            // Ideally password hash check
        }

        const { password_hash, ...user } = row;
        res.json({ token: 'mock-jwt-token', user });
    });
};
