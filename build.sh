#!/bin/sh

export TZ=US/Pacific date

cd src

# merge scripts and styles into single files
cat src/css/* > dist/style.css
cat src/js/* > dist/script.js

# copy static assets
cp src/static/* dist/

# insert data into HTML
html=$(cat src/index.html)

curl -ZL "db.ahs.app/{locationIDs,locations,categories,snippets,weekID,weeks,schedules}.json" -o "/tmp/#1.json"

snippets=$(jq -sfr src/jq/snippets.jq /tmp/locationIDs.json /tmp/locations.json /tmp/categories.json /tmp/snippets.json)
schedule=$(jq -sfr src/jq/schedule.jq /tmp/weekID.json /tmp/weeks.json /tmp/schedules.json)

time=$(date +"%l:%M %P Pacific Time")

printf "$html" "$schedule" "$snippets" "$time"> dist/index.html

echo "
built site"
