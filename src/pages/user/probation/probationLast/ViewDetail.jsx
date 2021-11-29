import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Divider, Tooltip } from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import Title from '@/components/layout/Title';
import DataTable from '@/components/common/DataTable';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DescriptionList from '@/components/layout/DescriptionList';
import { fromQs } from '@/utils/stringUtils';

const { Description } = DescriptionList;

const DOMAIN = 'probationLast';

@connect(({ loading, probationLast, dispatch }) => ({
  dispatch,
  loading,
  probationLast,
}))
@mountToTab()
class ViewDetail extends Component {
  componentDidMount() {
    // const { dispatch } = this.props;
    // dispatch({ type: `${DOMAIN}/clean` });
    // const { id } = fromQs();
    // // 有id，修改
    // id &&
    //   dispatch({
    //     type: `${DOMAIN}/flowDetail`,
    //     payload: { id },
    //   });
    // dispatch({
    //   type: `${DOMAIN}/checkresult`,
    //   payload: {
    //     id,
    //     chkClass: 'PROBATION_FINAL_CHK',
    //   },
    // });
  }

  render() {
    const {
      loading,
      dispatch,
      probationLast: { formData, resultChkList, capacityListSelected, dataList },
    } = this.props;
    const disabledBtn =
      loading.effects[`${DOMAIN}/queryResDetail`] || loading.effects[`${DOMAIN}/getResults`];

    const tableProps = {
      sortBy: 'id',
      rowKey: 'chkItemId',
      sortDirection: 'DESC',
      columnsCache: DOMAIN,
      loading: disabledBtn,
      showColumn: false,
      onRow: () => {},
      showSearch: false,
      showExport: false,
      pagination: false,
      enableSelection: false,
      rowSelection: {
        getCheckboxProps: (rowKey, rows) => {
          if (rowKey.checkMethod === 'AUTO') {
            return false;
          }
          return true;
        },
      },
      enableDoubleClick: false,
      columns: [
        {
          title: '检查方式',
          align: 'center',
          dataIndex: '',
          width: '15%',
          render: (value, row, index) => {
            if (row.checkMethod === 'AUTO') {
              return '系统自动检查';
            }
            return '人工检查';
          },
        },
        {
          title: '检查事项',
          align: 'center',
          width: '15%',
          dataIndex: 'chkItemName',
        },
        {
          title: '检查说明',
          width: '30%',
          dataIndex: 'chkDesc',
        },
        {
          title: '完成状态',
          dataIndex: 'finishStatus',
          align: 'center',
          width: '15%',
        },
        {
          title: '备注',
          dataIndex: 'remark',
          width: '25%',
          render: value => <pre>{value}</pre>,
        },
      ],
    };

    const capacityTableProps = {
      sortBy: 'id',
      rowKey: 'id',
      sortDirection: 'DESC',
      columnsCache: DOMAIN,
      dataSource: capacityListSelected,
      showColumn: false,
      onRow: () => {},
      showSearch: false,
      showExport: false,
      showAdd: false,
      showCopy: false,
      pagination: true,
      enableSelection: false,
      enableDoubleClick: false,
      columns: [
        {
          title: '编号',
          dataIndex: 'capasetNo',
          align: 'center',
          width: 100,
        },
        {
          title: '复合能力',
          dataIndex: 'name',
          align: 'center',
          width: 200,
        },
        {
          title: '当量系数',
          dataIndex: 'eqvaRatio',
          align: 'center',
          width: 100,
        },
        {
          title: '能力描述',
          dataIndex: 'ddesc',
        },
      ],
    };

    const tablePropsAbility = {
      rowKey: 'text',
      loading: false,
      dataSource: dataList,
      total: dataList.length || 0,
      showColumn: false,
      onRow: () => {},
      showSearch: false,
      showExport: false,
      showAdd: false,
      showCopy: false,
      pagination: true,
      enableSelection: false,
      enableDoubleClick: false,
      columns: [
        {
          title: '分类',
          dataIndex: 'capaTypeName',
          key: 'capaTypeName',
          align: 'center',
        },
        {
          title: '单项能力',
          dataIndex: 'text',
          key: 'text',
          align: 'center',
        },
        {
          title: '能力描述',
          dataIndex: 'dsc',
          key: 'dsc',
          align: 'center',
        },
      ],
    };

    return (
      <PageHeaderWrapper>
        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={<Title icon="profile" text="试用期考核(末期)" />}
          bordered={false}
        >
          <DescriptionList size="large" col={2}>
            <Description term="资源">{formData.resName || ''}</Description>
            <Description term="BaseBU">{formData.baseBuName || ''}</Description>
            <Description term="直属领导">{formData.presName || ''}</Description>
            <Description term="试用期">{formData.probationPeriod || ''}</Description>
            <Description term="手机号码">{formData.mobile || ''}</Description>
            <Description term="平台邮箱">{formData.emailAddr || ''}</Description>
            <Description term="评审结果">{formData.buPicCheckResultDesc || ''}</Description>
            <Description term="转正日期">{formData.buPicRegularDate || ''}</Description>
          </DescriptionList>
          <DescriptionList size="large" col={1} noTop>
            <Description term="备注">
              <pre>{formData.remark}</pre>
            </Description>
          </DescriptionList>
          <Divider dashed />
          <DescriptionList title="入职培训完成情况" size="large" col={2}>
            <DataTable {...tableProps} dataSource={resultChkList} />
          </DescriptionList>
          <Divider dashed />
          <DescriptionList size="large" col={1} title="复合能力">
            <DataTable {...capacityTableProps} />
          </DescriptionList>
          <Divider dashed />
          <DescriptionList size="large" col={1} title="单项能力">
            <DataTable {...tablePropsAbility} />
          </DescriptionList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default ViewDetail;
