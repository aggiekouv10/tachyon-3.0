const { getAvilablityFTL, getGeo, getAvilablityChamps } = require("../services/footsites.js");
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require("discord.js");

const checkFlxCommand = new SlashCommandBuilder()
    .setName("checkflx")
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
            .setDescription("Product ID")
            .setRequired(true)
    )


const executeCheckFlxCommand = async (interaction, args) => {
    try {
        await interaction.deferReply()
        const zipcode = interaction.options?.get("zip") || { value: args[0] }
        const sku = interaction.options?.get("sku") || { value: args[1] }
        if (sku.value.includes('-')) return interaction.editReply?.('Please Use Product ID Not Sku')
        if (!zipcode.value || !sku.value) return interaction.editReply?.("Invalid arguments") || interaction.reply("Invalid arguments")

        const cords = await getGeo(zipcode.value)
        const flx = await getAvilablityFTL(cords, sku.value)
        const champssports = await getAvilablityChamps(cords, sku.value)
        const both = flx.concat(champssports)

        const embeds = []
        for (i = 0; i < 10 && i < both.length; i++) {
            const store = both[i];

            let productLink = sku.value
            if (store.type == "Champs Sports") {
                productLink = `[${sku.value}](https://www.champssports.com/product/~/${sku.value}.html)`
            } else {
                productLink = `[${sku.value}](https://www.footlocker.com/product/~/${sku.value}.html)`
            }

            let author_name = "Footlocker"
            let author_url = "https://www.footlocker.com/"
            if (store.type === "Champs Sports") {
                author_name = store.type
                author_url = "https://www.champssports.com/"
            }

            const embed = new EmbedBuilder()
                .setColor(55295)
                .setTitle(`${store.storeName} - ${store.distance} away`)
                .setAuthor({ name: author_name, url: author_url })
                .setThumbnail(`https://images.footlocker.com/is/image/EBFL2/${sku.value}_a1?wid=500&hei=500&fmt=png-alpha`)
                .addFields({
                    name: 'Product ID',
                    value: sku.value || "UM",
                    inline: true
                }, {
                    name: 'Store Name',
                    value: store.storeName || "UM",
                    inline: true
                }, {
                    name: 'Postal Code',
                    value: store.zipcode || "UM",
                    inline: true
                }, {
                    name: 'State',
                    value: store.state || "UM",
                    inline: true
                }, {
                    name: 'Address 1',
                    value: store.address1 || "UM",
                    inline: true
                }, {
                    name: 'Address 2',
                    value: store.address2.length > 3 ? store.address2 : "N/A",
                    inline: true
                },
                    {
                        name: "Store Type",
                        value: store.type,
                        inline: true
                    },
                    {
                        name: 'Size [Stock]',
                        value: store.sizes.join("\n"),
                        inline: false
                    },
                    {
                        name: 'Product Link',
                        value: productLink || "UM",
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

        if (embeds.length) return interaction.editReply?.({ embeds: embeds.slice(0, 10) }) || interaction.reply({ embeds: embeds.slice(0, 10) })
        else return interaction.editReply?.("Unable to process request") || interaction.reply("Failed to process request")


    } catch (e) {
        return interaction.reply({ content: "Error Occured", ephemeral: true })
    }
}
module.exports = {
    checkFlxCommand,
    executeCheckFlxCommand
}