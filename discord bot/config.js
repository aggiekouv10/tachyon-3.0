const { GatewayIntentBits } = require("discord.js")

module.exports = {
    PREFIX: "!",
    TOKEN: "MTExMzY2NTExNjM2MjI0ODI3NA.GeJOTP.C4BnWtF5Qz6WdDXomtnGtYo-vUeGQLKegtcMQI",
    INTENTS: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildBans
    ]
}