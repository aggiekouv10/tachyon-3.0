const helper = require('../main/helper');
const regions = require('./regions.json')
const { v4 } = require('uuid');
const catagory = 'ADIDAS'
const version = `Adidas v2.0` //Site version
let totalproducts = 288
startMonitoring()
async function startMonitoring() {
    for (let region of regions) {
        for (let start = 0; start < totalproducts; start += 48) {
            let juststarted = true
            let oldProducts = []
            monitor(region, juststarted, oldProducts, start)
        }
    }

}
console.log(`[${catagory}] Monitoring all SKUs!`)

async function monitor(region, juststarted, oldProducts, start) {
    try {
        let proxy = await helper.getRandomProxy(); //proxy per site
        let headers = {
            'User-Agent': "Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html",
            'X-FORWARDED-FOR': '8.8.8.8'
        }
        let method = 'GET';
        let req = `https://${region.URLBASE}/api/plp/content-engine?query=shoes-new_arrivals&start=${start}&abcz=${v4()}`//request url
        let set = await helper.requestJson(req, method, proxy, headers)
        //console.log(set.response.status)
        if (set.response.status != 200) {
            monitor(region, juststarted, oldProducts, start)
            return
        }
        let body = await set.json
        let colorvars = body.raw.itemList.items
        for (let product of colorvars) {
            let totalproducts = product.colorVariations
            for (let varient of totalproducts) {
                let sizes = ''
                let stockall = 0
                let inStock = false
                let req2 = `https://${region.URLBASE}/api/products/${varient}/availability?abcz=${v4()}`//request url
                let set2 = await helper.requestJson(req2, method, proxy, headers)
                if (set2.response.status != 200) {
                    monitor(region, juststarted, oldProducts, start)
                    return
                }
                let body2 = await set2.json
                for (let vars of body2.variation_list) {
                    if (!oldProducts.includes(vars.sku) && vars.availability_status == "IN_STOCK") {
                        oldProducts.push(vars.sku)
                        inStock = true
                        stockall += vars.availability
                        sizes += `${vars.size} [${vars.availability}+] \n`
                    }
                    if (vars.availability_status == "NOT_AVAILABLE") {
                        oldProducts = oldProducts.filter(item => item !== vars.sku)
                    }
                }
                if (inStock && !juststarted) {
                    let req3 = `https://${region.URLBASE}/api/products/${varient}?abcz=${v4()}`//request url
                    let set3 = await helper.requestJson(req3, method, proxy, headers)
                    if (set3.response.status != 200) {
                        monitor(region, juststarted, oldProducts, start)
                        return
                    }
                    let body3 = await set3.json
                    let url = 'https:' + body3.meta_data.canonical
                    let title = body3.meta_data.page_title
                    let image = body3.dynamic_background_assets[0].image_url
                    let pid = body3.id
                    let price = body3.pricing_information.currentPrice
                    let links = `[Stockx](https://stockx.com/search?s=${pid}) | [Goat](https://goat.com/search?query=${pid})`
                    console.log(`[time: ${new Date().toISOString()}, product: ${varient}, title: ${title}]`)
                    let sizeright = sizes.split('\n')
                    let sizeleft = sizeright.splice(0, Math.floor(sizeright.length / 2))
                    let uri = `https://adidas.com/${region.COUNTRY.toLowerCase()}`
                    let sites = await helper.hookpost(catagory + region.COUNTRY)
                    for (let group of sites) {
                        helper.postAdidas(url, title, pid, price, image, sizeright, sizeleft, group, version, uri, links, stockall)
                    }
                }
            }
        }
        juststarted = false
        monitor(region, juststarted, oldProducts, start)
        return
    } catch (e) {
        //console.log(e)
        monitor(region, juststarted, oldProducts, start)
        return
    }
}