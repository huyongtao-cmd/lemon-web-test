import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Card, Tooltip, Icon, Tabs, Button, Divider, Progress } from 'antd';
import {
  Chart,
  Tooltip as BizTooltip,
  Geom,
  Coord,
  Legend,
  Axis,
  Guide,
  Label,
  Shape,
} from 'bizcharts';
import { Selection, DatePicker } from '@/pages/gen/field';
import NumberInfo from '@/components/common/NumberInfo';
import ChartCard from '@/components/common/DataChart';
import numeral from 'numeral';
import DataSet from '@antv/data-set';
import GridContent from '@/components/layout/PageHeaderWrapper/GridContent';
import { selectUsersWithBu, selectInternalOus } from '@/services/gen/list';

const { Html, Arc } = Guide;
const { AMapUI } = window;

function HighLight(props) {
  const { value, style, ...restProps } = props;
  return (
    <div
      style={{
        fontWeight: 'bold',
        backgroundColor: value >= 0 ? 'rgb(0,255,102)' : 'rgb(255,0,0)',
        textAlign: 'center',
        width: '70px',
        float: 'left',
        margin: '0',
        ...style,
      }}
      {...restProps}
    >
      {value}% {value >= 0 ? <Icon type="caret-up" /> : <Icon type="caret-down" />}
    </div>
  );
}

const constructGeoJSON = features => {
  if (!features) return false;
  if (Array.isArray(features)) {
    return {
      type: 'FeatureCollection',
      features: [...features],
    };
  }
  return features;
};

const getGeojsonByCode = (adcode = 100000, withSub = true) => {
  if (!AMapUI) {
    return Promise.reject();
  }
  // 文档：https://lbs.amap.com/api/javascript-api/reference-amap-ui/geo/district-explorer
  return new Promise((resolve, reject) => {
    AMapUI.load('ui/geo/DistrictExplorer', DistrictExplorer => {
      const districtExplorer = new DistrictExplorer();
      districtExplorer.loadAreaNode(adcode, (error, areaNode) => {
        if (error) {
          reject();
        }
        let res = null;
        if (withSub) {
          res = areaNode.getSubFeatures();
        } else {
          res = areaNode.getParentFeature();
        }
        resolve(constructGeoJSON(res));
      });
    });
  });
};

const DOMAIN = 'buCabin';

@connect(({ buCabin, loading, dispatch }) => ({
  ...buCabin,
  dispatch,
}))
class BuCabin extends PureComponent {
  state = {
    expenseNo: 'SALE_EXPENSE_CHANGE',
    chinaGeo: null,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/initData`,
      payload: {},
    });
    dispatch({
      type: `${DOMAIN}/initTypeData`,
      payload: { type: 'SALE' },
    });
    getGeojsonByCode(100000, true).then(res => {
      this.setState({ chinaGeo: res });
    });
  }

  handExpenseSwitch = () => {
    const { expenseNo } = this.state;
    if (expenseNo === 'SALE_INCOME_CHANGE') {
      this.setState({ expenseNo: 'SALE_EXPENSE_CHANGE' });
    }
    if (expenseNo === 'SALE_EXPENSE_CHANGE') {
      this.setState({ expenseNo: 'SALE_INCOME_CHANGE' });
    }
  };

  tabChange = type => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/tab1Change`,
      payload: { type1Key: type },
    });
  };

  tab2Change = type2 => {
    const { dispatch, type1Key } = this.props;
    dispatch({
      type: `${DOMAIN}/tab2Change`,
      payload: { type1Key, type2Key: type2 },
    });
  };

  renderType = () => {
    const {
      type1Key,
      type2Key,
      objectiveCat2Data,
      saleIncomeObjectiveStatisticChart,
      saleIncomeObjectiveScoreDistributionChart,
      saleIncomeObjectiveScoreSumChart,
    } = this.props;
    const tabList = objectiveCat2Data.map(cat2 => ({ key: cat2.code, tab: cat2.name }));

    // 销售收入类OKR统计
    const saleIncomeObjectiveStatisticChartName =
      saleIncomeObjectiveStatisticChart.chartTitle || '销售收入类OKR统计';
    let saleIncomeObjectiveStatisticChartProgress = 0; // 进度
    let saleIncomeObjectiveStatisticChartTotal = 0; // 目标总数
    let saleIncomeObjectiveStatisticChartFinished = 0; // 已完成
    let saleIncomeObjectiveStatisticChartUnfinished = 0; // 未完成
    if (saleIncomeObjectiveStatisticChart.data && saleIncomeObjectiveStatisticChart.data[0]) {
      saleIncomeObjectiveStatisticChartProgress = saleIncomeObjectiveStatisticChart.data[0]['进度'];
      saleIncomeObjectiveStatisticChartTotal =
        saleIncomeObjectiveStatisticChart.data[0]['目标总数'];
      saleIncomeObjectiveStatisticChartFinished =
        saleIncomeObjectiveStatisticChart.data[0]['已完成'];
      saleIncomeObjectiveStatisticChartUnfinished =
        saleIncomeObjectiveStatisticChart.data[0]['未完成'];
    }

    // 销售收入类OKR整体评分
    const saleIncomeObjectiveScoreDistributionChartName =
      saleIncomeObjectiveScoreDistributionChart.chartTitle || '销售收入类OKR整体评分';
    let saleIncomeObjectiveScoreSumChartScore = 0; // 评分
    let saleIncomeObjectiveScoreSumChartYear = 0; // 同比
    if (saleIncomeObjectiveScoreSumChart.data && saleIncomeObjectiveScoreSumChart.data[0]) {
      saleIncomeObjectiveScoreSumChartScore = saleIncomeObjectiveScoreSumChart.data[0]['整体评分'];
      saleIncomeObjectiveScoreSumChartYear = saleIncomeObjectiveScoreSumChart.data[0]['同比'];
    }

    const content = {};
    objectiveCat2Data.forEach(cat2 => {
      content[cat2.code] = (
        <>
          <ChartCard type="CUSTOM" title={saleIncomeObjectiveStatisticChartName}>
            <Row>
              <Col span={6}>
                <Progress
                  type="circle"
                  percent={saleIncomeObjectiveStatisticChartProgress}
                  width={70}
                />
              </Col>
              <Col span={6}>
                <h3
                  style={{
                    fontWeight: 'bold',
                    borderLeft: '4px solid rgb(41,71,145)',
                    paddingLeft: '5px',
                    color: 'rgb(102,102,102)',
                  }}
                >
                  目标总数
                  <h3 style={{ fontWeight: 'bold' }}>{saleIncomeObjectiveStatisticChartTotal}个</h3>
                </h3>
              </Col>
              <Col span={6}>
                <h3
                  style={{
                    fontWeight: 'bold',
                    borderLeft: '4px solid rgb(0,255,0)',
                    paddingLeft: '5px',
                    color: 'rgb(102,102,102)',
                  }}
                >
                  已完成
                  <h3 style={{ fontWeight: 'bold' }}>
                    {saleIncomeObjectiveStatisticChartFinished}个
                  </h3>
                </h3>
              </Col>
              <Col span={6}>
                <h3
                  style={{
                    fontWeight: 'bold',
                    borderLeft: '4px solid rgb(255,0,0)',
                    paddingLeft: '5px',
                    color: 'rgb(102,102,102)',
                  }}
                >
                  未完成
                  <h3 style={{ fontWeight: 'bold' }}>
                    {saleIncomeObjectiveStatisticChartUnfinished}个
                  </h3>
                </h3>
              </Col>
            </Row>
          </ChartCard>
          <ChartCard
            chartNo="SALE_INCOME_OBJECTIVE_DEPT_CHART"
            chartHeight={200}
            queryParam={{ extVarchar3: type1Key, extVarchar4: type2Key }}
          />
          <Row>
            <Col span={12}>
              <ChartCard title={saleIncomeObjectiveScoreDistributionChartName} type="CUSTOM">
                <div style={{ marginLeft: '10px' }}>
                  <h2 style={{ margin: '0px', lineHeight: '48px', float: 'left' }}>整体评分: </h2>
                  <h1 style={{ width: '70px', float: 'left', margin: 0 }}>
                    {saleIncomeObjectiveScoreSumChartScore}{' '}
                  </h1>
                </div>
                <Chart
                  height={150}
                  data={saleIncomeObjectiveScoreDistributionChart.data}
                  scale={{
                    proportion: {
                      formatter: val => {
                        // eslint-disable-next-line no-param-reassign
                        val = val * 100 + '%';
                        return val;
                      },
                    },
                  }}
                  padding={[20, 100, 20, 60]}
                  forceFit
                >
                  <Coord transpose />
                  {/* <Axis name="proportion" /> */}
                  <Axis name="范围" />
                  <BizTooltip showTitle={false} />
                  <Legend position="right-center" />
                  <Geom
                    type="interval"
                    position="范围*占比"
                    tooltip={[
                      '范围*占比',
                      (keyField, proportion) => {
                        // eslint-disable-next-line no-param-reassign
                        proportion += '%';
                        return {
                          name: keyField,
                          value: proportion,
                        };
                      },
                    ]}
                  >
                    <Label content="占比" />
                  </Geom>
                </Chart>
              </ChartCard>
            </Col>
            <Col span={12}>
              <ChartCard
                chartNo="SALE_INCOME_OBJECTIVE_PS_DISTRIBUTION"
                chartHeight={200}
                queryParam={{ extVarchar3: type1Key, extVarchar4: type2Key }}
              />
            </Col>
          </Row>
        </>
      );
    });

    return (
      <Card
        tabList={tabList}
        activeTabKey={type2Key}
        onTabChange={key => {
          this.tab2Change(key);
        }}
      >
        {content[type2Key]}
      </Card>
    );
  };

  updateModelState = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: params,
    });
  };

  render() {
    const { loading, sumSaleChart, sumExpenseChart, objectiveCat1Data } = this.props;

    const { expenseNo, chinaGeo } = this.state;

    // 地图组件处理
    if (!chinaGeo) {
      return '数据加载中...';
    }

    // 累计总销售额信息
    const sumSaleChartName = sumSaleChart.chartTitle || '累计总销售额';
    let sumSaleChartTotal = 0; // 销售总额
    let sumSaleChartYear = 0; // 同比
    let sumSaleChartMonth = 0; // 环比
    if (sumSaleChart.data && sumSaleChart.data[0]) {
      sumSaleChartTotal = sumSaleChart.data[0]['累计总销售额'];
      sumSaleChartYear = sumSaleChart.data[0]['同比'];
      sumSaleChartMonth = sumSaleChart.data[0]['环比'];
    }

    // 累计总费用支出信息
    const sumExpenseChartName = sumExpenseChart.chartTitle || '累计总费用支出';
    let sumExpenseChartTotal = 0; // 销售总额
    let sumExpenseChartYear = 0; // 同比
    let sumExpenseChartMonth = 0; // 环比
    if (sumExpenseChart.data && sumExpenseChart.data[0]) {
      sumExpenseChartTotal = sumExpenseChart.data[0]['累计总费用支出'];
      sumExpenseChartYear = sumExpenseChart.data[0]['同比'];
      sumExpenseChartMonth = sumExpenseChart.data[0]['环比'];
    }

    return (
      <GridContent>
        <Row gutter={12}>
          <Col xl={5} lg={5} md={5} sm={5} xs={5}>
            <ChartCard type="CUSTOM" title={sumSaleChartName}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', margin: '14px 0' }}>
                {numeral(sumSaleChartTotal).format('0,0')}{' '}
                <span style={{ fontSize: '22px', fontWeight: 'normal' }}>元</span>
              </div>
              <HighLight value={sumSaleChartYear} style={{ marginRight: '50px' }} />
              <HighLight value={sumSaleChartMonth} />
            </ChartCard>
          </Col>
          <Col xl={5} lg={5} md={5} sm={5} xs={5}>
            <ChartCard type="CUSTOM" title={sumExpenseChartName}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', margin: '14px 0' }}>
                {numeral(sumExpenseChartTotal).format('0,0')}{' '}
                <span style={{ fontSize: '22px', fontWeight: 'normal' }}>元</span>
              </div>
              <HighLight value={sumExpenseChartYear} style={{ marginRight: '50px' }} />
              <HighLight value={sumExpenseChartMonth} />
            </ChartCard>
          </Col>
          <Col xl={14} lg={14} md={14} sm={14} xs={14}>
            <ChartCard
              chartNo="ALL_OBJECTIVE_PROGRESS_MONTH_CHART"
              chartHeight={100}
              type="LINE_CHART"
              title={sumExpenseChartName}
              keyField="月份"
              valueField="进度"
            />
          </Col>
        </Row>

        <Row gutter={12}>
          {/* OKR类别 */}
          <Col xl={12} lg={12} md={12} sm={12} xs={12}>
            <Card>
              <Tabs defaultActiveKey="SALE" onChange={activeKey => this.tabChange(activeKey)}>
                {objectiveCat1Data.map(data => (
                  <Tabs.TabPane tab={data.name} key={data.code} forceRender>
                    {this.renderType()}
                  </Tabs.TabPane>
                ))}
                {/* <Tabs.TabPane tab="销售业绩" key="SALE" forceRender>
              {this.renderType()}
            </Tabs.TabPane>
            <Tabs.TabPane tab="财务数据" key="FINANCE" forceRender>
              {this.renderType()}
            </Tabs.TabPane>
            <Tabs.TabPane tab="人资数据" key="HR" forceRender>
              {this.renderType()}
            </Tabs.TabPane>
            <Tabs.TabPane tab="库存数据" key="STOCK" forceRender>
              {this.renderType()}
            </Tabs.TabPane>
            <Tabs.TabPane tab="产能数据" key="CAPACITY" forceRender>
              {this.renderType()}
            </Tabs.TabPane> */}
              </Tabs>
            </Card>
          </Col>
          <Col xl={12} lg={12} md={12} sm={12} xs={12}>
            <Card>
              {/* 销售数据部分 */}
              <ChartCard
                chartNo="SALE_MAP"
                chartHeight={500}
                chartBefore={
                  <Row style={{ width: '70%', margin: '2px auto' }}>
                    <Col span={6}>
                      <Icon type="bar-chart" /> &nbsp;按区域
                    </Col>
                    <Col span={3}>
                      <Divider type="vertical" />
                    </Col>
                    <Col span={6}>
                      <Icon type="appstore" /> &nbsp;按产业
                    </Col>
                    <Col span={3}>
                      <Divider type="vertical" />
                    </Col>
                    <Col span={6}>
                      <Icon type="deployment-unit" /> &nbsp;按公司
                    </Col>
                  </Row>
                }
              />
              <ChartCard
                chartNo={expenseNo}
                chartHeight={300}
                chartBefore={
                  <Button
                    htmlType="button"
                    style={{ backgroundColor: 'rgb(102,102,102)', color: 'white' }}
                    onClick={() => {
                      this.handExpenseSwitch();
                    }}
                  >
                    支出/收入
                  </Button>
                }
              />
            </Card>
          </Col>
        </Row>
      </GridContent>
    );
  }
}

export default BuCabin;
