def n: join("");
def f: select(.key | startswith("current") );
def g: .value | to_entries | map(f | .value );

.[0]
| to_entries
| ( map(g|map( map(.) |max)|max)|max) as $max_value
| ( map(g|map( keys | map(tonumber) |max)|max)|max) as $max_key
| ( map(g|map( keys | map(tonumber) |min)|min)|min) as $min_key
| ( $max_key - $min_key ) as $key_span
| ([range($min_key+24*60*60;$max_key;$key_span/4)]) as $key_axis
| ([range(0;$max_value+1;$max_value/6 | ceil)]) as $value_axis
| "
	<text x='\(-1000/4)'> \( $key_axis | map ( "
		<tspan y='1100' dx='\(1000/4)'>\(. | strftime("%m/%d"))</tspan>
	") | n ) </text>
	<text y='\(-1000/6)'> \( $value_axis | map ( "
		<tspan x='-50' dy='\(1000/6)'>\(.)</tspan>
	") | reverse | n ) </text>
" + ( map( .key as $location | .value | to_entries
		| map( f | .key as $category | .value | to_entries | "
			<path class='\($category)' d='M\(
				map ( "
					\( (.key | tonumber - $min_key ) / $key_span * 1000 ),
					\( ( 1 - .value/$max_value ) * 1000 )
				" )
				| join("L")
			)'/>
			<text x='1050' y='\((1 - last.value/$max_value) * 1000)'>
				\(last.value)
				\($location | split("-") | join(" "))
				\($category | split("-") | last )
			</text>
		" )
	|n )
|n )
