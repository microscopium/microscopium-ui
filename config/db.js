module.exports = {
    // the database url
    url : process.env.MONGO_URL || 'mongodb://localhost/microscopium',
    mongoUser: process.env.MONGO_USER,
    mongoPassword: process.env.MONGO_PASSWORD
};
