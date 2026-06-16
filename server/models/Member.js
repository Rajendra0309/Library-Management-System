const User = require('./User');

// Export User model as Member to maintain compatibility with project folder structure
// while keeping all users (Admins, Librarians, and Members) in the single unified 'users' collection.
module.exports = User;
