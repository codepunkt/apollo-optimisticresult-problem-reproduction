import React from 'react';
import { render } from 'react-dom';
import ApolloClient from 'apollo-client';
import { ApolloProvider, graphql } from 'react-apollo';
import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import gql from 'graphql-tag';
import update from 'immutability-helper';
import uuid from 'uuid/v4';

const apolloClient = new ApolloClient({
  dataIdFromObject: ({ __typename: typename, id }) => {
    return id && typename ? `${typename}${id}` : null;
  },
});

const container = document.querySelector('#app');
const store = createStore(
  combineReducers({ apollo: apolloClient.reducer() }),
  {},
  compose(applyMiddleware(apolloClient.middleware()))
);


function Item({ item: { id, name } }) {
  return <li><div>{name}</div><div>ID {id}</div></li>;
}

function List({ data: { items, loading } }) {
  if (loading) return <div>loading...</div>;
  return <ul>{items.map(item => <Item key={item.id} item={item} />)}</ul>;
}

const itemQuery = gql`
  query items {
    items { id name }
  }
`;

const ItemList = graphql(itemQuery, {
  options() {
    return {
      reducer: (prev, { operationName, type, result: { data } }) => {
        if (type === 'APOLLO_MUTATION_RESULT' && operationName === 'addItem' && data) {
          return update(prev, { items: { $push: [data.addItem] } });
        }
        return prev;
      },
    };
  },
})(List);

class Form extends React.Component {
  constructor(props) {
    super(props);
    this.state = { name: '' };

    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleNameChange(event) {
    this.setState({ name: event.target.value });
  }

  handleSubmit(event) {
    this.props.add(this.state.name);
    this.setState({ name: '' });
    event.preventDefault();
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <input type="text" name="name" value={this.state.name} onChange={this.handleNameChange} />
        <input type="submit" value="Add Item" />
      </form>
    );
  }
}

const addItem = gql`
  mutation addItem($name: String!) {
    addItem(name: $name) {
      id name
    }
  }
`;

const ItemForm = graphql(addItem, {
  props: ({ mutate }) => ({
    add: name => mutate({
      variables: { name },
      optimisticResponse: {
        __typename: 'Mutation',
        addItem: {
          name,
          __typename: 'Item',
          id: uuid(),
        },
      },
    }),
  }),
})(Form);

const App = function() {
  return (
    <div>
      <ItemList />
      <ItemForm />
    </div>
  );
}

render(
  <ApolloProvider store={store} client={apolloClient}>
    <App />
  </ApolloProvider>,
  container
);