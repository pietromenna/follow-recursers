var React = require('react');
var MainContainer = require('./MainContainer');

var request = require('superagent');

var batches = [
  {
    name: 'Spring 1',
    selected: false,
    users: [
      {
        twitter: 'muditameta'
      },
      {
        twitter: 'srmor'
      }
    ]
  },
  {
    name: 'Spring 2',
    selected: true
  }
];

request
  .post('http://localhost:4000/twitter/follow')
  .send({
    usernames: [
      {
        twitter: 'pietromenna'
      },
      {
        twitter: 'srmor'
      }
    ]
  })
  .set('Accept', 'application/json')
  .end();

React.render(<MainContainer batches={ batches }/>, document.getElementById('main-container'));
