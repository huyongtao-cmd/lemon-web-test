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
        user: { extInfo = {} }, // 取当前登录人的resId
      },
      dispatch,
    } = this.props;
    const disabledBtn = loading.effects[`${DOMAIN}/query`];
    const { taskId, id } = fromQs();
    const allBpm = [{ docId: formData.id, procDefKey: 'TSK_P09', title: '项目汇报流程' }];

    const data = [
      {
        label: '数量',
        总预算: formData.eqvaBudgetCnt,
        已派发: formData.eqvaDistedQty,
        已结算: formData.eqvaSettledQty,
      },
      {
        label: '金额(千元)',
        总预算: formData.eqvaBudgetAmt / 1000,
        已派发: formData.eqvaDistedAmt / 1000,
        已结算: formData.eqvaSettledAmt / 1000,
      },
    ];
    const ds = new DataSet();
    const dv = ds.createView().source(data);
    dv.transform({
      type: 'fold',
      fields: ['总预算', '已派发', '已结算'],
      // 展开字段集
      key: 'type',
      // key字段
      value: 'value', // value字段
    });

    // 费用数据
    const feeData = [
      {
        label: '费用',
        总预算: formData.feeBudgetAmt,
        已使用: formData.feeUsedAmt,
      },
    ];
    const feeDs = new DataSet();
    const feeDv = feeDs.createView().source(feeData);
    feeDv.transform({
      type: 'fold',
      fields: ['总预算', '已使用'],
      // 展开字段集
      key: 'type',
      // key字段
      value: 'value', // value字段
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
          render: (value, row, index) => (row.id === formData.id ? '本期汇报' : '上期汇报'),
        },
        {
          title: '期间',
          dataIndex: 'finPeriodName',
          align: 'right',
          width: '120',
        },
        {
          title: '预计剩余报销费用',
          dataIndex: 'predictReimAmt',
          align: 'right',
          width: '200',
        },
        {
          title: '预计剩余劳务成本',
          dataIndex: 'predictLaborAmt',
          align: 'right',
          width: '200',
        },
        {
          title: '累计完工百分比',
          dataIndex: 'reprotCompPercent',
          align: 'right',
          width: '150',
          render: (value, row, index) => (value ? value + '%' : ''),
        },
        {
          title: '财务调整完工百分比',
          dataIndex: 'confirmCompPercent',
          required: false,
          align: 'right',
          render: (value, row, index) => (value ? value + '%' : ''),
        },
        {
          title: '财务调整说明',
          dataIndex: 'confirmCompDesc',
          required: false,
          align: 'right',
        },
        {
          title: '累计确认收入',
          dataIndex: 'confirmedAmt',
          required: false,
          align: 'right',
        },
        {
          title: '当期确认收入',
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
      <PageHeaderWrapper title="项目情况汇报">
        <Card bordered={false} className="tw-card-adjust">
          <DescriptionList title="项目收款信息" size="large" col={2} hasSeparator>
            <Description term="汇报编号">{formData.briefNo}</Description>
            <Description term="相关项目">
              <a
                className="tw-link"
                onClick={() => router.push(`/user/project/projectDetail?id=${formData.projId}`)}
              >
                {formData.projName}
              </a>
            </Description>
            <Description term="提交人">{formData.applyResName}</Description>
            <Description term="财务期间">{formData.finPeriodName}</Description>
            <Description term="项目进度状态">{formData.projProcessStatusDesc}</Description>
            <Description term="项目汇报状态">{formData.briefStatusDesc}</Description>
            <Description term="项目情况描述">{formData.briefDesc}</Description>
            <Description term="项目风险描述">{formData.riskDesc}</Description>
          </DescriptionList>

          <DescriptionList title="项目收款信息" />
          <Row style={{ width: '80%', margin: '0px auto' }}>
            <Col span={24}>
              <h2 style={{ textAlign: 'center' }}>
                项目总应收款:
                {formData.projAmt}元
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
                  未收款金额
                </div>
                <Divider style={{ backgroundColor: 'white', height: '3px', margin: '5px 0px' }} />
                <div style={{ height: 100, textAlign: 'center' }}>
                  <h3>{formData.notReceivedAmt}元</h3>
                  <div style={{ width: '48%', float: 'left' }}>
                    <p style={{ margin: '0' }}>开票未收款</p>
                    <p style={{ color: '#0000FF' }}>{formData.invoicedNotReceivedAmt}元</p>
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
                    <p style={{ margin: '0' }}>未开票应收款</p>
                    <p style={{ color: 'red' }}>{formData.notInvoicedReceivedAmt}元</p>
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
                  已收款金额(%)
                </div>
                <Divider style={{ backgroundColor: 'white', height: '3px', margin: '5px 0px' }} />
                <div style={{ height: 100, textAlign: 'center' }}>
                  <h3 style={{ paddingTop: '25px' }}>
                    {formData.recvedAmt}
                    元(
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
                  已确认收入
                </div>
                <Divider style={{ backgroundColor: 'white', height: '3px', margin: '5px 0px' }} />
                <div style={{ height: 100, textAlign: 'center' }}>
                  <h3 style={{}}>{confirmAmt}元</h3>
                  <h4 style={{}}>
                    已发生的劳务费用:
                    {formData.passedLaborAmt}元
                  </h4>
                  <h4 style={{}}>
                    完工百分比:
                    {confirmCompPercent}%
                  </h4>
                </div>
              </div>
            </Col>
          </Row>

          <DescriptionList title="项目进度填报" />
          <DataTable {...editTableProps} />

          <DescriptionList title="项目预算情况" />
          <Row>
            <Col span={12}>
              <ChartCard loading={false} title="当量使用情况">
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
              <ChartCard loading={false} title="费用使用情况">
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
