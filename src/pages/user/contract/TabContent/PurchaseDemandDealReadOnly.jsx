import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form } from 'antd';
import { fromQs } from '@/utils/stringUtils';
import Link from 'umi/link';
import router from 'umi/router';
import DataTable from '@/components/common/DataTable';
import { isEmpty, isNil, clone } from 'ramda';
import { pageBasicBlockConfig } from '@/utils/pageConfigUtils';
import FieldList from '@/components/layout/FieldList';
import createMessage from '@/components/core/AlertMessage';
import DescriptionList from '@/components/layout/DescriptionList';

const { Description } = DescriptionList;

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
  }

  // 配置所需要的内容
  renderPage = () => {
    const {
      dispatch,
      purchaseDemandDeal: { formData },
      userContractEditSub: { pageConfig = {} },
      global: { userList },
      form: { getFieldDecorator, setFieldsValue },
    } = this.props;

    const pageFieldJson = pageBasicBlockConfig(pageConfig, 'blockPageName', '采购需求表单-详情');

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
      <Description key="contractNo" term={contractNo.displayName} sortNo={contractNo.sortNo}>
        {formData.contractNo || ''}
      </Description>,
      <Description key="custId" term={custId.displayName} sortNo={custId.sortNo}>
        {formData.custIdName || ''}
      </Description>,
      <Description key="leadsNo" term={leadsNo.displayName} sortNo={leadsNo.sortNo}>
        {formData.custIdName || ''}
      </Description>,
      <Description key="demandData" term={demandData.displayName} sortNo={demandData.sortNo}>
        {formData.demandData || ''}
      </Description>,

      <Description key="edemandResId" term={edemandResId.displayName} sortNo={edemandResId.sortNo}>
        {formData.edemandResIdName || ''}
      </Description>,

      <Description key="demandNo" term={demandNo.displayName} sortNo={demandNo.sortNo}>
        {formData.demandNo || ''}
      </Description>,
      <Description key="demandType" term={demandType.displayName} sortNo={demandType.sortNo}>
        {formData.demandTypeName || ''}
      </Description>,
      <Description
        key="demandTotalAmo"
        term={demandTotalAmo.displayName}
        sortNo={demandTotalAmo.sortNo}
      >
        {formData.demandTotalAmo || ''}
      </Description>,
      <Description key="demandStatus" term={demandStatus.displayName} sortNo={demandStatus.sortNo}>
        {formData.demandStatusName || ''}
      </Description>,
      <Description key="demandRem" term={demandRem.displayName} sortNo={demandRem.sortNo}>
        {formData.demandRem || ''}
      </Description>,
    ];

    const filterList = fields
      .filter(field => !field.key || pageFieldJson[field.key]?.visibleFlag === 1)
      .sort((field1, field2) => field1.props.sortNo - field2.props.sortNo);
    return (
      <DescriptionList title="基本信息" layout="horizontal" size="large" col={3}>
        {filterList}
      </DescriptionList>
    );
  };

  tablePropsConfig = () => {
    const {
      loading,
      dispatch,
      purchaseDemandDeal: { formData, dataSource, treeData, subTreeData, prodList, delProCurD },
      userContractEditSub: { pageConfig = {} },
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
    } = this.props;
    const pageFieldJson = pageBasicBlockConfig(pageConfig, 'blockPageName', '采购需求列表-详情');

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
      enableDoubleClick: false,
      showCopy: false,
      showSearch: false,
      showExport: false,
      onRow: () => {},
      columns: [
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
          dataIndex: 'supplierName',
          align: 'center',
          width: 250,
        },
        {
          title: demandSaid.displayName,
          key: 'demandSaid',
          dataIndex: 'demandSaid',
          align: 'center',
          width: 250,
        },
        {
          title: buProdId.displayName,
          key: 'buProdId',
          dataIndex: 'buProdName',
          align: 'center',
          width: 200,
        },
        {
          title: classId.displayName,
          key: 'classId',
          dataIndex: 'className',
          align: 'center',
          width: 200,
        },
        {
          title: subClassId.displayName,
          key: 'subClassId',
          dataIndex: 'subClassName',
          align: 'center',
          width: 200,
        },
        {
          title: demandNum.displayName,
          key: 'demandNum',
          dataIndex: 'demandNum',
          align: 'center',
          width: 150,
          render: (value, row, index) => !isNil(value) && value.toFixed(2),
        },
        {
          title: taxPrice.displayName,
          key: 'taxPrice',
          dataIndex: 'taxPrice',
          align: 'center',
          width: 200,
          render: (value, row, index) => !isNil(value) && value.toFixed(2),
        },
        {
          title: symbol.displayName,
          key: 'symbol',
          dataIndex: 'symbolName',
          align: 'center',
          width: 150,
        },
        {
          title: taxRate.displayName,
          key: 'taxRate',
          dataIndex: 'taxRate',
          align: 'center',
          width: 150,
          render: (value, row, index) => `${value || 0}%`,
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
      ]
        .filter(field => !field.key || pageFieldJson[field.key]?.visibleFlag === 1)
        .sort((field1, field2) => field1.sortNo - field2.sortNo),
      leftButtons: [
        {
          key: 'edit',
          className: 'tw-btn-primary',
          title: '生成采购合同',
          loading: false,
          hidden: false,
          disabled: selectedRows => !selectedRows.length || formData.contractStatus !== 'ACTIVE',
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

            const selectedSortNo = selectedRows.map(v => v.sortNo).join(',');
            router.push(
              `/sale/purchaseContract/Edit?mode=edit&purchaseType=CONTRACT&businessType=${
                formData.demandType
              }&contractId=${
                fromQs().id
              }&selectedSortNo=${selectedSortNo}&from=contract&fromTab=PurchaseDemandDeal`
            );
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
        <>{this.renderPage()}</>
        <FieldList legend="需求明细" getFieldDecorator={getFieldDecorator} col={1} />
        <DataTable {...this.tablePropsConfig()} />
      </>
    );
  }
}

export default PurchaseDemandDeal;
