import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Input, Modal, DatePicker, TreeSelect } from 'antd';
// import { formatMessage } from 'umi/locale';
import Link from 'umi/link';
import router from 'umi/router';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { Selection } from '@/pages/gen/field';
import { createConfirm } from '@/components/core/Confirm';
import { selectUsersWithBu, selectAbOus, selectAllAbOu } from '@/services/gen/list';
import { queryUdc } from '@/services/gen/app';
import createMessage from '@/components/core/AlertMessage';
import moment from 'moment';

const DOMAIN = 'salePurchaseAgreementsList';
const applyColumns = [
  { dataIndex: 'code', title: '编号', span: 10 },
  { dataIndex: 'name', title: '名称', span: 14 },
];

@connect(({ loading, salePurchaseAgreementsList, dispatch }) => ({
  dispatch,
  loading:
    loading.effects[`${DOMAIN}/queryList`] ||
    loading.effects[`${DOMAIN}/active`] ||
    loading.effects[`${DOMAIN}/pending`] ||
    loading.effects[`${DOMAIN}/over`] ||
    loading.effects[`${DOMAIN}/remove`] ||
    loading.effects[`${DOMAIN}/getPageConfig`] ||
    loading.effects[`${DOMAIN}/fetchPrincipal`] ||
    false,
  salePurchaseAgreementsList,
}))
// @mountToTab()
class PurchasesList extends PureComponent {
  state = {
    closeId: null,
    closeNo: null,
    closeReasonVisible: false,
    closeReason: '',
    sceneVisible: false,
    sceneList: [],
    sceneCode:null,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/clear`,
    });
    this.fetchData();
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: {
        pageNo: 'PURCHASE_AGREEMENT_LIST',
      },
    });
    dispatch({
      type: `${DOMAIN}/fetchPrincipal`,
    });
    this.fetchSceneData();
  }
  fetchSceneData = () => {
    queryUdc('TSK:SCENE_TYPE').then(resp => {
      const sceneList = resp.response || [];
      this.setState({
        sceneList,
        sceneListTmp: sceneList,
      });
    });
  };

  fetchData = async (params = {}) => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/queryList`,
      payload: {
        ...params,
        createTime: undefined,
        signDate: undefined,
        createTimeStart:
          params.createTime && params.createTime[0]
            ? params.createTime[0].format('YYYY-MM-DD')
            : undefined,
        createTimeEnd:
          params.createTime && params.createTime[1]
            ? params.createTime[1].format('YYYY-MM-DD')
            : undefined,
        signDateStart:
          params.signDate && params.signDate[0]
            ? params.signDate[0].format('YYYY-MM-DD')
            : undefined,
        signDateEnd:
          params.signDate && params.signDate[1]
            ? params.signDate[1].format('YYYY-MM-DD')
            : undefined,
      },
    });
  };

  handleCloseOk = () => {
    const { dispatch } = this.props;
    const { closeId, closeNo, closeReason } = this.state;
    dispatch({
      type: `${DOMAIN}/over`,
      payload: {
        id: closeId,
        purchaseAgreementNo: closeNo,
        overWhy: closeReason,
      },
    }).then(() => {
      this.setState({
        closeReasonVisible: false,
        closeId: null,
        closeNo: null,
        closeReason: '',
      });
    });
  };

  handleCloseCancel = () => {
    this.setState({
      closeReasonVisible: false,
      closeId: null,
      closeNo: null,
      closeReason: '',
    });
  };

  scenePayment = () => {
    const { sceneCode, selectedRow } = this.state;
    const { purchaseAgreementNo } = selectedRow;
    if (!sceneCode) {
      createMessage({ type: 'warn', description: '请选择业务场景' });
      return;
    }
    router.push(
      `/sale/purchaseContract/paymentApplyList/edit?docNo=${purchaseAgreementNo}&scene=${sceneCode}&mode=create`
    );
    this.setState({
      sceneCode: null,
      selectedRow: {},
      sceneVisible: false,
    });
  };

  paymentLaunch = rowData => {
    const { sceneListTmp = [] } = this.state;
    let newSceneList = [];
    if (rowData.agreementStatus === 'ACTIVE') {
      const {
        agreementType,
        acceptanceType,
        purchaseAgreementNo,
        agreementTypeDesc,
        acceptanceTypeDesc,
      } = rowData;
      const paymentType1 = agreementType === 'PUBLIC_RES_OUT' && acceptanceType === 'WITHDRAWAL'; // 对公资源+提现申请
      const paymentType2 = agreementType === 'PUBLIC_RES_OUT' && acceptanceType === 'ATTRIBUTION'; // 对公资源+归属协议
      const paymentType3 =
        agreementType === 'INDIVIDUAL_RES_OUT' && acceptanceType === 'WITHDRAWAL'; // 个体资源外包+提现申请
      const paymentType4 = agreementType === 'OTHER_AGREEMENT'; // 其它类协议

      if (paymentType4 || paymentType1 || paymentType2 || paymentType3) {
        // 做一个业务场景列表数据的过滤
        if (paymentType1) {
          newSceneList = sceneListTmp.filter(item => parseInt(item.code, 10) === 6) || [];
        }
        if (paymentType2) {
          newSceneList = sceneListTmp.filter(item => parseInt(item.code, 10) === 7) || [];
        }
        if (paymentType3) {
          newSceneList =
            sceneListTmp.filter(
              item => parseInt(item.code, 10) === 5 || parseInt(item.code, 10) === 8
            ) || [];
        }
        if (paymentType4) {
          newSceneList = sceneListTmp.filter(item => parseInt(item.code, 10) === 16) || [];
        }

        this.setState({
          sceneVisible: true,
          selectedRow: rowData,
          sceneList: newSceneList,
          sceneCode:newSceneList&&newSceneList.length===1?newSceneList[0].code:null
        });
      } else {
        createMessage({
          type: 'warn',
          description: `【${agreementTypeDesc}】类型的协议验收方式为${acceptanceTypeDesc}时无法发起付款`,
        });
      }
    } else {
      createMessage({ type: 'warn', description: '采购协议状态为激活时才允许发起付款' });
    }
  };

  render() {
    const {
      dispatch,
      loading,
      salePurchaseAgreementsList: { listData: dataSource, total, searchForm, pageConfig },
    } = this.props;

    // 页面配置数据处理
    if (!pageConfig.pageBlockViews || pageConfig.pageBlockViews.length < 1) {
      return <div />;
    }
    const currentBlockConfig = pageConfig.pageBlockViews.find(
      item => item.blockKey === 'PUR_AGREEMENT_LIST'
    );
    const searchBlockConfig = pageConfig.pageBlockViews.find(
      item => item.blockKey === 'PUR_AGREEMENT_CONDITIONS'
    );
    const { pageFieldViews } = currentBlockConfig;
    const pageFieldJson = {};
    pageFieldViews.forEach(field => {
      pageFieldJson[field.fieldKey] = field;
    });
    const searchFieldJson = {};
    searchBlockConfig.pageFieldViews.forEach(field => {
      searchFieldJson[field.fieldKey] = field;
    });
    const columnsFields = [
      {
        title: `${pageFieldJson.purchaseAgreementNo.displayName}`,
        sortNo: `${pageFieldJson.purchaseAgreementNo.sortNo}`,
        key: 'purchaseAgreementNo',
        dataIndex: 'purchaseAgreementNo',
        width: 200,
        render: (value, row) => {
          const { id } = row;
          const href = `/sale/purchaseContract/purchaseAgreementDetail?id=${id}`;
          return (
            <Link className="tw-link" to={href}>
              {value}
            </Link>
          );
        },
      },
      {
        title: `${pageFieldJson.purchaseAgreementName.displayName}`,
        sortNo: `${pageFieldJson.purchaseAgreementName.sortNo}`,
        key: 'purchaseAgreementName',
        dataIndex: 'purchaseAgreementName',
        align: 'center',
        width: 300,
      },
      {
        title: `${pageFieldJson.agreementStatus.displayName}`,
        sortNo: `${pageFieldJson.agreementStatus.sortNo}`,
        key: 'agreementStatus',
        dataIndex: 'agreementStatusDesc',
        align: 'center',
        width: 160,
      },
      {
        title: `${pageFieldJson.supplierLegalNo.displayName}`,
        sortNo: `${pageFieldJson.supplierLegalNo.sortNo}`,
        key: 'supplierLegalNo',
        dataIndex: 'supplierLegalDesc',
        align: 'center',
        width: 260,
      },
      {
        title: `${pageFieldJson.signingLegalNo.displayName}`,
        sortNo: `${pageFieldJson.signingLegalNo.sortNo}`,
        key: 'signingLegalNo',
        dataIndex: 'signingLegalDesc',
        align: 'center',
        width: 260,
      },
      {
        title: `${pageFieldJson.signingBuId.displayName}`,
        sortNo: `${pageFieldJson.signingBuId.sortNo}`,
        key: 'signingBuId',
        dataIndex: 'signingBuDesc',
        align: 'center',
        width: 200,
      },
      {
        title: `${pageFieldJson.purchaseInchargeResId.displayName}`,
        sortNo: `${pageFieldJson.purchaseInchargeResId.sortNo}`,
        key: 'purchaseInchargeResId',
        dataIndex: 'purchaseInchargeResName',
        align: 'center',
        width: 120,
      },
      {
        title: `${pageFieldJson.acceptanceType.displayName}`,
        sortNo: `${pageFieldJson.acceptanceType.sortNo}`,
        key: 'acceptanceType',
        dataIndex: 'acceptanceTypeDesc',
        align: 'center',
        width: 120,
      },
      {
        title: `${pageFieldJson.amt.displayName}`,
        sortNo: `${pageFieldJson.amt.sortNo}`,
        key: 'amt',
        dataIndex: 'amt',
        // align: 'center',
        width: 150,
      },
      {
        title: `${pageFieldJson.currCode.displayName}`,
        sortNo: `${pageFieldJson.currCode.sortNo}`,
        key: 'currCode',
        dataIndex: 'currCodeDesc',
        align: 'center',
        width: 120,
      },
      {
        title: `${pageFieldJson.effectiveStartDate.displayName}`,
        sortNo: `${pageFieldJson.effectiveStartDate.sortNo}`,
        key: 'effectiveStartDate',
        dataIndex: 'effectiveStartDate',
        align: 'center',
        width: 120,
        render: value => (value ? moment(value).format('YYYY-MM-DD') : null),
      },
      {
        title: `${pageFieldJson.effectiveEndDate.displayName}`,
        sortNo: `${pageFieldJson.effectiveEndDate.sortNo}`,
        key: 'effectiveEndDate',
        dataIndex: 'effectiveEndDate',
        align: 'center',
        width: 120,
        render: value => (value ? moment(value).format('YYYY-MM-DD') : null),
      },
      {
        title: `${pageFieldJson.createUserId.displayName}`,
        sortNo: `${pageFieldJson.createUserId.sortNo}`,
        key: 'createUserId',
        dataIndex: 'createUserName',
        align: 'center',
        width: 120,
      },
      {
        title: `${pageFieldJson.createTime.displayName}`,
        sortNo: `${pageFieldJson.createTime.sortNo}`,
        key: 'createTime',
        dataIndex: 'createTime',
        align: 'center',
        width: 120,
        render: value => (value ? moment(value).format('YYYY-MM-DD') : null),
      },
    ];
    const columnsFilterList = columnsFields.filter(
      field => !field.key || pageFieldJson[field.key].visibleFlag === 1
    );
    const searchFields = [
      {
        key: 'purchaseAgreementNo',
        title: '采购协议',
        dataIndex: 'purchaseAgreementNo',
        options: {
          initialValue: searchForm.purchaseAgreementNo,
        },
        tag: <Input placeholder="请输入采购协议名称/编号" />,
      },
      {
        key: 'agreementType',
        title: '协议类型',
        dataIndex: 'agreementType',
        options: {
          initialValue: searchForm.agreementType,
        },
        tag: <Selection.UDC code="TSK:AGREEMENT_TYPE" placeholder="请选择协议类型" />,
      },
      {
        key: 'signDate',
        title: '签约日期',
        dataIndex: 'signDate',
        options: {
          initialValue: searchForm.signDate,
        },
        tag: (
          <DatePicker.RangePicker
            className="x-fill-100"
            format="YYYY-MM-DD"
            placeholder={['开始日期', '结束日期']}
          />
        ),
      },
      {
        key: 'agreementStatus',
        title: '协议状态',
        dataIndex: 'agreementStatus',
        options: {
          initialValue: searchForm.agreementStatus,
        },
        tag: (
          <Selection.UDC
            allowedOptions={searchFieldJson.agreementStatus.permissionValues}
            code="ACC:CONTRACT_STATUS"
            placeholder="请选择协议状态"
          />
        ),
      },
      {
        key: 'supplierLegalNo',
        title: '供应商',
        dataIndex: 'supplierLegalNo',
        options: {
          initialValue: searchForm.supplierLegalNo,
        },
        tag: (
          <Selection.Columns
            columns={applyColumns}
            source={() => selectAllAbOu()}
            placeholder="请选择供应商"
            showSearch
          />
        ),
      },
      {
        key: 'signingLegalNo',
        title: '签约公司',
        dataIndex: 'signingLegalNo',
        options: {
          initialValue: searchForm.signingLegalNo,
        },
        tag: (
          <Selection.Columns
            // transfer={{ key: 'id', code: 'id', name: 'name' }}
            columns={applyColumns}
            source={() => selectAbOus()}
            placeholder="请选择签约公司"
            showSearch
          />
        ),
      },
      {
        key: 'signingBuId',
        title: '签约BU',
        dataIndex: 'signingBuId',
        options: {
          initialValue: searchForm.signingBuId,
        },
        tag: <Selection.ColumnsForBu placeholder="请选择签约BU" />,
      },
      {
        key: 'acceptanceType',
        title: '验收方式',
        dataIndex: 'acceptanceType',
        options: {
          initialValue: searchForm.acceptanceType,
        },
        tag: <Selection.UDC code="TSK:ACCEPTANCE_TYPE" placeholder="请选择验收方式" />,
      },
      {
        key: 'createUserId',
        title: '创建人',
        dataIndex: 'createUserId',
        options: {
          initialValue: searchForm.createUserId,
        },
        tag: (
          <Selection.Columns
            columns={applyColumns}
            source={() => selectUsersWithBu()}
            transfer={{ key: 'id', code: 'id', name: 'name' }}
            placeholder="请选择创建人"
            showSearch
          />
        ),
      },
      {
        key: 'createTime',
        title: '创建日期',
        dataIndex: 'createTime',
        options: {
          initialValue: searchForm.createTime,
        },
        tag: (
          <DatePicker.RangePicker
            className="x-fill-100"
            format="YYYY-MM-DD"
            placeholder={['开始日期', '结束日期']}
          />
        ),
      },
    ];
    const searchFilterList = searchFields.filter(
      field => !field.key || searchFieldJson[field.key].visibleFlag === 1
    );

    const { closeReasonVisible, closeReason, sceneVisible, sceneCode, sceneList } = this.state;
    const tableProps = {
      columnsCache: DOMAIN,
      dispatch,
      loading,
      expirys: 0,
      total,
      rowKey: 'id',
      scroll: { x: 2600 },
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
      searchBarForm: searchFilterList,
      leftButtons: [
        {
          key: 'add',
          title: '新增',
          className: 'tw-btn-primary',
          icon: 'plus-circle',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push(`/sale/purchaseContract/purchaseAgreementEdit`);
          },
        },
        {
          key: 'edit',
          title: '修改',
          className: 'tw-btn-primary',
          icon: 'edit',
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            if (
              selectedRows[0].agreementStatus === 'CREATE' ||
              selectedRows[0].agreementStatus === 'ACTIVE'
            ) {
              const { id } = selectedRows[0];
              router.push(`/sale/purchaseContract/purchaseAgreementEdit?id=${id}`);
            } else {
              createMessage({ type: 'warn', description: '采购协议状态为新建或激活时才允许修改' });
            }
          },
        },
        {
          key: 'active',
          className: 'tw-btn-info',
          // title: row.oppoStatus === ACTIVE ? '暂挂': formatMessage({ id: `misc.active`, desc: '激活' }),
          title: `激活`,
          icon: 'check-circle',
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            if (
              selectedRows[0].agreementStatus === 'CREATE' ||
              selectedRows[0].agreementStatus === 'PENDING'
            ) {
              dispatch({
                type: `${DOMAIN}/active`,
                payload: selectedRowKeys[0],
              });
            } else {
              createMessage({
                type: 'warn',
                description: '采购协议状态为新建或暂挂时才允许激活',
              });
            }
          },
        },
        {
          key: 'pending',
          className: 'tw-btn-error',
          title: '暂挂',
          icon: 'rollback',
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            if (selectedRows[0].agreementStatus === 'ACTIVE') {
              dispatch({
                type: `${DOMAIN}/pending`,
                payload: selectedRowKeys[0],
              });
            } else {
              createMessage({
                type: 'warn',
                description: '采购协议状态为激活时才允许暂挂',
              });
            }
          },
        },
        {
          key: 'end',
          title: '终止',
          className: 'tw-btn-error',
          icon: 'file-excel',
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            if (selectedRows[0].agreementStatus === 'ACTIVE') {
              const { id, purchaseAgreementNo } = selectedRows[0];
              this.setState({
                closeId: id,
                closeNo: purchaseAgreementNo,
                closeReasonVisible: true,
                closeReason: null,
              });
            } else {
              createMessage({ type: 'warn', description: '采购协议状态为激活时才允许终止' });
            }
          },
        },
        {
          key: 'pay',
          title: '发起付款',
          className: 'tw-btn-info',
          // icon: 'file-excel',
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            this.paymentLaunch(selectedRows[0]);
          },
        },
        {
          key: 'delete',
          title: '删除',
          className: 'tw-btn-error',
          // icon: 'file-excel',
          loading: false,
          hidden: false,
          disabled: selectedRows => !selectedRows.length > 0,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const {
              salePurchaseAgreementsList: { user },
            } = this.props;
            if (
              selectedRows.filter(item => item.agreementStatus !== 'CREATE').length === 0 &&
              (selectedRows.filter(item => item.createUserId !== user.id).length === 0 ||
                user.roles.indexOf('SYS_ADMIN') !== -1)
            ) {
              createConfirm({
                content: '确认删除所选采购协议？',
                onOk: () =>
                  dispatch({
                    type: `${DOMAIN}/remove`,
                    payload: { ids: selectedRowKeys.join(',') },
                  }),
              });
            } else {
              createMessage({
                type: 'warn',
                description: '当前登录用户为系统管理员或创建人并且采购协议状态为新建时才允许删除',
              });
            }
          },
        },
      ],
      columns: columnsFilterList,
    };

    return (
      <PageHeaderWrapper title="创建销售列表">
        <DataTable {...tableProps} />
        <Modal
          destroyOnClose
          title="终止原因"
          // width="400px"
          visible={closeReasonVisible}
          onOk={this.handleCloseOk}
          onCancel={this.handleCloseCancel}
          confirmLoading={loading}
        >
          <Input.TextArea
            value={closeReason}
            onChange={e => {
              this.setState({ closeReason: e.target.value });
            }}
            placeholder="请输入终止原因"
            rows={5}
          />
        </Modal>

        <Modal
          title="业务场景"
          visible={sceneVisible}
          onOk={this.scenePayment}
          onCancel={() => {
            this.setState({
              sceneVisible: false,
              selectedRow: {},
              sceneCode: null,
            });
          }}
        >
          <div>
            <Selection.Columns
              value={sceneCode}
              source={sceneList}
              onChange={e => {
                this.setState({
                  sceneCode: e,
                });
              }}
              placeholder="请选择业务场景"
              showSearch
            />
          </div>
        </Modal>
      </PageHeaderWrapper>
    );
  }
}

export default PurchasesList;
