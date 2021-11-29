import { connect } from 'dva';
import React from 'react';
import moment from 'moment';
import { Button, Card, Form, Input, Divider } from 'antd';
import classnames from 'classnames';
import { closeThenGoto } from '@/layouts/routerControl';
import { fromQs } from '@/utils/stringUtils';
import FieldList from '@/components/layout/FieldList';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import Loading from '@/components/core/DataLoading';
import AsyncSelect from '@/components/common/AsyncSelect';
import router from 'umi/router';
import { formatMessage } from 'umi/locale';
import { UdcSelect, Selection } from '@/pages/gen/field';
import { selectBus } from '@/services/org/bu/bu';
import { selectOus, selectCusts, selectBuProduct } from '@/services/gen/list';

const { Field } = FieldList;

const DOMAIN = 'sysBasicProfitdistRuleDetail';

@connect(({ loading, sysBasicProfitdistRuleDetail, dispatch }) => ({
  loading,
  sysBasicProfitdistRuleDetail,
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
class Detail extends React.Component {
  componentDidMount() {
    const { dispatch } = this.props;
    const param = fromQs();
    if (param.mode && param.mode !== 'create') {
      dispatch({
        type: `${DOMAIN}/query`,
        payload: param,
      });
    } else {
      dispatch({ type: `${DOMAIN}/clean` });
    }
  }

  // 保存按钮
  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/save`,
        });
      }
    });
  };

  // BU类别 -> BU小类
  handleChangeBuFactor1 = value => {
    const { dispatch, form } = this.props;
    dispatch({
      type: `${DOMAIN}/updateListBuFactor2`,
      payload: value,
    }).then(() => {
      form.setFieldsValue({
        buFactor2: null,
      });
    });
  };

  // 客户类别 -> 客户小类
  handleChangeCustFactor1 = value => {
    const { dispatch, form } = this.props;
    dispatch({
      type: `${DOMAIN}/updateListCustFactor2`,
      payload: value,
    }).then(() => {
      form.setFieldsValue({
        custFactor2: null,
      });
    });
  };

  // 品项类别 -> 产品小类
  handleChangeProdFactor1 = value => {
    const { dispatch, form } = this.props;
    dispatch({
      type: `${DOMAIN}/updateListProdFactor2`,
      payload: value,
    }).then(() => {
      form.setFieldsValue({
        prodFactor2: null,
      });
    });
  };

  render() {
    const {
      loading,
      sysBasicProfitdistRuleDetail: { formData, buFactor2Data, custFactor2Data, prodFactor2Data },
      form: { getFieldDecorator },
    } = this.props;
    // loading完成之前将按钮设为禁用
    const disabledBtn = loading.effects[`${DOMAIN}/query`];
    const param = fromQs();

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
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            disabled={disabledBtn}
            onClick={() => closeThenGoto('/plat/distInfoMgmt/profitdistRule')}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        <Card
          className="tw-card-adjust"
          title={
            <Title
              icon="profile"
              id={
                formData.id
                  ? 'ui.menu.sys.baseinfo.profitdistRuleEdit'
                  : 'ui.menu.sys.baseinfo.profitdistRuleCreate'
              }
              defaultMessage="利益分配规则新增"
            />
          }
          bordered={false}
        >
          {disabledBtn ? (
            <Loading />
          ) : (
            <div>
              <FieldList
                layout="horizontal"
                legend="BU信息"
                getFieldDecorator={getFieldDecorator}
                col={2}
              >
                <Field
                  name="busifieldType"
                  label="平台"
                  decorator={{
                    initialValue: formData.busifieldType,
                    rules: [
                      {
                        required: true,
                        message: '请选择平台',
                      },
                    ],
                  }}
                >
                  <UdcSelect code="COM.BUSIFIELD_TYPE" placeholder="请选择平台" />
                </Field>
                <Field
                  name="buId"
                  label="BU"
                  decorator={{
                    initialValue: formData.buId && formData.buId + '',
                    rules: [
                      {
                        required: false,
                        message: '请选择BU',
                      },
                    ],
                  }}
                >
                  <Selection.ColumnsForBu />
                </Field>
                <Field
                  name="buFactor1"
                  label="BU类别"
                  decorator={{
                    initialValue: formData.buFactor1,
                    rules: [
                      {
                        required: false,
                        message: '请选择BU类别',
                      },
                    ],
                  }}
                >
                  <UdcSelect
                    code="ORG.BU_CAT1"
                    placeholder="请选择BU类别"
                    onChange={this.handleChangeBuFactor1}
                  />
                </Field>
                <Field
                  name="buFactor2"
                  label="BU小类"
                  decorator={{
                    initialValue: formData.buFactor2,
                    rules: [
                      {
                        required: false,
                        message: '请选择BU小类',
                      },
                    ],
                  }}
                >
                  {/* <UdcSelect code="ORG.BU_CAT2" placeholder="请选择BU小类" /> */}
                  <AsyncSelect source={buFactor2Data} placeholder="请选择BU小类" />
                </Field>
              </FieldList>
              <Divider dashed />
              <FieldList
                layout="horizontal"
                legend="客户信息"
                getFieldDecorator={getFieldDecorator}
                col={2}
              >
                <Field
                  name="custId"
                  label="客户"
                  decorator={{
                    initialValue: formData.custId && formData.custId + '',
                    rules: [
                      {
                        required: false,
                        message: '请选择客户',
                      },
                    ],
                  }}
                >
                  <AsyncSelect
                    source={() => selectCusts().then(resp => resp.response)}
                    placeholder="请选择客户"
                    showSearch
                    filterOption={(input, option) =>
                      option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  />
                </Field>
                <Field
                  name="custFactor3"
                  label="客户性质"
                  decorator={{
                    initialValue: formData.custFactor3,
                    rules: [
                      {
                        required: true,
                        message: '请选择客户性质',
                      },
                    ],
                  }}
                >
                  <UdcSelect code="TSK.CONTRACT_CUSTPROP" placeholder="请选择客户性质" />
                </Field>
                <Field
                  name="custFactor1"
                  label="客户类别"
                  decorator={{
                    initialValue: formData.custFactor1,
                    rules: [
                      {
                        required: true,
                        message: '请选择客户类别',
                      },
                    ],
                  }}
                >
                  <UdcSelect
                    code="TSK.CUST_CAT1"
                    placeholder="请选择客户类别"
                    onChange={this.handleChangeCustFactor1}
                  />
                </Field>
                <Field
                  name="custFactor2"
                  label="客户小类"
                  decorator={{
                    initialValue: formData.custFactor2,
                    rules: [
                      {
                        required: true,
                        message: '请选择客户小类',
                      },
                    ],
                  }}
                >
                  {/* <UdcSelect code="TSK.CUST_CAT2" placeholder="请选择客户小类" /> */}
                  <AsyncSelect source={custFactor2Data} placeholder="请选择客户小类" />
                </Field>
              </FieldList>
              <Divider dashed />
              <FieldList
                layout="horizontal"
                legend="产品大类"
                getFieldDecorator={getFieldDecorator}
                col={2}
              >
                <Field
                  name="prodId"
                  label="销售品项"
                  decorator={{
                    initialValue: formData.prodId && formData.prodId + '',
                    rules: [
                      {
                        required: false,
                        message: '请选择销售品项',
                      },
                    ],
                  }}
                >
                  <AsyncSelect
                    source={() => selectBuProduct().then(resp => resp.response)}
                    placeholder="请选择销售品项"
                    showSearch
                    filterOption={(input, option) =>
                      option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  />
                </Field>
                <Field
                  name="prodFactor3"
                  label="供应主体类别"
                  decorator={{
                    initialValue: formData.prodFactor3,
                    rules: [
                      {
                        required: true,
                        message: '请选择供应主体类别',
                      },
                    ],
                  }}
                >
                  <UdcSelect code="COM.PROD_PROP" placeholder="请选择供应主体类别" />
                </Field>
                <Field
                  name="prodFactor1"
                  label="产品大类"
                  decorator={{
                    initialValue: formData.prodFactor1,
                    rules: [
                      {
                        required: true,
                        message: '请选择产品大类',
                      },
                    ],
                  }}
                >
                  <UdcSelect
                    code="TSK.SALE_TYPE1"
                    placeholder="请选择产品大类"
                    onChange={this.handleChangeProdFactor1}
                  />
                </Field>
                <Field
                  name="prodFactor2"
                  label="产品小类"
                  decorator={{
                    initialValue: formData.prodFactor2,
                    rules: [
                      {
                        required: false,
                        message: '请选择产品小类',
                      },
                    ],
                  }}
                >
                  {/* <UdcSelect code="TSK.SALE_TYPE2" placeholder="请选择产品小类" /> */}
                  <AsyncSelect source={prodFactor2Data} placeholder="请选择产品小类" />
                </Field>
              </FieldList>
              <Divider dashed />
              <FieldList
                layout="horizontal"
                legend="交易方式"
                getFieldDecorator={getFieldDecorator}
                col={2}
              >
                <Field
                  name="projFactor1"
                  label="提成类别"
                  decorator={{
                    initialValue: formData.projFactor1 && formData.projFactor1 + '',
                    rules: [
                      {
                        required: false,
                        message: '请选择提成类别',
                      },
                    ],
                  }}
                >
                  <UdcSelect code="TSK.PROJ_PROP" placeholder="请选择提成类别" />
                </Field>
                <Field
                  name="cooperationType"
                  label="交易性质"
                  decorator={{
                    initialValue: formData.cooperationType,
                    rules: [
                      {
                        required: true,
                        message: '请选择交易性质',
                      },
                    ],
                  }}
                >
                  <UdcSelect code="TSK.COOPERATION_TYPE" placeholder="请选择交易性质" />
                </Field>
                <Field
                  name="channelType"
                  label="交易方式"
                  decorator={{
                    initialValue: formData.channelType,
                    rules: [
                      {
                        required: true,
                        message: '请选择交易方式',
                      },
                    ],
                  }}
                >
                  <UdcSelect code="TSK.CHANNEL_TYPE" placeholder="请选择交易方式" />
                </Field>
                <Field
                  name="promotionType"
                  label="促销码"
                  decorator={{
                    initialValue: formData.promotionType,
                    rules: [
                      {
                        required: true,
                        message: '请选择促销码',
                      },
                    ],
                  }}
                >
                  <UdcSelect code="TSK.PROMOTION_TYPE" placeholder="请选择促销码" />
                </Field>
              </FieldList>
              <Divider dashed />
              <FieldList
                layout="horizontal"
                legend="利益分配规则"
                getFieldDecorator={getFieldDecorator}
                col={2}
              >
                <Field
                  name="ruleNo"
                  label="利益分配规则码"
                  decorator={{
                    initialValue: formData.ruleNo,
                    rules: [
                      {
                        required: false,
                        message: '请输入利益分配规则',
                      },
                    ],
                  }}
                >
                  <Input placeholder="系统生成" disabled />
                </Field>
                <Field
                  name="ouId"
                  label="签单法人主体"
                  decorator={{
                    initialValue: formData.ouId && formData.ouId + '',
                    rules: [
                      {
                        required: true,
                        message: '请选择签单法人主体',
                      },
                    ],
                  }}
                >
                  <AsyncSelect
                    source={() => selectOus().then(resp => resp.response)}
                    placeholder="请选择签单法人主体"
                    showSearch
                    filterOption={(input, option) =>
                      option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  />
                </Field>
                <Field
                  name="platSharePercent"
                  label="平台BU抽成比例"
                  decorator={{
                    initialValue: formData.platSharePercent,
                    rules: [
                      {
                        required: true,
                        message: '请输入平台BU抽成比例',
                      },
                      {
                        pattern: /^[-+]?[0-9]*\.?[0-9]+$/,
                        message: '请输入浮点数',
                      },
                    ],
                  }}
                >
                  <Input placeholder="请输入平台BU抽成比例" />
                </Field>
                <Field
                  name="platShareBase"
                  label="基于"
                  decorator={{
                    initialValue: formData.platShareBase,
                    rules: [
                      {
                        required: true,
                        message: '请选择平台BU抽成比例基于',
                      },
                    ],
                  }}
                >
                  <UdcSelect code="ACC.PROFIT_SHARE_BASE" placeholder="请选择平台BU抽成比例基于" />
                </Field>
                <Field
                  name="signSharePercent"
                  label="签单BU抽成比例"
                  decorator={{
                    initialValue: formData.signSharePercent,
                    rules: [
                      {
                        required: true,
                        message: '请输入签单BU抽成比例',
                      },
                      {
                        pattern: /^[-+]?[0-9]*\.?[0-9]+$/,
                        message: '请输入浮点数',
                      },
                    ],
                  }}
                >
                  <Input placeholder="请输入签单BU抽成比例" />
                </Field>
                <Field
                  name="signShareBase"
                  label="基于"
                  decorator={{
                    initialValue: formData.signShareBase,
                    rules: [
                      {
                        required: true,
                        message: '请选择签单BU抽成比例基于',
                      },
                    ],
                  }}
                >
                  <UdcSelect code="ACC.PROFIT_SHARE_BASE" placeholder="请选择签单BU抽成比例基于" />
                </Field>
                <Field
                  name="deliSharePercent"
                  label="售前抽成比例"
                  decorator={{
                    initialValue: formData.deliSharePercent,
                    rules: [
                      {
                        required: true,
                        message: '请输入售前抽成比例',
                      },
                      {
                        pattern: /^[-+]?[0-9]*\.?[0-9]+$/,
                        message: '请输入浮点数',
                      },
                    ],
                  }}
                >
                  <Input placeholder="请输入售前抽成比例" />
                </Field>
                <Field
                  name="deliShareBase"
                  label="基于"
                  decorator={{
                    initialValue: formData.deliShareBase,
                    rules: [
                      {
                        required: true,
                        message: '请选择售前抽成比例基于',
                      },
                    ],
                  }}
                >
                  <UdcSelect code="ACC.PROFIT_SHARE_BASE" placeholder="请选择售前抽成比例基于" />
                </Field>
                <Field
                  name="leadsSharePercent"
                  label="行业补贴比例"
                  decorator={{
                    initialValue: formData.leadsSharePercent,
                    rules: [
                      {
                        required: true,
                        message: '请输入平台销售抽成比例',
                      },
                      {
                        pattern: /^[-+]?[0-9]*\.?[0-9]+$/,
                        message: '请输入浮点数',
                      },
                    ],
                  }}
                >
                  <Input placeholder="请输入行业补贴比例比例" />
                </Field>
                <Field
                  name="leadsShareBase"
                  label="基于"
                  decorator={{
                    initialValue: formData.leadsShareBase,
                    rules: [
                      {
                        required: true,
                        message: '请选择平台销售抽成基于',
                      },
                    ],
                  }}
                >
                  <UdcSelect code="ACC.PROFIT_SHARE_BASE" placeholder="请选择平台销售抽成基于" />
                </Field>
                <Field
                  name="remark"
                  label="备注"
                  decorator={{
                    initialValue: formData.remark,
                    rules: [{ required: false }, { max: 400, message: '不超过400个字' }],
                  }}
                  fieldCol={1}
                  labelCol={{ span: 4, xxl: 3 }}
                  wrapperCol={{ span: 19, xxl: 20 }}
                >
                  <Input.TextArea placeholder="请输入备注" autosize={{ minRows: 3, maxRows: 6 }} />
                </Field>
              </FieldList>
            </div>
          )}
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default Detail;
