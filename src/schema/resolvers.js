const {ObjectID} = require('mongodb')

module.exports = {
  Query: {
    allLinks: async (root, data, {mongo: {Links, Users}}) => {
      return await Links.find({}).toArray();
    },
  },

  Mutation: {
    createLink: async (root, data, {mongo: {Links}, user}) => {
      const newLink = Object.assign({postedById: user && user._id}, data)
      const response = await Links.insert(newLink);
      return Object.assign({id: response.insertedIds[0]}, newLink);
    },

    createVote: async (root, data, {mongo: {Votes}, user}) => {
      const newVote = Object.assign({userId: user && user._id}, data);
      const response = await Votes.insert(newVote);
      return Object.assign({id: response.insertedIds[0]}, newVote);
    },

    createUser: async (root, data, {mongo: {Users}}) => {
      // You need to convert the given arguments into the format for the
      // `User` type, grabbing email and password from the "authProivder".
      const newUser = {
        name: data.name,
        email: data.authProvider.email.email,
        password: data.authProvider.email.password,
      };
      const response = await Users.insert(newUser);
      return Object.assign({id: response.insertedIds[0]}, newUser);
    },

    signinUser: async (root, data, {mongo: {Users}}) => {
      const user = await Users.findOne({email: data.email.email});
      if (data.email.password === user.password) {
        return {token: `token-${user.email}`, user};
      }
    },
  },

  Link: {
    // Convert the "_id" field from MongoDB to "id" from the schema.
    id: root => root._id || root.id,

    postedBy: async (root, data, {mongo: {Users}}) => {
      const {postedById} = root
      return Users.findOne({_id: new ObjectID(postedById)})
    },
  },

  User: {
    // Convert the "_id" field from MongoDB to "id" from the schema.
    id: root => root._id || root.id,
  },

  Vote: {
    // Convert the "_id" field from MongoDB to "id" from the schema.
    id: root => root._id || root.id,

    user: async ({userId}, data, {mongo: {Users}}) => {
      return Users.findOne({_id: new ObjectID(userId)})
    },

    link: async ({linkId}, data, {mongo: {Links}}) => {
      return Links.findOne({_id: new ObjectID(linkId)})
    },
  },
};
