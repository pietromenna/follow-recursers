var React = require('react');
var MainContainer = require('./MainContainer');
var request = require('superagent');

request
  .post('/github/follow')
  .send({usernames: ['pietromenna']})
  .end();

React.render(<MainContainer/>, document.getElementById('main-container'));
