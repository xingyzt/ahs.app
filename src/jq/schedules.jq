def n: join("\n");
def e: join("");

.[0] as $weeks
| .[1] as $schedules
| .[2] as $days
| $weeks
| to_entries
| map( .key as $weekID | [ 
	( "<section id="+$weekID+" class=week>" ),
	( "<h4><a href=#"+$weekID+">"+$weekID+"</a></h4>" ),
	( .value
	| to_entries
	| map( .key as $dayID
	| select($dayID != 0 and $dayID != 6)
	| .value as $scheduleID
	| $schedules[.value] | [
		( "<section class=schedule>" ),
		( "<h5>"+$days[$dayID]+": "+$scheduleID+"</h5>" ),
		( select(.)
		| . as $schedule
		| ( .[-1] - .[0] ) as $span
		| to_entries
		| [
			( "<table><td id=0></td>" ),
			( . | map( [
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
			] |e ) |e ),
		( "</table>" )
		] |e ),
		( "</section>" )
	] |n ) |n ),
	( "</section>" )
] |n ) |n
