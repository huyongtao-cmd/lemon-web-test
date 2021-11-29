import React, { PureComponent } from 'react';
import { connect } from 'dva';
import Debounce from 'lodash-decorators/debounce';
import Bind from 'lodash-decorators/bind';
import { Button, Card, Tooltip } from 'antd';
import router from 'umi/router';
import classnames from 'classnames';
import { formatMessage } from 'umi/locale';
import { createConfirm } from '@/components/core/Confirm';
import DataTable from '@/components/common/DataTable';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { queryUdc } from '@/services/gen/app';
import FieldList from '@/components/layout/FieldList';
import { fromQs } from '@/utils/stringUtils';
import { FileManagerEnhance } from '@/pages/gen/field';
import BuEqvaModal from '../Modal/BuEqvaModal';

const DOMAIN = 'orgbuEqva';
// 资源当量收入明细初始化
const formDataModel = {
  id: null,
  buId: null,
  finYear: null, // 年度
  finPeriod: null, // 期间
  jobType: null, // 工种
  jobType2: null, // 工种子类
  coopType: null, // 合作方式
  cityLevel: null, // 城市级别
  resId: null, // 资源
  preeqvaAmt: null, // 单位当量收入
  lineStatus: 'ACTIVE', // 状态
  remark: null, // 备注
};

@connect(({ loading, orgbuEqva }) => ({
  orgbuEqva,
  loading: loading.effects[`${DOMAIN}/query`],
}))
class BuEqva extends PureComponent {
  state = {
    buEqvaVisible: false, // 资源当量收入弹框显示
    formData: {
      ...formDataModel,
    },
  };

  componentDidMount() {
    const { dispatch, buId } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: buId,
    });
  }

  // 资源当量收入新增弹出窗。
  buEqvaToggleModal = () => {
    const { buEqvaVisible } = this.state;
    this.setState({
      buEqvaVisible: !buEqvaVisible,
      formData: {
        ...formDataModel,
      },
    });
  };

  // 资源当量收入修改弹出窗。
  buEqvaEditModal = selectedRow => {
    const { dispatch } = this.props;
    const { buEqvaVisible } = this.state;
    if (selectedRow.finYear) {
      dispatch({
        type: `${DOMAIN}/updateFinPeriod`,
        payload: selectedRow.finYear,
      });
    }
    if (selectedRow.jobType) {
      dispatch({
        type: `${DOMAIN}/updateJobType2`,
        payload: selectedRow.jobType,
      });
    }
    this.setState({
      buEqvaVisible: !buEqvaVisible,
      formData: { ...selectedRow },
    });
  };

  // 资源当量收入复制弹出窗。
  buEqvaCopyModal = selectedRow => {
    const { dispatch } = this.props;
    const { buEqvaVisible } = this.state;
    if (selectedRow.finYear) {
      dispatch({
        type: `${DOMAIN}/updateFinPeriod`,
        payload: selectedRow.finYear,
      });
    }
    if (selectedRow.jobType) {
      dispatch({
        type: `${DOMAIN}/updateJobType2`,
        payload: selectedRow.jobType,
      });
    }
    this.setState({
      buEqvaVisible: !buEqvaVisible,
      formData: {
        id: null,
        buId: selectedRow.buId,
        finYear: selectedRow.finYear,
        finPeriod: selectedRow.finPeriod,
        jobType: selectedRow.jobType,
        jobType2: selectedRow.jobType2,
        coopType: selectedRow.coopType,
        cityLevel: selectedRow.cityLevel,
        resId: selectedRow.resId,
        preeqvaAmt: selectedRow.preeqvaAmt,
        lineStatus: selectedRow.lineStatus,
        remark: selectedRow.remark,
      },
    });
  };

  // 资源当量收入保存按钮事件
  @Bind()
  @Debounce(400)
  buEqvaSubmitModal() {
    const { buEqvaVisible, formData } = this.state;
    const { dispatch, buId } = this.props;

    dispatch({
      type: `${DOMAIN}/save`,
      payload: { formData: { ...formData, buId } },
    }).then(reason => {
      if (!reason) {
        return;
      }
      this.setState({
        buEqvaVisible: !buEqvaVisible,
        formData,
      });
      dispatch({
        type: `${DOMAIN}/query`,
        payload: buId,
      });
    });
  }

  render() {
    const {
      dispatch,
      loading,
      buId,
      orgbuEqva: { dataList, total },
    } = this.props;
    const { buEqvaVisible, formData } = this.state;
    // 获取url上的参数
    const param = fromQs();

    // 资源当量收入表格
    const buEqvaTableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      loading: false,
      pagination: false,
      total,
      dataSource: dataList,
      onChange: filters => {
        this.fetchData(filters);
      },
      onSearchBarChange: (changedValues, allValues) => {
        // console.log(changedValues, allValues);
      },
      showSearch: false,
      columns: [
        {
          title: '年度', // TODO: 国际化
          dataIndex: 'finYear',
          align: 'right',
        },
        {
          title: '期间', // TODO: 国际化
          dataIndex: 'finPeriod',
          align: 'right',
        },
        {
          title: '工种', // TODO: 国际化
          dataIndex: 'jobTypeName',
          align: 'center',
        },
        {
          title: '工种子类', // TODO: 国际化
          dataIndex: 'jobType2Name',
          align: 'center',
        },
        {
          title: '合作方式', // TODO: 国际化
          dataIndex: 'coopTypeDesc',
          align: 'center',
        },
        {
          title: '城市级别', // TODO: 国际化
          dataIndex: 'cityLevelDesc',
          align: 'center',
        },
        {
          title: '资源名称', // TODO: 国际化
          dataIndex: 'resName',
        },
        {
          title: '单位当量收入', // TODO: 国际化
          dataIndex: 'preeqvaAmt',
          align: 'right',
        },
        {
          title: '状态', // TODO: 国际化
          dataIndex: 'lineStatusDesc',
          align: 'center',
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
          cb: (selectedRowKeys, selectedRows, queryParams) => this.buEqvaToggleModal(),
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
          cb: (selectedRowKeys, selectedRows, queryParams) => this.buEqvaEditModal(selectedRows[0]),
        },
        {
          key: 'copy',
          className: 'tw-btn-primary',
          icon: 'plus-circle',
          title: formatMessage({ id: `misc.copy`, desc: '复制' }),
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => this.buEqvaCopyModal(selectedRows[0]),
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
                  payload: { ids: selectedRowKeys, buId },
                }),
            });
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper>
        <DataTable {...buEqvaTableProps} />
        <BuEqvaModal
          formData={formData}
          visible={buEqvaVisible}
          handleCancel={this.buEqvaToggleModal}
          handleOk={this.buEqvaSubmitModal}
        />
      </PageHeaderWrapper>
    );
  }
}

export default BuEqva;
