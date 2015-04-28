var React = require('react');
var Person = require('./Person');

var request = require('superagent');
var _ = require('lodash');

var Batch = React.createClass({
  getInitialState: function () {
    return {
      people: {}
    };
  },

  _toggle: function () {
    this.props.toggle(this.props.name);
  },

  _showPeople: function () {
    request
      .get('/people/' + this.props.id)
      .set('Accept', 'application/json')
      .end(function (err, data) {
        var people = {};
        var peopleArr = JSON.parse(data.text);

        peopleArr.forEach(function (person) {
          person.selected = false;
          people[person.id] = person;
        });

        this.setState({
          people: people
        });
      }.bind(this));
  },

  _togglePerson: function (id) {
    this.setState(function (prevState) {
      prevState.people[id].selected = !prevState.people[id].selected;
      return {
        people: prevState.people
      };
    });
  },

  render: function () {
    var people;

    if (this.state.people) {
      people = _.values(this.state.people).map(function (person, index) {
        return (
          <Person
            name={ person.first_name + ' ' + person.last_name }
            id={ person.id }
            toggle={ this._togglePerson }
            selected={ person.selected  }
            key={ index }
          />
        );
      }.bind(this));
    }

    var show;

    if (this.state.people) {
      show = <button onClick={ this._showPeople } type="button">Show</button>
    }

    return (
      <div className="batch">
        { show }
        <h2>{ this.props.name }</h2>
        <input
          type="checkbox"
          name="add-batch"
          checked={ this.props.selected }
          onChange={ this._toggle }
        />
        { people }
      </div>
    )
  }
});

module.exports = Batch;
