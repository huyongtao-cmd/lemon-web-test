/* eslint-disable */
import { isEmpty, isNil } from 'ramda';

// 基本处理 --- 根据key处理配置化信息并返回可配置化字段
/**
 * @export
 * 配置信息
 * @param {*} [pageConfig={}]
 * 索引 -- 筛选配置数据的key值，有些人喜欢用blockPageName，有些人喜欢用blockKey，blockKey值做了唯一校验，提倡大量使用
 * @param {*} blockKey
 * 索引值
 * @param {*} blockKeyValue
 * @returns // 返回配置化信息
 */
export function pageBasicBlockConfig(pageConfig = {}, blockKey, blockKeyValue) {
  const { pageBlockViews = [] } = pageConfig;
  if (!pageBlockViews || pageBlockViews.length < 1) {
    return {};
  }
  const currentListConfig = pageBlockViews.filter(v => v[blockKey] === blockKeyValue);
  const { pageFieldViews = {} } = currentListConfig[0] || {};

  if (isEmpty(pageFieldViews)) {
    return {};
  }

  const pageFieldJson = {};
  if (pageFieldViews) {
    pageFieldViews.forEach(field => {
      pageFieldJson[field.fieldKey] = field || {};
    });
  }
  return pageFieldJson;
}

// form表单 --- 直接传入带中文的Filed，根据key进行通用型可配置化改造
/**
 *
 * @export
 * 配置信息
 * @param {*} [pageConfig={}]
 * 索引 -- 筛选配置数据的key值，有些人喜欢用blockPageName，有些人喜欢用blockKey，blockKey值做了唯一校验，提倡大量使用
 * @param {*} blockKey
 * 索引值
 * @param {*} blockKeyValue
 * 页面元素数组
 * @param {*} [fields=[]]
 * @returns
 */
export function pageFormBlockConfig(pageConfig = {}, blockKey, blockKeyValue, fields = []) {
  const { pageBlockViews = [] } = pageConfig;
  if (!pageBlockViews || pageBlockViews.length < 1) {
    return [];
  }
  const currentListConfig = pageBlockViews.filter(v => v[blockKey] === blockKeyValue);
  const { pageFieldViews = [] } = currentListConfig[0] || {};

  if (isEmpty(pageFieldViews)) {
    return [];
  }

  const pageFieldJson = {};
  pageFieldViews.forEach(field => {
    pageFieldJson[field.fieldKey] = field;
  });

  const configFields = fields
    .filter(
      field =>
        !field.key || (pageFieldJson[field.key] && pageFieldJson[field.key]?.visibleFlag === 1)
    )
    .map(
      field =>
        field.key
          ? {
              ...field,
              props: {
                ...field.props,
                name: pageFieldJson[field.key].fieldKey,
                label: pageFieldJson[field.key].displayName,
                sortNo: pageFieldJson[field.key].sortNo,
                decorator: {
                  ...field.props.decorator,
                  rules: [
                    {
                      required: !!pageFieldJson[field.key].requiredFlag,
                      message: `请输入${pageFieldJson[field.key].displayName}`,
                    },
                  ],
                },
                children: {
                  ...field.props.children,
                  props: {
                    ...field.props.children.props,
                    placeholder: `请输入${pageFieldJson[field.key].displayName}`,
                  },
                },
              },
            }
          : field
    )
    .sort((f1, f2) => f1.props.sortNo - f2.props.sortNo);
  return configFields;
}

// 表格表头 --- 直接传入表格列配置columns
/**
 *
 * @export
 * 配置信息
 * @param {*} [pageConfig={}]
 * 索引 -- 筛选配置数据的key值，有些人喜欢用blockPageName，有些人喜欢用blockKey，blockKey值做了唯一校验，提倡大量使用
 * @param {*} blockKey
 * * 索引值
 * @param {*} blockKeyValue
 * 页面元素数组
 * @param {*} [fields=[]]
 * @returns
 */
export function pageColumnsBlockConfig(pageConfig = {}, blockKey, blockKeyValue, fields = []) {
  const { pageBlockViews = [] } = pageConfig;
  if (!pageBlockViews || pageBlockViews.length < 1) {
    return [];
  }
  const currentListConfig = pageBlockViews.filter(v => v[blockKey] === blockKeyValue);

  const { pageFieldViews = [] } = currentListConfig[0] || {};
  if (isEmpty(pageFieldViews)) {
    return [];
  }

  const pageFieldJson = {};
  pageFieldViews.forEach(field => {
    pageFieldJson[field.fieldKey] = field;
  });

  const configCols = fields
    .filter(col => pageFieldJson[col.key]?.visibleFlag === 1)
    .map(col => ({
      ...col,
      title: pageFieldJson[col.key].displayName,
      sortNo: pageFieldJson[col.key].sortNo,
      required: !!pageFieldJson[col.key].requiredFlag,
      options: {
        rules: [
          {
            required: !!pageFieldJson[col.key].requiredFlag,
            message: `请输入${pageFieldJson[col.key].displayName}`,
          },
        ],
      },
    }))
    .sort((c1, c2) => c1.sortNo - c2.sortNo);
  return configCols;
}

// 详情页面
/**
 *
 * @export
 * 配置信息
 * @param {*} [pageConfig={}]
 * 索引 -- 筛选配置数据的key值，有些人喜欢用blockPageName，有些人喜欢用blockKey，blockKey值做了唯一校验，提倡大量使用
 * @param {*} blockKey
 * * 索引值
 * @param {*} blockKeyValue
 * 页面元素数组
 * @param {*} [fields=[]]
 * @returns
 */
export function pageViewBlockConfig(pageConfig = {}, blockKey, blockKeyValue, fields = []) {
  const { pageBlockViews = [] } = pageConfig;
  if (!pageBlockViews || pageBlockViews.length < 1) {
    return [];
  }
  const currentListConfig = pageBlockViews.filter(v => v[blockKey] === blockKeyValue);
  const { pageFieldViews = [] } = currentListConfig[0] || {};

  if (isEmpty(pageFieldViews)) {
    return [];
  }

  const pageFieldJson = {};
  pageFieldViews.forEach(field => {
    pageFieldJson[field.fieldKey] = field;
  });

  const configViews = fields
    .filter(view => pageFieldJson[view.key]?.visibleFlag === 1)
    .map(view => ({
      ...view,
      props: {
        ...view.props,
        term: baseJson[view.key].displayName,
      },
    }))
    .sort((c1, c2) => c1.sortNo - c2.sortNo);
  return configViews;
}

/**
 *
 *
 * @export
 * @param {*} pageTabViews
 * @param {*} formData
 * @param {*} resId
 * @param {*} baseBuId
 */
export function filterTabByField(pageTabViews, formData, resId, baseBuId) {
  const arr = JSON.parse(JSON.stringify(pageTabViews));
  arr.forEach((item, index) => {
    Array.isArray(item.permissionViews) &&
      item.permissionViews.forEach(view => {
        if (view.allowType === 'FIELD') {
          if (formData[view.allowValue] === resId) {
            !item.visible ? (arr[index].visible = true) : null;
          }
        }
        if (view.allowType === 'BUFIELD') {
          if (formData[view.allowValue] === baseBuId) {
            !item.visible ? (arr[index].visible = true) : null;
          }
        }
      });
  });
  return arr;
}

// =========================产品化升级改造========================
// FormItem
/**
 *
 * @export
 * 配置信息
 * @param {*} [pageConfig={}]
 * 索引 -- 筛选配置数据的key值，有些人喜欢用blockPageName，有些人喜欢用blockKey，blockKey值做了唯一校验，提倡大量使用
 * @param {*} blockKey
 * * 索引值
 * @param {*} blockKeyValue
 * 页面元素数组
 * @param {*} [fields=[]]
 * @returns
 */
export function ProductFormItemBlockConfig(pageConfig = {}, blockKey, blockKeyValue, fields = []) {
  const { pageBlockViews = [] } = pageConfig;
  if (!pageBlockViews || pageBlockViews.length < 1) {
    return [];
  }
  const currentListConfig = pageBlockViews.filter(v => v[blockKey] === blockKeyValue);

  const { pageFieldViews = [] } = currentListConfig[0] || {};
  if (isEmpty(pageFieldViews)) {
    return [];
  }

  const pageFieldJson = {};
  pageFieldViews.forEach(field => {
    pageFieldJson[field.fieldKey] = field;
  });

  const configCols = fields
    .filter(formItem => !formItem.key || pageFieldJson[formItem.key]?.visibleFlag === 1)
    .map(
      formItem =>
        formItem.key
          ? {
              ...formItem,
              props: {
                ...formItem.props,
                label: pageFieldJson[formItem.key].displayName,
                sortNo: pageFieldJson[formItem.key].sortNo,
                required: !isNil(formItem.props.extraRequired)
                  ? !!pageFieldJson[formItem.key].requiredFlag &&
                    pageFieldJson[formItem.key].fieldMode === 'EDITABLE' &&
                    formItem.props.extraRequired
                  : !!pageFieldJson[formItem.key].requiredFlag &&
                    pageFieldJson[formItem.key].fieldMode === 'EDITABLE',
                disabled:
                  pageFieldJson[formItem.key].fieldMode === 'UNEDITABLE' ||
                  formItem.props.extraDisabled,
                // 附件增加attach属性，作为标识符
                preview: formItem.props.attach
                  ? pageFieldJson[formItem.key].fieldMode === 'UNEDITABLE'
                  : null,
                initialValue: formItem.props.initialValue
                  ? formItem.props.initialValue
                  : pageFieldJson[formItem.key].fieldDefaultValue || undefined,
              },
            }
          : formItem
    )
    .sort((c1, c2) => c1.sortNo - c2.sortNo);
  return configCols;
}

// 表格表头 --- 直接传入表格列配置columns
/**
 *
 * @export
 * 配置信息
 * @param {*} [pageConfig={}]
 * 索引 -- 筛选配置数据的key值，有些人喜欢用blockPageName，有些人喜欢用blockKey，blockKey值做了唯一校验，提倡大量使用
 * @param {*} blockKey
 * * 索引值
 * @param {*} blockKeyValue
 * 页面元素数组
 * @param {*} [fields=[]]
 * @returns
 */
export function ProductTableColumnsBlockConfig(
  pageConfig = {},
  blockKey,
  blockKeyValue,
  fields = []
) {
  const { pageBlockViews = [] } = pageConfig;
  if (!pageBlockViews || pageBlockViews.length < 1) {
    return [];
  }
  const currentListConfig = pageBlockViews.filter(v => v[blockKey] === blockKeyValue);

  const { pageFieldViews = [] } = currentListConfig[0] || {};
  if (isEmpty(pageFieldViews)) {
    return [];
  }

  const pageFieldJson = {};
  pageFieldViews.forEach(field => {
    pageFieldJson[field.fieldKey] = field;
  });

  const configCols = fields
    .filter(col => !col.key || pageFieldJson[col.key]?.visibleFlag === 1)
    .map(
      col =>
        col.key
          ? {
              ...col,
              title: pageFieldJson[col.key].displayName,
              sortNo: pageFieldJson[col.key].sortNo,
            }
          : col
    )
    .sort((c1, c2) => c1.sortNo - c2.sortNo);
  return configCols;
}

// 列表查询条件 --- SearchFormItem
/**
 *
 * @export
 * 配置信息
 * @param {*} [pageConfig={}]
 * 索引 -- 筛选配置数据的key值，有些人喜欢用blockPageName，有些人喜欢用blockKey，blockKey值做了唯一校验，提倡大量使用
 * @param {*} blockKey
 * * 索引值
 * @param {*} blockKeyValue
 * 页面元素数组
 * @param {*} [fields=[]]
 * @returns
 */
export function ProductSearchFormItemBlockConfig(
  pageConfig = {},
  blockKey,
  blockKeyValue,
  fields = []
) {
  const { pageBlockViews = [] } = pageConfig;

  if (!pageBlockViews || pageBlockViews.length < 1) {
    return [];
  }
  const currentListConfig = pageBlockViews.filter(v => v[blockKey] === blockKeyValue);

  const { pageFieldViews = [] } = currentListConfig[0] || {};
  if (isEmpty(pageFieldViews)) {
    return [];
  }

  const pageFieldJson = {};
  pageFieldViews.forEach(field => {
    pageFieldJson[field.fieldKey] = field;
  });

  const configItems = fields
    .filter(item => pageFieldJson[item.key]?.visibleFlag === 1)
    .map(item => {
      return {
        ...item,
        props: {
          ...item.props,
          label: pageFieldJson[item.key].displayName,
          sortNo: pageFieldJson[item.key].sortNo,
        },
      };
    })
    .sort((c1, c2) => c1.sortNo - c2.sortNo);
  return configItems;
}
