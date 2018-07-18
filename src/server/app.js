var express = require('express');
var logger = require('morgan');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require("cors");
var path = require('path');
//let favicon = require('serve-favicon');

var authUtil = require('./lib/auth-util');
var index = require('./routes');
var inventory = require('./routes/inventory');
var inventoryCurrency = require('./routes/inventory_currency');
var inventoryCustomer = require('./routes/inventory_customer');
var inventoryDepot = require('./routes/inventory_depot');
var inventoryBank = require('./routes/inventory_bank');
var pos = require('./routes/pos');
var report = require('./routes/report');

const STATIC_DIR = 'public';
const sessionConfig = {
    name: 'user_sid',
    secret: authUtil.generateString(16), // TODO retrieve secret from environment
    rolling: true,
    resave: true,
    cookie: {
      httpOnly: true,
      maxAge:15*60*1000,
    },
    resave: false,
    saveUninitialized: false
};


var app = express();

app.set('VIEW_DIR', path.join(__dirname, 'views'));

app.set('port', 8080);
// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(cors())
app.use(cookieParser());
app.use(session(sessionConfig));
app.use(express.static(path.join(__dirname, STATIC_DIR)));
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// authenticate = function authenticate
// (request, response, next){
//     if(request.session.user && request.cookies.user_sid){
//         // TODO check if dataHash is valid
//         if(request.path === '/login') {
//             response.redirect('/');
//         }else{
//             next();
//         }
//     }else{
//         if(request.path === '/login'){
//             next();
//         }else{
//             response.redirect('/login')
//         }
//     }
// }


//app.use(authenticate);
app.use('/inventory', inventory);
app.use('/inventory/currency', inventoryCurrency);
app.use('/inventory/depot', inventoryDepot);
app.use('/inventory/bank', inventoryBank);
app.use('/inventory/customer', inventoryCustomer);
app.use('/pos', pos);
app.use('/', index);
app.use('/reports', report);


// catch 404 and forward to error handler
//app.use(function(req, res, next) {
//  let err = new Error('Not Found');
//  err.status = 404;
//  next(err);
//});
//
//// error handler
//app.use(function(err, req, res, next) {
//  // set locals, only providing error in development
//  res.locals.message = err.message;
//  res.locals.error = req.app.get('env') === 'development' ? err : {};
//
//  // render the error page
//  res.status(err.status || 500);
//  res.render('error');
//});

app.listen(app.get('port'), () => {
    console.log(`Bibiara POS listening on port ${app.get('port')}`);
});

module.exports = app;
