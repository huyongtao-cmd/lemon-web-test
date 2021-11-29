import React, { PureComponent } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import { Input, Form } from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { Selection, DatePicker, BuVersion } from '@/pages/gen/field';
import { fromQs } from '@/utils/stringUtils';
import { getUrl } from '@/utils/flowToRouter';
import { stringify } from 'qs';
import { selectUsersWithBu } from '@/services/gen/list';
import { selectBuMultiCol } from '@/services/org/bu/bu';
import { getBuVersionAndBuParams } from '@/utils/buVersionUtils';

const DOMAIN = 'noContractProj';

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

@connect(({ loading, noContractProj, dispatch }) => ({
  noContractProj,
  dispatch,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@Form.create({})
@mountToTab()
class FinishProject extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query` });
    const { _refresh } = fromQs();
    !(_refresh === '0') && dispatch({ type: `${DOMAIN}/cleanSearchForm` });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: {
        ...params,
        ...getBuVersionAndBuParams(params.expenseBuId, 'expenseBuId', 'expenseBuVersionId'),
        ...getBuVersionAndBuParams(params.deliBuId, 'deliBuId', 'deliBuVersionId'),
      },
    });
  };

  render() {
    const {
      noContractProj: { list, total, searchForm },
      dispatch,
      loading,
    } = this.props;

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'DESC',
      loading,
      total,
      dataSource: list,
      enableSelection: false,
      onChange: filters => this.fetchData(filters),
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      searchForm,
      searchBarForm: [
        {
          title: '申请编号',
          dataIndex: 'applyNo',
          options: {
            initialValue: searchForm.applyNo || undefined,
          },
          tag: <Input placeholder="请输入申请编号" />,
        },
        {
          title: '申请状态',
          dataIndex: 'apprStatus',
          options: {
            initialValue: searchForm.apprStatus || undefined,
          },
          tag: <Selection.UDC code="COM:APPR_STATUS" placeholder="请选择状态" />,
        },
        {
          title: '项目名称',
          dataIndex: 'projName',
          options: {
            initialValue: searchForm.projName || undefined,
          },
          tag: <Input placeholder="请输入项目名称" />,
        },
        {
          title: '工作类型',
          dataIndex: 'workType',
          options: {
            initialValue: searchForm.workType || undefined,
          },
          tag: (
            <Selection.UDC
              code="TSK:WORK_TYPE"
              filters={[{ sphd3: 'NO_CONTRACT' }]}
              placeholder="请选择状态"
            />
          ),
        },
        {
          title: '费用承担BU',
          dataIndex: 'expenseBuId',
          options: {
            initialValue: searchForm.expenseBuId || undefined,
          },
          tag: <BuVersion />,
        },
        {
          title: '交付BU',
          dataIndex: 'deliBuId',
          options: {
            initialValue: searchForm.deliBuId || undefined,
          },
          tag: <BuVersion />,
        },
        {
          title: '交付负责人',
          dataIndex: 'deliResId',
          options: {
            initialValue: searchForm.deliResId || undefined,
          },
          tag: (
            <Selection.Columns
              className="x-fill-100"
              source={() => selectUsersWithBu()}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
              placeholder="请选择交付负责人"
            />
          ),
        },

        {
          title: '项目经理',
          dataIndex: 'pmResId',
          options: {
            initialValue: searchForm.pmResId || undefined,
          },
          tag: (
            <Selection.Columns
              className="x-fill-100"
              source={() => selectUsersWithBu()}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
              placeholder="请选择项目经理"
            />
          ),
        },
      ],
      columns: [
        {
          title: '申请编号',
          dataIndex: 'applyNo',
          align: 'center',
          render: (value, row) => {
            const urls = getUrl();
            const from = stringify({ from: urls });
            const href = `/user/project/noContractProj/view?id=${row.id}&${from}`;
            return (
              <Link className="tw-link" to={href}>
                {value}
              </Link>
            );
          },
        },
        {
          title: '申请状态',
          dataIndex: 'apprStatusName',
          align: 'center',
        },
        {
          title: '项目名称',
          dataIndex: 'projName',
          align: 'center',
        },
        {
          title: '工作类型',
          dataIndex: 'workTypeName',
          align: 'center',
        },
        {
          title: '费用承担BU',
          dataIndex: 'expenseBuName',
          align: 'center',
        },
        {
          title: '交付BU',
          dataIndex: 'deliBuName',
          align: 'center',
        },
        {
          title: '交付负责人',
          dataIndex: 'deliResName',
          align: 'center',
        },
        {
          title: '项目经理',
          dataIndex: 'pmResName',
          align: 'center',
        },
        {
          title: '申请人',
          dataIndex: 'applyResName',
          align: 'center',
        },
        {
          title: '申请日期',
          dataIndex: 'applyDate',
          align: 'center',
        },
      ],
    };

    return (
      <PageHeaderWrapper title="客户管理列表">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default FinishProject;
