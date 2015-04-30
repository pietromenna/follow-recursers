var React = require('react');

var TwitterFollowButton = React.createClass({
  _followButtonClick: function () {
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
    return <button type="button" className="follow-twitter-button" onClick={ this._followButtonClick }>Follow on Twitter</button>
  }
});

module.exports = TwitterFollowButton;
