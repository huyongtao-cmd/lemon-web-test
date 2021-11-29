import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import Link from 'umi/link';
import { Input, Radio, Switch } from 'antd';
import { mountToTab, markAsNoTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { Selection, DatePicker } from '@/pages/gen/field';
import { getUrl } from '@/utils/flowToRouter';
import { stringify } from 'qs';
import { formatMessage } from 'umi/locale';
import { selectBuMultiCol } from '@/services/org/bu/bu';
import {
  selectUsersWithBu,
  selectCoop, // 合作伙伴
} from '@/services/gen/list';
import {
  selectCust, // 客户
  selectSupplier, // 供应商
  selectBuProduct, // 产品
} from '@/services/user/Contract/sales';

const RadioGroup = Radio.Group;
const DOMAIN = 'videoMgmt';

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

@connect(({ loading, dispatch, videoMgmt }) => ({
  videoMgmt,
  dispatch,
  loading,
}))
@mountToTab()
class VideoMgmtList extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
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
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: { ...params } });
  };

  render() {
    const {
      loading,
      dispatch,
      videoMgmt: {
        list,
        total,
        searchForm,
        pageConfig: { pageBlockViews = [] },
        vCat1List,
        vCat2List,
        vCat5List,
      },
    } = this.props;
    const tableLoading = loading.effects[`${DOMAIN}/query`];

    const urls = getUrl();
    const fromUrl = stringify({ from: urls });

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
      vNo = {},
      vName = {},
      vCat1 = {},
      vCat2 = {},
      vCat5 = {},
      inchargeResId = {},
      buId = {},
      supplierId = {},
      prodId = {},
      coopId = {},
      custId = {},
      showFlag = {},
      uploadDate = {},
      viewCnt = {},
    } = pageFieldJson;

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'DESC',
      loading: tableLoading,
      total,
      dataSource: list,
      scroll: { x: 3130 },
      onChange: filters => this.fetchData(filters),
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      searchForm,
      searchBarForm: [
        {
          title: '视频名称/编号',
          dataIndex: 'vnoOrVName',
          options: {
            initialValue: searchForm.vnoOrVName,
          },
          tag: <Input placeholder="编号/名称" />,
        },
        {
          title: vCat1.displayName,
          dataIndex: 'vcat1',
          options: {
            initialValue: searchForm.vcat1,
          },
          tag: (
            <Selection
              key="vCat1"
              className="x-fill-100"
              source={vCat1List}
              transfer={{ key: 'catVal', code: 'catVal', name: 'catDesc' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
              placeholder={`请选择${vCat1.displayName}`}
            />
          ),
        },
        {
          title: vCat2.displayName,
          dataIndex: 'vcat2',
          options: {
            initialValue: searchForm.vcat2,
          },
          tag: (
            <Selection
              key="vCat2"
              className="x-fill-100"
              source={vCat2List}
              transfer={{ key: 'catVal', code: 'catVal', name: 'catDesc' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
              placeholder={`请选择${vCat2.displayName}`}
            />
          ),
        },
        {
          title: vCat5.displayName,
          dataIndex: 'vcat5',
          options: {
            initialValue: searchForm.vcat5,
          },
          tag: (
            <Selection
              key="vCat5"
              className="x-fill-100"
              source={vCat5List}
              transfer={{ key: 'catVal', code: 'catVal', name: 'catDesc' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
              placeholder={`请选择${vCat5.displayName}`}
            />
          ),
        },
        {
          title: buId.displayName,
          dataIndex: 'buId',
          options: {
            initialValue: searchForm.buId,
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
            initialValue: searchForm.supplierId,
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
            initialValue: searchForm.prodId,
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
        {
          title: coopId.displayName,
          dataIndex: 'coopId',
          options: {
            initialValue: searchForm.coopId,
          },
          tag: (
            <Selection
              key="coopId"
              className="x-fill-100"
              source={() => selectCoop()}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
              placeholder={`请选择${coopId.displayName}`}
            />
          ),
        },
        {
          title: custId.displayName,
          dataIndex: 'custId',
          options: {
            initialValue: searchForm.custId,
          },
          tag: (
            <Selection
              key="custId"
              className="x-fill-100"
              source={() => selectCust()}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
              placeholder={`请选择${custId.displayName}`}
            />
          ),
        },
        {
          title: inchargeResId.displayName,
          dataIndex: 'inchargeResId',
          options: {
            initialValue: searchForm.inchargeResId,
          },
          tag: (
            <Selection.Columns
              key="inchargeResId"
              className="x-fill-100"
              source={() => selectUsersWithBu()}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
              placeholder={`请选择${inchargeResId.displayName}`}
            />
          ),
        },
        {
          title: uploadDate.displayName,
          dataIndex: 'uploadDate',
          options: {
            initialValue: searchForm.uploadDate,
          },
          tag: <DatePicker.RangePicker format="YYYY-MM-DD" />,
        },
        {
          title: showFlag.displayName,
          dataIndex: 'showFlag',
          options: {
            initialValue: searchForm.showFlag || '',
          },
          tag: (
            <RadioGroup initialValue={searchForm.showFlag || ''}>
              <Radio value="SHOW">展示</Radio>
              <Radio value="HIDE">隐藏</Radio>
              <Radio value="">全部</Radio>
            </RadioGroup>
          ),
        },
      ],
      columns: [
        {
          title: vNo.displayName,
          dataIndex: 'vno',
          width: 100,
          align: 'center',
          render: (val, row) => {
            const href = `/plat/market/videoMgmt/view?id=${row.id}&${fromUrl}`;
            return (
              <Link className="tw-link" to={href}>
                {val}
              </Link>
            );
          },
        },
        {
          title: vName.displayName,
          dataIndex: 'vname',
          width: 200,
          align: 'center',
        },
        {
          title: showFlag.displayName,
          dataIndex: 'showFlag',
          width: 80,
          align: 'center',
          render: (val, row, index) => (
            <Switch
              checkedChildren="是"
              unCheckedChildren="否"
              checked={val === 'SHOW'}
              onChange={(bool, e) => {
                const parmas = bool ? 'SHOW' : 'HIDE';
                dispatch({
                  type: `${DOMAIN}/changeStatus`,
                  payload: { id: row.id, showFlag: parmas },
                }).then(res => {
                  list[index].showFlag = parmas;
                  list[index].showFlagName = parmas === 'SHOW' ? 'HIDE' : 'HIDE';
                  dispatch({
                    type: `${DOMAIN}/updateState`,
                    payload: list,
                  });
                });
              }}
            />
          ),
        },
        {
          title: vCat1.displayName,
          dataIndex: 'vcat1Name',
          width: 200,
          align: 'center',
        },
        {
          title: vCat2.displayName,
          dataIndex: 'vcat2Name',
          width: 200,
          align: 'center',
        },
        {
          title: vCat5.displayName,
          dataIndex: 'vcat5Name',
          width: 200,
          align: 'center',
        },
        {
          title: buId.displayName,
          dataIndex: 'buId',
          width: 200,
          align: 'center',
          render: (val, row) => row.buName,
        },
        {
          title: supplierId.displayName,
          dataIndex: 'supplierId',
          width: 200,
          align: 'center',
          render: (val, row) => row.supplierName,
        },
        {
          title: prodId.displayName,
          dataIndex: 'prodId',
          width: 200,
          align: 'center',
          render: (val, row) => row.prodName,
        },
        {
          title: coopId.displayName,
          dataIndex: 'coopId',
          width: 200,
          align: 'center',
          render: (val, row) => row.coopName,
        },
        {
          title: custId.displayName,
          dataIndex: 'custId',
          width: 200,
          align: 'center',
          render: (val, row) => row.custName,
        },
        {
          title: inchargeResId.displayName,
          dataIndex: 'inchargeResId',
          width: 200,
          align: 'center',
          render: (val, row) => row.inchargeResName,
        },
        {
          title: viewCnt.displayName,
          dataIndex: 'viewCnt',
          width: 100,
          align: 'center',
        },
        {
          title: uploadDate.displayName,
          dataIndex: 'uploadDate',
          width: 150,
          align: 'center',
          render: (val, row) => row.uploadDate,
        },
      ]
        .filter(Boolean)
        .sort((field1, field2) => field1.sortNo - field2.sortNo),
      leftButtons: [
        {
          key: 'create',
          icon: 'plus-circle',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.insert`, desc: '新增' }),
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push(`/plat/market/videoMgmt/edit?${fromUrl}`);
          },
        },
        {
          key: 'edit',
          icon: 'form',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.update`, desc: '修改' }),
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const { id } = selectedRows[0];
            router.push(`/plat/market/videoMgmt/edit?id=${id}&${fromUrl}`);
          },
        },
        {
          key: 'remove',
          className: 'tw-btn-error',
          title: formatMessage({ id: `misc.delete`, desc: '删除' }),
          loading: false,
          hidden: false,
          disabled: selectedRows => !selectedRows.length,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({
              type: `${DOMAIN}/videoDelete`,
              payload: { ids: selectedRowKeys.join(',') },
            });
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper title="视频管理列表">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default VideoMgmtList;
