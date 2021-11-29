import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Input, DatePicker, InputNumber } from 'antd';
import moment from 'moment';
import { formatMessage } from 'umi/locale';
import { isEmpty } from 'ramda';

import { formatDT } from '@/utils/tempUtils/DateTime';
import AsyncSelect from '@/components/common/AsyncSelect';
import FieldList from '@/components/layout/FieldList';
import { UdcSelect, UdcCheck, FileManagerEnhance } from '@/pages/gen/field';
import SelectWithCols from '@/components/common/SelectWithCols';
import { fromQs } from '@/utils/stringUtils';
import { selectOus } from '@/services/plat/res/resprofile';
import {
  selectOpportunity,
  selectCustomer,
  selectContract,
  selectFinperiod,
  selectBuProduct,
} from '@/services/user/Contract/sales';
import { selectBus } from '@/services/org/bu/bu';
import { selectUsers } from '@/services/sys/user';
import { mountToTab } from '@/layouts/routerControl';

const { Field, FieldLine } = FieldList;

const DOMAIN = 'userContractCreateSub';
const FieldListLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
const subjCol = [
  { dataIndex: 'code', title: '编号', span: 6 },
  { dataIndex: 'name', title: '名称', span: 14 },
];

@connect(({ loading, dispatch, userContractCreateSub }) => ({
  loading,
  dispatch,
  userContractCreateSub,
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    if (isEmpty(changedFields)) return;
    const { name, value } = Object.values(changedFields)[0];

    let val = null;
    // antD 时间组件返回的是moment对象 转成字符串提交
    if (typeof value === 'object') {
      val = formatDT(value);
    }
    // 处理是否UDC 返回yes / no, 接口需要的是 1 / 0
    if (value === 'YES') {
      val = 1;
    } else if (value === 'NO') {
      val = 0;
    } else {
      val = value;
    }

    props.dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: { [name]: val },
    });
  },
})
@mountToTab()
class Info extends PureComponent {
  componentDidMount() {
    // 初始得到主合同id给formData赋值
    const { dispatch } = this.props;
    const { mainId, id } = fromQs();

    if (id) {
      dispatch({
        type: `${DOMAIN}/querySub`,
        payload: id,
      });
    } else {
      dispatch({
        type: `${DOMAIN}/clearForm`,
      });
      dispatch({
        type: `${DOMAIN}/queryMain`,
        payload: mainId,
      });
    }
    dispatch({ type: `${DOMAIN}/bu` });
    dispatch({ type: `${DOMAIN}/user` });
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { flag: [0, 0, 0] },
    });
  }

  handleChange = value => {
    const { dispatch, form } = this.props;
    dispatch({
      type: `${DOMAIN}/UDC_SmallClass`,
      payload: value,
    }).then(() => {
      // 2级联动选项滞空
      form.setFieldsValue({
        saleType2: '',
        saleType2Desc: '',
      });
    });
  };

  render() {
    const {
      dispatch,
      userContractCreateSub: {
        formData,
        smallClass,
        buData = [],
        deliBuDataSource = [],
        userData = [],
        deliResDataSource = [],
      },
      form: { getFieldDecorator },
    } = this.props;
    const readOnly = true;

    return (
      <>
        <FieldList
          layout="horizontal"
          legend={formatMessage({ id: `app.settings.menuMap.basic`, desc: '基本信息' })}
          getFieldDecorator={getFieldDecorator}
          col={2}
          hasSeparator={1}
        >
          <Field
            name="contractName"
            label="子合同名称"
            {...FieldListLayout}
            decorator={{
              initialValue: formData.contractName,
              rules: [
                {
                  required: true,
                  message: '请输入子合同名称',
                },
              ],
            }}
          >
            <Input placeholder="请输入子合同名称" />
          </Field>

          <Field
            name="contractNo"
            label="编号"
            {...FieldListLayout}
            decorator={{
              initialValue: formData.contractNo,
            }}
          >
            <Input disabled={readOnly} placeholder="系统生成" />
          </Field>

          <Field
            name="mainContractName"
            label="主合同"
            decorator={{
              initialValue: formData.mainContractName,
              rules: [
                {
                  required: true,
                  message: '请选择主合同',
                },
              ],
            }}
            {...FieldListLayout}
          >
            <AsyncSelect
              source={() => selectContract().then(resp => resp.response)}
              placeholder="请选择主合同"
              showSearch
              filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              disabled={readOnly}
            />
          </Field>

          <Field
            name="userdefinedNo"
            label="参考合同号"
            {...FieldListLayout}
            decorator={{
              initialValue: formData.userdefinedNo,
            }}
          >
            <Input placeholder="请输入参考合同号" />
          </Field>

          <Field
            name="signBuName"
            label="签单BU"
            decorator={{
              initialValue: formData.signBuName,
              rules: [
                {
                  required: true,
                  message: '请选择签单BU',
                },
              ],
            }}
            {...FieldListLayout}
          >
            <AsyncSelect
              source={() => selectBus().then(resp => resp.response)}
              placeholder="请选择签单BU"
              showSearch
              filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              disabled={readOnly}
            />
          </Field>

          <Field
            name="salesmanResId"
            label="销售负责人"
            decorator={{
              initialValue: formData.salesmanResName,
              rules: [
                {
                  required: true,
                  message: '请选择销售负责人',
                },
              ],
            }}
            {...FieldListLayout}
          >
            <AsyncSelect
              source={() => selectUsers().then(resp => resp.response)}
              placeholder="请选择销售负责人"
              showSearch
              filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              disabled={readOnly}
            />
          </Field>

          <Field
            name="deliBuId"
            label="交付BU"
            decorator={{
              initialValue: formData.deliBuId
                ? {
                    code: formData.deliBuId,
                    name: formData.deliBuName,
                  }
                : null,
              rules: [
                {
                  required: true,
                  message: '请选择交付BU',
                },
              ],
            }}
            {...FieldListLayout}
          >
            <SelectWithCols
              labelKey="name"
              placeholder="请选择主交付BU"
              columns={subjCol}
              dataSource={deliBuDataSource}
              selectProps={{
                showSearch: true,
                onSearch: value => {
                  dispatch({
                    type: `${DOMAIN}/updateState`,
                    payload: {
                      deliBuDataSource: buData.filter(
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
            name="deliResId"
            label="交付负责人"
            decorator={{
              initialValue: formData.deliResId
                ? {
                    code: formData.deliResId,
                    name: formData.deliResName,
                  }
                : null,
            }}
            {...FieldListLayout}
          >
            <SelectWithCols
              labelKey="name"
              valueKey="code"
              placeholder="请选择交付负责人"
              columns={subjCol}
              dataSource={deliResDataSource}
              selectProps={{
                showSearch: true,
                onSearch: value => {
                  dispatch({
                    type: `${DOMAIN}/updateState`,
                    payload: {
                      deliResDataSource: userData.filter(
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
            name="startDate"
            label="合同开始日期"
            decorator={{
              initialValue: formData.startDate ? moment(formData.startDate) : null,
              rules: [
                {
                  required: true,
                  message: '请选择合同开始日期',
                },
              ],
            }}
            {...FieldListLayout}
          >
            <DatePicker
              placeholder="请选择合同开始日期"
              format="YYYY-MM-DD"
              className="x-fill-100"
            />
          </Field>

          <Field
            name="endDate"
            label="合同结束日期"
            decorator={{
              initialValue: formData.endDate ? moment(formData.endDate) : null,
              rules: [
                {
                  required: true,
                  message: '请选择合同结束日期',
                },
              ],
            }}
            {...FieldListLayout}
          >
            <DatePicker
              placeholder="请选择合同结束日期"
              format="YYYY-MM-DD"
              className="x-fill-100"
            />
          </Field>

          <Field
            name="attache"
            label="附件"
            decorator={{
              initialValue: formData.attache,
            }}
            {...FieldListLayout}
          >
            <FileManagerEnhance
              api="/api/op/v1/contract/sub/sfs/token"
              dataKey={formData.id}
              listType="text"
              disabled={false}
            />
          </Field>

          <Field
            name="deliveryAddress"
            label="交付地点"
            decorator={{
              initialValue: formData.deliveryAddress,
            }}
            {...FieldListLayout}
          >
            <Input placeholder="请输入交付地点" />
          </Field>

          <Field
            name="contractStatus"
            label="合同状态"
            decorator={{
              initialValue: formData.contractStatus,
            }}
            {...FieldListLayout}
          >
            <UdcSelect
              disabled={readOnly}
              code="TSK.CONTRACT_STATUS"
              placeholder="请选择合同状态"
            />
          </Field>

          <Field
            name="closeReason"
            label="关闭原因"
            decorator={{
              initialValue: formData.closeReason,
            }}
            {...FieldListLayout}
          >
            <UdcSelect
              disabled={readOnly}
              code="TSK.CONTRACT_CLOSE_REASON"
              placeholder="请选择关闭原因"
            />
          </Field>

          <Field
            name="startDate"
            label="合同激活日期"
            decorator={{
              initialValue: formData.startDate,
            }}
            {...FieldListLayout}
          >
            <Input placeholder="系统生成" disabled={readOnly} />
          </Field>

          <Field
            name="endDate"
            label="合同关闭日期"
            decorator={{
              initialValue: formData.endDate,
            }}
            {...FieldListLayout}
          >
            <Input placeholder="系统生成" disabled={readOnly} />
          </Field>

          <Field
            name="createUserId"
            label="创建人"
            decorator={{
              initialValue: formData.createUserName,
            }}
            {...FieldListLayout}
          >
            <Input disabled={readOnly} placeholder="系统生成" />
          </Field>

          <Field
            name="createTime"
            label="创建日期"
            decorator={{
              initialValue: formData.createTime,
            }}
            {...FieldListLayout}
            disabled={readOnly}
          >
            <Input disabled={readOnly} placeholder="系统生成" />
          </Field>

          <Field
            name="currCode"
            label="币种"
            decorator={{
              initialValue: formData.currCodeDesc,
            }}
            {...FieldListLayout}
          >
            <UdcSelect code="COM.CURRENCY_KIND" placeholder="请选择币种" />
          </Field>

          <Field
            name="remark"
            label={formatMessage({ id: `sys.baseinfo.subjTemplate.remark`, desc: '备注' })}
            decorator={{
              initialValue: formData.remark,
            }}
            fieldCol={1}
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 20 }}
          >
            <Input.TextArea placeholder="请输入备注" rows={3} />
          </Field>
        </FieldList>

        <FieldList
          layout="horizontal"
          legend="销售信息"
          getFieldDecorator={getFieldDecorator}
          col={2}
          hasSeparator={1}
        >
          <Field
            name="productId"
            label="产品"
            decorator={{
              initialValue: formData.productName,
            }}
            {...FieldListLayout}
          >
            <AsyncSelect
              source={() => selectBuProduct().then(resp => resp.response)}
              placeholder="请选择产品"
              showSearch
              filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            />
          </Field>

          <Field
            name="briefDesc"
            label="简要说明"
            decorator={{
              initialValue: formData.briefDesc,
            }}
            {...FieldListLayout}
          >
            <Input placeholder="请输入简要说明" />
          </Field>

          <Field
            name="workType"
            label="工作类型"
            decorator={{
              initialValue: formData.workType,
              rules: [
                {
                  required: true,
                  message: '请选择工作类型',
                },
              ],
            }}
            {...FieldListLayout}
          >
            <UdcSelect code="TSK.WORK_TYPE" placeholder="请选择工作类型" />
          </Field>

          <Field
            name="promotionType"
            label="促销码"
            decorator={{
              initialValue: formData.promotionType,
            }}
            {...FieldListLayout}
          >
            <UdcSelect code="TSK.PROMOTION_TYPE" placeholder="请选择促销码" />
          </Field>

          <Field
            name="rangeProp"
            label="范围性质"
            decorator={{
              initialValue: formData.rangeProp,
              rules: [
                {
                  required: true,
                  message: '请选择范围性质',
                },
              ],
            }}
            {...FieldListLayout}
          >
            <UdcSelect code="TSK.RANGE_PROP" placeholder="请选择范围性质" />
          </Field>

          <Field
            name="halfOpenDesc"
            label="半开口说明"
            decorator={{
              initialValue: formData.halfOpenDesc,
            }}
            {...FieldListLayout}
          >
            <Input placeholder="请输入半开口说明" />
          </Field>

          <Field
            name="saleType1"
            label="品项类别"
            decorator={{
              initialValue: formData.saleType1Desc,
              rules: [
                {
                  required: true,
                  message: '请选择品项类别',
                },
              ],
            }}
            {...FieldListLayout}
          >
            <UdcSelect
              code="TSK.SALE_TYPE1"
              onChange={this.handleChange}
              placeholder="请选择品项类别"
            />
          </Field>

          <Field
            name="saleType2"
            label="产品小类"
            decorator={{
              initialValue: formData.saleType2Desc,
            }}
            {...FieldListLayout}
          >
            <AsyncSelect
              source={smallClass}
              placeholder="请选择产品小类"
              showSearch
              filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            />
          </Field>

          <Field
            name="prodProp"
            label="品项属性"
            decorator={{
              initialValue: formData.prodProp,
              rules: [
                {
                  required: true,
                  message: '请选择品项属性',
                },
              ],
            }}
            {...FieldListLayout}
          >
            <UdcSelect code="COM.PROD_PROP" placeholder="请选择品项属性" />
          </Field>

          <Field
            name="projProp"
            label="提成类别"
            decorator={{
              initialValue: formData.projProp,
              rules: [
                {
                  required: true,
                  message: '请选择提成类别',
                },
              ],
            }}
            {...FieldListLayout}
          >
            <UdcSelect code="TSK.PROJ_PROP" placeholder="请选择提成类别" />
          </Field>

          <Field
            name="channelType"
            label="渠道类型"
            decorator={{
              initialValue: formData.channelType,
              rules: [
                {
                  required: true,
                  message: '请选择渠道类型',
                },
              ],
            }}
            {...FieldListLayout}
          >
            <UdcSelect code="TSK.CHANNEL_TYPE" placeholder="请选择渠道类型" />
          </Field>

          <Field
            name="cooperationType"
            label="合作类型"
            decorator={{
              initialValue: formData.cooperationType,
            }}
            {...FieldListLayout}
          >
            <UdcSelect code="TSK.COOPERATION_TYPE" placeholder="请选择合作类型" />
          </Field>
        </FieldList>

        <FieldList
          layout="horizontal"
          legend="财务信息"
          getFieldDecorator={getFieldDecorator}
          col={2}
        >
          <Field
            name="custpaytravelFlag"
            label="客户承担差旅费"
            decorator={{
              initialValue: formData.custpaytravelFlag,
              rules: [
                {
                  required: true,
                  message: '请选择客户承担差旅费',
                },
              ],
            }}
            {...FieldListLayout}
          >
            <UdcSelect code="COM.YESNO" placeholder="请选择合作类型" />
          </Field>

          <Field
            name="reimbursementDesc"
            label="报销政策说明"
            decorator={{
              initialValue: formData.reimbursementDesc,
              rules: [
                {
                  required: true,
                  message: '报销政策说明',
                },
              ],
            }}
            {...FieldListLayout}
          >
            <Input placeholder="请输入报销政策说明" />
          </Field>

          <FieldLine label="含税总金额/税率" {...FieldListLayout} required>
            <Field
              name="amt"
              decorator={{
                initialValue: formData.amt,
                rules: [
                  {
                    required: true,
                    message: '请输入含税总金额',
                  },
                ],
              }}
              wrapperCol={{ span: 23, xxl: 23 }}
            >
              <InputNumber placeholder="请输入含税总金额" className="x-fill-100" />
            </Field>
            <Field
              name="taxRate"
              decorator={{
                initialValue: formData.taxRate + '',
                rules: [
                  {
                    required: true,
                    message: '请输入税率',
                  },
                  {
                    min: 0,
                    max: 100,
                    required: true,
                    message: '请输入0-100之间的整数',
                  },
                ],
              }}
              wrapperCol={{ span: 23, offset: 1, xxl: 23 }}
            >
              <Input type="number" addonAfter="%" placeholder="请输入税率" />
            </Field>
          </FieldLine>

          <Field
            name="extraAmt"
            label="其它费用"
            decorator={{
              initialValue: formData.extraAmt,
              rules: [
                {
                  required: true,
                  message: '请输入其它费用',
                },
              ],
            }}
            {...FieldListLayout}
          >
            <InputNumber placeholder="请输入其它费用" className="x-fill-100" />
          </Field>

          <Field
            name="effectiveAmt"
            label="有效合同额"
            decorator={{
              initialValue: formData.effectiveAmt,
              rules: [
                {
                  required: true,
                  message: '请输入有效合同额',
                },
              ],
            }}
            {...FieldListLayout}
          >
            <InputNumber placeholder="请输入有效合同额" className="x-fill-100" />
          </Field>

          <Field
            name="grossProfit"
            label="毛利"
            decorator={{
              initialValue: formData.grossProfit,
            }}
            {...FieldListLayout}
          >
            <InputNumber placeholder="请输入毛利" className="x-fill-100" />
          </Field>

          <Field
            name="finPeriodId"
            label="财务期间"
            decorator={{
              initialValue: formData.finPeriodName,
              rules: [
                {
                  required: true,
                  message: '请选择财务期间',
                },
              ],
            }}
            {...FieldListLayout}
          >
            <AsyncSelect
              source={() => selectFinperiod().then(resp => resp.response)}
              placeholder="请选择财务期间"
              showSearch
              filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            />
          </Field>
        </FieldList>
      </>
    );
  }
}

export default Info;
