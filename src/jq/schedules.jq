def n: join("");

.[0] as $scheduleIDs
| .[1] as $schedules
| $scheduleIDs | map( . as $id | $schedules[.] | "
	<section id=\($id) style=--color:\(.color) class=schedule>
		<h4><a href=#\($id)>\(.title)</a></h4>
		<table>
			<td data-timestamp=0></td>
			\( .timestamps 
			| . as $timestamps
			| ( .[-1] - .[0] ) as $span
			| to_entries | map( "
			<td data-timestamp=\(.value) width=\(
				( ($timestamps + [.value])[.key+1] - .value )
				/ $span * 100 * 100
				| floor / 100
			)%%>
				<time>\( .value*60 | strftime("%l:%M" ) )</time>
			</td>
			") |n )
		</table>
	</section>
") |n
