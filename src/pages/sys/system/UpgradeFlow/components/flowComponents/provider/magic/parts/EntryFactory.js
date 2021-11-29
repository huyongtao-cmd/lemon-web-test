import cmdHelper from 'bpmn-js-properties-panel/lib/helper/CmdHelper';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import textAndLink from './TextAndLink';
import textInputField from './TextInputEntryFactory';
import textBoxField from './TextBoxEntryFactory';

function ensureNotNull(prop) {
  if (!prop) {
    throw new Error(prop + ' must be set.');
  }

  return prop;
}

/**
 * sets the default parameters which are needed to create an entry
 *
 * @param options
 * @returns {{id: *, description: (*|string), get: (*|Function), set: (*|Function),
 *            validate: (*|Function), html: string}}
 */
const setDefaultParameters = options => {
  // default method to fetch the current value of the input field
  const defaultGet = element => {
    const bo = getBusinessObject(element);
    const res = {};
    const prop = ensureNotNull(options.modelProperty);
    res[prop] = bo.get(prop);

    return res;
  };

  // default method to set a new value to the input field
  const defaultSet = (element, values) => {
    const res = {};
    const prop = ensureNotNull(options.modelProperty);
    if (values[prop] !== '') {
      res[prop] = values[prop];
    } else {
      res[prop] = undefined;
    }

    return cmdHelper.updateProperties(element, res);
  };

  // default validation method
  const defaultValidate = () => {};

  return {
    id: options.id,
    description: options.description || '',
    get: options.get || defaultGet,
    set: options.set || defaultSet,
    validate: options.validate || defaultValidate,
    html: '',
  };
};

function EntryFactory() {}

/**
 * Generates an text input entry object for a property panel.
 * options are:
 * - id: id of the entry - String
 *
 * - description: description of the property - String
 *
 * - label: label for the input field - String
 *
 * - set: setter method - Function
 *
 * - get: getter method - Function
 *
 * - validate: validation mehtod - Function
 *
 * - modelProperty: name of the model property - String
 *
 * - buttonAction: Object which contains the following properties: - Object
 * ---- name: name of the [data-action] callback - String
 * ---- method: callback function for [data-action] - Function
 *
 * - buttonShow: Object which contains the following properties: - Object
 * ---- name: name of the [data-show] callback - String
 * ---- method: callback function for [data-show] - Function
 *
 * @param options
 * @returns the propertyPanel entry resource object
 */
EntryFactory.textField = options => textInputField(options, setDefaultParameters(options));

// EntryFactory.validationAwareTextField = function(options) {
//   return validationAwareTextInputField(options, setDefaultParameters(options));
// };

/**
 * Generates a checkbox input entry object for a property panel.
 * options are:
 * - id: id of the entry - String
 *
 * - description: description of the property - String
 *
 * - label: label for the input field - String
 *
 * - set: setter method - Function
 *
 * - get: getter method - Function
 *
 * - validate: validation method - Function
 *
 * - modelProperty: name of the model property - String
 *
 * @param options
 * @returns the propertyPanel entry resource object
 */
// EntryFactory.checkbox = function(options) {
//   return checkboxField(options, setDefaultParameters(options));
// };

EntryFactory.textBox = options => textBoxField(options, setDefaultParameters(options));

// EntryFactory.selectBox = function(options) {
//   return selectBoxField(options, setDefaultParameters(options));
// };

// EntryFactory.comboBox = function(options) {
//   return comboBoxField(options);
// };

// EntryFactory.table = function(options) {
//   return tableField(options);
// };

// EntryFactory.plainText = options => plainText(options);

EntryFactory.textAndLink = options => textAndLink(options);

module.exports = EntryFactory;
