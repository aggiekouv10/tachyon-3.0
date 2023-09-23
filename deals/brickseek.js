
const helper = require('../main/helper');
const database = require('../main/database');
const randomUseragent = require('random-useragent');
const { v4 } = require('uuid');
const site = 'BRICKSEEK'; //site name
const catagory = 'DEALS'
const version = `Brickseek v1.0` //Site version
const table = site.toLowerCase();
let PRODUCTS = []
let justStarted = true;
startMonitoring()
async function startMonitoring() {
        monitor(PRODUCTS)
}
async function monitor(PRODUCTS) {
    try {
        let proxy = await helper.getRandomProxy();
        let headers = {
            'User-Agent': "APIs-Google (+https://developers.google.com/webmasters/APIs-Google.html)",
            'X-FORWARDED-FOR': '8.8.8.8'
        }
        let method = 'GET'; //request method
        let req = `https://brickseek-com.translate.goog/deals/?sort=newest&abcz=${v4()}&_x_tr_sl=auto&_x_tr_tl=en&_x_tr_hl=en-US&_x_tr_pto=nui`//request url
        let set = await helper.requestHtml(req, method, proxy, headers) //request function
        console.log(set.response.status)
        if (set.response.status != 200) {
            monitor(PRODUCTS);
            return
        }
        let root = set.html
        let products = root.querySelectorAll('.item-list__item.item-list__item--deal.item-list__item--deal-online');
        for (let product of products) {
          let name = product.querySelector('.item-list__title span').textContent.replace('&quot;', '"').replace('&#039;', "'").replace('&amp;', '&')
          if (!PRODUCTS.includes(name)) {
            PRODUCTS.push(name)
            if (justStarted) {
              continue;
            }
            let sites = await helper.hookpost(catagory + site)
            let url = product.querySelector('.item-list__link').attributes.href.replace("?_x_tr_sl=auto&_x_tr_tl=en&_x_tr_hl=en-US&_x_tr_pto=nui", "").replace("https://brickseek-com.translate.goog", "https://brickseek.com")
            let percent = product.querySelector('.item-list__discount-meter-bar-fill-text').textContent
            let image = product.querySelector('.item-list__image-container img').attributes.src
            let online = '$' + product.querySelector('.item-list__price-column.item-list__price-column--highlighted .price-formatted__dollars').textContent + '.' + product.querySelector('.item-list__price-column.item-list__price-column--highlighted .price-formatted__cents').textContent
            let msrp = '~~$' + product.querySelector('.item-list__price-column:not(.item-list__price-column.item-list__price-column--highlighted) .price-formatted__dollars').textContent + '.' + product.querySelector('.item-list__price-column:not(.item-list__price-column.item-list__price-column--highlighted) .price-formatted__cents').textContent + '~~'
            console.log(`[time: ${new Date().toISOString()}, product: ${url}, title: ${name}]`)
            for (let group of sites) {
            helper.postBrickseek(url, name, image, online, msrp, percent, group, version)
            }
    
          }
        }
    
        if (justStarted)
          justStarted = false;
        console.log(set.response.status)
        await helper.sleep(1000);
        monitor(PRODUCTS);
        return
    } catch (e) {
        console.log(e)
        monitor(PRODUCTS)
        return
    }
}