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

const tabConf = [
  {
    key: 'contract',
    tab: '采购合同信息',
  },
  {
    key: 'document',
    tab: '单据信息',
  },
];

const contentListSelected = (form, operationkey) => {
  const contentList = {
    contract: <ContractEdit form={form} />,
    document: <DocumentEdit form={form} />,
  };
  return contentList[operationkey];
};

const DOMAIN = 'salePurchaseEdit';

@connect(({ loading, salePurchaseEdit, user }) => ({
  loading,
  salePurchaseEdit,
  ...user,
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    if (isEmpty(changedFields)) return;
    const { name, value } = Object.values(changedFields)[0];
    if (name === 'purchaseLegalName' || name === 'supplierLegalName') return;
    const val = name === 'signDate' || name === 'applicationDate' ? formatDT(value) : value;
    props.dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: { [name]: val },
    });
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
    const { dispatch, user: extInfo = {} } = this.props;
    const {
      id,
      mode,
      from,
      purchaseType,
      businessType,
      acceptanceType,
      contractId,
      fromTab,
    } = fromQs();
    dispatch({
      type: `${DOMAIN}/clear`,
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
      type: `${DOMAIN}/selectUsers`,
    });
    dispatch({
      type: `${DOMAIN}/selectBus`,
    });
    // dispatch({
    //   type: `${DOMAIN}/selectProject`,
    // });
    dispatch({
      type: `${DOMAIN}/selectPackage`,
    });
    if (id) {
      if (mode === 'change' && from === 'list') {
        dispatch({
          type: `${DOMAIN}/queryChangeByPurchaseId`,
          payload: id,
        });
      } else if (mode === 'change' && from === 'task') {
        dispatch({
          type: `${DOMAIN}/queryChangeByChangeId`,
          payload: id,
        });
      } else if (mode === 'edit' && from === 'task') {
        dispatch({
          type: `${DOMAIN}/queryEdit`,
          payload: id,
        });
      } else if (mode === 'edit' && from === 'list') {
        dispatch({
          type: `${DOMAIN}/queryEdit`,
          payload: id,
        });
      } else if (mode === 'over' && from === 'task') {
        dispatch({
          type: `${DOMAIN}/queryOverByOverId`,
          payload: id,
        });
      }
    } else {
      if (purchaseType === 'CONTRACT') {
        if (businessType === 'SERVICES_TRADE') {
          dispatch({
            type: `${DOMAIN}/getPageConfig`,
            payload: {
              pageNo: 'PURCHASE_CONTRACT_MANAGEMENT_SAVE:SERVICES_TRADE',
            },
          });
        } else if (businessType === 'PRODUCT_TRADE') {
          dispatch({
            type: `${DOMAIN}/getPageConfig`,
            payload: {
              pageNo: 'PURCHASE_CONTRACT_MANAGEMENT_SAVE:PRODUCT_TRADE',
            },
          });
        } else if (businessType === 'CHANNEL_COST') {
          dispatch({
            type: `${DOMAIN}/getPageConfig`,
            payload: {
              pageNo: 'PURCHASE_CONTRACT_MANAGEMENT_SAVE:CHANNEL_COST',
            },
          });
        } else if (businessType === 'RENT') {
          dispatch({
            type: `${DOMAIN}/getPageConfig`,
            payload: {
              pageNo: 'PURCHASE_CONTRACT_MANAGEMENT_SAVE:RENT',
            },
          });
          // 从销售合同列表点击新建项目采购-服务贸易 - 跳转过来
          if (from === 'salesContract') {
            dispatch({
              type: `${DOMAIN}/subDetail`,
              payload: {
                contractId,
                purchaseBuId: extInfo.baseBuId, // 采购BUId
                purchaseBuName: extInfo.baseBuName, // 采购BUName
                purchaseInchargeResId: extInfo.resId, // 采购负责人Id
                purchaseInchargeResName: extInfo.resName, // 采购负责人名称
              },
            });
          }
        } else if (businessType === 'SUNDRY') {
          dispatch({
            type: `${DOMAIN}/getPageConfig`,
            payload: {
              pageNo: 'PURCHASE_CONTRACT_MANAGEMENT_SAVE:SUNDRY',
            },
          });
          // 从销售合同列表点击新建项目采购-服务贸易 - 跳转过来
          if (from === 'salesContract') {
            dispatch({
              type: `${DOMAIN}/subDetail`,
              payload: {
                contractId,
                purchaseBuId: extInfo.baseBuId, // 采购BUId
                purchaseBuName: extInfo.baseBuName, // 采购BUName
                purchaseInchargeResId: extInfo.resId, // 采购负责人Id
                purchaseInchargeResName: extInfo.resName, // 采购负责人名称
              },
            });
          }
        } else {
          dispatch({
            type: `${DOMAIN}/getPageConfig`,
            payload: {
              pageNo: 'PURCHASE_CONTRACT_MANAGEMENT_SAVE:CONTRACT',
            },
          });
        }
        //  采购需求跳转过来初始值赋值
        if (
          mode === 'edit' &&
          from === 'contract' &&
          contractId &&
          fromTab === 'PurchaseDemandDeal'
        ) {
          dispatch({
            type: `${DOMAIN}/querySubDetails`,
            payload: { contractId },
          });
        }
        //  渠道费用跳转过来初始值赋值
        if (mode === 'edit' && from === 'contract' && contractId && fromTab === 'ChannelFee') {
          dispatch({
            type: `${DOMAIN}/queryChannelDetails`,
            payload: { contractId },
          });
        }
      } else if (purchaseType === 'MARKET') {
        dispatch({
          type: `${DOMAIN}/getPageConfig`,
          payload: {
            pageNo: 'PURCHASE_CONTRACT_MANAGEMENT_SAVE:MARKET',
          },
        });
      } else if (purchaseType === 'RESEARCH') {
        dispatch({
          type: `${DOMAIN}/getPageConfig`,
          payload: {
            pageNo: 'PURCHASE_CONTRACT_MANAGEMENT_SAVE:RESEARCH',
          },
        });
      } else if (purchaseType === 'ADMINISTRATIVE') {
        dispatch({
          type: `${DOMAIN}/getPageConfig`,
          payload: {
            pageNo: 'PURCHASE_CONTRACT_MANAGEMENT_SAVE:ADMINISTRATIVE',
          },
        });
      } else if (purchaseType === 'MANAGEMENT') {
        dispatch({
          type: `${DOMAIN}/getPageConfig`,
          payload: {
            pageNo: 'PURCHASE_CONTRACT_MANAGEMENT_SAVE:MANAGEMENT',
          },
        });
      } else if (purchaseType === 'RESOURCE') {
        dispatch({
          type: `${DOMAIN}/getPageConfig`,
          payload: {
            pageNo: 'PURCHASE_CONTRACT_MANAGEMENT_SAVE:RESOURCE',
          },
        });
      } else if (purchaseType === 'OTHER_TYPES') {
        dispatch({
          type: `${DOMAIN}/getPageConfig`,
          payload: {
            pageNo: 'PURCHASE_CONTRACT_MANAGEMENT_SAVE:OTHER_TYPES',
          },
        });
      } else {
        dispatch({
          type: `${DOMAIN}/getPageConfig`,
          payload: {
            pageNo: 'PURCHASE_CONTRACT_MANAGEMENT_SAVE',
          },
        });
      }
      purchaseType &&
        dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: {
            purchaseType,
          },
        });
      acceptanceType &&
        dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: {
            acceptanceType,
          },
        });
      businessType &&
        dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: {
            businessType,
          },
        });
      contractId &&
        dispatch({
          type: `${DOMAIN}/selectContractNode`,
          payload: {
            contractId,
          },
        });
      from !== 'contract' &&
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
                purchaseLegalNo: response.code,
                purchaseLegalName: response.name,
                purchaseBuId: res.extInfo.baseBuId,
                purchaseBuName: res.extInfo.baseBuName,
                purchaseInchargeResId: res.extInfo.resId,
                purchaseInchargeResName: res.extInfo.resName,
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
    closeThenGoto(`/sale/purchaseContract/List`);
  };

  // 保存
  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      salePurchaseEdit: {
        formData,
        paymentList,
        purchaseList,
        paymentDeletedKeys,
        purchaseDeleteKeys,
      },
      dispatch,
    } = this.props;

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        if (!purchaseList.length > 0 || !paymentList.length > 0) {
          if (!purchaseList.length > 0 && !paymentList.length > 0) {
            createMessage({ type: 'error', description: '请添加付款计划和采购明细' });
          } else if (!purchaseList.length > 0) {
            createMessage({ type: 'error', description: '请添加采购明细' });
          } else if (!paymentList.length > 0) {
            createMessage({ type: 'error', description: '请添加付款计划' });
          }
          return;
        }
        const paymentFlag = this.checkList(paymentList, 'PURCHASE_CON_MAN_PAY_PLAN');
        const purchaseFlag = this.checkList(purchaseList, 'PURCHASE_CON_MAN_DETAILS');
        if (!paymentFlag || !purchaseFlag) {
          if (!paymentFlag && !purchaseFlag) {
            createMessage({ type: 'error', description: '请检查付款计划和采购明细必填项' });
          } else if (!purchaseFlag) {
            createMessage({ type: 'error', description: '请检查采购明细必填项' });
          } else if (!paymentFlag) {
            createMessage({ type: 'error', description: '请检查付款计划必填项' });
          }
          return;
        }
        dispatch({
          type: `${DOMAIN}/save`,
          payload: {
            id: genFakeId(-1),
            ...formData,
            purchaseDetailsEntities: purchaseList,
            purchasePaymentPlanEntities: paymentList,
            paymentDeletedKeys,
            purchaseDeleteKeys,
          },
        });
      }
    });
  };

  compareList = (originalList, list, deleteKeys, changeList, group) => {
    originalList.filter(item => deleteKeys.indexOf(item.id) === -1).forEach((item, index) => {
      Object.keys(item).forEach(key => {
        // eslint-disable-next-line eqeqeq
        if (item[key] != list[index][key]) {
          changeList.push({
            documentId: item.id,
            changeField: key,
            changeLabel: '',
            changeFieldType: null,
            changedOpinion: null,
            deltaValue: null,
            beforeValue: item[key],
            afterValue: list[index][key],
            viewGroup: group,
            fieldGroup: group,
          });
        }
      });
    });
    list.forEach((item, index) => {
      if (item.id <= 0) {
        const documentId = genFakeId(-1);
        Object.keys(item)
          .filter(key => key !== 'id')
          .forEach(key => {
            changeList.push({
              documentId: item.id ? item.id : documentId,
              changeField: key,
              changeLabel: '',
              changeFieldType: null,
              changedOpinion: null,
              deltaValue: null,
              beforeValue: null,
              afterValue: item[key],
              viewGroup: group,
              fieldGroup: group,
            });
          });
      }
    });
    deleteKeys.forEach(id => {
      changeList.push({
        documentId: id,
        changeField: 'id',
        changeLabel: '',
        changeFieldType: null,
        changedOpinion: null,
        deltaValue: null,
        beforeValue: id,
        afterValue: null,
        viewGroup: group,
        fieldGroup: group,
      });
    });
  };

  checkList = (list, blockKey) => {
    const {
      salePurchaseEdit: { pageConfig },
    } = this.props;
    const arr = [];
    let flag = true;
    pageConfig.pageBlockViews
      .filter(item => item.blockKey === blockKey)[0]
      .pageFieldViews.forEach(item => {
        if (item.requiredFlag && item.visibleFlag) {
          arr.push(item.fieldKey);
        }
      });
    list.forEach(item => {
      arr.forEach(view => {
        if (!item[view] && item[view] !== 0) flag = false;
      });
    });
    return flag;
  };

  // 提交
  handelSubmit = () => {
    const {
      form: { validateFieldsAndScroll },
      salePurchaseEdit: {
        formData,
        originalFormData,
        paymentList,
        purchaseList,
        originalPaymentList,
        originalPurchaseList,
        paymentDeletedKeys,
        purchaseDeleteKeys,
      },
      dispatch,
    } = this.props;
    const { id, mode, taskId, remark, result } = fromQs();
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        if (!purchaseList.length > 0 || !paymentList.length > 0) {
          if (!purchaseList.length > 0 && !paymentList.length > 0) {
            createMessage({ type: 'error', description: '请添加付款计划和采购明细' });
          } else if (!purchaseList.length > 0) {
            createMessage({ type: 'error', description: '请添加采购明细' });
          } else if (!paymentList.length > 0) {
            createMessage({ type: 'error', description: '请添加付款计划' });
          }
          return;
        }
        const paymentFlag = this.checkList(paymentList, 'PURCHASE_CON_MAN_PAY_PLAN');
        const purchaseFlag = this.checkList(purchaseList, 'PURCHASE_CON_MAN_DETAILS');
        if (!paymentFlag || !purchaseFlag) {
          if (!paymentFlag && !purchaseFlag) {
            createMessage({ type: 'error', description: '请检查付款计划和采购明细必填项' });
          } else if (!purchaseFlag) {
            createMessage({ type: 'error', description: '请检查采购明细必填项' });
          } else if (!paymentFlag) {
            createMessage({ type: 'error', description: '请检查付款计划必填项' });
          }
          return;
        }
        if (mode === 'change') {
          const changeList = [];
          Object.keys(originalFormData)
            .filter(
              item => ['purchaseDetailsViews', 'purchasePaymentPlanViews'].indexOf(item) === -1
            )
            .forEach(key => {
              // eslint-disable-next-line eqeqeq
              if (formData[key] != originalFormData[key]) {
                changeList.push({
                  documentId: originalFormData.id,
                  changeField: key,
                  changeLabel: '',
                  changeFieldType: null,
                  changedOpinion: null,
                  deltaValue: null,
                  beforeValue: originalFormData[key],
                  afterValue: formData[key],
                  viewGroup: 'T_PURCHASE_CONTRACT_MANAGEMENT',
                  fieldGroup: 'T_PURCHASE_CONTRACT_MANAGEMENT',
                });
              }
            });
          this.compareList(
            originalPaymentList,
            paymentList,
            paymentDeletedKeys,
            changeList,
            'T_PURCHASE_PAYMENT_PLAN'
          );
          this.compareList(
            originalPurchaseList,
            purchaseList,
            purchaseDeleteKeys,
            changeList,
            'T_PURCHASE_DETAILS'
          );
          if (taskId) {
            dispatch({
              type: `${DOMAIN}/retrychangeSubmit`,
              payload: {
                changeFormData: {
                  id,
                  documentId: originalFormData.id,
                  typeNo: 'T_PURCHASE_CONTRACT_MANAGEMENT_CHANGE',
                  businessChangeDetailEntities: changeList,
                },
                purchaseContractView: originalFormData,
                newPurchaseContractView: {
                  ...formData,
                  purchaseDetailsViews: purchaseList,
                  purchasePaymentPlanViews: paymentList,
                },
                flow: {
                  result: 'APPROVED',
                  remark,
                  taskId,
                },
              },
            });
          } else {
            dispatch({
              type: `${DOMAIN}/changeSubmit`,
              payload: {
                changeFormData: {
                  id: genFakeId(-1),
                  documentId: originalFormData.id,
                  typeNo: 'T_PURCHASE_CONTRACT_MANAGEMENT_CHANGE',
                  businessChangeDetailEntities: changeList,
                },
                purchaseContractView: originalFormData,
                newPurchaseContractView: {
                  ...formData,
                  purchaseDetailsViews: purchaseList,
                  purchasePaymentPlanViews: paymentList,
                },
              },
            });
          }
        } else if (mode === 'edit') {
          if (taskId) {
            dispatch({
              type: `${DOMAIN}/retrySubmit`,
              payload: {
                ...formData,
                purchaseDetailsEntities: purchaseList,
                purchasePaymentPlanEntities: paymentList,
                paymentDeletedKeys,
                purchaseDeleteKeys,
                flow: {
                  result: 'APPROVED',
                  remark,
                  taskId,
                },
              },
            });
          } else {
            dispatch({
              type: `${DOMAIN}/submit`,
              payload: {
                id: genFakeId(-1),
                ...formData,
                purchaseDetailsEntities: purchaseList,
                purchasePaymentPlanEntities: paymentList,
                paymentDeletedKeys,
                purchaseDeleteKeys,
              },
            });
          }
        } else if (mode === 'over') {
          if (taskId) {
            dispatch({
              type: `${DOMAIN}/retryCloseSubmit`,
              payload: {
                id,
                overNo: formData.overNo,
                applyResId: formData.applyResId,
                applicationDate: formData.applicationDate,
                overStatus: formData.overStatus,
                apprStatus: formData.apprStatus,
                contractId: formData.id,
                contractNo: formData.contractNo,
                overWhy: formData.overWhy,
                overTime: formData.overTime,
                remark: formData.remark,
                flow: {
                  result: 'APPROVED',
                  remark,
                  taskId,
                },
              },
            });
          }
        }
      }
    });
  };

  render() {
    const { operationkey } = this.state;
    const { loading, form } = this.props;
    const { mode, from, taskId } = fromQs();
    return (
      <PageHeaderWrapper title="薪资成本管理">
        <Spin
          spinning={
            loading.effects[`${DOMAIN}/queryEdit`] ||
            loading.effects[`${DOMAIN}/save`] ||
            loading.effects[`${DOMAIN}/submit`] ||
            loading.effects[`${DOMAIN}/queryChangeByPurchaseId`] ||
            loading.effects[`${DOMAIN}/queryChangeByChangeId`] ||
            loading.effects[`${DOMAIN}/queryOverByOverId`] ||
            loading.effects[`${DOMAIN}/save`] ||
            loading.effects[`${DOMAIN}/submit`] ||
            loading.effects[`${DOMAIN}/retrySubmit`] ||
            loading.effects[`${DOMAIN}/changeSubmit`] ||
            loading.effects[`${DOMAIN}/retrychangeSubmit`] ||
            loading.effects[`${DOMAIN}/retryCloseSubmit`] ||
            loading.effects[`${DOMAIN}/getPageConfig`] ||
            false
          }
        >
          <Card className="tw-card-rightLine">
            {(mode === 'edit' && from === 'list') ||
            (mode === 'edit' && from === 'contract') ||
            (mode === 'edit' && from === 'salesContract') ||
            (mode === 'edit' && from === 'task') ? (
              <Button
                className="tw-btn-primary"
                icon="save"
                size="large"
                disabled={false}
                onClick={this.handleSave}
              >
                <Title id="misc.save" defaultMessage="保存" />
              </Button>
            ) : (
              ''
            )}
            <Button
              className="tw-btn-primary"
              icon="save"
              size="large"
              disabled={false}
              onClick={this.handelSubmit}
            >
              <Title id="misc.submit" defaultMessage="提交" />
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
