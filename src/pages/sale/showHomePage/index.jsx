/* eslint-disable no-nested-ternary */
import React from 'react';
import { connect } from 'dva';
import { Col, Row, Spin, Menu } from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import { isNil, isEmpty } from 'ramda';
import { fromQs } from '@/utils/stringUtils';
import CompositeSearch from './component/CompositeSearch';
import HomePage from './component/HomePage';
import MenuLeftOverTwo from './component/MenuLeftOverTwo';
import SearchPage from './component/SearchPage';

import styles from './style.less';

const DOMAIN = 'showHomePage';
@connect(({ loading, showHomePage }) => ({
  loading,
  showHomePage,
}))
@mountToTab()
class ShowHomePage extends React.PureComponent {
  componentDidMount() {
    // const { _refresh } = fromQs();
    // if (_refresh === '0') {
    //   return;
    // }
    const { dispatch } = this.props;
    // 清除查询结果页查询条件
    dispatch({ type: `${DOMAIN}/cleanHomeFormSearchData` });
    // 初始化Tab栏标签
    dispatch({
      type: `${DOMAIN}/updateShowFlagForm`,
      payload: {
        showFlag: false, // 控制是否展示 展示厅首页 Tab
        showQueryResult: false, // 是否点过查询条件标志
      },
    });

    dispatch({
      type: `${DOMAIN}/homePageTab`,
    }).then(res => {
      if (!isNil(res)) {
        dispatch({
          type: `${DOMAIN}/menuListLeft`,
          payload: {
            id: res,
          },
        });
      }
    });
  }

  onMenuChange = (parmars, queryCon = '') => {
    const { dispatch } = this.props;
    // 清除列表数据
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        homeFormList: [],
        homeFormTotal: 0,
      },
    });

    // 记录筛选条件用于查询结果页展示
    dispatch({
      type: `${DOMAIN}/updateHomeForm`,
      payload: {
        queryCon,
        mapCon: parmars,
      },
    });
    // 清除tab栏选中项
    dispatch({
      type: `${DOMAIN}/updatehomePageForm`,
      payload: {
        defaultTabId: null,
      },
    });

    dispatch({
      type: `${DOMAIN}/updateShowFlagForm`,
      payload: {
        showFlag: true,
        showQueryResult: true,
      },
    });

    // 拉取数据
    dispatch({
      type: `${DOMAIN}/selectVideoCon`,
      payload: {
        mapCon: parmars,
        sortBy: 'id',
        sortDirection: 'DESC',
        offset: 0,
        limit: 10,
      },
    });
  };

  backHomePage = () => {
    const { dispatch } = this.props;
    // 清除查询结果页查询条件
    dispatch({ type: `${DOMAIN}/cleanHomeFormSearchData` });

    dispatch({
      type: `${DOMAIN}/updateShowFlagForm`,
      payload: {
        showFlag: false,
        showQueryResult: false,
      },
    });

    dispatch({
      type: `${DOMAIN}/homePageTab`,
    }).then(res => {
      if (!isNil(res)) {
        dispatch({
          type: `${DOMAIN}/menuListLeft`,
          payload: {
            id: res,
          },
        });
      }
    });
  };

  homePageSearch = params => {
    const { dispatch } = this.props;
    // 记录筛选条件
    dispatch({
      type: `${DOMAIN}/updateHomeForm`,
      payload: {
        queryCon: params.vnoOrVNameVDesc || '',
      },
    });

    // 清除tab栏选中项
    dispatch({
      type: `${DOMAIN}/updatehomePageForm`,
      payload: {
        defaultTabId: null,
      },
    });
    // 展开展示首页tab
    dispatch({
      type: `${DOMAIN}/updateShowFlagForm`,
      payload: {
        showFlag: true,
        showQueryResult: true,
      },
    });
    // 拉取数据
    dispatch({
      type: `${DOMAIN}/selectVideoCon`,
      payload: params,
    });
  };

  render() {
    const {
      loading,
      dispatch,
      showHomePage: {
        homePageTabList,
        homePageFormData,
        showFlagForm: { showFlag, showQueryResult },
      },
    } = this.props;

    const loadingStatus = loading.effects[`${DOMAIN}/homePageTab`];
    const menuLoadingStatus = loading.effects[`${DOMAIN}/menuListLeft`];

    return (
      <div className={styles.homepPageBox}>
        {!loadingStatus ? (
          <>
            <Menu
              selectedKeys={[
                homePageFormData.defaultTabId ? String(homePageFormData.defaultTabId) : null,
              ]}
              mode="horizontal"
              onClick={e => {
                // 清除左侧菜单
                dispatch({
                  type: `${DOMAIN}/updateState`,
                  payload: {
                    menuList: [],
                    hoverList: [],
                  },
                });

                // 切换Tab
                dispatch({
                  type: `${DOMAIN}/updatehomePageForm`,
                  payload: {
                    defaultTabId: e.key,
                  },
                });

                // 展示厅首页和综合查询不拉取左侧筛选菜单
                if (e.key !== 'comp' && e.key !== 'searchPage') {
                  // 切换Tab调用维度接口
                  dispatch({
                    type: `${DOMAIN}/menuListLeft`,
                    payload: {
                      id: e.key,
                    },
                  });
                }

                // 点击展示厅首页
                if (e.key === 'searchPage') {
                  // 控制展示厅首页Tab不显示
                  dispatch({
                    type: `${DOMAIN}/updateShowFlagForm`,
                    payload: {
                      showFlag: false,
                    },
                  });
                  this.backHomePage();
                }
              }}
            >
              {!showFlag ? null : <Menu.Item key="searchPage">展示厅首页</Menu.Item>}
              {homePageTabList.map(v => (
                <Menu.Item key={v.id}>{v.searchDimName}</Menu.Item>
              ))}
              <Menu.Item key="comp">综合查询</Menu.Item>
            </Menu>

            <div style={{ borderBottom: '6px solid #f0f2f5' }} />

            {homePageFormData.defaultTabId === 'comp' ? (
              <CompositeSearch />
            ) : !homePageFormData.defaultTabId && !isEmpty(homePageTabList) ? (
              <SearchPage />
            ) : (
              <Row>
                {menuLoadingStatus ? (
                  <Col
                    span={5}
                    style={{
                      backgroundColor: '#fff',
                      borderRight: '6px solid #f0f2f5',
                      boxSizing: 'border-box',
                      paddingRight: 0,
                      position: 'relative',
                    }}
                    className={styles.menuBox}
                  >
                    <div style={{ width: '100%', textAlign: 'center' }}>
                      <Spin />
                    </div>
                  </Col>
                ) : (
                  <MenuLeftOverTwo
                    onMenuChange={(parmars, queryCon) => this.onMenuChange(parmars, queryCon)}
                  />
                )}

                <Col span={19} style={{ height: '100%', backgroundColor: '#fff' }}>
                  {!showQueryResult ? (
                    <HomePage homePageSearch={params => this.homePageSearch(params)} />
                  ) : (
                    <SearchPage />
                  )}
                </Col>
              </Row>
            )}
          </>
        ) : (
          <div style={{ width: '100%', textAlign: 'center' }}>
            <Spin />
          </div>
        )}
      </div>
    );
  }
}

export default ShowHomePage;
