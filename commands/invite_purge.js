const {
    SlashCommandBuilder,
    Guild
} = require('discord.js');



module.exports = {
    data: new SlashCommandBuilder()
        .setName('invite_purge')
        .setDescription('Purge all existing invites.'),
    async execute(interaction) {
        if (interaction.member.permissions.has('CreateInstantInvite') === false) {
            await interaction.reply("You don't have permission to purge invites.");
            return;
        }

        const invites = await interaction.guild.invites.fetch();

        let count = 0;
        invites.forEach(invite => {
            invite.delete();
            count++;
        });

        await interaction.reply(`All existing invites have been purged. Total invites deleted: ${count}`);
    },
}