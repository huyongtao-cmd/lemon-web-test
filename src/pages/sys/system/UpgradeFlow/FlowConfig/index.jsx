import React, { Component } from 'react';
import { fromQs } from '@/utils/stringUtils';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import { mountToTab } from '@/layouts/routerControl';
import { Button, Card, Input, Modal, Icon, Tooltip } from 'antd';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import EditableDataTable from '@/components/common/EditableDataTable';
import update from 'immutability-helper';
import { Selection } from '@/pages/gen/field';
import styles from './styles.less';
import BaseSwitch from '@/components/production/basic/BaseSwitch';

const DOMAIN = 'flowUpgradeFlowConfig';

@connect(({ dispatch, flowUpgradeFlowConfig, loading }) => ({
  dispatch,
  flowUpgradeFlowConfig,
  loading,
}))
@mountToTab()
class FlowConfig extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const { id } = fromQs();
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        btns: [],
        config: '',
        initialBtns: [],
        initialConfig: '',
        disableBtn: true,
      },
    });
    dispatch({ type: `${DOMAIN}/queryModel`, payload: id });
    dispatch({ type: `${DOMAIN}/queryLatestProcess`, payload: id });
  }

  handleSave = () => {
    const { dispatch, flowUpgradeFlowConfig } = this.props;
    const { item } = flowUpgradeFlowConfig;
    const { key, id } = fromQs();
    dispatch({ type: `${DOMAIN}/save`, payload: { item, key, id } });
  };

  showChangeConfirm = item => {
    const { confirm } = Modal;
    const that = this;
    const { key } = fromQs();
    const { dispatch } = this.props;
    confirm({
      title: '是否保存当前节点的修改？',
      content: '',
      okText: '确认',
      cancelText: '取消',
      onOk() {
        that.handleSave();
      },
      onCancel() {
        that.setState({ item });
        dispatch({
          type: `${DOMAIN}/queryBusinessBtn`,
          payload: { defKey: key, taskKey: item.key },
        });
        // console.log('Cancel');
      },
    });
  };

  handleItemClick = item => {
    const { key } = fromQs();
    const { dispatch, flowUpgradeFlowConfig } = this.props;
    const { btns, config, initialBtns, initialConfig } = flowUpgradeFlowConfig;
    if (JSON.stringify(btns) !== JSON.stringify(initialBtns) || config !== initialConfig) {
      this.showChangeConfirm(item);
    } else {
      dispatch({ type: `${DOMAIN}/updateState`, payload: { item } });
      dispatch({ type: `${DOMAIN}/queryBusinessBtn`, payload: { defKey: key, taskKey: item.key } });
    }
  };

  changeAutoAppr = (taskDefId, value) => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/changeAutoAppr`,
      payload: {
        taskDefId,
        autoAppr: value,
      },
    }).then(resp => {
      const { id } = fromQs();
      resp.ok && dispatch({ type: `${DOMAIN}/queryModel`, payload: id });
    });
  };

  render() {
    const { flowUpgradeFlowConfig, loading, dispatch } = this.props;
    const { modelList, btns, config, disableBtn } = flowUpgradeFlowConfig;
    const { confirm } = Modal;
    const itemId = flowUpgradeFlowConfig.item.id;
    const handleConfigClick = () => {
      const { item } = flowUpgradeFlowConfig;
      dispatch({ type: `${DOMAIN}/resetConfig`, payload: item.key });
    };
    const showConfirm = () => {
      confirm({
        title: '是否确认初始化配置？',
        content: '',
        okText: '确认',
        cancelText: '取消',
        onOk() {
          handleConfigClick();
        },
        onCancel() {
          // console.log('Cancel');
        },
      });
    };
    const udc = {
      FLOW_COMMIT: '提交',
      FLOW_PASS: '通过',
      FLOW_RETURN: '退回',
      FLOW_COUNTERSIGN: '加签',
      FLOW_NOTICE: '会签',
      FLOW_NOTIFY: '知会',
    };

    const handleItemChange = (val, dataIndex, index) => {
      if (dataIndex === 'btnType') {
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            btns: update(btns, {
              [index]: {
                [dataIndex]: {
                  $set: val,
                },
                btnKey: {
                  $set: val,
                },
                btnName: {
                  $set: udc[val],
                },
              },
            }),
          },
        });
      } else {
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            btns: update(btns, {
              [index]: {
                [dataIndex]: {
                  $set: val,
                },
              },
            }),
          },
        });
      }
    };

    const handleConfigChange = val => {
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          config: val,
        },
      });
    };

    const handleClick = () => {
      if (config) {
        showConfirm();
      } else {
        handleConfigClick();
      }
    };

    const handleRefresh = () => {
      const { id } = fromQs();
      dispatch({ type: `${DOMAIN}/queryModel`, payload: id });
    };

    const tableProps = {
      sortBy: 'id',
      rowKey: 'index',
      sortDirection: 'DESC',
      columnsCache: DOMAIN,
      dataSource: btns,
      loading: loading.effects[`${DOMAIN}/queryBusinessBtn`],
      pagination: false,
      enableSelection: false,
      enableDoubleClick: false,
      showCopy: false,
      showAdd: true,
      showDelete: true,
      readOnly: disableBtn,
      onAdd: newRow => {
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            btns: [
              ...btns,
              {
                ...newRow,
                index: btns.length + 1,
              },
            ],
          },
        });
      },
      onDeleteItems: (selectedRowKeys, selectedRows) => {
        const list = btns.filter(item => !selectedRowKeys.includes(item.index));
        // 重置顺序
        list.forEach((item, index) => {
          // eslint-disable-next-line no-param-reassign
          item.index = index + 1;
        });
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            btns: list,
          },
        });
      },
      columns: [
        {
          title: '顺序',
          align: 'center',
          dataIndex: 'index',
          width: '5%',
        },
        {
          title: '按钮类型',
          dataIndex: 'btnType',
          width: '15%',
          required: true,
          render: (value, row, index) => (
            <Selection.UDC
              value={value}
              code="BPM:BTN_TYPE"
              placeholder="请选择按钮类型"
              onChange={val => handleItemChange(val, 'btnType', index)}
              allowClear={false}
            />
          ),
        },
        {
          title: '按钮KEY',
          align: 'center',
          dataIndex: 'btnKey',
          width: '30%',
          required: true,
          render: (value, row, index) => (
            <Input
              value={value}
              placeholder="请输入按钮KEY"
              onChange={e => handleItemChange(e.target.value, 'btnKey', index)}
            />
          ),
        },
        {
          title: '按钮名称',
          dataIndex: 'btnName',
          width: '20%',
          required: true,
          render: (value, row, index) => (
            <Input
              value={value}
              placeholder="请输入按钮名称"
              onChange={e => handleItemChange(e.target.value, 'btnName', index)}
            />
          ),
        },
        {
          title: '按钮描述',
          dataIndex: 'btnDesc',
          width: '30%',
          render: (value, row, index) => (
            <Input
              value={value}
              placeholder="请输入按钮描述"
              onChange={e => handleItemChange(e.target.value, 'btnDesc', index)}
            />
          ),
        },
      ],
    };

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            type="primary"
            icon="save"
            size="large"
            disabled={disableBtn}
            onClick={this.handleSave}
            loading={loading.effects[`${DOMAIN}/save`]}
          >
            {formatMessage({ id: `misc.save`, desc: '保存' })}
          </Button>
        </Card>
        <Card
          bordered={false}
          title={
            <span style={{ fontSize: 18, color: 'red' }}>
              点击下方 [流程的节点]列表项，进行节点配置
            </span>
          }
          style={{ marginBottom: '4px', minWidth: '1200px' }}
        >
          <div style={{ float: 'left' }}>
            <div className={styles.leftTitle}>
              流程的节点
              <Icon
                style={{
                  cursor: 'pointer',
                  float: 'right',
                  marginTop: 10,
                  marginRight: 5,
                }}
                type="sync"
                onClick={handleRefresh}
              />
            </div>
            <div className={styles.leftContent}>
              <div className={styles.list}>
                <div>
                  <div
                    style={{
                      display: 'inline-block',
                      width: '20%',
                      borderRight: '1px solid #e8e8e8',
                      borderBottom: '1px solid #e8e8e8',
                      textAlign: 'center',
                    }}
                  >
                    顺序
                  </div>
                  <div
                    style={{
                      display: 'inline-block',
                      width: '40%',
                      borderBottom: '1px solid #e8e8e8',
                      textAlign: 'center',
                    }}
                  >
                    节点名称
                  </div>
                  <div
                    style={{
                      display: 'inline-block',
                      width: '40%',
                      borderBottom: '1px solid #e8e8e8',
                      textAlign: 'center',
                    }}
                  >
                    自动审批
                  </div>
                </div>
                {modelList.map((item, index) => (
                  <div className={styles.item} key={item.id}>
                    <div
                      className={itemId === item.id ? styles.itemFocused : styles.itemContent}
                      style={{
                        width: '20%',
                        verticalAlign: 'top',
                      }}
                    >
                      {index + 1}
                    </div>
                    <div
                      className={itemId === item.id ? styles.itemFocused : styles.itemContent}
                      style={{
                        width: '40%',
                        textAlign: 'left',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      onClick={() => this.handleItemClick(item)}
                    >
                      &nbsp;&nbsp;
                      <Tooltip title={item.name}>{item.name}</Tooltip>
                    </div>
                    <div
                      className={itemId === item.id ? styles.itemFocused : styles.itemContent}
                      style={{
                        width: '40%',
                        textAlign: 'center',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <BaseSwitch
                        id="autoAppr"
                        value={item.autoAppr}
                        onChange={v => this.changeAutoAppr(item.id, v)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className={styles.rightContent}>
            <EditableDataTable {...tableProps} />
            <div className={styles.config}>
              <Button className="tw-btn-info" onClick={handleClick} disabled={disableBtn}>
                初始化配置
              </Button>
            </div>
            <div style={{ marginTop: 20 }}>
              <Input.TextArea
                disabled={disableBtn}
                autosize
                value={config}
                onChange={e => handleConfigChange(e.target.value)}
              />
            </div>
          </div>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default FlowConfig;
