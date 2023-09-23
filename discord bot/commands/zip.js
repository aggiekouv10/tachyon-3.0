const { getProductInfo, getStock, getStores } = require("../services/nike.js");
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require("discord.js");

const zipCommand = new SlashCommandBuilder()
    .setName("zip")
    .setDescription("Locate local stores")
    .addStringOption(
        option => option
            .setName("code")
            .setDescription("Your zipcode")
            .setRequired(true)
    )

const executeZipCommand = async (interaction, args) => {
    try {
        await interaction.deferReply()
        const zipcode = interaction.options?.get("code") || { value: args[0] }
        if (!zipcode.value) return interaction.editReply?.("Invalid arguments") || interaction.reply("Invalid arguments")

        const stores = await getStores(zipcode.value)
        if (!stores || !stores.length) return interaction.editReply?.("No stores found") || interaction.reply("No stores found")

        const embeds = []
        for (let i = 0; i < 10 && i < stores.length; i++) {
            const store = stores[i]
            console.log(store)
            const embed = new EmbedBuilder()
                .setColor(55295)
                .setTitle(`${store.name}-${store.storeNumber}`)
                .setThumbnail(store.imageUrl)
                .addFields({
                    name: 'Store ID',
                    value: store.id,
                    inline: false
                }, {
                    name: 'Store Name',
                    value: store.name,
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
                })
                .setTimestamp()
                .setFooter({
                    text: `Powered by YOU Monitors`,
                    iconURL: "https://media.discordapp.net/attachments/820804762459045910/1113301339901014036/YOU_8.png?width=979&height=979",
                })

            embeds.push(embed)
        }

        if (embeds.length) {
            return interaction.editReply?.({ embeds: embeds.slice(0, 10) }) || interaction.reply({ embeds: embeds.slice(0, 10) })
        }
        else return interaction.editReply?.("No stores found nearby") || interaction.reply("No stores found nearby")

    } catch (e) {
        return interaction.reply({ content: "Error Occured", ephemeral: true })
    }
}

module.exports = { zipCommand, executeZipCommand }