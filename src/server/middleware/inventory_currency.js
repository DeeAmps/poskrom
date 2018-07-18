var db = require('./database');
var shared = require('./shared');


currency = {};

// TODO make currency of cart selectable, and in the navbar
// TODO add scale-factor to prices to enable correct scaling


currency.search_currency = (user_id, client_id, currency, filter, limit, then) => {
    db.pool.query('SELECT * FROM inventory_api.search_currency($1, $2, $3)'
                    , [currency, filter, limit || 10]
                    , (err, res) => {
        let result = {};
        if(!err){
            result.code = 0;
            let currencies = [];
            for(idx in res.rows){
                let row = res.rows[idx];
                let currency = {
                    id: row.bu_id,
                    label: row.bu_barcode.toUpperCase(),
                    xrate: row.bu_xrate,
                    symbol: row.bu_label,
                };
                currencies.push(currency);
            }
            //TODO result.default_currency = ;
            result.currencies = currencies;
            result.cursor = 'TODO';     // TODO
            then(err, result);
        }else{
            let errorMessage = (err ? 'server error' : 'something went wrong')
                                    + ' while fetching currency';
            result.code = (err ? 1 : 2);
            result.error_message = errorMessage;
            then(err, result);
        }
    });
};


currency.get_currency_denominations = (user_id, client_id, barcode_id, then) => {
    db.pool.query('SELECT * FROM inventory_api.get_currency_denominations($1)'
                    , [barcode_id]
                    , (err, res) => {
        let result = {};
        if(!err){
            result.code = 0;
            let denominations = [];
            for(idx in res.rows){
                let row = res.rows[idx];
                if(row.su_metric_scale == 100){
                    result.default_denomination = row.su_id;
                }
                let denom  = {
                    id: row.su_id,
                    label: row.su_label,
                    factor: row.su_metric_scale,
                };
                denominations.push(denom);
            }
            //TODO result.default_denomination = ;
            result.denominations = denominations;
            then(err, result);
        }else{
            let errorMessage = (err ? 'server error' : 'something went wrong')
                                    + ' while fetching currency denominations';
            result.code = (err ? 1 : 2);
            result.error_message = errorMessage;
            then(err, result);
        }
    });
};


module.exports = currency;
