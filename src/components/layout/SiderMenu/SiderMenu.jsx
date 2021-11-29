import React, { PureComponent } from 'react';
import { Layout } from 'antd';
import pathToRegexp from 'path-to-regexp';
import classNames from 'classnames';
import Link from 'umi/link';
import styles from './index.less';
import BaseMenu, { getMenuMatches } from './BaseMenu';
import { urlToList } from '../../_utils/pathTools';

const { Sider } = Layout;

/**
 * 获取所有父菜单
 * @param menuList 菜单list
 * @param menuJson 所有菜单json
 * @returns {*} 父菜单列表
 */
const getAllParentMenu = (menuList, menuJson) => {
  let pMenu = menuList
    .filter(item => item && item.pcode && item.pcode.trim().length > 0)
    .map(item => menuJson[item.pcode]);
  if (pMenu.length > 0) {
    pMenu = pMenu.concat(getAllParentMenu(pMenu, menuJson));
  }
  return pMenu;
};

/**
 * 获得菜单子节点
 * @memberof SiderMenu
 */
const getDefaultCollapsedSubMenus = props => {
  const {
    location: { pathname },
    flatMenu,
  } = props;
  const selectedKeysTemp = urlToList(pathname)
    .map(item => getMenuMatches(flatMenu, item))
    .filter(item => item);
  let selectedKeys = [];
  selectedKeysTemp.forEach(item => {
    selectedKeys = selectedKeys.concat(item);
  });

  const menuJson = {};
  flatMenu.forEach(item => {
    menuJson[item.code] = item;
  });
  const allParentMenu = getAllParentMenu(selectedKeys, menuJson);
  selectedKeys = allParentMenu.map(item => item.code);
  // const openKeys = [];
  // selectedKeys.forEach(item=>{
  //   let temp = item;
  //   openKeys.push(temp);
  //   while (temp.lastIndexOf(".")>-1){
  //     temp = temp.substring(0,temp.lastIndexOf("."));
  //     openKeys.push(temp);
  //   }
  // });
  return Array.from(new Set(selectedKeys));
};

/**
 * Recursively flatten the data
 * [{path:string},{path:string}] => {path,path2}
 * @param  menu
 */
export const getFlatMenuKeys = menu =>
  menu.reduce((keys, item) => {
    keys.push(item.path);
    if (item.children) {
      return keys.concat(getFlatMenuKeys(item.children));
    }
    return keys;
  }, []);

export const getTenantFlatMenu = menu =>
  menu.reduce((keys, item) => {
    keys.push(item);
    if (item.children) {
      return keys.concat(getTenantFlatMenu(item.children));
    }
    return keys;
  }, []);

/**
 * Find all matched menu keys based on paths
 * @param  flatMenuKeys: [/abc, /abc/:id, /abc/:id/info]
 * @param  paths: [/abc, /abc/11, /abc/11/info]
 */
export const getMenuMatchKeys = (flatMenuKeys, paths) =>
  paths.reduce(
    (matchKeys, path) =>
      matchKeys.concat(flatMenuKeys.filter(item => pathToRegexp(item).test(path))),
    []
  );

export default class SiderMenu extends PureComponent {
  constructor(props) {
    super(props);
    const flatMenu = getTenantFlatMenu(props.menuData);
    this.state = {
      openKeys: getDefaultCollapsedSubMenus({ ...props, flatMenu }),
      // eslint-disable-next-line react/no-unused-state
      menuData: props.menuData,
    };
  }

  static getDerivedStateFromProps(props, state) {
    const { pathname, menuData, openKeys } = state;
    // console.log('props.location.pathname | pathname ->', props.location.pathname, pathname)
    if (
      props.location.pathname !== pathname ||
      JSON.stringify(menuData) !== JSON.stringify(props.menuData)
    ) {
      const flatMenu = getTenantFlatMenu(props.menuData);
      return {
        pathname: props.location.pathname,
        openKeys: getDefaultCollapsedSubMenus({ ...props, flatMenu }),
        menuData: props.menuData,
      };
    }
    return null;
  }

  isMainMenu = key => {
    const { menuData } = this.props;
    return menuData.some(item => {
      if (key) {
        return item.key === key || item.path === key;
      }
      return false;
    });
  };

  handleOpenChange = openKeys => {
    // const moreThanOne = openKeys.filter(openKey => this.isMainMenu(openKey)).length > 1;
    // this.setState({
    //   openKeys: moreThanOne ? [openKeys.pop()] : [...openKeys],
    // });
    this.setState(() => ({
      openKeys,
    }));
  };

  render() {
    const { logo, collapsed, onCollapse, fixSiderbar, theme, logoInfo = {} } = this.props;
    const { openKeys } = this.state;
    const defaultProps = collapsed ? {} : { openKeys };
    const { imgFile, logoSlogan, logoLink } = logoInfo;
    const siderClassName = classNames(styles.sider, {
      [styles.fixSiderbar]: fixSiderbar,
      [styles.light]: theme === 'light',
    });

    return (
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="lg"
        onCollapse={onCollapse}
        width={220}
        theme={theme}
        className={siderClassName}
      >
        <div className={styles.logo} id="logo">
          <Link to="/">
            <div className={styles.desc}>
              <img src={imgFile ? `data:image/jpeg;base64,${imgFile}` : logo} alt="logo" />
            </div>
            {logoSlogan && <small>{logoSlogan}</small>}
          </Link>
        </div>
        <BaseMenu
          {...this.props}
          mode="inline"
          handleOpenChange={this.handleOpenChange}
          onOpenChange={this.handleOpenChange}
          style={{ padding: '4px 0', width: '100%' }}
          {...defaultProps}
        />
      </Sider>
    );
  }
}
