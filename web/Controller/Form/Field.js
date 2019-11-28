import Type from 'prop-types';

//Following form events are triggered when:
export const formEvents = {
	//Change of an entry already set in form => ({from:lastEntry, to:newEntry})
	change: 'change',
	//Entry is emitted from an input component - (internally set by form)
	entry: 'entry',
	//All fields are valid & data is submittable form => (from.data)
	submit: 'submit'
}

export const formInstance = Symbol('Form instance');
export const formMount = Symbol('FormController Component original componentDidMount function');
export const formProperty = 'form';
export const formTimer = Symbol('Form timer');
export const formTimerDuration = 400;
export const formUnmount = Symbol('FormController Component original componentWillUnmount function');


export const formEventProperty = 'formEvent';
export const formEventValue = formEvents.entry;
export const formInputsProperty = 'formInputs';

export const formFieldProperty = 'formField';
export const formFieldChangeEventProperty = 'onChange';
export const formFieldInputProperty = 'valueInput';
export const formFieldOutputProperty = 'valueOutput';
export const formFieldOutputMessageProperty = 'output';
export const formFieldPlaceholderProperty = 'placeholder';
export const formFieldRequiredProperty = 'required';
export const formFieldRequiredValue = false;
export const formFieldValueProperty = 'value';

export const formFieldActiveValueStateProperty = 'activeValue';

export const formFieldOptionsProperty = 'options';
export const formFieldOptionsMultipleProperty = 'multiple';
export const formFieldOptionsValueAtProperty = 'valueAt';
export const formFieldOptionsValueIndexProperty = 'valueIndex';
export const formFieldOptionsValueMultipleProperty = 'valueMultiple';

export const fieldComponent = Symbol('Form Field Component like TextInput');
export const fieldPropTypes = {
	[formProperty]: Type.object,
	[formEventProperty]: Type.string.isRequired,
	[formFieldProperty]: Type.string,
	[formFieldChangeEventProperty]:Type.func,
	[formFieldInputProperty]: Type.func,
	[formFieldOutputProperty]: Type.func,
	[formFieldPlaceholderProperty]: Type.string,
	[formFieldRequiredProperty]: Type.bool.isRequired,
	[formFieldValueProperty]: Type.any
};

export const fieldDefaultProps = {
	[formEventProperty]: formEventValue,
	[formFieldRequiredProperty]: formFieldRequiredValue
};

export const fieldState = {
	[formFieldActiveValueStateProperty]: null
};

export const fieldOptionsPropTypes = {
	[formFieldOptionsProperty]: Type.array.isRequired,
	[formFieldOptionsMultipleProperty]: Type.bool.isRequired,
	[formFieldOptionsValueAtProperty]: Type.func,
	[formFieldOptionsValueIndexProperty]: Type.func,
};

export const fieldOptionsDefaultProps = {
	[formFieldOptionsMultipleProperty]: false
};


export const fieldsetComponent = Symbol('Fieldset Component');
export const fieldsetPropTypes = {
	[formProperty]: Type.object,
	[formEventProperty]: Type.string.isRequired
};
export const fieldsetDefaultProps = {[formEventProperty]: formEventValue};





