var db = require('./database');
var shared = require('./shared');


depot = {};


depot.search_client_depot = (user_id, client_id, customer_id, filter, limit, then) => {
    let sproc = 'inventory_api.search_client_depot';
    depot.search_depot(sproc, user_id, client_id, customer_id, filter, limit, then);
};


depot.search_stock_in_depot = (user_id, client_id, order_id, filter, limit, then) => {
    let sproc = 'pos_api.search_stock_in_depot';
    depot.search_depot(sproc, user_id, client_id, order_id, filter, limit, then);
};


depot.search_depot = (sproc, user_id, client_id, ref_id, filter, limit, then) => {
    let query = (sproc == 'pos_api.search_stock_in_depot'
                    ? 'SELECT * FROM '+sproc+'($1, $2, $3, $4, $5, $6, $7)'
                    : 'SELECT * FROM '+sproc+'($1, $2, $3, $4, $5)')
    let args = (sproc == 'pos_api.search_stock_in_depot'
                    ? [user_id, client_id, db.constant.self_id, db.constant.anonymous_id
                        , ref_id, filter, limit]
                    : [user_id, client_id, ref_id, filter, limit])
    db.pool.query(query, args, (err, res) => {
        let result = {};
        if(!err){
            result.code = 0;
            let depotList = [];
            for(idx in res.rows){
                let row = res.rows[idx];
                depotList.push({id: row.id, label: row.name});
            }
            result.depots = depotList;
            result.cursor = 'TODO'; // TODO
        }else{
            let errorMessage = (err ? 'server error' : 'something went wrong')
                                    + ' while fetching depot';
            result.code = (err ? 1 : 2);
            result.error_message = errorMessage;
        }
        then(err, result);
    });
};


// TODO make currency of cart selectable, and in the navbar
// TODO add scale-factor to prices to enable correct scaling

depot.put_depot_stock = (user_id, client_id, depot_id, stock_unit_id, price_hstore_list, quantity_hstore, then) => {
    db.pool.query('SELECT * FROM inventory_api.update_depot_stock($1, $2, $3, $4, $5, $6)'
                    , [user_id, client_id, depot_id, stock_unit_id, price_hstore_list, quantity_hstore]
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


module.exports = depot;

