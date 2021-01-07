/**
 * @file watcher/updated.js
 *
 * Process updated changes.
 */

import nano from 'nano';
import getConfig from '../config';

/**
 * Default export to allow config to be passed in.
 */
export default (config) => {
  config = getConfig(config)

  return {
    process: (dbName, change) => {
      /**
       * A generic strategy for this would be to use deep object diff
       * from https://www.npmjs.com/package/deep-object-diff to determine
       * which documents have changed and split that code to handle each
       * document.
       *
       * For our uses here, we're only tracking the profile document in the
       * user databases and only a few fields in the source, so we can safely
       * check them individually.
       *
       * An easier approach would be to assume that the profile has changed
       * update every time, but as there may be a lot of documents in the
       * user database, we need to compare the target document to minimise
       * the number of updates to the target database.
       */

      /**
       * We've updated a user database.
       */
      if (dbName.startsWith(config.userDbPrefix)) {

        const userName = dbName.substring(config.userDbPrefix.length + 1)

        const db = nano(config.getAuthenticatedRoot())
        let changed = false

        const incoming = db.use(dbName)
        incoming.get('profile')
        .then((profile) => {

          const userDb = db.use(config.userDb)
          userDb.get(userName)
          .then((user) => {
            // Itterate over incoming profile to see if anything changed.
            for (let [key, value] of Object.entries(profile)) {
              // Ignore _ keys and update any changes.
              if (!key.startsWith('_') && value !== user[key]) {
                changed = true
                user[key] = value
              }
            }
            if (changed) {
              userDb.insert(user)
            }
          })
          .catch((err) => {
            console.error('UPDATED: Error getting user ' + userName, err)
          })
        })
      }
    }
  }
}
