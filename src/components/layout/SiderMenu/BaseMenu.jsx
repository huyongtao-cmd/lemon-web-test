import React, { PureComponent } from 'react';
import router from 'umi/router';
import { Menu } from 'antd';
import Link from 'umi/link';
import { formatMessage } from 'umi/locale';
import pathToRegexp from 'path-to-regexp';
import { urlToList } from '../../_utils/pathTools';
import { getIcon } from '../../_utils/iconTools';
import styles from './index.less';
import { getTenantFlatMenu } from './SiderMenu';

const { SubMenu } = Menu;

export const getMenuMatches = (flatMenuKeys, path) =>
  flatMenuKeys.filter(item => item && pathToRegexp(item.portalRoute || '').test(path));

export default class BaseMenu extends PureComponent {
  constructor(props) {
    super(props);
    // console.log('menuData ->', props.menuData, props.scopedMenuData);

    /* 此处的菜单数据需要再处理 */
    // this.flatMenuKeys = this.getFlatMenuKeys(props.menuData);
    // this.flatMenu = this.getTenantFlatMenu(props.menuData);
    this.state = {
      // eslint-disable-next-line react/no-unused-state
      menuData: props.menuData,
      flatMenu: this.getTenantFlatMenu(props.menuData),
    };
  }

  static getDerivedStateFromProps(props, state) {
    const { pathname, menuData } = state;
    if (
      props.location.pathname !== pathname ||
      JSON.stringify(menuData) !== JSON.stringify(props.menuData)
    ) {
      const flatMenu = getTenantFlatMenu(props.menuData);
      return {
        pathname: props.location.pathname,
        menuData: props.menuData,
        flatMenu,
      };
    }
    return null;
  }

  /**
   * Recursively flatten the data
   * [{path:string},{path:string}] => {path,path2}
   * @param  menus
   */
  getFlatMenuKeys(menus) {
    let keys = [];
    menus.forEach(item => {
      if (item.children) {
        keys = keys.concat(this.getFlatMenuKeys(item.children));
      }
      keys.push(item.path);
    });
    return keys;
  }

  getTenantFlatMenu(menus) {
    let keys = [];
    menus.forEach(item => {
      if (item.children) {
        keys = keys.concat(this.getTenantFlatMenu(item.children));
      }
      keys.push(item);
    });
    return keys;
  }

  drag = e => {
    if (e.target.tagName === 'A') {
      e.target = e.target.parentNode;
    }
    e.dataTransfer.setData('Text', e.target.id);
  };

  /**
   * 获得菜单子节点
   * @memberof SiderMenu
   */
  getNavMenuItems = (menusData, parent) => {
    if (!menusData) {
      return [];
    }
    return menusData
      .filter(item => item.name && item.menu !== false)
      .map(item => {
        // make dom
        const ItemDom = this.getSubMenuOrItem(item, parent);
        return this.checkPermissionItem(item.authority, ItemDom);
      })
      .filter(item => item);
  };

  // Get the currently selected menu
  getSelectedMenuKeys = () => {
    const {
      location: { pathname },
    } = this.props;
    const { flatMenu } = this.state;
    return urlToList(pathname).map(itemPath => getMenuMatches(flatMenu, itemPath));
  };

  /**
   * get SubMenu or Item
   */
  getSubMenuOrItem = item => {
    // doc: add hideChildrenInMenu
    if (item.children && !item.hideChildrenInMenu && item.children.some(child => child.code)) {
      // const name = formatMessage({ id: item.locale });
      const { name, portalRoute, code } = item;
      return (
        <SubMenu
          title={
            item.icon ? (
              <>
                {getIcon(item.icon, styles.icon)}
                <span>{name}</span>
              </>
            ) : (
              name
            )
          }
          onTitleClick={(key, domEvent) => {
            if (portalRoute && portalRoute.trim().length > 0) {
              router.push(portalRoute);
            }
          }}
          key={code}
        >
          {this.getNavMenuItems(item.children)}
        </SubMenu>
      );
    }
    const returnItem = (
      <Menu.Item
        key={item.code}
        draggable="true"
        onDragStart={this.drag}
        id={'fromMenu' + item.code}
      >
        {this.getMenuItemPath(item)}
      </Menu.Item>
    );
    return returnItem;
  };

  /**
   * 判断是否是http链接.返回 Link 或 a
   * Judge whether it is http link.return a or Link
   * @memberof SiderMenu
   */
  getMenuItemPath = item => {
    // const name = formatMessage({ id: item.locale });
    const { name } = item;
    const itemPath = this.conversionPath(item.portalRoute);
    const icon = getIcon(item.icon, styles.icon);
    const { target } = item;
    // Is it a http link
    if (/^https?:\/\//.test(itemPath)) {
      return (
        <a href={itemPath} target={target}>
          {icon}
          <span>{name}</span>
        </a>
      );
    }
    const { location, isMobile, onCollapse } = this.props;
    return (
      <Link
        to={itemPath}
        target={target}
        replace={itemPath === location.pathname}
        onClick={
          isMobile
            ? () => {
                onCollapse(true);
              }
            : undefined
        }
      >
        {icon}
        <span>{name}</span>
      </Link>
    );
  };

  // permission to check
  checkPermissionItem = (authority, ItemDom) => {
    const { Authorized } = this.props;
    if (Authorized && Authorized.check) {
      const { check } = Authorized;
      return check(authority, ItemDom);
    }
    return ItemDom;
  };

  conversionPath = path => {
    if (path && path.indexOf('http') === 0) {
      return path;
    }
    return `/${path || ''}`.replace(/\/+/g, '/');
  };

  render() {
    const { openKeys, theme, mode } = this.props;
    // if pathname can't match, use the nearest parent's key
    let selectedKeys = [];
    const selectedKeysTemp = this.getSelectedMenuKeys();
    selectedKeysTemp.forEach(item => {
      selectedKeys = selectedKeys.concat(item);
    });
    selectedKeys = selectedKeys.map(item => item.code);

    if (!selectedKeys.length && openKeys) {
      selectedKeys = [openKeys.sort((key1, key2) => key2.length - key1.length)[0]];
    }
    let props = {};
    if (openKeys) {
      props = {
        openKeys,
      };
    }
    // 顶级菜单下分出的二级，所以用带作用域的渲染，用总菜单map来做路由
    const { handleOpenChange, style, scopedMenuData } = this.props;
    // console.log("scopedMenuData:",scopedMenuData)
    // console.log("final openKeys:",openKeys)
    // console.log("final selectedKeys:",selectedKeys)
    return (
      <Menu
        key="Menu"
        mode={mode}
        theme={theme}
        onOpenChange={handleOpenChange}
        selectedKeys={selectedKeys}
        style={style}
        {...props}
      >
        {this.getNavMenuItems(scopedMenuData)}
      </Menu>
    );
  }
}
