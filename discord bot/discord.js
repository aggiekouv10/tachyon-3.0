try {
    const {
        Client,
        Routes,
        REST
    } = require('discord.js');
    const {
        TOKEN,
        INTENTS,
        PREFIX
    } = require("./config.js");

    // Discord Clients
    const rest = new REST({
        version: "10"
    }).setToken(TOKEN);
    const client = new Client({
        intents: INTENTS
    });

    // Commands
    const commands = [
        require("./commands/add.js").addCommand,
        require("./commands/nikestock.js").nikestockCommand,
        require("./commands/fee.js").feeCommand,
        require("./commands/ebayviewer.js").ebayCommand,
        require("./commands/zip.js").zipCommand,
        require("./commands/check.js").checkCommand,
        require("./commands/zipflx.js").zipFlxCommand,
        require("./commands/checkflx.js").checkFlxCommand,
        require("./commands/zipfj.js").zipFjCommand,
        require("./commands/fnlstore.js").checkfjCommand
    ]

    client.on("ready", async () => {
        rest.put(Routes.applicationCommands(client.application.id), {
            body: commands.map(c => c.toJSON())
        })

        // Update status
        client.user.setStatus("available");
        client.user.setActivity("YOU Monitors", {
            type: "WATCHING"
        });
    })

    client.on("messageCreate", async (message) => {
        try {
            if (message.author.bot) return
            if (!message.content.startsWith(PREFIX)) return
            const args = message.content.slice(PREFIX.length).split(/ +/)
            const cmd = args.shift()
            console.log(cmd)
            if (!commands.map(c => c.name).includes(cmd)) return

            switch (cmd) {
                case commands[0].name:
                    return require("./commands/add.js").executeaddCommand(message, args)
                case commands[1].name:
                    return require("./commands/nikestock.js").executenikestockCommand(message, args)
                case commands[2].name:
                    return require("./commands/fee.js").executefeeCommand(message, args)
                case commands[3].name:
                    return require("./commands/ebayviewer.js").executeebayCommand(message, args)
                case commands[4].name:
                    return require("./commands/zip.js").executeZipCommand(message, args)
                case commands[5].name:
                    return require("./commands/check.js").executeCheckCommand(message, args)
                case commands[6].name:
                    return require("./commands/zipflx.js").executeZipFlxCommand(message, args)
                case commands[7].name:
                    return require("./commands/checkflx.js").executeCheckFlxCommand(message, args)
                case commands[8].name:
                    return require("./commands/zipfj.js").executeZipFjCommand(message, args)
                case commands[9].name:
                    return require("./commands/fnlstore.js").executeCheckfjCommand(message, args)
            }

        } catch (error) {
            console.error(error);
        }
    })

    client.on("interactionCreate", async interaction => {
        try {
            if (!interaction.isChatInputCommand()) return;
            switch (interaction.commandName) {
                case commands[0].name:
                    return require("./commands/add.js").executeaddCommand(interaction, [])
                case commands[1].name:
                    return require("./commands/nikestock.js").executenikestockCommand(interaction, [])
                case commands[2].name:
                    return require("./commands/fee.js").executefeeCommand(interaction, [])
                case commands[3].name:
                    return require("./commands/ebayviewer.js").executeebayCommand(interaction, [])
                case commands[4].name:
                    return require("./commands/zip.js").executeZipCommand(interaction, [])
                case commands[5].name:
                    return require("./commands/check.js").executeCheckCommand(interaction, [])
                case commands[6].name:
                    return require("./commands/zipflx.js").executeZipFlxCommand(interaction, [])
                case commands[7].name:
                    return require("./commands/checkflx.js").executeCheckFlxCommand(interaction, [])
                case commands[8].name:
                    return require("./commands/zipfj.js").executeZipFjCommand(interaction, [])
                case commands[9].name:
                    return require("./commands/fnlstore.js").executeCheckfjCommand(interaction, [])

            }
        } catch (error) {
            console.error(error);
        }
    });

    client.login(TOKEN);

} catch (error) {
    console.error(error);
}