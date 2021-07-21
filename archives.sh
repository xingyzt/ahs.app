#!/bin/sh

mkdir -p dist

txt=$(cat src/archives.txt)

curl -ZL "https://archive-ahs-app.firebaseio.com/{snippets}.json" -o "/tmp/#1.json"

snippets=$(jq -sfr src/jq/archives.jq /tmp/snippets.json)

printf "$txt" "$snippets" > dist/archives.txt
