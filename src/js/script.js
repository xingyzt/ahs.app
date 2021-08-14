'use strict'

let article = window.history.state || {}

const $article = document.getElementById('article')
const $media = document.getElementById('media')

const LOADING = 'Loading article…'
const HIGHLIGHTED_PERIOD = 'highlighted-period'

main()

async function main() {
	show_article()

	document.body.querySelectorAll('a[href^="/"]')
		.forEach($link=>$link.addEventListener('click', internal_link_event))
	
	window.addEventListener('popstate', show_article)
	window.addEventListener('resize', safe_center)

	Array.from(document.getElementsByClassName('schedule'))
		.forEach($schedule=>highlight_schedule({$schedule}))
	
	//setInterval(tick_current_schedule,1000)

	scroll_calendar()

	generate_student_id()

	if('serviceWorker' in navigator)
		navigator.serviceWorker.register('/worker.js')
}
async function reset_title() {
	document.title = 'ahs.app'
}
async function scroll_calendar() {
	const $calendar = document.getElementById('calendar-days')
	const $current_day = document.getElementById('current-day')
	$calendar.scrollTo(0,floor($current_day.offsetTop,$calendar.offsetHeight))
}
async function write_article() {

	document.title = article.title || LOADING

	for (const property in article) {
		const element = document.getElementById(property)
		if (element) element.innerHTML = article[property]
	}

	document.getElementById('article').style.setProperty('--color',article.color)
	
	$media.style.alignContent = 'safe center'

	const media = await Promise.all(( article.videoIDs || [] ).map( async id => {
		const $embed = clone_template('youtube')
		const $checkbox = $embed.firstElementChild
		const $video = $embed.lastElementChild

		const load_video = () => $video.src = $video.dataset.src.replace('[URL]',id)
		const save_consent = () => window.localStorage.setItem('youtube-consent','true')
		$video.addEventListener('load',safe_center)
		$checkbox.addEventListener('change',load_video)
		$checkbox.addEventListener('change',save_consent)

		if(window.localStorage.getItem('youtube-consent')==='true') {
			$checkbox.checked = true
			load_video()
		}
		return $embed
	}).concat(( article.imageURLs || [] ).map( async url => {
		const $link = document.createElement('a')
		const $image = document.createElement('img')
		$link.href = $image.src = url
		$link.append($image)
		$image.addEventListener('load',safe_center)
		return $link
	})))
	while($media.firstChild) $media.firstChild.remove()
	$media.append(...media)
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

	window.history.replaceState(article, '')
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
async function tick_current_schedule(){
	const $schedule = document.getElementById('current-schedule')
	const $status = document.getElementById('current-schedule-status')
	const $cell = $schedule.getElementsByClassName(HIGHLIGHTED_PERIOD)[0]
	$status.textContent = $cell.title || ''
}
async function highlight_schedule({ $schedule, $cell }) {
	const seconds = new Date()
	.toLocaleTimeString( 'en-US', {
		timeZone: 'US/Pacific',
		hour12: false,
	}) // hours : minutes : seconds
	.split(':')
	.reduce( (sum, hand) => sum*60 + parseInt(hand) ) // let sum = 0, multiply sum by 60, add hand, repeat

	$cell = $cell || Array.from($schedule.querySelectorAll('td'))
		.reverse()
		.find( x => parseInt(x.dataset.timestamp)*60 <= seconds )

	if(!$cell) return

	$cell.classList.add(HIGHLIGHTED_PERIOD)

	const $prev = $cell.previousElementSibling
	if($prev) $prev.classList.remove(HIGHLIGHTED_PERIOD) 

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
		title: $title ? $title.textContent : LOADING,
		imageURLs: $image ? [ $image.src ] : [],
		body: $blurb ? `<p>${$blurb.textContent}</p>` : '',
	}
	article.color = event.target.style.getPropertyValue('--color')

	internal_link(event.target.href, false)
	event.preventDefault()
}
async function internal_link(url, in_place) {
	window.history[in_place ? 'replaceState' : 'pushState'](article, '', url)
	show_article()
	document.activeElement.blur()
}
async function generate_student_id() {
	const $button = document.getElementById('card-button')
	const $canvas = document.getElementById('card-canvas')
	const $shadow = $canvas.attachShadow({ mode: 'closed' })

	const svgNS = 'http://www.w3.org/2000/svg'

	const $barcode = document.createElementNS(svgNS, 'svg')
	$barcode.setAttribute('viewBox', '0 0 208 64')
	$barcode.setAttribute('width', '208')
	$barcode.setAttribute('height', '64')
	const $barcode_path = document.createElementNS(svgNS, 'path')
	$barcode.append($barcode_path)

	const $photo = document.createElement('img')

	const $text = document.createElement('section')
	const $given_name = document.createElement('p')
	const $family_name = document.createElement('p')
	$text.append($given_name,$family_name)

	const $time = document.createElement('time')

	const $$children = [ $barcode, $photo, $text, $time ]
	$shadow.append(...$$children)

	let signed_in = false

	$text.style.color = 'inherit'
	$text.style.fontFamily = 'inherit'
	$text.style.top = '3em'
	$text.style.left = '4em'

	$given_name.style.fontSize =
	$family_name.style.fontSize = '6em'

	$given_name.style.margin =
	$family_name.style.margin = '0'

	$time.style.fontSize = '4em'

	$time.style.bottom =
	$time.style.right = '1em'

	$time.style.whiteSpace = 'pre'
	$time.style.textAlign = 'right'

	$barcode.style.border =
	$photo.style.border = '2em solid white'

	$barcode.style.backgroundColor =
	$photo.style.backgroundColor = 'white'

	$barcode.style.width = '52em'

	$barcode.style.height = '16em'

	$barcode.style.borderRadius = '1em'

	$photo.style.top =
	$photo.style.right =
	$barcode.style.bottom =
	$barcode.style.left = '4em'

	$photo.style.width =
	$photo.style.height =
	$photo.style.borderRadius = '24em'

	$$children.forEach( $child => $child.style.position = 'absolute')
	
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
		window.localStorage.removeItem(storage_key)
		window.open(url, '_blank')

		return new Promise(resolve => {
			const refresh = window.setInterval(() => {
				const user_info = window.localStorage.getItem(storage_key)
				if(user_info === null) return false
				window.clearInterval(refresh)
				window.localStorage.removeItem(storage_key)
				resolve(user_info)
			}, 100)
		})
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

	async function draw(
		given_name = 'Digital ID card',
		family_name = 'Tap to sign in',
		photo_url = '/icon.png',
		student_id = 0,
	){
		$given_name.textContent = given_name
		$family_name.textContent = family_name
		$photo.src = photo_url
		$barcode_path.setAttribute('d',code39(student_id))
	}

	async function time(){
		$time.textContent = new Date().toLocaleString('en-US').replace(', ','\r\n')
	}

	draw()
	time()
	window.setInterval(time,1000)

	$button.addEventListener('click', async () => {

		signed_in = !signed_in

		if(!signed_in) return draw()

		const { email, given_name, family_name, picture } = JSON.parse(await google_sign_in())
		const email_match = email.match(/^(\d{5})@students\.ausd\.net$/)

		if(email_match === null) return draw(':(','Cannot find ID')

		let student_id = parseInt(email_match[1])
		let photo_url = picture ? picture.replace(/=s\d+-c$/,'=s256-c') : null

		return draw(given_name, family_name, photo_url, student_id)
	})
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
function floor(number, precision = 1) {
	return precision * Math.floor( number / precision )
}

