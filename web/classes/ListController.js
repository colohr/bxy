(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('ListController', {value:await module(...inputs)}); return window.modules.has('ListController')?window.modules.get('ListController'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(ListTools, ListStyle){
		const is = window.modules.is
		const prefix = 'list-controller'
		const is_mac = window.navigator.platform.toLowerCase().indexOf('mac') + 1
		const identity = (...x)=>`${(x.unshift(prefix), x.join('-'))}`
		const options = [
			'blocks_in_cluster',
			'callbacks',
			'keep_parity',
			'no_data_class',
			'no_data_text',
			'rows_in_block',
			'show_no_data_row',
			'tag'
		]



		const defaults = {
			blocks_in_cluster: 4,
			get callbacks(){ return {} },
			keep_parity: true,
			no_data_class: identity('no-data'),
			no_data_text: 'No data',
			rows_in_block: 50,
			show_no_data_row: true,
			tag: null
		}

		//exports
		return class ListController{
			static get Style(){ return ListStyle }
			constructor(data){
				const cache = {}
				let last_cluster = false
				let scroll_debounce = 0
				let pointer_events_set = false
				let resize_debounce = 0

				this.options = {}
				for(const option of options) this.options[option] = is.nothing(data[option]) ? defaults[option]:data[option]

				if(!data.scroll_element) data.container.appendChild(data.scroll_element = create_scroll())
				if(!data.content_element) data.scroll_element.appendChild(data.content_element = create_content())

				this.scroll_element = data.scroll_element
				this.content_element = data.content_element
				this.container = data.container

				if(!this.container.hasAttribute('list-scroll-container')) this.container.setAttribute('list-scroll-container', '')
				if(!this.scroll_element.hasAttribute('list-scroll')) this.content_element.setAttribute('list-scroll', '')
				if(!this.content_element.hasAttribute('list-scroll-content')) this.content_element.setAttribute('list-scroll-content', '')
				if(!this.content_element.hasAttribute('tabindex')) this.content_element.setAttribute('tabindex', 0)

				let rows = this.create.rows(this, data.rows)
				let scroll_top = this.scroll_element.scrollTop
				this.insert(rows, cache) // append initial data
				this.scroll_element.scrollTop = scroll_top // restore the scroll position
				this.container.addEventListener('click', on_click, false)
				this.scroll_element.addEventListener('scroll', on_scroll.bind(this), false)
				window.addEventListener('resize', on_resize.bind(this), false)

				this.append = append_rows
				this.destroy = destroy_list_controller
				this.get_scroll_progress = get_scroll_progress
				this.prepend = prepend_rows
				this.refresh = refresh_content
				this.update = update_content
				this.update_item = update_item

				//scope actions
				function add_row(where, ...x){
					x = is.array(x[0]) ? x[0]:x
					if(!x.length) return
					rows = where == 'append' ? rows.concat(x):x.concat(rows)
					return this.insert(rows, cache)
				}

				function append_rows(...x){ return add_row.call(this, 'append', ...x) }

				function destroy_list_controller(clean){
					delete this.selected_item
					this.scroll_element.removeEventListener('scroll', on_scroll.bind(this), false)
					window.removeEventListener('resize', on_resize.bind(this), false)
					return this.html((clean ? this.generate_empty_row():rows).join(''))
				}

				function get_scroll_progress(){ return this.options.scroll_top / (rows.length * this.options.item_height) * 100 || 0 }

				function on_resize(){
					window.clearTimeout(resize_debounce)
					resize_debounce = window.setTimeout(this.refresh, 100)
				}

				function on_scroll(){
					if(is_mac){
						if(!pointer_events_set) this.content_element.style.pointerEvents = 'none'
						pointer_events_set = true
						window.clearTimeout(scroll_debounce)
						scroll_debounce = window.setTimeout(()=>{
							this.content_element.style.pointerEvents = 'auto'
							pointer_events_set = false
						}, 50)
					}
					if(last_cluster !== (last_cluster = this.get_cluster_number())) this.insert(rows, cache)
					if(this.options.callbacks.scrolling_progress) this.options.callbacks.scrolling_progress(this.get_scroll_progress())
				}

				function prepend_rows(...x){ return add_row.call(this, 'prepend', ...x) }

				function refresh_content(force){
					delete this.selected_item
					if(this.get_height(rows) || force) return this.update(rows)
					return this
				}

				function update_content(...x){
					delete this.selected_item
					rows = this.create.rows(this, ...x)
					const scroll_top = this.scroll_element.scrollTop
					if(rows.length * this.options.item_height < scroll_top){
						this.scroll_element.scrollTop = 0
						last_cluster = 0
					}
					this.insert(rows, cache)
					this.scroll_element.scrollTop = scroll_top
					return this
				}

				function update_item(item){
					if(this.selected_item){
						this.selected_item.setAttribute('aria-pressed', false)
						rows[parseInt(this.selected_item.getAttribute('list-item'))] = this.selected_item.outerHTML
					}
					this.selected_item = item.cloneNode(true)
					rows[parseInt(item.getAttribute('list-item'))] = item.outerHTML
					return this
				}
			}

			check_changes(type, value, cache){
				const changed = value !== cache[type]
				return (cache[type] = value, changed)
			}

			clear(){ return this.update([]) }

			get create(){ return ListTools }

			explore_environment(rows, cache){
				const options = this.options
				options.content_tag = this.content_element.tagName.toLowerCase()
				if(!rows.length) return
				if(this.content_element.children.length <= 1) cache.data = this.html(rows[0] + rows[0] + rows[0])
				if(!options.tag) options.tag = this.content_element.children[0].tagName.toLowerCase()
				this.get_height(rows)
				return this
			}

			fetch_markup(rows = []){
				const rows_nodes = this.get_nodes(this.content_element)
				while(rows_nodes.length){ rows.push(rows_nodes.shift().outerHTML) }
				return rows
			}

			generate(rows, cluster_num){
				let opts = this.options
				let rows_len = rows.length
				if(rows_len < opts.rows_in_block){
					return {
						top_offset: 0,
						bottom_offset: 0,
						rows_above: 0,
						rows: rows_len ? rows:this.generate_empty_row()
					}
				}

				let items_start = Math.max((opts.rows_in_cluster - opts.rows_in_block) * cluster_num, 0)
				let items_end = items_start + opts.rows_in_cluster
				let top_offset = Math.max(items_start * opts.item_height, 0)
				let bottom_offset = Math.max((rows_len - items_end) * opts.item_height, 0)
				let this_cluster_rows = []
				let rows_above = items_start
				if(top_offset < 1) rows_above++
				for(let i = items_start; i < items_end; i++) {
					if(rows[i]) this_cluster_rows.push(rows[i])
				}

				//exports
				return {
					top_offset,
					bottom_offset,
					rows_above,
					rows: this_cluster_rows
				}
			}

			generate_empty_row(){
				const options = this.options
				if(!options.tag || !options.show_no_data_row) return []
				let empty_row = document.createElement(options.tag)
				let no_data_content = document.createTextNode(options.no_data_text)
				let td = undefined
				empty_row.className = options.no_data_class
				if(options.tag == 'tr'){
					td = document.createElement('td')
					td.colSpan = 100
					td.appendChild(no_data_content)
				}
				empty_row.appendChild(td || no_data_content)
				return [empty_row.outerHTML]
			}

			get_cluster_number(){
				this.options.scroll_top = this.scroll_element.scrollTop
				return Math.floor(this.options.scroll_top / (this.options.cluster_height - this.options.block_height)) || 0
			}

			get_height(rows){
				const options = this.options
				let item_height = options.item_height
				options.cluster_height = 0
				if(!rows.length) return

				let nodes = this.content_element.children
				if(!nodes.length) return

				let node = nodes[Math.floor(nodes.length / 2)]
				options.item_height = node.offsetHeight

				if(options.tag === 'tr' && get_style('borderCollapse', this.content_element) !== 'collapse'){
					options.item_height += parseInt(get_style('borderSpacing', this.content_element), 10) || 0
				}

				if(options.tag !== 'tr'){
					const margin_top = parseInt(get_style('marginTop', node), 10) || 0
					const margin_bottom = parseInt(get_style('marginBottom', node), 10) || 0
					options.item_height += Math.max(margin_top, margin_bottom)
				}

				options.block_height = options.item_height * options.rows_in_block
				options.rows_in_cluster = options.blocks_in_cluster * options.rows_in_block
				options.cluster_height = options.blocks_in_cluster * options.block_height
				return item_height !== options.item_height
			}

			get_item_attributes(item_data, create_dataset_attributes){ return is.function(this.container.get_item_attributes) ? this.container.get_item_attributes(item_data, create_dataset_attributes):[] }

			get_item_content(item_data){ return is.function(this.container.get_item_content) ? this.container.get_item_content(item_data):(item_data.label || item_data.name) }

			get_nodes(tag){
				const child_nodes = tag.children
				const nodes = []
				for(let i = 0, ii = child_nodes.length; i < ii; i++) nodes.push(child_nodes[i])
				return nodes
			}

			html(data){ return (this.content_element.innerHTML = data, this) }

			insert(rows, cache){
				if(!this.options.cluster_height) this.explore_environment(rows, cache)

				let data = this.generate(rows, this.get_cluster_number())
				let this_cluster_rows = data.rows.join('')
				let this_cluster_content_changed = this.check_changes('data', this_cluster_rows, cache)
				let top_offset_changed = this.check_changes('top', data.top_offset, cache)
				let only_bottom_offset_changed = this.check_changes('bottom', data.bottom_offset, cache)
				let callbacks = this.options.callbacks
				let layout = []

				if(this_cluster_content_changed || top_offset_changed){
					if(data.top_offset){
						if(this.options.keep_parity) layout.push(this.render_extra_tag('keep-parity'))
						layout.push(this.render_extra_tag('top-space', data.top_offset))
					}
					layout.push(this_cluster_rows)
					if(data.bottom_offset) layout.push(this.render_extra_tag('bottom-space', data.bottom_offset))
					if(callbacks.clusterWillChange) callbacks.clusterWillChange()
					this.html(layout.join(''))
					if(this.options.content_tag === 'ol') this.content_element.setAttribute('start', data.rows_above)
					this.content_element.style['counter-increment'] = identity('counter',`${data.rows_above - 1}`)
					if(callbacks.cluster_changed) callbacks.cluster_changed()
				}
				else if(only_bottom_offset_changed){
					this.content_element.lastChild.style.height = `${data.bottom_offset}px`
				}
				return this
			}

			press_item(item){
				const pressed = this.content_element.querySelector('[aria-pressed=true]')
				if(pressed) pressed.setAttribute('aria-pressed', false)
				item.setAttribute('aria-pressed', true)
				return this.update_item(item)
			}

			render_extra_tag(class_name, height){
				const options = {attributes: {class: [identity('extra-row'), identity(class_name)].join(' ')}}
				if(height) options.css = {height: `${height}px`}
				return window.modules.element.create(this.options.tag, options).outerHTML
			}
		}

		//scope actions
		function get_style(field, element){ return window.getComputedStyle(element)[field] }

		function create_content(){ return window.modules.element.create('div', {'list-scroll-content': ''}) }

		function create_scroll(){ return window.modules.element.create('div', {'list-scroll': ''}) }

		function on_click(event){
			const content_element = event.currentTarget
			let target_element = event.target
			if(content_element !== target_element){
				if(target_element.parentElement.hasAttribute('list-item')) target_element=target_element.parentElement
				if(target_element.hasAttribute('list-item')){
					event.preventDefault()
					event.stopPropagation()
					target_element.dispatchEvent(new CustomEvent('select', {bubbles: true, composed: true, detail: target_element}))
				}
			}
		}
},
async function ListTools(){
	const is = window.modules.is

	//exports
	return {
		data: create_data_list_html,
		item: item_templet,
		rows: ensure_html_items
	}

	//scope actions
	function create_data_list_html(controller, list=[], templet=item_templet){
		return list.map((data,index)=>templet(controller,data,index))
	}

	function dataset_attributes(dataset, extension={}, attributes=[]){
		for(const field in dataset) attributes.push(`data-${field}="${dataset[field]}"`)
		for(const field in extension) attributes.push(`data-${field}="${extension[field]}"`)
		return attributes
	}

	function ensure_html_items(controller, data = []){
		//exports
		return is.array(data) ? data.map(ensure_html_item).filter(item=>is.text(item)):[]

		//scope actions
		function ensure_html_item(item, index){
			if(is.data(item)){
				if(is.element(item)) item = item.outerHTML
				else item = item_templet(controller, item, index)
			}
			return item
		}
	}

	function item_templet(controller, data, index){
		return `<div ${item_attribute_templet(controller, data, index)}>${controller.get_item_content(data)}</div>`
	}

	function item_attribute_templet(controller, data, index){
		return [`list-item="${index}"`].concat(controller.get_item_attributes(data, dataset_attributes)).join(' ')
	}

}, async function ListStyle(){
	const css_id = 'list-controller-styles'
	const css_definitions= `
		[list-scroll] {
			max-height: 100%;
			overflow: hidden;
			overflow-y: scroll;
		}
		
		[list-scroll] > [list-scroll-content]{
			outline: 0;
			counter-reset: clusterize-counter;
		}
		
		[list-scroll] > [list-scroll-content] > * {
			display: block;
			position: relative;
			box-sizing: border-box;
		}
		
		[list-scroll] > [list-scroll-content] > [list-item]{
			cursor: pointer;
		}
		
		/**
		 * Avoid vertical margins for extra tags
		 * Necessary for correct calculations when rows have nonzero vertical margins
		 */
		.clusterize-extra-row {
			margin-top: 0 !important;
			margin-bottom: 0 !important;
		}
		
		/* By default extra tag .clusterize-keep-parity added to keep parity of rows.
		 * Useful when used :nth-child(even/odd)
		 */
		.clusterize-extra-row.clusterize-keep-parity {
			display: none;
		}
		
		
		
		/* Centering message that appears when no data provided
		 */
		.clusterize-no-data td {
			text-align: center;
		}
	`

	//exports
	return (ensure_stylesheet(),{
		definitions: css_definitions,
		element: create_element,
		ensure: ensure_stylesheet
	})

	//scope actions
	function create_element(){ return window.modules.element.create('style', {html: css_definitions, id: ''}) }
	function ensure_stylesheet(target_document=window.document.head){
		let element = target_document.querySelector(`style#${css_id}`)
		if(!element) {
			if(target_document.querySelector('style:last-of-type')) target_document.querySelector('style:last-of-type').insert(create_element()).after()
			else target_document.appendChild(create_element())
		}
		return target_document.querySelector(`style#${css_id}`)
	}

})

