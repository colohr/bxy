(async function define_module(export_module){ return await export_module() })
(async function export_module(){
	const Log = log_value
	Log.bug = log_bug
	Log.error = log_error
	Log.label = label

	//exports
	return 'log' in window ? Log:window.log = Log

	//shared actions
	function label(text, style = 'rgba(0,123,255,1)'){
		return [`%c${text}`, get_style()]

		//shared actions
		function get_style(){
			if(typeof style === 'string') return `color:${style}`
			else if(typeof style === 'object' && style !== null) return Object.keys(style).map(field=>`${field}:${style[field]};`).join(' ')
			return ''
		}
	}

	function log_bug(name, ...logs){
		console.group(...label(`Bug -> ${name}`, 'rgba(85,65,236,1)'))
		for(const item of logs){
			log_value(item)
			console.log(`%c-------------------`, 'color:#ddd')
		}
		console.groupEnd()
	}

	function log_error(log){
		console.group(...label(`Error -------------------- \n\t -> "${log.message}"`, 'rgba(255,115,0,1)'))
		console.error(log)
		console.groupEnd()
	}

	function log_table(value){
		if(console.table && value instanceof HTMLElement === false) {
			console.groupCollapsed(`%c•••••••••TABLE••••••••••`, 'color:rgba(89,73,81,1)')
			console.table(value)
			console.groupEnd()
		}
		else console.dir(value)
	}

	function log_value(value, ...labels){

		if(labels.length) console.log(label(...labels))
		if(value instanceof Error) log_error(value)
		else if(typeof value === 'object' && value !== null){
			if(value instanceof HTMLElement) console.log(value)
			else try{ console.log(`%c==============\n${JSON.stringify(value, null, 2)}\n==============`, 'color:seagreen') }
			catch(e){ }
			log_table(value)
		}
		else console.log(value)
	}

})