import React, { Component } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { isEmpty } from 'ramda';
import classnames from 'classnames';
import { List, Row, Card, Button, Alert, Popconfirm } from 'antd';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import ReactiveWrapper from '@/components/layout/ReactiveWrapper';
import { fromQs, getGuid } from '@/utils/stringUtils';
import { TagOpt } from '@/utils/tempUtils';
import { MultiSourceSelect } from '@/pages/gen/modal';

const DOMAIN = 'flowConfig';
const { Item } = List;

// 修复点开弹窗什么都不选就点确定的情况下，参数丢失导致逻辑取值错误的问题。弹窗组件对于当前文件业务来说，source 就是 tw:bpm:role
const FLOW_ROLE_SOURCE_NAME = 'tw:flow:role';

const sourceConfig = [
  {
    name: 'tw:flow:role',
    columns: [
      {
        title: '编码',
        dataIndex: 'code',
      },
      {
        title: '名称',
        dataIndex: 'name',
      },
      {
        title: '审批人',
        dataIndex: 'approver',
        render: (value, record) => {
          if (record && record.entity) {
            return record.entity.approver;
          }
          return '';
        },
      },
    ],
  },
];

@connect(({ dispatch, loading, flowConfig }) => ({
  dispatch,
  flowConfig,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@mountToTab()
class FlowConfig extends Component {
  constructor(props) {
    super(props);
    const params = fromQs();
    this.state = {
      title: `${params.name}(${params.key})`,
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const params = fromQs();
    this.setState({
      title: `${params.name}(${params.key})`,
    });
    dispatch({
      type: `${DOMAIN}/query`,
      payload: params.defId,
    });
  }

  handleCancel = () => {
    closeThenGoto('/sys/flowMen/flow');
  };

  transferStores = stores => {
    // tag:: 这里是单数据源，所以 stores 的类型就是 { source: [{ code, name}] }
    // re-tag:: 应该写在model里面，写这里方便跟 then 之后的操作做对应
    const source = Object.keys(stores)[0] || FLOW_ROLE_SOURCE_NAME;
    const members = (stores[source] || []).map(({ code }) => code);
    return {
      source,
      members,
    };
  };

  transferToFormData = stores => {
    if (isEmpty(stores)) return null;
    const source = Object.keys(stores)[0] || FLOW_ROLE_SOURCE_NAME;
    const members = (stores[source] || []).map(({ code }) => code);
    const memberNames = (stores[source] || [])
      // eslint-disable-next-line
      .map(({ code, name }) => {
        return { [code]: name };
      })
      // eslint-disable-next-line
      .reduce((prev, curr) => {
        return { ...prev, ...curr };
      }, {});
    return {
      source,
      members,
      memberNames,
      empty: false,
    };
  };

  handlePointTo = (id, taskKey, stores) => {
    const { dispatch } = this.props;
    const params = this.transferStores(stores);
    const { defId } = fromQs();
    dispatch({
      type: `${DOMAIN}/flowTo`,
      payload: {
        defId,
        taskKey,
        ...params,
      },
    }).then(result => {
      if (result) {
        const { flowConfig } = this.props;
        const { formData } = flowConfig;
        const needUpdate = formData[id];
        dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: {
            [id]: {
              ...needUpdate,
              to: this.transferToFormData(stores),
            },
          },
        });
      } else {
        dispatch({
          type: `${DOMAIN}/getFlowTo`,
          payload: {
            defId,
            taskKey,
          },
        });
      }
    });
  };

  handlePointCC = (id, taskKey, stores) => {
    const { dispatch } = this.props;
    const params = this.transferStores(stores);
    const { defId } = fromQs();
    dispatch({
      type: `${DOMAIN}/flowCC`,
      payload: {
        defId,
        taskKey,
        ...params,
      },
    }).then(result => {
      if (result) {
        const { flowConfig } = this.props;
        const { formData } = flowConfig;
        const needUpdate = formData[id];
        dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: {
            [id]: {
              ...needUpdate,
              cc: this.transferToFormData(stores),
            },
          },
        });
      } else {
        dispatch({
          type: `${DOMAIN}/getFlowCC`,
          payload: {
            defId,
            taskKey,
          },
        });
      }
    });
  };

  renderCfgItem = item => {
    const { flowConfig } = this.props;
    const { formData } = flowConfig;
    const { builtIn, code, defId, id, key, name } = item;
    return (
      <Item key={id} extra={<div style={{ width: 150, textAlign: 'right' }}>{name}</div>}>
        <Item.Meta
          title={
            <>
              <TagOpt
                value={builtIn}
                opts={[{ code: true, name: '内 置' }, { code: false, name: '非内置' }]}
                palette="red|green"
              />
              <span style={{ marginLeft: 16 }}>{code}</span>
            </>
          }
        />
        <ReactiveWrapper>
          {!builtIn ? (
            <>
              <Row
                type="flex"
                align="middle"
                justify="start"
                style={{ flexWrap: 'nowrap', marginBottom: 8 }}
              >
                <div
                  style={{
                    flex: 0,
                    padding: '0 8px',
                    wordBreak: 'keep-all',
                    alignSelf: 'flex-start',
                  }}
                >
                  指定：
                </div>
                <MultiSourceSelect
                  key={getGuid()}
                  value={formData[id].to}
                  dataSource={sourceConfig}
                  disabled={builtIn}
                  onChange={stores => this.handlePointTo(id, key, stores)}
                  singleSource
                  operate="checked"
                  checkBox={false}
                />
              </Row>
              <Row type="flex" align="middle" justify="start" style={{ flexWrap: 'nowrap' }}>
                <div
                  style={{
                    flex: 0,
                    padding: '0 8px',
                    wordBreak: 'keep-all',
                    alignSelf: 'flex-start',
                  }}
                >
                  知会：
                </div>
                <MultiSourceSelect
                  key={getGuid()}
                  value={formData[id].cc}
                  dataSource={sourceConfig}
                  disabled={builtIn}
                  onChange={stores => this.handlePointCC(id, key, stores)}
                  singleSource
                  operate="checked"
                  checkBox={false}
                />
              </Row>
            </>
          ) : (
            <Row type="flex" align="middle" justify="start" style={{ flexWrap: 'nowrap' }}>
              <div
                style={{
                  flex: 0,
                  padding: '0 8px',
                  wordBreak: 'keep-all',
                  alignSelf: 'flex-start',
                }}
              >
                知会：
              </div>
              <MultiSourceSelect
                value={formData[id].cc}
                dataSource={sourceConfig}
                disabled={false}
                onChange={stores => this.handlePointCC(id, key, stores)}
                singleSource
                operate="checked"
                checkBox={false}
              />
            </Row>
          )}
        </ReactiveWrapper>
      </Item>
    );
  };

  render() {
    const { title } = this.state;
    const { flowConfig } = this.props;
    const { list } = flowConfig;

    return (
      <PageHeaderWrapper title="流程配置">
        <Card className="tw-card-rightLine">
          <Alert showIcon message="内置角色已固化处理角色，只需要配置知会角色" type="info" />
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            disabled={false}
            onClick={this.handleCancel}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        <Card className="tw-card-adjust" title={title} bordered={false}>
          {isEmpty(list) ? (
            <span>空</span>
          ) : (
            <List
              itemLayout="vertical"
              dataSource={list}
              renderItem={item => this.renderCfgItem(item)}
            />
          )}
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default FlowConfig;
