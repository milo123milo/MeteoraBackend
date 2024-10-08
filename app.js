var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
const requestIp = require('request-ip');
const cron = require('node-cron');




const passport = require('passport');
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/user');
var adminRouter = require('./routes/admin');
var dbAdminRouter = require('./routes/dbadmin');

var initDB = require('./database/init')
var notification = require('./routes/notifications')

var app = express();

initDB.initDatabase();











const initializePassport = require('./passport-config');
const { route } = require('./routes/index');

var query = require('./database/queries');
const router = require('./routes/index');

var routers = express.Router();


const PORT = process.env.PORT || 3000; // Use the environment variable or port 3000 by default

console.log(`Server is running on port ${PORT}`);





 
  




initializePassport(
  passport,
  query.getUserByName,
  query.getUserById
 
)


app.use(flash())
app.use(session({
  secret: "secret",
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

app.use(cors({
  origin: true
}))
app.use(requestIp.mw())





// view engine setup



app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/', usersRouter);
app.use('/', adminRouter);
app.use('/', dbAdminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});




// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



cron.schedule('0 0 * * *', () => {
  console.log('Running a task once a day at midnight');
  // Add your task logic here
});
notification.notfAirTemp()





module.exports = app;
