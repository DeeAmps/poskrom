let db = require('./database');

let shared = {}


let currencyLabel = 'standard currency';
let filter = 'GHC';
let limit = 1;
db.pool.query('SELECT *'
                + ', (inventory_api.get_currency_denominations(bu_id)).*'
                + ' FROM inventory_api.search_currency($1, $2, $3);'
                , [currencyLabel, filter, limit], (err, res) => {
    if(!err && res.rowCount > 0){
        let currency = {}
        let denominations = [];
        shared.default_currency = currency;
        currency.denominations = denominations;
        for(idx in res.rows){
            let row = res.rows[idx];
            let denominationId = row.su_id;
            let label = row.su_label;
            let factor = row.su_metric_scale;
            if(idx == 1){
                currency.id = row.c_id;
                currency.label = row.bu_barcode.toUpperCase();
                currency.symbol = row.bu_label;
                currency.xrate = row.bu_xrate;
            }
            if(factor == 100){
                currency.default_denomination = denominationId;
            }
            denominations.push({id: denominationId
                                , label: label
                                , factor: factor});
        }
    }else{
        let errorMessage = (err ? 'server error' : 'something went wrong')
                                + ' while fetching default currency';
    }
});


shared.inject_data_row_into_order_cart = (row, cart) => {
    let barterId = row.b_id;
    let entryId = ('soe_id' in row ? row.soe_id : barterId);
    let singleton = cart[entryId];
    if(singleton == null){
        singleton = {};
        singleton.id = row.b_id;
        singleton.name = row.b_brand+' '+row.b_category_name;
        singleton.barcode_unit = {order:[]};
        cart[entryId] = singleton;
        cart.order.push(entryId);
    }
    let barcodeUnit = singleton.barcode_unit;
    let barcodeUnitOrder = barcodeUnit.order;
    if(barcodeUnit[row.bu_id] == null) {
        let label = row.bu_label;
        let pack = row.bu_package;
        let packLabel = row.bu_package_label;
        let packSize = row.bu_package_size;
        let packSizeUnit = row.bu_package_size_unit;
        barcodeUnit.default_barcode_unit = row.default_barcode_unit;
        barcodeUnitOrder.push(row.bu_id);
        barcodeUnit[row.bu_id] = {};
        barcodeUnit[row.bu_id].barcode = row.bu_barcode;
        barcodeUnit[row.bu_id].label = (label ? label : '') + ' -'
                                        + (pack ? ' ' + pack : '')
                                        + (packLabel ? ' ' + packLabel : '')
                                        + (packSize ? ' ' + packSize + packSizeUnit : '');
        barcodeUnit[row.bu_id].stock_unit = {};
        barcodeUnit[row.bu_id].stock_unit.order = [];
    }
    let stock_unit = barcodeUnit[row.bu_id].stock_unit;
    let stockUnitOrder = barcodeUnit[row.bu_id].stock_unit.order;
    stock_unit.default_stock_unit = row.default_stock_unit;
    stockUnitOrder.push(row.su_id);
    stock_unit[row.su_id] = {};
    stock_unit[row.su_id].label = row.su_label;
    stock_unit[row.su_id].order_quantity = row.soe_quantity;
    stock_unit[row.su_id].depot = row.sie_depot;
    stock_unit[row.su_id].stock_quantity = row.stock_quantity;
    stock_unit[row.su_id].invoice_quantity = row.sie_quantity;
    stock_unit[row.su_id].unit_price = row.stock_price;
    stock_unit[row.su_id].price_currency = row.currency;
    // stock_unit[row.su_id].currency_xrate = row.xrate; // TODO
};


module.exports = shared;

