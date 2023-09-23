const convert = require("convert-zip-to-gps");
const HttpsProxyAgent = require('https-proxy-agent');
const uuid = require('uuid');
const fs = require('fs');
const axios = require('axios');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
var tunnel = require('tunnel');

async function getAgent() {
    const list = fs.readFileSync('./external/proxies.txt', 'utf8').split('\n').filter(String);
    const raw = list[Math.floor(Math.random() * list.length)];

    const proxy = raw.split(':');
    console.log(proxy)
    return proxy;
}


const getGeo = async (zipcode) => {
    let cords = convert.zipConvert(zipcode);
    let longitude = cords.split(',')[1];
    let latitude = cords.split(',')[0];

    return {
        latitude: latitude,
        longitude: longitude
    };
}


const getFLXStoresReq = async (cords) => {
    try {
        let proxy = await getAgent();
        let options = {
            'url': `https://151.101.158.132/zgw/stores-core/v1/stores-by-availability?siteId=FL&lat=${cords.latitude.trim()}&long=${cords.longitude.trim()}&sku=X6898100&productWebKey=22740833&size=S&timestamp=${Date.now()}`,
            "method": "GET",
            "mode": "cors",
            "hostname": "www.footlocker.com",
            "headers": {
                "authority": "www.footlocker.com",
                'host': 'www.footlocker.com',
                'accept': 'application/json',
                'accept-encoding': 'gzip, deflate, br',
                'accept-language': 'en-US,en;q=0.9',
                'sec-ch-ua': '"Google Chrome";v="107", "Chromium";v="107", "Not=A?Brand";v="24"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': "Windows",
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
                'x-api-lang': 'en',
                'x-fl-request-id': uuid.v4(),
                "x-api-key": "my-auth-key-1"
            },
            "httpsAgent": tunnel.httpsOverHttp({
                rejectUnauthorized: false,
                servername: 'www.footlocker.com',
                proxy: {
                    host: proxy[0],
                    port: proxy[1],
                    proxyAuth: `${proxy[2]}:${proxy[3].split('\r')[0]}`,
                }
            }),
        }
        let res = await axios(options);
        return res.data;
    } catch (e) {
        if (e.code === 'ECONNRESET') {
        return await getFLXStoresReq(cords)
        }
        console.log(e)
    }
}


const getFTLStores = async (cords) => {
    let FTLstores = []

    let res = await getFLXStoresReq(cords)
    for (let i = 0; i < res.length; i++ && i < 5) {
        const store = res[i];
        let pushStore = {
            storeName: store.storeName,
            storeNumber: store.storeNumber,
            address: store.addressLine1,
            address2: store.addressLine2,
            city: store.city,
            state: store.state,
            zip: store.zipCode,
            phone: store.phone,
            distance: store.formattedDistance,
            type: 'Footlocker'

        }
        FTLstores.push(pushStore)
    }
    return FTLstores;
};


const getChampsStoresReq = async (cords) => {
    try {
        let proxy = await getAgent();
        let options = {
            'url': `https://151.101.158.132/zgw/stores-core/v1/stores-by-availability?siteId=FL&lat=${cords.latitude.trim()}&long=${cords.longitude.trim()}&sku=6897100&productWebKey=22740833&size=S&timestamp=${Date.now()}`,
            "method": "GET",
            "mode": "cors",
            "hostname": "www.champssports.com",
            "headers": {
                "authority": "www.champssports.com",
                'host': 'www.champssports.com',
                'accept': 'application/json',
                'accept-encoding': 'gzip, deflate, br',
                'accept-language': 'en-US,en;q=0.9',
                'sec-ch-ua': '"Google Chrome";v="107", "Chromium";v="107", "Not=A?Brand";v="24"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': "Windows",
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
                'x-api-lang': 'en',
                'x-fl-request-id': uuid.v4(),
                "x-api-key": "my-auth-key-1"
            },
            "httpsAgent": tunnel.httpsOverHttp({
                rejectUnauthorized: false,
                servername: 'www.footlocker.com',
                proxy: {
                    host: proxy[0],
                    port: proxy[1],
                    proxyAuth: `${proxy[2]}:${proxy[3].split('\r')[0]}`,
                }
            }),
        }
        let res = await axios(options);
        return res.data;
    } catch (err) {
        if (err.code === 'ECONNRESET') {
            return await getChampsStoresReq(cords)
            }
        console.log(err)
    }
}


const getChampsStores = async (cords) => {
    let Chstores = []

    let res = await getChampsStoresReq(cords)
    for (let i = 0; i < res.length; i++ && i < 5) {
        const store = res[i];
        let pushStore = {
            storeName: store.storeName,
            storeNumber: store.storeNumber,
            address: store.addressLine1,
            address2: store.addressLine2,
            city: store.city,
            state: store.state,
            zip: store.zipCode,
            phone: store.phone,
            distance: store.formattedDistance,
            type: 'Champs Sports'

        }
        Chstores.push(pushStore)
    }
    return Chstores;
};


async function getItemDataFTL(sku) {
    try {
        let proxy = await getAgent();
        let options = {
            'url': `https://151.101.158.132/zgw/product-core/v1/pdp/sku/${sku}`,
            "method": "GET",
            "mode": "cors",
            "hostname": "www.footlocker.com",
            "headers": {
                "authority": "www.footlocker.com",
                'host': 'www.footlocker.com',
                'accept': 'application/json',
                'accept-encoding': 'gzip, deflate, br',
                'accept-language': 'en-US,en;q=0.9',
                'sec-ch-ua': '"Google Chrome";v="107", "Chromium";v="107", "Not=A?Brand";v="24"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': "Windows",
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
                'x-api-lang': 'en',
                'x-fl-request-id': uuid.v4(),
                "x-api-key": "my-auth-key-1"
            },
            "httpsAgent": tunnel.httpsOverHttp({
                rejectUnauthorized: false,
                servername: 'www.footlocker.com',
                proxy: {
                    host: proxy[0],
                    port: proxy[1],
                    proxyAuth: `${proxy[2]}:${proxy[3].split('\r')[0]}`,
                }
            }),
        }
        let res = await axios(options);
        return {
            name: res.data.styleVariants[0].style + " " + res.data.styleVariants[0].color,
            sku: res.data.styleVariants[0].sku,
            price: res.data.styleVariants[0].price.salePrice,
            sizes: res.data.sizes
        };
    } catch (err) {
        if (err.code === 'ECONNRESET') {
            return await getItemDataFTL(sku)
            }
        if (err.response.status === 404) {
            return {
                error: "Product Not Found"
            }
        }
    }

}
const getAvilablityFTL = async (cords, sku) => {
    let sizes = [
        "05.0",
        "05.5",
        "06.0",
        "06.5",
        "07.0",
        "07.5",
        "08.0",
        "08.5",
        "09.0",
        "09.5",
        "10.0",
        "10.5",
        "11.0",
        "11.5",
        "12.0"
    ];
    let finalFTL = []
    for (let i = 0; i < sizes.length; i++) {
        const size = sizes[i];
        let res = await getAvilablityFTLreq(size, cords, sku)
        if(!res) continue;
        res.forEach(store => {
            let availability
            if (store.deliveryMode) {
                availability = 'Available In-Store'
            } else {
                if (store.productAvailable) {
                    availability = 'Available Online'
                } else {
                    availability = 'OOS'
                }
            }
            let name = store.storeName
            let distance = store.formattedDistance
            let storeNumber = store.storeNumber
            let zipcode = store.zipCode
            let state = store.state
            let address1 = store.addressLine1
            let address2 = store.addressLine2
            let type = 'Footlocker'

            var result = finalFTL.filter(x => x.storeName === name);
            if (result.length == 0) {
                let json = {
                    storeName: name,
                    distance: distance,
                    storeNumber: storeNumber,
                    zipcode: zipcode,
                    state: state,
                    address1: address1,
                    address2: address2,
                    type: type,
                    sizes: []
                }
                json.sizes.push(`${size} - ${availability}`)
                finalFTL.push(json)
            } else {
                result[0].sizes.push(`${size} - ${availability}`)
            }
        });

    }
    return finalFTL

}


async function getAvilablityFTLreq(size, cords, sku) {
    try {
        let proxy = await getAgent();
        let options = {
            'url': `https://151.101.158.132/zgw/stores-core/v1/stores-by-availability?siteId=FL&lat=${cords.latitude.trim()}&long=${cords.longitude.trim()}&sku=${sku}&productWebKey=22740833&size=${size}&timestamp=${Date.now()}`,
            "method": "GET",
            "mode": "cors",
            "hostname": "www.footlocker.com",
            "headers": {
                "authority": "www.footlocker.com",
                'host': 'www.footlocker.com',
                'accept': 'application/json',
                'accept-encoding': 'gzip, deflate, br',
                'accept-language': 'en-US,en;q=0.9',
                'sec-ch-ua': '"Google Chrome";v="107", "Chromium";v="107", "Not=A?Brand";v="24"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': "Windows",
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
                'x-api-lang': 'en',
                'x-fl-request-id': uuid.v4(),
                "x-api-key": "my-auth-key-1"
            },
            "httpsAgent": tunnel.httpsOverHttp({
                rejectUnauthorized: false,
                servername: 'www.footlocker.com',
                proxy: {
                    host: proxy[0],
                    port: proxy[1],
                    proxyAuth: `${proxy[2]}:${proxy[3].split('\r')[0]}`,
                }
            }),
        }
        let res = await axios(options);

        return res.data;
    } catch (e) {
        if (e.code === 'ECONNRESET') {
            return await getAvilablityFTLreq(size, cords, sku)
            }
        console.log(e)
    }

}

const getItemDataChamps = async (sku) => {
    let proxy = await getAgent();
    let options = {
        'url': `https://151.101.158.132/zgw/product-core/v1/pdp/sku/${sku}`,
        "method": "GET",
        "mode": "cors",
        "hostname": "www.champssports.com",
        "headers": {
            "authority": "www.champssports.com",
            'host': 'www.champssports.com',
            'accept': 'application/json',
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'en-US,en;q=0.9',
            'sec-ch-ua': '"Google Chrome";v="107", "Chromium";v="107", "Not=A?Brand";v="24"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': "Windows",
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
            'x-api-lang': 'en',
            'x-fl-request-id': uuid.v4(),
            "x-api-key": "my-auth-key-1"
        },
        "httpsAgent":tunnel.httpsOverHttp({
            rejectUnauthorized: false,
            servername: 'www.footlocker.com',
            proxy: {
                host: proxy[0],
                port: proxy[1],
                proxyAuth: `${proxy[2]}:${proxy[3].split('\r')[0]}`,
            }
        }),
    }
    let res = await axios(options);
    return {
        name: res.data.styleVariants[0].style + " " + res.data.styleVariants[0].color,
        sku: res.data.styleVariants[0].sku,
        price: res.data.styleVariants[0].price.salePrice,
        image: `https://images.champssports.com/is/image/EBFL2/${sku}?wid=118&hei=118&fmt=png-alpha`,
        link: `https://www.champssports.com/product/~/${sku}.html`,
        sizes: res.data.sizes
    };

}


const getAvilablityChamps = async (cords, sku) => {
    let sizes = [
        "05.0",
        "05.5",
        "06.0",
        "06.5",
        "07.0",
        "07.5",
        "08.0",
        "08.5",
        "09.0",
        "09.5",
        "10.0",
        "10.5",
        "11.0",
        "11.5",
        "12.0"
    ];
    let finalChamps = []
    for (let i = 0; i < sizes.length; i++) {
        const size = sizes[i];
        let res = await getAvilablityChampsreq(size, cords, sku)
        if(!res) continue;
        res.forEach(store => {
            let availability
            if (store.deliveryMode) {
                availability = 'Available In-Store'
            } else {
                if (store.productAvailable) {
                    availability = 'Available Online'
                } else {
                    availability = 'OOS'
                }
            }
            let name = store.storeName
            let distance = store.formattedDistance
            let storeNumber = store.storeNumber
            let zipcode = store.zipCode
            let state = store.state
            let address1 = store.addressLine1
            let address2 = store.addressLine2
            let type = 'Champs Sports'

            var result = finalChamps.filter(x => x.storeName === name);
            if (result.length == 0) {
                let json = {
                    link: link,
                    storeName: name,
                    distance: distance,
                    storeNumber: storeNumber,
                    zipcode: zipcode,
                    state: state,
                    address1: address1,
                    address2: address2,
                    type: type,
                    sizes: []
                }
                json.sizes.push(`${size} - ${availability}`)
                finalChamps.push(json)
            } else {
                result[0].sizes.push(`${size} - ${availability}`)
            }
        });

    }
    return finalChamps
}


async function getAvilablityChampsreq(size, cords, sku) {
    try {
        let proxy = await getAgent();
        let options = {
            'url': `https://151.101.158.132/zgw/stores-core/v1/stores-by-availability?siteId=FL&lat=${cords.latitude.trim()}&long=${cords.longitude.trim()}&sku=${sku}&productWebKey=22740833&size=${size}&timestamp=${Date.now()}`,
            "method": "GET",
            "mode": "cors",
            "hostname": "www.champssports.com",
            "headers": {
                "authority": "www.champssports.com",
                'host': 'www.champssports.com',
                'accept': 'application/json',
                'accept-encoding': 'gzip, deflate, br',
                'accept-language': 'en-US,en;q=0.9',
                'sec-ch-ua': '"Google Chrome";v="107", "Chromium";v="107", "Not=A?Brand";v="24"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': "Windows",
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
                'x-api-lang': 'en',
                'x-fl-request-id': uuid.v4(),
                "x-api-key": "my-auth-key-1"
            },
            "httpsAgent": tunnel.httpsOverHttp({
                rejectUnauthorized: false,
                servername: 'www.footlocker.com',
                proxy: {
                    host: proxy[0],
                    port: proxy[1],
                    proxyAuth: `${proxy[2]}:${proxy[3].split('\r')[0]}`,
                }
            }),
        }
        let res = await axios(options);
        return res.json
    } catch (e) {
        if (e.code === 'ECONNRESET') {
            return await getAvilablityChampsreq(size, cords, sku)
            }
        console.log(e)
    }

}

module.exports = {
    getAvilablityFTL,
    getGeo,
    getAvilablityChamps,
    getFTLStores,
    getChampsStores
}