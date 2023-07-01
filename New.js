axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');

// replace the API_TOKEN with your own UrlShortx API token
const API_TOKEN = 'API_TOKEN';

// replace the TELEGRAM_BOT_TOKEN with your own Telegram Bot token
const bot = new TelegramBot('TELEGRAM_BOT_TOKEN', { polling: true });

// listen for incoming messages from Telegram
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;
  
  // check if the message is a photo with caption
  if (msg.photo && msg.caption) {
    const captionText = msg.caption;
    // extract URLs from the caption
    const urls = captionText.match(/https?:\/\/\S+/g);
    
    if (urls && urls.length > 0) {
      // shorten each URL using the pdiskpro API
      urls.forEach((url) => {
        axios.get(`https://pdiskpro.in/api?api=${API_TOKEN}&url=${url}`)
          .then(response => {
            console.log(`Received response from pdiskpro API endpoint: ${response.data}`);
            const shortenedUrl = response.data.shortenedUrl;
            // send the shortened URL back as a reply with the same photo and caption
            bot.sendPhoto(chatId, msg.photo[0].file_id, { caption: `Here's your shortened URL: ${shortenedUrl}` });
          })
          .catch(error => {
            console.error(`Error occurred while calling UrlShortx API: ${error}`);
          });
      });
    } else {
      // if no URLs were found in the caption, send an error message back to the user
      bot.sendMessage(chatId, `Error: The caption does not appear to contain any valid URLs.`);
    }
  } else {
    // if the message is not a photo with caption, send an error message back to the user
    bot.sendMessage(chatId, `Error: Please send a photo with a caption containing URLs.`);
  }
});
