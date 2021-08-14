#!/bin/sh

mkdir -p dist

# set time zone
export TZ="US/Pacific" 

# merge styles into single file
cat src/css/* > dist/style.css

# copy scripts
cp -RT src/js dist

# copy static assets
cp -RT src/static dist

# insert data into HTML
html=$(cat src/index.html)

snippets=$(jq -sfr src/jq/snippets.jq /tmp/locationIDs.json /tmp/locations.json /tmp/categories.json /tmp/snippets.json)
schedule=$(jq -sfr src/jq/schedule.jq /tmp/weekIDs.json /tmp/weeks.json /tmp/schedules.json)
calendar=$(jq -sfr src/jq/calendar.jq /tmp/weekIDs.json /tmp/weeks.json /tmp/schedules.json)
schedules=$(jq -sfr src/jq/schedules.jq /tmp/scheduleIDs.json /tmp/schedules.json)
covid=$(jq -sfr src/jq/covid-cases.jq /tmp/covid-cases.json)

time=$(date +"%l:%M %P Pacific Time")

printf "$html" "$schedule" "$snippets" "$calendar" "$schedules" "$covid" "$time" \
	| tr -d '\t' \
	| tr -s '\n' ' ' \
	> dist/index.html

echo "
built site"
