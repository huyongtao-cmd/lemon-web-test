import { escapeHTML } from 'bpmn-js-properties-panel/lib/Utils';
import entryFieldDescription from 'bpmn-js-properties-panel/lib/factory/EntryFieldDescription';

const textBox = (options, defaultParameters) => {
  const resource = defaultParameters;
  const label = options.label || resource.id;
  const canBeShown = !!options.show && typeof options.show === 'function';
  const { description } = options;

  resource.html =
    '<label for="camunda-' +
    escapeHTML(resource.id) +
    '" ' +
    (canBeShown ? 'data-show="isShown"' : '') +
    '>' +
    label +
    '</label>' +
    '<div class="bpp-field-wrapper" ' +
    (canBeShown ? 'data-show="isShown"' : '') +
    '>' +
    '<div contenteditable="true"  style="border:none;font-size:12px" id="camunda-' +
    escapeHTML(resource.id) +
    '" ' +
    'name="' +
    escapeHTML(options.modelProperty) +
    '" />' +
    '</div>';

  // add description below text box entry field
  if (description) {
    resource.html += entryFieldDescription(description);
  }

  if (canBeShown) {
    // eslint-disable-next-line no-undef
    resource.isShown = () => options.show.apply(resource, arguments);
  }

  resource.cssClasses = ['bpp-textbox'];

  return resource;
};

module.exports = textBox;
