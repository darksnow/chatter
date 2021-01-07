import { onDestroy } from 'svelte';
import { writable, get } from 'svelte/store';
import { goto } from '@sapper/app';
import PouchDb from 'pouchdb';

import { signUp as authSignUp, logIn as authLogin, logOut as authLogout, getRemote, getUserRecord, userSearch } from 'lib/superlogin-client/index.js';
import { addNotification, notificationType } from 'services/ui.js';

const userRoot = '/user';
const USER_RECORD = 'current-user';

export const loginRoute = userRoot + '/login';
const safePaths = [
  loginRoute,
  userRoot + '/signup'
];
var redirectPath = writable();
var remoteUserDb = null;
var userDb = null;
var userSync = null;

export const loggedIn = writable(process.browser && getUserRecord());

/**
 * Initialise the local database and setup syncronisation
 * with the CouchDb remote.
 */
const initDb = () => {
  console.log('Initialising user database', userDb);
  if (!userDb) {
    userDb = new PouchDb('chatter-user');
  }

  const remote = getRemote();

  if (remote && !remoteUserDb) {
    console.log('Starting sync with ' + remote);
    remoteUserDb = new PouchDb(remote);

    userSync = userDb.sync(remoteUserDb, {
      live: true,
      retry: true
    })
    .on('change', (change) => {
      console.log('Replication CHANGE');
      console.log(change);
    })
    .on('error', (err) => {
      console.log('Replication ERROR');
      console.log(err);
    })
    .on('complete', (info) => {
      // If replication has stopped, we're no longer logged in.
      console.log('userSync complete');
      loggedIn.set(false);
    })
  }
  // Clean up any active database connections.
  onDestroy(() => {
    console.log('Destroy');
    if (userSync) {
      console.log('Cancelling remote sync.');
      userSync.cancel();
      userSync = null;
      remoteUserDb = null;
    }
  });

}

/**
 * Register a new user.
 *
 * @param {string} username Login username
 * @param {string} email User's email address.
 * @param {string} password Password.
 * @param {string} confirm Same password again.
 * @param {string} fullName The person's real name, for searches.
 */
export async function signUp(username, email, password, confirm, fullName) {
  let answer = await authSignUp(username, email, password, confirm, fullName);
  switch (answer.status) {
    case 201: // Created.
      addNotification('User account created for ' + username + '. Please login.');
      goto(loginRoute);
      break;
    case 400: // Bad request.
      // Get the errors from the body and return those for display.
      return await answer.json();
    default:
      addNotification('Unable to register');
      break;
  }
  return answer;
}

/**
 * Log the user in using the auth client API.
 *
 * @param {string} username 
 * @param {string} password 
 */
export async function logIn(username, password) {
  let details = await authLogin(username, password);
  console.log('LOGIN', details)
  if (details.status == 200) {
    loggedIn.set(true);
    goto(get(redirectPath) || '/');
  }
  else {
    addNotification(details.message, notificationType.ERROR);
    return false;
  }
}

/**
 * Log the current user out using the auth client API.
 */
export async function logOut() {
  if (loggedIn) {
    const details = await authLogout();
  }
  if (userSync) {
    userSync.cancel();
    userSync = null;
    remoteUserDb = null;
  }
  if (userDb) {
    await userDb.destroy().then(() => userDb = null)
  }
  loggedIn.set(false);
  goto('/');
}

/**
 * Search for part of a user's login or real name.
 *
 * @param {string} name Partial user name for search.
 */
export async function search(name) {
  return await userSearch(name);
}

/**
 * Read a document from the user database and merge with the default.
 *
 * @param {string} docId The document ID.
 * @param {*} defaults Default values of the document.
 */
export async function read(docId, defaults) {
  if (typeof defaults === 'undefined') defaults = {};
  var document = {};
  initDb();
  defaults._id = docId;
  if (userDb) {
    try {
      document = await userDb.get(docId);
      return await document;
    } catch (err) {
      if (err.status !== 404) {
        throw err;
      }
    }
  }

  return defaults;
}

/**
 * Write a document to the database.
 * The document must contain an _id field and if you are updating an existing document, a _rev field.
 * Ideally, read the document out first to get those fields, make changes and write them back.
 *
 * @param {} doc 
 */
export async function write(doc) {
  if (userDb) {
    const answer = await userDb.put(doc);
    return answer;
  }
  return {
    ok: false,
  };
}

/**
 * Used in conjunction with changes to _layout.svelte to protect all routes from
 * unauthorised access.
 */
export function protectPage(page, redirect, safe) {
  safe = [].concat(safe, safePaths);
  if (typeof(redirect) === 'undefined') redirect = true;
  if (!(safe.includes(page.path) || get(loggedIn))) {
    // This path needs protected.
    if (redirect) {
      redirectPath.set(page.path);
      console.log('Goto ' + loginRoute);
      goto(loginRoute);
    }
    return true;
  }
  return false;
}

/**
 * A writabable data store which will keep itself in sync with a document in the
 * user database, allowing CouchDB replication.
 *
 * @param {string} docId 
 * @param {*} defaults 
 */
export const docStore = (docId, defaults) => {
  const doc = writable(defaults);

  let changes = null;
  let rev = '';
  
  const onChange = (change) => {
    console.log('Changes in docStore ' + docId);
    if (change.id === docId && change.doc._rev !== rev) {
      console.log('Updating to ' + change.doc._rev);
      rev = change.doc._rev;
      doc.set(change.doc);
    }
  };

  onDestroy(() => {
    console.log('DocStore ' + docId + ' destroyed');
    if (changes) changes.cancel();
  })

  return {
    subscribe: doc.subscribe,
    set: doc.set,
    update: doc.update,

    load: async () => {
      console.log('Loading ' + docId);
      const newDoc = await read(docId, defaults);
      rev = newDoc._rev;
      console.log('LOADED', newDoc);
      doc.set(newDoc);
      changes = userDb.changes({
        since: 'now', live: true, include_docs: true
      }).on('change', onChange);
    },
    save: async () => {
      // Push changes back to the user database.
      console.log('saving');
      let newDoc = get(doc);
      console.log(newDoc);

      const answer = await write(newDoc);
      if (answer.ok) {
        console.log('Updating ' + newDoc._id + ' to revision :' + answer.rev);
        newDoc._rev = answer.rev;
        rev = newDoc._rev;
        doc.set(newDoc);
        return true;
      }
      else {
        return false;
      }
    }
  }
};
