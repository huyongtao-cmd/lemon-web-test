import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import entryFactory from '../EntryFactory';

/**
 * Create an entry to modify the name of an an element.
 *
 * @param  {djs.model.Base} element
 * @param  {Object} options
 * @param  {string} options.id the id of the entry
 * @param  {string} options.label the label of the entry
 *
 * @return {Array<Object>} return an array containing
 *                         the entry to modify the name
 */
module.exports = (element, opt, translate) => {
  const options = opt || {};
  const id = options.id || 'name';
  const label = options.label || translate('Name');
  const modelProperty = options.modelProperty || 'name';

  const nameEntry = entryFactory.textBox({
    id,
    label,
    modelProperty,
    get: options.get,
    set: options.set,
  });

  return [nameEntry];
};
