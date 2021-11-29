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
    let showLineVarValue = '';
    if (values && values.length > 0) {
      values.forEach((item, index) => {
        const idx = index + 1;
        showLineVarValue =
          showLineVarValue + idx + '. ' + item.btnName + '  ${' + item.btnKey + '}\n';
      });
    } else {
      showLineVarValue = '无配置';
    }

    cmd.push(cmdHelper.updateProperties(ele, { 'camunda:lineInfo': showLineVarValue }));
    return cmd;
  }
  function getValue(val) {
    commandStack.execute('properties-panel.multi-command-executor', set(element, val));
  }

  if (!is(element, 'bpmn:Process') && !is(element, 'bpmn:SequenceFlow')) {
    group.entries.push(
      entryFactory.textAndLink({
        id: 'getLineinfoHandle',
        linkText: '刷新',
        handleClick: () => {
          disFn({
            type: 'flowUpgrade/getLineInfo',
            payload: { taskKey: element.id },
          }).then(result => getValue(result));
        },
        text: '审批路径变量',
      })
    );

    group.entries.push(
      entryFactory.textBox({
        id: 'lineInfo',
        label: '变量说明 变量值',
        modelProperty: 'camunda:lineInfo',
        // disabled: () => true,
      })
    );
  }
};
