import React, { PureComponent } from 'react';
import classnames from 'classnames';
import moment from 'moment';
import { Button, Form, Card, Input, InputNumber, DatePicker } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { isEmpty } from 'ramda';
import AsyncSelect from '@/components/common/AsyncSelect';
import FieldList from '@/components/layout/FieldList';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import Title from '@/components/layout/Title';
import { FileManagerEnhance } from '@/pages/gen/field';
import { selectUsers } from '@/services/sys/user';
import { closeThenGoto, mountToTab } from '@/layouts/routerControl';

const { Field, FieldLine } = FieldList;
const { MonthPicker } = DatePicker;
const DOMAIN = 'platComputerApplyCreate';

@connect(({ loading, platComputerApplyCreate, dispatch }) => ({
  loading,
  ...platComputerApplyCreate,
  dispatch,
}))
@Form.create({
  // form只能取值一次，新增保存之后需要刷新页面，否则changedFields为{}, 会报错
  onFieldsChange(props, changedFields) {
    if (isEmpty(changedFields)) return;
    const { name, value } = Object.values(changedFields)[0];
    props.dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: { [name]: value },
    });
  },
})
@mountToTab()
class ComputerApplyCreate extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/initCreate` });
  }

  handleSave = isSubmit => {
    const {
      formData,
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/save`,
          payload: { formData, isSubmit },
        });
      }
    });
  };

  // 选择申请人带出参数
  handleApplyResId = value => {
    const { dispatch } = this.props;
    if (value) {
      dispatch({
        type: `${DOMAIN}/changeApplyResId`,
        payload: value,
      });
    } else {
      dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: {
          applyResId: null,
          baseCityName: null,
          resBuName: null,
          resBuId: null,
          monthlyAmt: null,
        },
      });
    }
  };

  render() {
    const {
      loading,
      formData,
      form: { getFieldDecorator },
    } = this.props;
    const disabledBtn =
      !!loading.effects[`${DOMAIN}/query`] ||
      !!loading.effects[`${DOMAIN}/save`] ||
      !!loading.effects[`${DOMAIN}/submit`] ||
      !!loading.effects[`${DOMAIN}/clean`];

    return (
      <PageHeaderWrapper title="自购电脑申请新增">
        <Card className="tw-card-rightLine">
          {/* <Button
            className="tw-btn-primary"
            icon="save"
            size="large"
            disabled={disabledBtn}
            onClick={() => this.handleSave(false)}
          >
            {formatMessage({ id: `misc.save`, desc: '保存' })}
          </Button> */}
          <Button
            className="tw-btn-primary"
            icon="save"
            size="large"
            disabled={disabledBtn}
            onClick={() => this.handleSave(true)}
          >
            提交
          </Button>
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => closeThenGoto('/user/flow/panel')}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>

        <Card
          className="tw-card-adjust"
          title={<Title icon="profile" id="app.settings.menuMap.basic" defaultMessage="基础设置" />}
          bordered={false}
        >
          <FieldList layout="horizontal" legend="" getFieldDecorator={getFieldDecorator} col={2}>
            <FieldLine label="申请人/BASE地" required>
              <Field
                name="applyResId"
                decorator={{
                  initialValue: formData.applyResId,
                  rules: [{ required: true, message: '请选择申请人' }],
                }}
                wrapperCol={{ span: 23, xxl: 23 }}
              >
                <AsyncSelect
                  source={() => selectUsers().then(resp => resp.response)}
                  placeholder="请选择报销申请人"
                  showSearch
                  filterOption={(input, option) =>
                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  onChange={this.handleApplyResId}
                />
              </Field>
              <Field
                name="baseCityName"
                decorator={{
                  initialValue: formData.baseCityName,
                }}
                wrapperCol={{ span: 23, xxl: 23 }}
              >
                <Input disabled placeholder="申请人带出" />
              </Field>
            </FieldLine>
            <Field
              name="resBuName"
              label="申请人所属BU"
              decorator={{
                initialValue: formData.resBuName,
                // rules: [{ required: true, message: '申请人带出申请人所属BU' }],
              }}
            >
              <Input disabled placeholder="申请人带出" />
            </Field>
            <Field
              name="deviceDesc"
              label="品牌型号及颜色"
              decorator={{
                initialValue: formData.deviceDesc,
                rules: [{ required: true, message: '请输入品牌型号及颜色' }],
              }}
            >
              <Input maxLength={35} placeholder="请输入品牌型号及颜色" />
            </Field>
            <Field
              name="billNo"
              label="票据号"
              decorator={{
                initialValue: formData.billNo,
                rules: [{ required: true, message: '请输入票据号' }],
              }}
            >
              <Input maxLength={35} placeholder="请输入票据号" />
            </Field>
            <Field
              name="memSize"
              label="内存"
              decorator={{
                initialValue: formData.memSize,
                rules: [{ required: true, message: '请输入内存' }],
              }}
            >
              <Input maxLength={35} placeholder="请输入内存" />
            </Field>
            <Field
              name="hdSize"
              label="硬盘"
              decorator={{
                initialValue: formData.hdSize,
                rules: [{ required: true, message: '请输入硬盘' }],
              }}
            >
              <Input maxLength={35} placeholder="请输入硬盘" />
            </Field>
            <Field
              name="devicePrice"
              label="购置金额"
              decorator={{
                initialValue: formData.devicePrice,
                rules: [{ required: true, message: '请输入购置金额' }],
              }}
            >
              <InputNumber
                className="x-fill-100"
                placeholder="请输入购置金额"
                precision={0}
                min={0}
                max={999999999999}
              />
            </Field>
            <Field
              name="buyDate"
              label="购置日期"
              decorator={{
                initialValue: formData.buyDate,
                rules: [{ required: true, message: '请选择购置日期' }],
              }}
            >
              <DatePicker className="x-fill-100" placeholder="请选择购置日期" />
            </Field>
            <Field
              name="startPeriodId"
              label="补贴起始月份"
              decorator={{
                initialValue: formData.startPeriodId,
                rules: [{ required: true, message: '请选择补贴起始月份' }],
              }}
            >
              <MonthPicker
                format="YYYY-MM"
                mode="month"
                className="x-fill-100"
                placeholder="请选择补贴起始月份"
              />
            </Field>
            <Field
              name="monthlyAmt"
              label="补贴额度"
              decorator={{
                initialValue: formData.monthlyAmt,
                rules: [{ required: false, message: '请输入补贴额度' }],
              }}
            >
              <InputNumber
                precision={0}
                min={0}
                max={999999999999}
                placeholder="申请人带出"
                className="x-fill-100"
                disabled
              />
            </Field>

            <Field name="attache" label="附件">
              <FileManagerEnhance
                api="/api/op/v1/device/sfs/token"
                dataKey={formData.id}
                listType="text"
                disabled={false}
              />
            </Field>
            <Field
              name="applyDesc"
              label="备注"
              decorator={{
                initialValue: formData.applyDesc,
                rules: [{ required: false, message: '请输入备注' }],
              }}
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
            >
              <Input.TextArea rows={3} maxLength={400} placeholder="请输入备注" />
            </Field>
          </FieldList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default ComputerApplyCreate;
