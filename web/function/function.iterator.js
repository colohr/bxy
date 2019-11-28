(function define(...x){const _=this.modules?this.modules:module,__=(m,...a)=>_.define?_.define('iterator',{value:m(...a)}):_.exports=m(...a);return _.has&&_.has('iterator')?_.get('iterator'):(([m],y,...z)=>__(m,...(y.concat(z))))(x.splice(0,1),(x=x.map(i=>Array.isArray(i)?i.map(f=>f()):i).reduce((l,i)=>(Array.isArray(i)?l[0].push(...i):l.push(i),l),[[]]))[0],...x.slice(1, x.length));})
(function definition() {
	//exports
	iterator.entry = entry
	iterator.flip = flip
	iterator.inset = inset
	return iterator

	//scope actions
	function entry(){ return arguments[0] }
	function flip(method, bind){ return function flip_false_true(){ return method.apply(bind || this, arguments) === true ? false:true } }
	function inset(method, bind){ return function inset_apply(){ return method.apply(bind || this, arguments) } }
	function iterator(InstanceType){ return function instantiate(construction){ return new InstanceType(...window.modules.argument(construction)) } }
})
