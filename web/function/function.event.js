(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('event', {value:await module(...inputs)}); return window.modules.has('event')?window.modules.get('event'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(information){

	const event_function = get_event
	event_function.clear = event=>information.bubble(event).clear()
	event_function.create = create_custom_event
	event_function.bubble = information.bubble
	event_function.content = information.content
	event_function.entity = information.entity
	event_function.key = information.key
	event_function.meta = get_event_meta
	event_function.position = information.position
	event_function.prevent = event=>information.bubble(event).prevent()
	event_function.protocol = information.position
	event_function.stop = event=>information.bubble(event).stop()

	//exports
	return event_function

	//scope actions
	function create_custom_event(type, detail, bubbles=false, composed=false){ return new CustomEvent(type, {bubbles,composed,detail}) }

	function get_event(...event){
		if(window.modules.is.event(event[0])) return event[0]
		return create_custom_event(...event)
	}

	function get_event_meta(event, meta={}){
		if(window.modules.is.data(event)){
			for(const field in information){
				meta[field] = information[field](event)
			}
		}
		return meta
	}

}, async function event_information(){
	const positions = [ 'clientX', 'clientY', 'layerX', 'layerY', 'movementX', 'movementY', 'offsetX', 'offsetY', 'pageX', 'pageY', 'screenX', 'screenY', 'x', 'y']

	//exports
	return {
		/* bubble, bubbles, cancelBubble, cancelable, composed, defaultPrevented, eventPhase, isTrusted, preventDefault, returnValue, stopImmediatePropagation, stopPropagation, timeStamp */
		bubble:event=>({
			clear(){ return this.prevent() && this.stop() },
			immediate: ()=>('stopImmediatePropagation' in event ? event.stopImmediatePropagation():null, true),
			prevent:()=>('preventDefault' in event ? event.preventDefault():null,true),
			stop: ()=>('stopPropagation' in event ? event.stopPropagation():null, true)
		}),
		content:({detail,files,data})=>{
			if(files) return files
			if(data) return data
			return detail ? detail:null
			return data ? data:detail
		},
		entity: get_entity,
		key:({altKey, ctrlKey, code, key, keyCode, metaKey, shiftKey})=>({
			backspace: keyCode === 8,
			caps: keyCode === 20,
			character: key, //key -> d | D,
			code: keyCode, //keyCode | which | charCode
			command: metaKey === true,
			control: ctrlKey === true,
			enter: keyCode === 13,
			escape: keyCode === 27,
			field: window.modules.id.underscore(code), //code -> if d = KeyD
			option: altKey === true,
			meta: metaKey === true,
			shift: shiftKey === true,
			space: keyCode === 32,
			tab: keyCode === 9
		}),
		position:get_position,
		protocol:event=>({
			button: event.button,
			context: event.button === 2,
			constructor: event.constructor.name,
			keyboard: event.type.includes('key'),
			get pointer(){ return this.keyboard === false && this.button === 0 },
			type: event.type
		})
	}

	//scope actions
	function get_entity(event){
		/* entity
			* fromElement: null
			* path: (6) [coco-layers#colors, div#container, body, html, document, Window]
			* relatedTarget: null
			* sourceCapabilities: InputDeviceCapabilities {firesTouchEvents: false}
			* srcElement: coco-layers#colors
			* toElement: coco-layers#colors
		* */

		//exports
		return {
			active:()=>get_host().activeElement || window.document.activeElement,
			current: event.currentTarget,
			host:get_host,
			same: event.target === event.currentTarget,
			target: event.target
		}

		//scope actions
		function get_host(){
			if('path' in event === false) return window.document
			return event.path.filter(filter_document)[0]
			//scope actions
			function filter_document(element){ return element.constructor.name === 'ShadowRoot' || element.constructor.name === 'HTMLDocument' }
		}
	}

	function get_position(event, position={}){
		for(const name of positions){
			const value = name in event ? event[name]:null
			window.modules.set(position, window.modules.id.dot_notation(name), value)
		}
		return position
	}

})