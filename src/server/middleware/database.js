const { Pool, Client } = require('pg')
database = { }
database.constant = {};
database.pool = new Pool({
    // TODO don't specify details in code
    user: '',
    host: '',
    database: '',
    password: '',
    port: 5432,
    max: 10,
    //idleTimeoutMillis: 0,
    //connectionTimeoutMillis: 3000,
})


database.pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err)
    //database.pool.end();
    //process.exit(-1)
})


database.pool.query('SELECT * FROM inventory_api.get_customer_constants() '
                    +' AS const(self_id bigint, anonymous_id bigint)', (err, res) => {
   if (!err && res.rowCount == 1) {
        database.constant.self_id = res.rows[0].self_id;
        database.constant.anonymous_id = res.rows[0].anonymous_id;
   }else{
        console.log(err ? 'server error: '+err : 'something went wrong');
   }
 });


/*
// single query
pool.query('SELECT * FROM users WHERE id = $1', [1], (err, res) => {
  if (err) {
    console.log('FAILED '+err);
  }else{
    console.log('user:', res.rows[0])
  }
})
// checkout a client
pool.connect((err, client, done) => {
  if (err) throw err
  client.query('SELECT * FROM users WHERE id = $1', [1], (err, res) => {
    done()
    if (err) {
      console.log(err.stack)
    } else {
      console.log(res.rows[0])
    }
  })
})
*/

module.exports = database;
