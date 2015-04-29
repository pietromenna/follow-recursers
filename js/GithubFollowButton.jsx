var React = require('react');

var request = require('superagent');
var _ = require('lodash');

var GithubFollowButton = React.createClass({
  _followButtonClick: function () {
    var people = [];

    this.props.batches.forEach(function (batch) {
      people.push.apply(people, _.filter(batch.people, {selected: true}));
    });

    console.log(people);

    request
      .post('/github/follow')
      .send({
        usernames: people
      })
      .end();
  },

  render: function () {
    return <button type="button" onClick={ this._followButtonClick }>Follow on Github</button>
  }
});

module.exports = GithubFollowButton;
