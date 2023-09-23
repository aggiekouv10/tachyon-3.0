const tls = require('tls');
const axios = require('axios');

const defaultCiphers = tls.DEFAULT_CIPHERS.split(':');
const shuffledCiphers = [
    defaultCiphers[0],
    // Swap the 2nd & 3rd ciphers:
    defaultCiphers[2],
    defaultCiphers[1],
    ...defaultCiphers.slice(3)
].join(':');

async function getStores(zip) {
    let opt = {
        "url":`https://hibbett-mobileapi.prolific.io/ecommerce/stores?query=${zip},%20OR&maxDistance=100&distanceUnit=mi`,
        "method": "get",
        "ciphers": shuffledCiphers,
        "headers":{
        'Host': 'hibbett-mobileapi.prolific.io',
        'X-PX-AUTHORIZATION': '2',
        'Accept': '*/*',
        'version': '6.3.0',
        'Accept-Language': 'en-US;q=1.0, es-US;q=0.9',
        'platform': 'ios',
        'User-Agent': "Hibbett | CG/6.0.0 (com.hibbett.hibbett-sports; build:10723; iOS 16.0.2) Alamofire/5.0.0-rc.3",
        'Connection': 'keep-alive',
        'Content-Type': 'application/json; charset=utf-8',
        }
    }
    let res = await axios(opt)
    return res.data
}

async function getStock(pid,storeId) {
let opt = {
    "url":`https://hibbett-mobileapi.prolific.io/ecommerce/variations/products/${pid}/store/${storeId}`,
        "method": "get",
        "ciphers": shuffledCiphers,
        "headers":{
        'Host': 'hibbett-mobileapi.prolific.io',
        'X-PX-AUTHORIZATION': '2',
        'Accept': '*/*',
        'version': '6.3.0',
        'Accept-Language': 'en-US;q=1.0, es-US;q=0.9',
        'platform': 'ios',
        'User-Agent': "Hibbett | CG/6.0.0 (com.hibbett.hibbett-sports; build:10723; iOS 16.0.2) Alamofire/5.0.0-rc.3",
        'Connection': 'keep-alive',
        'Content-Type': 'application/json; charset=utf-8',
        }
}
let res = await axios(opt)
return res.data
}
async function getStoresCommand(zip) {
    let stores = await getStores(zip)
    let finalStores = []
    for (let i = 0; i < stores.length; i>10, i++) {
        const store = stores[i];
        let finalStore = {
            "title": `${store.address.address1} - ${store.distance} Miles Away`,
            "profile": {
                "icon": "https://yt3.googleusercontent.com/HWtkSC8qyOOR-Sn5wzhExh4NELn8Jsb_urJgOpH8Fxt8DhnAd8uQQTEloy_OwhrYlvc9ZTI9gzU=s900-c-k-c0x00ffffff-no-rj",
                "name":"www.hibbett.com",
                "url":"https://www.hibbett.com/"
            },
            "fields":[
                {
                    "name":"Store #",
                    "value":store.id,
                    "inline":false
                },
                {
                    "name":"Store Name",
                    "value":store.name,
                    "inline":true
                },
                {
                    "name":"Postal Code",
                    "value":store.address.zip,
                    "inline":true
                },
                {
                    "name":"State",
                    "value":store.address.state,
                    "inline":false
                },
                {
                    "name": "Address",
                    "value":store.address.address1,
                    "inline":true
                },
                {
                    "name":"City",
                    "value": store.address.state,
                    "inline":false
                },
                {
                    "name":"Phone Number",
                    "value": store.address.phone
                }

            ]
        }
        finalStores.push(finalStore)
    }
    return finalStores
}

async function checkStockCommand(pid,zip) {
    let stores = await getStores(zip)
    let finalStock = []
    for (let i = 0; i < stores.length; i++) {
        const store = stores[i];
        let stock = await getStock(pid,store.id)
        let stockCount = []
        stock.skus.forEach(sku => {
            if(sku.isAvailable){
                stockCount = stockCount + `${sku.id} | ${sku.size} - Available In Store\n`
            }else{
                stockCount = stockCount + `${sku.id} | ${sku.size} - Out Of Stock\n` 
            }
        });
        let storeStock = {
            "title": stock.name,
            "url": `https://www.hibbett.com/product?pid=${pid}`,
            "thumbNail":stock.imageResources[stock.imageIds[0]][0].url,
            "profile": {
                "icon": "https://yt3.googleusercontent.com/HWtkSC8qyOOR-Sn5wzhExh4NELn8Jsb_urJgOpH8Fxt8DhnAd8uQQTEloy_OwhrYlvc9ZTI9gzU=s900-c-k-c0x00ffffff-no-rj",
                "name":"www.hibbett.com",
                "url":"https://www.hibbett.com/"
            },
            "feilds":[{
                "name":"Product Id",
                "value":stock.id,
                "inline":true
            },
            {
                "name":"Store Name",
                "value":store.name,
                "inline":true
            },
            {
                "name":"Postal Code",
                "value":store.address.zip,
                "inline":true
            },
            {
                "name":"State",
                "value":store.address.state,
                "inline":false
            },
            {
                "name": "Address",
                "value":store.address.address1,
                "inline":true
            },
            {
                "name":"City",
                "value": store.address.state,
                "inline":false
            },
            {
                "name":"ID | Size [Stock]",
                "value": stockCount,
                "inline":false
            },
            {
                "name":"Resell Links",
                "value":`[Stockx](https://stockx.com/search?s=${stock.name}) | [Goat](https://www.goat.com/search?query=${stock.name})`
            }
        ]

        }
        finalStock.push(storeStock)
    }
    return finalStock
}
module.exports = {checkStockCommand,getStoresCommand}
