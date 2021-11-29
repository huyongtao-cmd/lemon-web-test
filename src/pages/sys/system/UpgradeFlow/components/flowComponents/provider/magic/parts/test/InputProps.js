import { createCategoryValue } from 'bpmn-js-properties-panel/lib/helper/CategoryHelper';
import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';
import entryFactory from '../EntryFactory';

module.exports = (group, element, translate) => {
  const bo = getBusinessObject(element);

  if (!bo) {
    return;
  }

  if (is(element, 'camunda:Initiator') && !is(element.parent, 'bpmn:SubProcess')) {
    group.entries.push(
      entryFactory.textBox({
        id: 'initiator',
        label: 'Initiator',
        modelProperty: '可变化的值呢',
      })
    );
  }
};
