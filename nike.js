async function stock(colorcode, channel, nikeSizes, notfinished) {
    let r1 = await fetch(`https://api.nike.com/product_feed/threads/v2?filter=exclusiveAccess(true,false)&filter=channelId(${channel})&filter=marketplace(US)&filter=language(en)&filter=publishedContent.properties.products.styleColor(${colorcode})`, {
        "headers": {
            'User-Agent': "Mozilla/5.0 (compatible; Google-Site-Verification/1.0)",
            "X-FORWARDED-FOR": "8.8.8.8",
        }
    });
    let r2 = await r1.json()
    nikeSizes = []
    if (r2.objects.length < 0) {
        module.exports.stock(colorcode, '010794e5-35fe-4e32-aaff-cd2c74f89d61', nikeSizes, notfinished)
        return
    }
    let slug = r2.objects[0].productInfo[0].productContent.slug
    let variantids = r2.objects[0].productInfo[0].availableSkus
    let varient = r2.objects[0].productInfo[0].merchProduct.id
    let sizeids = r2.objects[0].productInfo[0].skus
    let title = r2.objects[0].productInfo[0].productContent.fullTitle + " - " + r2.objects[0].productInfo[0].productContent.colorDescription;
    let price = r2.objects[0].productInfo[0].merchPrice.currentPrice + " (" + r2.objects[0].productInfo[0].merchPrice.currency + ")";
    let image = r2.objects[0].productInfo[0].imageUrls.productImageUrl;
    let prodstatus = r2.objects[0].productInfo[0].merchProduct.status
    let proxy = await getRandomProxy3();
    let server = proxy.split('@')[1]
    let user = "OR587074010"
    let pass = "AqnXz4Mc"
    let counter = 0
    const browser = await firefox.launch({
        headless: true,
        proxy: {
            server: server,
            username: user,
            password: pass
        },
    })
    const context = await browser.newContext();
    const page = await context.newPage();
    const timeoutId = setTimeout(() => {
        notfinished = false
        browser.close()
        return
    }, 40000)
    await page.goto('https://www.nike.com/cart');
    for (let variant of variantids) {
        if (variant.available) {
            counter++
        }
    }
    for (let variant of variantids) {
        if (variant.available) {
            for (let size of sizeids) {
                if (variant.id == size.id) {
                    await check(page, prod = { id: variant.productId, skuid: variant.id, quantity: 1000, sizeid: size.countrySpecifications[0].localizedSize, counts: counter }, 1000)
                }
            }
        }
    }
    while (notfinished) {
        await sleep(1000)
    }
    clearTimeout(timeoutId)
    return [nikeSizes, title, price, image, slug, varient, prodstatus]
    async function sizeSave(size) {
        nikeSizes.push(size)
    }
    async function Sizelength() {
        return nikeSizes.length + 1
    }
    async function check(page, prod, number, browser) {
        try {
            let response = await page.evaluate(async (prod) => {
                return await fetch('https://api.nike.com/cic/grand/v1/graphql/getfulfillmentofferingsandcartreviews/v8', {
                    "headers": {
                        "appid": "com.nike.commerce.nikedotcom.web",
                        "content-type": "application/json; charset=UTF-8",
                        "x-nike-visitid": "1",
                        "x-nike-visitorid": '60ad758a-ec0b-4a4a-b514-205c92026f38',
                    },
                    "referrer": "https://www.nike.com/",
                    "referrerPolicy": "strict-origin-when-cross-origin",
                    "body": JSON.stringify({ "variables": { "timeout": 3000, "country": "DE", "input": { "country": "DE", "currency": "USD", "items": [{ "id": prod.id, "quantity": prod.quantity, "skuId": prod.skuid, "valueAddedServices": [], "locations": [{ "type": "SHIPPING", "postalAddress": { "country": "DE" } }] }], "locale": "en-US", "offeringTypes": ["SHIP", "DIGITAL"], "promotionCodes": [] } }, "operationName": "getFulfillmentOfferingsAndCartReviews" }),
                    "method": "POST",
                    "mode": "cors",
                    "credentials": "include"
                })
                    .then(r => r.ok ? r.json() : Promise.reject(r))

            }, prod)
            if (response.data.fulfillmentOfferings.error == null) {
                prod.quantity += number
                check(page, prod, number, browser)
            } else if (response.data.fulfillmentOfferings.error.message == "Not Found") {
                prod.quantity -= number
                number = Math.round(number / 2)
                prod.quantity += number
                if (number == 1) {
                    if (await Sizelength() == prod.counts) {
                        notfinished = false
                    }
                    console.log(prod.sizeid, prod.quantity, prod.skuid)
                    sizeSave({ size: prod.sizeid, qty: prod.quantity })
                    return
                }
                check(page, prod, number, browser)
                return
            }
        } catch (e) {
            if (e.toString().includes('NetworkError')) {
                await sleep(4000)
                check(page, prod, number, browser)
                return
            }
            if (e.toString().includes('browser has been closed')) {
                return
            }
            console.log(e)
            await sleep(2000)
            check(page, prod, number, browser)
            //await browser.close();
            return
        }
    }
}

