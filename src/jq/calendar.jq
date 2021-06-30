def n: join("");

  .[0] as $weekIDs
| .[1] as $weeks
| .[2] as $schedules
| ( now | strftime("%Y") | tonumber ) as $now_year
| ( now | strftime("%m") | tonumber ) as $now_month
| ( $now_year - ( if $now_month < 6 then 1 else 0 end ) ) as $start_year
| ( [ $start_year, 6, 1, 0, 0, 0, 0, 0 ] | mktime | strftime("%w") | tonumber | 1 - . ) as $start_day 
| ( [ range($start_day;365) ] | map([ $start_year, 6, ., 0, 0, 0, 0, 0 ] | mktime ) ) as $day_timestamps
| $day_timestamps
| map(
	  ( strftime("%d") | tonumber ) as $day_of_month
	| ( strftime("%w") | tonumber ) as $day_of_week
	| ( strftime("%U") | tonumber ) as $week_of_year
	| $weeks[ $weekIDs[ $week_of_year ] ].scheduleIDs[ $day_of_week ]
	| . as $scheduleID
	| $schedules[.]
	| "
	\( if $day_of_week == 0 then "<tr>" else "" end )
		<td class=day title='\(.title)' style=--color:\(.color)>
			\(if .timestamps then "<a href=#\($scheduleID)>" else "" end)
			\( $day_of_month )
			\(if .timestamps then "</a>" else "" end)
		</td>
	\( if $day_of_week == 6 then "</tr>" else "" end )
") |n
