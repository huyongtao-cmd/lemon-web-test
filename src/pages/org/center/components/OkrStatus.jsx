import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Table, Modal, Divider, Progress, Icon } from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import targetSvg from '@/assets/img/target.svg';
import keySvg from '@/assets/img/key.svg';
import styles from './okrStatus.less';

@connect(({ orgCenterOkrStatus, loading }) => ({
  orgCenterOkrStatus,
  loading,
}))
@mountToTab()
class OkrStatus extends PureComponent {
  state = {
    modalTitle: '',
    okrVisiable: false,
    krVisiable: false,
    krVal: {},
    okrParams: {},
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: 'orgCenterOkrStatus/queryStateStatis' });
  }

  okrModalShow = (title, id, krStatusValue, updPeriodValue) => {
    const { dispatch } = this.props;
    const params = {
      id,
      krStatusValue,
      updPeriodValue,
    };
    dispatch({
      type: 'orgCenterOkrStatus/queryOkrList',
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
      dataSource = [],
      orgCenterOkrStatus: { okrList, okrListTotal },
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
      loading: false,
      dataSource,
      pagination: false,
      bordered: true,
      columns: [
        {
          title: 'KR状态',
          dataIndex: 'krStatus',
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
                    this.okrModalShow(title, periodId, krStatusValue, updPeriodValue);
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
      loading: loading.effects[`orgCenterOkrStatus/queryStateStatis`],
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
      <div>
        <Table {...stateStatisTableProps} />
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
              type: 'orgCenter/updateState',
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
      </div>
    );
  }
}

export default OkrStatus;
