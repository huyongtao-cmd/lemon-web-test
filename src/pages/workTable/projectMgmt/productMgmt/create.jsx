import React, { Component } from 'react';
import { connect } from 'dva';
import { isEmpty } from 'ramda';
import { Form } from 'antd';
import PageWrapper from '@/components/production/layout/PageWrapper';
import ButtonCard from '@/components/production/layout/ButtonCard';
import Button from '@/components/production/basic/Button';
import { closeThenGoto } from '@/layouts/routerControl';
import { genFakeId } from '@/utils/mathUtils';
import FormComponent from './component/FormComponent';

const DOMAIN = 'productMgmtCreate';

@connect(({ loading, productMgmtCreate, dispatch }) => ({
  loading,
  ...productMgmtCreate,
  dispatch,
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
class index extends Component {
  componentDidMount() {
    this.getPageConfig();
  }

  componentWillUnmount() {
    // 页面卸载时清理model层state,防止再次进入时错误显示
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/cleanState`,
    });
  }

  getPageConfig = () => {
    const { dispatch } = this.props;
    dispatch({
      type: `productMgmt/getPageConfig`,
      payload: { pageNo: 'PRODUCT_EDIT' },
    }).then(res => {
      res &&
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            pageConfig: res?.configInfo || {},
          },
        });
    });
  };

  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;
    const {
      formData: { ...newFormData },
    } = this.props;

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `productMgmt/productManagementSave`,
          payload: {
            ...newFormData,
            ...values,
          },
        }).then(res => {
          res && closeThenGoto(`/workTable/projectMgmt/productMgmt?_refresh=${genFakeId(-1)}`);
        });
      }
    });
  };

  render() {
    const { loading, formData, formMode, pageConfig, form } = this.props;

    const disabledBtn = loading.effects[`productMgmt/productManagementSave`];

    return (
      <PageWrapper>
        <ButtonCard>
          <Button
            icon="save"
            size="large"
            type="primary"
            onClick={this.handleSave}
            disabled={disabledBtn}
          >
            保存
          </Button>
        </ButtonCard>
        <FormComponent
          formData={formData}
          formMode={formMode}
          pageConfig={pageConfig}
          form={form}
        />
      </PageWrapper>
    );
  }
}

export default index;
