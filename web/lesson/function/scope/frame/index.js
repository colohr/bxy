(async (Export, ...x)=>await Export(...(await Promise.all(x.map(i=>typeof (i) === 'function' && i.constructor.name === 'AsyncFunction' ? i():i)))))
(async function Index(){
	//const gui = await window.modules.wait('modules.gui',true)

	return
	const frame = await embed(async function(source){
		source.body.insert('<h1>hello</h1>').start()
		return source
	}).then(async function(frame){
		await frame.pack(meta=>{
			delete meta.project.main
			return meta
		})

		return frame
	})


	const design = await (await frame.modules.import.class('Design')).load()
	await window.modules.wait(design,'colors')
	frame.style.border='2px dotted black'
	window.setInterval(on_interval, 1000)

	window.frame = frame
	//scope actions
	function on_interval(){
		window.requestAnimationFrame(update_header)
	}
	function update_header(){
		const header = frame.container.gui('h1')
		const characters = header.innerText.split('')
		header.innerHTML = ''
		for(const character of characters){
			const letter = character.link(`#${character}`)
			header.insert(letter).end()
		}
		for(const letter of header.all('a')){
			letter.style.color = design.colors.random()
		}
	}

})
