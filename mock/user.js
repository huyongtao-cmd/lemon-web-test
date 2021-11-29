// 代码中会兼容本地 service mock 以及部署站点的静态数据
/* eslint-disable */
export default {
  // 支持值为 Object 和 Array
  'GET /principal': {
    name: 'EL Admin',
    avatar: 'http://192.168.0.159/api/user/avatar?uid=120',
    userid: '00000001',
    email: 'eladmin@elitesland.com',
    signature: '这是放置签名的地方',
    title: '技术开发',
    group: '某某某事业群－某某平台部－某某技术部-XXX',
    tags: [
      {
        key: '0',
        label: '标签A',
      },
      {
        key: '1',
        label: '标签B',
      },
      {
        key: '2',
        label: '标签C',
      },
      {
        key: '3',
        label: '标签D',
      },
      {
        key: '4',
        label: '标签E',
      },
    ],
    notifyCount: 12,
    country: 'China',
    geographic: {
      province: {
        label: '上海市',
        key: '330000',
      },
      city: {
        label: '长宁区',
        key: '330100',
      },
    },
    address: '金钟路767号中瑞大厦',
    phone: '021-62470087',
  },
  // GET POST 可省略
  'GET /sec/principal': {
    info: {
      id: 1,
      name: 'EDS Admin',
      title: '管理员',
      login: 'admin',
    },
    extraInfo: {
      userId: 1,
      ouId: 2,
      resId: 1,
      empNo: '80000001',
      contact: [
        {
          key: '1',
          name: 'John Brown',
          age: 32,
          address: 'New York No. 1 Lake Park',
        },
        {
          key: '2',
          name: 'Jim Green',
          age: 42,
          address: 'London No. 1 Lake Park',
        },
        {
          key: '3',
          name: 'Joe Black',
          age: 32,
          address: 'Sidney No. 1 Lake Park',
        },
      ],
    },
  },
  'POST /sec/csrf': (req, res) => {
    res.setHeader('el-result-code', '10000000-1000-1000-1000-100000000000').status(204);
  },
  'POST /sec/login': (req, res) => {
    const { password, login_no, type } = req.body;
    if (password === 'password' && login_no === 'admin') {
      res.setHeader('el-result-code', 'ok').send({
        status: 'ok',
        type,
        currentAuthority: 'admin',
      });
      return;
    }
    if (password === 'password' && login_no === 'user') {
      res.setHeader('el-result-code', 'ng').send({
        status: 'ok',
        type,
        currentAuthority: 'user',
      });
      return;
    }
    res.send({
      status: 'error',
      type,
      currentAuthority: 'guest',
    });
  },
  'POST /api/register': (req, res) => {
    res.send({ status: 'ok', currentAuthority: 'user' });
  },
  'GET /api/500': (req, res) => {
    res.status(500).send({
      timestamp: 1513932555104,
      status: 500,
      error: 'error',
      message: 'error',
      path: '/base/category/list',
    });
  },
  'GET /api/404': (req, res) => {
    res.status(404).send({
      timestamp: 1513932643431,
      status: 404,
      error: 'Not Found',
      message: 'No message available',
      path: '/base/category/list/2121212',
    });
  },
  'GET /api/403': (req, res) => {
    res.status(403).send({
      timestamp: 1513932555104,
      status: 403,
      error: 'Unauthorized',
      message: 'Unauthorized',
      path: '/base/category/list',
    });
  },
  'GET /api/401': (req, res) => {
    res.status(401).send({
      timestamp: 1513932555104,
      status: 401,
      error: 'Unauthorized',
      message: 'Unauthorized',
      path: '/base/category/list',
    });
  },
};
