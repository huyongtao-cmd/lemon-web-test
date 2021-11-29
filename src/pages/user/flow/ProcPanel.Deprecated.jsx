import React from 'react';
import { Card, Row, Col, List, Icon, Badge } from 'antd';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import { isEmpty, isNil } from 'ramda';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import Title from '@/components/layout/Title';
import { flowToRouter } from '@/utils/flowToRouter';
import { getType } from '@/services/user/equivalent/equivalent';
import { readNotify } from '@/services/user/flow/flow';
import { formatDT } from '@/utils/tempUtils/DateTime';
import styles from './styles.less';

const DOMAIN = 'processPanel';

@connect(({ dispatch, loading, processPanel }) => ({
  dispatch,
  processPanel,
  loading,
}))
class ProcessPanel extends React.Component {
  componentDidMount() {
    const { dispatch } = this.props;
    const panelPaload = {
      limie: 10,
      sortBy: 'startTime',
      sortDirection: 'DESC',
    };
    dispatch({ type: `${DOMAIN}/todo`, payload: panelPaload });
    dispatch({ type: `${DOMAIN}/done`, payload: panelPaload });
    dispatch({ type: `${DOMAIN}/procs`, payload: panelPaload });
    dispatch({ type: `${DOMAIN}/notify` });
    dispatch({ type: `${DOMAIN}/approval` });
  }

  requestRealType = async (data, mode) => {
    const { id, taskId, docId } = data;
    const { status, response } = await getType(docId);
    if (status === 200 && response.ok) {
      const defKey =
        // eslint-disable-next-line
        response.datum === 'TASK_BY_PACKAGE'
          ? 'ACC_A22.SUM'
          : response.datum === 'TASK_BY_MANDAY'
            ? 'ACC_A22.SINGLE'
            : 'ACC_A22.COM';
      const route = flowToRouter(defKey, { id, taskId, docId, mode });
      router.push(route);
    }
  };

  jumpLink = (data, todo = false) => {
    const { defKey, id, taskId, docId } = data;
    const mode = todo ? 'edit' : 'view';
    if (defKey === 'ACC_A22') {
      this.requestRealType(data, mode);
    } else {
      const route = flowToRouter(defKey, {
        id,
        taskId,
        docId,
        mode,
      });
      router.push(route);
    }
  };

  render() {
    const {
      loading,
      processPanel: {
        todoList,
        todoTotalCount,
        doneList,
        doneTotalCount,
        notifyList,
        notifyTotalCount,
        procsList,
        procsTotalCount,
      },
    } = this.props;
    const loadings = type => loading.effects[`${DOMAIN}/${type}`];

    return (
      <PageHeaderWrapper title="流程看板">
        <Card
          className="tw-card-adjust"
          bordered={false}
          title={<Title icon="profile" text="流程看板" />}
        >
          <Row type="flex" gutter={4}>
            <Col span={6}>
              <Card
                type="inner"
                title={<Badge count={todoTotalCount}>待办事宜</Badge>}
                loading={loadings('todo')}
                extra={<Link to="/user/flow/todo">更多</Link>}
              >
                {isEmpty(todoList) ? (
                  <span>- 空 -</span>
                ) : (
                  <List itemLayout="horizontal">
                    {todoList.map(item => (
                      <List.Item extra={formatDT(item.startTime)}>
                        <List.Item.Meta
                          key={item.id}
                          title={
                            <>
                              <Icon type="file-text" />
                              <a
                                className={styles.procLink}
                                onClick={() => this.jumpLink(item, true)}
                              >
                                {item.docName}
                              </a>
                            </>
                          }
                          description={
                            <>
                              {isNil(item.todoInfo) ? null : (
                                <span>
                                  当前处理节点：
                                  {(item.todoInfo || {}).taskNames || '空'}
                                  &nbsp; | &nbsp; 当前处理人：
                                  {(item.todoInfo || {}).workerNames || '空'}
                                </span>
                              )}
                            </>
                          }
                        />
                      </List.Item>
                    ))}
                  </List>
                )}
              </Card>
            </Col>
            <Col span={6}>
              <Card
                type="inner"
                title="我提交的流程"
                loading={loadings('procs')}
                extra={<Link to="/user/flow/procs">更多</Link>}
              >
                {isEmpty(procsList) ? (
                  <span>- 空 -</span>
                ) : (
                  <List itemLayout="horizontal">
                    {procsList.map(item => (
                      <List.Item extra={formatDT(item.startTime)}>
                        <List.Item.Meta
                          key={item.id}
                          title={
                            <>
                              <Icon type="file-text" />
                              <a
                                className={styles.procLink}
                                onClick={() => this.jumpLink(item, true)}
                              >
                                {item.docName}
                              </a>
                            </>
                          }
                          description={
                            <>
                              {isNil(item.todoInfo) ? null : (
                                <span>
                                  当前处理节点：
                                  {(item.todoInfo || {}).taskNames || '空'}
                                  &nbsp; | &nbsp; 当前处理人：
                                  {(item.todoInfo || {}).workerNames || '空'}
                                </span>
                              )}
                            </>
                          }
                        />
                      </List.Item>
                    ))}
                  </List>
                )}
              </Card>
            </Col>
            <Col span={6}>
              <Card
                type="inner"
                title="流经我的流程"
                loading={loadings('done')}
                extra={<Link to="/user/flow/done">更多</Link>}
              >
                {isEmpty(doneList) ? (
                  <span>- 空 -</span>
                ) : (
                  <List itemLayout="horizontal">
                    {doneList.map(item => (
                      <List.Item extra={formatDT(item.startTime)}>
                        <List.Item.Meta
                          key={item.id}
                          title={
                            <>
                              <Icon type="file-text" />
                              <a
                                className={styles.procLink}
                                onClick={() => this.jumpLink(item, true)}
                              >
                                {item.docName}
                              </a>
                            </>
                          }
                          description={
                            <>
                              {isNil(item.todoInfo) ? null : (
                                <span>
                                  当前处理节点：
                                  {(item.todoInfo || {}).taskNames || '空'}
                                  &nbsp; | &nbsp; 当前处理人：
                                  {(item.todoInfo || {}).workerNames || '空'}
                                </span>
                              )}
                            </>
                          }
                        />
                      </List.Item>
                    ))}
                  </List>
                )}
              </Card>
            </Col>
            <Col span={6}>
              <Card
                type="inner"
                title="知会我的流程"
                loading={loadings('notidy')}
                extra={<Link to="/user/flow/cc">更多</Link>}
              >
                {isEmpty(notifyList) ? (
                  <span>- 空 -</span>
                ) : (
                  <List itemLayout="horizontal">
                    {notifyList.map(item => (
                      <List.Item extra={formatDT(item.startTime)}>
                        <List.Item.Meta
                          key={item.id}
                          title={
                            <>
                              <Icon type="file-text" />
                              <a
                                className={styles.procLink}
                                onClick={() => this.jumpLink(item, true)}
                              >
                                {item.docName}
                              </a>
                            </>
                          }
                          description={
                            <>
                              {isNil(item.todoInfo) ? null : (
                                <span>
                                  当前处理节点：
                                  {(item.todoInfo || {}).taskNames || '空'}
                                  &nbsp; | &nbsp; 当前处理人：
                                  {(item.todoInfo || {}).workerNames || '空'}
                                </span>
                              )}
                            </>
                          }
                        />
                      </List.Item>
                    ))}
                  </List>
                )}
              </Card>
            </Col>
          </Row>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default ProcessPanel;
