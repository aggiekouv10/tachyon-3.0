const helper = require('../../main/helper');
const regions = require('./regions.json')
const database = require('../../main/database');
const moment = require('moment');
const { v4 } = require('uuid');
const catagory = 'SNKRS'
const version = `Snkrs v1.0` //Site version
startMonitoring()
async function startMonitoring() {
    for (let region of regions) {
        let juststarted = true
        let oldProducts = []
        monitor(region, juststarted, oldProducts)
    }

}
console.log(`[${catagory}] Monitoring all SKUs!`)

async function monitor(region, juststarted, oldProducts) {
    try {
        let proxy = await helper.getRandomProxy(); //proxy per site
        let headers = {
            'User-Agent': "Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html",
            'X-FORWARDED-FOR': '8.8.8.8'
        }
        let method = 'GET';
        let req = `https://api.nike.com/product_feed/threads/v2/?anchor=0&count=60&filter=marketplace(${region.MARKETPLACE})&filter=language(${region.LANGUAGE})&filter=channelId(${region.CHANNELID})&filter=exclusiveAccess(true,false)&fields=active,id,lastFetchTime,productInfo,${v4()}`//request url
        let set = await helper.requestJson(req, method, proxy, headers)
        //console.log(set.response.status)
        if (set.response.status != 200) {
            monitor(region, juststarted, oldProducts)
            return
        }
        let body = await set.json
        for (let product of body.objects) {
            if (!product.productInfo)
                continue;
            let productInfo = product.productInfo[0]
            if (!productInfo.launchView)
                continue;
            let sku = productInfo.productContent.globalPid
            if (oldProducts.includes(sku))
                continue;
            oldProducts.push(sku)
            if (juststarted)
                continue
            let title = productInfo.productContent.fullTitle + " - " + productInfo.productContent.colorDescription;
            let price = productInfo.merchPrice.currentPrice + " (" + productInfo.merchPrice.currency + ")";
            let image = productInfo.imageUrls.productImageUrl;
            let releaseType = productInfo.launchView.method;
            let releaseDateFormatted = moment(productInfo.launchView.startEntryDate);
            releaseDateFormatted = releaseDateFormatted.utc().format('YYYY-MM-DD') + " " + releaseDateFormatted.utc().format('HH:mm:ss') + " (UTC)"
            let url = `https://nike.com/${region.MARKETPLACE === 'US' ? '' : region.MARKETPLACE.toLowerCase()}/launch/t/${productInfo.productContent.slug}`
            let sizes = '';
            if (productInfo.availableSkus) {
                for (let size of productInfo.availableSkus) {
                    for (let size2 of productInfo.skus) {
                        if (size2.id === size.id) {
                            sizes += `${size2.nikeSize} [${size.level}]\n`
                        }
                    }
                }
            }
            console.log(`[time: ${new Date().toISOString()}, product: ${sku}, title: ${title}]`)
            let sizeright = sizes.split('\n')
            let sizeleft = sizeright.splice(0, Math.floor(sizeright.length / 2))
            let SITES = await database.query(`SELECT * from sites data`);
            SITES = JSON.parse(SITES.rows[0].data)
            let sites = []
            for (let id of SITES) {
                if (id.name == catagory + region.MARKETPLACE) {
                    sites.push(id)
                }
            }
            let uri = `https://nike.com/${region.MARKETPLACE === 'us' ? '' : region.MARKETPLACE.toLowerCase()}`
            for (let group of sites) {
                helper.postSnkrs(url, title, sku, price, image, sizeright, sizeleft, releaseType, group, version, uri, releaseDateFormatted)
            }
        }
        juststarted = false
        monitor(region, juststarted, oldProducts)
        return
    } catch (e) {
        //console.log(e)
        monitor(region, juststarted, oldProducts)
        return
    }
}