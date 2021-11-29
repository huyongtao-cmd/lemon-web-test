/* eslint-disable array-callback-return */
/* eslint-disable prefer-const */
/* eslint-disable no-param-reassign */
/* eslint-disable no-dupe-keys */
/* eslint-disable react/no-unused-state */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import Title from '@/components/layout/Title';
import update from 'immutability-helper';

import { Button, Card, Form, Input, Select, TimePicker, Modal, Row, Col } from 'antd';
import classnames from 'classnames';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import EditableDataTable from '@/components/common/EditableDataTable';
import createMessage from '@/components/core/AlertMessage';
import { cloneDeep } from 'lodash';
// import styles from './styles.less';

class SetThemeFlowModel extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      nodeList: [],
      Key: [],
    };
  }

  componentDidMount() {}

  // 流程列表行编辑触发事件
  onListCellChanged = (rowIndex, rowField) => rowFieldValue => {
    const {
      dispatch,
      DOMAIN,
      themeDetail: { processList },
    } = this.props;

    const value = rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue;
    const newDataList = update(processList, {
      [rowIndex]: {
        [rowField]: {
          $set: value,
        },
      },
    });
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { processList: newDataList },
    });
  };

  // 流程节点行编辑触发事件
  onNodeCellChanged = (rowIndex, rowField) => rowFieldValue => {
    const {
      dispatch,
      DOMAIN,
      themeDetail: { processList },
    } = this.props;
    const { Key, nodeList } = this.state;
    const value = rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue;
    const newNodeList = update(nodeList, {
      [rowIndex]: {
        [rowField]: {
          $set: value,
        },
      },
    });
    const newProcessList = processList.map(item => {
      if (item.proNum === Key[0]) {
        item.procDtls = newNodeList;
      }
      return item;
    });
    dispatch({ type: `${DOMAIN}/updateState`, payload: { processList: newProcessList } });
    this.setState({
      nodeList: newNodeList,
    });
  };

  // 选中流程列表
  selectedListRow = (selectedRowKeys, selectedRows) => {
    let newNodeList = [];
    if (selectedRowKeys.length !== 0) {
      const { dispatch, DOMAIN, themeDetail } = this.props;
      const { processList } = themeDetail;
      newNodeList = processList.filter(item => item.proNum === selectedRowKeys[0])[0].procDtls;
    }

    this.setState(
      {
        nodeList: [],
        Key: [],
      },
      () => {
        this.setState({
          nodeList: newNodeList,
          Key: selectedRowKeys,
        });
      }
    );
  };

  render() {
    const { title, onCancel, onOk, dispatch, DOMAIN, themeDetail, ...rest } = this.props;
    const { processList } = themeDetail;
    const { nodeList, Key } = this.state;
    // console.log('Key', Key);
    const modalOpts = {
      ...rest,
      title,
      maskClosable: true,
      centered: false,
      onCancel,
      onOk,
    };
    const listProps = {
      rowSelection: {},
      rowKey: 'proNum',
      sortBy: 'proNum',
      dataSource: processList,
      showCopy: false,
      loading: false,
      size: 'small',
      rowSelection: {
        selectedRowKeys: Key,
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedListRow(selectedRowKeys, selectedRows);
        },
      },
      onAdd: newRow => {
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            processList: update(processList, {
              $push: [
                {
                  ...newRow,
                  procDtls: [],
                },
              ],
            }),
          },
        });
      },
      onDeleteItems: (selectedRowKeys, selectedRows) => {
        const newDataSource = processList.filter(
          item => !selectedRowKeys.filter(keyValue => keyValue === item.proNum).length
        );
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            processList: newDataSource,
          },
        });
        if (selectedRowKeys.length !== 0) {
          this.setState({
            Key: [],
            nodeList: [],
          });
        }
      },
      buttons: [
        {
          key: 'up',
          title: '上移',
          loading: false,
          minSelections: 1, // 最少需要选中多少行，按钮才显示
          cb: (selectedRowKeys, selectedRows) => {
            processList.map((item, index) => {
              if (selectedRowKeys[0] === item.proNum) {
                if (index === 0) {
                  return;
                }
                processList.splice(
                  index - 1,
                  1,
                  ...processList.splice(index, 1, processList[index - 1])
                );
                dispatch({
                  type: `${DOMAIN}/updateState`,
                  payload: {
                    processList,
                  },
                });
              }
            });
          },
        },
        {
          key: 'down',
          title: '下移',
          minSelections: 1, // 最少需要选中多少行，按钮才显示
          cb: (selectedRowKeys, selectedRows) => {
            const temProcessList = cloneDeep(processList);
            temProcessList.map((item, index) => {
              if (selectedRowKeys[0] === item.proNum) {
                if (index === temProcessList.length - 1) {
                  return;
                }
                temProcessList.splice(
                  index,
                  1,
                  ...temProcessList.splice(index + 1, 1, temProcessList[index])
                );
                dispatch({
                  type: `${DOMAIN}/updateState`,
                  payload: {
                    processList: temProcessList,
                  },
                });
              }
            });
          },
        },
      ],

      columns: [
        {
          title: '序号',
          dataIndex: 'nodeNum',
          align: 'center',
          width: 20,
          render: (value, row, index) => <span>{index + 1}</span>,
        },
        {
          title: '流程名称',
          dataIndex: 'proName',
          align: 'center',
          render: (value, row, index) => (
            <Input
              className="x-fill-100"
              defaultValue={value}
              onBlur={this.onListCellChanged(index, 'proName')}
            />
          ),
        },
      ],
    };
    const nodeProps = {
      rowSelection: {},
      rowKey: 'nodeNum',
      sortBy: 'nodeNum',
      dataSource: nodeList,
      showCopy: false,
      loading: false,
      size: 'small',
      onChange: filters => {},
      onAdd: newRow => {
        if (Key.length !== 0) {
          let temDetails = processList.filter(item => item.proNum === Key[0]);
          let tem = [];
          if (temDetails.length !== 0) {
            tem = temDetails[0].procDtls;
          }
          const newDetails = update(tem, {
            $push: [
              {
                ...newRow,
              },
            ],
          });
          const newProcessList = processList.map(item => {
            if (item.proNum === Key[0]) {
              item.procDtls = newDetails;
            }
            return item;
          });
          dispatch({
            type: `${DOMAIN}/updateState`,
            payload: {
              processList: newProcessList,
            },
          });
          this.setState({
            nodeList: newDetails,
          });
        } else {
          createMessage({ type: 'warn', description: '请选择一条流程' });
        }
      },
      onDeleteItems: (selectedRowKeys, selectedRows) => {
        const newProcDtls = nodeList.filter(
          item => !selectedRowKeys.filter(keyValue => keyValue === item.nodeNum).length
        );
        const newProcessList = processList.map(item => {
          if (item.proNum === Key[0]) {
            item.procDtls = newProcDtls;
          }
          return item;
        });
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            processList: newProcessList,
          },
        });
        if (selectedRowKeys.length !== 0) {
          this.setState({
            nodeList: newProcDtls,
          });
        }
      },
      buttons: [
        {
          key: 'up',
          title: '上移',
          loading: false,
          minSelections: 1, // 最少需要选中多少行，按钮才显示
          cb: (selectedRowKeys, selectedRows) => {
            const temNodeList = cloneDeep(nodeList);
            temNodeList.map((item, index) => {
              if (selectedRowKeys[0] === item.nodeNum) {
                if (index === 0) {
                  return;
                }
                temNodeList.splice(
                  index - 1,
                  1,
                  ...temNodeList.splice(index, 1, temNodeList[index - 1])
                );
                const newProcessList = processList.map(_ => {
                  if (_.proNum === Key[0]) {
                    _.procDtls = temNodeList;
                  }
                  return _;
                });
                dispatch({
                  type: `${DOMAIN}/updateState`,
                  payload: {
                    processList: newProcessList,
                  },
                });
                this.setState({
                  nodeList: temNodeList,
                });
              }
            });
          },
        },
        {
          key: 'down',
          title: '下移',
          minSelections: 1, // 最少需要选中多少行，按钮才显示
          cb: (selectedRowKeys, selectedRows) => {
            const temNodeList = cloneDeep(nodeList);
            temNodeList.map((item, index) => {
              if (selectedRowKeys[0] === item.nodeNum) {
                temNodeList.splice(
                  index,
                  1,
                  ...temNodeList.splice(index + 1, 1, temNodeList[index])
                );
                const newProcessList = processList.map(_ => {
                  if (_.proNum === Key[0]) {
                    _.procDtls = temNodeList;
                  }
                  return _;
                });
                dispatch({
                  type: `${DOMAIN}/updateState`,
                  payload: {
                    processList: newProcessList,
                  },
                });
                this.setState({
                  nodeList: temNodeList,
                });
              }
            });
          },
        },
      ],

      columns: [
        {
          title: '序号',
          dataIndex: 'nodeNum',
          align: 'center',
          width: 20,
          render: (value, row, index) => <span>{index + 1}</span>,
        },
        {
          title: '节点名称',
          dataIndex: 'nodeName',
          align: 'center',
          render: (value, row, index) => (
            <Input
              className="x-fill-100"
              defaultValue={value}
              onBlur={this.onNodeCellChanged(index, 'nodeName')}
            />
          ),
        },
        {
          title: '说明文字',
          dataIndex: 'nodeRemark',
          align: 'center',
          render: (value, row, index) => (
            <Input
              className="x-fill-100"
              defaultValue={value}
              onBlur={this.onNodeCellChanged(index, 'nodeRemark')}
            />
          ),
        },
        {
          title: '功能链接',
          dataIndex: 'nodeUrl',
          align: 'center',
          render: (value, row, index) => (
            <Input
              className="x-fill-100"
              defaultValue={value}
              onBlur={this.onNodeCellChanged(index, 'nodeUrl')}
            />
          ),
        },
      ],
    };

    return (
      <PageHeaderWrapper title={title}>
        <Modal {...modalOpts}>
          <Card className="tw-card-adjust" title={<Title text="流程列表" />} bordered={false}>
            <EditableDataTable {...listProps} />
          </Card>
          <Card className="tw-card-adjust" title={<Title text="流程节点" />} bordered={false}>
            <EditableDataTable {...nodeProps} />
          </Card>
          {/* <Card className="tw-card-adjust" title={<Title text="预料效果" />} bordered={false}>
            这是预览效果
          </Card> */}
        </Modal>
      </PageHeaderWrapper>
    );
  }
}

export default SetThemeFlowModel;
