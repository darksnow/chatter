/**
 * @file client.js
 *
 * Client side functions to communicate with the auth library.
 */

/**
 * The URL of the base of the auth library.
 */
const AUTH_ROOT = '/auth'; // Relative path because it's handled by sapper.
const USER_RECORD = 'current-user';

let user = false;
let remote = false;
let bearer = false;

/**
 * Get the user record from local storage if we are logged in.
 */
export function getUserRecord() {
  if (!user) {
    user = JSON.parse(localStorage.getItem(USER_RECORD));
  }
  return user;
}

/**
 * Get the CouchDB user database from the stored user record.
 */
export function getRemote() {
  if (!remote) {
    const user = getUserRecord();
    if (user && user.userDBs && user.password) {
      remote = user.userDBs.userdb
        .replace('http://', 'https://')
        .replace('couchdb:5984', 'couchdb.chatter.localhost');
    }
  }
  return remote;
}

/**
 * Get the bearer token from the stored user record.
 */
function getBearer() {
  if (!bearer) {
    const user = getUserRecord();
    if (user && user.token && user.password) {
      bearer = 'Bearer ' + user.token + ':' + user.password;
    }
  }
  return bearer;
}

/**
 * Client side request wrapper, intended to make a call to auth library
 * from the browser using browser native fetch.
 *
 * @param {string} url part of the URL after the base path.
 * @param {string} method An HTTP verb [ GET | POST | PUT | DELETE ]
 * @param {Object} body The body of the request, ignored for GET.
 * @param {Object} options Options for fetch.
 */
export async function makeRequest(url, method, body, options) {
  options = options || {};
  method = method || 'GET';
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
  const authHeader = getBearer();
  if (authHeader) {
    headers.Authorization = authHeader
  }

  let payLoad = {...{
    method: method,
    headers: headers,
    body: JSON.stringify(body)
  }, options};

  if (payLoad.method === 'GET') {
    delete payLoad.body
  }
  return await fetch(url, payLoad);
}

/**
 * Attempt to create a new user account for the given username.
 *
 * @param {string} username User name.
 * @param {string} email Email address.
 * @param {string} password Clear text password.
 * @param {string} confirm Repeat the password.
 * @param {string} fullName The person's real name, for searches.
 */
export async function signUp(username, email, password, confirm, fullName) {
  const body = {
    confirmPassword: confirm,
    password: password,
    email: email,
    username: username
  };
  if (fullName) {
    body.name = fullName
  }
  const response = await makeRequest(AUTH_ROOT + '/register', 'POST', body);
  return response;
}

/**
 * Login an existing user.
 *
 * @param {string} username The username.
 * @param {string} password Clear text password.
 */
export async function logIn(username, password) {
  const response = await makeRequest(AUTH_ROOT + '/login', 'POST', {
    username: username,
    password: password
  })
  const data = await response.json();
  console.log('LOGIN', response)
  data.status = response.status;

  if (response.status === 200) {
    // Remenber the logger in user details.
    localStorage.setItem(USER_RECORD, JSON.stringify(data));
  }
  return data;
}

/**
 * Logout the current user. If no user is logged in it returns OK.
 */
export async function logOut() {
  const response = await makeRequest(AUTH_ROOT + '/logout', 'POST');
  localStorage.removeItem(USER_RECORD);
  user = false;
  remote = false;
  bearer = false;
}

/**
 * Search for part of a user's login or real name.
 *
 * @param {string} userName Partial user name for search.
 */
export async function userSearch(userName) {
  const response = await makeRequest('/search/' + userName);
  if (response.status == 200) {
    const data = await response.json();
    return data.docs
  }
  else {
    return [];
  }
}

export async function changePassword(oldPassword, newPassword) {
  
}