import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Card, DatePicker, Input, Divider } from 'antd';
import AsyncSelect from '@/components/common/AsyncSelect';
import FieldList from '@/components/layout/FieldList';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { UdcSelect, FileManagerEnhance } from '@/pages/gen/field';
import { mountToTab } from '@/layouts/routerControl';

const { Field, FieldLine } = FieldList;

@connect(({ loading, userCenterInfoEdit, dispatch }) => ({
  loading,
  userCenterInfoEdit,
  dispatch,
}))
@mountToTab()
class CenterBasicInfo extends PureComponent {
  componentDidMount() {}

  // 国家 -> 省
  handleChangeC1 = value => {
    // console.log('ready to dispatch handleChangeC1...');
    const { dispatch, form, domain } = this.props;
    dispatch({
      type: `${domain}/updateListC2`,
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
    const { dispatch, form, domain } = this.props;
    dispatch({
      type: `${domain}/updateListC3`,
      payload: value,
    }).then(() => {
      form.setFieldsValue({
        contactCity: null,
      });
    });
  };

  // 资源类型一 -> 资源类型二
  handleChangeType1 = value => {
    // console.log('ready to dispatch handleChangeType1...');
    const { dispatch, form, domain } = this.props;
    dispatch({
      type: `${domain}/updateListType2`,
      payload: value,
    }).then(() => {
      form.setFieldsValue({
        resType2: null,
      });
    });
  };

  // 出生日期不能选今天之后的日期
  disabledDate = current => !(current && current < moment().endOf('day'));

  render() {
    // 这里的套路是这样的。m级联动 => 注册n级(n < m)的获取当前级id的方法与状态，控制n+1级的数据
    // 此处为3级联动，那么获取1/2级的id，控制2/3级的数据(c2Data, c3Data)
    // 对于无限级联动，当第n(0 < n < m)级的数据改变，则清空n + 1至m级的所有数据(这里比如第1级的数据改变，需要清空2 - 3级的数据)
    // 如果是4级联动的第2级修改了数据 那么第1级不变，第3，4级的数据要清除。这玩意可以做一个工具类处理几个函数之间的关系。
    // 原理相信你已经明白了，由于开发时间紧张，这里就简单的处理一下，万一遇到4+级联动你自己搞不定，那么还是来找我吧。。。
    const {
      loading,
      userCenterInfoEdit: { formData, c2Data, c3Data, type2Data },
      form: { getFieldDecorator },
    } = this.props;

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-adjust" bordered={false}>
          <FieldList
            layout="horizontal"
            legend="个人信息"
            getFieldDecorator={getFieldDecorator}
            col={2}
          >
            <Field
              name="resName"
              label="姓名"
              decorator={{
                initialValue: formData.resName,
              }}
            >
              <Input placeholder="请输入姓名" disabled />
            </Field>
            <Field
              name="englishName"
              label="英文名"
              decorator={{
                initialValue: formData.englishName,
              }}
            >
              <Input placeholder="请输入英文名" disabled />
            </Field>
            <Field
              name="resGender"
              label="性别"
              decorator={{
                initialValue: formData.resGender,
              }}
            >
              <UdcSelect code="COM.GENDER" placeholder="请选择性别" disabled />
            </Field>
            <Field
              name="birthday"
              label="出生日期"
              decorator={{
                initialValue: formData.birthday ? moment(formData.birthday) : null,
              }}
            >
              <DatePicker className="x-fill-100" disabledDate={this.disabledDate} disabled />
            </Field>

            <Field
              name="idType"
              label="证件类型"
              decorator={{
                initialValue: formData.idType,
              }}
            >
              <UdcSelect code="COM.ID_TYPE" placeholder="请选择证件类型" disabled />
            </Field>
            <Field
              name="idNo"
              label="证件号码"
              decorator={{
                initialValue: formData.idNo,
              }}
            >
              <Input placeholder="请输入证件号码" disabled />
            </Field>
            <Field
              name="idValid"
              label="证件有效期"
              decorator={{
                initialValue: [
                  formData.idValidFrom ? moment(formData.idValidFrom) : null,
                  formData.idValidTo ? moment(formData.idValidTo) : null,
                ],
                rules: [{ required: false, message: '请选择证件有效期' }],
              }}
            >
              <DatePicker.RangePicker
                placeholder={['开始日期', '结束日期']}
                className="x-fill-100"
              />
            </Field>

            <Field name="attache" label="证件照片附件">
              <FileManagerEnhance
                api="/api/person/v1/res/idphoto/sfs/token"
                dataKey={formData.id}
                listType="text"
                disabled={false}
              />
            </Field>

            <Field
              name="nationality"
              label="国籍"
              decorator={{
                initialValue: formData.nationality,
              }}
            >
              <UdcSelect code="COM.COUNTRY" placeholder="请选择国籍" />
            </Field>
            <Field
              name="birthplace"
              label="籍贯"
              decorator={{
                initialValue: formData.birthplace,
                rules: [
                  {
                    required: false,
                    message: '请选择籍贯',
                  },
                ],
              }}
            >
              <Input placeholder="请输入籍贯" />
            </Field>
            <Field
              name="nation"
              label="民族"
              decorator={{
                initialValue: formData.nation,
                rules: [
                  {
                    required: false,
                    message: '请输入民族',
                  },
                ],
              }}
            >
              <Input placeholder="请输入民族" />
            </Field>
            <Field
              name="marital"
              label="婚姻状况"
              decorator={{
                initialValue: formData.marital,
                rules: [
                  {
                    required: false,
                    message: '请选择婚姻状况',
                  },
                ],
              }}
            >
              <UdcSelect code="COM.MARRIAGE" placeholder="请选择婚姻状况" />
            </Field>
            <Field
              name="passportNo"
              label="护照号码"
              decorator={{
                initialValue: formData.passportNo,
                rules: [
                  {
                    required: false,
                    message: '请输入护照号码',
                  },
                ],
              }}
            >
              <Input placeholder="请输入护照号码" />
            </Field>

            <Field
              name="passportValid"
              label="护照有效期"
              decorator={{
                initialValue: [
                  formData.passportValidFrom ? moment(formData.passportValidFrom) : null,
                  formData.passportValidTo ? moment(formData.passportValidTo) : null,
                ],
                rules: [{ required: false, message: '请选择护照有效期' }],
              }}
            >
              <DatePicker.RangePicker
                placeholder={['开始日期', '结束日期']}
                className="x-fill-100"
              />
            </Field>

            <Field name="attache" label="护照照片附件">
              <FileManagerEnhance
                api="/api/person/v1/res/passportphoto/sfs/token"
                dataKey={formData.id}
                listType="text"
                disabled={false}
              />
            </Field>

            <Field
              name="passportIssueplace"
              label="护照发放地"
              decorator={{
                initialValue: formData.passportIssueplace,
                rules: [
                  {
                    required: false,
                    message: '请输入护照发放地',
                  },
                ],
              }}
            >
              <Input placeholder="请输入护照发放地" />
            </Field>
            <Field name="attache" label="个人简历附件">
              <FileManagerEnhance
                api="/api/person/v1/res/personResume/sfs/token"
                dataKey={formData.id}
                listType="text"
                disabled={false}
              />
            </Field>
          </FieldList>

          <Divider dashed />
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
              name="emailAddr"
              label="平台邮箱"
              decorator={{
                initialValue: formData.emailAddr,
                rules: [
                  {
                    required: false,
                    message: '请输入平台邮箱',
                  },
                ],
              }}
            >
              <Input placeholder="请输入平台邮箱" disabled />
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

export default CenterBasicInfo;
