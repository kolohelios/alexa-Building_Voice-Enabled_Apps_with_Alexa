const alexa = require('alexa-app');
const chatskills = require('chatskills');
const readlineSync = require('readline-sync');

const configuration = process.env.CONFIG || 'alexa';

const app = configuration === 'chatskills' ? chatskills.app('dragonhunt') : new alexa.app('dragonhunt');

const dragonTypes = [ 'fire', 'ice', 'undead', 'skeleton', 'golden' ];

// launch method to run at startup
app.launch(function(req, res) {
  // create a random type of dragon
  let randomType = Math.floor(Math.random() * 5);
  let hp = Math.floor((Math.random() * 11) + 5);

  // store the dragon in session
  let dragon = { type: dragonTypes[randomType], hp: hp };
  res.session('dragon', dragon);

  // welcome the user
  res.say(`A large ${dragon.type} dragon approaches! What do you want to do?`);

  // keep session open
  res.shouldEndSession(false);
});

// create an intent
app.intent('look', {
  slots: {},
  utterances: [ '{look|search|find} {a|for| } {weapon|sword|}' ]
  },
  function(req, res) {
    if (req.session('has-weapon')) {
      res.say('You can only carry one weapon at a time.');
    } else {
      // user picked up weapon, store in session
      res.session('has-weapon', true);

      res.say('You search the cave and find a lance on the ground!');
    }
    res.shouldEndSession(false);
  }
);

app.intent('attack', {
  slots: { 'DragonType': 'DRAGONTYPE' },
  utterances: [ '{attack|fight|hit|use} {lance|weapon} on {-|DragonType} dragon' ]
  }, function(req, res) {
    if (!req.session('has-weapon')) {
      // user does not have a weapon
      res.say('You don\'t have a weapon! Try looking around.');
      res.shouldEndSession(false);
    } else {
      // the player has a weapon, attack the dragon!
      let dragon = req.session('dragon');

      if (dragon.type.toLowerCase() != req.slot('DragonType').toLowerCase()) {
        // the user didn't utter the correct dragon type
        res.say(`I don't see a ${req.slot('DragonType')} dragon anywhere! Just a ${dragon.type} one.`);
        res.shouldEndSession(false);
      } else {
        // the user uttered the correct dragon type, attack!
        dragon.hp -= 2;
        res.session('dragon', dragon);

        if (dragon.hp <= 0) {
          res.say(`You have slain the mighty ${dragon.type} dragon! Congratulations!`);
          // end session so the user can play again
          res.shouldEndSession(true);
        } else {
          res.say(`You attack the ${dragon.type} dragon with your lance! It has ${dragon.hp} HP left!`);
          res.shouldEndSession(false);
        }
      }
    }
  }
);

module.exports = app;

if (configuration === 'chatskills') {
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
