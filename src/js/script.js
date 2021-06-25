'use strict'

main()

async function main() {
	show_article()

	document.body
		.querySelectorAll('a[href^="/"]')
		.forEach($link=>$link.addEventListener('click', internal_link_event))
	
	window.addEventListener('popstate', show_article)
	window.addEventListener('resize', safe_center)

	document.body
		.querySelectorAll('.schedule')
		.forEach($schedule=>highlight_schedule({$schedule}))

	generate_student_id()

	if('serviceWorker' in navigator)
		navigator.serviceWorker.register('/worker.js')
}
async function reset_title() {
	document.title = 'ahs.app'
}
async function show_article() {
	const $main = document.body.querySelector('main')

	const $article = clone_template('article')
	$main.replaceChild($article,$main.firstChild)

	if(location.hash === '') window.scrollTo(0,0)

	$main.hidden = location.pathname === '/'
	if($main.hidden) return reset_title()

	const id = rot13(location.pathname.split('/').pop())

	const query = location.search.split('?').pop().split('&')
	const domain = query.includes('archives') ? 'archive-' : ''

	const article = await db(domain, 'articles', id)

	if (!article && domain) return reset_title()
	if (!article ) return internal_link(location.href + '?archives', true)

	document.title = article.title
	$article.querySelector('h2').focus({ preventScroll: true })
	for (const property in article) {
		const element = $article.querySelector('.' + property)
		if (element) element.innerHTML = article[property]
	}
	$article.style.setProperty('--color',article.color)
	
	const $media = $article.querySelector('.media')
	$media.style.alignContent = 'safe center'
	$media.append(
		...await Promise.all(( article.videoIDs || [] ).map( async id => {
			const $embed = clone_template('youtube')
			const $checkbox = $embed.querySelector('input')
			const $video = $embed.querySelector('iframe')

			const load_video = () => $video.src = $video.dataset.src.replace('[URL]',id)
			const save_consent = () => localStorage.setItem('youtube-consent','true')
			$video.addEventListener('load',safe_center)
			$checkbox.addEventListener('change',load_video)
			$checkbox.addEventListener('change',save_consent)

			if(localStorage.getItem('youtube-consent')==='true') {
				$checkbox.checked = true
				load_video()
			}
			return $embed
		}).concat(( article.imageURLs || [] ).map( async url => {
			const $image = clone_template('image')
			$image.src = url
			$image.addEventListener('load',safe_center)
			return $image
		}))),
	)
	return true
}
async function safe_center() {
	const $media = document.querySelector('main>.article>.media')
	$media.style.alignContent = $media.scrollWidth > window.innerWidth ? 'flex-start' : 'safe center'
}
async function db(domain, ...path) {
	const response = await fetch(
		`https://${domain}ahs-app.firebaseio.com/${path.join('/')}.json`,
		{ headers: { 'Content-Type': 'application/json' } },
	)
	return response.json()
}
async function highlight_schedule({ $schedule, $cell }) {
	const class_name = 'highlighted-period'

	const date = new Date()
	const minutes = date.getHours()*60 + date.getMinutes()
	const seconds = minutes*60 + date.getSeconds()

	if(!$cell) $cell = Array.from($schedule.querySelectorAll('td'))
		.reverse()
		.find(x=>parseInt(x.id)<=minutes)

	if(!$cell) return

	$cell.classList.add(class_name)

	const $prev = $cell.previousElementSibling
	if($prev) $prev.classList.remove(class_name) 

	const $next = $cell.nextElementSibling
	 if($next) setTimeout(
		 highlight_schedule,
	 	( $next.id*60 - seconds ) * 1000,
		{ $cell: $next }
	 )
}
async function internal_link_event(event) {
	internal_link(event.target.href, false)
	event.preventDefault()
}
async function internal_link(url, in_place) {
	history[in_place ? 'replaceState' : 'pushState']({}, '', url)
	show_article()
	document.activeElement.blur()
}
async function generate_student_id() {
	const $form = document.getElementById('id')
	const $input = $form.querySelector('input')
	const $output = $form.querySelector('output')
	$input.addEventListener('input', () => {
		const digits = $input.value.replace(/\D/g,'')
		$output.innerHTML = digits ? code39(digits) : ''
	})
}
function clone_template(name) {
	return document.querySelector('.template-' + name)
		.content.cloneNode(true)
		.querySelector('*')
} 
function rot13(str) {
	return str.replace( /[a-z]/gi, c =>
		'NOPQRSTUVWXYZABCDEFGHIJKLMnopqrstuvwxyzabcdefghijklm'[
			'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.indexOf(c)
		]
	)
}
function slug(title) {
	return title.replace(/[^\w\d]+/g,'-')
}
function code39(digits) {
	return `
	<svg viewBox="0 0 208 64">
	 <path d="M0 0 ${
	[ 10, ...digits.substr(0,5).padEnd(5,0).split(''), 10 ]
	.map(digit=>[
		'11 001', // 0..9
		'01 110',
		'10 110',
		'00 111',
		'11 010',
		'01 011',
		'10 011',
		'11 100',
		'01 101',
		'10 101',
		'1 1001', // *
	][digit])
	.join('')
	.replace(/ /g,'h4')
	.replace(/0/g,'h2V64h5V0')
	.replace(/1/g,'h2V64h2V0')
	.substr(2)
	} "/>
</svg>`
}
