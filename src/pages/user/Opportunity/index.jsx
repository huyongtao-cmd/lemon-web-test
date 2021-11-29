import React, { PureComponent } from 'react';
import { Modal, Col, Row, Input, Radio, Select } from 'antd';
import { formatMessage } from 'umi/locale';
import router from 'umi/router';
import Link from 'umi/link';
import { connect } from 'dva';
import { formatDT } from '@/utils/tempUtils/DateTime';
import createMessage from '@/components/core/AlertMessage';
import DataTable from '@/components/common/DataTable';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import SyntheticField from '@/components/common/SyntheticField';
import { mountToTab } from '@/layouts/routerControl';
import { Selection, BuVersion } from '@/pages/gen/field';
import {
  selectIamUsers,
  selectActiveBu,
  selectUsersWithBu,
  selectCoop,
  selectBuProduct,
} from '@/services/gen/list'; // selectIamUsers
import { selectBus } from '@/services/user/management/leads';
import { getBuVersionAndBuParams } from '@/utils/buVersionUtils';

const DOMAIN = 'userOpportunity';
const ACTIVE = 'ACTIVE';
const PENDING = 'PENDING';
const applyColumns = [
  { dataIndex: 'code', title: '编号', span: 12 },
  { dataIndex: 'name', title: '名称', span: 12 },
];

@connect(({ loading, userOpportunity }) => ({
  userOpportunity,
  loading: loading.effects[`${DOMAIN}/query`] || loading.effects[`${DOMAIN}/getPageConfig`],
}))
@mountToTab()
class UserOpportunity extends PureComponent {
  state = {
    visible: false,
    closeReason: null,
    id: null,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const defaultSearchForm = {
      forecastWinDateRange: '0',
      oppoStatusArry: ['0', 'ACTIVE'],
      selectedRowKeys: [],
    };
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'OPPOS_MANAGEMENT_LIST' },
    });
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        searchForm: defaultSearchForm,
        dataSource: [],
        total: 0,
      },
    });
    // this.fetchData({ offset: 0, limit: 10, sortBy: 'id', sortDirection: 'DESC' });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: {
        ...params,
        sortBy: params.sortBy || 'modifyTime',
        sortDirection: params.sortDirection || 'DESC',
        ...getBuVersionAndBuParams(params.signBuId, 'signBuId', 'signBuVersionId'),
        ...getBuVersionAndBuParams(params.preSaleBuId, 'preSaleBuId', 'preSaleBuVersionId'),
        ...getBuVersionAndBuParams(params.deliBuId, 'deliBuId', 'deliBuVersionId'),
        ...getBuVersionAndBuParams(params.coBuId, 'coBuId', 'coBuVersionId'),
        ...getBuVersionAndBuParams(params.codeliBuId, 'codeliBuId', 'codeliBuVersionId'),
        ...getBuVersionAndBuParams(params.internalBuId, 'internalBuId', 'internalBuVersionId'),
      },
    });
  };

  handleSave = () => {
    const { closeReason, id } = this.state;
    const { dispatch } = this.props;

    if (!closeReason) {
      createMessage({ type: 'error', description: '请选择关闭原因' });
      return;
    }
    dispatch({ type: `${DOMAIN}/saveCloseReason`, payload: { id, closeReason } }).then(() => {
      this.toggleVisible();
    });
  };

  toggleVisible = () => {
    const { visible } = this.state;
    this.setState({ visible: !visible });
  };

  render() {
    const {
      dispatch,
      loading,
      userOpportunity: { dataSource, total, searchForm, pageConfig },
    } = this.props;
    const { visible, closeReason } = this.state;

    // 页面配置信息数据处理
    if (!pageConfig.pageBlockViews || pageConfig.pageBlockViews.length < 1) {
      return <div />;
    }
    let currentQueryConfig = [];
    let currentQueryConfig1 = [];
    let currentListConfig = [];
    pageConfig.pageBlockViews.forEach(view => {
      if (view.blockKey === 'OPPOS_MANAGEMENT_LIST') {
        // 商机列表
        currentQueryConfig = view;
      } else if (view.blockKey === 'OPPOS_MANAGEMENT_QUERY') {
        currentQueryConfig1 = view;
      } else if (view.blockKey === 'OPPOS_MANAGEMENT') {
        currentListConfig = view;
      }
    });
    const { pageFieldViews: pageFieldViewsQuery } = currentQueryConfig; // 查询区域
    const { pageFieldViews: pageFieldViewsQuery1 } = currentQueryConfig1; // 查询区域
    const { pageFieldViews: pageFieldViewsList } = currentListConfig; // 列表区域

    const pageFieldJsonQuery = {}; // 查询区域
    const pageFieldJsonList = {}; // 列表区域
    if (pageFieldViewsQuery || pageFieldViewsQuery1) {
      pageFieldViewsQuery.filter(field => field.visibleFlag).forEach(field => {
        pageFieldJsonQuery[field.fieldKey] = field;
      });
      pageFieldViewsQuery1.filter(field => field.visibleFlag).forEach(field => {
        pageFieldJsonQuery[field.fieldKey] = field;
      });
    }
    if (pageFieldViewsList) {
      pageFieldViewsList.forEach(field => {
        pageFieldJsonList[field.fieldKey] = field;
      });
    }
    const {
      oppoName = {},
      oppoStatus = {},
      custName = {},
      oppoLevel = {},
      custRegion = {},
      forecastWinDate = {},
      productIds = {},
      signBuId = {},
      salesmanResId = {},
      coBuId = {},
      deliBuId = {},
      deliResId = {},
      codeliBuId = {},
      internalBuId = {},
      internalResId = {},
      createUserId = {},
      oppoCat1 = {},
      oppoCat2 = {},
      oppoCat3 = {},
      coopId = {},
      preSaleBuId = {},
      preSaleResId = {},
      planningStatus = {},
      custIdst = {},
    } = pageFieldJsonQuery;

    // 按钮的可配置化
    const buttonLists = {};
    if (pageConfig.pageButtonViews && pageConfig.pageButtonViews.length > 0) {
      pageConfig.pageButtonViews.forEach(field => {
        buttonLists[field.buttonKey] = field;
      });
    }
    const tableProps = {
      rowKey: 'id',
      sortBy: 'id',
      sortDirection: 'DESC',
      columnsCache: DOMAIN,
      scroll: { x: 2920 },
      loading,
      total,
      dataSource,
      searchForm,
      rowSelection: {
        type: 'radio',
      },
      onChange: filters => {
        this.fetchData(filters);
      },
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      searchBarForm: [
        signBuId.visibleFlag && {
          title: `${signBuId.displayName}`,
          dataIndex: 'signBuId',
          sortNo: `${signBuId.sortNo}`,
          options: {
            initialValue: searchForm.signBuId,
          },
          tag: <BuVersion />,
        },
        salesmanResId.visibleFlag && {
          title: `${salesmanResId.displayName}`, // 销售负责人
          dataIndex: 'salesmanResId',
          sortNo: `${salesmanResId.sortNo}`,
          options: {
            initialValue: searchForm.salesmanResId,
          },
          tag: (
            <Selection.Columns
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              columns={applyColumns}
              source={() => selectUsersWithBu()}
              placeholder={`请选择${salesmanResId.displayName}`}
              showSearch
            />
          ),
        },
        forecastWinDate.visibleFlag && {
          title: `${forecastWinDate.displayName}`,
          dataIndex: 'forecastWinDateRange',
          sortNo: `${forecastWinDate.sortNo}`,
          options: {
            initialValue: searchForm.forecastWinDateRange,
          },
          tag: (
            <Select allowClear>
              <Select.Option value="0">3个月内</Select.Option>
              <Select.Option value="1">3-6个月</Select.Option>
              <Select.Option value="2">6个月以上</Select.Option>
            </Select>
          ),
        },
        preSaleBuId.visibleFlag && {
          title: `${preSaleBuId.displayName}`,
          dataIndex: 'preSaleBuId',
          sortNo: `${preSaleBuId.sortNo}`,
          options: {
            initialValue: searchForm.preSaleBuId,
          },
          tag: <BuVersion />,
        },
        preSaleResId.visibleFlag && {
          title: `${preSaleResId.displayName}`, // 销售负责人
          dataIndex: 'preSaleResId',
          sortNo: `${preSaleResId.sortNo}`,
          options: {
            initialValue: searchForm.preSaleResId,
          },
          tag: (
            <Selection.Columns
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              columns={applyColumns}
              source={() => selectUsersWithBu()}
              placeholder={`请选择${preSaleResId.displayName}`}
              showSearch
            />
          ),
        },
        deliBuId.visibleFlag && {
          title: `${deliBuId.displayName}`,
          dataIndex: 'deliBuId',
          sortNo: `${deliBuId.sortNo}`,
          options: {
            initialValue: searchForm.deliBuId,
          },
          tag: <BuVersion />,
        },
        deliResId.visibleFlag && {
          title: `${deliResId.displayName}`,
          dataIndex: 'deliResId',
          sortNo: `${deliResId.sortNo}`,
          options: {
            initialValue: searchForm.deliResId,
          },
          tag: (
            <Selection.Columns
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              columns={applyColumns}
              source={() => selectUsersWithBu()}
              placeholder={`请选择${deliResId.displayName}`}
              showSearch
            />
          ),
        },
        planningStatus.visibleFlag && {
          title: `${planningStatus.displayName}`,
          dataIndex: 'planningStatus',
          sortNo: `${planningStatus.sortNo}`,
          options: {
            initialValue: searchForm.planningStatus,
          },
          tag: (
            <Select allowClear>
              <Select.Option value="2">未填</Select.Option>
              <Select.Option value="0">正常</Select.Option>
              <Select.Option value="1">预计成单日期变更</Select.Option>
            </Select>
          ),
        },
        custRegion.visibleFlag && {
          title: `${custRegion.displayName}`,
          dataIndex: 'custRegion',
          sortNo: `${custRegion.sortNo}`,
          options: {
            initialValue: searchForm.custRegion,
          },
          tag: <Selection.UDC code="TSK:CUST_REGION" />,
        },
        oppoName.visibleFlag && {
          title: `${oppoName.displayName}`,
          dataIndex: 'oppoName',
          sortNo: `${oppoName.sortNo}`,
          options: {
            initialValue: searchForm.oppoName,
          },
          tag: <Input placeholder={`请输入${oppoName.displayName}`} />,
        },
        oppoStatus.visibleFlag && {
          title: `${oppoStatus.displayName}`,
          dataIndex: 'oppoStatusArry',
          sortNo: `${oppoStatus.sortNo}`,
          options: {
            initialValue: searchForm.oppoStatusArry,
          },
          tag: (
            <SyntheticField className="tw-field-group">
              <Radio.Group className="tw-field-group-filter" buttonStyle="solid">
                <Radio.Button value="0">=</Radio.Button>
                <Radio.Button value="1">≠</Radio.Button>
              </Radio.Group>
              <Selection.UDC
                className="tw-field-group-field"
                code="TSK.OPPO_STATUS"
                placeholder={`请选择${oppoStatus.displayName}`}
                showSearch
              />
            </SyntheticField>
          ),
        },
        custName.visibleFlag && {
          title: `${custName.displayName}`,
          dataIndex: 'custName',
          sortNo: `${custName.sortNo}`,
          options: {
            initialValue: searchForm.custName,
          },
          tag: <Input placeholder={`请输入${custName.displayName}`} />,
        },
        createUserId.visibleFlag && {
          title: `${createUserId.displayName}`,
          dataIndex: 'createUserId',
          sortNo: `${createUserId.sortNo}`,
          options: {
            initialValue: searchForm.createUserId,
          },
          tag: (
            <Selection
              source={() => selectIamUsers()}
              placeholder={`请选择${createUserId.displayName}`}
            />
          ),
        },
        oppoLevel.visibleFlag && {
          title: `${oppoLevel.displayName}`,
          dataIndex: 'oppoLevel',
          sortNo: `${oppoLevel.sortNo}`,
          tag: (
            <Selection.UDC code="TSK.OPPO_LEVEL" placeholder={`请选择${oppoLevel.displayName}`} />
          ),
        },
        productIds.visibleFlag && {
          title: `${productIds.displayName}`,
          dataIndex: 'prodId',
          sortNo: `${productIds.sortNo}`,
          options: {
            initialValue: searchForm.prodId,
          },
          tag: (
            <Selection
              source={() => selectBuProduct()}
              placeholder={`请选择${productIds.displayName}`}
            />
          ),
        },
        coopId.visibleFlag && {
          title: `${coopId.displayName}`,
          dataIndex: 'coopId',
          sortNo: `${coopId.sortNo}`,
          options: {
            initialValue: searchForm.coopId,
          },
          tag: (
            <Selection source={() => selectCoop()} placeholder={`请选择${coopId.displayName}`} />
          ),
        },
        oppoCat1.visibleFlag && {
          title: `${oppoCat1.displayName}`,
          dataIndex: 'oppoCat1',
          sortNo: `${oppoCat1.sortNo}`,
          options: {
            initialValue: searchForm.oppoCat1,
          },
          tag: <Input placeholder="请输入产品厂商渠道负责人" />,
        },
        oppoCat2.visibleFlag && {
          title: `${oppoCat2.displayName}`,
          dataIndex: 'oppoCat2',
          sortNo: `${oppoCat2.sortNo}`,
          options: {
            initialValue: searchForm.oppoCat2,
          },
          tag: <Input placeholder="请输入产品厂商区域负责人" />,
        },
        oppoCat3.visibleFlag && {
          title: `${oppoCat3.displayName}`,
          dataIndex: 'oppoCat3',
          sortNo: `${oppoCat3.sortNo}`,
          options: {
            initialValue: searchForm.oppoCat3,
          },
          tag: <Input placeholder="请输入产品厂商销售负责人" />,
        },
        coBuId.visibleFlag && {
          title: `${coBuId.displayName}`,
          dataIndex: 'coBuId',
          sortNo: `${coBuId.sortNo}`,
          options: {
            initialValue: searchForm.coBuId,
          },
          tag: <BuVersion />,
        },
        codeliBuId.visibleFlag && {
          title: `${codeliBuId.displayName}`,
          dataIndex: 'codeliBuId',
          sortNo: `${codeliBuId.sortNo}`,
          options: {
            initialValue: searchForm.codeliBuId,
          },
          tag: <BuVersion />,
        },
        internalBuId.visibleFlag && {
          title: `${internalBuId.displayName}`,
          dataIndex: 'internalBuId',
          sortNo: `${internalBuId.sortNo}`,
          options: {
            initialValue: searchForm.internalBuId,
          },
          tag: <BuVersion />,
        },
        internalResId.visibleFlag && {
          title: `${internalResId.displayName}`,
          dataIndex: 'internalResId',
          sortNo: `${internalResId.sortNo}`,
          options: {
            initialValue: searchForm.internalResId,
          },
          tag: (
            <Selection.Columns
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              columns={applyColumns}
              source={() => selectUsersWithBu()}
              placeholder={`请选择${internalResId.displayName}`}
              showSearch
            />
          ),
        },
        custIdst.visibleFlag && {
          title: `${custIdst.displayName}`,
          dataIndex: 'custIdst',
          sortNo: `${custIdst.sortNo}`,
          options: {
            initialValue: searchForm.custIdst,
          },
          tag: <Selection.UDC code="TSK.OU_IDST" />,
        },
      ]
        .filter(Boolean)
        .sort((field1, field2) => field1.sortNo - field2.sortNo),
      columns: [
        pageFieldJsonList.leadsNo.visibleFlag && {
          title: `${pageFieldJsonList.leadsNo.displayName}`,
          dataIndex: 'leadsNo',
          sortNo: `${pageFieldJsonList.leadsNo.sortNo}`,
          align: 'center',
          sorter: true,
          width: 200,
          render: (value, row, key) => (
            <Link className="tw-link" to={`/sale/management/oppsdetail?id=${row.id}`}>
              {value}
            </Link>
          ),
        },
        pageFieldJsonList.oppoName.visibleFlag && {
          title: `${pageFieldJsonList.oppoName.displayName}`,
          dataIndex: 'oppoName',
          sortNo: `${pageFieldJsonList.oppoName.sortNo}`,
          sorter: true,
          // width: '7%',
        },
        pageFieldJsonList.custName.visibleFlag && {
          title: `${pageFieldJsonList.custName.displayName}`,
          dataIndex: 'custName',
          sortNo: `${pageFieldJsonList.custName.sortNo}`,
          // width: '9%',
        },
        pageFieldJsonList.oppoLevel.visibleFlag && {
          title: `${pageFieldJsonList.oppoLevel.displayName}`,
          dataIndex: 'oppoLevelDesc',
          sortNo: `${pageFieldJsonList.oppoLevel.sortNo}`,
          align: 'center',
          width: 100,
        },
        pageFieldJsonList.probability.visibleFlag && {
          title: `${pageFieldJsonList.probability.displayName}`,
          dataIndex: 'probabilityDesc',
          sortNo: `${pageFieldJsonList.probability.sortNo}`,
          align: 'center',
          width: 100,
        },
        pageFieldJsonList.forecastWinDate.visibleFlag && {
          title: `${pageFieldJsonList.forecastWinDate.displayName}`,
          dataIndex: 'forecastWinDate',
          sortNo: `${pageFieldJsonList.forecastWinDate.sortNo}`,
          width: 150,
          render: value => formatDT(value),
        },
        pageFieldJsonList.forecastAmount.visibleFlag && {
          title: `${pageFieldJsonList.forecastAmount.displayName}`,
          dataIndex: 'forecastAmount',
          sortNo: `${pageFieldJsonList.forecastAmount.sortNo}`,
          align: 'right',
          width: 120,
        },
        pageFieldJsonList.custRegion.visibleFlag && {
          title: `${pageFieldJsonList.custRegion.displayName}`,
          dataIndex: 'custRegionDesc',
          sortNo: `${pageFieldJsonList.custRegion.sortNo}`,
          align: 'center',
          width: 100,
        },
        pageFieldJsonList.signBuId.visibleFlag && {
          title: `${pageFieldJsonList.signBuId.displayName}`,
          dataIndex: 'signBuName',
          sortNo: `${pageFieldJsonList.signBuId.sortNo}`,
          width: 120,
        },
        pageFieldJsonList.salesmanResId.visibleFlag && {
          title: `${pageFieldJsonList.salesmanResId.displayName}`,
          dataIndex: 'salesmanName',
          sortNo: `${pageFieldJsonList.salesmanResId.sortNo}`,
          width: 120,
        },
        pageFieldJsonList.preSaleBuId.visibleFlag && {
          title: `${pageFieldJsonList.preSaleBuId.displayName}`,
          dataIndex: 'preSaleBuName',
          sortNo: `${pageFieldJsonList.preSaleBuId.sortNo}`,
          width: 120,
        },
        pageFieldJsonList.preSaleResId.visibleFlag && {
          title: `${pageFieldJsonList.preSaleResId.displayName}`,
          sortNo: `${pageFieldJsonList.preSaleResId.sortNo}`,
          dataIndex: 'preSaleResName',
          width: 120,
        },
        pageFieldJsonList.solutionDifficulty.visibleFlag && {
          title: `${pageFieldJsonList.solutionDifficulty.displayName}`,
          dataIndex: 'solutionDifficultyName',
          sortNo: `${pageFieldJsonList.solutionDifficulty.sortNo}`,
          width: 120,
        },
        pageFieldJsonList.solutionImportance.visibleFlag && {
          title: `${pageFieldJsonList.solutionImportance.displayName}`,
          dataIndex: 'solutionImportanceName',
          sortNo: `${pageFieldJsonList.solutionImportance.sortNo}`,
          width: 120,
        },
        pageFieldJsonList.deliBuId.visibleFlag && {
          title: `${pageFieldJsonList.deliBuId.displayName}`,
          dataIndex: 'deliBuName',
          sortNo: `${pageFieldJsonList.deliBuId.sortNo}`,
          width: 100,
        },
        pageFieldJsonList.deliResId.visibleFlag && {
          title: `${pageFieldJsonList.deliResId.displayName}`,
          dataIndex: 'deliResName',
          sortNo: `${pageFieldJsonList.deliResId.sortNo}`,
          width: 120,
        },
        pageFieldJsonList.projectDifficult.visibleFlag && {
          title: `${pageFieldJsonList.projectDifficult.displayName}`,
          dataIndex: 'projectDifficultName',
          sortNo: `${pageFieldJsonList.projectDifficult.sortNo}`,
          width: 100,
        },
        pageFieldJsonList.projectImportance.visibleFlag && {
          title: `${pageFieldJsonList.projectImportance.displayName}`,
          dataIndex: 'projectImportanceName',
          sortNo: `${pageFieldJsonList.projectImportance.sortNo}`,
          width: 120,
        },
        pageFieldJsonList.createUserId.visibleFlag && {
          title: `${pageFieldJsonList.createUserId.displayName}`,
          dataIndex: 'createUserName',
          sortNo: `${pageFieldJsonList.createUserId.sortNo}`,
          width: 100,
        },
        pageFieldJsonList.createTime.visibleFlag && {
          title: `${pageFieldJsonList.createTime.displayName}`,
          dataIndex: 'createTime',
          sortNo: `${pageFieldJsonList.createTime.sortNo}`,
          width: 120,
          render: value => formatDT(value),
        },
        pageFieldJsonList.oppoStatus.visibleFlag && {
          title: `${pageFieldJsonList.oppoStatus.displayName}`,
          dataIndex: 'oppoStatusDesc',
          sortNo: `${pageFieldJsonList.oppoStatus.sortNo}`,
          align: 'center',
          width: 100,
        },
        pageFieldJsonList.currCode.visibleFlag && {
          title: `${pageFieldJsonList.currCode.displayName}`,
          dataIndex: 'currCodeName',
          sortNo: `${pageFieldJsonList.currCode.sortNo}`,
          align: 'center',
          width: 90,
        },
        pageFieldJsonList.salePhase.visibleFlag && {
          title: `${pageFieldJsonList.salePhase.displayName}`,
          dataIndex: 'salePhaseDesc',
          sortNo: `${pageFieldJsonList.salePhase.sortNo}`,
          align: 'center',
          width: 100,
        },
        pageFieldJsonList.productIds.visibleFlag && {
          title: `${pageFieldJsonList.productIds.displayName}`,
          dataIndex: 'prodNames',
          sortNo: `${pageFieldJsonList.productIds.sortNo}`,
          align: 'center',
        },
        pageFieldJsonList.coopId.visibleFlag && {
          title: `${pageFieldJsonList.coopId.displayName}`,
          dataIndex: 'coopName',
          sortNo: `${pageFieldJsonList.coopId.sortNo}`,
          align: 'center',
        },
        pageFieldJsonList.oppoCat1.visibleFlag && {
          title: `${pageFieldJsonList.oppoCat1.displayName}`,
          dataIndex: 'oppoCat1',
          sortNo: `${pageFieldJsonList.oppoCat1.sortNo}`,
          width: 100,
        },
        pageFieldJsonList.oppoCat2.visibleFlag && {
          title: `${pageFieldJsonList.oppoCat2.displayName}`,
          dataIndex: 'oppoCat2',
          sortNo: `${pageFieldJsonList.oppoCat2.sortNo}`,
          width: 100,
        },
        pageFieldJsonList.oppoCat3.visibleFlag && {
          title: `${pageFieldJsonList.oppoCat3.displayName}`,
          dataIndex: 'oppoCat3',
          sortNo: `${pageFieldJsonList.oppoCat3.sortNo}`,
          width: 100,
        },
        pageFieldJsonList.coBuId.visibleFlag && {
          title: `${pageFieldJsonList.coBuId.displayName}`,
          dataIndex: 'coBuName',
          sortNo: `${pageFieldJsonList.coBuId.sortNo}`,
          width: 120,
        },
        pageFieldJsonList.codeliBuId.visibleFlag && {
          title: `${pageFieldJsonList.codeliBuId.displayName}`,
          dataIndex: 'codeliBuName',
          sortNo: `${pageFieldJsonList.codeliBuId.sortNo}`,
          width: 100,
        },
        pageFieldJsonList.internalBuId.visibleFlag && {
          title: `${pageFieldJsonList.internalBuId.displayName}`,
          dataIndex: 'internalBuName',
          sortNo: `${pageFieldJsonList.internalBuId.sortNo}`,
          width: 100,
        },
        pageFieldJsonList.internalResId.visibleFlag && {
          title: `${pageFieldJsonList.internalResId.displayName}`,
          dataIndex: 'internalResName',
          sortNo: `${pageFieldJsonList.internalResId.sortNo}`,
          width: 120,
        },
        pageFieldJsonList.modifyTime.visibleFlag && {
          title: `${pageFieldJsonList.modifyTime.displayName}`,
          dataIndex: 'modifyTime',
          sortNo: `${pageFieldJsonList.modifyTime.sortNo}`,
          width: 120,
        },
        pageFieldJsonList.custIdst.visibleFlag && {
          title: `${pageFieldJsonList.custIdst.displayName}`,
          dataIndex: 'custIdstDesc',
          sortNo: `${pageFieldJsonList.custIdst.sortNo}`,
        },
      ]
        .filter(Boolean)
        .sort((field1, field2) => field1.sortNo - field2.sortNo),
      leftButtons: [
        buttonLists.edit.visible && {
          key: 'edit',
          className: 'tw-btn-primary',
          title: `${buttonLists.edit.buttonName}`,
          icon: 'form',
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            if (selectedRows[0].oppoStatus === ACTIVE) {
              router.push(
                `/sale/management/oppsedit?id=${selectedRowKeys[0]}&mode=update&tab=basic&page=opps`
              );
            } else {
              createMessage({ type: 'warn', description: '仅激活的商机能够修改' });
            }
          },
        },
        buttonLists.resPlanning.visible && {
          key: 'resPlanning',
          className: 'tw-btn-primary',
          title: `${buttonLists.resPlanning.buttonName}`,
          icon: 'form',
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            // console.log(selectedRows[0].id);
            router.push(`/user/project/projectResPlanning?id=${selectedRows[0].id}&planType=1`);
          },
        },
        buttonLists.createContract.visible && {
          key: 'createContract',
          className: 'tw-btn-primary',
          title: `${buttonLists.createContract.buttonName}`,
          icon: 'form',
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            if (selectedRows[0].oppoStatus === ACTIVE) {
              router.push(`/sale/contract/salesCreate?leadId=${selectedRowKeys[0]}`);
            } else {
              createMessage({ type: 'warn', description: '仅激活的商机能够创建合同' });
            }
          },
        },
        buttonLists.active.visible && {
          key: 'active',
          className: 'tw-btn-info',
          // title: row.oppoStatus === ACTIVE ? '暂挂': formatMessage({ id: `misc.active`, desc: '激活' }),
          title: `${buttonLists.active.buttonName}`,
          icon: 'tag',
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const status = selectedRows[0].oppoStatus;
            if (status === ACTIVE || status === PENDING) {
              dispatch({
                type: `${DOMAIN}/updateOppoStatus`,
                payload: { id: selectedRowKeys[0], status, queryParams },
              });
            } else {
              createMessage({ type: 'warn', description: '该商机不符合操作条件' });
            }
          },
        },
        buttonLists.reStart.visible && {
          key: 'reStart',
          className: 'tw-btn-info',
          title: `${buttonLists.reStart.buttonName}`,
          icon: 'redo',
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const status = selectedRows[0].oppoStatus;
            // 只有关闭状态的合同才能重新打开
            if (status === 'CLOSE') {
              dispatch({
                type: `${DOMAIN}/reStartOppoStatus`,
                payload: { id: selectedRowKeys[0], queryParams },
              });
            } else {
              createMessage({ type: 'warn', description: '该商机不符合操作条件' });
            }
          },
        },
        buttonLists.remove.visible && {
          key: 'remove',
          className: 'tw-btn-error',
          title: `${buttonLists.remove.buttonName}`,
          icon: 'file-excel',
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            if (selectedRows[0].oppoStatus === ACTIVE) {
              this.setState({ id: selectedRowKeys[0] });
              this.toggleVisible();
            } else {
              createMessage({ type: 'warn', description: '仅激活的商机能够关闭' });
            }
          },
        },
      ]
        .filter(Boolean)
        .sort((field1, field2) => field1.sortNo - field2.sortNo),
    };

    return (
      <PageHeaderWrapper title="商机管理">
        <DataTable {...tableProps} />
        <Modal
          destroyOnClose
          title="关闭商机"
          visible={visible}
          onOk={this.handleSave}
          onCancel={this.toggleVisible}
          width="50%"
        >
          <Row type="flex" justify="center" align="middle">
            <Col span={4}>关闭原因：</Col>
            <Col span={8}>
              <Selection.UDC
                name="closeReason"
                value={closeReason}
                code="TSK.OPPO_CLOSE_REASON"
                onChange={value => {
                  this.setState({ closeReason: value });
                }}
              />
            </Col>
          </Row>
        </Modal>
      </PageHeaderWrapper>
    );
  }
}

export default UserOpportunity;
