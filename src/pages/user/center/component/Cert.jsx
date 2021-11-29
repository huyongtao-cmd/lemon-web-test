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
import { genFakeId } from '@/utils/mathUtils';
import { fromQs } from '@/utils/stringUtils';
import { FileManagerEnhance } from '@/pages/gen/field';
import CertModal from '../modal/CertModal';
import style from './index.less';

const DOMAIN = 'platResProfileBackground';

// 资质证书明细初始化
const certFormDataModel = {
  id: null,
  resId: null, // 资源id
  certName: null, // 证书名称
  certNo: null, // 证书号码
  certStatus: null, // 状态
  obtainDate: null, // 获得时间
  validType: null, // 有效期类型
  validMonths: null, // 有效期长
  lastRenewDate: null, // 上次认证时间
  attache: null, // 证书附件
  score: null, // 分数
  grade: null, // 等级
  releaseBy: null, // 颁发机构
  sourceType: null, // 来源
  certDesc: null, // 说明
};

@connect(({ loading, platResProfileBackground }) => ({
  platResProfileBackground,
  loading: loading.effects[`${DOMAIN}/queryCert`],
}))
class CertInfo extends PureComponent {
  state = {
    certVisible: false, // 资质证书弹框显示
    certFormData: {
      ...certFormDataModel,
    },
  };

  componentDidMount() {
    this.fetchData({ sortBy: 'id', sortDirection: 'DESC' });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    const param = fromQs();
    dispatch({
      type: `${DOMAIN}/queryCert`,
      payload: { resId: param.id },
    });
  };

  // 资质证书保存按钮事件
  certSubmitModal = () => {
    const { certVisible, certFormData } = this.state;
    const { dispatch } = this.props;
    // 获取url上的参数
    const param = fromQs();

    dispatch({
      type: `${DOMAIN}/certSave`,
      payload: { certFormData: { ...certFormData, resId: param.id } },
    }).then(reason => {
      if (!reason) {
        return;
      }
      this.setState({
        certVisible: !certVisible,
        certFormData,
      });
      this.fetchData();
    });
  };

  // 资质证书新增弹出窗。
  certToggleModal = () => {
    const { certVisible } = this.state;
    this.setState({
      certVisible: !certVisible,
      certFormData: {
        ...certFormDataModel,
      },
    });
  };

  // 资质证书修改弹出窗。
  certEditModal = selectedRow => {
    const { certVisible } = this.state;
    this.setState({
      certVisible: !certVisible,
      certFormData: {
        id: selectedRow.id,
        resId: selectedRow.resId,
        certName: selectedRow.certName,
        certNo: selectedRow.certNo,
        certStatus: selectedRow.certStatus,
        obtainDate: selectedRow.obtainDate,
        validType: selectedRow.validType,
        validMonths: selectedRow.validMonths,
        lastRenewDate: selectedRow.lastRenewDate,
        attache: selectedRow.attache,
        score: selectedRow.score,
        grade: selectedRow.grade,
        releaseBy: selectedRow.releaseBy,
        sourceType: selectedRow.sourceType,
        certDesc: selectedRow.certDesc,
      },
    });
  };

  render() {
    const {
      dispatch,
      loading,
      platResProfileBackground: { certDataSource, certTotal },
    } = this.props;
    const { certVisible, certFormData } = this.state;
    // 获取url上的参数
    const param = fromQs();

    // 资质证书表格
    const certTableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      loading: false,
      pagination: false,
      total: certTotal,
      dataSource: certDataSource,
      onChange: filters => {
        this.fetchData(filters);
      },
      onSearchBarChange: (changedValues, allValues) => {
        // console.log(changedValues, allValues);
      },
      showSearch: false,
      columns: [
        {
          title: '证书名称', // TODO: 国际化
          dataIndex: 'certName',
        },
        {
          title: '证书号码', // TODO: 国际化
          dataIndex: 'certNo',
          align: 'center',
        },
        {
          title: '状态', // TODO: 国际化
          dataIndex: 'certStatusName',
          align: 'center',
        },
        {
          title: '获得时间', // TODO: 国际化
          dataIndex: 'obtainDate',
        },
        {
          title: '有效期长（月）', // TODO: 国际化
          dataIndex: 'validMonths',
          align: 'right',
        },
        {
          title: '上次认证时间', // TODO: 国际化
          dataIndex: 'lastRenewDate',
        },
        {
          title: '到期日', // TODO: 国际化
          dataIndex: 'dueDate',
        },
        {
          title: '证书附件', // TODO: 国际化
          dataIndex: 'attache',
          render: (value, row, key) => (
            <FileManagerEnhance
              api="/api/person/v1/res/cert/sfs/token"
              dataKey={row.id}
              listType="text"
              disabled
              preview
              key={genFakeId(-1)}
            />
          ),
        },
        {
          title: '分数', // TODO: 国际化
          dataIndex: 'score',
          align: 'right',
        },
        {
          title: '等级', // TODO: 国际化
          dataIndex: 'grade',
        },
        {
          title: '颁发机构', // TODO: 国际化
          dataIndex: 'releaseBy',
        },
        {
          title: '来源', // TODO: 国际化
          dataIndex: 'sourceTypeName',
          align: 'center',
        },
        {
          title: '说明', // TODO: 国际化
          dataIndex: 'certDesc',
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
          cb: (selectedRowKeys, selectedRows, queryParams) => this.certToggleModal(),
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
          cb: (selectedRowKeys, selectedRows, queryParams) => this.certEditModal(selectedRows[0]),
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
                  type: `${DOMAIN}/deleteCert`,
                  payload: { id: selectedRowKeys, queryParams: { resId: param.id } },
                }),
            });
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper>
        <DataTable {...certTableProps} scroll={{ x: 2000 }} />
        <CertModal
          certFormData={certFormData}
          visible={certVisible}
          handleCancel={this.certToggleModal}
          handleOk={this.certSubmitModal}
        />
      </PageHeaderWrapper>
    );
  }
}

export default CertInfo;
