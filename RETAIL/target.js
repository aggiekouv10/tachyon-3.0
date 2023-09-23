const helper = require('../main/helper');
const database = require('../main/database');
const randomUseragent = require('random-useragent');
const { v4 } = require('uuid');
const site = 'TARGET'; //site name
const catagory = 'RETAIL'
const version = `Target v1.0` //Site version
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
        let proxy = await helper.getRandomProxy()//proxy per site
        let headers = {
            'User-Agent': "Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html",
            'X-FORWARDED-FOR': '8.8.8.8'
        }
        let method = 'GET'; //request method
        let req = `https://redsky.target.com/redsky_aggregations/v1/web_platform/product_fulfillment_v1?key=9f36aeafbe60771e321a7cc95a78140772ab3e96&is_bot=false&tcin=${sku}&visitor_id=${v4()}&channel=WEB`//request url
        let set = await helper.requestJson(req, method, proxy, headers)
        console.log(set.response.status)
        if (set.response.status != 200) {
            monitor(sku);
            return
        }
        let body = await set.json //request function
        let status = PRODUCTS[sku].sizes
        if (body.data.product.fulfillment.shipping_options.availability_status === 'IN_STOCK') {
            let url = `https://www.target.com/p/YOU/-/A-${sku}#YOU`
            let stock = body.data.product.fulfillment.shipping_options.available_to_promise_quantity
            if (status !== "STOCK") {
                let qt = 'NA'
                let links = `[ATC](https://www.target.com/s?searchTerm=${sku}#YOU)`
                let req = `http://redsky.target.com/redsky_aggregations/v1/web/pdp_client_v1?key=ff457966e64d5e877fdbad070f276d18ecec4a01&tcin=${sku}&store_id=3254&has_store_id=false&pricing_store_id=3254&has_pricing_store_id=true&scheduled_delivery_store_id=none&has_scheduled_delivery_store_id=false&has_financing_options=false&&has_size_context=true&_x_tr_sl=el&_x_tr_tl=en&_x_tr_hl=en&_x_tr_pto=wapp`//request url
                let set = await helper.requestJson(req, method, proxy, headers) //request function
                if (set.response.status != 200) {
                    monitor(sku);
                    return
                }
                let sites = await helper.hookpost(catagory + site)
                let retail = await helper.hookpost("RETAILFILTEREDUS")
                let body2 = await set.json
                let title = body2.data.product.item.product_description.title.split('&#38;').join('&').split('&#8482;').join('™').split('&#8211;').join('-')
                let image = body2.data.product.item.enrichment.images.primary_image_url || 'https://www.thermaxglobal.com/wp-content/uploads/2020/05/image-not-found.jpg';
                let price = body2.data.product.price.formatted_current_price;
                console.log(`[time: ${new Date().toISOString()}, product: ${sku}, title: ${title}]`)
                for (let group of sites) {
                    helper.postRetail(url, title, sku, price, image, stock, group, version, qt, links)
                }
                for (let group of retail) {
                    helper.postRetail(url, title, sku, price, image, stock, group, version, qt, links)
                }
                PRODUCTS[sku].sizes = 'STOCK'
                await database.query(`update ${table} set sizes='STOCK' where sku='${sku}'`)
                await helper.sleep(300000)
            }
        } else {
            if (status !== "OOS") {
                PRODUCTS[sku].sizes = 'OOS'
                await database.query(`update ${table} set sizes='OOS' where sku='${sku}'`)
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
    let SKUList = await database.query(`SELECT * from ${table}`);
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