// const alexa = require('alexa-app');
const chatskills = require('chatskills');
const readlineSync = require('readline-sync');

// create a skill
// const hello = new alexa.app('hello');
const hello = chatskills.app('hello');

// launch method to run at startup
hello.launch(function(req, res) {
  res.say('Ask me to say hi!');

  // keep session open
  res.shouldEndSession(false);
});

// create an intent
hello.intent('hello', {
  'slots': {},
  'utterances': [ '{to |}{say|speak|tell me} {hi|hello|howdy|hi there|hiya|hi ya|hey|hay|heya}']
  },
  function(req, res) {
    res.say('Hello, world!');
    res.shouldEndSession(false);
  }
);

// module.exports = hello;

// chatskills.launch(hello);

// console client
let text = ' ';
while (text.length > 0 && text != 'quit') {
  text = readlineSync.question('> ');

  // respond to input
  chatskills.respond(text, function(response) {
    console.log(response);
  });
}
