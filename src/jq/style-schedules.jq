def n: join("");

.[0] | to_entries | map("
.schedule-\(.key) {
	--color: \(.value.color);
	--title: '\(.value.title)';
	--image: url(\(.value.iconURL));
}
") | n
