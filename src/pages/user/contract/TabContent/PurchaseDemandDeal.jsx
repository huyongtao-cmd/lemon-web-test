import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Input, InputNumber, Form, TreeSelect } from 'antd';
import { Selection, DatePicker } from '@/pages/gen/field';
import router from 'umi/router';
import Link from 'umi/link';
import { fromQs } from '@/utils/stringUtils';
import EditableDataTable from '@/components/common/EditableDataTable';
import FieldList from '@/components/layout/FieldList';
import createMessage from '@/components/core/AlertMessage';
import { isEmpty, isNil, clone } from 'ramda';
import update from 'immutability-helper';
import {
  pageBasicBlockConfig,
  pageFormBlockConfig,
  pageColumnsBlockConfig,
} from '@/utils/pageConfigUtils';
import { add, div, mul, sub, genFakeId } from '@/utils/mathUtils';
import { falseDependencies } from 'mathjs';

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

const { Field } = FieldList;

const DOMAIN = 'purchaseDemandDeal';

@connect(({ loading, dispatch, purchaseDemandDeal, userContractEditSub, global }) => ({
  loading,
  dispatch,
  purchaseDemandDeal,
  userContractEditSub,
  global,
}))
@Form.create({
  onValuesChange(props, changedValues) {
    if (!isEmpty(changedValues)) {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: changedValues,
      });
    }
  },
})
class PurchaseDemandDeal extends PureComponent {
  componentDidMount() {
    // 初始得到主合同id给formData赋值
    const { dispatch } = this.props;
    const { id } = fromQs();
    id &&
      dispatch({
        type: `${DOMAIN}/query`,
        payload: { contractId: id },
      });

    // 关联产品
    dispatch({
      type: `${DOMAIN}/queryProdListFun`,
    });
    // 产品大类
    dispatch({
      type: `${DOMAIN}/tree`,
    });
    // 建议供应商
    dispatch({
      type: `${DOMAIN}/selectAbOus`,
    });
  }

  // 行编辑触发事件
  onCellChanged = (index, value, name) => {
    const {
      purchaseDemandDeal: { dataSource },
      dispatch,
    } = this.props;

    const newDataSource = dataSource;
    newDataSource[index] = {
      ...newDataSource[index],
      [name]: value,
    };
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { dataSource: newDataSource },
    });
    // 影响表单的需求总金额字段
    if (name === 'taxAmt') {
      dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: {
          demandTotalAmo: newDataSource.map(v => v.taxAmt).reduce((x, y) => add(x || 0, y || 0)),
        },
      });
    }
    dispatch({
      type: 'userContractEditSub/updateState',
      payload: { flag6: 1 },
    });
  };

  // 配置所需要的内容
  renderPage = () => {
    const {
      dispatch,
      purchaseDemandDeal: { formData },
      userContractEditSub: { pageConfig = {} },
      global: { userList },
      form: { getFieldDecorator, setFieldsValue },
    } = this.props;

    const disabledFlag = formData.contractStatus !== 'CREATE' && false;

    const pageFieldJson = pageBasicBlockConfig(pageConfig, 'blockPageName', '采购需求表单');

    const {
      contractNo = {},
      custId = {},
      leadsNo = {},
      demandData = {},
      edemandResId = {},
      demandNo = {},
      demandType = {},
      demandTotalAmo = {},
      demandStatus = {},
      demandRem = {},
    } = pageFieldJson;

    const fields = [
      <Field
        name="contractNo"
        label={contractNo.displayName}
        key="contractNo"
        decorator={{
          initialValue: formData.contractNo || '',
          rules: [{ required: contractNo.requiredFlag, message: '必填' }],
        }}
        sortNo={contractNo.sortNo}
      >
        <Input disabled placeholder="系统自动生成" />
      </Field>,
      <Field
        name="custId"
        label={custId.displayName}
        key="custId"
        decorator={{
          initialValue: formData.custName || '',
          rules: [{ required: custId.requiredFlag, message: '必填' }],
        }}
        sortNo={custId.sortNo}
      >
        <Input disabled placeholder="系统自动生成" />
      </Field>,
      <Field
        name="leadsNo"
        label={leadsNo.displayName}
        key="leadsNo"
        decorator={{
          initialValue: formData.leadsNo || '',
          rules: [{ required: leadsNo.requiredFlag, message: '必填' }],
        }}
        sortNo={leadsNo.sortNo}
      >
        <Input disabled placeholder="系统自动生成" />
      </Field>,
      <Field
        name="demandData"
        label={demandData.displayName}
        key="demandData"
        decorator={{
          initialValue: formData.demandData || undefined,
          rules: [{ required: demandData.requiredFlag, message: '必填' }],
        }}
        sortNo={demandData.sortNo}
      >
        <DatePicker className="x-fill-100" format="YYYY-MM-DD" disabled={disabledFlag} />
      </Field>,
      <Field
        name="edemandResId"
        label={edemandResId.displayName}
        key="edemandResId"
        decorator={{
          initialValue: formData.edemandResId || undefined,
          rules: [{ required: edemandResId.requiredFlag, message: '必填' }],
        }}
        sortNo={edemandResId.sortNo}
      >
        <Selection.Columns
          className="x-fill-100"
          source={userList}
          columns={particularColumns}
          transfer={{ key: 'id', code: 'id', name: 'name' }}
          dropdownMatchSelectWidth={false}
          showSearch
          onColumnsChange={value => {}}
          placeholder={`请选择${edemandResId.displayName}`}
          disabled={disabledFlag}
        />
      </Field>,
      <Field
        name="demandNo"
        label={demandNo.displayName}
        key="demandNo"
        decorator={{
          initialValue: formData.demandNo || '',
          rules: [{ required: demandNo.requiredFlag, message: '必填' }],
        }}
        sortNo={demandNo.sortNo}
      >
        <Input disabled placeholder="系统自动生成" />
      </Field>,
      <Field
        name="demandType"
        label={demandType.displayName}
        key="demandType"
        decorator={{
          initialValue: formData.demandType || '',
          rules: [{ required: demandType.requiredFlag, message: '必填' }],
        }}
        sortNo={demandType.sortNo}
      >
        <Selection.UDC
          filters={[{ sphd1: '1' }]}
          code="TSK.BUSINESS_TYPE"
          disabled
          placeholder="系统自动生成"
        />
      </Field>,
      <Field
        name="demandTotalAmo"
        label={demandTotalAmo.displayName}
        key="demandTotalAmo"
        decorator={{
          initialValue: formData.demandTotalAmo || 0,
          rules: [{ required: demandTotalAmo.requiredFlag, message: '必填' }],
        }}
        sortNo={demandTotalAmo.sortNo}
      >
        <InputNumber precision={2} className="x-fill-100" disabled placeholder="系统自动生成" />
      </Field>,
      <Field
        name="demandStatus"
        label={demandStatus.displayName}
        key="demandStatus"
        decorator={{
          initialValue: formData.demandStatus || '',
          rules: [{ required: demandStatus.requiredFlag, message: '必填' }],
        }}
        sortNo={demandStatus.sortNo}
      >
        <Selection.UDC code="TSK:DEMAND_STATUS" disabled placeholder="系统自动生成" />
      </Field>,
      <Field
        name="demandRem"
        key="demandRem"
        label={demandRem.displayName}
        fieldCol={1}
        labelCol={{ span: 3, xxl: 3 }}
        wrapperCol={{ span: 21, xxl: 21 }}
        decorator={{
          initialValue: formData.demandRem || '',
          rules: [{ required: demandRem.requiredFlag, message: '必填' }],
        }}
        sortNo={demandRem.sortNo}
      >
        <Input.TextArea
          disabled={disabledFlag}
          rows={3}
          placeholder={`请输入${demandRem.displayName}`}
        />
      </Field>,
    ];

    const fieldsConfig = pageFormBlockConfig(pageConfig, 'blockPageName', '采购需求表单', fields);

    return (
      <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={3} noReactive>
        {fieldsConfig}
      </FieldList>
    );
  };

  tablePropsConfig = () => {
    const {
      loading,
      dispatch,
      purchaseDemandDeal: {
        formData,
        dataSource,
        treeData,
        subTreeData,
        prodList,
        delProCurD,
        abOusArr,
      },
      userContractEditSub: { pageConfig = {} },
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
    } = this.props;

    const disabledFlag = formData.contractStatus !== 'CREATE' && false; // 董老师要求临时开放权限

    const pageFieldJson = pageBasicBlockConfig(pageConfig, 'blockPageName', '采购需求列表');

    const {
      sortNo = {},
      supplierId = {},
      demandSaid = {},
      buProdId = {},
      classId = {},
      subClassId = {},
      demandNum = {},
      taxPrice = {},
      symbol = {},
      taxRate = {},
      taxAmt = {},
      taxNotamt = {},
      contractNo = {},
    } = pageFieldJson;

    const tableProps = {
      sortBy: 'id',
      rowKey: 'id',
      sortDirection: 'DESC',
      scroll: { x: 2300 },
      loading: loading.effects[`${DOMAIN}/query`],
      dataSource,
      showColumn: false,
      onRow: () => {},
      enableDoubleClick: false,
      showCopy: false,
      showAdd: !disabledFlag,
      showDelete: !disabledFlag,
      onAdd: newRow => {
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            dataSource: update(dataSource, {
              $push: [
                {
                  ...newRow,
                  id: genFakeId(-1),
                  sortNo: dataSource.length + 1,
                  subTreeData: [],
                  symbol: 'CNY',
                },
              ],
            }),
          },
        });
        dispatch({
          type: 'userContractEditSub/updateState',
          payload: { flag6: 1 },
        });
      },
      onDeleteItems: (selectedRowKeys, selectedRows) => {
        const newDataSource = dataSource.filter(
          row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length
        );
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            dataSource: newDataSource.map((v, i) => ({ ...v, sortNo: i + 1 })),
            delProCurD: [...delProCurD, ...selectedRowKeys],
          },
        });
        // 明细为空时清除表单的需求总金额字段
        isEmpty(newDataSource) &&
          dispatch({
            type: `${DOMAIN}/updateForm`,
            payload: { demandTotalAmo: 0 },
          });
        dispatch({
          type: 'userContractEditSub/updateState',
          payload: { flag6: 1 },
        });
      },
      columns: pageColumnsBlockConfig(pageConfig, 'blockPageName', '采购需求列表', [
        {
          title: sortNo.displayName,
          key: 'sortNo',
          dataIndex: 'sortNo',
          align: 'center',
          width: 100,
        },
        {
          title: supplierId.displayName,
          key: 'supplierId',
          dataIndex: 'supplierId',
          align: 'center',
          width: 250,
          render: (value, row, index) => (
            <Selection
              value={value}
              className="x-fill-100"
              source={abOusArr}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={val => {}}
              placeholder={`请选择${supplierId.displayName}`}
              onChange={e => {
                this.onCellChanged(index, e, 'supplierId');
              }}
              // onValueChange={e => {
              //   this.onCellChanged(index, e.valCode, 'supplierCode');
              //   this.onCellChanged(index, e.valCode, 'supplierName');
              // }}
              disabled={!!row.contractNo || disabledFlag}
            />
          ),
        },
        {
          title: demandSaid.displayName,
          key: 'demandSaid',
          dataIndex: 'demandSaid',
          align: 'center',
          width: 250,
          render: (value, row, index) => (
            <Input.TextArea
              className="x-fill-100"
              value={value}
              autosize={{ minRows: 1, maxRows: 3 }}
              onChange={e => {
                this.onCellChanged(index, e.target.value, 'demandSaid');
              }}
              disabled={!!row.contractNo || disabledFlag}
            />
          ),
        },
        {
          title: buProdId.displayName,
          key: 'buProdId',
          dataIndex: 'buProdId',
          align: 'center',
          required: !!buProdId.requiredFlag,
          width: 200,
          options: {
            rules: [
              {
                required: !!buProdId.requiredFlag,
                message: `请输入${buProdId.displayName}`,
              },
            ],
          },
          render: (value, row, index) => (
            <Selection
              value={value}
              className="x-fill-100"
              source={prodList}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'prodName' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={val => {}}
              placeholder={`请选择${buProdId.displayName}`}
              onChange={e => {
                this.onCellChanged(index, e, 'buProdId');
              }}
              onValueChange={v => {
                if (v) {
                  const { classId: clsId, subClassId: subId } = v;
                  this.onCellChanged(index, clsId, 'classId');
                  this.onCellChanged(index, subId, 'subClassId');
                  classId &&
                    dispatch({
                      type: `${DOMAIN}/subTree`,
                      payload: {
                        pId: clsId,
                      },
                    }).then(res => {
                      this.onCellChanged(index, res, 'subTreeData');
                    });
                } else {
                  this.onCellChanged(index, null, 'classId');
                  this.onCellChanged(index, null, 'subClassId');
                  this.onCellChanged(index, [], 'subTreeData');
                }
              }}
              disabled={!!row.contractNo || disabledFlag}
            />
          ),
        },
        {
          title: classId.displayName,
          key: 'classId',
          dataIndex: 'classId',
          align: 'center',
          width: 200,
          render: (value, row, index) => (
            <TreeSelect
              disabled={!!row.buProdId}
              className="x-fill-100"
              dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              value={value}
              treeData={treeData}
              placeholder={`请选择${classId.displayName}`}
              onChange={e => {
                this.onCellChanged(index, e, 'classId');
                if (e) {
                  dispatch({
                    type: `${DOMAIN}/subTree`,
                    payload: {
                      pId: e,
                    },
                  }).then(res => {
                    this.onCellChanged(index, res, 'subTreeData');
                  });
                } else {
                  this.onCellChanged(index, [], 'subTreeData');
                }
              }}
            />
          ),
        },
        {
          title: subClassId.displayName,
          key: 'subClassId',
          dataIndex: 'subClassId',
          align: 'center',
          width: 200,
          render: (value, row, index) => (
            <Selection
              disabled={!!row.buProdId}
              value={value}
              className="x-fill-100"
              source={row.subTreeData || []}
              transfer={{ key: 'id', code: 'id', name: 'className' }}
              dropdownMatchSelectWidth={false}
              showSearch
              placeholder={`请选择${subClassId.displayName}`}
              onChange={e => {
                this.onCellChanged(index, e, 'subClassId');
              }}
            />
          ),
        },
        {
          title: demandNum.displayName,
          key: 'demandNum',
          dataIndex: 'demandNum',
          align: 'center',
          required: !!demandNum.requiredFlag,
          options: {
            rules: [
              {
                required: !!demandNum.requiredFlag,
                message: `请输入${demandNum.displayName}`,
              },
            ],
          },
          width: 150,
          render: (value, row, index) => (
            <InputNumber
              precision={2}
              className="x-fill-100"
              value={value}
              min={0}
              onChange={e => {
                this.onCellChanged(index, e, 'demandNum');
                // 更新含税总额
                this.onCellChanged(index, mul(+e, +row.taxPrice), 'taxAmt');
                // 更新不含税总额
                this.onCellChanged(
                  index,
                  div(mul(+row.taxAmt, 100), add(+row.taxRate || 0, 100)),
                  'taxNotamt'
                );
              }}
              placeholder={`${demandNum.displayName}`}
              disabled={!!row.contractNo || disabledFlag}
            />
          ),
        },
        {
          title: taxPrice.displayName,
          key: 'taxPrice',
          dataIndex: 'taxPrice',
          align: 'right',
          width: 200,
          render: (value, row, index) => (
            <InputNumber
              precision={2}
              className="x-fill-100"
              value={value}
              onChange={e => {
                this.onCellChanged(index, e, 'taxPrice');
                // 更新含税总额
                this.onCellChanged(index, mul(+row.demandNum, +e), 'taxAmt');
                // 更新不含税总额
                this.onCellChanged(
                  index,
                  div(mul(mul(+row.demandNum, +e), 100), add(+row.taxRate || 0, 100)),
                  'taxNotamt'
                );
              }}
              placeholder={`${taxPrice.displayName}`}
              disabled={!!row.contractNo || disabledFlag}
            />
          ),
        },
        {
          title: symbol.displayName,
          key: 'symbol',
          dataIndex: 'symbol',
          align: 'center',
          required: !!symbol.requiredFlag,
          options: {
            rules: [
              {
                required: !!symbol.requiredFlag,
                message: `请输入${symbol.displayName}`,
              },
            ],
          },
          width: 150,
          render: (value, row, index) => (
            <Selection.UDC
              value={value}
              code="COM:CURRENCY_KIND"
              placeholder={`${symbol.displayName}`}
              onChange={e => {
                this.onCellChanged(index, e, 'symbol');
              }}
              disabled={!!row.contractNo || disabledFlag}
            />
          ),
        },
        {
          title: taxRate.displayName,
          key: 'taxRate',
          dataIndex: 'taxRate',
          align: 'center',
          width: 150,
          render: (value, row, index) => (
            <Selection.UDC
              value={value}
              code="COM.TAX_RATE"
              placeholder={`${taxRate.displayName}`}
              onChange={e => {
                this.onCellChanged(index, e || 0, 'taxRate');
                // 更新不含税总额
                this.onCellChanged(
                  index,
                  div(mul(+row.taxAmt, 100), add(+e || 0, 100)),
                  'taxNotamt'
                );
              }}
              disabled={!!row.contractNo || disabledFlag}
            />
          ),
        },
        {
          title: taxAmt.displayName,
          key: 'taxAmt',
          dataIndex: 'taxAmt',
          align: 'right',
          width: 200,
          render: val => !isNil(val) && val.toFixed(2),
        },
        {
          title: taxNotamt.displayName,
          key: 'taxNotamt',
          dataIndex: 'taxNotamt',
          align: 'right',
          width: 200,
          render: val => !isNil(val) && val.toFixed(2),
        },
        {
          title: contractNo.displayName,
          key: 'contractNo',
          dataIndex: 'contractNo',
          align: 'center',
          width: 180,
          render: (val, row) => {
            const href = `/sale/purchaseContract/Detail?id=${
              row.contractId
            }&pageMode=purchase&from=CONTRACT`;
            return (
              <Link className="tw-link" to={href}>
                {val}
              </Link>
            );
          },
        },
      ]),
      leftButtons: [
        {
          key: 'edit',
          className: 'tw-btn-primary',
          title: '生成采购合同',
          loading: false,
          hidden: false,
          disabled: selectedRows =>
            !selectedRows.length || selectedRows.filter(v => v.contractNo).length || disabledFlag,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            if (isNil(formData.projectId)) {
              createMessage({
                type: 'warn',
                description: '合同尚未关联项目，不能生成采购合同！',
              });
              return;
            }

            if (formData.contractStatus !== 'ACTIVE') {
              createMessage({
                type: 'warn',
                description: '合同尚未激活，不能生成采购合同！',
              });
              return;
            }

            if (isEmpty(selectedRowKeys)) {
              createMessage({ type: 'warn', description: '请选择需要生成采购合同的明细！' });
              return;
            }

            const tt = selectedRows.filter(v => v.contractNo);
            if (!isEmpty(tt)) {
              createMessage({
                type: 'warn',
                description:
                  '选择的采购需求明细中含有已经生成的采购合同明细，不能再生成采购合同的明细！',
              });
              return;
            }

            // 选择相同的建议供应商才能生成采购合同
            const tt1 = [...new Set(selectedRows.map(v => Number(v.supplierId)))];
            if (tt1.length > 1) {
              createMessage({
                type: 'warn',
                description: '只能选择相同建议供应商的需求明细提交',
              });
              return;
            }

            dispatch({
              type: `${DOMAIN}/save`,
            }).then(res => {
              if (res.ok) {
                const selectedSortNo = selectedRows.map(v => v.sortNo).join(',');
                router.push(
                  `/sale/purchaseContract/Edit?mode=edit&purchaseType=CONTRACT&businessType=${
                    formData.demandType
                  }&contractId=${
                    fromQs().id
                  }&selectedSortNo=${selectedSortNo}&from=contract&fromTab=PurchaseDemandDeal`
                );
              }
            });
          },
        },
      ],
    };

    return tableProps;
  };

  render() {
    const {
      loading,
      dispatch,
      purchaseDemandDeal: { formData, dataSource },
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
    } = this.props;

    return (
      <>
        <FieldList legend="基本信息" getFieldDecorator={getFieldDecorator} col={3}>
          {this.renderPage()}
        </FieldList>
        <FieldList legend="需求明细" getFieldDecorator={getFieldDecorator} col={1} />
        <EditableDataTable {...this.tablePropsConfig()} />
      </>
    );
  }
}

export default PurchaseDemandDeal;
