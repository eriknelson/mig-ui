#!/bin/bash
cp ./config/config.dev.json.example ./config/config.dev.json
./node_modules/.bin/start-server-and-test start http://localhost:9000 './node_modules/.bin/cypress run'
