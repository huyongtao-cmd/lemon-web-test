import React from 'react';
import { connect } from 'dva';
import { Switch, Modal, Form } from 'antd';
import BusinessForm from '@/components/production/business/BusinessForm';
import FormItem from '@/components/production/business/FormItem';
import router from 'umi/router';
import { isNil, isEmpty } from 'ramda';
import SearchFormItem from '@/components/production/business/SearchFormItem';
import Link from '@/components/production/basic/Link';
import PageWrapper from '@/components/production/layout/PageWrapper';
import SearchTable, { DataOutput } from '@/components/production/business/SearchTable';
import { outputHandle } from '@/utils/production/outputUtil';
import DataTable from '@/components/production/business/DataTable';
import {
  ProductTableColumnsBlockConfig,
  ProductSearchFormItemBlockConfig,
} from '@/utils/pageConfigUtils';
import styles from './style.less';

import {
  collectionPlanPgingRq,
  collectionPlanDeleteRq,
  collectionPlanPartialRq,
} from '@/services/production/collectionPlan';
import createMessage from '@/components/core/AlertMessage';

const DOMAIN = 'collectionPlan';

@connect(({ loading, dispatch, collectionPlan }) => ({
  loading,
  dispatch,
  ...collectionPlan,
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
class index extends React.PureComponent {
  state = {
    visible: false,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'COLLECTION_PLAN_LIST' },
    });

    // ????????????
    dispatch({
      type: `${DOMAIN}/getCustomerList`,
    });
  }

  fetchData = async params => {
    const { date, ...restparams } = params;

    if (Array.isArray(date) && (date[0] || date[1])) {
      [restparams.startDate, restparams.endDate] = date;
    }

    const { response } = await collectionPlanPgingRq(restparams);
    return response.data;
  };

  changeStatus = async parmars => {
    const { response } = await collectionPlanPartialRq(parmars);
    return response.data;
  };

  deleteData = async keys =>
    outputHandle(collectionPlanDeleteRq, { ids: keys.join(',') }, undefined, false);

  renderColumns = () => {
    const { dispatch, pageConfig } = this.props;

    const fields = [
      {
        title: '???????????????',
        key: 'soNo',
        dataIndex: 'soNo',
        align: 'center',
        // render: (value, row) => (
        //   <Link
        //     onClick={() => {
        //       const { invId, id } = row;
        //       // ?????????????????????????????????????????????
        //       if (invId) {
        //         router.push(
        //           `/workTable/sale/collectionPlan/detail?id=${invId}&invId=${invId}&mode=DESCRIPTION`
        //         );
        //         return;
        //       }

        //       // ?????????????????????
        //       router.push(`/workTable/sale/collectionPlan/detail?id=${id}&mode=DESCRIPTION`);
        //     }}
        //   >
        //     {value}
        //   </Link>
        // ),
      },
      {
        title: '???????????????',
        key: 'soName',
        dataIndex: 'soName',
        align: 'center',
      },
      {
        title: '????????????',
        key: 'custId',
        dataIndex: 'custIdDesc',
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
        key: 'collectionStage',
        dataIndex: 'collectionStage',
        align: 'center',
      },
      {
        title: '????????????',
        key: 'collectionAmt',
        dataIndex: 'collectionAmt',
        align: 'right',
        render: val => (val ? val.toFixed(2) : ''),
      },
      {
        title: '??????',
        key: 'collectionRate',
        dataIndex: 'collectionRate',
        align: 'center',
        render: val => (val ? `${val}%` : ''),
      },
      {
        title: '??????????????????',
        key: 'expectedCollectionDate',
        dataIndex: 'expectedCollectionDate',
        align: 'center',
      },
      {
        title: '??????????????????',
        key: 'actualRecvDate',
        dataIndex: 'actualRecvDate',
        align: 'center',
      },
      {
        title: '????????????',
        key: 'collectionStatus',
        dataIndex: 'collectionStatusDesc',
        align: 'center',
      },
      {
        title: '???????????????',
        key: 'collectedAmt',
        dataIndex: 'collectedAmt',
        align: 'right',
        render: (value, row) => (
          <Link
            onClick={() => {
              dispatch({
                type: `${DOMAIN}/getCollectionDetailById`,
                payload: {
                  id: row.id,
                },
              });

              this.setState({
                collectedVisible: true,
              });
            }}
          >
            {value ? value.toFixed(2) : ''}
          </Link>
        ),
      },
      {
        title: '???????????????',
        key: 'unCollectAmt',
        dataIndex: 'unCollectAmt',
        align: 'right',
        render: val => (val ? val.toFixed(2) : ''),
      },
      {
        title: '??????????????????',
        key: 'latestCollectionDate',
        dataIndex: 'latestCollectionDate',
        align: 'center',
      },
      {
        title: '???????????????',
        key: 'batchNo',
        dataIndex: 'batchNo',
        align: 'center',
        render: (value, row) => {
          const { invId } = row;
          return invId ? (
            <Link
              onClick={() => {
                // ??????????????????????????????????????????????????????
                if (invId) {
                  router.push(`/workTable/sale/salesInvoice/detail?id=${invId}&mode=DESCRIPTION`);
                }
              }}
            >
              {value}
            </Link>
          ) : (
            value
          );
        },
      },
      {
        title: '????????????',
        key: 'batchStatus',
        dataIndex: 'batchStatusDesc',
        align: 'center',
      },
      {
        title: '?????????',
        key: 'invNos',
        dataIndex: 'invNos',
        align: 'center',
      },
      {
        title: '???????????????',
        key: 'invAmt',
        dataIndex: 'invAmt',
        align: 'right',
        render: val => (val ? val.toFixed(2) : ''),
      },
      {
        title: '????????????',
        key: 'batchDate',
        dataIndex: 'batchDate',
        align: 'center',
      },
      {
        title: '????????????',
        key: 'collectionCompany',
        dataIndex: 'collectionCompanyDesc',
        align: 'center',
      },
      {
        title: '????????????',
        key: 'collectionBuId',
        dataIndex: 'collectionBuIdDesc',
        align: 'center',
      },
      {
        title: '???????????????',
        key: 'inchargeSaleId',
        dataIndex: 'inchargeSaleIdDesc',
        align: 'center',
      },
    ];

    const fieldsConfig = ProductTableColumnsBlockConfig(
      pageConfig,
      'blockKey',
      'TABLE_COLUMNS',
      fields
    );

    return fieldsConfig;
  };

  renderSearchForm = () => {
    const { pageConfig, customerList } = this.props;

    const fields = [
      <SearchFormItem
        label="???????????????"
        key="soNo"
        fieldKey="soNo"
        fieldType="BaseInput"
        defaultShow
      />,
      <SearchFormItem
        label="???????????????"
        key="soName"
        fieldKey="soName"
        fieldType="BaseInput"
        defaultShow
      />,
      <SearchFormItem
        label="????????????"
        key="custId"
        fieldKey="custId"
        fieldType="BaseSelect"
        descList={customerList}
        defaultShow
      />,
      <SearchFormItem
        label="????????????"
        key="collectionStage"
        fieldKey="collectionStage"
        fieldType="BaseInput"
        defaultShow
      />,
      <SearchFormItem
        label="????????????"
        key="batchStatus"
        fieldKey="batchStatus"
        fieldType="BaseCustomSelect"
        parentKey="FUNCTION:SALE:SALE_INV_BATCH_STATUS"
        defaultShow
      />,
      <SearchFormItem
        label="????????????"
        key="collectionStatus"
        fieldKey="collectionStatus"
        fieldType="BaseCustomSelect"
        parentKey="FUNCTION:SALE:COLLECTION_STATUS"
        defaultShow
      />,
      <SearchFormItem
        label="????????????"
        key="collectionCompany"
        fieldKey="collectionCompany"
        fieldType="BaseCustomSelect"
        parentKey="CUS:INTERNAL_COMPANY"
        defaultShow
      />,
      <SearchFormItem
        label="????????????"
        key="collectionBuId"
        fieldKey="collectionBuId"
        fieldType="BuSimpleSelect"
        defaultShow
      />,
      <SearchFormItem
        label="??????????????????"
        key="date"
        fieldKey="date"
        fieldType="BaseDateRangePicker"
        defaultShow
      />,
      <SearchFormItem
        label="???????????????"
        key="inchargeSaleId"
        fieldKey="inchargeSaleId"
        fieldType="ResSimpleSelect"
        defaultShow
      />,
    ];

    // const fieldsConfig = ProductSearchFormItemBlockConfig(
    //   pageConfig,
    //   'blockKey',
    //   'PRODUCT_TABLE_SAERCHFORM',
    //   fields
    // );

    return fields;
  };

  handleCancel = e => {
    this.setState({
      visible: false,
    });
  };

  handleOk = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
      formData: { invItemId, id, ...newFormData },
    } = this.props;

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        const { saleId, collectionPlanId } = this.state;

        dispatch({
          type: `${DOMAIN}/saveCollectionData`,
          payload: {
            ...newFormData,
            ...values,
            saleId,
            collectionPlanId,
          },
        }).then(res => {
          if (res) {
            const { getInternalState } = this.state;
            const { refreshData } = getInternalState();
            refreshData();

            this.handleCancel();
          }
        });
      }
    });
  };

  renderColumns1 = () => {
    const fields = [
      {
        title: '????????????(??????)',
        dataIndex: 'collectionAmt',
        align: 'right',
      },
      {
        title: '????????????',
        align: 'center',
        dataIndex: 'collectionDate',
      },
      {
        title: '????????????',
        align: 'center',
        dataIndex: 'collectionBankNo',
      },
      {
        title: '??????',
        align: 'left',
        dataIndex: 'remark',
      },
    ];
    return fields;
  };

  render() {
    const {
      loading,
      dispatch,
      formData,
      form,
      formMode,
      bankList,
      collectionDetailList = [],
    } = this.props;

    const { visible, getInternalState, collectedVisible } = this.state;

    return (
      <PageWrapper>
        <Modal
          title="??????????????????"
          visible={visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          width="50%"
          afterClose={() => {
            dispatch({
              type: `${DOMAIN}/updateState`,
              payload: {
                formData: {},
              },
            });
          }}
          confirmLoading={loading.effects[`${DOMAIN}/saveCollectionData`]}
        >
          <div className={styles.boxWarp}>
            <BusinessForm
              formData={formData}
              form={form}
              formMode={formMode}
              defaultColumnStyle={12}
            >
              <FormItem
                label="????????????(??????)"
                key="collectionAmt"
                fieldKey="collectionAmt"
                fieldType="BaseInputAmt"
                initialValue={formData.collectionAmt}
                required
              />
              <FormItem
                label="????????????"
                key="collectionDate"
                fieldKey="collectionDate"
                fieldType="BaseDatePicker"
                initialValue={formData.collectionDate}
                required
              />
              <FormItem
                label="????????????"
                key="collectionMethod"
                fieldKey="collectionMethod"
                fieldType="BaseUdcSelect"
                udcCode="ACC:PAY_METHOD"
                initialValue={formData.collectionMethod}
                required
              />
              <FormItem
                label="????????????"
                key="collectionBankNo"
                fieldKey="collectionBankNo"
                fieldType="BaseSelect"
                initialValue={formData.collectionBankNo}
                required
                descList={bankList}
                dropdownMatchSelectWidth={false}
                onChange={(value, option) => {
                  if (value) {
                    const { name, valSphd1, valSphd2 } = option[0];
                    dispatch({
                      type: `${DOMAIN}/updateForm`,
                      payload: {
                        holderName: name,
                        bankName: valSphd1,
                        bankBranch: valSphd2,
                      },
                    });
                  } else {
                    dispatch({
                      type: `${DOMAIN}/updateForm`,
                      payload: {
                        holderName: '',
                        bankName: '',
                        bankBranch: '',
                      },
                    });
                  }
                }}
              />
              <FormItem fieldType="BaseInput" label="??????" disabled fieldKey="holderName" />
              <FormItem fieldType="BaseInput" label="????????????" disabled fieldKey="bankName" />
              <FormItem fieldType="BaseInput" label="??????????????????" disabled fieldKey="bankBranch" />
              <FormItem
                label="??????"
                fieldKey="remark"
                key="remark"
                fieldType="BaseInputTextArea"
                initialValue={formData.remark}
              />
            </BusinessForm>
          </div>
        </Modal>

        <Modal
          title="??????????????????"
          visible={collectedVisible}
          onOk={() => {
            this.setState({
              collectedVisible: false,
            });
          }}
          onCancel={() => {
            this.setState({
              collectedVisible: false,
            });
          }}
          width="50%"
          afterClose={() => {
            dispatch({
              type: `${DOMAIN}/updateState`,
              payload: {
                collectionDetailList: [],
              },
            });
          }}
          confirmLoading={loading.effects[`${DOMAIN}/getCollectionDetailById`]}
        >
          <DataTable
            columns={this.renderColumns1()}
            dataSource={collectionDetailList}
            prodSelection
            rowSelection={null}
            loading={loading.effects[`${DOMAIN}/getCollectionDetailById`]}
          />
        </Modal>

        <SearchTable
          wrapperInternalState={internalState => {
            this.setState({ getInternalState: internalState });
          }}
          defaultSortBy="id"
          defaultSortDirection="DESC"
          showSearchCardTitle={false}
          searchForm={this.renderSearchForm()}
          defaultSearchForm={{}}
          fetchData={this.fetchData}
          columns={this.renderColumns()}
          extraButtons={[
            {
              key: 'adjust',
              title: '????????????',
              type: 'primary',
              size: 'large',
              loading: false,
              cb: internalState => {
                const { selectedRowKeys, selectedRows } = internalState;
                const { id, invId, batchStatus, batchNo } = selectedRows[0];
                // ?????????????????????????????????
                if (!(!batchStatus || batchStatus === 'CREATE')) {
                  createMessage({
                    type: 'warn',
                    description: `??????????????????????????????????????????????????????`,
                  });
                  return;
                }

                // ?????????????????????????????????????????????
                if (batchNo) {
                  router.push(
                    `/workTable/sale/collectionPlan/edit?id=${invId}&invId=${invId}&mode=EDIT`
                  );
                  return;
                }

                // ?????????????????????
                router.push(`/workTable/sale/collectionPlan/edit?id=${id}&mode=EDIT`);
              },
              disabled: internalState => {
                const { selectedRowKeys } = internalState;
                return selectedRowKeys.length !== 1;
              },
            },
            {
              key: 'active',
              title: '????????????',
              type: 'primary',
              size: 'large',
              loading: false,
              cb: internalState => {
                const { selectedRowKeys, selectedRows } = internalState;
                const { saleId, id } = selectedRows[0];

                // ??????????????????
                dispatch({
                  type: `${DOMAIN}/getBankInfo`,
                  payload: {
                    id,
                  },
                });

                this.setState({
                  visible: true,
                  saleId,
                  collectionPlanId: id,
                });
              },
              disabled: internalState => {
                const { selectedRowKeys } = internalState;
                return selectedRowKeys.length !== 1;
              },
            },
          ]}
          tableExtraProps={{
            scroll: {
              x: 2500,
            },
          }}
        />
      </PageWrapper>
    );
  }
}

export default index;
