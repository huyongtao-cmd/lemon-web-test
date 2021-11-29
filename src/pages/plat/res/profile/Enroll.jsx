import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import classnames from 'classnames';
import { isEmpty } from 'ramda';
import { Button, Card, DatePicker, Form, Input, Radio, TimePicker, InputNumber } from 'antd';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import AsyncSelect from '@/components/common/AsyncSelect';
import SelectWithCols from '@/components/common/SelectWithCols';
import FieldList from '@/components/layout/FieldList';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';
import { UdcSelect } from '@/pages/gen/field';
import { selectInternalOus } from '@/services/gen/list';
// import { findBuResRoleSelect } from '@/services/org/bu/component/buResInfo';

const { Field, FieldLine } = FieldList;
const RadioGroup = Radio.Group;
const subjCol = [
  { dataIndex: 'code', title: '编号', span: 6 },
  { dataIndex: 'name', title: '名称', span: 14 },
];

const DOMAIN = 'platResEnroll';

@connect(({ loading, platResEnroll, dispatch }) => ({
  loading,
  platResEnroll,
  dispatch,
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    if (isEmpty(changedFields)) return;
    const { name, value } = Object.values(changedFields)[0];
    if (value) {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { [name]: value },
      });
    }
  },
})
@mountToTab()
class ResEnroll extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { id } = fromQs();
    dispatch({ type: `${DOMAIN}/query`, payload: { resId: id } });
    dispatch({ type: `${DOMAIN}/res` });
    dispatch({ type: `${DOMAIN}/bu` });
  }

  // 资源类型一 -> 资源类型二
  handleChangeType1 = value => {
    const { dispatch, form } = this.props;
    dispatch({
      type: `${DOMAIN}/updateListType2`,
      payload: value,
    }).then(() => {
      dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: {
          resType2: null,
          resType2Name: null,
        },
      });
      form.setFieldsValue({
        resType2: null,
        resType2Name: null,
      });
    });
  };

  handleBaseBuChange = value => {
    const { dispatch, form } = this.props;
    dispatch({
      type: `${DOMAIN}/role`,
      payload: value.id,
    }).then(() => {
      dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: {
          roleCode: [],
        },
      });
      form.setFieldsValue({
        roleCode: [],
      });
    });
  };

  handleSubmit = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/submit`,
        });
      }
    });
  };

  render() {
    const {
      loading,
      dispatch,
      form: { getFieldDecorator },
      platResEnroll: {
        formData,
        type2Data,
        resData,
        resDataSource,
        baseBuData,
        baseBuDataSource,
        roleData,
      },
    } = this.props;
    // loading完成之前将按钮设为禁用
    const disabledBtn = loading.effects[`${DOMAIN}/query`];

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            icon="save"
            size="large"
            onClick={this.handleSubmit}
            disabled={disabledBtn}
          >
            {formatMessage({ id: `misc.submit`, desc: '提交' })}
          </Button>
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => closeThenGoto('/hr/res/profile/list')}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>

        <Card
          className="tw-card-adjust"
          title={
            <Title icon="profile" id="ui.menu.plat.res.resEnroll" defaultMessage="资源入职申请" />
          }
          bordered={false}
        >
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="personName"
              label="姓名"
              decorator={{
                initialValue: formData.personName,
              }}
            >
              <Input placeholder="请输入姓名" disabled />
            </Field>
            <Field
              name="foreignName"
              label="英文名"
              decorator={{
                initialValue: formData.foreignName,
                rules: [
                  {
                    required: true,
                    message: '请输入英文名',
                  },
                ],
              }}
            >
              <Input placeholder="请输入英文名" />
            </Field>
            <Field
              name="gender"
              label="性别"
              decorator={{
                initialValue: formData.gender,
                rules: [
                  {
                    required: true,
                    message: '请选择性别',
                  },
                ],
              }}
            >
              <UdcSelect code="COM.GENDER" placeholder="请选择性别" />
            </Field>
            <Field
              name="birthday"
              label="出生日期"
              decorator={{
                initialValue: formData.birthday ? moment(formData.birthday) : null,
                rules: [{ required: true, message: '请选择出生日期' }],
              }}
            >
              <DatePicker className="x-fill-100" />
            </Field>

            <Field
              name="idType"
              label="证件类型"
              decorator={{
                initialValue: formData.idType,
                rules: [
                  {
                    required: true,
                    message: '请选择证件类型',
                  },
                ],
              }}
            >
              <UdcSelect code="COM.ID_TYPE" placeholder="请选择证件类型" />
            </Field>
            <Field
              name="idNo"
              label="证件号码"
              decorator={{
                initialValue: formData.idNo,
                rules: [
                  {
                    required: true,
                    message: '请输入证件号码',
                  },
                ],
              }}
            >
              <Input placeholder="请输入证件号码" />
            </Field>

            <Field
              name="resType1"
              label="资源类型一"
              decorator={{
                initialValue: formData.resType1,
                rules: [{ required: true, message: '请选择资源类型一' }],
              }}
            >
              <UdcSelect
                code="RES.RES_TYPE1"
                placeholder="请选择资源类型一"
                onChange={this.handleChangeType1}
              />
            </Field>
            <Field
              name="resType2"
              label="资源类型二"
              decorator={{
                initialValue: formData.resType2,
                rules: [
                  { required: formData.resType1 === 'EXTERNAL_RES', message: '请选择资源类型二' },
                ],
              }}
            >
              <AsyncSelect source={type2Data} placeholder="请选择资源类型二" />
            </Field>

            <Field
              name="enrollDate"
              label="预定入职日期"
              decorator={{
                initialValue: formData.enrollDate ? moment(formData.enrollDate) : null,
                rules: [{ required: true, message: '请选择预定入职日期' }],
              }}
            >
              <DatePicker className="x-fill-100" />
            </Field>

            <Field
              name="ouId"
              label="所属公司"
              decorator={{
                initialValue: formData.ouId && formData.ouId,
                rules: [{ required: true, message: '请选择所属公司' }],
              }}
            >
              <AsyncSelect
                source={() => selectInternalOus().then(resp => resp.response)}
                placeholder="请选择所属公司"
              />
            </Field>

            <Field
              name="baseBuObj"
              label="BaseBU"
              decorator={{
                initialValue: !isEmpty(formData.baseBuObj)
                  ? formData.baseBuObj
                  : {
                      code: formData.baseBuId,
                      name: formData.baseBuName,
                    },
                rules: [{ required: true, message: '请选择baseBu' }],
              }}
            >
              <SelectWithCols
                labelKey="name"
                placeholder="请选择baseBu"
                columns={subjCol}
                dataSource={baseBuDataSource}
                selectProps={{
                  showSearch: true,
                  onSearch: value => {
                    dispatch({
                      type: `${DOMAIN}/updateState`,
                      payload: {
                        baseBuDataSource: baseBuData.filter(
                          d =>
                            d.code.indexOf(value) > -1 ||
                            d.name.toLowerCase().indexOf(value.toLowerCase()) > -1
                        ),
                      },
                    });
                  },
                  allowClear: true,
                  style: { width: '100%' },
                }}
                onChange={this.handleBaseBuChange}
              />
            </Field>

            <Field
              name="baseCity"
              label="Base地"
              decorator={{
                initialValue: formData.baseCity && formData.baseCity,
                rules: [{ required: true, message: '请选择Base地' }],
              }}
            >
              <UdcSelect code="COM.CITY" placeholder="请选择Base地" />
            </Field>

            <Field
              name="coopType"
              label="合作方式"
              decorator={{
                initialValue: formData.coopType,
                rules: [
                  {
                    required: true,
                    message: '请选择合作方式',
                  },
                ],
              }}
            >
              <UdcSelect code="COM.COOPERATION_MODE" placeholder="请选择合作方式" />
            </Field>

            <Field
              name="pResData"
              label="上级资源"
              decorator={{
                initialValue: !isEmpty(formData.pResData)
                  ? formData.pResData
                  : {
                      code: formData.presId,
                      name: formData.presName,
                    },
                rules: [
                  {
                    required: true,
                    message: '请选择上级资源',
                  },
                ],
              }}
            >
              <SelectWithCols
                labelKey="name"
                valueKey="code"
                placeholder="请选择上级资源"
                columns={subjCol}
                dataSource={resDataSource}
                selectProps={{
                  showSearch: true,
                  onSearch: value => {
                    dispatch({
                      type: `${DOMAIN}/updateState`,
                      payload: {
                        resDataSource: resData.filter(
                          d =>
                            d.code.indexOf(value) > -1 ||
                            d.name.toLowerCase().indexOf(value.toLowerCase()) > -1
                        ),
                      },
                    });
                  },
                  allowClear: true,
                  style: { width: '100%' },
                }}
              />
            </Field>

            <Field
              name="jobGrade"
              label="职级"
              decorator={{
                initialValue: formData.jobGrade,
                rules: [
                  {
                    required: true,
                    message: '请输入职级',
                  },
                ],
              }}
            >
              <Input placeholder="请输入职级" />
            </Field>

            <Field
              name="eqvaRatio"
              label="当量系数"
              decorator={{
                initialValue: formData.eqvaRatio,
                rules: [
                  {
                    required: true,
                    message: '请输入数值',
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
              name="empNo"
              label="工号"
              decorator={{
                initialValue: formData.empNo,
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
              name="accessLevel"
              label="安全级别"
              decorator={{
                initialValue: formData.accessLevel,
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
              name="compfeeQuota"
              label="电脑额度"
              decorator={{
                initialValue: formData.compfeeQuota,
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
              name="telfeeQuota"
              label="话费额度"
              decorator={{
                initialValue: formData.telfeeQuota,
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
              name="salaryMethod"
              label="发薪方式"
              decorator={{
                initialValue: formData.salaryMethod,
              }}
            >
              <UdcSelect code="COM.SALARY_METHOD" placeholder="请选择发薪方式" />
            </Field>

            <Field
              name="salaryPeriod"
              label="发薪周期"
              decorator={{
                initialValue: formData.salaryPeriod,
              }}
            >
              <UdcSelect code="COM.SALARY_CYCLE" placeholder="请选择发薪周期" />
            </Field>

            <Field
              name="roleCode"
              label="BU角色"
              decorator={{
                initialValue: formData.roleCode,
              }}
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
            >
              <AsyncSelect
                source={roleData}
                placeholder="请选择BU角色"
                showSearch
                filterOption={(input, option) =>
                  option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                mode="multiple"
              />
            </Field>

            <Field
              name="serviceType"
              label="服务方式"
              decorator={{
                initialValue: formData.serviceType,
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
                    formData.serviceClockFrom && moment(formData.serviceClockFrom, 'HH:mm'),
                  rules: [{ required: false, message: '请选择服务时间' }],
                }}
                wrapperCol={{ span: 23, xxl: 23 }}
              >
                <TimePicker className="x-fill-100" format="HH:mm" />
              </Field>
              <Field
                name="serviceClockTo"
                decorator={{
                  initialValue: formData.serviceClockTo && moment(formData.serviceClockTo, 'HH:mm'),
                  rules: [{ required: false, message: '请选择服务时间' }],
                }}
                wrapperCol={{ span: 23, offset: 1, xxl: 23 }}
              >
                <TimePicker className="x-fill-100" format="HH:mm" />
              </Field>
            </FieldLine>

            <Field
              name="busitripFlag"
              label="能否出差"
              decorator={{
                initialValue: formData.busitripFlag,
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
                  formData.busitripFlag = e.target.value;
                }}
              >
                <Radio value={1}>是</Radio>
                <Radio value={0}>否</Radio>
              </RadioGroup>
            </Field>
          </FieldList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default ResEnroll;
