import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import Link from 'umi/link';
import { Input, Form, Radio, Modal, Checkbox } from 'antd';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { Selection } from '@/pages/gen/field';
import { formatMessage } from 'umi/locale';
import SyntheticField from '@/components/common/SyntheticField';
import FieldList from '@/components/layout/FieldList';
import { fromQs } from '@/utils/stringUtils';
import { getUrl } from '@/utils/flowToRouter';
import { delParam } from '@/utils/urlUtils';
import { isEmpty, isNil } from 'ramda';
import JobTypeTrigger from '@/pages/gen/field/JobTypeTrigger';

const RadioGroup = Radio.Group;
const { Field } = FieldList;

const DOMAIN = 'recruit';

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

@connect(({ loading, recruit }) => ({
  recruit,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@Form.create({})
@mountToTab()
class RecruitList extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/res` });
    dispatch({ type: `${DOMAIN}/bu` });
    const { _refresh } = fromQs();
    !(_refresh === '0') && dispatch({ type: `${DOMAIN}/cleanSearchForm` });
    !(_refresh === '0') &&
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: { jobType2: [] },
      });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: { ...params } });
  };

  // 分类一 -> 分类二
  handleChangeJobType = (value, index) => {
    if (index === 0) {
      const { dispatch } = this.props;
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: { jobType2: [] },
      });
      dispatch({
        type: `${DOMAIN}/jobTypeChange`,
        payload: value[0],
      });
    }
  };

  render() {
    const {
      recruit: { list, total, searchForm, resDataSource, baseBuDataSource, jobType2 },
      dispatch,
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
      loading,
    } = this.props;

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'DESC',
      scroll: { x: '100%' },
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
          title: '岗位编号/名称',
          dataIndex: 'jobNameOrNo',
          options: {
            initialValue: searchForm.jobNameOrNo || '',
          },
          tag: <Input placeholder="请输入岗位编号/名称" />,
        },
        {
          title: '招聘负责人',
          dataIndex: 'recommPicResid',
          options: {
            initialValue: searchForm.recommPicResid || undefined,
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
              placeholder="请选择招聘负责人"
            />
          ),
        },
        {
          title: '状态',
          dataIndex: 'recruitStatus',
          options: {
            initialValue: searchForm.recruitStatus || undefined,
          },
          tag: <Selection.UDC code="RES:RECRUIT_STATUS" placeholder="请选择状态" />,
        },
        {
          title: '分类',
          dataIndex: 'jobType',
          options: {
            initialValue: searchForm.jobType,
          },
          tag: <JobTypeTrigger jobType2={jobType2} onChange={this.handleChangeJobType} />,
        },
        {
          title: '招聘部门',
          dataIndex: 'buId',
          options: {
            initialValue: searchForm.buId,
          },
          tag: (
            <Selection.Columns
              className="x-fill-100"
              source={baseBuDataSource}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
              placeholder="请选择招聘部门"
            />
          ),
        },
        {
          title: '工作地',
          dataIndex: 'workplace',
          options: {
            initialValue: searchForm.workplace,
          },
          tag: <Selection.UDC code="COM:CITY" placeholder="请选择工作地" />,
        },
        {
          title: '内部推荐',
          dataIndex: 'ntFlag',
          options: {
            initialValue: searchForm.ntFlag || '',
          },
          tag: (
            <RadioGroup>
              <Radio value="">全部</Radio>
              <Radio value="YES">接收</Radio>
              <Radio value="NO">不接受</Radio>
            </RadioGroup>
          ),
        },
        {
          title: '兼职/全职',
          dataIndex: 'fullPart',
          options: {
            initialValue: searchForm.fullPart || '',
          },
          tag: (
            <RadioGroup>
              <Radio value="">全部</Radio>
              <Radio value="PART">兼职</Radio>
              <Radio value="FULL">全职</Radio>
            </RadioGroup>
          ),
        },
      ],
      columns: [
        {
          title: '编号',
          dataIndex: 'jobNo',
          align: 'center',
          render: (value, rowData) => {
            const url = delParam(getUrl(), '_refresh');
            const href = `/hr/res/profile/recruit/view?id=${rowData.id}&from=${url}`;
            return (
              <Link className="tw-link" to={href}>
                {value}
              </Link>
            );
          },
        },
        {
          title: '岗位名称',
          dataIndex: 'jobName',
          align: 'left',
        },
        {
          title: '招聘部门',
          dataIndex: 'buName',
          align: 'left',
        },
        {
          title: '分类',
          dataIndex: 'switchBoard',
          align: 'center',
          render: (value, rowData) => {
            const { jobType1Name, jobType2Name } = rowData;
            return `${jobType1Name || ''}${jobType2Name ? '-' : ''}${jobType2Name || ''}`;
          },
        },
        {
          title: '工作地',
          dataIndex: 'workplaceDesc',
          align: 'center',
        },
        {
          title: '兼职/全职',
          dataIndex: 'fullPart',
          align: 'center',
          render: (value, rowData) => (value === 'PART' ? '兼职' : '全职'),
        },
        {
          title: '内部推荐',
          dataIndex: 'ntFlag',
          align: 'center',
          render: (value, rowData) => (value === 'YES' ? '接受' : '不接受'),
        },
        {
          title: '外部资源可见',
          dataIndex: 'canSee',
          align: 'center',
          render: (value, rowData) => (value === 'YES' ? '是' : '否'),
        },
        {
          title: '招聘人数',
          dataIndex: 'recruitment',
          align: 'right',
        },
        {
          title: '状态',
          dataIndex: 'recruitStatusDesc',
          align: 'center',
        },
        {
          title: '招聘负责人',
          dataIndex: 'recommPicName',
          align: 'center',
        },
        {
          title: '创建日期',
          dataIndex: 'createTime',
          align: 'center',
        },
      ],
      leftButtons: [
        {
          key: 'add',
          icon: 'plus-circle',
          className: 'tw-btn-primary',
          title: formatMessage({ id: 'misc.insert', desc: '新增' }),
          loading: false,
          hidden: false,
          disabled: loading,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push('/hr/res/profile/recruit/edit');
          },
        },
        {
          key: 'edit',
          icon: 'form',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.update`, desc: '修改' }),
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push(`/hr/res/profile/recruit/edit?id=${selectedRows[0].id}`);
          },
        },
        {
          key: 'copy',
          icon: 'file-copy',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.copy`, desc: '复制' }),
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push(`/hr/res/profile/recruit/edit?id=${selectedRows[0].id}&copy=true`);
          },
        },
        {
          key: 'remove',
          className: 'tw-btn-error',
          title: formatMessage({ id: `misc.delete`, desc: '删除' }),
          loading: false,
          hidden: false,
          disabled: selectedRows => !selectedRows.length,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({
              type: `${DOMAIN}/delete`,
              payload: {
                ids: selectedRowKeys.join(','),
              },
            });
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper title="招聘岗位列表">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default RecruitList;
