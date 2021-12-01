import React from 'react';
import { connect } from 'dva';
import { isEmpty, omit } from 'ramda';
import { Form } from 'antd';
// 产品化组件
import BusinessForm from '@/components/production/business/BusinessForm';
import FormItem from '@/components/production/business/FormItem';
import PageWrapper from '@/components/production/layout/PageWrapper';
import ButtonCard from '@/components/production/layout/ButtonCard';
import Button from '@/components/production/basic/Button';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import { fromQs } from '@/utils/production/stringUtil';
import { systemLocaleListPaging } from '@/services/production/system';
import moment from 'moment';
import createMessage from '../../../../components/core/AlertMessage';

// 业务组件
import InformationElement from './entry/InformationElement';

// namespace声明
const DOMAIN = 'informationDisplay';

/**
 * 单表案例 综合展示页面
 */
@connect(({ loading, dispatch, informationDisplay, information, user: { user } }) => ({
  loading: loading.effects[`${DOMAIN}/init`] || loading.effects[`${DOMAIN}/save`],
  dispatch,
  ...informationDisplay,
  information,
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
@mountToTab()
class InformationDisplay extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      peId: undefined,
      // peResId: undefined,
    };
  }

  componentDidMount() {
    // 调用页面载入初始化方法,一般是请求页面数据
    // fromQs 方法从url获取路径参数，仅能在组件加载时调用一次，且只能在一级组件调用，后续在组件内部维护自己的url参数。否则多TAB体系可能会出BUG
    const { id, mode, key, flag } = fromQs();
    const { peId, peResId } = this.state;
    const formMode = mode === 'edit' || mode === 'EDIT' ? 'EDIT' : 'DESCRIPTION';
    const checked = flag === 'CHECK';
    // 把url的参数保存到state
    this.updateModelState({ formMode });
    this.callModelEffects('updateForm', { id });
    this.callModelEffects('init').then(res => {
      if (res) {
        const { personExpand } = res;
        this.setState({
          peId: personExpand && personExpand.id,
          // peResId: personExpand && personExpand.resId,
        });
      }
    });
  }

  componentWillUnmount() {
    // 页面卸载时清理model层state,防止再次进入时错误显示
    this.callModelEffects('cleanState');
  }

  fetchData = async params => {
    const { response } = await systemLocaleListPaging(params);
    return response.data;
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

  /**
   * 切换编辑模式
   */
  switchEdit = () => {
    this.callModelEffects('init');
    this.updateModelState({ formMode: 'EDIT' });
  };

  // 附件上传前回调
  beforeUpload = file => {
    const isJpgOrPng = ['image/jpeg', 'image/png'].includes(file.type);
    // 限制个人生活照只能是图片形式
    if (!isJpgOrPng) {
      createMessage({
        type: 'error',
        description: '个人生活照只能是图片',
      });
    }
    return isJpgOrPng;
  };

  handleSave = async (param, cb) => {
    const { peId } = this.state;
    const {
      formData,
      modifyFormData,
      information,
      infoForm,
      form: { validateFieldsAndScroll },
    } = this.props;
    const { resId } = fromQs();
    const {
      workList = [],
      eduList = [],
      familyList = [],
      modifyFormData: infoModifyFormData,
    } = information;
    const infoRes = infoForm && (await infoForm.validateFields());
    if (infoModifyFormData.birthday) {
      infoModifyFormData.birthday = moment(infoModifyFormData?.birthday).format('YYYY-MM-DD');
    }
    if (infoModifyFormData.firstWorkTime) {
      infoModifyFormData.firstWorkTime = moment(infoModifyFormData?.firstWorkTime).format(
        'YYYY-MM-DD',
      );
    }
    if (infoModifyFormData.skillDate) {
      infoModifyFormData.skillDate = moment(infoModifyFormData?.skillDate).format('YYYY-MM-DD');
    }
    if (infoModifyFormData.idCardFileIdList) {
      infoModifyFormData.idCardFileIdList =
        typeof infoModifyFormData.idCardFileIdList[0] === 'number'
          ? infoModifyFormData.idCardFileIdList
          : infoModifyFormData.idCardFileIdList.map((item, index) => item.id);
    }

    const filterArr = [];
    let workItem; //工作经历
    const personWorkList = []; //工作经历列表
    if (workList.length > 0 && infoRes) {
      // eslint-disable-next-line array-callback-return
      workList.map((item, index) => {
        workItem = {
          workStartDate: infoRes[`workStartDate${item}`]
            ? moment(infoRes[`workStartDate${item}`]).format('YYYY-MM-DD')
            : '',
          workEndDate: infoRes[`workEndDate${item}`]
            ? moment(infoRes[`workEndDate${item}`]).format('YYYY-MM-DD')
            : '',
          workCompany: infoRes[`workCompany${item}`],
          workBuOrPosition: infoRes[`workBuOrPosition${item}`],
          workProvinceCode: infoRes[`workProvinceCode${item}`],
          workCityCode: infoRes[`workCityCode${item}`],
        };

        filterArr.push(
          `workStartDate${item}`,
          `workEndDate${item}`,
          `workCompany${item}`,
          `workBuOrPosition${item}`,
          `workProvinceCode${item}`,
          `workCityCode${item}`,
        );

        personWorkList.push(workItem);
      });
    }

    // 教育背景
    let eduItem;
    const personEduList = [];
    if (eduList.length > 0 && infoRes) {
      // eslint-disable-next-line array-callback-return
      eduList.map((item, index) => {
        eduItem = {
          eduStartDate: infoRes[`eduStartDate${item}`]
            ? moment(infoRes[`eduStartDate${item}`]).format('YYYY-MM-DD')
            : '',
          eduEndDate: infoRes[`eduEndDate${item}`]
            ? moment(infoRes[`eduEndDate${item}`]).format('YYYY-MM-DD')
            : '',
          eduName: infoRes[`eduName${item}`],
          major: infoRes[`major${item}`],
          diploma: infoRes[`diploma${item}`],
          degreeFileIdList:
            infoRes[`degreeFileIdList${item}`] &&
            (typeof infoRes[`degreeFileIdList${item}`][0] === 'number'
              ? infoRes[`degreeFileIdList${item}`]
              : infoRes[`degreeFileIdList${item}`].map((i, j) => i.id)),
          eduFileIdList:
            infoRes[`eduFileIdList${item}`] &&
            (typeof infoRes[`eduFileIdList${item}`][0] === 'number'
              ? infoRes[`eduFileIdList${item}`]
              : infoRes[`eduFileIdList${item}`].map((i, j) => i.id)),
          foreignEduFileIdList:
            infoRes[`foreignEduFileIdList${item}`] &&
            // eslint-disable-next-line no-nested-ternary
            (infoRes[`foreignEduFileIdList${item}`]
              ? typeof infoRes[`foreignEduFileIdList${item}`][0] === 'number'
                ? infoRes[`foreignEduFileIdList${item}`]
                : infoRes[`foreignEduFileIdList${item}`].map((i, j) => i.id)
              : undefined),
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
          `foreignEduFileIdList${item}`,
        );
      });
    }

    // 家庭成员列表
    let familyItem;
    const personFamilyList = [];
    if (familyList.length > 0 && infoRes) {
      // eslint-disable-next-line array-callback-return
      familyList.map((item, index) => {
        familyItem = {
          familyName: infoRes[`familyName${item}`],
          familyRelation: infoRes[`familyRelation${item}`],
          familyBirthday: infoRes[`familyBirthday${item}`]
            ? moment(infoRes[`familyBirthday${item}`]).format('YYYY-MM-DD')
            : '',
          familyCompany: infoRes[`familyCompany${item}`],
          familyPosition: infoRes[`familyPosition${item}`],
        };
        personFamilyList.push(familyItem);
        filterArr.push(
          `familyName${item}`,
          `familyRelation${item}`,
          `familyBirthday${item}`,
          `familyCompany${item}`,
          `familyPosition${item}`,
        );
      });
    }
    const params = omit(filterArr, infoModifyFormData);
    params.personWorkList = personWorkList;
    params.personEduList = personEduList;
    params.personFamilyList = personFamilyList;
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        const { id } = formData;
        const { pResId = undefined } = modifyFormData;
        let IpResId;
        if (pResId) {
          IpResId = parseInt(pResId, 10);
          modifyFormData.pResId = IpResId;
        }
        if (modifyFormData.lifePhoto && modifyFormData.lifePhoto?.length > 1) {
          createMessage({
            type: 'error',
            description: '只能上传1张个人生活照',
          });
          return;
        }
        this.callModelEffects('save', {
          formData: {
            id,
            ...modifyFormData,
            personExpand: {
              ...params,
              resId,
              id: peId,
            },
          },
          cb,
        });
      }
    });
  };

  /**
   * 时间设置为null
   */
  // setTimeNull = () => {
  //   const {
  //     formData: { id },
  //   } = this.props;
  //   this.callModelEffects('setTimeNull', { id, nullFields: ['testTime'] });
  // };

  render() {
    const {
      form,
      formData,
      formMode,
      loading,
      user: { extInfo = {} }, // 取当前登陆人的resId
    } = this.props;
    const { id, mode } = fromQs();
    return (
      <PageWrapper loading={loading}>
        <ButtonCard>
          {mode === 'EDIT'
            ? [
              <Button
                size='large'
                type='primary'
                onClick={() => {
                  this.handleSave({ submit: false }, () => {
                    closeThenGoto(`/hr/resource/information?refresh=` + new Date().valueOf());
                  });
                }}
                loading={loading}
              >
                保存
              </Button>,
            ]
            : [
              <a
                href={`/print?scope=INFO&id=${formData.id}`}
                target='_blank'
                rel='noopener noreferrer'
              >
                <Button size='large' type='primary' loading={loading}>
                  打印
                </Button>
              </a>,
            ]}
        </ButtonCard>
        <BusinessForm
          title='基本信息'
          form={form}
          formData={formData}
          formMode={mode === 'EDIT' ? formMode : 'DESCRIPTION'}
          defaultColumnStyle={8}
        >
          <FormItem required fieldType='BaseInput' label='用户名' fieldKey='login' />

          <FormItem fieldType='BaseInput' label='姓名' fieldKey='name' required />

          <FormItem required fieldType='BaseInput' label='员工编号' fieldKey='resNo' />

          <FormItem
            fieldType='BaseAllOuSimpleSelect'
            label='所属公司'
            fieldKey='ouId'
            required
            descriptionRender={formData.ouName}
          />

          <FormItem
            fieldType='BuSimpleSelect'
            label='所属BU'
            fieldKey='buId'
            required
            descriptionRender={formData.buName}
          />

          <FormItem
            fieldType='BaseCustomSelect'
            label='工作地'
            fieldKey='baseCity'
            parentKey='CUS:CITY'
            required
          />

          <FormItem
            fieldType='BaseCustomSelect'
            label='职级'
            fieldKey='jobGrade'
            parentKey='CUS:JOB_GRADE'
            descriptionRender={formData.jobGrade}
          />

          <FormItem fieldType='BaseInput' label='职位' fieldKey='position' />

          <FormItem
            fieldType='ResSimpleSelect'
            label='直属上级'
            fieldKey='parentResId'
            descriptionRender={formData.presName}
          />

          <FormItem fieldType='BaseDatePicker' label='入职日期' fieldKey='enrollDate' defaultShow />

          <FormItem fieldType='BaseInputNumber' label='手机号' fieldKey='phone' />

          <FormItem required fieldType='BaseInput' label='工作邮箱' fieldKey='email' />

          <FormItem fieldType='BaseDatePicker' label='生日' fieldKey='birthday' />

          <FormItem
            fieldType='BaseSelect'
            label='资源类型'
            fieldKey='resType1'
            descList={[
              { value: 'INTERNAL_RES', title: '内部资源' },
              { value: 'EXTERNAL_RES', title: '外部资源' },
            ]}
          />

          <FormItem fieldType='BaseSelect' label='性别' fieldKey='gender' parentKey='COM:GENDER' />

          <FormItem fieldType='BaseInput' label='银行' fieldKey='bankName' />

          <FormItem fieldType='BaseInput' label='户名' fieldKey='holderName' />

          <FormItem fieldType='BaseInput' label='银行账号' fieldKey='accountNo' />

          <FormItem
            fieldType='FileUpload'
            fieldKey='contract'
            key='contract'
            label='合同'
            multiple
            fileList={formData.contracts}
          />
          <FormItem
            fieldType='FileUpload'
            fieldKey='confidentiality'
            label='保密协议'
            multiple
            fileList={formData.confidentialitys}
          />
          <FormItem
            fieldType='FileUpload'
            fieldKey='resume'
            label='简历'
            multiple
            fileList={formData.resumes}
          />
          <FormItem
            fieldType='FileUpload'
            fieldKey='lifePhoto'
            label='个人生活照'
            multiple={false}
            beforeUpload={this.beforeUpload}
            fileList={formData.lifePhotos}
          />
          <FormItem fieldType='BaseDatePicker' label='合同开始日期' fieldKey='contractSignDate' />
          <FormItem fieldType='BaseDatePicker' label='合同结束日期' fieldKey='contractExpireDate' />
        </BusinessForm>
        <InformationElement id={id} />
      </PageWrapper>
    );
  }
}

export default InformationDisplay;
