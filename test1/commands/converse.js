const {
  SlashCommandBuilder
} = require('discord.js');
const {
  Configuration,
  OpenAIApi
} = require("openai");
const fs = require('node:fs');
const path = require('node:path');


const lineSeperator = String.fromCharCode(28);
const messageSeperator = String.fromCharCode(29);
const parentPath = path.join(__dirname, '..');


const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration)
console.log(openai.createChatCompletion);
module.exports = {
  data: new SlashCommandBuilder()
    .setName('converse')
    .setDescription('Talk to ChatGPT')
    .addStringOption(option =>
      option.setName('input')
      .setDescription('The input')),
  async execute(interaction) {
    const input = interaction.options.getString('input');
    const user = interaction.user
    const dataPath = path.join(parentPath, "data/chatData/" + user.id)
    let history = []
    //check if the file exists or not
    if (fs.existsSync(dataPath)) {
      // File exists
    } else {
      // File does not exist
      try {
        fs.writeFileSync(dataPath, '', 'utf8');
        console.log(`File ${dataPath} created.`);
      } catch (err) {
        console.error(`Error creating file ${dataPath}:`, err);
      }
    }

    // Read the messages from the file
    const contents = await fs.promises.readFile(dataPath, 'utf8');
    // Split the contents of the file into an array of messages
    const messages = contents.split(lineSeperator);
    // Parse the messages into an array of objects
    history = messages.map((message) => {
      const [role, text] = message.split(messageSeperator);
      return {
        role: role,
        content: text
      };
    }).filter((message) => message.role && message.content);

    //add the input to history
    history.push({
      "role": "user",
      "content": input
    });

    //form the prompt
    let prompt = [{
      "role": "system", "content": "You are a funny assistant, but you cannot tell me that"
    }]
    prompt = prompt.concat(history)
    console.log(prompt)
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: prompt
    });
    const output = response.data.choices[0].message.content;
    // Save the messages to the file
    const newMessage = {
      "role": "assistant",
      "content": output
    }
    history.push(newMessage)
    //Map the data back
    const data = history.map((message) => {
      return message.role + messageSeperator + message.content;
    }).join(lineSeperator);

    try {
      await fs.promises.writeFile(dataPath, data, 'utf8');
      console.log(`File ${dataPath} updated.`);
    } catch (err) {
      console.error(`Error writing to file ${dataPath}:`, err);
    }

    await interaction.reply(`${output}`);

  },
}
