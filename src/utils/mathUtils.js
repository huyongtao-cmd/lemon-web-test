/* eslint-disable */
import nzh from 'nzh/cn';
import math from 'mathjs';
import { compose, curry, fromPairs, keys } from 'ramda';

// ----------------------------------------------------------------
// 数学计算工具类 - 处理高精度计算或者数字转化，提供数学算法。
// ----------------------------------------------------------------

// 高精度计算 - 内部统一返回BigDecimal，再统一转成number类型。
const basicHpOperations = (maths =>
  fromPairs(
    keys(maths).map(oper => [
      oper,
      curry(
        compose(
          parseFloat,
          bn => bn.toString(),
          maths[oper]
        )
      ),
    ])
  ))({
  // 高精度加法
  add: (sbj, acc) => {
    return math.add(math.bignumber(sbj), math.bignumber(acc));
  },
  // 高精度减法
  sub: (sbj, acc) => {
    return math.subtract(math.bignumber(sbj), math.bignumber(acc));
  },
  // 高精度乘法
  mul: (sbj, acc) => {
    return math.multiply(math.bignumber(sbj), math.bignumber(acc));
  },
  // 高精度除法
  div: (sbj, acc) => {
    return math.divide(math.bignumber(sbj), math.bignumber(acc));
  },
});

const digitUppercase = n => {
  return nzh.toMoney(n);
};

const fixedZero = val => {
  return val * 1 < 10 ? `0${val}` : val;
};

/**
 * Get a random floating point number between `min` and `max`.
 *
 * @param {number} min - min number
 * @param {number} max - max number
 * @param {number} precision - float point
 * @return {String} a random floating point number
 */
const getRandomFlt = ({ min = 0, max = 1, precision = 2 }) => {
  return (Math.random() * (max - min) + min).toFixed(precision);
};

/**
 * Get a random integer between `min` and `max`.
 *
 * @param {number} min - min number
 * @param {number} max - max number
 * @return {string} a random integer
 */
const getRandomInt = ({ min, max }) => getRandomFlt({ min, max, precision: 0 });

/**
 * 检查某个值是否是数字
 * @param candidate
 * @return {boolean}
 */
const checkIfNumber = candidate => typeof candidate === 'number' || +candidate + '' === candidate;

/**
 * 检查一个变量是否是数字（不一定是数字类型）
 * 如果是的话，返回解析结果，不是则返回原变量
 * @param candidate - 带判断变量
 * @returns {number | any}
 */
const parseIfNumeric = candidate =>
  // Number(parseFloat(candidate)) === +candidate
  checkIfNumber(candidate) ? +candidate : candidate;

/**
 * 极短时间利用时间戳作为种子生产不重复的唯一短主键(雪花算法 - 短)
 * 使用工厂类实现 (全局使用可以在这里初始化，用户每次访问当前网站的时候会实例化。)
 * 时间戳保证了不通毫秒不同，然后机器编码进程编码保证了不同进程不通
 * 序列在统一毫秒内，如果获取第二个ID，则序列号+1，到下一毫秒后重置。序列号用完了等到下一毫秒
 * 解决随机数有几率重复的问题。
 */
class IdProvider {
  // 生成ID的时间戳offset值 = 2000-01-01 你也可以随便选一天(整个ID元时间)
  epoch = new Date('2000-01-01').getTime();
  // 机器ID (可以不填写，0 = 占1位, 异步生成设置不同的ID)
  wid;
  // 数据中心ID (也可以不填写，0 = 占1位, nodeJs分布式使用填写不同ID, 前端用无所谓)
  cid;
  // 当前生成的序列 用于offset整个生成的ID
  seq = 0;
  // 上一时间戳
  lastTimestamp = -1;

  // 机器ID (worker 可配置启用)
  widBits = 4;
  // 数据中心ID (datacenter 可配置启用)
  cidBits = 4;
  // 毫秒内自增位数(意味着最大不重复数位数)
  seqBits = 8;
  // 机器ID偏左移(seqBits)位 (当前 = 8)
  widShift = this.seqBits;
  // 数据中心ID左移(seqBits + widBits)位 (当前 = 8 + 4)
  cidShift = this.seqBits + this.widBits;
  // 时间毫秒左移(this.seqBits + this.widBits + this.cidBits)位 (当前 = 8 + 4 + 4)
  timestampLShift = this.seqBits + this.widBits + this.cidBits;

  // wid掩码 (当前 = 最大不超过2 ^ 4 - 1 = 15)
  maxWidSize = -1 ^ (-1 << this.widBits);
  // cid掩码 (当前 = 最大不超过2 ^ 4 - 1 = 15)
  maxCidSize = -1 ^ (-1 << this.cidBits);
  // seq掩码 (当前 = 最大不超过2 ^ 8 - 1 = 255) 这个意味着连续生成的记录不能超过该条数。
  maxSeqSize = -1 ^ (-1 << this.seqBits);

  // 初始化的时候可以选择指定这两个ID
  constructor(wid = 0, cid = 0) {
    if (wid > this.maxWidSize || wid < 0) {
      throw new Error(
        `[EL-DEBUG]: worker Id can't be greater than ${this.maxWidSize} or less than 0.`
      );
    }
    if (cid > this.maxCidSize || cid < 0) {
      throw new Error(
        `[EL-DEBUG]: datacenter Id can't be greater than ${this.maxCidSize} or less than 0.`
      );
    }
    // 实例化的时候要确定长度用(总长度 = [seqBits, wid, cid].join('').length)。
    this.wid = wid;
    this.cid = cid;
    // this.seqBits = seqBits;
  }

  // 发号器 - 这个是有上下文的，因为很短时间执行时间种子来不及刷新会导致连号。
  nextId(bias) {
    // 获取时间种子
    let timestamp = IdProvider.genTimeSeed();
    // 自检测纠错步骤
    if (timestamp < this.lastTimestamp) {
      throw new Error(`[EL-DEBUG]: Clock moved backwards.
      Refusing to generate id for ${this.lastTimestamp - timestamp} milliseconds.`);
    }
    // 如果时间戳与上次时间戳相同
    if (this.lastTimestamp === timestamp) {
      // 当前毫秒内，则+1，与一下sequenceMask确保sequence不会超出上限
      // 如果你的机器性能很NB 可以去类上面把掩码改的大一点 不过事情都是相对的。
      this.seq = (this.seq + 1) & this.maxSeqSize;
      // 当前毫秒内计数满了，则等待下一秒
      if (this.seq === 0) {
        timestamp = IdProvider.tilNextMillis(this.lastTimestamp);
      }
    } else {
      // 重制序列状态
      this.seq = 0;
    }

    // 记录上次的时间戳
    this.lastTimestamp = timestamp;

    // ID偏移组合生成最终的ID，并返回
    // 即使一毫秒生成一个id在2 ** 16 = 65秒内生成的id不会重复，基本上前端很少有需要连续生成id，而且一毫秒一次跑65秒的场景。
    // 也很少出现跑的太快在1毫秒内把所有seq周期跑完的场景(255次机会)
    // 上两个参数都可以通过调节seq位数让程序支持更强大的硬件
    // 太长的id存储空间也会增加，所以时间与空间不可兼得，需要按需适当调整。
    const nextId =
      ((timestamp - this.epoch) << this.timestampLShift) |
      (this.cid << this.cidShift) |
      (this.wid << this.widShift) |
      this.seq;

    // 确认符号(bias)
    return bias ? bias * Math.abs(nextId) : nextId;
  }

  // 核心算法 - 当生成的id冲突，则等待下一次计算
  static tilNextMillis(lastTimestamp) {
    let timestamp = IdProvider.genTimeSeed();
    while (timestamp <= lastTimestamp) {
      timestamp = IdProvider.genTimeSeed();
    }
    return timestamp;
  }

  // 获取当前系统时间
  static genTimeSeed() {
    return Date.now();
  }

  // Builder - 默认的实例
  static getInstance() {
    return new IdProvider();
  }
}

/**
 * 生成一个不重复的ID(数字类型，以便于后端接收)
 * 该方法与stringUtils中的getUid不可混用
 * TODO 看到下面的两行注释了吗，可以放开来做一些测试。这玩意的声明周期就是当前用户访问网页开始 最大生成ID条数不能超过255条（否则会重复）
 */
const genFakeId = (sign = 1) => sign * ~~(Math.random() * 100000000);
// const idProvider = IdProvider.getInstance();
// const genFakeId = sign => idProvider.nextId(sign);

const { add, sub, mul, div } = basicHpOperations;

export {
  add,
  sub,
  mul,
  div, // 将内部计算解构成4种计算 - 注意 为了防止精度丢失，全部为string类型返回
  parseIfNumeric, // 同上
  checkIfNumber,
  getRandomInt,
  getRandomFlt,
  digitUppercase,
  fixedZero,
  genFakeId,
};
