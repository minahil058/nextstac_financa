import db from '../db.js';

// --- System Logs ---
export const getLogs = (req, res) => {
    // Return mock logs for now if no real logging is implemented, or query a logs table
    // schema.sql has activity_logs.
    const sql = `SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT 50`;
    db.all(sql, [], (err, rows) => {
        if (err) return res.json([]); // Return empty if table missing
        res.json(rows);
    });
};

// --- Company Profile ---
export const getCompanyProfile = (req, res) => {
    const sql = `SELECT * FROM company_profile LIMIT 1`;
    db.get(sql, [], (err, row) => {
        if (err || !row) {
            // Return default mock profile if db empty
            return res.json({
                name: 'Financa Global',
                legalName: 'Financa Technologies Pvt Ltd',
                email: 'admin@financa.com'
            });
        }
        res.json(row);
    });
};
