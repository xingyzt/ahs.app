. .env

auth=$(curl "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=$FIREBASE_API_KEY" \
-H "Content-Type: application/json" \
--data-binary "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"returnSecureToken\":true}")

access_token=$(jq -rc '.idToken' <<< $auth)
host="https://ahs-app.firebaseio.com"

curl "$host/snippets.json?auth=$access_token" > /tmp/snippets.json
curl "$host/layout.json?auth=$access_token" > /tmp/layout.json

snippets=$(jq -sfr snippets.jq /tmp/layout.json /tmp/snippets.json)

time=$(TZ=":America/Los_Angeles" date +"%l:%M %P Pacific Time") # l: hour, M: min, P: am/pm

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
	<link rel='preconnect' href='https://ahs-app.firebaseio.com'>
</head>
<body>
	<h1><a href='/'> ahs.app </a></h1>
	<noscript> Please enable JavaScript in order to load full articles. </noscript>
	<main hidden>
	</main>
	$snippets
	<footer><article>
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
			<a href='mailto:hsappdev@students.ausd.net?subject=Article%20request%3A%20%28Write%20topic%20of%20article%20here%29&body=Title%3F%20%28Try%20to%20keep%20it%20below%208%20words%29.%0A%0AAuthor%3F%20%28Name%20of%20your%20writer%20or%20organization%29.%0A%0ABody%3F%20%28Any%20length.%20We%27ll%20handle%20the%20formatting%29%0A%0ANotification%3F%20%28Yes%20or%20no%29.%0A%0AAttach%20images%20below.'>
				HsAppDev@students.ausd.net
			</a>
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
	<template class='template-article'>
		<article class='article'>
			<h2 class='title heading' tabindex='0'>
				Loading article&hellip;
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
	</template>
</body>
</html>"
