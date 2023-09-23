let ShopifyMonitor = require('./base.js');
let monitors = [];
monitors.push(new ShopifyMonitor("https://shop.ccs.com", 'NONE', 'US'))
monitors.push(new ShopifyMonitor("https://303boards.com", 'NONE', 'US'))
monitors.push(new ShopifyMonitor("https://area51store.co.nz", 'NONE', 'NZ'))
monitors.push(new ShopifyMonitor("https://twofeetundr.com", 'NONE', 'US'))
monitors.push(new ShopifyMonitor("https://chalicecollectibles.com", 'NONE', 'US'))
monitors.push(new ShopifyMonitor("https://store.taylorYOU.com", 'NONE', 'US'))
monitors.push(new ShopifyMonitor("https://shopwss.com", 'NONE', 'US'))
monitors.push(new ShopifyMonitor("https://ficegallery.com", 'NONE', 'US'))
monitors.push(new ShopifyMonitor("https://ferraramarketinc.com", 'NONE', 'US'))
monitors.push(new ShopifyMonitor("https://finalmouse.com", 'NONE', 'US'))
monitors.push(new ShopifyMonitor("https://laborskateshop.com", 'NONE', 'US'))
monitors.push(new ShopifyMonitor("https://stay-rooted.com", 'NONE', 'US'))
monitors.push(new ShopifyMonitor("https://leencustoms.com", 'NONE', 'US'))
monitors.push(new ShopifyMonitor("https://futurerfrnce.com", 'NONE', 'US'))
monitors.push(new ShopifyMonitor("https://4ucaps.com", 'NONE', 'US'))
monitors.push(new ShopifyMonitor("https://stussy.com", 'NONE', 'US'))
monitors.push(new ShopifyMonitor("https://bbbranded.com", 'BBBRANDED', 'US'))
monitors.push(new ShopifyMonitor("https://pleasuresnow.com", 'NONE', 'US'))
monitors.push(new ShopifyMonitor("https://35thnorth.com", 'NONE', 'US'))
monitors.push(new ShopifyMonitor("https://calif.cc", 'NONE', 'JP'))
monitors.push(new ShopifyMonitor("https://www.westnyc.com", 'NONE', 'US'))
monitors.push(new ShopifyMonitor("https://juicestore.com", 'NONE', 'US'))
monitors.push(new ShopifyMonitor("https://corporategotem.com", 'NONE', 'US'))
monitors.push(new ShopifyMonitor("https://safari-zone.com", 'NONE', 'US'))
monitors.push(new ShopifyMonitor("https://soleclassics.com", 'NONE', 'US'))
monitors.push(new ShopifyMonitor("https://sneakerboxshop.ca", 'UNFILTEREDCA', 'CA'))
monitors.push(new ShopifyMonitor("https://drinkprime.uk", 'NONE', 'UK'))
//monitors.push(new ShopifyMonitor("https://oqium.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://thenextdoor.fr", 'NONE', 'FR'))
//
//
for(let monitor of monitors) {
    monitor.monitor();
}