(function define(...x){const _=this.modules?this.modules:module,__=(m,...a)=>_.define?_.define('mix',{value:m(...a)}):_.exports=m(...a);return _.has&&_.has('mix')?_.get('mix'):(([m],y,...z)=>__(m,...(y.concat(z))))(x.splice(0,1),(x=x.map(i=>Array.isArray(i)?i.map(f=>f()):i).reduce((l,i)=>(Array.isArray(i)?l[0].push(...i):l.push(i),l),[[]]))[0],...x.slice(1, x.length));})
(function definition({is}) {
	const Mix = mix
	Mix.base = mixin_base
	Mix.class = mixin_class
	Mix.extension = mixin_extension
	Mix.in = mixin
	Mix.mixin = mixin
	Mix.type = mixin_prototype

	//exports
	return Mix

	//scope actions
	function constructable(...values){
		values = values.filter(is.class)
		return values.concat(Array.from(arguments).filter(constructors))
		//scope actions
		function constructors(value){ return values.includes(value) === false && is.constructable(value) }
	}

	function mix(...Mixins){ return (Base=mixed())=>mixin(Base, ...Mixins) }

	function mixed(){ return class Mixed{} }

	function mixin(Base, ...Mixins){ return mixin_prototype(mixin_base(Base, ...Mixins), ...Mixins) }

	function mixin_base(Base, ...Mixin){
		return mixin_extension(mixin_class(Base, ...Mixin), ...Mixin.filter(get_filter()))
		//scope actions
		function get_filter(constructors=constructable(...Mixin)){
			return function is_mixin(item){ return is.function(item) && constructors.includes(item) === false }
		}
	}

	function mixin_class(Base, ...Constructor){
		return mixin_prototype(Base, ...constructable(...Constructor).map(prototype))
		//scope actions
		function prototype(type){ return type.prototype }
	}

	function mixin_extension(Base, ...Extension){
		return Extension.filter(is.function).reduce(reduce, Base)
		//scope actions
		function reduce(...extend){ return extend[0] = extend[1](extend[0]) }
	}

	function mixin_prototype(Base, ...Prototype){
		return Prototype.filter(is.data).reduce(reduce, Base)
		//scope actions
		function reduce(...type){return type[0] = mixin_prototype_item(type[0],Object.create(type[1])) }
	}

	function mixin_prototype_item(Base, Prototype){
		for(const field in Prototype) define(field)
		return Base
		//scope actions
		function define(field){
			try{ Object.defineProperty(Base.prototype,field,{value:Prototype[field]}) }
			catch(error){
				try{ Base.prototype[field] = Prototype[field] }
				catch(error){ }
			}
		}
	}


},[
	function tools(){ return this.modules ? this.modules:require('fxy') }
])

