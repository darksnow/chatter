import sirv from 'sirv';
import express from 'express';
import json from 'body-parser';
import compression from 'compression';
import SuperLogin from '@sl-nx/superlogin-next';
import * as sapper from '@sapper/server';
import watcher from './lib/watcher';
import { userCreationHandler, userSearch, setup } from './lib/watcher';
import { initMessage, sendMessage } from './lib/message.js';

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';
const conf = {
  couch: {
    protocol: process.env.AUTH_COUCH_PROTOCOL,
    host: process.env.AUTH_COUCH_HOST,
    username: process.env.AUTH_COUCH_ADMIN,
    password: process.env.AUTH_COUCH_PASS,
    userDb: process.env.AUTH_COUCH_USERDB,
    userdbPrefix: process.env.AUTH_COUCH_USERDB_PREFIX
  }
};
initMessage(conf);

(async()=> {

  await setup(conf)

  /**
   * Configure Superlogin.
   */
  const sl = new SuperLogin({
    dbServer: {
      protocol: process.env.AUTH_COUCH_PROTOCOL,
      host: process.env.AUTH_COUCH_HOST,
      user: process.env.AUTH_COUCH_ADMIN,
      password: process.env.AUTH_COUCH_PASS,
      userDB: process.env.AUTH_COUCH_USERDB,
      couchAuthDB: '_users'
    },
    mailer: {
      fromEmail: process.env.AUTH_MAIL_FROM,
      options: {
        service: process.env.AUTH_MAIL_SERVICE,
        auth: {
          user: process.env.AUTH_MAIL_USER,
          pass: process.env.AUTH_MAIL_PASS
        }
      }
    },
    userDBs: {
      defaultDBs: {
        private: [process.env.AUTH_COUCH_USERDB_PREFIX]
      }
    }
  })

  sl.onCreate(userCreationHandler)

  express()
    .use(
      compression({ threshold: 0 }),
      sirv('static', { dev }),
      json()
    )
    .use('/auth', sl.router)
    .use('/search/:q', sl.requireAuth, userSearch)
    .post('/message', sl.requireAuth, sendMessage)
    .use(sapper.middleware())
    .listen(PORT, err => {
      if (err) console.log('SERVER ERROR\n', err);
    });

  watcher(conf);

})();