import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Input, InputNumber, Form, Modal, Popconfirm } from 'antd';
import { Selection, DatePicker } from '@/pages/gen/field';
import router from 'umi/router';
import Link from 'umi/link';
import { fromQs } from '@/utils/stringUtils';
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
import DescriptionList from '@/components/layout/DescriptionList';

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

const { Description } = DescriptionList;

const { Field } = FieldList;

const DOMAIN = 'ChannelFee';

@connect(({ loading, dispatch, ChannelFee, userContractEditSub, global }) => ({
  loading,
  dispatch,
  ChannelFee,
  userContractEditSub,
  global,
}))
@Form.create({})
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

  // 配置所需要的内容
  renderPage = () => {
    const {
      ChannelFee: { formData },
      userContractEditSub: { pageConfig = {} },
    } = this.props;

    const pageFieldJson = pageBasicBlockConfig(
      pageConfig,
      'blockPageName',
      '渠道费用确认单表单-详情'
    );

    const {
      channelCostNo = {},
      contractId = {},
      oppoId = {},
      applyResId = {},
      applyDate = {},
      applyBuId = {},
      channelCostRem = {},
    } = pageFieldJson;

    const fields = [
      <Description
        key="channelCostNo"
        term={channelCostNo.displayName}
        sortNo={channelCostNo.sortNo}
      >
        {formData.channelCostNo || ''}
      </Description>,
      <Description key="contractId" term={contractId.displayName} sortNo={contractId.sortNo}>
        {formData.contractName || ''}
      </Description>,
      <Description key="oppoId" term={oppoId.displayName} sortNo={oppoId.sortNo}>
        {formData.oppoName || ''}
      </Description>,
      <Description key="applyResId" term={applyResId.displayName} sortNo={applyResId.sortNo}>
        {formData.applyResName || ''}
      </Description>,
      <Description key="applyDate" term={applyDate.displayName} sortNo={applyDate.sortNo}>
        {formData.applyDate || ''}
      </Description>,
      <Description key="applyBuId" term={applyBuId.displayName} sortNo={applyBuId.sortNo}>
        {formData.applyBuName || ''}
      </Description>,
      <Description
        key="channelCostRem"
        term={channelCostRem.displayName}
        sortNo={channelCostRem.sortNo}
      >
        {formData.channelCostRem || ''}
      </Description>,
    ];

    const filterList = fields
      .filter(field => !field.key || pageFieldJson[field.key]?.visibleFlag === 1)
      .sort((field1, field2) => field1.props.sortNo - field2.props.sortNo);
    return (
      <DescriptionList layout="horizontal" size="large" col={3}>
        {filterList}
      </DescriptionList>
    );
  };

  tablePropsConfig = () => {
    const {
      loading,
      dispatch,
      ChannelFee: { formData, dataSource, delChannelCostConD, abOusArr },
      userContractEditSub: { pageConfig = {} },
    } = this.props;

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
      showSearch: false,
      showExport: false,
      pagination: false,
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
            render: (value, row, index) => (row.minChannelCostConId ? '' : row.workTypeName),
          },
          {
            title: '具体理由',
            key: 'reason',
            dataIndex: 'reason',
            align: 'center',
            width: 250,
            render: (value, row, index) => (row.minChannelCostConId ? '' : value),
          },
          {
            title: '伙伴类型',
            key: 'coopType',
            dataIndex: 'coopType',
            align: 'center',
            width: 200,
            render: (value, row, index) => (row.minChannelCostConId ? '' : row.coopTypeName),
          },
          {
            title: '合作方',
            key: 'channelCostRem',
            dataIndex: 'channelCostRem',
            align: 'center',
            width: 250,
            render: (value, row, index) => (row.minChannelCostConId ? '' : value),
          },
          {
            title: '基于',
            key: 'base',
            dataIndex: 'base',
            align: 'center',
            width: 150,
            render: (value, row, index) => (row.minChannelCostConId ? '' : row.baseName),
          },
          {
            title: '比例',
            key: 'proportion',
            dataIndex: 'proportion',
            align: 'center',
            width: 150,
            render: (value, row, index) => (row.minChannelCostConId ? '' : `${row.proportion}%`),
          },
          {
            title: '金额(不含税)',
            key: 'amt',
            dataIndex: 'amt',
            align: 'right',
            width: 200,
          },
          {
            title: '税费率',
            key: 'taxRate',
            dataIndex: 'taxRate',
            align: 'center',
            width: 150,
            render: (value, row, index) => `${value}%`,
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
            render: (value, row, index) => (row.minChannelCostConId ? '' : row.reimExpName),
          },
          {
            title: '净支付',
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
            render: (value, row, index) => (row.minChannelCostConId ? '' : row.salaryMethodName),
          },
          {
            title: '收款节点',
            key: 'receivingNode',
            dataIndex: 'receivingNode',
            align: 'center',
            width: 200,
            render: (value, row, index) => (row.minChannelCostConId ? '' : row.receivingNodeName),
          },
          {
            title: '线下合同&沟通签署状态',
            key: 'contractStatus',
            dataIndex: 'contractStatus',
            align: 'center',
            width: 200,
            render: (value, row, index) => (row.minChannelCostConId ? '' : value),
          },

          {
            title: '联系人姓名',
            key: 'contactName',
            dataIndex: 'contactName',
            align: 'center',
            width: 200,
            render: (value, row, index) => (row.minChannelCostConId ? '' : value),
          },
          {
            title: '联系人电话',
            key: 'contactPhone',
            dataIndex: 'contactPhone',
            align: 'center',
            width: 200,
            render: (value, row, index) => (row.minChannelCostConId ? '' : value),
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
            formData.contractStatus !== 'ACTIVE',
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
            formData.contractStatus !== 'ACTIVE',
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
      type: `${DOMAIN}/save`,
    }).then(res => {
      if (res.ok) {
        this.toggleVisible();

        // 关闭弹窗，清除数据
        this.setState({
          splitAmt: null,
          splitAmtSelectedRows: [],
        });
      }
    });
  };

  toggleVisible = () => {
    const { visible } = this.state;
    this.setState({ visible: !visible });
  };

  render() {
    const {
      loading,
      dispatch,
      ChannelFee: { oppoChannelCosttViews },
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
        <DataTable {...this.tablePropsConfig()} />
        <Modal
          destroyOnClose
          title="主明细拆分"
          visible={visible}
          onOk={() => {
            this.splitAmt();
          }}
          onCancel={() => this.toggleVisible()}
          width="50%"
          confirmLoading={loading.effects[`${DOMAIN}/save`]}
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
