import React, { PureComponent } from 'react';
import { connect } from 'dva';
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
import GetrpModal from '../modal/GetrpModal';
import style from './index.less';

const DOMAIN = 'platResProfileGetrp';
// 奖惩信息明细初始化
const getrpFormDataModel = {
  id: null,
  resId: null,
  obtainTime: null, // 时间
  rpName: null, // 奖惩名称
  rpType: null, // 奖惩区分
  expireDate: null, // 到期日
  reasonDesc: null, // 原因
};

@connect(({ loading, platResProfileGetrp }) => ({
  platResProfileGetrp,
  loading: loading.effects[`${DOMAIN}/query`],
}))
class Getrp extends PureComponent {
  state = {
    getrpVisible: false, // 奖惩信息弹框显示
    getrpFormData: {
      ...getrpFormDataModel,
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

  // 奖惩信息保存按钮事件
  getrpSubmitModal = () => {
    const { getrpVisible, getrpFormData } = this.state;
    const { dispatch } = this.props;
    // 获取url上的参数
    const param = fromQs();

    dispatch({
      type: `${DOMAIN}/getrpSave`,
      payload: { getrpFormData: { ...getrpFormData, resId: param.id } },
    }).then(reason => {
      this.setState({
        getrpVisible: !getrpVisible,
        getrpFormData,
      });
      this.fetchData();
    });
  };

  // 奖惩信息新增弹出窗。
  getrpToggleModal = () => {
    const { getrpVisible } = this.state;
    this.setState({
      getrpVisible: !getrpVisible,
      getrpFormData: {
        ...getrpFormDataModel,
      },
    });
  };

  // 奖惩信息修改弹出窗。
  getrpEditModal = selectedRow => {
    const { getrpVisible } = this.state;
    this.setState({
      getrpVisible: !getrpVisible,
      getrpFormData: {
        id: selectedRow.id,
        resId: selectedRow.resId,
        obtainTime: selectedRow.obtainTime,
        rpName: selectedRow.rpName,
        rpType: selectedRow.rpType,
        expireDate: selectedRow.expireDate,
        reasonDesc: selectedRow.reasonDesc,
      },
    });
  };

  render() {
    const {
      dispatch,
      loading,
      platResProfileGetrp: { dataSource, total },
    } = this.props;
    const { getrpVisible, getrpFormData } = this.state;
    // 获取url上的参数
    const param = fromQs();

    // 奖惩信息表格
    const getrpTableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      loading: false,
      pagination: false,
      total,
      dataSource,
      onChange: filters => {
        this.fetchData(filters);
      },
      onSearchBarChange: (changedValues, allValues) => {
        // console.log(changedValues, allValues);
      },
      showSearch: false,
      columns: [
        {
          title: '时间', // TODO: 国际化
          dataIndex: 'obtainTime',
        },
        {
          title: '奖惩名称', // TODO: 国际化
          dataIndex: 'rpName',
        },
        {
          title: '奖惩区分', // TODO: 国际化
          dataIndex: 'rpTypeName',
          align: 'center',
        },
        {
          title: '到期日', // TODO: 国际化
          dataIndex: 'expireDate',
        },
        {
          title: '证书', // TODO: 国际化
          dataIndex: 'id',
          render: (value, row, key) => (
            <FileManagerEnhance
              api="/api/person/v1/res/getrps/sfs/token"
              dataKey={value}
              listType="text"
              disabled
              preview
            />
          ),
        },
        {
          title: '原因', // TODO: 国际化
          dataIndex: 'reasonDesc',
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
          cb: (selectedRowKeys, selectedRows, queryParams) => this.getrpToggleModal(),
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
          cb: (selectedRowKeys, selectedRows, queryParams) => this.getrpEditModal(selectedRows[0]),
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
        <DataTable {...getrpTableProps} />
        <GetrpModal
          getrpFormData={getrpFormData}
          visible={getrpVisible}
          handleCancel={this.getrpToggleModal}
          handleOk={this.getrpSubmitModal}
        />
      </PageHeaderWrapper>
    );
  }
}

export default Getrp;
