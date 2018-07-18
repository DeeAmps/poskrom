let express = require('express');
let router = express.Router();
let path = require('path');
let report = require('../middleware/report');


const APPLICATION_JSON = 'application/json';


router.get('/', (request, response, failure) => {
    const VIEW_DIR = request.app.get('VIEW_DIR');
    response.sendFile(path.join(VIEW_DIR, 'report.html'));
});


//var jsonParser = bodyParser.json();


router.get('/reports', (request, response, failure) => {
    const VIEW_DIR = request.app.get('VIEW_DIR');
    response.sendFile(path.join(VIEW_DIR, 'reports.html'));
});


router.get('/get-reports', (request, response, failure) => {
    response.writeHead(200, {'Content-Type': APPLICATION_JSON});
    response.end(JSON.stringify(
        {reports: [
                {id: 1, name: 'report_1', caption: 'some report 1'},
                {id: 2, name: 'report_2', caption: 'some report 2'}
            ]
        }
    ));
});


router.get('/:id', (request, response) => {
    let reportId = request.params.id;
    report.get_report_by_id(reportId, (err, result) => {
        response.writeHead(200, {'Content-Type': APPLICATION_JSON});
        response.end(JSON.stringify(result));
    });
    // https://github.com/brianc/node-pg-copy-streams
    // select * from pos_data.v_report_get_products
    // response.end(JSON.stringify(
    //    {data:
    //      'barcode,brand,category,package,size,box,pack,piece,box_quantity,pack_quantity,  price_per_item\n'
    //       +'ADA WIPER,WIPES,,,12,,8,1,,GH?5.50\n'
    //       +'ADOM,TOILET ROLL,NO,120g/Roll,7,10,1\n'
    //       +'3393710001885,AFRICAN QUEEN,SARDIN,CAN,125g,50,,32,1,,GH?2.60'
    //    }
    // ));
});


module.exports = router;
