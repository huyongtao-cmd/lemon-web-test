import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Input, Modal, Upload, Card, Table, Button, Select } from 'antd';
import FieldList from '@/components/layout/FieldList';
import { Selection, DatePicker, FileManagerEnhance } from '@/pages/gen/field';
import moment from 'moment';
import createMessage from '@/components/core/AlertMessage';
import DataTable from '@/components/common/DataTable';
import { fromQs } from '@/utils/stringUtils';
import { formatMessage } from 'umi/locale';
import { selectUsersWithBu } from '@/services/gen/list';
import { isEmpty, isNil } from 'ramda';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';

// const { RangePicker } = DatePicker
const { Field } = FieldList;
const { Option } = Select;

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

const DOMAIN = 'workReportEdit';

@connect(({ loading, dispatch, workReportEdit, user }) => ({
  loading,
  dispatch,
  ...workReportEdit,
  user,
}))
@Form.create({
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
class WorkReportEdit extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const params = fromQs();

    this.fetchData(params);
    dispatch({ type: `${DOMAIN}/res` });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: params });
  };

  // 刷新
  handleRefresh = () => {
    const { dispatch, formData } = this.props;
    dispatch({
      type: `${DOMAIN}/queryDetail`,
      payload: {
        workLogPeriodType: formData.reportType,
        workDate: formData.dateStart,
      },
    });
  };

  // 保存
  handleSave = () => {
    const {
      dispatch,
      form: { validateFieldsAndScroll },
      dataSource,
      formData,
    } = this.props;

    validateFieldsAndScroll((error, values) => {
      if (error) {
        return;
      }
      dispatch({
        type: `${DOMAIN}/modalSaveReport`,
        payload: {
          ...formData,
          workReportLogList: dataSource,
          reportToResId: formData.reportToResId ? formData.reportToResId.join(',') : undefined,
        },
      });
    });
  };

  // 汇报
  handleSubmit = () => {
    const {
      dispatch,
      dataSource,
      formData,
      form: { validateFieldsAndScroll },
    } = this.props;

    validateFieldsAndScroll((error, values) => {
      if (error) {
        return;
      }
      dispatch({
        type: `${DOMAIN}/modalSaveReport`,
        payload: {
          ...formData,
          workReportLogList: dataSource,
          reportToResId: formData.reportToResId ? formData.reportToResId.join(',') : undefined,
          submitted: true,
        },
      });
    });
  };

  render() {
    const {
      loading,
      user: {
        user: { extInfo = {} }, // 取当前登录人的resId
      },
      dataSource,
      formData,
      resDataSource,
      // workLog: { workReportLog },
      form: { getFieldDecorator },
    } = this.props;
    const submitBtn = loading.effects[`${DOMAIN}/submit`];
    const detailBtn = loading.effects[`${DOMAIN}/queryDetail`];

    const {
      dateStart,
      dateEnd,
      helpWork,
      unfinishedWork,
      workSummary,
      reportToResIdName,
    } = formData;
    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      loading: loading.effects[`${DOMAIN}/query`],
      dataSource,
      onChange: filters => {
        this.fetchData(filters);
      },
      showSearch: false,
      showColumn: false,
      showExport: false,
      pagination: false,
      enableSelection: false,
      columns: [
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
      ],
    };
    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            icon="save"
            size="large"
            loading={loading.effects[`${DOMAIN}/query`]}
            onClick={e => this.handleSave('save')}
            disabled={submitBtn || detailBtn}
          >
            {formatMessage({ id: `misc.save`, desc: '保存' })}
          </Button>
          <Button
            className="tw-btn-primary"
            icon="upload"
            size="large"
            loading={loading.effects[`${DOMAIN}/query`]}
            onClick={e => {
              this.handleSubmit();
            }}
            disabled={submitBtn || detailBtn}
          >
            汇报
          </Button>
        </Card>

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
                initialValue: extInfo.resId,
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
              name="workSummary"
              decorator={{
                rules: [{ required: true, message: '请输入工作总结' }],
                initialValue: workSummary,
              }}
              label="工作总结"
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
            >
              <Input.TextArea placeholder="请输入工作总结" />
            </Field>
            <Field
              name="unfinishedWork"
              label="未完成工作"
              decorator={{
                rules: [{ required: true, message: '请输入未完成的工作' }],
                initialValue: unfinishedWork,
              }}
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
            >
              <Input.TextArea placeholder="请输入工作计划" />
            </Field>
            <Field
              name="helpWork"
              label="需协调工作"
              decorator={{
                rules: [{ message: '请输入需协调的工作' }],
                initialValue: helpWork,
              }}
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
            >
              <Input.TextArea placeholder="请输入协调工作" />
            </Field>
            <Field name="upload" label="附件" fieldCol={1} labelCol={{ span: 4, xxl: 3 }}>
              <FileManagerEnhance
                api="/api/op/v1/workReport/workReportAttachment/sfs/token"
                dataKey={formData.id}
                listType="text"
                disabled={false}
              />
            </Field>
            <Field
              name="reportToResId"
              label="汇报给"
              required
              decorator={{
                initialValue: formData.reportToResId,
              }}
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 10, xxl: 10 }}
            >
              <Selection.Columns
                className="x-fill-100"
                source={resDataSource}
                columns={particularColumns}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                dropdownMatchSelectWidth={false}
                showSearch
                onColumnsChange={value => {}}
                placeholder="请选择相关负责人"
                mode="multiple"
              />
            </Field>
          </FieldList>
        </Card>
        <Card title="工作日志说明" bordered={false} className="tw-card-adjust">
          <DataTable {...tableProps} />
          <Button
            className="tw-btn-primary"
            size="large"
            loading={loading.effects[`${DOMAIN}/query`]}
            onClick={e => {
              this.handleRefresh();
            }}
            disabled={submitBtn || detailBtn}
          >
            刷新
          </Button>
        </Card>
      </PageHeaderWrapper>
    );
  }
}
export default WorkReportEdit;
