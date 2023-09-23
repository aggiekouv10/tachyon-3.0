const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require("discord.js");
const helper = require('../../main/helper');
try {
    const feeCommand = new SlashCommandBuilder()
        .setName("fee")
        .setDescription("Check App Fees")
        .addStringOption(
            option => option
                .setName("price")
                .setDescription("Amount")
                .setRequired(true)
        )

    const executefeeCommand = async (interaction, args) => {
        try {
            const price = interaction.options?.get("price") || { value: args[0] }
            if (!price.value) return interaction.reply({ content: "Invalid arguments", ephemeral: true })
            let pushed = true
            let value = Number(price.value)
            const fees = {
                'StockX Level 1 (9.5%)': n => .095 * n,
                'StockX Level 2 (9%)': n => .09 * n,
                'StockX Level 3 (8.5%)': n => .085 * n,
                'StockX Level 4 (8%)': n => .08 * n,
                'Goat 90+ (9.5% + $5.00 + 2.9%)': n => 0.095 * n + 5 + (0.905 * n * 0.029),
                'Goat 70-89 (15% + $5.00 + 2.9%)': n => 0.15 * n + 5 + (0.85 * n * 0.029),
                'Goat 50-69 (20% + $5.00 + 2.9%)': n => 0.20 * n + 5 + (0.80 * n * 0.029),
                'Ebay (12.9% + $0.30': n => 0.129 * n + 0.3,
                'Paypal (2.9% + $0.30)': n => (0.029 * n) + 0.3,
                'Grailed (9% + 2.9%)': n => 0.089 * n + 0.911 * n * 0.029,
            }
            if (pushed) {
                let feilds = []
                const embed = new EmbedBuilder()
                embed.setTitle("Fee Calculator")
                Object.keys(fees).forEach(fee => {
                    feilds.push({ name: `${fee}`, value: `> Payout: $${Number(value - fees[fee](value)).toFixed(2)}`, inline: false })
                    embed.setColor(55295)
                });
                embed.addFields(feilds)
                embed.setTimestamp()
                embed.setFooter({
                    text: 'Powered By YOU Monitors',
                    iconURL: 'https://media.discordapp.net/attachments/820804762459045910/1113301339901014036/YOU_8.png?width=732&height=732'
                })
                return interaction.reply({ embeds: [embed], ephemeral: true  })
            }
        } catch (e) {
            return interaction.reply({ content: "Invalid arguments", ephemeral: true })
        }
    }

    module.exports = { feeCommand, executefeeCommand }
} catch (e) {
}