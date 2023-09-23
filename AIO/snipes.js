const helper = require('../main/helper');
const database = require('../main/database');
const randomUseragent = require('random-useragent');
const { v4 } = require('uuid');
const site = 'SNIPESUS'; //site name
const catagory = 'AIO'
const version = `Snipes USA v1.0` //Site version
let oldlist
let PRODUCTS = {}
startMonitoring()
async function startMonitoring() {
    oldlist = await database.query(`SELECT * from ${site.toLowerCase()}`);
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
        let proxy = 'http://usa.rotating.proxyrack.net:9000'; //proxy per site
        //these headers change per site
        let headers = {
            'User-Agent': "Mozilla/5.0 (compatible; Google-Site-Verification/1.0)",
        }
        let method = 'GET'; //request method
        let req = `https://www-snipesusa-com.translate.goog/on/demandware.store/Sites-snipesusa-Site/en_US/Product-Variation?dwvar_${sku}_color&pid=${sku}&quantity=1&_x_tr_sl=el&_x_tr_tl=en&_x_tr_hl=en&_x_tr_pto=wapp`//request url
        let set = await helper.requestJson(req, method, proxy, headers) //request function
        let body = await set.json
        console.log(set.response.status)
        if (set.response.status == 404) {
            await helper.sleep(1000);
            monitor(sku);
            return
        }
        if (set.response.status != 200) {
            monitor(sku)
            return
        }

        //Define body variables
        if (body.product.releaseDate.productDateRelease) {
            let event = Date.parse(new Date(Date.now()).toISOString())
            let event1 = Date.parse(new Date(body.product.releaseDate.productDateRelease).toISOString())
            if (event1 > event) {
                //console.log('Not released yet')
                await helper.sleep(2000);
                monitor(sku)
                return
            }
        }
        if (body.product.productName) {
            let inStock = false
            let url = `https://www.snipesusa.com/${sku}.html#YOU`//product url
            let title = body.product.productName
            let price = body.product.price.sales.formatted
            let image = 'https://imageresize.24i.com/?w=300&url=' + body.product.images.zoom[0].url
            let stock = 0
            let sizes = []
            let oldSizeList = PRODUCTS[sku].sizes
            let sizeList = []
            let variants = body.product.variationAttributes[1].values
            //pars sizes for l
            for (let variant of variants) {
                if (variant.selectable != true)
                    continue
                sizeList.push(variant.displayValue);
                if (!oldSizeList.includes(variant.displayValue)) {
                    sizes += `[${variant.displayValue}](https://www.snipesusa.com/${sku}.html?size=${variant.displayValue})\n`
                    stock++
                    inStock = true;
                }
            }
            PRODUCTS[sku].sizes = sizeList
            if (inStock) {
                let AIO = await helper.hookpost(catagory + "FILTEREDUS")
                let sites = await helper.hookpost(catagory + site.split(' ').join(''))
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
                await database.query(`update ${site.toLowerCase()} set sizes='${JSON.stringify(sizeList)}' where sku='${sku}'`);

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
    if(SKUList.rows.length > oldlist.rows.length) {
        PRODUCTS[SKUList.rows[SKUList.rows.length - 1].sku] = {
            sku: SKUList.rows[SKUList.rows.length - 1].sku,
            sizes: ''
        }
        monitor(SKUList.rows[SKUList.rows.length - 1].sku)
    }

    await helper.sleep(2000)
    startSkus()
    }