const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');

// Replace 'YOUR_API_TOKEN' with your Telegram Bot API token
const bot = new TelegramBot('YOUR_API_TOKEN', { polling: true });

bot.onText(/\/upload/, (msg, match) => {
  const chatId = msg.chat.id;
  
  // Check if the message contains a direct download link
  if (msg.text.includes('http')) {
    const url = msg.text.split(' ')[1]; // Extract the download link from the message
    
    // Download the file using Axios
    axios({
      url,
      method: 'GET',
      responseType: 'stream'
    })
      .then(response => {
        // Save the file locally
        const fileName = url.split('/').pop();
        const filePath = `./${fileName}`;
        const stream = fs.createWriteStream(filePath);
        response.data.pipe(stream);
        
        // Upload the file to Telegram
        stream.on('finish', () => {
          bot.sendDocument(chatId, fs.readFileSync(filePath));
          fs.unlinkSync(filePath); // Remove the file from the local storage
        });
      })
      .catch(error => {
        console.error('Error downloading the file:', error);
        bot.sendMessage(chatId, 'Error downloading the file. Please try again.');
      });
  } else {
    bot.sendMessage(chatId, 'Please provide a valid direct download link.');
  }
});

// Start the bot
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Send me a direct download link and I will upload the file to Telegram.');
});

console.log('Bot is running...');
