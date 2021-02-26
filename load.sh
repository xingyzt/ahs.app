#!/binbash
echo \
'<!DOCTYPE html>
<html lang="en-US" dir="ltr">
<head>
	<meta charset="utf-8">

	<title>ahs.app</title>
	<meta name="description" content="We keep you up to date with Arcadia High.">
	<meta name="author" content="Arcadia High Mobile Team">
	<meta name="web-author" content="Xing Liu">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta name="color-scheme" content="light dark">
	
	<link rel="icon" type="image/png" href="/icon.png">
	<link rel="stylesheet" href="/style.css">
</head>
<body>
	<h1><a href="/"> ahs.app </a></h1>
	<noscript> Please enable JavaScript in order to load articles. </noscript>
	<main hidden>
		<article class="article">
			<h2 class="title heading" tabindex="0"> Loading article&hellip; </h2>
			<section class="media carousel"></section>
			<section class="metadata">
				<address class="author"></address>
				<time class="date"></time>
			</section>
			<section class="body">
				<p> If it"s taking too long, you may have been sent a broken link. </>
			</section>
		</article>
		<footer>&vellip;</footer>
	</main>'

function decode(){
	echo ${1} | base64 -i --decode | jq -rc '.'
}
function titlecase() {
	sed 's/.*/\L&/; s/[a-z]*/\u&/g' <<< "$1"    
}
function rot13() {    
	cat | tr "$(echo -n {A..Z} {a..z} | tr -d ' ')" "$(echo -n {N..Z} {A..M} {n..z} {a..m} | tr -d ' ')" 
}

url='https://arcadia-high-mobile.firebaseio.com/snippets.json'

declare -A map

map[homepage]='Homepage'
	map[General_Info]='General Info'
	map[ASB]='ASB News'
	map[District]='District News'

map[bulletin]='Bulletin'
	map[Athletics]='Athletics'
	map[Academics]='Academics'
	map[Clubs]='Clubs'
	map[clubs]='Colleges'
	map[Reference]='Reference'

map[publication]='Bulletin'
	map[DCI]='DCI'
	map[KiA]='Keepin it Arcadia'
	map[APN]='Apache News'
	map[Quill]='Arcadia Quill'

map[other]='Other'
	map[Archive]='Archived Articles'


res=$(curl $url)
locations=$(echo $res | jq -r 'keys | .[]')

for location in $locations; do

	echo \
'	<nav id="location-'$location'">
		<h2>'${map[$location]}'</h2>'

	categories=$(echo $res | jq -r '.'$location' | keys | .[]')
	for category in $categories; do

		echo \
'<section id="category-'$category'">
			<h3>'${map[$category]}'</h3>
			<div class="carousel">'

		articles=$(echo $res | jq -c '.'$location.$category'[]')

		while IFS= read -r article; do

			id=$(echo $article | jq -rc '.id' | rot13)
			title=$(echo $article | jq -rc '.title')
			slug=$(echo $title | sed -r s/[^a-zA-Z0-9]+/-/g | sed -r s/^-+\|-+$//g | tr A-Z a-z)
			featured=$(echo $article | jq -rc '.featured')
			echo \
'				<a href="'$slug'/'$id'" featured="'$featured'" class="snippet">
					<h4> '$title' </h4>'
			thumb=$(echo $article | jq -rc '.thumbURLs[0]')
			if [ "$thumb" != 'null' ]; then
				echo \
'					<img src="'$thumb'" alt="" loading="lazy">'
			fi
			echo \
'				</a>'
		done <<< "$articles"
		echo \
'			</div>
		</section>'
	done
	echo \
'	</nav>'
done

echo \
'	<template class="template-youtube">
		<iframe class="youtube"
			src="https://www.youtube-nocookie.com/embed/$URL$?modestbranding=1&rel=0"
			frameborder="0"
			allow="clipboard-write; encrypted-media; picture-in-picture"
			allowfullscreen
		></iframe>
	</template>
	<template class="template-image">
		<img class="image">
	</template>
	<script src="/script.js"></script>
</body>
</html>'