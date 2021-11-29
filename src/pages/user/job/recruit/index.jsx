import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import Link from 'umi/link';
import { Input, Form, Radio, Modal, Checkbox } from 'antd';
import { isNil, mapObjIndexed } from 'ramda';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { Selection, BuVersion } from '@/pages/gen/field';
import { formatMessage } from 'umi/locale';
import SyntheticField from '@/components/common/SyntheticField';
import FieldList from '@/components/layout/FieldList';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';
import { getUrl } from '@/utils/flowToRouter';
import { stringify } from 'qs';
import { delParam } from '@/utils/urlUtils';
import JobTypeTrigger from '@/pages/gen/field/JobTypeTrigger';
import { getBuVersionAndBuParams } from '@/utils/buVersionUtils';

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
class InternalList extends PureComponent {
  componentDidMount() {
    const {
      dispatch,
      recruit: { searchForm },
    } = this.props;
    dispatch({ type: `${DOMAIN}/res` });
    dispatch({ type: `${DOMAIN}/bu` });
    const { _refresh } = fromQs();
    !(_refresh === '0') && dispatch({ type: `${DOMAIN}/cleanSearchForm` });
    !(_refresh === '0') &&
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: { jobType2: [] },
      });
    this.fetchData(searchForm);
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: {
        ...params,
        ntFlag: 'YES',
        recruitStatus: 'RECRUITMENT',
        ...getBuVersionAndBuParams(params.buId, 'buId', 'buVersionId'),
      },
    });
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
          title: '招聘部门',
          dataIndex: 'buId',
          options: {
            initialValue: searchForm.buId || undefined,
          },
          tag: <BuVersion />,
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
          title: '工作地',
          dataIndex: 'workplace',
          options: {
            initialValue: searchForm.workplace || undefined,
          },
          tag: <Selection.UDC code="COM:CITY" placeholder="请选择工作地" />,
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
        {
          title: '服务方式',
          dataIndex: 'workStyle',
          options: {
            initialValue: searchForm.workStyle || undefined,
          },
          tag: <Selection.UDC code="RES:WORK_STYLE" placeholder="请选择工作地" />,
        },
        {
          title: '时间要求',
          dataIndex: 'timeRequirement',
          options: {
            initialValue: searchForm.timeRequirement || undefined,
          },
          tag: <Selection.UDC code="TSK:TIME_REQUIREMENT" placeholder="请选择工作地" />,
        },
      ],
      columns: [
        {
          title: '编号',
          dataIndex: 'jobNo',
          align: 'center',
          render: (value, rowData) => {
            const url = delParam(getUrl(), '_refresh');
            const href = `/user/job/recruit/view?id=${rowData.id}&from=${url}`;
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
          className: 'text-center',
          render: (value, rowData) => {
            const { jobType1Name, jobType2Name } = rowData;
            return `${jobType1Name || ''}${jobType2Name ? '-' : ''}${jobType2Name || ''}`;
          },
        },
        {
          title: '工作地',
          dataIndex: 'workplaceDesc',
          className: 'text-center',
        },
        {
          title: '兼职/全职',
          dataIndex: 'fullPart',
          className: 'text-center',
          render: (value, rowData) => (value === 'PART' ? '兼职' : '全职'),
        },
        {
          title: '服务方式',
          dataIndex: 'workStyleDesc',
          align: 'center',
        },
        {
          title: '时间要求',
          dataIndex: 'timeRequirementDesc',
          align: 'center',
        },
        {
          title: '招聘人数',
          dataIndex: 'recruitment',
          align: 'right',
        },
      ],
      leftButtons: [
        {
          key: 'add',
          icon: 'mail-fill',
          className: 'tw-btn-primary',
          title: '内部推荐',
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length !== 1 || loading,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const url = stringify({ from: getUrl() });
            router.push(`/user/job/internal/edit?id=${selectedRows[0].id}&${url}`);
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper title="内部推荐管理">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default InternalList;
