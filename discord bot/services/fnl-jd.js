const convert = require("convert-zip-to-gps");
const axios = require("axios");
const httpsProxyAgent = require('https-proxy-agent');
const getProxy = require('../services/getproxy');


const headers = {
    "cache-control": "no-cache",
    "sec-ch-ua": "\"Not?A_Brand\";v=\"8\", \"Chromium\";v=\"105\", \"Google Chrome\";v=\"105\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "user-agent": "Mozilla/5.0 (Linux; Android 9; K21) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36",
    "accept": "*/*",
    "sec-fetch-site": "cross-site",
    "sec-fetch-mode": "cors",
    "sec-fetch-dest": "empty",
    "referer": "https://www.finishline.com/",
    "accept-encoding": "gzip, deflate, br",
    "accept-language": "en-US,en;q=0.9",
    "x-requested-with": "XMLHttpRequest"
}

const getFnlStores = async (zipcode) => {
    try{
    let fnlStores = [];
    const cords = convert.zipConvert(zipcode)
    if (!cords) return null

    const url = "https://www.finishline.com/store/storepickup/storeLookup.jsp" +
        `?latitude=${cords.split(",")[0].trim()}` +
        `&longitude=${cords.split(",")[1].trim()}`
        const proxy = await getProxy();
        let agent = new httpsProxyAgent({
            host: proxy[0],
            port: proxy[1],
            auth: `${proxy[2]}:${proxy[3].split('\r')[0]}`
        });
        console.log(agent)
    let options = {
        "url": url,
        "method": "GET",
        'httpsAgent': agent,
        "headers": headers
    }
    const resp = await axios(options)
        .then(async (res) => {
            if (res.data.length > 5) {
                for (let i = 0; i < 5; i++) {
                    fnlStores.push(res.data[i])
                };
            } else {
                fnlStores = res.data;
            }
        });

    return fnlStores
} catch (e) {
    if (e.code === 'ECONNRESET') {
        return await getFnlStores(zipcode)
        }
}
}

const getJdSportsStores = async (zipcode) => {
    try{
    let JdSportsStores = [];
    const cords = convert.zipConvert(zipcode)
    if (!cords) return null
    const url = "https://www.jdsports.com//store/storepickup/storeLookup.jsp" +
        `?latitude=${cords.split(",")[0].trim()}` +
        `&longitude=${cords.split(",")[1].trim()}`
        let proxy = await getProxy()
        console.log(proxy)
        let agent = new httpsProxyAgent({
            host: proxy[0],
            port: proxy[1],
            auth: `${proxy[2]}:${proxy[3].split('\r')[0]}`
        });
        console.log(agent)
        let options = {
            "url": url,
            "method": "GET",
            'httpsAgent': agent,
            "headers": headers
        }
        const resp = await axios(options)
        .then(async (res) => {
            if (res.data.length > 5) {
                for (let i = 0; i < 5; i++) {
                    JdSportsStores.push(res.data[i])
                };
            } else {
                JdSportsStores = res.data;
            }
        });
    return JdSportsStores
} catch (e) {
    if (e.code === 'ECONNRESET') {
        return await getJdSportsStores(zipcode)
        }
}
}

const getAvilablityJD = async (pid, zipcode) => {
    let finalJD = []
    const stores = await getJdSportsStores(zipcode)
    if (!stores) return null
    const store = stores.stores
    let info = await getProductNameJD(pid)
    for (let i = 0; i < store.length; i++) {
        let store = stores.stores[i]
        try{
        finalJD = finalJD.concat(await getJdAvailabilityreq(pid, store.id, store, info))
    }catch(e){
        if(e.response.status == 404){
            continue;
        }else{
            i--
        }
    }
    }
    return finalJD
}

const getAvilablityFNl = async (pid, zipcode) => {
    let finalFNL = []
    const stores = await getFnlStores(zipcode)
    if (!stores) return null
    const store = stores.stores
    let info = await getProductNameFNL(pid)
    for (let i = 0; i < store.length; i++) {
        let store = stores.stores[i]
        try{
        finalFNL = finalFNL.concat(await getFnlAvailabilityreq(pid, store.id, store, info))
        }catch(e){
            if(e.response.status == 404){
                continue;
            }else{
                i--
            }
        }
    }
    return finalFNL
}

const getFnlAvailabilityreq = async (prodId, storeId, store, info) => {
    const url = `https://www.finishline.com/store/browse/json/productSizesJson.jsp?productId=${prodId}&storeId=${storeId}`
    let proxy = await getProxy()
    console.log(proxy)
    let agent = new httpsProxyAgent({
        host: proxy[0],
        port: proxy[1],
        auth: `${proxy[2]}:${proxy[3].split('\r')[0]}`
    });
    console.log(agent)
    let options = {
        "url": url,
        "method": "GET",
        'httpsAgent': agent,
        "headers": headers
    }
    const resp = await axios(options)
        .then(res => {
            if(res.statusCode == 404) return null
            return res.data
        })
    if (resp == null) return null
    let product = resp.productStoreSizes.slice(0, -1)
    let json = []
    if (!product[0]) return null
    let productid = product[0].productId
    json.push({
        prodductName: info.name,
        url: info.link,
        href: info.href,
        title: `${store.name.replaceAll('  ','')}`,
        totalStock: atob(product[0].stockLevel),
        image: `https://media.finishline.com/s/finishline/${productid}`,
        address: `${store.street1.replaceAll('  ','')}, ${store.city.replaceAll('  ','')}, ${store.state}, ${store.zip}`,
        type: 'Finishline',
        prodId: prodId,
        colorId: productid,
        productid: productid,
        sizes: [`${product[0].sizeValue} - ${atob(product[0].stockLevel)}`]
    })
    product.forEach(a => {
        if (productid != a.productId) {
            productid = a.productId
            json.push({
                prodductName: info.name,
                url: info.link,
                href: info.href,
                title: `${store.name.replaceAll('  ','')}`,
                totalStock: atob(a.stockLevel),
                image: `https://media.finishline.com/s/finishline/${productid}`,
                address: `${store.street1.replaceAll('  ','')}, ${store.city.replaceAll('  ','')}, ${store.state}, ${store.zip}`,
                type: 'Finishline',
                prodId: prodId,
                colorId: productid,
                productid: productid,
                sizes: [`${a.sizeValue} - ${atob(a.stockLevel)}`]
            })
        } else {
            json[json.length - 1].totalStock = parseInt(json[json.length - 1].totalStock) + parseInt(atob(a.stockLevel))
            json[json.length - 1].sizes.push(`${a.sizeValue} - ${atob(a.stockLevel)}`)
        }
    })
    return json
}

const getJdAvailabilityreq = async (prodId, storeId, store, info) => {
    const url = `https://www.jdsports.com/store/browse/json/productSizesJson.jsp?productId=${prodId}&storeId=${storeId}`
    let proxy = await getProxy()
    console.log(proxy)
    let agent = new httpsProxyAgent({
        host: proxy[0],
        port: proxy[1],
        auth: `${proxy[2]}:${proxy[3].split('\r')[0]}`
    });
    console.log(agent)
    let options = {
        "url": url,
        "method": "GET",
        'httpsAgent': agent,
        "headers": headers
    }
    const resp = await axios(options)
        .then(res => {
            return res.data
        })
        .catch(err => {
            return null
        })
    if (!resp) return null
    let product = resp.productStoreSizes.slice(0, -1)
    let json = []
    let productid = product[0].productId
    json.push({
        prodductName: info.name,
        url: info.link,
        href: info.href,
        title: `${store.name.replaceAll('  ','')}`,
        totalStock: atob(product[0].stockLevel),
        image: `https://media.jdsports.com/s/jdsports/${productid}`,
        address: `${store.street1.replaceAll('  ','')}, ${store.city.replaceAll('  ','')}, ${store.state}, ${store.zip}`,
        type: 'Jdsports',
        prodId: prodId,
        colorId: productid,
        productid: productid,
        sizes: [`${product[0].sizeValue} - ${atob(product[0].stockLevel)}`]
    })
    product.forEach(a => {
        if (productid != a.productId) {
            productid = a.productId
            json.push({
                prodductName: info.name,
                url: info.link,
                href: info.href,
                title: `${store.name.replaceAll('  ','')}`,
                totalStock: atob(a.stockLevel),
                image: `https://media.jdsports.com/s/jdsports/${productid}`,
                address: `${store.street1.replaceAll('  ','')}, ${store.city.replaceAll('  ','')}, ${store.state}, ${store.zip}`,
                type: 'Jdsports',
                prodId: prodId,
                colorId: productid,
                productid: productid,
                sizes: [`${a.sizeValue} - ${atob(a.stockLevel)}`]
            })
        } else {
            json[json.length - 1].sizes.push(`${a.sizeValue} - ${atob(a.stockLevel)}`)
            json[json.length - 1].totalStock = parseInt(json[json.length - 1].totalStock) + parseInt(atob(a.stockLevel))
        }
    })
    return json
}

async function getProductNameFNL(pid) {
    let url = "https://www.finishline.com/detail0.xml"
    const resp = await axios.get(url)
    for (let i = 0; i < resp.data.split("<url>").length; i++) {
        const item = resp.data.split("<url>")[i].split('</loc>')[0].split('<loc>')[1];
        let value = item ?.includes(pid)
        if (value) {
            return {
                link: item,
                name: item.split("/")[5].replaceAll("-", " "),
                href: item.split("/")[5]
            }
        }
    }
}

async function getProductNameJD(pid) {
    let url = "https://www.jdsports.com/detail0.xml"
    const resp = await axios.get(url)
    for (let i = 0; i < resp.data.split("<url>").length; i++) {
        const item = resp.data.split("<url>")[i].split('</loc>')[0].split('<loc>')[1];
        let value = item ?.includes(pid)
        if (value) {
            return {
                link: item,
                name: item.split("/")[5].replaceAll("-", " "),
                href: item.split("/")[5]
            }
        }
    }
}


async function getAvilablity(pid, zipcode) {
    let jdsports = await getAvilablityJD(pid, zipcode)
    let finishline = await getAvilablityFNl(pid, zipcode)
    if(jdsports == null) jdsports = []
    if(finishline == null) finishline = []
    let final = jdsports.concat(finishline)

    return final
}

async function getAllStores(zipcode) {
    let jdsports = await getJdSportsStores(zipcode)
    let finishline = await getFnlStores(zipcode)
    let final = []
    for (let i = 0; i < jdsports.stores.length; i++) {
        const store = jdsports.stores[i];
        let json = {
            title: `${store.name.replaceAll('  ','')}`,
            zip: store.zip,
            state: store.state,
            city: store.city,
            address: `${store.street1.replaceAll('  ','')}`,
            address: `${store.street1.replaceAll('  ','')}, ${store.city.replaceAll('  ','')}, ${store.state}, ${store.zip}`,
            type: 'Jdsports',
            phone: store.phone.replaceAll('  ', ''),
            storeId: store.id,
            url: "https://www.jdsports.com/",
            image: 'https://pbs.twimg.com/profile_images/1324112313054425088/Qky194RW_400x400.png',

        }
        final.push(json)
    }
    for (let i = 0; i < finishline.stores.length; i++) {
        const store = finishline.stores[i];
        let json = {
            title: `${store.name.replaceAll('  ','')}`,
            zip: store.zip,
            state: store.state,
            city: store.city,
            address: `${store.street1.replaceAll('  ','')}`,
            type: 'Finishline',
            phone: store.phone.replaceAll('  ', ''),
            storeId: store.id,
            url: "https://www.finishline.com/",
            image: 'https://pbs.twimg.com/profile_images/752829376526508037/2aWzXL8b_400x400.jpg',
        }
        final.push(json)
    }
    if(final == []){
        return {error: "No stores found"}
    }else{
        return final
    }
}

module.exports = { getAvilablity, getAllStores}