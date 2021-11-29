import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import Link from 'umi/link';
import { Input, Radio } from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { Selection, DatePicker, BuVersion } from '@/pages/gen/field';
import { fromQs } from '@/utils/stringUtils';
import { getUrl } from '@/utils/flowToRouter';
import { stringify } from 'qs';
import { selectInternalOus, selectUsersWithBu } from '@/services/gen/list';
import { selectBuMultiCol } from '@/services/org/bu/bu';
import { getBuVersionAndBuParams } from '@/utils/buVersionUtils';

const RadioGroup = Radio.Group;

const DOMAIN = 'offerApply';

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

@connect(({ loading, offerApply }) => ({
  offerApply,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@mountToTab()
class offerApply extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { _refresh } = fromQs();
    !(_refresh === '0') && dispatch({ type: `${DOMAIN}/cleanSearchForm` });
    // !(_refresh === '0') &&
    //   this.fetchData({
    //     offset: 0,
    //     limit: 10,
    //     sortBy: 'id',
    //     sortDirection: 'DESC',
    //   });
  }

  fetchData = params => {
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
      loading,
      dispatch,
      offerApply: { list, total, searchForm },
    } = this.props;

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'DESC',
      scroll: { x: 1730 },
      loading,
      total,
      dataSource: list,
      enableSelection: false,
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
          title: '流程编号',
          dataIndex: 'abNo',
          options: {
            initialValue: searchForm.abNo,
          },
          tag: <Input placeholder="请输入流程编号" />,
        },
        {
          title: '状态',
          dataIndex: 'apprStatus',
          options: {
            initialValue: searchForm.apprStatus,
          },
          tag: <Selection.UDC code="COM:APPR_STATUS" placeholder="请选择状态" />,
        },
        {
          title: '是否入职',
          dataIndex: 'deliverOffer',
          options: {
            initialValue: searchForm.deliverOffer || '',
          },
          tag: (
            <RadioGroup initialValue={searchForm.deliverOffer || ''}>
              <Radio value="YES">是</Radio>
              <Radio value="NO">否</Radio>
              <Radio value="">全部</Radio>
            </RadioGroup>
          ),
        },
        {
          title: '未入职原因',
          dataIndex: 'noneOfferReason',
          options: {
            initialValue: searchForm.noneOfferReason,
          },
          tag: <Selection.UDC code="RES:ABANDON_OFFER_REASON" placeholder="请选择未入职原因" />,
        },
        {
          title: '入职日期',
          dataIndex: 'enrollDate',
          options: {
            initialValue: searchForm.enrollDate,
          },
          tag: <DatePicker.RangePicker format="YYYY-MM-DD" />,
        },
        {
          title: '资源类别',
          dataIndex: 'resType',
          options: {
            initialValue: searchForm.resType || '',
          },
          tag: (
            <RadioGroup initialValue={searchForm.resType}>
              <Radio value="GENERAL">一般资源</Radio>
              <Radio value="SALES_BU">销售BU</Radio>
              <Radio value="">全部</Radio>
            </RadioGroup>
          ),
        },
        {
          title: '岗位',
          dataIndex: 'job',
          options: {
            initialValue: searchForm.job,
          },
          tag: <Input placeholder="请输入岗位" />,
        },
        {
          title: 'BaseBU',
          dataIndex: 'baseBuId',
          options: {
            initialValue: searchForm.baseBuId || undefined,
          },
          tag: <BuVersion />,
        },
        {
          title: 'Base地',
          dataIndex: 'baseCity',
          options: {
            initialValue: searchForm.baseCity,
          },
          tag: <Selection.UDC code="COM.CITY" placeholder="请选择Base地" />,
        },

        {
          title: '上级资源',
          dataIndex: 'presId',
          options: {
            initialValue: searchForm.presId || undefined,
          },
          tag: (
            <Selection.Columns
              className="x-fill-100"
              source={() => selectUsersWithBu()}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
            />
          ),
        },
        {
          title: '合作方式',
          dataIndex: 'coopType',
          options: {
            initialValue: searchForm.coopType,
          },
          tag: <Selection.UDC code="COM:COOPERATION_MODE" placeholder="请选择合作方式" />,
        },
        {
          title: '资源',
          dataIndex: 'resId',
          options: {
            initialValue: searchForm.resId || undefined,
          },
          tag: (
            <Selection.Columns
              className="x-fill-100"
              source={() => selectUsersWithBu()}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
            />
          ),
        },
        {
          title: '无加班人员',
          dataIndex: 'inLieuFlag',

          options: {
            initialValue: searchForm.inLieuFlag || '',
          },
          tag: (
            <RadioGroup initialValue={searchForm.inLieuFlag || ''}>
              <Radio value="YES">是</Radio>
              <Radio value="NO">否</Radio>
              <Radio value="">全部</Radio>
            </RadioGroup>
          ),
        },
        {
          title: '商务基本资质培训',
          dataIndex: 'busiTrainFlag',
          colProps: {
            xs: 24,
            sm: 12,
            md: 12,
            lg: 12,
            xl: 8,
          },
          options: {
            initialValue: searchForm.busiTrainFlag || '',
          },
          tag: (
            <RadioGroup initialValue={searchForm.busiTrainFlag || ''}>
              <Radio value="YES">参加</Radio>
              <Radio value="NO">不参加</Radio>
              <Radio value="">全部</Radio>
            </RadioGroup>
          ),
        },
        {
          title: '申请人',
          dataIndex: 'applyResId',
          options: {
            initialValue: searchForm.applyResId || undefined,
          },
          tag: (
            <Selection.Columns
              className="x-fill-100"
              source={() => selectUsersWithBu()}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
            />
          ),
        },
        {
          title: '申请时间',
          dataIndex: 'applyDate',
          options: {
            initialValue: searchForm.applyDate,
          },
          tag: <DatePicker.RangePicker format="YYYY-MM-DD" />,
        },
      ],
      columns: [
        {
          title: '流程编号',
          dataIndex: 'abNo',
          width: 200,
          align: 'center',
          render: (value, row) => {
            const urls = getUrl();
            const from = stringify({ from: urls });
            const href = `/hr/res/offerApply/view?id=${row.id}&${from}`;
            return (
              <Link className="tw-link" to={href}>
                {value}
              </Link>
            );
          },
        },
        {
          title: '状态',
          dataIndex: 'apprStatusName',
          align: 'center',
          width: 100,
        },
        {
          title: '资源',
          dataIndex: 'resNo',
          align: 'center',
          width: 200,
          render: (value, row) => `${row.resNo}-${row.resName}`,
        },
        {
          title: '是否入职',
          dataIndex: 'deliverOffer',
          align: 'center',
          width: 100,
          // eslint-disable-next-line no-nested-ternary
          render: value => (value === 'YES' ? '是' : value === 'NO' ? '否' : value),
        },
        {
          title: '未入职原因',
          dataIndex: 'noneOfferReasonName',
          align: 'center',
          width: 200,
          render: value => <pre>{value}</pre>,
        },
        {
          title: '入职日期',
          dataIndex: 'enrollDate',
          align: 'center',
          width: 100,
        },
        {
          title: '资源类别',
          dataIndex: 'resType',
          align: 'center',
          width: 100,
          render: value => (value === 'GENERAL' ? '一般资源' : '销售BU'),
        },
        {
          title: 'BaseBU',
          dataIndex: 'baseBuName',
          align: 'center',
          width: 100,
        },
        {
          title: 'Base地',
          dataIndex: 'baseCityName',
          align: 'center',
          width: 100,
        },
        {
          title: '上级资源',
          dataIndex: 'presName',
          align: 'center',
          width: 100,
        },
        {
          title: '岗位',
          dataIndex: 'job',
          align: 'center',
          width: 100,
        },
        {
          title: '合作方式',
          dataIndex: 'coopTypeName',
          align: 'center',
          width: 100,
        },
        {
          title: '申请人',
          dataIndex: 'applyResName',
          align: 'center',
          width: 100,
        },
        {
          title: '申请时间',
          dataIndex: 'applyDate',
          align: 'center',
          width: 100,
        },
      ],
    };

    return (
      <PageHeaderWrapper title="离职申请">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default offerApply;
