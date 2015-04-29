var React = require('react');

var Batch = require('./Batch');
var GithubFollowButton = require('./GithubFollowButton');
var TwitterFollowButton = require('./TwitterFollowButton');
var _ = require('lodash');
var request = require('superagent');

var MainContainer = React.createClass({
  getInitialState: function () {
    return {
      batches: []
    };
  },

  componentDidMount: function () {
    request
      .get('/batches')
      .set('Accept', 'application/json')
      .end(function (err, data) {
        this.setState({
          batches: JSON.parse(data.text)
        });
      }.bind(this));
  },

  _showBatchPeople: function (batchId, people) {
    this.setState(function (prevState) {
      prevState.batches.forEach(function (curBatch, batchIndex) {
        if (curBatch.id === batchId) {
          prevState.batches[batchIndex].people = people;
        }
      });

      return {
        batches: prevState.batches
      }
    });
  },

  _toggleBatchPerson: function (id, batchId) {
    this.setState(function (prevState) {
      prevState.batches.forEach(function (curBatch, batchIndex) {
        if (curBatch.id === batchId) {
          prevState.batches[batchIndex].people[id].selected = !prevState.batches[batchIndex].people[id].selected;
        }
      });

      return {
        batches: prevState.batches
      };
    });
  },

  _toggleSelected: function (batchName) {
    this.setState(function (prevState) {
      for (var i = 0; i < prevState.batches.length; i++) {
        var batch = prevState.batches[i];
        if (batch.name === batchName) {
          batch.selected = !batch.selected;
          var people = _.values(batch.people);
          people.forEach(function(person, personIndex){
            batch.people[person.id].selected = batch.selected;
          })
          break;
        }
      }

      return {
        batches: prevState.batches
      };
    });
  },

  render: function () {
    var batches = this.state.batches.map(function (batch, index) {
      return (
        <Batch
          name={ batch.name }
          id={ batch.id }
          people={ batch.people }
          key={ index }
          selected={ batch.selected }
          toggle={ this._toggleSelected }
          togglePerson={ this._toggleBatchPerson }
          showPeople={ this._showBatchPeople }
        />
      );
    }.bind(this));

    return (
      <div className="main-container">
        <GithubFollowButton batches={ this.state.batches }/>
        <TwitterFollowButton batches={ this.state.batches }/>
        { batches }
      </div>
    );
  }
});

module.exports = MainContainer;
