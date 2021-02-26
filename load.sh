#!/binbash
decode(){
	echo ${1} | base64 -i --decode | jq -rc '.'
}
titlecase() {
    sed 's/.*/\L&/; s/[a-z]*/\u&/g' <<<"$1"    
}
rot13() {    
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

	echo '<nav id="location-'$location'">'
	echo '<h2>'${map[$location]}'</h2>'

	categories=$(echo $res | jq -r '.'$location' | keys | .[]')
	for category in $categories; do

		echo '<section id="category-'$category'">'
		echo '<h3>'${map[$category]}'</h3>'
		echo '<div class="carousel">'

		articles=$(echo $res | jq -rc '.'$location.$category'[0]')
		for article in "$articles"; do

			id=$(echo $article | jq -rc '.id' | rot13)
			title=$(echo $article | jq -rc '.title')
			slug=$(echo $title | iconv -t ascii//TRANSLIT | sed -r s/[^a-zA-Z0-9]+/-/g | sed -r s/^-+\|-+$//g | tr A-Z a-z)
			echo '<a href="'$slug'/'$id'">'
			echo '<title> '$title' </title>'
			thumb=$(echo $article | jq -rc '.thumbURLs[0]')
			if [ "$thumb" != 'null' ]; then
				echo '<img src="'$thumb'" alt="">'
			fi
			echo '</a>'
		done
		echo '</div></section>'
	done
	echo '</nav>'
done
