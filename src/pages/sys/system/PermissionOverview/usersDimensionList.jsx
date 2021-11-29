import React, { PureComponent } from 'react';
import { Col, Icon, Input, Row, Switch, Card } from 'antd';
import { connect } from 'dva';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { mountToTab } from '@/layouts/routerControl';
import TreeSearch from '@/components/common/TreeSearch';
import Loading from '@/components/core/DataLoading';
import DataTable from '@/components/common/DataTable';
import Title from '@/components/layout/Title';
import component from './component/index';

const DOMAIN = 'menuPermissionList';

const { DataPermissionList, FlowPermissionList } = component;

@connect(({ loading, menuPermissionList, dispatch, user }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  menuPermissionList,
  dispatch,
  user,
}))
@mountToTab()
class MenuPermissionList extends PureComponent {
  constructor(props) {
    super(props);
    const { selectRow, myPermission } = props;
    !myPermission ? selectRow(this.fetchData) : null;
    this.state = {
      tabkey: 'menu',
    };
  }

  componentDidMount() {
    const {
      selectedRowKey,
      myPermission,
      dispatch,
      user: {
        user: {
          extInfo: { userId },
        },
      },
    } = this.props;
    dispatch({ type: `${DOMAIN}/cleanSearchForm` });
    // myPermission个人信息下的我的权限页签定义的字段  用来控制初始化右侧的菜单权限是否加载数据
    // 有的话要查询，没有的话就是权限总览里点击左侧的用户维度才开始查询
    myPermission
      ? dispatch({
          type: `${DOMAIN}/query`,
          payload: {
            userId,
            offset: 0,
            limit: 10,
          },
        })
      : '';
  }

  onOperationTabChange = key => {
    this.setState({ tabkey: key });
  };

  render() {
    const { tabkey } = this.state;
    const { selectedRowKey } = this.props;
    // console.log(selectedRowKey);
    const contentList = {
      menu: <MenuPermissionList selectedRowKey={selectedRowKey} />,
      data: <DataPermissionList selectedRowKey={selectedRowKey} />,
      flow: <FlowPermissionList selectedRowKey={selectedRowKey} />,
    };

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
      <Card
        className="tw-card-multiTab"
        bordered={false}
        activeTabKey={tabkey}
        tabList={tabLists}
        onTabChange={this.onOperationTabChange}
      >
        {contentList[tabkey]}
      </Card>
    );
  }
}

export default MenuPermissionList;
