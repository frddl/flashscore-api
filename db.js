const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./gamealerts.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the gamealerts database.');
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NULL,
      link TEXT NOT NULL,
      alert_sent_at DATETIME NULL,
      is_active BOOLEAN DEFAULT 1
  )`);
});

db.setName = (id, name) => {
    db.run('UPDATE games SET name = ? WHERE id = ?', [name, id], function(err) {
        if (err) {
            console.error(err.message);
        }
    });
};

db.setAlertSentAt = (id) => {
    db.run('UPDATE games SET alert_sent_at = CURRENT_TIMESTAMP WHERE id = ?', [id], function(err) {
        if (err) {
            console.error(err.message);
        }
    });
};

db.deactivate = (id) => {
    db.run('UPDATE games SET is_active = 0 WHERE id = ?', [id], function(err) {
        if (err) {
            console.error(err.message);
        }
    });
}

module.exports = db;
