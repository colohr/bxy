(async function(...x){const define = async (component, ...inputs)=>await (window.customElements.define('list-controller', await component(...inputs)), window.customElements.whenDefined('list-controller')); return typeof(window.customElements.get('list-controller'))==='undefined'?await (async ([component], asyncs, ...inputs)=>await define(component,...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise ? async ()=>await i:i).reduce((l,i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0],...x.slice(1, x.length)):true})
(async function ListControllerComponent(Controller){
	/**
	 * @class ListController
	 * @function data Creates the list controller in the shadow root of the element.
	 */

	//exports
    return class ListController extends HTMLElement{
        constructor(){
            super()
            this.attachShadow({mode:'open'}).innerHTML = `
				<style>:host{display: block;}</style>
				<style id="list-controller-styles">${Controller.Style.definitions}</style>
			`
        }
        data(data){
        	this.controller = new Controller(data)
			return this
		}
    }
    
}, async function load_assets(){ return await window.modules.import.class('ListController') })
