const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());


const db = new sqlite3.Database('./cities.db', (err) => {
    if (err) {
        console.error('Could not connect to database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
    }
});

app.post('/cities', (req, res) => {
    const { name, population, country, latitude, longitude } = req.body;

    const sql = `INSERT INTO cities (name, population, country, latitude, longitude)
                 VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [name, population, country, latitude, longitude], function(err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.status(201).json({
            message: 'City added successfully',
            city: { id: this.lastID, name, population, country, latitude, longitude }
        });
    });
});

app.put('/cities/:id', (req, res) => {
    const { id } = req.params;
    const { name, population, country, latitude, longitude } = req.body;

    const sql = `UPDATE cities SET name = ?, population = ?, country = ?, latitude = ?, longitude = ?
                 WHERE id = ?`;
    db.run(sql, [name, population, country, latitude, longitude, id], function(err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({
            message: 'City updated successfully',
            city: { id, name, population, country, latitude, longitude }
        });
    });
});

app.delete('/cities/:id', (req, res) => {
    const { id } = req.params;

    const sql = `DELETE FROM cities WHERE id = ?`;
    db.run(sql, id, function(err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ message: 'City deleted successfully' });
    });
});

app.get('/cities', (req, res) => {
    let { page = 1, limit = 10, filter, sort, search, projection } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    const offset = (page - 1) * limit;

    let sql = `SELECT ${projection ? projection : '*'} FROM cities`;

    if (filter) {
        sql += ` WHERE ${filter}`;
    }

    if (search) {
        sql += ` WHERE name LIKE '%${search}%' OR country LIKE '%${search}%'`;
    }

    if (sort) {
        sql += ` ORDER BY ${sort}`;
    }

    sql += ` LIMIT ${limit} OFFSET ${offset}`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json(rows);
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
