import router from 'umi/router';
import { forEachObjIndexed, mergeAll, isNil } from 'ramda';

import { dangerousDispatch, getCsrfToken } from '@/utils/networkUtils';
import { fromQs, toQs } from '@/utils/stringUtils';
import { queryUdc } from '@/services/gen/app';

/* eslint no-underscore-dangle: 0 */

/**
 * 检查当前Tab
 * @param pathname
 * @return {Boolean}
 */
export function checkIfInTab(pathname = window.location.pathname + window.location.search) {
  // console.log(`[EL-TABS]: Path -> ${pathname}`); // eslint-disable-line
  // super hack. 这个地方要跟TabBar的功能一起看。window.g_app就是Redux(dva, whatever数据驱动核心)的namespace，这个标记暂挂在这里。
  // 多Tab跳转的时候根据'_refresh'参数判断是否需要刷新目标tab的状态，但是第一次路由的时候必须强制刷新
  // 会影响热部署，不会影响正是环境
  // to Developer: 我们当前的需求不要去刷新保存tab，如果你要把整个state存储来做tab内容保存，那么这个状态必须一起存起来(它可能就不是放在此处了)。
  if (!window.g_app._tabLifecycle && getCsrfToken()) {
    // window.history.length === 1
    window.g_app._tabLifecycle = 1;
    return false;
  }
  return fromQs(pathname)._refresh === '0';
}

/**
 * @decorator
 * 重写 componentDidMount
 * 路由限制模块 - AOP实现
 * @return {Function}
 */
export function mountToTab() {
  return (target, name, descriptor) => {
    // 我们可以这种操作看作一种AOP实现 - 必须不能用箭头函数，因为箭头函数的scope是跟着当前类走的。
    if (typeof target.prototype.componentDidMount === 'function') {
      // 防止出现循环调用 - 函数对象不是全部属性都引用的。
      const newFunc = target.prototype.componentDidMount;
      // eslint-disable-next-line
      target.prototype.componentDidMount = function _() {
        if (checkIfInTab()) {
          // eslint-disable-next-line
          // console.log(
          //   "[EL-TABS]: Routing as a Tab component, 'componentDidMount' will be cancelled."
          // );
          return () => {};
        }
        return newFunc.call(this);
      };
    }
  };
}

/**
 * @decorator
 * 向指定类中注入Udc - AOP实现
 * 注意! 该方法作为注解使用时，需要写在 mountToTab 的上面！
 * 同理，该方法作为工厂方法时 需要包裹在 mountToTab 的外面!
 * TODO: 现在是一口气全部注入进来才返回数据（后期UDC缓存开了性能不会有太大影响，但还是不好）暂无时间优化但是可以改进。
 * @return {Function}
 */
export function injectUdc(sourceMap, Domain) {
  return (target, className, descriptor) => {
    // eslint-disable-next-line no-param-reassign
    target.prototype.getUdc = function _() {
      const that = this;
      // 先set进去防止解构无数据
      this.setState({
        _udcMap: {},
      });
      const keyMap = [];
      const deferredQueries = [];
      forEachObjIndexed((value, key) => {
        keyMap.push(key);
        deferredQueries.push(
          dangerousDispatch({
            type: 'global/queryUdc',
            payload: value,
          })
            .then(
              result =>
                Array.isArray(result) ? result.map(({ code, name }) => ({ code, name })) : []
            )
            .then(udcList => {
              // 提前返回，每个 UDC 拉取到数据后都及时返还
              that.setState(prevState => {
                const { _udcMap } = prevState;
                return {
                  _udcMap: { ..._udcMap, [key]: udcList },
                };
              });
              return udcList;
            })
        );
      }, sourceMap);
      return Promise.all(deferredQueries).then(
        resultSet =>
          // eslint-disable-next-line
          console.log('[EL-UDC]: All injected udc map received, update component state...') ||
          // that.setState({
          //   _udcMap: mergeAll(keyMap.map((key, i) => ({ [key]: resultSet[i] }))),
          // })
          // 原来是所有都拉完了一起返还，改成上面的 提前返回了（嘛，虽然统一返回是有原因的，不过 max request response time被吐槽太厉害了，就改了）
          // 现在时统一存到 redux 里面，切tab的时候就能做到状态保持
          // 其实这里可以不传 domain， 放在统一的 redux 里面做管理，性能会更好，但是……目前不做:)
          dangerousDispatch({
            type: `${Domain}/updateState`,
            payload: { _udcMap: mergeAll(keyMap.map((key, i) => ({ [key]: resultSet[i] }))) },
          })
      );
    };

    // must have state
    // eslint-disable-next-line
    target.prototype.state = target.prototype.state || {};

    if (typeof target.prototype.componentDidMount === 'function') {
      // 防止出现循环调用 - 函数对象不是全部属性都引用的。
      const newFunc = target.prototype.componentDidMount;
      // eslint-disable-next-line
      target.prototype.componentDidMount = function _() {
        if (checkIfInTab() && !isNil(Domain)) {
          const { _udcMap = {} } = this.props[Domain] || this.props || {};
          this.setState({ _udcMap });
        } else {
          this.getUdc();
        }
        return newFunc.call(this);
      };
    }
  };
}

/**
 * 重制所有状态与缓存
 */
export function resetCacheStatus() {
  // 见下方注释
  window.g_app._tabLifecycle = void 0;
  sessionStorage.clear();
  // sessionStorage.setItem('token_xsrf', '');
  console.log('[EL-CSRF]: Token reset.'); // eslint-disable-line
}

/**
 * 将一个路由标记为Tab页跳转
 * @param pathname
 * @return {string}
 */
export function markAsTab(pathname = window.location.pathname + window.location.search) {
  // eslint-disable-next-line
  if (!fromQs(pathname)._refresh) {
    // console.log('pathname ->', pathname, toQs(pathname, { _refresh: 0 }));
    return toQs(pathname, { _refresh: 0 });
  }
  return pathname;
}

/**
 * 将一个路由标记为Tab页跳转
 * @param pathname
 * @return {string}
 */
export function markAsNoTab(pathname = window.location.pathname + window.location.search) {
  // eslint-disable-next-line
  if (fromQs(pathname)._refresh) {
    // console.log('pathname ->', pathname, toQs(pathname, { _refresh: 0 }));
    return pathname.substring(0, pathname.length - 11);
  }
  return pathname;
}

/**
 * 关闭当前Tab
 * @param pathname
 * @return {Promise}
 */
export function closeTab(pathname = window.location.pathname + window.location.search) {
  // console.log(`[EL-TABS]: closing tab -> ${pathname}`); // eslint-disable-line
  // 这种功能hack过去问题其实不是很大。。。没有任何性能损失，只是看起来not semantic而已。
  // 先凑合着搞一搞，以后有时间再优化一下。
  return dangerousDispatch({
    type: 'global/removeTab',
    payload: {
      pathname,
    },
  });
}

/**
 * 关闭当前Tab
 * @param destination
 * @param departure
 * @return {Promise}
 */
// export function closeThenGoto(
//   destination,
//   departure = window.location.pathname + window.location.search
// ) {
//   // 关闭当前tab，切换新tab之前，重置一下当前tab所属redux的控制，使其可以执行 componentDidMount
//   window.g_app._tabLifecycle = void 0;
//   // console.log(`[EL-TABS]: closing current tab, then go to -> ${destination}`); // eslint-disable-line
//   destination && router.push(destination);
//   return closeTab(departure);
// }
export function closeThenGoto(
  destination,
  departure = window.location.pathname + window.location.search
) {
  dangerousDispatch({
    type: 'global/removePane',
    payload: {
      paneKey: window.location.pathname + window.location.search,
    },
  });
  router.push(destination);
}
