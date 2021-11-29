/* eslint-disable */
import { getClientUrl, getVirtualClient, DELAY } from '@/e2e/test.env.js';

/**
 * 登录 (一部分可以抽取出来，放在每一个页面里面，用来解决测试session问题。)
 */
describe('Login', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = getVirtualClient();
  });

  beforeEach(async () => {
    page = await browser.newPage();
    await page.goto(getClientUrl('/user/login'), { waitUntil: 'networkidle2' });
    // await page.evaluate(() => window.localStorage.setItem('antd-pro-authority', 'guest'));
  });

  afterEach(() => page.close());

  it('场景: 密码错误导致登录失败。', async () => {
    await page.waitForSelector('#userName', {
      timeout: DELAY.NORMAL,
    });
    await page.type('#userName', 'mockuser');
    await page.type('#password', 'wrong_password');
    await page.click('button[type="submit"]');
    await page.waitForSelector('.ant-alert-error'); // should display error
  });

  it('场景: 正确的用户名密码登录成功。', async () => {
    await page.waitForSelector('#userName', {
      timeout: DELAY.NORMAL,
    });
    await page.type('#userName', 'admin');
    await page.type('#password', 'password');
    await page.click('button[type="submit"]');
    await page.waitForSelector('.ant-layout-sider h1'); // should display error
    const text = await page.evaluate(() => document.body.innerHTML);
    expect(text).toContain('<h1>Ant Design Pro</h1>');
  });

  afterAll(() => browser.close());
});
