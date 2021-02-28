def n: join("\n");
def slug: gsub(" ";"-") | gsub("[^-\\w]";"");
def rot13: explode
	| map( if 65 <= . and . <= 90 then ((. - 52) % 26) + 65
        elif 97 <= . and . <= 122 then (. - 84) % 26 + 97
        else .
   end)
	| implode;

map([
	("<nav id=location-"+.id+" class=location>"),
	("<h2>"+.title+"</h2>"),
	(.categories | map([
		("<section id=category-"+.id+" class=category>"),
		("<h3>"+.title+"</h3>"),
		("<div class=carousel>"),
		( .articles | map([
			("<a href=/"+(.title|slug)+"/"+(.id|rot13)+" class=snippet>"),
			( if (.thumbURLs)
				then "<img src="+.thumbURLs[0]+" class=image>"
				else empty end
			),
			("<h4>"+.title+"</h4>"),
			("</a>")
		] |n) |n),
		("</div>"),
		("</section>")
	] |n) |n),
	("</nav>")
] |n) |n
