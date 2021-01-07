/**
 * @file lib/message.js
 *
 * @description Server side routes for handling messages.
 */

import nano from 'nano'
import getConfig from 'lib/config.js'

let config = null;

/**
 * Set uo configuration.
 */
export function initMessage(passedConfig) {
  config = getConfig(passedConfig)
}

/**
 * Send a message to a user.
 *
 * @param {*} req 
 * @param {*} res 
 */
export async function sendMessage(req, res) {

  if (req.user._id == req.body.to) {
    // Return a 201 here because it's OK, the message is where it should be,
    // in the user's list of messages, but we have nothing more to do.
    return res.status(201).end('Unable to sent to yourself.');
  }
  // Get user database
  const dbName = '/' + config.userDbPrefix + '$' + req.body.to
  console.log('Opening ' + dbName)
  const db = nano(config.getAuthenticatedRoot() + dbName)

  // Get messages document.
  db.get('messages')
  .then((messages) => {
    // If there are not messages in the system, create the document.
    if (!messages) {
      messages = {
        _id: 'messages'
      };
    }
    // If there is no existing list, create it.
    if (!Array.isArray(messages.list)) {
      messages.list = []
    }
    // Add new message to the list.
    messages.list.push({
      from: req.user._id,
      time: req.body.time,
      body: req.body.body
    })

    return db.insert(messages)
  })
  .then((ans) => {
    console.log('Added', ans)
    res.status(201).end();
  })
  .catch((err) => {
    console.error(err)
    res.status(500).end('Error adding message')
  })

}
