const helper = require('../main/helper');
const { v4 } = require('uuid');
const catagory = 'NIKE'
const version = `Nike Stock v1.3` //Site version
let totalproducts = 240
startMonitoring()
async function startMonitoring() {
    for (let i = 0; i < totalproducts; i += 60) {
        let region = {
            "MARKETPLACE": "US",
            "CHANNELID": i,
            "LANGUAGE": "en"
        }
        let juststarted = true
        let oldProducts = []
        monitor(region, juststarted, oldProducts)
    }
}
console.log(`[${catagory}] Monitoring all SKUs!`)

async function monitor(region, juststarted, oldProducts) {
    try {
        let proxy = await helper.getRandomProxy(); //proxy per site
        //let agent = agents[helper.getRandomNumber(0, agents.length)];
        let headers = {
            'User-Agent': "Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html",
            'X-FORWARDED-FOR': '8.8.8.8'
        }
        let method = 'GET';
        let req = `https://api.nike.com/product_feed/rollup_threads/v2?anchor=${region.CHANNELID}&count=60&consumerChannelId=d9a5bc42-4b9c-4976-858a-f159cf99c647&filter=attributeIds%2816633190-45e5-4830-a068-232ac7aea82c%2C53e430ba-a5de-4881-8015-68eb1cff459f%29&filter=marketplace(US)&filter=language(en),${v4()}`//request url can add &searchTerms=dunk%20low
        let set = await helper.requestJson(req, method, proxy, headers)
        if (set.response.status != 200) {
            await monitor(region, juststarted, oldProducts)
            return
        }
        let body = await set.json
        for (let product of body.objects) {
            let inStock = false
            let productInfo = product.productInfo[0]
            if (!oldProducts.includes(productInfo.merchProduct.id)) {
                oldProducts.push(productInfo.merchProduct.id)
                inStock = true
            }
            let sku = productInfo.merchProduct.styleColor
            let pid = productInfo.merchProduct.id
            let releaseType = productInfo.merchProduct.status
            //let data = { origUrl: `mynike://x-callback-url/product-details?style-color=${sku}` }
            //let shorter = await helper.requestPost('http://localhost:3333/short', "POST", data, headers)
            let url = `https://www.nike.com/${region.MARKETPLACE === 'us' ? '' : region.MARKETPLACE.toLowerCase()}/t/${productInfo.productContent.slug}/${sku}`
            let links = `[ATF](http://api.YOUmonitors.com/nike?pid=${pid}) | [NikeApp](https://x-callback-url/product-details?style-color=${sku}) | [Nikeweb](${url}) | [Stockx](https://stockx.com/search?s=${sku}) | [Goat](https://goat.com/search?query=${sku}) | [Token](https://www.YOUmonitors.com/token-save)`
            let sizes = []
            let totalstock = 0
            if (inStock && !juststarted) {
                let stocker = await helper.stock(sku, "d9a5bc42-4b9c-4976-858a-f159cf99c647", [], true)
                for (let size of stocker[0]) {
                    sizes += `${size.size} - ${size.qty}\n`
                    totalstock += size.qty
                }
                let price = stocker[2].toString()
                let image = stocker[3].toString()
                let title = stocker[1].toString()
                console.log(`[time: ${new Date().toISOString()}, product: ${sku}, title: ${title}]`)
                let sizeright = sizes.split('\n')
                let sizeleft = sizeright.splice(0, Math.floor(sizeright.length / 2))
                let uri = `https://nike.com/${region.MARKETPLACE === 'us' ? '' : region.MARKETPLACE.toLowerCase()}`
                let STOCK = await helper.hookpost(catagory + 'STOCKNUMBERS' + region.MARKETPLACE)
                for (let group of STOCK) {
                    helper.postNikeStock(url, title, sku, price, image, sizeright, sizeleft, totalstock, group, version, uri, links, releaseType)
                }
            }
        }
        
        juststarted = false
        await monitor(region, juststarted, oldProducts)
        return
    } catch (e) {
        //console.log(e)
        await monitor(region, juststarted, oldProducts)
        return
    }
}