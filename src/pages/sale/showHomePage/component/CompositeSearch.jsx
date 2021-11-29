/* eslint-disable no-nested-ternary */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Input, Form } from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '../DataTable';
import { Selection } from '@/pages/gen/field';
import { fromQs } from '@/utils/stringUtils';
import { selectBuMultiCol } from '@/services/org/bu/bu';
import {
  selectSupplier, // 供应商
  selectBuProduct, // 产品
} from '@/services/user/Contract/sales';

const DOMAIN = 'showHomePage';

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

@connect(({ loading, dispatch, showHomePage }) => ({
  showHomePage,
  dispatch,
  loading,
}))
@Form.create({})
@mountToTab()
class ShowHomePageComp extends PureComponent {
  componentDidMount() {
    const {
      dispatch,
      showHomePage: { searchCompForm },
    } = this.props;
    dispatch({ type: `${DOMAIN}/cleanSearchForm` });
    // 获取页面配置信息
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'VIDEO' },
    });
    // 视频大类、视频小类、服务属性
    dispatch({
      type: `${DOMAIN}/selectVideoDrop`,
    });

    // 视频类别
    dispatch({
      type: `${DOMAIN}/videoCatData`,
      payload: { catNo: 'VIDEO_CAT' },
    });

    const { _refresh } = fromQs();
    // 默认查询
    _refresh === '0' &&
      this.fetchData({
        sortBy: 'id',
        sortDirection: 'DESC',
        offset: 0,
        limit: 10,
        ...searchCompForm,
      });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: { ...params } });
  };

  render() {
    const {
      loading,
      dispatch,
      showHomePage: {
        list,
        total,
        searchCompForm,
        pageConfig: { pageBlockViews = [] },
        videoCatDataList,
        videoCatDataListCopy,
      },
      form,
      form: { setFieldsValue },
    } = this.props;
    const tableLoading = loading.effects[`${DOMAIN}/query`];

    if (!pageBlockViews || pageBlockViews.length < 1) {
      return <div />;
    }
    const currentListConfig = pageBlockViews.filter(v => v.blockPageName === '视频信息表单');
    const { pageFieldViews = {} } = currentListConfig[0];
    const pageFieldJson = {};
    if (pageFieldViews) {
      pageFieldViews.forEach(field => {
        pageFieldJson[field.fieldKey] = field;
      });
    }
    const {
      vCat1 = {},
      vCat2 = {},
      vCat3 = {},
      vCat4 = {},
      buId = {},
      supplierId = {},
      prodId = {},
    } = pageFieldJson;

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'DESC',
      loading: tableLoading,
      total,
      dataSource: list,
      scroll: { x: 3200 },
      onChange: filters => this.fetchData(filters),
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateCompSearchForm`,
          payload: allValues,
        });
      },
      searchCompForm,
      searchBarForm: [
        {
          title: '编号/名称/关键词',
          dataIndex: 'vnoOrVName',
          options: {
            initialValue: searchCompForm.vnoOrVName,
          },
          tag: <Input placeholder="编号/名称/关键词" />,
        },
        {
          title: vCat1.displayName,
          dataIndex: 'vcat1',
          options: {
            initialValue: searchCompForm.vcat1,
          },
          tag: (
            <Selection
              key={
                videoCatDataList.filter(v => v.tabField === 'V_CAT1')[0] &&
                videoCatDataList.filter(v => v.tabField === 'V_CAT1')[0].list
              }
              className="x-fill-100"
              source={
                videoCatDataList.filter(v => v.tabField === 'V_CAT1')[0] &&
                videoCatDataList.filter(v => v.tabField === 'V_CAT1')[0].list
              }
              transfer={{ key: 'catVal', code: 'catVal', name: 'catDesc' }}
              dropdownMatchSelectWidth={false}
              showSearch
              placeholder={`请选择${vCat1.displayName}`}
              onValueChange={e => {
                if (e && e.subCatDId) {
                  const tt = videoCatDataListCopy.map(item => {
                    if (e.subCatDId.includes(item.id)) {
                      const field =
                        item.tabField === 'V_CAT1'
                          ? 'vcat1'
                          : item.tabField === 'V_CAT2'
                            ? 'vcat2'
                            : item.tabField === 'V_CAT3'
                              ? 'vcat3'
                              : 'vcat4';
                      setTimeout(() => {
                        // 有关联的下拉框清空
                        dispatch({
                          type: `${DOMAIN}/updateCompSearchForm`,
                          payload: {
                            [field]: undefined,
                          },
                        });
                        setFieldsValue({
                          [field]: undefined,
                        });
                      }, 100);

                      // 筛选关联数据
                      return {
                        ...item,
                        list: item.list.filter(obj => Number(obj.supCatDValId) === e.id),
                      };
                    }
                    return item;
                  });
                  dispatch({
                    type: `${DOMAIN}/updateState`,
                    payload: {
                      videoCatDataList: tt,
                    },
                  });
                }
              }}
            />
          ),
        },
        {
          title: vCat2.displayName,
          dataIndex: 'vcat2',
          options: {
            initialValue: searchCompForm.vcat2,
          },
          tag: (
            <Selection
              key={
                videoCatDataList.filter(v => v.tabField === 'V_CAT2')[0] &&
                videoCatDataList.filter(v => v.tabField === 'V_CAT2')[0].list
              }
              className="x-fill-100"
              source={
                videoCatDataList.filter(v => v.tabField === 'V_CAT2')[0] &&
                videoCatDataList.filter(v => v.tabField === 'V_CAT2')[0].list
              }
              transfer={{ key: 'catVal', code: 'catVal', name: 'catDesc' }}
              dropdownMatchSelectWidth={false}
              showSearch
              placeholder={`请选择${vCat2.displayName}`}
              onValueChange={e => {
                if (e && e.subCatDId) {
                  const tt = videoCatDataListCopy.map(item => {
                    if (e.subCatDId.includes(item.id)) {
                      const field =
                        item.tabField === 'V_CAT1'
                          ? 'vcat1'
                          : item.tabField === 'V_CAT2'
                            ? 'vcat2'
                            : item.tabField === 'V_CAT3'
                              ? 'vcat3'
                              : 'vcat4';
                      setTimeout(() => {
                        // 有关联的下拉框清空
                        dispatch({
                          type: `${DOMAIN}/updateCompSearchForm`,
                          payload: {
                            [field]: undefined,
                          },
                        });
                        setFieldsValue({
                          [field]: undefined,
                        });
                      }, 100);

                      // 筛选关联数据
                      return {
                        ...item,
                        list: item.list.filter(obj => Number(obj.supCatDValId) === e.id),
                      };
                    }
                    return item;
                  });
                  dispatch({
                    type: `${DOMAIN}/updateState`,
                    payload: {
                      videoCatDataList: tt,
                    },
                  });
                }
              }}
            />
          ),
        },
        {
          title: vCat3.displayName,
          dataIndex: 'vcat3',
          options: {
            initialValue: searchCompForm.vcat3,
          },
          tag: (
            <Selection
              key={
                videoCatDataList.filter(v => v.tabField === 'V_CAT3')[0] &&
                videoCatDataList.filter(v => v.tabField === 'V_CAT3')[0].list
              }
              className="x-fill-100"
              source={
                videoCatDataList.filter(v => v.tabField === 'V_CAT3')[0] &&
                videoCatDataList.filter(v => v.tabField === 'V_CAT3')[0].list
              }
              transfer={{ key: 'catVal', code: 'catVal', name: 'catDesc' }}
              dropdownMatchSelectWidth={false}
              showSearch
              placeholder={`请选择${vCat3.displayName}`}
              onValueChange={e => {
                if (e && e.subCatDId) {
                  const tt = videoCatDataListCopy.map(item => {
                    if (e.subCatDId.includes(item.id)) {
                      const field =
                        item.tabField === 'V_CAT1'
                          ? 'vcat1'
                          : item.tabField === 'V_CAT2'
                            ? 'vcat2'
                            : item.tabField === 'V_CAT3'
                              ? 'vcat3'
                              : 'vcat4';
                      setTimeout(() => {
                        // 有关联的下拉框清空
                        dispatch({
                          type: `${DOMAIN}/updateCompSearchForm`,
                          payload: {
                            [field]: undefined,
                          },
                        });
                        setFieldsValue({
                          [field]: undefined,
                        });
                      }, 100);

                      // 筛选关联数据
                      return {
                        ...item,
                        list: item.list.filter(obj => Number(obj.supCatDValId) === e.id),
                      };
                    }
                    return item;
                  });
                  dispatch({
                    type: `${DOMAIN}/updateState`,
                    payload: {
                      videoCatDataList: tt,
                    },
                  });
                }
              }}
            />
          ),
        },
        {
          title: vCat4.displayName,
          dataIndex: 'vcat4',
          options: {
            initialValue: searchCompForm.vcat4,
          },
          tag: (
            <Selection
              key={
                videoCatDataList.filter(v => v.tabField === 'V_CAT4')[0] &&
                videoCatDataList.filter(v => v.tabField === 'V_CAT4')[0].list
              }
              className="x-fill-100"
              source={
                videoCatDataList.filter(v => v.tabField === 'V_CAT4')[0] &&
                videoCatDataList.filter(v => v.tabField === 'V_CAT4')[0].list
              }
              transfer={{ key: 'catVal', code: 'catVal', name: 'catDesc' }}
              dropdownMatchSelectWidth={false}
              showSearch
              placeholder={`请选择${vCat4.displayName}`}
              onValueChange={e => {
                if (e && e.subCatDId) {
                  const tt = videoCatDataListCopy.map(item => {
                    if (e.subCatDId.includes(item.id)) {
                      const field =
                        item.tabField === 'V_CAT1'
                          ? 'vcat1'
                          : item.tabField === 'V_CAT2'
                            ? 'vcat2'
                            : item.tabField === 'V_CAT3'
                              ? 'vcat3'
                              : 'vcat4';
                      setTimeout(() => {
                        // 有关联的下拉框清空
                        dispatch({
                          type: `${DOMAIN}/updateCompSearchForm`,
                          payload: {
                            [field]: undefined,
                          },
                        });
                        setFieldsValue({
                          [field]: undefined,
                        });
                      }, 100);

                      // 筛选关联数据
                      return {
                        ...item,
                        list: item.list.filter(obj => Number(obj.supCatDValId) === e.id),
                      };
                    }
                    return item;
                  });
                  dispatch({
                    type: `${DOMAIN}/updateState`,
                    payload: {
                      videoCatDataList: tt,
                    },
                  });
                }
              }}
            />
          ),
        },
        {
          title: buId.displayName,
          dataIndex: 'buId',
          options: {
            initialValue: searchCompForm.buId,
          },
          tag: (
            <Selection.Columns
              key="buId"
              className="x-fill-100"
              source={() => selectBuMultiCol()}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
              placeholder={`请选择${buId.displayName}`}
            />
          ),
        },
        {
          title: supplierId.displayName,
          dataIndex: 'supplierId',
          options: {
            initialValue: searchCompForm.supplierId,
          },
          tag: (
            <Selection
              key="supplierId"
              className="x-fill-100"
              source={() => selectSupplier()}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
              placeholder={`请选择${supplierId.displayName}`}
            />
          ),
        },
        {
          title: prodId.displayName,
          dataIndex: 'prodId',
          options: {
            initialValue: searchCompForm.prodId,
          },
          tag: (
            <Selection
              key="prodId"
              className="x-fill-100"
              source={() => selectBuProduct()}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
              placeholder={`请选择${prodId.displayName}`}
            />
          ),
        },
      ],
    };

    return (
      <PageHeaderWrapper title="视频查找综合查询">
        <DataTable form={form} {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default ShowHomePageComp;
