const {
    SlashCommandBuilder
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invite_list')
        .setDescription('List all active invites in the current server.'),
    async execute(interaction) {
        if (interaction.member.permissions.has('ManageChannels') === false) {
            await interaction.reply("You don't have permission to list invites.");
            return;
        }

        const invites = await interaction.guild.invites.fetch();

        if (invites.size === 0) {
            await interaction.reply("There are no active invites in this server.");
            return;
        }

        const inviteList = invites.map(invite => {
            const expiry = invite.expiresAt ? `<t:${Math.floor(invite.expiresAt.getTime() / 1000)}:R>` : 'Never';
            const uses = invite.maxUses ? `${invite.uses}/${invite.maxUses}` : `${invite.uses}/∞`;
            return `Invite Code: \`${invite.code}\` | Created by: \`${invite.inviter.tag}\` | Expires: ${expiry} | Uses: ${uses} | Channel: \`${invite.channel.name}\``;
        }).join('\n');
        await interaction.reply(`Active invites in this server:\n${inviteList}`);
    },
}