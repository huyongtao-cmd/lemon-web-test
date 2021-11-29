import React from 'react';
import { connect } from 'dva';
import { Form, Modal } from 'antd';
import router from 'umi/router';
import { isNil, isEmpty } from 'ramda';
import moment from 'moment';
import SearchFormItem from '@/components/production/business/SearchFormItem';
import Link from '@/components/production/basic/Link';
import PageWrapper from '@/components/production/layout/PageWrapper';
import { createConfirm } from '@/components/core/Confirm';
import SearchTable, { DataOutput } from '@/components/production/business/SearchTable';
import createMessage from '@/components/core/AlertMessage';
import { outputHandle } from '@/utils/production/outputUtil';
import {
  ProductTableColumnsBlockConfig,
  ProductSearchFormItemBlockConfig,
} from '@/utils/pageConfigUtils';
import ReceiptsModal from './component/ReceiptsModal';

// @ts-ignore
import {
  willPayPagingRq,
  willPayDeleteRq,
  insertWillPayToU8cRq,
} from '@/services/production/interface';

const DOMAIN = 'willPay';

@connect(({ loading, dispatch, willPay }) => ({
  treeLoading: loading.effects[`${DOMAIN}/init`],
  dispatch,
  ...willPay,
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
      type: `${DOMAIN}/updateForm`,
      payload: newFieldData,
    });
  },
})
class willPayList extends React.PureComponent {
  state = {};

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'PROJECT_TABLE' },
    });
  }

  fetchData = async params => {
    const { syncTime, ...restParams } = params;
    if (Array.isArray(syncTime) && (syncTime[0] && syncTime[1])) {
      [restParams.syncTimeStart, restParams.syncTimeEnd] = syncTime;
    }

    const { response } = await willPayPagingRq(restParams);
    return response.data;
  };

  deleteData = async keys =>
    outputHandle(willPayDeleteRq, { ids: keys.join(',') }, undefined, false);

  changeStatus = async parmars => {
    const { response } = await insertWillPayToU8cRq(parmars);
    return response;
  };
  // 行编辑触发事件

  onCellChanged = (index, value, name) => {
    const {
      formData: { dataList },
      dispatch,
    } = this.props;

    const newDataSource = dataList;
    newDataSource[index] = {
      ...newDataSource[index],
      [name]: value,
    };
    dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: { dataList: newDataSource },
    });
  };

  renderSearchForm = () => {
    const { pageConfig } = this.props;

    const fields = [
      <SearchFormItem
        label="单据号"
        fieldType="BaseInput"
        key="djbh"
        fieldKey="djbh"
        defaultShow
      />,
      <SearchFormItem
        label="公司"
        fieldType="InternalOuSimpleSelect"
        key="dwbm"
        fieldKey="dwbm"
        transfer={{ code: 'abNo', name: 'ouName' }}
        defaultShow
      />,
      <SearchFormItem
        label="单据日期"
        fieldType="BaseDateRangePicker"
        key="djrq"
        fieldKey="djrq"
        defaultShow
      />,
      <SearchFormItem label="客商" fieldType="BaseInput" key="hbbm" fieldKey="hbbm" defaultShow />,

      <SearchFormItem
        label="同步状态"
        fieldType="BaseCustomSelect"
        key="syncStatus"
        fieldKey="syncStatus"
        parentKey="COM:DATA_SYNC:SYNC_STATUS"
        defaultShow
      />,
      <SearchFormItem
        label="同步时间"
        fieldType="BaseDateRangePicker"
        key="syncTime"
        fieldKey="syncTime"
        defaultShow
      />,
      <SearchFormItem
        label="本方银行帐号"
        key="bfyhzh"
        fieldKey="bfyhzh"
        fieldType="BaseInput"
        defaultShow
      />,
      <SearchFormItem
        label="币种"
        key="bzbm"
        fieldKey="bzbm"
        fieldType="BaseSelect"
        parentKey="COMMON_CURRENCY"
        defaultShow
      />,
      <SearchFormItem
        label="部门"
        key="deptid"
        fieldKey="deptid"
        fieldType="BuSimpleSelect"
        transfer={{ code: 'buNo', name: 'buName' }}
        defaultShow
      />,
      <SearchFormItem
        label="业务员"
        fieldType="BaseInput"
        key="ywybm"
        fieldKey="ywybm"
        defaultShow
      />,
      <SearchFormItem
        label="对方银行账号"
        fieldType="BaseInput"
        key="dfyhzh"
        fieldKey="dfyhzh"
        defaultShow
      />,
      <SearchFormItem
        label="交易类型"
        fieldType="BaseInput"
        key="djlxbm"
        fieldKey="djlxbm"
        defaultShow
      />,
      <SearchFormItem
        label="发票类型"
        fieldType="BaseInput"
        key="finvoicetype"
        fieldKey="finvoicetype"
        parentKey="COM:INV_TYPE"
        defaultShow
      />,

      <SearchFormItem label="科目" fieldType="BaseInput" key="kmbm" fieldKey="kmbm" defaultShow />,

      <SearchFormItem
        label="录入人"
        fieldType="ResSimpleSelect"
        key="lrr"
        fieldKey="lrr"
        transfer={{ code: 'mobile', name: 'resName' }}
        resStatus="3"
        defaultShow
      />,
      <SearchFormItem
        label="结算方式"
        fieldType="BaseInput"
        key="pjJsfs"
        fieldKey="pjJsfs"
        defaultShow
      />,
      <SearchFormItem
        label="票据号"
        fieldType="BaseInput"
        key="pjNum"
        fieldKey="pjNum"
        defaultShow
      />,
      <SearchFormItem
        key="prepay"
        label="预收付标志"
        fieldType="BaseRadioSelect"
        fieldKey="prepay"
        options={[{ label: '是', value: true }, { label: '否', value: false }]}
        defaultShow
      />,
      <SearchFormItem
        label="是期初"
        fieldType="BaseInput"
        key="qcbz"
        fieldKey="qcbz"
        defaultShow
      />,
      <SearchFormItem
        label="备注"
        fieldType="BaseInput"
        key="scomment"
        fieldKey="scomment"
        defaultShow
      />,
      <SearchFormItem
        label="收支项目"
        fieldType="BaseInput"
        key="szxmid"
        fieldKey="szxmid"
        defaultShow
      />,
      <SearchFormItem
        label="交易对象类型"
        fieldType="BaseInput"
        key="tradertype"
        fieldKey="tradertype"
        defaultShow
      />,
      <SearchFormItem
        label="往来对象标识"
        fieldType="BaseInput"
        key="wldx"
        fieldKey="wldx"
        defaultShow
      />,
      <SearchFormItem
        label="业务流程"
        fieldType="BaseInput"
        key="xslxbm"
        fieldKey="xslxbm"
        defaultShow
      />,
    ];

    const fieldsConfig = ProductSearchFormItemBlockConfig(
      pageConfig,
      'blockKey',
      'PROJECT_TABLE_SEARCHFORMITEM',
      fields
    );

    return fields;
  };

  renderColumns = () => {
    const { pageConfig } = this.props;
    const fields = [
      {
        key: 'djbh',
        title: '单据号',
        align: 'center',
        dataIndex: 'djbh',
        render: (value, row, index) => (
          <Link
            onClick={() =>
              // router.push(`/workTable/pur/purchaseDisplayPage?id=${row.id}&mode=DESCRIPTION`)
              router.push(`/plat/interface/willPay/detail?id=${row.id}&mode=DESCRIPTION`)
            }
          >
            {value}
          </Link>
        ),
      },
      {
        key: 'djrq',
        title: '单据日期',
        align: 'center',
        dataIndex: 'djrq',
      },
      {
        key: 'deptid',
        title: '部门',
        align: 'center',
        dataIndex: 'deptidDesc',
      },
      {
        key: 'ywybm',
        title: '业务员',
        align: 'center',
        dataIndex: 'ywybmDesc',
      },
      {
        key: 'bzbm',
        title: '币种',
        align: 'center',
        dataIndex: 'bzbmDesc',
      },
      {
        key: 'dwbm',
        title: '公司',
        align: 'center',
        dataIndex: 'dwbmDesc',
      },
      {
        key: 'hbbm',
        title: '客商',
        align: 'center',
        dataIndex: 'hbbmDesc',
      },
      {
        key: 'bfyhzh',
        title: '本方银行帐号',
        align: 'center',
        dataIndex: 'bfyhzh',
      },
      {
        key: 'dfyhzh',
        title: '对方银行账号',
        align: 'center',
        dataIndex: 'dfyhzh',
      },
      {
        key: 'djlxbm',
        title: '交易类型',
        align: 'center',
        dataIndex: 'djlxbmDesc',
      },
      {
        key: 'effectdate',
        title: '起算日期',
        align: 'center',
        dataIndex: 'effectdate',
      },
      {
        key: 'finvoicetype',
        title: '发票类型',
        align: 'center',
        dataIndex: 'finvoicetypeDesc',
      },
      {
        key: 'kmbm',
        title: '科目',
        align: 'center',
        dataIndex: 'kmbmDesc',
      },
      {
        key: 'lrr',
        title: '录入人',
        align: 'center',
        dataIndex: 'lrrDesc',
      },
      {
        key: 'pjJsfs',
        title: '结算方式',
        align: 'center',
        dataIndex: 'pjJsfsDesc',
      },
      {
        key: 'pjNum',
        title: '票据号',
        align: 'center',
        dataIndex: 'pjNum',
      },
      {
        key: 'prepay',
        title: '预收付标志',
        align: 'center',
        dataIndex: 'prepay',
        // eslint-disable-next-line no-nested-ternary
        render: val => (isNil(val) ? '' : val ? '是' : '否'),
      },
      {
        key: 'qcbz',
        title: '是否期初',
        align: 'center',
        dataIndex: 'qcbz',
      },
      {
        key: 'scomment',
        title: '备注',
        align: 'center',
        dataIndex: 'scomment',
      },
      {
        key: 'szxmid',
        title: '收支项目编码',
        align: 'center',
        dataIndex: 'szxmid',
      },
      {
        key: 'tradertype',
        title: '交易对象类型',
        align: 'center',
        dataIndex: 'tradertypeDesc',
      },
      {
        key: 'wldx',
        title: '往来对象标识',
        align: 'center',
        dataIndex: 'wldxDesc',
      },
      {
        key: 'xslxbm',
        title: '业务流程编码',
        align: 'center',
        dataIndex: 'xslxbm',
      },
      {
        key: 'syncStatus',
        title: '同步状态',
        align: 'center',
        dataIndex: 'syncStatusDesc',
      },
      {
        key: 'syncTime',
        title: '同步时间',
        align: 'center',
        dataIndex: 'syncTime',
      },
      {
        key: 'createTime',
        title: '创建时间',
        align: 'center',
        dataIndex: 'createTime',
      },
    ];

    // const fieldsConfig = ProductTableColumnsBlockConfig(
    //   pageConfig,
    //   'blockKey',
    //   'PROJECT_TABLE_COLUMNS',
    //   fields
    // );

    return fields;
  };

  render() {
    const {
      loading,
      dispatch,
      formData: { dataList },
      form,
      deleteKeys,
    } = this.props;
    const { getInternalState } = this.state;
    const urlPathname = window.location.pathname;

    return (
      <PageWrapper>
        <ReceiptsModal url={urlPathname} />
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
          tableExtraProps={{ scroll: { x: 4000 } }}
          onAddClick={() => router.push('/plat/interface/willPay/edit')}
          onEditClick={data => {
            const { selectedRows } = getInternalState();
            const tt = selectedRows.filter(v => v.syncStatus === 'SYNCED');
            if (!isEmpty(tt)) {
              createMessage({
                type: 'warn',
                description: '已同步状态的数据不能修改！',
              });
              return;
            }
            router.push(`/plat/interface/willPay/edit?id=${data.id}&mode=EDIT`);
          }}
          deleteData={data => {
            const { selectedRows } = getInternalState();
            const tt = selectedRows.filter(v => v.syncStatus === 'SYNCED');
            if (!isEmpty(tt)) {
              createMessage({
                type: 'warn',
                description: '已同步状态的数据不能删除！',
              });
              return Promise.resolve({ ok: false });
            }
            return this.deleteData(data);
          }}
          // tableExtraProps={{
          //   scroll: {
          //     x: 4000,
          //   },
          // }}
          extraButtons={[
            {
              key: 'sync',
              title: '同步',
              type: 'primary',
              size: 'large',
              loading: false,
              icon: 'sync',
              cb: internalState => {
                // eslint-disable-next-line no-console
                const { selectedRowKeys, selectedRows } = internalState;
                const tt = selectedRows.filter(v => v.syncStatus === 'SYNCED');
                if (!isEmpty(tt)) {
                  createMessage({
                    type: 'warn',
                    description: `已同步成功的数据不能再同步！`,
                  });
                  return;
                }

                this.changeStatus({
                  ids: selectedRowKeys.join(','),
                }).then(res => {
                  if (res && res.ok) {
                    createMessage({
                      type: 'success',
                      description: `同步成功！`,
                    });

                    const { refreshData } = internalState;
                    refreshData();
                  } else {
                    createMessage({
                      type: 'error',
                      description: `同步失败！` + res.errors[0].msg,
                    });
                    const { refreshData } = internalState;
                    refreshData();
                  }
                });
              },
              disabled: internalState => {
                const { selectedRowKeys } = internalState;
                return !selectedRowKeys.length;
              },
            },
            {
              key: 'adjust',
              title: '调整单据日期',
              type: 'primary',
              size: 'large',
              loading: false,
              icon: 'adjust',
              cb: internalState => {
                const { selectedRowKeys, selectedRows } = internalState;
                const tt = selectedRows.filter(v => v.syncStatus === 'SYNCED');
                if (!isEmpty(tt)) {
                  createMessage({
                    type: 'warn',
                    description: `仅允许修改未同步记录的单据日期！已同步的记录请到用友系统中修改`,
                  });
                  return;
                }
                dispatch({
                  type: `${DOMAIN}/updateState`,
                  payload: {
                    receiptsVisible: true,
                    selectedRows,
                  },
                });
              },
              disabled: internalState => {
                const { selectedRowKeys } = internalState;
                return !selectedRowKeys.length;
              },
            },
          ]}
        />
      </PageWrapper>
    );
  }
}

export default willPayList;
