import React, { PureComponent } from 'react';
import { Button, Card, Input, Select } from 'antd';
import { connect } from 'dva';
import Link from 'umi/link';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import router from 'umi/router';
import { Selection, DatePicker } from '@/pages/gen/field';
import DataTable from '@/components/common/DataTable';
import createMessage from '@/components/core/AlertMessage';
import { selectSubContract, recvPlanSelect } from '@/services/user/Contract/sales';
import { selectProjectConditional } from '@/services/user/project/project';
import { selectLedgerConditional } from '@/services/user/equivalent/equivalent';

const DOMAIN = 'generalAmtSettleList';
const SEL_COL = [
  // span为宽度。 合计不要超过24
  { dataIndex: 'code', title: '编号', span: 10 },
  { dataIndex: 'name', title: '名称', span: 14 },
];

@connect(({ loading, generalAmtSettleList, dispatch, user }) => ({
  loading,
  ...generalAmtSettleList,
  dispatch,
  user,
  // loading: loading.effects['namespace/submodule'], // 菊花旋转等待数据源(领域空间/子模块)
}))
@mountToTab()
class GeneralAmtSettleList extends PureComponent {
  componentDidMount() {
    this.fetchData({ offset: 0, limit: 10 });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: params });
  };

  tablePropsConfig = () => {
    const { loading, list, total, searchForm, dispatch } = this.props;
    const loadingStatus = loading.effects[`${DOMAIN}/query`];

    const tableProps = {
      rowKey: 'id', // eslint-disable-line
      columnsCache: DOMAIN,
      loading: loadingStatus,
      total,
      dataSource: list,
      onChange: filters => this.fetchData(filters),
      onSearchBarChange: (changedValues, allValues) => {},
      searchBarForm: [
        {
          title: '单据号',
          dataIndex: 'settleNo',
          options: {
            initialValue: searchForm.settleNo,
          },
          tag: <Input allowClear placeholder="请输入单据号" />,
        },
        {
          title: '单据创建类型',
          dataIndex: 'createType',
          tag: <Selection.UDC code="ACC.CREATE_TYPE" placeholder="请选择单据创建类型" />,
        },
        {
          title: '业务类型',
          dataIndex: 'busiType',
          tag: <Selection.UDC code="ACC.NORM_SETTLE_TYPE" placeholder="请选择业务类型" />,
        },
        {
          title: '相关子合同',
          dataIndex: 'contractId',
          tag: (
            <Selection.Columns
              className="x-fill-100"
              source={() => selectSubContract()}
              columns={SEL_COL}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              dropdownStyle={{ width: 440 }}
              showSearch
            />
          ),
        },
        {
          title: '相关项目',
          dataIndex: 'projId',
          tag: (
            <Selection.Columns
              className="x-fill-100"
              source={() => selectProjectConditional({})}
              columns={SEL_COL}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              dropdownStyle={{ width: 440 }}
              showSearch
            />
          ),
        },
        {
          title: '支出账户',
          dataIndex: 'outAccount',
          tag: (
            <Selection.Columns
              className="x-fill-100"
              source={() => selectLedgerConditional({ auTypes: "'BU','PROJ'" })}
              columns={SEL_COL}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              dropdownStyle={{ width: 440 }}
              showSearch
            />
          ),
        },
        {
          title: '收入账户',
          dataIndex: 'inAccount',
          tag: (
            <Selection.Columns
              className="x-fill-100"
              source={() => selectLedgerConditional({ auTypes: "'BU','PROJ'" })}
              columns={SEL_COL}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              dropdownStyle={{ width: 440 }}
              showSearch
            />
          ),
        },
        {
          title: '交易日期',
          dataIndex: 'settleDate',
          tag: <DatePicker.RangePicker format="YYYY-MM-DD" />,
        },
        {
          title: '结算状态',
          dataIndex: 'settleStatus',
          tag: <Selection.UDC code="ACC.NORM_SETTLE_STATUS" placeholder="请选择结算状态" />,
        },
      ],
      columns: [
        {
          title: '单据号',
          dataIndex: 'settleNo',
          render: (value, rowData) => {
            const { id } = rowData;
            const href = `/plat/intelStl/GeneralAmtSettleDetail?id=${id}`;
            return (
              <Link className="tw-link" to={href}>
                {value}
              </Link>
            );
          },
        },
        {
          title: '单据创建人',
          dataIndex: 'applyResName',
        },
        {
          title: '业务类型',
          dataIndex: 'busiTypeDesc',
        },
        {
          title: '交易总额',
          dataIndex: 'approveSettleAmt',
        },
        {
          title: '相关业务单据号',
          dataIndex: 'relevNo',
        },
        {
          title: '相关子合同',
          dataIndex: 'contractName',
        },
        {
          title: '收款号',
          dataIndex: 'recvplanName',
        },
        {
          title: '相关项目',
          dataIndex: 'projName',
        },
        {
          title: '支出方账户',
          dataIndex: 'outAccountName',
        },
        {
          title: '收入方账户',
          dataIndex: 'inAccountName',
        },
        {
          title: '单据创建类型',
          dataIndex: 'createTypeDesc',
        },
        {
          title: '结算状态',
          dataIndex: 'settleStatusDesc',
        },
        {
          title: '审批状态',
          dataIndex: 'apprStatusDesc',
        },
        {
          title: '交易时间',
          dataIndex: 'settleDate',
        },
      ],
      leftButtons: [
        1 && {
          key: 'add',
          icon: 'plus-circle',
          className: 'tw-btn-primary',
          title: '新增泛用金额结算',
          hidden: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push('/plat/intelStl/generalAmtSettleCreate');
          },
        },
        1 && {
          key: 'edit',
          icon: 'form',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.update`, desc: '修改' }),
          hidden: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const { id, settleStatus, apprStatus } = selectedRows[0];
            if (settleStatus === 'CREATE') {
              // if(true){
              if (apprStatus === 'APPROVING') {
                createMessage({ type: 'warn', description: '审批中的单据不允许修改！' });
              } else {
                router.push('/plat/intelStl/generalAmtSettleCreate?id=' + id);
              }
            } else {
              createMessage({ type: 'warn', description: '只有新增状态的可以修改！' });
            }
          },
        },
        1 && {
          key: 'remove',
          className: 'tw-btn-error',
          title: formatMessage({ id: `misc.delete`, desc: '删除' }),
          hidden: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            let flag = selectedRows.filter(item => item.settleStatus !== 'CREATE').length;
            if (flag) {
              createMessage({ type: 'warn', description: '只有新增状态的可以删除！' });
              return;
            }
            flag = selectedRows.filter(item => item.apprStatus === 'APPROVING').length;
            if (flag) {
              createMessage({ type: 'warn', description: '审批中的单据不可以删除！' });
              return;
            }
            flag = selectedRows.filter(item => item.apprStatus === 'APPROVED').length;
            if (flag) {
              createMessage({ type: 'warn', description: '审批通过的单据不可以删除！' });
              return;
            }
            const ids = selectedRows.map(selected => selected.id);
            dispatch({
              type: `${DOMAIN}/delete`,
              payload: { keys: ids.join(',') },
            });
          },
        },
      ].filter(Boolean),
    };

    return tableProps;
  };

  render() {
    return (
      <PageHeaderWrapper title="泛用金额结算">
        <DataTable {...this.tablePropsConfig()} />
      </PageHeaderWrapper>
    );
  }
}

export default GeneralAmtSettleList;
