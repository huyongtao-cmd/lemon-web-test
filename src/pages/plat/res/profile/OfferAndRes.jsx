import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import classnames from 'classnames';
import { isEmpty, isNil } from 'ramda';
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Radio,
  TimePicker,
  InputNumber,
  Select,
} from 'antd';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import AsyncSelect from '@/components/common/AsyncSelect';
import SelectWithCols from '@/components/common/SelectWithCols';
import FieldList from '@/components/layout/FieldList';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';
import { UdcSelect, FileManagerEnhance, Selection } from '@/pages/gen/field';
import { selectInternalOus } from '@/services/gen/list';
// import { findBuResRoleSelect } from '@/services/org/bu/component/buResInfo';

const { Field, FieldLine } = FieldList;
const RadioGroup = Radio.Group;
const InputGroup = Input.Group;

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];
const notSubmitColumns = [
  { dataIndex: 'resNO', title: '编号', span: 8 },
  { dataIndex: 'resName', title: '名称', span: 16 },
];

const DOMAIN = 'offerAndRes';

@connect(({ loading, offerAndRes, dispatch }) => ({
  loading,
  offerAndRes,
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
class OfferAndRes extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { id } = fromQs();
    dispatch({ type: `${DOMAIN}/query`, payload: { resId: id } });

    dispatch({ type: `${DOMAIN}/res` });
    dispatch({ type: `${DOMAIN}/bu` });
    dispatch({ type: `${DOMAIN}/noSubmit` });
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
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
      offerAndRes: {
        formData,
        type2Data,
        resData,
        resDataSource,
        baseBuData,
        baseBuDataSource,
        roleData,
        notSubmitList,
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
            className="tw-btn-primary"
            icon="check-circle-fill"
            size="large"
            onClick={this.handleSubmit}
            disabled={disabledBtn}
          >
            {formatMessage({ id: `misc.pass`, desc: '通过' })}
          </Button>
          <Button
            className="tw-btn-primary"
            icon="user"
            size="large"
            // onClick={this.handleSubmit}
            disabled={disabledBtn}
          >
            {formatMessage({ id: `plat.res.offer.createAccount`, desc: '开通账号' })}
          </Button>
          <Button
            className="tw-btn-error"
            icon="close"
            size="large"
            // onClick={this.handleSubmit}
            disabled={disabledBtn}
          >
            {formatMessage({ id: `plat.res.offer.closeFlow`, desc: '关闭流程' })}
          </Button>
          <Button
            className="tw-btn-error"
            icon="close-circle-fill"
            size="large"
            // onClick={this.handleSubmit}
            disabled={disabledBtn}
          >
            {formatMessage({ id: `misc.deny`, desc: '拒绝' })}
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
          title={<Title icon="audit" id="ui.menu.plat.res.checkedIdea" defaultMessage="审批意见" />}
          bordered={false}
        >
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              fieldCol={1}
              // labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 23, xxl: 23 }}
              name="remark"
              label=""
              decorator={{
                initialValue: formData.remark || '',
              }}
            >
              <Input.TextArea placeholder="请输入审核意见" autosize={{ minRows: 4, maxRows: 6 }} />
            </Field>
          </FieldList>
        </Card>
        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={
            <Title icon="profile" id="ui.menu.plat.res.resEnroll" defaultMessage="资源入职申请" />
          }
          bordered={false}
        >
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="resId"
              label="资源"
              decorator={{
                initialValue: formData.id || '',
              }}
            >
              <Selection.Columns
                className="x-fill-100"
                source={notSubmitList}
                columns={notSubmitColumns}
                transfer={{ key: 'id', code: 'id', name: 'resName' }}
                dropdownMatchSelectWidth={false}
                // dropdownStyle={{ width: 440 }}
                showSearch
                disabled
                onColumnsChange={value => {}}
              />
            </Field>
            <Field
              name="gender"
              label="性别"
              decorator={{
                initialValue: formData.gender || 'M',
                rules: [
                  {
                    required: true,
                    message: '请选择性别',
                  },
                ],
              }}
            >
              <UdcSelect code="COM.GENDER" placeholder="请选择性别" disabled />
            </Field>
            <Field
              name="resType"
              label="资源类别"
              decorator={{
                initialValue: formData.resType || 'GENERAL',
                rules: [{ required: true, message: '请选择资源类别' }],
              }}
            >
              <RadioGroup initialValue={formData.resType || ''}>
                <Radio value="GENERAL" defaultChecked="true">
                  一般资源
                </Radio>
                <Radio value=" SALES_BU">销售BU</Radio>
              </RadioGroup>
            </Field>
            <Field
              name="baseBuId"
              label="BaseBU"
              decorator={{
                initialValue: formData.baseBuId || '',
              }}
            >
              <Selection.Columns
                className="x-fill-100"
                source={baseBuDataSource}
                columns={particularColumns}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                dropdownMatchSelectWidth={false}
                // dropdownStyle={{ width: 440 }}
                showSearch
                onColumnsChange={value => {}}
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
              name="preEnrollDate"
              label="预定入职日期"
              decorator={{
                initialValue: formData.enrollDate ? moment(formData.enrollDate) : null,
              }}
            >
              <DatePicker className="x-fill-100" />
            </Field>
            <Field
              name="job"
              label="岗位"
              decorator={{
                initialValue: formData.job || '',
                rules: [
                  {
                    required: true,
                    message: '请输入岗位',
                  },
                ],
              }}
            >
              <Input placeholder="请输入岗位" />
            </Field>
            <Field
              name="jobGrade"
              label="职级"
              decorator={{
                initialValue: formData.jobGrade,
              }}
            >
              <Input placeholder="请输入职级" />
            </Field>
            <Field
              name="eqvaRatio"
              label="当量系数"
              decorator={{
                initialValue: formData.eqvaRatio,
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
              name="coopType"
              label="合作方式"
              decorator={{
                initialValue: formData.coopType,
              }}
            >
              <UdcSelect code="COM.COOPERATION_MODE" placeholder="请选择合作方式" />
            </Field>
            <Field
              name="presId"
              label="直属领导"
              decorator={{
                initialValue: formData.presId || '',
              }}
            >
              <Selection.Columns
                className="x-fill-100"
                source={resDataSource}
                columns={particularColumns}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                dropdownMatchSelectWidth={false}
                // dropdownStyle={{ width: 440 }}
                showSearch
                onColumnsChange={value => {}}
              />
            </Field>
            <Field name="artThumb" label="简历附件">
              <FileManagerEnhance
                api="/api/person/v1/res/personResume/sfs/token"
                listType="text"
                disabled={false}
                multiple={false}
                dataKey={formData.artThumb || ''}
              />
            </Field>
            <Field
              name="remark"
              label={formatMessage({ id: 'sys.system.remark', desc: '备注' })}
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
              decorator={{
                initialValue: formData.remark || '',
              }}
            >
              <Input.TextArea rows={3} placeholder="请输入备注" />
            </Field>
            <Field
              name="applyResId"
              label="申请人"
              decorator={{
                initialValue: formData.applyResName || '',
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="applyDate"
              label="申请时间"
              decorator={{
                initialValue: formData.applyDate || '',
              }}
            >
              <Input disabled />
            </Field>

            <Field
              name="ceoApprFlag"
              label="是否需要总裁审批"
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
              decorator={{
                initialValue: formData.ceoApprFlag || 'GENERAL',
                rules: [{ required: true, message: '请选择是否需要总裁审批' }],
              }}
            >
              <RadioGroup>
                <Radio value="yes">是</Radio>
                <Radio value="no">否</Radio>
              </RadioGroup>
            </Field>
            <Field
              name="foreignName"
              label="英文名"
              decorator={{
                initialValue: formData.foreignName || '',
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
              name="mobile"
              label="手机号"
              decorator={{
                initialValue: formData.mobile || '',
                rules: [
                  {
                    required: true,
                    message: '请输入手机号',
                  },
                ],
              }}
            >
              <Input placeholder="请输入手机号" />
            </Field>

            <Field
              name="idType"
              label="证件类型/号码"
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
              <InputGroup compact style={{ display: 'flex', flexWrap: 'nowrap' }}>
                <Selection.UDC
                  code="COM.ID_TYPE"
                  placeholder="请选择证件类型"
                  style={{ flex: 1 }}
                  value={formData.idType || 'ID_CARD'}
                  onChange={value => {
                    setFieldsValue({ idType: value });
                  }}
                />
                <Input
                  style={{ flex: 3 }}
                  value={formData.idNo || ''}
                  onChange={(e, value) => {
                    dispatch({
                      type: `${DOMAIN}/updateForm`,
                      payload: { idNo: e.target.value },
                    });
                  }}
                  placeholder="请输入证件号码"
                />
              </InputGroup>
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
              name="empNo"
              label="工号"
              decorator={{
                initialValue: formData.empNo,
                rules: [
                  {
                    required: true,
                    message: '请输入工号',
                  },
                ],
              }}
            >
              <Input placeholder="请输入工号" />
            </Field>
            <Field
              name="enrollDate"
              label="入职日期"
              decorator={{
                initialValue: formData.enrollDate ? moment(formData.enrollDate) : null,
                rules: [{ required: true, message: '请选择入职日期' }],
              }}
            >
              <DatePicker className="x-fill-100" />
            </Field>
            <Field
              name="regularDate"
              label="转正日期"
              decorator={{
                initialValue: formData.regularDate ? moment(formData.regularDate) : null,
                rules: [{ required: true, message: '请选择转正日期' }],
              }}
            >
              <DatePicker className="x-fill-100" />
            </Field>
            <Field
              name="contractSignDate"
              label="合同签订日期"
              decorator={{
                initialValue: formData.contractSignDate ? moment(formData.contractSignDate) : null,
                rules: [{ required: true, message: '请选择合同签订日期' }],
              }}
            >
              <DatePicker className="x-fill-100" />
            </Field>
            <Field
              name="contractExpireDate"
              label="合同转正日期"
              decorator={{
                initialValue: formData.contractExpireDate
                  ? moment(formData.contractExpireDate)
                  : null,
                rules: [{ required: true, message: '请选择合同转正日期' }],
              }}
            >
              <DatePicker className="x-fill-100" />
            </Field>
            <Field
              name="probationBeginDate"
              label="试用期开始日期"
              decorator={{
                initialValue: formData.probationBeginDate
                  ? moment(formData.probationBeginDate)
                  : null,
                rules: [{ required: true, message: '请选择试用期开始日期' }],
              }}
            >
              <DatePicker className="x-fill-100" />
            </Field>
            <Field
              name="probationEndDate"
              label="试用期结束日期"
              decorator={{
                initialValue: formData.probationEndDate ? moment(formData.probationEndDate) : null,
                rules: [{ required: true, message: '请选择试用期结束日期' }],
              }}
            >
              <DatePicker className="x-fill-100" />
            </Field>
            <Field
              name="telfeeQuota"
              label="话费额度"
              decorator={{
                initialValue: formData.telfeeQuota || '',
                rules: [
                  {
                    required: true,
                    message: '请输入话费额度',
                  },
                ],
              }}
            >
              <Input placeholder="请输入话费额度" />
            </Field>
            <Field
              name="compfeeQuota"
              label="电脑额度"
              decorator={{
                initialValue: formData.compfeeQuota || '',
                rules: [
                  {
                    required: true,
                    message: '请输入电脑额度',
                  },
                ],
              }}
            >
              <Input placeholder="请输入电脑额度" />
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
                initialValue: formData.salaryPeriod || '',
              }}
            >
              <UdcSelect code="COM.SALARY_CYCLE" placeholder="请选择发薪周期" />
            </Field>
            <Field
              name="accessLevel"
              label="安全级别"
              decorator={{
                initialValue: formData.accessLevel || '',
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
              name="emailAddr"
              label="邮箱"
              decorator={{
                initialValue: formData.emailAddr || '@elitesland.com',
                rules: [
                  {
                    required: true,
                    message: '请输入邮箱',
                  },
                  {
                    type: 'email',
                    message: '请输入正确格式邮箱',
                  },
                ],
              }}
            >
              <Input type="email" placeholder="请输入邮箱" />
            </Field>
            <Field
              name="password"
              label="初始密码"
              decorator={{
                initialValue: formData.password || 'password',
                rules: [
                  {
                    required: true,
                    message: '请输入初始密码',
                  },
                ],
              }}
            >
              <Input placeholder="请输入初始密码" className="x-fill-100" />
            </Field>
          </FieldList>
        </Card>
        <Card
          className="tw-card-adjust"
          title={
            <Title icon="folder" id="ui.menu.plat.res.entryItem" defaultMessage="入职办理事项" />
          }
          bordered={false}
          style={{ marginTop: '6px' }}
        >
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              fieldCol={1}
              wrapperCol={{ span: 23, xxl: 23 }}
              name="remark"
              label=""
              decorator={{
                initialValue: formData.remark || '',
              }}
            >
              <Input.TextArea placeholder="请输入审核意见" autosize={{ minRows: 4, maxRows: 6 }} />
            </Field>
          </FieldList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default OfferAndRes;
