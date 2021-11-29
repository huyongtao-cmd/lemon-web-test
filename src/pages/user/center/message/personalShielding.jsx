import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Input } from 'antd';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import Title from '@/components/layout/Title';
import DataTable from '@/components/common/DataTable';
import { mountToTab } from '@/layouts/routerControl';
import Link from 'umi/link';
import router from 'umi/router';
import { formatMessage } from 'umi/locale';
import { fromQs } from '@/utils/stringUtils';
import { getUrl } from '@/utils/flowToRouter';
import { stringify } from 'qs';
import { Selection } from '@/pages/gen/field';
import ShieldingInsertModal from './shieldingInsertModal';
import { createConfirm } from '@/components/core/Confirm';

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];
const DOMAIN = 'messageConfigPersonalShielding';

@connect(({ loading, dispatch, messageConfigPersonalShielding, user }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  dispatch,
  messageConfigPersonalShielding,
  user,
}))
@mountToTab()
class MessageConfigPersonalShielding extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      insertModalVisible: false,
    };
  }

  componentDidMount() {
    const { dispatch, user } = this.props;
    dispatch({ type: `${DOMAIN}/res` });
    dispatch({ type: `${DOMAIN}/cleanSearchForm` });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: {
        ...params,
        personalFlag: true,
      },
    });
  };

  showShieledingInsertModal = () => {
    this.setState({
      insertModalVisible: true,
    });
  };

  closeModal = flag => {
    this.setState({
      insertModalVisible: false,
    });
  };

  handleDelete = id => {
    const { dispatch } = this.props;
    if (id) {
      createConfirm({
        content: '确认删除所选记录？',
        onOk: () =>
          dispatch({
            type: `${DOMAIN}/delete`,
            payload: {
              ids: id,
            },
          }),
      });
    }
  };

  render() {
    const {
      dispatch,
      loading,
      messageConfigPersonalShielding: { list, total, searchForm, resDataSource },
    } = this.props;
    const { insertModalVisible } = this.state;
    const tableProps = {
      columnsCache: DOMAIN,
      dispatch,
      loading,
      expirys: 0,
      rowKey: 'id',
      sortBy: 'id',
      sortDirection: 'DESC',
      dataSource: list,
      total,
      onChange: filters => {
        this.fetchData(filters);
      },
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      enableSelection: false,
      searchBarForm: [
        {
          title: '发布来源',
          dataIndex: 'releaseSource',
          options: {
            initialValue: searchForm.releaseSource,
          },
          tag: <Input placeholder="请输入发布来源" />,
        },
        {
          title: '编码',
          dataIndex: 'configurationNo',
          options: {
            initialValue: searchForm.configurationNo,
          },
          tag: <Input placeholder="请输入编码" />,
        },
      ],
      columns: [
        {
          title: '发布来源',
          align: 'center',
          dataIndex: 'releaseSource',
          key: 'releaseSource',
        },
        {
          title: '编码',
          align: 'center',
          dataIndex: 'configurationNo',
          key: 'configurationNo',
        },
        {
          title: '操作',
          align: 'center',
          dataIndex: 'operation',
          key: 'operation',
          render: (value, row, index) => (
            <a
              onClick={e => {
                this.handleDelete(row.id);
              }}
            >
              删除
            </a>
          ),
        },
      ],
      leftButtons: [
        {
          key: 'add',
          icon: 'plus-circle',
          className: 'tw-btn-primary',
          title: formatMessage({ id: 'misc.insert', desc: '新增' }),
          loading: false,
          hidden: false,
          disabled: loading,
          minSelections: 0,
          cb: () => this.showShieledingInsertModal(),
        },
      ],
    };

    return (
      <PageHeaderWrapper title="消息通知配置屏蔽列表">
        <DataTable {...tableProps} />
        {insertModalVisible ? (
          <ShieldingInsertModal
            insertModalVisible={insertModalVisible}
            closeModal={this.closeModal}
          />
        ) : null}
      </PageHeaderWrapper>
    );
  }
}

export default MessageConfigPersonalShielding;
