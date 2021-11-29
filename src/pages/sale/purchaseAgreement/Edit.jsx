import React, { Component } from 'react';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { Card, Button, Spin, Form } from 'antd';
import Title from '@/components/layout/Title';
import { connect } from 'dva';
import createMessage from '@/components/core/AlertMessage';
import classnames from 'classnames';
import { fromQs } from '@/utils/stringUtils';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { isEmpty, takeLast, add, isNil, gte, lte } from 'ramda';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import { add as mathAdd, sub, div, mul, checkIfNumber, genFakeId } from '@/utils/mathUtils';
import moment from 'moment';

import ContractEdit from './component/ContractEdit';
import DocumentEdit from './component/DocumentEdit';
import AssociatedResourcesEdit from './component/AssociatedResourcesEdit';
import SettlementRateEdit from './component/SettlementRateEdit';
import RelatedAgreementsEdit from './component/RelatedAgreementsEdit';

const tabConf = [
  {
    key: 'contract',
    tab: '采购协议信息',
  },
  {
    key: 'document',
    tab: '单据信息',
  },
  {
    key: 'resources',
    tab: '关联资源',
  },
  {
    key: 'rate',
    tab: '人力资源结算费率',
  },
  {
    key: 'agreements',
    tab: '关联协议',
  },
];

const contentListSelected = (form, operationkey) => {
  const contentList = {
    contract: <ContractEdit form={form} />,
    document: <DocumentEdit form={form} />,
    resources: <AssociatedResourcesEdit />,
    rate: <SettlementRateEdit />,
    agreements: <RelatedAgreementsEdit />,
  };
  return contentList[operationkey];
};

const DOMAIN = 'salePurchaseAgreementsEdit';

@connect(({ loading, salePurchaseAgreementsEdit }) => ({
  loading,
  salePurchaseAgreementsEdit,
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    if (isEmpty(changedFields)) return;
    const { name, value } = Object.values(changedFields)[0];
    if (name === 'signingLegalDesc' || name === 'supplierLegalDesc') return;
    if (name === 'effectiveDate') {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: {
          effectiveStartDate: value && value[0] ? formatDT(value[0]) : null,
          effectiveEndDate: value && value[1] ? formatDT(value[1]) : null,
        },
      });
    } else {
      const val = name === 'signDate' ? formatDT(value) : value;
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { [name]: val },
      });
    }
  },
})
@mountToTab()
class Edit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      operationkey: 'contract',
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const { id, mode, from, purchaseType, businessType, acceptanceType } = fromQs();
    dispatch({
      type: `${DOMAIN}/clear`,
    });
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: {
        pageNo: 'PURCHASE_AGREEMENT_SAVE',
      },
    });
    dispatch({
      type: `${DOMAIN}/getProductClass`,
    });
    dispatch({
      type: `${DOMAIN}/selectAbOus`,
    });
    dispatch({
      type: `${DOMAIN}/selectAllAbOu`,
    });
    dispatch({
      type: `${DOMAIN}/selectAssociation`,
      payload: {
        id,
      },
    });
    dispatch({
      type: `${DOMAIN}/selectExternalUser`,
    });
    if (id) {
      dispatch({
        type: `${DOMAIN}/queryEdit`,
        payload: id,
      });
    } else {
      dispatch({
        type: `${DOMAIN}/fetchPrincipal`,
      }).then(res => {
        dispatch({
          type: `${DOMAIN}/selectOuByOuId`,
          payload: res.extInfo.ouId,
        }).then(response => {
          dispatch({
            type: `${DOMAIN}/updateForm`,
            payload: {
              signingLegalNo: response.code,
              signingLegalDesc: response.name,
              signingBuId: res.extInfo.baseBuId,
              purchaseInchargeResId: res.extInfo.resId,
            },
          });
        });
      });
    }
  }

  onOperationTabChange = key => {
    this.setState({
      operationkey: key,
    });
  };

  handleCancel = () => {
    closeThenGoto(`/sale/purchaseContract/purchaseAgreementList`);
  };

  checkList = (list, checks) => {
    let flag = false;
    list.forEach(item => {
      checks.forEach(view => {
        if (!item[view] && item[view] !== 0) flag = true;
      });
    });
    return flag;
  };

  checkSettlementRate = list => {
    let flag = false;
    let repeatFlag = false;
    let orderFlag = false;
    if (list.find(item => item.startAtm >= item.endAtm)) {
      orderFlag = true;
    }
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < list.length; i++) {
      // eslint-disable-next-line no-plusplus
      for (let j = i + 1; j < list.length; j++) {
        if (list[i].startAtm < list[j].endAtm && list[j].startAtm < list[i].endAtm) {
          flag = true;
        }
        if (list[i].startAtm === list[j].endAtm && list[j].startAtm === list[i].endAtm) {
          repeatFlag = true;
        }
      }
    }
    if (flag || repeatFlag || orderFlag)
      createMessage({
        type: 'error',
        description: `请检查人力资源结算费率，金额期间不允许有交叉或相同, 且结束金额需大于开始金额`,
      });
    return flag || repeatFlag || orderFlag;
  };

  checkAssociatedResources = list => {
    let flag = false;
    let repeatFlag = false;
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < list.length; i++) {
      // eslint-disable-next-line no-plusplus
      for (let j = i + 1; j < list.length; j++) {
        if (
          list[i].resId === list[j].resId &&
          moment(list[i].resStartDate).isBefore(list[j].resEndDate, 'day') &&
          moment(list[j].resStartDate).isBefore(list[i].resEndDate, 'day')
        ) {
          flag = true;
        }
        if (
          list[i].resId === list[j].resId &&
          moment(list[i].resStartDate).isSame(list[j].resEndDate, 'day') &&
          moment(list[j].resStartDate).isSame(list[i].resEndDate, 'day')
        ) {
          repeatFlag = true;
        }
      }
    }
    if (flag || repeatFlag) {
      createMessage({
        type: 'error',
        description: `请检查关联资源，同一资源的资源日期不允许有交叉或相同`,
      });
    }
    return flag || repeatFlag;
  };

  // 保存
  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      salePurchaseAgreementsEdit: {
        formData,
        agreementDetailsEntities,
        agreementDetailsDeletedKeys,
        agreementResEntities,
        agreementResDeletedKeys,
        resSetRateEntities,
        resSetRateDeletedKeys,
        agreementEntities,
        agreementDeleteKeys,
      },
      dispatch,
    } = this.props;

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        if (!agreementDetailsEntities.length > 0) {
          createMessage({ type: 'error', description: '请添加采购明细' });
          return;
        }
        const agreementDetailsChecks = ['relatedProductId', 'quantity', 'taxPrice', 'taxRate'];
        const agreementResChecks = ['resId', 'resStartDate', 'resEndDate'];
        const resSetRateChecks = ['startAtm', 'endAtm', 'serviceRate'];
        const agreementChecks = ['associationId'];

        const flagArr = [
          this.checkList(agreementDetailsEntities, agreementDetailsChecks),
          this.checkList(agreementResEntities, agreementResChecks),
          this.checkList(resSetRateEntities, resSetRateChecks),
          this.checkList(agreementEntities, agreementChecks),
        ];
        const tableNameArr = ['采购明细', '关联资源', '人力资源结算费率', '关联协议'];
        const filterArr = tableNameArr.filter((item, index) => flagArr[index]);
        if (filterArr.length > 0) {
          createMessage({ type: 'error', description: `请检查${filterArr.join(',')}必填项` });
          return;
        }
        const associatedResourcesCheckRes = this.checkAssociatedResources(agreementResEntities);
        const settlementRateCheckRes = this.checkSettlementRate(resSetRateEntities);
        if (associatedResourcesCheckRes || settlementRateCheckRes) return;
        dispatch({
          type: `${DOMAIN}/save`,
          payload: {
            purchaseAgreementEntity: {
              id: genFakeId(-1),
              ...formData,
              agreementDetailsEntities,
              agreementResEntities,
              resSetRateEntities,
              associationAgreementEntities: agreementEntities,
            },
            deleteDetails: agreementDetailsDeletedKeys,
            deleteRes: agreementResDeletedKeys,
            deleteRates: resSetRateDeletedKeys,
            deleteAgreements: agreementDeleteKeys,
          },
        });
      }
    });
  };

  render() {
    const { operationkey } = this.state;
    const { loading, form } = this.props;
    return (
      <PageHeaderWrapper title="薪资成本管理">
        <Spin
          spinning={
            loading.effects[`${DOMAIN}/queryEdit`] ||
            loading.effects[`${DOMAIN}/save`] ||
            loading.effects[`${DOMAIN}/getPageConfig`] ||
            false
          }
        >
          <Card className="tw-card-rightLine">
            <Button
              className="tw-btn-primary"
              icon="save"
              size="large"
              disabled={false}
              onClick={this.handleSave}
            >
              <Title id="misc.save" defaultMessage="保存" />
            </Button>
            <Button
              className={classnames('separate', 'tw-btn-default')}
              icon="undo"
              size="large"
              onClick={this.handleCancel}
            >
              <Title id="misc.rtn" defaultMessage="返回" />
            </Button>
          </Card>
          <Card
            className="tw-card-multiTab"
            bordered={false}
            activeTabKey={operationkey}
            tabList={tabConf}
            onTabChange={this.onOperationTabChange}
          >
            {contentListSelected(form, operationkey)}
          </Card>
        </Spin>
      </PageHeaderWrapper>
    );
  }
}

export default Edit;
