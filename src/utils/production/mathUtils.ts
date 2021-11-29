import math from 'mathjs';
import { compose, curry, fromPairs, keys } from 'ramda';



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
const getRandomInt = ({ min, max }:any) => getRandomFlt({ min, max, precision: 0 });




/**
 * 生成一个不重复的ID(数字类型，以便于后端接收)
 * 该方法与stringUtils中的getUid不可混用
 * TODO 看到下面的两行注释了吗，可以放开来做一些测试。这玩意的声明周期就是当前用户访问网页开始 最大生成ID条数不能超过255条（否则会重复）
 */
const genFakeId = (sign = 1) => sign * ~~(Math.random() * 100000000);
// const idProvider = IdProvider.getInstance();
// const genFakeId = sign => idProvider.nextId(sign);

/**
 * 数字金额大写转换(可以处理整数,小数,负数)
 * @param amt 金额
 */
const smallToBig = (amt:number) =>
{
  const fraction = ['角', '分'];
  const digit = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
  const unit = [ ['元', '万', '亿'], ['', '拾', '佰', '仟']  ];
  const head = amt < 0? '欠': '';
  amt = Math.abs(amt);

  let s = '';

  for (let i = 0; i < fraction.length; i++)
  {
    s += (digit[Math.floor(amt * 10 * Math.pow(10, i)) % 10] + fraction[i]).replace(/零./, '');
  }
  s = s || '整';
  amt = Math.floor(amt);

  for (let i = 0; i < unit[0].length && amt > 0; i++)
  {
    let p = '';
    for (let j = 0; j < unit[1].length && amt > 0; j++)
    {
      p = digit[amt % 10] + unit[1][j] + p;
      amt = Math.floor(amt / 10);
    }
    s = p.replace(/(零.)*零$/, '').replace(/^$/, '零')  + unit[0][i] + s;
  }
  return head + s.replace(/(零.)*零元/, '元').replace(/(零.)+/g, '零').replace(/^整$/, '零元整');
};

/**
 * 数字转千分位
 * @param number 数字
 */
function numberFormat(number:string|number){
  let res = typeof number === "number" ? number.toString() : number;
  res=res.replace(/\d+/, function(n){ // 先提取整数部分
    return n.replace(/(\d)(?=(\d{3})+$)/g,function($1){
      return $1+",";
    });
  });
  return res;
}

export {
  getRandomInt,
  getRandomFlt,
  genFakeId,
  smallToBig,
  numberFormat,
};
