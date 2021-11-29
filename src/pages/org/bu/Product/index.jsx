import React, { PureComponent } from 'react';
import { Tag } from 'antd';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';

import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { selectBus } from '@/services/org/bu/bu';
import { mountToTab } from '@/layouts/routerControl';
import { createAlert } from '@/components/core/Confirm';
import { Selection, BuVersion } from '@/pages/gen/field';
import { getBuVersionAndBuParams } from '@/utils/buVersionUtils';

const DOMAIN = 'orgBuProduct';

@connect(({ loading, orgBuProduct }) => ({
  loading: loading.effects[`${DOMAIN}/fetch`],
  orgBuProduct,
  // loading: loading.effects['namespace/submodule'], // 菊花旋转等待数据源(领域空间/子模块)
}))
@mountToTab()
class BaseinfoProduct extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    this.fetchData({ sortBy: 'prodNo', sortDirection: 'DESC' });
    // 获取页面配置信息
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'BU_PRODUCT_MANAGEMENT_LIST' },
    });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/fetch`,
      payload: {
        ...params,
        ...getBuVersionAndBuParams(params.buId, 'buId', 'buVersionId'),
      },
    });
  };

  doPutaway = (keys, rows, queryParams) => {
    let unAllow = '';

    rows.forEach(item => {
      if (item.prodStatus !== '2') {
        if (unAllow.length > 0) {
          unAllow = `${unAllow}, `;
        }
        unAllow = `${unAllow} ${item.prodName}`;
      }
    });
    if (unAllow.length > 0) {
      createAlert.warning({
        content: unAllow + '不是下架状态，不能上架。',
      });
    } else {
      const { dispatch } = this.props;
      dispatch({
        type: `${DOMAIN}/putaway`,
        payload: { ids: keys },
      }).then(({ reason, status }) => {
        if (status === 100) {
          // 主动取消请求
          return;
        }
        if (reason === 'OK') {
          createAlert.success({
            content: unAllow + '上架成功。',
          });
          this.fetchData(queryParams);
        } else {
          createAlert.error({
            content: unAllow + '上架失败。',
          });
        }
      });
    }
  };

  doSoldOut = (keys, rows, queryParams) => {
    let allow = '';

    rows.forEach(item => {
      if (item.prodStatus !== '1') {
        if (allow.length > 0) {
          allow = `${allow}, `;
        }
        allow = `${allow} ${item.prodName}`;
      }
    });

    if (allow.length > 0) {
      createAlert.warning({
        content: allow + '不是上架状态，不能下架。',
      });
    } else {
      const { dispatch } = this.props;
      dispatch({
        type: `${DOMAIN}/soldOut`,
        payload: { ids: keys },
      }).then(({ reason, status }) => {
        if (status === 100) {
          // 主动取消请求
          return;
        }
        if (reason === 'OK') {
          createAlert.success({
            content: allow + '下架成功。',
          });
          this.fetchData(queryParams);
        } else {
          createAlert.error({
            content: allow + '下架失败。',
          });
        }
      });
    }
  };

  doInspect = (keys, rows, queryParams) => {
    const item = rows[0];
    if (item.inspectFlag === 1) {
      createAlert.warning({
        content: item.prodName + '已经在考察中。',
      });
    } else {
      const { dispatch } = this.props;
      dispatch({
        type: `${DOMAIN}/doInspect`,
        payload: { id: item.id },
      }).then(({ reason, status }) => {
        if (status === 100) {
          // 主动取消请求
          return;
        }
        if (reason === 'OK') {
          createAlert.success({
            content: item.prodName + '已经进入考察。',
          });
          this.fetchData(queryParams);
        } else {
          createAlert.error({
            content: item.prodName + '进入考察失败。',
          });
        }
      });
    }
  };

  finishInspect = (keys, rows, queryParams) => {
    const item = rows[0];
    if (item.inspectFlag === 0) {
      createAlert.warning({
        content: item.prodName + '未在考察中。',
      });
    } else {
      const { dispatch } = this.props;
      dispatch({
        type: `${DOMAIN}/finishInspect`,
        payload: { id: item.id },
      }).then(({ reason, status }) => {
        if (status === 100) {
          // 主动取消请求
          return;
        }
        if (reason === 'OK') {
          createAlert.success({
            content: item.prodName + '已经结束考察。',
          });
          this.fetchData(queryParams);
        } else {
          createAlert.error({
            content: item.prodName + '结束考察失败。',
          });
        }
      });
    }
  };

  render() {
    const {
      loading,
      orgBuProduct: { searchForm, list, total, pageConfig },
      dispatch,
    } = this.props;
    if (!pageConfig.pageBlockViews || pageConfig.pageBlockViews.length < 1) {
      return <div />;
    }
    const currentBlockConfig = pageConfig.pageBlockViews[0];
    const { pageFieldViews } = currentBlockConfig;
    const pageFieldJson = {};
    pageFieldViews.forEach(field => {
      pageFieldJson[field.fieldKey] = field;
    });
    const tableProps = {
      rowKey: 'id',
      scroll: {
        x: '40%',
        y: 900,
      },
      columnsCache: DOMAIN,
      dispatch,
      loading,
      expirys: 0,
      onChange: filters => {
        this.fetchData(filters);
      },
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      enableDoubleClick: false,
      total,
      dataSource: list,
      searchBarForm: [
        {
          title: '产品名称',
          dataIndex: 'prodName',
          options: {
            initialValue: searchForm.prodName,
          },
        },
        pageFieldJson.buId.visibleFlag && {
          title: `${pageFieldJson.buId.displayName}`,
          sortNo: `${pageFieldJson.buId.sortNo}`,
          dataIndex: 'buId',
          options: {
            initialValue: searchForm.buId,
          },
          tag: <BuVersion />,
        },
        {
          title: '关键字',
          dataIndex: 'keyword',
          options: {
            initialValue: searchForm.keyword,
          },
        },
      ].filter(Boolean),
      columns: [
        {
          title: '产品编号', // TODO: 国际化！！！
          dataIndex: 'prodNo',
          sorter: true,
          defaultSortOrder: 'descend',
          width: '10%',
          align: 'center',
          render: (value, row, key) => (
            <Link
              className="tw-link"
              to={`/plat/market/productdetail?canEdit=0&id=${row.id}&from=orgbu`}
            >
              {value}
            </Link>
          ),
        },
        {
          title: '产品名称', // TODO: 国际化！！！
          dataIndex: 'prodName',
          sorter: true,
          width: '10%',
        },
        {
          title: '产品分类', // TODO: 国际化！！！
          dataIndex: 'className',
          width: '10%',
        },
        {
          title: '产品属性', // TODO: 国际化！！！
          dataIndex: 'prodPropName',
          width: '10%',
        },
        pageFieldJson.buId.visibleFlag && {
          title: `${pageFieldJson.buId.displayName}`, // TODO: 国际化！！！
          dataIndex: 'buName',
          width: '10%',
          sortNo: `${pageFieldJson.buId.sortNo}`,
        },
        {
          title: '负责人', // TODO: 国际化！！！
          dataIndex: 'picResName',
          width: '10%',
        },
        {
          title: '状态', // TODO: 国际化！！！
          dataIndex: 'prodStatusName',
          width: '10%',
          align: 'center',
        },
        {
          title: '审批状态', // TODO: 国际化！！！
          dataIndex: 'apprStatus',
          sorter: true,
          width: '10%',
          align: 'center',
          render: (value, row, key) => row.apprStatusName,
        },
        {
          title: '标签', // TODO: 国际化！！！
          dataIndex: 'tagDesc',
          width: '10%',
        },
        {
          title: '考察中', // TODO: 国际化！！！
          dataIndex: 'inspectFlag',
          width: '10%',
          render: status =>
            status === 0 ? <Tag color="green">否</Tag> : <Tag color="red">是</Tag>,
        },
      ].filter(Boolean),
      leftButtons: [
        {
          key: 'add',
          className: 'tw-btn-primary',
          title: '新增', // TODO: 国际化！！！
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          icon: 'plus-circle',
          cb: (selectedRowKeys, selectedRows, queryParams) =>
            router.push(`/plat/market/productdetail?canEdit=1&from=orgbu`),
        },
        {
          key: 'edit',
          className: 'tw-btn-primary',
          title: '编辑',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 1,
          icon: 'form',
          cb: (selectedRowKeys, selectedRows, queryParams) =>
            router.push(`/plat/market/productdetail?canEdit=1&id=${selectedRowKeys}&from=orgbu`),
        },
        // {
        //   key: 'submitApproval',
        //   title: '提交审批',
        //   loading: false,
        //   hidden: false,
        //   disabled: false,
        //   className: 'tw-btn-info',
        //   icon: 'cloud-upload',
        //   minSelections: 2,
        //   cb: (selectedRowKeys, selectedRows, queryParams) => {
        //     createAlert.info({
        //       content: '该功能尚未开发。',
        //     });
        //   },
        // },
        // {
        //   key: 'putaway',
        //   title: '上架',
        //   loading: false,
        //   hidden: false,
        //   disabled: false,
        //   minSelections: 2,
        //   className: 'tw-btn-info',
        //   icon: 'to-top',
        //   cb: (selectedRowKeys, selectedRows, queryParams) => {
        //     this.doPutaway(selectedRowKeys, selectedRows, queryParams);
        //   },
        // },
        // {
        //   key: 'soldOut',
        //   title: '下架',
        //   loading: false,
        //   hidden: false,
        //   disabled: false,
        //   minSelections: 2,
        //   className: 'tw-btn-info',
        //   icon: 'vertical-align-bottom',
        //   cb: (selectedRowKeys, selectedRows, queryParams) => {
        //     this.doSoldOut(selectedRowKeys, selectedRows, queryParams);
        //   },
        // },
        // {
        //   key: 'examine',
        //   title: '进入考察',
        //   loading: false,
        //   hidden: false,
        //   disabled: false,
        //   minSelections: 1,
        //   className: 'tw-btn-info',
        //   icon: 'login',
        //   cb: (selectedRowKeys, selectedRows, queryParams) => {
        //     this.doInspect(selectedRowKeys, selectedRows, queryParams);
        //   },
        // },
        // {
        //   key: 'finishExamine',
        //   title: '结束考察',
        //   loading: false,
        //   hidden: false,
        //   disabled: false,
        //   minSelections: 1,
        //   className: 'tw-btn-info',
        //   icon: 'logout',
        //   cb: (selectedRowKeys, selectedRows, queryParams) => {
        //     this.finishInspect(selectedRowKeys, selectedRows, queryParams);
        //   },
        // },
        {
          key: 'remove',
          className: 'tw-btn-error',
          title: '删除',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 2,
          icon: 'delete',
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({
              type: `${DOMAIN}/delete`,
              payload: { ids: selectedRowKeys, queryParams },
            });
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper title="产品管理">
        <DataTable {...tableProps} scroll={{ x: 1600 }} />
      </PageHeaderWrapper>
    );
  }
}

export default BaseinfoProduct;
