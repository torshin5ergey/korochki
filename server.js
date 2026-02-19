const express = require('express');
const mysql = require('mysql2');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'app',
    password: 'app',
    database: 'app'
});

db.connect();
console.log('MySQL подключен');

// Register
app.post('/register', function (req, res) {
    var login = req.body.login;
    var password = req.body.password

    db.query('SELECT * FROM users WHERE login = ?', [login], function (err, results) {
        if (results.length > 0) {
            res.send('логин занят');
            return;
        }

        db.query('INSERT INTO users (login, password) VALUES (?, ?)', [login, password]);
        res.send('регистрация успешна');
    });
});

app.post('/login', function (req, res) {
    var login = req.body.login;
    var password = req.body.password;

    db.query('SELECT * FROM users WHERE login = ? AND password = ?',
        [login, password], function (err, results) {
            if (results.length == 1)
                res.redirect('/dashboard.html')
            else
                res.send('Ошибка входа')
        }
    )
})

app.use(express.static('.'));
app.listen(3000);
