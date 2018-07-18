var express = require('express');
var router = express.Router();

var bank = require('../middleware/inventory_bank');

const APPLICATION_JSON = 'application/json';


router.get('/search-client-bank', (request, response) => {
    let userId = request.session.user.user_id;
    let clientId = request.session.user.client_id;
    let customerId = request.query.customer_id;
    let filter = (request.query.filter || '').toLowerCase();
    let limit = request.query.limit || 10;
    depot.search_client_bank(userId, clientId, customerId, filter, limit, (err, result) => {
        response.writeHead(200, {'Content-Type': APPLICATION_JSON});
        response.end(JSON.stringify(result));
    });
});


router.get('/search-payment-bank', (request, response) => {
    let userId = request.session.user.user_id;
    let clientId = request.session.user.client_id;
    let orderId = request.query.order_id;
    let toggle = request.query.toggle;
    let filter = (request.query.filter || '').toLowerCase();
    let limit = request.query.limit || 10;
    bank.search_payment_bank(userId, clientId, orderId, toggle, filter, limit, (err, result) => {
        response.writeHead(200, {'Content-Type': APPLICATION_JSON});
        response.end(JSON.stringify(result));
    });
});


module.exports = router;
