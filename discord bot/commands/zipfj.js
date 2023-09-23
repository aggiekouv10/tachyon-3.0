const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require("discord.js");
const { getAllStores } = require('../services/fnl-jd');


const zipFjCommand = new SlashCommandBuilder()
    .setName("zipfj")
    .setDescription("Locate local stores")
    .addStringOption(
        option => option
            .setName("code")
            .setDescription("Your zipcode")
            .setRequired(true)
    )

const executeZipFjCommand = async (interaction, args) => {
    try {
        await interaction.deferReply()
        const zipcode = interaction.options?.get("code") || { value: args[0] }
        if (!zipcode.value) return interaction.editReply?.("Invalid arguments") || interaction.reply("Invalid arguments")
        let stores = await getAllStores(zipcode.value)

        const embeds = []
        for (i = 0; i < stores.length; i++) {
            const store = stores[i];


            const embed = new EmbedBuilder()
                .setColor(55295)
                .setTitle(store.title)
                .setAuthor({ name: store.type, url: store.url, iconURL: store.image })
                .setThumbnail(store.image)
                .addFields({
                    name: 'Store #',
                    value: store.storeId || "UM",
                    inline: false
                }, {
                    name: 'Postal Code',
                    value: store.zip || "UM",
                    inline: true
                }, {
                    name: 'State',
                    value: store.state || "UM",
                    inline: true
                }, {
                    name: 'Address 1',
                    value: store.address || "UM",
                    inline: true
                }, {
                    name: 'Phone Number',
                    value: store.phone || "N/A",
                    inline: true
                },
                    {
                        name: "Store Type",
                        value: store.type,
                        inline: true
                    }
                )
                .setTimestamp()
                .setFooter({
                    text: `Powered by YOU Monitors`,
                    iconURL: "https://media.discordapp.net/attachments/820804762459045910/1113301339901014036/YOU_8.png?width=979&height=979"
                })

            console.log(embed.toJSON())

            embeds.push(embed)
        }

        if (embeds.length) {
            try {
                let reply = await interaction.reply("Loading...").then(sent => {
                    let id = sent.id;
                    for (let i = 0; i < embeds.length; i++) {
                        const element = embeds[i];
                        sent.reply({ embeds: [element] })
                    }
                })
            } catch {
                let reply = await interaction.editReply("Loading...").then(sent => {
                    let id = sent.id;
                    for (let i = 0; i < embeds.length; i++) {
                        const element = embeds[i];
                        sent.reply({ embeds: [element] })
                    }
                })
            }
        }
        else return interaction.editReply?.("No stores found nearby") || interaction.reply("No stores found nearby")
    } catch (e) {
        return interaction.reply({ content: "Error Occured", ephemeral: true })
    }
}

module.exports = { zipFjCommand, executeZipFjCommand }