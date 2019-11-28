(function define(...x){const _=this.modules?this.modules:module,__=(m,...a)=>_.define?_.define('function.round',{value:m(...a)}):_.exports=m(...a);return _.has&&_.has('function.round')?_.get('function.round'):(([m],y,...z)=>__(m,...(y.concat(z))))(x.splice(0,1),(x=x.map(i=>Array.isArray(i)?i.map(f=>f()):i).reduce((l,i)=>(Array.isArray(i)?l[0].push(...i):l.push(i),l),[[]]))[0],...x.slice(1, x.length));})
(function definition() {
	//exports
	const round_function = round
	round_function.up = round_up
	round_function.down = round_down
	return round_function
	//scope actions
	function round(value, step){ return Math.round(value * (step=round_step(step))) / step }
	function round_down(value, step){ return Math.floor(value * (step=round_step(step))) / step }
	function round_step(step = 1.0){ return 1.0 / step }
	function round_up(value, step){ return Math.ceil(value * (step=round_step(step))) / step }
})
