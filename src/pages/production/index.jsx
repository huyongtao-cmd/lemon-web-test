import React from 'react';
import BaseInput from '@/components/production/basic/BaseInput';
import BusinessForm from '@/components/production/business/BusinessForm';
import FormItem from '@/components/production/business/FormItem';
import { Form, Icon, Button } from 'antd';

// @ts-ignore
@Form.create({})
// @ts-ignore
class Index extends React.Component {
  defaultState = {
    inputValue: 'hello',
  };

  state = {
    ...this.defaultState,
  };

  componentDidMount() {}

  render() {
    const { form, ...rest } = this.props;

    const { getFieldDecorator, isFieldTouched, getFieldError, validateFields } = form;

    const { inputValue } = this.state;
    return (
      <div style={{ backgroundColor: '#f0f2f5', padding: '5px' }}>
        <Button
          type="default"
          size="default"
          onClick={() =>
            validateFields((err, values) => {
              // console.log(err);
              // console.log(values);
            })
          }
        >
          点击
        </Button>

        <p>表单:</p>
        {/* <BusinessForm /> */}
        <FormItem form={form} fieldKey="test" type="BaseInputTextArea">
          <BaseInput />
        </FormItem>

        <br />
        <FormItem
          form={form}
          fieldType="BaseInputTextArea"
          fieldKey="language1"
          initialValue="dddddd"
        />

        <FormItem form={form} fieldType="BaseSwitch" fieldKey="yes2" initialValue />
      </div>
    );
  }
}

export default Index;
