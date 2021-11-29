import React from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import { Card, Row, Col, Input, Radio, Button } from 'antd';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { mountToTab, closeThenGoto, markAsTab } from '@/layouts/routerControl';
import DataTable from '@/components/common/DataTable';
import FieldList from '@/components/layout/FieldList';
import { Selection, DatePicker } from '@/pages/gen/field';
import createMessage from '@/components/core/AlertMessage';
import classnames from 'classnames';
import { formatMessage } from 'umi/locale';

const DOMAIN = 'growthRecordCourse';

@connect(({ loading, growthRecordCourse, dispatch }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  growthRecordCourse,
  dispatch,
}))
@mountToTab()
class GrowthRecordCourse extends React.Component {
  componentDidMount() {
    const { dispatch } = this.props;
    this.fetchData({
      offset: 0,
      limit: 10,
      sortBy: 'applyDate',
      sortDirection: 'DESC',
    });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    const obj = {
      ...params,
      accessFlag: params.accessFlag === '' ? void 0 : params.accessFlag,
      startDate: params.applyDate && params.applyDate[0],
      endDate: params.applyDate && params.applyDate[1],
      applyDate: void 0,
    };
    dispatch({
      type: `${DOMAIN}/query`,
      payload: obj,
    });
  };

  render() {
    const {
      growthRecordCourse: { dataSource, total },
      dispatch,
      loading,
    } = this.props;
    const table = {
      YES: '开放权限',
      NO: '未开放权限',
    };
    const tableProps = {
      columnsCache: DOMAIN,
      dispatch,
      loading,
      expirys: 0,
      rowKey: 'id',
      sortBy: 'applyDate',
      sortDirection: 'DESC',
      dataSource,
      total,
      enableSelection: false,
      onChange: filters => {
        this.fetchData(filters);
      },
      onSearchBarChange: (changedValues, allValues) => {
        // dispatch({
        //   type: `${DOMAIN}/updateSearchForm`,
        //   payload: allValues,
        // });
      },
      searchBarForm: [
        {
          title: '流程编号',
          dataIndex: 'no',
          options: {
            // initialValue: ,
          },
          tag: <Input placeholder="请输入流程编号" />,
        },
        {
          title: '状态',
          dataIndex: 'apprStatus',
          options: {
            // initialValue: ,
          },
          tag: <Selection.UDC code="COM.APPR_STATUS" placeholder="请选择状态" />,
        },
        {
          title: '培训内容',
          dataIndex: 'examPoint',
          options: {
            // initialValue: ,
          },
          tag: <Input placeholder="请输入培训内容" />,
        },
        {
          title: '审批结果',
          dataIndex: 'accessFlag',
          options: {
            initialValue: '',
          },
          tag: (
            <Radio.Group>
              <Radio value="YES">开放权限</Radio>
              <Radio value="NO">未开放权限</Radio>
              <Radio value="">全部</Radio>
            </Radio.Group>
          ),
        },
        {
          title: '相关单项能力',
          dataIndex: 'capaName',
          options: {
            // initialValue: ,
          },
          tag: <Input placeholder="请输入相关单项能力" />,
        },
        {
          title: '申请时间',
          dataIndex: 'applyDate',
          options: {
            // initialValue: ,
          },
          tag: <DatePicker.RangePicker format="YYYY-MM-DD" />,
        },
      ],
      columns: [
        {
          title: '流程编号',
          align: 'center',
          dataIndex: 'no',
          key: 'no',
          width: '30%',
          render: (value, row) => {
            const href = `/user/center/growth/course?id=${row.id}&mode=view`;
            return (
              <Link className="tw-link" to={href}>
                {value}
              </Link>
            );
          },
        },
        {
          title: '状态',
          align: 'center',
          dataIndex: 'apprStatusName',
          key: 'apprStatusName',
          width: '10%',
        },
        {
          title: '培训内容',
          align: 'center',
          dataIndex: 'examPoint',
          key: 'examPoint',
          width: '15%',
          // sorter: true,
        },
        {
          title: '审批结果',
          align: 'center',
          dataIndex: 'accessFlag',
          key: 'accessFlag',
          width: '15%',
          render: val => table[val],
        },
        {
          title: '相关单项能力',
          align: 'center',
          dataIndex: 'capaName',
          key: 'capaName',
          width: '15%',
        },
        {
          title: '申请时间',
          align: 'center',
          dataIndex: 'applyDate',
          key: 'applyDate',
          width: '15%',
        },
      ],
    };
    return (
      <PageHeaderWrapper title="培训课程权限申请记录">
        <Card className="tw-card-rightLine">
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => closeThenGoto('/user/center/growth')}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default GrowthRecordCourse;
