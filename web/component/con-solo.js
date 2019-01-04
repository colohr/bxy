(async function(...x){const define = async (component, ...inputs)=>await (window.customElements.define('con-solo', await component(...inputs)), window.customElements.whenDefined('con-solo')); return typeof(window.customElements.get('con-solo'))==='undefined'?await (async ([component], asyncs, ...inputs)=>await define(component,...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise ? async ()=>await i:i).reduce((l,i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0],...x.slice(1, x.length)):true})
(async function ConSoloComponent(Log){


    class ConSolo extends HTMLElement{
        constructor(){
            super()
            this.attachShadow({mode:'open'}).innerHTML = `
                <style>
                    :host{
                        display: block;
                        position: relative;
                        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF UI Display", "Helvetica Neue", "Helvetica", "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", sans-serif;
                        box-sizing: border-box;
                        width: 100%;
                    }
                    
                    article{
                    	display: flex;
                    	flex-direction: column;
                    	position: relative;
                    	width: 100%;
                    }
                    
                    article > *{
                    	display: flex;
                    	flex-direction: column;
                    	position: relative;
                    	width: 100%;
                    }
                    
                    article > #logs{ align-content: flex-start; }
                    
                    [details]{ 
                    	display: flex; 
                    	justify-content: space-between;
                    	position: sticky;
                    	width: calc(100% - 20px);
                    	font-size:12px; 
                    	padding:10px;
                    	min-height: 10px;
                    	background:white;
                    	z-index: 10;
                    	left:0;
						right:0;
						top:0;
					}
					[details] > *{display: block}
					
                    [item]{
                    	--border: dashed 1px var(--color, var(--azul));
                    	border: var(--border);
                    	box-sizing: border-box;
                    	border-radius: 7px;
                    	background: white;
                    	width: 100%;
                    }
                    [item] + [item]{ margin-top:30px; }
                    [item]:last-of-type{margin-bottom:20px;}
                    [bug]{ --color:var(--tangerine-bright); }
                    [error]{ --color:var(--apple-light); }
                    [log]{ --color:var(--platinum); }
                    [table]{ 
                    	--color:var(--indigo); 
                    	position:relative;
                    	overflow-x: auto;
					}
                    
                    [box]{
                    	display: flex;
                    	flex-direction: column;
                    	width: 100%;
                    }
                    
                    tr{ border-top:1px solid var(--platinum-light);  }
                    th{ font-size:12px; background: var(--platinum-light); padding:5px; }
                    td{ vertical-align: top; }
                    
                    
                    [details]{
                    	border-bottom:var(--border);
                    }
                    [number] > em{
                    	display: inline-block;
                    	padding:2px 7px 2px 7px;
                    	position: relative;
                    	border-radius: 100px;
                    	font-family: sans-serif !important;
                    }
                    
                    
                    pre{
                    	position: relative;
                    	display: inline-block;
                    	padding:10px;
                    	margin:10px;
                    	border-radius: 7px;
                    	color: var(--azul);
                    	font-family: 'SF Mono', 'Operator Mono', 'Source Sans Pro', Menlo, Monaco, Consolas, Courier New, monospace;
                    	max-width: calc(100% - 40px);
                    	overflow: auto;
                    	max-height: 300px;
                    	background: transparent;
                    	background: ghostwhite;
                    }
                    
                    
                    [number] > em::before{
                    	content:'';
                    	top:0;left:0;right:0;bottom:0;
                    	display: block;
                    	position: absolute;
                    	overflow: hidden;
                    	background: var(--platinum-light);
                    	opacity: 0.7;
                    	border-radius: inherit;
                    	z-index: -1;
                    }
                    
                </style>
                <article id="container">
                	<header><slot name="header"></slot></header>
                	<div id="logs"></div>
                	<footer id="footer"><slot name="footer"></slot></footer>
				</article>
            `
        }
		bug(...bugs){ return Log(this, 'bug', ...bugs) }
		connectedCallback(){ this.id = 'solo' }
		error(...errors){ return Log(this, 'error', ...errors) }
		get container(){ return this.gui.container }
		log(...logs){  return Log(this, 'log', ...logs) }
		get logs(){ return this.gui.logs }
		table(data){ return Log(this, 'table', data) }
    }

    //exports
    return ConSolo

}, async function Log(){
	const {is} = window.modules
	const Container = {
		bug: ()=>[ 'div', {item:'',bug: ''} ],
		error: ()=>['div', {item:'',error: '' }],
		log: ()=>['div', { item:'', log: ''}],
		table: ()=>['div', {item:'',table:''}]
	}

	//exports
	return create

	//scope actions
	function create(solo, type, ...values){
		const log = solo.logs.children.length+1
		const count = values.length
		const container = window.modules.element.create(...Container[type]())
		for(let index=0;index<count;index++){
			if(type in console) console[type](values[index])
			else console.log(values[index])
			const number = create_number(log, count, index)
			const content = type === 'table' ? create_table(values[index], number):create_box(values[index], number)
			container.insert(content).end()
		}
		solo.logs.insert(container).end()
		container.label = function(text){ return (this.all('[label]').forEach(label=>label.innerHTML=text),this) }
		return container
	}


	function create_box(value, number='<div number></div>'){
		return `<div box>
			${create_details(number)}
			<div value>${create_value(value)}</div>
		</div>`
	}

	function create_code(value){
		let html = ''
		if(is.data(value) || is.array(value)) html = JSON.stringify(value,null,2)
		else if(is.function(value)) html = value.toString().trim()
		else html = value
		return `<pre><code>${html}</code></pre>`
	}

	function create_details(number){
		return `<div details>${number}<div space label></div><date>${new Date().toLocaleTimeString()}</date></div>`
	}

	function create_number(log, count, index = null){
		index = count > 1 ? ` <em>${index + 1} of ${count}</em>`:''
		return `<div number><strong>${log}</strong>${index}</div>`
	}

	function create_table(data, number = '<div number></div>'){
		return `${create_details(number)}<table>
				${create_table_header(data)}
				${create_table_body(data)}
			</table>`
	}

	function create_table_body(data){
		data = is.array(data) ? data:[data]
		const rows = []
		for(const row of data){
			const cells = []
			for(const entry of Object.entries(row)){
				cells.push(`<td>${create_value(entry[1])}</td>`)
			}
			rows.push(create_table_row(cells.join('')))
		}
		return `<tbody>${rows.join('')}</tbody>`

	}

	function create_table_header(data){
		data = is.array(data) ? data[0]:data
		data = create_table_row(cells(data))
		return `<thead>${data}</thead>`

		//scope actions
		function cells(row){ return Object.keys(row).map(field=>`<th>${field}</th>`).join('') }
	}

	function create_table_row(cells){ return `<tr>${cells}</tr>`}

	function create_value(value){ return is.object(value) || is.function(value) ? create_code(value):value }


})
