'use strict'

const Main = document.querySelector('main')
const Canvas = document.createElement('canvas')
Canvas.ctx = Canvas.getContext('2d')

main()

async function main() {
	show_article()

	document.body
		.querySelectorAll('[href^="/"]')
		.forEach(link=>link.addEventListener('click', internal_link))
	
	document.body
		.querySelectorAll('.snippet>.image')
		.forEach(gradient_background)
	
	window.addEventListener('popstate', show_article)
	window.addEventListener('resize', safe_center)

	highlight_schedule()

	Canvas.width = Canvas.height = 1
	Canvas.ctx.filter = 'saturate(1000%)'
}
async function show_article() {

	const Article = clone_template('article')
	Main.replaceChild(Article,Main.firstChild)
	window.scrollTo(0,0)

	Main.hidden = window.location.pathname==='/'
	if(Main.hidden) return

	const id = rot13(window.location.pathname.split('/').pop()) // Last portion of the path is the ciphered ID

	const article = await db('articles/'+id)
	if (!article) return false

	document.title = article.title
	Article.querySelector('h2').focus({preventScroll:true})
	for (const property in article) {
		const element = Article.querySelector('.' + property)
		if (!element) continue
		element.innerHTML = article[property]
	}
	
	const Media = Article.querySelector('.media')
	const media_cache = []
	if(article.videoIDs) for (const id of article.videoIDs){
		const embed = clone_template('youtube')
		embed.src = embed.src.replace('[URL]',id)
		media_cache.push(embed)
		embed.addEventListener('load',safe_center)
	}
	if(article.imageURLs) for (const url of article.imageURLs){
		const image = clone_template('image')
		image.src = url
		media_cache.push(image)
		image.addEventListener('load',safe_center)
	}
	Media.style.alignContent = 'safe center'
	Media.replaceChildren(...media_cache)
}
async function safe_center(){
	Media.style.alignContent = Media.scrollWidth > window.innerWidth ? 'flex-start' : 'safe center'
}
async function db(...path) {
	const response = await fetch(`https://ahs-app.firebaseio.com/${path.join('/')}.json`)
	return await response.json()
}
async function highlight_schedule(Cell){
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
function internal_link(event){
	history.pushState({}, '', event.target.href)
	show_article()
	event.preventDefault()
}
async function gradient_background(image) {
	image.crossOrigin = 'Anonymous'
	image.addEventListener('load', () => {
		Canvas.ctx.drawImage(image, 0, 0, 1, 1)
		const data = Canvas.ctx.getImageData(0, 0, 1, 1).data
		let color = `rgba(${data[0]}, ${data[1]}, ${data[2]}, 0.2)`
		let gradients = `
			radial-gradient(circle at 100% 100%,${color},transparent),
			radial-gradient(circle at 0% 0%,transparent,var(--secondary))
		`
		image.parentNode.style.backgroundImage = gradients
	})
}
function clone_template(name) {
	return document.querySelector('.template-' + name)
		.content.cloneNode(true)
		.querySelector('*')
} 
function rot13(str){
	return str.replace( /[a-z]/gi, c =>
		'NOPQRSTUVWXYZABCDEFGHIJKLMnopqrstuvwxyzabcdefghijklm'[
			'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.indexOf(c)
		]
	)
}