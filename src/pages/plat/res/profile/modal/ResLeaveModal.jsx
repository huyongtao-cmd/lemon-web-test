import { connect } from 'dva';
import React from 'react';
import { Modal, Card, Table, Button, Divider, DatePicker } from 'antd';
import FieldList from '@/components/layout/FieldList';
import moment from 'moment';

const { Field, FieldLine } = FieldList;

@connect(({ loading }) => ({
  loading,
}))
class ResLeaveModal extends React.Component {
  state = {
    dataSource: [],
    leaveDate: undefined,
    isDisabled: true,
  };

  // 获取未处理事项
  handleGetList = (date, dateString) => {
    const {
      dispatch,
      domain,
      modalData: { id },
    } = this.props;
    if (dateString) {
      this.setState({
        leaveDate: dateString,
        isDisabled: true,
      });
      dispatch({
        type: `${domain}/rescheckList`,
        payload: {
          resId: id,
          leaveDate: moment(date).format('YYYY-MM-DD'),
        },
      }).then(res => {
        this.setState({
          dataSource: res || [],
          isDisabled: false,
        });
      });
    } else {
      this.setState({
        dataSource: [],
        leaveDate: undefined,
        isDisabled: true,
      });
    }
  };

  // 继续
  handleOk = () => {
    const {
      handleOk,
      modalData: { id },
    } = this.props;
    const { leaveDate } = this.state;
    handleOk && handleOk(id, leaveDate);
    this.setState({
      dataSource: [],
      leaveDate: undefined,
      isDisabled: true,
    });
  };

  // 取消
  handleCancel = () => {
    const { handleCancel } = this.props;
    this.setState({
      dataSource: [],
      leaveDate: undefined,
      isDisabled: true,
    });
    handleCancel && handleCancel();
  };

  render() {
    const {
      dispatch,
      loading,
      visible,
      domain,
      handleOk,
      handleCancel,
      modalData,
      form: { getFieldDecorator },
    } = this.props;
    const { leaveDate, dataSource, isDisabled } = this.state;

    const tableProps = {
      rowKey: 'id',
      dataSource,
      loading: loading.effects[`${domain}/rescheckList`],
      pagination: false,
      bordered: true,
      columns: [
        {
          title: '检查事项',
          align: 'center',
          width: '15%',
          dataIndex: 'chkItemName',
        },
        {
          title: '检查说明',
          width: '30%',
          dataIndex: 'chkDesc',
          render: val => <pre>{val}</pre>,
        },
        {
          title: '完成状态',
          dataIndex: 'finishStatus',
          align: 'center',
          width: '15%',
          render: val => <pre>{val}</pre>,
        },
      ],
    };
    return (
      <Modal
        title="离职确认"
        width="60%"
        destroyOnClose
        visible={visible}
        onCancel={this.handleCancel}
        footer={[
          <Button type="primary" key="save" disabled={isDisabled} onClick={this.handleOk}>
            继续
          </Button>,
          <Button type="ghost" key="cancel" onClick={this.handleCancel}>
            取消
          </Button>,
        ]}
      >
        <Card className="tw-card-adjust" bordered={false}>
          <FieldList layout="horizontal" legend="" getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="leaveDate"
              label="离职日期"
              decorator={{
                rules: [
                  {
                    required: true,
                    message: '请选择时间',
                  },
                ],
              }}
            >
              <DatePicker onChange={this.handleGetList} />
            </Field>
          </FieldList>
          <Divider dashed style={{ marginBottom: 32 }} />
          <div>
            <b>离职资源有以下事项未处理</b>
          </div>
          <Table {...tableProps} />
        </Card>
      </Modal>
    );
  }
}
export default ResLeaveModal;
