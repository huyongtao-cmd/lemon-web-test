import React from 'react';
import { connect } from 'dva';
import { Modal, Button, Card, Form, Table } from 'antd';
import { isEmpty } from 'ramda';
import createMessage from '@/components/core/AlertMessage';
import FormItem from '@/components/production/business/FormItem';
import { createConfirm } from '@/components/core/Confirm';

const DOMAIN = 'targetCycle';

@connect(({ dispatch, loading, targetCycle, global, user }) => ({
  dispatch,
  loading,
  ...targetCycle,
  global,
  user,
}))
@Form.create({
  mapPropsToFields(props) {
    const { formData } = props;
    const fields = {};
    Object.keys(formData).forEach(key => {
      const tempValue = formData[key];
      fields[key] = Form.createFormField({ value: tempValue });
    });
    return fields;
  },
  onValuesChange(props, changedValues, allValues) {
    if (isEmpty(changedValues)) return;
    const name = Object.keys(changedValues)[0];
    const value = changedValues[name];
    const newFieldData = { [name]: value };

    switch (name) {
      default:
        break;
    }
    props.dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: newFieldData,
    });
  },
})
class InformModal extends React.Component {
  constructor(props) {
    super(props);
    const { isCreateInform = true } = props;

    this.state = {
      isCreateInform,
      // eslint-disable-next-line react/no-unused-state
      addName: {},
    };
  }

  componentDidMount() {}

  // 点击确定按钮保存项目
  submit = list => {
    const { dispatch, handleOk, periodId, mold } = this.props;
    if (mold === 'performanceInform') {
      dispatch({
        type: `${DOMAIN}/targetBatchSet`,
        payload: {
          periodId,
          resIds: list.map(v => v.resId),
        },
      });
    } else if (mold === 'middleInform') {
      dispatch({
        type: `${DOMAIN}/feedbackBatchSet`,
        payload: {
          periodId,
          resIds: list.map(v => v.resId),
        },
      });
    } else if (mold === 'endInform') {
      dispatch({
        type: `${DOMAIN}/summaryBatchSet`,
        payload: {
          periodId,
          resIds: list.map(v => v.resId),
        },
      });
    }
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        dataListSelected: [],
      },
    });
    handleOk();
  };

  handleDelete = id => {
    const { dispatch } = this.props;
    if (id) {
      createConfirm({
        content: '确认删除所选记录？',
        onOk: () =>
          dispatch({
            type: `${DOMAIN}/delete`,
            payload: {
              ids: id,
            },
          }),
      });
    }
  };

  onCancel = () => {
    const { dispatch, handleCancel } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        dataListSelected: [],
      },
    });
    handleCancel();
  };

  createNotified = () => {
    const {
      dispatch,
      dataListSelected = [],
      createResList: { list = [] },
    } = this.props;
    const rowSelection = {
      selectedRowKeys: dataListSelected.map(v => v.resId),
      onSelect: (record, selected, selectedRows, nativeEvent) => {
        if (selected) {
          dispatch({
            type: `${DOMAIN}/updateState`,
            payload: {
              dataListSelected: dataListSelected.concat([record]),
            },
          });
        } else {
          dispatch({
            type: `${DOMAIN}/updateState`,
            payload: {
              dataListSelected: dataListSelected.filter(v => v.resId !== record.resId),
            },
          });
        }
      },
      onSelectAll: (selected, selectedRows, changeRows) => {
        if (selected) {
          dispatch({
            type: `${DOMAIN}/updateState`,
            payload: {
              dataListSelected: dataListSelected.concat(changeRows),
            },
          });
        } else {
          dispatch({
            type: `${DOMAIN}/updateState`,
            payload: {
              dataListSelected: dataListSelected.filter(
                v => !changeRows.map(item => item.resId).includes(v.resId)
              ),
            },
          });
        }
      },
    };
    return {
      dataSource: list,
      rowKey: 'resId',
      pagination: false,
      rowSelection,
      onRow: this.handleOnRow,
      onSelect: this.onSelect,
      columns: [
        {
          title: '员工名称',
          dataIndex: 'resName',
          align: 'center',
          width: 200,
        },
        {
          title: '部门',
          dataIndex: 'baseBuName',
          width: 150,
          align: 'center',
        },
        {
          title: '入职时间',
          dataIndex: 'enrollDate',
          width: 150,
          align: 'center',
        },
      ],
    };
  };

  haveNotified = () => {
    const {
      haveNotifiedList: { notifiedList = [] },
    } = this.props;
    return {
      dataSource: notifiedList,
      pagination: false,
      columns: [
        {
          title: '员工名称',
          dataIndex: 'resName',
          align: 'center',
          width: 200,
        },
        {
          title: '部门',
          dataIndex: 'baseBuName',
          width: 150,
          align: 'center',
        },
        {
          title: '入职时间',
          dataIndex: 'enrollDate',
          width: 150,
          align: 'center',
        },
        {
          title: '通知状态',
          dataIndex: 'noticeWorkStatus',
          width: 150,
          align: 'center',
        },
      ],
    };
  };

  render() {
    const {
      form,
      loading,
      dispatch,
      createResList: { list = [] },
      visible,
      dataListSelected = [],
      mold,
    } = this.props;
    const { isCreateInform, addName } = this.state;

    return (
      <Modal
        destroyOnClose
        title="通知人员"
        visible={visible}
        onCancel={() => this.onCancel()}
        width="60%"
        bodyStyle={{ backgroundColor: 'rgb(240, 242, 245)', height: '700px', overflowY: 'scroll' }}
        footer={[
          <Button key="cancel" type="default" size="large" onClick={() => this.onCancel()}>
            取消
          </Button>,
        ]}
      >
        <div style={{ marginBottom: '10px' }}>
          <Button
            className={isCreateInform ? 'tw-btn-primary' : 'tw-btn-default'}
            type="primary"
            size="large"
            style={{ marginBottom: '5px' }}
            onClick={() => {
              this.setState({
                isCreateInform: true,
              });
            }}
          >
            新增通知人员
          </Button>
          <Button
            className={isCreateInform ? 'tw-btn-default' : 'tw-btn-primary'}
            type="primary"
            size="large"
            style={{ marginBottom: '5px', marginLeft: '10px' }}
            onClick={() => {
              this.setState({
                isCreateInform: false,
              });
            }}
          >
            已通知人员
          </Button>
        </div>
        {isCreateInform &&
          mold === 'performanceInform' && (
            <Card>
              <span style={{ display: 'inline-block', width: '200px', height: '40px' }}>
                <FormItem
                  form={form}
                  fieldType="ResSimpleSelect"
                  placeholder="请选择员工姓名"
                  fieldKey="resId"
                  onChange={(value, option) => {
                    this.setState({
                      // eslint-disable-next-line react/no-unused-state
                      addName: {
                        baseBuId: option[0]?.baseBuId,
                        baseBuName: option[0]?.baseBuName,
                        enrollDate: option[0]?.enrollDate,
                        noticeStatus: null,
                        resId: option[0]?.id,
                        resName: option[0]?.resName,
                      },
                    });
                  }}
                />
              </span>
              <span style={{ marginLeft: '20px' }}>
                <Button
                  className="tw-btn-primary"
                  type="primary"
                  size="large"
                  style={{ marginBottom: '5px' }}
                  onClick={() => {
                    if (!list.some(item => item.resId === addName.resId)) {
                      list.unshift(addName);
                      dispatch({
                        type: `${DOMAIN}/updateState`,
                        payload: {
                          createResList: {
                            list: Array.from(new Set(list)),
                          },
                        },
                      });
                    } else {
                      createMessage({
                        type: 'warn',
                        description: '此数据已在列表，请勿重复添加！',
                      });
                    }
                  }}
                >
                  添加
                </Button>
              </span>
            </Card>
          )}
        <Table
          title={() => (
            <>
              <Button
                size="large"
                type="primary"
                onClick={() => {
                  if (dataListSelected.length < 1) {
                    createMessage({ type: 'warn', description: '请至少选择一条数据提交！' });
                    return;
                  }
                  this.submit(dataListSelected);
                }}
              >
                提交
              </Button>
              &nbsp; &nbsp;
              <Button
                size="large"
                type="danger"
                onClick={() => {
                  const ids = dataListSelected.map(v => v.resId);
                  createConfirm({
                    content: '确定删除吗？',
                    onOk: () => {
                      const newList = list.filter(v => !ids.includes(v.resId));
                      dispatch({
                        type: `${DOMAIN}/updateState`,
                        payload: {
                          createResList: {
                            list: newList,
                          },
                          dataListSelected: [],
                        },
                      });
                    },
                  });
                }}
                disabled={dataListSelected.length === 0}
              >
                删除
              </Button>
            </>
          )}
          loading={
            loading.effects[`${DOMAIN}/querySummaryResList`] ||
            loading.effects[`${DOMAIN}/querySummaryNoticedList`] ||
            loading.effects[`${DOMAIN}/queryFeedbackResList`] ||
            loading.effects[`${DOMAIN}/queryFeedbackNoticedList`] ||
            loading.effects[`${DOMAIN}/queryResList`] ||
            loading.effects[`${DOMAIN}/queryTargetNoticedList`]
          }
          style={{ background: '#fff' }}
          bordered
          {...(isCreateInform ? { ...this.createNotified() } : { ...this.haveNotified() })}
        />
      </Modal>
    );
  }
}

export default InformModal;
