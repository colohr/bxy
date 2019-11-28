import * as Data from '../Data';
import ProtocolPrototype from './ProtocolPrototype';
import FieldProtocol from './FieldProtocol';
import {
	componentProperty,
	fieldOptions,
	fieldOptionsDefaultProps,
	fieldOptionsPropTypes,
	formFieldActiveValueStateProperty,
	formFieldOptionsProperty,
	formFieldOptionsMultipleProperty,
	formFieldOptionsValueAtProperty,
	formFieldOptionsValueIndexProperty,
	formFieldOptionsValueMultipleProperty,
	formFieldValueProperty,
	formMount,
	formUnmount,
	isMultiple,
	valueAt,
	valueIndex,
	valueMultiple

} from '../Controller';
import {mountState, unmountState} from './MountProtocol';


//Handles state changes of nested component belonging to a form controller
//and assigns the computed value to the combined form data as changes occur
//for field inputs that return a value selected from a predefined list of options
export default function FieldOptionsProtocol(Interface = ProtocolPrototype){
	if(Data.has(Interface, 'prototype')){
		if(Interface.prototype.componentDidMount) {
			Interface.prototype[formMount] = Interface.prototype.componentDidMount
			delete Interface.prototype.componentDidMount
		}
		if(Interface.prototype.componentWillUnmount) {
			Interface.prototype[formUnmount] = Interface.prototype.componentWillUnmount
			delete Interface.prototype.componentWillUnmount
		}
	}
	Interface = FieldProtocol(Interface)
	Interface.defaultProps = {...fieldOptionsDefaultProps, ...Interface.defaultProps}
	Interface.propTypes = {...fieldOptionsPropTypes, ...Interface.propTypes}
	if(Interface.defaultProps[formFieldOptionsMultipleProperty]){
		Data.set(Interface, `prototype.state.${formFieldActiveValueStateProperty}`, [])
	}
	const fieldOptionsState = {...Interface.prototype.state}
	if(Interface.defaultProps[formFieldOptionsMultipleProperty]){
		fieldOptionsState[formFieldActiveValueStateProperty]=[]
	}

	return class extends Interface{
		componentDidMount = onFormFieldOptionsMount
		componentWillUnmount = onFormFieldOptionsUnmount
		get [formFieldOptionsMultipleProperty](){ return isMultiple(this) }
		get [formFieldOptionsProperty](){ return fieldOptions(this) }
		get [formFieldOptionsValueAtProperty](){ return valueAt.bind(this) }
		get [formFieldOptionsValueIndexProperty](){ return valueIndex.bind(this) }
		get [formFieldOptionsValueMultipleProperty](){ return valueMultiple }
		state = {...fieldOptionsState}
	}
}

export function onFormFieldOptionsMount(){
	mountState(this)
	if(formMount in this) this[formMount].apply(this, arguments)
	const activeValue = componentProperty.call(this, formFieldValueProperty)
	if(this[formFieldOptionsMultipleProperty]){
		this.setState({[formFieldActiveValueStateProperty]: valueMultiple(activeValue)})
	}
	else this.setState({[formFieldActiveValueStateProperty]: activeValue})
}

export function onFormFieldOptionsUnmount(){
	unmountState(this)
	if(formUnmount in this) this[formUnmount].apply(this, arguments)
}