(function define(...x){const _=this.modules?this.modules:module,__=(m,...a)=>_.define?_.define('function.shot',{value:m(...a)}):_.exports=m(...a);return _.has&&_.has('function.shot')?_.get('function.shot'):(([m],y,...z)=>__(m,...(y.concat(z))))(x.splice(0,1),(x=x.map(i=>Array.isArray(i)?i.map(f=>f()):i).reduce((l,i)=>(Array.isArray(i)?l[0].push(...i):l.push(i),l),[[]]))[0],...x.slice(1, x.length));})
(function definition(...x) {
	function shot(target){
			const skip = window.modules.is.object(target) === false && window.modules.is.function(target) === false
			const shooter = shot_call
			shooter.call = function shot_caller(){ return shot_call.apply(this,arguments) }
			return shooter
			//scope actions
			function get(){ return has(arguments[0])?dot.get(target, arguments[0]):null }
			function has(){ return skip?false:dot.has(target, arguments[0]) }
			function set(){ return skip?null:dot.set(target, ...arguments) }
			function shot_call(...inputs){
				const action = shot_action
				action.call = function shot_caller_call(){ return shot_action.apply(this, arguments).call(...inputs.splice(1)) }
				action.then = function shot_caller_then(){ return shot_action.apply(this, arguments).then(...inputs.splice(1)) }
				return action
				//scope actions
				function shot_action(...x){
					const trigger = x.filter(window.modules.is.function)[0] || null
					if(trigger) x.splice(x.indexOf(trigger), 1)
					return {
						arguments: inputs,
						call(){ return this.valid?trigger(this.value(), ...arguments):this },
						async then(...promise){ return this.valid ? await trigger.call(this,this.value(),...promise.slice(1)).then(promise[0]):null },
						has(){ return has(...this.arguments) },
						get shot(){ return action },
						set(){ return set(...this.arguments[0],arguments[0]) },
						get valid(){ return this.has()&&(x.length?this.value()===x[0]:true) },
						value(){ return get(...this.arguments) }
					}
				}
			}
		}

})
