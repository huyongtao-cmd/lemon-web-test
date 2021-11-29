import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Card, Tooltip } from 'antd';
import classnames from 'classnames';
import { formatMessage } from 'umi/locale';
import { closeThenGoto } from '@/layouts/routerControl';
import { createConfirm } from '@/components/core/Confirm';
import DataTable from '@/components/common/DataTable';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { queryUdc } from '@/services/gen/app';
import FieldList from '@/components/layout/FieldList';
import Title from '@/components/layout/Title';
import { fromQs } from '@/utils/stringUtils';
import AbAccModal from './modal/AbAccModal';
import style from './index.less';

const DOMAIN = 'platResProfileFinance';
// 地址簿银行账户明细初始化
const abAccFormDataModel = {
  id: null,
  resId: null,
  accName: null, // 账户名称
  accType: null, // 账户类型
  accountNo: null, // 账号
  accStatus: null, // 状态
  currCode: null, // 币种
  holderName: null, // 开户人
  bankName: null, // 开户行
  bankCity: null, // 开户地
  bankBranch: null, // 开户网点
  defaultFlag: 0, // 是否默认
  remark: null, // 备注
};

@connect(({ loading, platResProfileFinance }) => ({
  platResProfileFinance,
  loading: loading.effects[`${DOMAIN}/query`],
}))
class FinanceInfo extends PureComponent {
  state = {
    abAccVisible: false, // 地址簿银行账户弹框显示
    abAccFormData: {
      ...abAccFormDataModel,
    },
  };

  componentDidMount() {
    this.fetchData({ sortBy: 'id', sortDirection: 'DESC' });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    const param = fromQs();
    dispatch({
      type: `${DOMAIN}/query`,
      payload: { resId: param.id },
    });
  };

  // 地址簿银行账户保存按钮事件
  abAccSubmitModal = () => {
    const { abAccVisible, abAccFormData } = this.state;
    const { dispatch } = this.props;
    // 获取url上的参数
    const param = fromQs();

    dispatch({
      type: `${DOMAIN}/abAccSave`,
      payload: { abAccFormData: { ...abAccFormData, resId: param.id } },
    }).then(reason => {
      if (!reason) {
        return;
      }
      this.setState({
        abAccVisible: !abAccVisible,
        abAccFormData,
      });
      this.fetchData();
    });
  };

  // 地址簿银行账户新增弹出窗。
  abAccToggleModal = () => {
    const { abAccVisible } = this.state;
    this.setState({
      abAccVisible: !abAccVisible,
      abAccFormData: {
        ...abAccFormDataModel,
      },
    });
  };

  // 地址簿银行账户修改弹出窗。
  abAccEditModal = selectedRow => {
    const { abAccVisible } = this.state;
    this.setState({
      abAccVisible: !abAccVisible,
      abAccFormData: {
        id: selectedRow.id,
        resId: selectedRow.resId,
        accName: selectedRow.accName,
        accType: selectedRow.accType,
        accountNo: selectedRow.accountNo,
        accStatus: selectedRow.accStatus,
        currCode: selectedRow.currCode,
        holderName: selectedRow.holderName,
        bankName: selectedRow.bankName,
        bankCity: selectedRow.bankCity,
        bankBranch: selectedRow.bankBranch,
        defaultFlag: selectedRow.defaultFlag,
        remark: selectedRow.remark,
      },
    });
  };

  // 提交按钮事件
  submitEvent = () => {
    const { dispatch } = this.props;
    const param = fromQs();
    dispatch({
      type: `${DOMAIN}/submit`,
      payload: { resId: param.id },
    });
  };

  render() {
    const {
      dispatch,
      loading,
      platResProfileFinance: { abAccDataSource, abAccTotal },
    } = this.props;
    const { abAccVisible, abAccFormData } = this.state;
    // 获取url上的参数
    const param = fromQs();

    // 地址簿银行账户表格
    const abAccTableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      loading: false,
      pagination: false,
      total: abAccTotal,
      dataSource: abAccDataSource,
      onChange: filters => {
        this.fetchData(filters);
      },
      onSearchBarChange: (changedValues, allValues) => {
        // console.log(changedValues, allValues);
      },
      showSearch: false,
      columns: [
        {
          title: '账户名称', // TODO: 国际化
          dataIndex: 'accName',
        },
        {
          title: '账号', // TODO: 国际化
          dataIndex: 'accountNo',
          align: 'center',
        },
        {
          title: '账户类型', // TODO: 国际化
          dataIndex: 'accTypeName',
          align: 'center',
        },
        {
          title: '币种', // TODO: 国际化
          dataIndex: 'currCodeName',
          align: 'center',
        },
        {
          title: '状态', // TODO: 国际化
          dataIndex: 'accStatusName',
          align: 'center',
        },
        {
          title: '是否默认', // TODO: 国际化
          dataIndex: 'defaultFlagName',
          align: 'center',
        },
        {
          title: '开户人', // TODO: 国际化
          dataIndex: 'holderName',
        },
        {
          title: '开户行', // TODO: 国际化
          dataIndex: 'bankName',
        },
        {
          title: '开户地', // TODO: 国际化
          dataIndex: 'bankCity',
        },
        {
          title: '开户网点', // TODO: 国际化
          dataIndex: 'bankBranch',
        },
        {
          title: '备注', // TODO: 国际化
          dataIndex: 'remark',
          render: (value, row, key) =>
            value && value.length > 15 ? (
              <Tooltip placement="left" title={value}>
                <pre>{`${value.substr(0, 15)}...`}</pre>
              </Tooltip>
            ) : (
              <pre>{value}</pre>
            ),
        },
      ],
      leftButtons: [
        {
          key: 'add',
          className: 'tw-btn-primary',
          icon: 'plus-circle',
          title: formatMessage({ id: `misc.insert`, desc: '新增' }),
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => this.abAccToggleModal(),
        },
        {
          key: 'edit',
          className: 'tw-btn-primary',
          icon: 'form',
          title: formatMessage({ id: `misc.update`, desc: '修改' }),
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => this.abAccEditModal(selectedRows[0]),
        },
        {
          key: 'remove',
          className: 'tw-btn-error',
          icon: 'file-excel',
          title: formatMessage({ id: `misc.delete`, desc: '删除' }),
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 2,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            createConfirm({
              content: '确认删除所选记录？',
              onOk: () =>
                dispatch({
                  type: `${DOMAIN}/delete`,
                  payload: { id: selectedRowKeys, queryParams: { resId: param.id } },
                }),
            });
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            icon="save"
            size="large"
            onClick={() => closeThenGoto(`/hr/res/profile/list/platform?id=${param.id}`)}
          >
            {formatMessage({ id: `misc.prevstep`, desc: '上一步' })}
          </Button>
          <Button
            className="tw-btn-primary"
            icon="save"
            size="large"
            onClick={() => this.submitEvent()}
          >
            {formatMessage({ id: `misc.commitapprove`, desc: '提交审批' })}
          </Button>
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => closeThenGoto('/hr/res/profile/list')}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        <Card
          className="tw-card-adjust"
          title={
            <Title icon="profile" id="ui.menu.plat.res.finance" defaultMessage="资源财务信息" />
          }
          bordered={false}
        >
          <DataTable {...abAccTableProps} />
        </Card>
        <AbAccModal
          abAccFormData={abAccFormData}
          visible={abAccVisible}
          handleCancel={this.abAccToggleModal}
          handleOk={this.abAccSubmitModal}
        />
      </PageHeaderWrapper>
    );
  }
}

export default FinanceInfo;
