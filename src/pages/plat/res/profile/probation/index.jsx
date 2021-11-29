import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import Link from 'umi/link';
import { Input, Radio } from 'antd';
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

const DOMAIN = 'probation';
const RadioGroup = Radio.Group;

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];
const APPROVING = 'APPROVING'; // 审批状态
@connect(({ loading, probation }) => ({
  probation,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@mountToTab()
class Probation extends PureComponent {
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
      probation: { list, total, searchForm },
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
      showExport: false,
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
          dataIndex: 'no',
          options: {
            initialValue: searchForm.no,
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
          title: '考核类型',
          dataIndex: 'checkType',
          options: {
            initialValue: searchForm.checkType || '',
          },
          tag: (
            <RadioGroup>
              <Radio value="META_PHASE">中期</Radio>
              <Radio value="FINAL_PHASE">末期</Radio>
              <Radio value="">全部</Radio>
            </RadioGroup>
          ),
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
          title: '试用期范围',
          dataIndex: 'probation',
          options: {
            initialValue: searchForm.probation,
          },
          tag: <DatePicker.RangePicker format="YYYY-MM-DD" />,
        },
        {
          title: '考核结果',
          dataIndex: 'buPicCheckResult',
          options: {
            initialValue: searchForm.buPicCheckResult,
          },
          tag: <Selection.UDC code="RES:CHECK_RESULT" placeholder="请选择状态" />,
        },
        {
          title: '转正日期',
          dataIndex: 'buPicRegularDate',
          options: {
            initialValue: searchForm.buPicRegularDate,
          },
          tag: <DatePicker.RangePicker format="YYYY-MM-DD" />,
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
      ],
      columns: [
        {
          title: '流程编号',
          dataIndex: 'no',
          width: 200,
          align: 'center',
          render: (value, row) => {
            const href = `/hr/res/probation/view?id=${row.id}&type=${row.checkTypeName}`;
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
          title: '考核类型',
          dataIndex: 'checkTypeName',
          align: 'center',
          width: 100,
        },
        {
          title: '资源',
          dataIndex: 'resName',
          align: 'center',
          width: 100,
        },
        {
          title: 'BaseBU',
          dataIndex: 'baseBu',
          align: 'center',
          width: 100,
        },
        {
          title: '试用期',
          dataIndex: 'probationPeriod',
          align: 'center',
          width: 100,
        },
        {
          title: '考核结果',
          dataIndex: 'buPicCheckResultDesc',
          align: 'center',
          width: 200,
          render: (value, row) => {
            const href = `/hr/res/probation/view?id=${row.id}`;
            return (
              <>
                {row.apprStatus === 'APPROVED' && (
                  <>
                    <span style={{ marginRight: '10px' }}>{value}</span>
                    <Link className="tw-link" to={href}>
                      考核详情
                    </Link>
                  </>
                )}
              </>
            );
          },
        },
        {
          title: '转正日期',
          dataIndex: 'buPicRegularDate',
          align: 'center',
          width: 100,
          render: (value, row) => (
            <>
              {row.apprStatus === 'APPROVED' && (
                <span style={{ marginRight: '10px' }}>{value}</span>
              )}
            </>
          ),
        },
      ],
    };

    return (
      <PageHeaderWrapper title="试用期考核">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default Probation;
