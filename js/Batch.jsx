var React = require('react');
var Person = require('./Person');

var request = require('superagent');
var _ = require('lodash');

var Batch = React.createClass({
  getInitialState: function () {
    return {
      showPeople: false
    };
  },

  _toggle: function () {
    if (!this.props.people) {
      this._getPeople();
    }

    this.props.toggle(this.props.name);
  },

  _togglePeople: function () {
    if (!this.props.people) {
      this._getPeople();
    }

    this.setState(function (prevState) {
      return {
        showPeople: !prevState.showPeople
      };
    });
  },

  _getPeople: function () {
    request
      .get('/people/' + this.props.id)
      .set('Accept', 'application/json')
      .end(function (err, data) {
        var people = {};
        var peopleArr = JSON.parse(data.text);

        peopleArr.forEach(function (person) {
          person.selected = this.props.selected;
          people[person.id] = person;
        }.bind(this));

        this.props.showPeople(this.props.id, people);
      }.bind(this));
  },

  _togglePerson: function (id, batch) {
    this.props.togglePerson(id, this.props.id);
  },

  render: function () {
    var people;

    if (this.state.showPeople) {
      people = _.values(this.props.people).map(function (person, index) {
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

    return (
      <div className="batch">
         <input
          type="checkbox"
          name="add-batch"
          checked={ this.props.selected }
          onChange={ this._toggle }
        />
        <h2>{ this.props.name }</h2>
        <button onClick={ this._togglePeople } type="button">{ this.state.showPeople ? 'Hide' : 'Show' }</button>
        <div className="people">
          { people }
        </div>
      </div>
    )
  }
});

module.exports = Batch;
