var React = require('react');

var Batch = require('./Batch');
var SaveBatchesButton = require('./SaveBatchesButton');

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

  _toggleSelected: function (batchName) {
    this.setState(function (prevState) {
      for (var i = 0; i < prevState.batches.length; i++) {
        var batch = prevState.batches[i];
        if (batch.name === batchName) {
          batch.selected = !batch.selected;

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
          key={ index }
          selected={ batch.selected }
          toggle={ this._toggleSelected }
        />
      );
    }.bind(this));

    return (
      <div className="main-container">
        <h1>Recursers</h1>
        { batches }
        <SaveBatchesButton batches={ this.state.batches }/>
      </div>
    );
  }
});

module.exports = MainContainer;
