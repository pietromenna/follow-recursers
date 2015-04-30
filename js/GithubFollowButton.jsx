var React = require('react');

var request = require('superagent');
var _ = require('lodash');

var GithubFollowButton = React.createClass({
  getInitialState: function () {
    return {
      loggedIn: false
    };
  },

  componentDidMount: function () {
    request
      .get('/github/loggedin')
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
      window.location = '/login/github';
      return;
    }

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
    return (
      <button
        type="button"
        className="follow-github-button"
        onClick={ this._followButtonClick}
      >
      { this.state.loggedIn ? 'Follow on Github' : 'Login on Github' }
      </button>
    );
  }
});

module.exports = GithubFollowButton;
