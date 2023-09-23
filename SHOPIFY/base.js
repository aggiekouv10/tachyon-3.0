const helper = require('../main/helper');
const { v4 } = require('uuid');
const version = `Shopify v4.0`
const filters = require('./filter.json');
let DBSITE
let products = [];
let lastHash
class ShopifyMonitor {

    products;
    lastHash;
    password;
    checkpoint;

    constructor(website, dbsite, region) {
        this.DBSITE = "SHOPIFY" + dbsite
        this.WEBSITE = website;
        this.REGION = region;
    }

    async monitor() {
        //this.monitorAntibot();
        this.monitorProducts("1", "250", lastHash, products)
    }

    async monitorProducts(page, limit, lastHash, products) {
        let DATA
        let proxy = await helper.getRandomProxy();
        let URL = `${this.WEBSITE}/products.json?page=${page}&limit=${limit}&order=${v4()}`;  //Or you can use ?collection or ?a or ?q
        let headers = {
            'user-agent': 'Mozilla/5.0 (compatible; Google-Site-Verification/1.0)',
        }
        if (this.DBSITE == "SHOPIFYFUNKO" || this.DBSITE == "SHOPIFYCNCPTS" || this.DBSITE == "SHOPIFYPACKER" || this.WEBSITE == "https://hatclub.com" || this.WEBSITE == "https://oqium.com") {
            proxy = await helper.getRandomProxy();
            URL = `${this.WEBSITE.split('-').join('--').split('.').join('-')}.translate.goog/products.json?collection=pop&page=${page}&limit=${limit}&order=${v4()}`;  //Or you can use ?collection or ?a or ?q
            headers = {
                'user-agent': 'Mozilla/5.0 (compatible; Google-Site-Verification/1.0)',
            }
        }
        try {
            if (false) { //this.DBSITE == "SHOPIFYKITHUS"
                proxy = await helper.getRandomProxy();
                URL = `https://kithnyc.myshopify.com/api/2023-04/graphql.json`;  //Or you can use ?collection or ?a or ?q
                headers = {
                    "Content-Type": "application/json",
                    'x-shopify-storefront-access-token': '5dd10fc24c37cb069c1a6d1c88250fc2',
                }

                DATA = {
                    "query": `query getProductsAndVariants {
                    products(
                      first: 250

                    ) {
                      edges {
                        node {
                          id
                          title
                          handle
                          media(first: 1) {
                            edges {
                              node {
                                ...mediaFieldsByType
                              }
                            }
                          }
                          variants(first: 250) {
                            edges {
                              node {
                                id
                                currentlyNotInStock
                                title
                                quantityAvailable
                                availableForSale
                                price {
                                  amount
                                  currencyCode
                                }
                              }
                            }
                          }
                        }
                      }
                      pageInfo {
                        hasPreviousPage
                        endCursor
                      }
                    }
                  }
                  fragment mediaFieldsByType on Media {
                    ... on MediaImage {
                      image {
                        url
                      }
                    }
                  }
                  `
                }
                DATA = JSON.stringify(DATA)
                let method = 'POST'; //request method
                let set = await helper.requestPost(URL, method, DATA, headers) //request function
                if (set.response.status != 200) {
                    this.monitorProducts(page, limit, lastHash, products)
                    return
                }
                let body = set.json
                if (!body.data.products.edges) {
                    this.monitorProducts(page, limit, lastHash, products)
                    return
                }
                let currentHash = body.data.products.edges.toString()
                if (currentHash == lastHash) {
                    this.monitorProducts(page, limit, lastHash, products);
                    return;
                }
                if (!lastHash) {
                    lastHash = currentHash;
                    products = body.data.products.edges;
                    this.monitorProducts(page, limit, lastHash, products);
                    return;
                }
                for (let product of body.data.products.edges) {
                    let webhookType = null;
                    let variants = []
                    let sizes = ""
                    let price = ""
                    let stock = 0
                    let image = product.node.media.edges[0].node.image.url
                    for (let variant of product.node.variants.edges) {
                        if (variant.node.availableForSale && !variants.includes(variant.node.id.split('/')[4])) {
                            variants.push(variant.node.id.split('/')[4]);
                            sizes += `[${variant.node.title}](${this.WEBSITE}/cart/${variant.node.id.split('/')[4]}:1?payment=shop_pay) | [QT](http://YOUmonitors.com/qt) (${variant.node.quantityAvailable})\n`
                            price = variant.node.price.amount + ' ' + variant.node.price.currencyCode;
                            stock += variant.node.quantityAvailable
                        }
                    }
                    let inStock = variants.length > 0;
                    if (!inStock) {
                        continue;
                    }
                    let oldProduct = this.findProduct2(product.node.id.split('/')[4], products);
                    if (oldProduct) {
                        let oldVariants = [];
                        for (let variant of oldProduct.node.variants.edges) {
                            if (variant.node.availableForSale) {
                                oldVariants.push(variant.node.id.split('/')[4]);
                            }
                        }
                        for (let variant of variants) {
                            if (!oldVariants.includes(variant)) {
                                // console.log(product.title + "  -  " + variant)
                                webhookType = "Restock";
                                break;
                            }
                        }
                    } else {
                        webhookType = "New Product";
                    }
                    if (webhookType) {
                        let date = new Date()
                        console.log(`[SHOPIFY] (${this.WEBSITE}) ${date} - ${product.node.title}`)
                        let qt = `Na`
                        let links = 'Na'
                        let sizeright = sizes.split('\n')
                        let sizeleft = sizeright.splice(0, Math.floor(sizeright.length / 2))
                        let all = await helper.hookpost('SHOPIFYUNFILTEREDALL')
                        let sites = await helper.hookpost(this.DBSITE)
                        let checktitle = product.node.title.toLowerCase()
                        for (let group of all) {
                            helper.postShopify(this.WEBSITE + "/products/" + product.node.handle, product.node.title, price, webhookType, image, sizeright, sizeleft, stock, group, version, qt, links, date)
                        }
                        for (let group of sites) {
                            helper.postShopify(this.WEBSITE + "/products/" + product.node.handle, product.node.title, price, webhookType, image, sizeright, sizeleft, stock, group, version, qt, links, date)
                        }
                        if (this.REGION == 'US') {
                            let unfilteredus = await helper.hookpost("SHOPIFYUNFILTEREDUS")
                            for (let group of unfilteredus) {
                                helper.postShopify(this.WEBSITE + "/products/" + product.node.handle, product.node.title, price, webhookType, image, sizeright, sizeleft, stock, group, version, qt, links, date)
                            }
                            if (checktitle.includes('jordan') || checktitle.includes('foam') || checktitle.includes('nike') || checktitle.includes('air force') || checktitle.includes('newbalance') || checktitle.includes('yeezy') || checktitle.includes('yeezy slide') || checktitle.includes('dunk') && !checktitle.includes('hoodie') && !checktitle.includes('shirt') && !checktitle.includes('shorts') && !checktitle.includes('socks')) {
                                let filterdus = await helper.hookpost("SHOPIFYFILTEREDUS")
                                for (let group of filterdus) {
                                    helper.postShopify(this.WEBSITE + "/products/" + product.node.handle, product.node.title, price, webhookType, image, sizeright, sizeleft, stock, group, version, qt, links, date)
                                }
                            }
                        } else if
                            (this.REGION == 'CA') {
                            let unfilteredca = await helper.hookpost("SHOPIFYUNFILTEREDCA")
                            for (let group of unfilteredca) {
                                helper.postShopify(this.WEBSITE + "/products/" + product.node.handle, product.node.title, price, webhookType, image, sizeright, sizeleft, stock, group, version, qt, links, date)
                            }
                            if (checktitle.includes('jordan') || checktitle.includes('foam') || checktitle.includes('nike') || checktitle.includes('air force') || checktitle.includes('newbalance') || checktitle.includes('yeezy') || checktitle.includes('yeezy slide') || checktitle.includes('dunk') && !checktitle.includes('hoodie') && !checktitle.includes('shirt') && !checktitle.includes('shorts') && !checktitle.includes('socks')) {
                                let filterdus = await helper.hookpost("SHOPIFYFILTEREDCA")
                                for (let group of filterdus) {
                                    helper.postShopify(this.WEBSITE + "/products/" + product.node.handle, product.node.title, price, webhookType, image, sizeright, sizeleft, stock, group, version, qt, links, date)
                                }
                            }
                        } else {
                            let unfilteredeu = await helper.hookpost("SHOPIFYUNFILTEREDEU")
                            for (let group of unfilteredeu) {
                                helper.postShopify(this.WEBSITE + "/products/" + product.node.handle, product.node.title, price, webhookType, image, sizeright, sizeleft, stock, group, version, qt, links, date)
                            }
                            if (checktitle.includes('jordan') || checktitle.includes('foam') || checktitle.includes('nike') || checktitle.includes('air force') || checktitle.includes('newbalance') || checktitle.includes('yeezy') || checktitle.includes('yeezy slide') || checktitle.includes('dunk') && !checktitle.includes('hoodie') && !checktitle.includes('shirt') && !checktitle.includes('shorts') && !checktitle.includes('socks')) {
                                let filterdus = await helper.hookpost("SHOPIFYFILTEREDEU")
                                for (let group of filterdus) {
                                    helper.postShopify(this.WEBSITE + "/products/" + product.node.handle, product.node.title, price, webhookType, image, sizeright, sizeleft, stock, group, version, qt, links, date)
                                }
                            }
                        }
                    }
                }
                lastHash = currentHash;
                products = body.data.products.edges
                this.monitorProducts(page, limit, lastHash, products)
                return
            } else {
                let method = 'GET'; //request method
                let set = await helper.requestShopify(URL, method, proxy, headers) //request function
                if (set.response.status != 200) {
                    this.monitorProducts(page, limit, lastHash, products)
                    return
                }
                console.log(set.response.status)
                if (!URL.includes('translate.goog')) {
                    let cache = set.response.headers.get("x-cache");
                    if (cache == 'miss, MISS')
                        cache = 'miss'
                    if (cache != 'miss' || cache == 'hit, server, MISS' || cache == 'hit, server') {
                        console.log("Missing Cache header", this.WEBSITE, cache);
                        this.monitorProducts(page, limit, lastHash, products)
                        return;
                    }
                }
                let body = set.json
                let currentHash = body
                if (currentHash == lastHash) {
                    this.monitorProducts(page, limit, lastHash, products);
                    return;
                }
                if (!lastHash) {
                    lastHash = currentHash;
                    products = body.products;
                    this.monitorProducts(page, limit, lastHash, products);
                    return;
                }
                for (let product of body.products) {
                    let webhookType = null;
                    let variants = []
                    let sizes = ""
                    let price = ""
                    let stock = 0
                    for (let variant of product.variants) {
                        if (variant.available && !variants.includes(variant.id)) {
                            variants.push(variant.id);
                            sizes += `[${variant.title.replace('- / ', '')}](${this.WEBSITE}/cart/${variant.id}:1?payment=shop_pay) | [QT](http://YOUmonitors.com/qt) (1+)\n`
                            price = variant.price;
                            stock++
                        }
                    }
                    let inStock = variants.length > 0;
                    if (!inStock) {
                        continue;
                    }
                    let oldProduct = this.findProduct(product.id, products);
                    if (oldProduct) {
                        let oldVariants = [];
                        for (let variant of oldProduct.variants) {
                            if (variant.available) {
                                oldVariants.push(variant.id);
                            }
                        }
                        for (let variant of variants) {
                            if (!oldVariants.includes(variant)) {
                                // console.log(product.title + "  -  " + variant)
                                webhookType = "Restock";
                                break;
                            }
                        }
                    } else {
                        webhookType = "New Product";
                    }
                    if (webhookType) {
                        /* if (this.WEBSITE.includes('https://kith.com')) {
                            let set3 = await helper.requestBody(`${this.WEBSITE + "/products/" + product.handle}?order=${v4()}`, method, proxy, headers) //request function
                            if (set3.response.status != 200) {
                                this.monitorProducts(page, limit, lastHash, products)
                                return
                            }
                            let body3
                            if (this.WEBSITE.includes('https://kith.com')) {
                                body3 = set3.resp.split('application/json" data-product-json>')[1].split('</script>')[0].trim()
                            }
                            body3 = await JSON.parse(body3)
                            sizes = ''
                            stock = 0
                            for (let variant of body3.variants) {
                                if (variant.inventory_quantity > 0) {
                                    sizes += `[${variant.title}](${this.WEBSITE}/cart/${variant.id}:1) | [QT](http://YOUmonitors.com/qt) [${variant.inventory_quantity}]\n`
                                    stock += variant.inventory_quantity
                                }
                            }
                        } else { */
                        let set2 = await helper.requestShopify(`${this.WEBSITE + "/products/" + product.handle}.json?order=${v4()}`, method, proxy, headers) //request function
                        if (set2.response.status != 200) {
                            this.monitorProducts(page, limit, lastHash, products)
                            return
                        }
                        let variantse = await set2.json.product.variants
                        if (JSON.stringify(variantse).includes('inventory_quantity')) {
                            sizes = ''
                            stock = 0
                            for (let variant of variantse) {
                                if (variant.inventory_quantity > 0) {
                                    sizes += `[${variant.title}](${this.WEBSITE}/cart/${variant.id}:1?payment=shop_pay) | [QT](http://YOUmonitors.com/qt) [${variant.inventory_quantity}]\n`
                                    stock += variant.inventory_quantity
                                }
                            }
                        }
                        //}
                        let date = new Date()
                        console.log(`[SHOPIFY] (${this.WEBSITE}) ${date} - ${product.title}`)
                        let qt = `Na`
                        let links = 'Na'
                        let sizeright = sizes.split('\n')
                        let sizeleft = sizeright.splice(0, Math.floor(sizeright.length / 2))
                        let all = await helper.hookpost('SHOPIFYUNFILTEREDALL')
                        let sites = await helper.hookpost(this.DBSITE)
                        let checktitle = product.title.toLowerCase()
                        let filtered = false
                        let continues = false
                        for (let group of all) {
                            helper.postShopify(this.WEBSITE + "/products/" + product.handle, product.title, price, webhookType, product.images[0] ? product.images[0].src : null, sizeright, sizeleft, stock, group, version, qt, links, date)
                        }
                        for (let group of sites) {
                            helper.postShopify(this.WEBSITE + "/products/" + product.handle, product.title, price, webhookType, product.images[0] ? product.images[0].src : null, sizeright, sizeleft, stock, group, version, qt, links, date)
                        }
                        for (let filter of filters) {
                            if (filter.includes('+')) {
                                if (checktitle.includes(filter.replace('+', ''))) {
                                    filtered = true
                                    continues = true
                                }
                            }
                            if (continues) {
                                if (filter.includes('-')) {
                                    if (checktitle.includes(filter.replace('-', ''))) {
                                        filtered = false
                                    }
                                }
                            }

                        }
                        if (this.REGION == 'US') {
                            let unfilteredus = await helper.hookpost("SHOPIFYUNFILTEREDUS")
                            for (let group of unfilteredus) {
                                helper.postShopify(this.WEBSITE + "/products/" + product.handle, product.title, price, webhookType, product.images[0] ? product.images[0].src : null, sizeright, sizeleft, stock, group, version, qt, links, date)
                            }
                            if (filtered) {
                                let filterdus = await helper.hookpost("SHOPIFYFILTEREDUS")
                                for (let group of filterdus) {
                                    helper.postShopify(this.WEBSITE + "/products/" + product.handle, product.title, price, webhookType, product.images[0] ? product.images[0].src : null, sizeright, sizeleft, stock, group, version, qt, links, date)
                                }
                            }
                        } else if
                            (this.REGION == 'CA') {
                            let unfilteredca = await helper.hookpost("SHOPIFYUNFILTEREDCA")
                            for (let group of unfilteredca) {
                                helper.postShopify(this.WEBSITE + "/products/" + product.handle, product.title, price, webhookType, product.images[0] ? product.images[0].src : null, sizeright, sizeleft, stock, group, version, qt, links, date)
                            }
                            if (filtered) {
                                let filterdus = await helper.hookpost("SHOPIFYFILTEREDCA")
                                for (let group of filterdus) {
                                    helper.postShopify(this.WEBSITE + "/products/" + product.handle, product.title, price, webhookType, product.images[0] ? product.images[0].src : null, sizeright, sizeleft, stock, group, version, qt, links, date)
                                }
                            }
                        } else {
                            let unfilteredeu = await helper.hookpost("SHOPIFYUNFILTEREDEU")
                            for (let group of unfilteredeu) {
                                helper.postShopify(this.WEBSITE + "/products/" + product.handle, product.title, price, webhookType, product.images[0] ? product.images[0].src : null, sizeright, sizeleft, stock, group, version, qt, links, date)
                            }
                            if (filtered) {
                                let filterdus = await helper.hookpost("SHOPIFYFILTEREDEU")
                                for (let group of filterdus) {
                                    helper.postShopify(this.WEBSITE + "/products/" + product.handle, product.title, price, webhookType, product.images[0] ? product.images[0].src : null, sizeright, sizeleft, stock, group, version, qt, links, date)
                                }
                            }
                        }
                    }
                }
                lastHash = currentHash;
                products = body.products
                this.monitorProducts(page, limit, lastHash, products)
                return
            }
        } catch (err) {
            console.log(err)
            console.log(this.WEBSITE)
            this.monitorProducts(page, limit, lastHash, products)
        }
    }
    async monitorAntibot() {
        let justStarted = true
        let URL = this.WEBSITE + "/checkout";
        let proxy = await helper.getRandomProxy2();
        let method = 'GET'; //request method
        let headers = {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
            'X-FORWARDED-FOR': '8.8.8.8'
        }
        if (this.DBSITE == "SHOPIFYFUNKO" || this.DBSITE == "SHOPIFYCNCPTS" || this.WEBSITE.includes('oqium.com')) {
            URL = `${this.WEBSITE.split('-').join('--').split('.').join('-')}.translate.goog/checkout?_x_tr_sl=auto&_x_tr_tl=en&_x_tr_hl=en&_x_tr_pto=wapp`;  //Or you can use ?collection or ?a or ?q
            headers = {
                'user-agent': 'Mozilla/5.0 (compatible; Google-Site-Verification/1.0)',
            }
        }
        try {
            let set = await helper.requestBody(URL, method, proxy, headers) //request function
            //console.log(set.response.status)
            if (set.response.status == 403) {
                this.monitorAntibot()
                return;
            }
            let image = 'https://cdn.shopify.com/static/share-image-common.jpg'
            image = 'http:' + set.resp.split('<link rel="shortcut icon" href="')[1].split('" type="')[0]
            if (set.response.url.includes('password')) {
                if (this.password !== "Up") {
                    this.password = "Up"
                    if (justStarted) {
                        this.monitorAntibot();
                        justStarted = false;
                        return;
                    }
                    console.log(`[SHOPIFY] (${this.WEBSITE}) Password Page Up!`);
                    let sites = await helper.hookpost(this.DBSITE)
                    for (let group of sites) {
                        helper.postPassword(this.WEBSITE, group, `Password page on ${this.WEBSITE} is Up!`, 'Pass v1.0', image)
                    }
                    let password = await helper.hookpost("SHOPIFYPINGSPASSWORD")
                    for (let group of password) {
                        helper.postPassword(this.WEBSITE, group, `Password page on ${this.WEBSITE} is Up!`, 'Pass v1.0', image)
                    }
                }
            } else {
                if (this.password !== "Down") {
                    this.password = "Down"
                    if (justStarted) {
                        this.monitorAntibot();
                        justStarted = false;
                        return;
                    }
                    console.log(`[SHOPIFY] (${this.WEBSITE}) Password Page Down!`);
                    let sites = await helper.hookpost(this.DBSITE)
                    for (let group of sites) {
                        helper.postPassword(this.WEBSITE, group, `Password page on ${this.WEBSITE} is Down!`, 'Pass v1.0', image)
                    }
                    let password = await helper.hookpost("SHOPIFYPINGSPASSWORD")
                    for (let group of password) {
                        helper.postPassword(this.WEBSITE, group, `Password page on ${this.WEBSITE} is Down!`, 'Pass v1.0', image)
                    }
                }
            }
            await helper.sleep(2000)
            this.monitorAntibot();
            return;
        } catch (err) {
            //console.log(err)
            this.monitorAntibot()
            return;
        }
    }
    findProduct(id, products) {
        for (let product of products) {
            if (product.id === id)
                return product;
        }
    }
    findProduct2(id, products) {
        for (let product of products) {
            if (product.node.id === id)
                return product;
        }
    }
}
module.exports = ShopifyMonitor;