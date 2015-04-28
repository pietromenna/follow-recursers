var React = require('react');

var Person = React.createClass({
  _toggle: function () {
    this.props.toggle(this.props.id);
  },

  render: function () {
    return (
      <div className="person">
        <h3>{ this.props.name }</h3>
        <input
          type="checkbox"
          checked={ this.props.selected }
          onChange={ this._toggle }
        />
      </div>
    );
  }
});

module.exports = Person;
