import AsyncSelect from '@/components/common/AsyncSelect';
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Tooltip, DatePicker } from 'antd';
import Link from 'umi/link';
import router from 'umi/router';
import { formatMessage } from 'umi/locale';
import { mountToTab } from '@/layouts/routerControl';
import { createConfirm } from '@/components/core/Confirm';
import DataTable from '@/components/common/DataTable';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import createMessage from '@/components/core/AlertMessage';
import { queryUdc } from '@/services/gen/app';
import { selectBus } from '@/services/org/bu/bu';
import { Selection, UdcSelect } from '@/pages/gen/field';
import { getUrl } from '@/utils/flowToRouter';
import { stringify } from 'qs';

const DOMAIN = 'platResBlackProfile';
// 资源状态
const resStatus = {
  RES_STATUS_1: '1', // 创建中
  RES_STATUS_2: '2', // 认证中
  RES_STATUS_3: '3', // 已认证
  RES_STATUS_4: '4', // 离职中
  RES_STATUS_5: '5', // 调岗中
  RES_STATUS_6: '6', // 已离职
};

@connect(({ loading, platResBlackProfile }) => ({
  platResBlackProfile,
  loading: loading.effects[`${DOMAIN}/query`] || loading.effects[`${DOMAIN}/getPageConfig`],
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    const key = Object.keys(changedFields)[0];
    const value = Object.values(changedFields)[0];
    if (value) {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { key, value: value.value },
      });
    }
  },
})
@mountToTab()
class ResProfile extends PureComponent {
  tableRef = React.createRef();

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/cleanSearchForm` });
    this.fetchData({ sortBy: 'resNo', sortDirection: 'DESC' });
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'RES_ARCHIVES_MANAGEMENT_LIST' },
    });
  }

  // componentWillUnmount() {
  //   const { dispatch } = this.props;
  //   dispatch({
  //     type: `${DOMAIN}/updateState`,
  //     payload: {
  //       pageConfig: {},
  //     },
  //   });
  // }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: params,
    });
  };

  // 删除按钮，创建中（即‘1’）状态的才能删除
  deleteByStatus = (selectedRowKeys, selectedRows, queryParams) => {
    const { dispatch } = this.props;
    let flag = true; // 默认符合删除条件

    selectedRows.map(row => {
      if (row.resStatus !== resStatus.RES_STATUS_1) {
        flag = false;
      }
      return flag;
    });

    if (flag) {
      createConfirm({
        content: '确认删除所选记录？',
        onOk: () =>
          dispatch({
            type: `${DOMAIN}/delete`,
            payload: { id: selectedRowKeys, queryParams },
          }),
      });
    } else {
      createMessage({ type: 'error', description: '只有人才库状态的记录才能删除' });
    }
  };

  // 删除按钮，创建中（即‘1’）状态的才能删除
  addWhiteList = (selectedRowKeys, selectedRows, queryParams) => {
    const { dispatch } = this.props;
    createConfirm({
      content: '确认要移出黑名单？',
      onOk: () =>
        dispatch({
          type: `${DOMAIN}/addResWhiteList`,
          payload: { id: selectedRowKeys, queryParams },
        }),
    });
  };

  render() {
    const {
      dispatch,
      loading,
      platResBlackProfile: { dataSource, total, searchForm, type2Data, pageConfig },
    } = this.props;
    const { pageBlockViews } = pageConfig;
    if (!pageBlockViews || pageBlockViews.length < 1) {
      return <div />;
    }
    const currentQueryConfig = [];
    const currentListConfig = [];
    pageBlockViews.forEach(view => {
      if (view.blockPageName === '条件查询区域') {
        currentQueryConfig.push(view);
      } else if (view.blockPageName === '主区域') {
        currentListConfig.push(view);
      }
    });

    const pageFieldJsonQuery = {};
    const pageFieldJsonList = {};
    currentQueryConfig.forEach(view => {
      view.pageFieldViews.forEach(field => {
        pageFieldJsonQuery[field.fieldKey] = field;
      });
    });

    currentListConfig.forEach(view => {
      view.pageFieldViews.forEach(field => {
        pageFieldJsonList[field.fieldKey] = field;
      });
    });

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      loading: false,
      total,
      dataSource,
      searchForm,
      ref: this.tableRef,
      onChange: filters => {
        this.fetchData(filters);
      },
      onSearchBarChange: (changedValues, allValues) => {
        const obj = { ...allValues };
        if (Object.keys(changedValues)[0] === 'resType1') {
          this.tableRef.current.searchBarRef.current.props.form.setFieldsValue({
            resType2: undefined,
          });
          obj.resType2 = undefined;
          // 分类一 -> 分类二
          if (changedValues.resType1) {
            dispatch({
              type: `${DOMAIN}/updateListType2`,
              payload: changedValues.resType1,
            });
          } else {
            dispatch({
              type: `${DOMAIN}/updateState`,
              payload: {
                type2Data: [],
              },
            });
          }
        }
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: obj,
        });
      },
      searchBarForm: [
        pageFieldJsonQuery.resNo.visibleFlag && {
          title: `${pageFieldJsonQuery.resNo.displayName}/${
            pageFieldJsonList.personId.displayName
          }`, // TODO: 国际化
          dataIndex: 'searchKey',
          sortNo: `${pageFieldJsonQuery.resNo.sortNo}`,
          options: {
            initialValue: searchForm.searchKey,
          },
        },
        pageFieldJsonQuery.empNo.visibleFlag && {
          title: `${pageFieldJsonQuery.empNo.displayName}`, // TODO: 国际化
          dataIndex: 'empNo',
          sortNo: `${pageFieldJsonQuery.empNo.sortNo}`,
          options: {
            initialValue: searchForm.empNo,
          },
        },
        pageFieldJsonQuery.resType1.visibleFlag && {
          title: `${pageFieldJsonQuery.resType1.displayName}`, // TODO: 国际化
          dataIndex: 'resType1',
          sortNo: `${pageFieldJsonQuery.resType1.sortNo}`,
          options: {
            initialValue: searchForm.resType1,
          },
          tag: (
            <Selection.UDC
              code="RES.RES_TYPE1"
              placeholder={`请选择${pageFieldJsonQuery.resType1.displayName}`}
            />
          ),
        },
        pageFieldJsonQuery.resType2.visibleFlag && {
          title: `${pageFieldJsonQuery.resType2.displayName}`, // TODO: 国际化
          dataIndex: 'resType2',
          sortNo: `${pageFieldJsonQuery.resType2.sortNo}`,
          options: {
            initialValue: searchForm.resType2,
          },
          tag: (
            <AsyncSelect
              source={type2Data}
              placeholder={`请选择${pageFieldJsonQuery.resType2.displayName}`}
            />
          ),
        },
        pageFieldJsonQuery.resStatus.visibleFlag && {
          title: `${pageFieldJsonQuery.resStatus.displayName}`, // TODO: 国际化
          dataIndex: 'resStatus',
          sortNo: `${pageFieldJsonQuery.resStatus.sortNo}`,
          options: {
            initialValue: searchForm.resStatus,
          },
          tag: (
            <Selection.UDC
              code="RES.RES_STATUS"
              placeholder={`请选择${pageFieldJsonQuery.resStatus.displayName}`}
            />
          ),
        },
        pageFieldJsonQuery.baseBuId.visibleFlag && {
          title: `${pageFieldJsonQuery.baseBuId.displayName}`, // TODO: 国际化
          dataIndex: 'baseBuId',
          sortNo: `${pageFieldJsonQuery.baseBuId.sortNo}`,
          options: {
            initialValue: searchForm.baseBuId,
          },
          tag: (
            <Selection
              source={() => selectBus()}
              placeholder={`${pageFieldJsonQuery.resStatus.displayName}下拉`}
            />
          ),
        },
        pageFieldJsonQuery.baseCity.visibleFlag && {
          title: `${pageFieldJsonQuery.baseCity.displayName}`, // TODO: 国际化
          dataIndex: 'baseCity',
          sortNo: `${pageFieldJsonQuery.baseCity.sortNo}`,
          options: {
            initialValue: searchForm.baseCity,
          },
          tag: (
            <Selection.UDC
              code="COM.CITY"
              placeholder={`请选择${pageFieldJsonQuery.baseCity.displayName}`}
            />
          ),
        },
        pageFieldJsonQuery.enrollDate.visibleFlag && {
          title: `${pageFieldJsonQuery.enrollDate.displayName}`, // TODO: 国际化
          dataIndex: 'enrollDate',
          sortNo: `${pageFieldJsonQuery.enrollDate.sortNo}`,
          options: {
            initialValue: searchForm.enrollDate,
          },
          tag: (
            <DatePicker.RangePicker placeholder={['开始日期', '结束日期']} className="x-fill-100" />
          ),
        },
        pageFieldJsonQuery.contractExpireDate.visibleFlag && {
          title: `${pageFieldJsonQuery.contractExpireDate.displayName}`, // TODO: 国际化
          dataIndex: 'contractExpireDate',
          sortNo: `${pageFieldJsonQuery.contractExpireDate.sortNo}`,
          options: {
            initialValue: searchForm.contractExpireDate,
          },
          tag: (
            <DatePicker.RangePicker placeholder={['开始日期', '结束日期']} className="x-fill-100" />
          ),
        },
        pageFieldJsonQuery.companyName.visibleFlag && {
          title: `${pageFieldJsonQuery.companyName.displayName}`, // TODO: 国际化
          dataIndex: 'corpName',
          sortNo: `${pageFieldJsonQuery.companyName.sortNo}`,
          options: {
            initialValue: searchForm.corpName,
          },
        },
        pageFieldJsonQuery.jobtitle.visibleFlag && {
          title: `${pageFieldJsonQuery.jobtitle.displayName}`, // TODO: 国际化
          dataIndex: 'jobtitle',
          sortNo: `${pageFieldJsonQuery.jobtitle.sortNo}`,
          options: {
            initialValue: searchForm.jobtitle,
          },
        },
        pageFieldJsonQuery.qualification.visibleFlag && {
          title: `${pageFieldJsonQuery.qualification.displayName}`, // TODO: 国际化
          dataIndex: 'qualification',
          sortNo: `${pageFieldJsonQuery.qualification.sortNo}`,
          options: {
            initialValue: searchForm.qualification,
          },
          tag: <UdcSelect code="COM.EDUCATION" />,
        },
        pageFieldJsonQuery.edusysType.visibleFlag && {
          title: `${pageFieldJsonQuery.edusysType.displayName}`, // TODO: 国际化
          dataIndex: 'edusysType',
          sortNo: `${pageFieldJsonQuery.edusysType.sortNo}`,
          options: {
            initialValue: searchForm.edusysType,
          },
          tag: <UdcSelect code="COM.EDU_SYS" />,
        },
        pageFieldJsonQuery.label1.visibleFlag && {
          title: `${pageFieldJsonQuery.label1.displayName}`, // TODO: 国际化
          dataIndex: 'label1',
          sortNo: `${pageFieldJsonQuery.label1.sortNo}`,
          options: {
            initialValue: searchForm.label1,
          },
          tag: <Selection source={() => selectBus()} />,
        },
      ]
        .filter(Boolean)
        .sort((field1, field2) => field1.sortNo - field2.sortNo),
      columns: [
        pageFieldJsonList.resNo.visibleFlag && {
          title: `${pageFieldJsonList.resNo.displayName}`, // TODO: 国际化
          dataIndex: 'resNo',
          sorter: true,
          align: 'center',
          defaultSortOrder: 'descend',
          sortNo: `${pageFieldJsonList.resNo.sortNo}`,
          render: (value, row, key) => (
            <Link className="tw-link" to={`/hr/res/profile/list/resQuery?id=${row.id}`}>
              {value}
            </Link>
          ),
        },
        pageFieldJsonList.personId.visibleFlag && {
          title: `${pageFieldJsonList.personId.displayName}`, // TODO: 国际化
          dataIndex: 'resName',
          sorter: true,
          sortNo: `${pageFieldJsonList.personId.sortNo}`,
          render: (value, row, key) => (
            <Link className="tw-link" to={`/hr/res/profile/list/resQuery?id=${row.id}`}>
              {value}
            </Link>
          ),
        },
        pageFieldJsonList.empNo.visibleFlag && {
          title: `${pageFieldJsonList.empNo.displayName}`, // TODO: 国际化
          dataIndex: 'empNo',
          align: 'center',
          sorter: true,
          sortNo: `${pageFieldJsonList.empNo.sortNo}`,
        },
        pageFieldJsonList.resType1.visibleFlag && {
          title: `${pageFieldJsonList.resType1.displayName}`, // TODO: 国际化
          dataIndex: 'resType1Name',
          align: 'center',
          sortNo: `${pageFieldJsonList.resType1.sortNo}`,
        },
        pageFieldJsonList.resType2.visibleFlag && {
          title: `${pageFieldJsonList.resType2.displayName}`, // TODO: 国际化
          dataIndex: 'resType2Name',
          align: 'center',
          sortNo: `${pageFieldJsonList.resType2.sortNo}`,
        },
        pageFieldJsonList.resStatus.visibleFlag && {
          title: `${pageFieldJsonList.resStatus.displayName}`, // TODO: 国际化
          dataIndex: 'resStatusName',
          align: 'center',
          sortNo: `${pageFieldJsonList.resStatus.sortNo}`,
        },
        pageFieldJsonList.apprStatus.visibleFlag && {
          title: `${pageFieldJsonList.apprStatus.displayName}`, // TODO: 国际化
          dataIndex: 'apprStatusName',
          align: 'center',
          sortNo: `${pageFieldJsonList.apprStatus.sortNo}`,
        },
        pageFieldJsonList.baseBuId.visibleFlag && {
          title: `${pageFieldJsonList.baseBuId.displayName}`, // TODO: 国际化
          dataIndex: 'baseBuName',
          sortNo: `${pageFieldJsonList.baseBuId.sortNo}`,
        },
        pageFieldJsonList.baseCity.visibleFlag && {
          title: `${pageFieldJsonList.baseCity.displayName}`, // TODO: 国际化
          dataIndex: 'baseCityName',
          align: 'center',
          sortNo: `${pageFieldJsonList.baseCity.sortNo}`,
        },
        pageFieldJsonList.enrollDate.visibleFlag && {
          title: `${pageFieldJsonList.enrollDate.displayName}`, // TODO: 国际化
          dataIndex: 'enrollDate',
          align: 'center',
          sortNo: `${pageFieldJsonList.enrollDate.sortNo}`,
        },
        pageFieldJsonList.contractExpireDate.visibleFlag && {
          title: `${pageFieldJsonList.contractExpireDate.displayName}`, // TODO: 国际化
          dataIndex: 'contractExpireDate',
          align: 'center',
          sortNo: `${pageFieldJsonList.contractExpireDate.sortNo}`,
        },
        pageFieldJsonList.label1.visibleFlag && {
          title: `${pageFieldJsonList.label1.displayName}`, // TODO: 国际化
          dataIndex: 'buName',
          align: 'center',
          sortNo: `${pageFieldJsonList.label1.sortNo}`,
        },
        pageFieldJsonList.remark.visibleFlag && {
          title: `${pageFieldJsonList.remark.displayName}`, // TODO: 国际化
          dataIndex: 'remark1',
          render: (value, row, key) =>
            value && value.length > 30 ? (
              <Tooltip placement="left" title={value}>
                <pre>{`${value.substr(0, 30)}...`}</pre>
              </Tooltip>
            ) : (
              <pre>{value}</pre>
            ),
        },
      ]
        .filter(Boolean)
        .sort((field1, field2) => field1.sortNo - field2.sortNo),
      leftButtons: [
        {
          key: 'edit',
          className: 'tw-btn-primary',
          icon: 'form',
          title: formatMessage({ id: `misc.update`, desc: '修改' }),
          loading: false,
          hidden: false,
          disabled: selectedRows =>
            selectedRows.length !== 1 ||
            (selectedRows[0] &&
              selectedRows[0].apprStatus !== 'NOTSUBMIT' &&
              (selectedRows[0] && selectedRows[0].apprStatus !== 'APPROVED') &&
              (selectedRows[0] && selectedRows[0].apprStatus !== 'REJECTED') &&
              (selectedRows[0] && selectedRows[0].apprStatus !== 'WITHDRAW')),
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            // 资源状态为‘1’表示创建中；‘3’表示已认证
            const status = selectedRows[0].resStatus;
            if (status !== resStatus.RES_STATUS_1 && status !== resStatus.RES_STATUS_3) {
              createMessage({
                type: 'warn',
                description: '只有人才库或者在职状态的记录才能编辑',
              });
            } else if (status === resStatus.RES_STATUS_1) {
              router.push(`/hr/res/profile/list/resDetail?id=${selectedRowKeys}&mode=update`);
            } else if (status === resStatus.RES_STATUS_3) {
              router.push(
                `/hr/res/profile/list/resDetailEdit?id=${selectedRowKeys}&mode=update&tab=basic`
              );
            }
          },
        },
        // {
        //   key: 'remove',
        //   className: 'tw-btn-error',
        //   icon: 'file-excel',
        //   title: formatMessage({ id: `misc.delete`, desc: '删除' }),
        //   loading: false,
        //   hidden: false,
        //   disabled: selectedRows =>
        //     // 仅未提交的资源可删除(可多条删除)
        //     !(
        //       selectedRows.length > 0 &&
        //       selectedRows.filter(v => v.apprStatus !== 'NOTSUBMIT').length <= 0
        //     ),
        //   minSelections: 0,
        //   cb: (selectedRowKeys, selectedRows, queryParams) => {
        //     this.deleteByStatus(selectedRowKeys, selectedRows, queryParams);
        //   },
        // },

        {
          key: 'blackList',
          className: 'tw-btn-primary',
          icon: 'solution',
          title: '移出黑名单',
          loading: false,
          hidden: false,
          minSelections: 0,
          disabled: selectedRows => !(selectedRows.length > 0),
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            this.addWhiteList(selectedRowKeys, selectedRows, queryParams);
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper>
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default ResProfile;
