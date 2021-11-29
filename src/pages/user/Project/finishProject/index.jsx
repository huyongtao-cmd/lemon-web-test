import React, { PureComponent } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import { Input, Form } from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { Selection, DatePicker, BuVersion } from '@/pages/gen/field';
import { formatMessage } from 'umi/locale';
import { fromQs } from '@/utils/stringUtils';
import { getUrl } from '@/utils/flowToRouter';
import { selectIamUsers } from '@/services/gen/list';
import { stringify } from 'qs';
import { getBuVersionAndBuParams } from '@/utils/buVersionUtils';

const DOMAIN = 'finishProject';

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

@connect(({ loading, finishProject, dispatch, user }) => ({
  finishProject,
  dispatch,
  user,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@Form.create({})
@mountToTab()
class FinishProject extends PureComponent {
  componentDidMount() {
    const {
      dispatch,
      user: {
        user: {
          extInfo: { resId },
        },
      },
    } = this.props;
    dispatch({ type: `${DOMAIN}/res` });
    dispatch({ type: `${DOMAIN}/bu` });
    dispatch({ type: `${DOMAIN}/queryProjList` });
    const { _refresh } = fromQs();
    !(_refresh === '0') && dispatch({ type: `${DOMAIN}/cleanSearchForm` });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: {
        ...params,
        ...getBuVersionAndBuParams(params.deliBuId, 'deliBuId', 'deliBuVersionId'),
      },
    });
  };

  render() {
    const {
      finishProject: { list, total, searchForm, resDataSource, baseBuDataSource, projList },
      form: { setFieldsValue },
      dispatch,
      loading,
    } = this.props;

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'DESC',
      scroll: { x: 1900 },
      loading,
      total,
      dataSource: list,
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
          title: '结项编号',
          dataIndex: 'applyNo',
          options: {
            initialValue: searchForm.applyNo || undefined,
          },
          tag: <Input placeholder="请输入结项编号" />,
        },
        {
          title: '状态',
          dataIndex: 'apprStatus',
          options: {
            initialValue: searchForm.apprStatus || undefined,
          },
          tag: <Selection.UDC code="COM:APPR_STATUS" placeholder="请选择状态" />,
        },
        {
          title: '项目',
          dataIndex: 'projId',
          options: {
            initialValue: searchForm.projId || undefined,
          },
          tag: (
            <Selection.Columns
              className="x-fill-100"
              source={projList}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
              placeholder="请选择项目"
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
              source={resDataSource}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
              placeholder="请选择项目经理"
            />
          ),
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
              source={resDataSource}
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
          title: '销售负责人',
          dataIndex: 'salesmanResId',
          options: {
            initialValue: searchForm.salesmanResId || undefined,
          },
          tag: (
            <Selection.Columns
              className="x-fill-100"
              source={resDataSource}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
              placeholder="请选择销售负责人"
            />
          ),
        },
        {
          title: '申请人',
          dataIndex: 'applyResId',
          options: {
            initialValue: searchForm.applyResId || undefined,
          },
          tag: (
            <Selection.Columns
              className="x-fill-100"
              source={resDataSource}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
              placeholder="请选择申请人"
            />
          ),
        },
        {
          title: '申请日期',
          dataIndex: 'applyDate',
          options: {
            initialValue: searchForm.applyDate,
          },
          tag: <DatePicker.RangePicker format="YYYY-MM-DD" />,
        },
      ],
      columns: [
        {
          title: '结项编号',
          dataIndex: 'applyNo',
          align: 'center',
        },
        {
          title: '状态',
          dataIndex: 'apprStatusDesc',
          align: 'center',
        },
        {
          title: '项目编号',
          dataIndex: 'projNo',
          align: 'center',
        },
        {
          title: '项目名称',
          dataIndex: 'projName',
        },
        {
          title: '项目状态',
          dataIndex: 'projStatusDesc',
          align: 'center',
        },
        {
          title: '工作类型',
          dataIndex: 'workTypeDesc',
          align: 'center',
        },
        {
          title: '项目经理',
          dataIndex: 'pmResName',
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
          title: '销售负责人',
          dataIndex: 'salesmanResName',
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
      leftButtons: [
        {
          key: 'edit',
          icon: 'form',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.update`, desc: '修改' }),
          loading: false,
          hidden: false,
          disabled: selectedRows =>
            selectedRows.length
              ? selectedRows.filter(
                  v => v.apprStatus !== 'NOTSUBMIT'
                  // &&
                  // v.apprStatus !== 'REJECTED' &&
                  // v.apprStatus !== 'WITHDRAW'
                ).length
              : true,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const { id } = selectedRows[0];
            const urls = getUrl();
            const from = stringify({ from: urls });
            router.push(`/user/project/finishProject/flowCreate?id=${id}&${from}&list=false`);
          },
        },
        {
          key: 'remove',
          className: 'tw-btn-error',
          title: formatMessage({ id: `misc.delete`, desc: '删除' }),
          loading: false,
          hidden: false,
          disabled: selectedRows =>
            selectedRows.length
              ? selectedRows.filter(
                  v =>
                    v.apprStatus !== 'NOTSUBMIT' &&
                    v.apprStatus !== 'REJECTED' &&
                    v.apprStatus !== 'WITHDRAW'
                ).length
              : true,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({
              type: `${DOMAIN}/delete`,
              payload: { ids: selectedRowKeys.join(',') },
            });
          },
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
