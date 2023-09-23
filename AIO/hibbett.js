const helper = require('../main/helper');
const database = require('../main/database');
const HTMLParser = require('node-html-parser');
const randomUseragent = require('random-useragent');
const { v4 } = require('uuid');
const site = 'HIBBETT'; //site name
const catagory = 'AIO'
const version = `Hibbett v1.0` //Site version
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
        let proxy = 'http://usa.rotating.proxyrack.net:9000'
        let headers = {
            'user-agent': 'Mozilla/5.0 (compatible; Google-Site-Verification/1.0)',
        }
        let method = 'GET'; //request method
        let req = `https://hibbett.com/on/demandware.store/Sites-Hibbett-US-Site/default/Stylitics-ShowProductDetails;.js?pid=${sku}&pid=${v4()}`//request url
        let set = await helper.requestHtml(req, method, proxy, headers) //request function
        let root = await set.html
        if (set.response.status == 410) {
            console.log('Removed - ' + sku)
            return
        }
        if (set.response.status != 200) {
            monitor(sku);
            return
        }
        if (root.querySelector('no-sizes-available')) {
            await helper.sleep(1000);
            monitor(sku);
            return
        }
        if (root.querySelector('.price-sales')) {
            let title = root.querySelector('h2').textContent.trim().split('&#39;').join("'").split('&quot;').join('"')
            let price = root.querySelector('.price-sales').textContent.trim()
            let image = 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829'
            try { image = 'https:' + root.querySelector('.selectable.color img').attributes.src.split(' ').join('').replace('thumb', 'medium') } catch (e) { }
            try { image = 'https:' + root.querySelector('.color.unselectable.selected img').attributes.src.split(' ').join('').replace('thumb', 'medium') } catch (e) { }
            try { image = 'https:' + root.querySelector('.color.selectable.selected img').attributes.src.split(' ').join('').replace('thumb', 'medium') } catch (e) { }
            let color = ''
            try {color = root.querySelector('.selectable.color img').attributes.src.split(' ').join('').replace('?$thumb$', '').split('_')[1]} catch (e) { }
            try {color = root.querySelector('.color.unselectable.selected img').attributes.src.split(' ').join('').replace('?$thumb$', '').split('_')[1]} catch (e) { }
            try {color = root.querySelector('.color.selectable.selected img').attributes.src.split(' ').join('').replace('?$thumb$', '').split('_')[1]} catch (e) { }
            
            let url = `https://www.hibbett.com/product?pid=${sku}&dwvar_${sku}_color=${color}#YOU`
            let sizes = []
            let oldSizeList = PRODUCTS[sku].sizes
            let inStock = false
            let sizeList = []
            let variants = root.querySelectorAll('.selectable.size')
            let stock = 0
            for (let variant of variants) {
                sizeList.push(variant.querySelector('.swatchanchor').textContent.split('size').join('').split('Size').join('').trim());
                if (!oldSizeList.includes(variant.querySelector('.swatchanchor').textContent.split('size').join('').split('Size').join('').trim())) {
                    sizes += `[${variant.querySelector('.swatchanchor').textContent.split('size').join('').split('Size').join('').trim()}](https://www.hibbett.com/product?${variant.querySelector('.swatchanchor').attributes.href.split('?')[1].split('&_x_tr_sl=auto&_x_tr_tl=en&_x_tr_hl=en-US&_x_tr_pto=nui').join('')}&dwvar_${sku}_color=${color})\n`
                    stock++
                    inStock = true;
                }
            }
            PRODUCTS[sku].sizes = sizeList
            if (inStock) {
                let qt = 'Na'
                let links = `[Stockx](https://stockx.com/search?s=${title.split(' ').join('+')}) | [Google](https://www.google.com/search?q=${title.split(' ').join('+')})`
                console.log(`[time: ${new Date().toISOString()}, product: ${sku}, title: ${title}]`)
                inStock = false;
                let sizeright = sizes.split('\n')
                let sizeleft = sizeright.splice(0, Math.floor(sizeright.length / 2))
                let AIO = await helper.hookpost(catagory + "FILTEREDUS")
                let sites = await helper.hookpost(catagory + site.split(' ').join(''))
                for (let group of sites) {
                    helper.postAIO(url, title, sku, price, image, sizeright, sizeleft, stock, group, version, qt, links)
                }
                for (let group of AIO) {
                    helper.postAIO(url, title, sku, price, image, sizeright, sizeleft, stock, group, version, qt, links)
                }
                await database.query(`update ${site.toLowerCase()} set sizes='${JSON.stringify(sizeList)}' where sku='${sku}'`);
            }
        }
        await helper.sleep(1000)
        monitor(sku);
        return
    } catch (e) {
        if (e.message.includes('Cannot read')) {
            monitor(sku)
            return
        }
        console.log(e)
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
