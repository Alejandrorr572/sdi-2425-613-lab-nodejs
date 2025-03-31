let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');

let app = express();
let jwt = require('jsonwebtoken');
app.set('jwt', jwt);

let expressSession = require('express-session');
app.use(expressSession({
  secret: 'abcdefg',
  resave: true,
  saveUninitialized: true
}));
let crypto = require('crypto');
let fileUpload = require('express-fileupload');
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 },
  createParentPath: true
}));
app.set('uploadPath', __dirname);
app.set('clave','abcdefg');
app.set('crypto',crypto);

const{MongoClient} = require("mongodb");
const connectionStrings = 'mongodb+srv://admin:RPcfP1AHNJmitFpO@musicstoreapp.8ukvf.mongodb.net/?retryWrites=true&w=majority&appName=musicstoreapp';
const dbClient = new MongoClient(connectionStrings);

let bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const usersRepository = require("./repositories/usersRepository.js");
usersRepository.init(app, dbClient);
require("./routes/users.js")(app, usersRepository);

const userSessionRouter = require('./routes/userSessionRouter');
const userAudiosRouter = require('./routes/userAudiosRouter');
app.use("/songs/add",userSessionRouter);
app.use("/publications",userSessionRouter);
app.use("/songs/buy",userSessionRouter);
app.use("/purchases",userSessionRouter);
app.use("/audios/",userAudiosRouter);

const userAuthorRouter = require('./routes/userAuthorRouter');
app.use("/songs/edit",userAuthorRouter);
app.use("/songs/delete",userAuthorRouter);

const userTokenRouter = require('./routes/userTokenRouter');
app.use("/api/v1.0/songs/", userTokenRouter);

var indexRouter = require('./routes/index');
//var usersRouter = require('./routes/users');
let songsRepository = require("./repositories/songsRepository.js");
songsRepository.init(app, dbClient);
require("./routes/songs.js")(app,songsRepository);

require("./routes/api/songsAPIv1.0.js")(app, songsRepository, usersRepository);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'twig');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
//app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  console.log("Se ha producido un error "+err);
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
