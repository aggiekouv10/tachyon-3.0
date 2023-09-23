const helper = require('../main/helper');
const database = require('../main/database');
const { v4 } = require('uuid');
const site = 'DSG'; //site name
const catagory = 'AIO'
const version = `DSG v1.0` //Site version
const table = site.toLowerCase();
let oldlist
let PRODUCTS = {}
startMonitoring()
async function startMonitoring() {
    oldlist = await database.query(`SELECT * from ${table}`);
    for (let row of oldlist.rows) {
        PRODUCTS[row.sku] = {
            sku: row.sku,
            sizes: row.sizes
        }
        monitor(row.sku)
    }
    startSkus()
    console.log(`[${site}] Monitoring all SKUs!`)
}

async function monitor(sku) {
    try {
        let proxy = await helper.getRandomProxy(); //proxy per site
        let headers = {
            'User-Agent': "Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html",
            'X-FORWARDED-FOR': '8.8.8.8'
        }
        let method = 'GET'; //request method
        let req = `https://www.dickssportinggoods.com/p/spring/msvc/product/v5/store/15108/products/${sku}?abcz=${v4()}`//request url
        let set = await helper.requestJson(req, method, proxy, headers) //request function
        console.log(set.response.status)
        let body = await set.json
        if (set.response.status != 200) {
            monitor(sku)
            return
        }
        //Define body variables
        if (body.data.title) {
            let inStock = false;
            let url = 'https://www.dickssportinggoods.com' + body.data.pdpSeoUrl
            let title = body.data.title
            let price = "$" + body.data.price.maxOffer
            let image = `https://dks.scene7.com/is/image/GolfGalaxy/${body.data.id}_${body.data.skus[0].defAttributes[0].swatchImage.replace('_swatch', '')}`
            let stock = 0
            let sizes = []
            let oldSizeList = PRODUCTS[sku].sizes
            let sizeList = []
            let variants = body.data.skus
            let set = 0
            //pars sizes for loop
            for (let size of variants) {
                if (size.defAttributes.length > 1)
                    set = 1
                else {
                    set = 0
                }
                if (size.atsInventory > 0 && size.defAttributes[0].value.trim().length > 0) {
                    sizeList.push(size.id);
                    if (!oldSizeList.includes(size.id)) {
                        stock += size.atsInventory
                        sizes += `${size.defAttributes[set].value.trim()} (${size.atsInventory}) - ${size.id} \n`;
                        inStock = true;
                    }
                }
            }
            PRODUCTS[sku].sizes = sizeList
            if (inStock) {
                let AIO = await helper.hookpost("AIOFILTEREDUS")
                let sites = await helper.hookpost(catagory + site)
                let qt = 'Na'
                let links = 'Na'
                console.log(`[time: ${new Date().toISOString()}, product: ${sku}, title: ${title}]`)
                inStock = false;
                let sizeright = sizes.split('\n')
                let sizeleft = sizeright.splice(0, Math.floor(sizeright.length / 2))
                for (let group of sites) {
                    helper.postAIO(url, title, sku, price, image, sizeright, sizeleft, stock, group, version, qt, links)
                }
                for (let group of AIO) {
                    helper.postAIO(url, title, sku, price, image, sizeright, sizeleft, stock, group, version, qt, links)
                }
                await database.query(`update ${table} set sizes='${JSON.stringify(sizeList)}' where sku='${sku}'`);
                await helper.sleep(300000)

            }
        }
        await helper.sleep(1000);
        monitor(sku);
        return
    } catch (e) {
        //console.log(e)
        monitor(sku)
        return
    }
}
async function startSkus() {
    let SKUList = await database.query(`SELECT * from ${site.toLowerCase()}`);
    if (SKUList.rows.length > oldlist.rows.length) {
        PRODUCTS[SKUList.rows[SKUList.rows.length - 1].sku] = {
            sku: SKUList.rows[SKUList.rows.length - 1].sku,
            sizes: ''
        }
        monitor(SKUList.rows[SKUList.rows.length - 1].sku)
    }

    await helper.sleep(2000)
    startSkus()
}