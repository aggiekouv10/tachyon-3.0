const { getProductInfo, getStock, getStores } = require("../services/nike.js");
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require("discord.js");
const helper = require('../../main/helper');

const checkCommand = new SlashCommandBuilder()
    .setName("check")
    .setDescription("Check local store stock levels")
    .addStringOption(
        option => option
            .setName("zip")
            .setDescription("Your zipcode")
            .setRequired(true)
    )
    .addStringOption(
        option => option
            .setName("sku")
            .setDescription("Product sku")
            .setRequired(true)
    )

const executeCheckCommand = async (interaction, args) => {
    try {
        await interaction.deferReply({ephemeral: true })
        const zipcode = interaction.options?.get("zip") || { value: args[0] }
        const sku = interaction.options?.get("sku") || { value: args[1] }
        if (!zipcode.value || !sku.value) return interaction.editReply?.("Invalid arguments") || interaction.reply("Invalid arguments")

        const product = await getProductInfo(sku.value, "US", "en")
        if (!product) {
            const embed = new EmbedBuilder()
            embed.setColor(55295)
            embed.setTitle("No Stock Found!")
            embed.setDescription("Product Is Most Likely Sold Out Or Sku Is Invalid")
            embed.setTimestamp()
            embed.setThumbnail("https://media.discordapp.net/attachments/820804762459045910/1113301339901014036/YOU_8.png?width=979&height=979")
            embed.setFooter({
                text: 'Powered By YOU Monitors',
                iconURL: "https://media.discordapp.net/attachments/820804762459045910/1113301339901014036/YOU_8.png?width=979&height=979"
            })
            return interaction.editReply?.({ embeds: [embed] }) || interaction.reply({ embeds: [embed] })
        }

        const stores = await getStores(zipcode.value)
        if (!stores || !stores.length) return interaction.editReply?.("No stores found") || interaction.reply("No stores found")

        const embeds = []
        for (let i = 0; i < 10 && i < stores.length; i++) {
            let t = 0
            const store = stores[i]
            const stock = await getStock(sku.value, store.id)
            if (!stock || !stock.length) continue
            const availability =
                product.skus.map(sku => {
                    const stockData = stock.find(x => x.gtin === sku.gtin)
                    if (!stockData) return
                    if (t > 11) return
                    t++
                    return `${sku.nikeSize}-${stockData.level}\n`
                })
                    .join("")

            const last_update =
                new Date(Math.max(...stock.map(e => new Date(e.modificationDate))));

            const embed = new EmbedBuilder()
                .setColor(55295)
                .setTitle(product.productContent.fullTitle)
                .setThumbnail(`https://secure-images.nike.com/is/image/DotCom/${sku.value.replace('-', '_')}`)
                .addFields({
                    name: 'SKU',
                    value: sku.value,
                    inline: true
                }, {
                    name: 'Store Name',
                    value: `[${store.name}](https://www.nike.com/retail/s/${store.name.toLowerCase().replaceAll(' ', '-')})`,
                    inline: true
                }, {
                    name: 'Postal Code',
                    value: store.address.postalCode,
                    inline: true
                }, {
                    name: 'locale',
                    value: store.locale,
                    inline: true
                }, {
                    name: 'State',
                    value: store.address.state,
                    inline: true
                }, {
                    name: 'Address 1',
                    value: store.address.address1,
                    inline: true
                }, {
                    name: 'Address 2',
                    value: store.address.address2 || "N/A",
                    inline: true
                }, {
                    name: 'Size [Stock]',
                    value: availability,
                    inline: false
                },
                    {
                        name: 'Last Checkout/Restock',
                        value: `<t:${last_update.getTime() / 1000}:F> `,
                        inline: false
                    },
                    {
                        name: 'Product Link',
                        value: `[${product.productContent.fullTitle}](https://www.nike.com/t/${product.productContent.slug}/${sku.value})`,
                        inline: false
                    },
                    {
                        name: 'Resell Links',
                        value: `[StockX](https://stockx.com/search?s=${sku.value})|[GOAT](https://www.goat.com/search?query=${sku.value})`,
                        inline: false
                    },
                )
                .setTimestamp()
                .setFooter({
                    text: `Powered by YOU Monitors`,
                    iconURL: "https://media.discordapp.net/attachments/820804762459045910/1113301339901014036/YOU_8.png?width=979&height=979"
                })

            embeds.push(embed)
        }
        console.log(embeds)
        if (embeds.length) return interaction.editReply?.({ embeds: embeds.slice(0, 5) }) || interaction.reply({ embeds: embeds.slice(0, 5) })
        else {
            const embed = new EmbedBuilder()
            embed.setColor(55295)
            embed.setTitle("No Stock Found!")
            embed.setDescription("Product Is Most Likely Sold Out Or Sku Is Invalid")
            embed.setTimestamp()
            embed.setThumbnail("https://media.discordapp.net/attachments/820804762459045910/1113301339901014036/YOU_8.png?width=979&height=979")
            embed.setFooter({
                text: 'Powered By YOU Monitors',
                iconURL: "https://media.discordapp.net/attachments/820804762459045910/1113301339901014036/YOU_8.png?width=979&height=979"
            })
            return interaction.editReply?.({ embeds: [embed] }) || interaction.reply({ embeds: [embed] })
        }
    } catch (e) {
        return interaction.reply({ content: "Error Occured", ephemeral: true })
    }
}

module.exports = { checkCommand, executeCheckCommand }