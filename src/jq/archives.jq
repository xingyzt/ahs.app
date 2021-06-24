def n: join("");
def slug: gsub("[^\\w\\d]+";"-") | gsub("^-|-$";"");
def rot13: explode | map(
	if 65 <= . and . <= 90 then ((. - 52) % 26) + 65
	elif 97 <= . and . <= 122 then (. - 84) % 26 + 97
	else . end
) | implode;

.[0] as $snippets
| $snippets
| to_entries
| sort_by(.value.timestamp)
| map( .key as $id | .value | [
	( "<tr>" ),
	( "<td><a href=/"+(.title|slug)+"/"+($id|rot13)+"?archives>" ),
	( .title ),
	( "</a></td>" ),
	( "<td><time>" ),
	( .timestamp | strflocaltime("%Y-%m-%d") ),
	( "</time></td>" ),
	( "</tr>" )
] |n) |n
