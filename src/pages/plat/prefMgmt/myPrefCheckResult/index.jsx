import React, { PureComponent } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import { Input } from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { Selection, BuVersion } from '@/pages/gen/field';
import { fromQs } from '@/utils/stringUtils';
import { stringify } from 'qs';
import { getUrl } from '@/utils/flowToRouter';
import ResType from '@/pages/gen/field/resType';
import ScopeInput from '../component/ScopeInput';
import { getBuVersionAndBuParams } from '@/utils/buVersionUtils';

const DOMAIN = 'prefCheckResult';
const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

@connect(({ loading, prefCheckResult }) => ({
  prefCheckResult,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@mountToTab()
class PrefCheckResult extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/res` });
    dispatch({ type: `${DOMAIN}/bu` });

    const { _refresh } = fromQs();
    !(_refresh === '0') && dispatch({ type: `${DOMAIN}/cleanSearchForm` });

    this.fetchData({
      offset: 0,
      limit: 10,
      sortBy: 'id',
      sortDirection: 'DESC',
    });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/myExamFinallyList`,
      payload: {
        ...params,
        ...getBuVersionAndBuParams(params.buId, 'buId', 'buVersionId'),
      },
    });
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
      prefCheckResult: { list, total, searchForm, baseBuDataSource, resDataSource, type2 = [] },
    } = this.props;

    const tableProps = {
      rowKey: 'id',
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
        {
          title: '考核名称',
          dataIndex: 'examName',
          options: {
            initialValue: searchForm.examName || '',
          },
          tag: <Input placeholder="请输入考核名称" />,
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
          title: 'BU',
          dataIndex: 'buId',
          options: {
            initialValue: searchForm.buId,
          },
          tag: <BuVersion />,
        },
        {
          title: '资源类型',
          dataIndex: 'resTypeArr',
          options: {
            initialValue: searchForm.resTypeArr,
          },
          tag: <ResType type2={type2} code="RES:RES_TYPE1" onChange={this.handleChangeType} />,
        },
        {
          title: '合作方式',
          dataIndex: 'coopType',
          options: {
            initialValue: searchForm.coopType,
          },
          tag: <Selection.UDC code="COM.COOPERATION_MODE" placeholder="请选择合作方式" />,
        },
        {
          title: '综合得分',
          dataIndex: 'finalScore',
          options: {
            initialValue: searchForm.finalScore || undefined,
          },
          tag: <ScopeInput />,
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
              source={resDataSource}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
              placeholder="请选择资源"
            />
          ),
        },
      ],
      columns: [
        {
          title: '流程编号',
          dataIndex: 'abNo',
          width: 150,
          align: 'center',
          render: (value, row) => {
            const urls = getUrl();
            const from = stringify({ from: urls });
            const href = `/user/prefMgmt/prefCheckResult/view?id=${row.id}&${from}`;
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
          title: '考核名称',
          dataIndex: 'examName',
          width: 250,
        },
        {
          title: '考核期间',
          dataIndex: 'date',
          align: 'center',
          width: 200,
        },
        {
          title: '资源',
          dataIndex: 'resId',
          width: 200,
          render: (value, row) => `${row.resNo}-${row.foreignName}-${row.resName}`,
        },
        {
          title: '综合得分/等级',
          dataIndex: 'finalScore',
          align: 'center',
          width: 150,
          render: (value, row, index) => {
            const urls = getUrl();
            const from = stringify({ from: urls });
            const href = `/hr/prefMgmt/prefCheckResult/detail?id=${row.eid}&${from}`;
            return row.apprStatusName === '已通过' ? (
              <>
                <span>{`${value || ''}${row.examGrade ? '/' : ''}${row.examGrade || ''}`}</span>
                <span>&nbsp;&nbsp;&nbsp;</span>
                {row.isCheckoutMyExam === 'OK' ? (
                  <Link className="tw-link" to={href}>
                    评分明细
                  </Link>
                ) : (
                  ''
                )}
              </>
            ) : (
              ''
            );
          },
        },
        {
          title: 'BaseBU',
          dataIndex: 'buName',
          align: 'center',
          width: 200,
        },
        {
          title: '资源类型',
          dataIndex: 'resType',
          align: 'center',
          width: 100,
        },
        {
          title: '合作方式',
          dataIndex: 'coopType',
          align: 'center',
          width: 100,
        },
      ],
    };

    return (
      <PageHeaderWrapper title="考核结果列表">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default PrefCheckResult;
