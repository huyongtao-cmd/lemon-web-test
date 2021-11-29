import { connect } from 'dva';
import React from 'react';
import { Modal, Form } from 'antd';
import FieldList from '@/components/layout/FieldList';
import { DatePicker, TimePicker } from '@/pages/gen/field';

const { Field } = FieldList;

const fieldLayout = {
  labelCol: { span: 8, xxl: 8 },
  wrapperCol: { span: 16, xxl: 16 },
};

const DOMAIN = 'platAttendanceRuleEdit';

@connect(({ loading, platAttendanceRuleEdit, dispatch }) => ({
  loading,
  platAttendanceRuleEdit,
  dispatch,
}))
class SpecModal extends React.Component {
  state = {
    source: {
      attendanceDate: '',
      attendanceTimeStart: '',
      attendanceTimeEnd: '',
    },
    index: -1,
  };

  static getDerivedStateFromProps(props) {
    const { source, index } = props;
    return { source, index };
  }

  // 保存按钮
  handleSubmit = () => {
    const {
      toggle,
      dispatch,
      platAttendanceRuleEdit: { attendanceNormalDateSpecialEntity },
      form: { validateFieldsAndScroll },
    } = this.props;
    const { source, index } = this.state;
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        if (index < 0) {
          // 新建
          attendanceNormalDateSpecialEntity.push(source);
        } else {
          // 编辑
          attendanceNormalDateSpecialEntity.splice(index, 1, source);
        }
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            attendanceNormalDateSpecialEntity,
          },
        });
        toggle();
      }
    });
  };

  handleCancel = () => {
    const { toggle } = this.props;
    toggle();
  };

  changeData = (value, key) => {
    const { source } = this.state;
    source[key] = value;
    this.setState({ source });
  };

  render() {
    const {
      visible,
      form: { getFieldDecorator },
    } = this.props;
    const { source } = this.state;

    return (
      <Modal
        title="特殊打卡日期"
        width={950}
        visible={visible}
        destroyOnClose
        onOk={this.handleSubmit}
        onCancel={this.handleCancel}
      >
        <FieldList layout="horizontal" col={2} getFieldDecorator={getFieldDecorator}>
          <Field
            name="attendanceDate"
            label="选择日期"
            decorator={{
              initialValue: source.attendanceDate,
              rules: [
                {
                  required: true,
                  message: '请选择选择日期',
                },
              ],
            }}
            {...fieldLayout}
          >
            <DatePicker
              format="YYYY-MM-DD"
              className="x-fill-100"
              onChange={e => this.changeData(e, 'attendanceDate')}
            />
          </Field>
          <Field presentational style={{ visibility: 'hidden' }} />
          <Field
            name="attendanceTimeStart"
            label="上班打卡时间"
            decorator={{
              initialValue: source.attendanceTimeStart,
              rules: [
                {
                  required: true,
                  message: '请选择上班打卡时间',
                },
              ],
            }}
            {...fieldLayout}
          >
            <TimePicker format="HH:mm" onChange={e => this.changeData(e, 'attendanceTimeStart')} />
          </Field>
          <Field
            name="attendanceTimeEnd"
            label="下班打卡时间"
            decorator={{
              initialValue: source.attendanceTimeEnd,
              rules: [
                {
                  required: true,
                  message: '请选择下班打卡时间',
                },
              ],
            }}
            {...fieldLayout}
          >
            <TimePicker format="HH:mm" onChange={e => this.changeData(e, 'attendanceTimeEnd')} />
          </Field>
        </FieldList>
      </Modal>
    );
  }
}

export default Form.create()(SpecModal);
