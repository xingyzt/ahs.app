def n: join("");

.
| .[0] as $weekIDs
| .[1] as $weeks
| .[2] as $schedules
| ( now | strflocaltime("%Y") | tonumber ) as $now_Y
| ( now | strflocaltime("%m") | tonumber ) as $now_MoY
| ( now | strflocaltime("%V") | tonumber ) as $now_WoY
| ( now | strflocaltime("%j") | tonumber ) as $now_DoY
| ( now | strflocaltime("%d") | tonumber ) as $now_DoM
| ( now | strflocaltime("%u") | tonumber ) as $now_DoW
| ( $now_Y - ( if $now_MoY < 6 then 1 else 0 end ) ) as $start_Y
| ( [ $start_Y, 6, 1, 0, 0, 0, 0, 0 ] | mktime | strflocaltime("%w") | tonumber | 1 - . ) as $start_day 
| ( [ range($start_day;$start_day+49*7) ] | map([ $start_Y, 6, ., 0, 0, 0, 0, 0 ] | mktime ) ) as $day_timestamps
| $day_timestamps
| map( .
	| ( strflocaltime("%m") | tonumber ) as $MoY
	| ( strflocaltime("%V") | tonumber ) as $WoY
	| ( strflocaltime("%j") | tonumber ) as $DoY
	| ( strflocaltime("%d") | tonumber ) as $DoM
	| ( ( $DoM - 1 ) / 7 | floor) as $WoM
	| ( strflocaltime("%u") | tonumber ) as $DoW
	| ( strflocaltime("%b ’%y") ) as $MoY_name
	| $weeks[ $weekIDs[ $WoY - 1 ] ].scheduleIDs[ $DoW ]
	| . as $scheduleID
	| $schedules[.]
	| "
	<a
		\( if $DoY == $now_DoY then "id=current-day" else "" end)
		class='day
		\( if $MoY % 2 == 0 then "even-month" else "" end)
		\( if $DoM == 1 then "first-day" else "" end)'
		aria-label='\(.title)'
		style='--color:\(.color);--image:url(\(.iconURL))'
		\( if .timestamps then "href=#\($scheduleID)" else "" end )
	>
		\( $DoM )
	</a>
	\( if $DoW == 6 then "
	<label>
		\( if $WoM == 0 then $MoY_name else "" end )
	</label>
	" else "" end )
") |n
