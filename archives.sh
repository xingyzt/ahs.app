#!/bin/sh

mkdir -p dist

md=$(cat src/archives.md)

curl -ZL "https://archive-ahs-app.firebaseio.com/{snippets}.json" -o "/tmp/#1.json"

snippets=$(jq -sfr src/jq/archives.jq /tmp/snippets.json)

printf "$md" "$snippets" > dist/archives.md
