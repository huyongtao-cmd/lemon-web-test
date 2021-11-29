import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { DatePicker, Tooltip, Input, Card, Button } from 'antd';
import classnames from 'classnames';
import { formatMessage } from 'umi/locale';
import { isNil, isEmpty } from 'ramda';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import AsyncSelect from '@/components/common/AsyncSelect';
import SelectWithCols from '@/components/common/SelectWithCols';
import { injectUdc, mountToTab, closeThenGoto } from '@/layouts/routerControl';
import { fromQs } from '@/utils/stringUtils';

const SEL_COL = [
  // span为宽度。 合计不要超过24
  { dataIndex: 'code', title: '编号', span: 6 },
  { dataIndex: 'name', title: '名称', span: 14 },
];
const { RangePicker } = DatePicker;

const DOMAIN = 'teamTimeSheet';
@connect(({ loading, teamTimeSheet }) => ({
  teamTimeSheet,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@injectUdc(
  {
    tsStatus: 'TSK:TIMESHEET_STATUS', // 状态
    vacationUdc: 'TSK:TIMESHEET_VACATION', // 休假的活动
    notaskUdc: 'TSK:TIMESHEET_NOTASK', // 无任务的活动
  },
  DOMAIN
)
@mountToTab()
class TeamTimeSheet extends PureComponent {
  state = {
    cacheProjList: undefined,
  };

  componentDidMount() {
    const {
      dispatch,
      teamTimeSheet: { searchForm },
    } = this.props;
    const { resId } = fromQs();
    const defaultSearchForm = {
      tsResId: resId,
    };
    const initialState = {
      searchForm: defaultSearchForm,
      dataSource: [],
      total: undefined,
    };
    dispatch({ type: `${DOMAIN}/updateState`, payload: initialState });
    dispatch({ type: `${DOMAIN}/queryResList` });
    dispatch({ type: `${DOMAIN}/queryProjList` });
    this.fetchData(defaultSearchForm);
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: {
        ...params,
        tsResId: fromQs().resId,
      },
    });
  };

  render() {
    const {
      dispatch,
      loading,
      teamTimeSheet: { searchForm, dataSource, total, projList, resList, buList },
    } = this.props;
    const { _udcMap = {}, cacheProjList } = this.state;
    const { tsStatus = [], vacationUdc = [], notaskUdc = [] } = _udcMap;

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      loading,
      total,
      dataSource,
      searchForm,
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
            <SelectWithCols
              labelKey="name"
              valueKey="code"
              className="x-fill-100"
              columns={SEL_COL}
              dataSource={isNil(cacheProjList) ? projList : cacheProjList}
              onChange={() => {}}
              selectProps={{
                showSearch: true,
                onSearch: value => {
                  if (isNil(value)) this.setState({ cacheProjList: undefined });
                  else
                    this.setState({
                      cacheProjList: projList.filter(
                        d =>
                          d.code.indexOf(value) > -1 ||
                          d.name.toLowerCase().indexOf(value.toLowerCase()) > -1
                      ),
                    });
                },
                allowClear: true,
              }}
            />
          ),
        },
        // {
        //   title: '填报人',
        //   dataIndex: 'tsResName',
        //   options: {
        //     initialValue: searchForm.tsResName,
        //   },
        //   tag: <Input disabled />,
        // },
        {
          title: '状态',
          dataIndex: 'tsStatus',
          options: {
            initialValue: searchForm.tsStatus,
          },
          tag: <AsyncSelect source={tsStatus || []} allowClear={false} />,
        },
        {
          title: '日期范围',
          dataIndex: 'dateRange',
          options: {
            initialValue: searchForm.dateRange,
          },
          tag: <RangePicker />,
        },
      ],
      columns: [
        {
          title: '工作日期',
          dataIndex: 'workDate',
        },
        {
          title: '状态',
          dataIndex: 'tsStatusDesc',
          align: 'center',
        },
        {
          title: 'BU',
          dataIndex: 'buName',
          // align: 'center',
        },
        {
          title: '填报人',
          dataIndex: 'tsResName',
        },
        {
          title: '项目',
          dataIndex: 'projName',
        },
        {
          title: '任务包',
          dataIndex: 'taskId',
          render: (value, row, index) => {
            if (value) {
              const timesheetViews = !isEmpty(row.timesheetViews)
                ? row.timesheetViews.filter(item => item.id === row.taskId)
                : [];
              const { taskName = null } = timesheetViews[0] || {};
              return taskName;
            }
            return row.tsTaskIdenDesc;
          },
        },
        {
          title: '活动',
          dataIndex: 'actId',
          render: (value, row, index) => {
            if (value) {
              const timesheetViews = !isEmpty(row.timesheetViews)
                ? row.timesheetViews.filter(item => item.id === row.taskId)
                : [];
              const { resActivities = [] } = timesheetViews[0] || {};
              const { actName = null } = resActivities[0] || {};
              return actName;
            }
            if (row.tsActIden && row.tsTaskIden === 'VACATION') {
              const { name = null } = !isEmpty(vacationUdc)
                ? vacationUdc.filter(i => i.code === row.tsActIden)[0] || {}
                : {};
              return name;
            }
            if (row.tsActIden && row.tsTaskIden === 'NOTASK') {
              const { name = null } = !isEmpty(notaskUdc)
                ? notaskUdc.filter(i => i.code === row.tsActIden)[0] || {}
                : {};
              return name;
            }
            return row.tsActIdenDesc;
          },
        },
        {
          title: '工时',
          dataIndex: 'workHour',
          align: 'right',
        },
        {
          title: '工作说明',
          dataIndex: 'workDesc',
          render: (value, row, index) =>
            value && value.length > 30 ? (
              <Tooltip placement="left" title={value}>
                <pre>{`${value.substr(0, 30)}...`}</pre>
              </Tooltip>
            ) : (
              <pre>{value}</pre>
            ),
        },
      ],
    };

    return (
      <PageHeaderWrapper title="工时列表">
        <Card className="tw-card-rightLine">
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => {
              const { from } = fromQs();
              from ? closeThenGoto(from) : closeThenGoto(`/user/center/myTeam`);
            }}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        {!isEmpty(tsStatus) &&
          !isEmpty(vacationUdc) &&
          !isEmpty(notaskUdc) && <DataTable {...tableProps} />}
      </PageHeaderWrapper>
    );
  }
}

export default TeamTimeSheet;
