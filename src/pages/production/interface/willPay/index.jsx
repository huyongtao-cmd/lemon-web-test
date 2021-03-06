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
  // ?????????????????????

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
        label="?????????"
        fieldType="BaseInput"
        key="djbh"
        fieldKey="djbh"
        defaultShow
      />,
      <SearchFormItem
        label="??????"
        fieldType="InternalOuSimpleSelect"
        key="dwbm"
        fieldKey="dwbm"
        transfer={{ code: 'abNo', name: 'ouName' }}
        defaultShow
      />,
      <SearchFormItem
        label="????????????"
        fieldType="BaseDateRangePicker"
        key="djrq"
        fieldKey="djrq"
        defaultShow
      />,
      <SearchFormItem label="??????" fieldType="BaseInput" key="hbbm" fieldKey="hbbm" defaultShow />,

      <SearchFormItem
        label="????????????"
        fieldType="BaseCustomSelect"
        key="syncStatus"
        fieldKey="syncStatus"
        parentKey="COM:DATA_SYNC:SYNC_STATUS"
        defaultShow
      />,
      <SearchFormItem
        label="????????????"
        fieldType="BaseDateRangePicker"
        key="syncTime"
        fieldKey="syncTime"
        defaultShow
      />,
      <SearchFormItem
        label="??????????????????"
        key="bfyhzh"
        fieldKey="bfyhzh"
        fieldType="BaseInput"
        defaultShow
      />,
      <SearchFormItem
        label="??????"
        key="bzbm"
        fieldKey="bzbm"
        fieldType="BaseSelect"
        parentKey="COMMON_CURRENCY"
        defaultShow
      />,
      <SearchFormItem
        label="??????"
        key="deptid"
        fieldKey="deptid"
        fieldType="BuSimpleSelect"
        transfer={{ code: 'buNo', name: 'buName' }}
        defaultShow
      />,
      <SearchFormItem
        label="?????????"
        fieldType="BaseInput"
        key="ywybm"
        fieldKey="ywybm"
        defaultShow
      />,
      <SearchFormItem
        label="??????????????????"
        fieldType="BaseInput"
        key="dfyhzh"
        fieldKey="dfyhzh"
        defaultShow
      />,
      <SearchFormItem
        label="????????????"
        fieldType="BaseInput"
        key="djlxbm"
        fieldKey="djlxbm"
        defaultShow
      />,
      <SearchFormItem
        label="????????????"
        fieldType="BaseInput"
        key="finvoicetype"
        fieldKey="finvoicetype"
        parentKey="COM:INV_TYPE"
        defaultShow
      />,

      <SearchFormItem label="??????" fieldType="BaseInput" key="kmbm" fieldKey="kmbm" defaultShow />,

      <SearchFormItem
        label="?????????"
        fieldType="ResSimpleSelect"
        key="lrr"
        fieldKey="lrr"
        transfer={{ code: 'mobile', name: 'resName' }}
        resStatus="3"
        defaultShow
      />,
      <SearchFormItem
        label="????????????"
        fieldType="BaseInput"
        key="pjJsfs"
        fieldKey="pjJsfs"
        defaultShow
      />,
      <SearchFormItem
        label="?????????"
        fieldType="BaseInput"
        key="pjNum"
        fieldKey="pjNum"
        defaultShow
      />,
      <SearchFormItem
        key="prepay"
        label="???????????????"
        fieldType="BaseRadioSelect"
        fieldKey="prepay"
        options={[{ label: '???', value: true }, { label: '???', value: false }]}
        defaultShow
      />,
      <SearchFormItem
        label="?????????"
        fieldType="BaseInput"
        key="qcbz"
        fieldKey="qcbz"
        defaultShow
      />,
      <SearchFormItem
        label="??????"
        fieldType="BaseInput"
        key="scomment"
        fieldKey="scomment"
        defaultShow
      />,
      <SearchFormItem
        label="????????????"
        fieldType="BaseInput"
        key="szxmid"
        fieldKey="szxmid"
        defaultShow
      />,
      <SearchFormItem
        label="??????????????????"
        fieldType="BaseInput"
        key="tradertype"
        fieldKey="tradertype"
        defaultShow
      />,
      <SearchFormItem
        label="??????????????????"
        fieldType="BaseInput"
        key="wldx"
        fieldKey="wldx"
        defaultShow
      />,
      <SearchFormItem
        label="????????????"
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
        title: '?????????',
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
        title: '????????????',
        align: 'center',
        dataIndex: 'djrq',
      },
      {
        key: 'deptid',
        title: '??????',
        align: 'center',
        dataIndex: 'deptidDesc',
      },
      {
        key: 'ywybm',
        title: '?????????',
        align: 'center',
        dataIndex: 'ywybmDesc',
      },
      {
        key: 'bzbm',
        title: '??????',
        align: 'center',
        dataIndex: 'bzbmDesc',
      },
      {
        key: 'dwbm',
        title: '??????',
        align: 'center',
        dataIndex: 'dwbmDesc',
      },
      {
        key: 'hbbm',
        title: '??????',
        align: 'center',
        dataIndex: 'hbbmDesc',
      },
      {
        key: 'bfyhzh',
        title: '??????????????????',
        align: 'center',
        dataIndex: 'bfyhzh',
      },
      {
        key: 'dfyhzh',
        title: '??????????????????',
        align: 'center',
        dataIndex: 'dfyhzh',
      },
      {
        key: 'djlxbm',
        title: '????????????',
        align: 'center',
        dataIndex: 'djlxbmDesc',
      },
      {
        key: 'effectdate',
        title: '????????????',
        align: 'center',
        dataIndex: 'effectdate',
      },
      {
        key: 'finvoicetype',
        title: '????????????',
        align: 'center',
        dataIndex: 'finvoicetypeDesc',
      },
      {
        key: 'kmbm',
        title: '??????',
        align: 'center',
        dataIndex: 'kmbmDesc',
      },
      {
        key: 'lrr',
        title: '?????????',
        align: 'center',
        dataIndex: 'lrrDesc',
      },
      {
        key: 'pjJsfs',
        title: '????????????',
        align: 'center',
        dataIndex: 'pjJsfsDesc',
      },
      {
        key: 'pjNum',
        title: '?????????',
        align: 'center',
        dataIndex: 'pjNum',
      },
      {
        key: 'prepay',
        title: '???????????????',
        align: 'center',
        dataIndex: 'prepay',
        // eslint-disable-next-line no-nested-ternary
        render: val => (isNil(val) ? '' : val ? '???' : '???'),
      },
      {
        key: 'qcbz',
        title: '????????????',
        align: 'center',
        dataIndex: 'qcbz',
      },
      {
        key: 'scomment',
        title: '??????',
        align: 'center',
        dataIndex: 'scomment',
      },
      {
        key: 'szxmid',
        title: '??????????????????',
        align: 'center',
        dataIndex: 'szxmid',
      },
      {
        key: 'tradertype',
        title: '??????????????????',
        align: 'center',
        dataIndex: 'tradertypeDesc',
      },
      {
        key: 'wldx',
        title: '??????????????????',
        align: 'center',
        dataIndex: 'wldxDesc',
      },
      {
        key: 'xslxbm',
        title: '??????????????????',
        align: 'center',
        dataIndex: 'xslxbm',
      },
      {
        key: 'syncStatus',
        title: '????????????',
        align: 'center',
        dataIndex: 'syncStatusDesc',
      },
      {
        key: 'syncTime',
        title: '????????????',
        align: 'center',
        dataIndex: 'syncTime',
      },
      {
        key: 'createTime',
        title: '????????????',
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
                description: '???????????????????????????????????????',
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
                description: '???????????????????????????????????????',
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
              title: '??????',
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
                    description: `??????????????????????????????????????????`,
                  });
                  return;
                }

                this.changeStatus({
                  ids: selectedRowKeys.join(','),
                }).then(res => {
                  if (res && res.ok) {
                    createMessage({
                      type: 'success',
                      description: `???????????????`,
                    });

                    const { refreshData } = internalState;
                    refreshData();
                  } else {
                    createMessage({
                      type: 'error',
                      description: `???????????????` + res.errors[0].msg,
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
              title: '??????????????????',
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
                    description: `?????????????????????????????????????????????????????????????????????????????????????????????`,
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
