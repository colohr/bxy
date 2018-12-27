(async function(...x){const define = async (component, ...inputs)=>await (window.customElements.define('event-emitter', await component(...inputs)), window.customElements.whenDefined('event-emitter')); return typeof(window.customElements.get('event-emitter'))==='undefined'?await (async ([component], asyncs, ...inputs)=>await define(component,...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise ? async ()=>await i:i).reduce((l,i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0],...x.slice(1, x.length)):true})
(async function EventEmitterComponent(){
    //exports
    return (await window.modules.import.mixin('Events'))(class EventEmitter extends HTMLElement{})
})