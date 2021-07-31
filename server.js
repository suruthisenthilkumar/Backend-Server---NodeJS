const express = require('express');
var app = express();
const {port} = require('./config');
const PORT = 4004;
const bodyParser = require('body-parser');
const path = require('path');

app.use(bodyParser.urlencoded({extended: true})); 
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "/../public")));
app.use(express.static("public"));
app.use(express.json());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, responseType");
  res.header("Access-Control-Allow-Credentials", true);
  next();
});

const db = require("./app/models");
db.sequelize.sync();

require("./app/routes/Login&Refresh/login.routes")(app);//login
app.use('/register',require('./app/routes/newRegistration/register.routes'));
app.use('/user',require('./app/routes/UserActions/user.routes'));
app.use('/gpaclead',require('./app/routes/Roles/leads.routes'));
app.use('/sme',require('./app/routes/Roles/sme.routes'));
app.use('/manager',require('./app/routes/Roles/manager.routes'));
app.use('/admin',require('./app/routes/Roles/admin.routes'));

app.use(function (req, res, next) {
    res.status(404).send("You have entered an invalid URL"+ res)
  });
app.listen(PORT,()=>{console.log(`listening on port ${PORT}`)});

// In development, you may need to drop existing tables and re-sync database. Just use force: true
// db.sequelize.sync({ force: true }).then(() => {
//   console.log("Drop and re-sync db.");
// });

// app.get("/", (req, res) => {
//   res.json({ message: "Welcome to GPAC application." });
// });