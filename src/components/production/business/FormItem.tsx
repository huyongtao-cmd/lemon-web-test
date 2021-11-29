import React, { isValidElement } from 'react';

import { Form, Tooltip, Icon } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import { omit, isNil } from 'ramda';

import Description from '@/components/production/basic/Description';
import Link from '@/components/production/basic/Link';
import BaseFileManagerEnhance from '@/components/production/basic/BaseFileManagerEnhance';
import {smallToBig,numberFormat} from '@/utils/production/mathUtils';

import FileUpload from '@/components/common/FileUpload'
import './style/form-item.less';
import BaseSelect from '@/components/production/basic/BaseSelect';

interface Props {
  fieldKey?: string; // 字段key
  // group?: boolean; // 是否是一个字段组
  visible?: boolean; // 是否显示
  onChange?(value: any, option: any[], allOptions: any[]): void, // 值change事件
  sortNo?: number; // 显示顺序
  descriptionField?: string; // 详情模式字段名称,默认值：如果下拉类型的为fieldKey+'Desc',否则为fieldKey
  descriptionRender?: React.ReactNode; // 详情模式渲染节点
  label?: string; // 字段标签
  fieldType?:
    | 'BaseInput' // 文本输入
    | 'BaseInputNumber' // 数字输入
    | 'BaseInputAmt' // 金额输入
    | 'BaseInputTextArea' // 长文本输入
    | 'BaseSelect' // 系统选择项下拉 或者指定选择项
    | 'BaseSystemCascaderMultiSelect' // 系统选择项级联
    | 'BaseCustomCascaderMultiSelect' // 自定义选择项级联
    | 'BaseCustomSelect' // 自定义选择项下拉
    | 'BaseTreeSelect' // 树下拉
    | 'BaseSwitch' // 开关切换
    | 'BaseRadioSelect' // 单选框选择
    | 'ResObjectSelect' // 资源放大镜
    | 'ResSimpleSelect' // 资源简单下拉
    | 'UserSimpleSelect' // 用户简单下拉
    | 'BuSimpleSelect' // bu简单下拉
    | 'ContractSimpleSelect' // 合同简单下拉
    | 'ProjectSimpleSelect' // 项目简单下拉
    | 'BudgetSimpleSelect' // 预算简单下拉
    | 'SupplierSimpleSelect' // 供应商简单下拉
    | 'ProductSimpleSelect' // 产品简单下拉
    | 'TenantSimpleSelect' // 租户简单下拉
    | 'InternalOuSimpleSelect' // 内部公司简单下拉
    | 'BaseUdcSelect' // 老版本udc下拉
    | 'BaseFileManagerEnhance' // 附件
    | 'BaseInputHidden' // 隐藏字段
    | 'BaseDateRangePicker' // 日期范围
    | 'BaseDatePicker' // 日期选择
    | 'Group' // 字段组
    | 'FileUpload' // 上传附件
    | 'Custom'; // 自定义字段 // 字段类型
  fieldMode?: 'EDIT' | 'DESCRIPTION' | 'DISABLED' | 'LINK'; // 字段模式
  initialValue?: any; // 初始值
  disabled?: boolean; // 是否可编辑
  question?: string; // 帮助文字
  required?: boolean; // 是否必填
  placeholder?: string; // 占位符,有些组件无效
  rules?: Object[]; // 校验规则
  form?: WrappedFormUtils; // form表单
  [propName: string]: any; // 其它属性
}

/**
 * 1. 该组件主要结合BusinessForm组件进行使用，作为子节点，请勿单独使用
 */
class FormItem extends React.Component<Props, any> {
  static displayName?: string;
  static defaultProps?: object;

  // 处理子节点
  renderChildren = (props: any) => {
    const { fieldType, fieldKey, fieldMode = 'EDIT', formData, children, ...rest } = props;

    const itemProps = omit(
      [
        'labelCol',
        'wrapperCol',
        'fieldType',
        'label',
        'form',
        'className',
        'initialValue',
        'formData',
        'formMode',
        'visible',
        'sortNo',
        'group',
        'groupWidth',
        'descriptionField',
      ],
      rest
    );

    // 如果有fieldType属性,按照此渲染输入组件
    if (fieldType) {
      const wrappedProps: any = {};
      if (fieldMode === 'DISABLED') {
        wrappedProps.disabled = true;
        wrappedProps.key = fieldKey;
      }
      if (fieldType === 'BaseFileManagerEnhance') {
        return <BaseFileManagerEnhance {...itemProps} {...wrappedProps} />;
      }
      if (fieldType === 'Custom') {
        return React.cloneElement(children as any, { ...itemProps, ...wrappedProps });
      }
      if (fieldType === 'FileUpload') {
        return <FileUpload {...itemProps} fileList={rest.fileList} {...wrappedProps} />;
      }
      const Class1 = require(`../basic/${fieldType}`).default;
      return <Class1 {...itemProps} {...wrappedProps} />;
    } else {
      if (isValidElement(children)) {
        return children;
      } else {
        throw Error('FormItem必须包含fieldType属性或者子节点');
        // return (<span style={{color:'red'}}>FormItem必须包含type属性或者子节点</span>);
      }
    }
  };

  // 处理DESCRIPTION和LINK子节点
  renderChildrenDetail = (props: any) => {
    const {
      fieldType,
      fieldKey,
      descriptionField,
      fieldMode = 'EDIT',
      formData,
      children,
      descriptionRender,
      ...rest
    } = props;

    const itemProps = omit(
      [
        'labelCol',
        'wrapperCol',
        'fieldType',
        'label',
        'form',
        'className',
        'initialValue',
        'formData',
        'formMode',
        'descList',
        'descriptionField',
        'visible',
        'sortNo',
        'group',
        'groupWidth',
      ],
      rest
    );

    if(descriptionRender){
      return descriptionRender;
    }
    // 如果有fieldType属性,按照此渲染输入组件
    if (fieldType) {
      if (fieldType === 'BaseFileManagerEnhance') {
        return <BaseFileManagerEnhance {...itemProps} preview />;
      }
      if (fieldType === 'FileUpload') {
        return <FileUpload {...itemProps} fileList={rest.fileList} preview />;
      }
      // 获取fieldKey
      let tempFieldKey: any = '';
      let value;
      if (descriptionField) {
        tempFieldKey = descriptionField;
        value = formData && formData[tempFieldKey];
      } else {
        if (fieldType.toLowerCase().indexOf('select') > -1) {
          tempFieldKey = fieldKey + 'Desc';
        } else {
          tempFieldKey = fieldKey;
        }
        value = formData && formData[tempFieldKey];
        if (fieldType === 'BaseSwitch') {
          value = isNil(value) ? undefined : value ? '是' : '否';
        }
        if (fieldType === 'BaseInputAmt') {
          value = isNil(value) ? undefined : Number.isNaN(Number(value)) ? value : `${numberFormat(value.toFixed(2))} (${smallToBig(value)})`;
        }
      }
      // let value = formData && formData[tempFieldKey];

      if (fieldMode === 'DESCRIPTION') {
        return <Description value={value} />;
      }
      if (fieldMode === 'LINK') {
        return <Link {...itemProps}>{value}</Link>;
      }
      return <span style={{ color: 'red' }}>fieldMode 属性无法识别</span>;
    } else {
      if (isValidElement(children)) {
        return children;
      } else {
        throw Error('FormItem必须包含fieldType属性或者子节点');
        // return (<span style={{color:'red'}}>FormItem必须包含type属性或者子节点</span>);
      }
    }
  };

  renderItem = () => {
    const {
      form,
      fieldType,
      fieldKey = '',
      fieldMode,
      formData,
      initialValue,
      className = '',
      label,
      question,
      required = false,
      disabled,
      rules = [],
      children,
      ...rest
    } = this.props;
    // this.renderChildren();
    const group = fieldType === 'Group';
    const labelNode = question ? (
      <span>
        {label}
        &nbsp;
        <Tooltip title={question}>
          <Icon type="question-circle" />
        </Tooltip>
      </span>
    ) : (
      label
    );
    if (group) {
      if (!children) {
        return '';
      }
      let childrenTemp: Array<any>;
      if (Array.isArray(children)) {
        childrenTemp = children;
      } else {
        childrenTemp = [children];
      }
      let wrappedClassName = className + ' prod-form-item-group';
      if (required && (fieldMode === 'EDIT' || fieldMode === 'DISABLED')) {
        wrappedClassName = wrappedClassName + ' prod-form-item-group-require';
      }
      const defaultGroupWidth = 100 / childrenTemp.length;
      return (
        <Form.Item label={labelNode} className={wrappedClassName} {...rest}>
          {childrenTemp.map((child: any) => {
            const {
              fieldKey = '',
              rules = [],
              initialValue,
              fieldMode: innerFieldMode,
              disabled: innerDisabled,
              groupWidth = defaultGroupWidth + '%',
            } = child.props;
            const mode = innerFieldMode || fieldMode;
            if (mode === 'DESCRIPTION' || mode === 'LINK') {
              return (
                <Form.Item
                  {...rest}
                  wrapperCol={{ span: 24 }}
                  style={{ width: groupWidth, margin: 0 }}
                  key={fieldKey}
                >
                  {this.renderChildrenDetail({ ...child.props, fieldMode: mode, formData })}
                </Form.Item>
              );
            } else if (form) {
              return (
                <Form.Item
                  {...rest}
                  wrapperCol={{ span: 24 }}
                  style={{ width: groupWidth, margin: 0 }}
                  key={fieldKey}
                >
                  {form.getFieldDecorator(fieldKey as string, {
                    initialValue: initialValue,
                    rules: [{ required: required, message: '请输入' }, ...rules],
                  })(this.renderChildren({ ...child.props, fieldMode: mode, formData,disabled:isNil(innerDisabled)?disabled:innerDisabled }))}
                </Form.Item>
              );
            } else {
              return (
                <Form.Item
                  {...rest}
                  wrapperCol={{ span: 24 }}
                  style={{ width: groupWidth, margin: 0 }}
                  key={fieldKey}
                >
                  {this.renderChildren({ ...child.props, fieldMode: mode, formData,disabled:isNil(innerDisabled)?disabled:innerDisabled })}
                </Form.Item>
              );
            }
          })}
        </Form.Item>
      );
    } else {
      // 非组模式
      if (fieldMode === 'DESCRIPTION' || fieldMode === 'LINK') {
        return (
          <Form.Item label={labelNode} className={className} {...rest}>
            {this.renderChildrenDetail(this.props)}
          </Form.Item>
        );
      } else if (form) {
        return (
          <Form.Item label={labelNode} className={className} {...rest}>
            {form.getFieldDecorator(fieldKey, {
              initialValue: initialValue,
              rules: [{ required: required, message: '请输入' }, ...rules],
            })(this.renderChildren(this.props))}
          </Form.Item>
        );
      } else {
        return (
          <Form.Item label={labelNode} className={className} {...rest}>
            {this.renderChildren(this.props)}
          </Form.Item>
        );
      }
    }
  };

  render() {
    return this.renderItem();
  }
}
FormItem.displayName = 'FormItem';
FormItem.defaultProps = {
  visible: true, // 默认显示
  sortNo: 0, // 默认排在最前面
  group: false, // 默认非组字段
};
export default FormItem;
export { Props };
