import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Tooltip, Modal } from 'antd';
import moment from 'moment';
import { formatMessage } from 'umi/locale';
import { FileManagerEnhance } from '@/pages/gen/field';
import { closeThenGoto, mountToTab } from '@/layouts/routerControl';
import createMessage from '@/components/core/AlertMessage';
import { format } from 'url';

// 详情页tab
const operationTabList = [
  {
    key: 'basic',
    tab: formatMessage({ id: `plat.res.menuMap.basic`, desc: '基本信息（HR、本人）' }),
  },
  // {
  //   key: 'basicBy',
  //   tab: formatMessage({ id: `plat.res.menuMap.basic`, desc: '基本信息（负责人）' }),
  // },
  {
    key: 'platInfo',
    tab: formatMessage({ id: `plat.res.menuMap.platInfo`, desc: '平台信息' }),
  },
  {
    key: 'organizeInfo',
    tab: formatMessage({ id: `plat.res.menuMap.organizeInfo`, desc: '组织信息' }),
  },
  {
    key: 'vacation',
    tab: '个人假期',
  },
  {
    key: 'edubg',
    tab: formatMessage({ id: `plat.res.menuMap.edubg`, desc: '教育经历' }),
  },
  {
    key: 'workbg',
    tab: formatMessage({ id: `plat.res.menuMap.workbg`, desc: '工作经历' }),
  },
  {
    key: 'proExp',
    tab: formatMessage({ id: `plat.res.menuMap.proExp`, desc: '项目履历' }),
  },
  {
    key: 'capa',
    tab: formatMessage({ id: `plat.res.menuMap.capa`, desc: '能力档案' }),
  },
  {
    key: 'project',
    tab: formatMessage({ id: `plat.res.menuMap.project`, desc: '任务履历' }),
  },
  {
    key: 'eval',
    tab: formatMessage({ id: `plat.res.menuMap.eval`, desc: '评价信息' }),
  },
  {
    key: 'getrp',
    tab: formatMessage({ id: `plat.res.menuMap.getrp`, desc: '奖惩信息' }),
  },
  {
    key: 'cert',
    tab: formatMessage({ id: `plat.res.menuMap.cert`, desc: '资质证书' }),
  },
  {
    key: 'financeInfo',
    tab: formatMessage({ id: `plat.res.menuMap.financeInfo`, desc: '财务信息' }),
  },
  {
    key: 'personnel',
    tab: formatMessage({ id: `plat.res.menuMap.personnel`, desc: '人事标签' }),
  },
  {
    key: 'selfEvaluation',
    tab: formatMessage({ id: `plat.res.menuMap.selfEvaluation`, desc: '自我介绍' }),
  },
  {
    key: 'entryExitRecord',
    tab: formatMessage({ id: `plat.res.menuMap.entryExitRecord`, desc: '入离职记录' }),
  },
];
// 编辑页tab
const editOperationTabList = [
  {
    key: 'basic',
    tab: formatMessage({ id: `plat.res.menuMap.basic`, desc: '基本信息' }),
  },
  {
    key: 'platInfo',
    tab: formatMessage({ id: `plat.res.menuMap.platInfo`, desc: '平台信息' }),
  },
  {
    key: 'edubg',
    tab: formatMessage({ id: `plat.res.menuMap.edubg`, desc: '教育经历' }),
  },
  {
    key: 'workbg',
    tab: formatMessage({ id: `plat.res.menuMap.workbg`, desc: '工作经历' }),
  },
  {
    key: 'proExp',
    tab: formatMessage({ id: `plat.res.menuMap.proExp`, desc: '项目履历' }),
  },
  {
    key: 'getrp',
    tab: formatMessage({ id: `plat.res.menuMap.getrp`, desc: '奖惩信息' }),
  },
  {
    key: 'cert',
    tab: formatMessage({ id: `plat.res.menuMap.cert`, desc: '资质证书' }),
  },
  {
    key: 'financeInfo',
    tab: formatMessage({ id: `plat.res.menuMap.financeInfo`, desc: '财务信息' }),
  },
  {
    key: 'personnel',
    tab: formatMessage({ id: `plat.res.menuMap.personnel`, desc: '人事标签' }),
  },
  {
    key: 'selfEvaluation',
    tab: formatMessage({ id: `plat.res.menuMap.selfEvaluation`, desc: '自我介绍' }),
  },
];
// 个人中心-个人信息查看tab
const centerTabList = [
  {
    key: 'basic',
    tab: formatMessage({ id: `plat.res.menuMap.basic`, desc: '基本信息（HR、本人）' }),
  },
  {
    key: 'platInfo',
    tab: formatMessage({ id: `plat.res.menuMap.platInfo`, desc: '平台信息' }),
  },
  {
    key: 'organizeInfo',
    tab: formatMessage({ id: `plat.res.menuMap.organizeInfo`, desc: '组织信息' }),
  },
  {
    key: 'vacation',
    tab: formatMessage({ id: `plat.res.menuMap.vacation`, desc: '个人假期' }),
  },
  {
    key: 'edubg',
    tab: formatMessage({ id: `plat.res.menuMap.edubg`, desc: '教育经历' }),
  },
  {
    key: 'workbg',
    tab: formatMessage({ id: `plat.res.menuMap.workbg`, desc: '工作经历' }),
  },
  {
    key: 'proExp',
    tab: formatMessage({ id: `plat.res.menuMap.proExp`, desc: '项目履历' }),
  },
  {
    key: 'capa',
    tab: formatMessage({ id: `plat.res.menuMap.capa`, desc: '能力档案' }),
  },
  {
    key: 'project',
    tab: formatMessage({ id: `plat.res.menuMap.project`, desc: '任务履历' }),
  },
  {
    key: 'eval',
    tab: formatMessage({ id: `plat.res.menuMap.eval`, desc: '评价信息' }),
  },
  {
    key: 'getrp',
    tab: formatMessage({ id: `plat.res.menuMap.getrp`, desc: '奖惩信息' }),
  },
  {
    key: 'cert',
    tab: formatMessage({ id: `plat.res.menuMap.cert`, desc: '资质证书' }),
  },
  {
    key: 'financeInfo',
    tab: formatMessage({ id: `plat.res.menuMap.financeInfo`, desc: '财务信息' }),
  },
  {
    key: 'computer',
    tab: formatMessage({ id: `plat.res.menuMap.computer`, desc: '自购电脑申请' }),
  },
  {
    key: 'selfEvaluation',
    tab: formatMessage({ id: `plat.res.menuMap.selfEvaluation`, desc: '自我介绍' }),
  },
  {
    key: 'myPermission',
    tab: formatMessage({ id: `plat.res.menuMap.myPermission`, desc: '我的权限' }),
  },
];

// 员工信息tab
const informationTabList = [
  {
    key: 'basic',
    tab: '基本信息',
  },
  {
    key: 'changeRecord',
    tab: '异动记录',
  },
  {
    key: 'train',
    tab: '培训记录',
  },
  {
    key: 'vacation',
    tab: 'TA的假期',
  },
  {
    key: 'salary',
    tab: '薪资信息',
  },
];
// 个人中心-个人信息编辑tab
const infoEditTabList = [
  {
    key: 'basic',
    tab: formatMessage({ id: `plat.res.menuMap.basic`, desc: '基本信息' }),
  },
  {
    key: 'edubg',
    tab: formatMessage({ id: `plat.res.menuMap.edubg`, desc: '教育经历' }),
  },
  {
    key: 'workbg',
    tab: formatMessage({ id: `plat.res.menuMap.workbg`, desc: '工作经历' }),
  },
  {
    key: 'proExp',
    tab: formatMessage({ id: `plat.res.menuMap.proExp`, desc: '项目履历' }),
  },
  {
    key: 'financeInfo',
    tab: formatMessage({ id: `plat.res.menuMap.financeInfo`, desc: '财务信息' }),
  },
  {
    key: 'selfEvaluation',
    tab: formatMessage({ id: `plat.res.menuMap.selfEvaluation`, desc: '自我介绍' }),
  },
];
// 资源查找详情
const resFindTabList = [
  {
    key: 'basic',
    tab: formatMessage({ id: `plat.res.menuMap.basic`, desc: '基本信息（HR、本人）' }),
  },
  {
    key: 'organizeInfo',
    tab: formatMessage({ id: `plat.res.menuMap.organizeInfo`, desc: '组织信息' }),
  },
  {
    key: 'edubg',
    tab: formatMessage({ id: `plat.res.menuMap.edubg`, desc: '教育经历' }),
  },
  {
    key: 'workbg',
    tab: formatMessage({ id: `plat.res.menuMap.workbg`, desc: '工作经历' }),
  },
  {
    key: 'proExp',
    tab: formatMessage({ id: `plat.res.menuMap.proExp`, desc: '项目履历' }),
  },
  {
    key: 'capa',
    tab: formatMessage({ id: `plat.res.menuMap.capa`, desc: '能力档案' }),
  },
  {
    key: 'project',
    tab: formatMessage({ id: `plat.res.menuMap.project`, desc: '任务履历' }),
  },
  {
    key: 'getrp',
    tab: formatMessage({ id: `plat.res.menuMap.getrp`, desc: '奖惩信息' }),
  },
  {
    key: 'cert',
    tab: formatMessage({ id: `plat.res.menuMap.cert`, desc: '资质证书' }),
  },
];

// 考核信息
const examineColumns = [
  {
    title: '考核期间',
    dataIndex: 'periodName',
    align: 'center',
  },
  {
    title: '考核项目',
    dataIndex: 'piTypeDesc',
    align: 'center',
  },
  {
    title: '考核指标',
    dataIndex: 'piVal',
    align: 'center',
  },
];
// 教育经历
const edubgColumns = [
  {
    title: '学历类别', // TODO: 国际化
    dataIndex: 'edusysTypeName',
    align: 'center',
    width: '25%',
  },
  {
    title: '时间', // TODO: 国际化
    // dataIndex: 'dateView',
    align: 'center',
    width: '15%',
    render: (value, row, key) =>
      row.dateTo ? (
        <span>
          {moment(row.dateFrom).format('YYYY-MM') + '~' + moment(row.dateTo).format('YYYY-MM')}
        </span>
      ) : (
        <span>{moment(row.dateFrom).format('YYYY-MM') + '~至今'}</span>
      ),
  },
  {
    title: '学校', // TODO: 国际化
    dataIndex: 'schoolName',
    align: 'center',
    width: '15%',
  },
  {
    title: '学历', // TODO: 国际化
    dataIndex: 'qualificationName',
    align: 'center',
    width: '10%',
  },
  {
    title: '专业', // TODO: 国际化
    dataIndex: 'majorName',
    align: 'center',
    width: '20%',
  },
  {
    title: '专业描述', // TODO: 国际化
    dataIndex: 'majorDesc',
    width: '15%',
    render: (value, row, key) =>
      value && value.length > 15 ? (
        <Tooltip placement="left" title={value}>
          <pre>{`${value.substr(0, 15)}...`}</pre>
        </Tooltip>
      ) : (
        <pre>{value}</pre>
      ),
  },
];
// 工作经历
const workbgColumns = [
  {
    title: '时间', // TODO: 国际化
    // dataIndex: 'dateView',
    align: 'center',
    width: '15%',
    render: (value, row, key) =>
      row.dateTo ? (
        <span>
          {moment(row.dateFrom).format('YYYY-MM') + '~' + moment(row.dateTo).format('YYYY-MM')}
        </span>
      ) : (
        <span>{moment(row.dateFrom).format('YYYY-MM') + '~至今'}</span>
      ),
  },
  {
    title: '行业', // TODO: 国际化
    dataIndex: 'industry',
    align: 'center',
    width: '15%',
  },
  {
    title: '公司', // TODO: 国际化
    dataIndex: 'companyName',
    width: '20%',
  },
  {
    title: '部门', // TODO: 国际化
    dataIndex: 'deptName',
    align: 'center',
    width: '15%',
  },
  {
    title: '职位', // TODO: 国际化
    dataIndex: 'jobtitle',
    align: 'center',
    width: '15%',
  },
  {
    title: '职责描述', // TODO: 国际化
    dataIndex: 'dutyDesc',
    align: 'center',
    width: '20%',
    render: (value, row, key) =>
      value && value.length > 15 ? (
        <Tooltip placement="left" title={value}>
          <pre>{`${value.substr(0, 15)}...`}</pre>
        </Tooltip>
      ) : (
        <pre>{value}</pre>
      ),
  },
];
// 项目履历
const proExpColumns = [
  {
    title: '开始时间',
    dataIndex: 'dateFrom',
    render: val => (
      <div style={{ minWidth: '80px' }}>{val ? moment(val).format('YYYY-MM') : ''}</div>
    ),
    align: 'center',
  },
  {
    title: '结束时间',
    dataIndex: 'dateTo',
    render: val => (
      <div style={{ minWidth: '80px' }}>{val ? moment(val).format('YYYY-MM') : '至今'}</div>
    ),
    align: 'center',
  },
  {
    title: '项目名称',
    dataIndex: 'projName',
    width: '10%',
  },
  {
    title: '是否平台内项目',
    dataIndex: 'platProjFlagDesc',
    render: val => <div style={{ textAlign: 'center' }}>{val}</div>,
  },
  {
    title: '相关产品',
    dataIndex: 'product',
    align: 'center',
    width: '10%',
  },
  {
    title: '相关行业',
    dataIndex: 'industry',
    width: '10%',
  },
  {
    title: '项目角色',
    dataIndex: 'projRole',
    width: '5%',
  },
  {
    title: '所在公司',
    dataIndex: 'company',
    width: '15%',
  },
  {
    title: '项目简介',
    dataIndex: 'projIntro',
    width: '10%',
    render: (value, row, key) =>
      value && value.length > 10 ? (
        <Tooltip placement="left" title={value}>
          <pre>{`${value.substr(0, 10)}...`}</pre>
        </Tooltip>
      ) : (
        <pre>{value}</pre>
      ),
  },
  {
    title: '职责&业绩',
    dataIndex: 'dutyAchv',
    width: '15%',
    render: (value, row, key) =>
      value && value.length > 10 ? (
        <Tooltip placement="left" title={value}>
          <pre>{`${value.substr(0, 10)}...`}</pre>
        </Tooltip>
      ) : (
        <pre>{value}</pre>
      ),
  },
];
// 能力档案 - 能力列表
const capaColumns = [
  {
    title: '能力', // TODO: 国际化
    dataIndex: 'entryName',
  },
  {
    title: '状态', // TODO: 国际化
    dataIndex: 'obtainStatusName',
    align: 'center',
  },
  {
    title: '获得日期', // TODO: 国际化
    dataIndex: 'obtainDate',
  },
  {
    title: '上次认证日期', // TODO: 国际化
    dataIndex: 'lastRenewDate',
  },
  {
    title: '到期日期', // TODO: 国际化
    dataIndex: 'dueDate',
  },
];
// 能力档案 - 复合能力列表
const capasetColumns = [
  {
    title: '复合能力', // TODO: 国际化
    dataIndex: 'entryName',
  },
  // {
  //   title: '能力分类', // TODO: 国际化
  //   dataIndex: 'capaType1Name-capaType2Name',
  // },
  // {
  //   title: '当量系数', // TODO: 国际化
  //   dataIndex: 'eqvaRatio',
  //   align: 'right',
  // },
  {
    title: '状态', // TODO: 国际化
    dataIndex: 'obtainStatusName',
    align: 'center',
  },
  {
    title: '获得日期', // TODO: 国际化
    dataIndex: 'obtainDate',
    align: 'center',
  },
  {
    title: '上次认证日期', // TODO: 国际化
    dataIndex: 'lastRenewDate',
    align: 'center',
  },
];
const resProjlogColumns = [
  {
    title: '项目名称', // TODO: 国际化
    dataIndex: 'projName',
  },
  {
    title: '任务编号', // TODO: 国际化
    dataIndex: 'taskNo',
    align: 'center',
  },
  {
    title: '任务名称', // TODO: 国际化
    dataIndex: 'taskName',
  },
  {
    title: '开始时间', // TODO: 国际化
    dataIndex: 'dateFrom',
  },
  {
    title: '结束时间', // TODO: 国际化
    dataIndex: 'dateTo',
  },
  {
    title: '角色', // TODO: 国际化
    dataIndex: 'roleCode',
  },
  {
    title: '评价得分', // TODO: 国际化
    dataIndex: 'evalScore',
    align: 'right',
  },
];
// 评价信息
const evalColumns = [
  {
    title: '评价点', // TODO: 国际化
    dataIndex: 'evalName',
    width: '70%',
  },
  {
    title: '平均分数', // TODO: 国际化
    dataIndex: 'averageScore',
    width: '30%',
    align: 'right',
    render: (value, row, index) => (+value).toFixed(1),
  },
];
// 奖惩信息
const getrpColumns = [
  {
    title: '时间', // TODO: 国际化
    dataIndex: 'obtainTime',
  },
  {
    title: '奖惩名称', // TODO: 国际化
    dataIndex: 'rpName',
  },
  {
    title: '奖惩区分', // TODO: 国际化
    dataIndex: 'rpTypeName',
    align: 'center',
  },
  {
    title: '到期日', // TODO: 国际化
    dataIndex: 'expireDate',
  },
  {
    title: '证书', // TODO: 国际化
    dataIndex: 'id',
    render: (value, row, key) => (
      <FileManagerEnhance
        api="/api/person/v1/res/getrps/sfs/token"
        dataKey={value}
        listType="text"
        disabled
        preview
      />
    ),
  },
  {
    title: '原因', // TODO: 国际化
    dataIndex: 'reasonDesc',
    render: (value, row, key) =>
      value && value.length > 15 ? (
        <Tooltip placement="left" title={value}>
          <pre>{`${value.substr(0, 15)}...`}</pre>
        </Tooltip>
      ) : (
        <pre>{value}</pre>
      ),
  },
];
// 资质证书
const certColumns = [
  {
    title: '证书名称', // TODO: 国际化
    dataIndex: 'certName',
    width: 200,
  },
  {
    title: '证书号码', // TODO: 国际化
    dataIndex: 'certNo',
    align: 'center',
    width: 150,
  },
  {
    title: '状态', // TODO: 国际化
    dataIndex: 'certStatusName',
    align: 'center',
    width: 80,
  },
  {
    title: '获得时间', // TODO: 国际化
    dataIndex: 'obtainDate',
    width: 120,
  },
  {
    title: '有效期长（月）', // TODO: 国际化
    dataIndex: 'validMonths',
    align: 'right',
    width: 100,
  },
  {
    title: '上次认证时间', // TODO: 国际化
    dataIndex: 'lastRenewDate',
    width: 120,
  },
  {
    title: '到期日', // TODO: 国际化
    dataIndex: 'dueDate',
    width: 120,
  },
  {
    title: '证书附件', // TODO: 国际化
    dataIndex: 'id',
    width: 150,
    render: (value, row, key) => (
      <FileManagerEnhance
        api="/api/person/v1/res/cert/sfs/token"
        dataKey={value}
        listType="text"
        disabled
        preview
      />
    ),
  },
  {
    title: '分数', // TODO: 国际化
    dataIndex: 'score',
    align: 'right',
    width: 80,
  },
  {
    title: '等级', // TODO: 国际化
    dataIndex: 'grade',
    width: 80,
  },
  {
    title: '颁发机构', // TODO: 国际化
    dataIndex: 'releaseBy',
    width: 150,
  },
  {
    title: '来源', // TODO: 国际化
    dataIndex: 'sourceTypeName',
    align: 'center',
    width: 120,
  },
  {
    title: '说明', // TODO: 国际化
    dataIndex: 'certDesc',
    render: (value, row, key) =>
      value && value.length > 15 ? (
        <Tooltip placement="left" title={value}>
          <pre>{`${value.substr(0, 15)}...`}</pre>
        </Tooltip>
      ) : (
        <pre>{value}</pre>
      ),
  },
];
// 财务信息
const financeInfoColumns = [
  {
    title: '账户名称', // TODO: 国际化
    dataIndex: 'accName',
    sorter: true,
    align: 'center',
    width: '5%',
  },
  {
    title: '账号', // TODO: 国际化
    dataIndex: 'accountNo',
    align: 'center',
    width: '20%',
  },
  {
    title: '账户类型', // TODO: 国际化
    dataIndex: 'accTypeName',
    align: 'center',
    width: '5%',
  },
  {
    title: '币种', // TODO: 国际化
    dataIndex: 'currCodeName',
    align: 'center',
    width: '8%',
  },
  {
    title: '状态', // TODO: 国际化
    dataIndex: 'accStatusName',
    align: 'center',
    width: '5%',
  },
  {
    title: '是否工资卡', // TODO: 国际化
    dataIndex: 'defaultFlagName',
    align: 'center',
    width: '5%',
  },
  {
    title: '开户人', // TODO: 国际化
    dataIndex: 'holderName',
    align: 'center',
    width: '10%',
  },
  {
    title: '开户行', // TODO: 国际化
    dataIndex: 'bankName',
    align: 'center',
    width: '10%',
  },
  {
    title: '开户地', // TODO: 国际化
    dataIndex: 'bankCity',
    align: 'center',
    width: '10%',
  },
  {
    title: '开户网点', // TODO: 国际化
    dataIndex: 'bankBranch',
    align: 'center',
    width: '17%',
  },
  {
    title: '备注', // TODO: 国际化
    dataIndex: 'remark',
    width: '5%',
    render: (value, row, key) =>
      value && value.length > 15 ? (
        <Tooltip placement="left" title={value}>
          <pre>{`${value.substr(0, 15)}...`}</pre>
        </Tooltip>
      ) : (
        <pre>{value}</pre>
      ),
  },
];

const entryExitColumns = [
  {
    title: '类型', // TODO: 国际化
    dataIndex: 'reasonType2Name',
    align: 'center',
    width: '8%',
  },
  {
    title: '入离职时间', // TODO: 国际化
    dataIndex: 'entryExitDate',
    align: 'center',
    width: '8%',
  },
  {
    title: '资源类型', // TODO: 国际化
    dataIndex: 'resTypeName',
    width: '8%',
    align: 'center',
  },
  {
    title: '所属公司', // TODO: 国际化
    dataIndex: 'ouName',
    align: 'center',
    width: '15%',
  },
  {
    title: 'BaseBU', // TODO: 国际化
    dataIndex: 'buName',
    align: 'center',
    width: '15%',
  },
  {
    title: 'Base地', // TODO: 国际化
    dataIndex: 'baseCityName',
    align: 'center',
    width: '10%',
  },
  {
    title: '合作方式', // TODO: 国际化
    dataIndex: 'coopTypeName',
    align: 'center',
    width: '10%',
  },
  {
    title: '岗位', // TODO: 国际化
    dataIndex: 'job',
    align: 'center',
    width: '8%',
  },
  {
    title: '资源类别', // TODO: 国际化
    dataIndex: 'resClass',
    align: 'center',
    width: '8%',
  },
  {
    title: '离职原因', // TODO: 国际化
    dataIndex: 'leaveReasonName',
    align: 'center',
    width: '15%',
  },
  {
    title: '离职原因说明', // TODO: 国际化
    dataIndex: 'leaveReasonDesc',
    align: 'left',
    render: (value, row, key) =>
      value && value.length > 15 ? (
        <Tooltip placement="left" title={value}>
          <pre>{`${value.substr(0, 15)}...`}</pre>
        </Tooltip>
      ) : (
        <pre>{value}</pre>
      ),
  },
];

const computerColumns = [
  {
    title: '申请id',
    dataIndex: 'id',
    align: 'center',
  },
  {
    title: '申请人',
    dataIndex: 'applyResName',
  },
  {
    title: '申请日期',
    dataIndex: 'applyDate',
    render: value => (value ? moment(value).format('YYYY-MM-DD') : value),
  },
  {
    title: '补贴起始月份',
    dataIndex: 'startPeriodId',
  },
  {
    title: '申请状态',
    dataIndex: 'applyStatusDesc',
    align: 'center',
  },
  {
    title: '审批状态',
    dataIndex: 'apprStatusDesc',
    align: 'center',
  },
  {
    title: '申请理由',
    dataIndex: 'applyDesc',
    width: '15%',
    render: (value, row, index) =>
      value && value.length > 15 ? (
        <Tooltip placement="left" title={value}>
          <pre>{`${value.substr(0, 15)}...`}</pre>
        </Tooltip>
      ) : (
        <pre>{value}</pre>
      ),
  },
  {
    title: '操作',
    dataIndex: 'edit',
    align: 'center',
    width: '10%',
    render: (value, row, index) => {
      if (row.applyStatus !== 'CREATE') {
        return null;
      }
      return (
        <>
          <a
            onClick={e => {
              e.preventDefault();
              if (row.taskId) {
                closeThenGoto(
                  `/plat/expense/computer/apply/edit?id=${row.id}&page=my&taskId=${row.taskId}`
                );
              } else {
                closeThenGoto(`/plat/expense/computer/apply/edit?id=${row.id}&page=my`);
              }
            }}
          >
            修改
          </a>
          {/* |
        <a
          onClick={e => {
            e.preventDefault();
            if (row.applyStatus === 'CREATE') {
              Modal.confirm({
                title: '删除自购电脑申请',
                content: '确定删除吗？',
                okText: '确认',
                cancelText: '取消',
                onOk: () => {
                  // TODO:
                },
              });
            } else {
              createMessage({ type: 'warn', description: '仅新增的可删除' });
            }
          }}
        >
          删除
        </a> */}
        </>
      );
    },
  },
];

export {
  operationTabList,
  editOperationTabList,
  centerTabList,
  infoEditTabList,
  resFindTabList,
  examineColumns,
  edubgColumns,
  workbgColumns,
  proExpColumns,
  capaColumns,
  capasetColumns,
  resProjlogColumns,
  evalColumns,
  certColumns,
  financeInfoColumns,
  getrpColumns,
  computerColumns,
  entryExitColumns,
  informationTabList,
};
