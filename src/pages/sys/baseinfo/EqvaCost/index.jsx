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
import { Selection } from '@/pages/gen/field';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import createMessage from '@/components/core/AlertMessage';
import { queryUdc } from '@/services/gen/app';
import { selectBus } from '@/services/org/bu/bu';
import DetailModal from './DetailModal';

const DOMAIN = 'sysBasicEqvaCost';

// 当量成本明细初始化
const defaultFormData = {
  id: null,
  busifieldType: null, // 平台编号
  buId: null, // BUID
  eqvaName: null, // 当量名称
  jobType1: null, // 工种
  jobType2: null, // 工种子类
  finYear: null, // 核算年度
  finPeriod: null, // 核算期间
  eqvaCost: null, // 当量成本
  remark: null, // 备注
};

@connect(({ loading, sysBasicEqvaCost }) => ({
  sysBasicEqvaCost,
  loading: loading.effects[`${DOMAIN}/query`],
}))
class EqvaCost extends PureComponent {
  state = {
    eqvaCostVisible: false,
    eqvaCostFormData: {
      ...defaultFormData,
    },
  };

  componentDidMount() {
    this.fetchData({ sortBy: 'id', sortDirection: 'ASC' });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: params,
    });
  };

  // 当量成本新增弹出窗。
  eqvaCostToggleModal = () => {
    const { dispatch } = this.props;
    const { eqvaCostVisible } = this.state;
    dispatch({
      type: `${DOMAIN}/clean`,
    });
    this.setState({
      eqvaCostVisible: !eqvaCostVisible,
      eqvaCostFormData: {
        ...defaultFormData,
      },
    });
  };

  // 当量成本修改弹出窗。
  eqvaCostEditModal = selectedRow => {
    const { dispatch } = this.props;
    const { eqvaCostVisible } = this.state;
    this.setState({
      eqvaCostVisible: !eqvaCostVisible,
      eqvaCostFormData: {
        id: selectedRow.id,
        busifieldType: selectedRow.busifieldType,
        buId: selectedRow.buId,
        eqvaName: selectedRow.eqvaName,
        jobType1: selectedRow.jobType1,
        jobType2: selectedRow.jobType2,
        finYear: selectedRow.finYear,
        finPeriod: selectedRow.finPeriod,
        eqvaCost: selectedRow.eqvaCost,
      },
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

  // 当量成本保存按钮事件
  @Bind()
  @Debounce(400)
  eqvaCostSubmitModal() {
    const { eqvaCostVisible, eqvaCostFormData } = this.state;
    const { dispatch } = this.props;

    dispatch({
      type: `${DOMAIN}/eqvaCostSave`,
      payload: { eqvaCostFormData: { ...eqvaCostFormData } },
    }).then(reason => {
      if (!reason) {
        return;
      }
      this.setState({
        eqvaCostVisible: !eqvaCostVisible,
        eqvaCostFormData,
      });
      this.fetchData();
    });
  }

  render() {
    const {
      dispatch,
      loading,
      sysBasicEqvaCost: { dataSource, total },
    } = this.props;
    const { eqvaCostVisible, eqvaCostFormData } = this.state;

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
          title: '工种', // TODO: 国际化
          dataIndex: 'jobType1',
          tag: <Selection source={() => queryUdc('COM.JOB_TYPE1')} placeholder="请选择工种" />,
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
          title: '平台', // TODO: 国际化
          dataIndex: 'busifieldType',
          tag: <Selection source={() => queryUdc('COM.BUSIFIELD_TYPE')} placeholder="请选择平台" />,
        },
        {
          title: 'BU', // TODO: 国际化
          dataIndex: 'buId',
          tag: <Selection source={() => selectBus()} placeholder="请选择BU" />,
        },
      ],
      columns: [
        {
          title: '平台', // TODO: 国际化
          dataIndex: 'busifieldTypeName',
          align: 'center',
        },
        {
          title: 'BU编号', // TODO: 国际化
          dataIndex: 'buNo',
          align: 'center',
        },
        {
          title: 'BU名称', // TODO: 国际化
          dataIndex: 'buName',
          align: 'center',
        },
        {
          title: '当量名称', // TODO: 国际化
          dataIndex: 'eqvaNameDesc',
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
          title: '核算年度', // TODO: 国际化
          dataIndex: 'finYear',
          align: 'center',
          // sorter: true,
          // defaultSortOrder: 'descend',
        },
        {
          title: '核算期间', // TODO: 国际化
          dataIndex: 'finPeriod',
          align: 'center',
          // sorter: true,
          // defaultSortOrder: 'descend',
        },
        {
          title: '当量成本', // TODO: 国际化
          dataIndex: 'eqvaCost',
          align: 'right',
          // sorter: true,
          // defaultSortOrder: 'descend',
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
          cb: (selectedRowKeys, selectedRows, queryParams) => this.eqvaCostToggleModal(),
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
            this.eqvaCostEditModal(selectedRows[0]),
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
        <DataTable {...tableProps} />
        <DetailModal
          eqvaCostFormData={eqvaCostFormData}
          visible={eqvaCostVisible}
          handleCancel={this.eqvaCostToggleModal}
          handleOk={this.eqvaCostSubmitModal}
        />
      </PageHeaderWrapper>
    );
  }
}

export default EqvaCost;
