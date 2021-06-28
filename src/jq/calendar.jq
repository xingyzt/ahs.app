def n: join("");

.[0] as $weekIDs
| .[1] as $weeks
| .[2] as $schedules
| $weekIDs | to_entries
| map( $weeks[.value].scheduleIDs | to_entries | "
	<tr class=week>
	\( . | to_entries | map("
		<td class=day>\(.key)</td>
	") |n )
	</tr>
") |n
