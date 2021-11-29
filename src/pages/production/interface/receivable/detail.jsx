import React, { Component } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { isEmpty } from 'ramda';
import { Form } from 'antd';
import PageWrapper from '@/components/production/layout/PageWrapper';
import ButtonCard from '@/components/production/layout/ButtonCard';
import Button from '@/components/production/basic/Button';
import { closeThenGoto } from '@/layouts/routerControl';
import { fromQs } from '@/utils/production/stringUtil';
import { genFakeId } from '@/utils/mathUtils';
import FormComponent from './component/FormComponent';
import EditDataTableComponent from './component/EditDataTableComponent';

const DOMAIN = 'receivableEdit';

@connect(({ loading, receivableEdit, dispatch }) => ({
  loading,
  ...receivableEdit,
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
class index extends Component {
  componentDidMount() {
    const { dispatch } = this.props;

    const { id } = fromQs();
    if (id) {
      dispatch({
        type: `receivableCommon/queryDetails`,
        payload: { id },
      }).then(res => {
        if (res) {
          const { detailViews, ...restRes } = res;
          dispatch({
            type: `${DOMAIN}/updateForm`,
            payload: {
              ...restRes,
              detailEntities: detailViews,
            },
          });
        }
      });
    }

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
      delIds,
    } = this.props;

    validateFieldsAndScroll((error, values) => {
      const { detailEntities, ...restValues } = values;
      if (!error) {
        dispatch({
          type: `receivableCommon/edit`,
          payload: {
            ...newFormData,
            ...restValues,
            delIds,
          },
        }).then(res => {
          res &&
            dispatch({
              type: `receivableCommon/queryDetails`,
              payload: { id: fromQs().id },
            }).then(res1 => {
              if (res1) {
                const { detailViews, ...restRes } = res1;
                dispatch({
                  type: `${DOMAIN}/updateForm`,
                  payload: {
                    ...restRes,
                    detailEntities: detailViews,
                  },
                });
              }
            });
        });
      }
    });
  };

  render() {
    const { loading, formData, formMode, pageConfig, form, dispatch } = this.props;
    const { detailEntities = [], delIds = [] } = formData;

    const disabledBtn =
      loading.effects[`receivableCommon/queryDetails`] ||
      loading.effects[`receivableCommon/productManagementSave`];
    const disabledPage =
      loading.effects[`receivableCommon/queryDetails`] ||
      loading.effects[`receivableCommon/getPageConfig`];

    return (
      <PageWrapper>
        <ButtonCard>
          <Button icon="save" size="large" type="primary" onClick={this.handleSave} disabled>
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
          formData={formData}
          // pageConfig={pageConfig}
        />
      </PageWrapper>
    );
  }
}

export default index;
