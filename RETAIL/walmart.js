
const helper = require('../main/helper');
const database = require('../main/database');
const randomUseragent = require('random-useragent');
const { v4 } = require('uuid');
const site = 'WALMARTUS'; //site name
const catagory = 'RETAIL'
const version = `Walmart US v1.0` //Site version
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
        let proxy = 'http://usa.rotating.proxyrack.net:9000'; //proxy per site
        //let agent = randomUseragent.getRandom(); //random agent per site
        //these headers change per site
        let headers = {
            'cookie': v4(),
            'user-agent': 'Mozilla/5.0 (compatible; Google-Site-Verification/1.0)',
            
        }
        let method = 'GET'; //request method
        let req = `https://www-walmart-com.translate.goog/ip/${v4()}/${sku}?_x_tr_sl=auto&_x_tr_tl=en&_x_tr_hl=en&_x_tr_pto=wapp&_x_tr_hist=true`//request url
        let set = await helper.requestWalmart(req, method, proxy, headers) //request function
        let body = set.body;
        let status = PRODUCTS[sku].sizes
        console.log(set.response.status)
        if (set.response.status == 404) {
            await helper.sleep(1000);
            monitor(sku);
            return
        }
        if (set.response.status != 200) {
            monitor(sku);
            return
        }
        if (body.props.pageProps.initialData.data.product.shippingOption.availabilityStatus && body.props.pageProps.initialData.data.product.fulfillmentType != 'STORE') {
            if (body.props.pageProps.initialData.data.product.sellerId == 'F55CDC31AB754BB68FE0B39041159D63' && body.props.pageProps.initialData.data.product.shippingOption.availabilityStatus == 'AVAILABLE') {
                let url = `https://www.walmart.com/ip/YOU/${sku}#YOU`
                let title = body.props.pageProps.initialData.data.product.name
                let price = body.props.pageProps.initialData.data.product.priceInfo.currentPrice.priceDisplay
                let image = body.props.pageProps.initialData.data.product.imageInfo.thumbnailUrl
                let stock = '1'
                let offerid = body.props.pageProps.initialData.data.product.offerId
                if (status !== "STOCK") {
                    let sites = await helper.hookpost(catagory + site)
                    let retail = await helper.hookpost("RETAILFILTEREDUS")
                    let qt = 'NA'
                    let links = `[ATC](http://goto.walmart.com/c/2242082/565706/9383?veh=aff&sourceid=imp_000011112222333344&prodsku=${sku}&u=http%3A%2F%2Faffil.walmart.com%2Fcart%2Fbuynow%3F%3Dveh%3Daff%26affs%3Dsdk%26affsdkversion%3D%26affsdktype%3Djs%26affsdkcomp%3Dbuynowbutton%26colorscheme%3Dorange%26sizescheme%3Dprimary%26affsdkreferer%3Dhttp%253A%252F%252Faffil.walmart.com%26items%3D${sku}%7C1%26upcs%3D)`
                    console.log(`[time: ${new Date().toISOString()}, product: ${sku}, title: ${title}]`)
                    for (let group of sites) {
                        await helper.postAmazon(url, title, sku, price, image, stock, offerid, group, version, qt, links)
                    }
                    for (let group of retail) {
                        helper.postAmazon(url, title, sku, price, image, stock, offerid, group, version, qt, links)
                    }
                    PRODUCTS[sku].sizes = 'STOCK'
                    database.query(`update ${table} set sizes='STOCK' where sku='${sku}'`)
                    await helper.sleep(2000)
                }
            } else {
                if (status !== "OOS") {
                    PRODUCTS[sku].sizes = 'OOS'
                    database.query(`update ${table} set sizes='OOS' where sku='${sku}'`)
                }
            }
        }
        await helper.sleep(1000);
        monitor(sku);
        return
    } catch (e) {
        console.log(e)
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
