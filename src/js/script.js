'use strict'

let article = history.state || {}

const $article = document.getElementById('article')
const $media = document.getElementById('media')

main()

async function main() {
	show_article()

	document.body.querySelectorAll('a[href^="/"]')
		.forEach($link=>$link.addEventListener('click', internal_link_event))
	
	window.addEventListener('popstate', show_article)
	window.addEventListener('resize', safe_center)

	Array.from(document.getElementsByClassName('schedule'))
		.forEach($schedule=>highlight_schedule({$schedule}))

	generate_student_id()

	if('serviceWorker' in navigator)
		navigator.serviceWorker.register('/worker.js')
}
async function reset_title() {
	document.title = 'ahs.app'
}
async function write_article() {

	document.title = article.title

	for (const property in article) {
		const element = document.getElementById(property)
		if (element) element.innerHTML = article[property]
	}

	document.getElementById('article').style.setProperty('--color',article.color)
	
	$media.style.alignContent = 'safe center'

	while($media.firstChild) $media.firstChild.remove()
	$media.append(
		...await Promise.all(( article.videoIDs || [] ).map( async id => {
			const $embed = clone_template('youtube')
			const $checkbox = $embed.firstElementChild
			const $video = $embed.lastElementChild

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
			const $image = document.createElement('img')
			$image.src = url
			$image.addEventListener('load',safe_center)
			return $image
		}))),
	)
}
async function show_article() {
	if(location.hash === '') window.scrollTo(0,0)

	$article.hidden = location.pathname === '/'
	if($article.hidden) return reset_title()

	write_article(article)

	const id = rot13(location.pathname.split('/').pop())

	const query = location.search.split('?').pop()
	const domain = query.includes('archives') ? 'archive-' : ''

	article = await db(domain, 'articles', id)

	if (!article && domain) return reset_title()
	if (!article) return internal_link(location.href + '?archives', true)

	history.replaceState(article, '')
	document.getElementById('title').focus({ preventScroll: true })

	write_article(article)
	return true
}
async function safe_center() {
	const $media = document.getElementById('media')
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
		.find(x=>parseInt(x.dataset.timestamp)<=minutes)

	if(!$cell) return

	$cell.classList.add(class_name)

	const $prev = $cell.previousElementSibling
	if($prev) $prev.classList.remove(class_name) 

	const $next = $cell.nextElementSibling
	 if($next) setTimeout(
		highlight_schedule,
		( parseInt($next.dataset.timestamp)*60 - seconds ) * 1000,
		{ $cell: $next }
	 )
}
async function internal_link_event(event) {
	const $title = event.target.querySelector('h4')
	const $image = event.target.querySelector('img')
	const $blurb = event.target.querySelector('p')

	article = {
		title: $title ? $title.textContent : 'Loading article',
		imageURLs: $image ? [ $image.src ] : [],
		body: $blurb ? $blurb.textContent : '',
	}
	article.color = event.target.style.getPropertyValue('--color')

	internal_link(event.target.href, false)
	event.preventDefault()
}
async function internal_link(url, in_place) {
	history[in_place ? 'replaceState' : 'pushState'](article, '', url)
	show_article()
	document.activeElement.blur()
}
async function generate_student_id() {
	const $button = document.getElementById('card-button')
	const $barcode = document.getElementById('card-barcode-path')
	const $photo = document.getElementById('card-photo')
	const $given_name = document.getElementById('card-given-name')
	const $family_name = document.getElementById('card-family-name')
	const $time = document.getElementById('card-time')

	let signed_in = false
	
	setInterval(()=>{
		$time.textContent = new Date().toLocaleTimeString('en-GB')
	},1000)

	$button.addEventListener('click', async () => {
		if(signed_in) {

			$given_name.value = $family_name.value = ''
			$photo.src = '/icon.png'
			$barcode.setAttribute('d',code39(0))

		} else {

			const { email, given_name, family_name, picture } = JSON.parse(await google_sign_in())
			const email_match = email.match(/^(\d{5})@students\.ausd\.net$/)

			if(email_match === null) {

				$given_name.value = ':('
				$family_name.value = 'Cannot find ID'

			} else {
				
				$given_name.value = given_name || ''
				$family_name.value = family_name || ''

				const student_id = parseInt(email_match[1])
				$barcode.setAttribute('d',code39(student_id))

				if(picture) $photo.src = picture.replace(/=s\d+-c$/,'=s256-c')

			}
		}
		signed_in = !signed_in
	})
}
async function google_sign_in() {
	const endpoint = "https://accounts.google.com/o/oauth2/v2/auth?"
	const params = {
		scope: [ 'email', 'profile' ].map( x => "https://www.googleapis.com/auth/userinfo." + x ).join(' '),
		response_type: 'token',
		redirect_uri: 'https://ahs.app/sign-in-with-google.html',
		client_id: '654225823864-s4jptjh81bomn3dl99v7c04dpr8sqoqs.apps.googleusercontent.com',
		hd: 'students.ausd.net',
	}
	const url = endpoint + Object.entries(params)
	.map( ([key,value]) => key + '=' + encodeURIComponent(value) ).join('&')

	const storage_key = 'google-user-info'
	localStorage.removeItem(storage_key)
	window.open(url, '_blank')

	return new Promise(resolve => {
		const refresh = setInterval(() => {
			const user_info = localStorage.getItem(storage_key)
			if(user_info === null) return false
			clearInterval(refresh)
			localStorage.removeItem(storage_key)
			resolve(user_info)
		}, 100)
	})
}
async function google_sign_out(){
}
function clone_template(name) {
	return document.getElementById('template-' + name)
		.content.cloneNode(true)
		.firstElementChild
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
	const length = 5
	const size = 6
	// Represent each digit as a set of narrow bands,
	// wide bands, and spaces.
	//
	// Each of those occupies two digits in a binary
	// integer.
	//
	// 00 = 0: white space
	// 01 = 1: narrow band
	// 10 = 2: wide band
	const delimiter = 0b010001101001 // 01_00_01_10_10_01
	const code = [
		0b010100101001, // 01_01_00_10_10_01
		0b100100010110, // 10_01_00_01_01_10
		0b011000010110, // 01_10_00_01_01_10
		0b101000010101, // 10_10_00_01_01_01
		0b010100100110, // 01_01_00_10_01_10
		0b100100100101, // 10_01_00_10_01_01
		0b011000100101, // 01_10_00_10_01_01
		0b010100011010, // 01_01_00_01_10_10
		0b100100011001, // 10_01_00_01_10_01
		0b011000011001, // 01_10_00_01_10_01
	]
	const pattern = new Uint16Array(length+2)
	pattern[0] = pattern[length+1] = delimiter
	let path = ''
	for(let i = length; i > 0; i--){
	 pattern[i] = code[digits % 10]
	 digits = Math.floor(digits/10)
	}
	for(let i = 0; i < length + 2; i++){
	  const digit = pattern[i]
	  for(let j = size-1; j >= 0; j--){
		 const type = digit >> 2*j & 0b11
		 path += ['h4','h2V64h2V0','h2V64h5V0'][type]
	  }
	}
	path = path.substr(2)
	return 'M0,0' + path
}
