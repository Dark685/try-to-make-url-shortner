const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');

// Replace the API_TOKEN with your own UrlShortx API token
const API_TOKEN = process.env.API_TOKEN;

// Replace the TELEGRAM_BOT_TOKEN with your own Telegram Bot token
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

// Listen for incoming messages from Telegram
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;
  const photo = msg.photo;

  if (photo) {
    // Retrieve the photo with the highest resolution
    const photoId = photo[photo.length - 1].file_id;
    const caption = messageText;

    // Get the file information for the photo
    bot.getFile(photoId).then((fileInfo) => {
      const photoUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${fileInfo.file_path}`;

      // Shorten the URL using the pdiskpro API
      axios.get(`https://pdiskpro.in/api?api=${API_TOKEN}&url=${photoUrl}`)
        .then(response => {
          console.log(`Received response from pdiskpro API endpoint: ${response.data}`);
          const shortenedUrl = response.data.shortenedUrl;
          // Send the photo with caption and shortened URL back to the user
          bot.sendPhoto(chatId, photoId, { caption: `${caption}\nShortened URL: ${shortenedUrl}` });
        })
        .catch(error => {
          console.error(`Error occurred while calling pdiskpro API: ${error}`);
        });
    });
  } else {
    // If no photo is found in the message, send an error message back to the user
    bot.sendMessage(chatId, 'Error: Please send a picture with a caption.');
  }
});
