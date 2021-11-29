import React, { PureComponent } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import { Input, Radio } from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import SyntheticField from '@/components/common/SyntheticField';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import BusinessSceneManageModal from './BusinessSceneManageModal';
import createMessage from '@/components/core/AlertMessage';
import { Selection } from '@/pages/gen/field';
import { fromQs } from '@/utils/stringUtils';

const DOMAIN = 'businessSceneManage';

@connect(({ loading, businessSceneManage, dispatch }) => ({
  dispatch,
  loading: loading.effects[`${DOMAIN}/query`],
  businessSceneManage,
}))
@mountToTab()
class BusinessSceneManage extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      businessPageMainModalVisible: false,
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/cleanSearchForm` });
    dispatch({ type: `${DOMAIN}/cleanFilters` });
    this.fetchData({
      offset: 0,
      limit: 10,
      sceneKey: null,
      sceneName: null,
    });
  }

  fetchData = async params => {
    const { dispatch } = this.props;
    const { id } = fromQs();
    dispatch({ type: `${DOMAIN}/query`, payload: { pageId: id, ...params } });
  };

  handlePageConfirm = () => {
    const {
      businessSceneManage: { filters },
    } = this.props;
    this.setState({ businessPageMainModalVisible: false });
    this.fetchData(filters);
  };

  render() {
    const {
      dispatch,
      loading,
      businessSceneManage: { dataSource, total, searchForm },
    } = this.props;
    const { businessPageMainModalVisible } = this.state;

    const tableProps = {
      columnsCache: DOMAIN,
      dispatch,
      loading,
      expirys: 0,
      rowKey: 'id',
      sortBy: 'id',
      sortDirection: 'DESC',
      // searchForm,
      dataSource,
      total,
      onChange: filters => {
        this.fetchData(filters);
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: { filters },
        });
      },
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      searchBarForm: [
        {
          title: '场景KEY值',
          dataIndex: 'sceneKey',
          options: {
            initialValue: searchForm.sceneKey,
          },
          tag: <Input placeholder="请输入场景KEY值" />,
        },
        {
          title: '场景名称',
          dataIndex: 'sceneName',
          options: {
            initialValue: searchForm.sceneName,
          },
          tag: <Input placeholder="请输入报表名称" />,
        },
      ],
      leftButtons: [
        {
          key: 'create',
          title: '新建',
          className: 'tw-btn-primary',
          icon: 'plus-circle',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            // router.push(`/sys/system/report/edit`);
            this.setState({ businessPageMainModalVisible: true });
            dispatch({
              type: `businessSceneManageModal/clearForm`,
            });
          },
        },
        {
          key: 'delete',
          title: '删除',
          className: 'tw-btn-error',
          icon: 'file-excel',
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length === 0,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const {
              businessSceneManage: { filters },
            } = this.props;
            dispatch({
              type: `${DOMAIN}/delete`,
              payload: selectedRowKeys.join(','),
            }).then(() => {
              this.fetchData(filters);
            });
          },
        },
      ],
      columns: [
        {
          title: '场景KEY',
          dataIndex: 'sceneKey',
          width: 300,
          align: 'center',
        },
        {
          title: '场景名称',
          dataIndex: 'sceneName',
          width: 400,
          render: (value, row, key) => (
            <Link
              className="tw-link"
              to={`/sys/system/businessSceneEdit?id=${fromQs().id}&sceneId=${row.id}`}
            >
              {value}
            </Link>
          ),
        },
        {
          title: '备注',
          dataIndex: 'remark',
        },
      ],
    };

    return (
      <PageHeaderWrapper title="报表管理">
        <DataTable {...tableProps} />
        <BusinessSceneManageModal
          visible={businessPageMainModalVisible}
          onCancel={() => this.setState({ businessPageMainModalVisible: false })}
          onOk={this.handlePageConfirm}
        />
      </PageHeaderWrapper>
    );
  }
}

export default BusinessSceneManage;
