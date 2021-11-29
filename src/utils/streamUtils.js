// ----------------------------------------------------------------
// 控制逻辑工具类 - 负责处理逻辑类函数以及一些异步操作处理。
// ----------------------------------------------------------------

/* eslint-disable */

/**
 * 执行一个函数，将其锁定，执行完释放。
 * @param {Object} exec - 必须是function
 * @param {Object} scope - 上下文
 * return exec - 原可执行函数
 */
const runSinglet = (scope, exec) => {
  if (typeof exec !== 'function') {
    throw { e: 'method should be a function.' };
  }
  const transient = exec;
  exec = () => Object.create(null);
  transient.apply(scope);
  // 使用完毕，重写绑定
  /* eslint react/no-param-reassign:0 */
  exec = transient;
  return exec;
};

/**
 * 空Promise
 * - Don't make a girl a promise if you know you can't keep it.
 */
const voidPromise = () => Promise.resolve(void 0);

/**
 * 错误的Promise
 */
const falsePromise = () => Promise.reject(void 0);

/**
 * 频率控制，控制在一定时间段内使指定函数执行1次。经常用来控制缩放和滚动。
 * 注意: 当前项目使用了lodash-decorator(内心比较拒绝，开发时间紧张所以没有调整此函数)，推荐用lodash-decorator.
 *
 * @param  {Number}    delay
 *  A zero-or-greater delay in milliseconds.
 *  For event callbacks, values around 100 or 250 (or even higher) are most useful.
 *
 * @param  {Boolean}   noTrailing
 *  Optional, defaults to false. If noTrailing is true, callback will only execute every `delay` milliseconds while the
 *  throttled-function is being called. If noTrailing is false or unspecified, callback will be executed one final time
 *  after the last throttled-function call. (After the throttled-function has not been called for `delay` milliseconds,
 *  the internal counter is reset)
 *
 * @param  {Function}  callback
 *  A function to be executed after delay milliseconds. The `this` context and all arguments are passed through, as-is,
 *  to `callback` when the throttled-function is executed.
 *
 * @param  {Boolean}   debounceMode
 *  If `debounceMode` is true (at begin), schedule `clear` to execute after `delay` ms.
 *  If `debounceMode` is false (at end), schedule `callback` to execute after `delay` ms.
 *
 * @return {Function}  A new, throttled, function.
 */
const throttle = (delay, noTrailing, callback, debounceMode) => {
  // After wrapper has stopped being called, this timeout ensures that
  // `callback` is executed at the proper times in `throttle` and `end`
  // debounce modes.
  let timeoutID;

  // Keep track of the last time `callback` was executed.
  let lastExec = 0;

  // `noTrailing` defaults to falsy.
  if (typeof noTrailing !== 'boolean') {
    debounceMode = callback;
    callback = noTrailing;
    noTrailing = void 0;
  }

  // The `wrapper` function encapsulates all of the throttling / debouncing
  // functionality and when executed will limit the rate at which `callback`
  // is executed.
  function wrapper() {
    const elapsed = Number(new Date()) - lastExec;
    const args = arguments;

    // Execute `callback` and update the `lastExec` timestamp.
    function exec() {
      lastExec = Number(new Date());
      callback.apply(this, args);
    }

    // If `debounceMode` is true (at begin) this is used to clear the flag
    // to allow future `callback` executions.
    function clear() {
      timeoutID = void 0;
    }

    if (debounceMode && !timeoutID) {
      // log.log('[throttle]: debounce mode activated.');
      // Since `wrapper` is being called for the first time and
      // `debounceMode` is true (at begin), execute `callback`.
      exec();
    }

    // Clear any existing timeout.
    if (timeoutID) {
      clearTimeout(timeoutID);
    }

    if (debounceMode === void 0 && elapsed > delay) {
      // log.log('[throttle]: throttle mode activated.');
      // In throttle mode, if `delay` time has been exceeded, execute
      // `callback`.
      exec();
    } else if (noTrailing !== true) {
      // In trailing throttle mode, since `delay` time has not been
      // exceeded, schedule `callback` to execute `delay` ms after most
      // recent execution.
      //
      // If `debounceMode` is true (at begin), schedule `clear` to execute
      // after `delay` ms.
      //
      // If `debounceMode` is false (at end), schedule `callback` to
      // execute after `delay` ms.
      timeoutID = setTimeout(
        debounceMode ? clear : exec,
        debounceMode === void 0 ? delay - elapsed : delay
      );
    }
  }

  // Return the wrapper function.
  return wrapper;
};

/**
 *
 * 空闲控制，该操作保证函数在一段时间内开始或者结束之后执行1次。经常用来防止过度点击按钮等。
 * 坑1 - 注意！！在React体系当中 不能在无状态组件中直接使用该方法，因为debounce实际上是有state的(嗯，不然你怎么记住上次bounce过)，render刷新就清掉了。
 * 有几种思路，其中一种是在class注册，保证react调用这个方法的时候不会使其内部状态消失，
 * 另一种是写在componentWillMount或constructor里面(其实就是用class方法初始化，非stateless component的function形式)
 * 坑2 - 还有，react的事件处理封装过一层（SyntheticEvent）。由于可能有update，DOM上的事件被调用过后该事件会被转移(不是真正的dom操作)，减少GC压力。
 * 如果我们希望DOM事件就像正常的HTML事件一样不被转移，就必须使用React的合成事件方法e.persist()，不然state刷新页面后就会导致你之前的事件处理作废。
 * 当然，如果你不对事件本身做控制 而是对事件执行的方法做控制，就不要紧。
 * 综上所述，在当前环境的react体系下，除了自定义组件，常规情况的使用方法可以是:
 * ```let anyEventDebouncer = (fn) => anyEventDebouncer = ctrlUtils.debounce(1000, true, fn)```
 * 然后在常规事件上进行:
 * ```anyEventDebouncer(myRandomCrapFunc)```
 * 骚操作 结束。由于无法正常获取上下文，此处相当于用let做了一个伪final类型的函数，通过提升上下文来让内部函数正常传入，而无需使用static方法。
 * 然后由于我们风骚的throttle方法内部自己有自变量，debounce方法其实是产生了一个小型运行scope，会一直维持而不被GC干掉。所以注册太多会使内存增加。
 * 但是，由于是final，因此fn一旦绑定，则无法修改成其它函数。因此一个debouncer只能对应一个debounce!!(请不要嫌烦，这是套路。)
 * 再次提醒: 该函数必须写在StatelessComponent外部。如果使用常规的Component，那么还是在constructor或者willMount的时候做。
 *
 * Note that in ES6, instead of defining your method inside the constructor (feels weird)
 * you can do handleOnChange = debounce((e) => { onChange handler code here }, timeout) at the top level of your class.
 * You're still effectively setting an instance member but it looks a bit more like a normal method definition.
 * No need for a constructor if you don't already have one defined. I suppose it's mostly a style preference.
 *
 * @param  {Number}   delay
 *  A zero-or-greater delay in milliseconds.
 *  For event callbacks, values around 100 or 250 (or even higher) are most useful.
 *
 * @param  {Boolean}  atBegin
 *  Optional, defaults to false.
 *  If atBegin is false or unspecified,
 *  callback will only be executed `delay` milliseconds after the last debounced-function call.
 *  If atBegin is true, callback will be executed only at the first debounced-function call.
 *  (After the throttled-function has not been called for `delay` milliseconds, the internal counter is reset).
 *
 * @param  {Function} callback
 *  A function to be executed after delay milliseconds.
 *  The `this` context and all arguments are passed through, as-is,
 *  to `callback` when the debounced-function is executed.
 *
 * @return {Function} A new, debounced function.
 */
const debounce = (delay, atBegin, callback) =>
  callback === void 0
    ? throttle(delay, atBegin, false)
    : throttle(delay, callback, atBegin !== false);

export default {
  debounce,
  throttle,
  runSinglet,
  voidPromise,
  falsePromise,
};
