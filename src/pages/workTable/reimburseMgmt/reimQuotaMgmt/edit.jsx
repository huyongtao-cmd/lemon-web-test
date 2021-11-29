import React, { Component } from 'react';
import { connect } from 'dva';
import { isEmpty, isNil } from 'ramda';
import { Form, Table } from 'antd';
import BusinessForm from '@/components/production/business/BusinessForm';
import FormItem from '@/components/production/business/FormItem';
import { outputHandle } from '@/utils/production/outputUtil';
import PageWrapper from '@/components/production/layout/PageWrapper';
import ButtonCard from '@/components/production/layout/ButtonCard';
import Button from '@/components/production/basic/Button';
import {
  ProductFormItemBlockConfig,
  ProductTableColumnsBlockConfig,
} from '@/utils/pageConfigUtils';
import BusinessFormTitle from '@/components/production/business/BusinessFormTitle.tsx';
import { fromQs } from '@/utils/production/stringUtil';
import { createConfirm } from '@/components/core/Confirm';
import { businessAccItemListPaging } from '@/services/production/acc';
import createMessage from '@/components/core/AlertMessage';
import { remindString } from '@/components/production/basic/Remind';
import ReimQuotaDModal from './component/ReimQuotaDModal';

import styles from './style.less';

const DOMAIN = 'reimQuotaMgmtEdit';

@connect(({ loading, reimQuotaMgmtEdit, dispatch }) => ({
  loading,
  ...reimQuotaMgmtEdit,
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
  state = {
    dataListSelected: [],
  };

  componentDidMount() {
    const { dispatch } = this.props;

    const { id } = fromQs();

    if (id) {
      this.setState({
        id,
      });

      // 报销额度表单
      dispatch({
        type: `${DOMAIN}/expenseQuotaDetail`,
        payload: { id },
      });

      dispatch({
        type: `${DOMAIN}/getPageConfig`,
        payload: { pageNo: 'P_EXPENSE_QUOTA_EDIT:EDIT' },
      });
    } else {
      dispatch({
        type: `${DOMAIN}/getPageConfig`,
        payload: { pageNo: 'P_EXPENSE_QUOTA_EDIT' },
      });
    }
  }

  componentWillUnmount() {
    // 页面卸载时清理model层state,防止再次进入时错误显示
    this.callModelEffects('cleanState');
  }

  callModelEffects = (method, params) => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/${method}`,
      payload: params,
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
        const { quotaDimension1, quotaDimension2 } = newFormData;
        if (quotaDimension1 === quotaDimension2) {
          createMessage({
            type: 'warn',
            description: remindString({
              remindCode: 'COS:E:DIM_DUPLICATE_CHECK',
              defaultMessage: '报销额度维度之间，选择值不能有相同的！',
            }),
          });
          return;
        }

        dispatch({
          type: `${DOMAIN}/expenseQuotaSave`,
          payload: {
            ...newFormData,
            ...values,
          },
        });
      }
    });
  };

  renderColumns = () => {
    const { pageConfig } = this.props;
    const fields = [
      {
        title: '规则码',
        key: 'ruleCode',
        dataIndex: 'ruleCode',
        align: 'center',
      },
      {
        title: '维度1值',
        key: 'quotaDimension1Value',
        dataIndex: 'quotaDimension1ValueDesc',
        align: 'center',
      },
      {
        title: '维度2值',
        key: 'quotaDimension2Value',
        dataIndex: 'quotaDimension2ValueDesc',
        align: 'center',
      },
      {
        title: '报销额度',
        key: 'quotaAmt',
        dataIndex: 'quotaAmt',
        align: 'right',
        render: val => (isNil(val) ? '' : val.toFixed(2)),
      },
      {
        title: '币种',
        key: 'currCode',
        dataIndex: 'currCodeDesc',
        align: 'center',
      },
      {
        title: '时间单位',
        key: 'timeUnit',
        dataIndex: 'timeUnitDesc',
        align: 'center',
      },
    ];
    const fieldsConfig = ProductTableColumnsBlockConfig(
      pageConfig,
      'blockKey',
      'EXPENSE_QUOTA_D_TABLT',
      fields
    );

    return fieldsConfig;
  };

  fetchTree = async () => {
    const { data } = await outputHandle(businessAccItemListPaging, { limit: 0 });
    return data.rows.map(item => ({ ...item, title: item.itemName }));
  };

  // 配置所需要的内容
  renderPage = () => {
    const { formData, formMode, pageConfig, dispatch, form, dataList } = this.props;

    const fields = [
      <BusinessFormTitle title="报销额度" />,
      <FormItem
        label="核算项目"
        key="busiAccItemId"
        fieldKey="busiAccItemId"
        fieldType="BaseTreeSelect"
        initialValue={formData.busiAccItemId}
        fetchData={this.fetchTree}
        required
      />,
      <FormItem
        label="状态"
        fieldKey="quotaStatus"
        key="quotaStatus"
        fieldType="BaseSelect"
        parentKey="COM:ENABLE_FLAG"
        initialValue={formData.quotaStatus}
      />,
      <FormItem
        label="报销额度维度1"
        key="quotaDimension1"
        fieldKey="quotaDimension1"
        fieldType="BaseSelect"
        parentKey="COS:EXPENSE_QUOTA_DIMENSION"
        initialValue={formData.quotaDimension1}
        onChange={(value, option, allOptions) => {
          if (value) {
            const { extVarchar1 } = option[0];
            dispatch({
              type: `${DOMAIN}/queryDimension1`,
              payload: {
                key: extVarchar1,
              },
            });
            return;
          }

          dispatch({
            type: `${DOMAIN}/updateState`,
            payload: {
              dimension1List: [],
            },
          });
        }}
      />,
      <FormItem
        label="报销额度维度2"
        key="quotaDimension2"
        fieldKey="quotaDimension2"
        fieldType="BaseSelect"
        parentKey="COS:EXPENSE_QUOTA_DIMENSION"
        initialValue={formData.quotaDimension2}
        onChange={(value, option, allOptions) => {
          if (value) {
            const { extVarchar1 } = option[0];
            dispatch({
              type: `${DOMAIN}/queryDimension2`,
              payload: {
                key: extVarchar1,
              },
            });
            return;
          }

          dispatch({
            type: `${DOMAIN}/updateState`,
            payload: {
              dimension2List: [],
            },
          });
        }}
      />,

      <FormItem
        label="报销额度说明"
        key="expenseQuotaDesc"
        fieldKey="expenseQuotaDesc"
        fieldType="BaseInputTextArea"
        initialValue={formData.expenseQuotaDesc}
      />,
    ];

    const fieldsConfig = ProductFormItemBlockConfig(
      pageConfig,
      'blockKey',
      'EXPENSE_QUOTA_EDIT_FORM',
      fields
    );

    return (
      <>
        <BusinessForm formData={formData} form={form} formMode={formMode} defaultColumnStyle={12}>
          {fieldsConfig}
        </BusinessForm>
      </>
    );
  };

  handleChange = parmas => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/expenseQuotaDSave`,
      payload: parmas,
    }).then(res => {
      this.setState({
        dataListSelected: [],
      });
    });
  };

  render() {
    const { dispatch, loading, form, formData, formMode, dataList = [] } = this.props;

    const { dataListSelected = [], id } = this.state;

    const disabledBtn =
      loading.effects[`${DOMAIN}/expenseQuotaDetail`] ||
      loading.effects[`${DOMAIN}/expenseQuotaDDetail`] ||
      loading.effects[`${DOMAIN}/expenseQuotaSave`];

    const rowSelection = {
      selectedRowKeys: dataListSelected.map(v => v.id),
      onSelect: (record, selected, selectedRows, nativeEvent) => {
        this.setState({
          dataListSelected: selectedRows,
        });
      },
      onSelectAll: (selected, selectedRows, changeRows) => {
        this.setState({
          dataListSelected: selectedRows,
        });
      },
    };

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
        {this.renderPage()}
        {id && (
          <div className={styles.boxWarp}>
            <BusinessForm
              formData={formData}
              form={form}
              formMode={formMode}
              defaultColumnStyle={24}
            >
              <BusinessFormTitle title="额度明细" />
              <Table
                title={() => (
                  <>
                    <Button
                      size="large"
                      type="primary"
                      onClick={() => {
                        dispatch({
                          type: `${DOMAIN}/updateState`,
                          payload: {
                            visible: true,
                          },
                        });
                      }}
                      disabled={disabledBtn}
                    >
                      新增
                    </Button>
                    &nbsp; &nbsp;
                    <Button
                      size="large"
                      type="primary"
                      onClick={() => {
                        const { quotaDimension1Value, quotaDimension2Value } = dataListSelected[0];
                        dispatch({
                          type: `${DOMAIN}/updateState`,
                          payload: {
                            visible: true,
                            modalformdata: {
                              ...dataListSelected[0],
                              quotaDimension1Value:
                                quotaDimension1Value !== null && quotaDimension1Value.split(','),
                              quotaDimension2Value:
                                quotaDimension2Value !== null && quotaDimension2Value.split(','),
                            },
                          },
                        });
                      }}
                      disabled={dataListSelected.length !== 1}
                    >
                      修改
                    </Button>
                    &nbsp; &nbsp;
                    <Button
                      size="large"
                      type="danger"
                      onClick={() => {
                        createConfirm({
                          content: '确定删除吗？',
                          onOk: () => {
                            dispatch({
                              type: `${DOMAIN}/expenseQuotaDDelete`,
                              payload: {
                                ids: dataListSelected.map(v => v.id).join(','),
                              },
                            });
                          },
                        });
                      }}
                      disabled={dataListSelected.length === 0}
                    >
                      删除
                    </Button>
                  </>
                )}
                bordered
                rowKey="id"
                rowSelection={formMode === 'EDIT' ? rowSelection : null}
                pagination={false}
                columns={this.renderColumns()}
                dataSource={dataList}
                loading={loading.effects[`${DOMAIN}/expenseQuotaDDetail`]}
              />
            </BusinessForm>
          </div>
        )}
        <ReimQuotaDModal onChange={parmas => this.handleChange(parmas)} />
      </PageWrapper>
    );
  }
}

export default index;
