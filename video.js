axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');

// Replace the API_TOKEN with your own pdiskpro API token
const API_TOKEN = 'API_TOKEN';

// Replace the TELEGRAM_BOT_TOKEN with your own Telegram Bot token
const bot = new TelegramBot('TELEGRAM_BOT_TOKEN', { polling: true });

// Listen for incoming messages from Telegram
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;

  // Check if the message contains a photo, video, or document and a caption
  if ((msg.photo || msg.video || msg.document) && msg.caption) {
    // Get the media ID and the caption
    const media = msg.photo ? msg.photo[msg.photo.length - 1].file_id :
      (msg.video ? msg.video.file_id : msg.document.file_id);
    const caption = msg.caption;

    // Get the file information for the media
    bot.getFile(media)
      .then(response => {
        // Extract the file URL from the response
        const mediaUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${response.file_path}`;

        // Shorten the media URL using the pdiskpro API
        axios.get(`https://pdiskpro.in/api?api=${API_TOKEN}&url=${mediaUrl}`)
          .then(response => {
            console.log(`Received response from pdiskpro API endpoint: ${response.data}`);
            const shortenedUrl = response.data.shortenedUrl;

            // Send the media with the caption and shortened URL back to the user
            if (msg.photo) {
              bot.sendPhoto(chatId, media, { caption: `${caption}\n\nShortened URL: ${shortenedUrl}` });
            } else if (msg.video) {
              bot.sendVideo(chatId, media, { caption: `${caption}\n\nShortened URL: ${shortenedUrl}` });
            } else {
              bot.sendDocument(chatId, media, { caption: `${caption}\n\nShortened URL: ${shortenedUrl}` });
            }
          })
          .catch(error => {
            console.error(`Error occurred while calling pdiskpro API: ${error}`);
          });
      })
      .catch(error => {
        console.error(`Error occurred while getting file information: ${error}`);
      });
  } else {
    // If no media with caption is found in the message, send an error message back to the user
    bot.sendMessage(chatId, `Error: The message should contain a photo, video, or document with a caption.`);
  }
});
