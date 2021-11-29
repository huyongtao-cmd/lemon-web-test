// 系统环境配置 - 注意！修改该文件及其引用的任意文件必须要重启服务才能生效。
import ci from './profile/env.config.ci';
import dev from './profile/env.config.dev';
import pd from './profile/env.config.pd';
import py from './profile/env.config.py';

export default {
  ci,
  dev,
  pd,
  py,
}[process.env.ENV || 'dev'];
