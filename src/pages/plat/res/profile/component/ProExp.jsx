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
import createMessage from '@/components/core/AlertMessage';
import ProExpModal from '../modal/ProExpModal';

const DOMAIN = 'platResProfileProjectExperience';
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
  platProjFlag: 'NO', // 是否平台内项目  默认 PLAT_PROJ_FLAG固定为“NO”
  platProjFlagDesc: '否', //  是否平台内项目
};
@connect(({ loading, platResProfileProjectExperience }) => ({
  platResProfileProjectExperience,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@mountToTab()
class ProExp extends PureComponent {
  state = {
    visible: false,
    formData: defaultVal,
  };

  componentDidMount() {
    this.fetchData();
  }

  fetchData = () => {
    const { dispatch } = this.props;
    const param = fromQs();
    dispatch({
      type: `${DOMAIN}/query`,
      payload: { resId: param.id },
    });
  };

  handleOk = () => {
    const { formData } = this.state;
    const { dispatch } = this.props;
    const param = fromQs();
    // console.warn(formData);
    dispatch({
      type: `${DOMAIN}/save`,
      payload: { formData: { ...formData, resId: param.id } },
    }).then(() => {
      this.setState({
        visible: false,
        formData,
      });
      this.fetchData();
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

  proExpRangeSofar = flag => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { proExpSofarFlag: flag },
    });
  };

  render() {
    const {
      dispatch,
      loading,
      platResProfileProjectExperience: { total, dataSource },
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
      loading: false,
      pagination: false,
      total,
      dataSource,
      showSearch: false,
      columns: [
        {
          title: '开始时间',
          dataIndex: 'dateFrom',
          render: val => (
            <div style={{ minWidth: '80px' }}>{val ? moment(val).format('YYYY-MM') : ''}</div>
          ),
          align: 'center',
        },
        {
          title: '结束时间',
          dataIndex: 'dateTo',
          render: val => (
            <div style={{ minWidth: '80px' }}>{val ? moment(val).format('YYYY-MM') : '至今'}</div>
          ),
          align: 'center',
        },
        {
          title: '项目名称',
          dataIndex: 'projName',
        },
        {
          title: '是否平台内项目',
          dataIndex: 'platProjFlagDesc',
          render: val => <div style={{ textAlign: 'center' }}>{val}</div>,
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
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            if (selectedRows.length === 1) {
              this.setState({
                visible: true,
                formData: {
                  ...selectedRows[0],
                },
              });
            } else {
              createMessage({ type: 'warn', description: '请勾选一行！' });
            }
          },
        },
        {
          key: 'remove',
          className: 'tw-btn-error',
          icon: 'file-excel',
          title: formatMessage({ id: `misc.delete`, desc: '删除' }),
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            if (selectedRows.length > 0) {
              let flag = false;
              selectedRows.forEach(ele => {
                if (ele.platProjFlag === 'YES') {
                  flag = true;
                }
              });
              if (flag) {
                createMessage({ type: 'warn', description: '平台内项目不能删除' });
                return;
              }
              createConfirm({
                content: '确认删除所选记录？',
                onOk: () =>
                  dispatch({
                    type: `${DOMAIN}/delete`,
                    payload: selectedRowKeys,
                  }),
              });
            } else {
              createMessage({ type: 'warn', description: '请勾选一行！' });
            }
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
          handleSofar={this.proExpRangeSofar}
        />
      </PageHeaderWrapper>
    );
  }
}

export default ProExp;
