const helper = require('../../main/helper');
const database = require('../../main/database');
const { v4 } = require('uuid');
const catagory = 'NIKE'
const version = `Nike v1.3` //Site version
let totalproducts = 1000
let justsent = []
startMonitoring()
async function startMonitoring() {
    for (let i = 0; i < totalproducts; i += 100) {
        let region = {
            "MARKETPLACE": "US",
            "CHANNELID": i,
            "LANGUAGE": "en"
        }
        let juststarted = true
        let oldProducts = []
        monitor(region, juststarted, oldProducts, lastcache)
        console.log(i)
    }
}
console.log(`[${catagory}] Monitoring all SKUs!`)


async function monitor(region, juststarted, oldProducts, lastcache) {
    try {
        let proxy = await helper.getRandomProxy(); //proxy per site
        //let agent = agents[helper.getRandomNumber(0, agents.length)];
        let headers = {
            'User-Agent': "Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html",
            'X-FORWARDED-FOR': '8.8.8.8'
        }
        let method = 'GET';
        let req = `https://api.nike.com/product_feed/threads/v2?anchor=${region.CHANNELID}&count=100&filter=exclusiveAccess(true,false)&filter=channelId(d9a5bc42-4b9c-4976-858a-f159cf99c647)&filter=marketplace(${region.MARKETPLACE})&filter=language(${region.LANGUAGE})&searchTerms=dunk&filter=taxonomyIds(0d17e0df-9083-4e44-b263-71c2565d4783,16633190-45e5-4830-a068-232ac7aea82c)&filter=productInfo.merchProduct.channels(NikeApp)&fields=active,id,lastFetchTime,productInfo,${v4()},${v4()}`//request url can add &searchTerms=dunk%20low
        let set = await helper.requestJson(req, method, proxy, headers)
        if (set.response.status != 200) {
            monitor(region, juststarted, oldProducts, lastcache)
            return
        }
        let cache2 = set.response.headers.get("x-b3-traceid");
        if (cache2 == lastcache) {
            lastcache = cache2
            monitor(region, juststarted, oldProducts, lastcache)
            return
        }
        let body = await set.json
        for (let product of body.objects) {
            let inStock = false
            if (!product.productInfo)
                continue;
            let productInfo = product.productInfo[0]
            let sku = productInfo.merchProduct.styleColor
            let pid = productInfo.merchProduct.id
            let title = productInfo.productContent.fullTitle + " - " + productInfo.productContent.colorDescription;
            let price = productInfo.merchPrice.currentPrice + " (" + productInfo.merchPrice.currency + ")";
            let image = productInfo.imageUrls.productImageUrl;
            let releaseType = productInfo.merchProduct.status;
            //let data = { origUrl: `mynike://x-callback-url/product-details?style-color=${sku}` }
            //let shorter = await helper.requestPost('http://localhost:3333/short', "POST", data, headers)
            let url = `https://www.nike.com/${region.MARKETPLACE === 'us' ? '' : region.MARKETPLACE.toLowerCase()}/t/${productInfo.productContent.slug}/${sku}`
            let links = `[ATF](http://api.YOUmonitors.com/nike?pid=${pid}&url=http://api.YOUmonitors.com/nike?pid=${pid}) | [NikeApp](https://x-callback-url/product-details?style-color=${sku}) | [Nikeweb](${url}) | [Stockx](https://stockx.com/search?s=${sku}) | [Goat](https://goat.com/search?query=${sku}) | [Token](https://www.YOUmonitors.com/token-save)`
            let sizes = '';
            if (productInfo.availableSkus) {
                for (let size of productInfo.availableSkus) {

                    if (!oldProducts.includes(size.id) && size.available) {
                        oldProducts.push(size.id)
                        inStock = true
                    }
                    for (let size2 of productInfo.skus) {
                        if (size2.id === size.id && size.available) {
                            sizes += `[${size2.nikeSize} [${size.level}]](http://api.YOUmonitors.com/nike-atc?prod=${pid}:Nike.com:${catalogid}:${size2.nikeSize})\n`
                        }
                    }
                }
                if (juststarted)
                    continue
                if (justsent.includes(sku)) {
                    inStock = false
                }
                if (inStock) {
                    spammer(sku)
                    console.log(`[time: ${new Date().toISOString()}, product: ${sku}, title: ${title}]`)
                    let sizeright = sizes.split('\n')
                    let sizeleft = sizeright.splice(0, Math.floor(sizeright.length / 2))
                    let uri = `https://nike.com/${region.MARKETPLACE === 'us' ? '' : region.MARKETPLACE.toLowerCase()}`
                    if (releaseType == 'ACTIVE') {
                        let FRONTEND = await helper.hookpost(catagory + 'FRONTEND' + region.MARKETPLACE)

                        for (let group of FRONTEND) {
                            helper.postNike(url, title, sku, price, image, sizeright, sizeleft, releaseType, group, version, uri, links)
                        }
                    }
                    if (releaseType == 'CLOSEOUT') {
                        let BACKEND = await helper.hookpost(catagory + 'BACKEND' + region.MARKETPLACE)

                        for (let group of BACKEND) {
                            helper.postNike(url, title, sku, price, image, sizeright, sizeleft, releaseType, group, version, uri, links)
                        }
                    }
                    if (releaseType == 'HOLD') {
                        let WAREHOUSE = await helper.hookpost(catagory + 'WAREHOUSE' + region.MARKETPLACE)

                        for (let group of WAREHOUSE) {
                            helper.postNike(url, title, sku, price, image, sizeright, sizeleft, releaseType, group, version, uri, links)
                        }
                    }
                }
            }
        }
        juststarted = false
        monitor(region, juststarted, oldProducts, lastcache)
        return
    } catch (e) {
        //console.log(e)
        monitor(region, juststarted, oldProducts, lastcache)
        return
    }
}
async function spammer(sku) {
    justsent.push(sku)
    console.log('set')
    await helper.sleep(120000)
    justsent = justsent.filter(item => item !== sku)
    return
}