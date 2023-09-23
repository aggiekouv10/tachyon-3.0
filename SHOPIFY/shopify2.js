let ShopifyMonitor = require('./base.js');
let monitors = [];
monitors.push(new ShopifyMonitor("https://shop.doverstreetmarket.com", 'DSMUK', 'UK'))
monitors.push(new ShopifyMonitor("https://space23.it", 'NONE', 'IT'))
monitors.push(new ShopifyMonitor("https://mita-sneakers.co.jp", 'NONE', 'JP'))
monitors.push(new ShopifyMonitor("https://titan22.com", 'NONE', 'US'))
monitors.push(new ShopifyMonitor("https://stoy.com", 'NONE', 'US'))
//monitors.push(new ShopifyMonitor("https://amongstfew.com", 'NONE'))
monitors.push(new ShopifyMonitor("https://limitededt.com", 'NONE', 'US'))
monitors.push(new ShopifyMonitor("https://burnrubbersneakers.com", 'NONE', 'US'))
monitors.push(new ShopifyMonitor("https://bandier.com", 'NONE', 'US'))
monitors.push(new ShopifyMonitor("https://it.oneblockdown.it", 'NONE', 'IT'))
monitors.push(new ShopifyMonitor("https://sportsworld165.com", 'HATS', 'US'))
monitors.push(new ShopifyMonitor("https://shopcapcity.com", 'HATS', 'US'))
monitors.push(new ShopifyMonitor("https://pvtchworktvb.com", 'HATS', 'US'))
monitors.push(new ShopifyMonitor("https://madebyerickshop.com", 'HATS', 'US'))
monitors.push(new ShopifyMonitor("https://chonchispins.com", 'HATS', 'US'))
monitors.push(new ShopifyMonitor("https://capsulehats.com", 'HATS', 'US'))
monitors.push(new ShopifyMonitor("https://hatclub.com", 'HATS', 'US'))
monitors.push(new ShopifyMonitor("https://sneakerbaas.com", 'NONE', 'US'))
monitors.push(new ShopifyMonitor("https://proj3ct.it", 'NONE', 'IT'))
monitors.push(new ShopifyMonitor("https://fearofgod.com", 'NONE', 'US'))
monitors.push(new ShopifyMonitor("https://epitomeatl.com", 'NONE', 'US'))
monitors.push(new ShopifyMonitor("https://culturekings.com.au", 'NONE', 'AU'))
monitors.push(new ShopifyMonitor("https://culturekings.com", 'NONE', 'US'))
monitors.push(new ShopifyMonitor("https://crossoverconceptstore.com", 'NONE', 'US'))
for(let monitor of monitors) {
    monitor.monitor();
}