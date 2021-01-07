# chatter

A chat application based on Svelte, sapper, CouchDB, PouchDB and Superlogin.

This is a starter app that I used to expore how to get the above technologies to work together. It offers an offline first experience for creating a simple multi user chat application.

Initially it was going to be a generic message passing architecture with a monitor watch for changes to each user's Couch database, but with a lot of users I don't think that approach would scale well. While I still thinks it's a near solution for somethings, like profile updates in this app, it's not suitable for more frequest messages. Allowing PouchDB to handle synchronisation with the server side CouchDB and watching for those changes on the server does simplify a lot of things though.

This is me messing around so will very likely not be production ready code. Any suggestions for where I could do things better, or in a more "correct" way would be much appreciated.