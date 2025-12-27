
import db from './db.js';

const migrate = () => {
    db.serialize(() => {
        console.log('Starting migration...');

        // Add department column to users table
        db.run("ALTER TABLE users ADD COLUMN department TEXT", (err) => {
            if (err && err.message.includes('duplicate column name')) {
                console.log('Column department already exists in users');
            } else if (err) {
                console.error('Error adding department to users:', err);
            } else {
                console.log('Added department to users table');
            }
        });

        // Add department column to leaves table
        db.run("ALTER TABLE leaves ADD COLUMN department TEXT", (err) => {
            if (err && err.message.includes('duplicate column name')) {
                console.log('Column department already exists in leaves');
            } else if (err) {
                console.error('Error adding department to leaves:', err);
            } else {
                console.log('Added department to leaves table');
            }
        });
    });
};

migrate();
