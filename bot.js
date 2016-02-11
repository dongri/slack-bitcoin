var botkit = require('botkit');
var request = require('request');

function getBitcoinRate(callback) {
  var options = {
    uri: 'https://blockchain.info/ja/ticker',
    method: 'GET',
    json:true
  }
  request(options, function(error, response, body){
    if(error){
      callback(error, null);
    } else {
      callback(null, body);
    }
  });
}

var redisStorage = require('botkit-storage-redis')({
  url: process.env.REDISTOGO_URL
});

var controller = botkit.slackbot({
  debug: false,
  storage: redisStorage
}).configureSlackApp({
  clientId: process.env.BOTKIT_SLACK_CLIENT_ID,
  clientSecret: process.env.BOTKIT_SLACK_CLIENT_SECRET,
  scopes: ['commands']
});


controller.setupWebserver(process.env.PORT, function(err, webserver) {
  controller.createWebhookEndpoints(controller.webserver);
  controller.createOauthEndpoints(controller.webserver, function(err, req, res) {
    if (err) {
      res.status(500).send('Error: ' + JSON.stringify(err));
    } else {
      res.send('Success');
    }
  });
});

controller.on('slash_command', function(bot, message) {
  switch (message.command) {
  case '/coin-rate':
    getBitcoinRate((err, json) => {
      if (err) {
        bot.replyPublic(message, '' + err +'');
      } else {
        rateJPY = "1BTC = " + json.JPY.symbol + json.JPY.last
        rateUSD = "1BTC = " + json.USD.symbol + json.USD.last
        bot.replyPublic(message, '```' + rateUSD + '\n' + rateJPY + '```');
      }
    });
    break;
  }
});
