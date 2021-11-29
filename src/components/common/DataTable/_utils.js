import React from 'react';
import { values, pickAll, isNil, type, isEmpty, map } from 'ramda';

export const exportToCsv = (filename, rows) => {
  const processRow = row => {
    let finalVal = '';
    // eslint-disable-next-line
    for (let j = 0; j < row.length; j++) {
      let innerValue = isNil(row[j]) ? '' : row[j].toString();
      if (row[j] instanceof Date) {
        innerValue = row[j].toLocaleString();
      }

      let result = innerValue.replace(/"/g, '""');
      if (result.search(/("|,|\n)/g) >= 0) result = '"' + result + '"';
      if (j > 0) finalVal += ',';
      finalVal += result;
    }
    return finalVal + '\n';
  };

  let csvFile = '\ufeff';
  // eslint-disable-next-line
  for (let i = 0; i < rows.length; i++) {
    csvFile += processRow(rows[i]);
  }

  const blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
  if (navigator.msSaveBlob) {
    // IE 10+
    navigator.msSaveBlob(blob, filename);
  } else {
    const link = document.createElement('a');
    if (link.download !== undefined) {
      // feature detection
      // Browsers that support HTML5 download attribute
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
};

export const compileCsvData = (dataSource, columns) => {
  const csvDataTitle = columns.map(column => column.title);
  const csvValueOrFunction = map(({ dataIndex, render }) => {
    if (isNil(render)) return dataIndex;
    return [dataIndex, render];
  }, columns);
  const csvContentData = dataSource.map((data, index) => {
    const pickValues = csvValueOrFunction.map(operation => {
      if (Array.isArray(operation)) {
        const [dataIndex, render] = operation;
        const result = render(data[dataIndex], data, index);
        return React.isValidElement(result) ? data[dataIndex] : result;
      }
      return data[operation];
    });
    return pickValues;
  });
  const csvData = [csvDataTitle, ...csvContentData];
  return csvData;
};

export const getColumnsVisibly = (columnsCache, columns) => {
  let storingCache = JSON.parse(localStorage.getItem(`tbl_col_${columnsCache}`)) || {};
  if (Array.isArray(storingCache)) {
    storingCache = storingCache
      .map(({ dataIndex, visible }) => ({ [dataIndex]: !!visible }))
      .reduce((prev, curr) => ({ ...prev, ...curr }), {});
  }
  return columns.map(col => {
    const { dataIndex } = col;
    return {
      ...col,
      visible: storingCache[dataIndex],
    };
  });
};

export const setColumnsVisibly = (columnsCache, columns) => {
  const storingCache = columns
    .map(({ dataIndex, visible }) => ({ [dataIndex]: !!visible }))
    .reduce((prev, curr) => ({ ...prev, ...curr }), {});
  localStorage.setItem(`tbl_col_${columnsCache}`, JSON.stringify(storingCache));
};

/**
 * make a random key for table key, trigger forceUpdate
 */
export const makeRandomKey = () => `${Math.random()}-${Math.random()}-${Math.random()}`;

/**
 *  通过 rowKey 来决定如何取出 对应的 rows
 * @param {String|Function} rowKey - 以什么作为行的 唯一 key
 * @param {Array} selectedRowKeys - 选中的行的 唯一 key
 * @param {Array} dataSource - 数据源
 */
export const findRowsByKeys = (rowKey, selectedRowKeys = [], dataSource = []) => {
  if (isEmpty(selectedRowKeys)) return [];
  // 防止没有设置 rowKey， 此时 selectedRowKeys 取的是行号
  if (isNil(rowKey)) return selectedRowKeys.map(index => dataSource[index]);
  if (type(rowKey) === 'Function')
    return dataSource.filter(row => selectedRowKeys.includes(rowKey(row)));
  if (type(rowKey) === 'String')
    return dataSource.filter(row => selectedRowKeys.includes(row[rowKey]));
  // 防止误传参数， 不过应该不会出这种失误
  if (type(rowKey) === 'Number')
    return dataSource.filter(row => selectedRowKeys.includes(row[`${rowKey}`]));
  // 兜底
  return [];
};
