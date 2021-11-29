import React, { Component } from 'react';
import { connect } from 'dva';
import { InputNumber, Modal, Form } from 'antd';
import FieldList from '@/components/layout/FieldList';
import { DatePicker } from '@/pages/gen/field';
import moment from 'moment';
import createMessage from '@/components/core/AlertMessage';
import { isNil, isEmpty } from 'ramda';
import { genFakeId } from '@/utils/mathUtils';
import { formatDT } from '@/utils/tempUtils/DateTime';
import update from 'immutability-helper';

const { Field, FieldLine } = FieldList;
const DOMAIN = 'setUpProjectFlow';

@connect(({ loading, setUpProjectFlow, dispatch }) => ({
  loading: loading.effects[`${DOMAIN}/queryDetail`],
  setUpProjectFlow,
  dispatch,
}))
@Form.create({
  onValuesChange(props, changedFields) {
    if (!isEmpty(changedFields)) {
      props.dispatch({
        type: `${DOMAIN}/updateForm1`,
        payload: changedFields,
      });
    }
  },
})
class ProjectReportModal extends Component {
  componentDidMount() {}

  // 自动计算项目汇报计划
  handleAutoReportPlan = e => {
    const {
      toggleProjectReportModal,
      setUpProjectFlow: {
        formData: {
          startDate,
          endDate,
          planStartDate,
          planEndDate,
          firstPeriodAmt,
          lastPeriodAmt,
          amt,
        },
        dataSource,
        deleteKeys,
      },
      dispatch,
    } = this.props;
    const planStartDateTemp = startDate || planStartDate;
    const planEndDateTemp = endDate || planEndDate;
    if (moment(planEndDateTemp).isBefore(moment(planStartDateTemp))) {
      createMessage({ type: 'warn', description: '结束日期不能早于开始日期!' });
      return;
    }
    const periods =
      moment(planEndDateTemp)
        .date(1)
        .diff(moment(planStartDateTemp).date(1), 'months') + 1;
    const firstPeriodDay = moment(planStartDateTemp).date();
    const lastPeriodDay = moment(planEndDateTemp).date();

    // eslint-disable-next-line
    let reportPlans = [];
    if (
      firstPeriodDay === 1 &&
      lastPeriodDay ===
        moment(planEndDateTemp)
          .endOf('month')
          .date()
    ) {
      // 整月的情况
      if (isNil(firstPeriodAmt) && isNil(lastPeriodAmt)) {
        // 未填写首期,末期金额
        const periodAmt = amt / periods;
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < periods; i++) {
          reportPlans.push({
            id: genFakeId(-1),
            periodDate: formatDT(
              moment(planStartDateTemp)
                .date(1)
                .add(i, 'months')
            ),
            amt: periodAmt.toFixed(2),
          });
        }
      } else if (!isNil(firstPeriodAmt) && isNil(lastPeriodAmt)) {
        // 填写首期,未填写末期金额
        reportPlans.push({
          id: genFakeId(-1),
          periodDate: formatDT(moment(planStartDateTemp).date(1)),
          amt: firstPeriodAmt.toFixed(2),
        });
        const periodAmt = (amt - firstPeriodAmt) / (periods - 1);
        // eslint-disable-next-line no-plusplus
        for (let i = 1; i < periods; i++) {
          reportPlans.push({
            id: genFakeId(-1),
            periodDate: formatDT(
              moment(planStartDateTemp)
                .date(1)
                .add(i, 'months')
            ),
            amt: periodAmt.toFixed(2),
          });
        }
      } else if (isNil(firstPeriodAmt) && !isNil(lastPeriodAmt)) {
        // 填写首期,未填写末期金额
        const periodAmt = (amt - lastPeriodAmt) / (periods - 1);
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < periods - 1; i++) {
          reportPlans.push({
            id: genFakeId(-1),
            periodDate: formatDT(
              moment(planStartDateTemp)
                .date(1)
                .add(i, 'months')
            ),
            amt: periodAmt.toFixed(2),
          });
        }
        reportPlans.push({
          id: genFakeId(-1),
          periodDate: formatDT(
            moment(planStartDateTemp)
              .date(1)
              .add(periods - 1, 'months')
          ),
          amt: lastPeriodAmt.toFixed(2),
        });
      } else if (!isNil(firstPeriodAmt) && !isNil(lastPeriodAmt)) {
        // 填写首期,末期金额
        reportPlans.push({
          id: genFakeId(-1),
          periodDate: formatDT(moment(planStartDateTemp).date(1)),
          amt: firstPeriodAmt.toFixed(2),
        });
        const periodAmt = (amt - firstPeriodAmt - lastPeriodAmt) / (periods - 2);
        // eslint-disable-next-line no-plusplus
        for (let i = 1; i < periods - 1; i++) {
          reportPlans.push({
            id: genFakeId(-1),
            periodDate: formatDT(
              moment(planStartDateTemp)
                .date(1)
                .add(i, 'months')
            ),
            amt: periodAmt.toFixed(2),
          });
        }
        reportPlans.push({
          id: genFakeId(-1),
          periodDate: formatDT(
            moment(planStartDateTemp)
              .date(1)
              .add(periods - 1, 'months')
          ),
          amt: lastPeriodAmt.toFixed(2),
        });
      }
    } else if (firstPeriodDay === lastPeriodDay + 1) {
      // 整月的情况
      if (isNil(firstPeriodAmt) && isNil(lastPeriodAmt)) {
        // 未填写首期,末期金额
        const periodAmt = amt / (periods - 1);
        const daysTemp = moment(planStartDateTemp).daysInMonth();
        const firstPeriodAmtTemp = (periodAmt * (daysTemp - firstPeriodDay + 1)) / 30;
        reportPlans.push({
          id: genFakeId(-1),
          periodDate: formatDT(moment(planStartDateTemp).date(1)),
          amt: firstPeriodAmtTemp.toFixed(2),
        });
        // eslint-disable-next-line no-plusplus
        for (let i = 1; i < periods - 1; i++) {
          reportPlans.push({
            id: genFakeId(-1),
            periodDate: formatDT(
              moment(planStartDateTemp)
                .date(1)
                .add(i, 'months')
            ),
            amt: periodAmt.toFixed(2),
          });
        }
        reportPlans.push({
          id: genFakeId(-1),
          periodDate: formatDT(
            moment(planStartDateTemp)
              .date(1)
              .add(periods - 1, 'months')
          ),
          amt: (amt - firstPeriodAmtTemp - periodAmt * (periods - 2)).toFixed(2),
        });
      } else if (!isNil(firstPeriodAmt) && isNil(lastPeriodAmt)) {
        // 填写首期,未填写末期金额
        reportPlans.push({
          id: genFakeId(-1),
          periodDate: formatDT(moment(planStartDateTemp).date(1)),
          amt: firstPeriodAmt.toFixed(2),
        });
        const periodAmt = (amt - firstPeriodAmt) / (periods - 1);
        // eslint-disable-next-line no-plusplus
        for (let i = 1; i < periods; i++) {
          reportPlans.push({
            id: genFakeId(-1),
            periodDate: formatDT(
              moment(planStartDateTemp)
                .date(1)
                .add(i, 'months')
            ),
            amt: periodAmt.toFixed(2),
          });
        }
      } else if (isNil(firstPeriodAmt) && !isNil(lastPeriodAmt)) {
        // 填写首期,未填写末期金额
        const periodAmt = (amt - lastPeriodAmt) / (periods - 1);
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < periods - 1; i++) {
          reportPlans.push({
            id: genFakeId(-1),
            periodDate: formatDT(
              moment(planStartDateTemp)
                .date(1)
                .add(i, 'months')
            ),
            amt: periodAmt.toFixed(2),
          });
        }
        reportPlans.push({
          id: genFakeId(-1),
          periodDate: formatDT(
            moment(planStartDateTemp)
              .date(1)
              .add(periods - 1, 'months')
          ),
          amt: lastPeriodAmt.toFixed(2),
        });
      } else if (!isNil(firstPeriodAmt) && !isNil(lastPeriodAmt)) {
        // 填写首期,末期金额
        reportPlans.push({
          id: genFakeId(-1),
          periodDate: formatDT(moment(planStartDateTemp).date(1)),
          amt: firstPeriodAmt.toFixed(2),
        });
        const periodAmt = (amt - firstPeriodAmt - lastPeriodAmt) / (periods - 2);
        // eslint-disable-next-line no-plusplus
        for (let i = 1; i < periods - 1; i++) {
          reportPlans.push({
            id: genFakeId(-1),
            periodDate: formatDT(
              moment(planStartDateTemp)
                .date(1)
                .add(i, 'months')
            ),
            amt: periodAmt.toFixed(2),
          });
        }
        reportPlans.push({
          id: genFakeId(-1),
          periodDate: formatDT(
            moment(planStartDateTemp)
              .date(1)
              .add(periods - 1, 'months')
          ),
          amt: lastPeriodAmt.toFixed(2),
        });
      }
    } else {
      // 非整月情况,必须自己输入首期金额和末期金额
      if (isNil(firstPeriodAmt) || isNil(lastPeriodAmt)) {
        createMessage({ type: 'warn', description: '非整月周期的项目需要填写首期金额和末期金额!' });
        return;
      }
      const periodAmt = (amt - firstPeriodAmt - lastPeriodAmt) / (periods - 2);
      reportPlans.push({
        id: genFakeId(-1),
        periodDate: formatDT(moment(planStartDateTemp).date(1)),
        amt: firstPeriodAmt.toFixed(2),
      });
      // eslint-disable-next-line no-plusplus
      for (let i = 1; i < periods - 1; i++) {
        reportPlans.push({
          id: genFakeId(-1),
          periodDate: formatDT(
            moment(planStartDateTemp)
              .date(1)
              .add(i, 'months')
          ),
          amt: periodAmt.toFixed(2),
        });
      }
      reportPlans.push({
        id: genFakeId(-1),
        periodDate: formatDT(
          moment(planStartDateTemp)
            .date(1)
            .add(periods - 1, 'months')
        ),
        amt: lastPeriodAmt.toFixed(2),
      });
    }

    toggleProjectReportModal();

    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        dataSource: update(dataSource, {
          $push: reportPlans,
        }),
      },
    });
  };

  render() {
    const {
      projectReportModalVisible,
      toggleProjectReportModal,
      setUpProjectFlow: { formData },
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Modal
        destroyOnClose
        title="自动计算项目汇报计划"
        width={800}
        visible={projectReportModalVisible}
        onOk={this.handleAutoReportPlan}
        onCancel={toggleProjectReportModal}
      >
        <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} noReactive col={2}>
          <Field
            name="startDate"
            label="开始日期"
            decorator={{
              initialValue: formData.planStartDate,
              rules: [
                {
                  required: true,
                  message: '请输入合同开始日期',
                },
              ],
            }}
          >
            <DatePicker placeholder="请输入合同开始日期" />
          </Field>

          <Field
            name="endDate"
            label="结束日期"
            decorator={{
              initialValue: formData.planEndDate,
              rules: [
                {
                  required: true,
                  message: '请输入合同结束日期',
                },
              ],
            }}
          >
            <DatePicker placeholder="请输入合同结束日期" />
          </Field>

          <Field
            name="firstPeriodAmt"
            label="首期金额"
            decorator={{
              initialValue: formData.firstPeriodAmt,
              rules: [
                {
                  required: false,
                  message: '请输入首期金额',
                },
              ],
            }}
          >
            <InputNumber className="x-fill-100" placeholder="请输入首期金额" />
          </Field>

          <Field
            name="lastPeriodAmt"
            label="末期金额"
            decorator={{
              initialValue: formData.lastPeriodAmt,
              rules: [
                {
                  required: false,
                  message: '请输入末期金额',
                },
              ],
            }}
          >
            <InputNumber className="x-fill-100" placeholder="请输入末期金额" />
          </Field>
        </FieldList>
        <h5 style={{ color: 'red' }}>
          提示:开始日期结束日期为正好一N个月份时,不需要输入首期和末期金额,系统会自动计算.
          当不为整个月份时需要手动输入首期末期金额,系统自动算出中间金额.
        </h5>
        <h5 style={{ color: 'red' }}>
          正好为整个月份的情况: 1.开始日期为某个月的1号,结束日期为当月最后一天.比如 2019-01-01 ~
          2019-12-31; 2. 比如:2019-01-15 ~ 2019-06-14
        </h5>
      </Modal>
    );
  }
}

export default ProjectReportModal;
