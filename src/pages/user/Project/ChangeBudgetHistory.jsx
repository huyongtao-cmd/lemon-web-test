import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Card } from 'antd';
import DataTable from '@/components/common/DataTable';
import classnames from 'classnames';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { fromQs } from '@/utils/stringUtils';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { mountToTab, closeThenGoto, markAsTab } from '@/layouts/routerControl';
import { formatMessage } from 'umi/locale';
import router from 'umi/router';
import { getUrl } from '@/utils/flowToRouter';
import { stringify } from 'qs';

const DOMAIN = 'changeBudgetList';

@connect(({ loading, changeBudgetList, dispatch }) => ({
  loading,
  changeBudgetList,
  dispatch,
}))
@mountToTab()
class changeBudgetList extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const param = fromQs();
    dispatch({ type: `${DOMAIN}/query`, payload: param });
  }

  render() {
    const {
      loading,
      dispatch,
      changeBudgetList: { list, total },
    } = this.props;

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'DESC',
      loading: loading.effects[`${DOMAIN}/query`],
      dataSource: list,
      bordered: true,
      total,
      showColumn: false,
      showSearch: false,
      rowSelection: {
        type: 'radio',
      },

      columns: [
        {
          title: '变更人',
          dataIndex: 'applyResName',
          key: 'applyResName',
        },
        {
          title: '变更时间',
          dataIndex: 'applyTime',
          key: 'applyTime',
          render: (value, row, index) => (value ? formatDT(value) : null),
        },
        {
          title: '变更说明',
          dataIndex: 'changeBrief',
          key: 'changeBrief',
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
            const urls = getUrl();
            const from = stringify({ from: urls });
            router.push(`/user/project/AbstractChangesDetail?id=${selectedRows[0].id}&${from}`);
          },
        },
      ],
    };
    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => {
              const { from } = fromQs();
              closeThenGoto(markAsTab(from));
            }}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        <Card className="tw-card-adjust" bordered={false} title="项目预算变更历史">
          <DataTable {...tableProps} />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default changeBudgetList;
