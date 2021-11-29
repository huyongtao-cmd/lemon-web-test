import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';

import { Button, Card, DatePicker, Form, Input, Radio, TimePicker, InputNumber } from 'antd';
import { fromQs } from '@/utils/stringUtils';
import AsyncSelect from '@/components/common/AsyncSelect';
import FieldList from '@/components/layout/FieldList';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';
import { UdcSelect } from '@/pages/gen/field';
import { selectBus } from '@/services/org/bu/bu';
import { selectInternalOus } from '@/services/gen/list';

import { mountToTab } from '@/layouts/routerControl';

const { Field, FieldLine } = FieldList;
const RadioGroup = Radio.Group;

// const DOMAIN = 'platResDetail';
const FieldListLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

@connect(({ loading, platResDetail, dispatch }) => ({
  loading,
  platResDetail,
  dispatch,
}))
@mountToTab()
class PlatInfo extends PureComponent {
  componentDidMount() {}

  renderPage = () => {
    const {
      loading,
      platFormData,
      domain,
      form: { getFieldDecorator },
      pageConfig,
    } = this.props;
    if (!pageConfig.pageBlockViews || pageConfig.pageBlockViews.length < 1) {
      return <div />;
    }
    const currentBlockConfig = pageConfig.pageBlockViews[0];
    const { pageFieldViews } = currentBlockConfig;
    const pageFieldJson = {};
    pageFieldViews.forEach(field => {
      pageFieldJson[field.fieldKey] = field;
    });
    let fields = [];
    fields = [
      <Field
        name="resNo"
        key="resNo"
        label={pageFieldJson.resNo.displayName}
        decorator={{
          initialValue: platFormData.resNo,
        }}
      >
        <Input disabled />
      </Field>,
      <Field
        name="resStatusName"
        key="resStatus"
        label={pageFieldJson.resStatus.displayName}
        decorator={{
          initialValue: platFormData.resStatusName,
        }}
      >
        <Input disabled />
      </Field>,
      <Field
        name="inDate"
        key="startDate"
        label={pageFieldJson.startDate.displayName}
        decorator={{
          initialValue: platFormData.startDate,
        }}
      >
        <Input disabled />
      </Field>,
      <Field
        name="taskDate"
        key="lasttaskdate"
        label={pageFieldJson.lasttaskdate.displayName}
        decorator={{
          initialValue: platFormData.lastTaskDate,
        }}
      >
        <Input disabled />
      </Field>,
      <Field
        name="resType1Name"
        key="resType1"
        label={pageFieldJson.resType1.displayName}
        decorator={{
          initialValue: platFormData.resType1Name,
        }}
      >
        <Input disabled />
      </Field>,
      <Field
        name="resType2Name"
        key="resType2"
        label={pageFieldJson.resType2.displayName}
        decorator={{
          initialValue: platFormData.resType2Name,
        }}
      >
        <Input disabled />
      </Field>,
      <Field
        name="needUseraccFlag"
        key="needUseraccFlag"
        label={pageFieldJson.needUseraccFlag.displayName}
        decorator={{
          initialValue: platFormData.needUseraccFlag === 0 ? 0 : 1,
          rules: [
            {
              required: false,
              message: `请选中${pageFieldJson.needUseraccFlag.displayName}`,
            },
          ],
        }}
      >
        <RadioGroup disabled>
          <Radio value={1}>是</Radio>
          <Radio value={0}>否</Radio>
        </RadioGroup>
      </Field>,
      <Field
        name="validType"
        key="busitripFlag"
        label={pageFieldJson.busitripFlag.displayName}
        decorator={{
          initialValue: platFormData.busitripFlag,
          rules: [
            {
              required: false,
              message: `请输入${pageFieldJson.busitripFlag.displayName}`,
            },
          ],
        }}
      >
        <RadioGroup
          onChange={e => {
            platFormData.busitripFlag = e.target.value;
          }}
        >
          <Radio value={1}>是</Radio>
          <Radio value={0}>否</Radio>
        </RadioGroup>
      </Field>,
      <Field
        name="serviceType"
        key="serviceType"
        label={pageFieldJson.serviceType.displayName}
        decorator={{
          initialValue: platFormData.serviceType,
          rules: [
            {
              required: false,
              message: `请选择${pageFieldJson.serviceType.displayName}`,
            },
          ],
        }}
      >
        <UdcSelect
          code="RES.WORK_STYLE"
          placeholder={`请选择${pageFieldJson.serviceType.displayName}`}
        />
      </Field>,
      <FieldLine label={pageFieldJson.serviceClockFrom.displayName} key="serviceClockFrom">
        <Field
          name="serviceClockFrom"
          decorator={{
            initialValue:
              platFormData.serviceClockFrom && moment(platFormData.serviceClockFrom, 'HH:mm'),
            rules: [
              { required: false, message: `请选择${pageFieldJson.serviceClockFrom.displayName}` },
            ],
          }}
          wrapperCol={{ span: 23, xxl: 23 }}
        >
          <TimePicker className="x-fill-100" format="HH:mm" />
        </Field>
        <Field
          name="serviceClockTo"
          decorator={{
            initialValue:
              platFormData.serviceClockTo && moment(platFormData.serviceClockTo, 'HH:mm'),
            rules: [{ required: false, message: '请选择服务时间' }],
          }}
          wrapperCol={{ span: 23, offset: 1, xxl: 23 }}
        >
          <TimePicker className="x-fill-100" format="HH:mm" />
        </Field>
      </FieldLine>,

      <Field
        name="ouId"
        key="ouId"
        label={pageFieldJson.ouId.displayName}
        decorator={{
          initialValue: platFormData.ouId && platFormData.ouId,
          rules: [{ required: false, message: `请选择${pageFieldJson.ouId.displayName}` }],
        }}
      >
        <AsyncSelect
          source={() => selectInternalOus().then(resp => resp.response)}
          placeholder={`请选择${pageFieldJson.ouId.displayName}`}
        />
      </Field>,
      <Field
        name="jobGrade"
        key="jobGrade"
        label={pageFieldJson.jobGrade.displayName}
        decorator={{
          initialValue: platFormData.jobGrade,
          rules: [
            {
              required: false,
              message: `请选择${pageFieldJson.jobGrade.displayName}`,
            },
          ],
        }}
      >
        <Input placeholder={`请输入${pageFieldJson.hrStatus.displayName}`} />
      </Field>,
      <Field
        name="empNo"
        key="empNo"
        label={pageFieldJson.empNo.displayName}
        decorator={{
          initialValue: platFormData.empNo,
          rules: [
            {
              required: false,
              message: `请输入${pageFieldJson.empNo.displayName}`,
            },
          ],
        }}
      >
        <Input placeholder={`请选择${pageFieldJson.empNo.displayName}`} />
      </Field>,
      <Field
        name="internDate"
        key="internDate"
        label={pageFieldJson.internDate.displayName}
        decorator={{
          initialValue: platFormData.internDate ? moment(platFormData.internDate) : null,
          rules: [{ required: false, message: `请输入${pageFieldJson.internDate.displayName}` }],
        }}
      >
        <DatePicker className="x-fill-100" />
      </Field>,
      <Field
        name="enrollDate"
        key="enrollDate"
        label={pageFieldJson.enrollDate.displayName}
        decorator={{
          initialValue: platFormData.enrollDate ? moment(platFormData.enrollDate) : null,
          rules: [{ required: false, message: `请输入${pageFieldJson.enrollDate.displayName}` }],
        }}
      >
        <DatePicker className="x-fill-100" />
      </Field>,
      <Field
        name="regularDate"
        key="regularDate"
        label={pageFieldJson.regularDate.displayName}
        decorator={{
          initialValue: platFormData.regularDate ? moment(platFormData.regularDate) : null,
          rules: [{ required: false, message: `请选择${pageFieldJson.regularDate.displayName}` }],
        }}
      >
        <DatePicker className="x-fill-100" />
      </Field>,
      <Field
        name="contractSignDate"
        key="contractSignDate"
        label={pageFieldJson.contractSignDate.displayName}
        decorator={{
          initialValue: platFormData.contractSignDate
            ? moment(platFormData.contractSignDate)
            : null,
          rules: [
            { required: false, message: `请选择${pageFieldJson.contractSignDate.displayName}` },
          ],
        }}
      >
        <DatePicker className="x-fill-100" />
      </Field>,
      <Field
        name="contractExpireDate"
        key="contractExpireDate"
        label={pageFieldJson.contractExpireDate.displayName}
        decorator={{
          initialValue: platFormData.contractExpireDate
            ? moment(platFormData.contractExpireDate)
            : null,
          rules: [
            { required: false, message: `请选择${pageFieldJson.contractExpireDate.displayName}` },
          ],
        }}
      >
        <DatePicker className="x-fill-100" />
      </Field>,
      <Field
        name="probationBeginDate"
        key="probationBeginDate"
        label={pageFieldJson.probationBeginDate.displayName}
        decorator={{
          initialValue: platFormData.probationBeginDate
            ? moment(platFormData.probationBeginDate)
            : null,
          rules: [
            { required: false, message: `请选择${pageFieldJson.probationBeginDate.displayName}` },
          ],
        }}
      >
        <DatePicker className="x-fill-100" />
      </Field>,
      <Field
        name="probationEndDate"
        key="probationEndDate"
        label={pageFieldJson.probationEndDate.displayName}
        decorator={{
          initialValue: platFormData.probationEndDate
            ? moment(platFormData.probationEndDate)
            : null,
          rules: [
            { required: false, message: `请选择${pageFieldJson.probationEndDate.displayName}` },
          ],
        }}
      >
        <DatePicker className="x-fill-100" />
      </Field>,
      <Field
        name="accessLevel"
        key="accessLevel"
        label={pageFieldJson.accessLevel.displayName}
        decorator={{
          initialValue: platFormData.accessLevel,
          rules: [
            {
              required: false,
              message: `请输入${pageFieldJson.accessLevel.displayName}`,
            },
            {
              pattern: /^([1-9][0-9]{0,1}|100)$/,
              message: '安全级别可输入值1-100',
            },
          ],
        }}
      >
        <InputNumber
          placeholder={`请输入${pageFieldJson.accessLevel.displayName}`}
          className="x-fill-100"
        />
      </Field>,
      <Field
        name="telfeeQuota"
        key="telfeeQuota"
        label={pageFieldJson.telfeeQuota.displayName}
        decorator={{
          initialValue: platFormData.telfeeQuota,
          rules: [
            {
              required: false,
              message: `请输入${pageFieldJson.telfeeQuota.displayName}`,
            },
          ],
        }}
      >
        <InputNumber
          placeholder={`请输入${pageFieldJson.telfeeQuota.displayName}`}
          className="x-fill-100"
        />
      </Field>,
      <Field
        name="compfeeQuota"
        key="compfeeQuota"
        label={pageFieldJson.compfeeQuota.displayName}
        decorator={{
          initialValue: platFormData.compfeeQuota,
          rules: [
            {
              required: false,
              message: `请输入${pageFieldJson.compfeeQuota.displayName}`,
            },
          ],
        }}
      >
        <InputNumber
          min={0}
          max={999999999999}
          precision={0}
          placeholder={`请输入${pageFieldJson.compfeeQuota.displayName}`}
          className="x-fill-100"
        />
      </Field>,
      <Field
        name="hrStatus"
        key="hrStatus"
        label={pageFieldJson.hrStatus.displayName}
        decorator={{
          initialValue: platFormData.hrStatus,
          rules: [
            {
              required: false,
              message: `请选择${pageFieldJson.hrStatus.displayName}`,
            },
          ],
        }}
      >
        <UdcSelect code="COM.STATUS1" placeholder={`请选择${pageFieldJson.hrStatus.displayName}`} />
      </Field>,
      <Field
        name="inLieuFlag"
        label="无加班人员"
        decorator={{
          initialValue: platFormData.inLieuFlag,
          rules: [
            {
              required: false,
              message: '请选择是否无加班人员',
            },
          ],
        }}
      >
        <RadioGroup initialValue={platFormData.inLieuFlag || ''}>
          <Radio value="NO">是</Radio>
          <Radio value="YES">否</Radio>
        </RadioGroup>
      </Field>,
      <Field
        name="busiTrainFlag"
        label="参加商务基本资质培训"
        decorator={{
          initialValue: platFormData.busiTrainFlag,
          rules: [
            {
              required: false,
              message: '参加商务基本资质培训',
            },
          ],
        }}
        labelCol={{ span: 8, xxl: 8 }}
      >
        <RadioGroup initialValue={platFormData.busiTrainFlag || ''}>
          <Radio value="YES">是</Radio>
          <Radio value="NO">否</Radio>
        </RadioGroup>
      </Field>,
    ];
    const filterList = fields
      .filter(field => !field.key || pageFieldJson[field.key].visibleFlag === 1)
      .sort((field1, field2) => field1.props.sortNo - field2.props.sortNo);
    return (
      <div>
        <FieldList
          layout="horizontal"
          // legend="基本信息"
          getFieldDecorator={getFieldDecorator}
          col={2}
        >
          {filterList}
        </FieldList>
      </div>
    );
  };

  render() {
    const {
      loading,
      platFormData,
      domain,
      form: { getFieldDecorator },
      pageConfig,
    } = this.props;
    // loading完成之前将按钮设为禁用
    const disabledBtn = loading.effects[`${domain}/query`];
    // 获取url上的参数
    const param = fromQs();

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-adjust" bordered={false}>
          {pageConfig ? this.renderPage() : null}
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default PlatInfo;
