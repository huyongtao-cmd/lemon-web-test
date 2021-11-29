import React from 'react';
import { connect } from 'dva';
import { Button, Card, Checkbox, DatePicker, Form, Input } from 'antd';
import { formatMessage } from 'umi/locale';
import classnames from 'classnames';
import moment from 'moment';
import { isNil, isEmpty } from 'ramda';

import { fromQs } from '@/utils/stringUtils';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { FileManagerEnhance } from '@/pages/gen/field';
import { closeThenGoto, mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import createMessage from '@/components/core/AlertMessage';
import FieldList from '@/components/layout/FieldList';
import ChangeTable from './ChangeTable';
import ActivityTable from './ActivityTable';

const DOMAIN = 'userTaskChange';
const { Field, FieldLine } = FieldList;

// --------------- 需要的数据写在这里,或者由数据文件import进来(*.data.js) -----------------

const REQ_REPO = '/api/op/v1/taskManager/task/requirement/sfs/token';
const DEL_REPO = '/api/op/v1/taskManager/task/deliverable/sfs/token';

const whereToGo = () => {
  const { from } = fromQs();
  if (!from) return '/user/flow/process';
  return from === 'originated' ? '/user/task/originated' : '/user/task/list';
};

@connect(({ loading, userTaskChange, user }) => ({
  loading,
  ...userTaskChange,
  user: user.user,
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    const { dispatch } = props;
    if (changedFields && Object.values(changedFields)[0]) {
      const { name, value } = Object.values(changedFields)[0];
      const newFieldData = { [name]: value };
      switch (name) {
        default:
          break;
        // 允许转包用0/1替代布尔类型
        case 'allowTransferFlag':
          Object.assign(newFieldData, {
            [name]: value ? 1 : 0,
          });
          break;
        // antD 时间组件返回的是moment对象 转成字符串提交
        case 'planStartDate':
        case 'planEndDate':
          Object.assign(newFieldData, {
            [name]: formatDT(value),
          });
          break;
      }
      // 更新表单
      dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: newFieldData,
      });
    }
  },
})
@mountToTab()
class TaskChange extends React.PureComponent {
  /**
   * 渲染完成后要做的事情
   */
  componentDidMount() {
    const { dispatch } = this.props;
    const { id, from } = fromQs();

    dispatch({
      type: `${DOMAIN}/clean`,
    });
    if (id) {
      dispatch({
        type: `${DOMAIN}/${from ? 'queryTask' : 'query'}`,
        payload: { id },
      });
    } else {
      dispatch({
        type: `${DOMAIN}/clean`,
      });
    }
  }

  handleSave = () => {
    const {
      dispatch,
      form: { validateFieldsAndScroll },
      formData,
      dataList,
      changeTableList,
    } = this.props;
    const { apprId = null } = fromQs();
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        // check dataList
        const unLegalRows = dataList.filter(data => isNil(data.actName) || isNil(data.planEqva));
        if (!isEmpty(unLegalRows)) {
          createMessage({ type: 'warn', description: '行编辑未通过，请检查输入项。' });
        } else {
          dispatch({
            type: `${DOMAIN}/save`,
            payload: { formData, dataList, changeTableList, apprId },
          });
        }
      }
    });
  };
  // --------------- 私有函数区域结束 -----------------

  render() {
    const {
      loading,
      form: { getFieldDecorator },
      formData,
      // 权限
      user,
    } = this.props;
    const disabledBtn =
      !!loading.effects[`${DOMAIN}/query`] ||
      !!loading.effects[`${DOMAIN}/queryTask`] ||
      !!loading.effects[`${DOMAIN}/save`];

    return (
      <PageHeaderWrapper title="任务包当量调整">
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            icon="save"
            size="large"
            onClick={this.handleSave}
            disabled={disabledBtn}
          >
            提交
          </Button>
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => closeThenGoto(whereToGo())}
            disabled={disabledBtn}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>

        <Card className="tw-card-adjust" bordered={false} title="任务包信息">
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="disterResName"
              label="发包人"
              decorator={{
                initialValue: formData.disterResName,
              }}
            >
              <Input disabled placeholder="[默认]" />
            </Field>
            <Field
              name="taskNo"
              label="编号"
              decorator={{
                initialValue: formData.taskNo,
              }}
            >
              <Input disabled placeholder="系统生成" />
            </Field>
            <Field
              name="taskName"
              label="任务包名称"
              decorator={{
                initialValue: formData.taskName,
                rules: [
                  {
                    required: true,
                    message: '请输入任务包名称',
                  },
                ],
              }}
            >
              <Input placeholder="任务名称" />
            </Field>
            <FieldLine label="复合能力" fieldCol={2} required>
              <Field
                name="jobType1Name"
                decorator={{
                  initialValue: formData.jobType1Name,
                  rules: [{ required: true, message: '请选择工种' }],
                }}
                wrapperCol={{ span: 23 }}
              >
                <Input disabled placeholder="工种" />
              </Field>
              <Field
                name="jobType2Name"
                decorator={{
                  initialValue: formData.jobType2Name,
                  rules: [{ required: true, message: '请选择工种子类' }],
                }}
                wrapperCol={{ span: 23 }}
              >
                <Input disabled placeholder="工种子类" />
              </Field>
              <Field
                name="capasetLeveldName"
                decorator={{
                  initialValue: formData.capasetLeveldName,
                  rules: [{ required: true, message: '请选择级别' }],
                }}
                wrapperCol={{ span: 24 }}
              >
                <Input disabled placeholder="级别" />
              </Field>
            </FieldLine>
            <Field
              name="receiverResName"
              label="接收资源"
              decorator={{
                initialValue: formData.receiverResName,
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="receiverBuName"
              label="接收BU"
              decorator={{
                initialValue: formData.receiverBuName,
              }}
            >
              <Input placeholder="接收BU" disabled />
            </Field>
            <Field
              name="resSourceTypeName"
              label="合作类型"
              decorator={{
                initialValue: formData.resSourceTypeName,
              }}
            >
              <Input placeholder="合作类型" disabled />
            </Field>
            <Field presentational />
            <Field
              name="reasonTypeName"
              label="事由类型"
              decorator={{
                initialValue: formData.reasonTypeName,
                rules: [
                  {
                    required: true,
                    message: '请选择事由类型',
                  },
                ],
              }}
            >
              <Input placeholder="事由类型" disabled />
            </Field>
            <Field
              name="reasonName"
              label="事由号"
              decorator={{
                initialValue: formData.reasonName,
                rules: [
                  {
                    required: true,
                    message: '请选择事由号',
                  },
                ],
              }}
            >
              <Input placeholder="事由号" disabled />
            </Field>
            <Field
              name="expenseBuName"
              label="费用承担BU"
              decorator={{
                initialValue: formData.expenseBuName,
                rules: [
                  {
                    required: true,
                    message: '请补充事由的BU信息',
                  },
                ],
              }}
            >
              <Input placeholder="费用承担BU" disabled />
            </Field>
            <Field
              name="allowTransferFlag"
              label="允许转包"
              decorator={{
                initialValue: formData.allowTransferFlag,
              }}
            >
              <Checkbox disabled checked={formData.allowTransferFlag} placeholder="允许转包">
                是
              </Checkbox>
            </Field>
            <Field
              name="planStartDate"
              label="计划开始时间"
              decorator={{
                initialValue: formData.planStartDate ? moment(formData.planStartDate) : null,
                rules: [
                  {
                    required: false,
                    message: '请填写计划开始时间',
                  },
                  {
                    validator: (rule, value, callback) => {
                      if (
                        value &&
                        formData.planEndDate &&
                        moment(formData.planEndDate).isBefore(value)
                      ) {
                        callback('计划开始日期应该早于结束日期');
                      }
                      // Note: 必须总是返回一个 callback，否则 validateFieldsAndScroll 无法响应
                      callback();
                    },
                  },
                ],
              }}
            >
              <DatePicker className="x-fill-100" placeholder="计划开始时间" format="YYYY-MM-DD" />
            </Field>
            <Field
              name="planEndDate"
              label="计划结束时间"
              decorator={{
                initialValue: formData.planEndDate ? moment(formData.planEndDate) : null,
                rules: [
                  {
                    required: false,
                    message: '请填写计划结束时间',
                  },
                  {
                    validator: (rule, value, callback) => {
                      if (
                        value &&
                        formData.planStartDate &&
                        moment(value).isBefore(formData.planStartDate)
                      ) {
                        callback('计划结束日期应该晚于开始日期');
                      }
                      // Note: 必须总是返回一个 callback，否则 validateFieldsAndScroll 无法响应
                      callback();
                    },
                  },
                ],
              }}
            >
              <DatePicker className="x-fill-100" placeholder="计划结束时间" format="YYYY-MM-DD" />
            </Field>
            <Field name="requirement" label="任务需求附件">
              <FileManagerEnhance
                api={REQ_REPO}
                dataKey={formData.id}
                listType="text"
                disabled={false}
              />
            </Field>
            <Field name="deliverable" label="提交物模版附件">
              <FileManagerEnhance
                api={DEL_REPO}
                dataKey={formData.id}
                listType="text"
                disabled={false}
              />
            </Field>
            <Field
              name="attachuploadMethod"
              label="附件上传方法"
              decorator={{
                initialValue: formData.attachuploadMethod,
              }}
            >
              <Input placeholder="完工附件上传方法" />
            </Field>
            <Field
              name="taskStatusName"
              label="任务状态"
              decorator={{
                initialValue: formData.taskStatusName,
              }}
            >
              <Input placeholder="任务状态" disabled />
            </Field>
            <Field
              name="remark"
              label="备注"
              decorator={{
                initialValue: formData.remark,
                rules: [{ max: 400, message: '不超过400个字' }],
              }}
            >
              <Input.TextArea rows={1} placeholder="备注" />
            </Field>
            <Field presentational />
            <Field
              name="createUserName"
              label="创建人"
              decorator={{
                initialValue: formData.createUserName || (user.info && user.info.name),
              }}
            >
              <Input disabled placeholder="[当前用户]" />
            </Field>
            <Field
              name="createTime"
              label="创建日期"
              decorator={{
                initialValue: formData.createTime || formatDT(Date.now()),
              }}
            >
              <Input disabled placeholder="[系统生成]" />
            </Field>
          </FieldList>
        </Card>
        <br />
        <Card className="tw-card-adjust" bordered={false} title="结算信息">
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="acceptMethodName"
              label="验收方式"
              decorator={{
                initialValue: formData.acceptMethodName,
                rules: [
                  {
                    required: true,
                    message: '请输入验收方式',
                  },
                ],
              }}
            >
              <Input disabled placeholder="验收方式" />
            </Field>
            <Field
              name="pricingMethod"
              label="计价方式"
              decorator={{
                initialValue:
                  {
                    '04': '单价',
                  }[formData.acceptMethod] || '总价',
              }}
            >
              <Input disabled placeholder="[由验收方式带出]" />
            </Field>
            <Field
              name="eqvaRatio"
              label="派发当量系数"
              decorator={{
                initialValue: formData.eqvaRatio,
              }}
              popover={{
                placement: 'topLeft',
                trigger: 'hover',
                content: '验收方式为人天时必填，资源来源为外部时不可填写',
              }}
            >
              <Input disabled placeholder="请输入派发当量系数" />
            </Field>
            <Field
              name="guaranteeRate"
              label="质保金比例%"
              decorator={{
                initialValue: formData.guaranteeRate,
                rules: [
                  {
                    required: true,
                    message: '请输入质保金比例',
                  },
                ],
              }}
              popover={{
                placement: 'topLeft',
                trigger: 'hover',
                content: '结算时会按照该比例冻结当量/费用，到项目结束后释放！',
              }}
            >
              <Input disabled placeholder="质保金比例" />
            </Field>

            {/* <Field
              name="ohfeePriceFlag"
              label="自定义管理费"
              decorator={{
                initialValue: formData.ohfeePriceFlag || '0',
                rules: [
                  {
                    required: true,
                    message: '请选择自定义管理费',
                  },
                ],
              }}
            >
              <Select
                key={getGuid()}
                placeholder="请选择自定义管理费"
                disabled={formData.settlePriceFlag === '1'}
              >
                <Select.Option value="1">是</Select.Option>
                <Select.Option value="0">否</Select.Option>
              </Select>
            </Field>
            <Field
              name="ohfeePrice"
              label="管理费"
              decorator={{
                initialValue: formData.ohfeePrice,
                rules: [
                  {
                    required: formData.ohfeePriceFlag === 1' ,
                    message: '请输入管理费',
                  },
                ],
              }}
            >
              <Input
                key={getGuid()}
                placeholder="请输入管理费"
                disabled={formData.ohfeePriceFlag !== '1'}
              />
            </Field>
             */}
            <Field
              name="buSettlePrice"
              label="BU结算价格"
              decorator={{
                initialValue: formData.buSettlePrice,
                rules: [
                  {
                    required: true,
                    message: '请计算BU结算价格',
                  },
                ],
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="taxRate"
              label="税率"
              decorator={{
                initialValue: formData.taxRate,
              }}
            >
              <Input placeholder="税率" disabled />
            </Field>
            <Field
              name="settlePrice"
              label="最终结算单价"
              decorator={{
                initialValue: formData.settlePrice,
                rules: [
                  {
                    required: false,
                    message: '请输入最终结算单价',
                  },
                ],
              }}
            >
              <Input disabled placeholder="最终结算单价" />
            </Field>

            <Field
              name="planEqva"
              label="总当量/总金额"
              decorator={{
                initialValue: `${formData.planEqva || 0} / ${formData.amt || 0}`,
              }}
            >
              <Input disabled placeholder="总当量/总金额" />
            </Field>
          </FieldList>
        </Card>
        <br />
        <Card className="tw-card-adjust" bordered={false} title="任务包活动信息">
          <ActivityTable />
        </Card>
        <br />
        <Card className="tw-card-adjust" bordered={false} title="当量变更结果">
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="changeDesc"
              label="变更说明"
              decorator={{
                initialValue: formData.changeDesc,
                rules: [{ max: 400, message: '不超过400个字' }],
              }}
            >
              <Input.TextArea rows={2} placeholder="变更说明" />
            </Field>
          </FieldList>
          <ChangeTable />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default TaskChange;
