/**
 * @file config.js
 *
 * Provides the default configuration for the library, which can be overridden
 * by environment variables and values in the passed in config object.
 */

/**
 * Get all defined environment variables.
 */
const {
  AUTH_COUCH_PROTOCOL,
  AUTH_COUCH_HOST,
  AUTH_COUCH_ADMIN,
  AUTH_COUCH_PASS,
  AUTH_COUCH_USERDB,
  AUTH_COUCH_USERDB_PREFIX
} = process.env;

/**
 * Define default configuration.
 */
const defaults = {
  // CouchDB connection settings.
  couchdb: {
    protocol: AUTH_COUCH_PROTOCOL,
    host: AUTH_COUCH_HOST,
    adminUser: AUTH_COUCH_ADMIN || 'auth-admin',
    adminPass: AUTH_COUCH_PASS,
    adminRole: 'admin',
    authCookie: 'AuthSession',
  },

  userDb: AUTH_COUCH_USERDB,
  userDbPrefix: AUTH_COUCH_USERDB_PREFIX,

  // Fields that are safe to return from the API.
  safeUserFields: 'name email roles rev _rev id _id',

  // Require email verification before activating user account.
  verify: false,

  /**
   * Get the authenticated URL.
   */
  getAuthenticatedRoot: function() {
    return `${AUTH_COUCH_PROTOCOL}${this.couchdb.adminUser}:${this.couchdb.adminPass}@${AUTH_COUCH_HOST}`
  }
}

/**
 * Merge the passed config with the defaults and return a complete configuration object.
 */
export default (config) => {
  return {...defaults, ...config}
}

export const USER_PREFIX = 'org.couchdb.user:';
export const USER_DB = '_users';
export const USER_SESSION = '_session';
export const USER_DB_PREFIX = 'userdb-';
