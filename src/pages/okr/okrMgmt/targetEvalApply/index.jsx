import React, { PureComponent } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import { Input } from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { selectUsersWithBu, selectInternalOus } from '@/services/gen/list';
import { Selection } from '@/pages/gen/field';
import { fromQs } from '@/utils/stringUtils';
import { stringify } from 'qs';
import { getUrl } from '@/utils/flowToRouter';
import SelectionLinked from './SelectionLinked';
import ScopeInput from '../component/ScopeInput';

const DOMAIN = 'targetEvalApply';
const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

@connect(({ loading, targetEvalApply }) => ({
  targetEvalApply,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@mountToTab()
class TargetEvalApply extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { _refresh } = fromQs();
    !(_refresh === '0') && dispatch({ type: `${DOMAIN}/cleanSearchForm` });
    !(_refresh === '0') && dispatch({ type: `${DOMAIN}/queryObjectiveList` });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: { ...params } });
  };

  render() {
    const {
      loading,
      dispatch,
      targetEvalApply: {
        list,
        total,
        searchForm,
        objectiveList,
        sonObjectiveList,
        objectiveListAll,
      },
    } = this.props;

    const tableProps = {
      rowKey: 'eid',
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
          title: '流程编号',
          dataIndex: 'procNo',
          options: {
            initialValue: searchForm.procNo || '',
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
          title: '父目标',
          dataIndex: 'supObjectveId',
          options: {
            initialValue: searchForm.supObjectveId,
          },
          tag: (
            <Selection
              className="tw-field-group-field"
              source={objectiveList}
              placeholder="父目标"
              transfer={{ key: 'id', code: 'id', name: 'objectiveName' }}
              onChange={v => {
                if (v) {
                  dispatch({
                    type: `${DOMAIN}/updateState`,
                    payload: {
                      sonObjectiveList: objectiveList.filter(
                        item => item.supObjectiveId === Number(v)
                      ),
                    },
                  });
                } else {
                  dispatch({
                    type: `${DOMAIN}/updateState`,
                    payload: {
                      sonObjectiveList: objectiveListAll,
                    },
                  });
                }
              }}
            />
          ),
        },
        {
          title: '目标',
          dataIndex: 'objectId',
          options: {
            initialValue: searchForm.objectId,
          },
          tag: (
            <Selection
              className="tw-field-group-field"
              source={sonObjectiveList}
              placeholder="目标"
              transfer={{ key: 'id', code: 'id', name: 'objectiveName' }}
            />
          ),
        },
        {
          title: '目标类型',
          dataIndex: 'objectiveType',
          options: {
            initialValue: searchForm.objectiveType,
          },
          tag: <Selection.UDC code="OKR:OBJ_TYPE" placeholder="请选择目标类型" />,
        },
        {
          title: '负责人',
          dataIndex: 'objectiveResId',
          options: {
            initialValue: searchForm.objectiveResId,
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
              placeholder="请选择负责人"
            />
          ),
        },
        {
          title: '综合得分',
          dataIndex: 'finalScore',
          options: {
            initialValue: searchForm.finalScore || undefined,
          },
          tag: <ScopeInput />,
        },
      ],
      columns: [
        {
          title: '流程编号',
          dataIndex: 'procNo',
          align: 'center',
          render: (value, row) => {
            const urls = getUrl();
            const from = stringify({ from: urls });
            const href = `/okr/okrMgmt/targetEvalApply/view?id=${row.id}&${from}`;
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
        },
        {
          title: '目标名称',
          dataIndex: 'objectiveName',
          align: 'center',
        },
        {
          title: '父目标',
          dataIndex: 'supObjectiveName',
          align: 'center',
        },
        {
          title: '负责人',
          dataIndex: 'objectiveResName',
          align: 'center',
        },
        {
          title: '目标类型',
          dataIndex: 'objectiveTypeName',
          align: 'center',
        },
        {
          title: '截止日期',
          dataIndex: 'endDate',
          align: 'center',
        },
        {
          title: '得分',
          dataIndex: 'finalScore',
          align: 'center',
          width: 150,
          render: (value, row, index) => {
            const urls = getUrl();
            const from = stringify({ from: urls });
            const href = `/okr/okrMgmt/targetEvalApply/detail?id=${row.id}&${from}`;
            return row.apprStatus === 'APPROVED' ? (
              <>
                <span>{value || ''}</span>
                <span>&nbsp;&nbsp;&nbsp;</span>
                <Link className="tw-link" to={href}>
                  打分明细
                </Link>
              </>
            ) : (
              ''
            );
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper title="目标打分结果">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default TargetEvalApply;
