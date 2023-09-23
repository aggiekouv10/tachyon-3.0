const helper = require('../main/helper');
const database = require('../main/database');
const { v4 } = require('uuid');
const site = 'JDSPORTS'; //site name
const catagory = 'AIO'
const version = `JD Sports v2.0` //Site version
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
        let proxy = await helper.getRandomProxy(); //proxy per site
        //these headers change per site
        let headers = {
            'User-Agent': "Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html",
            'X-FORWARDED-FOR': '8.8.8.8'
        }
        let method = 'GET'; //request method
        let req = `https://www.jdsports.com/store/browse/json/productSizesJson.jsp?productId=${sku}&productId=${v4()}`//request url
        let set = await helper.requestJson(req, method, proxy, headers) //request function
        let body = await set.json
        //Define body variables
        if (set.response.status != 200) {
            await monitor(sku)
            return
        }
        if (body.productSizes.length < 0) {
            await helper.sleep(1000);
            await monitor(sku)
            return
        }
        let sizelist = []
        let sizesparse = body.productSizes
        let id = ''
        for (let size of sizesparse) {
            if (id == size.productId || size.productId == 'null')
                continue
            sizelist.push(size.productId)
            id = size.productId
        }
        let sizeList = []
        let oldSizeList = PRODUCTS[sku].sizes
        for (let vars of sizelist) {
            let styleID = vars.split('_')[0]
            let colorID = vars.split('_')[1]
            let sizes = ''
            let inStock = false
            let stock = 0
            for (let size of sizesparse) {
                if (size.sizeValue && size.productId == vars) {
                    if (size.sizeClass !== 'unavailable') {
                        sizeList.push(size.sizeValue);
                        if (!oldSizeList.includes(size.sizeValue)) {
                            stock++
                            sizes += `${size.sizeValue} ()\n`
                            inStock = true;
                        }
                    }
                }
            }
            PRODUCTS[sku].sizes = sizeList
            if (inStock) {
                let AIO = await helper.hookpost("AIOFILTEREDUS")
                let sites = await helper.hookpost(catagory + site)
                let qt = 'Na'
                let links = 'Na'
                let proxy2 = await helper.getRandomProxy2()
                let req = `https://www.jdsports.com/store/browse/gadgets/productLookupJSON.jsp?productId=${sku}&styleId=${styleID}&colorId=${colorID}`//request url
                let set = await helper.requestJson(req, method, proxy2, headers) //request function
                let body2 = await set.json
                let title
                let price
                let image
                try {
                    title = body2.product.name + ' ' + body2.product.colors.color[0].content
                } catch {
                    title = body2.product.name + ' ' + body2.product.colors.color.content
                }
                try {
                    price = body2.product.Prices.price[0].fullPrice
                } catch {
                    price = body2.product.Prices.price.fullPrice
                }
                try {
                    image = body2.product.colors.color[0].thumbnail
                } catch {
                    image = body2.product.colors.color.thumbnail
                }
                let url = `https://www.jdsports.com/store/product/YOU/${sku}?styleId=${styleID}&colorId=${colorID}#YOU`
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

        await helper.sleep(1000);
        await monitor(sku);
        return
    } catch (e) {
        //console.log(e)
        await monitor(sku)
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