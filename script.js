'use strict'

const map = {
	articleTitle: 'title',
	articleImages: 'images',
	articleVideoIDs: 'videos',
	articleAuthor: 'author',
	articleBody: 'body',
	isFeatured: 'featured',
	articleUnixEpoch: 'timestamp',
	articleDate: 'date',
}

// DO NOT alter the position of existing paths in this array. Always append new paths at the end.
const categories = [ 
	'homepage/General_Info', 
	'homepage/ASB', 
	'homepage/District', 
	'bulletin/Academics', 
	'bulletin/Athletics', 
	'bulletin/Clubs', 
	'bulletin/Colleges', 
	'bulletin/Reference', 
	'publications/DCI',
	'publications/Quill',
	'other/Archive',
	'publications/KiA',
	'publications/APN',
]

const Main = document.querySelector('main')
const Media = Main.querySelector('.media')
const Title = document.querySelector('h1>a')
const Canvas = document.createElement('canvas')
Canvas.ctx = Canvas.getContext('2d')

main()

async function main() {
	show_article()
	load(true)
		.then(update_snippets)
		.then(load)
		.then(update_snippets)

	Title.addEventListener('click', internal_link)
	window.addEventListener('popstate', show_article)
	window.addEventListener('resize', safe_center)

	Canvas.width = Canvas.height = 1
	Canvas.ctx.filter = 'saturate(1000%)'
}
async function show_article() {
	Main.hidden = window.location.pathname==='/'
	if(Main.hidden) return
	window.scrollTo(0,0)
	const id = atob(window.location.pathname.split('/')[2])
	const article  = await db('articles/'+id)
	if (!article) return false
	Main.querySelector('h2').focus()
	for (const property in article) {
		const element = Main.querySelector('.' + property)
		if (!element) continue
		element.innerHTML = article[property]
	}
	
	const media_cache = []
	if(article.videoURLs) for (const id of article.videoURLs){
		const embed = clone_template('youtube')
		embed.src = embed.src.replace('$URL$',id)
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
async function load(local) {
	const snippets_cache = JSON.parse(localStorage.getItem('snippets'))
	if (local && snippets_cache)
		return snippets_cache

	const snippets = await db('snippets')
	localStorage.setItem('snippets', JSON.stringify(snippets))
	return snippets
}

async function db(...path) {
	const response = await fetch(`https://arcadia-high-mobile.firebaseio.com/${path.join('/')}.json`)
	return await response.json()
}

async function update_snippets(snippets) {
	for (const location in snippets)
		for(const category in snippets[location])
			Promise
				.all(snippets[location][category].map(make_snippet))
				.then(Snippets=>
					document?.getElementById('category-'+category)
						?.querySelector('.carousel')
						?.replaceChildren(...Snippets)
				)
}
async function make_snippet(snippet) {
	let Snippet = clone_template('snippet')
	Snippet.href = '/'+slugify(snippet.title)+'/'+btoa(snippet.id)
	Snippet.classList.toggle('featured', snippet.featured)
	const Image = Snippet.querySelector('.image')
	if (snippet.thumbURLs) {
		Image.src = snippet.thumbURLs[0]
		gradient_background(Snippet, Image)
	} else {
		Image.remove()
	}
	Snippet.querySelector('.title').textContent = snippet.title
	Snippet.addEventListener('click', internal_link)
	return Snippet
}
function internal_link(event){
	history.pushState({}, '', event.target.href)
	show_article()
	event.preventDefault()
}
async function gradient_background(element, image) {
	if(!['i.ibb.co','imgur.com'].includes(image.src.split('/')[2])) return false
	image.crossOrigin = 'Anonymous'
	image.addEventListener('load', () => {
		Canvas.ctx.drawImage(image, 0, 0, 1, 1)
		const data = Canvas.ctx.getImageData(0, 0, 1, 1).data
		let color = `rgba(${data[0]}, ${data[1]}, ${data[2]}, 0.2)`
		let gradients = `
			radial-gradient(circle at 100% 100%,${color},transparent),
			radial-gradient(circle at 0% 0%,transparent,var(--secondary))
		`
		element.style.backgroundImage = gradients
	})
}

function slugify(text) {
	return text.toString().toLowerCase()
		.replace(/\s+/g, '-') // Replace spaces with -
		.replace(/[^\w\-]+/g, '') // Remove all non-word chars
		.replace(/\-\-+/g, '-') // Replace multiple - with single -
		.replace(/^-+/, '') // Trim - from start of text
		.replace(/-+$/, ''); // Trim - from end of text
}

function clone_template(name) {
	return document.querySelector('.template-' + name)
		.content.cloneNode(true)
		.querySelector('*')
}
