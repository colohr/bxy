(function define(...x){const _=this.modules?this.modules:module,__=(m,...a)=>_.define?_.define('is',{value:m(...a)}):_.exports=m(...a);return _.has&&_.has('is')?_.get('is'):(([m],y,...z)=>__(m,...(y.concat(z))))(x.splice(0,1),(x=x.map(i=>Array.isArray(i)?i.map(f=>f()):i).reduce((l,i)=>(Array.isArray(i)?l[0].push(...i):l.push(i),l),[[]]))[0],...x.slice(1, x.length));})
(function definition() {
	if('Symbol' in this && 'proxy' in this.Symbol === false) Object.defineProperty(this.Symbol, 'proxy', {value: Symbol('Proxy reflection'), enumerable: false, configurable: false})

	const alphabet_regular_expression = /^[A-Za-z]+$/
	const number_regular_expression = /^[0-9]+$/
	const decimal_regular_expression = /^[-+]?[0-9]+\.[0-9]+$/
	const email_regular_expression = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/


	is_alphabetic.character = is_alphabetic_character
	is_date.class = is_date_class
	is_numeric.character = is_numeric_character
	is_numeric.decimal = is_numeric_decimal
	is_text.decimal = is_text_decimal
	is_text.lowercase = is_text_lowercase
	is_text.node = is_text_node
	is_text.number = is_text_number
	is_text.uppercase = is_text_uppercase


	//exports
	return set_dictionaries({
		alphabetic: is_alphabetic,
		action: is_action,
		array: is_array,
		async: is_async,
		callable: is_callable,
		class: is_class,
		constructable: is_constructable,
		character: is_character,
		count: is_count,
		data: is_data,
		date: is_date,
		decimal: is_decimal,
		defined: is_defined,
		document: is_document,
		element: is_element,
		element_data: is_element_data,
		email: is_email,
		empty: is_empty,
		event: is_event,
		error: is_error,
		function: is_function,
		instance: is_instance,
		iterator: is_iterator,
		json: is_json,
		map: is_map,
		node: is_node,
		get not(){ return inverse.call(this,()=>false) },
		nothing: is_nothing,
		numeric: is_numeric,
		number: is_number,
		object: is_object,
		promise: is_promise,
		prototype_identifier: is_prototype_identifier,
		proxy: is_proxy,
		regular_expression: is_regular_expression,
		slot: is_slot,
		slotted: is_slotted,
		set: is_set,
		symbol: is_symbol,
		text: is_text,
		TF: is_TF,
		valuable: is_valuable
	},...arguments)




	//scope actions
	function inverse(){
		return new Proxy(value=>arguments[0](value)===false,{
			get:(o,field)=>{
				if(is_function(arguments[0][field])) return inverse.call(this, arguments[0][field])
				return is_function(this[field]) ? inverse.call(this, this[field]):null
			},
			ownKeys:()=>Object.getOwnPropertyNames(arguments[0])
		})
	}
	function is_alphabetic(value){ return is_text(value) && alphabet_regular_expression.test(value) }
	function is_alphabetic_character(value){ return is_character(value) && alphabet_regular_expression.test(value) }

	function is_action(value){
		return is_function(value) && (is_async(value) || test_action() === true)
		//scope actions
		function test_action(){
			if(is_not(value, 'prototype') || is_not(value, 'constructor')) return false
			if(value.constructor.name !== 'Function') return false
			else try{ return (value(), true) }
			catch(e){ return false }
		}
	}
	function is_array(value){ return is_object(value) && Array.isArray(value) }
	function is_async(value){ return is_function(value) && value.constructor.name === 'AsyncFunction' }

	function is_callable(value){
		if(is_function(value)){
			try{ return (value(), true) }
			catch(e){ return false }
		}
		return false
	}
	function is_character(value){ return is_text(value) && value.length === 1 }
	function is_class(value){
		if(is_function(value) && is_async(value) === false){
			try{ return value.toString().indexOf('class ') === 0 }
			catch(error){}
		}
		return false
	}
	function is_constructable(value){ return is_function(value) && is_async(value) === false && is_not(value, 'prototype') === false && value.name.length > 0 }
	function is_count(value,count = 1){
		if(is_nothing(value)) return false
		if(is_text(value)) value = value.trim()
		if(is_text(value) || is_array(value)) return value.length >= count
		if(is_map(value) || is_set(value)) return value.size >= count
		if(is_object(value)) return Object.keys(value).length >= count
		return false
	}

	function is_data(value){ return is_object(value) && !is_array(value) && !is_error(value) }
	function is_date(value){ try{value=value instanceof Date === false ? new Date(value):value}catch(e){value=null} return value !== null && isNaN(value.getTime())===false }
	function is_date_class(value){ return is_data(value) && is_symbol(value)===false && Object.prototype.toString.call(value) === '[object Date]' }

	function is_decimal(value){
		value = is_number(value) ? value.toString():value
		return is_text(value) && decimal_regular_expression.test(value)
	}

	function is_defined(value){ return 'customElements' in window && !is_nothing(window.customElements.get(value)) }
	function is_document(value){ return is_object(value) && (value instanceof Document || value instanceof DocumentFragment) }

	function is_element(){ return is_object(arguments[0]) && (arguments.length > 1 ? is_element_type(...arguments):arguments[0].nodeType === 1) }
	function is_element_type(value,type){ return is_instance(value, is_function(type)?type:HTMLElement) }
	function is_element_data(value){ return is_object(value) || is_json(value) }
	function is_email(value){ return is_text(value) && email_regular_expression.test(value) }
	function is_empty(value){ return !is_count(value) }
	function is_event(value){ return value instanceof Event }
	function is_error(value){ return is_object(value) && value instanceof Error }

	function is_function(value){ return typeof value === 'function' }

	function is_has(value){ return is_object(value) || is_function(value) }

	function is_in(value,field){
		if(is_has(value)){
			try{ return Reflect.has(value,field) }
			catch(error){ return is_nothing(value, field) === false }
		}
		return false
	}
	function is_instance(value,type){ return is_object(value) && is_function(type) && value instanceof type }
	function is_iterator(value){ return is_array(value) || (is_text(value) === false && is_object(value) && Symbol.iterator in value) }

	function is_json(value){ return is_text(value) && /^[\],:{}\s]*$/.test(value.replace(/\\["\\\/bfnrtu]/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, '')) }

	function is_map(value){ return is_object(value) && value instanceof Map }

	function is_node(value){ return is_object(value) && value instanceof Node }
	function is_not(value, field){ return is_in(value,field) === false }
	function is_nothing(value){ return typeof value === 'undefined' || value === null || (typeof value === 'number' && isNaN(value)) }

	function is_numeric(value){ return is_text(value) && (number_regular_expression.test(value)) }
	function is_numeric_character(value){ return is_character(value) && number_regular_expression.test(value) }
	function is_numeric_decimal(value){ return is_text(value) && decimal_regular_expression.test(value) }

	function is_number(value){ return (typeof value === 'number' || is_object(value) && value instanceof Number) && !isNaN(value) && isFinite(value) }

	function is_object(value){ return typeof value === 'object' && value !== null }

	function is_promise(value){ return is_object(value) && value instanceof Promise }
	function is_prototype_identifier(value){ return is_text(value) && value.startsWith('[object') && value.endsWith(']') }
	function is_proxy(value){ return (is_object(value) || is_function(value)) && Symbol.proxy in value }

	function is_regular_expression(value){ return is_data(value) && Object.prototype.toString.call(value) === '[object RegExp]' }

	function is_set(value){ return is_object(value) && value instanceof Set }
	function is_slot(value){ return is_element(value) && value instanceof HTMLSlotElement }
	function is_slotted(value){ return is_node(value) && is_nothing(value.assignedSlot) === false }
	function is_symbol(value){ return typeof value === 'symbol'}

	function is_text(value){ return typeof value === 'string' || (is_object(value) && value instanceof String)}
	function is_text_decimal(value, decimal, places=0){
		if(is_text(value)){
			if((value = value.toString()).includes('.')){
				if((places = decimal_places()) > 0){
					if(is_number(decimal = parseFloat(value))){
						return decimal.toFixed(places) === value
					}
				}
			}
		}
		//scope action
		function decimal_places(){ return value.split('.').length === 2 ? value.split('.')[1].length:0 }
	}
	function is_text_lowercase(value){ return is_text(value) && value.toLowerCase() === value }
	function is_text_node(value){ return is_node(value) && value.nodeType === 3 }
	function is_text_number(value,  number){
		if(is_text(value)){
			if(is_number(number = parseInt(value = value.toString()))) return `${number}` === value
		}
		return false
	}
	function is_text_uppercase(value){ return is_text(value) && value.toUpperCase() === value }

	function is_TF(value){return typeof value === 'boolean' || is_instance(value,Boolean)}

	function is_valuable(){
		if(is_text(arguments[0])) return arguments[0].trim().length > 0
		return is_nothing(arguments[0]) === false && is_symbol(arguments[0]) === false && is_regular_expression(arguments[0]) === false && is_error(value) === false
	}

	function set_dictionaries(is){
		return (arguments[0].dictionary = Array.from(arguments).slice(1).reduce(reduce, {context, fixed, fragment, fragments, identifier, text, text_list}), arguments[0])
		//scope actions
		function context(){ return arguments[1](text(arguments[0])) }
		function fixed(...fixes){
			return function fix(){ return context(arguments[0], on_context) }
			//scope actions
			function on_context(){
				return {
					get exists(){ return this.typed===true },
					get prefix(){ return this.token = this.value !== null ? get_value(this, 'startsWith'):null },
					get prefixed(){ return this.prefix !== null },
					get prefixes(){ return this.tokens = this.value !== null ? get_value(this, 'startsWith', []):[] },
					get suffix(){ return this.token = this.value !==null ? get_value(this, 'endsWith'):null },
					get suffixed(){ return this.suffix !== null },
					get suffixes(){ return this.tokens = this.value !== null ? get_value(this, 'endsWith',true, []):[] },
					get type(){ return this.token = this.value !== null ? get_value(this, 'includes'):null },
					get typed(){ return this.type !== null },
					get types(){ return this.tokens = this.value !== null ? get_value(this, 'includes', []):[] },
					value: arguments[0]
				}
				//scope actions
				function get_value(content, position, tokens=null){
					content.fixed = content.fixed || content.value
					if(tokens) tokens = content.tokens || tokens
					for(const type of fixes){
						if(content.value[position](type)){
							const index = content.fixed.indexOf(type)
							content.fixed = `${content.fixed.slice(0,index)}${content.fixed.slice(index+type.length, content.fixed.length)}`
							if(tokens) tokens.push(type)
							else{
								tokens = type
								break
							}
						}
					}
					return tokens
				}
			}
		}
		function fragment(delimiter=','){
			const list = text_list(delimiter)
			return function get_fragments(){ return fragments(...list(...arguments)).join(delimiter) }
		}
		function fragments(){ return Array.from(arguments.length===1&&is_array(arguments[0])?arguments[0]:arguments).map(text).filter(is_valuable) }

		function identifier(){ return Object.prototype.toString(arguments[0]) }
		function reduce(dictionary, entry){ return (dictionary[entry.name]=entry(is,dictionary), dictionary) }
		function text(){
			let text = null
			try{
				if(is_nothing(arguments[0])===false){
					if(typeof arguments[0] === 'string') text = arguments[0]
					else if('toString' in arguments[0]) text = arguments[0].toString()
					if(is_prototype_identifier(text)) if(is_prototype_identifier(text = `${arguments[0]}`)) text = null
				}
				if(text !== null && (text = text.trim()).length === 0) text = null
			}
			catch(error){}
			return text
		}
		function text_list(delimiter=null){
			return function get_text_list(){ return Array.from(arguments).reduce(reduce_list,[]) }
			//scope actions
			function reduce_list(list,entry){
				if(is_text(delimiter)&&is_text(entry)) entry = entry.split(delimiter)
				if(is_array(entry) === false) entry = [entry]
				return list.concat(entry.filter(is.text))
			}
		}
	}

},
function content(is,dictionary){
	return get_extensions({
		alias: {
			es: 'application/ecmascript',
			form: 'multipart/form-data',
			svg: 'image/svg+xml',
			jpg: 'image/jpeg',
			js: 'application/javascript',
			stream: 'application/octet-stream',
			url: 'application/x-www-form-urlencoded',
			text: 'text/plain'
		},
		categories: {
			application: ['ecmascript', 'json', 'javascript', 'octet-stream', 'pdf', 'pkcs12', 'svg+xml', 'x-www-form-urlencoded', 'xml', 'vnd.mspowerpoint'],
			audio: ['midi', 'mpeg', 'ogg', 'webm', 'wave', 'wav', 'x-pn-wav', 'x-wav'],
			image: ['png', 'jpeg', 'gif', 'ico', 'webp'],
			multipart: ['form-data', 'byteranges'],
			video: ['mp4', 'webm', 'ogg']
		}
	},[['a','UNIX static library file.'],['asm','Non-UNIX assembler source file.'],['asp','Active Server Page.'],['awk','An awk script file.'],['bat','MS-DOS batch file.'],['bmp','Bitmap image file.'],['btm','4NT batch file.'],['BTM','4NT batch file.'],['c','C language file.'],['class','Compiled java source code file.'],['cmd','Compiler command file.'],['CPP','C++ language file.'],['csv','Comma-separated value file.'],['cur','Cursor image file.'],['cxx','C++ language file.'],['CXX','C++ language file.'],['db','Module interface and type descriptions database file (type library).'],['def','Win32 library definition file.'],['DES'],['dlg','Win32 dialog resource file.'],['dll','Win32 dynamic linked library.'],['don','Contains successful message following the execution of bmp.'],['dpc','Source dependency file containing list of dependencies.'],['dpj','Java source dependency file containing list of dependencies.'],['dtd','Document type definition file.'],['dump','Library symbols file.'],['dxp','Exports definition file.'],['eng'],['exe','Win32 executable file.'],['flt','Filter file.'],['fmt','Format file.'],['font','Font file.'],['fp','CDE Front Panel file.'],['ft'],['gif','Graphics Interchange Format file.'],['h','C header file.'],['H','C header file.'],['hdb','Obsolete, formerly used with hedabu tool.'],['hdl','Generated C header or header declaration file.'],['hid','Help ID file.'],['hpp','Generated C++ header or header plus plus file.'],['hrc','An .src include header file.'],['HRC','An .src include header file.'],['html','Hypertext markup language file.'],['hxx','C++ header file.'],['Hxx','C++ header file.'],['HXX','C++ header file.'],['ico','Icon file.'],['idl','Component interface description (Interface Definition Language).'],['IDL','Component interface description (Interface Definition Language).'],['ih'],['ilb','Intermediate StarOffice interface definition file.'],['inc','Include file.'],['inf','Installation file.'],['ini','Initialization file.'],['inl','Inline header file.'],['ins','Installation configuration file.'],['java','Java language file.'],['jar','Java classes archive file.'],['jnl','CVS journal file.'],['jpg','Bitmap graphics (Joint Photography Experts Group).'],['js','JavaScript code file.'],['jsp','Java Server Page file.'],['kdelnk','KDE1 configuration file.'],['l','Lex source code file.'],['lgt'],['lib','In UNIX systems, a list of objects. In Win32 systems, a collection of objects.'],['lin','Incremental linking file.'],['ll','Lex source code file.'],['LN3'],['lng','File containing string and message definitions for the setup program.'],['lnk','Linker response file.'],['lnx','Linux-specific makefile.'],['LOG','Log file.'],['lst','Project files to be delivered to solver. For example, as in d.lst.'],['lst','ASCII database file used in solenv.'],['mac','Macintosh-specific makefile. This is now obsolete.'],['MacOS'],['map','Library map file.'],['mk','A dmake makefile.'],['MK','A dmake makefile.'],['mod','BASIC module file.'],['NT2'],['o','UNIX object file.'],['obj','Win32 object file.'],['par','Script particles file.'],['pfa','Type 3 font file.'],['pfb','Type 1 font file.'],['pl','Perl script'],['PL','Perl script'],['plc','Former build script file, now obsolete.'],['pld','Former build script file, now obsolete.'],['PLD','Former build script file, now obsolete.'],['plf'],['pm','Perl module file.'],['pmk','Project makefiles.'],['pre','Preprocessor output from scpcomp.'],['PRJ'],['prt'],['PS','PostScript file.'],['ptr','Mouse pointer file.'],['r','Resource file for Macintosh.'],['rc','A dmake recursive makefile or a Win32 resource script file.'],['rdb','Interface and type description database (type library).'],['res','Resource file.'],['s','Assembler source file (UNIX).'],['S','Assembler source file (UNIX).'],['sbl','BASIC file.'],['scp','Script source file.'],['scr','Windows screen saver executable file.'],['sda','Draw application document.'],['sdb','Base application document.'],['sdc','Calc application document.'],['sdd','Impress application document.'],['sdg','Storage file for Gallery.'],['sdm','Mail message.'],['sds','Chart application document.'],['sdv','Gallery storage file.'],['sdw','Writer application document.'],['sdi','Interface definition file.'],['seg','Function ordering instructions for Microsoft linker.'],['SEG','Function ordering instructions for Microsoft linker.'],['Set'],['sgl','Writer master document file.'],['sh','Shell script.'],['sid','Slot id file.'],['smf','Math application formula document.'],['sms','Math application formula document template.'],['so','UNIX dynamic shared library'],['sob - .soh','These files contain information about color palettes and various style elements.'],['sob','Bitmap styles.'],['soc','Color palettes.'],['sod','Line styles.'],['soe','Arrow styles.'],['sog','Gradients.'],['soh','Hatches.'],['src','Source resource string file.'],['srs','Screen resource string file.'],['SSLeay'],['Static'],['tab'],['TFM','Tagged Font Metric file.'],['thm','Storage file for Gallery.'],['tpt'],['tsc'],['ttf','TrueType font file.'],['TTF','TrueType font file.'],['txt','Language text file.'],['TXT','Language text file.'],['unx','UNIX-specific makefile. This is now obsolete.'],['UNX','UNIX-specific makefile. This is now obsolete.'],['urd','From an IDL-generated relational database (Uno Reflection Data).'],['url','Uniform Resource Locator file.'],['VMS'],['vor','Writer document template.'],['W32','Partly native Windows makefile.'],['wav','Waveform audio file.'],['wmf','Win32 metafile vector graphics file.'],['xml','Extensible Markup Language file.'],['xpm','X11 pixel map graphics file.'],['xrb','XML format file to generate Java properties in language translation.'],['y','Yacc source code file.'],['yxx','Bison source code file.'],['zip','Zip file.']])
	//scope actions
	function get_extensions(content,entries){
		entries = new Set(entries.map(entry=>entry[0]))
		for(const type of ['csv','meta','yaml','css','md','txt','mjs','graphql','vue','swift','plist','htaccess','html','htm','zip','tar','geojson','shp','shx','dbf','keynote','pages','app']) entries.add(type)
		for(const type of Object.keys(content.alias)) entries.add(type)
		for(const types of Object.values(content.categories)) types.map(type=>type.split('-').concat(type.split('+'))).reduce((x, entry)=>x.concat(entry)).map(i=>entries.add(i))
		dictionary.extension = get_extension.bind(entries)
		return content
		//scope actions
		function get_extension(){
			return dictionary.context(arguments[0],on_context)
			//scope actions
			function on_context(){
				if(arguments[0] && arguments[0].includes('.')) {
					for(const type of entries) {
						if(arguments[0].endsWith(`.${type}`)) return type
					}
				}
				return null
			}
		}
	}
},
function locator(is, dictionary){
	const separator = ':'
	const variable = '//'
	const basic_protocol = ['http', 'ws', 'ftp','file']
	const secure_protocol = ['https', 'wss', 'sftp']
	const local = 'localhost'
	const search = '?'
	const hash = '#'
	const path = '/'
	const fixes = { protocol: dictionary.fixed(...secure_protocol.concat(basic_protocol).concat([separator,variable])) }

	//exports
	is.locator = is_locator
	is.locator.component = is_locator_component

	is.file = is_file_url
	is.folder = is_folder_url
	is.url = is_url
	is.url.notation = is_url_notation
	is.url.secure = is_secure
	is.url.text = is_url_text
	return { domain:get_domain, url:get_url }
	//scope actions
	function get_domain(){ return (arguments[0]=get_url(arguments[0]),arguments[0]?arguments[0].hostname:null) }
	function get_url(){
		if(is_url(arguments[0])===false) arguments[0]= dictionary.context(arguments[0], function on_context(){ return is_locator(arguments[0]) ? new URL(arguments[0]):null })
		if(arguments[0] && arguments[0].pathname.includes(path)){
			if(dictionary.extension(arguments[0].pathname) === null){
				if(arguments[0].pathname.endsWith(path) === false){
					arguments[0].pathname=`${arguments[0].pathname}/`
				}
			}
		}
		return arguments[0]
	}
	function is_file_url(){ return (arguments[0]=get_url(arguments[0]), arguments[0] && dictionary.extension(arguments[0].pathname) !== null) }
	function is_folder_url(){ return (arguments[0]=get_url(arguments[0]),arguments[0] && arguments[0].pathname.endsWith(path)) }
	function is_locator(){
		if(is_url(arguments[0])) return true
		arguments[0] = fixes.protocol(arguments[0])
		return arguments[0].types.length > 0 && arguments[0].fixed.length > 0
	}
	function is_locator_component(){
		return dictionary.context(arguments[0],function on_context(){
			if(arguments[0] && is_locator(arguments[0]) === false){
				if(dictionary.extension(arguments[0])) return true
				return arguments[0].includes(path)
			}
			return false
		})
	}
	function is_secure(){ return dictionary.context(arguments[0],function is_context(){ return arguments[0] && secure_protocol.filter(protocol=>arguments[0].indexOf(protocol)===0).length === 1  }) }
	function is_url(){ return arguments[0] instanceof URL }
	function is_url_notation(){ return dictionary.context(arguments[0], function on_context(){ return arguments[0] ? (is_url(window.modules.get(arguments[0])) || is_url(window.modules.get(`project.${arguments[0]}`))):false }) }
	function is_url_text(){ return is.text(arguments[0]) && is_locator(arguments[0]) }
})
