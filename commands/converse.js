//Configuration
const commandName = "prompt";
const commandDesc = "Talk to ChatGPT";
const GPTRole = "You are a helpful AI assistant. Keep your replies within 2000 characters";
const DATAPATH = "data/chatData/";
const RememberPrompt = true;

const {
  SlashCommandBuilder
} = require('discord.js');
const {
  Configuration,
  OpenAIApi
} = require("openai");
const fs = require('fs');
const path = require('path');


const lineSeperator = String.fromCharCode(28);
const messageSeperator = String.fromCharCode(29);
const parentPath = path.join(__dirname, '..');


const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration)
console.log(openai.createChatCompletion);

function splitString(str, maxLength, position, first = []) {
  let splitIndex = maxLength;
  const nextNewLine = str.indexOf('\n', position);
  const nextSpace = str.indexOf(' ', position);
  if (nextNewLine > position && nextNewLine < splitIndex) {
    splitIndex = nextNewLine;
  } else if (nextSpace > position && nextSpace < splitIndex) {
    splitIndex = nextSpace;
  }
  first.push(str.substring(0, splitIndex))
  if (str.substring(splitIndex).length > position) {
    first = splitString(str.substring(splitIndex), maxLength, position, first)
  }
  return first
}



module.exports = {
  data: new SlashCommandBuilder()
    .setName(commandName)
    .setDescription(commandDesc)
    .addStringOption(option =>
      option.setName('input')
        .setDescription('The input')),
  async execute(interaction) {
    const channel = interaction.channel
    const input = interaction.options.getString('input');
    const user = interaction.user
    const dataPath = path.join(parentPath, DATAPATH + user.id)
    let history = []
    //defer the reply
    const msg = await interaction.deferReply();
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
    if (RememberPrompt) {

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

    }
    //add the input to history
    history.push({
      "role": "user",
      "content": input
    });

    //form the prompt
    let prompt = [{
      "role": "system", "content": GPTRole
    }]
    prompt = prompt.concat(history)
    console.log(prompt)
    const response = await openai.createChatCompletion({
      model: "gpt-4",
      messages: prompt
    });

    //limit to 1800 chars
    const output = splitString(response.data.choices[0].message.content, 1900, 1500)

    if (RememberPrompt){

      //const output = response.data.choices[0].message.content;
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

    }
    await interaction.editReply(`${user.username}: ${input}`);
    let len = output.length
    for (let i = 0; i < len; i++) {
      channel.send(output[i])
    }
    //if (Math.random() > 0.9) channel.send("``NOTE: Bot will not be maintained until March 19``")
  },
}
