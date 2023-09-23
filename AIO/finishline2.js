const helper = require('../main/helper');
const database = require('../main/database');
const { v4 } = require('uuid');
const site = 'FINISHLINE'; //site name
const catagory = 'AIO'
const version = `Finishline v2.0` //Site version
const table = site.toLowerCase();
let oldlist
let PRODUCTS = {}
startMonitoring()
async function startMonitoring() {
    oldlist = await database.query(`SELECT * from ${table}`);
    for (let row of oldlist.rows) {
        PRODUCTS[row.sku] = {
            sku: row.sku,
            waittime: row.waittime,
            sizes: row.sizes
        }
        monitor(row.sku)
    }
    startSkus()
    console.log(`[${site}] Monitoring all SKUs!`)
}

async function monitor(sku) {
    try {
        let product = PRODUCTS[sku]
        if (!product)
            return;
        let proxy = await helper.getRandomProxy(); //proxy per site
        let req = `https://prodmobloy2.finishline.com/api/products/v2/${sku}/${v4()}`
        //these headers change per site
        let headers = {
            'User-Agent': `Finish Line/2.7.3  (Android 2.7.3; Build/2.7.3)`,
            'welove': 'maltliquor',
        }
        let method = 'GET'; //request method
        let set = await helper.requestJson(req, method, proxy, headers) //request function
        console.log(set.response.status)
        let body = await set.json
        //Custom error handling
        if (body.statusCode == 499) {
            await helper.sleep(1000);
            monitor(sku);
            return
        }
        if (set.response.status != 200) {
            monitor(sku)
            return
        }
        //Define body variables
        if (body.displayName) {
            let inStock = false
            let title = body.displayName
            let stock = 0
            let sizes = []
            let oldSizeList = PRODUCTS[sku].sizes
            let sizeList = []
            let styleID = ''
            let colorID = ''
            let url = ''
            let colorDescription = ''
            let image = ''
            var price
            //pars sizes for loop
            for(product of body.colorWays) {
                styleID = product.styleId
                colorID = product.colorId
                colorDescription = product.colorDescription
                title = body.displayName + ' ' + product.colorDescription
                stock = 0
                sizes = []
                price = product.salePriceCents/100
                image = product.images[0].thumbnailUrl.replace('?$Thumbnail$', '')
                url = `https://www.finishline.com/store/product/YOU/${sku}?styleId=${styleID}&colorId=${colorID}#YOU`//product url
            for (variant of product.skus) {
                if (variant.quantityAvailable > 0) {
                sizeList.push(variant.skuId);
                if (!oldSizeList.includes(variant.skuId)) {
                    sizes += `${variant.size} (${variant.quantityAvailable}) - ${variant.skuId}\n`
                    stock += variant.quantityAvailable
                    inStock = true;
                }
                }
            }
            PRODUCTS[sku].sizes = sizeList
            if (inStock) {
                let AIO = await helper.hookpost("AIOFILTEREDUS")
                let sites = await helper.hookpost(catagory+site)
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
            }
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