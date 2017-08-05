require('dotenv').config();
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

app.intent('getBook', {
    slots: {
      TitleOne: 'TITLE',
      TitleTwo: 'TITLE',
      TitleThree: 'TITLE',
      TitleFour: 'TITLE',
      TitleFive: 'TITLE'
    },
    utterances: [
      'get {a|the|that|} book',
      'get {a|the|that|} book {-|TitleOne}',
      'get {a|the|that|} book {-|TitleOne} {-|TitleTwo}',
      'get {a|the|that|} book {-|TitleOne} {-|TitleTwo} {-|TitleThree}',
      'get {a|the|that|} book {-|TitleOne} {-|TitleTwo} {-|TitleThree} {-|TitleFour}',
      'get {a|the|that|} book {-|TitleOne} {-|TitleTwo} {-|TitleThree} {-|TitleFour} {-|TitleFive}'
    ]
  }, function(req, res) {
    let title = req.slot('TitleOne');
    let message = '';
    
    if (title) {

      // capture additional words in title
      let TitleTwo = req.slot('TitleTwo') || '';
      let TitleThree = req.slot('TitleThree') || '';
      let TitleFour = req.slot('TitleFour') || '';
      let TitleFive = req.slot('TitleFive') || '';

      // concatenate the words together
      title += ' ' + TitleTwo + ' ' + TitleThree + ' ' + TitleFour + ' ' + TitleFive;

      // trim whitespace and trailing comma
      title = title.replace(/,\s*$/, '');

      let book = getBook(title);
      if (!book.error && book.title) {
        // store the book in session
        res.session('book', book);

        // respond to the user
        message = 'Ok. I found the book ' + book.title;
      } else {
        message = 'Sorry, I can\'t seem to find that book.';
      }
    } else {
      message = 'What book would you like to get? Please say get book, followed by the title.';
    }
    // we have a book in session, so keep the session alive
    res.say(message).shouldEndSession(false);
  }
);

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

function getBook(title) {
  var book = null;
  var url = `https://www.goodreads.com/book/title.xml?key=${process.env.GOODREADS_API_KEY}&title=${title}`;

  request (url, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      xml2js(body, function(error, result) {
        if (!error) {
          // extract just the fields that we want to work with, which minimizes the size of session
          let b = result.GoodreadsResponse.book[0];
          book = { id: b.id, title: b.title, ratings_count: b.ratings_count, average_rating: b.average_rating, authors: b.authors };
        } else {
          book = { error: error };
        }
      });
    } else {
      book = { error: error };
    }
  });

  // wait until we have a result from the async call
  deasync.loopWhile(function() {
    return !book;
  });

  return book;
}
