/**
 * @file watcher/index.js
 *
 * Server side couchdb changes stream handler.
 */

import nano from 'nano'
import getConfig from '../config.js'
import updated from './updated.js'

let config = null;

/**
 * Default export to allow config to be passed in.
 */
export default (passedConfig) => {
  config = getConfig(passedConfig)

  /**
   * Create an object of change handlers that correspond to the change types.
   *
   * TODO: We can also get "created" and "deleted" changes.
   */
  const actions = {
    updated: updated(config)
  }

  const db = nano(config.getAuthenticatedRoot() + '/_global_changes')

  /**
   * Watch for global changes.
   *
   * We'd really need a way of tracking the last timestamp so we don't
   * miss any changes when the system is down, but this is good enough
   * for the demo.
   */
  db.changesReader.start({
    since: 'now'
  })
  .on('change', (globalChange) => {
    console.log('GLOBAL CHANGE', globalChange)
    const changeId = globalChange.id.split(':')
    const changeType = changeId[0]
    const changeTable = changeId[1]

    if (changeType in actions) {
      // TODO: Do this stuff in a Worker.
      actions[changeType].process(changeTable, globalChange.changes[0])
    }

  })
}

/**
 * Event handler for Superlogin user creation
 *
 * Bypass the global changes system for user creation in favour of the
 * superlogin event to save some DB calls.
 */
export function userCreationHandler(user, provider) {
  const dbName = '/' + config.userDbPrefix + '$' + user._id
  const db = nano(config.getAuthenticatedRoot() + dbName)
  db.insert({
    "name": user.name,
    "email": user.email
  }, 'profile')
  .catch((er) => {
    console.error('Error creating user profile', er)
  })
}

/**
 * Implement a basic user search, for autocomplete when sending messages.
 */
export function userSearch(req, res, next) {
  const doc = nano(config.getAuthenticatedRoot() + '/' + config.userDb);
  doc.find({
    "selector": {
      "type": "user",
      "$or": [
        {"_id": {
          "$regex": "(?i)" + req.params.q // (?i) makes it case insentitive.
        }},
        {"name": {
          "$regex": "(?i)" + req.params.q
        }}
      ]
    },
    "fields": [
      "_id"
    ]
   })
  .then((list) => {
    console.log('GOT LIST', list)
    res.status(200).send(list)
  })
  .catch((er) => {
    console.log('ERROR', er)
    res.status(500).send({error: "Something went wrong"})
  })
}

/**
 * Run initial setup.
 */
export async function setup(passedConfig) {
  config = getConfig(passedConfig)
  const server = nano(config.getAuthenticatedRoot())

  await server.db.create('_global_changes')
  .then(() => console.log('Created global changes database.'))
  .catch(() => console.log('Global changes exists.'))

  await server.db.create(config.userDb)
  .then(() => console.log('Created users database.'))
  .catch(() => console.log('Users database exists.'))
}
