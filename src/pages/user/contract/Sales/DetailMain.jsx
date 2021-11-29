/* eslint-disable react/jsx-indent */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Card, Button } from 'antd';
import { formatMessage } from 'umi/locale';
import { isEmpty } from 'ramda';
import Link from 'umi/link';
import classnames from 'classnames';
import { fromQs } from '@/utils/stringUtils';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import { FileManagerEnhance } from '@/pages/gen/field';

import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DescriptionList from '@/components/layout/DescriptionList';
import Title from '@/components/layout/Title';
import DataTable from '@/components/common/DataTable';

const DOMAIN = 'userContractEditMain';
const { Description } = DescriptionList;

@connect(({ loading, userContractEditMain, dispatch }) => ({
  loading,
  userContractEditMain,
  dispatch,
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    if (isEmpty(changedFields)) return;
    const { name, value } = Object.values(changedFields)[0];
    let val = null;
    // antD 时间组件返回的是moment对象 转成字符串提交
    if (typeof value === 'object') {
      val = formatDT(value);
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
class DetailMain extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const mainId = fromQs().id;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: mainId,
    });
    dispatch({
      type: `${DOMAIN}/querySub`,
      payload: {
        mainContractId: mainId,
      },
    });
    // 加载页面配置
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'SALE_CONTRACT_DETAIL' },
    });
  }

  handleEdit = () => {
    const { id } = fromQs();
    closeThenGoto(`/sale/contract/salesEdit?id=${id}`);
  };

  handleCancel = () => {
    closeThenGoto('/sale/contract/salesList');
  };

  render() {
    const {
      dispatch,
      userContractEditMain: { formData, subList, pageConfig = {} },
    } = this.props;

    const { pageBlockViews = [] } = pageConfig;
    if (!pageBlockViews || pageBlockViews.length < 2) {
      return <div />;
    }
    const [
      { pageFieldViews: pageFieldViewsMain = {} },
      { pageFieldViews: pageFieldViewsList = {} },
    ] = pageBlockViews;
    const pageFieldJsonMain = {};
    const pageFieldJsonList = {};
    pageFieldViewsMain.forEach(field => {
      pageFieldJsonMain[field.fieldKey] = field;
    });
    pageFieldViewsList.forEach(field => {
      pageFieldJsonList[field.fieldKey] = field;
    });

    const tableProps = {
      columnsCache: DOMAIN,
      dispatch,
      // loading,
      // expirys: 0,
      // total,
      rowKey: 'id',
      sortBy: 'id',
      sortDirection: 'DESC',
      showSearch: false,
      filterMultiple: false,
      dataSource: subList,
      enableSelection: false,
      columns: [
        {
          key: 'contractNo',
          sorter: true,
          align: 'center',
          render: (value, rowData) => {
            const { mainContractId, id } = rowData;
            const href = `/sale/contract/salesSubDetail?mainId=${mainContractId}&id=${id}`;
            return (
              <Link className="tw-link" to={href}>
                {value}
              </Link>
            );
          },
        },
        {
          key: 'contractName',
        },
        {
          key: 'deliBuId', // todo
        },
        {
          key: 'amt',
          sorter: true,
          align: 'right',
        },
        {
          key: 'mainType',
          align: 'center',
        },
        {
          key: 'createTime',
          align: 'center',
          sorter: true,
        },
      ]
        .filter(
          col =>
            !col.key || (pageFieldJsonList[col.key] && pageFieldJsonList[col.key].visibleFlag === 1)
        )
        .map(col => ({
          ...col,
          title: pageFieldJsonList[col.key].displayName,
          sortNo: pageFieldJsonList[col.key].sortNo,
          // eslint-disable-next-line no-nested-ternary
          dataIndex:
            // eslint-disable-next-line no-nested-ternary
            pageFieldJsonList[col.key].fieldKey === 'deliBuId'
              ? 'buName'
              : pageFieldJsonList[col.key].fieldKey === 'mainType'
                ? 'mainTypeDesc'
                : pageFieldJsonList[col.key].fieldKey,
        }))
        .sort((f1, f2) => f1.sortNo - f2.sortNo),
    };

    const baseInfo = [
      <Description key="contractName">{formData.contractName}</Description>,
      <Description key="contractNo">{formData.contractNo}</Description>,
      <Description key="ouId">{formData.ouName}</Description>,
      <Description key="userdefinedNo">{formData.userdefinedNo}</Description>,
      <Description key="oppoId">{formData.oppoName}</Description>,
      <Description key="relatedContractId">{formData.relatedContractName}</Description>,
      <Description key="custId">{formData.custName}</Description>,
      <Description key="newContractFlag">
        {formData.newContractFlag === 'NEW' ? '是' : '否'}
      </Description>,
      <Description key="signDate">{formData.signDate}</Description>,
      <Description key="specialConcerned">{formData.specialConcerned}</Description>,
      <Description key="attache">
        <FileManagerEnhance
          api="/api/op/v1/contract/sfs/token"
          dataKey={formData.id}
          listType="text"
          disabled
          preview
        />
      </Description>,
      <Description key="audit">{formData.audit}</Description>,
      <Description key="contractStatus">{formData.contractStatusDesc}</Description>,
      <Description key="closeReason">{formData.closeReason}</Description>,
      <Description key="currCode">{formData.currCodeDesc}</Description>,
      <DescriptionList key="remark" size="large" col={1}>
        <Description>
          <pre>{formData.remark}</pre>
        </Description>
      </DescriptionList>,
      <Description key="createUserId">{formData.createUserName}</Description>,
      <Description key="createTime">{formData.createTime}</Description>,
    ]
      .filter(
        des =>
          !des.key || (pageFieldJsonMain[des.key] && pageFieldJsonMain[des.key].visibleFlag === 1)
      )
      .map(
        des =>
          des.key !== 'remark'
            ? {
                ...des,
                props: {
                  ...des.props,
                  term: pageFieldJsonMain[des.key].displayName,
                },
              }
            : {
                ...des,
                props: {
                  ...des.props,
                  children: des.props.children && {
                    ...des.props.children,
                    props: {
                      ...des.props.children.props,
                      term: pageFieldJsonMain[des.key].displayName || '备注',
                    },
                  },
                },
              }
      )
      .sort((des1, des2) => des1.sortNo - des2.sortNo);
    const finInfo = [
      <Description key="custProj">{formData.custProj}</Description>,
      <Description key="saleContent">{formData.saleContent}</Description>,
      <Description key="saleType1">{formData.saleType1Desc}</Description>,
      <Description key="saleType2">{formData.saleType2Desc}</Description>,
      <Description key="deliveryAddress">{formData.deliveryAddress}</Description>,
      <Description key="finPeriodId">{formData.finPeriodName}</Description>,
      <Description key="amt">{formData.amt}</Description>,
      <Description key="extraAmt">{formData.extraAmt}</Description>,
      <Description key="effectiveAmt">{formData.effectiveAmt}</Description>,
      <Description key="grossProfit">{formData.grossProfit}</Description>,
      <Description key="regionBuId">{formData.regionBuName}</Description>,
      <Description key="regionPrincipalResName">{formData.regionPrincipalResName}</Description>,
    ]
      .filter(
        des =>
          !des.key || (pageFieldJsonMain[des.key] && pageFieldJsonMain[des.key].visibleFlag === 1)
      )
      .map(des => ({
        ...des,
        props: {
          ...des.props,
          term: pageFieldJsonMain[des.key].displayName,
        },
      }))
      .sort((des1, des2) => des1.sortNo - des2.sortNo);

    const interInfo = [
      <Description key="signBuId">{formData.signBuName}</Description>,
      <Description key="salesmanResId">{formData.salesmanResName}</Description>,
      <Description key="deliBuId">{formData.deliBuName}</Description>,
      <Description key="deliResId">{formData.deliResName}</Description>,
      <Description key="coBuId">{formData.coBuName}</Description>,
      <Description key="coResId">{formData.coResName}</Description>,
      <Description key="codeliBuId">{formData.codeliBuName}</Description>,
      <Description key="codeliResId">{formData.codeliResName}</Description>,
      <Description key="pmoResId">{formData.pmoResIdName}</Description>,
      <Description key="platType">{formData.platTypeDesc}</Description>,
      <Description key="mainType">{formData.mainTypeDesc}</Description>,
    ]
      .filter(
        des =>
          !des.key || (pageFieldJsonMain[des.key] && pageFieldJsonMain[des.key].visibleFlag === 1)
      )
      .map(des => ({
        ...des,
        props: {
          ...des.props,
          term: pageFieldJsonMain[des.key].displayName,
        },
      }))
      .sort((des1, des2) => des1.sortNo - des2.sortNo);
    const sourceInfo = (formData.sourceType === 'INTERNAL'
      ? [
          <Description key="sourceType">{formData.sourceTypeDesc}</Description>,
          <Description key="internalBuId">{formData.internalBuName}</Description>,
          <Description key="internalResId">{formData.internalResName}</Description>,
          <Description key="profitDesc">{formData.profitDesc}</Description>,
        ]
      : [
          <Description key="sourceType">{formData.sourceTypeDesc}</Description>,
          <Description key="externalIden">{formData.externalIden}</Description>,
          <Description key="externalName">{formData.externalName}</Description>,
          <Description key="externalPhone">{formData.externalPhone}</Description>,
        ]
    )
      .filter(
        des =>
          !des.key || (pageFieldJsonMain[des.key] && pageFieldJsonMain[des.key].visibleFlag === 1)
      )
      .map(des => ({
        ...des,
        props: {
          ...des.props,
          term: pageFieldJsonMain[des.key].displayName,
        },
      }))
      .sort((des1, des2) => des1.sortNo - des2.sortNo);

    return (
      <PageHeaderWrapper title="销售合同详情">
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            type="primary"
            icon="form"
            size="large"
            onClick={this.handleEdit}
            hidden
          >
            {formatMessage({ id: `misc.edit`, desc: '编辑' })}
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
            <Title
              icon="profile"
              id="user.contract.menu.mainContract"
              defaultMessage="主合同信息"
            />
          }
        >
          <DescriptionList
            size="large"
            title={formatMessage({ id: `sys.system.basicInfo`, desc: '基本信息' })}
            col={2}
            hasSeparator
          >
            {baseInfo}
          </DescriptionList>

          <DescriptionList size="large" title="销售和财务信息" col={2} hasSeparator>
            {finInfo}
          </DescriptionList>

          <DescriptionList size="large" title="内部信息" col={2} hasSeparator>
            {interInfo}
          </DescriptionList>
          <DescriptionList size="large" title="来源信息" col={2}>
            {sourceInfo}
          </DescriptionList>
        </Card>

        <Card
          className="tw-card-adjust"
          bordered={false}
          title={
            <Title icon="profile" id="user.contract.menu.subContract" defaultMessage="子合同信息" />
          }
          style={{ marginTop: 6 }}
        >
          <DataTable {...tableProps} />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default DetailMain;
