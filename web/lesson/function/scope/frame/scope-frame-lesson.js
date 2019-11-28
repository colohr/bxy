(async function(...x){const define = async (component, ...inputs)=>await (window.customElements.define('scope-frame-lesson', await component(...inputs)), window.customElements.whenDefined('scope-frame-lesson')); return typeof(window.customElements.get('scope-frame-lesson'))==='undefined'?await (async ([component], asyncs, ...inputs)=>await define(component,...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise ? async ()=>await i:i).reduce((l,i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0],...x.slice(1, x.length)):true})
(async function ScopeFrameLessonComponent(...x){
	const ScopeFrame = await window.modules.import.function('scope.frame')



	//scope actions


     //ScopeFrameLesson.source_code
    class ScopeFrameLesson extends HTMLElement{
        static get observedAttributes(){ return [] }
        constructor(){
            super()
            this.attachShadow({mode:'open'}).innerHTML = `
                <style>
                   
                    :host{
                        display: block;
                        position: relative;
                        width:50vw;
                        height:50vh;
                    }
                    iframe{
                    	border:none;
                    	width:100%;
                    	height:100%;
                    	position: relative;
                    }
                </style>
                
            `
        }
        attributeChangedCallback(name,old,value){}
        async connectedCallback(){
			this.frame = await ScopeFrame().attach(this,{
				source(){
					this.source.body.insert('<h1>Embedded Frame Source</h1>').start()
				},
				meta(meta){
					//delete meta.project.design
					meta.project.main.assets = []
					return meta
				}
			})
			this.frame.on('hello',(event)=>{
				console.log(event.detail)
				this.frame.send('color','--watermelon')
			})
			this.frame.evaluate(`(()=>{
			console.log('connect');
				web.send('hello', {from:'frame',date:new Date()});
				web.on('color', ()=>{
					document.body.style.background=\`var(\${event.detail})\`
				})
			})()`)
		}
    }

    //exports
    return ScopeFrameLesson

    //scope actions

	async function set_scope(source){
		source.body.insert('<h1>hello</h1>').start()
		return source
	}

	async function set_scope_frame(frame){
		await frame.pack(meta=>{
			delete meta.project.main
			return meta
		})

		return frame
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