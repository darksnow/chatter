#!/bin/sh

docker-compose exec api sh -c 'node ../lib/auth/initServer http://$AUTH_COUCH_ADMIN:$AUTH_COUCH_PASS@couchdb:5984/_users'
