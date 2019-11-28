import * as Data from '../Data';
import ProtocolPrototype from './ProtocolPrototype';
import { fieldsetComponent, fieldsetDefaultProps, fieldsetPropTypes, formInputs, formProperty } from '../Controller';

//Specifies a nest of form components in a specific category
//Configures & registers input fields to signal a form controller
export default function FieldsetProtocol(Interface = ProtocolPrototype){
	return class extends Interface{
		static propTypes = Data.copy(Interface.propTypes, fieldsetPropTypes)
		static defaultProps = Data.copy(Interface.defaultProps, fieldsetDefaultProps)
		static [fieldsetComponent] =  true
		get form(){ return Data.get(this, `props.${formProperty}`) }
		formInputs = formInputs
	}
}