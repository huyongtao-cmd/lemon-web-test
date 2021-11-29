import React from 'react';
import { Card, Badge, Button } from 'antd';
import { connect } from 'dva';
import { isNil, equals } from 'ramda';
import classnames from 'classnames';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { fromQs } from '@/utils/stringUtils';
import styles from './styles.less';
// 名字定义为如下几条，列一下对应关系
// '待办事宜'      - todo
import TodoTable from './Todo';
// '我的退回'      - back
import BackTable from './Back';
// '我提交的流程'   - procs
import ProcsTable from './Procs';
// '流经我的流程'   - done
import DoneTable from './Done';
// '知会我的流程'   - cc
import CCTable from './Notify';

const TYPE_MAP = {
  TODO: 'todo',
  BACK: 'back',
  DONE: 'done',
  PROCS: 'procs',
  CC: 'cc',
};
const DOMAIN = 'processPanel';

@connect(({ dispatch, loading, processPanel }) => ({
  dispatch,
  processPanel,
  loading,
}))
class ProcessPanel extends React.Component {
  componentDidMount() {
    const { type } = fromQs();
    type && this.checkoutType(type);
  }

  checkoutType = type => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { currentType: type },
    });
    // this.setState({ currentType: type });
  };

  render() {
    const {
      processPanel: { currentType },
    } = this.props;

    const isCurrent = type => equals(type, currentType);
    const className = type => (isCurrent(type) ? 'tw-btn-primary' : 'tw-btn-default');

    return (
      <PageHeaderWrapper title="我的流程1">
        <Card
          className="tw-card-adjust"
          bordered={false}
          title={
            <Button.Group>
              <Button
                size="large"
                style={{ borderColor: '#284488' }}
                className={className(TYPE_MAP.TODO)}
                onClick={() => this.checkoutType(TYPE_MAP.TODO)}
              >
                待办事宜
              </Button>
              <Button
                size="large"
                style={{ borderColor: '#284488' }}
                className={className(TYPE_MAP.BACK)}
                onClick={() => this.checkoutType(TYPE_MAP.BACK)}
              >
                我的退回
              </Button>
              <Button
                size="large"
                style={{ borderColor: '#284488' }}
                className={className(TYPE_MAP.PROCS)}
                onClick={() => this.checkoutType(TYPE_MAP.PROCS)}
              >
                我提交的流程
              </Button>
              <Button
                size="large"
                style={{ borderColor: '#284488' }}
                className={className(TYPE_MAP.DONE)}
                onClick={() => this.checkoutType(TYPE_MAP.DONE)}
              >
                流经我的流程
              </Button>
              <Button
                size="large"
                style={{ borderColor: '#284488' }}
                className={className(TYPE_MAP.CC)}
                onClick={() => this.checkoutType(TYPE_MAP.CC)}
              >
                知会我的流程
              </Button>
            </Button.Group>
          }
          bodyStyle={{ padding: 0 }}
        />
        <Card style={{ marginTop: 4 }} bodyStyle={{ padding: 0 }}>
          <div className={styles.wrapperHeader}>
            <div style={{ display: isCurrent(TYPE_MAP.TODO) ? 'block' : 'none' }}>
              <TodoTable />
            </div>
            <div style={{ display: isCurrent(TYPE_MAP.BACK) ? 'block' : 'none' }}>
              <BackTable />
            </div>
            <div style={{ display: isCurrent(TYPE_MAP.PROCS) ? 'block' : 'none' }}>
              <ProcsTable />
            </div>
            <div style={{ display: isCurrent(TYPE_MAP.DONE) ? 'block' : 'none' }}>
              <DoneTable />
            </div>
            <div style={{ display: isCurrent(TYPE_MAP.CC) ? 'block' : 'none' }}>
              <CCTable />
            </div>
          </div>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default ProcessPanel;
