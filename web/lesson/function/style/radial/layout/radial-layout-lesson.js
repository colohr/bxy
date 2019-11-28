(async function(...x){const define = async (component, ...inputs)=>await (window.customElements.define('radial-layout-lesson', await component(...inputs)), window.customElements.whenDefined('radial-layout-lesson')); return typeof(window.customElements.get('radial-layout-lesson'))==='undefined'?await (async ([component], asyncs, ...inputs)=>await define(component,...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise ? async ()=>await i:i).reduce((l,i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0],...x.slice(1, x.length)):true})
(async function RadialLayoutLessonComponent(...x){

    const radial_layout = await window.modules.import.function('style.radial.layout')
	const colors = await window.modules.wait('modules.design.colors', true)

    class RadialLayoutLesson extends HTMLElement{
        static get observedAttributes(){ return [] }
        constructor(){
            super()
            this.attachShadow({mode:'open'}).innerHTML = `
                <style>
                    :host{
                        display: flex;
                        position: relative;
                        height: 600px;
                        width: 600px;
                        background: red;
                        align-items: center;
                        justify-content: center;
                    }
                    #container{
                    	display: block;
                        position: relative;
                        height: 400px;
                        width: 400px;
                        background: black;
                    }
                    #container > *{
                    	--center-rotation: calc(var(--radial-layout-angle, 0deg) * -1);
                    	display:flex;
                    	height: 52%;
                    	width: 27px;
                    	font-weight: bold;
                    	align-items: flex-start;
                    	justify-content: center;
                    	background: var(--color);
                    	border-radius: 5px;
                    }
                    #container > * > [content]{
                    	
                    	display:flex;
                    	width: 20px;
                    	font-weight: bold;
                    	align-items: center;
                    	justify-content: center;
                    	font-family: sans-serif;
                    	font-size: 12px;
                    	color:white;
                    	margin-top:5px;
                    	transform: rotate(var(--center-rotation, 0deg));
                    }
                </style>
                <div id="container"></div>
            `
        }
        attributeChangedCallback(name,old,value){}
        connectedCallback(){

        	for(let index=24;index>0;index--){
				const style = `--color:${colors.random()};`
				this.container.insert(`<div style="${style}">
					<div content>${24-index}</div>
				</div>`).end()
			}
			radial_layout(this.container)
			this.onclick = event=>{
        		this.xml.origin = !this.xml.origin
			}
		}
		get container(){ return this.gui.container }
		update(){
        	return radial_layout.update(this.container)
		}
    }

    //exports
    return RadialLayoutLesson

    //scope actions

})