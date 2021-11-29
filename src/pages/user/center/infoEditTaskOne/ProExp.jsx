import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Tooltip } from 'antd';
import moment from 'moment';
import { formatMessage } from 'umi/locale';
import { mountToTab } from '@/layouts/routerControl';
import { createConfirm } from '@/components/core/Confirm';
import DataTable from '@/components/common/DataTable';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { fromQs } from '@/utils/stringUtils';
import ProExpModal from '../modal/ProExpModal';
import { genFakeId } from '@/utils/mathUtils';

const DOMAIN = 'userCenterInfoDetail';
const defaultVal = {
  id: null,
  resId: null, // 资源id
  dateFrom: null, // 时间
  dateTo: null, // 时间
  company: null, // 学校
  dutyAchv: null, // 学历
  industry: null, // 学制
  product: null, // 专业
  projIntro: null, // 专业描述
  projName: null, // 专业描述
  projRole: null, // 专业描述
  remark: null, // 专业描述
};
@connect(({ loading, userCenterInfoDetail }) => ({
  userCenterInfoDetail,
  loading,
}))
@mountToTab()
class ProExp extends PureComponent {
  state = {
    visible: false,
    formData: defaultVal,
  };

  fetchData = () => {
    const { dispatch } = this.props;
    const param = fromQs();
    dispatch({
      type: `${DOMAIN}/queryProExp`,
      payload: { resId: param.id },
    });
  };

  handleOk = () => {
    const { formData } = this.state;

    const {
      userCenterInfoDetail: { twResProjLogTemporaryEntityAfter },
    } = this.props;

    if (formData.date && typeof formData.date[0] !== 'string') {
      formData.dateFrom = formData.date[0].format('YYYY-MM-DD');
    }
    if (formData.date && typeof formData.date[1] !== 'string') {
      formData.dateTo = formData.date[1].format('YYYY-MM-DD');
    }
    formData.dateView = `${formData.dateFrom}至${formData.dateTo}`;

    const tt = twResProjLogTemporaryEntityAfter.filter(v => v.id === formData.id);
    if (!tt.length) {
      twResProjLogTemporaryEntityAfter.push({ ...formData, id: genFakeId(-1), update: 1 });
    } else {
      twResProjLogTemporaryEntityAfter.forEach((v, index) => {
        if (v.id === formData.id) {
          twResProjLogTemporaryEntityAfter[index] = { ...formData, update: 1 };
        }
      });
    }

    this.setState({
      visible: false,
      formData,
    });
  };

  handleCancel = () => {
    this.setState({
      visible: false,
      formData: {
        ...defaultVal,
      },
    });
  };

  // 教育经历修改弹出窗。
  proExpEditModal = selectedRow => {
    const { visible } = this.state;
    this.setState({
      visible: !visible,
      formData: {
        ...selectedRow,
      },
    });
  };

  render() {
    const {
      dispatch,
      loading,
      userCenterInfoDetail: { twResProjLogTemporaryEntityAfter, projlogdelId, projlogTotal },
    } = this.props;

    const { visible, formData } = this.state;
    // 获取url上的参数
    const param = fromQs();

    // 教育经历表格
    const tableProps = {
      rowKey: 'id',
      // columnsCache: DOMAIN,
      // scroll: {
      //   x: '150%',
      // },
      columnsCache: 'tableProps',
      loading: loading.effects[`${DOMAIN}/queryProExp`],
      pagination: false,
      total: projlogTotal,
      dataSource: twResProjLogTemporaryEntityAfter,
      showSearch: false,
      columns: [
        {
          title: '开始时间',
          dataIndex: 'dateFrom',
          render: val => moment(val).format('YYYY-MM'),
          width: 70,
        },
        {
          title: '结束时间',
          dataIndex: 'dateTo',
          render: val => moment(val).format('YYYY-MM'),
          width: 70,
        },
        {
          title: '项目名称',
          dataIndex: 'projName',
        },
        {
          title: '相关产品',
          dataIndex: 'product',
        },
        {
          title: '相关行业',
          dataIndex: 'industry',
        },
        {
          title: '项目角色',
          dataIndex: 'projRole',
        },
        {
          title: '所在公司',
          dataIndex: 'company',
        },
        {
          title: '项目简介',
          dataIndex: 'projIntro',
          render: (value, row, key) =>
            value && value.length > 15 ? (
              <Tooltip placement="left" title={value}>
                <pre>{`${value.substr(0, 15)}...`}</pre>
              </Tooltip>
            ) : (
              <pre>{value}</pre>
            ),
        },
        {
          title: '职责&业绩',
          dataIndex: 'dutyAchv',
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
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            this.setState({
              visible: true,
              formData: {
                ...defaultVal,
              },
            });
          },
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
          cb: (selectedRowKeys, selectedRows, queryParams) => this.proExpEditModal(selectedRows[0]),
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
                const newDataSource = twResProjLogTemporaryEntityAfter.filter(
                  row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length
                );
                dispatch({
                  type: `${DOMAIN}/updateState`,
                  payload: {
                    twResProjLogTemporaryEntityAfter: newDataSource,
                    projlogdelId: [...projlogdelId, ...selectedRowKeys],
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
        <DataTable {...tableProps} />

        <ProExpModal
          formData={formData}
          visible={visible}
          handleCancel={this.handleCancel}
          handleOk={this.handleOk}
        />
      </PageHeaderWrapper>
    );
  }
}

export default ProExp;
