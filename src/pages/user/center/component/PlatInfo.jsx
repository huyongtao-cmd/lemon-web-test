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

  render() {
    const {
      loading,
      platFormData,
      domain,
      form: { getFieldDecorator },
    } = this.props;
    // loading完成之前将按钮设为禁用
    const disabledBtn = loading.effects[`${domain}/query`];
    // 获取url上的参数
    const param = fromQs();

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-adjust" bordered={false}>
          <FieldList
            layout="horizontal"
            // legend="基本信息"
            getFieldDecorator={getFieldDecorator}
            col={2}
          >
            <Field
              name="resNo"
              label="资源编号"
              decorator={{
                initialValue: platFormData.resNo,
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="resStatusName"
              label="资源状态"
              decorator={{
                initialValue: platFormData.resStatusName,
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="inDate"
              label="进入平台时间"
              decorator={{
                initialValue: platFormData.startDate,
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="taskDate"
              label="最近一次任务时间"
              decorator={{
                initialValue: platFormData.lastTaskDate,
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="resType1Name"
              label="资源类型一"
              decorator={{
                initialValue: platFormData.resType1Name,
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="resType2Name"
              label="资源类型二"
              decorator={{
                initialValue: platFormData.resType2Name,
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="needUseraccFlag"
              label="是否需要用户账号"
              decorator={{
                initialValue: platFormData.needUseraccFlag === 0 ? 0 : 1,
                rules: [
                  {
                    required: false,
                    message: '请选中是否需要用户账号',
                  },
                ],
              }}
            >
              <RadioGroup disabled>
                <Radio value={1}>是</Radio>
                <Radio value={0}>否</Radio>
              </RadioGroup>
            </Field>
            {/* <Field
              name="baseBuId"
              label="所属组织"
              decorator={{
                initialValue: platFormData.baseBuId && platFormData.baseBuId + '',
                rules: [
                  {
                    required: false,
                    message: '请输入所属组织',
                  },
                ],
              }}
            >
              <AsyncSelect
                source={() => selectBus().then(resp => resp.response)}
                placeholder="请输入所属组织"
                showSearch
                filterOption={(input, option) =>
                  option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                disabled
              />
            </Field>
            <Field
              name="baseCity"
              label="主服务地"
              decorator={{
                initialValue: platFormData.baseCity && platFormData.baseCity + '',
                rules: [
                  {
                    required: true,
                    message: '请选择主服务地',
                  },
                ],
              }}
            >
              <UdcSelect code="COM.CITY" placeholder="请选择主服务地" />
            </Field>
            <Field
              name="jobGrade"
              label="职级"
              decorator={{
                initialValue: platFormData.jobGrade,
                rules: [
                  {
                    required: false,
                    message: '请输入职级',
                  },
                ],
              }}
            >
              <Input placeholder="请输入职级" />
            </Field> */}
            <Field
              name="validType"
              label="能否出差"
              decorator={{
                initialValue: platFormData.busitripFlag,
                rules: [
                  {
                    required: false,
                    message: '请输入能否出差',
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
            </Field>
            <Field
              name="serviceType"
              label="服务方式"
              decorator={{
                initialValue: platFormData.serviceType,
                rules: [
                  {
                    required: false,
                    message: '请选择服务方式',
                  },
                ],
              }}
            >
              <UdcSelect code="RES.WORK_STYLE" placeholder="请选择服务方式" />
            </Field>
            <FieldLine label="服务时间段">
              <Field
                name="serviceClockFrom"
                decorator={{
                  initialValue:
                    platFormData.serviceClockFrom && moment(platFormData.serviceClockFrom, 'HH:mm'),
                  rules: [{ required: false, message: '请选择服务时间' }],
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
            </FieldLine>

            <Field
              name="ouId"
              label="所属公司"
              decorator={{
                initialValue: platFormData.ouId && platFormData.ouId,
                rules: [{ required: false, message: '请选择所属公司' }],
              }}
            >
              <AsyncSelect
                source={() => selectInternalOus().then(resp => resp.response)}
                placeholder="请选择所属公司"
              />
            </Field>

            <Field
              name="empNo"
              label="工号"
              decorator={{
                initialValue: platFormData.empNo,
                rules: [
                  {
                    required: false,
                    message: '请输入工号',
                  },
                ],
              }}
            >
              <Input placeholder="请输入工号" />
            </Field>
            <Field
              name="enrollDate"
              label="入职日期"
              decorator={{
                initialValue: platFormData.enrollDate ? moment(platFormData.enrollDate) : null,
                rules: [{ required: false, message: '请选择入职日期' }],
              }}
            >
              <DatePicker className="x-fill-100" />
            </Field>
            <Field
              name="regularDate"
              label="转正日期"
              decorator={{
                initialValue: platFormData.regularDate ? moment(platFormData.regularDate) : null,
                rules: [{ required: false, message: '请选择转正日期' }],
              }}
            >
              <DatePicker className="x-fill-100" />
            </Field>
            <Field
              name="contractSignDate"
              label="合同签订日期"
              decorator={{
                initialValue: platFormData.contractSignDate
                  ? moment(platFormData.contractSignDate)
                  : null,
                rules: [{ required: false, message: '请选择合同签订日期' }],
              }}
            >
              <DatePicker className="x-fill-100" />
            </Field>
            <Field
              name="contractExpireDate"
              label="合同到期日期"
              decorator={{
                initialValue: platFormData.contractExpireDate
                  ? moment(platFormData.contractExpireDate)
                  : null,
                rules: [{ required: false, message: '请选择合同到期日期' }],
              }}
            >
              <DatePicker className="x-fill-100" />
            </Field>
            <Field
              name="probationBeginDate"
              label="试用期开始日期"
              decorator={{
                initialValue: platFormData.probationBeginDate
                  ? moment(platFormData.probationBeginDate)
                  : null,
                rules: [{ required: false, message: '请选择试用期开始日期' }],
              }}
            >
              <DatePicker className="x-fill-100" />
            </Field>
            <Field
              name="probationEndDate"
              label="试用期结束日期"
              decorator={{
                initialValue: platFormData.probationEndDate
                  ? moment(platFormData.probationEndDate)
                  : null,
                rules: [{ required: false, message: '请选择试用期结束日期' }],
              }}
            >
              <DatePicker className="x-fill-100" />
            </Field>
            <Field
              name="accessLevel"
              label="安全级别"
              decorator={{
                initialValue: platFormData.accessLevel,
                rules: [
                  {
                    required: false,
                    message: '请输入安全级别',
                  },
                  {
                    pattern: /^([1-9][0-9]{0,1}|100)$/,
                    message: '安全级别可输入值1-100',
                  },
                ],
              }}
            >
              <InputNumber placeholder="请输入安全级别" className="x-fill-100" />
            </Field>
            <Field
              name="telfeeQuota"
              label="话费额度"
              decorator={{
                initialValue: platFormData.telfeeQuota,
                rules: [
                  {
                    required: false,
                    message: '请输入话费额度',
                  },
                ],
              }}
            >
              <InputNumber placeholder="请输入话费额度" className="x-fill-100" />
            </Field>
            <Field
              name="compfeeQuota"
              label="电脑额度"
              decorator={{
                initialValue: platFormData.compfeeQuota,
                rules: [
                  {
                    required: false,
                    message: '请输入电脑额度',
                  },
                ],
              }}
            >
              <InputNumber
                min={0}
                max={999999999999}
                precision={0}
                placeholder="请输入电脑额度"
                className="x-fill-100"
              />
            </Field>
            <Field
              name="hrStatus"
              label="人事状态"
              decorator={{
                initialValue: platFormData.hrStatus,
                rules: [
                  {
                    required: false,
                    message: '请选择人事状态',
                  },
                ],
              }}
            >
              <UdcSelect code="COM.STATUS1" placeholder="请选择人事状态" />
            </Field>
            <Field
              name="jobGrade"
              label="职级"
              decorator={{
                initialValue: platFormData.jobGrade,
                rules: [
                  {
                    required: false,
                    message: '请选择人事状态',
                  },
                ],
              }}
            >
              <Input placeholder="请输入职级" />
            </Field>
          </FieldList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default PlatInfo;
