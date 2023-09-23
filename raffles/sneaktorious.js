const helper = require('../main/helper');
const database = require('../main/database');
const { v4 } = require('uuid');
const catagory = 'RAFFLES'
const version = `Raffles v2.3` //Site version
const HTMLParser = require('node-html-parser');
let PRODUCTS = [];
startMonitoring()
async function startMonitoring() {
    monitor(true )
    console.log('[Sneaker-Releases] Monitoring!')
}
console.log(`[${catagory}] Monitoring all SKUs!`)

async function monitor(justStarted) {
    try {
        let proxy = await helper.getRandomProxy(); //proxy per site
        //let agent = agents[helper.getRandomNumber(0, agents.length)];
        let headers = {
            'User-Agent': "Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html",
            'X-FORWARDED-FOR': '8.8.8.8'
        }
        let method = 'GET';
        let req = `https://www.sneaktorious.com/sneakers.json`
        let set = await helper.requestJson(req, method, proxy, headers)
        if (set.response.status != 200) {
            monitor(justStarted)
            return
        }
        console.log(set.response.status)
        let body = await set.json
        let products = body.items
        for (let product of products) {
            let inStock = false
            let link = 'https://www.sneaktorious.com' + product.link + '/raffles.json'
            let title = product.title
            let root = HTMLParser.parse(await product.thumbnail);
            let primaryImage = root.querySelector("source").attributes['data-srcset'].split('webp')[0]
            let set2 = await helper.requestJson(link, 'POST', proxy, headers)
            if (set2.response.status !== 200) {
                await monitor(justStarted);
                return;
            }
            let body2 = await set2.json
            let sites = body2.items
            for (let site of sites) {
                url = site.link
                if (!PRODUCTS.includes(url)) {
                    PRODUCTS.push(url)
                    inStock = true
                    let releaseType = site.headline
                    let dateStart = site.dateStart
                    if (dateStart == null)
                        dateStart = 'NA'
                    let siteImage = 'https://images.weserv.nl/?url=' + site.thumbnail + '&w=200&h=200&fit=contain&cbg=white&bg=white'
                    let siteAuther = 'https://' + url.split('/')[2]
                    let delivery = ''
                    let country = ''
                    let color = ''
                    let flag = ''
                    if (site.delivery === '9bd34764-c577-445b-a8bf-67c70ae7dd37') {
                        delivery = 'Pick up 🛒'
                    }
                    if (site.delivery === '793738c7-9209-4ff9-84c8-820bf664859a') {
                        delivery = 'Shipping 📦'
                    }
                    if (site.countries[0] === '219055a6-2d7c-4cf6-9ae2-af034f98a402') {
                        country = 'AE'
                        color = "#9ed0ab"
                        flag = 'ae'
                    }
                    if (site.countries[0] === 'df766a21-5238-4c21-9877-2197646f56b0') {
                        country = 'AT'
                        color = "#dabfbf"
                        flag = '🇦🇹'
                    }
                    if (site.countries[0] === 'b39ce988-0cbc-4c15-a8ec-02fb4fe70cc2') {
                        country = 'AU'
                        color = "#a1ec83"
                        flag = '🇦🇺'
                    }
                    if (site.countries[0] === 'ce40ee2b-68af-4c14-b889-daf663903423') {
                        country = 'CA'
                        color = "#f3b5fb"
                        flag = '🇨🇦'
                    }
                    if (site.countries[0] === '759dfa14-d01e-4f23-b061-1f9893c9293f') {
                        country = 'CH'
                        color = "#a2b7d6"
                        flag = '🇨🇭'
                    }
                    if (site.countries[0] === '84f958f0-4852-4ed5-abe1-5e192e3aeea2') {
                        country = 'CN'
                        color = "#ffd589"
                        flag = '🇨🇳'
                    }
                    if (site.countries[0] === '1dfebcd8-4a85-4c02-87aa-b338c6b01611') {
                        country = 'DE'
                        color = "#f7de65"
                        flag = '🇩🇪'
                    }
                    if (site.countries[0] === 'f74942f5-2826-41c0-ad00-5f30215936c1') {
                        country = 'ES'
                        color = "#f5cd98"
                        flag = '🇪🇸'
                    }
                    if (site.countries[0] === '1ed446ee-939f-4fa6-88e1-5b13f92e1e8b') {
                        country = 'EU'
                        color = "#88c2fd"
                        flag = '🇪🇺'
                    }
                    if (site.countries[0] === 'bc0b95da-ebd7-46ec-bd1c-0fd0a3efe9b9') {
                        country = 'FR'
                        color = "#9d80ed"
                        flag = '🇫🇷'
                    }
                    if (site.countries[0] === 'c35f7ff0-a1e0-4202-9900-0e130d220c2c') {
                        country = 'IT'
                        color = "#98f5ad"
                        flag = '🇮🇹'
                    }
                    if (site.countries[0] === 'ec9bd23a-3997-4885-b8af-9b38d089db51') {
                        country = 'JP'
                        color = "#f9b8d0"
                        flag = '🇯🇵'
                    }
                    if (site.countries[0] === '36a8be44-47ca-4102-97ac-aa4b04a8d426') {
                        country = 'MX'
                        color = "#dec67d"
                        flag = '🇲🇽'
                    }
                    if (site.countries[0] === 'cfb1ea15-1969-425f-9d18-1e0d96b4021d') {
                        country = 'NL'
                        color = "#d098f5"
                        flag = '🇳🇱'
                    }
                    if (site.countries[0] === '524baa56-9f5d-4876-9998-7d4141a4cf16') {
                        country = 'NZL'
                        color = "#65f7c1"
                        flag = '🇳🇿'
                    }
                    if (site.countries[0] === '8d4fec35-12f3-4e73-9a55-a603856f9443') {
                        country = 'UK'
                        color = "#8de5f3"
                        flag = '🇬🇧'
                    }
                    if (site.countries[0] === '2b491b6b-7635-41a9-9262-818280c23692') {
                        country = 'US'
                        color = "#ffb6b6"
                        flag = '🇺🇸'
                    }
                    if (inStock && !justStarted) {
                        let shipping = await helper.hookpost(catagory + "ALLSHIPPING")
                        let pickup = await helper.hookpost(catagory + "ALLPICKUP")
                        let region = await helper.hookpost(catagory + country)
                        console.log(`[time: ${new Date().toISOString()}, product: ${url}, title: ${title}]`)
                        inStock = false;
                        for (let group of region) {
                            helper.postRaffle(url, title, primaryImage, releaseType, dateStart, siteImage, siteAuther, delivery, country, flag, group, version)
                        }
                        if(delivery == 'Shipping 📦') {
                            for (let group of shipping) {
                                helper.postRaffle(url, title, primaryImage, releaseType, dateStart, siteImage, siteAuther, delivery, country, flag, group, version)
                            }  
                        }
                        if(delivery == 'Pick up 🛒') {
                            for (let group of pickup) {
                                helper.postRaffle(url, title, primaryImage, releaseType, dateStart, siteImage, siteAuther, delivery, country, flag, group, version)
                            }  
                        }
                    }
                }
            }
        }
        if (justStarted) {
            justStarted = false
        }
        await helper.sleep(1000)
        await monitor(justStarted);
        return

    } catch (e) {
        console.log(e)
        await monitor(justStarted)
        return
    }
}