
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require("discord.js");
const helper = require('../../main/helper.js');

const checkfjCommand = new SlashCommandBuilder()
    .setName("fnlstore")
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


const executeCheckfjCommand = async (interaction, args) => {
    try {
        const zipcode = interaction.options?.get("zip") || { value: args[0] }
        const sku = interaction.options?.get("sku") || { value: args[1] }
        if (!zipcode.value || !sku.value) return interaction.reply("Invalid arguments")
        if (!sku.value.includes('prod')) {
            const embed = new EmbedBuilder()
            embed.setColor(55295)
            embed.setTitle("Product Not Found!")
            embed.setDescription("Please Use Product ID Not Sku")
            embed.addFields({
                name: 'Example',
                value: 'prod795980'
            })
            embed.setTimestamp()
            embed.setThumbnail("https://media.discordapp.net/attachments/820804762459045910/1113301339901014036/YOU_8.png?width=979&height=979")
            embed.setFooter({
                text: 'Powered By YOU Monitors',
                iconURL: "https://media.discordapp.net/attachments/820804762459045910/1113301339901014036/YOU_8.png?width=979&height=979"

            })
            return interaction.reply({ embeds: [embed] })
        }
        await interaction.reply({ content: "Checking Stores", ephemeral: true })
        let stores = await helper.checkfnlstore(sku.value, zipcode.value)
        if (stores.length < 0) {
            return interaction.editReply?.("Product OOS") || interaction.reply("Product OOS")
        }
        const embeds = []
        for (let store of stores) {
            let sizeright = store.sizes.split('\n')
            let sizeleft = sizeright.splice(0, Math.floor(sizeright.length / 2))
            sizeleft = sizeleft.join('\n')
            sizeright = sizeright.join('\n')
            const embed = new EmbedBuilder()
                .setColor(55295)
                .setTitle(store.title)
                .setAuthor({ name: store.uri, url: store.uri })
                .setThumbnail(store.image)
                .addFields(
                    {
                        name: 'Product ID',
                        value: store.pid || "UM",
                        inline: true
                    },
                    {
                        name: 'Color ID',
                        value: store.colorID || "UM",
                        inline: true
                    },
                    {
                        name: 'Status',
                        value: 'In Stock' || "UM",
                        inline: true
                    },
                    {
                        name: 'Store Address',
                        value: `${store.street.split(',').join('\n')}` || "UM",
                        inline: true
                    },
                    {
                        name: 'Phone Number',
                        value: store.phone || "UM",
                        inline: true
                    },
                    {
                        name: 'Product Link',
                        value: `[Link](${store.url})` || "UM",
                        inline: true
                    },
                    {
                        name: 'Sizes',
                        value: sizeleft || "-",
                        inline: true
                    },
                    {
                        name: 'Sizes',
                        value: sizeright || "-",
                        inline: true
                    },
                    {
                        name: 'Resell Links',
                        value: `[Directions](https://www.google.com/maps/place/${store.street.split(',').join('+').split(' ').join('+')}) | [StockX](https://stockx.com/search?s=${store.title.split(' ').join('+')}) | [GOAT](https://www.goat.com/search?query=${store.title.split(' ').join('+')})`,
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
        if (embeds.length) return interaction.editReply({ content: "", embeds: embeds.slice(0, 5) })
        else {
            return interaction.editReply("Product OOS")
        }


    } catch (e) {
        console.log(e)
        return interaction.reply({ content: "Please try again", ephemeral: true })
    }
}
module.exports = {
    checkfjCommand,
    executeCheckfjCommand
}