#!/bin/sh

export TZ=US/Pacific date

mkdir -p dist

# merge styles into single file
cat src/css/* > dist/style.css

# copy scripts
cp -R src/js/* dist/

# copy static assets
cp -R src/static/* dist/

# insert data into HTML
html=$(cat src/index.html)

curl -ZL "db.ahs.app/{locationIDs,locations,categories,snippets,weekID,weeks,schedules}.json" -o "/tmp/#1.json"

snippets=$(jq -sfr src/jq/snippets.jq /tmp/locationIDs.json /tmp/locations.json /tmp/categories.json /tmp/snippets.json)
schedule=$(jq -sfr src/jq/schedule.jq /tmp/weekID.json /tmp/weeks.json /tmp/schedules.json)
schedules=$(jq -sfr src/jq/schedules.jq /tmp/schedules.json)

time=$(date +"%l:%M %P Pacific Time")

printf "$html" "$schedule" "$snippets" "$schedules" "$time" > dist/index.html

echo "
built site"
