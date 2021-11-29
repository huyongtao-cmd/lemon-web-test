import React from 'react';
import { connect } from 'dva';
import classnames from 'classnames';
import { DatePicker, Input, Select, Radio, Card, Button } from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import { isEmpty, omit, isNil } from 'ramda';

import { injectUdc, mountToTab, closeThenGoto } from '@/layouts/routerControl';
import DataTable from '@/components/common/DataTable';
import SyntheticField from '@/components/common/SyntheticField';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import createMessage from '@/components/core/AlertMessage';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { createAlert } from '@/components/core/Confirm';
import { UdcSelect } from '@/pages/gen/field';
import { fromQs } from '@/utils/stringUtils';
import { TagOpt } from '@/utils/tempUtils';
import router from 'umi/router';
import Link from 'umi/link';

const DOMAIN = 'taskList';

@connect(({ loading, taskList }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  ...taskList,
}))
@injectUdc(
  {
    taskStatus: 'TSK:TASK_STATUS',
  },
  DOMAIN
)
@mountToTab()
class TaskList extends React.Component {
  componentDidMount() {
    const { resId } = fromQs();
    const { dispatch } = this.props;
    const defaultSearchForm = {
      receiverResId: resId,
    };
    const initialState = {
      searchForm: defaultSearchForm,
      dataSource: [],
      total: undefined,
      detailList: [],
      detailTotal: undefined,
      detailTitle: undefined,
    };
    dispatch({ type: `${DOMAIN}/updateState`, payload: initialState });
    dispatch({ type: `${DOMAIN}/queryResInfo`, payload: resId });
    this.fetchData({
      sortBy: 'id',
      sortDirection: 'DESC',
      ...defaultSearchForm,
    });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    const { createTime } = params || {};
    const noTime = isEmpty(createTime) || isNil(createTime) || isNil(createTime[0]);
    const time = {
      createStartTime: noTime ? undefined : formatDT(createTime[0]),
      createEndTime: noTime ? undefined : formatDT(createTime[1]),
    };
    const newParams = {
      ...time,
      ...omit(['createTime'], params),
      receiverResId: fromQs().resId,
    };

    dispatch({
      type: `${DOMAIN}/query`,
      payload: newParams,
    });
  };

  getTableProps = () => {
    const { dispatch, loading, searchForm, dataSource, total } = this.props;
    const { _udcMap = {} } = this.state;
    const { taskStatus } = _udcMap;

    return {
      sortBy: 'id',
      rowKey: 'id',
      sortDirection: 'DESC',
      scroll: { x: 2000 },
      columnsCache: DOMAIN,
      loading,
      total,
      dataSource,
      enableSelection: false,
      showClear: false,
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
          title: '创建日期',
          dataIndex: 'createTime',
          options: {
            initialValue: searchForm.createTime,
          },
          tag: (
            <DatePicker.RangePicker
              className="x-fill-100"
              placeholder={['创建开始时间', '创建结束时间']}
              format="YYYY-MM-DD"
            />
          ),
        },
        // {
        //   title: '接收资源',
        //   dataIndex: 'receiverResName',
        //   options: {
        //     initialValue: searchForm.receiverResName,
        //   },
        //   tag: <Input disabled />,
        // },
      ],
      columns: [
        {
          title: '编号',
          dataIndex: 'taskNo',
          sorter: true,
          align: 'center',
        },
        {
          title: '任务名称',
          dataIndex: 'taskName',
          render: (value, row, index) => {
            const { resId, from } = fromQs();
            const url = from
              ? `/user/task/view?id=${
                  row.id
                }&from=/user/center/myTeam/taskList&resId=${resId}&source=${from}`
              : `/user/task/view?id=${row.id}&from=/user/center/myTeam/taskList&resId=${resId}`;
            return (
              <Link className="tw-link" to={url}>
                {value}
              </Link>
            );
          },
        },
        {
          title: '任务状态',
          dataIndex: 'taskStatus',
          align: 'center',
          render: status => <TagOpt value={status} opts={taskStatus} palette="red|green" />,
        },
        {
          title: '发包资源',
          dataIndex: 'disterResName',
        },
        {
          title: '接收资源',
          dataIndex: 'receiverResName',
        },
        {
          title: '复合能力', // jobType1Name + jobType2Name + capasetLeveldName
          dataIndex: 'jobType1Name',
          // align: 'center',
          render: (value, row, index) =>
            [row.jobType1Name, row.jobType2Name, row.capasetLeveldName].join('-'),
        },
        {
          title: '事由类型',
          dataIndex: 'reasonTypeName',
          align: 'center',
        },
        {
          title: '事由号',
          dataIndex: 'reasonName',
          // align: 'center',
        },
        {
          title: '费用承担方',
          dataIndex: 'expenseBuName',
        },
        {
          title: '是否跨BU', // expenseBuId === receiverBuId
          dataIndex: 'expenseBuId',
          align: 'center',
          render: (value, rows) => (
            <TagOpt
              value={+(rows.expenseBuId !== rows.receiverBuId)}
              opts={[{ code: 0, name: '否' }, { code: 1, name: '是' }]}
              palette="red|green"
            />
          ),
        },
        {
          title: '转包任务包',
          dataIndex: 'transferFlag',
          align: 'center',
          render: (value, rows) => (
            <TagOpt
              value={value}
              opts={[{ code: 0, name: '否' }, { code: 1, name: '是' }]}
              palette="red|green"
            />
          ),
        },
        {
          title: 'BU结算价',
          dataIndex: 'buSettlePrice',
          align: 'right',
        },
        {
          title: '当量收入',
          dataIndex: 'eqvaSalary',
          align: 'right',
        },
        {
          title: '总当量',
          dataIndex: 'eqvaQty',
          align: 'right',
        },
        {
          title: '已结算当量',
          dataIndex: 'settledEqva',
          align: 'right',
        },
        {
          title: '验收方式',
          dataIndex: 'acceptMethodName',
          align: 'center',
        },
        {
          title: '计价方式',
          dataIndex: 'pricingMethodName',
          align: 'center',
        },
        {
          title: '创建日期',
          dataIndex: 'createTime',
          align: 'center',
          render: createTime => formatDT(createTime),
        },
      ],
    };
  };

  render() {
    const { _udcMap = {} } = this.state;
    const { taskStatus } = _udcMap;

    return (
      <PageHeaderWrapper title="任务列表">
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
        {taskStatus && <DataTable {...this.getTableProps()} />}
      </PageHeaderWrapper>
    );
  }
}

export default TaskList;
