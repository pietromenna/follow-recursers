var React = require('react');
var MainContainer = require('./MainContainer');

var batches = [
  {
    name: 'Spring 1',
    selected: false
  },
  {
    name: 'Spring 2',
    selected: true
  }
]

React.render(<MainContainer batches={ batches }/>, document.getElementById('main-container'));
