import React, { PureComponent } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import { Input, Form, Radio, Modal, Checkbox, DatePicker, Tooltip } from 'antd';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { Selection, FileManagerEnhance } from '@/pages/gen/field';
import FieldList from '@/components/layout/FieldList';
import { fromQs } from '@/utils/stringUtils';
import { getUrl } from '@/utils/flowToRouter';
import moment from 'moment';
import { delParam } from '@/utils/urlUtils';
import JobTypeTrigger from '@/pages/gen/field/JobTypeTrigger';

const RadioGroup = Radio.Group;
const { Field } = FieldList;

const DOMAIN = 'internal';

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

@connect(({ loading, internal, user }) => ({
  internal,
  user,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@Form.create({})
@mountToTab()
class InternalList extends PureComponent {
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
    const { dispatch, user } = this.props;
    const {
      extInfo: { resId },
    } = user.user;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: {
        ...params,
        myResId: resId,
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
      internal: { list, total, searchForm, resDataSource, baseBuDataSource, jobType2 },
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
          title: '推荐号',
          dataIndex: 'recommNo',
          align: 'center',
          options: {
            initialValue: searchForm.recommNo || '',
          },
          tag: <Input placeholder="请输入推荐号" />,
        },
        {
          title: '推荐状态',
          dataIndex: 'apprStatus',
          align: 'center',
          options: {
            initialValue: searchForm.apprStatus || '',
          },
          tag: <Selection.UDC code="COM:APPR_STATUS" placeholder="请选择推荐状态" />,
        },
        {
          title: '推荐人',
          dataIndex: 'resId',
          options: {
            initialValue: searchForm.resId || '',
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
          title: '推荐时间',
          dataIndex: 'resumeApprDate',
          options: {
            initialValue: [
              searchForm.resumeApprDateStart ? moment(searchForm.resumeApprDateStart) : null,
              searchForm.resumeApprDateEnd ? moment(searchForm.resumeApprDateEnd) : null,
            ],
          },
          tag: (
            <DatePicker.RangePicker placeholder={['开始日期', '结束日期']} className="x-fill-100" />
          ),
        },
        {
          title: '转正日期',
          dataIndex: 'regularApprDate',
          options: {
            initialValue: [
              searchForm.regularApprDateStart ? moment(searchForm.regularApprDateStart) : null,
              searchForm.regularApprDateEnd ? moment(searchForm.regularApprDateEnd) : null,
            ],
          },
          tag: (
            <DatePicker.RangePicker placeholder={['开始日期', '结束日期']} className="x-fill-100" />
          ),
        },
        {
          title: '简历筛选结果',
          dataIndex: 'resumeResult',
          options: {
            initialValue: searchForm.resumeResult || '',
          },
          tag: <Selection.UDC code="RES:RESUME_RESULT" placeholder="请选择推荐状态" />,
        },
        {
          title: '面试结果',
          dataIndex: 'interviewResult',
          options: {
            initialValue: searchForm.interviewResult || '',
          },
          tag: (
            <RadioGroup>
              <Radio value="">全部</Radio>
              <Radio value="PASS">通过</Radio>
              <Radio value="FAILED">未通过</Radio>
            </RadioGroup>
          ),
        },
        {
          title: '是否入职',
          dataIndex: 'entryFlag',
          options: {
            initialValue: searchForm.entryFlag || '',
          },
          tag: (
            <RadioGroup>
              <Radio value="">全部</Radio>
              <Radio value="YES">是</Radio>
              <Radio value="NO">否</Radio>
            </RadioGroup>
          ),
        },
        {
          title: '是否转正',
          dataIndex: 'regularFlag',
          options: {
            initialValue: searchForm.regularFlag || '',
          },
          tag: (
            <RadioGroup>
              <Radio value="">全部</Radio>
              <Radio value="YES">是</Radio>
              <Radio value="NO">否</Radio>
            </RadioGroup>
          ),
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
          title: '岗位编号/名称',
          dataIndex: 'jobNoOrName',
          options: {
            initialValue: searchForm.jobNoOrName || '',
          },
          tag: <Input placeholder="请输入岗位编号/名称" />,
        },
      ],
      columns: [
        {
          title: '推荐号',
          dataIndex: 'recommNo',
          className: 'text-center',
        },
        {
          title: '推荐状态',
          dataIndex: 'apprStatusDesc',
          className: 'text-center',
        },
        {
          title: '岗位',
          dataIndex: 'jobNo',
          render: (value, rowData) => {
            const url = delParam(getUrl(), '_refresh');
            const href = `/user/job/recruit/view?id=${rowData.jobId}&from=${url}`;
            return (
              <Link className="tw-link" to={href}>
                {value}
                {value && rowData.jobName ? '-' : ''}
                {rowData.jobName}
              </Link>
            );
          },
        },
        {
          title: '分类',
          dataIndex: 'jobType1',
          className: 'text-center',
          render: (value, rowData) => {
            const { jobType1Name, jobType2Name } = rowData;
            return `${jobType1Name || ''}${jobType1Name && jobType2Name ? '-' : ''}${jobType2Name ||
              ''}`;
          },
        },
        {
          title: '简历筛选结果',
          dataIndex: 'resumeResultDesc',
          className: 'text-center',
        },
        {
          title: '简历采用奖励',
          dataIndex: 'resumeReward',
          align: 'right',
        },
        {
          title: '简历审批时间',
          dataIndex: 'resumeApprDate',
          className: 'text-center',
        },
        {
          title: '面试结果',
          dataIndex: 'interviewResult',
          className: 'text-center',
        },
        {
          title: '是否入职',
          dataIndex: 'entryFlagDesc',
          className: 'text-center',
        },
        {
          title: '是否转正',
          dataIndex: 'regularFlagDesc',
          className: 'text-center',
        },
        {
          title: '转正奖励',
          dataIndex: 'regularReward',
          align: 'right',
        },
        {
          title: '转正日期',
          dataIndex: 'regularApprDate',
          className: 'text-center',
        },
        {
          title: '推荐人',
          dataIndex: 'resName',
          className: 'text-center',
        },
        {
          title: '推荐日期',
          dataIndex: 'recommDate',
          className: 'text-center',
        },
        {
          title: '被推荐人',
          dataIndex: 'recommName',
          className: 'text-center',
        },
        {
          title: '被推荐人手机号',
          dataIndex: 'recommMobile',
          className: 'text-center',
        },
        {
          title: '被推荐人简历',
          dataIndex: 'recommMobile1',
          className: 'text-center',
          render: (value, rowData) => (
            <FileManagerEnhance
              api="/api/person/v1/jobInternalRecomm/sfs/token"
              dataKey={rowData.id}
              listType="text"
              preview
            />
          ),
        },
        {
          title: '与推荐人关系',
          dataIndex: 'relationship',
        },
        {
          title: '推荐理由',
          dataIndex: 'recommReason',
          render: (value, row, key) =>
            value && value.length > 15 ? (
              <Tooltip placement="left" title={<pre>{value}</pre>}>
                <span>{`${value.substr(0, 15)}...`}</span>
              </Tooltip>
            ) : (
              <span>{value}</span>
            ),
        },
      ],
      leftButtons: [
        // {
        //   key: 'remove',
        //   className: 'tw-btn-error',
        //   title: formatMessage({ id: `misc.delete`, desc: '删除' }),
        //   loading: false,
        //   hidden: false,
        //   disabled: selectedRows => !selectedRows.length,
        //   minSelections: 0,
        //   cb: (selectedRowKeys, selectedRows, queryParams) => {
        //     dispatch({
        //       type: `${DOMAIN}/delete`,
        //       payload: {
        //         ids: selectedRowKeys.join(','),
        //       },
        //     });
        //   },
        // },
      ],
    };

    return (
      <PageHeaderWrapper title="内部推荐">
        <DataTable {...tableProps} scroll={{ x: 3000 }} />
      </PageHeaderWrapper>
    );
  }
}

export default InternalList;
