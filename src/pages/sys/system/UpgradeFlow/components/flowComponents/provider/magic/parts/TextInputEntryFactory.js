import { escapeHTML } from 'bpmn-js-properties-panel/lib/Utils';
import { query } from 'min-dom';
import entryFieldDescription from 'bpmn-js-properties-panel/lib/factory/EntryFieldDescription';

const domQuery = query;
const textField = (options, defaultParameters) => {
  // Default action for the button next to the input-field
  const defaultButtonAction = (element, inputNode) => {
    const input = domQuery('input[name="' + options.modelProperty + '"]', inputNode);
    input.value = '';

    return true;
  };

  // default method to determine if the button should be visible
  const defaultButtonShow = (element, inputNode) => {
    const input = domQuery('input[name="' + options.modelProperty + '"]', inputNode);

    return input.value !== '';
  };

  const resource = defaultParameters;
  const label = options.label || resource.id;
  const { dataValueLabel } = options;
  const buttonLabel = options.buttonLabel || 'X';
  const actionName =
    // eslint-disable-next-line eqeqeq
    typeof options.buttonAction != 'undefined' ? options.buttonAction.name : 'clear';
  const actionMethod =
    // eslint-disable-next-line eqeqeq
    typeof options.buttonAction != 'undefined' ? options.buttonAction.method : defaultButtonAction;
  // eslint-disable-next-line eqeqeq
  const showName = typeof options.buttonShow != 'undefined' ? options.buttonShow.name : 'canClear';
  // eslint-disable-next-line eqeqeq
  const showMethod =
    // eslint-disable-next-line eqeqeq
    typeof options.buttonShow != 'undefined' ? options.buttonShow.method : defaultButtonShow;
  const canBeDisabled = !!options.disabled && typeof options.disabled === 'function';
  const canBeHidden = !!options.hidden && typeof options.hidden === 'function';
  const { description } = options;

  resource.html =
    '<label for="camunda-' +
    escapeHTML(resource.id) +
    '" ' +
    (canBeDisabled ? 'data-disable="isDisabled" ' : '') +
    (canBeHidden ? 'data-show="isHidden" ' : '') +
    (dataValueLabel ? 'data-value="' + escapeHTML(dataValueLabel) + '"' : '') +
    '>' +
    escapeHTML(label) +
    '</label>' +
    '<div class="bpp-field-wrapper" ' +
    (canBeDisabled ? 'data-disable="isDisabled"' : '') +
    (canBeHidden ? 'data-show="isHidden"' : '') +
    '>' +
    '<input id="camunda-' +
    escapeHTML(resource.id) +
    '" type="text" style="border:none;" name="' +
    escapeHTML(options.modelProperty) +
    '" ' +
    (canBeDisabled ? 'data-disable="isDisabled"' : '') +
    (canBeHidden ? 'data-show="isHidden"' : '') +
    ' />' +
    '</div>';

  // add description below text input entry field
  if (description) {
    resource.html += entryFieldDescription(description);
  }

  resource[actionName] = actionMethod;
  resource[showName] = showMethod;

  if (canBeDisabled) {
    resource.isDisabled = () =>
      // eslint-disable-next-line no-undef
      options.disabled.apply(resource, arguments);
  }

  if (canBeHidden) {
    resource.isHidden = () =>
      // eslint-disable-next-line no-undef
      !options.hidden.apply(resource, arguments);
  }

  resource.cssClasses = ['bpp-textfield'];

  return resource;
};

module.exports = textField;
