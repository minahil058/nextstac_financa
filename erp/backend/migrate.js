import db from './db.js';

const migrate = () => {
    db.run("ALTER TABLE employees ADD COLUMN updated_at DATETIME", (err) => {
        if (err) {
            if (err.message.includes('duplicate column')) {
                console.log('Column already exists');
            } else {
                console.error('Migration failed:', err.message);
            }
        } else {
            console.log('Migration successful: Added updated_at to employees');
        }
    });
};

migrate();
