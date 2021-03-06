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
import classnames from 'classnames';
import { formatMessage } from 'umi/locale';

const DOMAIN = 'growthRecordExamination';

@connect(({ loading, growthRecordExamination, dispatch }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  growthRecordExamination,
  dispatch,
}))
@mountToTab()
class GrowthRecordExamination extends React.Component {
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
      apprResult: params.apprResult === 'ALL' ? void 0 : params.apprResult,
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
      growthRecordExamination: { dataSource, total },
      dispatch,
      loading,
    } = this.props;
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
          title: '????????????',
          dataIndex: 'no',
          options: {
            // initialValue: ,
          },
          tag: <Input placeholder="?????????????????????" />,
        },
        {
          title: '??????',
          dataIndex: 'apprStatus',
          options: {
            // initialValue: ,
          },
          tag: <Selection.UDC code="COM.APPR_STATUS" placeholder="???????????????" />,
        },
        {
          title: '?????????',
          dataIndex: 'examPoint',
          options: {
            // initialValue: ,
          },
          tag: <Input placeholder="?????????????????????" />,
        },
        {
          title: '??????????????????',
          dataIndex: 'capaName',
          options: {
            // initialValue: ,
          },
          tag: <Input placeholder="???????????????????????????" />,
        },
        {
          title: '????????????',
          dataIndex: 'apprResult',
          options: {
            initialValue: 'ALL',
          },
          tag: (
            <Radio.Group>
              <Radio value="YES">????????????</Radio>
              <Radio value="NO">???????????????</Radio>
              <Radio value="ALL">??????</Radio>
            </Radio.Group>
          ),
        },
        {
          title: '????????????',
          dataIndex: 'applyDate',
          options: {
            // initialValue: ,
          },
          tag: <DatePicker.RangePicker format="YYYY-MM-DD" />,
        },
      ],
      columns: [
        {
          title: '????????????',
          align: 'center',
          dataIndex: 'no',
          key: 'no',
          width: '30%',
          render: (value, row) => {
            const href = `/user/center/growth/checkPoint/view?id=${row.id}&mode=view`;
            return (
              <Link className="tw-link" to={href}>
                {value}
              </Link>
            );
          },
        },
        {
          title: '??????',
          align: 'center',
          dataIndex: 'apprStatusName',
          key: 'apprStatusName',
          width: '10%',
        },
        {
          title: '?????????',
          align: 'center',
          dataIndex: 'examPoint',
          key: 'examPoint',
          width: '15%',
          // sorter: true,
        },
        {
          title: '??????????????????',
          align: 'center',
          dataIndex: 'capaName',
          key: 'capaName',
          width: '15%',
        },
        {
          title: '????????????',
          align: 'center',
          dataIndex: 'apprResult',
          key: 'apprResult',
          width: '15%',
        },
        {
          title: '????????????',
          align: 'center',
          dataIndex: 'applyDate',
          key: 'applyDate',
          width: '15%',
        },
      ],
    };
    return (
      <PageHeaderWrapper title="???????????????????????????">
        <Card className="tw-card-rightLine">
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => closeThenGoto('/user/center/growth')}
          >
            {formatMessage({ id: `misc.rtn`, desc: '??????' })}
          </Button>
        </Card>
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default GrowthRecordExamination;
