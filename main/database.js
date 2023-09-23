const pg = require('pg');
const pool = new pg.Pool({
    user: 'postgres',
    host: '161.129.37.83',
    database: 'postgres',
    password: 'YOUmonitors3214',
    port: 5432,
});
module.exports = pool;
 function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
sleep(1000)