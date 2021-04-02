def n: join("");

.[0][
	now
	| strflocaltime("%w")
	| tonumber
] as $key
| .[1][$key] as $schedule
| if $schedule then 
( $schedule
| ( .[-1] - .[0] ) as $span
| to_entries
| [ "<table class=schedule><td id=0></td>" ]
+ map([
	( "<td id=" ),
	( .value ),
	( " width=" ),
	( 
		( ($schedule + [.value])[.key+1] - .value )
		/ $span * 100 * 100
		| floor / 100
	),
	( "%%>" ),
	( "<time>" ),
	( .value*60 | strftime("%l:%M" ) ),
	( "</time>" ),
	( "</td>" )
] | n )
+ [ "</table>" ]
|n ) else "<p>"+$key+"</p>" end
