// 依赖包
import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';

module.exports = (group, element, translate) => {
  /** 如果只是追加一个属性 用 push 合并多个属性数组用 concat
  group.entries.push(executableEntry);
  group.entries = group.entries.concat(nameEntryFactory(element, options, translate));
  */

  group.entries.push(
    entryFactory.textField({
      id: 'approver',
      label: translate('审批人'), // 输入框的名字
      description: 'approver description', // 输入框的描述
      modelProperty: 'approval', // 输入框的key 体现在 xml 上 是输入框的值
    })
  );
};
