import { clone } from 'ramda';

/**
 * 数组格式转树状结构
 * @param   {array}     array
 * @param   {String}    id
 * @param   {String}    pid
 * @param   {String}    children
 * @return  {Array}
 */
const arrayToTree = (array = [], id = 'id', pid = 'pid', children = 'children') => {
  const data = clone(array);
  const result = [];
  const hash = {};
  data.forEach((item, index) => {
    hash[data[index][id]] = data[index];
  });

  data.forEach(item => {
    const hashVP = hash[item[pid]];
    if (hashVP) {
      !hashVP[children] && (hashVP[children] = []);
      hashVP[children].push(item);
    } else {
      result.push(item);
    }
  });
  return result;
};

export const treeToPlain = (data, structure) => {
  let plain = [];
  let leafs = [];
  // const { children, selected } = structure;
  const { id, pid, children, selected, ...customKeys } = structure;
  data.map(d => {
    const dClone = clone(d);
    // eslint-disable-next-line
    !dClone[selected] && (dClone[selected] = false);
    Object.keys(customKeys).map(key => {
      // eslint-disable-next-line
      !dClone[key] && (dClone[key] = null);
      return key;
    });
    if (!dClone[children] || dClone[children].length === 0) {
      delete dClone[children];
      plain = [...plain, dClone];
      leafs = [...leafs, dClone];
    } else {
      const childrenTransfer = treeToPlain(dClone[children], structure);
      delete dClone[children];
      dClone.hasChildren = true;
      plain = [...plain, dClone, ...childrenTransfer.plain];
      leafs = [...leafs, ...childrenTransfer.leafs];
    }
    return d;
  });
  return { plain, leafs };
};

export const plainToTree = (plain, structure) => {
  const tree = [];
  const { id, pid, children, selected, ...customKeys } = structure;
  const data = clone(plain);
  const plainObject = {};
  data.map(d => {
    // eslint-disable-next-line
    !d[selected] && (d[selected] = false);
    Object.keys(customKeys).map(key => {
      // eslint-disable-next-line
      !d[key] && (d[key] = null);
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

export default { arrayToTree };
