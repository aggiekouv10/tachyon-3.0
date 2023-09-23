const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require("discord.js");
const helper = require('../../main/helper');
try {
    const addCommand = new SlashCommandBuilder()
        .setName("add")
        .setDescription("add/remove pid from database")
        .addStringOption(
            option => option
                .setName("site")
                .setDescription("Site Name")
                .setRequired(true)
        )
        .addStringOption(
            option => option
                .setName("pid")
                .setDescription("Product ID")
                .setRequired(true)
        )

    const executeaddCommand = async (interaction, args) => {
        try {
            let pushed
            const site = interaction.options?.get("site") || { value: args[0] }
            const pid = interaction.options?.get("pid") || { value: args[1] }
            if (!site.value || !pid.value) return interaction.reply({ content: "Invalid arguments", ephemeral: true })
            pushed = await helper.pidadder(pid.value, site.value)
            if (pushed == null) {
                return interaction.editReply?.("An error has occurred") || interaction.reply("An error has occurred")
            }
            if (pushed) {
                const embed = new EmbedBuilder()
                embed.setColor(55295)
                embed.setTitle(`PID - ${pid.value} added to database`)
                embed.setTimestamp()
                embed.setFooter({
                    text: 'Powered By YOU Monitors',
                    iconURL: 'https://media.discordapp.net/attachments/820804762459045910/1113301339901014036/YOU_8.png?width=732&height=732'
                })
                return interaction.reply({ embeds: [embed], ephemeral: true })
            }
            if (!pushed) {
                const embed = new EmbedBuilder()
                embed.setColor(55295)
                embed.setTitle(`PID - ${pid.value} removed from database`)
                embed.setTimestamp()
                embed.setFooter({
                    text: 'Powered By YOU Monitors',
                    iconURL: 'https://media.discordapp.net/attachments/820804762459045910/1113301339901014036/YOU_8.png?width=732&height=732'
                })
                return interaction.reply({ embeds: [embed], ephemeral: true })
            }
        } catch (e) {
            return interaction.reply({ content: "Error Occured", ephemeral: true })
        }
    }

    module.exports = { addCommand, executeaddCommand }
} catch (e) {
}