/* eslint-disable no-nested-ternary */
import React, { PureComponent } from 'react';
import update from 'immutability-helper';
import { Input, Button, Modal, Form, Divider, Checkbox } from 'antd';
import { connect } from 'dva';
import EditableDataTable from '@/components/common/EditableDataTable';
import DataTable from '@/components/common/DataTable';
import { FileManagerEnhance } from '@/pages/gen/field';
import FieldList from '@/components/layout/FieldList';
import createMessage from '@/components/core/AlertMessage';
import { isEmpty, includes } from 'ramda';
import moment from 'moment';
import { fromQs } from '@/utils/stringUtils';

const { Field } = FieldList;

const DOMAIN = 'opportunityQuote';

@connect(({ loading, opportunityQuote, dispatch, user }) => ({
  loading,
  opportunityQuote,
  dispatch,
  user,
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
class QuoteEdit extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const { id } = fromQs();
    // 页面可配置化
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'BUSINESS_EDIT_OFFER' },
    });

    dispatch({
      type: `${DOMAIN}/getCosteId`,
      payload: { id },
    }).then(res => {
      res.ok && dispatch({ type: `${DOMAIN}/offerList`, payload: { id } });
    });
  }

  // 配置所需要的内容
  renderPage = () => {
    const {
      opportunityQuote: {
        formData,
        pageConfig: { pageBlockViews },
      },
      form: { getFieldDecorator },
    } = this.props;

    if (!pageBlockViews || pageBlockViews.length < 1) {
      return <div />;
    }
    const currentListConfig = pageBlockViews.filter(v => v.blockPageName === '报价');
    const { pageFieldViews = [] } = currentListConfig[0];

    const pageFieldViewsVisible = pageFieldViews
      .filter(v => v.visibleFlag)
      .sort((field1, field2) => field1.sortNo - field2.sortNo);

    const fields = pageFieldViewsVisible.map(v => (
      <Field
        name={v.fieldKey}
        key={v.fieldKey}
        label={v.displayName}
        decorator={{
          initialValue:
            v.fieldKey === 'activataStatus' && formData.activataStatus === '1'
              ? '未激活'
              : v.fieldKey === 'activataStatus' && formData.activataStatus === '0'
                ? '激活'
                : v.fieldKey === 'offerlStatus' && formData.offerlStatus === '1'
                  ? '未报价'
                  : v.fieldKey === 'offerlStatus' && formData.offerlStatus === '0'
                    ? '已报价'
                    : formData[
                        v.fieldKey === 'apprStatus' || v.fieldKey === 'offerResId'
                          ? `${v.fieldKey}Name`
                          : v.fieldKey
                      ] || undefined,
          rules: [{ required: v.requiredFlag, message: '必填' }],
        }}
      >
        {v.fieldKey === 'oppoOfferCoste' ? (
          <FileManagerEnhance
            api="/api/op/v1/oppoCoste/est/sfs/token"
            listType="text"
            disabled={false}
            multiple={false}
            dataKey={formData.costeId}
            preview
          />
        ) : v.fieldKey === 'oppoOfferSow' ? (
          <FileManagerEnhance
            api="/api/op/v1/oppoCoste/sow/sfs/token"
            listType="text"
            disabled={false}
            multiple={false}
            dataKey={formData.costeId}
            preview
          />
        ) : v.fieldKey === 'oppoOfferSow' ? (
          <FileManagerEnhance
            api="/api/op/v1/oppoCoste/sow/sfs/token"
            listType="text"
            disabled={false}
            multiple={false}
            dataKey={formData.costeId}
            preview
          />
        ) : v.fieldKey === 'oppoOffer' || v.fieldKey === 'oppoOfferContract' ? (
          <FileManagerEnhance
            api={
              v.fieldKey === 'oppoOffer'
                ? '/api/op/v1/oppoOffer/offer/sfs/token'
                : '/api/op/v1/oppoOffer/offer/contract/sfs/token'
            }
            listType="text"
            disabled={false}
            multiple={false}
            dataKey={formData.id}
          />
        ) : (
          <Input disabled placeholder="系统自动生成" />
        )}
      </Field>
    ));

    return (
      <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
        {fields}
      </FieldList>
    );
  };

  // 行编辑触发事件
  onCellChanged = (index, value, name) => {
    const {
      dispatch,
      opportunityQuote: { ruleList },
    } = this.props;

    const newDataSource = ruleList;
    newDataSource[index] = {
      ...newDataSource[index],
      [name]: value,
    };
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { ruleList: newDataSource },
    });
  };

  render() {
    const {
      loading,
      dispatch,
      opportunityQuote: {
        formData,
        list,
        selectedList,
        pageConfig: { pageBlockViews = [] },
        ruleList,
        basicData: { signResId = '', signBuId, fuResId, suResId },
        costeId,
      },
      user: {
        user: {
          extInfo: { resId, resName },
        },
      },
    } = this.props;

    const { visible } = this.state;

    const { id } = fromQs();

    const submitting = loading.effects[`${DOMAIN}/offerSave`];

    if (!pageBlockViews || pageBlockViews.length < 1) {
      return <div />;
    }
    const currentListConfig = pageBlockViews.filter(v => v.blockPageName === '报价');
    const { pageFieldViews } = currentListConfig[0];
    const pageFieldViewsVisible = pageFieldViews
      .filter(v => v.visibleFlag)
      .sort((field1, field2) => field1.sortNo - field2.sortNo);

    const tableProps = {
      sortBy: 'id',
      rowKey: 'id',
      loading: false,
      dataSource: list,
      showCopy: false,
      scroll: { x: 1800 },
      rowSelection: {
        // selectedRowKeys: selectedList.map(v => v.id),
        onChange: (selectedRowKeys, selectedRows) => {
          dispatch({
            type: `${DOMAIN}/updateState`,
            payload: { selectedList: selectedRows },
          });
        },
      },
      showAdd: signResId === resId || signBuId === resId || fuResId === resId || suResId === resId,
      showDelete:
        signResId === resId || signBuId === resId || fuResId === resId || suResId === resId,
      onAdd: newRow => {
        dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: {
            oppoId: id,
            activataStatus: '1',
            sortNo: isEmpty(list) ? 1 : list[list.length - 1].sortNo + 1,
            apprStatus: 'NOTSUBMIT',
            apprStatusName: '未提交',
            offerlStatus: '1',
            offerRuleIns: null,
            offerResId: resId,
            offerResIdName: resName,
            offerDate: moment().format('YYYY-MM-DD'),
            costeId,
          },
        });
        this.setState({
          visible: true,
        });
      },
      onDeleteItems: (selectedRowKeys, selectedRows) => {
        const noNew = selectedRows.filter(v => v.apprStatus !== 'NOTSUBMIT');
        if (!isEmpty(noNew)) {
          createMessage({ type: 'warn', description: '只有审批状态为未提交的数据可以删除！' });
          return;
        }

        dispatch({
          type: `${DOMAIN}/offerDel`,
          payload: {
            ids: selectedRowKeys.join(','),
          },
        }).then(res => {
          if (res.ok) {
            const newDataSource = list.filter(
              row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length
            );
            dispatch({
              type: `${DOMAIN}/updateState`,
              payload: {
                list: newDataSource.map((v, i) => ({ ...v, sortNo: i + 1 })),
              },
            });

            dispatch({
              type: `${DOMAIN}/offerUpdate`,
            });
            return;
          }
          createMessage({ type: 'error', description: res.reason || '删除失败' });
        });
      },
      columns: pageFieldViewsVisible.map(v => ({
        title: v.displayName || '',
        dataIndex: v.fieldKey,
        align: 'center',
        render: (val, row, index) =>
          // eslint-disable-next-line no-nested-ternary
          v.fieldKey === 'oppoOfferCoste' ? (
            <FileManagerEnhance
              key={row.id}
              api="/api/op/v1/oppoCoste/est/sfs/token"
              listType="text"
              disabled={false}
              multiple={false}
              dataKey={row.costeId}
              preview
            />
          ) : v.fieldKey === 'oppoOfferSow' ? (
            <FileManagerEnhance
              key={row.id}
              api="/api/op/v1/oppoCoste/sow/sfs/token"
              listType="text"
              disabled={false}
              multiple={false}
              dataKey={row.costeId}
              preview
            />
          ) : v.fieldKey === 'oppoOffer' || v.fieldKey === 'oppoOfferContract' ? (
            <FileManagerEnhance
              key={row.id}
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
      })),
      leftButtons: [
        {
          key: 'active',
          className: 'tw-btn-primary',
          title: '激活',
          loading: false,
          hidden: false,
          disabled: selectedRows =>
            selectedRows.length !== 1 ||
            selectedRows[0].apprStatus !== 'APPROVED' ||
            selectedRows[0].activataStatus !== '1',
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            // // 当前登录人不是签单BU负责人不是签单负责人时不可激活
            // if (selectedRows[0].signBuId !== resId && selectedRows[0].signResId !== resId) {
            //   createMessage({
            //     type: 'warn',
            //     description: '您不是签单BU负责人也不是签单负责人，不能执行激活操作！',
            //   });
            //   return;
            // }

            // // 交付BU负责人的成本估算只能由交付BU负责人进行激活
            // if (selectedRows[0].offerResId !== resId && selectedRows[0].signBuId !== resId) {
            //   createMessage({
            //     type: 'warn',
            //     description: '签单BU负责人的成本估算只能由签单BU负责人进行激活！',
            //   });
            //   return;
            // }

            dispatch({
              type: `${DOMAIN}/offerUpdateStatus`,
              payload: {
                id: selectedRowKeys[0],
                oppoId: id,
                state: '0',
              },
            });
          },
        },
        {
          key: 'update',
          className: 'tw-btn-primary',
          title: '修改',
          loading: false,
          hidden: !(
            signResId === resId ||
            signBuId === resId ||
            fuResId === resId ||
            suResId === resId
          ),
          disabled: selectedRows =>
            selectedRows.length !== 1 ||
            selectedRows[0].activataStatus === '0' ||
            selectedRows[0].apprStatus === 'APPROVED' ||
            selectedRows[0].apprStatus === 'APPROVING',
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            this.setState(
              {
                visible: true,
              },
              () => {
                dispatch({
                  type: `${DOMAIN}/updateForm`,
                  payload: { ...selectedRows[0] },
                });
                const { offerRuleIns } = selectedRows[0];
                dispatch({
                  type: `${DOMAIN}/updateState`,
                  payload: {
                    ruleList: ruleList.map(
                      v => (offerRuleIns.split(',').includes(v.ruleNo) ? { ...v, flag: 1 } : v)
                    ),
                  },
                });
              }
            );
          },
        },
        {
          key: 'updateOfferlStatus',
          className: 'tw-btn-primary',
          title: '已报客户',
          loading: false,
          hidden: false,
          disabled: selectedRows =>
            selectedRows.length !== 1 ||
            selectedRows[0].apprStatus !== 'APPROVED' ||
            selectedRows[0].offerlStatus !== '1' ||
            selectedRows[0].activataStatus !== '0',
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({
              type: `${DOMAIN}/updateOfferlStatus`,
              payload: {
                id: selectedRowKeys[0],
                oppoId: id,
                state: '0',
              },
            });
          },
        },
      ],
      buttons: [],
    };

    const ruleTableProps = {
      title: () => (
        <span style={{ fontSize: '16px', color: 'red', fontWeight: 'bolder' }}>
          请 “勾选” 本合同 “违背” 的商务条款
        </span>
      ),
      rowKey: 'id',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'DESC',
      dataSource: ruleList,
      onChange: filters => this.fetchData(filters),
      onSearchBarChange: (changedValues, allValues) => {},
      searchBarForm: [],
      enableSelection: false,
      showSearch: false,
      showColumn: false,
      showExport: false,
      pagination: false,
      showCopy: false,
      columns: [
        {
          title: '规则编号',
          dataIndex: 'ruleNo',
          align: 'center',
        },
        {
          title: '商务规则描述',
          dataIndex: 'ruleDesc',
          render: val => <pre>{val}</pre>,
        },
        {
          title: '是否符合',
          dataIndex: 'flag',
          align: 'center',
          render: (val, row, index) => (
            <Checkbox
              checked={Number(val) === 1}
              disabled={
                !index && ruleList.filter(v => v.flag).filter(v => v.id).length
                  ? true
                  : index && ruleList.filter(v => v.flag).filter(v => !v.id).length
                // ? true
                // : false
              }
              onChange={e => {
                const values = e.target.checked ? 1 : 0;
                this.onCellChanged(index, values, 'flag');
              }}
            />
          ),
        },
      ],
    };

    const ruleTableProps1 = {
      title: () => (
        <span style={{ fontSize: '16px', fontWeight: 'bolder' }}>商机报价 - 商务条款明细</span>
      ),
      rowKey: 'id',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'DESC',
      dataSource: ruleList,
      onChange: filters => this.fetchData(filters),
      onSearchBarChange: (changedValues, allValues) => {},
      searchBarForm: [],
      enableSelection: false,
      showSearch: false,
      showColumn: false,
      showExport: false,
      pagination: false,
      showCopy: false,
      columns: [
        {
          title: '规则编号',
          dataIndex: 'ruleNo',
          align: 'center',
        },
        {
          title: '商务规则描述',
          dataIndex: 'ruleDesc',
          render: val => <pre>{val}</pre>,
        },
      ],
    };

    return (
      <>
        <EditableDataTable {...tableProps} />
        <br />
        <Divider dashed />
        <DataTable {...ruleTableProps1} />
        <Modal
          title="报价"
          visible={visible}
          onOk={() => {
            const {
              form: { validateFieldsAndScroll },
            } = this.props;
            validateFieldsAndScroll((error, values) => {
              if (!error) {
                const tt = ruleList.filter(v => v.flag);
                if (!tt.length) {
                  createMessage({ type: 'warn', description: '请勾选至少一条商务条款！' });
                  return;
                }
                dispatch({
                  type: `${DOMAIN}/offerSave`,
                  payload: { ...formData, offerRuleIns: tt.map(v => v.ruleNo).join(',') },
                }).then(res => {
                  if (res.ok) {
                    this.setState(
                      {
                        visible: false,
                      },
                      () => {
                        dispatch({
                          type: `${DOMAIN}/updateState`,
                          payload: {
                            ruleList: ruleList.map(v => ({ ...v, flag: 0 })),
                            formData: {},
                          },
                        });
                      }
                    );
                  }
                });
              }
            });
          }}
          onCancel={() => {
            dispatch({
              type: `${DOMAIN}/updateState`,
              payload: {
                ruleList: ruleList.map(v => ({ ...v, flag: 0 })),
                formData: {},
              },
            });
            this.setState({
              visible: false,
            });
          }}
          confirmLoading={submitting}
          maskClosable={false}
          destroyOnClose
          width={1250}
        >
          {this.renderPage()}
          <Divider dashed />
          <DataTable {...ruleTableProps} />
        </Modal>
      </>
    );
  }
}

export default QuoteEdit;
