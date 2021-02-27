#!/bin/bash

function decode(){
	echo ${1} | base64 -i --decode | jq -rc '.'
}
function titlecase() {
	sed 's/.*/\L&/; s/[a-z]*/\u&/g' <<< "$1"    
}
function rot13() {    
	cat | tr "$(echo -n {A..Z} {a..z} | tr -d ' ')" "$(echo -n {N..Z} {A..M} {n..z} {a..m} | tr -d ' ')" 
}

. .env
auth=$(curl "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=$FIREBASE_API_KEY" \
-H "Content-Type: application/json" \
--data-binary "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"returnSecureToken\":true}")
access_token=$(echo $auth | jq -rc '.idToken')

url="https://ahs-app.firebaseio.com/snippets.json?auth=$access_token"
res=$(curl $url)
time=$(date +"%l:%M %P Pacific Time") # 1-12 hour, 0-59 min, short separator, am/pm
locations=$(echo $res | jq -c '.[]?')

echo \
"<!DOCTYPE html>
<html lang='en-US' dir='ltr'>
<head>
	<meta charset='utf-8'>

	<title>ahs.app</title>
	<meta name='description' content='We keep you up to date with Arcadia High.'>
	<meta name='author' content='Arcadia High Mobile Team'>
	<meta name='web-author' content='Xing Liu'>
	<meta name='viewport' content='width=device-width, initial-scale=1.0'>
	<meta name='color-scheme' content='light dark'>
	
	<link rel='icon' type='image/png' href='/icon.png'>
	<link rel='stylesheet' href='/style.css'>
</head>
<body>
	<h1><a href='/'> ahs.app </a></h1>
	<main hidden>
		<article class='article'>
			<h2 class='title heading' tabindex='0'>
				Loading article&hellip;
				<noscript> Please enable JavaScript in order to load the full article. </noscript>
			</h2>
			<section class='media carousel'></section>
			<section class='metadata'>
				<address class='author'></address>
				<time class='date'></time>
			</section>
			<section class='body'>
				<p> If it's taking too long, you may have been sent a broken link. </p>
			</section>
		</article>
		<footer>&vellip;</footer>
	</main>"

while IFS= read -r location; do

	title=$( jq -rc '.title' <<< $location )
	id=$( jq -rc '.id' <<< $location )
	categories=$(echo $location | jq -c '.categories[]?')

	echo \
"	<nav class='location' id='location-$id'>
		<h2> $title </h2>"

	while IFS= read -r category; do

		title=$( jq -rc '.title' <<< $category )
		id=$( jq -rc '.id' <<< $category )
		articles=$( jq -rc '.articles[]?' <<< $category )
		
		echo \
"		<section class='category' id='category-$id'>
			<h3> $title </h3>
			<div class='carousel'>"


		while IFS= read -r article; do

			title=$( echo $article | jq -rc '.title' )
			id=$( echo $article | jq -rc '.id' | rot13 )
			slug=$( echo $title | sed -r s/[^a-zA-Z0-9]+/-/g | sed -r s/^-+\|-+$//g | tr A-Z a-z )
			featured=$( echo $article | jq -rc '.featured' )
			thumb=$( echo $article | jq -rc '.thumbURLs[0]' )

			echo \
"				<a class='snippet' href='/$slug/$id' featured='$featured'>"

			if [ "$thumb" != 'null' ]; then
				echo \
"					<img class='image' src='$thumb' alt='' loading='lazy'>"
			fi

			echo \
"					<h4> $title </h4>
				</a>"

		done <<< "$articles"
		
		echo \
"			</div>
		</section>"

	done <<< "$categories"

	echo \
"	</nav>"

done <<< "$locations"

echo \
"		<footer><article>
		<strong>ahs.app</strong>
		<p>
			is a web app designed and programmed by <a href='https://x-ing.space'>Xing</a> of the AHS App Development Team.
		</p><p>
			Get our native app, Arcadia High Mobile, on
			<a href='https://apps.apple.com/us/app/id1305220468'>iOS</a>
			and
			<a href='https://play.google.com/store/apps/details?id=com.hsappdev.ahs'>Android</a>.
		</p><p>
			This website does not collect data from you and does not track you.
			View its source code on
			<a href='https://github.com/FlyOrBoom/ahs.app'>GitHub</a>.
		</p><p>			
			Want to submit an article? Email us at
			<a href='mailto:hsappdev@students.ausd.net'>HsAppDev@students.ausd.net</a>.
		</p><p>
			Articles fetched at <time>$time</time>.
		</p>
	</article></footer>
	<template class='template-youtube'>
		<iframe class='youtube'
			src='https://www.youtube-nocookie.com/embed/[URL]?modestbranding=1&rel=0'
			frameborder='0'
			allow='clipboard-write; encrypted-media; picture-in-picture'
			allowfullscreen
		></iframe>
	</template>
	<template class='template-image'>
		<img class='image'>
	</template>
	<script src='/script.js'></script>
</body>
</html>"
