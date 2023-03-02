const {
  SlashCommandBuilder
} = require('discord.js');
const fs = require('fs');
const path = require('path');

const parentPath = path.join(__dirname, '..');


module.exports = {
  data: new SlashCommandBuilder()
    .setName('forget')
    .setDescription('Make ChatGPT forget who you are and what you talked about'),
  async execute(interaction) {
    const user = interaction.user
    const dataPath = path.join(parentPath, "data/chatData/" + user.id)
    if (fs.existsSync('foo.txt')) {
      fs.unlinkSync(dataPath);
    }


    await interaction.reply(`-_-`);

  },
}
