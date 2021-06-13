'use strict'

main()

async function main() {
	show_article()

	document.body
		.querySelectorAll('a[href^="/"]')
		.forEach(link=>link.addEventListener('click', internal_link))
	
	window.addEventListener('popstate', show_article)
	window.addEventListener('resize', safe_center)

	highlight_schedule()
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
	window.scrollTo(0,0)

	$main.hidden = location.pathname==='/'
	if($main.hidden) return reset_title()

	const id = rot13(location.pathname.split('/').pop())

	const article = await db('articles/'+id)
	if (!article) return reset_title()

	document.title = article.title
	$article.querySelector('h2').focus({ preventScroll: true })
	for (const property in article) {
		const element = $article.querySelector('.' + property)
		if (element) element.innerHTML = article[property]
	}
	// $article.style.setProperty('--color',article.color)
	
	const $media = $article.querySelector('.media')
	$media.style.alignContent = 'safe center'
	$media.append(
		...await Promise.all(( article.videoIDs || [] ).map( async id => {
			const $embed = clone_template('youtube')
			$embed.src = $embed.src.replace('[URL]',id)
			$embed.addEventListener('load',safe_center)
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
async function db(...path) {
	const response = await fetch(
		`https://ahs-app.firebaseio.com/${path.join('/')}.json`,
		{ headers: { 'Content-Type': 'application/json' } },
	)
	return await response.json()
}
async function highlight_schedule($cell) {
	const $schedule = document.querySelector('.schedule')
	if(!$schedule) return

	const class_name = 'highlighted-period'

	const date = new Date()
	const minutes = date.getHours()*60 + date.getMinutes()
	const seconds = minutes*60 + date.getSeconds()

	if(!$cell)
		$cell = Array.from($schedule.querySelectorAll('td'))
			.reverse()
			.find(x=>parseInt(x.id)<=minutes)

	if($cell) {
		$cell.classList.add(class_name)
		const Prev = $cell.previousElementSibling
		if(Prev) Prev.classList.remove(class_name)
	}

	const $next = $cell.nextElementSibling
	if($next) setTimeout(
		highlight_schedule,
		($next.id*60 - seconds)*1000,
		$next
	)
}
async function internal_link(event) {
	history.pushState({}, '', event.target.href)
	show_article()
	document.activeElement.blur()
	event.preventDefault()
}
async function generate_student_id() {
	const $form = document.getElementById('C-Student_ID')
	const $input = $form.querySelector('input')
	const $output = $form.querySelector('output')
	$input.addEventListener('input', () => {
		const digits = $input.value.replace(/\D/g,'')
		$output.textContent = digits ? code39(digits) : ''
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
	return [ 10, ...digits.split(''), 10 ]
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
	.replace(/0/g,'▁▇▇▇')
	.replace(/1/g,'▁▇')
	.replace(/ /g,'▁▁')
}
