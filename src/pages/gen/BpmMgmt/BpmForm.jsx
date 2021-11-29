import React from 'react';
import { filter, has } from 'ramda';
import FieldList from '@/components/layout/FieldList';
import { getGuid } from '@/utils/stringUtils';

const { Field } = FieldList;

const FormCompile = ({ getFieldDecorator, title, col, items, localItems, formData }) => {
  const renderForm = (item, localItem) => {
    const { disabled = false, required = false, dataIndex } = item;
    const {
      name,
      label,
      decorator: decoratorOrigin = {},
      children,
      ...restLocalProps
    } = localItem.props;
    // only readable
    if (disabled) {
      return (
        <Field key={getGuid()} name={name} label={label} {...restLocalProps} presentational>
          <span>{formData[dataIndex]}</span>
        </Field>
      );
    }
    // editable
    // compile props
    const rules = decoratorOrigin.rules || [];
    const requireMsg = filter(x => has('required')(x), rules).message || `${name}为必填项`;

    const decorator = {
      initialValue: formData[dataIndex],
      rules: [
        ...rules,
        {
          required,
          message: requireMsg,
        },
      ],
    };
    return React.cloneElement(
      localItem,
      {
        key: getGuid(),
        name,
        label,
        decorator,
        ...restLocalProps,
      },
      children
    );
  };

  return (
    <FieldList layout="horizontal" legend={title} getFieldDecorator={getFieldDecorator} col={col}>
      {items.filter(item => !item.hidden).map(item => {
        const localItem = filter(x => x.props.name === item.dataIndex, localItems)[0];
        return localItem ? renderForm(item, localItem) : null;
      })}
    </FieldList>
  );
};

const BpmForm = ({ Consumer }) => <Consumer>{value => <FormCompile {...value} />}</Consumer>;

export default BpmForm;
