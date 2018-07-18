var express = require('express');
var router = express.Router();

var customer = require('../middleware/inventory_customer');

const APPLICATION_JSON = 'application/json';


router.get('/search-seller', (request, response) => {
    let userId = request.session.user.user_id;
    let clientId = request.session.user.client_id;
    let orderId = request.query.order_id;
    let filter = request.query.filter;
    let limit = request.query.limit;
    customer.search_seller(userId, clientId, orderId, filter, limit, (err, result) => {
        response.writeHead(200, {'Content-Type': APPLICATION_JSON});
        response.end(JSON.stringify(result));
    });
});


router.get('/search-buyer', (request, response) => {
    let userId = request.session.user.user_id;
    let clientId = request.session.user.client_id;
    let orderId = request.query.order_id;
    let filter = (request.query.filter || '').toLowerCase();
    let limit = request.query.limit || 10;
    customer.search_buyer(userId, clientId, orderId, filter, limit, (err, result) => {
        response.writeHead(200, {'Content-Type': APPLICATION_JSON});
        response.end(JSON.stringify(result));
    });
});


router.get('/search-client', (request, response) => {
    let userId = request.session.user.user_id;
    let clientId = request.session.user.client_id;
    let filter = request.query.filter;
    let limit = request.query.limit;
    customer.search_client(userId, clientId, filter, limit, (err, result) => {
        response.writeHead(200, {'Content-Type': APPLICATION_JSON});
        response.end(JSON.stringify(result));
    });
});


module.exports = router;
