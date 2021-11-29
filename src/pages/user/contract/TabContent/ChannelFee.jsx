import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Input, InputNumber, Form, Modal, Popconfirm } from 'antd';
import { Selection, DatePicker } from '@/pages/gen/field';
import router from 'umi/router';
import { fromQs } from '@/utils/stringUtils';
import Link from 'umi/link';
import EditableDataTable from '@/components/common/EditableDataTable';
import DataTable from '@/components/common/DataTable';
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

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

const { Field } = FieldList;

const DOMAIN = 'ChannelFee';

@connect(({ loading, dispatch, ChannelFee, userContractEditSub, global }) => ({
  loading,
  dispatch,
  ChannelFee,
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

      props.dispatch({
        type: `userContractEditSub/updateState`,
        payload: {
          flag7: 1,
        },
      });
    }
  },
})
class ChannelFee extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      splitAmt: null,
      splitAmtSelectedRows: [],
    };
  }

  componentDidMount() {
    // 初始得到主合同id给formData赋值
    const { dispatch } = this.props;
    const { id } = fromQs();
    id &&
      dispatch({
        type: `${DOMAIN}/query`,
        payload: { contractId: id },
      });
  }

  // 行编辑触发事件
  onCellChanged = (index, value, name) => {
    const {
      ChannelFee: { dataSource },
      dispatch,
    } = this.props;

    const newDataSource = dataSource;
    newDataSource[index] = {
      ...newDataSource[index],
      [name]: value,
    };

    if (Array.isArray(newDataSource[index].children) && !isEmpty(newDataSource[index].children)) {
      newDataSource[index] = {
        ...newDataSource[index],
        children: newDataSource[index].children.map(v => ({ ...v, [name]: value })),
      };
    }

    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { dataSource: newDataSource },
    });

    // // 影响表单的需求总金额字段
    // if (name === 'taxAmt') {
    //   dispatch({
    //     type: `${DOMAIN}/updateForm`,
    //     payload: {
    //       demandTotalAmo: newDataSource.map(v => v.taxAmt).reduce((x, y) => add(x || 0, y || 0)),
    //     },
    //   });
    // }
    dispatch({
      type: 'userContractEditSub/updateState',
      payload: { flag7: 1 },
    });
  };

  // 配置所需要的内容
  renderPage = () => {
    const {
      dispatch,
      ChannelFee: { formData },
      userContractEditSub: { pageConfig = {} },
      global: { userList },
      form: { getFieldDecorator, setFieldsValue },
    } = this.props;
    const disabledFlag = formData.contractStatus !== 'CREATE' && false;

    const fields = [
      <Field
        name="channelCostNo"
        key="channelCostNo"
        label="渠道费用处理单号"
        decorator={{
          initialValue: formData.channelCostNo || '',
          rules: [{ required: false, message: '必填' }],
        }}
      >
        <Input disabled placeholder="系统自动生成" />
      </Field>,
      <Field
        name="contractId"
        key="contractId"
        label="关联销售合同"
        decorator={{
          initialValue: formData.contractNo || '',
          rules: [{ required: false, message: '必填' }],
        }}
      >
        <Input disabled placeholder="系统自动生成" />
      </Field>,
      <Field
        name="oppoId"
        key="oppoId"
        label="关联商机"
        decorator={{
          initialValue: formData.oppoId || '',
          rules: [{ required: false, message: '必填' }],
        }}
      >
        <Input disabled placeholder="系统自动生成" />
      </Field>,
      <Field
        name="applyResId"
        key="applyResId"
        label="申请人"
        decorator={{
          initialValue: formData.applyResId || undefined,
          rules: [{ required: false, message: '必填' }],
        }}
      >
        <Selection.Columns
          className="x-fill-100"
          source={userList}
          columns={particularColumns}
          transfer={{ key: 'id', code: 'id', name: 'name' }}
          dropdownMatchSelectWidth={false}
          showSearch
          onColumnsChange={value => {}}
          placeholder="请选择申请人"
          disabled={disabledFlag}
        />
      </Field>,
      <Field
        name="applyDate"
        key="applyDate"
        label="申请日期"
        decorator={{
          initialValue: formData.applyDate || undefined,
          rules: [{ required: false, message: '必填' }],
        }}
      >
        <DatePicker className="x-fill-100" format="YYYY-MM-DD" disabled={disabledFlag} />
      </Field>,
      <Field
        name="applyBuId"
        key="applyBuId"
        label="申请BU"
        decorator={{
          initialValue: formData.applyBuId || undefined,
          rules: [{ required: false, message: '必填' }],
        }}
      >
        <Selection.ColumnsForBu disabled={disabledFlag} />
      </Field>,
      <Field
        name="channelCostRem"
        key="channelCostRem"
        label="渠道费用备注说明"
        fieldCol={1}
        labelCol={{ span: 3, xxl: 3 }}
        wrapperCol={{ span: 21, xxl: 21 }}
        decorator={{
          initialValue: formData.channelCostRem || '',
          rules: [{ required: false, message: '必填' }],
        }}
      >
        <Input.TextArea rows={3} disabled={disabledFlag} placeholder="请输入渠道费用备注说明" />
      </Field>,
    ];

    const fieldsConfig = pageFormBlockConfig(
      pageConfig,
      'blockKey',
      'SALE_CONTRACT_EDIT_SUB_CHANNELFEE_FORM',
      fields
    );

    return (
      <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={3} noReactive>
        {fieldsConfig}
      </FieldList>
    );
  };

  splitAmt = () => {
    const {
      ChannelFee: { dataSource },
      dispatch,
    } = this.props;
    const { splitAmtSelectedRows = [], splitAmt } = this.state;

    const arrIndex = dataSource.findIndex(v => v.id === splitAmtSelectedRows[0].id);

    const allAmt =
      dataSource[arrIndex]?.children?.map(v => v.amt).reduce((x, y) => add(x, y), 0) || 0;

    // 子明细总金额不能超过主明细金额
    if (add(+allAmt, +splitAmt) > +dataSource[arrIndex].amt) {
      createMessage({
        type: 'warn',
        description: '子明细总金额不能超过主明细金额！',
      });
      return;
    }

    dataSource[arrIndex].children = [
      ...(dataSource[arrIndex].children || []),
      {
        ...splitAmtSelectedRows[0],
        minChannelCostConId: splitAmtSelectedRows[0].id,
        sortNo: `${splitAmtSelectedRows[0].sortNo}.${(dataSource[arrIndex]?.children || []).length +
          1}`,
        id: genFakeId(-1),
        amt: splitAmt,
        taxCost: mul(div(splitAmtSelectedRows[0].taxRate || 0, 100), splitAmt), // 计算税率
        netPay: mul(div(splitAmt, 100), add(+splitAmtSelectedRows[0].taxRate || 0, 100)), // 计算净支付额
      },
    ];

    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { dataSource },
    });

    dispatch({
      type: 'userContractEditSub/updateState',
      payload: { flag7: 1 },
    });

    this.toggleVisible();

    // 关闭弹窗，清除数据
    this.setState({
      splitAmt: null,
      splitAmtSelectedRows: [],
    });
  };

  tablePropsConfig = () => {
    const {
      loading,
      dispatch,
      ChannelFee: { formData, dataSource, delChannelCostConD, collectionPlanView },
      userContractEditSub: { pageConfig = {}, flag7 },
    } = this.props;

    const disabledFlag = formData.contractStatus !== 'CREATE' && false; // 董老师要求临时开放权限

    const tableProps = {
      sortBy: 'id',
      rowKey: 'id',
      sortDirection: 'DESC',
      scroll: { x: 3750 },
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
                  proportion: 0,
                },
              ],
            }),
          },
        });
        dispatch({
          type: 'userContractEditSub/updateState',
          payload: { flag7: 1 },
        });
      },
      onDeleteItems: (selectedRowKeys, selectedRows) => {
        // 无父级id，删除的是主明细
        if (!selectedRows[0].minChannelCostConId) {
          const newDataSource = dataSource.filter(
            row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length
          );
          dispatch({
            type: `${DOMAIN}/updateState`,
            payload: {
              dataSource: newDataSource.map((v, i) => ({
                ...v,
                sortNo: i + 1,
                children: v.children
                  ? v.children.map((item, index) => ({ ...item, sortNo: `${i + 1}.${index + 1}` }))
                  : null,
              })),
            },
          });
        } else {
          // 删除的是子明细
          const supIndex = dataSource.findIndex(v => v.id === selectedRows[0].minChannelCostConId); // 主明细索引
          dataSource[supIndex].children = dataSource[supIndex].children.filter(
            row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length
          );
          dispatch({
            type: `${DOMAIN}/updateState`,
            payload: {
              dataSource: dataSource.map((v, i) => ({
                ...v,
                sortNo: i + 1,
                children: v.children
                  ? v.children.map((item, index) => ({ ...item, sortNo: `${i + 1}.${index + 1}` }))
                  : null,
              })),
            },
          });
        }

        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            delChannelCostConD: [...delChannelCostConD, ...selectedRowKeys],
          },
        });

        // 标记该页面为修改状态
        dispatch({
          type: 'userContractEditSub/updateState',
          payload: { flag7: 1 },
        });
      },
      columns: pageColumnsBlockConfig(
        pageConfig,
        'blockKey',
        'SALE_CONTRACT_EDIT_SUB_CHANNELFEE_TABLE',
        [
          {
            title: '序号',
            key: 'sortNo',
            dataIndex: 'sortNo',
            align: 'center',
            width: 100,
            fixed: true,
          },
          {
            title: '工作类型',
            key: 'workType',
            dataIndex: 'workType',
            align: 'center',
            width: 200,
            render: (value, row, index) =>
              row.minChannelCostConId ? (
                ''
              ) : (
                <Selection.UDC
                  value={value}
                  code="CON:WORK_TYPE"
                  placeholder="请选择工作类型"
                  onChange={e => {
                    this.onCellChanged(index, e, 'workType');
                  }}
                  disabled={!!row.contractNo || disabledFlag}
                />
              ),
          },
          {
            title: '具体理由',
            key: 'reason',
            dataIndex: 'reason',
            align: 'center',
            width: 250,
            render: (value, row, index) =>
              row.minChannelCostConId ? (
                ''
              ) : (
                <Input.TextArea
                  className="x-fill-100"
                  value={value}
                  autosize={{ minRows: 1, maxRows: 3 }}
                  onChange={e => {
                    this.onCellChanged(index, e.target.value, 'reason');
                  }}
                  disabled={!!row.contractNo || disabledFlag}
                  placeholder="请输入具体理由"
                />
              ),
          },
          {
            title: '伙伴类型',
            key: 'coopType',
            dataIndex: 'coopType',
            align: 'center',
            width: 200,
            render: (value, row, index) =>
              row.minChannelCostConId ? (
                ''
              ) : (
                <Selection.UDC
                  value={value}
                  code="CON:PARTNER_TYPE"
                  placeholder="请选择伙伴类型"
                  onChange={e => {
                    this.onCellChanged(index, e, 'coopType');
                  }}
                  disabled={!!row.contractNo || !!row.minChannelCostConId || disabledFlag}
                />
              ),
          },
          {
            title: '合作方',
            key: 'channelCostRem',
            dataIndex: 'channelCostRem',
            align: 'center',
            width: 250,
            render: (value, row, index) =>
              row.minChannelCostConId ? (
                ''
              ) : (
                <Input
                  value={value}
                  onChange={e => {
                    this.onCellChanged(index, e.target.value, 'channelCostRem');
                  }}
                  placeholder="请输入合作方"
                  disabled={disabledFlag}
                />
              ),
          },
          {
            title: '基于',
            key: 'base',
            dataIndex: 'base',
            align: 'center',
            width: 150,
            render: (value, row, index) =>
              row.minChannelCostConId ? (
                ''
              ) : (
                <Selection.UDC
                  value={value}
                  code="CON:BASE"
                  placeholder="请选择基于"
                  onChange={e => {
                    this.onCellChanged(index, e, 'base');
                  }}
                  disabled={!!row.contractNo || disabledFlag}
                />
              ),
          },
          {
            title: '比例',
            key: 'proportion',
            dataIndex: 'proportion',
            align: 'center',
            width: 150,
            render: (value, row, index) =>
              row.minChannelCostConId ? (
                ''
              ) : (
                <InputNumber
                  precision={2}
                  className="x-fill-100"
                  value={value}
                  min={0}
                  max={100}
                  onChange={e => {
                    this.onCellChanged(index, e || 0, 'proportion');
                    // // 更新含税总额
                    // this.onCellChanged(index, mul(+row.demandNum, +e), 'taxAmt');
                    // // 更新不含税总额
                    // this.onCellChanged(
                    //   index,
                    //   div(mul(mul(+row.demandNum, +e), 100), add(+row.taxRate || 0, 100)),
                    //   'taxNotamt'
                    // );
                  }}
                  placeholder="请输入比例"
                  formatter={val => (val ? `${val}%` : '')}
                  parser={val => val.replace('%', '')}
                  disabled={!!row.contractNo || disabledFlag}
                />
              ),
          },
          {
            title: '金额(不含税)',
            key: 'amt',
            dataIndex: 'amt',
            align: 'right',
            width: 200,
            render: (value, row, index) => (
              <InputNumber
                precision={2}
                className="x-fill-100"
                value={value}
                onChange={e => {
                  this.onCellChanged(index, e, 'amt');
                  // 更新税费
                  this.onCellChanged(index, mul(div(+row.taxRate || 0, 100), +e), 'taxCost');
                  // 更新净支付额
                  this.onCellChanged(
                    index,
                    mul(div(e, 100), add(+row.taxRate || 0, 100)),
                    'netPay'
                  );
                }}
                placeholder="请输入金额"
                disabled={
                  !!row.contractNo ||
                  row?.children?.length > 0 ||
                  !!row.minChannelCostConId ||
                  disabledFlag
                }
              />
            ),
          },
          {
            title: '税费率',
            key: 'taxRate',
            dataIndex: 'taxRate',
            align: 'center',
            width: 150,
            render: (value, row, index) => (
              <Selection.UDC
                value={value}
                code="COM.TAX_RATE"
                placeholder="请选择税费率"
                onChange={e => {
                  this.onCellChanged(index, e || 0, 'taxRate');
                  // 更新税费
                  this.onCellChanged(index, mul(div(e || 0, 100), +row.amt), 'taxCost');
                  // 更新净支付额
                  this.onCellChanged(index, mul(div(row.amt, 100), add(+e || 0, 100)), 'netPay');
                }}
                disabled={
                  !!row.contractNo ||
                  row?.children?.length > 0 ||
                  !!row.minChannelCostConId ||
                  row.reimExp === 'OUTSIDE' ||
                  disabledFlag
                }
              />
            ),
          },
          {
            title: '税费',
            key: 'taxCost',
            dataIndex: 'taxCost',
            align: 'right',
            width: 200,
            render: val => !isNil(val) && val.toFixed(2),
          },
          {
            title: '税费承担方',
            key: 'reimExp',
            dataIndex: 'reimExp',
            align: 'center',
            width: 200,
            render: (value, row, index) =>
              row.minChannelCostConId ? (
                ''
              ) : (
                <Selection.UDC
                  value={value}
                  code="CON:TAXRATE"
                  placeholder="请选择税费承担方"
                  onChange={e => {
                    this.onCellChanged(index, e, 'reimExp');
                    if (e === 'OUTSIDE') {
                      // 更新税率
                      this.onCellChanged(index, 0, 'taxRate');
                      // 税费
                      this.onCellChanged(index, 0, 'taxCost');
                      // 更新净支付额
                      this.onCellChanged(index, mul(div(row.amt, 100), add(0, 100)), 'netPay');
                    }
                  }}
                  disabled={!!row.contractNo || !!row.minChannelCostConId || disabledFlag}
                />
              ),
          },
          {
            title: '净支付额',
            key: 'netPay',
            dataIndex: 'netPay',
            align: 'right',
            width: 200,
            render: val => !isNil(val) && val.toFixed(2),
          },
          {
            title: '具体支付方式',
            key: 'salaryMethod',
            dataIndex: 'salaryMethod',
            align: 'center',
            width: 200,
            render: (value, row, index) =>
              row.minChannelCostConId ? (
                ''
              ) : (
                <Selection.UDC
                  value={value}
                  code="CON:PAYMENT_MODE"
                  placeholder="请选择具体支付方式"
                  onChange={e => {
                    this.onCellChanged(index, e || 0, 'salaryMethod');
                  }}
                  disabled={!!row.contractNo || disabledFlag}
                />
              ),
          },
          {
            title: '收款节点',
            key: 'receivingNode',
            dataIndex: 'receivingNode',
            align: 'center',
            width: 200,
            render: (value, row, index) =>
              row.minChannelCostConId ? (
                ''
              ) : (
                <Selection
                  value={value}
                  className="x-fill-100"
                  source={collectionPlanView}
                  transfer={{ key: 'id', code: 'id', name: 'phaseDesc' }}
                  dropdownMatchSelectWidth={false}
                  showSearch
                  placeholder="请选择收款节点"
                  onChange={e => {
                    this.onCellChanged(index, e, 'receivingNode');
                  }}
                />
              ),
          },
          {
            title: '线下合同&沟通签署状态',
            key: 'contractStatus',
            dataIndex: 'contractStatus',
            align: 'center',
            width: 250,
            render: (value, row, index) =>
              row.minChannelCostConId ? (
                ''
              ) : (
                <Input
                  className="x-fill-100"
                  value={value}
                  onChange={e => {
                    this.onCellChanged(index, e.target.value, 'contractStatus');
                  }}
                  placeholder="请选择线下合同&沟通签署状态"
                  disabled={!!row.contractNo || disabledFlag}
                />
              ),
          },
          {
            title: '联系人姓名',
            key: 'contactName',
            dataIndex: 'contactName',
            align: 'center',
            width: 200,
            render: (value, row, index) =>
              row.minChannelCostConId ? (
                ''
              ) : (
                <Input
                  className="x-fill-100"
                  value={value}
                  onChange={e => {
                    this.onCellChanged(index, e.target.value, 'contactName');
                  }}
                  placeholder="联系人姓名"
                  disabled={!!row.contractNo || disabledFlag}
                />
              ),
          },
          {
            title: '联系人电话',
            key: 'contactPhone',
            dataIndex: 'contactPhone',
            align: 'center',
            width: 200,
            render: (value, row, index) =>
              row.minChannelCostConId ? (
                ''
              ) : (
                <Input
                  className="x-fill-100"
                  value={value}
                  onChange={e => {
                    this.onCellChanged(index, e.target.value, 'contactPhone');
                  }}
                  placeholder="联系人电话"
                  disabled={!!row.contractNo || disabledFlag}
                />
              ),
          },
          {
            title: '关联单据类型',
            key: 'docType',
            dataIndex: 'docType',
            align: 'center',
            width: 150,
          },
          {
            title: '关联单据号',
            key: 'documentNumber',
            dataIndex: 'documentNumber',
            align: 'center',
            width: 180,
            render: (val, row) => {
              const href = `/sale/purchaseContract/Detail?id=${
                row.documentId
              }&pageMode=purchase&from=CONTRACT`;
              return (
                <Link className="tw-link" to={href}>
                  {val}
                </Link>
              );
            },
          },
          {
            title: '明细状态',
            key: 'channelCostConDStatus',
            dataIndex: 'channelCostConDStatusName',
            align: 'center',
            width: 150,
          },
        ]
      ),
      leftButtons: [
        {
          key: 'edit',
          className: 'tw-btn-primary',
          title: '生成采购合同',
          loading: false,
          hidden: false,
          disabled: selectedRows =>
            !selectedRows.filter(v => v.minChannelCostConId).length ||
            selectedRows.filter(v => v.contractNo).length ||
            disabledFlag,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            if (flag7) {
              createMessage({
                type: 'warn',
                description: '页面存在未保存信息，请先保存！',
              });
              return;
            }

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
                description: '子合同尚未激活，不能生成采购合同！',
              });
              return;
            }

            if (isEmpty(selectedRowKeys)) {
              createMessage({
                type: 'warn',
                description: '请选择需要生成采购合同的渠道费用子明细！',
              });
              return;
            }

            const tt = selectedRows.filter(v => v.docType || v.documentNumber);
            if (!isEmpty(tt)) {
              createMessage({
                type: 'warn',
                description:
                  '选择的渠道费用子明细包含有已经生成采购合同的明细，不能再生成采购合同！',
              });
              return;
            }

            const selectedSortNo = selectedRows.map(v => v.sortNo).join(',');
            router.push(
              `/sale/purchaseContract/Edit?mode=edit&purchaseType=CONTRACT&businessType=CHANNEL_COST&contractId=${
                fromQs().id
              }&selectedSortNo=${selectedSortNo}&from=contract&fromTab=ChannelFee`
            );

            // dispatch({
            //   type: `${DOMAIN}/save`,
            // }).then(res => {
            //   if (res.ok) {
            //     const selectedSortNo = selectedRows.map(v => v.sortNo).join(',');
            //     router.push(
            //       `/sale/purchaseContract/Edit?mode=edit&purchaseType=CONTRACT&businessType=CHANNEL_COST&contractId=${
            //         fromQs().id
            //       }&selectedSortNo=${selectedSortNo}&from=contract&fromTab=ChannelFee`
            //     );
            //   }
            // });
          },
        },
        {
          key: 'split',
          icon: 'scissor',
          className: 'tw-btn-primary',
          title: '按金额拆分',
          loading: false,
          hidden: false,
          disabled: selectedRows =>
            selectedRows.length !== 1 ||
            selectedRows.filter(v => v.minChannelCostConId).length > 0 ||
            selectedRows.filter(v => v.contractNo).length ||
            disabledFlag,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            if (selectedRows[0].minChannelCostConId) {
              createMessage({
                type: 'warn',
                description: '只能对主明细进行拆分操作！',
              });
              return;
            }

            if (isNil(selectedRows[0].amt)) {
              createMessage({
                type: 'warn',
                description: '请先填写所选主明细金额，拆分明细后将不可更改！',
              });
              return;
            }

            if (isNil(selectedRows[0].taxRate)) {
              createMessage({
                type: 'warn',
                description: '请先填写所选主明细税费率，拆分明细后将不可更改！',
              });
              return;
            }

            this.setState({
              splitAmtSelectedRows: selectedRows,
            });

            this.toggleVisible();
          },
        },
      ],
    };

    return tableProps;
  };

  toggleVisible = () => {
    const { visible } = this.state;
    this.setState({ visible: !visible });
  };

  render() {
    const {
      loading,
      dispatch,
      ChannelFee: { oppoChannelCosttViews, dataSource },
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
    } = this.props;
    const { splitAmt, visible } = this.state;

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      dispatch,
      loading: loading.effects[`${DOMAIN}/query`],
      pagination: false,
      showExport: false,
      showColumn: false,
      dataSource: oppoChannelCosttViews,
      showSearch: false,
      enableSelection: false,
      onChange: filters => {
        this.fetchData(filters);
      },
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      searchBarForm: [],
      leftButtons: [],
      columns: [
        {
          title: '序号',
          dataIndex: 'sortNo',
          align: 'center',
        },
        {
          title: '审批状态',
          dataIndex: 'approvalStatusName',
          align: 'center',
        },
        {
          title: '费用描述',
          dataIndex: 'costDesc',
          align: 'center',
        },
        {
          title: '申请人',
          dataIndex: 'applyResName',
          align: 'center',
        },
        {
          title: '申请日期',
          dataIndex: 'applyDate',
          align: 'center',
        },
      ],
    };

    return (
      <>
        <FieldList legend="基本信息" getFieldDecorator={getFieldDecorator} col={3}>
          {this.renderPage()}
        </FieldList>
        <FieldList legend="商机费用明细" getFieldDecorator={getFieldDecorator} col={1}>
          <DataTable {...tableProps} />
        </FieldList>

        <FieldList legend="确认费用明细" getFieldDecorator={getFieldDecorator} col={1} />
        <EditableDataTable {...this.tablePropsConfig()} />
        <Modal
          destroyOnClose
          title="主明细拆分"
          visible={visible}
          onOk={() => {
            this.splitAmt();
          }}
          onCancel={() => this.toggleVisible()}
          width="50%"
        >
          <FieldList getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="artSubTitle"
              label="拆分金额"
              decorator={{
                initialValue: splitAmt || null,
              }}
              presentational
            >
              <InputNumber
                className="x-fill-100"
                precision={2}
                min={0}
                placeholder="请输入拆分金额"
                onChange={e => {
                  this.setState({
                    splitAmt: e,
                  });
                }}
              />
            </Field>
          </FieldList>
        </Modal>
      </>
    );
  }
}

export default ChannelFee;
