'use strict'

const $main = document.querySelector('main')
const $canvas = document.createElement('canvas')
$canvas.ctx = $canvas.getContext('2d')

main()

async function main() {
	show_article()

	document.body
		.querySelectorAll('[href^="/"]')
		.forEach(link=>link.addEventListener('click', internal_link))
	
	document.body
		.querySelectorAll('.snippet>img')
		.forEach(match_color)
	
	window.addEventListener('popstate', show_article)
	window.addEventListener('resize', safe_center)

	highlight_schedule()

	$canvas.width = $canvas.height = 1
	$canvas.ctx.filter = 'saturate(500%)'

	if('serviceWorker' in navigator) navigator.serviceWorker.register('/worker.js')
}
async function reset_title() {
	document.title = 'ahs.app'
}
async function show_article() {

	const $article = clone_template('article')
	$main.replaceChild($article,$main.firstChild)
	window.scrollTo(0,0)

	$main.hidden = window.location.pathname==='/'
	if($main.hidden) return reset_title()

	const id = rot13(window.location.pathname.split('/').pop()) // Last portion of the path is the ciphered ID

	const article = await db('articles/'+id)
	if (!article) return reset_title()

	document.title = article.title
	$article.querySelector('h2').focus({ preventScroll: true })
	for (const property in article) {
		const element = $article.querySelector('.' + property)
		if (element) element.innerHTML = article[property]
	}
	
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
	/*
	const $related = $article.querySelector('.related')
	$related.append(
		...await Promise.all(( article.relatedArticleIDs || [] ).map( async id => {
			const snippet = await db('snippets',id)
			const $snippet = clone_template('snippet')

			$snippet.href = '/' + slug(snippet.title) + '/' + rot13(id)

			$snippet.querySelector('h4').innerHTML = snippet.title

			const $blurb = $snippet.querySelector('p')
			snippet.blurb ? $blurb.innerHTML = snippet.blurb : $blurb.remove()

			const $image = $snippet.querySelector('img')
			snippet.thumbURLs ? $image.src = snippet.thumbURLs[0] : $image.remove()
			return $snippet
		}))
	)
	*/
	return true
}
async function safe_center() {
	const $media = document.querySelector('main>.article>.media')
	$media.style.alignContent = $media.scrollWidth > window.innerWidth ? 'flex-start' : 'safe center'
}
async function db(...path) {
	const response = await fetch(`https://ahs-app.firebaseio.com/${path.join('/')}.json`)
	return await response.json()
}
async function highlight_schedule(Cell) {
	const Schedule = document.querySelector('.schedule')

	const class_name = 'highlighted-period'

	const date = new Date()
	const minutes = date.getHours()*60 + date.getMinutes()
	const seconds = minutes*60 + date.getSeconds()

	if(!Cell) Cell = Array.from(Schedule.querySelectorAll('td'))
			.reverse()
			.find(x=>parseInt(x.id)<=minutes)

	if(Cell) {
		Cell.classList.add(class_name)
		const Prev = Cell.previousElementSibling
		if(Prev) Prev.classList.remove(class_name)
	}

	const Next = Cell.nextElementSibling
	if(Next) setTimeout(
		highlight_schedule,
		(Next.id*60 - seconds)*1000,
		Next
	)
}
async function internal_link(event) {
	history.pushState({}, '', event.target.href)
	show_article()
	document.activeElement.blur()
	event.preventDefault()
}
async function match_color(image) {
	image.addEventListener('load', () => {
		$canvas.ctx.drawImage(image, 0, 0, 1, 1)
		const data = $canvas.ctx.getImageData(0, 0, 1, 1).data
		image.parentElement.style.setProperty('--color',`rgb(${data[0]}, ${data[1]}, ${data[2]})`)
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
