import { escapeHTML } from 'bpmn-js-properties-panel/lib/Utils';
// import bind from 'ramda';
import bind from 'lodash/bind';

/**
 * An entry that renders a clickable link.
 *
 * A passed {@link options#handleClick} handler is responsible
 * to process the click.
 *
 * The link may be conditionally shown or hidden. This can be
 * controlled via the {@link options.showLink}.
 *
 * @param {Object} options
 * @param {String} options.id
 * @param {String} [options.linkText]
 * @param {Function} options.handleClick
 * @param {Function} [options.showLink] returning false to hide link
 * @param {String} [options.text]
 *
 * @example
 *
 * const linkEntry = link({
 *   id: 'foo',
 *   description: 'Some Description',
 *   handleClick: function(element, node, event) { ... },
 *   showLink: function(element, node) { ... }
 * });
 *
 * @return {Entry} the newly created entry
 */
function textAndLink(options) {
  const { id, linkText, showLink, handleClick, text } = options;

  if (showLink && typeof showLink !== 'function') {
    throw new Error('options.showLink must be a function');
  }

  if (typeof handleClick !== 'function') {
    throw new Error('options.handleClick must be a function');
  }

  const resource = {
    id,
  };

  resource.html =
    '<span style="color:#000; margin-right:10px;">' +
    text +
    '</span>' +
    '<a data-action="handleClick" ' +
    (showLink ? 'data-show="showLink" ' : '') +
    'class="bpp-entry-link' +
    (options.cssClasses ? ' ' + escapeHTML(options.cssClasses) : '') +
    '">' +
    escapeHTML(linkText) +
    '</a>';

  resource.handleClick = bind(handleClick, resource);

  if (typeof showLink === 'function') {
    // eslint-disable-next-line prefer-rest-params
    resource.showLink = () => showLink.apply(resource, arguments);
  }

  return resource;
}

module.exports = textAndLink;
