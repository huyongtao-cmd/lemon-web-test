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

    // 客户列表
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
        title: '销售单编号',
        key: 'soNo',
        dataIndex: 'soNo',
        align: 'center',
        // render: (value, row) => (
        //   <Link
        //     onClick={() => {
        //       const { invId, id } = row;
        //       // 有开批次号，标识已经执行过保存
        //       if (invId) {
        //         router.push(
        //           `/workTable/sale/collectionPlan/detail?id=${invId}&invId=${invId}&mode=DESCRIPTION`
        //         );
        //         return;
        //       }

        //       // 跳转到新增页面
        //       router.push(`/workTable/sale/collectionPlan/detail?id=${id}&mode=DESCRIPTION`);
        //     }}
        //   >
        //     {value}
        //   </Link>
        // ),
      },
      {
        title: '销售单名称',
        key: 'soName',
        dataIndex: 'soName',
        align: 'center',
      },
      {
        title: '客户名称',
        key: 'custId',
        dataIndex: 'custIdDesc',
        align: 'center',
      },
      {
        title: '参考合同号',
        key: 'refContractNo',
        dataIndex: 'refContractNo',
        align: 'center',
      },
      {
        title: '收款阶段',
        key: 'collectionStage',
        dataIndex: 'collectionStage',
        align: 'center',
      },
      {
        title: '当期金额',
        key: 'collectionAmt',
        dataIndex: 'collectionAmt',
        align: 'right',
        render: val => (val ? val.toFixed(2) : ''),
      },
      {
        title: '比例',
        key: 'collectionRate',
        dataIndex: 'collectionRate',
        align: 'center',
        render: val => (val ? `${val}%` : ''),
      },
      {
        title: '预计收款日期',
        key: 'expectedCollectionDate',
        dataIndex: 'expectedCollectionDate',
        align: 'center',
      },
      {
        title: '实际收款日期',
        key: 'actualRecvDate',
        dataIndex: 'actualRecvDate',
        align: 'center',
      },
      {
        title: '收款状态',
        key: 'collectionStatus',
        dataIndex: 'collectionStatusDesc',
        align: 'center',
      },
      {
        title: '已收款金额',
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
        title: '未收款金额',
        key: 'unCollectAmt',
        dataIndex: 'unCollectAmt',
        align: 'right',
        render: val => (val ? val.toFixed(2) : ''),
      },
      {
        title: '最近收款日期',
        key: 'latestCollectionDate',
        dataIndex: 'latestCollectionDate',
        align: 'center',
      },
      {
        title: '开票批次号',
        key: 'batchNo',
        dataIndex: 'batchNo',
        align: 'center',
        render: (value, row) => {
          const { invId } = row;
          return invId ? (
            <Link
              onClick={() => {
                // 有开票批次号，点击跳转到开票批次详情
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
        title: '开票状态',
        key: 'batchStatus',
        dataIndex: 'batchStatusDesc',
        align: 'center',
      },
      {
        title: '发票号',
        key: 'invNos',
        dataIndex: 'invNos',
        align: 'center',
      },
      {
        title: '已开票金额',
        key: 'invAmt',
        dataIndex: 'invAmt',
        align: 'right',
        render: val => (val ? val.toFixed(2) : ''),
      },
      {
        title: '开票日期',
        key: 'batchDate',
        dataIndex: 'batchDate',
        align: 'center',
      },
      {
        title: '签单公司',
        key: 'collectionCompany',
        dataIndex: 'collectionCompanyDesc',
        align: 'center',
      },
      {
        title: '签单部门',
        key: 'collectionBuId',
        dataIndex: 'collectionBuIdDesc',
        align: 'center',
      },
      {
        title: '销售负责人',
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
        label="销售单编号"
        key="soNo"
        fieldKey="soNo"
        fieldType="BaseInput"
        defaultShow
      />,
      <SearchFormItem
        label="销售单名称"
        key="soName"
        fieldKey="soName"
        fieldType="BaseInput"
        defaultShow
      />,
      <SearchFormItem
        label="客户名称"
        key="custId"
        fieldKey="custId"
        fieldType="BaseSelect"
        descList={customerList}
        defaultShow
      />,
      <SearchFormItem
        label="收款阶段"
        key="collectionStage"
        fieldKey="collectionStage"
        fieldType="BaseInput"
        defaultShow
      />,
      <SearchFormItem
        label="开票状态"
        key="batchStatus"
        fieldKey="batchStatus"
        fieldType="BaseCustomSelect"
        parentKey="FUNCTION:SALE:SALE_INV_BATCH_STATUS"
        defaultShow
      />,
      <SearchFormItem
        label="收款状态"
        key="collectionStatus"
        fieldKey="collectionStatus"
        fieldType="BaseCustomSelect"
        parentKey="FUNCTION:SALE:COLLECTION_STATUS"
        defaultShow
      />,
      <SearchFormItem
        label="签单公司"
        key="collectionCompany"
        fieldKey="collectionCompany"
        fieldType="BaseCustomSelect"
        parentKey="CUS:INTERNAL_COMPANY"
        defaultShow
      />,
      <SearchFormItem
        label="签单部门"
        key="collectionBuId"
        fieldKey="collectionBuId"
        fieldType="BuSimpleSelect"
        defaultShow
      />,
      <SearchFormItem
        label="预计收款日期"
        key="date"
        fieldKey="date"
        fieldType="BaseDateRangePicker"
        defaultShow
      />,
      <SearchFormItem
        label="销售负责人"
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
        title: '收款金额(含税)',
        dataIndex: 'collectionAmt',
        align: 'right',
      },
      {
        title: '收款日期',
        align: 'center',
        dataIndex: 'collectionDate',
      },
      {
        title: '银行账号',
        align: 'center',
        dataIndex: 'collectionBankNo',
      },
      {
        title: '备注',
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
          title="收款基本信息"
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
                label="收款金额(含税)"
                key="collectionAmt"
                fieldKey="collectionAmt"
                fieldType="BaseInputAmt"
                initialValue={formData.collectionAmt}
                required
              />
              <FormItem
                label="收款日期"
                key="collectionDate"
                fieldKey="collectionDate"
                fieldType="BaseDatePicker"
                initialValue={formData.collectionDate}
                required
              />
              <FormItem
                label="收款方式"
                key="collectionMethod"
                fieldKey="collectionMethod"
                fieldType="BaseUdcSelect"
                udcCode="ACC:PAY_METHOD"
                initialValue={formData.collectionMethod}
                required
              />
              <FormItem
                label="银行账号"
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
              <FormItem fieldType="BaseInput" label="户名" disabled fieldKey="holderName" />
              <FormItem fieldType="BaseInput" label="收款银行" disabled fieldKey="bankName" />
              <FormItem fieldType="BaseInput" label="收款银行网点" disabled fieldKey="bankBranch" />
              <FormItem
                label="备注"
                fieldKey="remark"
                key="remark"
                fieldType="BaseInputTextArea"
                initialValue={formData.remark}
              />
            </BusinessForm>
          </div>
        </Modal>

        <Modal
          title="收款明细信息"
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
              title: '申请开票',
              type: 'primary',
              size: 'large',
              loading: false,
              cb: internalState => {
                const { selectedRowKeys, selectedRows } = internalState;
                const { id, invId, batchStatus, batchNo } = selectedRows[0];
                // 有开批次号，已经开过票
                if (!(!batchStatus || batchStatus === 'CREATE')) {
                  createMessage({
                    type: 'warn',
                    description: `只有未开过票的数据才能进行开票操作！`,
                  });
                  return;
                }

                // 有开批次号，标识已经执行过保存
                if (batchNo) {
                  router.push(
                    `/workTable/sale/collectionPlan/edit?id=${invId}&invId=${invId}&mode=EDIT`
                  );
                  return;
                }

                // 跳转到新增页面
                router.push(`/workTable/sale/collectionPlan/edit?id=${id}&mode=EDIT`);
              },
              disabled: internalState => {
                const { selectedRowKeys } = internalState;
                return selectedRowKeys.length !== 1;
              },
            },
            {
              key: 'active',
              title: '收款录入',
              type: 'primary',
              size: 'large',
              loading: false,
              cb: internalState => {
                const { selectedRowKeys, selectedRows } = internalState;
                const { saleId, id } = selectedRows[0];

                // 银行列表列表
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
