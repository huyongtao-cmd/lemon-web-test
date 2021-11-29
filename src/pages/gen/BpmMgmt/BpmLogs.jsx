import React from 'react';
import { isEmpty, isNil, equals } from 'ramda';
import { Card, Tag, Timeline, Row, Icon, Divider, Table } from 'antd';
import api from '@/api';
import Title from '@/components/layout/Title';
import { request } from '@/utils/networkUtils';
import { toUrl } from '@/utils/stringUtils';
import { formatDT } from '@/utils/tempUtils/DateTime';
import variableMap, { typeNames } from './variable';

const { logs } = api.bpmn;

const showRemark = remark => {
  if (isNil(remark)) return false;
  if (equals(remark, 'undefined')) return false;
  if (equals(remark, 'null')) return false;
  return true;
};

class BpmLogs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      events: [],
      prcId: props.prcId || undefined,
    };
  }

  componentDidMount() {
    const { prcId } = this.state;
    this.fetchData(prcId);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot !== null) {
      this.fetchData(snapshot);
    }
  }

  getSnapshotBeforeUpdate(prevProps, prevState) {
    const { prcId = undefined } = this.props;
    if (prcId !== prevProps.prcId) {
      return prcId;
    }
    return null;
  }

  fetchData = async prcId => {
    const data = await request.get(toUrl(logs, { id: prcId }));
    let logEvents = Array.isArray(data.response) ? data.response : [];
    if (logEvents.length && !isEmpty(logEvents.filter(log => log.logTime === null))) {
      const tail = logEvents.slice(logEvents.length - 1);
      const head = logEvents.slice(0, logEvents.length - 1);
      logEvents = tail.concat(head);
    }
    this.setState({ events: logEvents });
  };

  // eslint-disable-next-line
  renderItem = event => {
    return (
      <Timeline.Item
        key={`${event.taskKey}-${event.logTime}`}
        color={variableMap(event.result, 'color')}
      >
        <Tag color={variableMap(event.result, 'color')}>{variableMap(event.result, 'name')}</Tag>
        {event.taskName && <Tag>{event.taskName}</Tag>}
        {event.workerNames && <Tag>{event.workerNames}</Tag>}
        {showRemark(event.remark) && <Tag>{event.remark}</Tag>}
        {event.logTime && (
          <Tag style={{ position: 'absolute', right: 0 }}>
            {formatDT(event.logTime, 'YYYY-MM-DD HH:mm:ss')}
          </Tag>
        )}
      </Timeline.Item>
    );
  };

  tableProps = () => {
    const { events = [] } = this.state;
    const tableProps = {
      rowKey: record => `${record.taskKey}-${record.logTime}`,
      dataSource: events,
      bordered: true,
      columns: [
        {
          title: '日期时间',
          dataIndex: 'logTime',
          className: 'text-center',
          width: '20%',
          render: value => formatDT(value, 'YYYY-MM-DD HH:mm:ss'),
        },
        {
          title: '操作者',
          dataIndex: 'workerNames',
          className: 'text-center',
          width: '10%',
        },
        /*{
          title: '岗位',
          dataIndex: 'workerRoles',
          width: '20%',
        },*/
        {
          title: '节点',
          dataIndex: 'taskName',
          className: 'text-center',
          width: '20%',
        },
        {
          title: '操作类型',
          dataIndex: 'result',
          className: 'text-center',
          width: '10%',
          render: value => variableMap(value, 'name'),
        },
        {
          title: '流转意见',
          dataIndex: 'remark',
          width: '20%',
          render: value => (showRemark(value) ? <pre>{value}</pre> : ''),
        },
      ],
      pagination: false,
    };
    return tableProps;
  };

  render() {
    const { events } = this.state;
    const { prcId, useTable = false } = this.props;

    return (
      <div>
        {!prcId ? (
          <span>信息不足，未查询到流程信息</span>
        ) : (
          <Card
            title={<Title icon="profile" id="app.setting.flow.step" defaultMessage="流转意见" />}
            className="tw-card-adjust"
            bordered={false}
            style={{ marginTop: 4 }}
          >
            {useTable ? (
              <Table {...this.tableProps()} />
            ) : (
              <>
                <Row type="flex" align="middle" justify="start" style={{ flexWrap: 'nowrap' }}>
                  {Object.keys(typeNames).map(key => {
                    const value = typeNames[key];
                    return (
                      <React.Fragment key={key}>
                        <Icon
                          type="tag"
                          theme="filled"
                          style={{ marginRight: 8, color: variableMap(key, 'color') }}
                        />
                        <Tag color={variableMap(key, 'color')}>{value}</Tag>
                      </React.Fragment>
                    );
                  })}
                </Row>
                <Divider dashed />
                <Timeline key="timeline">{events.map(event => this.renderItem(event))}</Timeline>
              </>
            )}
          </Card>
        )}
      </div>
    );
  }
}

export default BpmLogs;
