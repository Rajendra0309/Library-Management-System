/**
 * Role Middleware
 * Convenience wrappers around the authorize() function from auth.middleware.js
 * These are semantic aliases that make route declarations more readable.
 */
const { authorize } = require('./auth.middleware');

/**
 * Restrict access to Admin users only
 */
const adminOnly = authorize('admin');

/**
 * Restrict access to Librarian and Admin users
 */
const librarianAndAbove = authorize('admin', 'librarian');

/**
 * Allow all authenticated roles (admin, librarian, member)
 */
const allRoles = authorize('admin', 'librarian', 'member');

module.exports = { adminOnly, librarianAndAbove, allRoles };
