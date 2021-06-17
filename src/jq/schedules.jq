def n: join("\n");
def e: join("");

.[0] as $schedules
| $schedules
| to_entries
| map( .key as $scheduleID | .value | [
	( "<section id="+$scheduleID+" class=schedule>" ),
	( "<h4><a href=#"+$scheduleID+">"+$scheduleID+"</a></h4>" ),
	( . as $schedule
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
] |n ) |n
