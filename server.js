var session = require('express-session')
var bodyParser = require('body-parser')
var express = require('express');
var app = express();
var request = require('request');

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
  client_id: process.env.RECURSE_CLIENT_ID || 'test',
  client_secret: process.env.RECURSE_CLIENT_SECRET || 'teste',
  redirect_uri: process.env.RECURSE_REDIRECT_URI || 'http://localhost:4000/oauth/recurse/callback'
});

// GitHub API
var GitHubApi = require("github");
var github = new GitHubApi({
    // required
    version: "3.0.0",
    // optional
    debug: true,
    protocol: "http",
    host: "api.github.com", // should be api.github.com for GitHub
    pathPrefix: "/api/v3", // for some GHEs; none for GitHub
    timeout: 5000,
    headers: {
        "user-agent": "Recursers App" // GitHub is happy with a unique user agent
    }
});

// github.authenticate({
//     type: "oauth",
//     key:  process.env.GITHUB_CLIENT_ID || 'test',
//     secret: process.env.GITHUB_CLIENT_SECRET || 'teste'
// })

app.get('/login', function(req, res) {
  var authUrl = auth.createAuthUrl();

  // redirect the user to the auth page
  res.redirect(authUrl);
});

app.get('/login/twitter', function(req, res) {
	twitter.getRequestToken(function(error, requestToken, requestTokenSecret, results){
	    if (error) {
	        console.log("Error getting OAuth request token : " + error);
	    } else {
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
        req.session.accessToken = accessToken;
        req.session.accessTokenSecret = accessTokenSecret;
        res.redirect("/")
    }
});
});

app.get('/login/github', function(req, res) {
  res.redirect("https://github.com/login/oauth/authorize?" +
    "client_id="+ process.env.GITHUB_CLIENT_ID + "&" +
    "redirect_uri="+ "http://localhost:4000/oauth/github/callback" + "&" +
    "scopes=" + "user:follow" + "&" +
    "state=" + "owfowjowjfjwofjw"
    );
});

app.get('/oauth/github/callback', function(req, res) {
  request.post(
    { headers: {"Accept": 'application/json'},
      url: "https://github.com/login/oauth/access_token",
      form: {client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code: req.query.code}

  }, function(error,response,body)
  {
    github.authenticate({
      type: "oauth",
      token: JSON.parse(body).access_token
    });

    res.redirect('/');
  });
});



app.post('/twitter/follow', function (req, res) {
  var usernames = req.body.usernames;

  usernames.forEach(function (username) {
    twitter.friendships('create', {
      screen_name: username.twitter,
      follow: true
    },
    req.session.accessToken,
    req.session.accessTokenSecret,
    function (err, data) {
      if (err)
        console.log(err);
      else
        console.log(data);
    });
  });
});

app.post('/github/follow', function (req, res) {
  var usernames = req.body.usernames;

  usernames.forEach(function (username) {
    github.user.followUser({user: username}, function(error, response) {
      console.log(error);
      console.log(response);
    });
  });
});

app.get('/oauth/recurse/callback', function(req, res) {
  var code = req.query.code;

  auth.getToken(code)
  .then(function(token) {
    client.setToken(token);
    // tells the client instance to use this token for all requests
	res.redirect("/"); 
  }, function(err) {
    res.send('There was an error getting the token');
  });
});

app.get('/batches', function(req, res){
  client.batches.list().then(function(batches){
    res.json(batches);
  })
});

app.get('/people/:batchid', function(req, res){
  client.batches.people(req.params.batchid).then(function(people){
    res.json(people);
  })
});

var server = app.listen(4000, function () {

var host = server.address().address;
var port = server.address().port;

console.log('Example app listening at http://%s:%s', host, port);

});
