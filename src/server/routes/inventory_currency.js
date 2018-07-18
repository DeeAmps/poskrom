var express = require('express');
var router = express.Router();

var currency = require('../middleware/inventory_currency');

const APPLICATION_JSON = 'application/json';


router.get('/', (request, response, failure) => {
    let userId = request.session.user.user_id;
    let clientId = request.session.user.client_id;
    let filter = request.query.filter;
    let limit = request.query.limit;
    let currencyLabel = 'standard currency';
    currency.search_currency(userId, clientId, currencyLabel, filter, limit, (err, result) => {
        response.writeHead(200, {'Content-Type': APPLICATION_JSON});
        response.end(JSON.stringify(result));
    });
});


router.get('/:id/denominations', (request, response, failure) => {
    let userId = request.session.user.user_id;
    let clientId = request.session.user.client_id;
    let barcodeId = request.params.id;
    currency.get_currency_denominations(userId, clientId, barcodeId, (err, result) => {
        response.writeHead(200, {'Content-Type': APPLICATION_JSON});
        response.end(JSON.stringify(result));
    });
});


module.exports = router;
