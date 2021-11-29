import React from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import { Card, Row, Col, Input, Radio, Button } from 'antd';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { mountToTab, closeThenGoto, markAsTab } from '@/layouts/routerControl';
import DataTable from '@/components/common/DataTable';
import FieldList from '@/components/layout/FieldList';
import { Selection, DatePicker, FileManagerEnhance } from '@/pages/gen/field';
import { genFakeId } from '@/utils/mathUtils';
import classnames from 'classnames';
import { formatMessage } from 'umi/locale';

const DOMAIN = 'growthRecordCertificate';

@connect(({ loading, growthRecordCertificate, dispatch }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  growthRecordCertificate,
  dispatch,
}))
@mountToTab()
class GrowthRecordCertificate extends React.Component {
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
      no: params.no || void 0,
      apprStatus: params.apprStatus || void 0,
      certNo: params.certNo || void 0,
      capaName: params.capaName || void 0,
      pointName: params.pointName || void 0,
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
      growthRecordCertificate: { dataSource, total },
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
          title: '证书名称/号码',
          dataIndex: 'certNo',
          options: {
            // initialValue: ,
          },
          tag: <Input placeholder="请输入培训内容" />,
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
          title: '相关考核点',
          dataIndex: 'pointName',
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
          width: '15%',
          render: (value, row) => {
            const href = `/user/center/growth/certificate/view?id=${row.id}&mode=view`;
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
          title: '证书名称',
          align: 'center',
          dataIndex: 'certName',
          key: 'certName',
          width: '15%',
          // sorter: true,
        },
        {
          title: '证书号码',
          align: 'center',
          dataIndex: 'certNo',
          key: 'certNo',
          width: '15%',
        },
        {
          title: '证书附件',
          align: 'center',
          dataIndex: 'attachment',
          key: 'accessFlag',
          width: '5%',
          render: value => (
            <FileManagerEnhance
              api="/api/base/v1/resCourseApply/sfs/token"
              dataKey={value}
              listType="text"
              disabled
              preview
              key={genFakeId(-1)}
            />
          ),
        },
        {
          title: '相关单项能力',
          align: 'center',
          dataIndex: 'capaName',
          key: 'capaName',
          width: '15%',
        },
        {
          title: '相关考核点',
          align: 'center',
          dataIndex: 'examPoint',
          key: 'examPoint',
          width: '15%',
        },
        {
          title: '申请时间',
          align: 'center',
          dataIndex: 'applyDate',
          key: 'applyDate',
        },
      ],
    };
    return (
      <PageHeaderWrapper title="资格证书上传申请记录">
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

export default GrowthRecordCertificate;
