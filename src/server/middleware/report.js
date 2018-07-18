let db = require('./database');
//var copyTo = require('pg-copy-streams').to;


let report = {};

report.get_report_by_id = (reportId, then) => {
    let result = {};
    let reportQuery = "select * from pos_api.v_report_get_products";
    db.pool.query(reportQuery, (err, res) => {
        if(!err && res.rowCount >= 0){
            result.code = 0;
            let rows = res.rows;
            let returnData = ""
            let objKeys = Object.keys(rows[0]);
            objKeys.forEach(ele => {
                if (ele == objKeys.slice(-1)[0]) {
                    returnData += ele.toUpperCase() + "\n";
                } else {
                    returnData += ele.toUpperCase() + ","
                }
            })
            rows.forEach(element => {
                for (let index = 0; index < objKeys.length; index++) {
                    const ind = objKeys[index];
                    if (element[`${ind}`] == element[`${objKeys.slice(-1)[0]}`]) {
                        returnData += element[`${ind}`] + "\n" ;
                    } else {
                        returnData += element[`${ind}`] + "," ;
                    }
                }

            });
            result.data = returnData;
            then(err, result);
        }
        else{
            let errorMessage = (err ? 'server error' : 'something went wrong')
                                + ' while fetching cart entries';
                                result.code = (err ? 1 : 2);
                                result.error_message = errorMessage;
                                then(err, result);
        }
    });
}


module.exports = report;
