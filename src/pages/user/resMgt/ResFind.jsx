import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { mountToTab } from '@/layouts/routerControl';

import Link from 'umi/link';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { Selection, BuVersion } from '@/pages/gen/field';
import SelectWithCols from '@/components/common/SelectWithCols';
import { Input, Radio, InputNumber } from 'antd';
import SyntheticField from '@/components/common/SyntheticField';
import { getBuVersionAndBuParams } from '@/utils/buVersionUtils';

const DOMAIN = 'resFind';
const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

@connect(({ loading, resFind, dispatch }) => ({
  loading: loading.effects[`${DOMAIN}/query`] || loading.effects[`${DOMAIN}/getPageConfig`],
  resFind,
  dispatch,
}))
@mountToTab()
class ResFind extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    // this.fetchData();
    // 页面可配置化
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'RES_ARCHIVES_FIND' },
    });
    dispatch({ type: `${DOMAIN}/capaset` });
    dispatch({ type: `${DOMAIN}/capa` });
    dispatch({ type: `${DOMAIN}/baseBU` });
  }

  fetchData = async params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: {
        ...params,
        ...getBuVersionAndBuParams(params.baseBuId, 'baseBuId', 'baseBuVersionId'),
      },
    });
  };

  render() {
    const {
      dispatch,
      loading,
      resFind: {
        dataSource,
        total,
        searchForm,
        baseBuData,
        baseBuDataSource,
        capasetData,
        capaData,
        pageConfig,
      },
    } = this.props;
    // console.warn(dataSource)
    // 页面配置信息数据处理
    if (!pageConfig.pageBlockViews || pageConfig.pageBlockViews.length < 1) {
      return <div />;
    }
    let showExport = null;
    let currentListConfig = {}; // 表格区域
    let currentQueryConfig = {}; // 查询区域

    pageConfig.pageBlockViews.forEach(view => {
      if (view.blockKey === 'RES_ARCHIVES_FIND') {
        // 资源查找
        // showExport = view.allowExportFlag;
        currentListConfig = view;
      } else if (view.blockKey === 'RES_ARCHIVES_FIND_QUERY') {
        currentQueryConfig = view;
      }
    });
    pageConfig.pageButtonViews.forEach(view => {
      if (view.buttonKey === 'LIST_EXPORT') {
        showExport = view.visible;
      }
    });
    const { pageFieldViews: pageFieldViewsList } = currentListConfig;
    const { pageFieldViews: pageFieldViewsQuery } = currentQueryConfig;
    const pageFieldJsonList = {};
    const pageFieldJsonQuery = {};
    if (pageFieldViewsList) {
      pageFieldViewsList.forEach(field => {
        pageFieldJsonList[field.fieldKey] = field;
      });
    }
    if (pageFieldViewsQuery) {
      pageFieldViewsQuery.forEach(field => {
        pageFieldJsonQuery[field.fieldKey] = field;
      });
    }
    const tableProps = {
      columnsCache: DOMAIN,
      dispatch,
      loading,
      expirys: 0,
      total,
      rowKey: 'id',
      sortBy: 'id',
      sortDirection: 'DESC',
      scroll: {
        x: '150%',
      },
      showExport,
      enableSelection: false,
      // filterMultiple: false,
      dataSource,
      onChange: filters => {
        this.fetchData(filters);
      },
      onSearchBarChange: (changedValues, allValues) => {
        /* --- 单项复合能力重置默认取值 --- */
        const resetParm = {};
        if (!changedValues.capaset && !changedValues.capa) {
          // 单项 复合 同时滞空
          resetParm.capaset = ['0', null];
          resetParm.capa = ['0', null];
        } else if (changedValues.capaset && !allValues.capa) {
          // 单项undefined 复合有值
          resetParm.capa = ['0', null];
        } else if (changedValues.capa && !allValues.capaset) {
          // 单项有值 复合undefined
          resetParm.capaset = ['0', null];
        }
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: {
            ...allValues,
            ...resetParm,
          },
        });
      },
      searchBarForm: [
        pageFieldJsonQuery.capasetId.visibleFlag && {
          title: `${pageFieldJsonQuery.capasetId.displayName}`,
          dataIndex: 'capaset',
          sortNo: `${pageFieldJsonQuery.capasetId.sortNo}`,
          options: {
            initialValue: searchForm.capaset,
          },
          formItemLayout,
          tag: (
            <SyntheticField className="tw-field-group">
              <Radio.Group
                className="tw-field-group-filter"
                buttonStyle="solid"
                defaultValue="0"
                style={{ width: '40%' }}
              >
                <Radio.Button
                  style={{ width: '33.333%', textAlign: 'center', padding: 0 }}
                  value="0"
                >
                  =
                </Radio.Button>
                <Radio.Button
                  style={{ width: '33.333%', textAlign: 'center', padding: 0 }}
                  value="1"
                >
                  ≥
                </Radio.Button>
                <Radio.Button
                  style={{ width: '33.333%', textAlign: 'center', padding: 0 }}
                  value="2"
                >
                  ≤
                </Radio.Button>
              </Radio.Group>
              <Selection
                source={capasetData}
                placeholder={`请选择${pageFieldJsonQuery.capasetId.displayName}`}
              />
            </SyntheticField>
          ),
        },
        pageFieldJsonQuery.capaId.visibleFlag && {
          title: `${pageFieldJsonQuery.capaId.displayName}`,
          dataIndex: 'capa',
          sortNo: `${pageFieldJsonQuery.capaId.sortNo}`,
          options: {
            initialValue: searchForm.capa,
          },
          formItemLayout,
          tag: (
            <SyntheticField className="tw-field-group">
              <Radio.Group
                className="tw-field-group-filter"
                buttonStyle="solid"
                defaultValue="0"
                style={{ width: '40%' }}
              >
                <Radio.Button
                  style={{ width: '33.333%', textAlign: 'center', padding: 0 }}
                  value="0"
                >
                  =
                </Radio.Button>
                <Radio.Button
                  style={{ width: '33.333%', textAlign: 'center', padding: 0 }}
                  value="1"
                >
                  ≥
                </Radio.Button>
                <Radio.Button
                  style={{ width: '33.333%', textAlign: 'center', padding: 0 }}
                  value="2"
                >
                  ≤
                </Radio.Button>
              </Radio.Group>
              <Selection
                source={capaData}
                placeholder={`请选择${pageFieldJsonQuery.capaId.displayName}`}
              />
            </SyntheticField>
          ),
        },
        pageFieldJsonQuery.eqvaRatio.visibleFlag && {
          title: `${pageFieldJsonQuery.eqvaRatio.displayName}`,
          dataIndex: 'eqvaRatio',
          sortNo: `${pageFieldJsonQuery.eqvaRatio.sortNo}`,
          options: {
            initialValue: searchForm.eqvaRatio,
          },
          formItemLayout,
          tag: (
            <SyntheticField className="tw-field-group">
              <InputNumber style={{ width: '45%' }} min={0} placeholder="最小值" />
              <Input
                style={{
                  width: '10%',
                  borderLeft: 0,
                  pointerEvents: 'none',
                  backgroundColor: '#fff',
                  padding: 0,
                  textAlign: 'center',
                }}
                placeholder="~"
                disabled
              />
              <InputNumber style={{ width: '45%', borderLeft: 0 }} min={0} placeholder="最大值" />
            </SyntheticField>
          ),
        },
        pageFieldJsonQuery.baseBuId.visibleFlag && {
          title: `${pageFieldJsonQuery.baseBuId.displayName}`,
          dataIndex: 'baseBuId',
          sortNo: `${pageFieldJsonQuery.baseBuId.sortNo}`,
          options: {
            initialValue: searchForm.baseBuId,
          },
          formItemLayout,
          tag: <BuVersion />,
        },
        pageFieldJsonQuery.baseCity.visibleFlag && {
          title: `${pageFieldJsonQuery.baseCity.displayName}`,
          dataIndex: 'baseCity',
          sortNo: `${pageFieldJsonQuery.baseCity.sortNo}`,
          options: {
            initialValue: searchForm.baseCity,
          },
          formItemLayout,
          tag: (
            <Selection.UDC
              code="COM.CITY"
              placeholder={`请选择${pageFieldJsonQuery.baseCity.displayName}`}
            />
          ),
        },
        pageFieldJsonQuery.resStatus.visibleFlag && {
          title: `${pageFieldJsonQuery.resStatus.displayName}`,
          dataIndex: 'resStatus',
          sortNo: `${pageFieldJsonQuery.resStatus.sortNo}`,
          options: {
            initialValue: searchForm.resStatus,
          },
          formItemLayout,
          tag: (
            <Selection.UDC
              code="RES.RES_STATUS"
              mode="multiple"
              placeholder={`请选择${pageFieldJsonQuery.resStatus.displayName}`}
            />
          ),
        },
        pageFieldJsonQuery.projName.visibleFlag && {
          title: `${pageFieldJsonQuery.projName.displayName}`,
          dataIndex: 'projName',
          sortNo: `${pageFieldJsonQuery.projName.sortNo}`,
          options: {
            initialValue: searchForm.projName,
          },
          formItemLayout,
          tag: <Input placeholder={`请输入${pageFieldJsonQuery.projName.displayName}`} />,
        },
        pageFieldJsonQuery.product.visibleFlag && {
          title: `${pageFieldJsonQuery.product.displayName}`,
          dataIndex: 'projProduct',
          sortNo: `${pageFieldJsonQuery.product.sortNo}`,
          options: {
            initialValue: searchForm.projProduct,
          },
          formItemLayout,
          tag: <Input placeholder={`请输入${pageFieldJsonQuery.product.displayName}`} />,
        },
        pageFieldJsonQuery.projRole.visibleFlag && {
          title: `${pageFieldJsonQuery.projRole.displayName}`,
          dataIndex: 'projOther',
          sortNo: `${pageFieldJsonQuery.projRole.sortNo}`,
          options: {
            initialValue: searchForm.projOther,
          },
          formItemLayout,
          tag: <Input placeholder={`请输入${pageFieldJsonQuery.projRole.displayName}`} />,
        },
        pageFieldJsonQuery.industry.visibleFlag && {
          title: `${pageFieldJsonQuery.industry.displayName}`,
          dataIndex: 'industry',
          sortNo: `${pageFieldJsonQuery.industry.sortNo}`,
          options: {
            initialValue: searchForm.industry,
          },
          formItemLayout,
          tag: <Input placeholder={`请输入${pageFieldJsonQuery.industry.displayName}`} />,
        },
        pageFieldJsonQuery.companyName.visibleFlag && {
          title: `${pageFieldJsonQuery.companyName.displayName}`,
          dataIndex: 'companyName',
          sortNo: `${pageFieldJsonQuery.companyName.sortNo}`,
          options: {
            initialValue: searchForm.companyName,
          },
          formItemLayout,
          tag: <Input placeholder={`请输入${pageFieldJsonQuery.companyName.displayName}`} />,
        },
        pageFieldJsonQuery.jobtitle.visibleFlag && {
          title: `${pageFieldJsonQuery.jobtitle.displayName}`,
          dataIndex: 'jobTitle',
          sortNo: `${pageFieldJsonQuery.jobtitle.sortNo}`,
          options: {
            initialValue: searchForm.jobTitle,
          },
          formItemLayout,
          tag: <Input placeholder={`请输入${pageFieldJsonQuery.jobtitle.displayName}`} />,
        },
        pageFieldJsonQuery.personId.visibleFlag && {
          title: `${pageFieldJsonQuery.personId.displayName}`,
          dataIndex: 'resName',
          sortNo: `${pageFieldJsonQuery.personId.sortNo}`,
          options: {
            initialValue: searchForm.resName,
          },
          formItemLayout,
          tag: <Input placeholder={`请输入${pageFieldJsonQuery.personId.displayName}`} />,
        },
        pageFieldJsonQuery.mobile.visibleFlag && {
          title: `${pageFieldJsonQuery.mobile.displayName}`,
          dataIndex: 'mobile',
          sortNo: `${pageFieldJsonQuery.mobile.sortNo}`,
          options: {
            initialValue: searchForm.mobile,
          },
          formItemLayout,
          tag: <Input placeholder={`请输入${pageFieldJsonQuery.mobile.displayName}`} />,
        },
        pageFieldJsonQuery.email.visibleFlag && {
          title: `${pageFieldJsonQuery.email.displayName}`,
          dataIndex: 'email',
          sortNo: `${pageFieldJsonQuery.email.sortNo}`,
          options: {
            initialValue: searchForm.email,
          },
          formItemLayout,
          tag: <Input placeholder={`请输入${pageFieldJsonQuery.email.displayName}`} />,
        },
        pageFieldJsonQuery.resType1.visibleFlag && {
          title: `${pageFieldJsonQuery.resType1.displayName}`,
          dataIndex: 'resType1',
          sortNo: `${pageFieldJsonQuery.resType1.sortNo}`,
          options: {
            initialValue: searchForm.resType1,
          },
          formItemLayout,
          tag: (
            <Selection.UDC
              code="RES.RES_TYPE1"
              placeholder={`请选择${pageFieldJsonQuery.resType1.displayName}`}
            />
          ),
        },
        pageFieldJsonQuery.resType2.visibleFlag && {
          title: `${pageFieldJsonQuery.resType2.displayName}`,
          dataIndex: 'resType2',
          sortNo: `${pageFieldJsonQuery.resType2.sortNo}`,
          options: {
            initialValue: searchForm.resType2,
          },
          formItemLayout,
          tag: (
            <Selection.UDC
              code="RES.RES_TYPE2"
              placeholder={`请选择${pageFieldJsonQuery.resType2.displayName}`}
            />
          ),
        },
      ]
        .filter(Boolean)
        .sort((field1, field2) => field1.sortNo - field2.sortNo),
      columns: [
        pageFieldJsonList.resNo.visibleFlag && {
          title: `${pageFieldJsonList.resNo.displayName}`,
          dataIndex: 'resNo',
          sortNo: `${pageFieldJsonList.resNo.sortNo}`,
          width: 90,
          align: 'center',
          render: (value, rowData) => {
            const { id } = rowData;
            // const href = `/hr/res/resFindDetail?id=${id}`;
            const href = `/hr/res/resPortrayal?id=${id}`;
            return (
              <Link className="tw-link" to={href}>
                {value}
              </Link>
            );
          },
        },
        pageFieldJsonList.personId.visibleFlag && {
          title: `${pageFieldJsonList.personId.displayName}`,
          dataIndex: 'resName',
          sortNo: `${pageFieldJsonList.personId.sortNo}`,
          align: 'center',
          render: (value, rowData) => {
            const { id } = rowData;
            // const href = `/hr/res/resFindDetail?id=${id}`;
            const href = `/hr/res/resPortrayal?id=${id}`;
            return (
              <Link className="tw-link" to={href}>
                {value}
              </Link>
            );
          },
        },
        pageFieldJsonList.englishName.visibleFlag && {
          title: `${pageFieldJsonList.englishName.displayName}`,
          dataIndex: 'englishName',
          sortNo: `${pageFieldJsonList.englishName.sortNo}`,
          align: 'center',
        },
        pageFieldJsonList.resType1.visibleFlag && {
          title: `${pageFieldJsonList.resType1.displayName}`,
          dataIndex: 'resType1Name',
          sortNo: `${pageFieldJsonList.resType1.sortNo}`,
          align: 'center',
        },
        pageFieldJsonList.resType2.visibleFlag && {
          title: `${pageFieldJsonList.resType2.displayName}`,
          dataIndex: 'resType2Name',
          sortNo: `${pageFieldJsonList.resType2.sortNo}`,
          align: 'center',
        },
        pageFieldJsonList.resStatus.visibleFlag && {
          title: `${pageFieldJsonList.resStatus.displayName}`,
          dataIndex: 'resStatusName',
          sortNo: `${pageFieldJsonList.resStatus.sortNo}`,
          align: 'center',
        },
        pageFieldJsonList.baseBuId.visibleFlag && {
          title: 'BaseBU',
          dataIndex: 'baseBuName',
          sortNo: `${pageFieldJsonList.baseBuId.sortNo}`,
          align: 'center',
        },
        pageFieldJsonList.baseCity.visibleFlag && {
          title: `${pageFieldJsonList.baseCity.displayName}`,
          dataIndex: 'baseCityName',
          sortNo: `${pageFieldJsonList.baseCity.sortNo}`,
          align: 'center',
        },
        pageFieldJsonList.eqvaRatio.visibleFlag && {
          title: `${pageFieldJsonList.eqvaRatio.displayName}`,
          dataIndex: 'eqvaRatio',
          sortNo: `${pageFieldJsonList.eqvaRatio.sortNo}`,
          align: 'center',
        },
        pageFieldJsonList.capasetId.visibleFlag && {
          title: `${pageFieldJsonList.capasetId.displayName}`,
          dataIndex: 'capaName',
          sortNo: `${pageFieldJsonList.capasetId.sortNo}`,
          align: 'center',
          width: '20%',
        },
        pageFieldJsonList.mobile.visibleFlag && {
          title: `${pageFieldJsonList.mobile.displayName}`,
          dataIndex: 'mobile',
          sortNo: `${pageFieldJsonList.mobile.sortNo}`,
          align: 'center',
        },
        pageFieldJsonList.emailAddr.visibleFlag && {
          title: `${pageFieldJsonList.emailAddr.displayName}`,
          dataIndex: 'emailAddr',
          sortNo: `${pageFieldJsonList.emailAddr.sortNo}`,
          align: 'center',
        },
        pageFieldJsonList.email.visibleFlag && {
          title: `${pageFieldJsonList.email.displayName}`,
          dataIndex: 'personalEmail',
          sortNo: `${pageFieldJsonList.email.sortNo}`,
          align: 'center',
        },
      ]
        .filter(Boolean)
        .sort((field1, field2) => field1.sortNo - field2.sortNo),
    };

    return (
      <PageHeaderWrapper title="创建销售列表">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default ResFind;
