/* eslint-disable array-callback-return */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-shadow */
/* eslint-disable prefer-const */
/* eslint-disable dot-notation */
/* eslint-disable no-param-reassign */
/* eslint-disable react/destructuring-assignment */
import React, { Component } from 'react';
import { Form, Button, Icon, Select } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import { omit, isNil, isEmpty } from 'ramda';

// 产品化组件
import { fromQs } from '@/utils/production/stringUtil';
import { queryUdc, queryCascaderUdc } from '@/services/gen/app';
import BusinessForm from '@/components/production/business/BusinessForm';
import PageWrapper from '@/components/production/layout/PageWrapper';
import FormItem from '@/components/production/business/FormItem';
import ButtonCard from '@/components/production/layout/ButtonCard';
import InformationDisplay from '../InformationDisplay';
// namespace声明
const DOMAIN = 'information';

const { Option } = Select;

/***
 * 员工信息录入,合并基本信息组件
 */
@connect(({ loading, dispatch, information, informationDisplay, user: { user } }) => ({
  loading: loading.effects[`${DOMAIN}/init`] || loading.effects[`${DOMAIN}/save`],
  dispatch,
  ...information,
  informationDisplay,
  user,
}))
@Form.create({
  mapPropsToFields(props) {
    const { formData } = props;
    const fields = {};
    Object.keys(formData).forEach(key => {
      const tempValue = formData[key];
      if (Array.isArray(tempValue)) {
        tempValue.forEach((temp, index) => {
          Object.keys(temp).forEach(detailKey => {
            fields[`${key}[${index}].${detailKey}`] = Form.createFormField({
              value: temp[detailKey],
            });
          });
        });
      } else {
        fields[key] = Form.createFormField({ value: tempValue });
      }
    });
    return fields;
  },
  onValuesChange(props, changedValues, allValues) {
    if (isEmpty(changedValues)) return;
    const name = Object.keys(changedValues)[0];
    const value = changedValues[name];
    const newFieldData = { [name]: value };
    switch (name) {
      default:
        break;
    }
    props.dispatch({
      type: `${DOMAIN}/updateFormForEditTable`,
      payload: newFieldData,
    });
  },
})
class InformationElement extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      // confirmDirty: false,
      provinceList: [],
      qualificationList: [],
      kwFlag: 'Y',
      kwoFlag: 'Y',
      otherFlag: 'Y',
      submitFlag: false,
      idCardFileIdList: [],
      newPersonExpand: {},
    };
  }

  componentDidMount() {
    const { dispatch, id, informationDisplay, eduList, form } = this.props;
    dispatch({
      type: 'informationDisplay/updateState',
      payload: { infoForm: form },
    });
    const { newPersonExpand } = this.state;
    const {
      formData: { personExpand },
    } = informationDisplay;
    if (personExpand) {
      const { personWorkList, personEduList, personFamilyList } = personExpand;
      const workList = [];
      const eduList = [];
      const familyList = [];
      const workCityList = [];
      this.getCity(personExpand?.censusRegistrationPc, 'cenCityList');
      this.getCity(personExpand?.documentPlacePc, 'docCityList');
      personExpand.birthday = personExpand?.birthday === null ? undefined : personExpand?.birthday;
      personExpand.firstWorkTime =
        personExpand?.firstWorkTime === null ? undefined : personExpand?.firstWorkTime;
      personExpand.skillDate =
        personExpand?.skillDate === null ? undefined : personExpand?.skillDate;
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < personWorkList.length; i++) {
        workList.push(i);
        personExpand[`workStartDate${i}`] =
          personWorkList[i]?.workStartDate === null ? undefined : personWorkList[i]?.workStartDate;
        personExpand[`workEndDate${i}`] =
          personWorkList[i]?.workEndDate === null ? undefined : personWorkList[i]?.workEndDate;
        personExpand[`workCompany${i}`] = personWorkList[i]?.workCompany;
        personExpand[`workBuOrPosition${i}`] = personWorkList[i]?.workBuOrPosition;
        personExpand[`workProvinceCode${i}`] = personWorkList[i]?.workProvinceCode;
        personExpand[`workCityCode${i}`] = personWorkList[i]?.workCityCode;

        this.setState({ [`workCity${i}`]: [] }, () =>
          this.getCity(personWorkList[i]?.workProvinceCode, `workCity${i}`)
        );
      }
      for (let i = 0; i < personEduList.length; i += 1) {
        eduList.push(i);
        personExpand[`eduStartDate${i}`] =
          personEduList[i]?.eduStartDate === null ? undefined : personEduList[i]?.eduStartDate;
        personExpand[`eduEndDate${i}`] =
          personEduList[i]?.eduEndDate === null ? undefined : personEduList[i]?.eduEndDate;
        personExpand[`eduName${i}`] = personEduList[i]?.eduName;
        personExpand[`major${i}`] = personEduList[i]?.major;
        personExpand[`diploma${i}`] = personEduList[i]?.diploma;
        personExpand[`degreeFileIdList${i}`] = personEduList[i]?.degreeFileIdList;
        personExpand[`eduFileIdList${i}`] = personEduList[i]?.eduFileIdList;
        personExpand[`foreignEduFileIdList${i}`] = personEduList[i]?.foreignEduFileIdList;
        this.setState({
          [`degreeFileIdList${i}`]: personEduList[i]?.degreeFileIdList,
          [`eduFileIdList${i}`]: personEduList[i]?.eduFileIdList,
          [`foreignEduFileIdList${i}`]: personEduList[i]?.foreignEduFileIdList,
        });
      }
      for (let i = 0; i < personFamilyList.length; i += 1) {
        familyList.push(i);
        personExpand[`familyName${i}`] = personFamilyList[i]?.familyName;
        personExpand[`familyRelation${i}`] = personFamilyList[i]?.familyRelation;
        personExpand[`familyBirthday${i}`] = personFamilyList[i]?.familyBirthday;
        personExpand[`familyCompany${i}`] = personFamilyList[i]?.familyCompany;
        personExpand[`familyPosition${i}`] = personFamilyList[i]?.familyPosition;
      }
      this.setState({
        kwFlag: personExpand?.kinsfolkWorked,
        kwoFlag: personExpand?.kinsfolkWorkedOpponent,
        otherFlag: personExpand?.otherInterest,
        idCardFileIdList: personExpand?.idCardFileIdList,
        submitFlag: personExpand?.submitFlag ?? false,
      });
      this.updateModelState({
        workList: workList.length !== 0 ? workList : [0],
        eduList: eduList.length !== 0 ? eduList : [0],
        familyList: familyList.length !== 0 ? familyList : [0],
      });
      form.setFieldsValue(personExpand);
      this.setState({
        newPersonExpand: personExpand,
      });
    }
    // 调用页面载入初始化方法,一般是请求页面数据
    // fromQs 方法从url获取路径参数，仅能在组件加载时调用一次，且只能在一级组件调用，后续在组件内部维护自己的url参数。否则多TAB体系可能会出BUG
    const { flag } = fromQs();
    const formMode = 'edit';
    const checked = flag === 'CHECK';
    // 把url的参数保存到state
    this.updateModelState({
      formMode,
    });
    this.callModelEffects('updateForm', { id });
    this.getProvince();
  }

  componentWillUnmount() {
    // 页面卸载时清理model层state,防止再次进入时错误显示
    this.callModelEffects('cleanState');
  }

  getProvince = async () => {
    const provinceList = await queryUdc('COM:PROVINCE').then(resp => resp.response);
    const qualificationList = await queryUdc('COM:EDUCATION').then(resp => resp.response);
    this.setState({ provinceList, qualificationList });
  };

  getCity = async (province, listName, formFeild) => {
    const listData = await queryCascaderUdc({
      defId: 'COM:CITY',
      parentDefId: 'COM:PROVINCE',
      parentVal: province,
    }).then(resp => resp.response);
    this.setState({ [listName]: listData });
    this.callModelEffects('updateForm', { [formFeild]: undefined });
  };

  /**
   * 修改model层state
   * 这个方法是仅是封装一个小方法,后续修改model的state时不需要每次都解构dispatch
   * @param params state参数
   */
  updateModelState = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: params,
    });
  };

  /**
   * 调用model层异步方法
   * 这个方法是仅是封装一个小方法,后续修改调异步方法时不需要每次都解构dispatch
   * @param method 异步方法名称
   * @param params 调用方法参数
   */
  callModelEffects = async (method, params) => {
    const { dispatch } = this.props;
    return dispatch({
      type: `${DOMAIN}/${method}`,
      payload: params,
    });
  };

  // 新增工作经历
  addWork = () => {
    // const { workList } = this.state;
    const { workList = [] } = this.props;
    const workListc = [...workList];
    workListc.push(workListc[workList.length - 1] + 1);
    this.updateModelState({ workList: workListc });
  };

  // 删除工作经历
  delWork = index => {
    // const { workList } = this.state;
    const { workList } = this.props;
    const workListc = [...workList];
    workListc.splice(index, 1);
    this.updateModelState({ workList: workListc });
  };

  // 新增教育经历
  addEdu = () => {
    const { eduList } = this.props;
    const eduListc = [...eduList];
    eduListc.push(eduListc[eduListc.length - 1] + 1);
    this.updateModelState({ eduList: eduListc });
  };

  // 删除教育经历
  delEdu = index => {
    const { eduList = [] } = this.props;
    const eduListc = [...eduList];
    eduListc.splice(index, 1);
    this.updateModelState({ eduList: eduListc });
  };

  // 新增家庭成员简介
  addFamily = () => {
    const { familyList = [] } = this.props;
    const familyListc = [...familyList];
    familyListc.push(familyListc[familyListc.length - 1] + 1);
    this.updateModelState({ familyList: familyListc });
  };

  // 删除家庭成员简介
  delFamily = index => {
    const { familyList = [] } = this.props;
    const familyListc = [...familyList];
    familyListc.splice(index, 1);
    this.updateModelState({ familyList: familyListc });
  };

  render() {
    const {
      form,
      informationDisplay,
      formMode,
      loading,
      workList = [],
      eduList = [],
      familyList = [],
      user: { extInfo = {} }, // 取当前登陆人的resId
    } = this.props;
    const { mode } = fromQs();
    const {
      provinceList,
      cenCityList = [],
      docCityList = [],
      qualificationList,
      kwFlag,
      kwoFlag,
      otherFlag,
      idCardFileIdList = [],
      newPersonExpand,
    } = this.state;
    return (
      <PageWrapper loading={loading}>
        <BusinessForm
          title="补录信息"
          form={form}
          formData={newPersonExpand}
          formMode={formMode}
          defaultColumnStyle={8}
        >
          <FormItem
            fieldType="BaseInput"
            label="个人邮箱"
            fieldKey="email"
            disabled={mode !== 'EDIT'}
          />
          <FormItem
            fieldType="BaseInput"
            label="汉语拼音"
            fieldKey="pinyin"
            disabled={mode !== 'EDIT'}
          />
          <FormItem
            fieldType="BaseInput"
            label="昵称"
            fieldKey="nickName"
            disabled={mode !== 'EDIT'}
          />
          <FormItem
            fieldType="BaseRadioSelect"
            label="婚姻状况"
            fieldKey="marital"
            disabled={mode !== 'EDIT'}
            options={[{ label: '已婚', value: 'MARRIED' }, { label: '未婚', value: 'UNMARRIEDF' }]}
          />

          <FormItem
            fieldType="Custom"
            label="最高学历"
            fieldKey="qualification"
            disabled={mode !== 'EDIT'}
          >
            <Select placeholder="选择最高学历">
              {qualificationList.map((item, index) => (
                <Option value={item?.code}>{item?.name}</Option>
              ))}
            </Select>
          </FormItem>
          <FormItem
            fieldType="BaseRadioSelect"
            label="是否为党员"
            fieldKey="partyMember"
            disabled={mode !== 'EDIT'}
            options={[{ label: '否', value: 'N' }, { label: '是', value: 'Y' }]}
          />

          {/*级联*/}
          <FormItem
            fieldType="Group"
            label="户籍所在地"
            disabled={mode !== 'EDIT'}
            // fieldKey=''
          >
            <FormItem
              fieldType="Custom"
              label=""
              fieldKey="censusRegistrationPc"
              disabled={mode !== 'EDIT'}
              initialValue={newPersonExpand && newPersonExpand.censusRegistrationPc}
              onChange={v => {
                this.getCity(v, 'cenCityList', 'censusRegistrationCc');
              }}
            >
              <Select placeholder="选择省份">
                {provinceList.map((item, index) => (
                  <Option value={item?.code}>{item?.name}</Option>
                ))}
              </Select>
            </FormItem>

            <FormItem
              fieldType="Custom"
              label=""
              fieldKey="censusRegistrationCc"
              disabled={mode !== 'EDIT'}
              initialValue={newPersonExpand && newPersonExpand.censusRegistrationCc}
            >
              <Select placeholder="选择城市">
                {cenCityList.map((item, index) => (
                  <Option value={item?.code}>{item?.name}</Option>
                ))}
              </Select>
            </FormItem>
          </FormItem>

          <FormItem
            fieldType="Group"
            label="档案所在地"
            disabled={mode !== 'EDIT'}
            // fieldKey=''
          >
            <FormItem
              fieldType="Custom"
              label=""
              fieldKey="documentPlacePc"
              disabled={mode !== 'EDIT'}
              initialValue={newPersonExpand && newPersonExpand.documentPlacePc}
              onChange={v => this.getCity(v, 'docCityList', 'documentPlaceCc')}
            >
              <Select placeholder="选择省份">
                {provinceList.map((item, index) => (
                  <Option value={item?.code}>{item?.name}</Option>
                ))}
              </Select>
            </FormItem>

            <FormItem
              fieldType="Custom"
              label=""
              fieldKey="documentPlaceCc"
              disabled={mode !== 'EDIT'}
              initialValue={newPersonExpand && newPersonExpand.documentPlaceCc}
            >
              <Select placeholder="选择城市">
                {docCityList.map((item, index) => (
                  <Option value={item?.code}>{item?.name}</Option>
                ))}
              </Select>
            </FormItem>
          </FormItem>

          <FormItem
            fieldType="BaseInput"
            label="身份证号码"
            fieldKey="idNo"
            disabled={mode !== 'EDIT'}
          />
          <FormItem
            fieldType="FileUpload"
            label="身份证复印件"
            fieldKey="idCardFileIdList"
            fileList={idCardFileIdList}
            disabled={mode !== 'EDIT'}
          />
          <FormItem
            fieldType="BaseDatePicker"
            label="首次工作时间"
            fieldKey="firstWorkTime"
            disabled={mode !== 'EDIT'}
          />
          <FormItem
            fieldType="BaseInput"
            label="公积金账号"
            fieldKey="surplusAccount"
            disabled={mode !== 'EDIT'}
          />
          <FormItem
            fieldType="BaseInput"
            label="补充公积金账号"
            fieldKey="surplusAccountReplenish"
            disabled={mode !== 'EDIT'}
          />
          <FormItem
            fieldType="BaseRadioSelect"
            label="是否有身体残缺或残疾"
            fieldKey="physicalCondition"
            disabled={mode !== 'EDIT'}
            options={[{ label: '否', value: 'N' }, { label: '是', value: 'Y' }]}
          />
          <FormItem
            fieldType="BaseInput"
            label="兴趣爱好"
            fieldKey="hobby"
            disabled={mode !== 'EDIT'}
          />
          <FormItem fieldType="BaseInput" label="偶像" fieldKey="idol" disabled={mode !== 'EDIT'} />
          <FormItem
            fieldType="BaseInput"
            label="喜欢的食物"
            fieldKey="foods"
            disabled={mode !== 'EDIT'}
          />
          <FormItem
            fieldType="BaseInput"
            label="血型"
            fieldKey="bloodType"
            disabled={mode !== 'EDIT'}
          />
          <FormItem
            fieldType="BaseInput"
            label="上升星座"
            fieldKey="constellation"
            disabled={mode !== 'EDIT'}
          />
          <FormItem
            fieldType="BaseInput"
            label="幸运数字"
            fieldKey="luckyNumbers"
            disabled={mode !== 'EDIT'}
          />
          <FormItem
            fieldType="BaseInput"
            label="幸运颜色"
            fieldKey="luckyColor"
            disabled={mode !== 'EDIT'}
          />
          <FormItem
            fieldType="BaseInput"
            label="永久地址"
            fieldKey="addressPermanent"
            disabled={mode !== 'EDIT'}
          />
          <FormItem
            fieldType="BaseInput"
            label="永久电话"
            fieldKey="phonePermanent"
            disabled={mode !== 'EDIT'}
          />
          <FormItem
            fieldType="BaseInput"
            label="临时地址"
            fieldKey="addressTemp"
            disabled={mode !== 'EDIT'}
          />
          <FormItem
            fieldType="BaseInput"
            label="临时电话"
            fieldKey="phoneTemp"
            disabled={mode !== 'EDIT'}
          />
        </BusinessForm>
        <BusinessForm
          title="紧急联系人"
          form={form}
          formData={newPersonExpand}
          defaultColumnStyle={8}
        >
          <FormItem
            fieldType="BaseInput"
            label="姓名"
            fieldKey="emergentName"
            disabled={mode !== 'EDIT'}
          />
          <FormItem
            fieldType="BaseInput"
            label="关系"
            fieldKey="emergentRelation"
            disabled={mode !== 'EDIT'}
          />
          <FormItem
            fieldType="BaseInput"
            label="电话"
            fieldKey="emergentPhone"
            disabled={mode !== 'EDIT'}
          />
          <FormItem
            fieldType="BaseInputTextArea"
            label="地址"
            fieldKey="emergentAddress"
            disabled={mode !== 'EDIT'}
          />
        </BusinessForm>

        {/*工作经历*/}
        <div>
          <ButtonCard>
            <span style={{ fontSize: '25px', fontWeight: 500 }}>工作经历（从最近的单位开始）</span>
            {mode === 'EDIT' && (
              <Button
                size="large"
                type="primary"
                key="add"
                onClick={() => {
                  this.addWork();
                }}
              >
                添加其他工作经历
              </Button>
            )}
          </ButtonCard>
        </div>
        {workList.map((item, index) => (
          <div>
            {index !== 0 && (
              <Icon
                type="minus-circle"
                style={{ marginLeft: 30, cursor: 'pointer', color: 'red' }}
                onClick={() => this.delWork(index)}
              />
            )}
            <BusinessForm
              title={`工作经历${index + 1}`}
              form={form}
              formData={newPersonExpand}
              defaultColumnStyle={8}
            >
              <FormItem
                fieldType="BaseDatePicker"
                label="开始时间"
                fieldKey={`workStartDate${item}`}
                disabled={mode !== 'EDIT'}
              />
              <FormItem
                fieldType="BaseDatePicker"
                label="结束时间"
                fieldKey={`workEndDate${item}`}
                disabled={mode !== 'EDIT'}
              />
              <FormItem
                fieldType="BaseInput"
                label="单位"
                fieldKey={`workCompany${item}`}
                disabled={mode !== 'EDIT'}
              />
              <FormItem
                fieldType="BaseInput"
                label="部门及服务"
                fieldKey={`workBuOrPosition${item}`}
                disabled={mode !== 'EDIT'}
              />
              <FormItem
                fieldType="Group"
                label="城市"
                disabled={mode !== 'EDIT'}
                // fieldKey=''
              >
                <FormItem
                  fieldType="Custom"
                  label=""
                  fieldKey={`workProvinceCode${item}`}
                  disabled={mode !== 'EDIT'}
                  initialValue={newPersonExpand && newPersonExpand[`workProvinceCode${item}`]}
                >
                  <Select
                    onChange={v => this.getCity(v, `workCity${item}`, `workCityCode${item}`)}
                    placeholder="选择省份"
                  >
                    {provinceList.map((item, index) => (
                      <Option value={item?.code}>{item?.name}</Option>
                    ))}
                  </Select>
                </FormItem>

                <FormItem
                  fieldType="Custom"
                  label=""
                  fieldKey={`workCityCode${item}`}
                  disabled={mode !== 'EDIT'}
                  initialValue={newPersonExpand && newPersonExpand[`workCityCode${item}`]}
                >
                  <Select placeholder="选择城市">
                    {this.state[`workCity${item}`]?.map((item, index) => (
                      <Option value={item?.code}>{item?.name}</Option>
                    ))}
                  </Select>
                </FormItem>
              </FormItem>
            </BusinessForm>
          </div>
        ))}

        {/*教育背景*/}
        <div>
          <ButtonCard>
            <span style={{ fontSize: '25px', fontWeight: 500 }}>教育背景（从本科/专科写起）</span>
            {mode === 'EDIT' && (
              <Button
                size="large"
                type="primary"
                key="add"
                onClick={() => {
                  this.addEdu();
                }}
              >
                添加其他教育背景
              </Button>
            )}
          </ButtonCard>
        </div>
        {eduList.map((item, index) => (
          <div>
            {index !== 0 && (
              <Icon
                type="minus-circle"
                style={{ marginLeft: 30, cursor: 'pointer', color: 'red' }}
                onClick={() => this.delEdu(index)}
              />
            )}
            <BusinessForm
              title={`教育背景${index + 1}`}
              form={form}
              formData={newPersonExpand}
              defaultColumnStyle={8}
            >
              <FormItem
                fieldType="BaseDatePicker"
                label="开始时间"
                fieldKey={`eduStartDate${item}`}
                disabled={mode !== 'EDIT'}
              />
              <FormItem
                fieldType="BaseDatePicker"
                label="结束时间"
                fieldKey={`eduEndDate${item}`}
                disabled={mode !== 'EDIT'}
              />
              <FormItem
                fieldType="BaseInput"
                label="学校名称(全日制)"
                fieldKey={`eduName${item}`}
                disabled={mode !== 'EDIT'}
              />
              <FormItem
                fieldType="BaseInput"
                label="专业"
                fieldKey={`major${item}`}
                disabled={mode !== 'EDIT'}
              />
              <FormItem
                fieldType="BaseInput"
                label="文凭"
                fieldKey={`diploma${item}`}
                disabled={mode !== 'EDIT'}
              />
              <FormItem
                fieldType="FileUpload"
                label="学位证书复印件"
                fieldKey={`degreeFileIdList${item}`}
                fileList={newPersonExpand && newPersonExpand[`degreeFileIdList${item}`]}
                disabled={mode !== 'EDIT'}
              />
              <FormItem
                fieldType="FileUpload"
                label="学历证书复印件"
                fieldKey={`eduFileIdList${item}`}
                fileList={newPersonExpand && newPersonExpand[`eduFileIdList${item}`]}
                disabled={mode !== 'EDIT'}
              />
              <FormItem
                fieldType="FileUpload"
                label="学教育部海外学历认证复印件（留学生适用）"
                fieldKey={`foreignEduFileIdList${item}`}
                fileList={newPersonExpand && newPersonExpand[`foreignEduFileIdList${item}`]}
                disabled={mode !== 'EDIT'}
              />
            </BusinessForm>
          </div>
        ))}

        {/*专业技能资质*/}
        <BusinessForm
          title="专业技能资质"
          form={form}
          formData={newPersonExpand}
          // formMode={mode === 'EDIT' ? formMode : 'DESCRIPTION'}
          defaultColumnStyle={8}
        >
          <FormItem
            fieldType="BaseInput"
            label="名称"
            fieldKey="skillName"
            disabled={mode !== 'EDIT'}
          />
          <FormItem
            fieldType="BaseDatePicker"
            label="获证日期"
            fieldKey="skillDate"
            disabled={mode !== 'EDIT'}
          />
          <FormItem
            fieldType="BaseInput"
            label="等级"
            fieldKey="skillLevel"
            disabled={mode !== 'EDIT'}
          />
        </BusinessForm>

        {/*家庭成员*/}
        <div>
          <ButtonCard>
            <span style={{ fontSize: '25px', fontWeight: 500, marginRight: '10px' }}>
              家庭成员简介
            </span>
            {mode === 'EDIT' && (
              <Button
                size="large"
                type="primary"
                key="add"
                onClick={() => {
                  this.addFamily();
                }}
              >
                添加家庭成员
              </Button>
            )}
          </ButtonCard>
        </div>
        {familyList.map((item, index) => (
          <div>
            {index !== 0 && (
              <Icon
                type="minus-circle"
                style={{ marginLeft: 30, cursor: 'pointer', color: 'red' }}
                onClick={() => this.delFamily(index)}
              />
            )}
            <BusinessForm
              title={`家庭成员${index + 1}`}
              form={form}
              formData={newPersonExpand}
              // formMode={mode === 'EDIT' ? formMode : 'DESCRIPTION'}
              defaultColumnStyle={8}
            >
              <FormItem
                fieldType="BaseInput"
                label="姓名"
                fieldKey={`familyName${item}`}
                disabled={mode !== 'EDIT'}
              />
              <FormItem
                fieldType="BaseInput"
                label="关系"
                fieldKey={`familyRelation${item}`}
                disabled={mode !== 'EDIT'}
              />
              <FormItem
                fieldType="BaseDatePicker"
                label="出生年月"
                fieldKey={`familyBirthday${item}`}
                disabled={mode !== 'EDIT'}
              />
              <FormItem
                fieldType="BaseInput"
                label="工作单位"
                fieldKey={`familyCompany${item}`}
                disabled={mode !== 'EDIT'}
              />
              <FormItem
                fieldType="BaseInput"
                label="职务"
                fieldKey={`familyPosition${item}`}
                disabled={mode !== 'EDIT'}
              />
            </BusinessForm>
          </div>
        ))}

        {/*其他*/}
        <BusinessForm
          title="其他"
          form={form}
          formData={newPersonExpand}
          // formMode={mode === 'EDIT' ? formMode : 'DESCRIPTION'}
          defaultColumnStyle={24}
        >
          <FormItem
            fieldType="BaseRadioSelect"
            label="你是否有亲属在/曾经在柠萌影业工作？"
            fieldKey="kinsfolkWorked"
            options={[{ label: '否', value: 'N' }, { label: '是', value: 'Y' }]}
            disabled={mode !== 'EDIT'}
            onChange={value => {
              this.setState({ kwFlag: value });
            }}
          />
          {kwFlag === 'Y' ? (
            <FormItem
              fieldType="BaseInput"
              label="姓名"
              fieldKey="kwName"
              disabled={mode !== 'EDIT'}
              wrapperCol={{ span: 6 }}
              labelCol={{ span: 6 }}
            />
          ) : (
            <></>
          )}
          {kwFlag === 'Y' ? (
            <FormItem
              fieldType="BaseInput"
              label="关系"
              fieldKey="kwRelation"
              disabled={mode !== 'EDIT'}
              wrapperCol={{ span: 6 }}
              labelCol={{ span: 6 }}
            />
          ) : (
            <></>
          )}
          {kwFlag === 'Y' ? (
            <FormItem
              fieldType="BaseInput"
              label="部门及职务"
              fieldKey="kwBuOrPosition"
              disabled={mode !== 'EDIT'}
              wrapperCol={{ span: 6 }}
              labelCol={{ span: 6 }}
            />
          ) : (
            <></>
          )}

          <FormItem
            fieldType="BaseRadioSelect"
            label="你是否有亲属在竞争对手公司（包括但不限于正午阳光、华策影视、慈文传媒、耀客传媒、新丽传媒、优酷系、腾讯系、爱奇艺系、芒果系、头条系、哔哩哔哩、抖音、快手、欢喜首映等）工作？"
            fieldKey="kinsfolkWorkedOpponent"
            options={[{ label: '否', value: 'N' }, { label: '是', value: 'Y' }]}
            // labelCol={{ span: 24 }}
            disabled={mode !== 'EDIT'}
            onChange={value => {
              this.setState({ kwoFlag: value });
            }}
          />
          {kwoFlag === 'Y' ? (
            <FormItem
              fieldType="BaseInput"
              label="姓名"
              fieldKey="kwoName"
              disabled={mode !== 'EDIT'}
              wrapperCol={{ span: 6 }}
              labelCol={{ span: 6 }}
            />
          ) : (
            <></>
          )}
          {kwoFlag === 'Y' ? (
            <FormItem
              fieldType="BaseInput"
              label="关系"
              fieldKey="kwoRelation"
              disabled={mode !== 'EDIT'}
              wrapperCol={{ span: 6 }}
              labelCol={{ span: 6 }}
            />
          ) : (
            <></>
          )}
          {kwoFlag === 'Y' ? (
            <FormItem
              fieldType="BaseInput"
              label="部门及职务"
              fieldKey="kwoBuOrPosition"
              disabled={mode !== 'EDIT'}
              wrapperCol={{ span: 6 }}
              labelCol={{ span: 6 }}
            />
          ) : (
            <></>
          )}
          <FormItem
            fieldType="BaseRadioSelect"
            label="是否和柠萌存在其他利益关系"
            fieldKey="otherInterest"
            options={[{ label: '否', value: 'N' }, { label: '是', value: 'Y' }]}
            disabled={mode !== 'EDIT'}
            onChange={value => {
              this.setState({ otherFlag: value });
            }}
          />
          {otherFlag === 'Y' ? (
            <FormItem
              fieldType="BaseInputTextArea"
              label="如果有，请详述"
              fieldKey="otherInterestRemark"
              disabled={mode !== 'EDIT'}
              options={[{ label: '否', value: 'N' }, { label: '是', value: 'Y' }]}
              wrapperCol={{ span: 6 }}
              labelCol={{ span: 6 }}
            />
          ) : (
            <></>
          )}
        </BusinessForm>
      </PageWrapper>
    );
  }
}

export default InformationElement;
