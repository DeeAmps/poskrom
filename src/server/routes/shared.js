
shared = {}

shared.make_hstore_list_from_data = function makeHstoreListFromData(data){
    let hstoreList = [];
    for(var idx in (data || [])){
        let entry = data[idx] || {};
        let hstore = [];
        for(var fld in entry){
            let val = entry[fld];
            hstore.push(fld + " => " + (val == null ? 'NULL'  : '"'+val+'"'));
        }
        hstoreList.push(hstore.join(','));
    }
    return hstoreList;
};


module.exports = shared;
