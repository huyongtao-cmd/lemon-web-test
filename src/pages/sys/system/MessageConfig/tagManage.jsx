import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Input, Button } from 'antd';
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
import TagInsertModal from './tagInsertModal';
import { createConfirm } from '@/components/core/Confirm';

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];
const DOMAIN = 'messageConfigTag';

@connect(({ loading, dispatch, messageConfigTag, user }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  dispatch,
  messageConfigTag,
  user,
}))
@mountToTab()
class MessageConfigTag extends PureComponent {
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
      payload: params,
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
      user: {
        user: { admin },
      },
      messageConfigTag: { list, total, searchForm },
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
          title: '标签编号',
          dataIndex: 'tagNo',
          options: {
            initialValue: searchForm.tagNo,
          },
          tag: <Input placeholder="请输入标签编号" />,
        },
        {
          title: '标签名称',
          dataIndex: 'messageTagName',
          options: {
            initialValue: searchForm.messageTagName,
          },
          tag: <Input placeholder="请输入标签名称" />,
        },
        {
          title: '标签级别',
          dataIndex: 'tagLevel',
          options: {
            initialValue: searchForm.tagLevel,
          },
          tag: <Input placeholder="标签级别" />,
        },
      ],
      columns: [
        {
          title: '标签编号',
          align: 'center',
          dataIndex: 'tagNo',
          key: 'tagNo',
        },
        {
          title: '标签名称',
          align: 'center',
          dataIndex: 'tagName',
          key: 'tagName',
        },
        {
          title: '标签级别',
          align: 'center',
          dataIndex: 'tagLevel',
          key: 'tagLevel',
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
      <PageHeaderWrapper title="消息通知配置标签列表">
        <DataTable {...tableProps} />
        {insertModalVisible ? (
          <TagInsertModal insertModalVisible={insertModalVisible} closeModal={this.closeModal} />
        ) : null}
      </PageHeaderWrapper>
    );
  }
}

export default MessageConfigTag;
