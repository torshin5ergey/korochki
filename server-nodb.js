const express = require('express');
const mysql = require('mysql2');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static('.'));

// const db = mysql.createConnection({
//   'host': 'localhost',
//   'port': 3306,
//   'database': 'app',
//   'user': 'app',
//   'password': 'app'
// })

var database = {
  users: [
    { id: 0, login: 'Admin', password: 'KorokNET', name: 'Admin', phone: 'Admin', email: 'Admin' }
  ],
  enrollments: []
}

var current_user_id = null;

//db.connect();
console.log('db connected');

// login
app.post('/login', function (req, res) {
  var login = req.body.login;
  var password = req.body.password;

  var results = database.users.filter(function (u) {
    return u.login === login && u.password === password
  });

  if (results.length > 0) {
    if (login === 'Admin') {
      res.redirect('admin-dashboard.html')
    }
    res.redirect('dashboard.html')
  }
});

// register
app.post('/register', function (req, res) {
  var login = req.body.login;
  var password = req.body.password;
  var name = req.body.name;
  var phone = req.body.phone;
  var email = req.body.email;

  var exist_user = database.users.filter(function (u) {
    return u.login === login;
  })

  if (exist_user[0]) {
    res.send('Пользователь с таким логином уже существует')
  } else {
    let new_user = {
      id: database.users.length + 1, login, password, name, phone, email
    };
    database.users.push(new_user);
    console.log(new_user);
    res.send('Пользователь успешно создан');
  }
})

app.listen(3000);
console.log('app started');

