const {
    SlashCommandBuilder
} = require('discord.js');



module.exports = {
    data: new SlashCommandBuilder()
        .setName('invite_generate')
        .setDescription('Generate an one-time invite link with duration of 1 day')
        .addStringOption(option =>
            option.setName('comment')
            .setDescription('Comment for the invite link.')),
    async execute(interaction) {
        const channel = interaction.channel
        const user = interaction.user
        const comment = interaction.options.getString('comment');

        if (interaction.member.permissions.has('CreateInstantInvite') === false) {
            await interaction.reply("You don't have permission to create an invite link.");
            return;
        }

        const invite = await channel.createInvite({
            maxAge: 24 * 60 * 60, // 1 day
            maxUses: 1,
            unique: true,
            reason: `One-time invite link created by ${user.tag} (${user.id}) with comment: ${comment || 'No comment'}`,
        });

        const expiryTime = Date.now() + 24 * 60 * 60 * 1000;
        await interaction.reply(`${user.tag} created an invite link expiring <t:${Math.floor(expiryTime / 1000)}:R>: \`\`\`${invite.url}\`\`\` with comment: \`${comment || 'No comment'}\``);
    },
}
