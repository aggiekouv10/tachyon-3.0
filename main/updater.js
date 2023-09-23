const fs = require("fs")
const helper = require('./helper');
const database = require('./databaselocal');
main()
async function main() {
    let sites = await helper.dbconnect()
    await database.query(`update sites set data='${JSON.stringify(sites)}'`);
    console.log('write operation done')
    await helper.sleep(60000)
    main()
}
