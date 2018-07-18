var db = require('./database');
var shared = require('./shared');


bank = {};


bank.get_client_bank = (user_id, client_id, client_default_bank, then) => {
    if(client_default_bank != null){
        db.pool.query('SELECT * FROM pos_api.get_client_bank($1, $2, $3, $4, $5)'
                        , [user_id, client_id, client_default_bank, db.constant.self_id, db.constant.anonymous_id]
                        , (err, res) => {
            let result = {};
            if(!err && res.rowCount == 1){
                let row = res.rows[0];
                result.code = 0;
                result.bank = {id: row.id, label:row.name};
                then(err, result);
            }else{
                let errorMessage = (err ? 'server error while fetching client bank'
                                        : 'access denied or no bank info found');
                result.code = (err ? 1 : 2);
                result.error_message = errorMessage;
                then(err, result);
            }
        });
    }else{
        then(null, {code:0, bank:{}});
    }
};


bank.search_client_bank = (user_id, client_id, customer_id, filter, limit, then) => {
    let sproc = 'inventory_api.search_client_bank';
    bank.search_bank(sproc, user_id, client_id, customer_id, filter, limit, then);
};


bank.search_payment_bank = (user_id, client_id, order_id, toggle, filter, limit, then) => {
    let sproc = 'pos_api.search_payment_bank';
    bank.search_bank(sproc, user_id, client_id, order_id, filter, limit, then);
};


bank.search_bank = (sproc, user_id, client_id, ref_id, filter, limit, then) => {
    let query = (sproc == 'pos_api.search_payment_bank'
                    ? 'SELECT * FROM '+sproc+'($1, $2, $3, $4, $5, $6, $7)'
                    : 'SELECT * FROM '+sproc+'($1, $2, $3, $4, $5)')
    let args = (sproc == 'pos_api.search_payment_bank'
                    ? [user_id, client_id, db.constant.self_id, db.constant.anonymous_id
                        , ref_id, filter, limit]
                    : [user_id, client_id, ref_id, filter, limit])
    db.pool.query(query, args, (err, res) => {
        let result = {};
        if(!err){
            result.code = 0;
            let bankList = [];
            for(idx in res.rows){
                let row = res.rows[idx];
                bankList.push({id: row.id, label: row.name});
            }
            result.banks = bankList;
            result.cursor = 'TODO'; // TODO
        }else{
            let errorMessage = (err ? 'server error' : 'something went wrong')
                                    + ' while fetching bank';
            result.code = (err ? 1 : 2);
            result.error_message = errorMessage;
        }
        then(err, result);
    });
};


// TODO code was copied from depot; what would it mean for banking??
bank.put_bank_stock = (user_id, client_id, bank_id, stock_unit_id, price_hstore_list, quantity_hstore, then) => {
    db.pool.query('SELECT * FROM inventory_api.update_bank_stock($1, $2, $3, $4, $5, $6)'
                    , [user_id, client_id, bank_id, stock_unit_id, price_hstore_list, quantity_hstore]
                    , (err, res) => {
        let result = {};
        if(!err && res.rowCount > 0){
            result.code = 0;
            result.stock_id = res.rows[0].id;
            then(err, result);
        }else{
            let errorMessage = (err ? 'server error' : 'something went wrong')
                                    + ' while updating stock';
            result.code = (err ? 1 : 2);
            result.error_message = errorMessage;
            then(err, result);
        }
    });
};


module.exports = bank;
