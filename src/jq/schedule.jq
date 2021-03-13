def n: join("");

.[1][
	.[0][
		now
		| strftime("%w")
		| tonumber
	]
] as $schedule
| if $schedule then 
( $schedule
| ( .[-1] - .[0] ) as $span
| to_entries
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
) else "" end
