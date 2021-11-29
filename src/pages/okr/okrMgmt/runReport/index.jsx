import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {
  Form,
  Card,
  Divider,
  Row,
  Col,
  Table,
  Spin,
  Popover,
  Button,
  Modal,
  Progress,
  Icon,
} from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import FieldList from '@/components/layout/FieldList';
import Title from '@/components/layout/Title';
import { Selection } from '@/pages/gen/field';
import { fromQs } from '@/utils/stringUtils';
import { isEmpty } from 'ramda';
import styles from './index.less';
import targetSvg from '../targetEval/img/target.svg';
import keySvg from '../targetEval/img/key.svg';

import CyclicChart from './CyclicChart';

const { Field } = FieldList;

const DOMAIN = 'runReport';

@connect(({ loading, runReport, dispatch }) => ({
  runReport,
  dispatch,
  loading,
}))
@Form.create({
  onValuesChange(props, changedValues) {
    if (!isEmpty(changedValues)) {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: changedValues,
      });
      props.dispatch({ type: `${DOMAIN}/queryStateStatis` });
      props.dispatch({ type: `${DOMAIN}/queryUpdateStatis` });
    }
  },
})
@mountToTab()
class RunReport extends PureComponent {
  state = {
    modalTitle: '',
    okrVisiable: false,
    krVisiable: false,
    krVal: {},
    okrParams: {},
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const { _refresh } = fromQs();
    !(_refresh === '0') &&
      dispatch({ type: `${DOMAIN}/clean` }).then(res => {
        dispatch({ type: `${DOMAIN}/queryImplementList` }).then(respone => {
          dispatch({ type: `${DOMAIN}/queryStateStatis` });
          dispatch({ type: `${DOMAIN}/queryUpdateStatis` });
        });
      });
  }

  okrModalShow = (title, qType, id, krStatusValue, updPeriodValue) => {
    const { dispatch } = this.props;
    const params = {
      qType,
      id,
      krStatusValue,
      updPeriodValue,
    };
    dispatch({
      type: `${DOMAIN}/queryOkrList`,
      payload: {
        ...params,
        offset: 0,
      },
    });
    this.setState({
      modalTitle: title,
      okrVisiable: true,
      okrParams: params,
    });
  };

  fetchData = (offset, okrParams) => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/queryOkrList`,
      payload: {
        ...okrParams,
        offset,
      },
    });
  };

  krModalShow = val => {
    this.setState({
      krVisiable: true,
      krVal: val || {},
    });
  };

  okrRow = (val, krBtn = false) => {
    const {
      objectiveName,
      fathobjectiveName,
      fathobjectiveCurProg,
      objectiveResName,
      objectiveTypeName,
      objectiveUpdatedate,
      objectiveCurProg,
      endDate,
    } = val;
    return (
      <div>
        <div className={styles.okrTitle}>
          <img src={targetSvg} alt="目标" />
          {objectiveName}
        </div>
        <div className={styles.okrTitleSmall}>
          <Icon type="home" />
          父目标 <p>{fathobjectiveName}</p>
          <span>{fathobjectiveCurProg}%</span>
        </div>
        <div className={styles.okrContent}>
          <Icon type="user" />
          {objectiveResName}
          <span>
            目标类型:&nbsp;
            {objectiveTypeName}
            &nbsp;&nbsp;截止时间:&nbsp;
            {endDate}
            &nbsp;&nbsp; 更新时间:&nbsp;
            {objectiveUpdatedate}
          </span>
        </div>
        <div className={styles.okrProgressWrap}>
          整体进度
          <div className={styles.progressWrap}>
            <Progress
              strokeColor="#22d7bb"
              percent={objectiveCurProg || 0}
              status="active"
              // format={percent => (percent ? percent.toFixed(2) + '%' : 0)}
            />
          </div>
          {krBtn && (
            <span
              className={styles.link}
              style={{ marginLeft: '40px' }}
              onClick={() => {
                this.krModalShow(val);
              }}
            >
              关键结果
            </span>
          )}
        </div>
      </div>
    );
  };

  render() {
    const {
      loading,
      dispatch,
      form: { getFieldDecorator, setFieldsValue },
      runReport: {
        implementList,
        formData,
        stateStatisList,
        updateStatisList,
        okrList,
        okrListTotal,
      },
    } = this.props;
    const {
      modalTitle,
      okrVisiable = false,
      krVisiable = false,
      krVal = {},
      okrParams = {},
    } = this.state;
    const { resultViews = [] } = krVal;

    const stateStatisTableProps = {
      sortBy: 'id',
      rowKey: 'id',
      sortDirection: 'DESC',
      loading: loading.effects[`${DOMAIN}/queryStateStatis`],
      dataSource: stateStatisList,
      pagination: false,
      columns: [
        {
          title: 'KR状态',
          dataIndex: 'item',
          align: 'center',
          render: (value, row, index) => {
            let val = value;
            const title = `目标状态统计——${value}`;
            const { periodId, krStatusValue, updPeriodValue } = row;
            if (row.ratio) {
              val = (
                <span
                  className={styles.link}
                  onClick={() => {
                    this.okrModalShow(title, 'okrStatus', periodId, krStatusValue, updPeriodValue);
                  }}
                >
                  {value}
                </span>
              );
            }
            return val;
          },
        },
        {
          title: '目标数',
          dataIndex: 'count',
          align: 'center',
        },
        {
          title: '占比',
          dataIndex: 'ratio',
          align: 'center',
          render: (value, row, index) => `${value.toFixed(2)}%`,
        },
      ],
    };

    const updateStatisTableProps = {
      sortBy: 'id',
      rowKey: 'id',
      sortDirection: 'DESC',
      loading: loading.effects[`${DOMAIN}/queryUpdateStatis`],
      dataSource: updateStatisList,
      pagination: false,
      columns: [
        {
          title: '更新时间',
          dataIndex: 'updPeriod',
          align: 'center',
          render: (value, row, index) => {
            let val = value;
            const title = `目标更新统计——${value}`;
            const { periodId, krStatusValue, updPeriodValue } = row;
            if (row.ratio) {
              val = (
                <span
                  className={styles.link}
                  onClick={() => {
                    this.okrModalShow(title, 'okrUpdate', periodId, krStatusValue, updPeriodValue);
                  }}
                >
                  {value}
                </span>
              );
            }
            return val;
          },
        },
        {
          title: '目标数',
          dataIndex: 'count',
          align: 'center',
        },
        {
          title: '占比',
          dataIndex: 'ratio',
          align: 'center',
          render: (value, row, index) => `${value.toFixed(2)}%`,
        },
      ],
    };

    const okrTableProps = {
      loading: loading.effects[`${DOMAIN}/queryOkrList`],
      dataSource: okrList,
      showHeader: false,
      pagination: {
        pageSize: 10,
        total: okrListTotal,
        showTotal: () => `共 ${okrListTotal} 条`,
        showSizeChanger: true,
        showQuickJumper: true,
      },
      onChange: filters => {
        const { current = 1 } = filters;
        this.fetchData((current - 1) * 10, okrParams);
      },

      columns: [
        {
          title: 'okr详情',
          dataIndex: 'id',
          render: (value, row, index) => this.okrRow(row, true),
        },
      ],
    };

    return (
      <PageHeaderWrapper title="运营报告">
        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={<Title icon="profile" text="运营报告" />}
          bordered={false}
        >
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="periodId"
              label="目标周期"
              decorator={{
                initialValue: formData.periodId || undefined,
              }}
            >
              <Selection
                className="x-fill-100"
                source={implementList}
                transfer={{ key: 'id', code: 'id', name: 'periodName' }}
                dropdownMatchSelectWidth={false}
                showSearch
                onValueChange={e => {}}
                placeholder="请选择目标周期"
              />
            </Field>
            <Field
              name="objectiveType"
              label="目标类型"
              decorator={{
                initialValue: formData.objectiveType || undefined,
              }}
            >
              <Selection.UDC code="OKR:OBJ_TYPE" placeholder="请选择目标类型" />
            </Field>
          </FieldList>
          <Divider dashed />
          <FieldList
            layout="horizontal"
            legend="目标状态统计"
            getFieldDecorator={getFieldDecorator}
            col={1}
          />
          <Spin
            spinning={loading.effects[`${DOMAIN}/queryStateStatis`]}
            style={{ backgroundColor: 'white' }}
          >
            <Card bordered={false} bodyStyle={{ padding: '10px 0px 0px 5px' }}>
              <Row gutter={16}>
                <Col lg={12} md={24}>
                  <Table {...stateStatisTableProps} />
                </Col>
                <Col lg={12} md={24}>
                  <CyclicChart data={stateStatisList} />
                </Col>
              </Row>
            </Card>
          </Spin>

          <br />
          <Divider dashed />
          <FieldList
            layout="horizontal"
            legend="目标更新统计"
            getFieldDecorator={getFieldDecorator}
            col={1}
          />
          <Spin
            spinning={loading.effects[`${DOMAIN}/queryUpdateStatis`]}
            style={{ backgroundColor: 'white' }}
          >
            <Card bordered={false} bodyStyle={{ padding: '10px 0px 0px 5px' }}>
              <Row gutter={16}>
                <Col lg={12} md={24}>
                  <Table {...updateStatisTableProps} />
                </Col>
                <Col lg={12} md={24}>
                  <CyclicChart data={updateStatisList.map(v => ({ ...v, item: v.updPeriod }))} />
                </Col>
              </Row>
            </Card>
          </Spin>
        </Card>
        <Modal
          width="800px"
          destroyOnClose
          closable
          title={modalTitle}
          visible={okrVisiable}
          onCancel={() => {
            this.setState({
              okrVisiable: false,
              okrParams: {},
            });
            dispatch({
              type: `${DOMAIN}/updateState`,
              payload: {
                okrList: [],
                okrListTotal: 0,
              },
            });
          }}
          footer={null}
        >
          <Table {...okrTableProps} />
        </Modal>
        <Modal
          width="800px"
          destroyOnClose
          closable
          title="关键结果"
          visible={krVisiable}
          onCancel={() => {
            this.setState({
              krVisiable: false,
              krVal: {},
            });
          }}
          footer={null}
        >
          <div className={styles.krWrap}>
            {this.okrRow(krVal)}
            <Divider dashed />
            <div className={styles.krTitle}>
              <img src={keySvg} alt="关键结果" /> 关键结果
            </div>
            {resultViews &&
              resultViews.map(item => (
                <div className={styles.krContent} key={item.id}>
                  <div>{item.keyresultName}</div>
                  <Progress
                    strokeColor="#22d7bb"
                    percent={item.curProg || 0}
                    status="active"
                    // format={percent => (percent ? percent.toFixed(2) + '%' : 0)}
                  />
                </div>
              ))}
          </div>
        </Modal>
      </PageHeaderWrapper>
    );
  }
}

export default RunReport;
