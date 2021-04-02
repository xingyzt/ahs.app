#!/bin/bash

. .env

cd src

html=$(cat index.html)
js=$(cat script.js)
css=$(cat style.css)

auth=$(curl "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=$FIREBASE_API_KEY" \
-H "Content-Type: application/json" \
--data-binary "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"returnSecureToken\":true}")

access_token=$(jq -rc '.idToken' <<< $auth)
host="https://ahs-app.firebaseio.com"
curl -Z "$host/{locationIDs,locations,categories,snippets,week,schedules}.json?auth=$access_token" -o "/tmp/#1.json"

snippets=$(jq -sfr snippets.jq /tmp/locationIDs.json /tmp/locations.json /tmp/categories.json /tmp/snippets.json)
schedule=$(jq -sfr schedule.jq /tmp/week.json /tmp/schedules.json)

time=$(TZ=":America/Los_Angeles" date +"%l:%M %P Pacific Time")

cd ..

printf "${html}" "${css}" "${schedule}" "${snippets}" "${time}" "${js}" > dist/index.html
