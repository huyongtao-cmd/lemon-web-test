import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Form, Card, DatePicker, Input, InputNumber } from 'antd';
import { formatMessage } from 'umi/locale';
import { isEmpty } from 'ramda';
import moment from 'moment';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import SelectWithCols from '@/components/common/SelectWithCols';
import AsyncSelect from '@/components/common/AsyncSelect';
import FieldList from '@/components/layout/FieldList';
import Loading from '@/components/core/DataLoading';
import Title from '@/components/layout/Title';
import { fromQs } from '@/utils/stringUtils';
import { UdcSelect } from '@/pages/gen/field';
import { mountToTab } from '@/layouts/routerControl';
import createMessage from '@/components/core/AlertMessage';

const { Field, FieldLine } = FieldList;
const DOMAIN = 'userTaskApply';

const SEL_COL = [
  // span为宽度。 合计不要超过24
  { dataIndex: 'code', title: '编号', span: 6 },
  { dataIndex: 'name', title: '名称', span: 14 },
];

@connect(({ loading, userTaskApply, dispatch }) => ({
  loading,
  ...userTaskApply,
  dispatch,
}))
@Form.create({
  // form只能取值一次，新增保存之后需要刷新页面，否则changedFields为{}, 会报错
  onFieldsChange(props, changedFields) {
    if (isEmpty(changedFields)) return;
    const { name, value } = Object.values(changedFields)[0];
    if (value instanceof Object && name !== 'planStartDate' && name !== 'planEndDate') {
      const key = name.split('Id')[0];
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { [key + 'Id']: value.id, [key + 'Name']: value.name },
      });
    } else if (name === 'planStartDate' || name === 'planEndDate') {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { [name]: moment(value).toISOString() },
      });
    } else {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { [name]: value },
      });
    }
  },
})
@mountToTab()
class UserDashboard extends PureComponent {
  state = {};

  componentDidMount() {
    const { dispatch } = this.props;
    const param = fromQs();
    dispatch({ type: `${DOMAIN}/clean` });

    if (param.mode && param.mode !== 'create') {
      dispatch({
        type: `${DOMAIN}/query`,
        payload: param,
      });
    } else {
      dispatch({
        type: `${DOMAIN}/queryCapasetDefault`,
      });
    }

    // 资源列表
    dispatch({
      type: `${DOMAIN}/queryResList`,
    });
  }

  // 工种 -> 工种子类
  handleChangeJobType1 = value => {
    const { dispatch, form } = this.props;
    dispatch({
      type: `${DOMAIN}/updateJobType2`,
      payload: value,
    }).then(() => {
      form.setFieldsValue({
        jobType2: null,
        capabilitySet: null,
      });
    });
  };

  handleChangeJobType2 = value => {
    const { dispatch, form, formData } = this.props;
    dispatch({
      type: `${DOMAIN}/updateCapasetLeveldList`,
      payload: {
        jobType1: formData.jobType1,
        jobType2: value,
      },
    }).then(() => {
      form.setFieldsValue({
        capabilitySet: null,
      });
    });
  };

  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      formData,
      dispatch,
      capasetLeveldList,
    } = this.props;
    const param = fromQs();
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/save`,
          payload: { formData, apprId: param.apprId },
        });
      }
      //  // 从formData中取值
      //  const {
      //    jobType1,
      //    jobType2,
      //    capasetLevelId,
      //  }=formData;
      // // 判断jobType1，jobType2 不能为空，capasetLevelId 有值时 不能为空
      //  if(jobType1 == null){
      //    createMessage({ type: 'warn', description: '复合能力工种不能为空!!!' });
      //    return;
      //  }
      //
      //  if(jobType2 == null){
      //    createMessage({ type: 'warn', description: '复合能力工种子类不能为空!!!' });
      //    return;
      //  }
      //
      //  if(capasetLeveldList.length && !capasetLevelId){
      //    createMessage({ type: 'warn', description: '复合能力级别不能为空!!!' });
      //    return;
      //  }
    });
  };

  render() {
    const {
      loading,
      dispatch,
      formData,
      jobType2List,
      capasetLeveldList,
      resSource,
      resList,
      form,
      form: { getFieldDecorator },
    } = this.props;
    const disabledBtn = !!loading.effects[`${DOMAIN}/query`] || !!loading.effects[`${DOMAIN}/save`];

    return (
      <PageHeaderWrapper title="任务包申请">
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            icon="save"
            size="large"
            disabled={disabledBtn}
            onClick={this.handleSave}
          >
            {formatMessage({ id: `misc.submit`, desc: '提交' })}
          </Button>
        </Card>

        <Card
          className="tw-card-adjust"
          title={
            <Title
              icon="profile"
              id="app.settings.menuMap.basicMessage"
              defaultMessage="基本信息"
            />
          }
          bordered={false}
        >
          {disabledBtn ? (
            <Loading />
          ) : (
            <FieldList
              layout="horizontal"
              legend={formatMessage({ id: `app.settings.menuMap.basicMessage`, desc: '基本信息' })}
              getFieldDecorator={getFieldDecorator}
              col={2}
            >
              <Field
                name="disterResId"
                label="发包人"
                decorator={{
                  initialValue: formData.disterResId
                    ? { code: formData.disterResId, name: formData.disterResName }
                    : void 0,
                  rules: [
                    {
                      required: true,
                      message: '请选择发包人',
                    },
                  ],
                }}
              >
                <SelectWithCols
                  labelKey="name"
                  valueKey="code"
                  className="x-fill-100"
                  columns={SEL_COL}
                  dataSource={resSource}
                  onChange={() => {}}
                  selectProps={{
                    showSearch: true,
                    onSearch: value => {
                      dispatch({
                        type: `${DOMAIN}/updateState`,
                        payload: {
                          resSource: resList.filter(
                            d =>
                              d.code.indexOf(value) > -1 ||
                              d.name.toLowerCase().indexOf(value.toLowerCase()) > -1
                          ),
                        },
                      });
                    },
                    allowClear: true,
                  }}
                />
              </Field>
              <Field
                name="receiverResId"
                label="接包人"
                decorator={{
                  initialValue: formData.receiverResId
                    ? { code: formData.receiverResId, name: formData.receiverResName }
                    : void 0,
                  rules: [
                    {
                      required: true,
                      message: '请选择接包人',
                    },
                  ],
                }}
              >
                <SelectWithCols
                  labelKey="name"
                  valueKey="code"
                  className="x-fill-100"
                  columns={SEL_COL}
                  dataSource={resSource}
                  onChange={() => {}}
                  selectProps={{
                    disabled: true,
                    showSearch: true,
                    onSearch: value => {
                      dispatch({
                        type: `${DOMAIN}/updateState`,
                        payload: {
                          resSource: resList.filter(
                            d =>
                              d.code.indexOf(value) > -1 ||
                              d.name.toLowerCase().indexOf(value.toLowerCase()) > -1
                          ),
                        },
                      });
                    },
                    allowClear: true,
                  }}
                />
              </Field>

              <Field
                name="taskName"
                label="任务包名称"
                decorator={{
                  initialValue: formData.taskName,
                  rules: [{ required: true, message: '请输入任务包名称' }],
                }}
              >
                <Input maxLength={35} placeholder="请输入任务包名称" />
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
                    onChange={this.handleChangeJobType1}
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
                    onChange={this.handleChangeJobType2}
                  />
                </Field>
                <Field
                  name="capasetLevelId"
                  decorator={{
                    initialValue: formData.capasetLevelId,
                    rules: [{ required: true.length, message: '请选择级别' }],
                  }}
                  wrapperCol={{ span: 24 }}
                >
                  <AsyncSelect source={capasetLeveldList} placeholder="请选择级别" />
                </Field>
              </FieldLine>
              <Field
                name="reasonType"
                label="事由类型"
                decorator={{
                  initialValue: formData.reasonType,
                  rules: [{ required: true, message: '请选择事由类型' }],
                }}
              >
                <UdcSelect code="TSK.REASON_TYPE" placeholder="请选择事由类型" />
              </Field>

              <Field
                name="reasonDesc"
                label="事由描述"
                decorator={{
                  initialValue: formData.reasonDesc,
                  rules: [{ required: false, message: '请输入事由描述' }],
                }}
              >
                <Input maxLength={35} placeholder="请输入事由描述" />
              </Field>

              <Field
                name="acceptMethod"
                label="验收方式"
                decorator={{
                  initialValue: formData.acceptMethod,
                  rules: [{ required: true, message: '请选择验收方式' }],
                }}
              >
                <UdcSelect
                  code="TSK.ACCEPT_METHOD"
                  placeholder="请选择验收方式"
                  onChange={value => {
                    if (value === '04') {
                      form.setFieldsValue({ pricingMethod: 'SINGLE' });
                    }
                  }}
                />
              </Field>
              <Field
                name="pricingMethod"
                label="计价方式"
                decorator={{
                  initialValue: formData.pricingMethod,
                  rules: [{ required: false, message: '请选择计价方式' }],
                }}
              >
                <UdcSelect
                  disabled={formData.acceptMethod === '04'}
                  code="TSK.PRICING_METHOD"
                  placeholder="请选择计价方式"
                />
              </Field>
              <Field
                name="eqvaQty"
                label="任务当量"
                decorator={{
                  initialValue: formData.eqvaQty,
                  rules: [
                    {
                      required: true,
                      message: '请输入任务当量',
                    },
                  ],
                }}
              >
                <InputNumber
                  className="x-fill-100"
                  placeholder="请输入任务当量"
                  precision={2}
                  min={0}
                  max={999999999999}
                />
              </Field>
              <Field
                name="eqvaRatio"
                label="当量系数"
                decorator={{
                  initialValue: formData.eqvaRatio,
                  rules: [
                    {
                      required: formData.acceptMethod === '04',
                      message: '请输入当量系数',
                    },
                  ],
                }}
              >
                <InputNumber
                  className="x-fill-100"
                  placeholder="请输入当量系数"
                  precision={1}
                  min={0}
                  max={999999999999}
                />
              </Field>

              <Field
                name="planStartDate"
                label="预计开始日期"
                decorator={{
                  initialValue: formData.planStartDate ? moment(formData.planStartDate) : null,
                  rules: [
                    { required: true, message: '请选择预计开始日期' },
                    {
                      validator: (rule, value, callback) => {
                        if (
                          value &&
                          formData.planEndDate &&
                          moment(formData.planEndDate).isBefore(value)
                        ) {
                          callback('预计开始日期应该早于结束日期');
                        }
                        // Note: 必须总是返回一个 callback，否则 validateFieldsAndScroll 无法响应
                        callback();
                      },
                    },
                  ],
                }}
              >
                <DatePicker placeholder="请选择预计开始日期" className="x-fill-100" />
              </Field>
              <Field
                name="planEndDate"
                label="预计结束日期"
                decorator={{
                  initialValue: formData.planEndDate ? moment(formData.planEndDate) : null,
                  rules: [
                    { required: true, message: '请选择预计结束日期' },
                    {
                      validator: (rule, value, callback) => {
                        if (
                          value &&
                          formData.planStartDate &&
                          moment(value).isBefore(formData.planStartDate)
                        ) {
                          callback('预计结束日期应该晚于开始日期');
                        }
                        // Note: 必须总是返回一个 callback，否则 validateFieldsAndScroll 无法响应
                        callback();
                      },
                    },
                  ],
                }}
              >
                <DatePicker placeholder="请选择预计结束日期" className="x-fill-100" />
              </Field>

              <Field
                name="remark"
                label="请输入备注"
                decorator={{
                  initialValue: formData.remark,
                  rules: [{ required: false }],
                }}
                fieldCol={1}
                labelCol={{ span: 4, xxl: 3 }}
                wrapperCol={{ span: 19, xxl: 20 }}
              >
                <Input.TextArea placeholder="请输入备注" rows={3} maxLength={400} />
              </Field>

              <Field
                name="createUserName"
                label="申请人"
                decorator={{
                  initialValue: formData.createUserName,
                  rules: [{ required: false, message: '请输入申请人' }],
                }}
              >
                <Input disabled placeholder="系统生成" />
              </Field>
              <Field
                name="createTime"
                label="申请日期"
                decorator={{
                  initialValue: formData.createTime ? moment(formData.createTime) : null,
                  rules: [{ required: false, message: '请选择申请日期' }],
                }}
              >
                <DatePicker disabled placeholder="系统生成" className="x-fill-100" />
              </Field>
            </FieldList>
          )}
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default UserDashboard;
