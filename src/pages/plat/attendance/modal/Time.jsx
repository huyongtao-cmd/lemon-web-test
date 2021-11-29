import { connect } from 'dva';
import React from 'react';
import { clone } from 'ramda';
import { Modal, InputNumber, Checkbox, Form } from 'antd';
import FieldList from '@/components/layout/FieldList';
import { DatePicker, TimePicker } from '@/pages/gen/field';
import createMessage from '@/components/core/AlertMessage';

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
class TimeModal extends React.Component {
  state = {
    source: {
      attendanceDateMon: false,
      attendanceDateTue: false,
      attendanceDateWed: false,
      attendanceDateThu: false,
      attendanceDateFri: false,
      attendanceDateSat: false,
      attendanceDateSun: false,
      attendanceTimeStart: '',
      attendanceTimeEnd: '',
      allowLateTimeNum: 0,
      allowLeaveTimeNum: 0,
      punchLimitStartTime: '',
      punchLimitEndTime: '',
    },
    index: -1,
    disabledStatus: {},
  };

  static getDerivedStateFromProps(props, state) {
    // 把父组件的prop 变成子组件的state
    const { source, index } = props;
    // 保存星期的可选状态 , clone 是为了防止同一内存地址的变更影响
    const cloneSource = clone(source);
    const {
      attendanceDateMon,
      attendanceDateTue,
      attendanceDateWed,
      attendanceDateThu,
      attendanceDateFri,
      attendanceDateSat,
      attendanceDateSun,
    } = cloneSource;
    return {
      source,
      index,
      disabledStatus: {
        attendanceDateMon,
        attendanceDateTue,
        attendanceDateWed,
        attendanceDateThu,
        attendanceDateFri,
        attendanceDateSat,
        attendanceDateSun,
      },
    };
  }

  // 保存按钮
  handleSubmit = () => {
    const {
      toggle,
      dispatch,
      platAttendanceRuleEdit: { attendanceNormalDateEntity },
      form: { validateFieldsAndScroll },
    } = this.props;
    const { source, index } = this.state;
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        const {
          punchLimitStartTime,
          punchLimitStartSecondTime,
          punchLimitEndTime,
          punchLimitEndSecondTime,
        } = source;
        if (
          punchLimitStartTime &&
          punchLimitStartSecondTime &&
          punchLimitEndTime &&
          punchLimitEndSecondTime
        ) {
          const punchLimitStartTimeTmp = punchLimitStartTime
            .split(':')
            .map(item => parseInt(item, 10));
          const punchLimitStartSecondTimeTmp = punchLimitStartSecondTime
            .split(':')
            .map(item => parseInt(item, 10));
          const punchLimitEndTimeTmp = punchLimitEndTime.split(':').map(item => parseInt(item, 10));
          const punchLimitEndSecondTimeTmp = punchLimitEndSecondTime
            .split(':')
            .map(item => parseInt(item, 10));

          if (
            punchLimitStartTimeTmp[0] > punchLimitStartSecondTimeTmp[0] ||
            (punchLimitStartTimeTmp[0] === punchLimitStartSecondTimeTmp[0] &&
              punchLimitStartTimeTmp[1] >= punchLimitStartSecondTimeTmp[1])
          ) {
            createMessage({
              type: 'error',
              description: '最晚上班打卡时间不得早于最早上班打卡时间',
            });
            return;
          }
          // if (
          //   punchLimitEndSecondTimeTmp[0] > punchLimitStartTimeTmp[0] ||
          //   (punchLimitEndSecondTimeTmp[0] === punchLimitStartTimeTmp[0] &&
          //     punchLimitEndSecondTimeTmp[1] >= punchLimitStartTimeTmp[1])
          // ) {
          //   createMessage({ type: 'error', description: '最晚下班打卡时间不得晚于最早上班打卡时间' });
          //   return;
          // }

          if (
            punchLimitStartSecondTimeTmp[0] > punchLimitEndTimeTmp[0] ||
            (punchLimitStartSecondTimeTmp[0] === punchLimitEndTimeTmp[0] &&
              punchLimitStartSecondTimeTmp[1] >= punchLimitEndTimeTmp[1])
          ) {
            createMessage({
              type: 'error',
              description: '最早下班打卡时间不得早于最晚上班打卡时间',
            });
            return;
          }
        }

        if (index < 0) {
          // 新建
          attendanceNormalDateEntity.push(source);
        } else {
          // 编辑
          attendanceNormalDateEntity.splice(index, 1, source);
        }
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            attendanceNormalDateEntity,
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
    const { source, disabledStatus } = this.state;
    const {
      platAttendanceRuleEdit: { attendanceNormalDateEntity },
    } = this.props;

    const checkDay = day => {
      let bool = false;
      attendanceNormalDateEntity.forEach(v => {
        if (v[day]) {
          bool = true;
        }
      });
      return disabledStatus[day] === true ? false : bool;
    };

    return (
      <Modal
        title="打卡时间"
        width={950}
        visible={visible}
        destroyOnClose
        onOk={this.handleSubmit}
        onCancel={this.handleCancel}
      >
        {/* <Checkbox.Group
          options={['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期天']}
          value={source.attendanceDate}
          onChange={e => this.changeData(e, 'attendanceDate')}
        /> */}
        <Checkbox
          checked={source.attendanceDateMon}
          onChange={e => this.changeData(e.target.checked, 'attendanceDateMon')}
          disabled={checkDay('attendanceDateMon')}
          style={{ marginLeft: 28 }}
        >
          星期一
        </Checkbox>
        <Checkbox
          checked={source.attendanceDateTue}
          onChange={e => this.changeData(e.target.checked, 'attendanceDateTue')}
          disabled={checkDay('attendanceDateTue')}
        >
          星期二
        </Checkbox>
        <Checkbox
          checked={source.attendanceDateWed}
          onChange={e => this.changeData(e.target.checked, 'attendanceDateWed')}
          disabled={checkDay('attendanceDateWed')}
        >
          星期三
        </Checkbox>
        <Checkbox
          checked={source.attendanceDateThu}
          onChange={e => this.changeData(e.target.checked, 'attendanceDateThu')}
          disabled={checkDay('attendanceDateThu')}
        >
          星期四
        </Checkbox>
        <Checkbox
          checked={source.attendanceDateFri}
          onChange={e => this.changeData(e.target.checked, 'attendanceDateFri')}
          disabled={checkDay('attendanceDateFri')}
        >
          星期五
        </Checkbox>
        <Checkbox
          checked={source.attendanceDateSat}
          onChange={e => this.changeData(e.target.checked, 'attendanceDateSat')}
          disabled={checkDay('attendanceDateSat')}
        >
          星期六
        </Checkbox>
        <Checkbox
          checked={source.attendanceDateSun}
          onChange={e => this.changeData(e.target.checked, 'attendanceDateSun')}
          disabled={checkDay('attendanceDateSun')}
        >
          星期天
        </Checkbox>
        <FieldList layout="horizontal" col={2} getFieldDecorator={getFieldDecorator} noReactive>
          {/* <Field presentational style={{ visibility: 'hidden' }} /> */}
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
            <TimePicker
              format="HH:mm"
              value={source.attendanceTimeEnd}
              onChange={e => this.changeData(e, 'attendanceTimeEnd')}
            />
          </Field>
          <Field
            name="allowLateTimeNum"
            label="上班弹性时间"
            decorator={{
              initialValue: source.allowLateTimeNum,
            }}
            {...fieldLayout}
          >
            <InputNumber min={0} onChange={e => this.changeData(e, 'allowLateTimeNum')} />
          </Field>
          <Field
            name="allowLeaveTimeNum"
            label="下班弹性时间"
            decorator={{
              initialValue: source.allowLeaveTimeNum,
            }}
            {...fieldLayout}
          >
            <InputNumber min={0} onChange={e => this.changeData(e, 'allowLeaveTimeNum')} />
          </Field>
          <Field
            name="punchLimitStartTime"
            label="最早上班打卡时间"
            decorator={{
              initialValue: source.punchLimitStartTime,
              // rules: [
              //   {
              //     required: true,
              //     message: '请选择最早上班打卡时间',
              //   },
              // ],
            }}
            {...fieldLayout}
          >
            <TimePicker format="HH:mm" onChange={e => this.changeData(e, 'punchLimitStartTime')} />
          </Field>
          <Field
            name="punchLimitStartSecondTime"
            label="最晚上班打卡时间"
            decorator={{
              initialValue: source.punchLimitStartSecondTime,
              // rules: [
              //   {
              //     required: true,
              //     message: '最晚上班打卡时间',
              //   },
              // ],
            }}
            {...fieldLayout}
          >
            <TimePicker
              format="HH:mm"
              onChange={e => this.changeData(e, 'punchLimitStartSecondTime')}
            />
          </Field>
          <Field
            name="punchLimitEndTime"
            label="最早下班打卡时间"
            decorator={{
              initialValue: source.punchLimitEndTime,
              // rules: [
              //   {
              //     required: true,
              //     message: '请选择最早下班打卡时间',
              //   },
              // ],
            }}
            {...fieldLayout}
          >
            <TimePicker format="HH:mm" onChange={e => this.changeData(e, 'punchLimitEndTime')} />
          </Field>
          <Field
            name="punchLimitEndSecondTime"
            label="最晚下班打卡时间"
            decorator={{
              initialValue: source.punchLimitEndSecondTime,
              // rules: [
              //   {
              //     required: true,
              //     message: '请选择最晚下班打卡时间',
              //   },
              // ],
            }}
            {...fieldLayout}
          >
            <TimePicker
              format="HH:mm"
              onChange={e => this.changeData(e, 'punchLimitEndSecondTime')}
            />
          </Field>
        </FieldList>
      </Modal>
    );
  }
}

export default Form.create()(TimeModal);
