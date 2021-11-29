import { connect } from 'dva';
import React, { PureComponent } from 'react';
import router from 'umi/router';
import { formatMessage } from 'umi/locale';
import classnames from 'classnames';
import { Card, Button, Tooltip, Input, Modal, Radio, Divider, Rate } from 'antd';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { fromQs } from '@/utils/stringUtils';
import EvalDetailModal from './modal/Detail';

const DOMAIN = 'evalHistory';

@connect(({ loading, evalHistory, dispatch }) => ({
  loading,
  evalHistory,
  dispatch,
}))
class EvalHistory extends PureComponent {
  state = {
    visible: false,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const { sourceId, evalClass } = fromQs();
    dispatch({
      type: `${DOMAIN}/query`,
      payload: { sourceId, evalClass },
    });
  }

  handleCancel = () => {
    router.goBack();
  };

  render() {
    const {
      dispatch,
      loading,
      evalHistory: { dataSource, total },
    } = this.props;
    const { visible } = this.state;

    const tableProps = {
      columnsCache: DOMAIN,
      dispatch,
      loading: loading.effects[`${DOMAIN}/query`],
      expirys: 0,
      total,
      rowKey: 'id',
      sortBy: 'id',
      sortDirection: 'DESC',
      showSearch: false,
      showColumn: false,
      enableSelection: false,
      showExport: false,
      pagination: false,
      dataSource,
      columns: [
        {
          title: '评价类别',
          dataIndex: 'evalClassName',
          align: 'center',
        },
        {
          title: '评价类型',
          dataIndex: 'evalTypeName',
          align: 'center',
          render: (val, row) => (
            <a
              onClick={() => {
                this.setState({ visible: true });
                dispatch({
                  type: 'evalDetailModal/query',
                  payload: row.id,
                });
              }}
            >
              {val}
            </a>
          ),
        },
        {
          title: '评价对象',
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
            value && value.length > 30 ? (
              <Tooltip placement="left" title={value}>
                <pre>{`${value.substr(0, 30)}...`}</pre>
              </Tooltip>
            ) : (
              <pre>{value}</pre>
            ),
        },
        {
          title: '评价日期',
          dataIndex: 'evalDate',
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
            onClick={() => router.goBack()}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>

        <Card
          className="tw-card-adjust"
          bordered={false}
          title={<Title icon="profile" id="ui.menu.user.eval.history" defaultMessage="评价历史" />}
        >
          <DataTable {...tableProps} />
        </Card>

        <EvalDetailModal visible={visible} toggle={() => this.setState({ visible: !visible })} />
      </PageHeaderWrapper>
    );
  }
}

export default EvalHistory;
