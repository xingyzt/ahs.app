def n: join("\n");
def s: join(" ");
def e: join("");

.[0] as $currentWeekID
| .[1] as $weeks
| .[2] as $schedules
| .[3] as $days
| ( now | strflocaltime("%w") | tonumber ) as $currentDayID
| $weeks
| to_entries
| map( .key as $weekID | [ 
	( [
		( "<section" ),
		( select( $weekID != $currentWeekID )
		| "hidden" ),
		( "class=week>" )
	] |s ),
	( "<h4>"+$weekID+"</h4>" ),
	( .value
	| to_entries
	| map( .key as $dayID | .value as $scheduleID | $schedules[.value] | [
		( [
			( "<section" ),
			( select( $weekID == $currentWeekID and $dayID != $currentDayID )
			| "hidden" ),
			( "class=schedule>" )
		] |s ),
		( "<h5>"+$days[$dayID]+": "+$scheduleID+"</h5>" ),
		( select(.)
		| . as $schedule
		| ( .[-1] - .[0] ) as $span
		| to_entries
		| [
			( "<table class=schedule><td id=0></td>" ),
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
