let async = require('async');
let db = require('./database');
let shared = require('./shared');
let bank = require('./inventory_bank');

let pos = {};


pos.get_user_cart = (user_id, client_id, then) =>{
    let anonymous_id = db.constant.anonymous_id;
    let self_id = db.constant.self_id;
    let result = {};
    db.pool.query('SELECT pos_api.get_user_cart_id($1, $2, NULL, $3, $4)'
                        , [user_id, client_id, self_id, anonymous_id], (err, res) => {
        if(!err && res.rowCount == 1 && res.rows[0].get_user_cart_id != null){
            let row = res.rows[0];
            let cartId = row.get_user_cart_id;
            result.cart_id = cartId;
            result.code = 0;
            then(err, result);
        }else{
            let errorMessage = (err ? 'server error' : 'something went wrong')
                                    + ' while fetching user cart';
            result.code = (err ? 1 : 2);
            result.error_message = errorMessage;
            then(err, result);
        }
    });
};


pos.set_user_cart = (user_id, order_id, then) => {
    db.pool.query('SELECT * FROM pos_api.set_user_cart_id($1, $2, $3, $4);'
                    , [user_id, order_id, db.constant.self_id, db.constant.anonymous_id]
                    , (err, res) => {
        result = {};
        if(!err){
            let cartId = res.rows[0].set_user_cart_id;
            result = {code: 0, cart_id: cartId};
            if(order_id != cartId){
                result.failure = 'cannot set cart; invalid or out-of-bounds';
            }
        }else{
            result.code = 1;
            result.error_message = 'server error while setting user-cart';
        }
        then(err, result);
    });
};


pos.set_user_client = (user_id, client_id, then) => {
    db.pool.query('SELECT * FROM inventory_api.set_user_client_id($1, $2, $3, $4)'
                    , [user_id, (client_id || null), db.constant.self_id, db.constant.anonymous_id]
                    , (err, res) => {
        let result = {};
        if(!err && res.rowCount == 1){
            result.code = 0;
            result.client = res.rows[0];
            result.client.login_hash = null;    // private key
        }else{
            let errorMessage = (err ? 'server error' : 'something went wrong')
                                    + ' while fetching client';
            result.code = (err ? 1 : 2);
            result.error_message = errorMessage;
        }
        then(err, result);
    });
};


// ORDER
pos.get_sales_order = (user_id, client_id, order_id, order_type, xrate, cursor, limit, then) => {
    db.pool.query('SELECT * FROM pos_api.get_sales_order($1, $2, $3, $4, $5, $6, $7, $8, $9)'
                    , [user_id, client_id, order_id, order_type, xrate
                        , db.constant.self_id, db.constant.anonymous_id, cursor, limit]
                    , (err, res) => {
        let result = {};
                    //    , db.constant.self_id, db.constant.anonymous_id, cursor, limit]);
        if(!err && (order_id == null || res.rowCount > 0)){
            let salesOrders = [];
            for(idx in res.rows){
                let row = res.rows[idx];
                salesOrders.push({
                            order_id: row.id,
                            reference: row.reference,
                            created_on: row.created_on,
                            creator: {id: row.creator_id, label: row.creator_label},
                            client: {id: row.client_id, label: row.client_label},
                            seller: {id: row.seller_id, label: row.seller_label},
                            buyer: {id: row.buyer_id, label: row.buyer_label},
                            stock_in_depot: {id: row.stock_in_depot_id, label: row.stock_in_depot_label},
                            amount: row.amount,
                            paid: row.paid,
                            status: row.status,
                        });
            }
            result.code = 0;
            result.sales_orders = salesOrders;
            then(err, result);
        }else{
            let errorMessage = (err ? 'server error while fetching order'
                                    : 'order does not exist or access denied');
            result.code = (err ? 1 : 2);
            result.error_message = errorMessage;
            then(err, result);
        }
    });
};

pos.post_order = (user_id, client_id, sales_order, then) => {
    let referenceCode = sales_order.reference_code;
    let isSalesRep = (client_id != null && user_id != client_id);
    let sellerId = sales_order.seller_id || null;
    let buyerId = sales_order.buyer_id || null;
    let isSale = (sellerId == buyerId
                    ? null
                    : (sellerId == null
                        ? false
                        :(buyerId == null
                            ? true
                            : (sellerId == client_id
                                ? true
                                : (buyerId == client_id ? false : null)))));
    let sellerLedgerId = sales_order.seller_ledger_id;
    let buyerLedgerId = sales_order.buyer_ledger_id;
    let self_id = db.constant.self_id;
    let anonymous_id = db.constant.anonymous_id;
    db.pool.query('SELECT * FROM pos_api.create_sales_order((NULL, $1, $2, $3'
                    + ' , $4, $5, $6, $7, NULL, NULL, NULL, NULL, NULL, NULL), $8, $9);'
                    , [referenceCode, user_id, isSale, sellerId, buyerId
                    , sellerLedgerId, buyerLedgerId, self_id, anonymous_id]
                    , (err, res) => {
        let result = {};
        if(!err && res.rowCount == 1){
            let orderId = res.rows[0].id;
            pos.set_user_cart(user_id, orderId, (err, res) => {
                res.order_id = orderId;
                result = res;
                then(err, result);
            });
        }else{
            let errorMessage = (err ? 'server error' : 'something went wrong')
                                    + ' while creating order';
            result.code = (err ? 1 : 2);
            result.error_message = errorMessage;
            then(err, result);
        }
    });
};


pos.put_order = (user_id, client_id, order_id, order_hstore, then) => {
    db.pool.query('SELECT * FROM pos_api.update_sales_order($1, $2, $3, $4, $5, $6)'
                    , [user_id, client_id, order_id, order_hstore
                    , db.constant.self_id, db.constant.anonymous_id]
                    , (err, res) => {
        let result = {};
        if(!err && res.rowCount == 1){
            result.code = 0;
            result.order_id = res.rows[0].id
            then(err, result);
        }else{
            let errorMessage = (err ? 'server error' : 'something went wrong')
                                + ' while updating sales-order;'
                                + ' before closing orders, ensure all cart entries are priced.';
            result.code = (err ? 1 : 2);
            result.error_message = errorMessage;
            then(err, result);
        }
    });
};

pos.delete_order = (user_id, client_id, order_id, then) => {
    db.pool.query('SELECT pos_api.delete_sales_order($1, $2, $3, $4, $5)'
                    , [user_id, client_id, order_id
                    , db.constant.self_id, db.constant.anonymous_id]
                    , (err, res) => {
        let result = {};
        if(!err && res.rowCount == 1){
            result.code = 0;
            then(err, result);
        }else{
            let errorMessage = (err ? 'server error' : 'something went wrong')
                                + ' while deleting order;'
                                + ' ensure there are no payments, or it is not closed';
            result.code = (err ? 1 : 2);
            result.error_message = errorMessage;
            then(err, result);
        }
    });
};


// CART (sales-order/sales-invoice)
pos.get_cart_entries = (user_id, client_id, order_id, then) => {
    pos.get_sales_entries('pos_api.get_user_cart_entries', user_id, client_id, order_id, then);
};

pos.get_invoice_entries = (user_id, client_id, order_id, then) => {
    pos.get_sales_entries('pos_api.get_sales_invoice_entries', user_id, client_id, order_id, then);
};

pos.get_sales_entries = (sproc, user_id, client_id, order_id, then) => {
    db.pool.query('SELECT * FROM '+sproc+'($1, $2, $3, $4, $5)'
                    , [user_id, client_id, order_id, db.constant.self_id, db.constant.anonymous_id]
                    , (err, res) => {
        let result = {}
        if(!err && res.rowCount > 0){
            result.code = 0;
            result.entries = [];
            let rows = res.rows;
            let cart = {order:[]};
            for(idx in rows){
                let data = rows[idx];
                if(idx == 0){
                    result.reference_code = data.so_reference_code;
                    result.order_type = data.so_type;
                    result.order_status = data.so_status;
                    result.total_cost = data.total_cost;
                    result.amount_paid = data.amount_paid;
                }
                if(data.soe_id != null){
                    shared.inject_data_row_into_order_cart(data, cart);
                }
            }
            for(idx in cart.order){
                let entryId = cart.order[idx];
                let singleton = cart[entryId];
                result.entries.push({id:entryId,  product:singleton});
            }
            then(err, result);
        }else{
            let obj = (sproc == 'pos_api.get_sales_invoice_entries' ? 'invoice' : 'cart')
            let errorMessage = (err ? 'server error while fetching cart entries'
                                    : obj+' does not exist or access denied');
            result.code = (err ? 1 : 2);
            result.error_message = errorMessage;
            then(err, result);
        }
    });
};


pos.post_order_cart = (user_id, client_id, order_id, sales_order_entries, then) => {
    db.pool.query('SELECT * FROM pos_api.create_sales_order_entries($1, $2, $3, $4, $5, $6)'
                    , [user_id, client_id, order_id, sales_order_entries
                    , db.constant.self_id, db.constant.anonymous_id]
                    , (err, res) => {
        let result = {};
        if(!err && res.rowCount > 0){
            result.code = 0;
            result.order_entry_ids = [];
            for(var idx in res.rows){
                result.order_entry_ids.push(res.rows[idx].id);
            }
            then(err, result);
        }else{
            let errorMessage = (err ? 'server error while creating sales-order-entry'
                                    : 'cart does not exist or access denied');
            result.code = (err ? 1 : 2);
            result.error_message = errorMessage;
            then(err, result);
        }
    });
};

pos.put_order_cart = (user_id, client_id, order_id, sales_order_entries, then) => {
    db.pool.query('SELECT * FROM pos_api.update_sales_order_entries($1, $2, $3, $4, $5, $6)'
                    , [user_id, client_id, order_id, sales_order_entries
                    , db.constant.self_id, db.constant.anonymous_id]
                    , (err, res) => {
        let result = {};
        if(!err && res.rowCount > 0){
            result.code = 0;
            result.order_entry_ids = [];
            for(var idx in res.rows){
                result.order_entry_ids.push(res.rows[idx].id);
            }
            then(err, result);
        }else{
            let errorMessage = (err ? 'server error' : 'something went wrong')
                                + ' while updating sales-order-entry;'
                                + ' in case you tried to close the order, ensure all entries are priced.';
            result.code = (err ? 1 : 2);
            result.error_message = errorMessage;
            then(err, result);
        }
    });
};

pos.delete_order_cart = (user_id, client_id, entry_id, then) => {
    db.pool.query('SELECT pos_api.delete_sales_order_entries($1, $2, $3, $4, $5)'
                    , [user_id, client_id, [entry_id], db.constant.self_id, db.constant.anonymous_id]
                    , (err, res) => {
        let result = {};
        if(!err && res.rowCount > 0){
            result.code = 0;
            result.order_entry_ids = [];
            for(var idx in res.rows){
                result.order_entry_ids.push(res.rows[idx].id);
            }
            then(err, result);
        }else{
            let errorMessage = (err ? 'server error' : 'something went wrong')
                                + ' while deleting sales-order-entry';
            result.code = (err ? 1 : 2);
            result.error_message = errorMessage;
            then(err, result);
        }
    });
};


// CHECKOUT
pos.get_checkout_details = (user_id, client_id, client_default_depot
                            , client_default_bank, order_id, xrate, then) => {
    async.parallel({
    sales_order: function(callback){
                    pos.get_sales_order(user_id, client_id, order_id, null, xrate, null, 1, (err, res) => {
                        if(err || res.code != 0){
                            err = res.error_message;
                        }
                        callback(err, (res.sales_orders || [])[0]);
                    });
    },
    default_credit_bank: function(callback){
                    bank.get_client_bank(user_id, client_id, client_default_bank, (err, res) => {
                        if(err || res.code != 0){
                            err = res.error_message;
                        }
                        callback(err, res.bank);
                    });
    },
    payments: function(callback){
                    pos.get_order_payment_entries(user_id, client_id, order_id, (err, res) => {
                        if(err || res.code != 0){
                            err = res.error_message;
                        }
                        callback(err, res.payment_entries);
                    });
    },
    payment_config: function(callback){
                    // TODO
                    let payment_config = {
                        default_payment_channel:8,
                        payment_channel: {
                                    8:{label: 'cash'},
                        },
                        default_payment_channel_currency:{
                            default_currency:2,
                            currency: {
                                    2:{label:'GHC', xrate:1, cap:'-', symbol: 'GH₵'},
                            },
                        },
                        default_payment_channel_currency_denominations: shared.default_currency
                    };
                    callback(null, payment_config);
    }}, function(err, result){
        if(!err){
            result.code = 0;
            result.invoice_price = {xrate:1, amount:(result.sales_order || {}).amount};
            result.default_checkout_currency = shared.default_currency;
        }else{
            result.code = 1;
            result.error_message = err;
        }
        then(err, result);
    });
};

//pos.calculate_sales_invoice_price = (user_id, client_id, order_id, xrate, then) => {
//    db.pool.query('SELECT pos_api.calculate_sales_invoice_price($1, $2, $3, $4, $5, $6);'
//                    , [user_id, client_id, order_id, xrate
//                    , db.constant.self_id, db.constant.anonymous_id]
//                    , (err, res) => {
//        let result = {};
//        if(!err && res.rowCount == 1){
//            let row = res.rows[0];
//            result.code = 0;
//            result.invoice_price = row.calculate_sales_invoice_price;
//            then(err, result);
//        }else{
//            let errorMessage = (err ? 'server error' : 'something went wrong')
//                                    + ' while calculating sales-invoice price';
//            result.code = (err ? 1 : 2);
//            result.error_message = errorMessage;
//            then(err, result);
//        }
//    });
//};


pos.get_order_payment_entries = (user_id, client_id, order_id, then) => {
    db.pool.query('SELECT * FROM pos_api.get_order_payment_entries($1, $2, $3, $4, $5);'
                    , [user_id, client_id, order_id, db.constant.self_id, db.constant.anonymous_id]
                    , (err, res) => {
        let result = {};
        if(!err){
            let paymentEntries = [];
            for(idx in res.rows){
                let row = res.rows[idx];
                paymentEntries.push({
                        id: row.payment_id
                        , created_on: row.created_on
                        , amount: row.amount                        // to be used as a checksum on FE
                        , channel: {id: row.payment_channel_id, label: row.payment_channel_label}
                        , debitor: {id: row.debitor_id, label: row.debitor_label}
                        , currency: {id: row.currency_id, label: row.currency_label, xrate: row.xrate}
                        , denominations: (row.denominations || [])
                                            .map((d)=>{return {
                                                        id: d[0]
                                                        , label: d[1]
                                                        , factor: d[2]
                                                        , count: d[3]
                                                        };})
                    });
            }
            result.code = 0;
            result.payment_entries = paymentEntries;
            then(err, result);
        }else{
            let errorMessage = (err ? 'server error' : 'something went wrong')
                                    + ' while fetching payment entries';
            result.code = (err ? 1 : 2);
            result.error_message = errorMessage;
            then(err, result);
        }
    });
};

pos.post_payment_entry = (user_id, client_id, entry_hstore, denomination_counts_hstore, then) => {
    db.pool.query('SELECT * FROM pos_api.create_payment_entry($1, $2, $3, $4, $5, $6);'
                    , [user_id, client_id, entry_hstore, denomination_counts_hstore
                    , db.constant.self_id, db.constant.anonymous_id]
                    , (err, res) => {
        let result = {};
        if(!err && res.rowCount == 1){
            let row = res.rows[0];
            result.code = 0;
            result.payment = {id: row.id};
            then(err, result);
        }else{
            let errorMessage = (err ? 'server error while creating payment'
                                    : 'payment could not be carried out');
            result.code = (err ? 1 : 2);
            result.error_message = errorMessage;
            then(err, result);
        }
    });
};

//pos.post_payment_entry_denomination_counts = (userId, clientId, payment_entry_id, denomination_counts_hstore, then) => {
//    db.pool.query('SELECT pos_api.append_payment_entry_denomination_counts($1, $2, $3, $4, $5, $6)'
//                    , [user_id, client_id, payment_entry_id, denomination_counts_hstore
//                    , db.constant.self_id, db.constant.anonymous_id]
//                    , (err, res) => {
//        let result = {};
//        if(!err && res.rowCount > 0){
//            //let row = res.rows[0];
//            result.code = 0;
//            then(err, result);
//        }else{
//            let errorMessage = (err ? 'server error' : 'something went wrong')
//                                    + ' while creating payment';
//            result.code = (err ? 1 : 2);
//            result.error_message = errorMessage;
//            then(err, result);
//        }
//    });
//
//};

// NB: only for info like bank, customer, etc; not for denomination_counts
pos.put_payment_entry = (user_id, client_id, payment_entry_id, payment_entry_hstore, then) => {
    db.pool.query('SELECT pos_api.create_payment_entry($1, $2, $3, $4, $5, $6)'
                    , [user_id, client_id, payment_entry_id, payment_entry_hstore
                    , db.constant.self_id, db.constant.anonymous_id]
                    , (err, res) => {
        let result = {};
        if(!err && res.rowCount == 1){
            let row = res.rows[0];
            result.code = 0;
            result.payment = {id: row.id};
            then(err, result);
        }else{
            let errorMessage = (err ? 'server error' : 'something went wrong')
                                    + ' while creating payment';
            result.code = (err ? 1 : 2);
            result.error_message = errorMessage;
            then(err, result);
        }
    });
};

pos.delete_payment_entries = (user_id, client_id, payment_ids, then) => {
    db.pool.query('SELECT pos_api.delete_payment_entries($1, $2, $3, $4, $5)'
                    , [user_id, client_id, payment_ids
                    , db.constant.self_id, db.constant.anonymous_id]
                    , (err, res) => {
        let result = {};
        if(!err && res.rowCount > 0){
            let payment_ids = [];
            for(row in res.rows){
                payment_ids.push({id:row.id});
            }
            result.code = 0;
            result.payment_ids = payment_ids;
            then(err, result);
        }else{
            let errorMessage = (err ? 'server error while deleting payment'
                                    : 'payment could not be deleted');
            result.code = (err ? 1 : 2);
            result.error_message = errorMessage;
            then(err, result);
        }
    });
};


// STATUS
pos.get_status_data = (user_id, client_id, order_id, then) => {
    async.parallel({
    res: function(callback){
        pos.get_invoice_entries(user_id, client_id, order_id, (err, res) => {
            if(err || res.code != 0){
                err = res.error_message;
            }
            callback(err, res);
        });
    }}, function(err, result){
        let res = result.res || {};
        if(!err){
            res.code = 0;
        }else{
            res.code = 1;
            res.error_message = err;
        }
        then(err, res);
    });
};



module.exports = pos;
