import * as Data from '../Data';
import ProtocolPrototype from './ProtocolPrototype';
import {
	componentProperty,
	fieldComponent,
	fieldForm,
	fieldDefaultProps,
	fieldPropTypes,
	fieldState,
	formFieldActiveValueStateProperty,
	formInputs,
	formInputsProperty,
	formMount,
	formOutputMessage,
	formProperty,
	formFieldInputProperty,
	formFieldOutputProperty,
	formFieldOutputMessageProperty,
	formFieldValueProperty,
	formUnmount,
	valueInput,
	valueOutput
} from '../Controller';
import {mountState, unmountState} from './MountProtocol';

//Handles state changes of nested component belonging to a form controller
//and assigns the computed value to the combined form data as changes occur
export default function FieldProtocol(Interface = ProtocolPrototype){
	if(Data.has(Interface, 'prototype')){
		if(Interface.prototype.componentDidMount) Interface.prototype[formMount] = Interface.prototype.componentDidMount
		if(Interface.prototype.componentWillUnmount) Interface.prototype[formUnmount] = Interface.prototype.componentWillUnmount
	}
	return class extends Interface{
		static defaultProps = {...Interface.defaultProps, ...fieldDefaultProps}
		static propTypes = {...Interface.propTypes, ...fieldPropTypes}
		static get [fieldComponent](){ return true }
		componentDidMount = onFormFieldMount
		componentWillUnmount = onFormFieldUnmount
		get [formProperty](){ return fieldForm(this) }
		get [formInputsProperty](){ return formInputs.bind(this) }
		get [formFieldOutputMessageProperty](){ return formOutputMessage.bind(this) }
		property = componentProperty
		state = {...fieldState, ...Interface.prototype.state}
		get [formFieldInputProperty](){ return valueInput.bind(this) }
		get [formFieldOutputProperty](){ return valueOutput.bind(this) }
	}
}

export function onFormFieldMount(){
	mountState(this)
	if(formMount in this) this[formMount].apply(this, arguments)
	this.setState({[formFieldActiveValueStateProperty]: this.property(formFieldValueProperty)})
}

export function onFormFieldUnmount(){
	unmountState(this)
	if(formUnmount in this) this[formUnmount].apply(this, arguments)
}