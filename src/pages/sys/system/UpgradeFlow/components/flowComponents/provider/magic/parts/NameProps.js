import nameEntryFactory from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/implementation/Name';
import { createCategoryValue } from 'bpmn-js-properties-panel/lib/helper/CategoryHelper';
import { is, getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

module.exports = (group, element, bpmnFactory, canvas, translate, nameChange) => {
  if (is(element, 'bpmn:Process')) {
    const { name } = getBusinessObject(element);
    nameChange(name);
  }
  function initializeCategory(semantic) {
    const rootElement = canvas.getRootElement();
    const definitions = getBusinessObject(rootElement).$parent;
    const categoryValue = createCategoryValue(definitions, bpmnFactory);

    // eslint-disable-next-line no-param-reassign
    semantic.categoryValueRef = categoryValue;
  }

  function setGroupName(ele, values) {
    const bo = getBusinessObject(ele);
    const { categoryValueRef } = bo;

    if (!categoryValueRef) {
      initializeCategory(bo);
    }

    // needs direct call to update categoryValue properly
    return {
      cmd: 'element.updateLabel',
      context: {
        element,
        newLabel: values.categoryValue,
      },
    };
  }

  function getGroupName(ele) {
    const bo = getBusinessObject(ele);
    const { value } = bo.categoryValueRef || {};
    return { categoryValue: value };
  }

  if (!is(element, 'bpmn:Collaboration')) {
    let options;
    if (is(element, 'bpmn:TextAnnotation')) {
      options = { modelProperty: 'text', label: translate('Text') };
    } else if (is(element, 'bpmn:Group')) {
      options = {
        modelProperty: 'categoryValue',
        label: translate('Category Value'),
        get: getGroupName,
        set: setGroupName,
      };
    }

    // name
    // eslint-disable-next-line no-param-reassign
    group.entries = group.entries.concat(nameEntryFactory(element, options, translate));
  }
};
