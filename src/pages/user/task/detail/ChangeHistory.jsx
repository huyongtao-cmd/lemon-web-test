import React from 'react';
import classnames from 'classnames';
import { connect } from 'dva';
import { isEmpty } from 'ramda';
import { Button, Card, Table } from 'antd';
import { formatMessage } from 'umi/locale';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DescriptionList from '@/components/layout/DescriptionList';
import DataTable from '@/components/common/DataTable';
import { closeThenGoto, mountToTab } from '@/layouts/routerControl';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { fromQs } from '@/utils/stringUtils';

const DOMAIN = 'userTaskChangeHistory';
const { Description } = DescriptionList;

@connect(({ loading, userTaskChangeHistory }) => ({
  loading,
  ...userTaskChangeHistory,
}))
@mountToTab()
class TaskView extends React.PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const param = fromQs();
    dispatch({
      type: `${DOMAIN}/clean`,
    });
    if (param.id) {
      dispatch({
        type: `${DOMAIN}/query`,
        payload: param,
      });
    }
  }

  handleQueryDetail = (selectedRowKey, selectedRow) => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/queryDetails`,
      payload: { id: selectedRowKey, formData: selectedRow },
    });
  };

  render() {
    const { loading, dataList, changeList, formData } = this.props;
    const param = fromQs();
    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      loading: loading.effects[`${DOMAIN}/query`],
      total: dataList.length || 0,
      dataSource: dataList,
      bordered: true,
      // pagination: false,
      showColumn: false,
      showSearch: false,
      rowSelection: {
        type: 'radio',
      },
      columns: [
        {
          title: '变更人',
          dataIndex: 'createUserName',
          key: 'createUserName',
        },
        {
          title: '变更时间',
          dataIndex: 'changeDate',
          key: 'changeDate',
          render: (value, row, index) => (value ? formatDT(value) : null),
        },
        {
          title: '变更说明',
          dataIndex: 'changeDesc',
          key: 'changeDesc',
        },
      ],
      leftButtons: [
        {
          key: 'detail',
          className: 'tw-btn-primary',
          icon: 'form',
          title: '查看明细',
          loading: false,
          hidden: false,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            this.handleQueryDetail(selectedRowKeys[0], selectedRows[0]);
          },
        },
      ],
    };

    const changeTableProps = {
      rowKey: 'id',
      loading: loading.effects[`${DOMAIN}/queryDetails`],
      dataSource: changeList,
      pagination: false,
      bordered: true,
      columns: [
        {
          title: '活动',
          dataIndex: 'resActivityDesc',
          width: '20%',
        },
        {
          title: '原当量',
          dataIndex: 'oldEqva',
          width: '20%',
          align: 'right',
        },
        {
          title: '变更当量',
          dataIndex: 'deltaEava',
          width: '15%',
          align: 'right',
        },
        {
          title: '变更后当量',
          dataIndex: 'newEqva',
          width: '15%',
          align: 'right',
        },
        {
          title: '变更说明',
          dataIndex: 'changeDesc',
          width: '20%',
        },
        {
          title: '审批意见',
          dataIndex: 'approveDesc',
          width: '10%',
          align: 'center',
        },
      ],
    };

    return (
      <PageHeaderWrapper title="任务包信息">
        <Card className="tw-card-rightLine">
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => closeThenGoto(`/user/task/view?id=${param.id}`)}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        <Card className="tw-card-adjust" bordered={false} title="任务包当量变更历史">
          <DataTable {...tableProps} />
        </Card>
        <br />
        {!isEmpty(formData) && (
          <Card className="tw-card-adjust" bordered={false} title="当量变更结果">
            <DescriptionList size="large" col={2}>
              <Description term="变更人">{formData.createUserName}</Description>
              <Description term="变更时间">
                {formData.changeDate && formatDT(formData.changeDate)}
              </Description>
              <Description term="变更说明">{formData.changeDesc}</Description>
            </DescriptionList>
            <div style={{ margin: 12 }}>
              <Table {...changeTableProps} />
            </div>
          </Card>
        )}
      </PageHeaderWrapper>
    );
  }
}

export default TaskView;
