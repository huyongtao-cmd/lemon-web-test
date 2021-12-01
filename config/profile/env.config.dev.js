export default {
  nameSpace: 'telework',
  postProcess: 0,
  // serverHost: 'http://localhost:9001/tw',
  // serverHost: 'http://192.168.0.144/tw',
  serverHost: '/tw', // 使用代理请开启这个
  proxyTargetHost: 'http://localhost:9001/', // 代理目标地址
  // proxyTargetHost: 'http://192.168.0.237:8003/', // 测试
  fsUrlHeader: 'http://192.168.1.103:9001/tw',
  isAntiCsrf: 1,
  isAntiDebug: 0,
  logLvl: 4,
  crossUrl: '/tw',
};
