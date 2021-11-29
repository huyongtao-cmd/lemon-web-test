import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Input, Select } from 'antd';
import Link from 'umi/link';
import router from 'umi/router';
import { formatMessage } from 'umi/locale';
import DataTable from '@/components/common/DataTable';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { mountToTab } from '@/layouts/routerControl';
import { Selection } from '@/pages/gen/field';
import { selectBus } from '@/services/org/bu/bu';
import { selectUsersWithBu } from '@/services/gen/list';
import { getParam, editParam, addParam } from '@/utils/urlUtils';
import { getUrl } from '@/utils/flowToRouter';
import { stringify } from 'qs';

const DOMAIN = 'userProject';
const applyColumns = [
  { dataIndex: 'code', title: '编号', span: 12 },
  { dataIndex: 'name', title: '名称', span: 12 },
];

@connect(({ loading, userProject }) => ({
  userProject,
  loading,
}))
@mountToTab()
class Project extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const defaultSearchForm = {
      projectSearchKey: null, // 项目名称/编号
      userdefinedNo: null, // 参考合同号
      deliBuId: null, // 交付BU
      pmResId: null, // 项目经理
      workType: null, // 工作类型
      projStatus: null, // 项目状态
      salesmanResId: null, // 销售负责人
      contractSearchKey: null, // 子合同编号/名称
    };
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        searchForm: defaultSearchForm,
        dataSource: [],
        total: 0,
      },
    });
    // this.fetchData({ offset: 0, limit: 10, sortBy: 'projNo', sortDirection: 'ASC' });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: params,
    });
  };

  render() {
    const {
      dispatch,
      loading,
      userProject: { dataSource, total, searchForm, jumpData },
    } = this.props;
    const submitBtn = loading.effects[`${DOMAIN}/projectClosingAcc`];

    const tableProps = {
      rowKey: 'id',
      sortBy: 'projNo',
      sortDirection: 'ASC',
      columnsCache: DOMAIN,
      scroll: { x: 2500 },
      loading: loading.effects[`${DOMAIN}/query`],
      total,
      dataSource,
      searchForm,
      onChange: filters => {
        this.fetchData(filters);
      },
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      searchBarForm: [
        {
          title: '项目名称/编号', // TODO: 国际化
          dataIndex: 'projectSearchKey',
          options: {
            initialValue: searchForm.projectSearchKey,
          },
          tag: <Input placeholder="请输入项目名称/编号" />,
        },
        {
          title: '参考合同号', // TODO: 国际化
          dataIndex: 'userdefinedNo',
          options: {
            initialValue: searchForm.userdefinedNo,
          },
          tag: <Input placeholder="请输入参考合同号" />,
        },
        {
          title: '交付BU', // TODO: 国际化
          dataIndex: 'deliBuId',
          options: {
            initialValue: searchForm.deliBuId,
          },
          tag: <Selection source={() => selectBus()} placeholder="请选择交付BU" />,
        },
        {
          title: '项目经理', // TODO: 国际化
          dataIndex: 'pmResId',
          options: {
            initialValue: searchForm.pmResId,
          },
          tag: (
            <Selection.Columns
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              columns={applyColumns}
              source={() => selectUsersWithBu()}
              showSearch
              placeholder="请选择项目经理"
            />
          ),
        },
        {
          title: '交付负责人',
          dataIndex: 'deliResId',
          options: {
            initialValue: searchForm.deliResId,
          },
          tag: (
            <Selection.Columns
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              columns={applyColumns}
              source={() => selectUsersWithBu()}
              placeholder="请选择交付负责人"
              showSearch
            />
          ),
        },
        {
          title: '工作类型', // TODO: 国际化
          dataIndex: 'workType',
          options: {
            initialValue: searchForm.workType,
          },
          tag: <Selection.UDC code="TSK.WORK_TYPE" placeholder="请选择工作类型" />,
        },
        {
          title: '项目状态', // TODO: 国际化
          dataIndex: 'projStatus',
          options: {
            initialValue: searchForm.projStatus,
          },
          tag: <Selection.UDC code="TSK.PROJ_STATUS" placeholder="请选择项目状态" />,
        },
        {
          title: '销售负责人', // TODO: 国际化
          dataIndex: 'salesmanResId',
          options: {
            initialValue: searchForm.salesmanResId,
          },
          tag: (
            <Selection.Columns
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              columns={applyColumns}
              source={() => selectUsersWithBu()}
              showSearch
              placeholder="请选择销售负责人"
            />
          ),
        },
        {
          title: '合同编号/名称', // TODO: 国际化
          dataIndex: 'contractSearchKey',
          options: {
            initialValue: searchForm.contractSearchKey,
          },
          tag: <Input placeholder="请输入子合同编号/名称" />,
        },
      ],
      columns: [
        {
          title: '项目编号', // TODO: 国际化
          dataIndex: 'projNo',
          align: 'center',
          sorter: true,
          defaultSortOrder: 'ascend',
          width: 120,
          render: (value, row, key) => (
            <Link className="tw-link" to={`/user/project/projectDetail?id=${row.id}`}>
              {value}
            </Link>
          ),
        },
        {
          title: '项目名称', // TODO: 国际化
          dataIndex: 'projName',
          width: 200,
        },
        {
          title: '参考合同号', // TODO: 国际化
          dataIndex: 'userdefinedNo',
          align: 'center',
          width: 100,
        },
        {
          title: '工作类型', // TODO: 国际化
          dataIndex: 'workTypeName',
          align: 'center',
          width: 100,
        },
        {
          title: '项目状态', // TODO: 国际化
          dataIndex: 'projStatusName',
          align: 'center',
          width: 100,
        },
        {
          title: '交付BU', // TODO: 国际化
          dataIndex: 'deliBuName',
          width: 130,
        },
        {
          title: '项目经理', // TODO: 国际化
          dataIndex: 'pmResName',
          width: 100,
        },
        {
          title: '销售负责人', // TODO: 国际化
          dataIndex: 'salesmanResName',
          width: 100,
        },
        {
          title: '子合同编号', // TODO: 国际化
          dataIndex: 'contractNo',
          width: 100,
        },
        {
          title: '子合同名称', // TODO: 国际化
          dataIndex: 'contractName',
          width: 150,
        },
        {
          title: '创建日期', // TODO: 国际化
          dataIndex: 'createTime',
          width: 120,
        },
        {
          title: '项目总金额',
          dataIndex: 'sumAmt',
          align: 'right',
          width: 100,
        },
        {
          title: '已开票金额',
          dataIndex: 'invAmt',
          align: 'right',
          width: 100,
        },
        {
          title: '已收款金额',
          dataIndex: 'actualRecvAmt',
          align: 'right',
          width: 100,
        },
        {
          title: '未收款金额',
          dataIndex: 'unRecvAmt',
          align: 'right',
          width: 100,
        },
        {
          title: '项目总当量预算',
          dataIndex: 'totalEqvaBudget',
          align: 'right',
          width: 100,
        },
        {
          title: '项目总当量',
          dataIndex: 'totalEqvaActual',
          align: 'right',
          width: 100,
        },
        {
          title: '项目总费用预算',
          dataIndex: 'totalReimbursement',
          align: 'right',
          width: 100,
        },
        {
          title: '项目总费用',
          dataIndex: 'totalAmt',
          align: 'right',
          width: 100,
        },
        {
          title: '项目进度状态',
          dataIndex: 'projProcessStatus',
          align: 'right',
          width: 100,
        },
        {
          title: '最近汇报期间',
          dataIndex: 'recentReportPeriodName',
          align: 'right',
          width: 100,
        },
        {
          title: '资源规划更新日',
          dataIndex: 'planningModifyDate',
          align: 'right',
          width: 100,
        },
      ],
      leftButtons: [
        {
          key: 'projectBI',
          className: 'tw-btn-info',
          icon: 'form',
          title: '项目关账',
          loading: false,
          hidden: false,
          disabled: selectedRows =>
            selectedRows.length !== 1 ||
            !(selectedRows[0].projStatus === 'CLOSE' && selectedRows[0].ledgerStatus === 0) ||
            submitBtn,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({
              type: `${DOMAIN}/projectClosingAcc`,
              payload: {
                projId: selectedRows[0].id,
              },
            });
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper>
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default Project;
