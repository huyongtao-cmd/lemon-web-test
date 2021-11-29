/* eslint-disable no-nested-ternary */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import classnames from 'classnames';
import {
  Button,
  Card,
  Form,
  Input,
  DatePicker,
  InputNumber,
  Popconfirm,
  Modal,
  Tooltip,
  Spin,
} from 'antd';
import Title from '@/components/layout/Title';
import { formatMessage } from 'umi/locale';
import { createConfirm } from '@/components/core/Confirm';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import { fromQs } from '@/utils/stringUtils';
import { selectUsersWithBu, selectOus, selectCusts } from '@/services/gen/list';

import moment from 'moment';
import { isEmpty, isNil } from 'ramda';
import router from 'umi/router';
import Link from 'umi/link';

import Purchase from './TabContent/Purchase';
import Gathering from './TabContent/Gathering';
import Sharing from './TabContent/Sharing';
import Fee from './TabContent/Fee';
import PurchaseDemandDeal from './TabContent/PurchaseDemandDeal';
import ChannelFee from './TabContent/ChannelFee';

import { formatDT } from '@/utils/tempUtils/DateTime';
import AsyncSelect from '@/components/common/AsyncSelect';
import SelectWithCols from '@/components/common/SelectWithCols';
import FieldList from '@/components/layout/FieldList';
import { UdcSelect, FileManagerEnhance, Selection } from '@/pages/gen/field';
import { selectContract, selectFinperiod, selectBuProduct } from '@/services/user/Contract/sales';
import { selectBus } from '@/services/org/bu/bu';
import { selectUsers } from '@/services/sys/user';
import createMessage from '@/components/core/AlertMessage';
import DataTable from '@/components/common/DataTable';

const DOMAIN = 'userContractEditSub';
const { Field, FieldLine } = FieldList;
const FieldListLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
const particularColumns = [{ dataIndex: 'name', title: '名称', span: 16 }];
const subjCol = [
  { dataIndex: 'code', title: '编号', span: 6 },
  { dataIndex: 'name', title: '名称', span: 14 },
];

@connect(({ loading, dispath, userContractEditSub, userContractSharing, user }) => ({
  dispath,
  loading,
  userContractEditSub,
  userContractSharing,
  user,
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    if (isEmpty(changedFields)) return;
    const { name, value } = Object.values(changedFields)[0];
    if (
      value instanceof Object &&
      name !== 'startDate' &&
      name !== 'endDate' &&
      name !== 'signDate'
    ) {
      const key = name.split('Id')[0];
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { [key + 'Id']: value.id, [key + 'Name']: value.name },
      });
    }
    // else if (name === 'custpaytravelFlag') {
    //   // const val = value === 'YES' ? 1 : 0;
    //   props.dispatch({
    //     type: `${DOMAIN}/updateForm`,
    //     payload: { [name]: value === undefined ? null : value },
    //   });
    // }
    else if (name === 'startDate' || name === 'endDate' || name === 'signDate') {
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
    props.dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { flag1: 1 },
    });
  },
})
@mountToTab()
class EidtSubContract extends PureComponent {
  state = {
    visible: false,
    ruleSelectedRowKeys: [], // 选中的利益分配规则主数据
    ruleSelectedRows: -1, // 选中的利益分配规则主数据
  };

  componentDidMount() {
    // 初始得到主合同id给formData赋值
    const { dispatch, user = {} } = this.props;
    const {
      user: { extInfo = {} },
    } = user;
    const { id } = fromQs();

    dispatch({
      type: `${DOMAIN}/querySub`,
      payload: id,
    }).then(res => {
      if (res.ok) {
        const { demandType, signBuIdInchargeResId } = res.datum;
        // demandType  SERVICES_TRADE、PRODUCT_TRADE显示采购需求处理
        if (demandType !== 'SERVICES_TRADE' && demandType !== 'PRODUCT_TRADE') {
          this.getPagesConfig(res);
        } else {
          // 加载页面配置
          dispatch({
            type: `${DOMAIN}/getPageConfig`,
            payload: { pageNo: 'SALE_CONTRACT_EDIT_SUB' },
          });
        }

        // // 渠道费用场景化配置显示
        // if (extInfo.resId === signBuIdInchargeResId) {
        //   // 签单BU负责人
        //   dispatch({
        //     type: `${DOMAIN}/getPageConfig`,
        //     payload: { pageNo: 'SALE_CONTRACT_EDIT_SUB:SING_BU_RES_ID' },
        //   });
        // }
      }
    });
    dispatch({ type: `${DOMAIN}/bu` });
    dispatch({ type: `${DOMAIN}/user` });
    dispatch({ type: `${DOMAIN}/salesRegionBu` });
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        flag1: 0,
        flag2: 0,
        flag3: 0,
        flag4: 0,
        flag5: 0,
        flag6: 0,
        flag7: 0,
        operationkeyEdit: 'Info',
        // operationkeyEdit: 'ChannelFee',
      },
    });

    this.ruleFetchData();
  }

  // 场景化拉取Tab
  getPagesConfig = res => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'SALE_CONTRACT_EDIT_SUB:not' },
    });
  };

  handleSaveDispatch = () => {
    const { dispatch, user = {} } = this.props;
    const {
      user: { extInfo = {} },
    } = user;
    const { id } = fromQs();

    dispatch({
      type: `${DOMAIN}/editInfo`,
    }).then(res => {
      dispatch({
        type: `${DOMAIN}/querySub`,
        payload: id,
      }).then(ress => {
        if (ress.ok) {
          const { demandType, signBuIdInchargeResId } = ress.datum;
          // cooperationType  SERVICES_TRADE、PRODUCT_TRADE显示采购需求处理
          if (demandType !== 'SERVICES_TRADE' && demandType !== 'PRODUCT_TRADE') {
            this.getPagesConfig(ress);
          } else if (extInfo.resId === signBuIdInchargeResId) {
            // 签单BU负责人
            dispatch({
              type: `${DOMAIN}/getPageConfig`,
              payload: { pageNo: 'SALE_CONTRACT_EDIT_SUB:SING_BU_RES_ID' },
            });
          } else {
            // 加载页面配置
            dispatch({
              type: `${DOMAIN}/getPageConfig`,
              payload: { pageNo: 'SALE_CONTRACT_EDIT_SUB' },
            });
          }
        }
      });
    });
  };

  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
      userContractEditSub: { operationkeyEdit, formData },
    } = this.props;
    const { id } = fromQs();
    if (operationkeyEdit === 'Info') {
      validateFieldsAndScroll((error, values) => {
        if (!error) {
          // demandType 需求类别为空时会清空采购需求明细
          if (!formData.demandType) {
            createConfirm({
              content: '需求类别为空，继续操作将清除合同关联的所有采购需求明细!',
              onOk: () => {
                this.handleSaveDispatch();
              },
            });
          } else {
            this.handleSaveDispatch();
          }
        }
      });
    } else if (operationkeyEdit === 'Gathering') {
      dispatch({
        type: 'userContractGathering/save',
      }).then(res => {
        dispatch({
          type: `${DOMAIN}/querySub`,
          payload: id,
        });
      });
    } else if (operationkeyEdit === 'Fee') {
      dispatch({
        type: 'Fee/save',
        payload: { contractId: id },
      }).then(res => {
        dispatch({
          type: `${DOMAIN}/querySub`,
          payload: id,
        });
      });
    } else if (operationkeyEdit === 'PurchaseDemandDeal') {
      dispatch({
        type: 'purchaseDemandDeal/save',
      });
    } else if (operationkeyEdit === 'ChannelFee') {
      dispatch({
        type: 'ChannelFee/save',
      });
    }
    // else if (operationkeyEdit === 'Sharing') {
    //   dispatch({
    //     type: 'userContractSharing/save',
    //   });
    // }
  };

  handleReset = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'userContractSharing/reset',
    });
  };

  handleResetCreate = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'userContractSharing/resetCreate',
    });
    // 清空利益分配
    dispatch({
      type: 'userContractSharing/updateState',
      payload: {
        otherRule: [],
      },
    });
  };

  // 选择其他平台分配规则 弹窗
  targetToggleVisible = () => {
    const { visible } = this.state;
    this.setState({ visible: !visible });
  };

  // 强制重置
  handleForceReset = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'userContractSharing/forceReset',
    });
  };

  // 保存收益分配
  handleSaveSharing = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'userContractSharing/save',
    });
  };

  handleCancel = () => {
    closeThenGoto('/sale/contract/salesList');
  };

  onOperationTabChange = key => {
    // 判断是否为该合同项目经理，为权限预留
    const {
      dispatch,
      userContractEditSub: { formData },
      user: {
        user: {
          extInfo: { resId },
        },
      },
    } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { operationkeyEdit: key },
    });
  };

  handleChange = value => {
    const { dispatch, form } = this.props;
    dispatch({
      type: `${DOMAIN}/UDC_SmallClass`,
      payload: value,
    }).then(() => {
      // 2级联动选项滞空
      form.setFieldsValue({
        saleType2: null,
        saleType2Desc: null,
      });
    });
  };

  ruleFetchData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/ruleQuery`,
      payload: params,
    });
  };

  selectRule = e => {
    const { dispatch } = this.props;
    const { id: contractId } = fromQs();
    const { visible, ruleSelectedRowKeys, ruleSelectedRows } = this.state;
    this.targetToggleVisible();
    // 直接更新利益分配的state
    dispatch({
      type: `userContractSharing/updateState`,
      payload: {
        otherRule: ruleSelectedRows,
      },
    });
    let profitRuleId = -1;
    if (ruleSelectedRows && ruleSelectedRows.length === 1) {
      profitRuleId = ruleSelectedRows[0].id;
    }

    dispatch({
      type: `userContractSharing/getProfitAgreesByRuleId`,
      payload: {
        contractId,
        profitRuleId,
      },
    });
  };

  closeRule = e => {
    const { visible, ruleSelectedRowKeys, ruleSelectedRows } = this.state;
    this.setState({ ruleSelectedRowKeys: [] }); // 清空
    this.setState({ ruleSelectedRows: [] }); // 清空
    this.targetToggleVisible();
  };

  // 根据权限配置中的表单字段修改visible属性
  filterTabByField = (pageTabViews, formData, resId, baseBuId) => {
    const arr = JSON.parse(JSON.stringify(pageTabViews));
    arr.forEach((item, index) => {
      Array.isArray(item.permissionViews) &&
        item.permissionViews.forEach(view => {
          if (view.allowType === 'FIELD') {
            if (formData[view.allowValue] === resId) {
              !item.visible ? (arr[index].visible = true) : null;
            }
          }
          if (view.allowType === 'BUFIELD') {
            if (formData[view.allowValue] === baseBuId) {
              !item.visible ? (arr[index].visible = true) : null;
            }
          }
        });
    });
    return arr;
  };

  render() {
    const {
      dispatch,
      loading,
      userContractEditSub: {
        formData,
        smallClass,
        flag1,
        flag2,
        flag3,
        flag4,
        flag5,
        flag6,
        flag7,
        buData = [],
        deliBuDataSource = [],
        salesRegionBuData = [],
        salesRegionBuDataSource = [],
        userData = [],
        deliResDataSource = [],
        operationkeyEdit,
        ruleTotal,
        ruleDataSource,
        preSaleBuDataSource,
        preSaleResDataSource = [],
        pageConfig = {},
        attache,
      },
      userContractSharing: { ruleList, otherRule },
      form: { getFieldDecorator, setFields },
      user: {
        user: {
          admin,
          roles = [],
          extInfo: { resId, baseBuId },
        },
      },
    } = this.props;

    let profitRuleId = null;
    if (otherRule && otherRule.length > 0) {
      profitRuleId = otherRule[0].id;
    }
    const { visible, ruleSelectedRowKeys, ruleSelectedRows } = this.state;
    const readOnly = true;
    const { contractStatus } = formData; // CREATE：新建，ACTIVE：激活

    const ALREADY_USED = (ruleList[0] || {}).agreeStatus === 'SETTLED';

    const { pageBlockViews = [] } = pageConfig;
    if (!pageBlockViews || pageBlockViews.length < 1) {
      return <div />;
    }
    let pageFieldView = [];
    let ruleView = [];
    let ruleQuery = [];
    pageBlockViews.forEach(block => {
      if (block.blockKey === 'SALE_CONTRACT_EDIT_SUB') {
        pageFieldView = block.pageFieldViews;
      }

      if (block.blockKey === 'SALE_CONTRACT_EDIT_SUB_PROFIT_POP_LIST') {
        ruleView = block.pageFieldViews;
      }

      if (block.blockKey === 'SALE_CONTRACT_EDIT_SUB_PROFIT_POP_QUERY') {
        ruleQuery = block.pageFieldViews;
      }
    });
    const pageFieldJson = {};
    pageFieldView.forEach(field => {
      pageFieldJson[field.fieldKey] = field;
    });

    const ruleJson = {};
    const queryJson = {};
    ruleView.forEach(field => {
      ruleJson[field.fieldKey] = field;
    });
    ruleQuery.forEach(field => {
      queryJson[field.fieldKey] = field;
    });

    if (
      !pageBlockViews ||
      pageBlockViews.length === 0 ||
      !ruleView ||
      ruleView.length === 0 ||
      !ruleQuery ||
      ruleQuery.length === 0
    ) {
      return <div />;
    }
    const disabledBtn =
      loading.effects[`${DOMAIN}/querySub`] ||
      loading.effects[`${DOMAIN}/editInfo`] ||
      loading.effects[`userContractGathering/save`] ||
      loading.effects[`userContractSharing/save`] ||
      loading.effects[`purchaseDemandDeal/save`] ||
      loading.effects[`purchaseDemandDeal/query`] ||
      loading.effects[`ChannelFee/query`] ||
      loading.effects[`ChannelFee/save`];

    const pageConfigLoading =
      loading.effects[`${DOMAIN}/getPageConfig`] || loading.effects[`${DOMAIN}/querySub`];

    const operationTabList = [
      {
        key: 'Info',
        tab: (
          <Title
            dir="right"
            icon={flag1 ? 'warning' : null}
            id="user.contract.tab.info"
            defaultMessage="合同信息"
          />
        ),
      },
      {
        key: 'Purchase',
        tab: (
          <Title
            dir="right"
            icon={flag2 ? 'warning' : null}
            id="user.contract.tab.purchase"
            defaultMessage="采购合同"
          />
        ),
      },
      {
        key: 'Gathering',
        tab: (
          <Title
            dir="right"
            icon={flag3 ? 'warning' : null}
            id="user.contract.tab.gathering"
            defaultMessage="收款计划"
          />
        ),
      },
      {
        key: 'Sharing',
        tab: (
          <Title
            dir="right"
            icon={flag4 ? 'warning' : null}
            id="user.contract.tab.sharing"
            defaultMessage="收益分配"
          />
        ),
      },
      {
        key: 'Fee',
        tab: (
          <Title
            dir="right"
            icon={flag5 ? 'warning' : null}
            text="相关费用"
            defaultMessage="相关费用"
          />
        ),
      },
      {
        key: 'PurchaseDemandDeal',
        tab: (
          <Title
            dir="right"
            icon={flag6 ? 'warning' : null}
            text="采购需求处理"
            defaultMessage="采购需求处理"
          />
        ),
      },
      {
        key: 'ChannelFee',
        tab: (
          <Title
            dir="right"
            icon={flag7 ? 'warning' : null}
            text="渠道费用确认单"
            defaultMessage="渠道费用确认单"
          />
        ),
      },
    ];

    const baseInfo = [
      <Field
        key="contractName"
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
      </Field>,

      <Field
        key="contractNo"
        name="contractNo"
        label="编号"
        {...FieldListLayout}
        decorator={{
          initialValue: formData.contractNo,
        }}
      >
        <Input disabled={readOnly} placeholder="系统生成" />
      </Field>,

      <Field
        key="mainContractId"
        name="mainContractName"
        label="主合同"
        decorator={{
          initialValue: formData.mainContractName,
          rules: [
            {
              required: false,
              message: '请选择主合同',
            },
          ],
        }}
        {...FieldListLayout}
      >
        <Selection
          source={() => selectContract()}
          placeholder="请选择主合同"
          showSearch
          disabled={readOnly}
        />
      </Field>,

      <Field
        key="userdefinedNo"
        name="userdefinedNo"
        label="参考合同号"
        {...FieldListLayout}
        decorator={{
          initialValue: formData.userdefinedNo,
        }}
      >
        <Input placeholder="请输入参考合同号" />
      </Field>,

      <Field
        key="signBuId"
        name="signBuName"
        label="签单BU"
        decorator={{
          initialValue: formData.signBuName,
          rules: [
            {
              required: false,
              message: '请选择签单BU',
            },
          ],
        }}
        {...FieldListLayout}
      >
        <Selection
          source={() => selectBus()}
          placeholder="请选择签单BU"
          showSearch
          disabled={readOnly}
        />
      </Field>,

      <Field
        key="salesmanResId"
        name="salesmanResName"
        label="销售负责人"
        decorator={{
          initialValue: formData.salesmanResName,
          rules: [
            {
              required: false,
              message: '请选择销售负责人',
            },
          ],
        }}
        {...FieldListLayout}
      >
        <Input disabled />
      </Field>,

      <Field
        key="deliBuId"
        name="deliBuId"
        label="交付BU"
        decorator={{
          initialValue: formData.deliBuId || undefined,
          rules: [
            {
              required: true,
              message: '请选择交付BU',
            },
          ],
        }}
        {...FieldListLayout}
      >
        <Selection.Columns
          className="x-fill-100"
          source={deliBuDataSource}
          columns={subjCol}
          transfer={{ key: 'id', code: 'id', name: 'name' }}
          dropdownMatchSelectWidth={false}
          showSearch
          onColumnsChange={value => {}}
          placeholder="请选择主交付BU"
        />
      </Field>,

      <Field
        key="deliResId"
        name="deliResId"
        label="交付负责人"
        decorator={{
          initialValue: formData.deliResId || undefined,
          rules: [
            {
              required: true,
              message: '请选择交付负责人',
            },
          ],
        }}
        {...FieldListLayout}
      >
        <Selection.Columns
          className="x-fill-100"
          source={deliResDataSource}
          columns={subjCol}
          transfer={{ key: 'id', code: 'id', name: 'name' }}
          dropdownMatchSelectWidth={false}
          showSearch
          onColumnsChange={value => {}}
          placeholder="请选择交付负责人"
        />
      </Field>,
      <Field
        key="preSaleBuId"
        name="preSaleBuId"
        label="售前BU"
        decorator={{
          initialValue: formData.preSaleBuId || undefined,
          rules: [
            {
              required: true,
              message: '请选择售前BU',
            },
          ],
        }}
        {...FieldListLayout}
      >
        <Selection.Columns
          className="x-fill-100"
          source={preSaleBuDataSource}
          columns={subjCol}
          transfer={{ key: 'id', code: 'id', name: 'name' }}
          dropdownMatchSelectWidth={false}
          showSearch
          onColumnsChange={value => {}}
          placeholder="请选择主交付BU"
        />
      </Field>,

      <Field
        key="preSaleResId"
        name="preSaleResId"
        label="售前负责人"
        decorator={{
          initialValue: formData.preSaleResId || undefined,
          rules: [
            {
              required: true,
              message: '请选择售前负责人',
            },
          ],
        }}
        {...FieldListLayout}
      >
        <Selection.Columns
          className="x-fill-100"
          source={preSaleResDataSource}
          columns={subjCol}
          transfer={{ key: 'id', code: 'id', name: 'name' }}
          dropdownMatchSelectWidth={false}
          showSearch
          onColumnsChange={value => {}}
          placeholder="请选择售前负责人"
        />
      </Field>,
      <Field
        key="pmoResId"
        name="pmoResId"
        label="PMO"
        decorator={{
          initialValue: formData.pmoResId || undefined,
        }}
        {...FieldListLayout}
      >
        <Selection.Columns
          className="x-fill-100"
          source={() => selectUsersWithBu()}
          columns={particularColumns}
          transfer={{ key: 'id', code: 'id', name: 'name' }}
          dropdownMatchSelectWidth={false}
          showSearch
          onColumnsChange={value => {}}
          placeholder="请选择PMO"
        />
      </Field>,
      <Field
        key="regionBuId"
        name="regionBuId"
        label="销售区域BU"
        decorator={{
          initialValue: formData.regionBuId || undefined,
          rules: [
            {
              required: true,
              message: '请选择销售区域BU',
            },
          ],
        }}
        {...FieldListLayout}
      >
        <Selection.Columns
          className="x-fill-100"
          source={salesRegionBuDataSource}
          columns={subjCol}
          transfer={{ key: 'id', code: 'id', name: 'name' }}
          dropdownMatchSelectWidth={false}
          showSearch
          onColumnsChange={value => {}}
          placeholder="请选择销售区域BU"
        />
      </Field>,

      <Field
        key="signDate"
        name="signDate"
        label="签订日期"
        decorator={{
          initialValue: formData.signDate ? moment(formData.signDate) : null,
        }}
        {...FieldListLayout}
      >
        <DatePicker placeholder="请选择签订日期" className="x-fill-100" />
      </Field>,

      <Field
        key="startDate"
        name="startDate"
        label="合同开始日期"
        decorator={{
          initialValue: formData.startDate ? moment(formData.startDate) : null,
          rules: [
            {
              validator: (rule, value, callback) => {
                if (value && formData.endDate && moment(formData.endDate).isBefore(value)) {
                  callback('合同开始日期应该早于结束日期');
                }
                // Note: 必须总是返回一个 callback，否则 validateFieldsAndScroll 无法响应
                callback();
              },
            },
          ],
        }}
        {...FieldListLayout}
      >
        <DatePicker placeholder="请选择合同开始日期" format="YYYY-MM-DD" className="x-fill-100" />
      </Field>,

      <Field
        key="endDate"
        name="endDate"
        label="合同结束日期"
        decorator={{
          initialValue: formData.endDate ? moment(formData.endDate) : null,
          rules: [
            {
              validator: (rule, value, callback) => {
                if (value && formData.startDate && moment(value).isBefore(formData.startDate)) {
                  callback('合同结束日期应该晚于开始日期');
                }
                // Note: 必须总是返回一个 callback，否则 validateFieldsAndScroll 无法响应
                callback();
              },
            },
          ],
        }}
        {...FieldListLayout}
      >
        <DatePicker placeholder="请选择合同结束日期" format="YYYY-MM-DD" className="x-fill-100" />
      </Field>,

      <Field
        key="attache"
        name="attache"
        label="附件"
        decorator={{
          initialValue: formData.attache,
          // rules: [
          //   {
          //     required:attache.requiredFlag,
          //     message:`请输入${attache.displayName}`,
          //   },
          // ],
        }}
        {...FieldListLayout}
      >
        <FileManagerEnhance
          api="/api/op/v1/contract/sub/sfs/token"
          dataKey={formData.id}
          listType="text"
          disabled={false}
        />
      </Field>,

      <Field
        key="deliveryAddress"
        name="deliveryAddress"
        label="交付地点"
        decorator={{
          initialValue: formData.deliveryAddress,
        }}
        {...FieldListLayout}
      >
        <Input placeholder="请输入交付地点" />
      </Field>,

      <Field
        key="contractStatus"
        name="contractStatus"
        label="合同状态"
        decorator={{
          initialValue: formData.contractStatus,
        }}
        {...FieldListLayout}
      >
        <Selection.UDC
          disabled={readOnly}
          code="TSK.CONTRACT_STATUS"
          placeholder="请选择合同状态"
        />
      </Field>,

      <Field
        key="closeReason"
        name="closeReason"
        label="关闭原因"
        decorator={{
          initialValue: formData.closeReason,
        }}
        {...FieldListLayout}
      >
        <Selection.UDC
          disabled={readOnly}
          code="TSK.CONTRACT_CLOSE_REASON"
          placeholder="请选择关闭原因"
        />
      </Field>,

      <Field key="activateDate" label="合同激活日期" presentational {...FieldListLayout}>
        <Input
          placeholder="系统生成"
          value={formData.activateDate ? formatDT(formData.activateDate) : null}
          disabled={readOnly}
        />
      </Field>,
      <Field key="closeDate" label="合同关闭日期" presentational {...FieldListLayout}>
        <Input
          placeholder="系统生成"
          value={formData.closeDate ? formatDT(formData.closeDate) : null}
          disabled={readOnly}
        />
      </Field>,

      <Field
        key="currCode"
        name="currCode"
        label="币种"
        decorator={{
          initialValue: formData.currCode,
          rules: [
            {
              required: true,
              message: '请选择币种',
            },
          ],
        }}
        {...FieldListLayout}
      >
        <Selection.UDC code="COM.CURRENCY_KIND" placeholder="请选择币种" />
      </Field>,
      <Field
        key="paperStatus"
        name="paperStatus"
        label="纸质合同状态"
        decorator={{
          initialValue: formData.paperStatus,
        }}
        {...FieldListLayout}
      >
        <Selection.UDC code="TSK:CONT_PAPER_STATUS" placeholder="请选择纸质合同状态" />
      </Field>,
      <Field
        key="paperDesc"
        name="paperDesc"
        label="纸质合同状态描述"
        decorator={{
          initialValue: formData.paperDesc,
        }}
        fieldCol={1}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
      >
        <Input.TextArea placeholder="请输入纸质合同状态描述" rows={3} />
      </Field>,

      <Field
        key="remark"
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
      </Field>,

      <Field
        key="createUserId"
        name="createUserName"
        label="创建人"
        decorator={{
          initialValue: formData.createUserName,
        }}
        {...FieldListLayout}
      >
        <Input disabled={readOnly} placeholder="系统生成" />
      </Field>,

      <Field
        key="createTime"
        name="createTime"
        label="创建日期"
        decorator={{
          initialValue: formData.createTime,
        }}
        {...FieldListLayout}
        disabled={readOnly}
      >
        <Input disabled={readOnly} placeholder="系统生成" />
      </Field>,
    ]
      .filter(
        field =>
          !field.key || (pageFieldJson[field.key] && pageFieldJson[field.key].visibleFlag === 1)
      )
      .map(field => ({
        ...field,
        props: {
          ...field.props,
          // eslint-disable-next-line no-nested-ternary
          name:
            pageFieldJson[field.key].fieldKey === 'signBuId'
              ? 'signBuName'
              : // eslint-disable-next-line no-nested-ternary
                pageFieldJson[field.key].fieldKey === 'salesmanResId'
                ? 'salesmanResName'
                : // eslint-disable-next-line no-nested-ternary
                  pageFieldJson[field.key].fieldKey === 'mainContractId'
                  ? 'mainContractName'
                  : pageFieldJson[field.key].fieldKey === 'createUserId'
                    ? 'createUserName'
                    : pageFieldJson[field.key].fieldKey,
          label: pageFieldJson[field.key].displayName,
          sortNo: pageFieldJson[field.key].sortNo,
          decorator: {
            ...field.props.decorator,
            rules: [
              {
                required: pageFieldJson[field.key].requiredFlag,
                message: `请输入${pageFieldJson[field.key].displayName}`,
              },
            ],
          },
        },
      }))
      .sort((f1, f2) => f1.props.sortNo - f2.props.sortNo);

    const saleInfo = [
      <Field
        key="productId"
        name="productId"
        label="产品"
        decorator={{
          initialValue: formData.productId || undefined,
        }}
        {...FieldListLayout}
      >
        <Selection source={() => selectBuProduct()} placeholder="请选择产品" showSearch />
      </Field>,

      <Field
        key="briefDesc"
        name="briefDesc"
        label="简要说明"
        decorator={{
          initialValue: formData.briefDesc,
        }}
        {...FieldListLayout}
      >
        <Input placeholder="请输入简要说明" />
      </Field>,

      <Field
        key="workType"
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
        <Selection.UDC code="TSK.WORK_TYPE" placeholder="请选择工作类型" />
      </Field>,

      <Field
        key="promotionType"
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
        {...FieldListLayout}
      >
        <Selection.UDC code="TSK.PROMOTION_TYPE" placeholder="请选择促销码" />
      </Field>,

      <Field
        key="rangeProp"
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
        <Selection.UDC code="TSK.RANGE_PROP" placeholder="请选择范围性质" />
      </Field>,

      <Field
        key="halfOpenDesc"
        name="halfOpenDesc"
        label="半开口说明"
        decorator={{
          initialValue: formData.halfOpenDesc,
        }}
        {...FieldListLayout}
      >
        <Input placeholder="请输入半开口说明" />
      </Field>,

      <Field
        key="saleType1"
        name="saleType1"
        label="产品大类"
        decorator={{
          initialValue: formData.saleType1,
          rules: [
            {
              required: true,
              message: '请选择产品大类',
            },
          ],
        }}
        {...FieldListLayout}
      >
        <Selection.UDC
          code="TSK.SALE_TYPE1"
          onChange={this.handleChange}
          placeholder="请选择产品大类"
        />
      </Field>,

      <Field
        key="saleType2"
        name="saleType2"
        label="产品小类"
        decorator={{
          initialValue: formData.saleType2 || undefined,
        }}
        {...FieldListLayout}
      >
        <Selection source={smallClass} placeholder="请选择产品小类" showSearch />
      </Field>,

      <Field
        key="prodProp"
        name="prodProp"
        label="供应主体类别"
        decorator={{
          initialValue: formData.prodProp,
          rules: [
            {
              required: true,
              message: '请选择供应主体类别',
            },
          ],
        }}
        {...FieldListLayout}
      >
        <Selection.UDC code="COM.PROD_PROP" placeholder="请选择供应主体类别" />
      </Field>,

      <Field
        key="projProp"
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
        <Selection.UDC code="TSK.PROJ_PROP" placeholder="请选择提成类别" />
      </Field>,

      <Field
        key="channelType"
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
        {...FieldListLayout}
      >
        <Selection.UDC code="TSK.CHANNEL_TYPE" placeholder="请选择交易方式" />
      </Field>,

      <Field
        key="cooperationType"
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
        {...FieldListLayout}
      >
        <Selection.UDC
          code="TSK.COOPERATION_TYPE"
          placeholder="请选择交易性质"
          onValueChange={e => {
            if (e.sphd1 === '1') {
              dispatch({
                type: `${DOMAIN}/updateForm`,
                payload: {
                  demandTypeRequired: e.sphd1 === '1',
                },
              });
              if (!formData.demandType) {
                setFields({
                  demandType: {
                    value: undefined,
                    error: [new Error('请选择需求类别')],
                  },
                });
              }
            } else {
              dispatch({
                type: `${DOMAIN}/updateForm`,
                payload: {
                  demandTypeRequired: false,
                },
              });
              if (!formData.demandType) {
                setFields({
                  demandType: {
                    value: undefined,
                    success: [new Error('请选择需求类别')],
                  },
                });
              }
            }
          }}
        />
      </Field>,
      <Field
        key="demandType"
        name="demandType"
        label="需求类别"
        decorator={{
          initialValue: formData.demandType,
          rules: [
            {
              required: true,
              message: '请选择需求类别',
            },
          ],
        }}
        {...FieldListLayout}
      >
        <Selection.UDC
          filters={[{ sphd1: '1' }]}
          code="TSK:BUSINESS_TYPE"
          placeholder="请选择需求类别"
          // disabled={formData.contractStatus === 'ACTIVE'}
        />
      </Field>,
    ]
      .filter(
        field =>
          !field.key || (pageFieldJson[field.key] && pageFieldJson[field.key].visibleFlag === 1)
      )
      .map(field => ({
        ...field,
        props: {
          ...field.props,
          name: pageFieldJson[field.key].fieldKey,
          label: pageFieldJson[field.key].displayName,
          sortNo: pageFieldJson[field.key].sortNo,
          decorator: {
            ...field.props.decorator,
            rules: [
              {
                required:
                  field.key === 'demandType'
                    ? pageFieldJson[field.key].requiredFlag && formData.demandTypeRequired
                    : pageFieldJson[field.key].requiredFlag,
                message: `请输入${pageFieldJson[field.key].displayName}`,
              },
            ],
          },
        },
      }))
      .sort((f1, f2) => f1.props.sortNo - f2.props.sortNo);

    const finInfo = [
      <Field
        key="custpaytravelFlag"
        name="custpaytravelFlag"
        label="客户承担差旅费"
        decorator={{
          initialValue: formData.custpaytravelFlag,
          rules: [
            {
              required: false,
              message: '请选择客户承担差旅费',
            },
          ],
        }}
        {...FieldListLayout}
      >
        <Selection.UDC code="ACC:CONTRACT_CUSTPAY_TRAVEL" placeholder="请选择合作类型" />
      </Field>,

      <Field
        key="reimbursementDesc"
        name="reimbursementDesc"
        label="报销政策说明"
        decorator={{
          initialValue: formData.reimbursementDesc,
          rules: [
            {
              required: false,
              message: '报销政策说明',
            },
          ],
        }}
        {...FieldListLayout}
      >
        <Input placeholder="请输入报销政策说明" />
      </Field>,

      <FieldLine key="amtTaxRate" label="含税总金额/税率" {...FieldListLayout} required>
        {pageFieldJson.amt.visibleFlag && (
          <Field
            key="amt"
            name={pageFieldJson.amt.fieldKey}
            decorator={{
              initialValue: formData.amt,
              rules: [
                {
                  required: pageFieldJson.amt.requiredFlag,
                  message: `请输入${pageFieldJson.amt.displayName}`,
                },
              ],
            }}
            wrapperCol={{ span: 23, xxl: 23 }}
          >
            <InputNumber
              placeholder={`请输入${pageFieldJson.amt.displayName}`}
              disabled={pageFieldJson.amt.fieldMode !== 'EDITABLE'}
              className="x-fill-100"
            />
          </Field>
        )}
        {pageFieldJson.taxRate.visibleFlag && (
          <Field
            name="taxRate"
            decorator={{
              initialValue: formData.taxRate + '',
              rules: [
                {
                  required: pageFieldJson.taxRate.requiredFlag,
                  message: `请输入${pageFieldJson.taxRate.displayName}`,
                },
              ],
            }}
            wrapperCol={{ span: 23, offset: 1, xxl: 23 }}
          >
            <Selection.UDC
              code="COM.TAX_RATE"
              className="x-fill-100"
              placeholder={`请输入${pageFieldJson.taxRate.displayName}`}
              disabled={pageFieldJson.taxRate.fieldMode !== 'EDITABLE'}
            />
          </Field>
        )}
      </FieldLine>,
      <Field
        key="noTax"
        name="noTax"
        label="不含税金额"
        decorator={{
          initialValue: formData.noTax,
        }}
        {...FieldListLayout}
      >
        <Input disabled placeholder="系统自动生成" />
      </Field>,
      <Field
        key="purchasingSum"
        name="purchasingSum"
        label="相关项目采购"
        decorator={{
          initialValue: formData.purchasingSum,
        }}
        {...FieldListLayout}
      >
        <Input disabled placeholder="系统自动生成" className="x-fill-100" />
      </Field>,
      <Field
        key="extraAmt"
        name="extraAmt"
        label="其它应减费用"
        decorator={{
          initialValue: formData.extraAmt,
        }}
        {...FieldListLayout}
      >
        <InputNumber disabled placeholder="系统自动生成" className="x-fill-100" />
      </Field>,
      <Field
        key="effectiveAmt"
        name="effectiveAmt"
        label="有效合同额"
        decorator={{
          initialValue: formData.effectiveAmt,
        }}
        {...FieldListLayout}
      >
        <InputNumber disabled placeholder="请输入有效合同额" className="x-fill-100" />
      </Field>,

      <Field
        key="grossProfit"
        name="grossProfit"
        label="毛利"
        decorator={{
          initialValue: formData.grossProfit,
        }}
        {...FieldListLayout}
      >
        <InputNumber placeholder="请输入毛利" className="x-fill-100" />
      </Field>,

      <Field
        key="finPeriodId"
        name="finPeriodId"
        label="财务期间"
        decorator={{
          initialValue: formData.finPeriodId || undefined,
          rules: [
            {
              required: true,
              message: '请选择财务期间',
            },
          ],
        }}
        {...FieldListLayout}
      >
        <Selection source={() => selectFinperiod()} placeholder="请选择财务期间" showSearch />
      </Field>,
    ]
      .filter(
        field =>
          !field.key || (pageFieldJson[field.key] && pageFieldJson[field.key].visibleFlag === 1)
      )
      .map(field => ({
        ...field,
        props: {
          ...field.props,
          name: pageFieldJson[field.key].fieldKey,
          label: pageFieldJson[field.key].displayName,
          sortNo: pageFieldJson[field.key].sortNo,
          decorator: {
            ...field.props.decorator,
            rules: [
              {
                required: pageFieldJson[field.key].requiredFlag,
                message: `请输入${pageFieldJson[field.key].displayName}`,
              },
            ],
          },
        },
      }))
      .sort((f1, f2) => f1.props.sortNo - f2.props.sortNo);

    const contentList = {
      Info: (
        <>
          <FieldList
            layout="horizontal"
            legend={formatMessage({ id: `sys.system.basicInfo`, desc: '基本信息' })}
            getFieldDecorator={getFieldDecorator}
            col={2}
            hasSeparator={1}
          >
            {baseInfo}
          </FieldList>

          <FieldList
            layout="horizontal"
            legend="销售信息"
            getFieldDecorator={getFieldDecorator}
            col={2}
            hasSeparator={1}
          >
            {saleInfo}
          </FieldList>

          <FieldList
            layout="horizontal"
            legend="财务信息"
            getFieldDecorator={getFieldDecorator}
            col={2}
          >
            {finInfo}
          </FieldList>
        </>
      ),
      Purchase: <Purchase />,
      Gathering: <Gathering formData={formData} />,
      Sharing: <Sharing formData={formData} />,
      Fee: <Fee formData={formData} />,
      PurchaseDemandDeal: <PurchaseDemandDeal />,
      ChannelFee: <ChannelFee />,
    };
    let keyList = [];
    if (pageConfig && pageConfig.pageTabViews) {
      const resArr = this.filterTabByField(pageConfig.pageTabViews, formData, resId, baseBuId);
      keyList = resArr.filter(view => view.visible).map(view => view.tabKey);
    }
    const permissionTabList = operationTabList.filter(tab => keyList.indexOf(tab.key) > -1);

    const btnJson = {};
    if (pageConfig && pageConfig.pageButtonViews && pageConfig.pageButtonViews.length > 1) {
      pageConfig.pageButtonViews.forEach(btn => {
        btnJson[btn.buttonKey] = btn;
      });
    }

    const ruleTableProps = {
      rowKey: 'id',
      columnsCache: 'sysBasicProfitdistRule',
      loading: loading.effects[`${DOMAIN}/ruleQuery`],
      total: ruleTotal,
      dataSource: ruleDataSource,
      rowSelection: {
        type: 'radio',
        selectedRowKeys: ruleSelectedRowKeys,
        onChange: (rowKey, rows) => {
          this.setState({
            ruleSelectedRowKeys: rowKey,
            ruleSelectedRows: rows,
          });
        },
      },
      onChange: filters => {
        this.ruleFetchData(filters);
      },
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/ruleUpdateSearchForm`,
          payload: allValues,
        });
      },
      searchBarForm: [
        {
          title: '分配规则码',
          key: 'ruleNo',
          dataIndex: 'ruleNo',
          tag: <Input placeholder="请输入分配规则码" />,
        },
        {
          title: '签单法人主体',
          key: 'ouId',
          dataIndex: 'ouId',
          tag: <Selection source={() => selectOus()} placeholder="请选择签单法人主体" />,
        },
        {
          title: 'BU',
          key: 'buId',
          dataIndex: 'buId',
          tag: <Selection source={() => selectBus()} placeholder="请选择BU" />,
        },
        {
          title: '客户',
          key: 'custId',
          dataIndex: 'custId',
          tag: <Selection source={() => selectCusts()} placeholder="请选择客户" />,
        },
        {
          title: '客户类别',
          key: 'custFactor1',
          dataIndex: 'custFactor1',
          tag: <Selection.UDC code="TSK.CUST_CAT1" placeholder="请选择客户类别" />,
        },
        {
          title: '客户小类',
          key: 'custFactor2',
          dataIndex: 'custFactor2',
          tag: <Selection.UDC code="TSK.CUST_CAT2" placeholder="请选择客户小类" />,
        },
        {
          title: '客户性质',
          key: 'custFactor3',
          dataIndex: 'custFactor3',
          tag: <Selection.UDC code="TSK.CONTRACT_CUSTPROP" placeholder="请选择客户性质" />,
        },
        {
          title: '产品大类',
          key: 'prodFactor1',
          dataIndex: 'prodFactor1',
          tag: <Selection.UDC code="TSK.SALE_TYPE1" placeholder="请选择产品大类" />,
        },
        {
          title: '供应主体类别',
          key: 'prodFactor3',
          dataIndex: 'prodFactor3',
          tag: <Selection.UDC code="COM.PROD_PROP" placeholder="请选择供应主体类别" />,
        },
        {
          title: '交易性质',
          key: 'cooperationType',
          dataIndex: 'cooperationType',
          tag: <Selection.UDC code="TSK.COOPERATION_TYPE" placeholder="请选择交易性质" />,
        },
      ]
        .filter(col => queryJson[col.key].visibleFlag === 1)
        .map(col => ({
          ...col,
          title: queryJson[col.key].displayName,
          sortNo: queryJson[col.key].sortNo,
          tag: {
            ...col.tag,
            props: {
              ...col.tag.props,
              placeholder: `请输入${queryJson[col.key].displayName}`,
            },
          },
        }))
        .sort((c1, c2) => c1.sortNo - c2.sortNo),
      columns: [
        {
          title: '分配规则码',
          key: 'ruleNo',
          dataIndex: 'ruleNo',
          align: 'center',
        },
        {
          title: '客户类别',
          key: 'custFactor1',
          dataIndex: 'custFactor1Name',
          align: 'center',
        },
        {
          title: '客户小类',
          key: 'custFactor2',
          dataIndex: 'custFactor2Name',
          align: 'center',
        },
        {
          title: '客户性质',
          key: 'custFactor3',
          dataIndex: 'custFactor3Name',
          align: 'center',
        },
        {
          title: '产品大类',
          key: 'prodFactor1',
          dataIndex: 'prodFactor1Name',
          align: 'center',
        },
        {
          title: '供应主体类别',
          key: 'prodFactor3',
          dataIndex: 'prodFactor3Name',
          align: 'center',
        },
        {
          title: '交易性质',
          key: 'cooperationType',
          dataIndex: 'cooperationTypeName',
          align: 'center',
        },
        {
          title: '交易方式',
          key: 'channelType',
          dataIndex: 'channelTypeName',
          align: 'center',
        },
        {
          title: '签单法人主体',
          key: 'ouId',
          dataIndex: 'ouName',
          align: 'center',
        },
        {
          title: '平台抽成比例',
          key: 'platSharePercent',
          dataIndex: 'platSharePercent',
          align: 'right',
        },
        {
          title: '平台抽成基于',
          key: 'platShareBase',
          dataIndex: 'platShareBaseName',
          align: 'center',
        },
        {
          title: '签单抽成比例',
          key: 'signSharePercent',
          dataIndex: 'signSharePercent',
          align: 'right',
        },
        {
          title: '签单抽成基于',
          key: 'signShareBase',
          dataIndex: 'signShareBaseName',
          align: 'center',
        },
        {
          title: '售前抽成比例',
          key: 'deliSharePercent',
          dataIndex: 'deliSharePercent',
          align: 'right',
        },
        {
          title: '售前抽成基于',
          key: 'deliShareBase',
          dataIndex: 'deliShareBaseName',
          align: 'center',
        },
        {
          title: '行业补贴比例',
          key: 'leadsSharePercent',
          dataIndex: 'leadsSharePercent',
          align: 'right',
        },
        {
          title: '行业补贴基于',
          key: 'leadsShareBase',
          dataIndex: 'leadsShareBaseName',
          align: 'center',
        },
      ]
        .filter(col => ruleJson[col.key].visibleFlag === 1)
        .map(col => ({
          ...col,
          title: ruleJson[col.key].displayName,
          sortNo: ruleJson[col.key].sortNo,
        }))
        .sort((c1, c2) => c1.sortNo - c2.sortNo),
      leftButtons: [],
    };

    const btns = [
      <Button
        className="tw-btn-primary"
        key="save"
        type="primary"
        icon="save"
        size="large"
        disabled={disabledBtn || ALREADY_USED || contractStatus !== 'CREATE'}
        // disabled={
        //   disabledBtn || !(roles.includes('PLAT_CONT_ADMIN') || roles.includes('SYS_ADMIN'))
        // }
        onClick={this.handleSaveSharing}
      >
        {formatMessage({ id: `misc.save`, desc: btnJson.save.buttonName })}
      </Button>,
      <Button
        className="tw-btn-primary"
        key="reset"
        type="primary"
        icon="reload"
        size="large"
        disabled={disabledBtn || ALREADY_USED || contractStatus !== 'CREATE'}
        onClick={this.handleReset}
      >
        {btnJson.reset.buttonName}
      </Button>,
      <Button
        className="tw-btn-primary"
        type="primary"
        key="submit"
        icon="save"
        size="large"
        disabled={disabledBtn || contractStatus !== 'ACTIVE'}
        onClick={() => {
          if (isNil(ruleList) || isEmpty(ruleList)) {
            createMessage({ type: 'error', description: '子合同分配收益规则不能为空' });
            return;
          }
          const { id } = fromQs();
          router.push(`/sale/contract/EditDetails?contractId=${id}&profitRuleId=${profitRuleId}`);
        }}
      >
        {btnJson.submit.buttonName}
      </Button>,
      <Button
        className="tw-btn-primary"
        type="primary"
        key="reload"
        icon="reload"
        size="large"
        disabled={disabledBtn || contractStatus !== 'ACTIVE'}
        onClick={this.handleResetCreate}
      >
        {btnJson.reload.buttonName}
      </Button>,
      <Button
        className="tw-btn-primary"
        key="other"
        type="primary"
        icon="save"
        size="large"
        disabled={
          disabledBtn ||
          (contractStatus !== 'CREATE' &&
            contractStatus !== 'ACTIVE' &&
            !(roles.includes('PLAT_CONT_ADMIN') || roles.includes('SYS_ADMIN')))
        }
        onClick={this.targetToggleVisible}
      >
        {btnJson.other.buttonName}
      </Button>,
    ]
      .filter(btn => btnJson[btn.key].visible)
      .map(btn => ({
        ...btn,
        sortNo: btnJson[btn.key].sortNo,
      }))
      .sort((b1, b2) => b1.sortNo - b2.sortNo);

    return (
      <Spin spinning={pageConfigLoading}>
        <PageHeaderWrapper>
          <Card className="tw-card-rightLine">
            {operationkeyEdit !== 'Sharing' ? (
              <Button
                key="save"
                className="tw-btn-primary"
                type="primary"
                icon="save"
                size="large"
                disabled={disabledBtn}
                hidden={!btnJson.save.visible}
                onClick={this.handleSave}
              >
                {formatMessage({ id: `misc.save`, desc: btnJson.save.buttonName })}
              </Button>
            ) : (
              <>
                {btns}
                {admin && (
                  <Popconfirm
                    title="即将删除利益分配结果，确认强行重置吗?"
                    onConfirm={this.handleForceReset}
                  >
                    <Button
                      key="forceReset"
                      className="tw-btn-primary"
                      type="primary"
                      icon="save"
                      size="large"
                    >
                      {btnJson.forceReset.buttonName}
                    </Button>
                  </Popconfirm>
                )}
              </>
            )}
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
            className="tw-card-multiTab"
            bordered={false}
            tabList={permissionTabList}
            onTabChange={this.onOperationTabChange}
            activeTabKey={operationkeyEdit}
          >
            {contentList[operationkeyEdit]}
          </Card>

          <Modal
            title="分配规则主数据"
            visible={visible}
            loading={loading.effects[`${DOMAIN}/ruleQuery`]}
            onOk={this.selectRule}
            onCancel={this.closeRule} // 关闭、取消会相互出发自己和对方的方法
            width="80%"
          >
            <DataTable {...ruleTableProps} scroll={{ x: 2500 }} />
          </Modal>
        </PageHeaderWrapper>
      </Spin>
    );
  }
}

export default EidtSubContract;
