const helper = require('../main/helper');
const database = require('../main/database');
const randomUseragent = require('random-useragent');
const { v4 } = require('uuid');
const site = 'HOTTOPIC'; //site name
const catagory = 'RETAIL'
const version = `Hottopic v1.0` //Site version
const table = site.toLowerCase();
let oldlist
let PRODUCTS = {}
startMonitoring()
async function startMonitoring() {
    oldlist = await database.query(`SELECT * from ${table}`);
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
        let proxy = await helper.getRandomProxy() //proxy per site
        let headers = {
            'User-Agent': "Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html",
            'X-FORWARDED-FOR': '8.8.8.8',
            'cookie': 'dwac_deCtsiaaiZnBUaaadncbRQn2tt=1PnwNlcInCP0fneauL4dGEJfvPv9Cp9H0uA%3D|dw-only|||USD|false|US%2FPacific|true; cqcid=abmgbrOmQDf0fr0FcvHLsNzB35; cquid=||; sid=1PnwNlcInCP0fneauL4dGEJfvPv9Cp9H0uA; preferredStoreId_boxlunch=4757; dwanonymous_06d21661b654eabe02c954a6ab9bb05f=abmgbrOmQDf0fr0FcvHLsNzB35; dwsecuretoken_06d21661b654eabe02c954a6ab9bb05f="juDeOhY1DSLoZmVRoxNTP9Z2XTs43lsPGg=="; __cq_dnt=0; dw_dnt=0; dwsid=tbjRDVFrCJqVHVLiav9kFyMencD7aQv-s4Pr7vzgmGSEz7YKTy6IFDd6J3DK_XDTw1GZJu6qoMXYAJ3rR51DeA==; crl8.fpcuid=65303909-afc8-454c-a73f-09366823f57f; AMCVS_33A90F985C014F620A495CF5%40AdobeOrg=1; s_cc=true; AMCV_33A90F985C014F620A495CF5%40AdobeOrg=-1712354808%7CMCIDTS%7C19519%7CMCMID%7C00200662100072864463330582900204434486%7CMCAAMLH-1686968633%7C7%7CMCAAMB-1686968633%7CRKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y%7CMCOPTOUT-1686371034s%7CNONE%7CMCAID%7CNONE%7CvVersion%7C4.3.0; _gcl_au=1.1.1516226365.1686363834; _fbp=fb.1.1686363834201.1203293571; _tt_enable_cookie=1; _ttp=LWMnJV-FfqfvAWEcIhuLIr54tEo; _pin_unauth=dWlkPVlqbGtPRGc1T1dFdFpEazVNUzAwWmpVMUxXRTNOamd0WVRZd01EWmxZVE16TWpZeg; __cq_uuid=bdxat6P1SWC9FQ10FLZJEbSU3w; forceCCPA=created; mdLogger=false; kampyle_userid=0a10-5847-a969-dc20-67c9-303c-2b4c-4ce9; kampyleUserSession=1686363834608; kampyleUserSessionsCount=1; kampyleUserPercentile=14.274518058349205; __attentive_id=54af5aa1f2c44482a55cef78e166ba4d; _attn_=eyJ1Ijoie1wiY29cIjoxNjg2MzYzODM1MTE4LFwidW9cIjoxNjg2MzYzODM1MTE4LFwibWFcIjoyMTkwMCxcImluXCI6ZmFsc2UsXCJ2YWxcIjpcIjU0YWY1YWExZjJjNDQ0ODJhNTVjZWY3OGUxNjZiYTRkXCJ9In0=; __attentive_cco=1686363835120; __attentive_ss_referrer=https://www.google.com/; __attentive_dv=1; s_dslv=1686363841351; pickupStores_boxlunch="[{\"ID\":\"4757\",\"name\":\"Mall at Bay Plaza\",\"city\":\"Bronx\",\"state\":\"NY\"},{\"ID\":\"4652\",\"name\":\"American Dream\",\"city\":\"East Rutherford\",\"state\":\"NJ\"},{\"ID\":\"4560\",\"name\":\"Palisades Center\",\"city\":\"West Nyack\",\"state\":\"NY\"},{\"ID\":\"4650\",\"name\":\"Willowbrook Mall\",\"city\":\"Wayne\",\"state\":\"NJ\"}]"; lastVisited_boxlunch=11807983; OptanonConsent=isGpcEnabled=0&datestamp=Fri+Jun+09+2023+22%3A24%3A02+GMT-0400+(Eastern+Daylight+Time)&version=202303.1.0&browserGpcFlag=0&isIABGlobal=false&hosts=&landingPath=NotLandingPage&groups=C0001%3A1%2CC0003%3A1%2CSSPD_BG%3A1%2CC0002%3A1%2CC0004%3A1%2CC0005%3A1&AwaitingReconsent=false; BVBRANDID=d1294aab-8dc2-4401-b15a-a85e16bc6748; BVBRANDSID=64d95400-75da-49f7-9204-a3e8d0bd9ef0; __cq_bc=%7B%22aavt-boxlunch%22%3A%5B%7B%22id%22%3A%2211807983%22%7D%5D%7D; __cq_seg=0~0.00!1~0.00!2~0.00!3~0.00!4~0.00!5~0.00!6~0.00!7~0.00!8~0.00!9~0.00; _br_uid_2=uid%3D9649064592512%3Av%3D12.0%3Ats%3D1686363834146%3Ahc%3D2; cto_bundle=XW4MjV9yJTJGVEYlMkZKZ0xWMjVMJTJGa1g1MmtLM3BHTm04N0dtSmhqcVBEJTJGUzdGcFJpTmpzeHlZU1lVSjJnemlrek9hOGJRTjRsME1PbEwwSTBtJTJCdHNBTSUyRnU5RlZXanhJcGZCT1pxcWZCSlhZRVBrMUVXa05aWXJhZFJ0QTB5Y3BEV244OW8zbzklMkJGQnJTd0dnMFZyWU5RV1JWaURJdyUzRCUzRA; smtrrmkr=638219606426742505%5E0188a31e-18ed-4d4f-84fa-2e1dde641ea4%5E0188a31e-18ed-4d32-9600-b5976d052143%5E0%5E24.185.12.22; s_plt=2.03; s_pltp=%2Fnintendo%2Bnes%2Bcartridge%2Bcoasters-11807983; kampyleSessionPageCounter=2; __attentive_pv=2; __attentive_vf=true; scOpened=true; s_nr30=1686364089400-Repeat; s_sq=%5B%5BB%5D%5D; utag_main=v_id:0188a31e0547000c58ba518ef22a0506f001906700fb8$_sn:1$_se:6$_ss:0$_st:1686365889395$ses_id:1686363833673%3Bexp-session$_pn:2%3Bexp-session$vapi_domain:boxlunch.com$dc_visit:1$dc_event:4%3Bexp-session$dc_region:us-east-1%3Bexp-session'
        }
        let method = 'GET'; //request method
        let req = `https://www.hibbett.com/on/demandware.store/Sites-Hibbett-US-Site/default/Search-GetSuggestions?pid=${sku}&format=ajax&quantity=1000000`//request url
        let set = await helper.requestJson(req, method, proxy, headers)
        console.log(set.response.status)
        if (set.response.status != 200) {
            monitor(sku);
            return
        }
        let body = await set.json //request function
        let status = PRODUCTS[sku].sizes
        let stock = body.product.availability.messages[0].split(' ')[0].replace(',','')
        if(stock == 'Back') {
            stock = body.product.availability.messages[0].replace('Back order ','').replace(',','').split(' ')[0]
        }
        console.log(stock)
            if (stock > 0 || stock == 'Presale') {
                let url = `https://www.hottopic.com/product/YOU/${sku}.html`
                if (status !== "STOCK") {
                    let qt = 'NA'
                    let links = `[ATC](https://www.hottopic.com/product/YOU/${sku}.html)`
                    let sites = await helper.hookpost(catagory+site)
                    let retail = await helper.hookpost("RETAILFILTEREDUS")
                    let title = body.product.productName
                    let price = body.product.price.sales.formatted
                    let image = body.product.images.alternate[0].url
                    console.log(`[time: ${new Date().toISOString()}, product: ${sku}, title: ${title}]`)
                    for (let group of sites) {
                        helper.postRetail(url, title, sku, price, image, stock, group, version, qt, links)
                    }
                    for (let group of retail) {
                        helper.postRetail(url, title, sku, price, image, stock, group, version, qt, links)
                    }
                    PRODUCTS[sku].sizes = 'STOCK'
                    await database.query(`update ${table} set sizes='STOCK' where sku='${sku}'`)
                    await helper.sleep(300000)
                }
            } else {
                if (status !== "OOS") {
                    PRODUCTS[sku].sizes = 'OOS'
                    await database.query(`update ${table} set sizes='OOS' where sku='${sku}'`)
                }
            }
        await helper.sleep(1000);
        monitor(sku);
        return
    } catch (e) {
        console.log(e)
        monitor(sku)
        return
    }
}
async function startSkus() {
    let SKUList = await database.query(`SELECT * from ${table}`);
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