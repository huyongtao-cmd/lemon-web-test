import { escapeHTML } from 'bpmn-js-properties-panel/lib/Utils';

/**
 * Create a linkified and HTML escaped entry field description.
 *
 * As a special feature, this description may contain both markdown
 * and plain <a href> links.
 *
 * @param {String} options.text
 * @param {String} options.id
 */
module.exports = function entryPlainText(options) {
  const resource = {
    ...options,
    id: options.id,
    text: options.text,
    label: options.text,
    modelProperty: options.text,
    // html: '<div class="bpp-plain-text" id="camunda-' + options.id + '>' + options.text + '</div>',
    html:
      '<div id="camunda-' +
      escapeHTML(options.id) +
      '" ' +
      'name="' +
      escapeHTML(options.text) +
      '" />' +
      options.text +
      '</div>',
  };
  return resource;
};
