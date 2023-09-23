let convert = require("convert-zip-to-gps");
const got = require("got")

const getProductInfo = async (sku, country, language) => {
    const url =
        "https://api.nike.com/product_feed/threads/v2" +
        `?filter=marketplace(${country})` +
        `&filter=language(${language})` +
        `&filter=productInfo.merchProduct.styleColor(${sku})` +
        `&filter=channelId(d9a5bc42-4b9c-4976-858a-f159cf99c647)`;

    try {
        return (await got.get(url).json()).objects[0].productInfo[0]
    } catch (e) {
        console.error("[ERROR]: getProductInfo -", e)
        return null
    }
};

const getStock = async (sku, storeId) => {
    const url =
        `https://api.nike.com/deliver/available_gtins/v3` +
        `?filter=styleColor(${sku})` +
        `&filter=storeId(${storeId})` +
        `&filter=method(INSTORE)`;

    try {
        return (await got.get(url).json()).objects;
    } catch (e) {
        console.error(`[ERROR]: getStock(${sku}, ${storeId}) -`, e)
        return null;
    }
};

const getStores = async (zipcode) => {
    try {
        let cords = convert.zipConvert(zipcode)
        console.log(cords)
        let longitude = cords.split(',')[1];
        let latitude = cords.split(',')[0];

        let lat1 = latitude.split('.')[0];
        let lat2 = latitude.split('.')[1];
        let long1 = longitude.split('.')[0];
        let long2 = longitude.split('.')[1];

        if(lat2.length>2){
            lat2 = lat2.substring(0,2);
            latitude = lat1 + '.' + lat2;
        }

        if(long2.length>2){
            long2 = long2.substring(0,2);
            longitude = long1 + '.' + long2;
        }

        const url =
            "https://api.nike.com/store/store_locations/v1" +
            "?language=de-DE" +
            `&search=(((brand%3D%3DNIKE%20and%20facilityType%3D%3DNIKE_OWNED_STORE%20or%20facilityType%3D%3DFRANCHISEE_PARTNER_STORE%20or%20facilityType%3D%3DMONO_BRAND_NON_FRANCHISEE_PARTNER_STORE%20and%20(region!%3DGREATER_CHINA))%20and%20(businessConcept!%3DEMPLOYEE_STORE%20and%20businessConcept!%3DBRAND_POP_UP))%20and%20(coordinates%3DgeoProximity%3D%7B%22maxDistance%22%3A%2050%2C%20%22measurementUnits%22%3A%20%22mi%22%2C%22latitude%22%3A%20${latitude}%2C%20%22longitude%22%3A%20${longitude}%7D))`;

        return (await got.get(url).json()).objects;
    } catch (e) {
        console.error("[ERROR]: getStores -", e)
        return null
    }
}

module.exports = {
    getProductInfo,
    getStock,
    getStores
}