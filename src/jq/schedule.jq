def e: join("");

.[0] as $weekIDs
| .[1] as $weeks
| $weekIDs[
	now
	| strflocaltime("%V")
	| tonumber - 1
] as $weekID
| $weeks[$weekID] as $week
| $week[
	now
	| strflocaltime("%w")
	| tonumber
] as $scheduleID
| .[2][$scheduleID] as $schedule
| if $schedule then 
( $schedule
| ( .[-1] - .[0] ) as $span
| to_entries
| [ "<table><td id=0></td>" ]
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
] |e )
+ [ "</table>" ]
|e ) else "<p>"+$scheduleID+"</p>" end
