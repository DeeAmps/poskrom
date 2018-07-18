var db = require('./database');

let client = {}

client.filter_client = function filterClient(filter, then){
    let result = {clients: [{clientid: 1, clientname:'anonymous'}]};
    then(null, {code:0, data:result});
};

module.exports = client;

