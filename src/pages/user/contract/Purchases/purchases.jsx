import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Form, Input, DatePicker, InputNumber, Button, Radio } from 'antd';
import moment from 'moment';
import classnames from 'classnames';
import { formatMessage } from 'umi/locale';
import { isEmpty, isNil, gte, lte } from 'ramda';

import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import Title from '@/components/layout/Title';
import AsyncSelect from '@/components/common/AsyncSelect';
import FieldList from '@/components/layout/FieldList';
import { UdcSelect, FileManagerEnhance, Selection } from '@/pages/gen/field';
import { fromQs } from '@/utils/stringUtils';
import { checkIfNumber } from '@/utils/mathUtils';

import { selectBu, selectSupplier } from '@/services/user/Contract/sales';
import { selectUsers } from '@/services/sys/user';
import { selectAbOus } from '@/services/gen/list';

const { Field, FieldLine } = FieldList;

const DOMAIN = 'purchasesContract';
const FieldListLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

@connect(({ loading, dispatch, purchasesContract }) => ({
  loading,
  dispatch,
  purchasesContract,
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    if (isEmpty(changedFields)) return;
    const { name, value } = Object.values(changedFields)[0];
    if (name === 'signDate' || name === 'activateDate') {
      // antD 时间组件返回的是moment对象 转成字符串提交
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { [name]: formatDT(value) },
      });
    } else {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { [name]: value },
      });
    }
  },
})
// @mountToTab()
class Purchases extends PureComponent {
  componentDidMount() {
    const { dispatch, form } = this.props;
    const { id } = fromQs();
    dispatch({
      type: `${DOMAIN}/clearForm`,
    });
    // 初始得到子合同id给formData赋值
    if (id) {
      dispatch({
        type: `${DOMAIN}/querySub`,
        payload: id,
      });
      form.setFieldsValue({
        purchaseType: 'PROJECT',
      });
      dispatch({
        type: `${DOMAIN}/udc1`,
        payload: {
          defId: 'TSK:PURCHASE_TYPE1',
          parentDefId: 'TSK:PURCHASE_TYPE',
          parentVal: 'PROJECT',
        },
      });
    } else {
      form.setFieldsValue({
        purchaseType: 'ADMINISTRATION',
      });
      dispatch({
        type: `${DOMAIN}/udc1`,
        payload: {
          defId: 'TSK:PURCHASE_TYPE1',
          parentDefId: 'TSK:PURCHASE_TYPE',
          parentVal: 'ADMINISTRATION',
        },
      });
    }
  }

  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;
    const { pid } = fromQs();
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        if (pid) {
          dispatch({
            type: `${DOMAIN}/edit`,
            payload: {
              purchaseType: values.purchaseType,
            },
          });
        } else {
          dispatch({
            type: `${DOMAIN}/create`,
            payload: {
              purchaseType: values.purchaseType,
            },
          });
        }
      }
    });
  };

  handleCancel = () => {
    const { mainId, id } = fromQs();
    if (mainId && id) {
      closeThenGoto(`/sale/contract/editSub?mainId=${mainId}&id=${id}`);
    } else {
      closeThenGoto(`/sale/contract/purchasesList`);
    }
  };

  // handleUDCChange = value => {
  //   const { dispatch, form } = this.props;
  //   dispatch({
  //     type: `${DOMAIN}/UDC_SmallClass`,
  //     payload: value,
  //   }).then(() => {
  //     // 2级联动选项滞空
  //     form.setFieldsValue({
  //       purchaseType2: '',
  //     });
  //   });
  // };
  handlePurchaseLegal = (key, data) => {
    const { form } = this.props;
    // dispatch({
    //   type: `${DOMAIN}/updateForm`,
    //   payload: {
    //     purchaseLegalNo: key,
    //     purchaseLegalName: data.props.title,
    //   },
    // });
    form.setFieldsValue({
      purchaseLegalNo: key,
      purchaseLegalName: data.props.title,
    });
  };

  handleSupplier = (key, data) => {
    const { form } = this.props;
    // dispatch({
    //   type: `${DOMAIN}/updateForm`,
    //   payload: {
    //     purchaseLegalNo: key,
    //     purchaseLegalName: data.props.title,
    //   },
    // });
    form.setFieldsValue({
      supplierLegalNo: key,
      supplierLegalName: data.props.title,
    });
  };

  linkageBu = value => {
    const { dispatch, form } = this.props;
    if (value) {
      dispatch({
        type: `${DOMAIN}/linkageBu`,
        payload: value,
      }).then(res => {
        form.setFieldsValue({
          purchaseLegalNo: res.purchaseLegalNo,
          purchaseLegalName: res.purchaseLegalName,
        });
      });
    } else {
      form.setFieldsValue({
        purchaseLegalNo: null,
        purchaseLegalName: null,
      });
    }
  };

  linkageSupplier = value => {
    const { dispatch, form } = this.props;
    if (value) {
      dispatch({
        type: `${DOMAIN}/linkageSupplier`,
        payload: value,
      }).then(res => {
        if (res.buId) {
          form.setFieldsValue({
            supplierLegalNo: res.supplierLegalNo,
            supplierLegalName: res.supplierLegalName,
          });
        }
      });
    } else {
      form.setFieldsValue({
        supplierLegalNo: null,
        supplierLegalName: null,
      });
    }
  };

  handleUdc1Change = value => {
    const { dispatch, form } = this.props;
    if (!value) {
      return;
    }
    dispatch({
      type: `${DOMAIN}/udc2`,
      payload: {
        defId: 'TSK:PURCHASE_TYPE2',
        parentDefId: 'TSK:PURCHASE_TYPE1',
        parentVal: value,
      },
    }).then(() => {
      // 2级联动选项滞空
      form.setFieldsValue({
        purchaseType2: null,
        purchaseType2Desc: null,
      });
    });
  };

  render() {
    const {
      loading,
      purchasesContract: { formData, smallClass, udcType1, udcType2 },
      form: { getFieldDecorator },
    } = this.props;
    const readOnly = true;
    const { pid, id } = fromQs();

    const disabledBtn =
      loading.effects[`${DOMAIN}/queryPurchase`] ||
      loading.effects[`${DOMAIN}/querySub`] ||
      loading.effects[`${DOMAIN}/create`] ||
      loading.effects[`${DOMAIN}/edit`] ||
      formData.contractStatus !== 'CREATE';

    return (
      <PageHeaderWrapper title="采购合同">
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            type="primary"
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
            onClick={this.handleCancel}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>

        <Card
          className="tw-card-adjust"
          bordered={false}
          title={
            pid ? (
              <Title
                icon="profile"
                id="user.contract.menu.editPurchases"
                defaultMessage="修改采购合同"
              />
            ) : (
              <Title
                icon="profile"
                id="user.contract.menu.createPurchases"
                defaultMessage="创建采购合同"
              />
            )
          }
        >
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
            {!isNil(formData.subContractId) && (
              <Field
                name="serviceType"
                label="项目采购类型"
                {...FieldListLayout}
                decorator={{
                  initialValue: formData.serviceType,
                  rules: [
                    {
                      required: true,
                      message: '请选择项目采购类型',
                    },
                  ],
                }}
              >
                <Selection.UDC code="TSK:PURCHASE_SERVICE_TYPE" placeholder="请选择项目采购类型" />
              </Field>
            )}

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
              name="contractName"
              label="合同名称"
              {...FieldListLayout}
              decorator={{
                initialValue: formData.contractName,
                rules: [
                  {
                    required: true,
                    message: '请输入合同名称',
                  },
                ],
              }}
            >
              <Input placeholder="请输入合同名称" />
            </Field>

            <Field
              name="currCode"
              label="币种"
              decorator={{
                initialValue: formData.currCode,
                rules: [
                  {
                    required: true,
                    message: '请输入合同币种',
                  },
                ],
              }}
              {...FieldListLayout}
            >
              <UdcSelect code="COM.CURRENCY_KIND" placeholder="请选择币种" />
            </Field>

            <Field
              name="platType"
              label="平台合同类型"
              decorator={{
                initialValue: formData.platType,
                rules: [
                  {
                    required: true,
                    message: '请选择平台合同类型',
                  },
                ],
              }}
              {...FieldListLayout}
            >
              <UdcSelect code="TSK.PLAT_TYPE" placeholder="请选择平台合同类型" />
            </Field>

            <Field
              name="signDate"
              label="签约日期"
              decorator={{
                initialValue: formData.signDate ? moment(formData.signDate) : null,
              }}
              {...FieldListLayout}
            >
              <DatePicker placeholder="请选择签约日期" format="YYYY-MM-DD" className="x-fill-100" />
            </Field>

            <Field
              name="purchaseType"
              label="采购类型"
              {...FieldListLayout}
              decorator={{
                initialValue: formData.purchaseType,
                rules: [
                  {
                    required: true,
                    message: '请选择采购类型',
                  },
                ],
              }}
            >
              <UdcSelect code="TSK.PURCHASE_TYPE" placeholder="请选择采购类型" disabled />
            </Field>

            <Field
              name="subContractName"
              label="关联子合同"
              {...FieldListLayout}
              decorator={{
                initialValue: formData.subContractName,
                rules: [
                  {
                    required: false,
                    message: '请选择关联子合同',
                  },
                ],
              }}
            >
              <Input disabled={readOnly} placeholder="请选择关联子合同" />
            </Field>

            <Field
              name="purchaseType1"
              label="采购大类"
              {...FieldListLayout}
              decorator={{
                initialValue: formData.purchaseType1,
                rules: [
                  {
                    required: true,
                    message: '请选择采购大类',
                  },
                ],
              }}
            >
              <AsyncSelect
                source={udcType1}
                placeholder="请选择采购大类"
                filterOption={(input, option) =>
                  option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                onChange={this.handleUdc1Change}
              />
            </Field>

            <Field
              name="purchaseType2"
              label="采购小类"
              {...FieldListLayout}
              decorator={{
                initialValue: formData.purchaseType2,
              }}
            >
              <AsyncSelect
                source={udcType2}
                placeholder="请选择采购小类"
                showSearch
                filterOption={(input, option) =>
                  option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              />
            </Field>

            <Field
              name="productName"
              label="采购产品"
              {...FieldListLayout}
              decorator={{
                initialValue: formData.productName,
                rules: [
                  {
                    required: true,
                    message: '请输入采购产品',
                  },
                ],
              }}
            >
              <Input placeholder="请输入采购产品" />
            </Field>

            <Field
              name="briefDesc"
              label="采购内容简述"
              {...FieldListLayout}
              decorator={{
                initialValue: formData.briefDesc,
              }}
            >
              <Input placeholder="请选择采购内容简述" />
            </Field>

            <FieldLine label="金额/税率" {...FieldListLayout} required>
              <Field
                name="amt"
                decorator={{
                  initialValue: formData.amt,
                  rules: [
                    {
                      required: true,
                      message: '请输入金额',
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
                  initialValue: formData.taxRate,
                  rules: [
                    {
                      required: true,
                      message: '请输入税率',
                    },
                    {
                      // 修复 ‘0-100之间的整数’ 校验问题
                      validator: (rule, value, callback) => {
                        if (isNil(value)) {
                          callback();
                        } else {
                          if (!checkIfNumber(value)) callback(['输入类型不正确']);
                          else if (!gte(value, 0) && !lte(value, 100))
                            callback(['请输入0-100之间的整数']);
                          callback();
                        }
                      },
                    },
                  ],
                }}
                wrapperCol={{ span: 23, offset: 1, xxl: 23 }}
              >
                <Input type="number" addonAfter="%" placeholder="请输入税率" />
              </Field>
            </FieldLine>

            <Field
              name="excluding"
              label="不含税金额"
              {...FieldListLayout}
              decorator={{
                initialValue:
                  formData.amt && formData.taxRate
                    ? (formData.amt / (1 + +formData.taxRate / 100)).toFixed(2)
                    : 0,
                // rules: [
                //   {
                //     required: true,
                //     message: '金额/税率自动带出',
                //   },
                // ],
              }}
            >
              <InputNumber
                disabled={readOnly}
                placeholder="金额/税率自动带出"
                className="x-fill-100"
              />
            </Field>

            <Field
              name="purchaseBuId"
              label="采购主体BU"
              {...FieldListLayout}
              decorator={{
                initialValue: formData.purchaseBuId,
                rules: [
                  {
                    required: true,
                    message: '请选择采购主体BU',
                  },
                ],
              }}
            >
              {/* <AsyncSelect
                source={() => selectBu().then(resp => resp.response)}
                placeholder="请选择采购主体BU"
                showSearch
                filterOption={(input, option) =>
                  option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                onChange={this.linkageBu}
              /> */}
              <Selection.ColumnsForBu onChange={this.linkageBu} />
            </Field>

            <FieldLine label="采购主体法人/法人号" {...FieldListLayout}>
              <Field
                name="purchaseLegalName"
                decorator={{
                  initialValue: formData.purchaseLegalName,
                }}
                wrapperCol={{ span: 23, xxl: 23 }}
              >
                <AsyncSelect
                  source={() => selectAbOus().then(resp => resp.response)}
                  showSearch
                  filterOption={(input, option) =>
                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  onChange={this.handlePurchaseLegal}
                  placeholder="请选择采购主体法人"
                />
              </Field>
              <Field
                name="purchaseLegalNo"
                decorator={{
                  initialValue: formData.purchaseLegalNo,
                }}
                wrapperCol={{ span: 23, offset: 1, xxl: 23 }}
              >
                <Input disabled={readOnly} placeholder="请输入法人号" />
              </Field>
            </FieldLine>

            <FieldLine label="供应商号/BU" {...FieldListLayout} required>
              <Field
                name="supplierId"
                decorator={{
                  initialValue: formData.supplierId,
                  rules: [
                    {
                      required: true,
                      message: '请输入供应商号',
                    },
                  ],
                }}
                wrapperCol={{ span: 23, xxl: 23 }}
              >
                <AsyncSelect
                  source={() => selectSupplier().then(resp => resp.response)}
                  placeholder="请选择供应商号"
                  showSearch
                  filterOption={(input, option) =>
                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  onChange={this.linkageSupplier}
                />
              </Field>
              <Field
                name="supplierBuId"
                decorator={{
                  initialValue: formData.supplierBuId,
                }}
                wrapperCol={{ span: 23, offset: 1, xxl: 23 }}
              >
                <Input disabled={readOnly} />
              </Field>
            </FieldLine>

            <FieldLine label="供应商法人/法人号" {...FieldListLayout}>
              <Field
                name="supplierLegalName"
                decorator={{
                  initialValue: formData.supplierLegalName,
                }}
                wrapperCol={{ span: 23, xxl: 23 }}
              >
                <AsyncSelect
                  source={() => selectAbOus().then(resp => resp.response)}
                  showSearch
                  filterOption={(input, option) =>
                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  onChange={this.handleSupplier}
                  placeholder="请输入供应商法人"
                  // disabled={readOnly}
                />
              </Field>
              <Field
                name="supplierLegalNo"
                decorator={{
                  initialValue: formData.supplierLegalNo,
                }}
                wrapperCol={{ span: 23, offset: 1, xxl: 23 }}
              >
                <Input disabled={readOnly} placeholder="请输入法人号" />
              </Field>
            </FieldLine>

            <Field
              name="purchaseInchargeResId"
              label="采购负责人"
              {...FieldListLayout}
              decorator={{
                initialValue: formData.purchaseInchargeResId,
                rules: [
                  {
                    required: true,
                    message: '采购负责人不能为空',
                  },
                ],
              }}
            >
              <AsyncSelect
                source={() => selectUsers().then(resp => resp.response)}
                placeholder="请选择采购负责人"
                showSearch
                filterOption={(input, option) =>
                  option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                // onChange={this.linkageSupplier}
              />
            </Field>

            <Field
              presentational
              label="合同相关附件"
              {...FieldListLayout}
              decorator={{
                initialValue: null,
              }}
            >
              <FileManagerEnhance
                api="/api/op/v1/contract/purchase/sfs/token"
                dataKey={formData.id}
                listType="text"
                disabled={false}
              />
            </Field>

            <Field
              presentational
              label="比价资料"
              {...FieldListLayout}
              decorator={{
                initialValue: null,
              }}
            >
              <FileManagerEnhance
                api="/api/op/v1/contract/parity/sfs/token"
                dataKey={formData.id}
                listType="text"
                disabled={false}
              />
            </Field>

            <Field
              name="thirdPartFlag"
              label="是否第三方外包"
              {...FieldListLayout}
              decorator={{
                initialValue: formData.thirdPartFlag,
              }}
            >
              <Radio.Group>
                <Radio value={1}>是</Radio>
                <Radio value={0}>否</Radio>
              </Radio.Group>
            </Field>

            <Field
              name="contractStatus"
              label="合同状态"
              {...FieldListLayout}
              decorator={{
                initialValue: formData.contractStatus,
              }}
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
              {...FieldListLayout}
              decorator={{
                initialValue: formData.closeReason,
              }}
            >
              <UdcSelect
                disabled={readOnly}
                code="TSK. CONTRACT_CLOSE_REASON"
                placeholder="请选择关闭原因"
              />
            </Field>

            {id && (
              <Field
                name="deliBuId"
                label="交付BU"
                {...FieldListLayout}
                decorator={{
                  initialValue: formData.deliBuId,
                }}
              >
                <AsyncSelect
                  source={() => selectBu().then(resp => resp.response)}
                  placeholder="请选择交付BU"
                  showSearch
                  filterOption={(input, option) =>
                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  disabled={readOnly}
                />
              </Field>
            )}

            {id && (
              <Field
                name="deliResId"
                label="交付负责人"
                {...FieldListLayout}
                decorator={{
                  initialValue: formData.deliResId,
                }}
              >
                <AsyncSelect
                  source={() => selectUsers().then(resp => resp.response)}
                  placeholder="请选择交付负责人"
                  showSearch
                  filterOption={(input, option) =>
                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  disabled={readOnly}
                />
              </Field>
            )}

            {id && (
              <Field
                name="signBuName"
                label="签单BU"
                {...FieldListLayout}
                decorator={{
                  initialValue: formData.signBuName,
                }}
              >
                <Input disabled={readOnly} placeholder="请选择签单BU" />
              </Field>
            )}

            {id && (
              <Field
                name="salesmanResId"
                label="销售负责人"
                {...FieldListLayout}
                decorator={{
                  initialValue: formData.salesmanResId,
                }}
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
            )}

            <Field
              name="activateDate"
              label="激活时间"
              {...FieldListLayout}
              decorator={{
                initialValue: formData.activateDate ? moment(formData.activateDate) : null,
              }}
            >
              <DatePicker
                placeholder="请选择激活时间"
                format="YYYY-MM-DD"
                className="x-fill-100"
                disabled={readOnly}
              />
            </Field>

            <Field
              name="closeDate"
              label="关闭时间"
              {...FieldListLayout}
              decorator={{
                initialValue: formData.closeDate ? moment(formData.closeDate) : null,
              }}
            >
              <DatePicker
                placeholder="请选择关闭时间"
                format="YYYY-MM-DD"
                className="x-fill-100"
                disabled={readOnly}
              />
            </Field>

            <Field
              name="specCode"
              label="特殊关联码"
              {...FieldListLayout}
              decorator={{
                initialValue: formData.specCode,
              }}
            >
              <Input placeholder="请输入特殊关联码" />
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

            <Field
              name="createUserName"
              label="创建人"
              {...FieldListLayout}
              decorator={{
                initialValue: formData.createUserName,
              }}
            >
              <Input disabled={readOnly} placeholder="系统生成" />
            </Field>

            <Field
              name="createTime"
              label="创建日期"
              {...FieldListLayout}
              decorator={{
                initialValue: formData.createTime,
              }}
            >
              <Input disabled={readOnly} placeholder="系统生成" />
            </Field>
          </FieldList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default Purchases;
