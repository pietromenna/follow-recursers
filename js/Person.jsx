var React = require('react');

var Person = React.createClass({
  _toggle: function () {
    this.props.toggle(this.props.id);
  },

  render: function () {
    return (
      <div className="person">
        <input
          type="checkbox"
          checked={ this.props.selected }
          onChange={ this._toggle }
        />
        <h3>{ this.props.name }</h3>
      </div>
    );
  }
});

module.exports = Person;
