import { is, getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
// import elementHelper from 'bpmn-js-properties-panel/lib/helper/ElementHelper';
import cmdHelper from 'bpmn-js-properties-panel/lib/helper/CmdHelper';
// import extensionElements from 'bpmn-js-properties-panel/lib/provider/camunda/parts/implementation/ExtensionElements';
import entryFactory from './EntryFactory';

module.exports = (group, element, translate, options, disFn, xmlVal, bpmnFactory, commandStack) => {
  const bo = getBusinessObject(element);
  if (!bo) {
    return;
  }

  function set(ele, values) {
    const cmd = [];
    cmd.push(cmdHelper.updateProperties(ele, { 'camunda:twFlowRole': values.role }));
    return cmd;
  }
  function getValue(val) {
    commandStack.execute(
      'properties-panel.multi-command-executor',
      set(element, { role: val || '' })
    );
  }

  if (is(element, 'bpmn:UserTask')) {
    group.entries.push(
      entryFactory.textAndLink({
        id: 'bpmnRoleHandle',
        linkText: '修改',
        handleClick: () => {
          disFn({
            type: 'flowUpgrade/updateState',
            payload: { roleChoseModalShow: true, eleId: element.id, callback: getValue },
          });
        },
        text: '流程角色',
      })
    );

    group.entries.push(
      entryFactory.textBox({
        id: 'bpmnRole',
        label: '已选角色',
        modelProperty: 'camunda:twFlowRole',
        // disabled: () => true,
      })
    );
  }
};
