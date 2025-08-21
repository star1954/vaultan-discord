const {
    SlashCommandBuilder
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invite_remove')
        .setDescription('Remove an invite link from the server. Autocompletes with the invite code.')
        .addStringOption(option =>
            option.setName('code')
                .setDescription('The invite code to remove')
                .setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.permissions.has('ManageChannels')) {
            await interaction.reply("You don't have permission to remove invites.");
            return;
        }

        let code = interaction.options.getString('code');
        const invites = await interaction.guild.invites.fetch();

        //Autocomplete the invite code
        code = autocomplete(code, invites.map(invite => invite.code));
        if (code.length === 0) {
            await interaction.reply("No invite found with that code.");
            return;
        }

        const invite = invites.find(invite => invite.code === code[0]);
        if (!invite) {
            await interaction.reply(`No invite found with code: ${code}`);
            return;
        }

        await invite.delete();
        await interaction.reply(`Deleted invite: ${code[0]}`);
    }
}

//Autocomplete function
//Returns all strings that starts with the input
function autocomplete(inputString, allowedStrings) {
    const input = inputString.toLowerCase();
    return allowedStrings.filter(code => code.toLowerCase().startsWith(input));
}