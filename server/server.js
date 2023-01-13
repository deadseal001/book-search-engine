const express = require('express');
const {ApolloServer} = require('apollo-server-express');
const { authMiddleware } = require("./utils/auth");
const path = require('path');
const db = require('./config/connection');
const routes = require('./routes');

const {typeDefs, resolvers} = require ( './schemas');
const { authMiddleware } = require('./utils/auth');



const app = express();
const PORT = process.env.PORT || 3001;

// create a new Apollo server and pass in our schema data
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware
});

server.applyMiddleware({app});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

app.use(routes);

// Create a new instance of an Apollo server with the GraphQL schema
const starApolloServer = async (typeDefs, resolvers)=>{
  await server.start();
//integrate our Apollo server with the Express application as middleware
  

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/build/index.html"));
  });

  db.once('open', ()=>{
    app.listen(PORT,()=>{
      console.log(`🌍 API server running on port ${PORT}!`);
      // log where we can go to test our GQL API
      console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
    })
  })
};

//Cal the async function to start the server
starApolloServer(typeDefs,resolvers);






//app.use(routes);


