def n: join("\n");
def slug: gsub("[^\\w\\d]+";"-");
def rot13: explode | map(
	if 65 <= . and . <= 90 then ((. - 52) % 26) + 65
        elif 97 <= . and . <= 122 then (. - 84) % 26 + 97
        else . end
) | implode;

.[0] as $locationIDs
| .[1] as $locations
| .[2] as $categories
| .[3] as $snippets
| $locationIDs | map( . as $id | $locations[.] | [
	( "<section id=L-"+$id+" class=location>" ),
	( "<h2><a href=#L-"+$id+">"+.title+"</a></h2>" ),
	( .categoryIDs | map( . as $id | $categories[.] | select( .visible ) | [
		( "<section id=C-"+$id+" class=category style=--color:"+.color+" layout="+.layout+">" ),
		( "<h3><a href=#C-"+$id+">"+.title+"</a></h3>" ),
		( "<section class=snippets>" ),
		( .articleIDs | .? | map( . as $id | $snippets[.] | [
			( "<a href=/"+(.title|slug)+"/"+($id|rot13)+" class=snippet>" ),
			( if .thumbURLs
				then "<img src="+.thumbURLs[0]+" class=image loading=lazy>"
				else empty end
			),
			( "<h4>"+.title+"</h4>" ),
			( if .blurb
				then "<p>"+.blurb+"</p>"
				else empty end
			),
			( "</a>" )
		] |n) |n),
		( "</section>" ),
		( "</section>" )
	] |n) |n),
	( "</section>" )
] |n) |n
