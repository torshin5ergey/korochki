const express = require('express');
const mysql = require('mysql2');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Connect
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
    var name = req.body.name
    var phone = req.body.phone
    var email = req.body.email

    db.query('SELECT * FROM users WHERE login = ?', [login], function (err, results) {
        if (results.length > 0) {
            res.send('логин занят');
            return;
        }

        db.query('INSERT INTO users (login, password, name, phone, email) VALUES (?, ?, ?, ?, ?)', [login, password, name, phone, email]);
        res.send('Регистрация успешна');
    });
});

var current_user_id = null;

// Login
app.post('/login', function (req, res) {
    var login = req.body.login;
    var password = req.body.password;

    db.query('SELECT * FROM users WHERE login = ? AND password = ?',
        [login, password], function (err, results) {
            if (results.length == 1) {
                // Сохраняем ID пользователя в сессии
                current_user_id = results[0].id;

                if (login === 'Admin') {
                    res.redirect('/admin-dashboard.html');
                } else {
                    res.redirect('/dashboard.html');
                }
            } else {
                res.send('Ошибка входа');
            }
        }
    );
});

// Create course_requests
app.post('/create', function (req, res) {
    var course_name = req.body.course_name;
    var start_date = req.body.start_date;
    var payment_method_id = req.body.payment_method_id;

    db.query('INSERT INTO course_requests (course_name, start_date, payment_method_id, user_id) VALUES (?, ?, ?, ?)',
        [course_name, start_date, payment_method_id, current_user_id], function (err, results) {
            if (err) {
                console.error('Ошибка при создании заявки:', err);
                res.send('Ошибка при создании заявки');
                return;
            }
            res.send('Заявка успешно создана');
        }
    );
});

// Get user applications
app.get('/applications', function (req, res) {
    if (!current_user_id) {
        res.status(401).json({ error: 'Пользователь не авторизован' });
        return;
    }

    db.query(`
        SELECT cr.course_name, cr.start_date, cr.status_id, crs.name as status_name
        FROM course_requests cr 
        JOIN course_requests_statuses crs ON cr.status_id = crs.id
        WHERE cr.user_id = ?
        ORDER BY cr.id DESC
    `, [current_user_id], function (err, results) {
        if (err) {
            console.error('Ошибка при получении заявок:', err);
            res.status(500).json({ error: 'Ошибка сервера' });
            return;
        }
        res.json(results);
    });
});

// Get all applications for admin
app.get('/admin/applications', function (req, res) {
    db.query(`
        SELECT cr.id, cr.course_name, cr.start_date, cr.status_id, u.name as user_name
        FROM course_requests cr 
        JOIN users u ON cr.user_id = u.id
        ORDER BY cr.id DESC
    `, function (err, results) {
        if (err) {
            console.error('Ошибка при получении заявок:', err);
            res.status(500).json({ error: 'Ошибка сервера' });
            return;
        }
        res.json(results);
    });
});

// Update application status
app.post('/admin/update-status', function (req, res) {
    const { applicationId, statusId } = req.body;

    db.query('UPDATE course_requests SET status_id = ? WHERE id = ?',
        [statusId, applicationId], function (err, results) {
            if (err) {
                console.error('Ошибка при обновлении статуса:', err);
                res.json({ success: false, error: 'Ошибка сервера' });
                return;
            }
            res.json({ success: true });
        }
    );
});

app.use(express.static('.'));
app.listen(3000);
