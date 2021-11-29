import React, { PureComponent } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import { Input, Radio, Modal } from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import SyntheticField from '@/components/common/SyntheticField';
import FieldList from '@/components/layout/FieldList';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import createMessage from '@/components/core/AlertMessage';
import { Selection, YearPicker, BuVersion } from '@/pages/gen/field';
import { isNil } from 'ramda';

import { createConfirm } from '@/components/core/Confirm';

import { selectBus } from '@/services/org/bu/bu';
import {
  selectCust,
  checkCreateProjById,
  selectSalesRegionBuMultiCol,
} from '@/services/user/Contract/sales';
import { selectActiveBu, selectUsersWithBu } from '@/services/gen/list';
import { getBuVersionAndBuParams } from '@/utils/buVersionUtils';

const DOMAIN = 'userContractSaleList';
const applyColumns = [
  { dataIndex: 'code', title: '编号', span: 12 },
  { dataIndex: 'name', title: '名称', span: 12 },
];

const { Field } = FieldList;

const RadioGroup = Radio.Group;

@connect(({ loading, userContractSaleList, dispatch }) => ({
  dispatch,
  loading: loading.effects[`${DOMAIN}/query`],
  userContractSaleList,
}))
@mountToTab()
class SaleList extends PureComponent {
  state = {
    addProjectBtnDisable: true, // 创建项目按钮显示标识，默认灰掉

    title: '',
    visible: false,
  };

  componentDidMount() {
    // this.fetchData();
    // 加载页面配置
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'SALE_CONTRACT_LIST' },
    });
  }

  fetchData = async params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: {
        ...params,
        ...getBuVersionAndBuParams(params.regionBuId, 'regionBuId', 'regionBuVersionId'),
        ...getBuVersionAndBuParams(params.signBuId, 'signBuId', 'signBuVersionId'),
        ...getBuVersionAndBuParams(params.deliBuId, 'deliBuId', 'deliBuVersionId'),
        ...getBuVersionAndBuParams(params.preSaleBuId, 'preSaleBuId', 'preSaleBuVersionId'),
      },
    });
  };

  // 创建项目按钮
  addProjectEvent = (selectedRowKeys, selectedRows, queryParams) => {
    checkCreateProjById({ id: selectedRowKeys[0] }).then(data => {
      const { status, response } = data;
      if (status === 100) {
        // 主动取消请求
        return;
      }
      if (response.ok) {
        // 合同id、主子类型、合同状态
        const { id, mainType, contractStatus } = selectedRows[0];
        // 主子类型为“子合同” 且 合同状态为‘激活状态’时，可创建项目
        if (mainType === 'SUB' && contractStatus === 'ACTIVE') {
          router.push(`/user/Project/projectCreate?contractId=${id}`);
        }
      } else {
        createMessage({ type: 'error', description: response.reason || '该合同无法创建项目' });
      }
    });
  };

  handleCancel = () => {
    this.setState({
      visible: false,
    });
  };

  handleOk = () => {
    const {
      userContractSaleList: { searchForm },
    } = this.props;
    const { businessType, selectedRowKeys } = searchForm;

    if (isNil(businessType)) {
      createMessage({
        type: 'warn',
        description: '请选择业务类型！',
      });
      return;
    }

    router.push(
      `/sale/purchaseContract/Edit?mode=edit&purchaseType=CONTRACT&businessType=${businessType}&contractId=${
        selectedRowKeys[0]
      }&from=salesContract`
    );
    this.setState({
      visible: false,
    });
  };

  render() {
    const {
      dispatch,
      loading,
      userContractSaleList: { dataSource, total, searchForm, pageConfig = {} },
    } = this.props;

    const { addProjectBtnDisable, title, visible } = this.state;

    if (!pageConfig.pageBlockViews || pageConfig.pageBlockViews.length < 1) {
      return <div />;
    }
    const [{ pageFieldViews }, { pageFieldViews: queryView }] = pageConfig.pageBlockViews;
    const pageFieldJson = {};
    const queryJson = {};
    pageFieldViews.forEach(field => {
      pageFieldJson[field.fieldKey] = field;
    });
    queryView.forEach(field => {
      queryJson[field.fieldKey] = field;
    });

    const btnJson = {};
    if (pageConfig && pageConfig.pageButtonViews && pageConfig.pageButtonViews.length > 0) {
      pageConfig.pageButtonViews.forEach(btn => {
        btnJson[btn.buttonKey] = btn;
      });
    }

    const tableProps = {
      columnsCache: DOMAIN,
      dispatch,
      loading,
      expirys: 0,
      total,
      rowKey: 'id',
      sortBy: 'id',
      sortDirection: 'DESC',
      scroll: {
        x: '150%',
      },
      showExport: btnJson.export.visible,
      // filterMultiple: false,
      dataSource,
      onChange: filters => {
        this.fetchData(filters);
      },
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      onRowChecked: (selectedRowKeys, selectedRows) => {
        if (selectedRows.length <= 0) {
          return;
        }
        // 合同id、主子类型、合同状态
        const { mainType, contractStatus } = selectedRows[0];
        // 主子类型为“子合同” 且 合同状态为‘激活状态’时，可创建项目
        if (mainType === 'SUB' && contractStatus === 'ACTIVE') {
          this.setState({
            addProjectBtnDisable: false,
          });
        } else {
          this.setState({
            addProjectBtnDisable: true,
          });
        }
      },
      searchBarForm: [
        {
          key: 'contractNmNo',
          title: '合同名称/编号',
          dataIndex: 'contractNmNo',
          options: {
            initialValue: searchForm.contractNmNo,
          },
          tag: <Input placeholder={`请输入${queryJson.contractNmNo.displayName}`} />,
        },
        {
          title: '参考合同号',
          dataIndex: 'userdefinedNo',
          key: 'userdefinedNo',
          options: {
            initialValue: searchForm.userdefinedNo,
          },
          tag: <Input placeholder={`请输入${queryJson.userdefinedNo.displayName}`} />,
        },
        {
          title: '客户',
          dataIndex: 'custId',
          key: 'custId',
          options: {
            initialValue: searchForm.custId,
          },
          tag: (
            <Selection
              source={() => selectCust()}
              placeholder={`请输入${queryJson.custId.displayName}`}
            />
          ),
        },
        {
          title: '销售区域BU',
          key: 'regionBuId',
          dataIndex: 'regionBuId',
          options: {
            initialValue: searchForm.regionBuId,
          },
          tag: <BuVersion />,
        },
        {
          title: '签单BU',
          key: 'signBuId',
          dataIndex: 'signBuId',
          options: {
            initialValue: searchForm.signBuId,
          },
          tag: <BuVersion />,
        },
        {
          title: '交付BU',
          key: 'deliBuId',
          dataIndex: 'deliBuId',
          options: {
            initialValue: searchForm.deliBuId,
          },
          tag: <BuVersion />,
        },
        {
          title: '售前BU',
          key: 'preSaleBuId',
          dataIndex: 'preSaleBuId',
          options: {
            initialValue: searchForm.deliBuId,
          },
          tag: <BuVersion />,
        },
        {
          title: '签单年度',
          key: 'finPeriodId',
          dataIndex: 'finPeriodYear',
          options: {
            initialValue: searchForm.finPeriodYear,
          },
          tag: <YearPicker className="x-fill-100" mode="year" format="YYYY" />,
        },
        {
          title: '销售负责人',
          key: 'salesmanResId',
          dataIndex: 'salesmanResId',
          options: {
            initialValue: searchForm.salesmanResId,
          },
          tag: (
            <Selection.Columns
              source={() => selectUsersWithBu()}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              columns={applyColumns}
              placeholder={`请输入${queryJson.salesmanResId.displayName}`}
              showSearch
            />
          ),
        },

        {
          title: '交付负责人',
          key: 'deliResId',
          dataIndex: 'deliResId',
          options: {
            initialValue: searchForm.deliResId,
          },
          tag: (
            <Selection.Columns
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              columns={applyColumns}
              source={() => selectUsersWithBu()}
              placeholder={`请输入${queryJson.deliResId.displayName}`}
              showSearch
            />
          ),
        },
        {
          title: '售前负责人',
          key: 'preSaleResId',
          dataIndex: 'preSaleResId',
          options: {
            initialValue: searchForm.preSaleResId,
          },
          tag: (
            <Selection.Columns
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              columns={applyColumns}
              source={() => selectUsersWithBu()}
              placeholder={`请输入${queryJson.preSaleResId.displayName}`}
              showSearch
            />
          ),
        },
        {
          title: '主子合同',
          key: 'mainType',
          dataIndex: 'mainType',
          options: {
            initialValue: searchForm.mainType,
          },
          tag: (
            <Selection.UDC
              code="TSK.MAIN_TYPE"
              placeholder={`请输入${queryJson.mainType.displayName}`}
            />
          ),
        },
        {
          title: '销售大类',
          key: 'saleType1',
          dataIndex: 'saleType1',
          options: {
            initialValue: searchForm.saleType1,
          },
          tag: (
            <Selection.UDC
              code="TSK.SALE_TYPE1"
              placeholder={`请输入${queryJson.saleType1.displayName}`}
            />
          ),
        },

        {
          title: '合同状态',
          key: 'contractStatus',
          dataIndex: 'contractStatus',
          options: {
            initialValue: searchForm.contractStatus,
          },
          tag: (
            <SyntheticField className="tw-field-group">
              <Radio.Group className="tw-field-group-filter" buttonStyle="solid">
                <Radio.Button value="0">=</Radio.Button>
                <Radio.Button value="1">≠</Radio.Button>
              </Radio.Group>
              <Selection.UDC
                className="tw-field-group-field"
                code="TSK.CONTRACT_STATUS"
                placeholder={`请输入${queryJson.contractStatus.displayName}`}
                showSearch
              />
            </SyntheticField>
          ),
        },
        {
          title: '纸质合同状态',
          key: 'paperStatus',
          dataIndex: 'paperStatus',
          options: {
            initialValue: searchForm.paperStatus,
          },
          tag: (
            <Selection.UDC
              code="TSK:CONT_PAPER_STATUS"
              placeholder={`请输入${queryJson.paperStatus.displayName}`}
            />
          ),
        },
        {
          title: '项目是否创建',
          key: 'enabledFlag',
          dataIndex: 'enabledFlag',
          options: {
            initialValue: searchForm.enabledFlag || '',
          },
          tag: (
            <RadioGroup>
              <Radio value="YES">是</Radio>
              <Radio value="NO">否</Radio>
              <Radio value="">全部</Radio>
            </RadioGroup>
          ),
        },
        {
          title: 'PMO',
          key: 'pmoResId',
          dataIndex: 'pmoResId',
          options: {
            initialValue: searchForm.pmoResId,
          },
          tag: (
            <Selection.Columns
              source={() => selectUsersWithBu()}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              columns={applyColumns}
              placeholder={`请输入${queryJson.pmoResId.displayName}`}
              showSearch
            />
          ),
        },
        {
          title: '收益分配规则',
          key: 'profitAgree',
          dataIndex: 'profitAgree',
          options: {
            initialValue: searchForm.profitAgree || '',
          },
          tag: (
            <RadioGroup>
              <Radio value="YES">有</Radio>
              <Radio value="NO">无</Radio>
              <Radio value="">全部</Radio>
            </RadioGroup>
          ),
        },
      ]
        .filter(
          field => !field.key || (queryJson[field.key] && queryJson[field.key].visibleFlag === 1)
        )
        .map(field => ({
          ...field,
          // dataIndex: queryJson[field.key].fieldKey,
          title: queryJson[field.key].displayName,
          sortNo: queryJson[field.key].sortNo,
          tag: {
            ...field.tag,
            props: {
              ...field.tag.props,
              placeholder: `请输入${queryJson[field.key].displayName}`,
            },
          },
        }))
        .sort((f1, f2) => f1.sortNo - f2.sortNo),
      leftButtons: [
        {
          key: 'edit',
          title: btnJson.edit.buttonName || '修改',
          className: 'tw-btn-primary',
          icon: 'form',
          loading: false,
          hidden: !btnJson.edit.visible,
          disabled: selectedRows =>
            selectedRows.length !== 1 || selectedRows[0].contractStatus === 'APPROVING',
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            // TODO: 激活的合同是否能够修改？(暂时设为能)
            // if (selectedRows[0].contractStatus !== 'CREATE') {
            //   createMessage({ type: 'error', description: '该状态的合同不可修改!' });
            //   return;
            // }
            const { id, mainType, mainContractId, contractNo } = selectedRows[0];
            if (mainType === 'MAIN') {
              router.push(`/sale/contract/salesEdit?id=${id}`);
            } else {
              router.push(
                `/sale/contract/editSub?mainId=${mainContractId}&id=${id}&contractNo=${contractNo}`
              );
            }
          },
        },
        {
          key: 'active',
          title: btnJson.active.buttonName || '激活',
          className: 'tw-btn-info',
          icon: 'check-circle',
          loading: false,
          hidden: !btnJson.active.visible,
          disabled: selectedRowKeys => selectedRowKeys.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            // 合同id、主子类型、合同状态、主合同状态
            const { id, mainType, contractStatus, mainContractStatus } = selectedRows[0];
            // 主子类型为“子合同” ，合同状态为‘新建状态’，并且其主合同状态为‘激活状态’时，可激活合同状态
            if (contractStatus === 'CLOSE') {
              createMessage({ type: 'warn', description: '合同已关闭！' });
              return;
            }
            if (mainType === 'SUB') {
              if (mainContractStatus === 'ACTIVE') {
                if (contractStatus === 'UPDATING') {
                  createMessage({ type: 'warn', description: '修改中的合同不能激活！' });
                  return;
                }
                if (contractStatus === 'PENDING') {
                  dispatch({
                    type: `${DOMAIN}/active`,
                    payload: { id, status: 'ACTIVE', searchForm: queryParams },
                  });
                }
                if (contractStatus === 'CREATE') {
                  router.push(`/sale/contract/subActive?id=${id}`);
                  // dispatch({
                  //   type: `${DOMAIN}/active`,
                  //   payload: { id, status: 'ACTIVE', searchForm: queryParams },

                  // });
                }
                if (contractStatus === 'ACTIVE') {
                  createMessage({ type: 'warn', description: '子合同已激活！' });
                }
                if (contractStatus === 'APPROVING') {
                  createMessage({ type: 'warn', description: '审批中的合同不能激活！' });
                }
              } else {
                createMessage({ type: 'warn', description: '请先激活父合同！' });
              }
            } else {
              // eslint-disable-next-line no-lonely-if
              if (contractStatus === 'ACTIVE') {
                createMessage({ type: 'warn', description: '主合同已激活！' });
              } else {
                dispatch({
                  type: `${DOMAIN}/active`,
                  payload: { id, status: 'ACTIVE', searchForm: queryParams },
                });
              }
            }
          },
        },
        {
          key: 'pend',
          title: btnJson.pend.buttonName || '暂挂',
          className: 'tw-btn-info',
          icon: 'check-circle',
          loading: false,
          hidden: !btnJson.pend.visible,
          disabled: selectedRowKeys => selectedRowKeys.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            // 合同id、主子类型、合同状态、主合同状态
            const { id, mainType, contractStatus, mainContractStatus } = selectedRows[0];
            if (contractStatus === 'ACTIVE') {
              dispatch({
                type: `${DOMAIN}/active`,
                payload: { id, status: 'PENDING', searchForm: queryParams },
              });
            } else {
              createMessage({ type: 'warn', description: '只有激活的合同才可以挂起，请重新选择' });
            }
          },
        },

        {
          key: 'remove',
          title: btnJson.remove.buttonName || '删除',
          className: 'tw-btn-error',
          icon: 'file-excel',
          loading: false,
          hidden: !btnJson.remove.visible,
          disabled: selectedRowKeys => selectedRowKeys.length === 0,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            let flag = true;
            selectedRows.map(v => {
              if (v.contractStatus !== 'CREATE') {
                flag = false;
              }
              return void 0;
            });
            if (!flag) {
              createMessage({ type: 'error', description: '只有新建状态的合同才可删除!' });
              return;
            }
            createConfirm({
              content: '是否确认删除?',
              onOk: () =>
                dispatch({
                  type: `${DOMAIN}/remove`,
                  payload: {
                    ids: selectedRowKeys.join(','),
                    searchForm: queryParams,
                  },
                }),
            });
          },
        },
        {
          key: 'addProject',
          title: btnJson.addProject.buttonName || '创建项目',
          className: 'tw-btn-info',
          icon: 'plus-circle',
          loading: false,
          hidden: !btnJson.addProject.visible,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            this.addProjectEvent(selectedRowKeys, selectedRows, queryParams);
          },
        },

        {
          key: 'addSaleProj',
          title: btnJson.addSaleProj.buttonName || '新建项目采购',
          className: 'tw-btn-info',
          icon: 'plus-circle',
          loading: false,
          hidden: !btnJson.addSaleProj.visible,
          disabled: selectedRows => selectedRows.length !== 1 || selectedRows[0].mainType !== 'SUB',
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            if (isNil(selectedRows[0].projNo)) {
              createMessage({ type: 'warn', description: '合同未关联项目，不能新建项目采购！' });
              return;
            }
            // const { id, mainContractId } = selectedRows[0];
            // router.push(`/sale/contract/purchasesCreate?mainId=${mainContractId}&id=${id}`);
            this.setState({
              visible: true,
            });
          },
        },

        {
          key: 'resetProfitResult',
          title: btnJson.resetProfitResult.buttonName || '清空并重新执行利益分配',
          className: 'tw-btn-info',
          icon: 'check-circle',
          loading: false,
          hidden:
            window.location.pathname.indexOf('sale/contract') > 0 ||
            !btnJson.resetProfitResult.visible,
          disabled: selectedRowKeys => selectedRowKeys.length === 0,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            let flag = true;
            selectedRows.map(v => {
              if (v.contractStatus !== 'ACTIVE') {
                flag = false;
              }
              return void 0;
            });
            if (!flag) {
              createMessage({
                type: 'error',
                description: '只有激活状态的合同才可重新执行利益分配!',
              });
              return;
            }
            dispatch({
              type: `${DOMAIN}/resetProfitResult`,
              payload: {
                ids: selectedRowKeys.join(','),
                searchForm: queryParams,
              },
            });
          },
        },
        // {
        //   key: 'sharingEdit',
        //   title: btnJson.sharingEdit.buttonName || '修改利益分配规则',
        //   className: 'tw-btn-info',
        //   loading: false,
        //   hidden: !btnJson.sharingEdit.visible,
        //   disabled: selectedRows =>
        //     selectedRows.length !== 1 ||
        //     selectedRows[0].mainType !== 'SUB' ||
        //     selectedRows[0].contractStatus === 'APPROVING',
        //   minSelections: 0,
        //   cb: (selectedRowKeys, selectedRows, queryParams) => {
        //     const { mainContractId, id } = selectedRows[0];
        //     router.push(`/sale/contract/salesList/sharingEdit?mainId=${mainContractId}&id=${id}`);
        //   },
        // },
        // {
        //   key: 'distributor',
        //   title: btnJson.distributor.buttonName || '泛用结算分配',
        //   className: 'tw-btn-info',
        //   loading: false,
        //   hidden: !btnJson.distributor.visible,
        //   disabled: selectedRows =>
        //     selectedRows.length !== 1 ||
        //     selectedRows[0].mainType !== 'SUB' ||
        //     selectedRows[0].contractStatus === 'APPROVING',
        //   minSelections: 0,
        //   cb: (selectedRowKeys, selectedRows, queryParams) => {
        //     // 过账操作
        //     const { id } = selectedRows[0];
        //     dispatch({
        //       type: `${DOMAIN}/passAccount`,
        //       payload: {
        //         contractId: id,
        //       },
        //     }).then(res => {
        //       if (res.ok) {
        //         router.push(`/sale/contract/salesList/amtSettleDetail?id=${id}`);
        //       }
        //     });
        //   },
        // },
      ]
        .map(btn => ({
          ...btn,
          sortNo: btnJson[btn.key].sortNo,
        }))
        .sort((b1, b2) => b1.sortNo - b2.sortNo),
      columns: [
        {
          title: '合同编号',
          key: 'contractNo',
          dataIndex: pageFieldJson.contractNo.fieldKey,
          sorter: true,
          align: 'center',
          render: (value, rowData) => {
            const { mainContractId, id } = rowData;
            let href = null;
            if (rowData.mainType === 'MAIN') {
              href = `/sale/contract/salesDetail?id=${id}`;
            } else if (rowData.mainType === 'SUB') {
              href = `/sale/contract/salesSubDetail?mainId=${mainContractId}&id=${id}`;
            }
            return (
              <Link className="tw-link" to={href}>
                {value}
              </Link>
            );
          },
        },
        {
          title: '合同名称',
          key: 'contractName',
          dataIndex: pageFieldJson.contractName.fieldKey,
          sorter: true,
        },
        {
          title: '合同状态',
          key: 'contractStatus',
          dataIndex: 'contractStatusDesc',
          align: 'center',
        },
        {
          title: '合同类型',
          key: 'mainType',
          dataIndex: 'mainTypeDesc',
          align: 'center',
        },
        {
          title: '合同金额',
          key: 'amt',
          dataIndex: 'currAmt',
          align: 'right',
        },
        {
          title: '有效合同额',
          key: 'effectiveAmt',
          dataIndex: 'currEffectiveAmt',
          align: 'right',
        },
        {
          title: '开票金额',
          key: 'invAmt',
          dataIndex: 'currEffectiveInvAmt',
          align: 'right',
          sorter: true,
        },
        {
          title: '收款金额',
          key: 'actualRecvAmt',
          dataIndex: 'currEffectiveActualRecvAmt',
          align: 'right',
        },
        {
          title: '客户名称',
          key: 'custId',
          dataIndex: 'custName',
        },
        {
          title: '销售区域BU',
          key: 'regionBuId',
          dataIndex: 'regionBuName',
        },
        {
          title: '签单BU',
          key: 'signBuId',
          dataIndex: 'buName',
        },
        {
          title: '销售负责人',
          key: 'salesmanResId',
          dataIndex: 'salesmanResName',
          align: 'center',
        },
        {
          title: '签单日期',
          key: 'signDate',
          dataIndex: pageFieldJson.signDate.fieldKey,
          align: 'center',
          sorter: true,
        },
        {
          title: '交付BU',
          key: 'deliBuId',
          dataIndex: 'deliBuName',
          align: 'center',
        },
        {
          title: '交付负责人',
          key: 'deliResId',
          dataIndex: 'deliResName',
          align: 'center',
        },
        {
          title: '售前BU',
          key: 'preSaleBuId',
          dataIndex: 'preSaleBuName',
          align: 'center',
        },
        {
          title: '售前负责人',
          key: 'preSaleResId',
          dataIndex: 'preSaleResName',
          align: 'center',
        },
        {
          title: 'PMO',
          key: 'pmoResId',
          dataIndex: 'pmoResIdName',
          align: 'center',
        },
        {
          title: '参考合同号',
          key: 'userdefinedNo',
          dataIndex: pageFieldJson.userdefinedNo.fieldKey,
          align: 'center',
        },
        {
          title: '相关项目编号',
          key: 'projNo',
          dataIndex: pageFieldJson.projNo.fieldKey,
          align: 'center',
        },
        {
          title: '项目名称',
          key: 'projId',
          dataIndex: 'projName',
          align: 'center',
        },
        {
          title: '销售大类',
          key: 'saleType1',
          dataIndex: 'saleType1Desc',
          align: 'center',
        },
        {
          title: '纸质合同状态',
          key: 'paperStatus',
          dataIndex: 'paperStatusDesc',
          align: 'center',
        },
        {
          title: '纸质合同状态描述',
          key: 'paperDesc',
          dataIndex: 'paperDesc',
          align: 'center',
        },
        {
          title: '创建日期',
          key: 'createTime',
          dataIndex: pageFieldJson.createTime.fieldKey,
          align: 'center',
          sorter: true,
        },
        {
          title: '利益分配规则',
          key: 'profitAgree',
          dataIndex: pageFieldJson.profitAgree.fieldKey,
          align: 'center',
          sorter: false,
        },
      ]
        .filter(
          col => !col.key || (pageFieldJson[col.key] && pageFieldJson[col.key].visibleFlag === 1)
        )
        .map(col => ({
          ...col,
          title: pageFieldJson[col.key].displayName,
          sortNo: pageFieldJson[col.key].sortNo,
        }))
        .sort((f1, f2) => f1.sortNo - f2.sortNo),
    };

    return (
      <PageHeaderWrapper title="创建销售列表">
        <DataTable {...tableProps} />
        <Modal title="业务类型" visible={visible} onOk={this.handleOk} onCancel={this.handleCancel}>
          <Selection.UDC
            value={searchForm.businessType}
            code="TSK:BUSINESS_TYPE"
            filters={[{ sphd1: '2' }]}
            placeholder="请选择业务类型"
            onChange={e => {
              dispatch({
                type: `${DOMAIN}/updateSearchForm`,
                payload: {
                  businessType: e,
                },
              });
            }}
          />
        </Modal>
      </PageHeaderWrapper>
    );
  }
}

export default SaleList;
