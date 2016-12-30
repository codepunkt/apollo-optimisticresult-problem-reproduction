import express from 'express';
import bodyParser from 'body-parser';
import { apolloExpress } from 'apollo-server';
import { makeExecutableSchema } from 'graphql-tools';

const typeDefs = [`
  type Query {
    items: [Item]
  }

  type Mutation {
    addItem(name: String!): Item
  }

  type Item {
    id: ID!
    name: String!
  }

  schema {
    mutation: Mutation
    query: Query
  }
`];

let id = 2;
const items = [
  { id: 1, name: 'Existing Item 1' },
  { id: 2, name: 'Existing Item 2' },
];

const resolvers = {
  Mutation: {
    addItem(_, { name }) {
      id += 1;
      const item = { id, name };
      return new Promise(resolve => setTimeout(() => resolve(item), 5000));
    },
  },
  Query: {
    items() {
      return new Promise(resolve => setTimeout(() => resolve(items), 0));
    },
  },
};

const graphqlSchema = makeExecutableSchema({ typeDefs, resolvers });
const PORT = 3000;

var app = express();

app.use('/graphql', bodyParser.json(), apolloExpress({ schema: graphqlSchema }));
app.use(express.static('dist/client'));

const listener = app.listen(PORT, () =>
  console.log(`Server listening on port ${PORT}`),
);