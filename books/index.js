const alexa = require('alexa-app');
const chatskills = require('chatskills');
const readlineSync = require('readline-sync');
const xml2js = require('xml2js').parseString;
const request = require('request');
const deasync = require('deasync');

const CONFIGURATION = process.env.CONFIG || 'alexa';
const APP_NAME = 'books';

const app = CONFIGURATION === 'chatskills' ? chatskills.app(APP_NAME) : new alexa.app(APP_NAME);

app.launch(function(req, res) {
  res.say('What book would you like to know about? Please say get book, followed by the title.');
  res.reprompt('Please say get book, followed by the title.');
  res.shouldEndSession(false);
});

module.exports = app;

if (CONFIGURATION === 'chatskills') {
  chatskills.launch(app);
  // console client
  let text = ' ';
  while (text.length > 0 && text != 'quit') {
    text = readlineSync.question('> ');

    // respond to input
    chatskills.respond(text, function(response) {
      console.log(response);
    });
  }
}
