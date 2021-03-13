def n: join("");

.[1][
	.[0][
		now
		| strflocaltime("%w")
		| tonumber
	]
] as $schedule
| ( $schedule[-1] - $schedule[0] ) as $span
| $schedule | to_entries
| [ "<td id=0></td>" ] + map([
	( "<td id=" ),
	( .value ),
	( " width=" ),
	( 
		( ($schedule + [.value])[.key+1] - .value )
		/ $span * 100 * 100
		| floor / 100
	),
	( "%>" ),
	( "<time>" ),
	( .value*60 | strftime("%l:%M" ) ),
	( "</time>" ),
	( "</td>" )
] | n ) |n
