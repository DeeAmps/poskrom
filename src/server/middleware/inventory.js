var db = require('./database');
var shared = require('./shared');


inventory = {};

// exports.authenticate = function authenticate
// (request, response, next){
//     if(request.session.user && request.cookies.user_sid){
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

inventory.filter_barter = function filterBarter
(user_id, client_id, depot_id, order_id, filter, limit, cursor, then){
    db.pool.query('SELECT * FROM inventory_api.filter_barter($1,$2,$3)'
                , [filter, limit, cursor], (err, res) => {
        let result = {products:[]};
        if (err) {
            result.code = 1;
            result.error_message = 'server error while search product';
            then(err, result);
        }else if(res.rowCount == 0){
            result.code = 0;
            then(err, result);
        }else if(res.rowCount > 1){
            // send the list of products to user to select a single one
            for(var idx in res.rows){
                let data = res.rows[idx];
                result.products.push({id: data.barter_id
                                        , name: data.barter_brand_name+' '+data.barter_category_name});
            }
            result.code = 0;
            then(err, result);
        }else{
            let data = res.rows[0];
            let barterName = data.barter_brand_name+' '+data.barter_category_name;
            inventory.fetch_client_depot_barter_stock(user_id, client_id, depot_id, order_id
                                    , data.barter_id, barterName
                                    , data.barcode_id, then);
        }
    });
};

inventory.fetch_client_depot_barter_stock = function fetchClientDepotBarterStock
(user_id, client_id, depot_id, order_id, barter_id, barter_name, barcode_id, then){
    db.pool.query('SELECT * FROM inventory_api.fetch_client_depot_barter_stock($1,$2,$3,$4,$5,$6)'
                , [user_id, client_id, depot_id, order_id, barter_id, barcode_id]
                , (err, res) => {
        let result = {};
        if (err) {
            result.code = 1;
            result.error_message = 'server error while fetching stock';
            then(err, result);
        }else{
            let cart = {order:[]};
            for(var idx in res.rows){
                let data = res.rows[idx];
                shared.inject_data_row_into_order_cart(data, cart);
            }
            let products = [];
            for(idx in cart.order){
                let entryId = cart.order[idx];
                let singleton = cart[entryId];
                products.push(singleton);
            }
            result.code = 0;
            result.products = products;
            then(err, result);
        }
    });
};

// let send401OnAuthenticationFail = (request, response, next) => {
//   if (!request.session.user) {
//     response.writeHead(401);
//     reponse.end('You do not have permission to access this resource.');
//   } else {
//     next();
//   }
// };

module.exports = inventory;
