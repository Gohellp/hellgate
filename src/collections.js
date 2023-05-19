const {Collection} = require("discord.js"),
	path = require('node:path'),
	fs = require('node:fs')

module.exports= {
	/** This func create bot's collection field with dir's name
	 *
	 * @param dirName - Name of dir contains the dirs with commands
	 * @param bot - Discord client's variable
	 * @param exceptions - array of exceptions of files or folders
	 */
	createCollection(dirName, bot, ...exceptions)
	{
		bot[dirName] = new Collection()
		const foldersPath = path.join(process.cwd(), dirName),
			commandFolders = fs.readdirSync(foldersPath)

		for (const folder of commandFolders) {
			const commandsPath = path.join(foldersPath, folder);
			const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
			for (const file of commandFiles) {
				if (!exceptions.includes(folder || file)) {
					const filePath = path.join(commandsPath, file);
					const command = require(filePath);
					// Set a new item in the Collection with the key as the command name and the value as the exported module
					if ('data' in command && 'execute' in command) {
						bot.commands.set(command.data.name, command);
					} else {
						console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
					}
				}
			}
		}
	}
}