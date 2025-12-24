import db from './db.js';

db.all("PRAGMA table_info(employees)", [], (err, rows) => {
    if (err) console.error(err);
    console.log(rows);
});
