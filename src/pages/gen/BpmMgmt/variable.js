import { cond, equals, T, isNil, map } from 'ramda';

const COLOR_PRIMARY = '#284488';
const COLOR_BLUE_DARK = '#272E3F';
const COLOR_INFO = '#008FDB';
const COLOR_INFO_8 = '#00538f';
const COLOR_WARNING = '#faad14';
const COLOR_ERROR = '#f5222d';
const COLOR_SUCCESS = '#52c41a';
const COLOR_SUCCESS_8 = '#237804';
const COLOR_DISABLED = 'rgba(0, 0, 0, .25)';
const COLOR_DISABLED_DARK = 'rgba(0, 0, 0, .65)';
const COLOR_CLOSE = 'rgb(186, 57, 36)';

export const typeNames = {
  APPLIED: '提交',
  ABORTED: '作废',
  APPROVED: '通过',
  REJECTED: '拒绝',
  ASSIGN: '分配',
  NOTIFIED: '知会',
  REVIEWED: '已阅',
  CONTINUED: '继续',
  CLOSE: '关闭',
  REVOKED: '撤回',
  ACCEPT: '接收',
  COUNTERSIGN: '加签',
  TRANSFER: '转交',
};

const typeList = {
  APPLIED: {
    name: '提交',
    color: COLOR_PRIMARY,
    colorForLess: 'applied',
  },
  ABORTED: {
    name: '作废',
    color: COLOR_DISABLED,
    colorForLess: 'aborted',
  },
  APPROVED: {
    name: '通过',
    color: COLOR_BLUE_DARK,
    colorForLess: 'approved',
  },
  REJECTED: {
    name: '拒绝',
    color: COLOR_ERROR,
    colorForLess: 'rejected',
  },
  ASSIGN: {
    name: '分配',
    color: COLOR_SUCCESS,
    colorForLess: 'assign',
  },
  NOTIFIED: {
    name: '知会',
    color: COLOR_INFO,
    colorForLess: 'notified',
  },
  REVIEWED: {
    name: '已阅',
    color: COLOR_INFO_8,
    colorForLess: 'reviewed',
  },
  CONTINUED: {
    name: '继续',
    color: COLOR_SUCCESS_8,
    colorForLess: 'continued',
  },
  CLOSE: {
    name: '关闭',
    color: COLOR_CLOSE,
    colorForLess: 'close',
  },
  REVOKED: {
    name: '撤回',
    color: COLOR_DISABLED_DARK,
    colorForLess: 'revoked',
  },
  ACCEPT: {
    name: '接收',
    color: COLOR_SUCCESS_8,
    colorForLess: 'accept',
  },
  DEFAULT: {
    name: '处理中',
    color: COLOR_WARNING,
    colorForLess: 'default',
  },
  COUNTERSIGN: {
    name: '加签',
    color: COLOR_BLUE_DARK,
    colorForLess: 'countersign',
  },
  TRANSFER: {
    name: '转交',
    color: COLOR_BLUE_DARK,
    colorForLess: 'countersign',
  },
};

const nameMap = type => typeList[type].name;

const colorMap = type => typeList[type].color || typeList.DEFAULT.color;

const lessMap = type => typeList[type].colorForLess || typeList.DEFAULT.colorForLess;

const variableMap = (type, mapType) => {
  // eslint-disable-next-line
  if (!mapType) throw 'you need a mapType to decide which result you want';
  const modifiedType = isNil(type) ? 'DEFAULT' : type;
  return cond([
    [equals('name'), () => nameMap(modifiedType)],
    [equals('color'), () => colorMap(modifiedType)],
    [equals('less'), () => lessMap(modifiedType)],
    [T, () => {}],
  ])(mapType);
};

export default variableMap;
