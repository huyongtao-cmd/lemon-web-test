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
      <PageHeaderWrapper title="????????????">
        <Card
          className="tw-card-adjust"
          bordered={false}
          title={<Title icon="profile" text="????????????" />}
        >
          <Row type="flex" gutter={4}>
            <Col span={6}>
              <Card
                type="inner"
                title={<Badge count={todoTotalCount}>????????????</Badge>}
                loading={loadings('todo')}
                extra={<Link to="/user/flow/todo">??????</Link>}
              >
                {isEmpty(todoList) ? (
                  <span>- ??? -</span>
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
                                  ?????????????????????
                                  {(item.todoInfo || {}).taskNames || '???'}
                                  &nbsp; | &nbsp; ??????????????????
                                  {(item.todoInfo || {}).workerNames || '???'}
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
                title="??????????????????"
                loading={loadings('procs')}
                extra={<Link to="/user/flow/procs">??????</Link>}
              >
                {isEmpty(procsList) ? (
                  <span>- ??? -</span>
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
                                  ?????????????????????
                                  {(item.todoInfo || {}).taskNames || '???'}
                                  &nbsp; | &nbsp; ??????????????????
                                  {(item.todoInfo || {}).workerNames || '???'}
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
                title="??????????????????"
                loading={loadings('done')}
                extra={<Link to="/user/flow/done">??????</Link>}
              >
                {isEmpty(doneList) ? (
                  <span>- ??? -</span>
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
                                  ?????????????????????
                                  {(item.todoInfo || {}).taskNames || '???'}
                                  &nbsp; | &nbsp; ??????????????????
                                  {(item.todoInfo || {}).workerNames || '???'}
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
                title="??????????????????"
                loading={loadings('notidy')}
                extra={<Link to="/user/flow/cc">??????</Link>}
              >
                {isEmpty(notifyList) ? (
                  <span>- ??? -</span>
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
                                  ?????????????????????
                                  {(item.todoInfo || {}).taskNames || '???'}
                                  &nbsp; | &nbsp; ??????????????????
                                  {(item.todoInfo || {}).workerNames || '???'}
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
