const helper = require('../main/helper');
const database = require('../main/database');
const randomUseragent = require('random-useragent');
const { v4 } = require('uuid');
const site = 'NORDSTROM'; //site name
const catagory = 'AIO'
const version = `Nordstrom v2.0` //Site version
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
        let product = PRODUCTS[sku]
        if (!product)
            return;
            var ip = (Math.floor(Math.random() * 255) + 1) + "." + (Math.floor(Math.random() * 255)) + "." + (Math.floor(Math.random() * 255)) + "." + (Math.floor(Math.random() * 255));
        let proxy = await helper.getRandomProxy(); //proxy per site
        let agent = randomUseragent.getRandom()
        //these headers change per site
        let headers = {
            'user-agent': agent,
            'X-Forwarded-For': ip,
            'Fastly-Client-IP': ip,
            'True-Client-IP': ip
        }
        let method = 'GET'; //request method
        let req = `https://www-nordstrom-com.translate.goog/s/sam-edelman-wilson-sandal-women/${sku}?_x_tr_sl=auto&_x_tr_tl=en&_x_tr_hl=en&_x_tr_pto=wapp`//request url
        let set = await helper.requestNord(req, method, proxy, headers) //request function
        let body = set.body.viewData
        if (set.response.status != 200) {
            monitor(sku)
            return
        }
        console.log(agent)
        console.log(ip)
        console.log(set.response.status)
        if (body.errorcode == 'ERROR_STYLE_NOT_FOUND') {
            console.log('[NORDSTROM] ' + sku + ' not found!')
            return
        }

        //Define body variables
        let ids = body.skus.allIds
        if (ids.length < 0) {
            await helper.sleep(1000)
            monitor(sku)
            return
        }
        let inStock = false;
        let url = `https://www.nordstrom.com/s/${sku}#YOU`//product url
        let title = body.productTitle + " "
    
        let price = set.text.split('Current Price')[1].split('</span>')[0]
        let parse = body.defaultGalleryMedia.styleMediaId
        let image = 'https://pbs.twimg.com/profile_images/1159538934977662976/4gmIcgkZ_400x400.png'
        try { image = body.styleMedia.byId[parse].imageMediaUri.smallDesktop } catch (e) { } //try set image
        let stock = 0
        let sizes = []
        let oldSizeList = PRODUCTS[sku].sizes
        let sizeList = []
        let oosid = body.soldOutSkus.byId
        let oossku = body.soldOutSkus.allIds
        let inid = body.skus.byId
        let insku = body.skus.allIds
        let vars = Object.assign(oosid, inid)
        let skus = Object.assign(oossku, insku) //For loop parse
        //pars sizes for loop
        for (let id of skus) { //loops through all sizes
            if (vars[id].isAvailable === true || vars[id].totalQuantityAvailable > 0) { //if oss or in stock
                sizeList.push(vars[id].rmsSkuId);
                if (!oldSizeList.includes(vars[id].rmsSkuId)) {// oldSizeList.includes this size
                    sizes += `${vars[id].sizeId} (${vars[id].totalQuantityAvailable}) - ${vars[id].rmsSkuId}\n`//size parse
                    stock += Number(vars[id].totalQuantityAvailable) //total count or quantity
                    title = title + vars[id].colorDisplayValue + ","
                    inStock = true;
                }
            }
        }
        PRODUCTS[sku].sizes = sizeList
        if (inStock) {
            let AIO = await helper.hookpost("AIOFILTEREDUS")
            let sites = await helper.hookpost(catagory + site)
            let qt = 'Na'
            let links = 'Na'
            title = title.split(',')[0]
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
        await monitor(SKUList.rows[SKUList.rows.length - 1].sku)
    }
    oldlist = SKUList
    await helper.sleep(2000)
    startSkus()
    }