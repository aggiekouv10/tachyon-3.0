const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require("discord.js");
const helper = require('../../main/helper');
try {
    const nikestockCommand = new SlashCommandBuilder()
        .setName("nikestock")
        .setDescription("Check Nike Online stock")
        .addStringOption(
            option => option
                .setName("pid")
                .setDescription("Product ID")
                .setRequired(true)
        )
    const executenikestockCommand = async (interaction, args) => {
        try {
            const pid = interaction.options?.get("pid") || { value: args[0] }
            if (!pid.value) return interaction.reply({ content: "Invalid arguments", ephemeral: true })
            let sizes = []
            let totalstock = 0
            const timeoutId = setTimeout(() => {
                return interaction.reply({ content: "An Error has occurred", ephemeral: true })
            }, 120000)
            await interaction.deferReply()
            let product = await helper.stock(pid.value, "d9a5bc42-4b9c-4976-858a-f159cf99c647", [], true)
            clearTimeout(timeoutId)
            let varient = product[5].toString()
            for (let size of product[0]) {
                sizes += `[${size.size}](http://api.URL.com/nike?pid=${varient}) - ${size.qty}\n`
                totalstock += size.qty
            }
            let price = product[2].toString()
            let image = product[3].toString()
            let title = product[1].toString()
            let prodstatus = product[6].toString() 
            let url = `https://www.nike.com/t/${product[4]}/${pid.value}`
            let sizeright = sizes.split('\n')
            let sizeleft = sizeright.splice(0, Math.floor(sizeright.length / 2))
            sizeleft = sizeleft.join('\n')
            sizeright = sizeright.join('\n')
            let links = `[Nikeweb](${url}) | [Stockx](https://stockx.com/search?s=${pid.value}) | [Goat](https://goat.com/search?query=${pid.value}) | [Google](https://www.google.com/search?q=${pid.value})`
            if (product[0].length < 0) {
                return interaction.reply({ content: "An Error has occurred", ephemeral: true })
            }
            if (product[0].length > 0) {
                const embed = new EmbedBuilder()
                embed.setURL(url)
                embed.setColor(55295)
                embed.setTitle(title)
                embed.addFields(
                    {
                        name: 'Price',
                        value: price,
                        inline: true
                    },
                    {
                        name: 'PID',
                        value: pid.value.toString(),
                        inline: true
                    },
                    {
                        name: 'Total Stock',
                        value: totalstock.toString(),
                        inline: true
                    },
                    {
                        name: 'Sizes',
                        value: sizeleft,
                        inline: true
                    },
                    {
                        name: 'Sizes',
                        value: sizeright,
                        inline: true
                    },
                    {
                        name: 'Status',
                        value: prodstatus,
                        inline: true
                    },
                    {
                        name: 'Links',
                        value: links.toString(),
                        inline: true
                    },
                )
                embed.setTimestamp()
                embed.setThumbnail(image)
                embed.setFooter({
                    text: 'Powered By YOU Monitors',
                    iconURL: 'https://media.discordapp.net/attachments/820804762459045910/1113301339901014036/YOU_8.png?width=732&height=732'
                })
                return interaction.editReply({ embeds: [embed] })
            }
        } catch (e) {
        }
    }

    module.exports = { nikestockCommand, executenikestockCommand }
} catch (e) {
}