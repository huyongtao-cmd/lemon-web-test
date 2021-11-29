import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Button, Input, Tooltip } from 'antd';
import { formatMessage } from 'umi/locale';
import classnames from 'classnames';

import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import Title from '@/components/layout/Title';
import DataTable from '@/components/common/DataTable';
import { Selection, DatePicker } from '@/pages/gen/field';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';

const DOMAIN = 'userCenterMyExtrwork';

@connect(({ loading, dispatch, userCenterMyExtrwork }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  dispatch,
  userCenterMyExtrwork,
}))
@mountToTab()
class MyExtrwork extends PureComponent {
  componentDidMount() {
    // const { dispatch } = this.props;
    this.fetchData({ sortBy: 'workBegDate', sortDirection: 'DESC', date: [] });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: params,
    });
  };

  render() {
    const {
      dispatch,
      loading,
      userCenterMyExtrwork: { dataSource, searchForm, total },
    } = this.props;

    const tableProps = {
      columnsCache: DOMAIN,
      dispatch,
      loading,
      expirys: 0,
      total,
      rowKey: 'id',
      sortBy: 'workBegDate',
      sortDirection: 'DESC',
      dataSource,
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
          title: '项目名称',
          dataIndex: 'projName',
          options: {
            initialValue: searchForm.buId,
          },
          tag: <Input placeholder="请输入项目名称" />,
        },
        {
          title: '加班日期',
          dataIndex: 'date',
          options: {
            initialValue: searchForm.date || [undefined, undefined],
          },
          tag: <DatePicker.RangePicker format="YYYY-MM-DD" />,
        },
        {
          title: '调休安排情况',
          dataIndex: 'restInfo',
          options: {
            // initialValue: searchForm.buId,
          },
          tag: <Selection.UDC code="RES:IN_LIEU_INFO" placeholder="请选择调休安排情况" />,
        },
      ],
      columns: [
        {
          title: '姓名',
          dataIndex: 'resIdName',
          align: 'center',
        },
        {
          title: '项目名称',
          dataIndex: 'projName',
        },
        {
          title: '项目角色',
          dataIndex: 'role',
          align: 'center',
        },
        {
          title: '加班开始日期',
          dataIndex: 'workBegDate',
          align: 'center',
        },
        {
          title: '加班结束日期',
          dataIndex: 'workEndDate',
          align: 'center',
        },
        {
          title: '计划加班天数',
          dataIndex: 'extWorkDay',
          align: 'right',
          render: v => v && (+v).toFixed(1),
        },
        {
          title: '加班工作内容',
          dataIndex: 'workContent',
          render: (value, row, key) =>
            value && value.length > 15 ? (
              <Tooltip placement="left" title={value}>
                <pre>{`${value.substr(0, 15)}...`}</pre>
              </Tooltip>
            ) : (
              <pre>{value}</pre>
            ),
        },
        {
          title: '实际加班工时',
          dataIndex: 'actTime',
          align: 'center',
          render: value => value || 0,
        },
        {
          title: '已安排调休天数',
          dataIndex: 'canRestTime',
          align: 'center',
          render: value => value || 0,
        },
      ],
    };

    return (
      <PageHeaderWrapper title="我的加班">
        <Card
          className="tw-card-adjust"
          bordered={false}
          // title={<Title icon="profile" text="我的加班" />}
        >
          <DataTable {...tableProps} />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default MyExtrwork;
