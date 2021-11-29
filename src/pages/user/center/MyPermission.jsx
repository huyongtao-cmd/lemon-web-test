import React, { PureComponent } from 'react';
import { Col, Icon, Input, Row, Switch, Card, Tag } from 'antd';
import { connect } from 'dva';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { mountToTab } from '@/layouts/routerControl';
import Loading from '@/components/core/DataLoading';
import DataTable from '@/components/common/DataTable';
import Title from '@/components/layout/Title';
import MenuPermissionList from '../../sys/system/PermissionOverview/menuPermissionList';
import component from '../../sys/system/PermissionOverview/component/index';
import { fromQs } from '@/utils/stringUtils';
import styles from './styles.less';

const { DataPermissionList, FlowPermissionList } = component;
const DOMAIN = 'myPermission';

@connect(({ loading, myPermission, dispatch, user }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  myPermission,
  dispatch,
  user,
}))
@mountToTab()
class MyPermission extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKey: null,
      rightTabkey: 'menu',
    };
  }

  componentDidMount() {
    const {
      dispatch,
      user: {
        user: {
          extInfo: { userId },
        },
      },
    } = this.props;
    this.setState({
      selectedRowKey: userId,
    });
    dispatch({
      type: `${DOMAIN}/query`,
      payload: {
        offset: 0,
        limit: 10,
        userId,
      },
    });
  }

  // componentWillUnmount(){
  //   const { dispatch } = this.props;
  //   dispatch({
  //     type:`${DOMAIN}/clean`,
  //   })
  // }

  // 左侧用户维度初始化查询
  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: params });
  };

  rightOperationTabChange = key => {
    this.setState({ rightTabkey: key });
  };

  // onSelectChange = record => {
  //   const { rowSelect } = this.state;
  //   rowSelect({ offset: 0, limit: 10, userId: record.id });
  //   this.setState({ selectedRowKey: record.id });
  // };

  // changeColor = record => {
  //   const { selectedRowKey } = this.state;
  //   return record.id === selectedRowKey ? styles.clickRowStyle : '';
  // };

  render() {
    const { rightTabkey, selectedRowKey } = this.state;
    const {
      loading,
      dispatch,
      myPermission: { total, dataSource, searchForm },
    } = this.props;

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      loading,
      total,
      dataSource,
      onChange: filters => this.fetchData(filters),
      searchForm, // 把这个注入，可以切 tab 保留table状态
      onSearchBarChange: (changedValues, allValues) => {
        // 搜索条件变化，通过这里更新到 redux
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      enableSelection: false,
      // onRow: (record, index) => ({ onClick: () => this.onSelectChange(record) }),
      // rowClassName: (record, index) => this.changeColor(record),
      searchBarForm: [
        // {
        //   title: '姓名',
        //   dataIndex: 'userName',
        //   options: {
        //     initialValue: searchForm.userName,
        //   },
        //   tag: <Input placeholder="请输入姓名" />,
        // },
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
          align: 'center',
        },
      ],
    };

    // 左侧当是用户维度时，右侧的三个页签
    const contentList = {
      menu: <MenuPermissionList selectedRowKey={selectedRowKey} myPermission />,
      data: <DataPermissionList selectedRowKey={selectedRowKey} myPermission />,
      flow: <FlowPermissionList selectedRowKey={selectedRowKey} myPermission />,
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

    return (
      <PageHeaderWrapper>
        <Row gutter={5}>
          <Col span={10}>
            {/*  paddingTop 是为了跟右边顶部对齐 */}
            <Card
              className="tw-card-adjust"
              bordered={false}
              title={<Title icon="profile" text="用户列表" />}
            >
              <DataTable {...tableProps} />
            </Card>
          </Col>
          <Col span={14}>
            <Card
              className="tw-card-multiTab"
              bordered={false}
              activeTabKey={rightTabkey}
              tabList={tabLists}
              onTabChange={this.rightOperationTabChange}
            >
              {contentList[rightTabkey]}
            </Card>
          </Col>
        </Row>
      </PageHeaderWrapper>
    );
  }
}

export default MyPermission;
