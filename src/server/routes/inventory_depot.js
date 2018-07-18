var express = require('express');
var router = express.Router();

var depot = require('../middleware/inventory_depot');

const APPLICATION_JSON = 'application/json';


router.get('/search-client-depot', (request, response) => {
    let userId = request.session.user.user_id;
    let clientId = request.session.user.client_id;
    let customerId = request.query.customer_id;
    let filter = (request.query.filter || '').toLowerCase();
    let limit = request.query.limit || 10;
    depot.search_client_depot(userId, clientId, customerId, filter, limit, (err, result) => {
        response.writeHead(200, {'Content-Type': APPLICATION_JSON});
        response.end(JSON.stringify(result));
    });
});


router.get('/search-stock-in-depot', (request, response) => {
    let userId = request.session.user.user_id;
    let clientId = request.session.user.client_id;
    let orderId = request.query.order_id;
    let filter = (request.query.filter || '').toLowerCase();
    let limit = request.query.limit || 10;
    depot.search_stock_in_depot(userId, clientId, orderId, filter, limit, (err, result) => {
        response.writeHead(200, {'Content-Type': APPLICATION_JSON});
        response.end(JSON.stringify(result));
    });
});


router.put('/:depotid/stock/:stockunitid', (request, response) => {
    let userId = request.session.user.user_id;
    let clientId = request.session.user.client_id;
    let depotId = request.params.depotid;
    let stockUnitId = request.params.stockunitid;
    let stockDict = request.body.stock;
    let priceDenominations = ('price' in stockDict ? stockDict.price : null);
    let quantityHstore = ('quantity' in stockDict ? 'quantity => '+stockDict.quantity : '');
    let priceHstoreList = shared.make_hstore_list_from_data(priceDenominations);
    if(userId == clientId){ // TODO permissioning module
        depot.put_depot_stock(userId, clientId, depotId, stockUnitId, priceHstoreList, quantityHstore
                                , (err, result) => {
            response.writeHead(200, {'Content-Type': APPLICATION_JSON});
            response.end(JSON.stringify(result));
        });
    }else{
        let result = {code:5, error_message: 'only the owner can perform this operation!'};
        response.writeHead(200, {'Content-Type': APPLICATION_JSON});
        response.end(JSON.stringify(result));
    }
});


module.exports = router;
