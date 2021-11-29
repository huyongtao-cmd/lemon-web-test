import { clone, remove, insertAll } from 'ramda';

// Conversion router to menu. 菜单数据过滤器
export function menuDataFormatter(data, parentPath = '', parentAuthority, parentName) {
  return data.map(item => {
    let locale = 'ui.menu';
    if (parentName && item.name) {
      locale = `${parentName}.${item.name}`;
    } else if (item.name) {
      locale = `ui.menu.${item.name}`;
    } else if (parentName) {
      locale = parentName;
    }
    const result = {
      ...item,
      locale,
      authority: item.authority || parentAuthority,
    };
    if (item.routes) {
      const children = menuDataFormatter(
        item.routes,
        `${parentPath}${item.path}/`,
        item.authority,
        locale
      );
      // Reduce memory usage
      result.children = children;
    }
    delete result.routes;
    return result;
  });
}

export function tryInitAuth(dispatch) {
  // 在单页应用框架页加载时更新csrf
  sessionStorage.getItem('token_xsrf')
    ? // eslint-disable-next-line
      !console.log('[EL-FRAME]: CSRF loaded (by cache), initializing framework...') &&
      this.setState({
        csrfLoaded: true,
      })
    : dispatch({
        type: 'global/fetchCsrf',
      }).then(() => {
        // eslint-disable-next-line
        console.log('[EL-FRAME]: CSRF loaded (by remote server), initializing framework...');
        this.setState({
          csrfLoaded: true,
        });
      });
}

export const treeToPlain = (data, structure, parent = '') => {
  let plain = [];
  let leafs = [];
  // const { children, selected } = structure;
  const { id, pid, children } = structure;
  data.map(d => {
    const dClone = clone(d);
    if (!dClone[children] || dClone[children].length === 0) {
      delete dClone[children];
      plain = [...plain, { ...dClone, [pid]: parent }];
      leafs = [...leafs, { ...dClone, [pid]: parent }];
    } else {
      const childrenTransfer = treeToPlain(dClone[children], structure, dClone[id]);
      delete dClone[children];
      plain = [...plain, { ...dClone, [pid]: parent }, ...childrenTransfer.plain];
      leafs = [...leafs, ...childrenTransfer.leafs];
    }
    return d;
  });
  return { plain, leafs };
};

export const plainToTree = (plain, structure) => {
  const tree = [];
  const { id, pid, children } = structure;
  const data = clone(plain);
  const plainObject = {};
  data.map(d => {
    plainObject[d[id]] = d;
    return d;
  });
  data.map(d => {
    const pData = plainObject[d[pid]];
    if (pData) {
      !pData[children] && (pData[children] = []);
      pData[children].push(d);
    } else {
      tree.push(d);
    }
    return d;
  });
  const { leafs } = treeToPlain(tree, structure);
  return { tree, leafs };
};

export const mergeRoutes = (authRoutes, umiRoutes) => {
  let routes = [];
  const umiRoutesNeedMerge = umiRoutes.filter(route => route.meta === true);
  const commonRoutes = umiRoutes.filter(route => route.meta !== true);
  if (authRoutes.length) {
    // make merge routes
    const { plain } = treeToPlain(umiRoutesNeedMerge, {
      id: 'name',
      pid: 'pname',
      children: 'routes',
    });
    let count = 0;
    const mergedRoutesPlain = plain
      .map(route => {
        const { name, menu } = route;
        if (menu === false) return route; // 不在菜单的路由，保留下来
        // name not exist, means its a redirect route config
        if (!name) return route; // 重定向路由
        const { code = undefined } = authRoutes[count] || {};
        if (!code) return null;
        const itsName = code.split('.').length > 1 ? code.split('.').pop() : code;
        if (name === itsName) {
          count += 1;
          return route;
        }
        return null;
      })
      .filter(Boolean);
    const mergedRoutes = plainToTree(mergedRoutesPlain, {
      id: 'name',
      pid: 'pname',
      children: 'routes',
    }).tree;
    routes = [...mergedRoutes, ...commonRoutes];
  } else {
    // 没有拉到权限数据的时候，全部放出来
    // TODO: 这里有一个闪现的问题，需要 hack 一下 memoizeOne 给个参数
    routes = [...commonRoutes];
  }
  return routes;
};

/**
 * tttansfer - transferSqlModel - transferSql - consoleNavs
 *
 * 这几个函数为方便写入数据库做准备，把路由转换成sql，给后端，插入数据库
 */

const tttansfer = (data, structure, parent = '', base = 1000000000, multiCount = false) => {
  let plain = [];
  // const { children, selected } = structure;
  const { id, pid, children } = structure;
  // tag:: filter - 过滤掉 redirect 的 路由
  data
    .filter(d => d[id])
    .filter(d => d.menu !== false)
    .map((d, index) => {
      const dClone = clone(d);
      const parentKickChildren = parent ? `${parent}.${dClone[id]}` : `${dClone[id]}`;
      if (!dClone[children] || dClone[children].length === 0) {
        const level = parent ? parent.split('.').length : 0;
        const changeBase = base.toString().split('');
        const value = index < 9 ? [0, index + 1] : [index + 1];
        const insertValue = multiCount ? value : [index + 1];
        const removedBase = remove(level, multiCount ? 2 : 1, changeBase);
        const tcode = insertAll(level, insertValue, removedBase).join('');
        delete dClone[children];
        plain = [
          ...plain,
          {
            ...dClone,
            code: parentKickChildren,
            pcode: parent,
            tcode,
            [pid]: parentKickChildren,
          },
        ];
      } else {
        const level = parent ? parent.split('.').length : 0;
        const changeBase = base.toString().split('');
        const value = index < 9 ? [0, index + 1] : [index + 1];
        const insertValue = multiCount ? value : [index + 1];
        const removedBase = remove(level, multiCount ? 2 : 1, changeBase);
        const tcode = insertAll(level, insertValue, removedBase).join('');
        const childrenTransfer = tttansfer(
          dClone[children],
          structure,
          parentKickChildren,
          tcode,
          dClone[children].length > 10
        );
        delete dClone[children];
        plain = [
          ...plain,
          {
            ...dClone,
            code: parentKickChildren,
            pcode: parent,
            tcode,
            [pid]: parentKickChildren,
          },
          ...childrenTransfer,
        ];
      }
      return d;
    });
  return plain;
};

const transferSqlModel = array =>
  array.map(data => {
    const { code, pcode, desc, tcode } = data;
    return {
      name: desc,
      code,
      pcode,
      tcode,
    };
  });

const transferSql = array =>
  array.map(data => {
    const { name, code, pcode, tcode } = data;
    return `insert into PS_IAM_NAV(TCODE,PCODE,CODE,NAME) values('${tcode}', '${pcode}', '${code}', '${name}');`;
  });

export const consoleNavs = routes => {
  // tag:: 目前来说只需要传入带meta的字段
  const needTransfer = routes.filter(route => route.meta);
  const structure = { id: 'name', pid: 'pname', children: 'routes' };
  const consoleString = transferSql(transferSqlModel(tttansfer(needTransfer, structure)));
  // eslint-disable-next-line
  console.log(JSON.stringify(consoleString));
};
