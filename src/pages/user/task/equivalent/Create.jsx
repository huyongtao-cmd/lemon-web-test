import React, { PureComponent } from 'react';
import { connect } from 'dva';
import classnames from 'classnames';
import { isEmpty } from 'ramda';
import { Button, Card, Form, Input, Divider, InputNumber } from 'antd';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto, markAsTab } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import AsyncSelect from '@/components/common/AsyncSelect';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';
import { Selection, DatePicker, UdcSelect } from '@/pages/gen/field';
import createMessage from '@/components/core/AlertMessage';
import { selectProjectTmpl } from '@/services/user/project/project';
import moment from 'moment';
import { selectUsersWithBu } from '@/services/gen/list';
import SettlementModal from './component/settlementModal';

const { Field, FieldLine } = FieldList;

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

const DOMAIN = 'equivalentCreate';

@connect(({ loading, equivalentCreate, dispatch, user }) => ({
  loading,
  equivalentCreate,
  dispatch,
  user,
}))
@Form.create({
  onValuesChange(props, changedValues) {
    if (!isEmpty(changedValues)) {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: changedValues,
      });
    }
  },
})
@mountToTab()
class EquivalentCreate extends PureComponent {
  componentDidMount() {
    const {
      dispatch,
      user: {
        user: {
          extInfo: { resId },
        },
      },
    } = this.props;
    const { id, taskId } = fromQs();
    dispatch({
      type: `${DOMAIN}/clean`,
    });
    // 审批人拒绝时查取详情
    id &&
      taskId &&
      dispatch({
        type: `${DOMAIN}/query`,
        payload: {
          id,
        },
      });
    // 申请人，接包人为当前登录人，申请日期为当前日期
    !id &&
      dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: {
          receiverResId: resId,
        },
      }) &&
      dispatch({
        type: `${DOMAIN}/queryCapasetLevel`,
        payload: {
          resId,
        },
      }).then(res => {
        if (Object.keys(res).length !== 0) {
          this.handleChangeJobType1(res.jobType1, false);
          this.handleChangeJobType2(res.jobType2, false);
        }
      });
  }

  // 工种 -> 工种子类
  handleChangeJobType1 = (value, flag) => {
    const { dispatch, form, formData } = this.props;
    // const { expenseBuId, receiverBuId, receiverResId, settlePriceFlag, buSettlePrice } = formData;
    // const params = {
    //   jobType1: value,
    //   expenseBuId,
    //   receiverBuId,
    //   receiverResId,
    //   settlePriceFlag,
    //   buSettlePrice,
    //   reasonType: formData.reasonType,
    //   reasonId: formData.reasonId,
    //   distDate: formData.distDate,
    // };
    // dispatch({
    //   type: `${DOMAIN}/queryTaskSettleByCondition`,
    //   payload: params,
    // });
    dispatch({
      type: `${DOMAIN}/updateJobType2`,
      payload: value,
    });
  };

  handleChangeJobType2 = (value, flag) => {
    const {
      dispatch,
      form,
      equivalentCreate: { formData },
    } = this.props;
    dispatch({
      type: `${DOMAIN}/updateCapasetLeveldList`,
      payload: {
        jobType1: formData.jobType1,
        jobType2: value,
      },
    });
  };

  handleSubmit = () => {
    const {
      user: {
        user: {
          extInfo: { resId },
        },
      },
      form: { validateFieldsAndScroll },
      dispatch,
      equivalentCreate: { formData },
    } = this.props;

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/submit`,
          payload: {
            ...formData,
            ...values,
            applyResId: resId,
            applyDate: moment().format('YYYY-MM-DD'),
          },
        });
      }
    });
  };

  render() {
    const {
      loading,
      dispatch,
      form: { getFieldDecorator, setFieldsValue },
      equivalentCreate: { formData, jobType2List, capasetLeveldList },
    } = this.props;
    const { mode, taskId } = fromQs();
    const submitBtn = loading.effects[`${DOMAIN}/submit`];
    const queryBtn = loading.effects[`${DOMAIN}/query`];
    return (
      <PageHeaderWrapper>
        {!taskId ? (
          <Card className="tw-card-rightLine">
            <Button
              className="tw-btn-primary"
              icon="save"
              size="large"
              onClick={e => this.handleSubmit()}
              disabled={submitBtn || queryBtn}
              loading={loading.effects[`${DOMAIN}/submit`]}
            >
              提交
            </Button>
            <Button
              className={classnames('separate', 'tw-btn-default')}
              icon="undo"
              size="large"
              onClick={() => {
                const { from } = fromQs();
                closeThenGoto(markAsTab(from));
              }}
            >
              {formatMessage({ id: `misc.rtn`, desc: '返回' })}
            </Button>
          </Card>
        ) : null}
        <Card className="tw-card-adjust" style={{ marginTop: '6px' }} bordered={false}>
          <FieldList
            layout="horizontal"
            getFieldDecorator={getFieldDecorator}
            col={2}
            legend="任务包基本信息"
          >
            <Field
              name="applyforEqva"
              label="申请当量数"
              decorator={{
                initialValue: formData.applyforEqva || undefined,
                rules: [
                  {
                    required: true,
                    message: '请输入申请当量数',
                  },
                ],
              }}
            >
              <InputNumber placeholder="请输入申请当量数" min={0} className="x-fill-100" />
            </Field>
            <FieldLine label="验收/计价方式" fieldCol={2}>
              <Field
                name="acceptMethod"
                decorator={{
                  initialValue: formData.acceptMethod,
                }}
                wrapperCol={{ span: 23, xxl: 24 }}
              >
                <UdcSelect code="TSK.ACCEPT_METHOD" placeholder="请选择验收方式" disabled />
              </Field>
              <Field
                name="pricingMethod"
                decorator={{
                  initialValue: formData.pricingMethod,
                }}
                wrapperCol={{ span: 24, xxl: 24 }}
              >
                <UdcSelect code="TSK:PRICING_METHOD" placeholder="请选择计价方式" disabled />
              </Field>
            </FieldLine>
            <Field
              name="disterResId"
              label="发包人"
              decorator={{
                initialValue: formData.disterResId || undefined,
                rules: [
                  {
                    required: true,
                    message: '请选择发包人',
                  },
                ],
              }}
              // labelCol={{ span: 8, xxl: 8 }}
            >
              <Selection.Columns
                key="disterResId"
                className="x-fill-100"
                source={() => selectUsersWithBu()}
                columns={particularColumns}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                dropdownMatchSelectWidth={false}
                showSearch
                onColumnsChange={value => {}}
                placeholder="请选择发包人"
              />
            </Field>
            <Field
              name="receiverResId"
              label="接包人"
              decorator={{
                initialValue: formData.receiverResId || undefined,
                rules: [
                  {
                    required: false,
                    message: '请选择接包人',
                  },
                ],
              }}
              // labelCol={{ span: 8, xxl: 8 }}
            >
              <Selection.Columns
                key="receiverResId"
                className="x-fill-100"
                source={() => selectUsersWithBu()}
                columns={particularColumns}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                dropdownMatchSelectWidth={false}
                showSearch
                onColumnsChange={value => {}}
                placeholder="请选择接包人"
                disabled
              />
            </Field>
            <FieldLine label="复合能力" fieldCol={2} required>
              <Field
                name="jobType1"
                decorator={{
                  initialValue: formData.jobType1,
                  rules: [{ required: true, message: '请选择工种' }],
                }}
                wrapperCol={{ span: 23 }}
              >
                <UdcSelect
                  code="COM.JOB_TYPE1"
                  placeholder="请选择工种"
                  onChange={value => {
                    setFieldsValue({
                      jobType2: null,
                      capasetLevelId: null,
                    });
                    this.handleChangeJobType1(value, true);
                  }}
                />
              </Field>
              <Field
                name="jobType2"
                decorator={{
                  initialValue: formData.jobType2,
                  rules: [{ required: true, message: '请选择工种子类' }],
                }}
                wrapperCol={{ span: 23 }}
              >
                <AsyncSelect
                  source={jobType2List}
                  placeholder="请选择工种子类"
                  onChange={value => {
                    setFieldsValue({
                      capasetLevelId: null,
                    });
                    this.handleChangeJobType2(value, true);
                  }}
                />
              </Field>
              <Field
                name="capasetLevelId"
                decorator={{
                  initialValue: formData.capasetLevelId,
                  rules: [{ required: true, message: '请选择级别' }],
                }}
                wrapperCol={{ span: 24 }}
              >
                <AsyncSelect
                  source={capasetLeveldList}
                  placeholder="请选择级别"
                  // onChange={this.handleChangeCapasetLeveldId}
                />
              </Field>
            </FieldLine>
            <Field label="" presentational>
              &nbsp;
            </Field>
            <Field
              name="reasonType"
              label="事由类型"
              decorator={{
                initialValue: formData.reasonType || undefined,
                rules: [
                  {
                    required: true,
                    message: '请选择事由类型',
                  },
                ],
              }}
              // labelCol={{ span: 8, xxl: 8 }}
            >
              <Selection.UDC code="TSK:REASON_TYPE" placeholder="请选择事由类型" />
            </Field>
            <Field
              name="reasonDescribe"
              label="事由描述"
              decorator={{
                initialValue: formData.reasonDescribe || undefined,
                rules: [
                  {
                    required: false,
                    message: '请输入事由描述',
                  },
                ],
              }}
              // labelCol={{ span: 8, xxl: 8 }}
            >
              <Input placeholder="请输入事由描述" />
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
                        callback('计划开始日期应该早于计划结束日期');
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
                        callback('计划结束日期应该晚于计划开始日期');
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
            <Field
              name="remark"
              label="备注"
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
              decorator={{
                initialValue: formData.remark || undefined,
              }}
            >
              <Input.TextArea rows={3} placeholder="请输入备注" />
            </Field>
            <Field
              name="applyResId"
              label="申请人"
              decorator={{
                initialValue: formData.applyResId || undefined,
              }}
            >
              <Selection.Columns
                key="applyResId"
                className="x-fill-100"
                source={() => selectUsersWithBu()}
                columns={particularColumns}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                dropdownMatchSelectWidth={false}
                showSearch
                onColumnsChange={value => {}}
                placeholder="系统生成"
                disabled
              />
            </Field>
            <Field
              name="applyDate"
              label="申请日期"
              decorator={{
                initialValue: formData.applyDate || undefined,
              }}
            >
              <Input placeholder="系统生成" disabled />
            </Field>
          </FieldList>
        </Card>
        {/* {settlementVisible ? (
          <SettlementModal visible={settlementVisible} closeModal={this.closeModal} />
        ) : null} */}
      </PageHeaderWrapper>
    );
  }
}

export default EquivalentCreate;
