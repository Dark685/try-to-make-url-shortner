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

  if (msg.photo && msg.caption) {
    let captionText = msg.caption;
    const urls = captionText.match(/https?:\/\/\S+/g);

    if (urls && urls.length > 0) {
      const promises = urls.map((url) => {
        return axios.get(`https://pdiskpro.in/api?api=${API_TOKEN}&url=${url}`)
          .then(response => {
            console.log(`Received response from pdiskpro API endpoint: ${response.data}`);
            const shortenedUrl = response.data.shortenedUrl;
            captionText = captionText.replace(url, shortenedUrl);
          })
          .catch(error => {
            console.error(`Error occurred while calling UrlShortx API: ${error}`);
          });
      });

      Promise.all(promises)
        .then(() => {
          bot.sendPhoto(chatId, msg.photo[0].file_id, { caption: captionText });
        })
        .catch((error) => {
          console.error(`Error occurred while shortening URLs: ${error}`);
        });
    } else {
      bot.sendMessage(chatId, `Error: The caption does not appear to contain any valid URLs.`);
    }
  } else if (msg.photo) {
    bot.sendMessage(chatId, 'This photo does not have a caption. Would you like to add a caption?');
    bot.once('message', (captionMsg) => {
      const newCaption = captionMsg.text;
      const photoId = msg.photo[0].file_id;
      bot.setCaption(chatId, photoId, newCaption)
        .then(() => {
          bot.sendMessage(chatId, 'Caption added successfully!');
        })
        .catch((error) => {
          console.error(`Error occurred while setting the caption: ${error}`);
          bot.sendMessage(chatId, 'An error occurred while setting the caption. Please try again.');
        });
    });
  } else if (msg.caption) {
    const captionText = msg.caption;
    bot.sendMessage(chatId, `The caption text is: ${captionText}`);
  } else {
    bot.sendMessage(chatId, `Error: Please send a photo with a caption containing URLs, or send a photo to add a caption.`);
  }
});
