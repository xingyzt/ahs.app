def n: join("\n");

"<td id=0 hidden=true></td>"
+ .[0] as $schedule
| ( $schedule[-1] - $schedule[0] ) as $total
| $schedule | to_entries | map([
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

# (.*60|strftime("%l:%M"))