import React, { PureComponent } from 'react';
import { connect } from 'dva';
import Debounce from 'lodash-decorators/debounce';
import Bind from 'lodash-decorators/bind';
import { Input } from 'antd';
import Link from 'umi/link';
import router from 'umi/router';
import { formatMessage } from 'umi/locale';
import { createConfirm } from '@/components/core/Confirm';
import DataTable from '@/components/common/DataTable';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import createMessage from '@/components/core/AlertMessage';
import { queryUdc } from '@/services/gen/app';
import { Selection } from '@/pages/gen/field';
import { selectBus } from '@/services/org/bu/bu';
import DetailModal from './DetailModal';

const DOMAIN = 'sysBasicSettlePrice';

// 当量结算定价明细初始化
const defaultFormData = {
  id: null,
  fromBuDealtype: null, // FromBU结算类型码
  toBuDealtype: null, // TOBU结算类型码
  fromBuId: null, // FromBU
  toBuId: null, // ToBU
  jobType1: null, // 工种
  jobType2: null, // 工种子类
  finYear: null, // 核算年度
  finPeriod: null, // 核算期间
  markupPercent: null, // markup百分比
  markupSolid: null, // markup固定金额
  absoluteAmt: null, // 结算绝对金额
};

@connect(({ loading, sysBasicSettlePrice }) => ({
  sysBasicSettlePrice,
  loading: loading.effects[`${DOMAIN}/query`],
}))
class SettlePrice extends PureComponent {
  state = {
    settlePriceVisible: false,
    formData: {
      ...defaultFormData,
    },
  };

  componentDidMount() {
    this.fetchData({ sortBy: 'id', sortDirection: 'ASC' });
  }

  // 当量结算定价新增弹出窗。
  settlePriceToggleModal = () => {
    const { dispatch } = this.props;
    const { settlePriceVisible } = this.state;
    dispatch({
      type: `${DOMAIN}/clean`,
    });
    this.setState({
      settlePriceVisible: !settlePriceVisible,
      formData: {
        ...defaultFormData,
      },
    });
  };

  // 当量结算定价修改弹出窗。
  settlePriceEditModal = selectedRow => {
    const { dispatch } = this.props;
    const { settlePriceVisible } = this.state;
    this.setState({
      settlePriceVisible: !settlePriceVisible,
      formData: { ...selectedRow },
    });
    dispatch({
      type: `${DOMAIN}/updateFinPeriod`,
      payload: selectedRow.finYear,
    });
    dispatch({
      type: `${DOMAIN}/updateJobType2`,
      payload: selectedRow.jobType1,
    });
  };

  // 当量结算定价保存按钮事件
  @Bind()
  @Debounce(400)
  settlePriceSubmitModal() {
    const { settlePriceVisible, formData } = this.state;
    const { dispatch } = this.props;

    dispatch({
      type: `${DOMAIN}/settlePriceSave`,
      payload: { formData: { ...formData } },
    }).then(reason => {
      if (!reason) {
        return;
      }
      this.setState({
        settlePriceVisible: !settlePriceVisible,
        formData,
      });
      this.fetchData();
    });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: params,
    });
  };

  render() {
    const {
      dispatch,
      loading,
      sysBasicSettlePrice: { dataSource, total },
    } = this.props;
    const { settlePriceVisible, formData } = this.state;

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      loading: false,
      total,
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
      searchBarForm: [
        {
          title: 'BU', // TODO: 国际化
          dataIndex: 'buSearchKey',
          tag: <Input placeholder="请输入BU编码或名称" />,
        },
        {
          title: '工种', // TODO: 国际化
          dataIndex: 'jobType1',
          tag: <Selection.UDC code="COM.JOB_TYPE1" placeholder="请选择工种" />,
        },
        {
          title: '核算年度', // TODO: 国际化
          dataIndex: 'finYear',
          tag: <Input placeholder="请输入核算年度" />,
        },
        {
          title: '核算期间', // TODO: 国际化
          dataIndex: 'finPeriod',
          tag: <Input placeholder="请输入核算期间" />,
        },
        {
          title: 'FROMBU结算类型码', // TODO: 国际化
          dataIndex: 'fromBuDealtype',
          tag: <Selection.UDC code="ORG.BU_SETTLE_TYPE" placeholder="请选择BU结算类型码" />,
        },
        {
          title: 'TOBU结算类型码', // TODO: 国际化
          dataIndex: 'toBuDealtype',
          tag: <Selection.UDC code="ORG.BU_SETTLE_TYPE" placeholder="请选择BU结算类型码" />,
        },
      ],
      columns: [
        {
          title: 'FROM BU结算类型码', // TODO: 国际化
          dataIndex: 'fromBuDealtypeName',
          align: 'center',
        },
        {
          title: 'TO BU结算类型码', // TODO: 国际化
          dataIndex: 'toBuDealtypeName',
          align: 'center',
        },
        {
          title: 'FROM BU编号', // TODO: 国际化
          dataIndex: 'fromBuNo',
        },
        {
          title: 'FROM BU名称', // TODO: 国际化
          dataIndex: 'fromBuName',
        },
        {
          title: 'TO BU编号', // TODO: 国际化
          dataIndex: 'toBuNo',
        },
        {
          title: 'TO BU名称', // TODO: 国际化
          dataIndex: 'toBuName',
        },
        {
          title: '工种', // TODO: 国际化
          dataIndex: 'jobType1Name',
          align: 'center',
        },
        {
          title: '工种子类', // TODO: 国际化
          dataIndex: 'jobType2Name',
          align: 'center',
        },
        {
          title: '资源',
          dataIndex: 'resName',
          align: 'center',
        },
        {
          title: '项目',
          dataIndex: 'projName',
          align: 'center',
        },
        {
          title: '核算年度', // TODO: 国际化
          dataIndex: 'finYear',
          align: 'center',
        },
        {
          title: '核算期间', // TODO: 国际化
          dataIndex: 'finPeriod',
          align: 'center',
        },
        {
          title: 'Markup百分比', // TODO: 国际化
          dataIndex: 'markupPercent',
          align: 'right',
        },
        {
          title: 'Markup固定金额', // TODO: 国际化
          dataIndex: 'markupSolid',
          align: 'right',
        },
        {
          title: '绝对结算金额', // TODO: 国际化
          dataIndex: 'absoluteAmt',
          align: 'right',
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
          cb: (selectedRowKeys, selectedRows, queryParams) => this.settlePriceToggleModal(),
        },
        {
          key: 'edit',
          className: 'tw-btn-primary',
          icon: 'form',
          title: formatMessage({ id: `misc.update`, desc: '修改' }),
          loading: false,
          hidden: false,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) =>
            this.settlePriceEditModal(selectedRows[0]),
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
                  payload: { id: selectedRowKeys, queryParams },
                }),
            });
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper>
        <DataTable {...tableProps} scroll={{ x: 2000 }} />
        <DetailModal
          formData={formData}
          visible={settlePriceVisible}
          handleCancel={this.settlePriceToggleModal}
          handleOk={this.settlePriceSubmitModal}
        />
      </PageHeaderWrapper>
    );
  }
}

export default SettlePrice;
