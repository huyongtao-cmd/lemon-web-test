import React, { PureComponent } from 'react';
import { formatMessage } from 'umi/locale';
import router from 'umi/router';
import Link from 'umi/link';
import { connect } from 'dva';
import { Form, Input, Modal, Radio } from 'antd';

import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import SyntheticField from '@/components/common/SyntheticField';
import { formatDT } from '@/utils/tempUtils/DateTime';
import DataTable from '@/components/common/DataTable';
import FieldList from '@/components/layout/FieldList';
import createMessage from '@/components/core/AlertMessage';
import { Selection } from '@/pages/gen/field';
import { mountToTab } from '@/layouts/routerControl';
import { selectUserMultiCol } from '@/services/user/Contract/sales';
import { selectIamAllUsers } from '@/services/gen/list';
import { getUrl } from '@/utils/flowToRouter';
import { stringify } from 'qs';
import { isEmpty } from 'ramda';
import Loading from '@/components/core/DataLoading';

const DOMAIN = 'userLeads';
const CREATE = 'CREATE';
const DISTRIBUTED = 'DISTRIBUTED';
const columns = [
  { dataIndex: 'code', title: '编号', span: 12 },
  { dataIndex: 'name', title: '名称', span: 12 },
];

const { Field } = FieldList;

@connect(({ loading, userLeads, user }) => ({
  userLeads,
  loading: loading.effects[`${DOMAIN}/query`] || loading.effects[`${DOMAIN}/getPageConfig`],
  user,
}))
@Form.create()
@mountToTab()
class UserLeads extends PureComponent {
  state = {
    visible: false,
    closeReason: null,
    id: null,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    // 页面可配置化数据请求
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'LEADS_MANAGEMENT_LIST' },
    });
    this.fetchData({ offset: 0, limit: 10, sortBy: 'leadsNo', sortDirection: 'DESC' });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: { ...params, isMyLeads: false, leadsStatus: params.leadsStatus },
    });
  };

  handleCloseReason = () => {
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

  changeSearchField = (changedValues, allValues) => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateSearchForm`,
      payload: allValues,
    });
  };

  render() {
    const {
      dispatch,
      loading,
      userLeads: { dataSource, total, searchForm, pageConfig },
      form: { getFieldDecorator },
      user: {
        user: { roles, extInfo = {} },
      },
    } = this.props;
    const { resId } = extInfo;
    const { visible } = this.state;

    if (!pageConfig.pageBlockViews || pageConfig.pageBlockViews.length < 1) {
      return <div />;
    }
    let currentListConfig = [];
    let currentQueryConfig = [];
    pageConfig.pageBlockViews.forEach(view => {
      if (view.blockKey === 'LEADS_MANAGEMENT_LIST') {
        // 线索管理列表
        currentListConfig = view;
      } else if (view.blockKey === 'LEADS_MANAGEMENT_QUERY') {
        currentQueryConfig = view;
      }
    });
    const { pageFieldViews: pageFieldViewsList } = currentListConfig;
    const { pageFieldViews: pageFieldViewsQuery } = currentQueryConfig;
    const pageFieldJsonList = {};
    const pageFieldJsonQuery = {};
    if (pageFieldViewsList) {
      pageFieldViewsList.forEach(field => {
        pageFieldJsonList[field.fieldKey] = field;
      });
    }
    if (pageFieldViewsQuery) {
      pageFieldViewsQuery.forEach(field => {
        pageFieldJsonQuery[field.fieldKey] = field;
      });
    }

    const btnJson = {};
    if (pageConfig && pageConfig.pageButtonViews && pageConfig.pageButtonViews.length > 0) {
      pageConfig.pageButtonViews.forEach(btn => {
        btnJson[btn.buttonKey] = btn;
      });
    }

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      loading,
      total,
      dataSource,
      onChange: filters => {
        this.fetchData(filters);
      },
      onSearchBarChange: this.changeSearchField,
      searchBarForm: [
        pageFieldJsonQuery.leadsName.visibleFlag && {
          title: `${pageFieldJsonQuery.leadsName.displayName}`,
          dataIndex: 'leadsName',
          sortNo: `${pageFieldJsonQuery.leadsName.sortNo}`,
          options: {
            initialValue: searchForm.leadsName,
          },
          tag: <Input placeholder={`请输入${pageFieldJsonQuery.leadsName.displayName}`} />,
        },
        pageFieldJsonQuery.leadsNo.visibleFlag && {
          title: `${pageFieldJsonQuery.leadsNo.displayName}`,
          dataIndex: 'leadsNo',
          sortNo: `${pageFieldJsonQuery.leadsNo.sortNo}`,
          options: {
            initialValue: searchForm.leadsNo,
          },
          tag: <Input placeholder={`请输入${pageFieldJsonQuery.leadsNo.displayName}`} />,
        },
        pageFieldJsonQuery.createUserId.visibleFlag && {
          title: `${pageFieldJsonQuery.createUserId.displayName}`,
          dataIndex: 'createUserId',
          sortNo: `${pageFieldJsonQuery.createUserId.sortNo}`,
          options: {
            initialValue: searchForm.createUserId,
          },
          tag: (
            <Selection.Columns
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              columns={columns}
              source={() => selectUserMultiCol()}
              placeholder={`请选择${pageFieldJsonQuery.createUserId.displayName}`}
              showSearch
            />
          ),
        },
        pageFieldJsonQuery.salesmanResId.visibleFlag && {
          title: `${pageFieldJsonQuery.salesmanResId.displayName}`,
          dataIndex: 'salesmanResId',
          sortNo: `${pageFieldJsonQuery.salesmanResId.sortNo}`,
          options: {
            initialValue: searchForm.salesmanResId,
          },
          tag: (
            <Selection.Columns
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              columns={columns}
              source={() => selectUserMultiCol()}
              placeholder={`请选择${pageFieldJsonQuery.salesmanResId.displayName}`}
              showSearch
            />
          ),
        },
        pageFieldJsonQuery.leadsStatus.visibleFlag && {
          title: `${pageFieldJsonQuery.leadsStatus.displayName}`,
          dataIndex: 'leadsStatus',
          sortNo: `${pageFieldJsonQuery.leadsStatus.sortNo}`,
          options: {
            initialValue: searchForm.leadsStatus,
          },
          tag: (
            <SyntheticField className="tw-field-group">
              <Radio.Group className="tw-field-group-filter" buttonStyle="solid">
                <Radio.Button value="0">=</Radio.Button>
                <Radio.Button value="1">≠</Radio.Button>
              </Radio.Group>
              <Selection.UDC
                className="tw-field-group-field"
                code="TSK.LEADS_STATUS"
                placeholder={`请选择${pageFieldJsonQuery.leadsStatus.displayName}`}
                showSearch
              />
            </SyntheticField>
          ),
        },
        pageFieldJsonQuery.custIdst.visibleFlag && {
          title: `${pageFieldJsonQuery.custIdst.displayName}`,
          dataIndex: 'custIdst',
          sortNo: `${pageFieldJsonQuery.custIdst.sortNo}`,
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
          defaultSortOrder: 'descend',
          // render: (value, row, key) => (
          //   <Link className="tw-link" to={`/sale/management/leadsdetail?id=${row.id}&page=leads`}>
          //     {value}
          //   </Link>
          // ),
          render: (value, row, key) => {
            const urls = getUrl();
            const from = stringify({ from: urls });
            const href = `/sale/management/leadsView?id=${row.id}&${from}`;
            return (
              <Link className="tw-link" to={href}>
                {value}
              </Link>
            );
          },
        },
        pageFieldJsonList.leadsName.visibleFlag && {
          title: `${pageFieldJsonList.leadsName.displayName}`,
          dataIndex: 'leadsName',
          sortNo: `${pageFieldJsonList.leadsName.sortNo}`,
          sorter: true,
        },
        pageFieldJsonList.leadsStatus.visibleFlag && {
          title: `${pageFieldJsonList.leadsStatus.displayName}`,
          dataIndex: 'leadsStatusDesc',
          sortNo: `${pageFieldJsonList.leadsStatus.sortNo}`,
          align: 'center',
        },
        pageFieldJsonList.apprStatus.visibleFlag && {
          title: `${pageFieldJsonList.apprStatus.displayName}`,
          dataIndex: 'apprStatusDesc',
          sortNo: `${pageFieldJsonList.apprStatus.sortNo}`,
          align: 'center',
        },
        pageFieldJsonList.custName.visibleFlag && {
          title: `${pageFieldJsonList.custName.displayName}`,
          dataIndex: 'custName',
          sortNo: `${pageFieldJsonList.custName.sortNo}`,
        },
        pageFieldJsonList.custContact.visibleFlag && {
          title: `${pageFieldJsonList.custContact.displayName}`,
          dataIndex: 'custContact',
          sortNo: `${pageFieldJsonList.custContact.sortNo}`,
        },
        pageFieldJsonList.contactPhone.visibleFlag && {
          title: `${pageFieldJsonList.contactPhone.displayName}`,
          dataIndex: 'contactPhone',
          sortNo: `${pageFieldJsonList.contactPhone.sortNo}`,
        },
        pageFieldJsonList.createUserId.visibleFlag && {
          title: `${pageFieldJsonList.createUserId.displayName}`,
          dataIndex: 'createUserName',
          sortNo: `${pageFieldJsonList.createUserId.sortNo}`,
        },
        pageFieldJsonList.salesmanResId.visibleFlag && {
          title: `${pageFieldJsonList.salesmanResId.displayName}`,
          dataIndex: 'salesmanResName',
          sortNo: `${pageFieldJsonList.salesmanResId.sortNo}`,
        },
        pageFieldJsonList.createTime.visibleFlag && {
          title: `${pageFieldJsonList.createTime.displayName}`,
          dataIndex: 'createTime',
          sortNo: `${pageFieldJsonList.createTime.sortNo}`,
          render: value => formatDT(value),
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
        {
          key: 'edit',
          className: 'tw-btn-primary',
          title: btnJson.edit.buttonName || '修改',
          icon: 'form',
          loading: false,
          hidden: !btnJson.edit.visible,
          disabled: selectedRowKeys => selectedRowKeys.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const { leadsStatus } = selectedRows[0];
            if (leadsStatus === 'CREATE' || leadsStatus === 'DISTRIBUTED') {
              router.push(
                `/sale/management/leadsedit?id=${selectedRowKeys[0]}&mode=update&page=leads`
              );
            } else {
              createMessage({ type: 'warn', description: '仅新建或已分配的线索允许修改' });
            }
          },
        },
        {
          key: 'submit',
          className: 'tw-btn-primary',
          title: btnJson.submit.buttonName || '提交',
          // icon: 'form',
          loading: false,
          hidden: !btnJson.submit.visible,
          disabled: selectedRowKeys => selectedRowKeys.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            // 未审批 / 撤回 / 退回
            if (
              selectedRows[0].leadsStatus === CREATE &&
              (selectedRows[0].apprStatus === 'NOTSUBMIT' ||
                selectedRows[0].apprStatus === 'WITHDRAW' ||
                selectedRows[0].apprStatus === 'REJECTED' ||
                selectedRows[0].apprStatus === null)
            ) {
              dispatch({
                type: `${DOMAIN}/submit`,
                payload: {
                  defkey: 'TSK_S01',
                  value: {
                    id: selectedRowKeys[0],
                  },
                },
              });
            } else {
              createMessage({ type: 'warn', description: '该状态的线索不能够提交' });
            }
          },
        },
        {
          key: 'change',
          className: 'tw-btn-info',
          title: btnJson.change.buttonName || '转换商机',
          icon: 'tag',
          loading: false,
          hidden: !btnJson.change.visible,
          disabled: selectedRowKeys => selectedRowKeys.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            if (selectedRows[0].leadsStatus === DISTRIBUTED) {
              router.push(
                `/sale/management/oppscreate?id=${
                  selectedRowKeys[0]
                }&mode=create&tab=basic&page=leads`
              );
            } else {
              createMessage({ type: 'warn', description: '仅已分配的线索能够转换商机' });
            }
          },
        },
        {
          key: 'remove',
          className: 'tw-btn-error',
          title: btnJson.remove.buttonName || '关闭',
          icon: 'file-excel',
          loading: false,
          hidden: !btnJson.remove.visible,
          disabled: selectedRowKeys => selectedRowKeys.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            if (
              selectedRows[0].leadsStatus === CREATE ||
              selectedRows[0].apprStatus === 'APPROVING' ||
              selectedRows[0].apprStatus === 'NOTSUBMIT'
            ) {
              createMessage({ type: 'warn', description: '新建、未提交、审批中状态不允许关闭！' });
            } else if (selectedRows[0].leadsStatus === DISTRIBUTED) {
              this.setState({ id: selectedRowKeys[0] });
              this.toggleVisible();
            } else {
              createMessage({ type: 'warn', description: '该线索不符合操作条件' });
            }
          },
        },
        {
          key: 'compelClose',
          className: 'tw-btn-error',
          title: btnJson.compelClose.buttonName || '强制关闭',
          loading: false,
          hidden: selectedRows => {
            // 当前登录用户的用户角色=PLAT_LEADS_ADMIN或SYS_ADMIN时直接显示按钮；
            // 非管理员，销售在选中的线索后，如果线索的销售人员SALESMAN_RES_ID 是当前登录用户时才显示，否则不显示；
            const {
              compelClose: { permissionViews = [] },
            } = btnJson;
            // 允许显示权限
            const tt = roles.some(ele => permissionViews.map(v => v.allowValue).includes(ele));
            return tt
              ? false
              : !(selectedRows.length === 1 && selectedRows[0].salesmanResId === resId) ||
                  !btnJson.compelClose.visibleFlag;
          },
          disabled: selectedRowKeys => selectedRowKeys.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            this.setState({ id: selectedRowKeys[0] });
            this.toggleVisible();
          },
        },
        {
          key: 'advancedUpdate',
          className: 'tw-btn-info',
          title: btnJson.advancedUpdate.buttonName || '高级修改',
          loading: false,
          hidden: selectedRows => {
            // 当前登录用户的用户角色=PLAT_LEADS_ADMIN或SYS_ADMIN时直接显示按钮；
            // 非管理员，销售在选中的线索后，如果线索的销售人员SALESMAN_RES_ID 是当前登录用户时才显示，否则不显示；
            const {
              advancedUpdate: { permissionViews = [] },
            } = btnJson;
            // 允许显示权限
            const tt = roles.some(ele => permissionViews.map(v => v.allowValue).includes(ele));
            return tt
              ? false
              : !(selectedRows.length === 1 && selectedRows[0].salesmanResId === resId) ||
                  !btnJson.advancedUpdate.visibleFlag;
          },
          disabled: selectedRowKeys => selectedRowKeys.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push(
              `/sale/management/leadsedit?id=${
                selectedRowKeys[0]
              }&mode=update&page=leads&advanced=true`
            );
          },
        },
      ]
        .map(btn => ({
          ...btn,
          sortNo: btnJson[btn.key].sortNo,
        }))
        .sort((b1, b2) => b1.sortNo - b2.sortNo),
    };
    return (
      <PageHeaderWrapper title="线索管理">
        <DataTable {...tableProps} key={pageConfig} />
        <Modal
          destroyOnClose
          title="关闭线索"
          visible={visible}
          onOk={this.handleCloseReason}
          onCancel={this.toggleVisible}
          width="50%"
        >
          <FieldList
            getFieldDecorator={getFieldDecorator}
            layout="horizontal"
            style={{ overflow: 'hidden' }}
            col={1}
          >
            <Field name="closeReason" label="关闭原因">
              <Selection.UDC
                code="TSK.LEADS_CLOSE_REASON"
                onChange={value => {
                  this.setState({ closeReason: value });
                }}
              />
            </Field>
          </FieldList>
        </Modal>
      </PageHeaderWrapper>
    );
  }
}

export default UserLeads;
