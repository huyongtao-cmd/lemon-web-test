import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Tooltip } from 'antd';
import { formatMessage } from 'umi/locale';
import { createConfirm } from '@/components/core/Confirm';
import DataTable from '@/components/common/DataTable';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { fromQs } from '@/utils/stringUtils';
import AbAccModal from '../modal/AbAccModal';
import { genFakeId } from '@/utils/mathUtils';

const DOMAIN = 'userCenterInfoDetail';
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
  defaultFlag: null, // 是否默认
  remark: null, // 备注
};

@connect(({ loading, userCenterInfoDetail }) => ({
  userCenterInfoDetail,
  loading,
}))
class Finance extends PureComponent {
  state = {
    abAccVisible: false, // 地址簿银行账户弹框显示
    abAccFormData: {
      ...abAccFormDataModel,
    },
  };

  fetchData = params => {
    const { dispatch } = this.props;
    const param = fromQs();
    dispatch({
      type: `${DOMAIN}/queryFinance`,
      payload: { resId: param.id },
    });
  };

  // 地址簿银行账户保存按钮事件
  abAccSubmitModal = () => {
    const { abAccVisible, abAccFormData } = this.state;
    const {
      userCenterInfoDetail: { twAbAccTemporaryEntityAfter },
    } = this.props;

    const tt = twAbAccTemporaryEntityAfter.filter(v => v.id === abAccFormData.id);
    if (!tt.length) {
      twAbAccTemporaryEntityAfter.push({ ...abAccFormData, id: genFakeId(-1), update: 1 });
    } else {
      twAbAccTemporaryEntityAfter.forEach((v, index) => {
        if (v.id === abAccFormData.id) {
          twAbAccTemporaryEntityAfter[index] = { ...abAccFormData, update: 1 };
        }
      });
    }

    this.setState({
      abAccVisible: !abAccVisible,
      abAccFormData,
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
        ...selectedRow,
      },
    });
  };

  render() {
    const {
      dispatch,
      loading,
      userCenterInfoDetail: { twAbAccTemporaryEntityAfter, abAccTotal, abAccdelId },
    } = this.props;
    const { abAccVisible, abAccFormData } = this.state;

    // 地址簿银行账户表格
    const abAccTableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      loading: loading.effects[`${DOMAIN}/queryFinance`],
      pagination: false,
      total: abAccTotal,
      dataSource: twAbAccTemporaryEntityAfter,
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
          title: '是否工资卡', // TODO: 国际化
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
              onOk: () => {
                const newDataSource = twAbAccTemporaryEntityAfter.filter(
                  row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length
                );
                dispatch({
                  type: `${DOMAIN}/updateState`,
                  payload: {
                    twAbAccTemporaryEntityAfter: newDataSource,
                    abAccdelId: [...abAccdelId, ...selectedRowKeys],
                  },
                });
              },
            });
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper>
        <DataTable {...abAccTableProps} />
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

export default Finance;
