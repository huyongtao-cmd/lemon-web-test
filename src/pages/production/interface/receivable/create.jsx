import React, { Component } from 'react';
import { connect } from 'dva';
import { isEmpty } from 'ramda';
import { Form } from 'antd';
import PageWrapper from '@/components/production/layout/PageWrapper';
import ButtonCard from '@/components/production/layout/ButtonCard';
import Button from '@/components/production/basic/Button';
import { closeThenGoto } from '@/layouts/routerControl';
import FormComponent from './component/FormComponent';
import EditDataTableComponent from './component/EditDataTableComponent';

const DOMAIN = 'receivableCreate';

@connect(({ loading, receivableCreate, dispatch }) => ({
  loading,
  ...receivableCreate,
  dispatch,
}))
@Form.create({
  mapPropsToFields(props) {
    const { formData } = props;
    const fields = {};
    Object.keys(formData).forEach(key => {
      const tempValue = formData[key];
      if (Array.isArray(tempValue)) {
        tempValue.forEach((temp, index) => {
          Object.keys(temp).forEach(detailKey => {
            fields[`${key}[${index}].${detailKey}`] = Form.createFormField({
              value: temp[detailKey],
            });
          });
        });
      } else {
        fields[key] = Form.createFormField({ value: tempValue });
      }
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
      type: `${DOMAIN}/updateFormForEditTable`,
      payload: newFieldData,
    });
  },
})
class indexComponent extends Component {
  componentDidMount() {
    // this.getPageConfig();
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
      type: `receivableCommon/getPageConfig`,
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
      formData: { createTime, ...newFormData },
    } = this.props;

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        const { detailEntities, ...restValues } = values;
        dispatch({
          type: `receivableCommon/edit`,
          payload: {
            ...newFormData,
            ...restValues,
          },
        }).then(res => {
          res && closeThenGoto(`/plat/interface/receivable/edit?id=${res[0].id}`);
        });
      }
    });
  };

  render() {
    const { loading, formData, formMode, pageConfig, form, dispatch } = this.props;
    const { detailEntities = [], delIds = [] } = formData;

    const disabledBtn = loading.effects[`receivableCommon/edit`];
    const disabledPage = loading.effects[`receivableCommon/getPageConfig`];

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
          form={form}
          formMode={formMode}
          formData={formData}
          // pageConfig={pageConfig}
          loading={disabledPage}
        />
        <EditDataTableComponent
          dispatch={dispatch}
          form={form}
          formMode={formMode}
          domain={DOMAIN}
          detailEntities={detailEntities}
          delIds={delIds}
          // pageConfig={pageConfig}
        />
      </PageWrapper>
    );
  }
}

export default indexComponent;
