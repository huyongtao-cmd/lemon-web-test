import { curry, sortWith, ascend, compose, prop, clone } from 'ramda';
/**
 * 批量执行多个函数返回多个结果集
 * @param funcArray
 */
export function multiExec(...funcArray) {
  return funcArray.map(func => func());
}

/**
 * 检查一个变量是否是数字（不一定是数字类型）
 * 如果是的话，返回解析结果，不是则返回原变量
 * @param candidate - 带判断变量
 * @returns {number | any}
 */
export const parseIfNumeric = candidate =>
  typeof candidate === 'number' || +candidate + '' === candidate ? +candidate : candidate;

/**
 * 数字类型的升序排列
 * @param {string} sortProp 用来做排序的prop
 */
export const sortPropAscByNumber = sortProp =>
  curry(
    sortWith([
      ascend(
        compose(
          parseIfNumeric,
          prop(sortProp)
        )
      ),
    ])
  );

const defaultStructure = {
  id: 'id',
  pid: 'pid',
  children: 'children',
  selected: false,
};

export const treeToPlain = (data, structure = defaultStructure) => {
  let plain = [];
  let leafs = [];
  const { id, pid, children, ...customKeys } = structure;
  data.map(d => {
    const dClone = clone(d);
    // eslint-disable-next-line
    Object.keys(customKeys).map(key => {
      // eslint-disable-next-line
      !dClone[key] && (dClone[key] = customKeys[key] || undefined);
      return key;
    });
    if (!dClone[children] || dClone[children].length === 0) {
      delete dClone[children];
      plain = [...plain, dClone];
      leafs = [...leafs, dClone];
    } else {
      const childrenTransfer = treeToPlain(dClone[children], structure);
      delete dClone[children];
      plain = [...plain, dClone, ...childrenTransfer.plain];
      leafs = [...leafs, ...childrenTransfer.leafs];
    }
    return d;
  });
  return { plain, leafs };
};

export const plainToTree = (plain, structure = defaultStructure) => {
  const tree = [];
  const { id, pid, children, ...customKeys } = structure;
  const data = clone(plain);
  const plainObject = {};
  data.map(d => {
    // eslint-disable-next-line
    Object.keys(customKeys).map(key => {
      // eslint-disable-next-line
      !d[key] && (d[key] = customKeys[key] || undefined);
      return key;
    });
    plainObject[d[id]] = d;
    return d;
  });
  data.map(d => {
    const pData = plainObject[d[pid]];
    if (pData) {
      !pData[children] && (pData[children] = []);
      pData[children].push(d);
    } else {
      tree.push(d);
    }
    return d;
  });
  const { leafs } = treeToPlain(tree, structure);
  return { tree, leafs };
};

export const getChainKeys = (key, structure, data) => {
  const { id, pid } = structure;
  let chain = [key];
  const keyData = data.find(d => d[id] === key);
  if (keyData[pid]) {
    chain = [...chain, ...getChainKeys(keyData[pid], structure, data)];
  }
  return chain;
};

export const getParentKeys = (array, structure, data) => {
  const repeatArray = array
    .map(k => getChainKeys(k, structure, data))
    .reduce((prev, current) => [...prev, ...current], []);
  const uniKeyArray = Array.from(new Set(repeatArray));
  return uniKeyArray;
};

/**
 *
 * @param {string[]} array leaf object wait to change its parent
 * @param {object} structure 数据类型转换模型
 * @param {object[]} data 数据源，为 plain object
 * @param {boolean} behavior 改变父级的行为为 true | false
 */
export const keepParentBehavior = (array, structure, data, behavior) => {
  const { id, selected } = structure;
  const uniKeyArray = getParentKeys(array, structure, data);
  return data.map(d => {
    if (uniKeyArray.indexOf(d[id]) > -1) {
      return {
        ...d,
        [selected]: behavior,
      };
    }
    return d;
  });
};
