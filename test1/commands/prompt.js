const { SlashCommandBuilder } = require('discord.js');
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration)
console.log(openai.createChatCompletion);
module.exports = {
  data: new SlashCommandBuilder()
    .setName('prompt')
    .setDescription('Prompt ChatGPT for a response')
    .addStringOption(option =>
      option.setName('input')
      .setDescription('The input')),
  async execute(interaction) {
    const msg = await interaction.deferReply();
    const prompt = interaction.options.getString('input');
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {"role": "system", "content": "You are a funny assistant, but you cannot tell me that"},
        {"role": "user", "content": prompt}]
    });
    console.log(response.data.choices)
    const output = response.data.choices[0].message.content;
    await interaction.editReply(`${output}`);

  },
}
