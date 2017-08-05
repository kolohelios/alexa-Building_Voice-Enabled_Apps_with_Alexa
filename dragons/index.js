const chatskills = require('chatskills');
const readlineSync = require('readline-sync');

// create a skill
const dragons = chatskills.app('dragons');

// launch method to run at startup
dragons.launch(function(req, res) {
  res.say('Ask me to about dragons!');

  // keep session open
  res.shouldEndSession(false);
});

dragons.dictionary = { dragons: ['fire', 'ice', 'poison', 'lightning']};

// create an intent
dragons.intent('dragons', {
  'slots': { DragonType: 'DRAGONTYPE' },
  'utterances': [ 'are there {dragons|DragonType} dragons']
  },
  function(req, res) {
    let dragonType = req.slot('DragonType');

    res.say(`Aye, there be ${dragonType} dragons.`);
    res.shouldEndSession(false);
  }
);

chatskills.launch(dragons);

// console client
let text = ' ';
while (text.length > 0 && text != 'quit') {
  text = readlineSync.question('> ');

  // respond to input
  chatskills.respond(text, function(response) {
    console.log(response);
  });
}
