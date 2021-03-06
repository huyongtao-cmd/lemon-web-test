import React, { Component } from 'react';
import { connect } from 'dva';
import { isEmpty } from 'ramda';
import { Form, Switch } from 'antd';
import BusinessForm from '@/components/production/business/BusinessForm';
import EditTable from '@/components/production/business/EditTable';
import FormItem from '@/components/production/business/FormItem';
import PageWrapper from '@/components/production/layout/PageWrapper';
import ButtonCard from '@/components/production/layout/ButtonCard';
import Button from '@/components/production/basic/Button';
import { ProductFormItemBlockConfig } from '@/utils/pageConfigUtils';
import BusinessFormTitle from '@/components/production/business/BusinessFormTitle.tsx';
import createMessage from '@/components/core/AlertMessage';
import update from 'immutability-helper';
import { fromQs } from '@/utils/production/stringUtil';
import { genFakeId } from '@/utils/production/mathUtils';

const DOMAIN = 'ruleTemplateEdit';

@connect(({ user: { user }, loading, ruleTemplateEdit, dispatch }) => ({
  loading,
  ...ruleTemplateEdit,
  dispatch,
  user,
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
class edit extends Component {
  state = {};

  componentDidMount() {
    const { dispatch } = this.props;

    // // // ?????????????????????????????????,???????????????????????????
    // // // fromQs ?????????url?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????url??????????????????TAB??????????????????BUG
    const { id, copy, mode } = fromQs();
    this.setState({
      id,
    });
    // // // ???url??????????????????state
    // this.updateModelState({ formMode: mode, id, copy });
    // this.callModelEffects('init');

    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'RULE_TEMPLATE_EDIT' },
    });

    if (id) {
      dispatch({
        type: `${DOMAIN}/queryDetails`,
        payload: { id },
      });
    }
  }

  componentWillUnmount() {
    // ?????????????????????model???state,?????????????????????????????????
    this.callModelEffects('cleanState');
  }

  callModelEffects = (method, params) => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/${method}`,
      payload: params,
    });
  };

  /**
   * ??????model???state
   * ??????????????????????????????????????????,????????????model???state???????????????????????????dispatch
   * @param params state??????
   */
  updateModelState = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: params,
    });
  };

  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
      deleteKeys,
    } = this.props;
    const {
      formData: { ruleDetail, ...newFormData },
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        if (isEmpty(ruleDetail)) {
          createMessage({ type: 'warn', description: '?????????????????????????????????' });
          return;
        }
        const { id } = this.state;
        if (id) {
          dispatch({
            type: `${DOMAIN}/rulesTemplateOverall`,
            payload: {
              ...newFormData,
              ...values,
              twRulesTemplatedList: ruleDetail,
              deleteKeys: deleteKeys.filter(v => v > 0),
            },
          });
        } else {
          dispatch({
            type: `${DOMAIN}/rulesTemplateSave`,
            payload: {
              ...newFormData,
              ...values,
              twRulesTemplatedList: ruleDetail,
              deleteKeys: deleteKeys.filter(v => v > 0),
            },
          });
        }
      }
    });
  };

  // ????????????????????????
  renderPage = () => {
    const {
      dispatch,
      formData,
      formMode,
      pageConfig,
      form,
      associatedObjectClass1List,
      associatedObjectClass2List,
    } = this.props;

    const fields = [
      <BusinessFormTitle title="????????????" />,
      <FormItem
        fieldType="BaseInput"
        label="??????????????????"
        key="rulesTemplateName"
        fieldKey="rulesTemplateName"
        initialValue={formData.rulesTemplateName}
      />,
      <FormItem
        fieldType="BaseSelect"
        label="????????????"
        key="associatedObject"
        fieldKey="associatedObject"
        parentKey="COM:ASSOCIATED_OBJECT"
        initialValue={formData.associatedObject}
        onChange={(value, option, allOptions) => {
          dispatch({
            type: `${DOMAIN}/updateForm`,
            payload: {
              associatedObjectClass1: null,
              associatedObjectClass2: null,
            },
          });

          if (!value) {
            dispatch({
              type: `${DOMAIN}/updateForm`,
              payload: {
                associatedObjectExtVarchar1: null,
              },
            });
            dispatch({
              type: `${DOMAIN}/updateState`,
              payload: {
                associatedObjectClass1List: [],
                associatedObjectClass2List: [],
              },
            });
            return;
          }

          const { extVarchar1 } = allOptions[0];
          dispatch({
            type: `${DOMAIN}/updateForm`,
            payload: {
              associatedObjectExtVarchar1: extVarchar1,
            },
          });
          dispatch({
            type: `${DOMAIN}/queryAssociatedObjectClass1`,
            payload: extVarchar1,
          });
        }}
      />,
      <FormItem
        fieldType="BaseSelect"
        label="??????????????????1"
        key="associatedObjectClass1"
        fieldKey="associatedObjectClass1"
        descList={associatedObjectClass1List}
        initialValue={formData.associatedObjectClass1}
        onChange={(value, option, allOptions) => {
          dispatch({
            type: `${DOMAIN}/updateForm`,
            payload: {
              associatedObjectClass2: null,
            },
          });

          if (!value) {
            dispatch({
              type: `${DOMAIN}/updateState`,
              payload: {
                associatedObjectClass2List: [],
              },
            });
            return;
          }

          const { associatedObjectExtVarchar1 } = formData;
          dispatch({
            type: `${DOMAIN}/queryAssociatedObjectClass2`,
            payload: {
              key: associatedObjectExtVarchar1,
              cascaderValues: value,
            },
          });
        }}
      />,
      <FormItem
        fieldType="BaseSelect"
        label="??????????????????2"
        key="associatedObjectClass2"
        fieldKey="associatedObjectClass2"
        descList={associatedObjectClass2List}
        initialValue={formData.associatedObjectClass2}
      />,

      <FormItem
        fieldType="Custom"
        label="??????"
        key="isDisabled"
        fieldKey="isDisabled"
        parentKey="ADM:CONTRACT_STATUS"
        initialValue={formData.isDisabled}
      >
        <Switch
          checkedChildren="??????"
          unCheckedChildren="??????"
          checked={formData.isDisabled}
          onChange={e => {
            dispatch({
              type: `${DOMAIN}/updateForm`,
              payload: {
                isDisabled: !e,
              },
            });
          }}
        />
      </FormItem>,
    ];

    const fieldsConfig = ProductFormItemBlockConfig(
      pageConfig,
      'blockKey',
      'RULE_TEMPLATE_EDIT_FORM',
      fields
    );

    return (
      <BusinessForm formData={formData} form={form} formMode={formMode} defaultColumnStyle={12}>
        {fieldsConfig}
      </BusinessForm>
    );
  };

  render() {
    const { dispatch, loading, form, formData, formMode, deleteKeys = [] } = this.props;

    const { ruleDetail = [] } = formData;

    const disabledBtn =
      loading.effects[`${DOMAIN}/queryDetails`] || loading.effects[`${DOMAIN}/rulesTemplateSave`];

    const columns = [
      {
        title: '??????',
        dataIndex: 'rulesLineNo',
        align: 'center',
        width: 100,
      },
      {
        title: '??????',
        dataIndex: 'rulesDescription',
        render: (val, row, index) => (
          <FormItem
            form={form}
            fieldType="BaseInputTextArea"
            fieldKey={`ruleDetail[${index}].rulesDescription`}
            rows={1}
          />
        ),
      },
    ];

    return (
      <PageWrapper>
        {formMode === 'EDIT' && (
          <ButtonCard>
            <Button
              icon="save"
              size="large"
              type="primary"
              onClick={this.handleSave}
              disabled={disabledBtn}
            >
              ??????
            </Button>
          </ButtonCard>
        )}
        {this.renderPage()}

        <EditTable
          title="????????????"
          rowKey="id"
          // pagination={false}
          columns={columns}
          dataSource={ruleDetail}
          onAddClick={() => {
            dispatch({
              type: `${DOMAIN}/updateForm`,
              payload: {
                ruleDetail: update(ruleDetail, {
                  $push: [
                    {
                      id: genFakeId(-1),
                      rulesLineNo: ruleDetail.length,
                    },
                  ],
                }),
              },
            });
          }}
          onDeleteConfirm={keys => {
            const newDataSource = ruleDetail.filter(row => keys.indexOf(row.id) < 0);
            dispatch({
              type: `${DOMAIN}/updateForm`,
              payload: {
                ruleDetail: newDataSource.map((v, i) => ({ ...v, rulesLineNo: i })),
              },
            });
            this.updateModelState({ deleteKeys: [...deleteKeys, ...keys] });
          }}
        />
      </PageWrapper>
    );
  }
}

export default edit;
