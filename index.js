const mySecret = process.env['undefined']
axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');

// replace the API_TOKEN with your own UrlShortx API token
const API_TOKEN = process.env.API_TOKEN;

// replace the TELEGRAM_BOT_TOKEN with your own Telegram Bot token
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// listen for incoming messages from Telegram
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;

  // split the message into individual URLs
  const urls = messageText.match(/https?:\/\/\S+/g);

  if (urls && urls.length > 0) {
    // shorten each URL using the pdiskpro API
    urls.forEach((url) => {
      axios.get(`https:${process.env.site}/api?api=${API_TOKEN}&url=${url}`)
        .then(response => {
          console.log(`Received response from pdiskpro API endpoint: ${response.data}`);
          const shortenedUrl = response.data.shortenedUrl;
          // send the shortened URL back to the user
          bot.sendMessage(chatId, ` ${shortenedUrl}`);
        })

    });
  } else {
    // if no URLs were found in the message, send an error message back to the user
    bot.sendMessage(chatId, `Error: The message does not appear to contain any valid URLs.`);
  }
});
