import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import router from 'umi/router';
import { Button, Card, DatePicker, Form, Input, Divider } from 'antd';
import classnames from 'classnames';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto, markAsTab, closeTab } from '@/layouts/routerControl';
import AsyncSelect from '@/components/common/AsyncSelect';
import FieldList from '@/components/layout/FieldList';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import createMessage from '@/components/core/AlertMessage';
import { formatMessage } from 'umi/locale';
import { UdcSelect, FileManagerEnhance } from '@/pages/gen/field';
import { isEmpty } from 'ramda';
import { stringify } from 'qs';

const { Field, FieldLine } = FieldList;

const DOMAIN = 'platResDetail';

@connect(({ loading, platResDetail, dispatch }) => ({
  loading,
  platResDetail,
  dispatch,
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    const key = Object.keys(changedFields)[0];
    const value = Object.values(changedFields)[0];
    if (key === 'mobile') {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { key, value: value.value.trim() },
      });
      return;
    }
    if (value) {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { key, value: value.value },
      });
    }
  },
})
@mountToTab()
class ResDetail extends PureComponent {
  // state = {
  //   disabledBtn: true, // 默认按钮禁用
  // };

  componentDidMount() {
    const { dispatch, loading } = this.props;
    const param = fromQs();
    if (param.mode && param.mode !== 'create') {
      dispatch({
        type: `${DOMAIN}/query`,
        payload: param,
      });
    } else {
      dispatch({ type: `${DOMAIN}/clean` });
    }
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'RES_ARCHIVES_MANAGEMENT_SAVE' },
    });
    // this.setState({
    //   disabledBtn: loading.effects[`${DOMAIN}/save`],
    // });
  }

  // componentWillUnmount() {
  //   const { dispatch } = this.props;
  //   dispatch({
  //     type: `${DOMAIN}/updateState`,
  //     payload: {
  //       pageConfig: {},
  //     },
  //   });
  // }

  // 继续完善信息按钮事件
  handleSave = () => {
    const {
      loading,
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;
    // this.setState({
    //   disabledBtn: loading.effects[`${DOMAIN}/save`],
    // });

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/save`,
        }).then(res => {
          if (!isEmpty(res)) {
            dispatch({
              type: 'internalFlow/updateForm',
              payload: { relatedResId: Number(res.datum.id) },
            });
            const { from } = fromQs();
            const fromUrl = stringify({ from });
            closeThenGoto(`/hr/res/profile/list/background?id=${res.datum.id}&${fromUrl}`);
          }
        });
      }
    });
  };

  // 点击保存为人才库
  handleSaveAndJump = () => {
    const {
      loading,
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;
    // this.setState({
    //   disabledBtn: loading.effects[`${DOMAIN}/save`],
    // });

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/saveAndJump`,
        }).then(res => {
          if (!isEmpty(res)) {
            dispatch({
              type: 'internalFlow/updateForm',
              payload: { relatedResId: Number(res.datum.id) },
            });
            const { from } = fromQs();
            const record = window.location.pathname + window.location.search;
            router.push(markAsTab(from));
            closeTab(record);
          }
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

  renderPage = () => {
    const {
      platResDetail: { formData, pageConfig, type2Data },
      form: { getFieldDecorator },
    } = this.props;
    const { pageBlockViews } = pageConfig;
    if (!pageBlockViews || pageBlockViews.length < 1) {
      return <div />;
    }
    let currentConfig = [];
    pageBlockViews.forEach(view => {
      if (view.blockKey === 'RES_ARCHIVES_MANAGEMENT_SAVE_MAIN') {
        currentConfig = view;
      }
    });
    const { pageFieldViews } = currentConfig;
    const pageFieldJson = {}; // 考核范围
    if (pageFieldViews) {
      pageFieldViews.forEach(field => {
        pageFieldJson[field.fieldKey] = field;
      });
    }
    let fields = [];
    fields = [
      <Field
        name="resType1"
        key="resType1"
        label={pageFieldJson.resType1.displayName}
        decorator={{
          initialValue: formData.resType1,
        }}
      >
        <UdcSelect
          code="RES.RES_TYPE1"
          placeholder={`请选择${pageFieldJson.resType1.displayName}`}
          onChange={this.handleChangeType1}
        />
      </Field>,
      <Field
        name="resType2"
        key="resType2"
        label={pageFieldJson.resType2.displayName}
        decorator={{
          initialValue: formData.resType2Name,
        }}
      >
        <AsyncSelect
          source={type2Data}
          placeholder={`请选择${pageFieldJson.resType2.displayName}`}
        />
      </Field>,
    ];
    const filterList = fields
      .filter(field => !field.key || pageFieldJson[field.key].visibleFlag === 1)
      .sort((field1, field2) => field1.props.sortNo - field2.props.sortNo);
    return (
      <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
        {filterList}
      </FieldList>
    );
  };

  // 资源类型一 -> 资源类型二
  handleChangeType1 = value => {
    const { dispatch, form } = this.props;
    dispatch({
      type: `${DOMAIN}/updateListType2`,
      payload: value,
    }).then(() => {
      form.setFieldsValue({
        resType2: null,
      });
    });
  };

  getBirthdayFromIdCard = idCard => {
    let birthday = '';
    if (idCard != null && idCard !== '') {
      if (idCard.length === 15) {
        birthday = '19' + idCard.substr(6, 6);
      } else if (idCard.length === 18) {
        birthday = idCard.substr(6, 8);
      }
      birthday = birthday.replace(/(.{4})(.{2})/, '$1-$2-');
      if (!moment(birthday).isValid()) {
        createMessage({
          type: 'error',
          description: '无法从身份证号码抓取到出生日期，请确认输入的身份证号码是否正确',
        });
        birthday = '';
      }
    } else {
      // createMessage({
      //   type: 'error',
      //   description: '无法从身份证号码抓取到出生日期，请确认输入的身份证号码是否正确',
      // });
      return false;
    }
    return birthday;
  };

  handleChangeIdType = value => {
    const {
      dispatch,
      platResDetail: { formData },
      form,
    } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        formData: { ...formData, idType: value },
      },
    });
    form.setFieldsValue({
      birthday: null,
      idNo: null,
    });
  };

  handleChangeIdNo = value => {
    const {
      dispatch,
      platResDetail: { formData },
      form,
    } = this.props;
    const birthday = this.getBirthdayFromIdCard(value);
    formData.idType === 'ID_CARD' && birthday
      ? form.setFieldsValue({
          birthday: moment(birthday),
        })
      : form.setFieldsValue({
          birthday: null,
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
      platResDetail: { formData, c2Data, c3Data, type2Data },
      form: { getFieldDecorator },
    } = this.props;
    // const { disabledBtn } = this.state;
    const saveBtn = loading.effects[`${DOMAIN}/save`];
    const saveAndJumpBtn = loading.effects[`${DOMAIN}/saveAndJump`];
    const param = fromQs();

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            icon="save"
            size="large"
            disabled={saveBtn || saveAndJumpBtn}
            onClick={this.handleSave}
          >
            {formatMessage({ id: `misc.completeInfo`, desc: '继续完善信息' })}
          </Button>
          <Button
            className="tw-btn-primary"
            icon="save"
            size="large"
            onClick={this.handleSaveAndJump}
          >
            {formatMessage({ id: `misc.saveResInfo`, desc: '保存为人才库' })}
          </Button>
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            disabled={saveBtn || saveAndJumpBtn}
            onClick={() => {
              const { from } = fromQs();
              if (from && from.includes('internalFlow')) {
                const record = window.location.pathname + window.location.search;
                router.push(markAsTab(from));
                closeTab(record);
              } else {
                closeThenGoto('/hr/res/profile/list');
              }
            }}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>

        <Card
          className="tw-card-adjust"
          title={<Title icon="profile" text="资源基本信息" />}
          bordered={false}
        >
          {this.renderPage()}
          {/* <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="resType1"
              label="资源类型一"
              decorator={{
                initialValue: formData.resType1,
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
                initialValue: formData.resType2Name,
              }}
            >
              <AsyncSelect source={type2Data} placeholder="请选择资源类型二" />
            </Field>
          </FieldList> */}
          <Divider dashed />

          <FieldList
            layout="horizontal"
            legend="基本信息"
            getFieldDecorator={getFieldDecorator}
            col={2}
          >
            <Field
              name="resName"
              label="姓名"
              decorator={{
                initialValue: formData.resName,
                rules: [
                  {
                    required: true,
                    message: '请输入姓名',
                  },
                ],
              }}
            >
              <Input placeholder="请输入姓名" />
            </Field>
            <Field
              name="englishName"
              label="英文名"
              decorator={{
                initialValue: formData.englishName,
                // rules: [
                //   {
                //     required: true,
                //     message: '请输入英文名',
                //   },
                // ],
              }}
            >
              <Input placeholder="请输入英文名" />
            </Field>
            <Field
              name="resGender"
              label="性别"
              decorator={{
                initialValue: formData.resGender,
                // rules: [
                //   {
                //     required: true,
                //     message: '请选择性别',
                //   },
                // ],
              }}
            >
              <UdcSelect code="COM.GENDER" placeholder="请选择性别" />
            </Field>
            <Field
              name="birthday"
              label="出生日期"
              decorator={{
                initialValue: formData.birthday ? moment(formData.birthday) : null,
                // rules: [{ required: true, message: '请选择出生日期' }],
              }}
            >
              <DatePicker
                className="x-fill-100"
                disabled={formData.idType === 'ID_CARD'}
                disabledDate={this.disabledDate}
              />
            </Field>

            <Field
              name="idType"
              label="证件类型"
              decorator={{
                initialValue: formData.idType,
                // rules: [ { required: true, message: '请选择证件类型', }, ],
              }}
            >
              <UdcSelect
                code="COM.ID_TYPE"
                placeholder="请选择证件类型"
                onChange={type => this.handleChangeIdType(type)}
              />
            </Field>
            <Field
              name="idNo"
              label="证件号码"
              decorator={{
                initialValue: formData.idNo,
                // rules: [
                //   {
                //     required: true,
                //     message: '请输入证件号码',
                //   },
                // ],
              }}
            >
              <Input
                placeholder="请输入证件号码"
                onBlur={e => this.handleChangeIdNo(e.target.value)}
              />
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
                // rules: [
                //   {
                //     required: true,
                //     message: '请选择国籍',
                //   },
                // ],
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
              <Input placeholder="请输入平台邮箱" />
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
                  rules: [{ required: false, message: '请选择省' }],
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

          <Divider dashed />
          <FieldList
            layout="horizontal"
            legend="备注信息"
            getFieldDecorator={getFieldDecorator}
            col={1}
          >
            <Field
              name="remark"
              label="能力备注"
              decorator={{
                initialValue: formData.remark,
                rules: [{ required: false }, { max: 400, message: '不超过400个字' }],
              }}
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
            >
              <Input.TextArea placeholder="请输入能力备注" autosize={{ minRows: 3, maxRows: 6 }} />
            </Field>

            <Field
              name="remark1"
              label="其它备注"
              decorator={{
                initialValue: formData.remark1,
                rules: [{ required: false }, { max: 400, message: '不超过400个字' }],
              }}
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
            >
              <Input.TextArea placeholder="请输入其它备注" autosize={{ minRows: 3, maxRows: 6 }} />
            </Field>
          </FieldList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default ResDetail;
