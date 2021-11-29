import React, { Component } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import classnames from 'classnames';
import { isNil, isEmpty, pickAll } from 'ramda';
import moment from 'moment';
import { Card, Button, Form, Input, DatePicker } from 'antd';
import { Selection } from '@/pages/gen/field';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import Title from '@/components/layout/Title';
import AsyncSelect from '@/components/common/AsyncSelect';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import FieldList from '@/components/layout/FieldList';
import createMessage from '@/components/core/AlertMessage';
import { mul, parseIfNumeric, checkIfNumber } from '@/utils/mathUtils';
import { toIsoDate } from '@/utils/timeUtils';
import { getGuid, fromQs } from '@/utils/stringUtils';
import { showProcBtn } from '@/utils/flowToRouter';
import { getSettleType } from '@/services/user/equivalent/equivalent';

const DOMAIN = 'CommonEdit';
const { Field } = FieldList;

@connect(({ loading, CommonEdit, user }) => ({
  loading,
  CommonEdit,
  user,
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    if (isEmpty(changedFields)) return;
    const { name, value } = Object.values(changedFields)[0];
    const {
      CommonEdit: { projectList, taskList, resList },
      dispatch,
    } = props;
    let payload = {};
    // 选择项目的处理逻辑
    if (name === 'projCode') {
      if (!value) {
        payload = {
          applySettleAmt: undefined,
          settlePrice: undefined,
          eqvaSalary: undefined,
          projId: undefined,
          resAmt: undefined,
          taskId: undefined,
          taskCode: undefined,
          expenseBuId: undefined,
          incomeResId: undefined,
          resBuId: undefined,
        };
        dispatch({
          type: 'updateState',
          payload: {
            taskList: [],
          },
        });
      } else {
        const { id, buId } = projectList.find(project => project.code === value);
        payload = {
          expenseBuId: buId,
          projId: id,
          taskId: undefined,
          taskCode: undefined,
        };
        dispatch({
          type: `${DOMAIN}/fetchTaskListByProjectId`,
          payload: id,
        });
      }
    }

    // 选择任务的处理逻辑
    if (name === 'taskCode') {
      if (!value) {
        payload = {
          settlePrice: undefined,
          eqvaSalary: undefined,
          applySettleAmt: undefined,
          resAmt: undefined,
          taskId: undefined,
        };
      } else {
        const { id } = taskList.find(task => task.code === value);
        dispatch({
          type: `${DOMAIN}/fetchTaskInfo`,
          payload: id,
        });
      }
    }

    // 选择收入资源的处理逻辑
    if (name === 'incomeResId') {
      if (!value) {
        payload = {
          resBuId: undefined,
        };
      } else {
        // tag :: valSphd1 资源所属 BU 的 id
        const { valSphd1 } = resList.find(res => res.code === value);
        payload = {
          resBuId: valSphd1,
        };
      }
    }

    // 缺省
    dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: {
        ...payload,
        [name]: value,
      },
    });
  },
})
@mountToTab()
class DetailCommonEdit extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/clean` });
    dispatch({ type: `${DOMAIN}/queryList`, payload: fromQs().id });
  }

  handleSave = () => {
    const {
      dispatch,
      CommonEdit: { formData },
      form: { validateFieldsAndScroll },
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      if (error) return;
      const settleDate = toIsoDate(values.settleDate);
      const params = pickAll(
        [
          'id',
          'applyResName',
          // 'applyDate',
          'applySettleEqva',
          'settleType',
          'settlePrice',
          'eqvaSalary',
          'projId',
          'taskId',
          'expenseBuId',
          'incomeResId',
          'resBuId',
          'remark',
        ],
        { ...values, ...formData }
      );
      const payload = {
        settleDate,
        ...params,
        submitted: false,
      };
      dispatch({ type: `${DOMAIN}/saveData`, payload });
    });
  };

  handleSubmit = () => {
    const {
      dispatch,
      CommonEdit: { formData },
      form: { validateFieldsAndScroll },
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      if (error) return;
      const settleDate = toIsoDate(values.settleDate);
      const params = pickAll(
        [
          'id',
          'applyResName',
          // 'applyDate',
          'applySettleEqva',
          'settleType',
          'settlePrice',
          'eqvaSalary',
          'projId',
          'taskId',
          'expenseBuId',
          'incomeResId',
          'resBuId',
          'remark',
        ],
        { ...values, ...formData }
      );
      const payload = {
        settleDate,
        ...params,
        submitted: true,
      };
      const { taskId, remark } = fromQs();
      dispatch({ type: `${DOMAIN}/submitData`, payload: { formData: payload, taskId, remark } });
    });
  };

  calcMoney = value => {
    const {
      dispatch,
      CommonEdit: { formData },
    } = this.props;
    const { settlePrice, eqvaSalary } = formData;
    const applySettleAmt = mul(value || 0, settlePrice || 0);
    const resAmt = mul(value || 0, eqvaSalary || 0);
    dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: {
        applySettleAmt,
        resAmt,
      },
    });
  };

  render() {
    const {
      loading,
      form: { getFieldDecorator, setFieldsValue, setFields },
      CommonEdit: { formData, projectList, taskList, resList, buList },
      user: {
        user: { info = {} },
      },
      dispatch,
    } = this.props;

    const { id, taskId, sourceUrl } = fromQs();

    const { apprStatus } = formData;
    const showButton = showProcBtn(apprStatus, taskId);
    const disabledBtn =
      loading.effects[`${DOMAIN}/queryList`] ||
      loading.effects[`${DOMAIN}/saveData`] ||
      loading.effects[`${DOMAIN}/submitData`];

    return (
      <PageHeaderWrapper title="当量结算泛用">
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            type="primary"
            icon="save"
            size="large"
            disabled={disabledBtn}
            onClick={this.handleSave}
          >
            {formatMessage({ id: `misc.save`, desc: '保存' })}
          </Button>
          {showButton && (
            <Button
              className="tw-btn-primary"
              type="primary"
              icon="save"
              size="large"
              disabled={disabledBtn}
              onClick={this.handleSubmit}
            >
              提交
            </Button>
          )}
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() =>
              sourceUrl ? closeThenGoto(sourceUrl) : closeThenGoto('/plat/intelStl/list')
            }
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        <Card
          title={<Title icon="profile" id="sys.system.basicInfo" defaultMessage="基本信息" />}
          bordered={false}
          className="tw-card-adjust"
        >
          <FieldList legend="当量结算基本信息" getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="settleNo"
              label="结算单号"
              decorator={{
                initialValue: formData.settleNo,
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="applyResId"
              label="申请人"
              decorator={{
                initialValue: formData.applyResId || info.id,
              }}
            >
              <AsyncSelect source={resList} disabled />
            </Field>
            <Field
              name="applyDate"
              label="申请日期"
              decorator={{
                initialValue: formData.applyDate || moment().format('YYYY-MM-DD'),
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="settleDate"
              label="结算日期"
              decorator={{
                initialValue: formData.settleDate ? moment(formData.settleDate) : moment(),
                rules: [{ required: true, message: '请选择结算日期' }],
              }}
            >
              <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
            </Field>
            <Field
              name="applySettleEqva"
              label="申请结算当量"
              decorator={{
                initialValue: formData.applySettleEqva,
                rules: [
                  {
                    required: true,
                    message: '请输入申请结算当量',
                  },
                  // {
                  //   validator: (rule, value, callback) => {
                  //     if (isNil(value) || !value) {
                  //       dispatch({
                  //         type: `${DOMAIN}/updateForm`,
                  //         payload: {
                  //           applySettleAmt: undefined,
                  //           resAmt: undefined,
                  //         },
                  //       });
                  //       callback();
                  //     } else {
                  //       const error = [];
                  //       if (!checkIfNumber(value)) error.push('输入类型不正确');
                  //       // if (!parseIfNumeric(value)) error.push('输入类型不正确');
                  //       else if (formData.taskId) {
                  //         parseIfNumeric(value);
                  //         this.calcMoney(value);
                  //       }
                  //       callback();
                  //     }
                  //   },
                  // },
                ],
              }}
            >
              <Input
                placeholder="请输入申请结算当量"
                onChange={e => {
                  const { value } = e.target;
                  const reg = /^-?(0|[1-9][0-9]*)(\.[0-9]*)?$/;
                  if ((!Number.isNaN(value) && reg.test(value)) || value === '' || value === '-') {
                    // do nothing
                  } else {
                    setFields({ value, errors: [new Error('输入类型不正确')] });
                  }
                }}
                onBlur={e => {
                  const { value } = e.target;
                  if (value.charAt(value.length - 1) === '.' || value === '-') {
                    setFieldsValue({ applySettleEqva: value.slice(0, -1) });
                  }
                }}
              />
            </Field>
            <Field
              name="settleType"
              label="结算类型"
              decorator={{
                initialValue: formData.settleType,
                rules: [{ required: true, message: '请选择结算类型' }],
              }}
            >
              <AsyncSelect
                source={() => getSettleType().then(resp => resp.response.datum)}
                placeholder="请选择结算类型"
                filterOption={(input, option) =>
                  option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              />
            </Field>
            <Field
              name="applySettleAmt"
              label="申请结算金额"
              decorator={{
                initialValue: formData.applySettleAmt,
              }}
            >
              <Input disabled style={{ color: 'red' }} />
            </Field>
            <Field
              name="settlePrice"
              label="结算单价/当量工资"
              // decorator={{
              //   initialValue: `${formData.settlePrice || ''} / ${
              //     formData.eqvaSalary ? formData.eqvaSalary : ''
              //   }`,
              // }}
            >
              <Input
                disabled
                style={{ color: 'red' }}
                placeholder={`${formData.settlePrice || ''} / ${
                  formData.eqvaSalary ? formData.eqvaSalary : ''
                }`}
                // addonAfter={formData.eqvaSalary ? formData.eqvaSalary : undefined}
              />
            </Field>
            <Field
              name="projCode"
              label="相关项目"
              decorator={{
                initialValue: formData.projCode,
                // rules: [{ required: true, message: '请选择相关项目' }],
              }}
            >
              <AsyncSelect
                source={projectList}
                placeholder="请选择相关项目"
                filterOption={(input, option) =>
                  option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                onChange={value => {
                  if (!value) setFieldsValue({ taskCode: undefined });
                }}
              />
            </Field>
            <Field
              name="resAmt"
              label="资源当量收入金额"
              decorator={{
                initialValue: formData.resAmt,
              }}
            >
              <Input disabled style={{ color: 'red' }} />
            </Field>
            <Field
              name="taskCode"
              label="相关任务"
              decorator={{
                initialValue: formData.taskCode,
                // rules: [{ required: true, message: '请选择相关任务' }],
              }}
            >
              <AsyncSelect
                key={getGuid()}
                source={taskList}
                placeholder="请选择相关任务"
                disabled={!formData.projId}
                filterOption={(input, option) =>
                  option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              />
            </Field>
            <Field
              name="expenseBuId"
              label="支出BU"
              decorator={{
                initialValue: formData.expenseBuId,
                rules: [{ required: true, message: '请选择支出BU' }],
              }}
            >
              <Selection.ColumnsForBu disabled={!!formData.projId} />
            </Field>
            <Field
              name="incomeResId" // incomeResId
              label="收入资源"
              decorator={{
                initialValue: formData.incomeResId,
                // rules: [{ required: true, message: '请选择收入资源' }],
              }}
            >
              <AsyncSelect
                source={resList}
                placeholder="请选择收入资源"
                showSearch
                filterOption={(input, option) =>
                  option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              />
            </Field>
            <Field
              name="resBuId"
              label="收入BU"
              decorator={{
                initialValue: formData.resBuId,
                rules: [{ required: true, message: '请选择收入BU' }],
              }}
            >
              <Selection.ColumnsForBu />
            </Field>
            <Field
              name="remark"
              label="结算说明"
              decorator={{
                initialValue: formData.remark,
              }}
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
            >
              <Input.TextArea rows={3} placeholder="请输入结算说明" />
            </Field>
          </FieldList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default DetailCommonEdit;
