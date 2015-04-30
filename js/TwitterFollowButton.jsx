var React = require('react');

var request = require('superagent');
var _ = require('lodash');

var TwitterFollowButton = React.createClass({
  getInitialState: function () {
    return {
      loggedIn: false
    };
  },

  componentDidMount: function () {
    request
      .get('/twitter/loggedin')
      .end(function (err, res) {
        if (res.status === 200) {
          this.setState({
            loggedIn: true
          });
        }
      }.bind(this));
  },

  _followButtonClick: function () {
    if (!this.state.loggedIn) {
      window.location = '/login/twitter';
      return;
    }

    var people = [];

    this.props.batches.forEach(function (batch) {
      people.push.apply(people, _.filter(batch.people, {selected: true}));
    });

    request
      .post('/twitter/follow')
      .send({
        usernames: people
      })
      .end();
  },

  render: function () {
    return <button type="button" className="follow-twitter-button" onClick={ this._followButtonClick }>{ this.state.loggedIn ? 'Follow on Twitter' : 'Login on Twitter' }</button>
  }
});

module.exports = TwitterFollowButton;
