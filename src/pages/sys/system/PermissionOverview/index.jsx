import React, { PureComponent } from 'react';
import { Col, Icon, Input, Row, Switch, Card, Tag } from 'antd';
import { connect } from 'dva';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { mountToTab } from '@/layouts/routerControl';
import TreeSearch from '@/components/common/TreeSearch';
import Loading from '@/components/core/DataLoading';
import DataTable from '@/components/common/DataTable';
import Title from '@/components/layout/Title';
// import UsersDimensionList from './menuPermissionList';
import AsyncSelect from '@/components/common/AsyncSelect';
import { findRoles } from '@/services/sys/iam/roles';
import styles from './style.less';
import { fromQs } from '@/utils/stringUtils';
import component from './component/index';
import MenuPermissionList from './menuPermissionList';

const { DataPermissionList, FlowPermissionList } = component;

const DOMAIN = 'projectDimension';

@connect(({ loading, projectDimension, usersDimension, dispatch, user }) => ({
  loading: loading.effects[`${DOMAIN}/findNavsById`] || loading.effects[`${usersDimension}/query`],
  projectDimension,
  usersDimension,
  dispatch,
  user,
}))
@mountToTab()
class ProjectDimension extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKey: null,
      leftTabkey: 'functionDimension',
      rightTabkey: 'relateRole',
      navCode: null,
      tabkey: 'menu',
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const { _refresh } = fromQs();
    !(_refresh === '0') && dispatch({ type: `${DOMAIN}/cleanSearchForm` });
    !(_refresh === '0') && dispatch({ type: 'usersDimension/cleanSearchForm' });
    dispatch({
      type: `${DOMAIN}/findNavsById`,
    });
  }

  // 初始化时右侧部分对应角色及用户  或者点击左侧树形结构的某一功能时，左侧展示出具备权限的用户列表
  initFetchData = params => {
    const { navCode } = this.state;
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: { navCode, ...params } });
  };

  // 左侧用户维度初始化查询
  usersFetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: 'usersDimension/query', payload: params });
  };

  // 左侧页签点击时的操作
  onOperationTabChange = key => {
    const {
      dispatch,
      usersDimension: { searchForm },
    } = this.props;
    this.setState({
      navCode: null,
    });
    dispatch({ type: `${DOMAIN}/clean` });
    // 用户维度  usersDimension  功能维度 functionDimension
    if (key === 'usersDimension') {
      this.usersFetchData(searchForm);
      this.setState({ rightTabkey: 'relateFunction', leftTabkey: key });
    } else {
      this.setState({ rightTabkey: 'relateRole', leftTabkey: key });
    }
  };

  onSelectChange = record => {
    const { rowSelect } = this.state;
    rowSelect({ offset: 0, limit: 10, userId: record.id });
    this.setState({ selectedRowKey: record.id });
  };

  changeColor = record => {
    const { selectedRowKey } = this.state;
    return record.id === selectedRowKey ? styles.clickRowStyle : '';
  };

  // 当左侧是用户维度时，右侧页签的点击切换
  rightOperationTabChange = key => {
    this.setState({ tabkey: key });

    // rowSelect({ offset: 0, limit: 10, userId:selectedRowKey });
  };

  // 左侧页签为用户维度 的表格处理
  userTableProps = () => {
    const {
      loading,
      dispatch,
      usersDimension: { total, dataSource, searchForm },
    } = this.props;
    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'DESC',
      loading,
      total,
      dataSource,
      enableSelection: false,
      onChange: filters => this.usersFetchData(filters),
      searchForm, // 把这个注入，可以切 tab 保留table状态
      onSearchBarChange: (changedValues, allValues) => {
        // 搜索条件变化，通过这里更新到 redux
        dispatch({
          type: 'usersDimension/updateSearchForm',
          payload: allValues,
        });
      },
      onRow: (record, index) => ({ onClick: () => this.onSelectChange(record) }),
      rowClassName: (record, index) => this.changeColor(record),
      searchBarForm: [
        {
          title: '姓名',
          dataIndex: 'userName',
          options: {
            initialValue: searchForm.userName,
          },
          tag: <Input placeholder="请输入姓名" />,
        },
      ],
      columns: [
        {
          title: '姓名',
          dataIndex: 'userName',
          align: 'center',
          width: 100,
        },
        {
          title: '业务角色',
          dataIndex: 'codeName',
          render: (value, record, index) =>
            (value ? value.split(',') : []).map((item, i) => <Tag>{item}</Tag>),
        },
        {
          title: '登录名',
          dataIndex: 'logName',
        },
      ],
    };
    return tableProps;
  };

  mergeDeep = child =>
    Array.isArray(child)
      ? child
          .map(item => ({
            ...item,
            // icon: <Icon type="file-text" />,
            value: item.tcode,
            text: item.name,
            child: item.children,
            id: item.code,
          }))
          .map(temp => ({
            ...temp,
            child: temp.child ? this.mergeDeep(temp.child) : null,
          }))
      : [];

  onSelect = selectedKeys => {
    const { dispatch } = this.props;
    const id = selectedKeys[0];
    this.setState({ navCode: id });
    dispatch({ type: `${DOMAIN}cleanSearchForm` }); // 进来选初始化搜索条件，再查询
    dispatch({
      type: `${DOMAIN}/notLoadingQuery`,
      payload: { offset: 0, limit: 10, navCode: id },
    });
  };

  render() {
    const {
      loading,
      dispatch,
      projectDimension: { navTree, total, dataSource, searchForm },
    } = this.props;
    const treeData = this.mergeDeep(navTree);
    const { leftTabkey, rightTabkey, selectedRowKey, tabkey } = this.state;

    // 初始化时右侧显示的对应角色及用户
    const tableProps = {
      rowKey: 'key',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'DESC',
      loading,
      dataSource,
      total,
      enableSelection: false,
      onChange: filters => this.initFetchData(filters),
      searchForm, // 把这个注入，可以切 tab 保留table状态
      onSearchBarChange: (changedValues, allValues) => {
        // 搜索条件变化，通过这里更新到 redux
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },

      searchBarForm: [
        {
          title: '角色',
          dataIndex: 'roleCode',
          options: {
            initialValue: searchForm.roleCode,
          },
          tag: (
            <AsyncSelect
              // mode="multiple"
              source={() => findRoles({ limit: 0 }).then(resp => resp.response.rows)}
              placeholder="请选择角色"
            />
          ),
        },
        {
          title: '用户',
          dataIndex: 'userName',
          options: {
            initialValue: searchForm.userName,
          },
          tag: <Input placeholder="请输入用户" />,
        },
      ],
      columns: [
        {
          title: '角色',
          dataIndex: 'codeName',
          align: 'center',
        },
        {
          title: '用户',
          dataIndex: 'userName',
          align: 'center',
        },
      ],
    };

    const leftContentList = {
      functionDimension: !loading ? (
        <TreeSearch
          showSearch
          placeholder="请输入关键字"
          treeData={treeData}
          onSelect={this.onSelect}
          defaultExpandedKeys={treeData.map(item => `${item.id}`)}
        />
      ) : (
        <Loading />
      ),
      usersDimension: <DataTable {...this.userTableProps()} />,
    };

    const LeftTabLists = [
      {
        key: 'functionDimension',
        tab: '功能维度',
      },
      {
        key: 'usersDimension',
        tab: '用户维度',
      },
    ];
    // 左侧当是用户维度时，右侧的三个页签
    const contentList = {
      menu: (
        <MenuPermissionList
          selectedRowKey={selectedRowKey}
          selectRow={event => this.setState({ rowSelect: event })}
          menuPermission
        />
      ),
      data: (
        <DataPermissionList
          selectedRowKey={selectedRowKey}
          selectRow={event => this.setState({ rowSelect: event })}
          dataPermission
        />
      ),
      flow: (
        <FlowPermissionList
          selectedRowKey={selectedRowKey}
          selectRow={event => this.setState({ rowSelect: event })}
          flowPermission
        />
      ),
    };
    // 左侧当是用户维度时，右侧的三个页签
    const tabLists = [
      {
        key: 'menu',
        tab: '菜单权限',
      },
      {
        key: 'data',
        tab: '数据权限',
      },
      {
        key: 'flow',
        tab: '流程权限',
      },
    ];
    // 当左侧是功能维度时，右侧对应的是relateRole。对应角色及用户
    // 当左侧是用户维度时，右侧对应的是relateFunction。对应角色及用户
    const rightContentList = {
      relateRole: (
        <Card
          className="tw-card-adjust"
          style={{ marginTop: '2px' }}
          title={<Title icon="profile" text="对应角色及用户" />}
          bordered={false}
        >
          <DataTable {...tableProps} />
        </Card>
      ),
      relateFunction: (
        <Card
          className="tw-card-multiTab"
          bordered={false}
          activeTabKey={tabkey}
          tabList={tabLists}
          onTabChange={this.rightOperationTabChange}
        >
          {contentList[tabkey]}
        </Card>
      ),
    };

    return (
      <PageHeaderWrapper>
        <Row gutter={5}>
          <Col span={10}>
            {/*  paddingTop 是为了跟右边顶部对齐 */}
            <Card
              className="tw-card-multiTab"
              bordered={false}
              activeTabKey={leftTabkey}
              tabList={LeftTabLists}
              onTabChange={this.onOperationTabChange}
            >
              {leftContentList[leftTabkey]}
            </Card>
          </Col>
          <Col span={14}>{rightContentList[rightTabkey]}</Col>
        </Row>
      </PageHeaderWrapper>
    );
  }
}

export default ProjectDimension;
