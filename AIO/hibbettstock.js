const helper = require('../main/helper');
const database = require('../main/database');
const { v4 } = require('uuid');
const catagory = 'AIO'
const version = `Hibbett Stock v1.0` //Site version
const HTMLParser = require('node-html-parser');
let PRODUCTS = [];
startMonitoring()
async function startMonitoring() {
    monitor(true)
    console.log('[Sneaker-Releases] Monitoring!')
}
console.log(`[${catagory}] Monitoring all SKUs!`)

async function monitor(justStarted) {
    try {
        let proxy = await helper.getRandomProxy(); //proxy per site
        //let agent = agents[helper.getRandomNumber(0, agents.length)];
        let headers = {
            'X-PX-AUTHORIZATION': '2',
            'Accept': '*/*',
            'version': '6.3.0',
            'Accept-Language': 'en-US;q=1.0, es-US;q=0.9',
            'platform': 'ios',
            'User-Agent': "Hibbett | CG/6.0.0 (com.hibbett.hibbett-sports; build:10723; iOS 16.0.2) Alamofire/5.0.0-rc.3",
            'Connection': 'keep-alive',
            'Content-Type': 'application/json; charset=utf-8',
        }
        let rando = Math.floor(Math.random() * 25)
        for (let i = 0; i < rando; i++) {
            headers[v4()] = v4()
        }
        let method = 'GET';
        let req = `https://hibbett-mobileapi.prolific.io/ecommerce/products/search?refine_2=c_isHideOCAPI%3Dfalse&cat=men-shoes&limit=20&offset=0&pid=${v4()}`
        let set = await helper.requestJson2(req, method, proxy, headers)
        if (set.response.status != 200) {
            monitor(justStarted)
            return
        }
        console.log(set.response.status)
        //let body = await set.text.split('dataLayer = ')[1].split(';')[0]
        let body = set.json.products
        for (let product of body) {
            post = false
            if (!PRODUCTS.includes(product.id)) {
                PRODUCTS.push(product.id)
                post = true
            }
            let sku = product.id
            let title = product.name
            let launchDate = product.launchDate
            let price = "$" + product.price
            let sizes = ''
            let imageparse = product.imageIds[0]
            let image = product.imageResources[imageparse][0].url
            /*try {
                image = product.imageResources.primary[0].url
            } catch {
                image = product.imageResources[imageparse][0].url
            }*/
            let color = image.split('_')[1]
            let url = `https://www.hibbett.com/product?pid=${sku}&dwvar_${sku}_color=${color}#YOU`
            if (post && !justStarted) {
                let headers2 = {
                    'user-agent': 'Mozilla/5.0 (compatible; Google-Site-Verification/1.0)',
                }
                let req2 = `https://hibbett.com/on/demandware.store/Sites-Hibbett-US-Site/default/Stylitics-ShowProductDetails;.js?pid=${sku}&pid=${v4()}`//request url
                let set2 = await helper.requestHtml(req2, method, proxy, headers2) //request function
                if (set2.response.status != 200) {
                    monitor(justStarted)
                    return
                }
                let root = set2.html
                let stocktotal = 0
                let variants = root.querySelectorAll('.selectable.size')
                for (let variant of variants) {
                    let pdp = `https://www.hibbett.com/product;.js?${variant.querySelector('.swatchanchor').attributes.href.split('?')[1].split('&_x_tr_sl=auto&_x_tr_tl=en&_x_tr_hl=en-US&_x_tr_pto=nui').join('')}&dwvar_${sku}_color=${color}&format=ajax`
                    let set3 = await helper.requestBody(pdp, method, proxy, headers2) //request function
                    if (set3.response.status != 200) {
                        monitor(justStarted)
                        return
                    }
                    let body3 = await set3.resp
                    if (!body3.includes('data-available='))
                        continue
                    let stocksize = body3.split('data-available="')[1].split('" />')[0]
                    sizes += `[${variant.querySelector('.swatchanchor').textContent.split('size').join('').split('Size').join('').trim()}](https://www.hibbett.com/product?${variant.querySelector('.swatchanchor').attributes.href.split('?')[1].split('&_x_tr_sl=auto&_x_tr_tl=en&_x_tr_hl=en-US&_x_tr_pto=nui').join('')}&dwvar_${sku}_color=${color}) - ${stocksize}\n`
                    stocktotal += Number(stocksize)
                }
                console.log(sizes.length)
                if (sizes.length == 0)
                    continue
                let qt = 'Na'
                let links = `[Stockx](https://stockx.com/search?s=${title.split(' ').join('+')}) | [Google](https://www.google.com/search?q=${title.split(' ').join('+')})`
                console.log(`[time: ${new Date().toISOString()}, product: ${sku}, title: ${title}]`)
                inStock = false;
                let sizeright = sizes.split('\n')
                let sizeleft = sizeright.splice(0, Math.floor(sizeright.length / 2))
                let sites = await helper.hookpost(catagory + 'HIBBETTSTOCK')
                for (let group of sites) {
                    helper.postHibbettStock(url, title, sku, price, image, sizeright, sizeleft, stocktotal, group, version, qt, links, launchDate)
                }
            }
        }
        if (justStarted) {
            justStarted = false
        }
        await helper.sleep(10000)
        await monitor(justStarted);
        return

    } catch (e) {
        //console.log(e)
        await monitor(justStarted)
        return
    }
}