var async = require('async');
var db = require('./database');
var auth = require('./auth');
var shared = require('./shared');


let index = {}


index.refetch_login_data = (session, then) => {
    let nickname = session.user.nickname;
    let authHash = session.timestamp;
    let timestamp = session.auth_hash;
    index.unlock_login_data(session, nickname, authHash, timestamp, then);
};


index.fetch_login_data = (session, nickname, auth_hash, timestamp, then) => {
    index.unlock_login_data(session, nickname, auth_hash, timestamp, then);
};


index.unlock_login_data = (session, nickname, auth_hash, timestamp, then) => {
    async.parallel({
    user: function(callback){
        index.get_user_details(session, nickname, auth_hash, timestamp, (err, res) => {
            if(err || res.code != 0){
                err = res.error_message;
            }
            callback(err, (res || {}).user);
        });
    },
    currency: function(callback){
            callback(null, shared.default_currency);
    }}, function(err, result){
        if(err){
            result.error_message = err;
            result.code = 1;
        }else{
            result.code = 0;
        }
        then(err, result);
    });
};


index.get_user_details = (session, nickname, auth_hash, timestamp, then) => {
    db.pool.query('SELECT * FROM inventory_api.get_login_details($1);'
                    , [nickname.toLowerCase()], (err, res) => {
        let errorMessage = 'authentication failed; nickname and/or password is incorrect';
        let result = {};
        if(err){
            let errorMessage = 'server error while authenticating user';
            result.code = 1;
            result.error_message = errorMessage;
        }else if(res.rowCount == 1){
            let row = res.rows[0];
            let loginHash = row.login_hash;
            let checkHash = auth.generateAuthHash(loginHash + timestamp);
            if(auth_hash == checkHash){
                let user = {
                    user_id: row.id,
                    nickname: nickname,
                    default_depot: row.default_depot,
                    default_bank: row.default_bank,
                    client_id: row.client_id,
                    client_nickname: row.client_nickname,
                    client_default_depot: row.client_default_depot,
                    client_default_bank: row.client_default_bank,
                }
                setSessionData(session, loginHash, auth_hash, timestamp, user);
                result.code = 0;
                result.user = user;
            }else{
                result.code = 5;
                result.error_message = errorMessage;
            }
        }else{
            result.code = 2;
            result.error_message = errorMessage;
        }
        then(err, result);
    });
};


setSessionData = (session, private_key, auth_hash, timestamp, user) => {
    session.private_key = user.private_key;
    session.auth_hash = auth_hash;
    session.timestamp = timestamp;
    session.user = user;
}


module.exports = index;

