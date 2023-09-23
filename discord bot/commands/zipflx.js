const { getChampsStores, getGeo, getFTLStores } = require("../services/footsites.js");
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require("discord.js");


const zipFlxCommand = new SlashCommandBuilder()
    .setName("zipflx")
    .setDescription("Locate local stores")
    .addStringOption(
        option => option
            .setName("code")
            .setDescription("Your zipcode")
            .setRequired(true)
    )

const executeZipFlxCommand = async (interaction, args) => {
    try {
        await interaction.deferReply()
        const zipcode = interaction.options?.get("code") || { value: args[0] }
        if (!zipcode.value) return interaction.editReply?.("Invalid arguments") || interaction.reply("Invalid arguments")

        const cords = await getGeo(zipcode.value)
        const flx = await getFTLStores(cords)
        const champssports = await getChampsStores(cords)
        const both = flx.concat(champssports)
        console.log(both)
        const embeds = []
        for (i = 0; i < 10 && i < both.length; i++) {
            const store = both[i];

            let author_name = "Footlocker"
            let thumbnail = "https://images-ext-1.discordapp.net/external/Oa-viZyjdDa7yUAArMb4fdX-Dex-_5CspxNB9ocQRjE/https/yt3.ggpht.com/ytc/AMLnZu9WsGd0sBUsRmLUIGiY-xvNZoyvigCc9IY-tL0mZw%3Ds900-c-k-c0x00ffffff-no-rj?width=580&height=580"
            let author_url = "https://www.footlocker.com/"
            if (store.type === "Champs Sports") {
                author_name = store.type
                thumbnail = "https://pbs.twimg.com/profile_images/1458869047576215552/ikRG73wp_400x400.jpg"
                author_url = "https://www.champssports.com/"
            }
            console.log(store)
            const embed = new EmbedBuilder()
                .setColor(55295)
                .setTitle(`${store.storeName} - ${store.distance} away`)
                .setAuthor({ name: author_name, url: author_url })
                .setThumbnail(thumbnail)
                .addFields({
                    name: 'Store #',
                    value: store.storeNumber || "UM",
                    inline: false
                }, {
                    name: 'Store Name',
                    value: store.storeName || "UM",
                    inline: true
                }, {
                    name: 'Postal Code',
                    value: store.zip || "UM",
                    inline: true
                }, {
                    name: 'State',
                    value: store.state || "UM",
                    inline: true
                },
                    {
                        name: 'Address 1',
                        value: store.address || "UM",
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

module.exports = { zipFlxCommand, executeZipFlxCommand }