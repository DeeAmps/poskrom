var db = require('./database');
var shared = require('./shared');


let customer = {};


customer.search_client = (user_id, client_id, filter, limit, then) => {
    customer.search_customer
        ('inventory_api.search_client', user_id, client_id, null, filter, limit, then);
};


customer.search_seller = (user_id, client_id, order_id, filter, limit, then) => {
    customer.search_customer
        ('pos_api.search_seller', user_id, client_id, order_id, filter, limit, then);
};


customer.search_buyer = (user_id, client_id, order_id, filter, limit, then) => {
    customer.search_customer
        ('pos_api.search_buyer', user_id, client_id, order_id, filter, limit, then);
};


customer.search_customer = (sproc, user_id, client_id, order_id, filter, limit, then) => {
    let query = (sproc == 'inventory_api.search_client'
                    ? 'SELECT * FROM '+sproc+'($1, $2, $3, $4, $5, $6)'
                    : 'SELECT * FROM '+sproc+'($1, $2, $3, $4, $5, $6, $7)');
    let args = (sproc == 'inventory_api.search_client'
                    ? [user_id, client_id, db.constant.self_id
                        , db.constant.anonymous_id, filter, limit]
                    : [user_id, client_id, db.constant.self_id
                        , db.constant.anonymous_id, order_id, filter, limit])
    db.pool.query(query, args, (err, res) => {
        let result = {};
        if(!err){
            result.code = 0;
            let customerList = [];
            for(idx in res.rows){
                let row = res.rows[idx];
                customerList.push({id: row.id
                                    , label: row.nickname
                                    , default_depot: row.default_depot
                                    , default_bank: row.default_bank});
            }
            result.customers = customerList;
            result.cursor = 'TODO'; // TODO
        }else{
            let errorMessage = (err ? 'server error' : 'something went wrong')
                                    + ' while fetching customer';
            result.code = (err ? 1 : 2);
            result.error_message = errorMessage;
        }
        then(err, result);
    });
};


module.exports = customer;
