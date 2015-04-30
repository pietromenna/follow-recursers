var session = require('express-session')
var bodyParser = require('body-parser')
var express = require('express');
var app = express();
var request = require('request');
var path = require('path');

app.use(session({secret: "hohoinonournvo"}))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static('build'));
app.use("/styles", express.static('styles'));

// Twitter API
var twitterAPI = require('node-twitter-api');
var twitter = new twitterAPI({
    consumerKey: process.env.TWITTER_CONSUMER_ID || 'your consumer Key',
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET || 'your consumer secret',
    callback: process.env.TWITTER_CALLBACK || 'http://localhost:4000/oauth/twitter/callback'
});

app.get('/', function(req, res){
  if (!req.session.RCtoken){
    res.redirect("/login")
  }
  else {
    res.sendFile(path.join(__dirname+"/public/index.html"));
  }
});

var ghAccessToken;
/////////////////////
// Recurse Center API
/////////////////////

var hackerschool = require('hackerschool-api');
var client = hackerschool.client();

var auth = hackerschool.auth({
  client_id: process.env.RECURSE_CLIENT_ID || 'test',
  client_secret: process.env.RECURSE_CLIENT_SECRET || 'teste',
  redirect_uri: process.env.RECURSE_REDIRECT_URI || 'http://localhost:4000/oauth/recurse/callback'
});

app.get('/login', function(req, res) {
  var authUrl = auth.createAuthUrl();
  res.redirect(authUrl);
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

app.get('/oauth/recurse/callback', function(req, res) {
  var code = req.query.code;

  auth.getToken(code)
  .then(function(token) {
    client.setToken(token);
    req.session.RCtoken = token;
  res.redirect("/");
  }, function(err) {
    res.send('There was an error getting the token');
  });
});


/////////////////////
// Twitter
/////////////////////
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
        req.session.twttrAccessToken = accessToken;
        req.session.twttrAccessTokenSecret = accessTokenSecret;
        res.redirect("/")
    }
});
});

app.get('/twitter/loggedin', function (req, res) {
  if (!req.session.twttrAccessToken) {
    res.status(401);
  }
  else {
    res.status(200);
  }

  res.end();
});

app.post('/twitter/follow', function (req, res) {
  var usernames = req.body.usernames;

  usernames.forEach(function (username) {
    twitter.friendships('create', {
      screen_name: username.twitter,
      follow: true
    },
    req.session.twttrAccessToken,
    req.session.twttrAccessTokenSecret,
    function (err, data) {
      if (err)
        console.log(err);
    });
  });
});

/////////////////////
//GitHub
/////////////////////
app.get('/login/github', function(req, res) {
  res.redirect("https://github.com/login/oauth/authorize?" +
    "client_id="+ process.env.GITHUB_CLIENT_ID + "&" +
    "redirect_uri="+ "http://localhost:4000/oauth/github/callback" + "&" +
    "scope=" + "user:follow" + "&" +
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
    ghAccessToken = JSON.parse(body).access_token;

    res.redirect('/');
  });
});

app.get('/github/loggedin', function (req, res) {
  if (!ghAccessToken) {
    res.status(401);
  }
  else {
    res.status(200);
  }

  res.end();
});


app.post('/github/follow', function (req, res) {
  var usernames = req.body.usernames;
  usernames.forEach(function (username) {
    var url = 'https://api.github.com/user/following/' + username.github + '?access_token=' + ghAccessToken;

    request({
      method: 'put',
      url: url,
      headers: {
        'User-Agent': 'Recursers App',
        'Content-Length': '0',
      }
    });
  });
});

var http_port = process.env.port || 4000;
var server = app.listen(http_port, function () {
var host = server.address().address;
var port = server.address().port;

console.log('Example app listening at http://%s:%s', host, port);

});
