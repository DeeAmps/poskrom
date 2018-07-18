let async = require('async');
let express = require('express');
let router = express.Router();
let path = require('path');
var bodyParser = require('body-parser');
let pos = require('../middleware/pos');
let shared = require('./shared');
let sharedMiddleware = require('../middleware/shared');


var jsonParser = bodyParser.json();

const APPLICATION_JSON = 'application/json';


// STOCK
router.get('/stock', (request, response) => {
    const VIEW_DIR = request.app.get('VIEW_DIR');
    response.sendFile(path.join(VIEW_DIR, 'stocks.html'));
});

// ORDERS

//router.get('/orders', (request, response) => {
//    const VIEW_DIR = request.app.get('VIEW_DIR');
//    response.sendFile(path.join(VIEW_DIR, 'orders.html'));
//});

router.post('/orders', (request, response) => {
    let userId = request.session.user.user_id;
    let clientId = request.session.user.client_id;
    let salesOrder = request.body.sales_order;
    pos.post_order(userId, clientId, salesOrder, (err, result) => {
        response.writeHead(200, {'Content-Type': APPLICATION_JSON});
        response.end(JSON.stringify(result));
    });
});

router.get('/orders/sale', (request, response) => {
    const VIEW_DIR = request.app.get('VIEW_DIR');
    response.sendFile(path.join(VIEW_DIR, 'sale-orders.html'));
});

router.get('/orders/purchase', (request, response) => {
    const VIEW_DIR = request.app.get('VIEW_DIR');
    response.sendFile(path.join(VIEW_DIR, 'purchase-orders.html'));
});

router.get('/orders/transfer', (request, response) => {
    const VIEW_DIR = request.app.get('VIEW_DIR');
    response.sendFile(path.join(VIEW_DIR, 'transfer-orders.html'));
});

router.put('/orders/:id', (request, response) => {
    let userId = request.session.user.user_id;
    let clientId = request.session.user.client_id;
    let orderId = request.params.id;
    let salesOrder = request.body.sales_order;
    let salesOrderHstoreList = shared.make_hstore_list_from_data([salesOrder]);
    pos.put_order(userId, clientId, orderId, salesOrderHstoreList[0], (err, result) => {
        response.writeHead(200, {'Content-Type': APPLICATION_JSON});
        response.end(JSON.stringify(result));
    });
});

router.delete('/orders/:id', (request, response) => {
    let userId = request.session.user.user_id;
    let clientId = request.session.user.client_id;
    let orderId = request.params.id;
    pos.delete_order(userId, clientId, orderId, (err, result) => {
        response.writeHead(200, {'Content-Type': APPLICATION_JSON});
        response.end(JSON.stringify(result));
    });
});

router.get('/get-sales', (request, response) => {
    let userId = request.session.user.user_id;
    let clientId = request.session.user.client_id;
    let cursor = request.query.cursor;
    let limit = request.query.limit || 15;
    let orderId = null;
    let orderType = 'sale';
    let xrate = sharedMiddleware.default_currency.xrate;
    pos.get_sales_order(userId, clientId, orderId, orderType, xrate, cursor, limit, (err, result) => {
        if(!err){
            result.sales = result.sales_orders;
        }
        response.end(JSON.stringify(result));
    });
});


router.post('/get-sales', (request, response) => {
    let userId = request.body.user_id;
    let clientId = request.body.client_id;
    let cursor = request.query.cursor;
    let limit = request.query.limit || 15;
    let orderId = null;
    let orderType = 'sale';
    let xrate = sharedMiddleware.default_currency.xrate;
    pos.get_sales_order(userId, clientId, orderId, orderType, xrate, cursor, limit, (err, result) => {
        if(!err){
            result.sales = result.sales_orders;
        }
        response.end(JSON.stringify(result));
    });
})

router.get('/get-purchases', (request, response) => {
    let userId = request.session.user.user_id;
    let clientId = request.session.user.client_id;
    let cursor = request.query.cursor;
    let limit = request.query.limit || 15;
    let orderId = null;
    let orderType = 'purchase';
    let xrate = sharedMiddleware.default_currency.xrate;
    pos.get_sales_order(userId, clientId, orderId, orderType, xrate, cursor, limit, (err, result) => {
        if(!err){
            result.purchases = result.sales_orders;
        }
        response.end(JSON.stringify(result));
    });
})

router.get('/get-transfers', (request, response) => {
    let userId = request.session.user.user_id;
    let clientId = request.session.user.client_id;
    let cursor = request.query.cursor;
    let limit = request.query.limit || 15;
    let orderId = null;
    let orderType = 'transfer';
    let xrate = sharedMiddleware.default_currency.xrate;
    pos.get_sales_order(userId, clientId, orderId, orderType, xrate, cursor, limit, (err, result) => {
        if(!err){
            result.transfers = result.sales_orders;
        }
        response.end(JSON.stringify(result));
    });
})


// CART
router.get('/orders/:id', (request, response) => {
    const VIEW_DIR = request.app.get('VIEW_DIR');
    response.sendFile(path.join(VIEW_DIR, 'cart.html'));
});

router.put('/set-user-client', (request, response) => {
    let userId = request.session.user.user_id;
    let newClientId = request.body.client_id;
    pos.set_user_client(userId, newClientId, (err, result) => {
        if(!err){
            let client = (result.client || {});
            request.session.user.client_id = client.id;
            request.session.user.client_nickname = client.nickname;
            request.session.user.client_default_depot = client.default_depot;
            request.session.user.client_default_bank = client.default_bank;
            result.client = {id: client.id
                            , nickname: client.nickname
                            , default_depot: client.default_depot
                            , default_bank: client.default_bank};
        }
        response.writeHead(200, {'Content-Type': APPLICATION_JSON});
        response.end(JSON.stringify(result));
    });
});

router.get('/get-user-cart', (request, response) => {
    let userId = request.session.user.user_id;
    let clientId = request.session.user.client_id;
    pos.get_user_cart(userId, clientId, function(err, result){
        response.writeHead(200, {'Content-Type': APPLICATION_JSON});
        response.end(JSON.stringify(result));
    });
});

router.post('/get-user-cart', (request, response) => {
    let userId = request.body.user_id;
    let clientId = request.body.client_id;
    pos.get_user_cart(userId, clientId, function(err, result){
        response.writeHead(200, {'Content-Type': APPLICATION_JSON});
        response.end(JSON.stringify(result));
    });
});

router.put('/set-user-cart', (request, response) => {
    let userId = request.session.user.user_id;
    let orderId = request.body.order_id;
    pos.set_user_cart(userId, orderId, (err, result) => {
        //response.writeHead(200, {'Content-Type': APPLICATION_JSON});
        response.end(JSON.stringify(result));
    });
});

router.get('/get-cart-entries', (request, response) => {
    let userId = request.session.user.user_id;
    let clientId = request.session.user.client_id;
    let orderId = request.query.order_id;
    pos.get_cart_entries(userId, clientId, orderId, (err, result) => {
        response.writeHead(200, {'Content-Type': APPLICATION_JSON});
        response.end(JSON.stringify(result));
    });
});

router.post('/get-cart-entries', (request, response) => {
    let userId = request.body.user_id;
    //let userId = request.session.user.user_id;
    console.log(userId);
    let clientId = request.body.client_id;
    let orderId = request.query.order_id;
    pos.get_cart_entries(userId, clientId, orderId, (err, result) => {
        response.writeHead(200, {'Content-Type': APPLICATION_JSON});
        response.end(JSON.stringify(result));
    });
});

router.post('/orders/:id/entries', jsonParser, (request, response) => {
    let userId = request.session.user.user_id;
    let clientId = request.session.user.client_id;
    let orderId = request.params.id;
    let orderEntries = request.body.order_entries;
    let orderEntriesHstore = shared.make_hstore_list_from_data(orderEntries);
    pos.post_order_cart(userId, clientId, orderId, orderEntriesHstore, (err, result) => {
        response.writeHead(200, {'Content-Type': APPLICATION_JSON});
        response.end(JSON.stringify(result));
    });
});

router.put('/orders/:id/entries', (request, response) => {
    let userId = request.session.user.user_id;
    let clientId = request.session.user.client_id;
    let orderEntries = request.body.order_entries;
    let orderId = request.params.id;
    let orderEntriesHstore = shared.make_hstore_list_from_data(orderEntries);
    pos.put_order_cart(userId, clientId, orderId, orderEntriesHstore, (err, result) => {
        response.writeHead(200, {'Content-Type': APPLICATION_JSON});
        response.end(JSON.stringify(result));
    });
});


router.delete('/orders/:oid/entries/:eid', (request, response) => {
    let userId = request.session.user.user_id;
    let clientId = request.session.user.client_id;
    let entryId = request.params.eid;
    pos.delete_order_cart(userId, clientId, entryId, (err, result) => {
        response.writeHead(200, {'Content-Type': APPLICATION_JSON});
        response.end(JSON.stringify(result));
    });
});


// PAYMENT
router.post('/payment-entries', (request, response) => {
    let userId = request.session.user.user_id;
    let clientId = request.session.user.client_id;
    let paymentEntry = request.body.payment_entry;
    let denominationCounts = request.body.denomination_counts;
    let denominationCountHstore = shared.make_hstore_list_from_data(denominationCounts);
    let paymentEntryHstore = shared.make_hstore_list_from_data([paymentEntry])[0];
    pos.post_payment_entry(userId, clientId, paymentEntryHstore, denominationCountHstore, (err, result) => {
        response.writeHead(200, {'Content-Type': APPLICATION_JSON});
        response.end(JSON.stringify(result));
    });
});

//router.post('/payment-entries/:id/denomination-counts', (request, response) => {
//    let userId = request.session.user.user_id;
//    let clientId = request.session.user.client_id;
//    let paymentEntryId = request.params.id;
//    let denominationCounts = request.body.denomination_counts;
//    let denominationCountHstore = shared.make_hstore_list_from_data(denominationCounts);
//    pos.post_payment_entry_denomination_counts(userId, clientId, paymentEntryId, denominationCountHstore, (err, result) => {
//        response.writeHead(200, {'Content-Type': APPLICATION_JSON});
//        response.end(JSON.stringify(result));
//    });
//});

router.put('/payment-entries/:id', (request, response) => {
    let userId = request.session.user.user_id;
    let clientId = request.session.user.client_id;
    let paymentEntryId = request.params.id;
    let paymentEntry = request.body.payment_entry;
    let paymentEntryHstore = shared.make_hstore_list_from_data([paymentEntry])[0];
    pos.put_payment_entry(userId, clientId, paymentEntryId, paymentEntryHstore, (err, result) => {
        response.writeHead(200, {'Content-Type': APPLICATION_JSON});
        response.end(JSON.stringify(result));
    });
});

router.delete('/payment-entries', (request, response) => {
    let userId = request.session.user.user_id;
    let clientId = request.session.user.client_id;
    let payment_ids = request.body.payment_ids;
    pos.delete_payment_entries(userId, clientId, payment_ids, (err, result) => {
        response.writeHead(200, {'Content-Type': APPLICATION_JSON});
        response.end(JSON.stringify(result));
    });
});


// CHECKOUT
router.get('/orders/:id/summary', (request, response) => {
    const VIEW_DIR = request.app.get('VIEW_DIR');
    response.sendFile(path.join(VIEW_DIR, 'summary.html'));
});

router.get('/get-checkout-details', (request, response) => {
    let userId = request.session.user.user_id;
    let clientId = request.session.user.client_id;
    let user = request.session.user;
    let clientName = user.client_nickname;
    let clientDefaultDepot = user.client_default_depot;
    let clientDefaultBank = user.client_default_bank;
    let orderId = request.query.order_id;
    let sellerId = request.query.seller_id;
    let buyerId = request.query.buyer_id;
    async.series([
    function(callback){
        let salesOrder = {};
        if('seller_id' in request.query){
            salesOrder.seller_id = (sellerId == '' ? null : sellerId);
        }if('buyer_id' in request.query){
            salesOrder.buyer_id = (buyerId == '' ? null : buyerId);
        }
        if(salesOrder.seller_id || salesOrder.buyer_id){
            let salesOrderHstoreList = shared.make_hstore_list_from_data([salesOrder]);
            pos.put_order(userId, clientId, orderId, salesOrderHstoreList[0], (err, result) => {
                callback(err, result);
            });
        }else{callback(null, null);}
    }], function(err, result_list){
        let xrate = sharedMiddleware.default_currency.xrate;
        pos.get_checkout_details(userId, clientId, clientDefaultDepot, clientDefaultBank, orderId, xrate, (err2, result) => {
            if(err){
                result.error_message = result_list[0].error_message;
            }
            response.writeHead(200, {'Content-Type': APPLICATION_JSON});
            response.end(JSON.stringify(result));
        });
    });
});


//TODO
router.get('/get-checkout-payment-channel-currencies', (request, response) => {
    let userId = request.session.user.user_id;
    let clientId = request.session.user.client_id;
    let orderId = request.query.order_id;
    let customerId = request.query.customer_id;
    let paymentChannelId = request.query.payment_channel_id;
    let pset = {
                default_currency: 667,
                currency: {
                            667:{label:'USD', xrate:4.5, cap:6.50},
                            333:{label:'EUR', xrate:5.3, cap:3.20}
                    },
                };
    let result = {code:0, channel_currency: pset};
    response.writeHead(200, {'Content-Type': APPLICATION_JSON});
    response.end(JSON.stringify(result));
});


// STATUS
router.get('/orders/:id/status', (request, response) => {
    const VIEW_DIR = request.app.get('VIEW_DIR');
    response.sendFile(path.join(VIEW_DIR, 'order_status.html'));
});


router.get('/get-status-data', (request, response) => {
    let userId = request.session.user.user_id;
    let clientId = request.session.user.client_id;
    let clientDefaultDepot = request.session.user.client_default_depot;
    let orderId = request.query.order_id;
    pos.get_status_data(userId, clientId, orderId, (err, result) => {
        response.writeHead(200, {'Content-Type': APPLICATION_JSON});
        response.end(JSON.stringify(result));
    });
});


module.exports = router;
