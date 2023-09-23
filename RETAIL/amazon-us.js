const helper = require('../main/helper');
const database = require('../main/database');
const randomUseragent = require('random-useragent');
const { v4 } = require('uuid');
const site = 'AMAZONUS'; //site name
const catagory = 'RETAIL'
const version = `Amazon US v1.0` //Site version
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
        let proxy = 'http://usa.rotating.proxyrack.net:9000' //proxy per site
        let headers = {
            //'User-Agent': "Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html",
        }
        let method = 'GET'; //request method
        let req = `https://www-amazon-com.translate.goog/gp/product/ajax/ref=dp_aod_ALL_mbc?experienceId=aodAjaxMain&asin=${sku}&main=${v4()}&_x_tr_sl=auto&_x_tr_tl=en&_x_tr_hl=en&_x_tr_pto=wapp`//request url
        let set = await helper.requestHtml(req, method, proxy, headers)
        //console.log(set.response.status)
        if (set.response.status != 200) {
            monitor(sku);
            return
        } //request function
        let root = set.html
        let status = PRODUCTS[sku].sizes
        if (root.querySelector('.a-price .a-offscreen')) {
            if (root.querySelector('.a-button-inner input[class="a-button-input"]').attributes['aria-label'].includes('Amazon.com')) {
                let url = `https://www.amazon.com/dp/${sku}#YOU`
                let title = root.querySelector('#aod-asin-block-asin').textContent.trim().split('               ')[0]
                let price = root.querySelector('.a-price .a-offscreen').textContent
                let image = root.querySelector('#aod-asin-image-id').attributes.src
                let parse = root.querySelector('.a-fixed-right-grid-col.aod-atc-column.a-col-right .a-declarative').attributes['data-aod-atc-action']
                let stock = '1'
                parse = JSON.parse(parse)
                let offerid = parse.oid
                if (status !== "STOCK") {
                    let sites = await helper.hookpost(catagory+site)
                    let retail = await helper.hookpost("RETAILFILTEREDUS")
                    let qt = 'NA'
                    let links = `[ATC](https://www.amazon.com/gp/product/handle-buy-box/ref=dp_start-bbf_1_glance?offerListingID=${offerid}&ASIN=${sku}&isMerchantExclusive=0&merchantID=A3DWYIK6Y9EEQB&isAddon=0&nodeID=&sellingCustomerID=&qid=&sr=&storeID=&tagActionCode=&viewID=glance&rebateId=&ctaDeviceType=desktop&ctaPageType=detail&usePrimeHandler=0&sourceCustomerOrgListID=&sourceCustomerOrgListItemID=&wlPopCommand=&itemCount=20&quantity.1=1&asin.1=${sku}&submit.buy-now=Submit&dropdown-selection=&dropdown-selection-ubb=)`
                    console.log(url, title, sku, price, image, stock, offerid, version, qt, links)
                    for (let group of sites) {
                        helper.postAmazon(url, title, sku, price, image, stock, offerid, group, version, qt, links)
                    }
                    for (let group of retail) {
                        helper.postAmazon(url, title, sku, price, image, stock, offerid, group, version, qt, links)
                    }
                    PRODUCTS[sku].sizes = 'STOCK'
                    await database.query(`update ${table} set sizes='STOCK' where sku='${sku}'`)
                    await helper.sleep(150000)
                }
            } else {
                if (status !== "OOS") {
                    PRODUCTS[sku].sizes = 'OOS'
                    await database.query(`update ${table} set sizes='OOS' where sku='${sku}'`)
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