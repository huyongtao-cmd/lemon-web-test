import React from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { Form, Modal } from 'antd';
import { isEmpty } from 'ramda';
import BusinessForm from '@/components/production/business/BusinessForm';
import FormItem from '@/components/production/business/FormItem';
import SearchFormItem from '@/components/production/business/SearchFormItem';
import Link from '@/components/production/basic/Link';
import PageWrapper from '@/components/production/layout/PageWrapper';
import SearchTable, { DataOutput } from '@/components/production/business/SearchTable';
import createMessage from '@/components/core/AlertMessage';
import { createConfirm } from '@/components/core/Confirm';
import { remindString } from '@/components/production/basic/Remind';
import { outputHandle } from '@/utils/production/outputUtil';

// @ts-ignore
import {
  pcontractPagingRq,
  pcontractDeleteRq,
  pcontractChangeStatusRq,
} from '@/services/workbench/contract';

const DOMAIN = 'contractList';

@connect(({ loading, dispatch, contractList }) => ({
  treeLoading: loading.effects[`${DOMAIN}/init`],
  dispatch,
  ...contractList,
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
class list extends React.PureComponent {
  state = {
    visible: false,
    modalFormData: {},
  };

  componentDidMount() {
    // this.callModelEffects("init")
    // const { dispatch } = this.props;
    // dispatch({
    //   type: `${DOMAIN}/getPageConfig`,
    //   payload: { pageNo: 'PROD_CONTACT_LIST' },
    // });
  }

  fetchData = async params => {
    const { effectiveStartDate: date, createTime: date1, ...restparams } = params;
    if (Array.isArray(date) && (date[0] || date[1])) {
      [restparams.effectiveStartDate, restparams.effectiveEndDate] = date;
    }

    if (Array.isArray(date1) && (date1[0] || date1[1])) {
      [restparams.createStartTime, restparams.createEndTime] = date1;
    }

    const { response } = await pcontractPagingRq(restparams);
    return response.data;
  };

  deleteData = async keys =>
    outputHandle(pcontractDeleteRq, { ids: keys.join(',') }, undefined, false);

  changeStatus = async parmars => {
    const { response } = await pcontractChangeStatusRq(parmars);
    return response.data;
  };

  // ??????model???state
  updateModelState = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: params,
    });
  };

  // ??????model???????????????
  callModelEffects = (method, params) => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/${method}`,
      payload: params,
    });
  };

  onSelect = selectedKeys => {
    this.callModelEffects('handleSelectChange', { id: selectedKeys[0] });
  };

  renderSearchForm = () => {
    const { dispatch, contractClass2List } = this.props;
    const { getInternalState = () => {} } = this.state;
    const internalState = getInternalState();

    return [
      <SearchFormItem
        key="contractNoOrName"
        fieldKey="contractNoOrName"
        label="????????????/??????"
        fieldType="BaseInput"
        defaultShow
      />,
      <SearchFormItem
        key="contractClass1"
        label="????????????"
        fieldType="BaseCustomCascaderMultiSelect"
        fieldKey="contractClass1"
        parentKey="CUS:CONTRACT_CLASS1"
        defaultShow
        onChange={(value, option, allOptions) => {
          internalState.form.setFieldsValue({
            contractClass2: null,
          });
          dispatch({
            type: `${DOMAIN}/customSelectionCascaderRq`,
            payload: {
              key: 'CUS:CONTRACT_CLASS1',
              cascaderValues: value,
            },
          });
        }}
      />,
      <SearchFormItem
        key="contractClass2"
        label="????????????"
        fieldType="BaseSelect"
        fieldKey="contractClass2"
        descList={contractClass2List}
        defaultShow
      />,
      <SearchFormItem
        key="contractParties"
        label="?????????"
        fieldType="BaseInput"
        fieldKey="contractParties"
        defaultShow
      />,
      <SearchFormItem
        key="inchargeResId"
        label="???????????????"
        fieldType="ResSimpleSelect"
        fieldKey="inchargeResId"
        defaultShow
      />,
      <SearchFormItem
        key="inchargeBuId"
        label="????????????"
        fieldType="BuSimpleSelect"
        fieldKey="inchargeBuId"
        defaultShow
      />,
      <SearchFormItem
        label="????????????"
        fieldType="BaseCustomSelect"
        key="signingCompany"
        fieldKey="signingCompany"
        parentKey="CUS:INTERNAL_COMPANY"
        defaultShow
      />,
      <SearchFormItem
        label="????????????"
        fieldKey="contractStatus"
        key="contractStatus"
        fieldType="BaseSelect"
        parentKey="ADM:CONTRACT_STATUS"
        defaultShow
      />,
      <SearchFormItem
        label="????????????"
        fieldType="BaseInput"
        key="legalComments"
        fieldKey="legalComments"
        defaultShow
      />,
      <SearchFormItem
        label="????????????"
        fieldType="ProjectSimpleSelect"
        key="relatedProject"
        fieldKey="relatedProject"
        defaultShow
      />,
      <SearchFormItem
        key="relatedProduct"
        label="????????????"
        fieldKey="relatedProduct"
        fieldType="ProductSimpleSelect"
        defaultShow
      />,
      <SearchFormItem
        key="effectiveStartDate"
        label="????????????"
        fieldKey="effectiveStartDate"
        fieldType="BaseDateRangePicker"
        defaultShow
      />,
      <SearchFormItem
        key="createUserId"
        label="?????????"
        fieldType="UserSimpleSelect"
        fieldKey="createUserId"
        defaultShow
      />,
      <SearchFormItem
        key="createTime"
        fieldKey="createTime"
        label="????????????"
        fieldType="BaseDateRangePicker"
        defaultShow
        advanced
      />,
    ];
  };

  showModal = () => {
    this.setState({
      visible: true,
    });
  };

  handleOk = () => {
    const {
      form: { validateFieldsAndScroll },
      formData,
      dispatch,
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        const { getInternalState, modalFormData } = this.state;
        const { refreshData } = getInternalState();

        this.changeStatus({ ...formData, ...values, ...modalFormData }).then(res => {
          refreshData();
        });
      }
    });

    this.setState(
      {
        visible: false,
        modalFormData: {},
      },
      () => {
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            formData: {},
          },
        });
      }
    );
  };

  handleCancel = e => {
    const { dispatch } = this.props;
    this.setState(
      {
        visible: false,
        modalFormData: {},
      },
      () => {
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            formData: {},
          },
        });
      }
    );
  };

  render() {
    const { pageConfig, formData, formMode, form } = this.props;
    const { visible, getInternalState } = this.state;

    const columns = [
      {
        title: '????????????',
        key: 'contractNo',
        dataIndex: 'contractNo',
        align: 'center',
        sorter: true,
        render: (value, row, index) => (
          <Link
            onClick={() =>
              router.push(
                `/workTable/contractMgmt/contractList/detail?id=${row.id}&mode=DESCRIPTION`
              )
            }
          >
            {value}
          </Link>
        ),
      },
      {
        title: '????????????',
        key: 'contractName',
        dataIndex: 'contractName',
        align: 'center',
      },
      {
        title: '????????????',
        key: 'contractClass1',
        dataIndex: 'contractClass1Desc',
        align: 'center',
      },
      {
        title: '????????????',
        key: 'contractClass2',
        dataIndex: 'contractClass2Desc',
        align: 'center',
      },
      {
        title: '???????????????',
        key: 'refContractNo',
        dataIndex: 'refContractNo',
        align: 'center',
      },
      {
        title: '????????????',
        key: 'contractStatus',
        dataIndex: 'contractStatusDesc',
        align: 'center',
      },
      {
        title: '????????????',
        key: 'signingCompany',
        dataIndex: 'signingCompanyDesc',
        align: 'center',
      },
      {
        title: '??????',
        key: 'partyA',
        dataIndex: 'partyA',
        align: 'center',
      },
      {
        title: '??????',
        key: 'partyB',
        dataIndex: 'partyB',
        align: 'center',
      },
      {
        title: '????????????',
        key: 'inchargeBuId',
        dataIndex: 'inchargeBuIdDesc',
        align: 'center',
      },
      {
        title: '????????????',
        dataIndex: 'amt',
        align: 'right',
        render: val => val && val.toFixed(2),
      },
      {
        title: '????????????',
        key: 'signingDate',
        dataIndex: 'signingDate',
        align: 'center',
      },
      {
        title: '????????????',
        key: 'effectiveStartDate',
        dataIndex: 'effectiveStartDate',
        align: 'center',
      },
      {
        title: '????????????',
        key: 'effectiveEndDate',
        dataIndex: 'effectiveEndDate',
        align: 'center',
      },
      {
        title: '????????????',
        key: 'relatedContract',
        dataIndex: 'relatedContractDesc',
        align: 'center',
      },
      {
        title: '????????????',
        key: 'relatedProject',
        dataIndex: 'relatedProjectDesc',
        align: 'center',
      },
      {
        title: '????????????',
        key: 'relatedProduct',
        dataIndex: 'relatedProductDesc',
        align: 'center',
      },
      {
        title: '?????????',
        key: 'createUserId',
        dataIndex: 'createUserIdDesc',
        align: 'center',
      },
      {
        title: '????????????',
        key: 'createTime',
        dataIndex: 'createTime',
        align: 'center',
      },
      {
        title: '????????????',
        key: 'legalComments',
        dataIndex: 'legalComments',
      },
      {
        title: '????????????',
        key: 'closeReasonDesc',
        dataIndex: 'closeReasonDesc',
        align: 'center',
      },
    ];

    return (
      <PageWrapper>
        <Modal
          destroyOnClose
          title="????????????"
          visible={visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          width="65%"
        >
          <BusinessForm formData={formData} form={form} formMode={formMode} defaultColumnStyle={12}>
            <FormItem
              fieldType="BaseSelect"
              label="????????????"
              fieldKey="closeReason"
              parentKey="CUS:CONTRACT_CLOSE_REASON"
              initialValue={formData.signingCompany}
              required
            />
            <FormItem
              required
              fieldType="BaseInputTextArea"
              label="??????"
              fieldKey="closeRemark"
              initialValue={formData.closeRemark}
            />
          </BusinessForm>
        </Modal>
        <SearchTable
          wrapperInternalState={internalState => {
            this.setState({ getInternalState: internalState });
          }}
          showSearchCardTitle={false}
          defaultSortBy="id"
          defaultSortDirection="DESC"
          searchForm={this.renderSearchForm()}
          defaultSearchForm={{}}
          fetchData={this.fetchData}
          columns={columns}
          onAddClick={() => router.push('/workTable/contractMgmt/contractCreate')}
          onEditClick={data => {
            const { selectedRows } = getInternalState();
            const tt = selectedRows.filter(v => v.contractStatus !== 'CREATE');
            if (!isEmpty(tt)) {
              createMessage({
                type: 'warn',
                description: `????????????????????????????????????`,
              });
              return;
            }
            router.push(`/workTable/contractMgmt/contractList/edit?id=${data.id}&mode=EDIT`);
          }}
          deleteData={data => {
            const { selectedRows } = getInternalState();
            const tt = selectedRows.filter(v => v.contractStatus !== 'CREATE');
            if (!isEmpty(tt)) {
              createMessage({
                type: 'warn',
                description: `????????????????????????????????????`,
              });
              return Promise.resolve({ ok: false });
            }
            return this.deleteData(data);
          }}
          tableExtraProps={{
            scroll: {
              x: 3300,
            },
          }}
          extraButtons={[
            {
              key: 'adjust',
              title: '??????',
              type: 'primary',
              size: 'large',
              loading: false,
              cb: internalState => {
                // eslint-disable-next-line no-console
                const { selectedRowKeys, selectedRows } = internalState;
                const tt = selectedRows.filter(v => v.contractStatus !== 'ACTIVE');
                if (!isEmpty(tt)) {
                  createMessage({
                    type: 'warn',
                    description: `????????????????????????????????????`,
                  });
                  return;
                }
                router.push(
                  `/workTable/contractMgmt/contractList/edit?id=${
                    selectedRows[0].id
                  }&mode=EDIT&scene=adjust`
                );
              },
              disabled: internalState => {
                const { selectedRowKeys } = internalState;
                return selectedRowKeys.length !== 1;
              },
            },
            {
              key: 'active',
              title: '??????',
              type: 'primary',
              size: 'large',
              loading: false,
              cb: internalState => {
                const { selectedRowKeys, selectedRows } = internalState;
                const tt = selectedRows.filter(v => v.contractStatus !== 'CLOSE');
                if (!isEmpty(tt)) {
                  createMessage({
                    type: 'warn',
                    description: `????????????????????????????????????`,
                  });
                  return;
                }

                createConfirm({
                  content: remindString({
                    remindCode: 'COM:W:REACTIVE_WARN',
                    defaultMessage: '?????????????????????????????????????????????????????????????????????',
                  }),
                  onOk: () => {
                    this.changeStatus({
                      ids: selectedRowKeys.join(','),
                      contractStatus: 'ACTIVE',
                    }).then(res => {
                      const { refreshData } = internalState;
                      refreshData();
                    });
                  },
                });
              },
              disabled: internalState => {
                const { selectedRowKeys } = internalState;
                return selectedRowKeys.length !== 1;
              },
            },
            {
              key: 'close',
              title: '??????',
              type: 'primary',
              size: 'large',
              loading: false,
              cb: internalState => {
                const { selectedRowKeys, selectedRows } = internalState;
                const tt = selectedRows.filter(v => v.contractStatus !== 'ACTIVE');
                if (!isEmpty(tt)) {
                  createMessage({
                    type: 'warn',
                    description: `????????????????????????????????????`,
                  });
                  return;
                }

                this.setState({
                  visible: true,
                  modalFormData: {
                    ids: selectedRowKeys.join(','),
                    contractStatus: 'CLOSE',
                  },
                });
              },
              disabled: internalState => {
                const { selectedRowKeys } = internalState;
                return selectedRowKeys.length !== 1;
              },
            },
          ]}
        />
      </PageWrapper>
    );
  }
}

export default list;
