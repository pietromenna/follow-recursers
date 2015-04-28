var React = require('react');

var Batch = React.createClass({
  _toggle: function () {
    this.props.toggle(this.props.name);
  },

  render: function () {
    return (
      <div className="batch">
        <h2>{ this.props.name }</h2>
        <input
          type="checkbox"
          name="add-batch"
          checked={ this.props.selected }
          onChange={ this._toggle }
        />
      </div>
    )
  }
});

module.exports = Batch;
