def n: join("");
def value_list: .value | map(.);
def current_value: value_list | last;
def previous_value: value_list | .[length-2];
def modified_value: 0.8 * current_value + 0.2 * previous_value;

.[0]
| (map(map(.)|max)|max) as $max_value
| (map(keys|map(tonumber)|max)|max) as $max_key
| (map(keys|map(tonumber)|min)|min) as $min_key
| ( $max_key - $min_key ) as $key_span
| (24*60*60) as $key_step
| ([range($key_span/$key_step+1)]) as $key_axis
| ([range($max_value+1)]) as $value_axis
| to_entries
| ( sort_by( modified_value )
	| map( select( modified_value > 0 ) )
	| ( ({ "others": { "0" : 0 } } | to_entries) + . )
) as $label_raw_axis
| ( $label_raw_axis | map ( "
	<tspan>
			\( current_value )
		</tspan><tspan class='label'>
			\( .key | split("-") | map( explode | map(.-32) | implode ) | join(" ") )
	</tspan>" )
) as $label_axis
| ( $key_axis | length -1 ) as $key_n
| ( $value_axis | length -1 ) as $value_n
| ( $label_axis | length -1 ) as $label_n
| "
	<text> \( $key_axis | to_entries | map ( "
		<tspan y='1075' x='\(1000*.key/$key_n-50)'>\($min_key + ( .value - 0.5 )*$key_step | strftime("%m/%d"))</tspan>
	") | n ) </text>
	<text y='\(-1000/$value_n)'> \( $value_axis | map ( "
		<tspan x='-50' dy='\(1000/$value_n)'>\(.)</tspan>
	") | reverse | n ) </text>
	<text y='\(-1000/$label_n)'> \( $label_axis | map ( "
		<tspan x='1200' dy='\(1000/$label_n)'>\(.)</tspan>
	") | reverse | n ) </text>
" + "
	<path class='label-connector' d='\(
		$label_raw_axis
		| to_entries
		| map( "M1030,
			\( ( 1 - (.value | modified_value ) / $max_value) * 1000 )
			L1180,
			\( ( 1 - .key / $label_n ) * 1000)
		" ) | n
	)'
/>" + ( map( .key as $location | .value | to_entries | "
		<path fill='url(#\($location | split("-") | last))' id='\($location)' d='M1000,1000H0\(
			map ( "L
				\( (.key | tonumber - $min_key ) / $key_span * 1000 ),
				\( ( 1 - .value/$max_value ) * 1000 )
			" ) |n
		)Z'/>
	" ) |n
)
