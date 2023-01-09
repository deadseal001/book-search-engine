const {User, book}=require ('../models');
const {AuthenticationError} = require('apollo-server-express');
const {signToken}=require('../utils/auth');
const auth = require('../utils/auth');


const resolvers = {

    Query: {
        me: async (parnet, args, context)=>{
            if (context.user){
                const userData = await User.findOne({_id: context.user._id}).select('-__v -password');
                return userData;
            }
            throw new AuthenticationError ("You need log in to get the data");
        }
    },

    Mutation: {
        addUser: async (parent, args)=>{
            const user=await User.create(args);
            const token=signToken(user);
            return { token, user};
        },

        login: async (parent, {email, password})=>{
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError('No user found');
            }

            const correctPW=await user.isCorrectPassword(password);
            if (!correctPW){
                throw new AuthenticationError('Incorrect credentials');
            }

            const token = signToken(user);
            return { token, user};
        },

        saveBook: async (parent, args, context)=>{
            if (context.user) {
                const updateUser = await User.findByIdAndUpdate(
                    { _id: context.user._id},
                    { $addToSet: {saveBooks:args.input}},
                    {new:ture}
                );
            return updateUser;
            }

            throw new AuthenticationError('You need to log in to save a book');
        },

        removeBook: async (parent, args, context) =>{
            if (context.user){
                const updateUser = await User.findByIdAndUpdate(
                    context.user._id, {$pull: {saveBooks: {bookId: args.bookId}}}, {new: true}
                );

                return updateUser;
            }
            throw new AuthenticationError('You need to login to remove a book!');
        }


    }
};

module.exports = resolvers;
