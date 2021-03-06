import React, { PureComponent } from 'react';
import router from 'umi/router';
import {
  Button,
  Card,
  Input,
  Select,
  Form,
  Divider,
  Row,
  Col,
  InputNumber,
  Tooltip,
  Icon,
} from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { isEmpty, isNil } from 'ramda';
import BpmConnection from '@/pages/gen/BpmMgmt/BpmConnection';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';
import AsyncSelect from '@/components/common/AsyncSelect';
import FieldList from '@/components/layout/FieldList';
import DescriptionList from '@/components/layout/DescriptionList';
import { UdcSelect, MonthRangePicker } from '@/pages/gen/field';
import Title from '@/components/layout/Title';
import DataSet from '@antv/data-set';
import {
  ChartCard,
  MiniArea,
  MiniBar,
  MiniProgress,
  Bar,
  Pie,
  TimelineChart,
} from '@/components/common/Charts';
import EditableDataTable from '@/components/common/EditableDataTable';
import { Chart, Geom, Axis, Legend, Coord, Tooltip as ChartsToolTip } from 'bizcharts';

import { selectFinperiod } from '@/services/user/Contract/sales';
import DataTable from '../../../components/common/DataTable/index';

const { Option } = Select;
const { Field, FieldLine } = FieldList;
const { Description } = DescriptionList;

const DOMAIN = 'projectReportDetail';

@connect(({ loading, projectReportDetail, dispatch, user }) => ({
  loading,
  ...projectReportDetail,
  dispatch,
  user,
}))
@mountToTab()
class ProjectReportDetail extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { id, projId } = fromQs();
    if (id) {
      dispatch({
        type: `${DOMAIN}/query`,
        payload: { id },
      });
    }
  }

  render() {
    const {
      loading,
      formData,
      currentFinPeriodId,
      mode,
      user: {
        user: { extInfo = {} }, // ?????????????????????resId
      },
      dispatch,
    } = this.props;
    const disabledBtn = loading.effects[`${DOMAIN}/query`];
    const { taskId, id } = fromQs();
    const allBpm = [{ docId: formData.id, procDefKey: 'TSK_P09', title: '??????????????????' }];

    const data = [
      {
        label: '??????',
        ?????????: formData.eqvaBudgetCnt,
        ?????????: formData.eqvaDistedQty,
        ?????????: formData.eqvaSettledQty,
      },
      {
        label: '??????(??????)',
        ?????????: formData.eqvaBudgetAmt / 1000,
        ?????????: formData.eqvaDistedAmt / 1000,
        ?????????: formData.eqvaSettledAmt / 1000,
      },
    ];
    const ds = new DataSet();
    const dv = ds.createView().source(data);
    dv.transform({
      type: 'fold',
      fields: ['?????????', '?????????', '?????????'],
      // ???????????????
      key: 'type',
      // key??????
      value: 'value', // value??????
    });

    // ????????????
    const feeData = [
      {
        label: '??????',
        ?????????: formData.feeBudgetAmt,
        ?????????: formData.feeUsedAmt,
      },
    ];
    const feeDs = new DataSet();
    const feeDv = feeDs.createView().source(feeData);
    feeDv.transform({
      type: 'fold',
      fields: ['?????????', '?????????'],
      // ???????????????
      key: 'type',
      // key??????
      value: 'value', // value??????
    });

    const editSource = [formData];
    if (formData.lastPeriodBrief) {
      editSource.splice(0, 0, formData.lastPeriodBrief);
    }

    const editTableProps = {
      sortBy: 'id',
      rowKey: 'id',
      dataSource: editSource,
      showSearch: false,
      showColumn: false,
      showExport: false,
      pagination: false,
      enableSelection: false,
      total: 0,
      columns: [
        {
          title: '',
          dataIndex: 'faker',
          align: 'right',
          width: '100',
          render: (value, row, index) => (row.id === formData.id ? '????????????' : '????????????'),
        },
        {
          title: '??????',
          dataIndex: 'finPeriodName',
          align: 'right',
          width: '120',
        },
        {
          title: '????????????????????????',
          dataIndex: 'predictReimAmt',
          align: 'right',
          width: '200',
        },
        {
          title: '????????????????????????',
          dataIndex: 'predictLaborAmt',
          align: 'right',
          width: '200',
        },
        {
          title: '?????????????????????',
          dataIndex: 'reprotCompPercent',
          align: 'right',
          width: '150',
          render: (value, row, index) => (value ? value + '%' : ''),
        },
        {
          title: '???????????????????????????',
          dataIndex: 'confirmCompPercent',
          required: false,
          align: 'right',
          render: (value, row, index) => (value ? value + '%' : ''),
        },
        {
          title: '??????????????????',
          dataIndex: 'confirmCompDesc',
          required: false,
          align: 'right',
        },
        {
          title: '??????????????????',
          dataIndex: 'confirmedAmt',
          required: false,
          align: 'right',
        },
        {
          title: '??????????????????',
          dataIndex: 'confirmAmt',
          required: false,
          align: 'right',
        },
      ],
    };

    let confirmAmt = 0;
    let confirmCompPercent = 0;
    if (formData.confirmAmt) {
      confirmAmt = formData.confirmAmt + formData.confirmedAmt; // eslint-disable-line
    }
    if (formData.confirmCompPercent) {
      confirmCompPercent = formData.confirmCompPercent; // eslint-disable-line
    }
    if (formData.lastPeriodBrief && formData.lastPeriodBrief.id !== -999) {
      confirmAmt = formData.lastPeriodBrief.confirmAmt + formData.lastPeriodBrief.confirmedAmt; // eslint-disable-line
      confirmCompPercent = formData.lastPeriodBrief.confirmCompPercent; // eslint-disable-line
    }
    return (
      <PageHeaderWrapper title="??????????????????">
        <Card bordered={false} className="tw-card-adjust">
          <DescriptionList title="??????????????????" size="large" col={2} hasSeparator>
            <Description term="????????????">{formData.briefNo}</Description>
            <Description term="????????????">
              <a
                className="tw-link"
                onClick={() => router.push(`/user/project/projectDetail?id=${formData.projId}`)}
              >
                {formData.projName}
              </a>
            </Description>
            <Description term="?????????">{formData.applyResName}</Description>
            <Description term="????????????">{formData.finPeriodName}</Description>
            <Description term="??????????????????">{formData.projProcessStatusDesc}</Description>
            <Description term="??????????????????">{formData.briefStatusDesc}</Description>
            <Description term="??????????????????">{formData.briefDesc}</Description>
            <Description term="??????????????????">{formData.riskDesc}</Description>
          </DescriptionList>

          <DescriptionList title="??????????????????" />
          <Row style={{ width: '80%', margin: '0px auto' }}>
            <Col span={24}>
              <h2 style={{ textAlign: 'center' }}>
                ??????????????????:
                {formData.projAmt}???
              </h2>
            </Col>
          </Row>
          <Row style={{ width: '80%', margin: '0px auto' }}>
            <Col span={8}>
              <div
                style={{
                  backgroundColor: '#DDD',
                  width: '60%',
                  margin: '0px auto',
                  borderRadius: '5px',
                  minWidth: '210px',
                }}
              >
                <div
                  style={{ height: 30, textAlign: 'center', padding: '5px 0', fontWeight: 'bold' }}
                >
                  ???????????????
                </div>
                <Divider style={{ backgroundColor: 'white', height: '3px', margin: '5px 0px' }} />
                <div style={{ height: 100, textAlign: 'center' }}>
                  <h3>{formData.notReceivedAmt}???</h3>
                  <div style={{ width: '48%', float: 'left' }}>
                    <p style={{ margin: '0' }}>???????????????</p>
                    <p style={{ color: '#0000FF' }}>{formData.invoicedNotReceivedAmt}???</p>
                  </div>
                  <Divider
                    type="vertical"
                    style={{
                      float: 'left',
                      margin: '0 2px',
                      height: '60px',
                      width: '3px',
                      backgroundColor: '#AAA',
                    }}
                  />
                  <div style={{ width: '48%', float: 'left' }}>
                    <p style={{ margin: '0' }}>??????????????????</p>
                    <p style={{ color: 'red' }}>{formData.notInvoicedReceivedAmt}???</p>
                  </div>
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div
                style={{
                  backgroundColor: '#DDD',
                  width: '60%',
                  margin: '0px auto',
                  borderRadius: '5px',
                  minWidth: '210px',
                }}
              >
                <div
                  style={{ height: 30, textAlign: 'center', padding: '5px 0', fontWeight: 'bold' }}
                >
                  ???????????????(%)
                </div>
                <Divider style={{ backgroundColor: 'white', height: '3px', margin: '5px 0px' }} />
                <div style={{ height: 100, textAlign: 'center' }}>
                  <h3 style={{ paddingTop: '25px' }}>
                    {formData.recvedAmt}
                    ???(
                    {formData.actualReceivedRate}
                    %)
                  </h3>
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div
                style={{
                  backgroundColor: '#DDD',
                  width: '60%',
                  margin: '0px auto',
                  borderRadius: '5px',
                  minWidth: '210px',
                }}
              >
                <div
                  style={{ height: 30, textAlign: 'center', padding: '5px 0', fontWeight: 'bold' }}
                >
                  ???????????????
                </div>
                <Divider style={{ backgroundColor: 'white', height: '3px', margin: '5px 0px' }} />
                <div style={{ height: 100, textAlign: 'center' }}>
                  <h3 style={{}}>{confirmAmt}???</h3>
                  <h4 style={{}}>
                    ????????????????????????:
                    {formData.passedLaborAmt}???
                  </h4>
                  <h4 style={{}}>
                    ???????????????:
                    {confirmCompPercent}%
                  </h4>
                </div>
              </div>
            </Col>
          </Row>

          <DescriptionList title="??????????????????" />
          <DataTable {...editTableProps} />

          <DescriptionList title="??????????????????" />
          <Row>
            <Col span={12}>
              <ChartCard loading={false} title="??????????????????">
                <Chart data={dv} height={300} forceFit>
                  <Legend />
                  <Coord transpose scale={[1, -1]} />
                  <Axis
                    name="label"
                    label={{
                      offset: 12,
                    }}
                  />
                  <Axis name="value" position="right" />
                  <ChartsToolTip />
                  <Geom
                    type="interval"
                    position="label*value"
                    color="type"
                    adjust={[
                      {
                        type: 'dodge',
                        marginRatio: 1 / 32,
                      },
                    ]}
                  />
                </Chart>
              </ChartCard>
            </Col>

            <Col span={12}>
              <ChartCard loading={false} title="??????????????????">
                <Chart data={feeDv} height={300}>
                  <Legend />
                  <Coord transpose scale={[1, -1]} />
                  <Axis
                    name="label"
                    label={{
                      offset: 12,
                    }}
                  />
                  <Axis name="value" position="right" />
                  <ChartsToolTip />
                  <Geom
                    type="interval"
                    position="label*value"
                    color="type"
                    adjust={[
                      {
                        type: 'dodge',
                        marginRatio: 1 / 32,
                      },
                    ]}
                  />
                </Chart>
              </ChartCard>
            </Col>
          </Row>
        </Card>
        {!taskId && !disabledBtn && <BpmConnection source={allBpm} />}
      </PageHeaderWrapper>
    );
  }
}

export default ProjectReportDetail;
