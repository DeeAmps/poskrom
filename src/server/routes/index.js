var express = require('express');
var router = express.Router();
var path = require('path');
var bodyParser = require('body-parser');

var authUtil = require('../lib/auth-util');
var auth = require('../middleware/auth');
var index = require('../middleware/index');
var client = require('../middleware/client');
var shared = require('../middleware/shared');

//var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({extended: true});

const APPLICATION_JSON = 'application/json';

router.get('/', (request, response) => {
    response.redirect('/pos/orders/sale');
});


router.get('/get-login-info', (request, response) => {
    index.refetch_login_data(request.session, (err, result) => {
        response.writeHead(200, {'Content-Type': APPLICATION_JSON});
        response.end(JSON.stringify(result));
    })
});


router.route('/login')
    .get((request, response) => {
        const VIEW_DIR = request.app.get('VIEW_DIR');
        response.sendFile(path.join(VIEW_DIR, 'login.html'));
    })
    .post(urlencodedParser, (request, response) => {
        let nickname = request.body.username;
        let authHash = request.body.authhash;
        let timestamp = request.body.timestamp;
        let signature = request.body.signature;
        index.fetch_login_data(request.session, nickname, authHash, timestamp, (err, result) => {
            response.writeHead(200, {'Content-Type': APPLICATION_JSON});
            response.end(JSON.stringify(result));
        });
    });


//router.put('/user-client', (request, response) => {
//    let userId = request.session.user.user_id;
//    let clientId = request.client_id;
//    // TODO check if user is salesrep of client, then update session info
//    let result = {code:0, user:request.session.user};
//    response.writeHead(200, {'Content-Type': APPLICATION_JSON});
//    response.end(JSON.stringify(result));
//});


router.get('/logout', (request, response) => {
    request.session.destroy();
    response.writeHead(200, {'Content-Type': APPLICATION_JSON});
    response.end(JSON.stringify({code:0}));
});






module.exports = router;
