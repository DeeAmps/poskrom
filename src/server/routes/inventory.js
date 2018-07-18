var express = require('express');
var router = express.Router();
var path = require("path");

var auth = require('../middleware/auth');
var inventory = require('../middleware/inventory');

const APPLICATION_JSON = 'application/json';

// INVENTORY
router.get('/stock-in', (request, response) => {
    const VIEW_DIR = request.app.get('VIEW_DIR');
    response.sendFile(path.join(VIEW_DIR, 'stock-in.html'));
});

router.get('/bank', (request, response) => {
    const VIEW_DIR = request.app.get('VIEW_DIR');
    response.sendFile(path.join(VIEW_DIR, 'bank.html'));
});

router.get("/stock-in/add-product", (request, response)=>{
    const VIEW_DIR = request.app.get('VIEW_DIR');
    response.sendFile(path.join(VIEW_DIR, 'new_product.html'));
})

router.post('/stock-in/products', (request, response) => {
    let clientId = request.body.client_id;
    response.writeHead(200, {'Content-Type': APPLICATION_JSON});
    response.end(JSON.stringify(
        {
            code : 0,
            products : [
                {
                    productId : 1,
                    productName: "Milk",
                    barcodeUnit : [
                        {
                            barcodeId : "a3432",
                            barcodeName : "champ-box 125ml",
                            stockUnit : [
                                {
                                    stockId : "432",
                                    stockName : "can 425g"
                                },
                                {
                                    stockId : "662",
                                    stockName : "Box(16packs)"
                                }
                            ]
                        },
                        {
                            barcodeId : "a3432",
                            barcodeName : "Glass Bottle 2L",
                            stockUnit : [
                                {

                                    stockId : "435",
                                    stockName : "6 piece pack"

                                }
                            ]
                        }
                    ]
                },
                {
                    productId : 2,
                    productName: "Milo",
                    barcodeUnit : [

                    ]
                },
                {
                    productId : 3,
                    productName: "Coca Cola",
                    barcodeUnit : [

                    ]
                },
                {
                    productId : 4,
                    productName: "Ice Cream",
                    barcodeUnit : [

                    ]
                },
                {
                    productId : 5,
                    productName: "Cake",
                    barcodeUnit : [

                    ]
                }
            ]

        }
    ));
});

router.post('/stock-in/:id/barcode-unit', (request, response) => {
    let clientId = request.body.client_id;
    let productId = request.params.id;
    response.writeHead(200, {'Content-Type': APPLICATION_JSON});
    if (productId == 1) {
        response.end(JSON.stringify(
            {
                code : 0,
                barcodeunit : [
                    { barcodeUnitId: "23123131A", barcodeName : "1 litre" },
                    { barcodeUnitId: "43123131A", barcodeName : "2 boxes" },
                    { barcodeUnitId: "57523131A", barcodeName : "1.5 litres" }
                ]

            }));
    }else if(productId == 2) {
        response.end(JSON.stringify(
            {
                code : 0,
                barcodeunit : [
                    { barcodeUnitId: "23123131A", barcodeName : "2 cans" },
                    { barcodeUnitId: "43123131A", barcodeName : "2 gallons" },
                    { barcodeUnitId: "57523131A", barcodeName : "1.5 kilograms" }
                ]

            }));
    }else{
        response.end(JSON.stringify(
            {
                code : 0,
                barcodeunit : [
                    { barcodeUnitId: "23123131A", barcodeName : "1 gram" },
                    { barcodeUnitId: "43123131A", barcodeName : "2 litres" },
                    { barcodeUnitId: "57523131A", barcodeName : "1.5 gallons" }
                ]

            }));
    }

})

router.get('/depot', (request, response) => {
    const VIEW_DIR = request.app.get('VIEW_DIR');
    response.sendFile(path.join(VIEW_DIR, 'depot.html'));
});



router.get('/get-client-depot-barter-stock', (request, response, failure) => {
    let userId = request.session.user.user_id;
    let clientId = request.session.user.client_id;
    let depotId = request.query.depot_id;
    let orderId = request.query.order_id;
    let barterId = request.query.barter_id;
    let barcodeId = request.query.barcode_id;
    let barterName = request.query.barter_name;
    inventory.fetch_client_depot_barter_stock
                (userId, clientId, depotId, orderId, barterId, barterName, barcodeId
                    , (err, result) => {
        response.writeHead(200, {'Content-Type': APPLICATION_JSON});
        response.end(JSON.stringify(result));
    });
});


// search for product across the depots of a client
router.get('/search-client-depot-stock', (request, response, failure) => {
    let userId = request.session.user.user_id;
    let clientId = request.session.user.client_id;
    let clientDefaultDepot = request.session.user.client_default_depot;
    let depotId = request.query.depot_id || clientDefaultDepot;
    let orderId = request.query.order_id;
    let filter = request.query.filter.toLowerCase();
    let limit = (request.query.limit || 10);
    let cursor = request.query.cursor;
    inventory.filter_barter(userId, clientId, depotId, orderId, filter, limit, cursor
                                , (err, result) => {
        response.writeHead(200, {'Content-Type': APPLICATION_JSON});
        response.end(JSON.stringify(result));
    });
});

router.post('/search-client-depot-stock', (request, response, failure) => {
    let userId = request.body.user_id;
    let clientId = request.body.client_id;
    let clientDefaultDepot = request.body.client_default_depot;
    let depotId = request.query.depot_id || clientDefaultDepot;
    let orderId = request.query.order_id;
    let filter = request.query.filter.toLowerCase();
    let limit = (request.query.limit || 10);
    let cursor = request.query.cursor;
    inventory.filter_barter(userId, clientId, depotId, orderId, filter, limit, cursor
                                , (err, result) => {
        response.writeHead(200, {'Content-Type': APPLICATION_JSON});
        response.end(JSON.stringify(result));
    });
});


module.exports = router;
