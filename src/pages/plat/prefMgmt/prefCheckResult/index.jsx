import React, { PureComponent } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import { Input } from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { Selection } from '@/pages/gen/field';
import { fromQs } from '@/utils/stringUtils';
import { stringify } from 'qs';
import { getUrl } from '@/utils/flowToRouter';
import ResType from '@/pages/gen/field/resType';
import ScopeInput from '../component/ScopeInput';

const DOMAIN = 'prefCheckResult';
const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

@connect(({ loading, prefCheckResult }) => ({
  prefCheckResult,
  loading: loading.effects[`${DOMAIN}/query`] || loading.effects[`${DOMAIN}/getPageConfig`],
}))
@mountToTab()
class PrefCheckResult extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/res` });
    dispatch({ type: `${DOMAIN}/bu` });

    // 获取页面配置信息
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'PERFORMANCE_EXAM_RESULT_LIST' },
    });
    const { _refresh } = fromQs();
    !(_refresh === '0') && dispatch({ type: `${DOMAIN}/cleanSearchForm` });
  }

  // componentWillUnmount() {
  //   const { dispatch } = this.props;
  //   dispatch({
  //     type: `${DOMAIN}/updateState`,
  //     payload: {
  //       pageConfig: {},
  //     },
  //   });
  // }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: { ...params } });
  };

  handleChangeType = (value, index) => {
    if (index === 0) {
      const { dispatch } = this.props;
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: { type2: [] },
      });
      dispatch({
        type: `${DOMAIN}/typeChange`,
        payload: value[0],
      });
    }
  };

  render() {
    const {
      loading,
      dispatch,
      prefCheckResult: {
        list,
        total,
        searchForm,
        baseBuDataSource,
        resDataSource,
        type2 = [],
        pageConfig,
      },
    } = this.props;
    const { pageBlockViews } = pageConfig;
    if (!pageBlockViews || pageBlockViews.length < 1) {
      return <div />;
    }
    let currentQueryConfig1 = [];
    let currentQueryConfig2 = [];
    let currentQueryConfig3 = [];
    let currentListConfig1 = [];
    let currentListConfig2 = [];
    let currentListConfig3 = [];
    pageBlockViews.forEach(view => {
      if (
        view.tableName === 'T_PERFORMANCE_EXAM' &&
        view.blockKey === 'PERFORMANCE_EXAM_RESULT_LIST_QUERY1'
      ) {
        // 绩效考核结果列表
        currentQueryConfig1 = view;
      } else if (
        view.tableName === 'T_RES_PERFORMANCE_EXAM' &&
        view.blockKey === 'PERFORMANCE_EXAM_RESULT_LIST_QUERY2'
      ) {
        currentQueryConfig2 = view;
      } else if (
        view.tableName === 'T_PERFORMANCE_EXAM_RANGE' &&
        view.blockKey === 'PERFORMANCE_EXAM_RESULT_LIST_QUERY3'
      ) {
        currentQueryConfig3 = view;
      } else if (
        view.tableName === 'T_RES_PERFORMANCE_EXAM' &&
        view.blockKey === 'PERFORMANCE_EXAM_RESULT_LIST_MAIN1'
      ) {
        currentListConfig1 = view;
      } else if (
        view.tableName === 'T_PERFORMANCE_EXAM' &&
        view.blockKey === 'PERFORMANCE_EXAM_RESULT_LIST_MAIN2'
      ) {
        currentListConfig2 = view;
      } else if (
        view.tableName === 'T_PERFORMANCE_EXAM_RANGE' &&
        view.blockKey === 'PERFORMANCE_EXAM_RESULT_LIST_MAIN3'
      ) {
        currentListConfig3 = view;
      }
    });
    const { pageFieldViews: pageFieldViewsQuery1 } = currentQueryConfig1;
    const { pageFieldViews: pageFieldViewsQuery2 } = currentQueryConfig2;
    const { pageFieldViews: pageFieldViewsQuery3 } = currentQueryConfig3;
    const { pageFieldViews: pageFieldViewsList1 } = currentListConfig1;
    const { pageFieldViews: pageFieldViewsList2 } = currentListConfig2;
    const { pageFieldViews: pageFieldViewsList3 } = currentListConfig3;

    const pageFieldJsonQuery1 = {};
    const pageFieldJsonQuery2 = {};
    const pageFieldJsonQuery3 = {};
    const pageFieldJsonList1 = {};
    const pageFieldJsonList2 = {};
    const pageFieldJsonList3 = {};

    if (pageFieldViewsQuery1) {
      pageFieldViewsQuery1.forEach(field => {
        pageFieldJsonQuery1[field.fieldKey] = field;
      });
    }
    if (pageFieldViewsQuery2) {
      pageFieldViewsQuery2.forEach(field => {
        pageFieldJsonQuery2[field.fieldKey] = field;
      });
    }
    if (pageFieldViewsQuery3) {
      pageFieldViewsQuery3.forEach(field => {
        pageFieldJsonQuery3[field.fieldKey] = field;
      });
    }
    if (pageFieldViewsList1) {
      pageFieldViewsList1.forEach(field => {
        pageFieldJsonList1[field.fieldKey] = field;
      });
    }
    if (pageFieldViewsList2) {
      pageFieldViewsList2.forEach(field => {
        pageFieldJsonList2[field.fieldKey] = field;
      });
    }
    if (pageFieldViewsList3) {
      pageFieldViewsList3.forEach(field => {
        pageFieldJsonList3[field.fieldKey] = field;
      });
    }

    const { examName = {} } = pageFieldJsonQuery1;
    const { apprStatus = {}, finalScore = {} } = pageFieldJsonQuery2;
    const { buId = {}, resType = {}, coopType = {}, resId = {} } = pageFieldJsonQuery3;
    const { examGrade = {} } = pageFieldJsonList1;
    const { baseBuId = {} } = pageFieldJsonList3;

    const tableProps = {
      rowKey: 'eid',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'DESC',
      scroll: { x: 1600 },
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
            initialValue: searchForm.abNo || '',
          },
          tag: <Input placeholder="请输入流程编号" />,
        },
        examName.visibleFlag && {
          title: `${examName.displayName}`,
          dataIndex: 'examName',
          options: {
            initialValue: searchForm.examName || '',
          },
          tag: <Input placeholder={`请输入${examName.displayName}`} />,
          sortNo: `${examName.sortNo}`,
        },
        apprStatus.visibleFlag && {
          title: `${apprStatus.displayName}`,
          dataIndex: 'apprStatus',
          options: {
            initialValue: searchForm.apprStatus,
          },
          tag: (
            <Selection.UDC code="COM:APPR_STATUS" placeholder={`请选择${apprStatus.displayName}`} />
          ),
          sortNo: `${apprStatus.sortNo}`,
        },
        buId.visibleFlag && {
          title: `${buId.displayName}`,
          dataIndex: 'buId',
          options: {
            initialValue: searchForm.buId,
          },
          sortNo: `${buId.sortNo}`,
          tag: (
            <Selection.Columns
              className="x-fill-100"
              source={baseBuDataSource}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
              placeholder={`请选择${buId.displayName}`}
            />
          ),
        },
        resType.visibleFlag && {
          title: `${resType.displayName}`,
          dataIndex: 'resTypeArr',
          options: {
            initialValue: searchForm.resTypeArr,
          },
          tag: (
            <ResType
              type2={type2}
              code="RES:RES_TYPE1"
              onChange={this.handleChangeType}
              placeholder1={`${resType.displayName}一`}
              placeholder2={`${resType.displayName}二`}
            />
          ),
          sortNo: `${resType.sortNo}`,
        },
        coopType.visibleFlag && {
          title: `${coopType.displayName}`,
          dataIndex: 'coopType',
          options: {
            initialValue: searchForm.coopType,
          },
          tag: (
            <Selection.UDC
              code="COM.COOPERATION_MODE"
              placeholder={`请选择${coopType.displayName}`}
            />
          ),
          sortNo: `${coopType.sortNo}`,
        },
        finalScore.visibleFlag && {
          title: `${finalScore.displayName}`,
          dataIndex: 'finalScore',
          options: {
            initialValue: searchForm.finalScore || undefined,
          },
          tag: <ScopeInput />,
          sortNo: `${finalScore.sortNo}`,
        },
        resId.visibleFlag && {
          title: `${resId.displayName}`,
          dataIndex: 'resId',
          options: {
            initialValue: searchForm.resId || undefined,
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
              placeholder={`请选择${resId.displayName}`}
            />
          ),
          sortNo: `${resId.sortNo}`,
        },
      ]
        .filter(Boolean)
        .sort((field1, field2) => field1.sortNo - field2.sortNo),
      columns: [
        {
          title: '流程编号',
          dataIndex: 'abNo',
          width: 150,
          align: 'center',
          render: (value, row) => {
            const urls = getUrl();
            const from = stringify({ from: urls });
            const href = `/hr/prefMgmt/prefCheckResult/view?id=${row.eid}&${from}`;
            return (
              <Link className="tw-link" to={href}>
                {value}
              </Link>
            );
          },
        },
        apprStatus.visibleFlag && {
          title: `${apprStatus.displayName}`,
          dataIndex: 'apprStatusName',
          align: 'center',
          width: 100,
          sortNo: `${apprStatus.sortNo}`,
        },
        examName.visibleFlag && {
          title: `${examName.displayName}`,
          dataIndex: 'examName',
          width: 250,
          sortNo: `${examName.sortNo}`,
        },
        {
          title: '考核期间',
          dataIndex: 'date',
          align: 'center',
          width: 200,
        },
        resId.visibleFlag && {
          title: `${resId.displayName}`,
          dataIndex: 'resId',
          width: 200,
          render: (value, row) => `${row.resNo}-${row.foreignName}-${row.resName}`,
          sortNo: `${resId.sortNo}`,
        },
        finalScore.visibleFlag && {
          title: `${finalScore.displayName}/${examGrade.displayName}`,
          dataIndex: 'finalScore',
          align: 'center',
          width: 150,
          sortNo: `${finalScore.sortNo}`,
          render: (value, row, index) => {
            const urls = getUrl();
            const from = stringify({ from: urls });
            const href = `/hr/prefMgmt/prefCheckResult/detail?id=${row.eid}&${from}`;
            return row.apprStatusName === '已通过' ? (
              <>
                <span>{`${value || ''}${row.examGrade ? '/' : ''}${row.examGrade || ''}`}</span>
                <span>&nbsp;&nbsp;&nbsp;</span>
                <Link className="tw-link" to={href}>
                  评分明细
                </Link>
              </>
            ) : (
              ''
            );
          },
        },
        baseBuId.visibleFlag && {
          title: `${baseBuId.displayName}`,
          dataIndex: 'buName',
          align: 'center',
          width: 200,
          sortNo: `${baseBuId.sortNo}`,
        },
        resType.visibleFlag && {
          title: `${resType.displayName}`,
          dataIndex: 'resType',
          align: 'center',
          width: 100,
          sortNo: `${resType.sortNo}`,
        },
        coopType.visibleFlag && {
          title: `${coopType.displayName}`,
          dataIndex: 'coopType',
          align: 'center',
          width: 100,
          sortNo: `${coopType.sortNo}`,
        },
      ]
        .filter(Boolean)
        .sort((field1, field2) => field1.sortNo - field2.sortNo),
    };

    return (
      <PageHeaderWrapper title="考核结果列表">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default PrefCheckResult;
