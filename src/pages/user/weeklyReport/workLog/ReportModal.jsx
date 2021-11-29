import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Input, Modal, Upload, Card, Table, Button, Select } from 'antd';
import FieldList from '@/components/layout/FieldList';
import { Selection, DatePicker, FileManagerEnhance } from '@/pages/gen/field';
import moment from 'moment';
import { selectUsersWithBu } from '@/services/gen/list';
import { isEmpty, isNil } from 'ramda';
import createMessage from '@/components/core/AlertMessage';

// const { RangePicker } = DatePicker
const { Field } = FieldList;
const { Option } = Select;

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

const DOMAIN = 'workLog';

@connect(({ loading, dispatch, workLog, user }) => ({
  loading,
  dispatch,
  workLog,
  user,
}))
@Form.create({
  mapPropsToFields(props) {
    const { workReportLog } = props.workLog;
    const fields = {};
    Object.keys(workReportLog).forEach(key => {
      fields[key] = Form.createFormField(workReportLog[key]);
    });
    return fields;
  },
  onValuesChange(props, changedValues, allValues) {
    if (isEmpty(changedValues)) return;
    const name = Object.keys(changedValues)[0];
    const value = changedValues[name];
    const newFieldData = { [name]: value };
    props.dispatch({
      type: `${DOMAIN}/updateReportModal`,
      payload: newFieldData,
    });
  },
})
class ReportModal extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;

    // 获取页面配置信息
    dispatch({
      type: `${DOMAIN}/getWorkReportPageConfig`,
      payload: { pageNo: 'WORK_REPORT_EDIT' },
    });

    dispatch({
      type: `${DOMAIN}/getPResInfo`,
    });
  }

  getDateEnd = (workDateTemp, workReportTypeTemp) => {
    let dateEnd = workDateTemp;
    if (workReportTypeTemp === 'WEEK') {
      dateEnd = moment(workDateTemp).endOf('week');
    }
    if (workReportTypeTemp === 'MONTH') {
      dateEnd = moment(workDateTemp).endOf('month');
    }
    return dateEnd;
  };

  // 保存
  handleSave = () => {
    const {
      closeModal,
      dispatch,
      workLog: { workReportLog },
    } = this.props;

    workReportLog.workReportLogList.forEach((val, index, arr) => {
      // eslint-disable-next-line no-param-reassign
      val.workPlan = val.workPlanId;
    });
    if (workReportLog.reportToResId.length < 1) {
      createMessage({ type: 'error', description: '请选择汇报人' });
      return;
    }
    dispatch({
      type: `${DOMAIN}/modalSaveReport`,
      payload: {
        ...workReportLog,
        reportType: workReportLog.workLogPeriodType,
        dateStart: workReportLog.workDate,
        dateEnd: this.getDateEnd(workReportLog.workDate, workReportLog.workLogPeriodType),
      },
    }).then(res => {
      closeModal();
    });
  };

  // 汇报
  handleSubmit = () => {
    const {
      closeModal,
      dispatch,
      workLog: { workReportLog, workReportPageConfig },
    } = this.props;

    workReportLog.workReportLogList.forEach((val, index, arr) => {
      // eslint-disable-next-line no-param-reassign
      val.workPlan = val.workPlanId;
    });
    if (workReportLog.reportToResId.length < 1) {
      createMessage({ type: 'error', description: '请选择汇报人' });
      return;
    }
    dispatch({
      type: `${DOMAIN}/modalSaveReport`,
      payload: {
        ...workReportLog,
        reportType: workReportLog.workLogPeriodType,
        dateStart: workReportLog.workDate,
        dateEnd: this.getDateEnd(workReportLog.workDate, workReportLog.workLogPeriodType),
        submitted: true,
      },
    }).then(res => {
      const buttons = workReportPageConfig.pageButtonViews;
      if (buttons && buttons.length > 0) {
        const buttonConfig = buttons.filter(button => button.buttonKey === 'REPORT_SUBMIT')[0];
        const { beforeEvent, afterEvent } = buttonConfig;
        if (beforeEvent && beforeEvent.trim().length > 0) {
          const callExpressions = beforeEvent.split(';');
          callExpressions.forEach(callExpression => {
            if (callExpression && callExpression.trim().length > 0) {
              // eslint-disable-next-line no-eval
              eval(callExpression);
            }
          });
        }
        if (afterEvent && afterEvent.trim().length > 0) {
          const callExpressions = afterEvent.split(';');
          callExpressions.forEach(callExpression => {
            if (callExpression && callExpression.trim().length > 0) {
              // eslint-disable-next-line no-eval
              eval(callExpression);
            }
          });
        }
      }
      closeModal();
    });
  };

  render() {
    const {
      visible,
      closeModal,
      loading,
      user: {
        user: { extInfo = {} }, // 取当前登录人的resId
      },
      workLog: { workReportLog, reportedResId },
      form: { getFieldDecorator },
    } = this.props;
    const workReportList = [];

    const { workReportLogList } = workReportLog;
    // eslint-disable-next-line array-callback-return
    workReportLogList.map(item => {
      workReportList.push({
        ...item,
        helpWork: item.remark,
        workPlan: item.workPlanId,
        workSummary: item.workDesc,
        // workPlan: workPlan,
      });
    });
    const { workDate, tsResName } = workReportLogList.length > 0 ? workReportLogList[0] : '';
    const workReportTypeTemp = workReportLog.workLogPeriodType;
    const reportTypeName = { DAY: '日报', WEEK: '周报', MONTH: '月报' }[workReportTypeTemp];
    const workDateTemp = workReportLog.workDate;
    const dateStart = workDateTemp;
    let dateEnd = workDateTemp;
    if (workReportTypeTemp === 'WEEK') {
      dateEnd = moment(workDate).endOf('week');
    }
    if (workReportTypeTemp === 'MONTH') {
      dateEnd = moment(workDate).endOf('month');
    }

    const columns = [
      {
        title: '日期',
        dataIndex: 'workDate',
        required: true,
        width: '10%',
      },
      {
        title: '工作总结',
        // dataIndex: 'workDesc',
        dataIndex: 'workSummary',
        required: true,
        width: '30%',
      },
      {
        title: '工作计划',
        // dataIndex: 'workPlanId',
        dataIndex: 'workPlanName',
        required: true,
        width: '20%',
      },
      {
        title: '需协调工作',
        // dataIndex: 'remark',
        dataIndex: 'helpWork',
        width: '30%',
      },
    ];
    return (
      <div>
        <Modal
          centered
          width="60%"
          destroyOnClose
          title={reportTypeName}
          visible={visible}
          onCancel={closeModal}
          footer={[
            <Button type="primary" onClick={closeModal}>
              取消
            </Button>,
            <Button
              type="primary"
              onClick={e => this.handleSave()}
              loading={loading.effects[`${DOMAIN}/modalSaveReport`]}
            >
              保存
            </Button>,
            <Button
              type="primary"
              onClick={e => this.handleSubmit()}
              loading={loading.effects[`${DOMAIN}/modalSaveReport`]}
            >
              汇报
            </Button>,
          ]}
        >
          <Card className="tw-card-adjust" bordered={false}>
            <FieldList
              layout="horizontal"
              legend=""
              getFieldDecorator={getFieldDecorator}
              col={2}
              noReactive
            >
              <Field
                name="reportResId"
                label="填报人"
                decorator={{
                  initialValue: workReportLog.reportResId || extInfo.resId,
                }}
              >
                <Select disabled>
                  <Option value={extInfo.resId}>{extInfo.resName}</Option>
                </Select>
              </Field>
              <Field
                name="dates"
                label="汇报期间"
                decorator={{
                  initialValue: [dateStart, dateEnd],
                }}
              >
                <DatePicker.RangePicker format="YYYY-MM-DD" disabled />
              </Field>
              <Field
                name="logListViewList"
                label="工作日志说明"
                fieldCol={1}
                labelCol={{ span: 4, xxl: 3 }}
                wrapperCol={{ span: 19, xxl: 20 }}
              >
                <Table
                  rowKey="id"
                  autosize={{ minRows: 3, maxRows: 6 }}
                  columns={columns}
                  bordered
                  dataSource={workReportList}
                  pagination={false}
                  scroll={{ y: 200 }}
                />
              </Field>
              <Field
                name="workSummary"
                label="工作总结"
                fieldCol={1}
                labelCol={{ span: 4, xxl: 3 }}
                wrapperCol={{ span: 19, xxl: 20 }}
                decorator={{
                  initialValue: workReportLog.workSummary,
                }}
              >
                <Input.TextArea placeholder="请输入工作总结" />
              </Field>
              <Field
                name="unfinishedWork"
                label="未完成工作"
                fieldCol={1}
                labelCol={{ span: 4, xxl: 3 }}
                wrapperCol={{ span: 19, xxl: 20 }}
                decorator={{
                  initialValue: workReportLog.unfinishedWork,
                }}
              >
                <Input.TextArea placeholder="请输入工作计划" />
              </Field>
              <Field
                name="helpWork"
                label="需协调工作"
                fieldCol={1}
                labelCol={{ span: 4, xxl: 3 }}
                wrapperCol={{ span: 19, xxl: 20 }}
                decorator={{
                  initialValue: workReportLog.helpWork,
                }}
              >
                <Input.TextArea placeholder="请输入协调工作" />
              </Field>
              <Field name="upload" label="附件" fieldCol={1} labelCol={{ span: 4, xxl: 3 }}>
                <FileManagerEnhance
                  api="/api/op/v1/workReport/workReportAttachment/sfs/token"
                  dataKey={workReportLog.id}
                  listType="text"
                  disabled={false}
                />
              </Field>
              <Field
                name="reportToResId"
                label="汇报给"
                fieldCol={1}
                labelCol={{ span: 4, xxl: 3 }}
                wrapperCol={{ span: 10, xxl: 10 }}
                decorator={{
                  initialValue: workReportLog.reportToResId,
                  rules: [{ required: true }],
                }}
              >
                <Selection.Columns
                  className="x-fill-100"
                  source={() => selectUsersWithBu({})}
                  columns={particularColumns}
                  transfer={{ key: 'id', code: 'id', name: 'name' }}
                  dropdownMatchSelectWidth={false}
                  showSearch
                  limit={20}
                  onColumnsChange={value => {}}
                  placeholder="请选择汇报给"
                  mode="multiple"
                />
              </Field>
            </FieldList>
          </Card>
        </Modal>
      </div>
    );
  }
}
export default ReportModal;
