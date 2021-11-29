// 设置idea 能正确的识别@路径,需要设置idea 的webpack的配置文件
const path = require('path');

module.exports = {
  context: path.resolve('./'),
  resolve: {
    extensions: ['ejs', '.js', '.jsx', '.json'],
    alias: {
      '@': path.resolve('src/'),
    },
  },
};
