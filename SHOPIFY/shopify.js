let ShopifyMonitor = require('./base.js');
let monitors = [];
monitors.push(new ShopifyMonitor("https://kith.com", 'KITHUS', 'US'));
monitors.push(new ShopifyMonitor("https://eu.kith.com", 'KITHEU', 'EU'))
monitors.push(new ShopifyMonitor("https://undefeated.com", 'UNDEFEATED', 'US'))
monitors.push(new ShopifyMonitor("https://studiofy7.com", "STUDIOFY7", 'US'))
monitors.push(new ShopifyMonitor("https://shop.palaceskateboards.com", 'PALACEUK', 'UK'))
monitors.push(new ShopifyMonitor("https://shop-usa.palaceskateboards.com", 'PALACEUS', 'US'))
monitors.push(new ShopifyMonitor("https://shoepalace.com", 'SHOEPALACE', 'US'))
//monitors.push(new ShopifyMonitor("https://ycmc.com", 'YCMC')) Gone?
//monitors.push(new ShopifyMonitor("https://packershoes.com", 'PACKER'))
//monitors.push(new ShopifyMonitor("https://jimmyjazz.com", 'JIMMYJAZZ')) Snipes bought them
monitors.push(new ShopifyMonitor("https://shopnicekicks.com", 'SNK', 'US'))
monitors.push(new ShopifyMonitor("https://exclusivefitted.com", 'EXCLUSIVEFITTED', 'US'))
monitors.push(new ShopifyMonitor("https://myfitteds.com", 'MYFITTEDS', 'US'))
monitors.push(new ShopifyMonitor("https://slamjam.com", 'SLAMJAM', 'US'),)
monitors.push(new ShopifyMonitor("https://shop.travisscott.com", 'TRAVIS', 'US'))
monitors.push(new ShopifyMonitor("https://cactusplantfleamarket.com", 'CPFM', 'US'))
monitors.push(new ShopifyMonitor("https://dtlr.com", 'DTLR', 'US'))
monitors.push(new ShopifyMonitor("https://kawsone.com", 'KAWS', 'US'))
monitors.push(new ShopifyMonitor("https://pesoclo.com", 'PESOCLO', 'US'))
monitors.push(new ShopifyMonitor("https://bape.com", 'BAPE', 'JP'))
monitors.push(new ShopifyMonitor("https://funkoeurope.com", 'FUNKOEUROPE', 'EU'))
for(let monitor of monitors) {
    monitor.monitor();
}