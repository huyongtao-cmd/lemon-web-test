import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Input, InputNumber, Tooltip } from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import { fromQs } from '@/utils/stringUtils';

import SyntheticField from '@/components/common/SyntheticField';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { Selection, DatePicker } from '@/pages/gen/field';
import EvalDetailModal from './Modal';

import { selectProjectConditional } from '@/services/user/project/project';
import { selectUsersWithBu } from '@/services/gen/list';
import { queryCascaderUdc } from '@/services/gen/app';

const DOMAIN = 'platEvalList';

const SEL_COL = [
  { dataIndex: 'code', title: '编号', span: 10 },
  { dataIndex: 'name', title: '名称', span: 14 },
];

@connect(({ loading, platEvalList, dispatch }) => ({
  dispatch,
  loading: loading.effects[`${DOMAIN}/query`],
  platEvalList,
}))
class EvalList extends PureComponent {
  state = {
    visible: false,
    evalTypeData: [],
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/cleanSearchForm` });
    dispatch({ type: `${DOMAIN}/updateState`, payload: { dataSource: [] } });
    const { evaledResId } = fromQs();
    if (evaledResId) {
      const defaultParm = { evaledResId: +evaledResId };
      dispatch({
        type: `${DOMAIN}/updateSearchForm`,
        payload: defaultParm,
      });
      this.fetchData(defaultParm);
    }
  }

  fetchData = async params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: { ...params } });
  };

  render() {
    const {
      dispatch,
      loading,
      platEvalList: { dataSource, total, searchForm, source },
    } = this.props;
    const { visible, evalTypeData } = this.state;

    const tableProps = {
      columnsCache: DOMAIN,
      dispatch,
      loading,
      expirys: 0,
      rowKey: 'id',
      sortBy: 'id',
      sortDirection: 'DESC',
      searchForm,
      dataSource,
      total,
      enableSelection: false,
      onChange: filters => {
        this.fetchData(filters);
      },
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      searchBarForm: [
        {
          title: '项目',
          dataIndex: 'projId',
          options: {
            initialValue: searchForm.projId,
          },
          tag: (
            <Selection.Columns
              className="x-fill-100"
              source={selectProjectConditional}
              columns={SEL_COL}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              placeholder="请选择项目"
              dropdownMatchSelectWidth={false}
              dropdownStyle={{ width: 440 }}
              showSearch
            />
          ),
        },
        {
          title: '评价人',
          dataIndex: 'evalerResId',
          options: {
            initialValue: searchForm.evalerResId,
          },
          tag: (
            <Selection.Columns
              source={selectUsersWithBu}
              columns={SEL_COL}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              placeholder="请选择评价人"
              showSearch
            />
          ),
        },
        {
          title: '被评价人',
          dataIndex: 'evaledResId',
          options: {
            initialValue: searchForm.evaledResId,
          },
          tag: (
            <Selection.Columns
              source={selectUsersWithBu}
              columns={SEL_COL}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              placeholder="请选择被评价人"
              showSearch
            />
          ),
        },
        {
          title: '评价类别',
          dataIndex: 'evalClass',
          options: {
            initialValue: searchForm.evalClass,
          },
          tag: (
            <Selection.UDC
              code="TSK:EVAL_CLASS"
              placeholder="请选择评价类别"
              onChange={v => {
                dispatch({
                  type: `${DOMAIN}/updateSearchForm`,
                  payload: {
                    evalType: '',
                  },
                });
                if (v) {
                  queryCascaderUdc({
                    defId: 'TSK:EVAL_TYPE',
                    parentDefId: 'TSK:EVAL_CLASS',
                    parentVal: v,
                  }).then(({ response }) =>
                    this.setState({
                      evalTypeData: response,
                    })
                  );
                } else {
                  this.setState({
                    evalTypeData: [],
                  });
                }
              }}
            />
          ),
        },
        {
          title: '评价类型',
          dataIndex: 'evalType',
          options: {
            initialValue: searchForm.evalType,
          },
          tag: <Selection source={evalTypeData} placeholder="评价类型" />,
          // <Selection.UDC code="TSK:EVAL_TYPE" placeholder="请选择评价类型" />,
        },
        {
          title: '评价时间',
          dataIndex: 'evalDate',
          options: {
            initialValue: searchForm.evalDate,
          },
          tag: (
            // <DatePicker.RangePicker
            //   placeholder={['开始日期', '结束日期']}
            //   format="YYYY-MM-DD"
            //   className="x-fill-100"
            // />
            <SyntheticField className="tw-field-group">
              <DatePicker format="YYYY-MM-DD" className="x-fill-100" placeholder="开始日期" />
              <Input
                style={{
                  width: '10%',
                  borderLeft: 0,
                  pointerEvents: 'none',
                  backgroundColor: '#fff',
                  padding: 0,
                  textAlign: 'center',
                }}
                placeholder="~"
                disabled
              />
              <DatePicker format="YYYY-MM-DD" className="x-fill-100" placeholder="结束日期" />
            </SyntheticField>
          ),
        },
        {
          title: '平均分数',
          dataIndex: 'averageScore',
          options: {
            initialValue: searchForm.averageScore,
          },
          tag: (
            <SyntheticField className="tw-field-group">
              <InputNumber style={{ width: '45%' }} min={0} placeholder="最小值" />
              <Input
                style={{
                  width: '10%',
                  borderLeft: 0,
                  pointerEvents: 'none',
                  backgroundColor: '#fff',
                  padding: 0,
                  textAlign: 'center',
                }}
                placeholder="~"
                disabled
              />
              <InputNumber style={{ width: '45%', borderLeft: 0 }} min={0} placeholder="最大值" />
            </SyntheticField>
          ),
        },
      ],
      columns: [
        {
          title: '评价对象',
          dataIndex: 'evalTarget',
          render: (val, row) => (
            <a
              onClick={() => {
                this.setState({ visible: true });
                dispatch({
                  type: `${DOMAIN}/detail`,
                  payload: row.id,
                });
              }}
            >
              {val}
            </a>
          ),
        },
        {
          title: '评价类别',
          dataIndex: 'evalClassName',
          align: 'center',
        },
        {
          title: '评价类型',
          dataIndex: 'evalTypeName',
          align: 'center',
        },
        {
          title: '项目',
          dataIndex: 'sourceName',
        },
        {
          title: '评价人',
          dataIndex: 'evalerResName',
          align: 'center',
        },
        {
          title: '被评价人',
          dataIndex: 'evaledResName',
          align: 'center',
        },
        {
          title: '平均分数',
          dataIndex: 'averageScore',
          align: 'right',
        },
        {
          title: '评语',
          dataIndex: 'evalComment',
          width: 300,
          render: (value, row, key) =>
            value && value.length > 15 ? (
              <Tooltip placement="left" title={<pre>{value}</pre>}>
                <span>{`${value.substr(0, 15)}...`}</span>
              </Tooltip>
            ) : (
              <span>{value}</span>
            ),
        },
        {
          title: '评价日期',
          dataIndex: 'evalDate',
        },
      ],
    };

    return (
      <PageHeaderWrapper title="评价一览">
        <DataTable {...tableProps} />

        <EvalDetailModal
          source={source}
          visible={visible}
          toggle={() => this.setState({ visible: !visible })}
        />
      </PageHeaderWrapper>
    );
  }
}

export default EvalList;
