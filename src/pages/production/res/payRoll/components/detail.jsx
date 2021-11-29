import React from 'react';
import { connect } from 'dva';
import { Form, Table } from 'antd';
import { isEmpty } from 'ramda';
import BusinessForm from '@/components/production/business/BusinessForm';
import FormItem from '@/components/production/business/FormItem';
import PageWrapper from '@/components/production/layout/PageWrapper';
import BusinessFormTitle from '@/components/production/business/BusinessFormTitle.tsx';

const DOMAIN = 'resPayRoll';

@connect(({ loading, dispatch, resPayRoll }) => ({
  loading,
  dispatch,
  resPayRoll,
}))
@Form.create({
  mapPropsToFields(props) {
    const { formData } = props;
    const fields = {};
    Object.keys(formData).forEach(key => {
      const tempValue = formData[key];
      fields[key] = Form.createFormField({ value: tempValue });
    });
    return fields;
  },
  onValuesChange(props, changedValues, allValues) {
    if (isEmpty(changedValues)) return;
    const name = Object.keys(changedValues)[0];
    const value = changedValues[name];
    const newFieldData = { [name]: value };

    switch (name) {
      default:
        break;
    }
    props.dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: newFieldData,
    });
  },
})
class PayRollDetail extends React.Component {
  renderPage = () => {
    const {
      resPayRoll: { formMode },
      form,
      formData,
    } = this.props;

    return (
      <BusinessForm
        title="工资明细"
        formData={formData}
        formMode={formMode}
        defaultColumnStyle={24}
      >
        {Object.keys(formData).map(rowItem => (
          <FormItem label={rowItem} key={rowItem} disabled fieldType="Custom">
            <input value={formData[rowItem]} />
          </FormItem>
        ))}
      </BusinessForm>
    );
  };

  render() {
    return <PageWrapper>{this.renderPage()}</PageWrapper>;
  }
}

export default PayRollDetail;
