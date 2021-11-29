import elementTemplates from 'bpmn-js-properties-panel/lib/provider/camunda/element-templates';
import translate from 'diagram-js/lib/i18n/translate';
import providerObj from './MagicPropertiesProvider';

const { CamundaPropertiesProvider } = providerObj;
const translateDefault = translate.default;

module.exports = {
  __depends__: [elementTemplates],
  __init__: ['propertiesProvider'],
  propertiesProvider: ['type', CamundaPropertiesProvider],
};
