import React from 'react';
import { connect } from 'dva';
import { Switch, Modal } from 'antd';
import router from 'umi/router';
import { isEmpty } from 'ramda';
import SearchFormItem from '@/components/production/business/SearchFormItem';
import Link from '@/components/production/basic/Link';
import FormItem from '@/components/production/business/FormItem';
import PageWrapper from '@/components/production/layout/PageWrapper';
import SearchTable, { DataOutput } from '@/components/production/business/SearchTable';
import { outputHandle } from '@/utils/production/outputUtil';
import moment from 'moment';
import { remindString } from '@/components/production/basic/Remind';
import { createConfirm } from '@/components/core/Confirm';
import { fromQs } from '@/utils/production/stringUtil';
import {
  ProductTableColumnsBlockConfig,
  ProductSearchFormItemBlockConfig,
} from '@/utils/pageConfigUtils';

import {
  saleOrderPgingRq,
  saleOrderDeleteRq,
  saleOrderPartialRq,
} from '@/services/production/sale';
import createMessage from '@/components/core/AlertMessage';

const DOMAIN = 'saleOrder';

@connect(({ loading, dispatch, saleOrder }) => ({
  loading,
  dispatch,
  ...saleOrder,
}))
class index extends React.PureComponent {
  state = {};

  componentDidMount() {
    const { chargeBuId, chargeCompany, chargeProjectId, relatedProductId } = fromQs();
    this.setState({
      chargeBuId,
      chargeCompany,
      chargeProjectId,
      relatedProductId,
    });
    const { dispatch } = this.props;
    // dispatch({
    //   type: `${DOMAIN}/getPageConfig`,
    //   payload: { pageNo: 'WEEKLY_REPORT_LIST' },
    // });

    // 客户列表
    dispatch({
      type: `${DOMAIN}/getCustomerList`,
    });
  }

  fetchData = async params => {
    const { createTime, ...restparams } = params;

    if (Array.isArray(createTime) && (createTime[0] || createTime[1])) {
      [restparams.startDate, restparams.endDate] = createTime;
    }

    const { response } = await saleOrderPgingRq(restparams);
    return response.data;
  };

  changeStatus = async parmars => {
    const { response } = await saleOrderPartialRq(parmars);
    return response.data;
  };

  deleteData = async keys =>
    outputHandle(saleOrderDeleteRq, { ids: keys.join(',') }, undefined, false);

  renderColumns = () => {
    const { pageConfig } = this.props;

    const fields = [
      {
        title: '销售单编号',
        key: 'soNo',
        dataIndex: 'soNo',
        align: 'center',
        render: (value, row) => (
          <Link
            onClick={() =>
              router.push(`/workTable/sale/saleOrder/detail?id=${row.id}&mode=DESCRIPTION`)
            }
          >
            {value}
          </Link>
        ),
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
        title: '销售单类型',
        key: 'saleType',
        dataIndex: 'saleTypeDesc',
        align: 'center',
      },
      {
        title: '状态',
        key: 'soStatus',
        dataIndex: 'soStatusDesc',
        align: 'center',
      },
      {
        title: '总金额',
        key: 'baseCurrencyAmt',
        dataIndex: 'baseCurrencyAmt',
        align: 'center',
        render: val => (val ? val.toFixed(2) : ''),
      },
      {
        title: '相关合同',
        key: 'relatedContractId',
        dataIndex: 'relatedContractIdDesc',
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
        title: '相关项目',
        key: 'collectionProjectId',
        dataIndex: 'collectionProjectIdDesc',
        align: 'center',
      },
      {
        title: '相关产品',
        key: 'relatedProductId',
        dataIndex: 'relatedProductIdDesc',
        align: 'center',
      },
      {
        title: '销售负责人',
        key: 'inchargeSaleId',
        dataIndex: 'inchargeSaleIdDesc',
        align: 'center',
      },
      {
        title: '创建人',
        key: 'createUserId',
        dataIndex: 'createUserIdDesc',
        align: 'center',
      },
      {
        title: '创建日期',
        key: 'createTime',
        dataIndex: 'createTime',
        align: 'center',
      },
    ];

    // const fieldsConfig = ProductTableColumnsBlockConfig(
    //   pageConfig,
    //   'blockKey',
    //   'WEEKLY_REPORT_LIST_TABLE_COLUMNS',
    //   fields
    // );

    return fields;
  };

  renderSearchForm = () => {
    const { pageConfig, customerList } = this.props;

    const fields = [
      <SearchFormItem
        label="名称/编号"
        key="soNameOrNo"
        fieldKey="soNameOrNo"
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
        label="合同编号/名称"
        key="relatedContractNoOrName"
        fieldKey="relatedContractNoOrName"
        fieldType="BaseInput"
        defaultShow
      />,
      <SearchFormItem
        label="状态"
        key="soStatus"
        fieldKey="soStatus"
        fieldType="BaseSelect"
        parentKey="COM:DOC_STATUS"
        defaultShow
      />,
      <SearchFormItem
        label="销售负责人"
        key="inchargeSaleId"
        fieldKey="inchargeSaleId"
        fieldType="ResSimpleSelect"
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
        label="创建人"
        key="createUserId1"
        fieldKey="createUserId1"
        fieldType="UserSimpleSelect"
        defaultShow
      />,
      <SearchFormItem
        label="创建时间"
        key="createTime"
        fieldKey="createTime"
        fieldType="BaseDateRangePicker"
        defaultShow
      />,
      <SearchFormItem
        label="相关项目"
        key="collectionProjectId"
        fieldKey="collectionProjectId"
        fieldType="ProjectSimpleSelect"
        defaultShow
      />,
      <SearchFormItem
        label="相关产品"
        key="relatedProductId"
        fieldKey="relatedProductId"
        fieldType="ProductSimpleSelect"
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

  render() {
    const {
      getInternalState,
      chargeBuId,
      chargeCompany,
      chargeProjectId,
      relatedProductId,
    } = this.state;

    return (
      <PageWrapper>
        <SearchTable
          wrapperInternalState={internalState => {
            this.setState({ getInternalState: internalState });
          }}
          defaultSortBy="id"
          defaultSortDirection="DESC"
          showSearchCardTitle={false}
          searchForm={this.renderSearchForm()}
          defaultSearchForm={{
            collectionProjectId: chargeProjectId,
            collectionCompany: chargeCompany,
            collectionBuId: chargeBuId,
            relatedProductId,
          }}
          fetchData={this.fetchData}
          columns={this.renderColumns()}
          tableExtraProps={{ scroll: { x: 2400 } }}
          onAddClick={() => {
            if (chargeBuId) {
              //判断是否是从相关概览跳转到采购页，如果是点击新增的时候把对应的数据带过去
              router.push(
                `/workTable/sale/saleOrder/edit?mode=EDIT&collectionProjectId=${chargeProjectId}&collectionCompany=${chargeCompany}&collectionBuId=${chargeBuId}&relatedProductId=${relatedProductId}`
              );
            } else {
              router.push(`/workTable/sale/saleOrder/edit?mode=EDIT`);
            }
          }}
          onEditClick={data => {
            const { selectedRows } = getInternalState();
            const tt = selectedRows.filter(v => v.soStatus !== 'CREATE');
            if (!isEmpty(tt)) {
              createMessage({
                type: 'warn',
                description: `仅“新建”状态允许修改！`,
              });
              return;
            }

            router.push(`/workTable/sale/saleOrder/edit?id=${data.id}&mode=EDIT`);
          }}
          deleteData={data => {
            const { selectedRows } = getInternalState();
            const tt = selectedRows.filter(v => v.soStatus !== 'CREATE');
            if (!isEmpty(tt)) {
              createMessage({
                type: 'warn',
                description: remindString({
                  remindCode: 'COM:ALLOW_DELETE_CHECK',
                  defaultMessage: `仅“新建”状态的数据表允许删除！`,
                }),
              });
              return Promise.resolve({ ok: false });
            }
            return this.deleteData(data);
          }}
          extraButtons={[
            {
              key: 'adjust',
              title: '调整',
              type: 'primary',
              size: 'large',
              loading: false,
              cb: internalState => {
                // eslint-disable-next-line no-console
                const { selectedRowKeys, selectedRows } = internalState;
                const tt = selectedRows.filter(v => v.soStatus !== 'ACTIVE');
                if (!isEmpty(tt)) {
                  createMessage({
                    type: 'warn',
                    description: `仅已激活的数据才能调整！`,
                  });
                  return;
                }
                router.push(
                  `/workTable/sale/saleOrder/adjust?id=${selectedRows[0].id}&mode=EDIT&scene=adjust`
                );
              },
              disabled: internalState => {
                const { selectedRowKeys } = internalState;
                return selectedRowKeys.length !== 1;
              },
            },
            {
              key: 'active',
              title: '激活',
              type: 'primary',
              size: 'large',
              loading: false,
              cb: internalState => {
                const { selectedRowKeys, selectedRows } = internalState;
                const tt = selectedRows.filter(v => v.soStatus !== 'CLOSE');
                if (!isEmpty(tt)) {
                  createMessage({
                    type: 'warn',
                    description: `仅已关闭的数据才能激活！`,
                  });
                  return;
                }

                createConfirm({
                  content: remindString({
                    remindCode: 'COM:W:REACTIVE_WARN',
                    defaultMessage: '继续操作将重新激活选中的数据，请确认是否继续？',
                  }),
                  onOk: () => {
                    this.changeStatus({
                      id: selectedRowKeys.join(','),
                      soStatus: 'ACTIVE',
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
              title: '关闭',
              type: 'primary',
              size: 'large',
              loading: false,
              cb: internalState => {
                const { selectedRowKeys, selectedRows } = internalState;
                const tt = selectedRows.filter(v => v.soStatus !== 'ACTIVE');
                if (!isEmpty(tt)) {
                  createMessage({
                    type: 'warn',
                    description: `仅已激活的合同才能关闭！`,
                  });
                  return;
                }

                createConfirm({
                  content: remindString({
                    remindCode: 'COM:W:CLOSE_WARN',
                    defaultMessage: '继续操作将关闭选中的数据，请确认是否继续？',
                  }),
                  onOk: () => {
                    this.changeStatus({
                      id: selectedRowKeys.join(','),
                      soStatus: 'CLOSE',
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
          ]}
        />
      </PageWrapper>
    );
  }
}

export default index;
