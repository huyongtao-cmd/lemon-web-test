/* eslint-disable array-callback-return */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-shadow */
/* eslint-disable prefer-const */
/* eslint-disable dot-notation */
/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable no-nested-ternary */

import React, { Component } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Tooltip,
  Icon,
  Cascader,
  Select,
  Row,
  Col,
  Checkbox,
  Radio,
  DatePicker,
  Button,
  AutoComplete,
} from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import { omit, isNil, isEmpty } from 'ramda';

// 产品化组件
import { fromQs } from '@/utils/production/stringUtil';
import { UdcSelect, Selection } from '@/pages/gen/field';
import { queryUdc, queryCascaderUdc } from '@/services/gen/app';
import FileUpload from '@/components/common/FileUpload';
import createMessage from '@/components/core/AlertMessage';

import PageWrapper from '@/components/production/layout/PageWrapper';
// import Button from '@/components/production/basic/Button';
import { closeThenGoto } from '@/layouts/routerControl';
import styles from './info.less';

// namespace声明
const DOMAIN = 'information';

const { Option } = Select;
const AutoCompleteOption = AutoComplete.Option;

/***
 * 员工信息录入
 */
@connect(({ loading, dispatch, information, user: { user } }) => ({
  loading: loading.effects[`${DOMAIN}/init`] || loading.effects[`${DOMAIN}/save`],
  dispatch,
  ...information,
  user,
}))
@Form.create()
class InfoEntry extends React.PureComponent {
  state = {
    confirmDirty: false,
    provinceList: [],
    qualificationList: [],
    workList: [0],
    eduList: [0],
    familyList: [0],
    kwFlag: 'N',
    kwoFlag: 'N',
    otherFlag: 'N',
    lifePhoto: [],
    lifeFileList: [],
    submitFlag: false,
    idList: [],
  };

  componentDidMount() {
    const { dispatch, form } = this.props;

    // 调用页面载入初始化方法,一般是请求页面数据
    // fromQs 方法从url获取路径参数，仅能在组件加载时调用一次，且只能在一级组件调用，后续在组件内部维护自己的url参数。否则多TAB体系可能会出BUG
    const { id, mode, taskId, flag } = fromQs();
    // const formMode = mode === 'edit' || mode === 'EDIT' ? 'EDIT' : 'DESCRIPTION';
    const formMode = 'edit';
    const checked = flag === 'CHECK';
    // 把url的参数保存到state
    this.updateModelState({ formMode });
    this.callModelEffects('updateForm', { id });
    // this.callModelEffects('init');
    this.callModelEffects('init');
    this.callModelEffects('getBaseInfo', id);
    this.callModelEffects('getExInfo', id);

    dispatch({
      type: `${DOMAIN}/queryProvince`,
    }).then(listData => this.setState({ provinceList: listData }));

    dispatch({
      type: `${DOMAIN}/queryEducation`,
    }).then(list => this.setState({ qualificationList: list }));

    dispatch({
      type: `${DOMAIN}/getExInfo`,
      payload: id,
    }).then(data => {
      if (data) {
        const { personWorkList = [], personEduList = [], personFamilyList = [] } = data;
        const workList = [];
        const eduList = [];
        const familyList = [];
        const workCityList = [];
        this.getCity(data?.censusRegistrationPc, 'cenCityList');
        this.getCity(data?.documentPlacePc, 'docCityList');
        data.birthday = data?.birthday === null ? undefined : moment(data?.birthday);
        data.firstWorkTime = data?.firstWorkTime === null ? undefined : moment(data?.firstWorkTime);
        data.skillDate = data?.skillDate === null ? undefined : moment(data?.skillDate);
        for (let i = 0; i < personWorkList.length; i++) {
          workList.push(i);
          data[`workStartDate${i}`] =
            personWorkList[i]?.workStartDate === null
              ? undefined
              : moment(personWorkList[i]?.workStartDate);
          data[`workEndDate${i}`] =
            personWorkList[i]?.workEndDate === null
              ? undefined
              : moment(personWorkList[i]?.workEndDate);
          data[`workCompany${i}`] = personWorkList[i]?.workCompany;
          data[`workBuOrPosition${i}`] = personWorkList[i]?.workBuOrPosition;
          data[`workProvinceCode${i}`] = personWorkList[i]?.workProvinceCode;
          data[`workCityCode${i}`] = personWorkList[i]?.workCityCode;

          this.setState({ [`workCity${i}`]: [] }, () =>
            this.getCity(personWorkList[i]?.workProvinceCode, `workCity${i}`)
          );
        }
        for (let i = 0; i < personEduList.length; i++) {
          eduList.push(i);
          data[`eduStartDate${i}`] =
            personEduList[i]?.eduStartDate === null
              ? undefined
              : moment(personEduList[i]?.eduStartDate);
          data[`eduEndDate${i}`] =
            personEduList[i]?.eduEndDate === null
              ? undefined
              : moment(personEduList[i]?.eduEndDate);
          data[`eduName${i}`] = personEduList[i]?.eduName;
          data[`major${i}`] = personEduList[i]?.major;
          data[`diploma${i}`] = personEduList[i]?.diploma;
          data[`degreeFileIdList${i}`] = personEduList[i]?.degreeFileIdList;
          data[`eduFileIdList${i}`] = personEduList[i]?.eduFileIdList;
          data[`foreignEduFileIdList${i}`] = personEduList[i]?.foreignEduFileIdList;
          this.setState({
            [`degreeFileIdList${i}`]: personEduList[i]?.degreeFileIdList,
            [`eduFileIdList${i}`]: personEduList[i]?.eduFileIdList,
            [`foreignEduFileIdList${i}`]: personEduList[i]?.foreignEduFileIdList,
          });
        }
        for (let i = 0; i < personFamilyList.length; i++) {
          familyList.push(i);
          data[`familyName${i}`] = personFamilyList[i]?.familyName;
          data[`familyRelation${i}`] = personFamilyList[i]?.familyRelation;
          data[`familyBirthday${i}`] =
            personFamilyList[i]?.familyBirthday === null
              ? undefined
              : moment(personFamilyList[i]?.familyBirthday);
          data[`familyCompany${i}`] = personFamilyList[i]?.familyCompany;
          data[`familyPosition${i}`] = personFamilyList[i]?.familyPosition;
        }
        this.setState({
          workList,
          eduList,
          familyList,
          kwFlag: data?.kinsfolkWorked,
          kwoFlag: data?.kinsfolkWorkedOpponent,
          otherFlag: data?.otherInterest,
          idCardFileIdList: data?.idCardFileIdList,
          lifePhoto: data?.lifePhoto,
          submitFlag: data?.submitFlag ?? false,
        });
        form.setFieldsValue(data);
      }
    });
  }

  componentWillUnmount() {
    // 页面卸载时清理model层state,防止再次进入时错误显示
    this.callModelEffects('cleanState');
  }

  // getProvince = async () => {
  //   // const provinceList = await queryUdc('COM:PROVINCE').then(resp => resp.response);
  //   const { dispatch } = this.props;
  //   dispatch({
  //     type: `${DOMAIN}/queryProvince`,
  //     // payload: params,
  //   }).then(listData => this.setState({ provinceList: listData }));
  //   const qualificationList = await queryUdc('COM:EDUCATION').then(resp => resp.response);
  //   this.setState({ qualificationList });
  // };

  getCity = async (province, listName, formFeild) => {
    const { form, dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/queryCity`,
      payload: province,
    }).then(listData => this.setState({ [listName]: listData }));
    // const listData = await queryCascaderUdc({
    //   defId: 'COM:CITY',
    //   parentDefId: 'COM:PROVINCE',
    //   parentVal: province,
    // }).then(resp => resp.response);
    // this.setState({ [listName]: listData });
    form.setFieldsValue({ [formFeild]: undefined });
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

  handleSubmit = e => {
    e.preventDefault();
    const { workList = [], eduList = [], familyList = [] } = this.state;
    const { baseInfo, personInfo, form, dispatch } = this.props;
    form.validateFields((err, values) => {
      console.log(values, 'values');
      if (!err) {
        values.birthday = moment(values?.birthday).format('YYYY-MM-DD');
        values.firstWorkTime = moment(values?.firstWorkTime).format('YYYY-MM-DD');
        values.skillDate =
          values.skillDate === null ? undefined : moment(values?.skillDate).format('YYYY-MM-DD');
        if (values.lifePhoto?.length > 1) {
          createMessage({ type: 'error', description: '生活照最多提交一张' });
          return;
        }
        values.idCardFileIdList =
          typeof values.idCardFileIdList[0] === 'number'
            ? values.idCardFileIdList
            : values.idCardFileIdList.map((item, index) => item.id);
        if (values.lifePhoto) {
          values.lifePhoto =
            typeof values.lifePhoto[0] === 'number'
              ? values.lifePhoto
              : values.lifePhoto.map((item, index) => item.id);
        }

        let filterArr = [];
        let workItem; //工作经历
        let personWorkList = []; //工作经历列表
        if (workList.length !== 0) {
          workList.map((item, index) => {
            workItem = {
              workStartDate: values[`workStartDate${item}`]
                ? moment(values[`workStartDate${item}`]).format('YYYY-MM-DD')
                : '',
              workEndDate: values[`workEndDate${item}`]
                ? moment(values[`workEndDate${item}`]).format('YYYY-MM-DD')
                : '',
              workCompany: values[`workCompany${item}`],
              workBuOrPosition: values[`workBuOrPosition${item}`],
              workProvinceCode: values[`workProvinceCode${item}`],
              workCityCode: values[`workCityCode${item}`],
            };
            filterArr.push(
              `workStartDate${item}`,
              `workEndDate${item}`,
              `workCompany${item}`,
              `workBuOrPosition${item}`,
              `workProvinceCode${item}`,
              `workCityCode${item}`
            );
            personWorkList.push(workItem);
          });
        }
        let eduItem;
        let personEduList = [];
        if (eduList.length !== 0) {
          eduList.map((item, index) => {
            eduItem = {
              eduStartDate: values[`eduStartDate${item}`]
                ? moment(values[`eduStartDate${item}`]).format('YYYY-MM-DD')
                : '',
              eduEndDate: values[`eduEndDate${item}`]
                ? moment(values[`eduEndDate${item}`]).format('YYYY-MM-DD')
                : '',
              eduName: values[`eduName${item}`],
              major: values[`major${item}`],
              diploma: values[`diploma${item}`],
              degreeFileIdList:
                typeof values[`degreeFileIdList${item}`][0] === 'number'
                  ? values[`degreeFileIdList${item}`]
                  : values[`degreeFileIdList${item}`].map((item, index) => item.id),
              eduFileIdList:
                typeof values[`eduFileIdList${item}`][0] === 'number'
                  ? values[`eduFileIdList${item}`]
                  : values[`eduFileIdList${item}`].map((item, index) => item.id),
              foreignEduFileIdList: values[`foreignEduFileIdList${item}`]
                ? typeof values[`foreignEduFileIdList${item}`][0] === 'number'
                  ? values[`foreignEduFileIdList${item}`]
                  : values[`foreignEduFileIdList${item}`].map((item, index) => item.id)
                : undefined,
            };
            personEduList.push(eduItem);
            filterArr.push(
              `eduStartDate${item}`,
              `eduEndDate${item}`,
              `eduName${item}`,
              `major${item}`,
              `diploma${item}`,
              `degreeFileIdList${item}`,
              `eduFileIdList${item}`,
              `foreignEduFileIdList${item}`
            );
          });
        }
        // 家庭成员列表
        let familyItem;
        let personFamilyList = [];
        if (familyList.length !== 0) {
          familyList.map((item, index) => {
            familyItem = {
              familyName: values[`familyName${item}`],
              familyRelation: values[`familyRelation${item}`],
              familyBirthday: values[`familyBirthday${item}`]
                ? moment(values[`familyBirthday${item}`]).format('YYYY-MM-DD')
                : '',
              familyCompany: values[`familyCompany${item}`],
              familyPosition: values[`familyPosition${item}`],
            };
            personFamilyList.push(familyItem);
            filterArr.push(
              `familyName${item}`,
              `familyRelation${item}`,
              `familyBirthday${item}`,
              `familyCompany${item}`,
              `familyPosition${item}`
            );
          });
        }
        const params = omit(filterArr, values);
        params.personWorkList = personWorkList;
        params.personEduList = personEduList;
        params.personFamilyList = personFamilyList;
        params.resId = baseInfo?.resId;
        params.id = personInfo?.id;
        // params.submitFlag = false;
        params.submitFlag = true;
        // this.callModelEffects('addPersonInfo', params);
        dispatch({
          type: `${DOMAIN}/addPersonInfo`,
          payload: params,
        }).then(response => {
          if (response.ok) {
            createMessage({ type: 'success', description: '提交成功' });
            this.setState({
              submitFlag: true,
            });
          } else {
            createMessage({ type: 'error', description: '提交失败，请重试' });
          }
        });
      }
    });
  };

  addWork = () => {
    const { workList } = this.state;
    const workListc = [...workList];
    workListc.push(workListc[workList.length - 1] + 1);
    this.setState({ workList: workListc });
  };

  delWork = index => {
    const { workList } = this.state;
    const workListc = [...workList];
    workListc.splice(index, 1);
    this.setState({ workList: workListc });
  };

  addEdu = () => {
    const { eduList } = this.state;
    const eduListc = [...eduList];
    eduListc.push(eduListc[eduListc.length - 1] + 1);
    this.setState({ eduList: eduListc });
  };

  delEdu = index => {
    const { eduList } = this.state;
    const eduListc = [...eduList];
    eduListc.splice(index, 1);
    this.setState({ eduList: eduListc });
  };

  addFamily = () => {
    const { familyList } = this.state;
    const familyListc = [...familyList];
    familyListc.push(familyListc[familyListc.length - 1] + 1);
    this.setState({ familyList: familyListc });
  };

  delFamily = index => {
    const { familyList } = this.state;
    const familyListc = [...familyList];
    familyListc.splice(index, 1);
    this.setState({ familyList: familyListc });
  };

  // handleChange = info => {
  //   console.log(info, 'info');
  //   let fileList = [...info.fileList];

  //   // 1. Limit the number of uploaded files
  //   // Only to show two recent uploaded files, and old ones will be replaced by the new
  //   fileList = fileList.slice(-2);

  //   // 2. Read from response and show file link
  //   fileList = fileList.map(file => {
  //     if (file.response) {
  //       // Component will show file.url as link
  //       file.url = file.response.url;
  //     }
  //     return file;
  //   });

  //   console.log(fileList, 'fileList');

  //   this.setState({ idList: fileList });
  // };

  render() {
    const {
      form,
      formData,
      formMode,
      loading,
      baseInfo,
      personInfo,
      user: { extInfo = {} }, // 取当前登陆人的resId
    } = this.props;
    // console.log(navigator.userAgent, 'navigator.userAgent;');
    const { getFieldDecorator } = form;
    const {
      provinceList = [],
      cenCityList = [],
      docCityList = [],
      qualificationList = [],
      workList = [],
      eduList = [],
      familyList = [],
      kwFlag,
      kwoFlag,
      otherFlag,
      idCardFileIdList = [],
      lifePhoto = [],
      idList = [],
      submitFlag,
    } = this.state;
    const tailFormItemLayout = {
      wrapperCol: {
        xs: {
          span: 24,
          offset: 0,
        },
        sm: {
          span: 24,
          offset: 0,
        },
      },
    };

    const formLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 18 },
      },
    };
    return (
      <PageWrapper loading={loading}>
        <div className={styles['infoEntry']}>
          <div className={styles['info-title']}>柠萌影视入职信息登记表</div>
          <div className={styles['title']}>| 基本信息（以下信息不可修改，如有错误请联系HR）</div>
          <div className={styles['base-info']}>
            <div className={styles['info-item']}>
              <div className={styles['label']}>姓名:</div>
              <div className={styles['value']}>{baseInfo?.name}</div>
            </div>
            <div className={styles['info-item']}>
              <div className={styles['label']}>所属公司:</div>
              <div className={styles['value']}>{baseInfo?.ouName}</div>
            </div>
            <div className={styles['info-item']}>
              <div className={styles['label']}>所属BU:</div>
              <div className={styles['value']}>{baseInfo?.buName}</div>
            </div>
            <div className={styles['info-item']}>
              <div className={styles['label']}>Base:</div>
              <div className={styles['value']}>{baseInfo?.baseCityDesc}</div>
            </div>
          </div>
          <div className={styles['title']}>| 补充入职信息（请正确录入以下信息）</div>
          <div className={styles['tip']}>
            申明：本人如实填写上述内容，如有虚假，本人愿承担一切法律责任，并同意公司单方面解除劳动合同。
          </div>
          <Form
            labelCol={{
              xs: { span: 24 },
              sm: { span: 6 },
            }}
            wrapperCol={{
              xs: { span: 24 },
              sm: { span: 18 },
            }}
            onSubmit={this.handleSubmit}
            disabled
          >
            <>
              <div className={styles['two']}>
                <Form.Item label="汉语拼音" {...formLayout}>
                  {getFieldDecorator('pinyin', {
                    rules: [
                      {
                        max: 40,
                        message: '汉语拼音最大长度不能超过40',
                      },
                      {
                        required: true,
                        message: '请输入汉语拼音',
                        whitespace: true,
                      },
                    ],
                  })(<Input disabled={submitFlag} />)}
                </Form.Item>
                <Form.Item label="昵称" {...formLayout}>
                  {getFieldDecorator('nickName', {
                    rules: [
                      { required: false, message: '请输入昵称', whitespace: true },
                      { max: 40, message: '昵称最大长度不能超过40' },
                    ],
                  })(<Input disabled={submitFlag} />)}
                </Form.Item>

                <Form.Item label="性别" {...formLayout}>
                  {getFieldDecorator('gender', {
                    rules: [{ required: true, message: '请选择你的性别' }],
                  })(
                    <Radio.Group disabled={submitFlag}>
                      <Radio value="M">男</Radio>
                      <Radio value="F">女</Radio>
                    </Radio.Group>
                  )}
                </Form.Item>
                <Form.Item label="婚姻状况" {...formLayout}>
                  {getFieldDecorator('marital', {
                    rules: [{ required: true, message: '请选择你的婚姻状况' }],
                  })(
                    <Radio.Group disabled={submitFlag}>
                      <Radio value="MARRIED">已婚</Radio>
                      <Radio value="UNMARRIEDF">未婚</Radio>
                    </Radio.Group>
                  )}
                </Form.Item>
                <Form.Item label="出生日期" {...formLayout}>
                  {getFieldDecorator('birthday', {
                    rules: [{ type: 'object', required: true, message: '请选择你的出生日期' }],
                  })(<DatePicker disabled={submitFlag} />)}
                </Form.Item>

                <Form.Item label="联系电话" {...formLayout}>
                  {getFieldDecorator('phone', {
                    rules: [
                      { required: true, message: '请输入联系电话' },
                      // {
                      //   pattern: /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/,
                      //   message: '请录入正确的手机号码',
                      // },
                      // { type: 'number', message: '联系电话只能是数字类型' },
                    ],
                  })(<Input disabled={submitFlag} />)}
                </Form.Item>
                <Form.Item label="最高学历" {...formLayout}>
                  {getFieldDecorator('qualification', {
                    rules: [{ required: true, message: '请选择最高学历' }],
                  })(
                    <Select
                      // onChange={v => this.getCity(v)}
                      placeholder="选择最高学历"
                      disabled={submitFlag}
                    >
                      {qualificationList.map((item, index) => (
                        <Option value={item?.code}>{item?.name}</Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
                <Form.Item label="是否为党员" {...formLayout}>
                  {getFieldDecorator('partyMember', {
                    rules: [{ required: true, message: '请选择是否为党员' }],
                  })(
                    <Radio.Group disabled={submitFlag}>
                      <Radio value="N">否</Radio>
                      <Radio value="Y">是</Radio>
                    </Radio.Group>
                  )}
                </Form.Item>
                <Form.Item
                  label={
                    <span>
                      <span style={{ color: '#f5222d' }}>*</span>
                      户籍所在地
                    </span>
                  }
                  {...formLayout}
                >
                  <Form.Item label="">
                    {getFieldDecorator('censusRegistrationPc', {
                      rules: [
                        { required: true, message: '请选择户籍所在地省份', whitespace: true },
                      ],
                    })(
                      <Select
                        onChange={v => this.getCity(v, 'cenCityList', 'censusRegistrationCc')}
                        placeholder="选择省份"
                        disabled={submitFlag}
                      >
                        {provinceList.map((item, index) => (
                          <Option value={item?.code}>{item?.name}</Option>
                        ))}
                      </Select>
                    )}
                  </Form.Item>
                  <Form.Item label="">
                    {getFieldDecorator('censusRegistrationCc', {
                      rules: [{ required: true, message: '请选择户籍所在地城市' }],
                    })(
                      <Select placeholder="选择城市" disabled={submitFlag}>
                        {cenCityList?.map((item, index) => (
                          <Option value={item?.code}>{item?.name}</Option>
                        ))}
                      </Select>
                    )}
                  </Form.Item>
                </Form.Item>
                <Form.Item
                  label={
                    <span>
                      <span style={{ color: '#f5222d' }}>*</span>
                      档案所在地
                    </span>
                  }
                  {...formLayout}
                >
                  <Form.Item label="">
                    {getFieldDecorator('documentPlacePc', {
                      rules: [{ required: true, message: '请选择档案所在地省份' }],
                    })(
                      <Select
                        onChange={v => this.getCity(v, 'docCityList', 'documentPlaceCc')}
                        placeholder="选择省份"
                        disabled={submitFlag}
                      >
                        {provinceList.map((item, index) => (
                          <Option value={item?.code}>{item?.name}</Option>
                        ))}
                      </Select>
                    )}
                  </Form.Item>
                  <Form.Item label="">
                    {getFieldDecorator('documentPlaceCc', {
                      rules: [{ required: true, message: '请选择档案所在地城市' }],
                    })(
                      <Select placeholder="选择城市" disabled={submitFlag}>
                        {docCityList.map((item, index) => (
                          <Option value={item?.code}>{item?.name}</Option>
                        ))}
                      </Select>
                    )}
                  </Form.Item>
                </Form.Item>
                <Form.Item label="身份证号码" {...formLayout}>
                  {getFieldDecorator('idNo', {
                    rules: [
                      { required: true, message: '请填写身份证号码', whitespace: true },
                      { len: 18, message: '请填写18位身份证号码' },
                    ],
                  })(<Input disabled={submitFlag} />)}
                </Form.Item>
                <Form.Item label="身份证复印件" {...formLayout}>
                  {getFieldDecorator('idCardFileIdList', {
                    rules: [{ required: true, message: '请上传身份证复印件' }],
                    // rules: [{ required: true, message: '请上传身份证复印件' }],
                  })(
                    <FileUpload
                      // disabled={submitFlag}
                      {...{
                        disabled: submitFlag,
                        fileList: idList,
                        multiple: true,
                        preview: null,
                        required: false,
                        // onChange: this.handleChange,
                      }}
                      fileList={idCardFileIdList}
                    />
                  )}
                </Form.Item>
                <Form.Item label="个人邮箱" {...formLayout}>
                  {getFieldDecorator('email', {
                    rules: [
                      { required: true, message: '请输入个人邮箱', whitespace: true },
                      { type: 'email', message: '请输入符合e-mail格式数据' },
                    ],
                  })(<Input disabled={submitFlag} />)}
                </Form.Item>
                <Form.Item label="首次工作时间" {...formLayout}>
                  {getFieldDecorator('firstWorkTime', {
                    rules: [{ type: 'object', required: true, message: '请选择首次工作时间' }],
                  })(<DatePicker disabled={submitFlag} />)}
                </Form.Item>
                <Form.Item label="招商银行卡号" {...formLayout}>
                  {getFieldDecorator('bankAccountNo', {
                    rules: [{ required: true, message: '请输入招商银行卡号', whitespace: true }],
                  })(<Input disabled={submitFlag} />)}
                </Form.Item>
                <Form.Item label="招商银行卡账户" {...formLayout}>
                  {getFieldDecorator('bankAccountName', {
                    rules: [{ required: true, message: '请输入招商银行卡账户', whitespace: true }],
                  })(<Input disabled={submitFlag} />)}
                </Form.Item>
                <Form.Item label="银行卡开户行" {...formLayout}>
                  {getFieldDecorator('bankName', {
                    rules: [
                      { required: true, message: '请输入招商银行卡开户行', whitespace: true },
                    ],
                  })(<Input disabled={submitFlag} />)}
                </Form.Item>
                <Form.Item label="公积金账号" {...formLayout}>
                  {getFieldDecorator('surplusAccount', {
                    rules: [{ required: true, message: '请输入公积金账号', whitespace: true }],
                  })(<Input disabled={submitFlag} />)}
                </Form.Item>
                <Form.Item label="补充公积金账号" {...formLayout}>
                  {getFieldDecorator('surplusAccountReplenish', {
                    rules: [{ required: false, message: '请输入补充公积金账号', whitespace: true }],
                  })(<Input disabled={submitFlag} />)}
                </Form.Item>
                <Form.Item label="是否有身体残缺或残疾" {...formLayout}>
                  {getFieldDecorator('physicalCondition', {
                    rules: [{ required: false, message: '请选择' }],
                  })(
                    <Radio.Group disabled={submitFlag}>
                      <Radio value="N">否</Radio>
                      <Radio value="Y">是</Radio>
                    </Radio.Group>
                  )}
                </Form.Item>
                <Form.Item label="兴趣爱好" {...formLayout}>
                  {getFieldDecorator('hobby', {
                    rules: [
                      { required: true, message: '请输入兴趣爱好', whitespace: true },
                      { max: 255, message: '兴趣爱好最大长度不能超过255' },
                    ],
                  })(<Input disabled={submitFlag} />)}
                </Form.Item>
                <Form.Item label="生活照" {...formLayout}>
                  {getFieldDecorator('lifePhoto', {
                    rules: [{ required: false, message: '请上传生活照' }],
                    // rules: [{ required: true, message: '请上传身份证复印件' }],
                  })(
                    <FileUpload
                      // disabled={submitFlag}
                      {...{
                        disabled: submitFlag,
                        fileList: idList,
                        multiple: true,
                        preview: null,
                        required: false,
                        // onChange: this.handleChange,
                      }}
                      fileList={lifePhoto}
                    />
                  )}
                </Form.Item>
                <Form.Item label="偶像" {...formLayout}>
                  {getFieldDecorator('idol', {
                    rules: [
                      { required: false, message: '请输入偶像', whitespace: true },
                      { max: 255, message: '偶像最大长度不能超过255' },
                    ],
                  })(<Input disabled={submitFlag} />)}
                </Form.Item>
                <Form.Item label="喜欢的食物" {...formLayout}>
                  {getFieldDecorator('foods', {
                    rules: [
                      { required: false, message: '请输入喜欢的食物', whitespace: true },
                      { max: 255, message: '喜欢的食物最大长度不能超过255' },
                    ],
                  })(<Input disabled={submitFlag} />)}
                </Form.Item>
                <Form.Item label="血型" {...formLayout}>
                  {getFieldDecorator('bloodType', {
                    rules: [{ required: false, message: '请输入血型', whitespace: true }],
                  })(<Input disabled={submitFlag} />)}
                </Form.Item>
                <Form.Item label="上升星座" {...formLayout}>
                  {getFieldDecorator('constellation', {
                    rules: [
                      { required: true, message: '请输入上升星座', whitespace: true },
                      { max: 255, message: '上升星座最大长度不能超过255' },
                    ],
                  })(<Input disabled={submitFlag} />)}
                </Form.Item>
                <Form.Item label="幸运数字" {...formLayout}>
                  {getFieldDecorator('luckyNumbers', {
                    rules: [{ required: false, message: '请输入幸运数字' }],
                  })(<InputNumber disabled={submitFlag} />)}
                </Form.Item>
                <Form.Item label="幸运颜色" {...formLayout}>
                  {getFieldDecorator('luckyColor', {
                    rules: [
                      { required: false, message: '请输入幸运颜色', whitespace: true },
                      { max: 40, message: '幸运颜色最大长度不能超过40' },
                    ],
                  })(<Input disabled={submitFlag} />)}
                </Form.Item>
              </div>
            </>
            <>
              <div className={styles['two']}>
                <Form.Item label="永久地址" {...formLayout}>
                  {getFieldDecorator('addressPermanent', {
                    rules: [
                      { required: true, message: '请输入永久地址', whitespace: true },
                      { max: 255, message: '永久地址最大长度不能超过255' },
                    ],
                  })(<Input disabled={submitFlag} />)}
                </Form.Item>
                <Form.Item label="永久电话" {...formLayout}>
                  {getFieldDecorator('phonePermanent', {
                    rules: [{ required: true, message: '请输入永久电话', whitespace: true }],
                  })(<Input disabled={submitFlag} />)}
                </Form.Item>
                <Form.Item label="临时地址" {...formLayout}>
                  {getFieldDecorator('addressTemp', {
                    rules: [
                      { required: true, message: '请输入临时地址', whitespace: true },
                      { max: 255, message: '临时地址最大长度不能超过255' },
                    ],
                  })(<Input disabled={submitFlag} />)}
                </Form.Item>
                <Form.Item label="临时电话" {...formLayout}>
                  {getFieldDecorator('phoneTemp', {
                    rules: [{ required: true, message: '请输入临时电话', whitespace: true }],
                  })(<Input disabled={submitFlag} />)}
                </Form.Item>
              </div>
            </>
            <>
              <div className={styles['title']}>| 紧急联系人</div>
              <div className={styles['two']}>
                <Form.Item label="姓名" {...formLayout}>
                  {getFieldDecorator('emergentName', {
                    rules: [
                      { required: true, message: '请输入紧急联系人姓名', whitespace: true },
                      { max: 255, message: '临时地址最大长度不能超过255' },
                    ],
                  })(<Input disabled={submitFlag} />)}
                </Form.Item>
                <Form.Item label="关系" {...formLayout}>
                  {getFieldDecorator('emergentRelation', {
                    rules: [
                      { required: true, message: '请输入与紧急联系人关系情况', whitespace: true },
                      { max: 255, message: '临时地址最大长度不能超过255' },
                    ],
                  })(<Input disabled={submitFlag} />)}
                </Form.Item>
                <Form.Item label="电话" {...formLayout}>
                  {getFieldDecorator('emergentPhone', {
                    rules: [{ required: true, message: '请输入紧急联系人电话', whitespace: true }],
                  })(<Input disabled={submitFlag} />)}
                </Form.Item>

                <Form.Item label="住址" {...formLayout}>
                  {getFieldDecorator('emergentAddress', {
                    rules: [
                      { required: true, message: '请输入紧急联系人住址', whitespace: true },
                      { max: 255, message: '临时地址最大长度不能超过255' },
                    ],
                  })(<Input disabled={submitFlag} />)}
                </Form.Item>
              </div>
            </>
            <>
              <div>
                <div
                  className={styles['title']}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <span>| 工作经历(从最近的单位开始)</span>
                  <Icon type="plus-circle" onClick={() => this.addWork()} />
                </div>
                {workList.map((item, index) => (
                  <>
                    <div className={styles['tip']}>
                      <span>{`工作经历${index + 1}`}</span>
                      <Icon
                        type="minus-circle"
                        style={{ marginLeft: 30 }}
                        onClick={() => this.delWork(index)}
                      />
                    </div>
                    <div className={styles['two']}>
                      <Form.Item label="开始时间" {...formLayout}>
                        {getFieldDecorator(`workStartDate${item}`, {
                          rules: [{ required: true, message: '请选择开始时间' }],
                        })(<DatePicker disabled={submitFlag} />)}
                      </Form.Item>
                      <Form.Item label="结束时间" {...formLayout}>
                        {getFieldDecorator(`workEndDate${item}`, {
                          rules: [{ required: true, message: '请选择结束时间' }],
                        })(<DatePicker disabled={submitFlag} />)}
                      </Form.Item>
                      <Form.Item label="单位" {...formLayout}>
                        {getFieldDecorator(`workCompany${item}`, {
                          rules: [{ required: true, message: '请输入工作单位', whitespace: true }],
                        })(<Input disabled={submitFlag} />)}
                      </Form.Item>
                      <Form.Item label="部门及职位" {...formLayout}>
                        {getFieldDecorator(`workBuOrPosition${item}`, {
                          rules: [
                            { required: true, message: '请输入部门及职位', whitespace: true },
                          ],
                        })(<Input disabled={submitFlag} />)}
                      </Form.Item>
                      <Form.Item
                        label={
                          <span>
                            <span style={{ color: '#f5222d' }}>*</span>
                            城市
                          </span>
                        }
                        {...formLayout}
                      >
                        <Form.Item label="">
                          {getFieldDecorator(`workProvinceCode${item}`, {
                            rules: [{ required: true, message: '请选择工作省份' }],
                          })(
                            <Select
                              onChange={v =>
                                this.getCity(v, `workCity${item}`, `workCityCode${item}`)
                              }
                              placeholder="选择省份"
                              disabled={submitFlag}
                            >
                              {provinceList.map((item, index) => (
                                <Option value={item?.code}>{item?.name}</Option>
                              ))}
                            </Select>
                          )}
                        </Form.Item>
                        <Form.Item label="">
                          {getFieldDecorator(`workCityCode${item}`, {
                            rules: [{ required: true, message: '请选择工作城市' }],
                          })(
                            <Select placeholder="选择城市" disabled={submitFlag}>
                              {(this.state[`workCity${item}`] &&
                                this.state[`workCity${item}`]?.map((item, index) => (
                                  <Option value={item?.code}>{item?.name}</Option>
                                ))) ?? <Option value="other">请选择工作城市</Option>}
                            </Select>
                          )}
                        </Form.Item>
                      </Form.Item>
                    </div>
                  </>
                ))}
              </div>
            </>
            <>
              <div>
                <div
                  className={styles['title']}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <span>| 教育背景(从本科/专科写起)</span>
                  <Icon type="plus-circle" onClick={() => this.addEdu()} />
                </div>
                {eduList.map((item, index) => (
                  <>
                    <div className={styles['tip']}>
                      <span>{`教育背景${index + 1}`}</span>
                      <Icon
                        type="minus-circle"
                        style={{ marginLeft: 30 }}
                        onClick={() => this.delEdu(index)}
                      />
                    </div>
                    <div className={styles['two']}>
                      <Form.Item label="开始时间" {...formLayout}>
                        {getFieldDecorator(`eduStartDate${item}`, {
                          rules: [{ required: true, message: '请选择开始时间' }],
                        })(<DatePicker disabled={submitFlag} />)}
                      </Form.Item>
                      <Form.Item label="结束时间" {...formLayout}>
                        {getFieldDecorator(`eduEndDate${item}`, {
                          rules: [{ required: true, message: '请选择结束时间' }],
                        })(<DatePicker disabled={submitFlag} />)}
                      </Form.Item>
                      <Form.Item label="学校名称(全日制)" {...formLayout}>
                        {getFieldDecorator(`eduName${item}`, {
                          rules: [
                            { required: true, message: '请输入学校名称(全日制)', whitespace: true },
                          ],
                        })(<Input disabled={submitFlag} />)}
                      </Form.Item>
                      <Form.Item label="专业" {...formLayout}>
                        {getFieldDecorator(`major${item}`, {
                          rules: [{ required: true, message: '请输入专业', whitespace: true }],
                        })(<Input disabled={submitFlag} />)}
                      </Form.Item>
                      <Form.Item label="文凭" {...formLayout}>
                        {getFieldDecorator(`diploma${item}`, {
                          rules: [{ required: true, message: '请输入文凭', whitespace: true }],
                        })(<Input disabled={submitFlag} />)}
                      </Form.Item>
                      <Form.Item label="学位证书复印件" {...formLayout}>
                        {getFieldDecorator(`degreeFileIdList${item}`, {
                          rules: [{ required: true, message: '请上传学位证书复印件' }],
                          // rules: [{ required: true, message: '请上传学位证书复印件' }],
                        })(
                          <FileUpload
                            {...{
                              disabled: submitFlag,
                              // fileList: [],
                              multiple: true,
                              preview: null,
                              required: false,
                            }}
                            fileList={this.state[`degreeFileIdList${item}`]}
                          />
                        )}
                      </Form.Item>
                      <Form.Item label="学历证书复印件" {...formLayout}>
                        {getFieldDecorator(`eduFileIdList${item}`, {
                          rules: [{ required: true, message: '请上传学历证书复印件' }],
                          // rules: [{ required: true, message: '请上传学历证书复印件' }],
                        })(
                          <FileUpload
                            {...{
                              disabled: submitFlag,
                              // fileList: [],
                              multiple: true,
                              preview: null,
                              required: false,
                            }}
                            fileList={this.state[`eduFileIdList${item}`]}
                          />
                        )}
                      </Form.Item>
                      <Form.Item label="学教育部海外学历认证复印件(留学生适用)" {...formLayout}>
                        {getFieldDecorator(`foreignEduFileIdList${item}`, {
                          rules: [{ required: false, message: '请上传学教育部海外学历认证复印件' }],
                        })(
                          <FileUpload
                            {...{
                              disabled: submitFlag,
                              // fileList: [],
                              multiple: true,
                              preview: null,
                              required: false,
                            }}
                            fileList={this.state[`foreignEduFileIdList${item}`]}
                          />
                        )}
                      </Form.Item>
                    </div>
                  </>
                ))}
              </div>
            </>
            <>
              <div className={styles['title']}>| 专业技能资质</div>
              <div className={styles['two']}>
                <Form.Item label="名称" {...formLayout}>
                  {getFieldDecorator('skillName', {
                    rules: [
                      { required: false, message: '请输入专业技能名称', whitespace: true },
                      { max: 255, message: '专业技能名称最大长度不能超过255', whitespace: true },
                    ],
                  })(<Input disabled={submitFlag} />)}
                </Form.Item>
                <Form.Item label="获证日期" {...formLayout}>
                  {getFieldDecorator('skillDate', {
                    rules: [{ required: false, message: '请选择获证日期' }],
                  })(<DatePicker disabled={submitFlag} />)}
                </Form.Item>
                <Form.Item label="等级" {...formLayout}>
                  {getFieldDecorator('skillLevel', {
                    rules: [
                      { required: false, message: '请输入专业技能等级', whitespace: true },
                      { max: 255, message: '专业技能等级最大长度不能超过255', whitespace: true },
                    ],
                  })(<Input disabled={submitFlag} />)}
                </Form.Item>
              </div>
            </>
            <>
              <div>
                <div
                  className={styles['title']}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <span>| 家庭成员简介</span>
                  <Icon type="plus-circle" onClick={() => this.addFamily()} />
                </div>
                {familyList.map((item, index) => (
                  <>
                    <div className={styles['tip']}>
                      <span>{`家庭成员${index + 1}`}</span>
                      <Icon
                        type="minus-circle"
                        style={{ marginLeft: 30 }}
                        onClick={() => this.delFamily(index)}
                      />
                    </div>
                    <div className={styles['two']}>
                      <Form.Item label="姓名" {...formLayout}>
                        {getFieldDecorator(`familyName${item}`, {
                          rules: [
                            { required: true, message: '请输入家庭成员姓名', whitespace: true },
                            {
                              max: 40,
                              message: '家庭成员姓名最大长度不能超过40',
                              whitespace: true,
                            },
                          ],
                        })(<Input disabled={submitFlag} />)}
                      </Form.Item>
                      <Form.Item label="关系" {...formLayout}>
                        {getFieldDecorator(`familyRelation${item}`, {
                          rules: [
                            { required: true, message: '请输入与家庭成员关系', whitespace: true },
                            { max: 40, message: '与家庭成员关系最大长度不能超过40' },
                          ],
                        })(<Input disabled={submitFlag} />)}
                      </Form.Item>
                      <Form.Item label="出生年月" {...formLayout}>
                        {getFieldDecorator(`familyBirthday${item}`, {
                          rules: [{ required: true, message: '请选择家庭成员出生年月' }],
                        })(<DatePicker disabled={submitFlag} />)}
                      </Form.Item>
                      <Form.Item label="工作单位" {...formLayout}>
                        {getFieldDecorator(`familyCompany${item}`, {
                          rules: [
                            { required: true, message: '请输入家庭成员工作单位', whitespace: true },
                            { max: 40, message: '家庭成员工作单位最大长度不能超过40' },
                          ],
                        })(<Input disabled={submitFlag} />)}
                      </Form.Item>
                      <Form.Item label="职务" {...formLayout}>
                        {getFieldDecorator(`familyPosition${item}`, {
                          rules: [
                            { required: true, message: '请输入家庭成员职务', whitespace: true },
                            { max: 40, message: '家庭成员职务最大长度不能超过40' },
                          ],
                        })(<Input disabled={submitFlag} />)}
                      </Form.Item>
                    </div>
                  </>
                ))}
              </div>
            </>
            <>
              <div className={styles['title']}>| 其他</div>
              <Form.Item
                label="你是否有亲属在/曾经在柠萌影业工作？"
                labelCol={{
                  xs: { span: 24 },
                  sm: { span: 12 },
                }}
                wrapperCol={{
                  xs: { span: 24 },
                  sm: { span: 12 },
                }}
              >
                {getFieldDecorator('kinsfolkWorked', {
                  rules: [{ required: true, message: '请选择' }],
                })(
                  <Radio.Group
                    onChange={e => this.setState({ kwFlag: e.target.value })}
                    disabled={submitFlag}
                  >
                    <Radio value="Y">是</Radio>
                    <Radio value="N">否</Radio>
                  </Radio.Group>
                )}
              </Form.Item>
              {kwFlag === 'Y' && (
                <>
                  <Form.Item label="姓名" {...formLayout}>
                    {getFieldDecorator('kwName', {
                      rules: [
                        { required: true, message: '请输入姓名', whitespace: true },
                        { max: 255, message: '姓名最大长度不能超过255' },
                      ],
                    })(<Input disabled={submitFlag} />)}
                  </Form.Item>
                  <Form.Item label="关系" {...formLayout}>
                    {getFieldDecorator('kwRelation', {
                      rules: [
                        { required: true, message: '请输入关系', whitespace: true },
                        { max: 255, message: '关系最大长度不能超过255' },
                      ],
                    })(<Input disabled={submitFlag} />)}
                  </Form.Item>
                  <Form.Item label="部门及职务" {...formLayout}>
                    {getFieldDecorator('kwBuOrPosition', {
                      rules: [
                        { required: true, message: '请输入部门及职务', whitespace: true },
                        { max: 255, message: '部门及职务最大长度不能超过255' },
                      ],
                    })(<Input disabled={submitFlag} />)}
                  </Form.Item>
                </>
              )}
              <Form.Item
                label="你是否有亲属在竞争对手公司（包括但不限于正午阳光、华策影视、慈文传媒、耀客传媒、新丽传媒、优酷系、腾讯系、爱奇艺系、芒果系、头条系、哔哩哔哩、抖音、快手、欢喜首映等）工作？"
                labelCol={{
                  xs: { span: 24 },
                  sm: { span: 12 },
                }}
                wrapperCol={{
                  xs: { span: 24 },
                  sm: { span: 12 },
                }}
                // {...formLayout}
              >
                {getFieldDecorator('kinsfolkWorkedOpponent', {
                  rules: [{ required: true, message: '请选择' }],
                })(
                  <Radio.Group
                    onChange={e => this.setState({ kwoFlag: e.target.value })}
                    disabled={submitFlag}
                  >
                    <Radio value="Y">是</Radio>
                    <Radio value="N">否</Radio>
                  </Radio.Group>
                )}
              </Form.Item>
              {kwoFlag === 'Y' && (
                <>
                  <Form.Item label="姓名" {...formLayout}>
                    {getFieldDecorator('kwoName', {
                      rules: [
                        { required: true, message: '请输入姓名', whitespace: true },
                        { max: 255, message: '姓名最大长度不能超过255' },
                      ],
                    })(<Input disabled={submitFlag} />)}
                  </Form.Item>
                  <Form.Item label="关系" {...formLayout}>
                    {getFieldDecorator('kwoRelation', {
                      rules: [
                        { required: true, message: '请输入关系', whitespace: true },
                        { max: 255, message: '关系最大长度不能超过255' },
                      ],
                    })(<Input disabled={submitFlag} />)}
                  </Form.Item>
                  <Form.Item label="部门及职务" {...formLayout}>
                    {getFieldDecorator('kwoBuOrPosition', {
                      rules: [
                        { required: true, message: '请输入部门及职务', whitespace: true },
                        { max: 255, message: '部门及职务最大长度不能超过255' },
                      ],
                    })(<Input disabled={submitFlag} />)}
                  </Form.Item>
                </>
              )}
              <Form.Item
                label="是否和柠萌存在其他利益关系"
                labelCol={{
                  xs: { span: 24 },
                  sm: { span: 12 },
                }}
                wrapperCol={{
                  xs: { span: 24 },
                  sm: { span: 12 },
                }}
              >
                {getFieldDecorator('otherInterest', {
                  rules: [{ required: true, message: '请选择' }],
                })(
                  <Radio.Group
                    onChange={e => this.setState({ otherFlag: e.target.value })}
                    disabled={submitFlag}
                  >
                    <Radio value="Y">是</Radio>
                    <Radio value="N">否</Radio>
                  </Radio.Group>
                )}
              </Form.Item>
              {otherFlag === 'Y' && (
                <>
                  <Form.Item label="描述" {...formLayout}>
                    {getFieldDecorator('otherInterestRemark', {
                      rules: [
                        { required: true, message: '请输入描述', whitespace: true },
                        { max: 255, message: '描述最大长度不能超过255' },
                      ],
                    })(<Input.TextArea disabled={submitFlag} />)}
                  </Form.Item>
                </>
              )}
            </>
            {!submitFlag && (
              <Form.Item {...tailFormItemLayout}>
                <div style={{ width: '100%', textAlign: 'center' }}>
                  <Button type="primary" htmlType="submit" style={{ width: '50%' }}>
                    提 交
                  </Button>
                </div>
              </Form.Item>
            )}
          </Form>
        </div>
      </PageWrapper>
    );
  }
}

export default InfoEntry;
