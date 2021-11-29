import React, { PureComponent } from 'react';
import { Button, DatePicker, Card, Table, Checkbox } from 'antd';
import { connect } from 'dva';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';
import { formatDT } from '@/utils/tempUtils/DateTime';
import FieldList from '@/components/layout/FieldList';
import moment from 'moment';
import styles from './index.less';

const { Field } = FieldList;

const DOMAIN = 'vacation';

@connect(({ loading, vacation }) => ({
  vacation,
  loading: loading.effects[`${DOMAIN}/query`],
}))
class Vacation extends PureComponent {
  state = {
    isOpen: false,
  };

  componentDidMount() {
    this.loadData();
  }

  loadData = () => {
    const {
      dispatch,
      vacation: { datas, year },
    } = this.props;

    dispatch({
      type: `${DOMAIN}/query`,
      payload: { year },
    });
  };

  fetchData = () => {
    const {
      dispatch,
      vacation: { datas },
    } = this.props;

    const dataList = [
      { month: 1, workDays: 0, vacationDays: 0 },
      { month: 2, workDays: 0, vacationDays: 0 },
      { month: 3, workDays: 0, vacationDays: 0 },
      { month: 4, workDays: 0, vacationDays: 0 },
      { month: 5, workDays: 0, vacationDays: 0 },
      { month: 6, workDays: 0, vacationDays: 0 },
      { month: 7, workDays: 0, vacationDays: 0 },
      { month: 8, workDays: 0, vacationDays: 0 },
      { month: 9, workDays: 0, vacationDays: 0 },
      { month: 10, workDays: 0, vacationDays: 0 },
      { month: 11, workDays: 0, vacationDays: 0 },
      { month: 12, workDays: 0, vacationDays: 0 },
    ];
    for (let i = 0; i < datas.length; i += 1) {
      const tempObj = datas[i];
      const dateString = Object.keys(tempObj)[0];

      const tempMoment = moment(dateString);
      const month = tempMoment.get('month');
      const workHour = tempObj[dateString];
      dataList[month][tempMoment.get('date')] = workHour;
      if (workHour === 8) {
        dataList[month].workDays += 1;
      } else {
        dataList[month].vacationDays += 1;
      }
    }
    return dataList;
  };

  handleSave = () => {
    const {
      dispatch,
      vacation: { datas, year },
    } = this.props;
    dispatch({
      type: `${DOMAIN}/save`,
      // payload: {"year": year.get('y')},
    });
  };

  checkBoxChange = e => {
    const {
      dispatch,
      vacation: { datas },
    } = this.props;
    // 修改dva的year状态
    dispatch({
      type: `${DOMAIN}/updateHours`,
      payload: { hours: e.target.checked === true ? 0 : 8, date: e.target.date },
    });
  };

  wrapColumns = () => {
    const {
      vacation: { year },
    } = this.props;
    const columnWidth = 50;
    const columns = [];
    for (let i = 1; i < 32; i += 1) {
      const column = {};
      column.title = i + '';
      column.dataIndex = i + '';
      column.width = columnWidth;
      // column.render = () => {
      //   return (value, row, index) => {
      //     if(value){
      //
      //       year.month(index);
      //       year.date(i);
      //       debugger
      //       if(year.week()===6||year.week()===7){
      //         return (<Checkbox
      //           className={styles['vacation-weekend']}
      //         />)
      //       }
      //       return (<Checkbox
      //       />)
      //     }
      //
      //   }
      // }
      column.render = (value, row, index) => {
        if (value !== undefined) {
          year.month(index);
          year.date(column.title);
          if (year.get('d') === 6 || year.get('d') === 0) {
            return (
              <Checkbox
                className="vacation-weekend"
                checked={value === 0}
                onChange={this.checkBoxChange}
                date={formatDT(year)}
              />
            );
          }
          return (
            <Checkbox checked={value === 0} onChange={this.checkBoxChange} date={formatDT(year)} />
          );
        }
        return null;
      };
      columns.push(column);
    }
    return columns;
  };

  render() {
    const { isOpen } = this.state;
    const { loading, vacation, dispatch } = this.props;
    const { year, notConfigFlag } = vacation;
    const months = [
      '1月',
      '2月',
      '3月',
      '4月',
      '5月',
      '6月',
      '7月',
      '8月',
      '9月',
      '10月',
      '11月',
      '12月',
    ];

    const columns = [
      {
        title: '假期设置',
        dataIndex: 'fake',
        render: (value, row, index) => <span style={{ fontWeight: 'bold' }}>{months[index]}</span>,
      },
    ];
    columns.push(...this.wrapColumns());
    columns.push(
      ...[
        {
          title: '工作日',
          dataIndex: 'workDays',
          render: (value, row, index) => <span>{value}</span>,
        },
        {
          title: '假日',
          dataIndex: 'vacationDays',
          render: (value, row, index) => <span>{value}</span>,
        },
      ]
    );

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            type="primary"
            icon="save"
            size="large"
            disabled={false}
            onClick={this.handleSave}
          >
            {formatMessage({ id: `misc.save`, desc: '保存' })}
          </Button>
        </Card>

        <Card className="tw-card-rightLine">
          <Field
            name="year"
            label={formatMessage({ id: 'sys.baseinfo.vocation.year', desc: '年份' })}
            fieldCol="4"
          >
            <DatePicker
              placeholder="请输入年份"
              mode="year"
              format="YYYY"
              value={year}
              open={isOpen}
              onFocus={() => {
                this.setState({ isOpen: true });
              }}
              onBlur={() => {
                this.setState({ isOpen: false });
              }}
              onPanelChange={v => {
                this.setState({
                  isOpen: false,
                });
                // 修改dva的year状态
                dispatch({
                  type: `${DOMAIN}/updateYear`,
                  payload: { year: v },
                });
                dispatch({
                  type: `${DOMAIN}/query`,
                  payload: { year: v },
                });
              }}
            />
          </Field>
          <span className={styles['danger-tip']}>
            {notConfigFlag === 1 ? '该年度未设置假期' : '红色方框为周末,打勾为假期'}
          </span>
        </Card>

        <Card className="tw-card-rightLine">
          <Table
            columns={columns}
            dataSource={this.fetchData()}
            bordered
            size="small"
            loading={loading}
            pagination={false}
            rowClassName={(record, index) =>
              index % 2 === 0 ? styles['vacation-odd-row'] : styles['vacation-even-row']
            }
          >
            123
          </Table>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default Vacation;
