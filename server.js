var session = require('express-session')
var bodyParser = require('body-parser')
var express = require('express');
var app = express();

app.use(session({secret: "hohoinonournvo"}))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static('build'));
app.use(express.static('public'));

// Twitter API
var twitterAPI = require('node-twitter-api');
var twitter = new twitterAPI({
    consumerKey: process.env.TWITTER_CONSUMER_ID || 'your consumer Key',
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET || 'your consumer secret',
    callback: process.env.TWITTER_CALLBACK || 'http://localhost:4000/oauth/twitter/callback'
});

// Recurse Center API
var hackerschool = require('hackerschool-api');

var client = hackerschool.client();

var auth = hackerschool.auth({
  client_id: process.env.CLIENT_ID || 'test',
  client_secret: process.env.CLIENT_SECRET || 'teste',
  redirect_uri: process.env.REDIRECT_URI || 'test'
});

app.get('/login', function(req, res) {
  var authUrl = auth.createAuthUrl();

  // redirect the user to the auth page
  res.redirect(authUrl);
});

app.get('/twitterlogin', function(req, res) {
	twitter.getRequestToken(function(error, requestToken, requestTokenSecret, results){
	    if (error) {
	        console.log("Error getting OAuth request token : " + error);
	    } else {
	        //store token and tokenSecret somewhere, you'll need them later; redirect user
	        req.session.requestToken = requestToken;
	        req.session.requestTokenSecret = requestTokenSecret;
	        res.redirect(twitter.getAuthUrl(requestToken));

	    }
	});
});

app.get('/oauth/twitter/callback', function(req, res) {
	twitter.getAccessToken(req.session.requestToken, req.session.requestTokenSecret, req.query.oauth_verifier, function(error, accessToken, accessTokenSecret, results) {
    if (error) {
        console.log(error);
    } else {
        //store accessToken and accessTokenSecret somewhere (associated to the user)
        //Step 4: Verify Credentials belongs here
        req.session.accessToken = accessToken;
        req.session.accessTokenSecret = accessTokenSecret;
        res.redirect("/")
    }
});
});

app.get('/oauth/recurse/callback', function(req, res) {
  var code = req.query.code;

  auth.getToken(code)
  .then(function(token) {
    // tells the client instance to use this token for all requests
	res.redirect("/");
    client.setToken(token);
  }, function(err) {
    res.send('There was an error getting the token');
  });
});

var server = app.listen(4000, function () {

var host = server.address().address;
var port = server.address().port;

console.log('Example app listening at http://%s:%s', host, port);

});