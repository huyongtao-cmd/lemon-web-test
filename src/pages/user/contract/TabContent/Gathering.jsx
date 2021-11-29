import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import moment from 'moment';
import { Input, InputNumber, Modal, Form } from 'antd';
import update from 'immutability-helper';
import DataTable from '@/components/common/DataTable';
import { sub, genFakeId } from '@/utils/mathUtils';
import { UdcSelect, DatePicker } from '@/pages/gen/field';
import createMessage from '@/components/core/AlertMessage';
import { createConfirm } from '@/components/core/Confirm';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import FieldList from '@/components/layout/FieldList';
import { isEmpty } from 'ramda';

const DOMAIN = 'userContractGathering';
const { Field, FieldLine } = FieldList;
const FieldListLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

@connect(({ dispath, loading, userContractGathering, userContractEditSub }) => ({
  dispath,
  loading,
  userContractGathering,
  userContractEditSub,
}))
@Form.create({
  onValuesChange(props, changedValues) {
    if (!isEmpty(changedValues)) {
      props.dispatch({
        type: `${DOMAIN}/updateConfForm`,
        payload: changedValues,
      });
    }
  },
})
@mountToTab()
class Gathering extends PureComponent {
  state = {
    visible: false,
    // recvPlanIds : null,
    // confirmDate : null,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const { id } = fromQs();
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        searchForm: {
          recvNo: null,
          recvStatus: null,
        },
      },
    });
    this.fetchData({ contractId: id });
    dispatch({
      type: `${DOMAIN}/querySub`,
      payload: id,
    });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    const { id } = fromQs();
    dispatch({
      type: `${DOMAIN}/query`,
      payload: {
        contractId: id,
        ...params,
        limit: 999,
        offset: 0,
      },
    });
  };

  onCellChanged = (rowId, rowField) => rowFieldValue => {
    const {
      dispatch,
      userContractGathering: { dataList },
    } = this.props;

    let value = null;
    if (rowField === 'recvRatio') {
      value = rowFieldValue / 100;
    } else {
      value = rowFieldValue && rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue;
    }

    const newDataList = dataList.map(data => {
      if (data.id === rowId) {
        return {
          ...data,
          [rowField]: value,
        };
      }
      return data;
    });
    dispatch({ type: `${DOMAIN}/updateState`, payload: { dataList: newDataList } });
    dispatch({
      type: 'userContractEditSub/updateState',
      payload: { flag3: 1 },
    });
    // dispatch({ type: `${DOMAIN}/total` });
  };

  targeToggleVisiable = () => {
    const { visible } = this.state;
    this.setState({ visible: !visible });
  };

  selectConf = () => {
    this.targeToggleVisiable();
    // 保存确认信息
    const { dispatch } = this.props;
    const { recvPlanIds, confirmDate } = this.state;
    dispatch({
      type: `${DOMAIN}/saveConf`,
      // payload:{recvPlanIds,confirmDate}
      payload: null,
    }).then(resp => {
      // 保存成功后刷新列表
      const { id } = fromQs();
      dispatch({
        type: `${DOMAIN}/query`,
        payload: {
          contractId: id,
        },
      });
      // 清空已选中的收款计划、确认日期
      // this.setState({
      //   recvPlanIds:null,
      //   confirmDate:null,
      // });

      dispatch({
        type: `${DOMAIN}/updateConfForm`,
        payload: {
          recvPlanIds: null,
          confirmDate: null,
        },
      });
    });
  };

  cancelConf = () => {
    this.targeToggleVisiable();
    // this.setState({
    //   recvPlanIds:null,
    //   confirmDate:null,
    // });
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateConfForm`,
      payload: {
        recvPlanIds: null,
        confirmDate: null,
      },
    });
  };

  render() {
    const {
      dispatch,
      loading,
      formData,
      form: { getFieldDecorator },
      userContractGathering: {
        dataList,
        flag3,
        searchForm,
        total,
        recvPlanConfForm: { recvPlanIds, confirmDate },
      },
      userContractEditSub: { pageConfig = {} },
    } = this.props;
    const { visible } = this.state;

    const btnJson = {};
    if (pageConfig && pageConfig.pageButtonViews && pageConfig.pageButtonViews.length > 1) {
      pageConfig.pageButtonViews.forEach(btn => {
        btnJson[btn.buttonKey] = btn;
      });
    }

    const renderContent = (value, row, index) => {
      const obj = {
        children: value,
        props: {},
      };
      return obj;
    };

    const { pageBlockViews = [] } = pageConfig;
    if (!pageBlockViews || pageBlockViews.length < 3) {
      return <div />;
    }
    let pageFieldView = [];
    pageBlockViews.forEach(block => {
      if (block.blockKey === 'SALE_CONTRACT_EDIT_SUB_RECV') {
        pageFieldView = block.pageFieldViews;
      }
    });
    const pageFieldJson = {};
    pageFieldView.forEach(field => {
      pageFieldJson[field.fieldKey] = field;
    });

    const tableProps = {
      columnsCache: DOMAIN,
      dispatch,
      rowKey: 'id',
      sortBy: 'recvNo',
      sortDirection: 'DESC',
      // showSearch: false,
      showCopy: false,
      loading: loading.effects[`${DOMAIN}/query`],
      dataSource: dataList,
      searchForm,
      total: dataList.length,
      pagination: false,
      scroll: {
        x: 2100,
        // y: 450,
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
        {
          title: pageFieldJson.recvNo.displayName,
          dataIndex: 'recvNo',
          options: {
            initialValue: searchForm.recvNo,
          },
          tag: <Input placeholder={`请输入${pageFieldJson.recvNo.displayName}`} />,
        },
        {
          title: pageFieldJson.recvStatus.displayName,
          dataIndex: 'recvStatus',
          options: {
            initialValue: searchForm.recvStatus,
          },
          tag: (
            <UdcSelect
              code="ACC.RECV_STATUS"
              placeholder={`请输入${pageFieldJson.recvStatus.displayName}`}
            />
          ),
        },
      ],
      leftButtons: [
        {
          key: 'addg',
          title: btnJson.addg.buttonName || '新增',
          className: 'tw-btn-primary',
          // icon: 'plus-circle',
          loading: false,
          hidden: !btnJson.addg.visible,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const { id } = fromQs();
            dataList.unshift({
              id: -1 * Math.random(),
              contractId: id,
              // lineNo: 0,
              phaseDesc: '',
              recvNo: '',
              recvRatio: null,
              recvAmt: null,
              taxRate: formData.taxRate,
              invAmt: null, // 已开票金额
              unInvAmt: null, // 未开票金额
              actualRecvAmt: null, // 已收款金额
              unRecvAmt: null, // 未收款金额
              confirmedAmt: null, // 已确认金额
              expectRecvDate: new Date(),
              confirmDate: null, // 确认收入日期
            });
            dispatch({
              type: `${DOMAIN}/updateState`,
              payload: {
                dataList,
              },
            });
            dispatch({
              type: 'userContractEditSub/updateState',
              payload: { flag3: 1 },
            });
          },
        },
        {
          key: 'invoiceg',
          title: btnJson.invoiceg.buttonName || '申请开票',
          className: 'tw-btn-info',
          // icon: 'form',
          loading: false,
          hidden: !btnJson.invoiceg.visible,
          minSelections: 0,
          disabled: row => {
            if (!row.length) return true;
            let bool = false;
            row.forEach(v => {
              if (!(!v.batchStatus || v.batchStatus === '1' || v.batchStatus === '5')) {
                bool = true;
              } else if (v.id < 1) {
                bool = true;
              }
            });
            return bool;
          },
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const invoiceAmt = selectedRows.filter(v => !!v.invAmt).length; // 已开票合同条数
            if (invoiceAmt) {
              createMessage({ type: 'error', description: '勾选项包含已开票合同，不允许重复开票' });
              return;
            }
            // 签约公司与客户都相同
            if (flag3) {
              createConfirm({
                content: '您有未保存的修改,是否要继续此操作?',
                onOk: () => {
                  router.push(`/plat/saleRece/invBatch/edit?ids=${selectedRowKeys.join(',')}`);
                },
              });
            } else {
              router.push(`/plat/saleRece/invBatch/edit?ids=${selectedRowKeys.join(',')}`);
            }
          },
        },
        {
          key: 'deleteg',
          title: btnJson.deleteg.buttonName || '删除',
          className: 'tw-btn-error',
          // icon: 'file-excel',
          loading: false,
          hidden: !btnJson.deleteg.visible,
          minSelections: 2,
          disabled: row => {
            let bool = false;
            row.forEach(v => {
              if (v.batchStatus) {
                bool = true;
              }
            });
            return bool;
          },
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const delArr = [];
            selectedRowKeys.map(v => v > 0 && delArr.push(v));
            const newDataList = dataList.filter(
              row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length
            );
            dispatch({
              type: `${DOMAIN}/updateState`,
              payload: {
                dataList: newDataList,
                delList: delArr,
              },
            });
            // dispatch({ type: `${DOMAIN}/total` });
            dispatch({
              type: 'userContractEditSub/updateState',
              payload: { flag3: 1 },
            });
          },
        },
        {
          key: 'confirm',
          title: btnJson.confirm.buttonName || '确认收入',
          className: 'tw-btn-info',
          loading: false,
          hidden: !btnJson.confirm.visible,
          minSelections: 0,
          disabled: row => {
            if (!row.length) return true;
            let bool = false;
            row.forEach(v => {
              if (v.id < 1) {
                bool = true;
              }
            });
            return bool;
          },
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            this.targeToggleVisiable(); // 弹出窗口
            // 记录选中的收款计划
            // this.setState({recvPlanIds:selectedRowKeys});
            dispatch({
              type: `${DOMAIN}/updateConfForm`,
              payload: { recvPlanIds: selectedRowKeys },
            });
          },
        },
      ]
        .map(btn => ({
          ...btn,
          sortNo: btnJson[btn.key].sortNo,
        }))
        .sort((b1, b2) => b1.sortNo - b2.sortNo),
      columns: [
        {
          title: '收款号',
          key: 'recvNo',
          dataIndex: 'recvNo',
          sorter: true,
          required: true,
          width: 200,
          align: 'center',
          render: renderContent,
        },
        {
          title: '收款阶段',
          key: 'phaseDesc',
          dataIndex: 'phaseDesc',
          required: true,
          width: 150,
          render: (value, row, index) => {
            const obj = {
              children: (
                <Input
                  defaultValue={value}
                  onChange={this.onCellChanged(row.id, 'phaseDesc')}
                  disabled={
                    !(row.batchStatus === '1' || row.batchStatus === '5' || !row.batchStatus)
                  }
                />
              ),
              props: {},
            };
            return obj;
          },
        },
        {
          title: '当期收款金额',
          key: 'recvAmt',
          dataIndex: 'recvAmt',
          sorter: true,
          required: true,
          align: 'right',
          width: 150,
          render: (value, row, index) => {
            const obj = {
              children: (
                <InputNumber
                  defaultValue={value}
                  onChange={this.onCellChanged(row.id, 'recvAmt')}
                  className="x-fill-100"
                  disabled={
                    !(row.batchStatus === '1' || row.batchStatus === '5' || !row.batchStatus)
                  }
                />
              ),
              props: {},
            };
            // if (index === dataList.length - 1) {
            //   obj.props.colSpan = 0;
            // }
            return obj;
          },
        },
        {
          title: '当期收款比例 %',
          key: 'recvRatio',
          dataIndex: 'recvRatio',
          sorter: true,
          required: true,
          align: 'right',
          width: 200,
          render: (value, row, index) => {
            const obj = {
              children: (
                <InputNumber
                  defaultValue={value * 100}
                  min={0}
                  max={100}
                  formatter={v => `${v}%`}
                  parser={v => v.replace('%', '')}
                  onChange={this.onCellChanged(row.id, 'recvRatio')}
                  className="x-fill-100"
                  disabled={
                    !(row.batchStatus === '1' || row.batchStatus === '5' || !row.batchStatus)
                  }
                />
              ),
              props: {},
            };
            return obj;
          },
        },
        {
          title: '预计收款日',
          key: 'expectRecvDate',
          dataIndex: 'expectRecvDate',
          sorter: true,
          width: 150,
          render: (value, row, index) => {
            const obj = {
              children: (
                <DatePicker
                  className="x-fill-100"
                  value={value ? moment(value) : null}
                  size="small"
                  onChange={this.onCellChanged(row.id, 'expectRecvDate')}
                  disabled={
                    !(row.batchStatus === '1' || row.batchStatus === '5' || !row.batchStatus)
                  }
                />
              ),
              props: {},
            };
            return obj;
          },
        },
        {
          title: '收款状态',
          key: 'recvStatus',
          dataIndex: 'recvStatusDesc',
          required: true,
          width: 100,
          align: 'center',
          render: renderContent,
        },
        {
          title: '开票状态',
          key: 'batchStatusDesc',
          dataIndex: 'batchStatusDesc',
          required: true,
          width: 100,
          align: 'center',
        },
        {
          title: '税率',
          key: 'taxRate',
          dataIndex: 'taxRate',
          sorter: true,
          width: 100,
          align: 'right',
          render: (value, row, index) => {
            const obj = {
              children: value && value + '%',
              props: {},
            };
            return obj;
          },
        },
        {
          title: '开票日期',
          key: 'invDate',
          dataIndex: 'invDate',
          sorter: true,
          width: 150,
          render: renderContent,
        },
        {
          title: '已开票金额',
          key: 'invAmt',
          dataIndex: 'invAmt',
          sorter: true,
          width: 120,
          align: 'right',
          render: renderContent,
        },
        {
          title: '未开票金额',
          key: 'unInvAmt',
          dataIndex: 'unInvAmt',
          sorter: true,
          width: 120,
          align: 'right',
          render: (value, row, index) => {
            const obj = {
              children: row.recvAmt - row.invAmt,
              props: {},
            };
            return obj;
          },
        },
        {
          title: '已收款金额',
          key: 'actualRecvAmt',
          dataIndex: 'actualRecvAmt',
          sorter: true,
          width: 120,
          align: 'right',
          render: renderContent,
        },
        {
          title: '实际收款日期',
          key: 'actualRecvDate',
          dataIndex: 'actualRecvDate',
          sorter: true,
          width: 150,
          render: renderContent,
        },
        {
          title: '未收款金额',
          key: 'unRecvAmt',
          dataIndex: 'unRecvAmt',
          width: 120,
          align: 'right',
          sorter: true,
          render: (value, row, index) => {
            const obj = {
              children: row.recvAmt - row.actualRecvAmt,
              props: {},
            };
            // if (index === dataList.length - 1) {
            //   obj.props.colSpan = 0;
            // }
            return obj;
          },
        },
        {
          title: '已确认金额',
          key: 'confiremedAmt',
          dataIndex: 'confirmedAmt',
          // width: 120,
          align: 'right',
          render: renderContent,
        },
        {
          title: '确认收入日期',
          key: 'confirmDate',
          dataIndex: 'confirmDate',
          // width: 120,
          align: 'right',
          render: renderContent,
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
      <PageHeaderWrapper>
        <DataTable {...tableProps} />

        <Modal
          title="确认收入"
          visible={visible}
          loading={false}
          onOk={this.selectConf}
          onCancel={this.cancelConf}
          width="20%"
        >
          <FieldList
            getFieldDecorator={getFieldDecorator}
            layout="horizontal"
            // style={{ overflow: 'hidden' }}
            col={1}
          >
            <Field
              name="confirmDate"
              label={pageFieldJson.confirmDate.displayName}
              decorator={{
                initialValue: moment(),
              }}
              {...FieldListLayout}
            >
              <DatePicker
                placeholder={`请选择${pageFieldJson.confirmDate.displayName}`}
                format="YYYY-MM-DD"
                className="x-fill-100"
                allowClear={false}
              />
            </Field>
          </FieldList>
        </Modal>
      </PageHeaderWrapper>
    );
  }
}

export default Gathering;
