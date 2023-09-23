const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require("discord.js");
const helper = require('../../main/helper');
try {
    const ebayCommand = new SlashCommandBuilder()
        .setName("view")
        .setDescription("Add views to your ebay listing")
        .addStringOption(
            option => option
                .setName("link")
                .setDescription("Listing link")
                .setRequired(true)
        )
        .addStringOption(
            option => option
                .setName("amount")
                .setDescription("Amount of views")
                .setRequired(true)
        )

    const executeebayCommand = async (interaction, args) => {
        try {
            const link = interaction.options?.get("link") || { value: args[0] }
            const viewcount = interaction.options?.get("amount") || { value: args[1] }
            if (!link.value || !viewcount.value) return interaction.reply({ content: "Invalid arguments", ephemeral: true })
            if (!link.value.includes('ebay.com')) {
                return interaction.reply({ content: "Invalid url!", ephemeral: true })
            }
            if (viewcount.value > 300) {
                return interaction.reply({ content: 'Max views are 300!', ephemeral: true })
            }
            interaction.reply({ content: `Adding ${viewcount.value} Views`, ephemeral: true })
            await helper.viewbot(viewcount.value, link.value)
            //let user = `<@${interaction.user.id}>`
            let pushed = true
            if (pushed) {
                return interaction.followUp({ content: `Added ${viewcount.value} Views!`, ephemeral: true })
            }
        } catch (e) {
            console.log(e)
            return interaction.reply({ content: "Invalid arguments", ephemeral: true })
        }
    }

    module.exports = { ebayCommand, executeebayCommand }
} catch (e) {
}