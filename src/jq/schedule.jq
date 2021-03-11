def n: join(" ");

.[0][ now
	| strftime("%u") | inside("167")
	| if . then 0 else 1 end
] as $schedule
| ( $schedule[-1] - $schedule[0] ) as $total
| $schedule | to_entries
| ["<td id=0></td>"] + map([
	( "<td" ),
	( "id=" + ( .value | tostring ) ),
	( "width=" + ( 
		( ($schedule + [.value])[.key+1] - .value )
		/ $total * 10000
		| floor / 100
		| tostring + "%"
	) + ">" ), 
	( "<time>" ),
	( .value*60 | strftime("%l:%M" ) ),
	( "</time></td>" )
] |n ) |n
