(function define(...x){const _=this.modules?this.modules:module,__=(m,...a)=>_.define?_.define('function.data.model',{value:m(...a)}):_.exports=m(...a);return _.has&&_.has('function.data.model')?_.get('function.data.model'):(([m],y,...z)=>__(m,...(y.concat(z))))(x.splice(0,1),(x=x.map(i=>Array.isArray(i)?i.map(f=>f()):i).reduce((l,i)=>(Array.isArray(i)?l[0].push(...i):l.push(i),l),[[]]))[0],...x.slice(1, x.length));})
(function definition() {
	Symbol.model = Symbol('Model')

	class Model extends Object{
		assign(){ return (this.entries(Object.assign({}, this.object, ...arguments)).reduce(function reduce(object, entry){ return Object.assign(object, {[entry[0]]: entry[1]}) }, this.object || {}), this) }
		field(field){ return window.modules.is.text(field) ? field:null }
		get fields(){ return Object.keys(this.object).map(this.field, this) }
		get entries(){ return Object.entries(arguments[0] || this.object).map(this.entry, this) }
		entry(item){ return (item[0] = this.field(item[0]), item[1] = this.value(item[1]), item) }
		value(value){ return value }
		toString(){ return this.entries.join('') }
	}

	//exports
	const module_function = model_instance
	module_function.Model = Model
	return module_function

	//scope actions
	function model_instance(){
		return new Proxy(new Model.assign(...arguments), {deleteProperty: delete_value, get, has, set})

		//scope actions
		function delete_value(model, field){ return (delete model.object[model.field(field)], true) }

		function get(model, field){ return model.value(model.object[model.field(field)], field) || (is_model(model) ? model:null) }

		function has(model, field){ return model.fields.includes(field) }

		function set(model, field, value){ return (model.object[model.field(field)] = model.value(value, field), true) }
	}

	function is_model(value){ return window.modules.is.function(value) && value[Symbol.model] === true }

})
