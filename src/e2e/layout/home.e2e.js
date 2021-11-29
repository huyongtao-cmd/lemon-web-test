/* eslint-disable */
import { getClientUrl, getVirtualClient } from '@/e2e/test.env.js';

describe('Homepage', () => {
  it('是这样的，这个测试会逼真的模拟页面加载出来之后，查看logo有没有显示。', async () => {
    const browser = await getVirtualClient();
    const page = await browser.newPage();
    // load - 页面的load事件触发时
    // domcontentloaded - 页面的DOMContentLoaded事件触发时
    // networkidle0 - 不再有网络连接时触发（至少500毫秒后）
    // networkidle2 - 只有2个网络连接时触发（至少500毫秒后）
    await page.goto(getClientUrl(), { waitUntil: 'networkidle2' });
    await page.waitForSelector('#logo h1');
    const text = await page.evaluate(() => document.body.innerHTML);
    expect(text).toContain('<h1>TELEWORK</h1>');
    await page.close();
    browser.close();
  });
});
