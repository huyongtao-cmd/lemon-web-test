import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { Button, Card, Form, Input, Divider } from 'antd';
import { fromQs } from '@/utils/stringUtils';
import AsyncSelect from '@/components/common/AsyncSelect';
import FieldList from '@/components/layout/FieldList';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';
import { UdcSelect } from '@/pages/gen/field';

const { Field, FieldLine } = FieldList;

const DOMAIN = 'userCenterInfo';

@connect(({ loading, userCenterInfo, dispatch }) => ({
  loading,
  userCenterInfo,
  dispatch,
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    const key = Object.keys(changedFields)[0];
    const value = Object.values(changedFields)[0];

    if (value) {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { key, value: value.value },
      });
    }
  },
})
class ResDetail extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const param = fromQs();
    if (param.mode && param.mode !== 'create') {
      dispatch({
        type: `${DOMAIN}/query`,
        payload: param,
      });
    }
  }

  // 保存按钮事件
  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/centerSave`,
        });
      }
    });
  };

  // 国家 -> 省
  handleChangeC1 = value => {
    // console.log('ready to dispatch handleChangeC1...');
    const { dispatch, form } = this.props;
    dispatch({
      type: `${DOMAIN}/updateListC2`,
      payload: value,
    }).then(() => {
      form.setFieldsValue({
        contactProvince: null,
        contactCity: null,
      });
    });
  };

  // 省 -> 市
  handleChangeC2 = value => {
    // console.log('ready to dispatch handleChangeC2...');
    const { dispatch, form } = this.props;
    dispatch({
      type: `${DOMAIN}/updateListC3`,
      payload: value,
    }).then(() => {
      form.setFieldsValue({
        contactCity: null,
      });
    });
  };

  render() {
    const {
      loading,
      userCenterInfo: { formData, c2Data, c3Data },
      form: { getFieldDecorator },
    } = this.props;
    // loading完成之前将按钮设为禁用
    const disabledBtn =
      loading.effects[`${DOMAIN}/query`] || loading.effects[`${DOMAIN}/centerSave`];

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            icon="save"
            size="large"
            disabled={disabledBtn}
            onClick={this.handleSave}
          >
            {formatMessage({ id: `misc.save`, desc: '保存' })}
          </Button>
          <Button
            className="separate"
            icon="undo"
            size="large"
            disabled={false}
            onClick={() => router.push('/user/center/info')}
          >
            <Title id="misc.rtn" defaultMessage="返回" />
          </Button>
        </Card>

        <Card
          className="tw-card-adjust"
          title={
            <Title icon="profile" id="ui.menu.user.center.infoEdit" defaultMessage="基本信息修改" />
          }
          bordered={false}
        >
          <FieldList
            layout="horizontal"
            legend="联系方式"
            getFieldDecorator={getFieldDecorator}
            col={2}
          >
            <Field
              name="mobile"
              label="移动电话"
              decorator={{
                initialValue: formData.mobile,
                rules: [
                  {
                    required: true,
                    message: '请输入移动电话',
                  },
                ],
              }}
            >
              <Input placeholder="请输入移动电话" />
            </Field>

            <Field
              name="telNo"
              label="固定电话"
              decorator={{
                initialValue: formData.telNo,
                rules: [
                  {
                    required: false,
                    message: '请输入固定电话',
                  },
                ],
              }}
            >
              <Input placeholder="请输入固定电话" />
            </Field>

            <Field
              name="personalEmail"
              label="个人邮箱"
              decorator={{
                initialValue: formData.personalEmail,
                rules: [
                  {
                    required: false,
                    message: '请输入个人邮箱',
                  },
                ],
              }}
            >
              <Input placeholder="请输入个人邮箱" />
            </Field>

            <FieldLine label="社交号码">
              <Field
                name="snsType"
                decorator={{
                  initialValue: formData.snsType,
                  rules: [{ required: false, message: '微信/QQ/微博等' }],
                }}
                wrapperCol={{ span: 23, xxl: 23 }}
              >
                <Input placeholder="微信/QQ/微博等" />
              </Field>
              <Field
                name="snsNo"
                decorator={{
                  initialValue: formData.snsNo,
                  rules: [{ required: false, message: '请输入社交号码' }],
                }}
                wrapperCol={{ span: 23, offset: 1, xxl: 23 }}
              >
                <Input placeholder="请输入社交号码" />
              </Field>
            </FieldLine>

            <FieldLine
              label="通讯地址"
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 20, xxl: 20 }}
            >
              <Field
                name="contactCountry"
                decorator={{
                  initialValue: formData.contactCountry,
                  rules: [{ required: false, message: '请选择国家' }],
                }}
                wrapperCol={{ span: 20, xxl: 23 }}
              >
                <UdcSelect
                  code="COM.COUNTRY"
                  placeholder="请选择国家"
                  onChange={this.handleChangeC1}
                />
              </Field>
              <Field
                name="contactProvince"
                decorator={{
                  initialValue: formData.contactProvince,
                  rules: [{ required: false, message: '请选择国家' }],
                }}
                wrapperCol={{ span: 20, xxl: 23 }}
              >
                <AsyncSelect
                  source={c2Data}
                  placeholder="请选择省"
                  onChange={this.handleChangeC2}
                />
              </Field>
              <Field
                name="contactCity"
                decorator={{
                  initialValue: formData.contactCity,
                  rules: [{ required: false, message: '请选择市' }],
                }}
                wrapperCol={{ span: 20, xxl: 23 }}
              >
                <AsyncSelect source={c3Data} placeholder="请选择市" />
              </Field>
            </FieldLine>

            <Field
              name="contactAddress"
              label="详细地址"
              decorator={{
                initialValue: formData.contactAddress,
                rules: [{ required: false }, { max: 400, message: '不超过400个字' }],
              }}
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
            >
              <Input.TextArea placeholder="请输入详细地址" autosize={{ minRows: 3, maxRows: 6 }} />
            </Field>
          </FieldList>
          <Divider dashed />
          <FieldList
            layout="horizontal"
            legend="紧急联系人"
            getFieldDecorator={getFieldDecorator}
            col={2}
          >
            <Field
              name="emContactName"
              label="姓名"
              decorator={{
                initialValue: formData.emContactName,
                rules: [
                  {
                    required: false,
                    message: '请输入姓名',
                  },
                ],
              }}
            >
              <Input placeholder="请输入姓名" />
            </Field>

            <Field
              name="emContactMobile"
              label="移动电话"
              decorator={{
                initialValue: formData.emContactMobile,
                rules: [
                  {
                    required: false,
                    message: '请输入移动电话',
                  },
                ],
              }}
            >
              <Input placeholder="请输入移动电话" />
            </Field>

            <Field
              name="emContactTel"
              label="固定电话"
              decorator={{
                initialValue: formData.emContactTel,
                rules: [
                  {
                    required: false,
                    message: '请输入固定电话',
                  },
                ],
              }}
            >
              <Input placeholder="请输入固定电话" />
            </Field>

            <Field
              name="emContactRelation"
              label="关系"
              decorator={{
                initialValue: formData.emContactRelation,
                rules: [
                  {
                    required: false,
                    message: '请输入关系',
                  },
                ],
              }}
            >
              <Input placeholder="请输入关系" />
            </Field>
          </FieldList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default ResDetail;
