def n: join("");

.[0] as $weekIDs
| .[1] as $weeks
| .[2] as $schedules
| $weekIDs | to_entries
| map( .key as $weekN | $weeks[.value] | "
	<tr class=week>
	\( .scheduleIDs | to_entries | map( .key as $dayN | .value as $weekID | $schedules[.value] | "
		<td class=day title='\(.title)' style=--color:\(.color)>
			\(if .timestamps then "<a href=#\($weekID)>" else "" end)
			\([
				2021, 0,
				$weekN*7 + $dayN- ( [ 2021, 0, 3, 0, 0, 0, 0, 0] | mktime | strftime("%u") | tonumber - 3 ),
				0, 0, 0, 0, 0
			] | mktime | strftime("%e"))
			\(if .timestamps then "</a>" else "" end)
		</td>
	") |n )
	</tr>
") |n
