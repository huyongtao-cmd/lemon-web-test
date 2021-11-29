/* eslint-disable no-nested-ternary */
import { formatMessage } from 'umi/locale';
import React, { PureComponent } from 'react';
import { Tooltip } from 'antd';
import { FileManagerEnhance } from '@/pages/gen/field';
import { connect } from 'dva';

const tabList = [
  {
    key: 'basic',
    tab: formatMessage({ id: `user.management.oppo.oppo`, desc: '基本信息' }),
  },
  {
    key: 'sale',
    tab: formatMessage({ id: `user.management.oppo.sale`, desc: '销售清单' }),
  },
  {
    key: 'case',
    tab: formatMessage({ id: `user.management.oppo.case`, desc: '案情分析与跟进' }),
  },
  {
    key: 'stakeholder',
    tab: formatMessage({ id: `user.management.oppo.stakeholder`, desc: '商机干系人' }),
  },
  {
    key: 'partner',
    tab: formatMessage({ id: `user.management.oppo.partner`, desc: '合作伙伴' }),
  },
  // {
  //   key: 'extrafee',
  //   tab: formatMessage({ id: `user.management.oppo.extrafee`, desc: '额外销售费用' }),
  // },
  {
    key: 'competitor',
    tab: formatMessage({ id: `user.management.oppo.competitor`, desc: '竞争对手' }),
  },
  {
    key: 'costEstimation',
    tab: '成本估算',
  },
  {
    key: 'benefitDistribution',
    tab: '利益分配',
  },
  {
    key: 'channelFee',
    tab: '渠道费用',
  },
  {
    key: 'quote',
    tab: '报价',
  },
  {
    key: 'category',
    tab: formatMessage({ id: `user.management.oppo.category`, desc: '类别码' }),
  },
];

const saleCol = salePageConfig => {
  if (!salePageConfig.pageBlockViews || salePageConfig.pageBlockViews.length < 1) {
    return <div />;
  }
  const currentBlockConfig = salePageConfig.pageBlockViews[0];
  const { pageFieldViews } = currentBlockConfig;
  const pageFieldJson = {};
  pageFieldViews.forEach(field => {
    pageFieldJson[field.fieldKey] = field;
  });
  const saleCol1 = [
    pageFieldJson.prodId.visibleFlag && {
      title: `${pageFieldJson.prodId.displayName}`,
      dataIndex: 'prodName',
      align: 'center',
      sortNo: `${pageFieldJson.prodId.sortNo}`,
    },
    pageFieldJson.classId.visibleFlag && {
      title: `${pageFieldJson.classId.displayName}`,
      dataIndex: 'className',
      align: 'center',
      sortNo: `${pageFieldJson.classId.sortNo}`,
    },
    pageFieldJson.subClassId.visibleFlag && {
      title: `${pageFieldJson.subClassId.displayName}`,
      dataIndex: 'subClassName',
      align: 'center',
      sortNo: `${pageFieldJson.subClassId.sortNo}`,
    },
    pageFieldJson.saleTaxedAmt.visibleFlag && {
      title: `${pageFieldJson.saleTaxedAmt.displayName}`,
      dataIndex: 'saleTaxedAmt',
      align: 'right',
      sortNo: `${pageFieldJson.saleTaxedAmt.sortNo}`,
    }, // , align: 'right',
    pageFieldJson.saleTaxRate.visibleFlag && {
      title: `${pageFieldJson.saleTaxRate.displayName}`,
      dataIndex: 'saleTaxRate',
      align: 'right',
      sortNo: `${pageFieldJson.saleTaxedAmt.sortNo}`,
    },
    pageFieldJson.saleNetAmt.visibleFlag && {
      title: `${pageFieldJson.saleNetAmt.displayName}`,
      dataIndex: 'saleNetAmt',
      align: 'right',
      sortNo: `${pageFieldJson.saleNetAmt.sortNo}`,
    }, // saleTaxedAmt/(1+saleTaxRate)
    pageFieldJson.purTaxedAmt.visibleFlag && {
      title: `${pageFieldJson.purTaxedAmt.displayName}`,
      dataIndex: 'purTaxedAmt',
      align: 'right',
      sortNo: `${pageFieldJson.purTaxedAmt.sortNo}`,
    },
    pageFieldJson.purTaxRate.visibleFlag && {
      title: `${pageFieldJson.purTaxRate.displayName}`,
      dataIndex: 'purTaxRate',
      align: 'right',
      sortNo: `${pageFieldJson.purTaxRate.sortNo}`,
    },
    pageFieldJson.purNetAmt.visibleFlag && {
      title: `${pageFieldJson.purNetAmt.displayName}`,
      dataIndex: 'purNetAmt',
      align: 'right',
      sortNo: `${pageFieldJson.purNetAmt.sortNo}`,
    }, // purTaxedAmt/(1+purTaxRate)
    pageFieldJson.effectiveAmt.visibleFlag && {
      title: `${pageFieldJson.effectiveAmt.displayName}`,
      dataIndex: 'effectiveAmt',
      align: 'right',
      sortNo: `${pageFieldJson.effectiveAmt.sortNo}`,
    },
    pageFieldJson.supplierId.visibleFlag && {
      title: `${pageFieldJson.supplierId.displayName}`,
      dataIndex: 'supplierName',
      sortNo: `${pageFieldJson.supplierId.sortNo}`,
    },
    pageFieldJson.remark.visibleFlag && {
      title: `${pageFieldJson.remark.displayName}`,
      dataIndex: 'remark',
      sortNo: `${pageFieldJson.supplierId.sortNo}`,
      render: (value, row, index) =>
        value && value.length > 30 ? (
          <Tooltip placement="left" title={value}>
            <pre>{`${value.substr(0, 30)}...`}</pre>
          </Tooltip>
        ) : (
          <pre>{value}</pre>
        ),
    },
  ]
    .filter(Boolean)
    .sort((field1, field2) => field1.sortNo - field2.sortNo);
  return saleCol1;
};

const caseCol = casePageConfig => {
  // 页面配置数据处理
  if (!casePageConfig.pageBlockViews || casePageConfig.pageBlockViews.length < 1) {
    return <div />;
  }
  const currentBlockConfig = casePageConfig.pageBlockViews[0];
  const { pageFieldViews } = currentBlockConfig;
  const pageFieldJson = {};
  pageFieldViews.forEach(field => {
    pageFieldJson[field.fieldKey] = field;
  });
  const caseCol1 = [
    pageFieldJson.oppoDate.visibleFlag && {
      title: `${pageFieldJson.oppoDate.displayName}`,
      dataIndex: 'oppoDate',
      sortNo: `${pageFieldJson.oppoDate.sortNo}`,
    },
    pageFieldJson.picResId.visibleFlag && {
      title: `${pageFieldJson.picResId.displayName}`,
      dataIndex: 'picName',
      sortNo: `${pageFieldJson.picResId.sortNo}`,
    },
    pageFieldJson.actionDesc.visibleFlag && {
      title: `${pageFieldJson.actionDesc.displayName}`,
      dataIndex: 'actionDesc',
      sortNo: `${pageFieldJson.actionDesc.sortNo}`,
    },
    pageFieldJson.concernDesc.visibleFlag && {
      title: `${pageFieldJson.concernDesc.displayName}`,
      dataIndex: 'concernDesc',
      sortNo: `${pageFieldJson.concernDesc.sortNo}`,
    },
    pageFieldJson.compeSituation.visibleFlag && {
      title: `${pageFieldJson.compeSituation.displayName}`,
      dataIndex: 'compeSituation',
      sortNo: `${pageFieldJson.compeSituation.sortNo}`,
    },
    pageFieldJson.treatment.visibleFlag && {
      title: `${pageFieldJson.treatment.displayName}`,
      dataIndex: 'treatment',
      sortNo: `${pageFieldJson.treatment.sortNo}`,
    },
    pageFieldJson.remark.visibleFlag && {
      title: `${pageFieldJson.remark.displayName}`,
      sortNo: `${pageFieldJson.remark.sortNo}`,
      dataIndex: 'remark',
      render: (value, row, index) =>
        value && value.length > 30 ? (
          <Tooltip placement="left" title={value}>
            <pre>{`${value.substr(0, 30)}...`}</pre>
          </Tooltip>
        ) : (
          <pre>{value}</pre>
        ),
    },
  ]
    .filter(Boolean)
    .sort((field1, field2) => field1.sortNo - field2.sortNo);
  return caseCol1;
};

// 客户核心关注点,我们竞争优势,对策,具体行动,负责人,备注
const shCol = stakePageConfig => {
  // 页面配置数据处理
  if (!stakePageConfig.pageBlockViews || stakePageConfig.pageBlockViews.length < 1) {
    return <div />;
  }
  const currentBlockConfig = stakePageConfig.pageBlockViews[0];
  const { pageFieldViews } = currentBlockConfig;
  const pageFieldJson = {};
  pageFieldViews.forEach(field => {
    pageFieldJson[field.fieldKey] = field;
  });
  const shCol1 = [
    pageFieldJson.roleType.visibleFlag && {
      title: `${pageFieldJson.roleType.displayName}`,
      dataIndex: 'roleTypeDesc',
      align: 'center',
      sortNo: `${pageFieldJson.roleType.sortNo}`,
    },
    pageFieldJson.position.visibleFlag && {
      title: `${pageFieldJson.position.displayName}`,
      dataIndex: 'position',
      sortNo: `${pageFieldJson.position.sortNo}`,
    },
    pageFieldJson.contactName.visibleFlag && {
      title: `${pageFieldJson.contactName.displayName}`,
      dataIndex: 'contactName',
      sortNo: `${pageFieldJson.contactName.sortNo}`,
    },
    pageFieldJson.contactTel.visibleFlag && {
      title: `${pageFieldJson.contactTel.displayName}`,
      dataIndex: 'contactTel',
      sortNo: `${pageFieldJson.contactTel.sortNo}`,
    },
    pageFieldJson.imAcc.visibleFlag && {
      title: `${pageFieldJson.imAcc.displayName}`,
      dataIndex: 'imAcc',
      sortNo: `${pageFieldJson.imAcc.sortNo}`,
    },
    pageFieldJson.standpoint.visibleFlag && {
      title: `${pageFieldJson.standpoint.displayName}`,
      dataIndex: 'standpointName',
      align: 'center',
      sortNo: `${pageFieldJson.standpoint.sortNo}`,
    },
    pageFieldJson.remark.visibleFlag && {
      title: `${pageFieldJson.remark.displayName}`,
      sortNo: `${pageFieldJson.remark.sortNo}`,
      dataIndex: 'remark',
      render: (value, row, index) =>
        value && value.length > 30 ? (
          <Tooltip placement="left" title={value}>
            <pre>{`${value.substr(0, 30)}...`}</pre>
          </Tooltip>
        ) : (
          <pre>{value}</pre>
        ),
    },
  ]
    .filter(Boolean)
    .sort((field1, field2) => field1.sortNo - field2.sortNo);
  return shCol1;
};
const competitorCol = competitorPageConfig => {
  // 页面配置数据处理
  if (!competitorPageConfig.pageBlockViews || competitorPageConfig.pageBlockViews.length < 1) {
    return <div />;
  }
  const currentBlockConfig = competitorPageConfig.pageBlockViews[0];
  const { pageFieldViews } = currentBlockConfig;
  const pageFieldJson = {};
  pageFieldViews.forEach(field => {
    pageFieldJson[field.fieldKey] = field;
  });
  const competitorCol1 = [
    // 对手名称,产品,竞争态势分析,对策
    pageFieldJson.opponentName.visibleFlag && {
      title: `${pageFieldJson.opponentName.displayName}`,
      dataIndex: 'opponentName',
      sortNo: `${pageFieldJson.opponentName.sortNo}`,
    },
    pageFieldJson.prodName.visibleFlag && {
      title: `${pageFieldJson.prodName.displayName}`,
      dataIndex: 'prodName',
      sortNo: `${pageFieldJson.prodName.sortNo}`,
    },
    pageFieldJson.analyse.visibleFlag && {
      title: `${pageFieldJson.analyse.displayName}`,
      dataIndex: 'analyse',
      sortNo: `${pageFieldJson.analyse.sortNo}`,
    },
    pageFieldJson.treatment.visibleFlag && {
      title: `${pageFieldJson.treatment.displayName}`,
      dataIndex: 'treatment',
      sortNo: `${pageFieldJson.treatment.sortNo}`,
    },
  ]
    .filter(Boolean)
    .sort((field1, field2) => field1.sortNo - field2.sortNo);
  return competitorCol1;
};
const partnerCol = partnerPageConfig => {
  if (!partnerPageConfig.pageBlockViews || partnerPageConfig.pageBlockViews.length < 1) {
    return <div />;
  }
  const currentBlockConfig = partnerPageConfig.pageBlockViews[0];
  const { pageFieldViews } = currentBlockConfig;
  const pageFieldJson = {};
  pageFieldViews.forEach(field => {
    pageFieldJson[field.fieldKey] = field;
  });
  const partnerCol1 = [
    // 合作伙伴编号,合作伙伴名称,合作事项,联系人,联系电话,联系人电子邮件,合作利益分配
    pageFieldJson.partnerName.visibleFlag && {
      title: `${pageFieldJson.partnerName.displayName}`,
      dataIndex: 'partnerName',
      sortNo: `${pageFieldJson.partnerName.sortNo}`,
    },
    pageFieldJson.partnerNo.visibleFlag && {
      title: `${pageFieldJson.partnerNo.displayName}`,
      dataIndex: 'partnerNo',
      sortNo: `${pageFieldJson.partnerNo.sortNo}`,
    },
    pageFieldJson.contactName.visibleFlag && {
      title: `${pageFieldJson.contactName.displayName}`,
      dataIndex: 'contactName',
      sortNo: `${pageFieldJson.contactName.sortNo}`,
    },
    pageFieldJson.contactEmail.visibleFlag && {
      title: `${pageFieldJson.contactEmail.displayName}`,
      dataIndex: 'contactEmail',
      sortNo: `${pageFieldJson.contactEmail.sortNo}`,
    },
    pageFieldJson.contactTel.visibleFlag && {
      title: `${pageFieldJson.contactTel.displayName}`,
      dataIndex: 'contactTel',
      sortNo: `${pageFieldJson.contactTel.sortNo}`,
    },
    pageFieldJson.coopDesc.visibleFlag && {
      title: `${pageFieldJson.coopDesc.displayName}`,
      dataIndex: 'coopDesc',
      sortNo: `${pageFieldJson.coopDesc.sortNo}`,
    },
    pageFieldJson.profitShare.visibleFlag && {
      title: `${pageFieldJson.profitShare.displayName}`,
      dataIndex: 'profitShare',
      sortNo: `${pageFieldJson.profitShare.sortNo}`,
    },
  ]
    .filter(Boolean)
    .sort((field1, field2) => field1.sortNo - field2.sortNo);
  return partnerCol1;
};
const extrafeeCol = extrafeePageConfig => {
  // 页面配置数据处理
  if (!extrafeePageConfig.pageBlockViews || extrafeePageConfig.pageBlockViews.length < 1) {
    return <div />;
  }
  const currentBlockConfig = extrafeePageConfig.pageBlockViews[0];
  const { pageFieldViews } = currentBlockConfig;
  const pageFieldJson = {};
  pageFieldViews.forEach(field => {
    pageFieldJson[field.fieldKey] = field;
  });
  const extrafeeCol1 = [
    // 费用类型,对方公司或个人,基数,金额或百分比
    pageFieldJson.feeType.visibleFlag && {
      title: `${pageFieldJson.feeType.displayName}`,
      dataIndex: 'feeTypeDesc',
      align: 'center',
      sortNo: `${pageFieldJson.feeType.sortNo}`,
    },
    pageFieldJson.opposityDesc.visibleFlag && {
      title: `${pageFieldJson.opposityDesc.displayName}`,
      dataIndex: 'opposityDesc',
      sortNo: `${pageFieldJson.opposityDesc.sortNo}`,
    },
    pageFieldJson.baseAmt.visibleFlag && {
      title: `${pageFieldJson.baseAmt.displayName}`,
      dataIndex: 'baseAmt',
      align: 'right',
      sortNo: `${pageFieldJson.baseAmt.sortNo}`,
    },
    pageFieldJson.ratio.visibleFlag && {
      title: `${pageFieldJson.ratio.displayName}`,
      dataIndex: 'ratio',
      align: 'right',
      sortNo: `${pageFieldJson.ratio.sortNo}`,
    },
  ]
    .filter(Boolean)
    .sort((field1, field2) => field1.sortNo - field2.sortNo);
  return extrafeeCol1;
};

const commonCol = [
  // span为宽度。 合计不要超过24
  { dataIndex: 'code', title: '编号', span: 6 },
  { dataIndex: 'name', title: '名称', span: 14 },
];

// 成本估算
const costEstimationCol = pageConfig => {
  const { pageBlockViews = [] } = pageConfig;
  const currentListConfig = pageBlockViews.filter(v => v.blockPageName === '成本估算');
  const { pageFieldViews = [] } = currentListConfig[0] || {};
  const pageFieldViewsVisible = pageFieldViews
    .filter(v => v.visibleFlag)
    .sort((field1, field2) => field1.sortNo - field2.sortNo);

  const columns = pageFieldViewsVisible.map(v => ({
    title: v.displayName || '',
    dataIndex: v.fieldKey,
    align: 'center',
    render: (val, row, index) =>
      // eslint-disable-next-line no-nested-ternary
      v.fieldKey === 'oppoCosteest' ||
      v.fieldKey === 'oppoCostesow' ||
      v.fieldKey === 'oppoThirdOffer' ? (
        <FileManagerEnhance
          api={
            // eslint-disable-next-line no-nested-ternary
            v.fieldKey === 'oppoCosteest'
              ? '/api/op/v1/oppoCoste/est/sfs/token'
              : v.fieldKey === 'oppoCostesow'
                ? '/api/op/v1/oppoCoste/sow/sfs/token'
                : '/api/op/v1/oppoCoste/thirdOffer/sfs/token'
          }
          listType="text"
          disabled={false}
          multiple={false}
          dataKey={row.id}
          preview
        />
      ) : v.fieldKey === 'approvalStatus' || v.fieldKey === 'costResId' ? (
        row[`${v.fieldKey}Name`]
      ) : v.fieldKey === 'activataStatus' && val === '1' ? (
        '未激活'
      ) : v.fieldKey === 'activataStatus' && val === '0' ? (
        '激活'
      ) : (
        row[v.fieldKey]
      ),
  }));
  return columns;
};

// 成本估算可编辑
const costEstimationColEdit = pageConfig => {
  const { pageBlockViews = [] } = pageConfig;
  const currentListConfig = pageBlockViews.filter(v => v.blockPageName === '成本估算');
  const { pageFieldViews = [] } = currentListConfig[0] || {};
  const pageFieldViewsVisible = pageFieldViews
    .filter(v => v.visibleFlag)
    .sort((field1, field2) => field1.sortNo - field2.sortNo);

  const columns = pageFieldViewsVisible.map(v => ({
    title: v.displayName || '',
    dataIndex: v.fieldKey,
    align: 'center',
    width:
      v.fieldKey === 'oppoCosteest' ||
      v.fieldKey === 'oppoCostesow' ||
      v.fieldKey === 'oppoThirdOffer'
        ? 300
        : 'auto',
    render: (val, row, index) =>
      // eslint-disable-next-line no-nested-ternary
      v.fieldKey === 'oppoCosteest' ||
      v.fieldKey === 'oppoCostesow' ||
      v.fieldKey === 'oppoThirdOffer' ? (
        <FileManagerEnhance
          api={
            // eslint-disable-next-line no-nested-ternary
            v.fieldKey === 'oppoCosteest'
              ? '/api/op/v1/oppoCoste/est/sfs/token'
              : v.fieldKey === 'oppoCostesow'
                ? '/api/op/v1/oppoCoste/sow/sfs/token'
                : '/api/op/v1/oppoCoste/thirdOffer/sfs/token'
          }
          listType="text"
          disabled={false}
          multiple={false}
          dataKey={row.id}
        />
      ) : v.fieldKey === 'approvalStatus' || v.fieldKey === 'costResId' ? (
        row[`${v.fieldKey}Name`]
      ) : v.fieldKey === 'activataStatus' && val === '1' ? (
        '未激活'
      ) : v.fieldKey === 'activataStatus' && val === '0' ? (
        '激活'
      ) : (
        row[v.fieldKey]
      ),
  }));
  return columns;
};

// 利益分配
const benefitDistributionCol = pageConfig => {
  const { pageBlockViews = [] } = pageConfig;
  const currentListConfig = pageBlockViews.filter(v => v.blockPageName === '利益分配');
  const { pageFieldViews = [] } = currentListConfig[0] || {};
  const pageFieldViewsVisible = pageFieldViews
    .filter(v => v.visibleFlag)
    .sort((field1, field2) => field1.sortNo - field2.sortNo);

  const columns = pageFieldViewsVisible.map(v => ({
    title: v.displayName || '',
    dataIndex: v.fieldKey,
    align: v.fieldKey === 'ruleDesc' ? 'left' : 'center',
    render: (val, row, index) =>
      v.fieldKey === 'approvalStatus' || (v.fieldKey === 'estResId' && val)
        ? row[`${v.fieldKey}Name`]
        : v.fieldKey === 'estResId' && !val
          ? '（商机的报备人）'
          : v.fieldKey === 'activataStatus' && val === '1'
            ? '未激活'
            : v.fieldKey === 'activataStatus' && val === '0'
              ? '激活'
              : row[v.fieldKey],
  }));
  return columns;
};

// 渠道
const channelFeeCol = pageConfig => {
  const { pageBlockViews = [] } = pageConfig;
  const currentListConfig = pageBlockViews.filter(v => v.blockPageName === '渠道费用');
  const { pageFieldViews = [] } = currentListConfig[0] || {};
  const pageFieldViewsVisible = pageFieldViews
    .filter(v => v.visibleFlag)
    .sort((field1, field2) => field1.sortNo - field2.sortNo);

  const columns = pageFieldViewsVisible.map(v => ({
    title: v.displayName || '',
    dataIndex: v.fieldKey,
    align: v.fieldKey === 'costDesc' ? 'left' : 'center',
    render: (val, row, index) =>
      v.fieldKey === 'approvalStatus' || v.fieldKey === 'applyResId'
        ? row[`${v.fieldKey}Name`]
        : v.fieldKey === 'activataStatus' && val === '1'
          ? '未激活'
          : v.fieldKey === 'activataStatus' && val === '0'
            ? '激活'
            : row[v.fieldKey],
  }));
  return columns;
};

// 报价
const quoteCol = quotePageConfig => {
  const { pageBlockViews = [] } = quotePageConfig;
  const currentListConfig = pageBlockViews.filter(v => v.blockPageName === '报价');
  const { pageFieldViews = [] } = currentListConfig[0] || {};
  const pageFieldViewsVisible = pageFieldViews
    .filter(v => v.visibleFlag)
    .sort((field1, field2) => field1.sortNo - field2.sortNo);

  const columns = pageFieldViewsVisible.map(v => ({
    title: v.displayName || '',
    dataIndex: v.fieldKey,
    align: 'center',
    render: (val, row, index) =>
      // eslint-disable-next-line no-nested-ternary
      v.fieldKey === 'oppoOfferCoste' ? (
        <FileManagerEnhance
          api="/api/op/v1/oppoCoste/thirdOffer/sfs/token"
          listType="text"
          disabled={false}
          multiple={false}
          dataKey={row.costeId}
          preview
        />
      ) : v.fieldKey === 'oppoOfferSow' ? (
        <FileManagerEnhance
          api="/api/op/v1/oppoCoste/sow/sfs/token"
          listType="text"
          disabled={false}
          multiple={false}
          dataKey={row.costeId}
          preview
        />
      ) : v.fieldKey === 'oppoOffer' || v.fieldKey === 'oppoOfferContract' ? (
        <FileManagerEnhance
          api={
            // eslint-disable-next-line no-nested-ternary
            v.fieldKey === 'oppoOffer'
              ? '/api/op/v1/oppoOffer/offer/sfs/token'
              : '/api/op/v1/oppoOffer/offer/contract/sfs/token'
          }
          listType="text"
          disabled={false}
          multiple={false}
          dataKey={row.id}
          preview
        />
      ) : v.fieldKey === 'apprStatus' || v.fieldKey === 'offerResId' ? (
        row[`${v.fieldKey}Name`]
      ) : v.fieldKey === 'activataStatus' && val === '1' ? (
        '未激活'
      ) : v.fieldKey === 'activataStatus' && val === '0' ? (
        '激活'
      ) : v.fieldKey === 'offerlStatus' && val === '1' ? (
        '未报价'
      ) : v.fieldKey === 'offerlStatus' && val === '0' ? (
        '已报价'
      ) : (
        row[v.fieldKey]
      ),
  }));
  return columns;
};

// 报价可编辑
const quoteColEdit = quotePageConfig => {
  const { pageBlockViews = [] } = quotePageConfig;
  const currentListConfig = pageBlockViews.filter(v => v.blockPageName === '报价');
  const { pageFieldViews = [] } = currentListConfig[0] || {};
  const pageFieldViewsVisible = pageFieldViews
    .filter(v => v.visibleFlag)
    .sort((field1, field2) => field1.sortNo - field2.sortNo);

  const columns = pageFieldViewsVisible.map(v => ({
    title: v.displayName || '',
    dataIndex: v.fieldKey,
    align: 'center',
    width: v.fieldKey === 'oppoOffer' || v.fieldKey === 'oppoOfferContract' ? 300 : 'auto',
    render: (val, row, index) =>
      // eslint-disable-next-line no-nested-ternary
      v.fieldKey === 'oppoOfferCoste' ? (
        <FileManagerEnhance
          api="/api/op/v1/oppoCoste/thirdOffer/sfs/token"
          listType="text"
          disabled={false}
          multiple={false}
          dataKey={row.costeId}
          preview
        />
      ) : v.fieldKey === 'oppoOfferSow' ? (
        <FileManagerEnhance
          api="/api/op/v1/oppoCoste/sow/sfs/token"
          listType="text"
          disabled={false}
          multiple={false}
          dataKey={row.costeId}
          preview
        />
      ) : v.fieldKey === 'oppoOffer' || v.fieldKey === 'oppoOfferContract' ? (
        <FileManagerEnhance
          api={
            // eslint-disable-next-line no-nested-ternary
            v.fieldKey === 'oppoOffer'
              ? '/api/op/v1/oppoOffer/offer/sfs/token'
              : '/api/op/v1/oppoOffer/offer/contract/sfs/token'
          }
          listType="text"
          disabled={false}
          multiple={false}
          dataKey={row.id}
        />
      ) : v.fieldKey === 'apprStatus' || v.fieldKey === 'offerResId' ? (
        row[`${v.fieldKey}Name`]
      ) : v.fieldKey === 'activataStatus' && val === '1' ? (
        '未激活'
      ) : v.fieldKey === 'activataStatus' && val === '0' ? (
        '激活'
      ) : v.fieldKey === 'offerlStatus' && val === '1' ? (
        '未报价'
      ) : v.fieldKey === 'offerlStatus' && val === '0' ? (
        '已报价'
      ) : (
        row[v.fieldKey]
      ),
  }));
  return columns;
};

export {
  tabList,
  saleCol,
  caseCol,
  shCol,
  competitorCol,
  partnerCol,
  extrafeeCol,
  commonCol,
  costEstimationCol,
  benefitDistributionCol,
  channelFeeCol,
  quoteCol,
  costEstimationColEdit,
  quoteColEdit,
};
