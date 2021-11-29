/* eslint-disable */
import puppeteer from 'puppeteer';

// --------------------------------
// ------ E2E测试工具类 / 枚举 -------
// --------------------------------

/**
 * 指定客户端地址
 * @type {string}
 */
const CLIENT_URL = 'http://localhost:3001';

/**
 * 是否开启浏览模式
 * @type {boolean}
 */
const OpenBrowser = false;

/**
 * 获取生成虚拟用户端 - 对接需要测试的客户端
 * @param restProps
 * @return {Promise<!Promise<!Browser>|!Promise<!Puppeteer.Browser>|*>}
 */
const getVirtualClient = async (...restProps) =>
  puppeteer.launch({ args: ['--no-sandbox'], headless: !OpenBrowser, ...restProps });

/**
 * 获得完整的客户端URL路径
 * @param url
 * @return {string}
 */
const getClientUrl = url => [CLIENT_URL, url].join('');

/**
 * UX的响应时间 - 可以根据实际用户的可接受程度调节。
 */
const DELAY = {
  TRANSIENT: 50,
  IMMEDIATE: 300,
  DECENT: 1000,
  NORMAL: 2000,
  ACCEPTABLE: 3000,
  AVERAGE: 5000,
  OVERTIME: 10000,
  PERPETUAL: 99999 /* 不代表一直执行，代表用户接受无限大时间 */,
};

export { getClientUrl, getVirtualClient, DELAY };
