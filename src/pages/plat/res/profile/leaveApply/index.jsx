import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import Link from 'umi/link';
import { Input } from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { Selection, DatePicker, BuVersion } from '@/pages/gen/field';
import { fromQs } from '@/utils/stringUtils';
import { getUrl } from '@/utils/flowToRouter';
import { stringify } from 'qs';
import { selectInternalOus, selectUsersWithBu } from '@/services/gen/list';
import { selectBuMultiCol } from '@/services/org/bu/bu';
import { getBuVersionAndBuParams } from '@/utils/buVersionUtils';

const DOMAIN = 'leaveApply';

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

@connect(({ loading, leaveApply }) => ({
  leaveApply,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@mountToTab()
class LeaveApply extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { _refresh } = fromQs();
    !(_refresh === '0') && dispatch({ type: `${DOMAIN}/cleanSearchForm` });
    // !(_refresh === '0') &&
    //   this.fetchData({
    //     offset: 0,
    //     limit: 10,
    //     sortBy: 'id',
    //     sortDirection: 'DESC',
    //   });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: {
        ...params,
        ...getBuVersionAndBuParams(params.baseBuId, 'baseBuId', 'baseBuVersionId'),
      },
    });
  };

  render() {
    const {
      loading,
      dispatch,
      leaveApply: { list, total, searchForm },
    } = this.props;

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'DESC',
      scroll: { x: 1530 },
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
          title: '流程编号',
          dataIndex: 'abNo',
          options: {
            initialValue: searchForm.abNo,
          },
          tag: <Input placeholder="请输入流程编号" />,
        },
        {
          title: '状态',
          dataIndex: 'apprStatus',
          options: {
            initialValue: searchForm.apprStatus,
          },
          tag: <Selection.UDC code="COM:APPR_STATUS" placeholder="请选择状态" />,
        },
        {
          title: '解除劳动合同日期',
          dataIndex: 'contractEndDate',
          options: {
            initialValue: searchForm.contractEndDate,
          },
          tag: <DatePicker.RangePicker format="YYYY-MM-DD" />,
        },
        {
          title: '离职原因',
          dataIndex: 'hrLeaveDesc',
          options: {
            initialValue: searchForm.hrLeaveDesc,
          },
          tag: <Selection.UDC code="RES:RES_LEAVE_REASON" placeholder="请选择离职原因" />,
        },
        {
          title: '入职日期',
          dataIndex: 'enrollDate',
          options: {
            initialValue: searchForm.enrollDate,
          },
          tag: <DatePicker.RangePicker format="YYYY-MM-DD" />,
        },
        {
          title: '所属公司',
          dataIndex: 'ouId',
          options: {
            initialValue: searchForm.ouId,
          },
          tag: <Selection source={() => selectInternalOus()} placeholder="请选择所属公司" />,
        },
        {
          title: 'BaseBU',
          dataIndex: 'baseBuId',
          options: {
            initialValue: searchForm.baseBuId || undefined,
          },
          tag: <BuVersion />,
        },
        {
          title: 'Base地',
          dataIndex: 'baseCity',
          options: {
            initialValue: searchForm.baseCity,
          },
          tag: <Selection.UDC code="COM.CITY" placeholder="请选择Base地" />,
        },
        {
          title: '上级资源',
          dataIndex: 'presId',
          options: {
            initialValue: searchForm.presId || undefined,
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
            />
          ),
        },
        {
          title: '资源',
          dataIndex: 'resId',
          options: {
            initialValue: searchForm.resId || undefined,
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
            />
          ),
        },
        {
          title: '申请人',
          dataIndex: 'createResId',
          options: {
            initialValue: searchForm.createResId || undefined,
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
            />
          ),
        },
        {
          title: '申请时间',
          dataIndex: 'applyDate',
          options: {
            initialValue: searchForm.applyDate,
          },
          tag: <DatePicker.RangePicker format="YYYY-MM-DD" />,
        },
      ],
      columns: [
        {
          title: '流程编号',
          dataIndex: 'abNo',
          width: 200,
          align: 'center',
          render: (value, row) => {
            const urls = getUrl();
            const from = stringify({ from: urls });
            const href = `/hr/res/leaveApply/view?id=${row.id}&${from}`;
            return (
              <Link className="tw-link" to={href}>
                {value}
              </Link>
            );
          },
        },
        {
          title: '状态',
          dataIndex: 'apprStatusName',
          align: 'center',
          width: 100,
        },
        {
          title: '资源',
          dataIndex: 'resNo',
          align: 'center',
          width: 200,
          render: (value, row) => `${row.resNo}-${row.resName}`,
        },
        {
          title: '解除劳动合同日期',
          dataIndex: 'contractEndDate',
          align: 'center',
          width: 100,
        },
        {
          title: '离职原因',
          dataIndex: 'hrLeaveDescName',
          align: 'center',
          width: 100,
        },
        {
          title: '入职日期',
          dataIndex: 'enrollDate',
          align: 'center',
          width: 100,
        },
        {
          title: '所属公司',
          dataIndex: 'ouName',
          align: 'center',
          width: 200,
        },
        {
          title: 'BaseBU',
          dataIndex: 'baseBuName',
          align: 'center',
          width: 100,
        },
        {
          title: 'Base地',
          dataIndex: 'baseCityName',
          align: 'center',
          width: 100,
        },
        {
          title: '上级资源',
          dataIndex: 'presName',
          align: 'center',
          width: 100,
        },
        {
          title: '申请人',
          dataIndex: 'createResName',
          align: 'center',
          width: 100,
        },
        {
          title: '申请时间',
          dataIndex: 'createTime',
          align: 'center',
          width: 100,
        },
      ],
    };

    return (
      <PageHeaderWrapper title="离职申请">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default LeaveApply;
