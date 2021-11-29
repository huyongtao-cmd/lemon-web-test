import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { isNil, isEmpty } from 'ramda';
import { Button, Card, Form, Divider, Tooltip } from 'antd';
import { mountToTab, closeThenGoto, markAsTab } from '@/layouts/routerControl';
import classnames from 'classnames';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';
import moment from 'moment';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';
import DescriptionList from '@/components/layout/DescriptionList';
import DataTable from '@/components/common/DataTable';

const { Description } = DescriptionList;

const DOMAIN = 'myWeeklyReport';

@connect(({ loading, myWeeklyReport, user, dispatch }) => ({
  loading,
  myWeeklyReport,
  user,
  dispatch,
}))
@Form.create({
  onValuesChange(props, changedValues) {
    const { vacationYear } = changedValues;
    if (vacationYear) {
      // eslint-disable-next-line no-param-reassign
      changedValues.vacationYear = String(vacationYear);
    }
    if (!isEmpty(changedValues)) {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: changedValues,
      });
    }
  },
})
@mountToTab()
class weeklyReportView extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;

    dispatch({ type: `${DOMAIN}/cleanView` }).then(res => {
      const { id } = fromQs();
      id &&
        dispatch({
          type: `${DOMAIN}/queryDetail`,
          payload: {
            id,
          },
        });
    });
  }

  // 行编辑触发事件
  onThisWeekCellChanged = (index, value, name) => {
    const {
      myWeeklyReport: { thisWeekList },
      dispatch,
    } = this.props;

    const newDataSource = thisWeekList;
    newDataSource[index] = {
      ...newDataSource[index],
      [name]: value,
    };
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { thisWeekList: newDataSource },
    });
  };

  handleSubmit = saveOrReport => {
    const {
      form: { validateFieldsAndScroll },
      myWeeklyReport: {
        formData: { reportedResId },
      },
      dispatch,
    } = this.props;

    validateFieldsAndScroll((error, values) => {
      if (saveOrReport === 'save') {
        dispatch({
          type: `${DOMAIN}/submit`,
          payload: {
            saveType: 'save',
          },
        });
      } else {
        if (isNil(reportedResId) || isEmpty(reportedResId)) {
          createMessage({ type: 'warn', description: '汇报对象不能为空' });
          return;
        }
        dispatch({
          type: `${DOMAIN}/submit`,
          payload: {
            saveType: 'report',
          },
        });
      }
    });
  };

  render() {
    const {
      loading,
      myWeeklyReport: { formData, thisWeek, thisWeekList, nextWeek, nextWeekList },
    } = this.props;

    const weeklyTableProps = {
      sortBy: 'id',
      rowKey: 'id',
      loading: loading.effects[`${DOMAIN}/query`],
      showSearch: false,
      showExport: false,
      showColumn: false,
      enableSelection: false,
      pagination: false,
      scroll: { x: 1800 },
      dataSource: thisWeekList,
      title: () => (
        <span>
          <span>
            期间：
            {thisWeek.period}
          </span>
          <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
          <span>
            年周：
            {thisWeek.yearWeek}
          </span>
        </span>
      ),
      columns: [
        // {
        //   title: '工作计划',
        //   dataIndex: 'planNo',
        //   hidden: true,
        //   align: 'center',
        //   width: 150,
        //   fixed: 'left',
        //   render: (value, row, index) => {
        //     if (index % 2 === 1) {
        //       return {
        //         children: '',
        //         props: {
        //           rowSpan: 0,
        //         },
        //       };
        //     }
        //     return {
        //       children: value,
        //       props: {
        //         rowSpan: 2,
        //       },
        //     };
        //   },
        // },
        {
          title: '任务', // 初始化 填写
          dataIndex: 'taskName',
          width: 200,
          fixed: 'left',
          render: (value, row, index) => {
            if (index % 2 === 1) {
              return {
                props: {
                  rowSpan: 0,
                },
              };
            }
            return {
              children: value,
              // value && value.length > 10 ? (
              //   <Tooltip placement="left" title={<pre>{value}</pre>}>
              //     <span>{`${value.substr(0, 10)}...`}</span>
              //   </Tooltip>
              // ) : (
              //   <span>{value}</span>
              // ),
              props: {
                rowSpan: 2,
              },
            };
          },
        },

        {
          title: '执行状态',
          dataIndex: 'actStatusName',
          width: 100,
          required: true,
          render: (value, row, index) => {
            if (index % 2 === 1) {
              return {
                props: {
                  colSpan: 0,
                },
              };
            }
            return {
              children: value,
              props: {
                rowSpan: 2,
              },
            };
          },
        },
        {
          title: `周一(${moment(formData.thisWeekStartDate)
            .add(0, 'days')
            .format('MM-DD')})`,
          width: 150,
          children: [
            {
              title: '上',
              dataIndex: 'planFlag11',
              align: 'center',
              render: (value, row, index) => {
                if (index % 2 === 1) {
                  return {
                    children:
                      row.workDesc1 && row.workDesc1.length > 5 ? (
                        <Tooltip placement="left" title={<pre>{row.workDesc1}</pre>}>
                          <span>{`${row.workDesc1.substr(0, 5)}...`}</span>
                        </Tooltip>
                      ) : (
                        <span>
                          {/* 为了防止表格变形，没有值时输出占位 */}
                          {row.workDesc1 || (
                            <span
                              style={{
                                width: 10,
                                height: 10,
                                display: 'inline-block',
                                borderRadius: '50%',
                                backgroundColor: 'transparent',
                              }}
                            />
                          )}
                        </span>
                      ),
                    props: {
                      colSpan: 3,
                    },
                  };
                }
                return value === 1 ? (
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      display: 'inline-block',
                      borderRadius: '50%',
                      backgroundColor: 'black',
                    }}
                  />
                ) : (
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      display: 'inline-block',
                      borderRadius: '50%',
                      backgroundColor: 'transparent',
                    }}
                  />
                );
              },
            },
            {
              title: '下',
              dataIndex: 'planFlag12',
              align: 'center',
              render: (value, row, index) => {
                if (index % 2 === 1) {
                  return {
                    props: {
                      colSpan: 0,
                    },
                  };
                }
                return value === 1 ? (
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      display: 'inline-block',
                      borderRadius: '50%',
                      backgroundColor: 'black',
                    }}
                  />
                ) : (
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      display: 'inline-block',
                      borderRadius: '50%',
                      backgroundColor: 'transparent',
                    }}
                  />
                );
              },
            },
            {
              title: '晚',
              dataIndex: 'planFlag13',
              align: 'center',
              render: (value, row, index) => {
                if (index % 2 === 1) {
                  return {
                    props: {
                      colSpan: 0,
                    },
                  };
                }
                return value === 1 ? (
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      display: 'inline-block',
                      borderRadius: '50%',
                      backgroundColor: 'black',
                    }}
                  />
                ) : (
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      display: 'inline-block',
                      borderRadius: '50%',
                      backgroundColor: 'transparent',
                    }}
                  />
                );
              },
            },
          ],
        },
        {
          title: `周二(${moment(formData.thisWeekStartDate)
            .add(1, 'days')
            .format('MM-DD')})`,
          width: 150,
          children: [
            {
              title: '上',
              dataIndex: 'planFlag21',
              align: 'center',
              render: (value, row, index) => {
                if (index % 2 === 1) {
                  return {
                    children:
                      row.workDesc2 && row.workDesc2.length > 5 ? (
                        <Tooltip placement="left" title={<pre>{row.workDesc2}</pre>}>
                          <span>{`${row.workDesc2.substr(0, 5)}...`}</span>
                        </Tooltip>
                      ) : (
                        <span>{row.workDesc2}</span>
                      ),
                    props: {
                      colSpan: 3,
                    },
                  };
                }
                return value === 1 ? (
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      display: 'inline-block',
                      borderRadius: '50%',
                      backgroundColor: 'black',
                    }}
                  />
                ) : (
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      display: 'inline-block',
                      borderRadius: '50%',
                      backgroundColor: 'transparent',
                    }}
                  />
                );
              },
            },
            {
              title: '下',
              dataIndex: 'planFlag22',
              align: 'center',
              render: (value, row, index) => {
                if (index % 2 === 1) {
                  return {
                    props: {
                      colSpan: 0,
                    },
                  };
                }
                return value === 1 ? (
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      display: 'inline-block',
                      borderRadius: '50%',
                      backgroundColor: 'black',
                    }}
                  />
                ) : (
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      display: 'inline-block',
                      borderRadius: '50%',
                      backgroundColor: 'transparent',
                    }}
                  />
                );
              },
            },
            {
              title: '晚',
              dataIndex: 'planFlag23',
              align: 'center',
              render: (value, row, index) => {
                if (index % 2 === 1) {
                  return {
                    props: {
                      colSpan: 0,
                    },
                  };
                }
                return value === 1 ? (
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      display: 'inline-block',
                      borderRadius: '50%',
                      backgroundColor: 'black',
                    }}
                  />
                ) : (
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      display: 'inline-block',
                      borderRadius: '50%',
                      backgroundColor: 'transparent',
                    }}
                  />
                );
              },
            },
          ],
        },
        {
          title: `周三(${moment(formData.thisWeekStartDate)
            .add(2, 'days')
            .format('MM-DD')})`,
          width: 150,
          children: [
            {
              title: '上',
              dataIndex: 'planFlag31',
              align: 'center',
              render: (value, row, index) => {
                if (index % 2 === 1) {
                  return {
                    children:
                      row.workDesc3 && row.workDesc3.length > 5 ? (
                        <Tooltip placement="left" title={<pre>{row.workDesc3}</pre>}>
                          <span>{`${row.workDesc3.substr(0, 5)}...`}</span>
                        </Tooltip>
                      ) : (
                        <span>{row.workDesc3}</span>
                      ),
                    props: {
                      colSpan: 3,
                    },
                  };
                }
                return value === 1 ? (
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      display: 'inline-block',
                      borderRadius: '50%',
                      backgroundColor: 'black',
                    }}
                  />
                ) : (
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      display: 'inline-block',
                      borderRadius: '50%',
                      backgroundColor: 'transparent',
                    }}
                  />
                );
              },
            },
            {
              title: '下',
              dataIndex: 'planFlag32',
              align: 'center',
              render: (value, row, index) => {
                if (index % 2 === 1) {
                  return {
                    props: {
                      colSpan: 0,
                    },
                  };
                }
                return value === 1 ? (
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      display: 'inline-block',
                      borderRadius: '50%',
                      backgroundColor: 'black',
                    }}
                  />
                ) : (
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      display: 'inline-block',
                      borderRadius: '50%',
                      backgroundColor: 'transparent',
                    }}
                  />
                );
              },
            },
            {
              title: '晚',
              dataIndex: 'planFlag33',
              align: 'center',
              render: (value, row, index) => {
                if (index % 2 === 1) {
                  return {
                    props: {
                      colSpan: 0,
                    },
                  };
                }
                return value === 1 ? (
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      display: 'inline-block',
                      borderRadius: '50%',
                      backgroundColor: 'black',
                    }}
                  />
                ) : (
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      display: 'inline-block',
                      borderRadius: '50%',
                      backgroundColor: 'transparent',
                    }}
                  />
                );
              },
            },
          ],
        },
        {
          title: `周四(${moment(formData.thisWeekStartDate)
            .add(3, 'days')
            .format('MM-DD')})`,
          width: 150,
          children: [
            {
              title: '上',
              dataIndex: 'planFlag41',
              align: 'center',
              render: (value, row, index) => {
                if (index % 2 === 1) {
                  return {
                    children:
                      row.workDesc4 && row.workDesc4.length > 5 ? (
                        <Tooltip placement="left" title={<pre>{row.workDesc4}</pre>}>
                          <span>{`${row.workDesc4.substr(0, 5)}...`}</span>
                        </Tooltip>
                      ) : (
                        <span>{row.workDesc4}</span>
                      ),
                    props: {
                      colSpan: 3,
                    },
                  };
                }
                return value === 1 ? (
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      display: 'inline-block',
                      borderRadius: '50%',
                      backgroundColor: 'black',
                    }}
                  />
                ) : (
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      display: 'inline-block',
                      borderRadius: '50%',
                      backgroundColor: 'transparent',
                    }}
                  />
                );
              },
            },
            {
              title: '下',
              dataIndex: 'planFlag42',
              align: 'center',
              render: (value, row, index) => {
                if (index % 2 === 1) {
                  return {
                    props: {
                      colSpan: 0,
                    },
                  };
                }
                return value === 1 ? (
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      display: 'inline-block',
                      borderRadius: '50%',
                      backgroundColor: 'black',
                    }}
                  />
                ) : (
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      display: 'inline-block',
                      borderRadius: '50%',
                      backgroundColor: 'transparent',
                    }}
                  />
                );
              },
            },
            {
              title: '晚',
              dataIndex: 'planFlag43',
              align: 'center',
              render: (value, row, index) => {
                if (index % 2 === 1) {
                  return {
                    props: {
                      colSpan: 0,
                    },
                  };
                }
                return value === 1 ? (
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      display: 'inline-block',
                      borderRadius: '50%',
                      backgroundColor: 'black',
                    }}
                  />
                ) : (
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      display: 'inline-block',
                      borderRadius: '50%',
                      backgroundColor: 'transparent',
                    }}
                  />
                );
              },
            },
          ],
        },
        {
          title: `周五(${moment(formData.thisWeekStartDate)
            .add(4, 'days')
            .format('MM-DD')})`,
          width: 150,
          children: [
            {
              title: '上',
              dataIndex: 'planFlag51',
              align: 'center',
              render: (value, row, index) => {
                if (index % 2 === 1) {
                  return {
                    children:
                      row.workDesc5 && row.workDesc5.length > 5 ? (
                        <Tooltip placement="left" title={<pre>{row.workDesc5}</pre>}>
                          <span>{`${row.workDesc5.substr(0, 5)}...`}</span>
                        </Tooltip>
                      ) : (
                        <span>{row.workDesc5}</span>
                      ),
                    props: {
                      colSpan: 3,
                    },
                  };
                }
                return value === 1 ? (
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      display: 'inline-block',
                      borderRadius: '50%',
                      backgroundColor: 'black',
                    }}
                  />
                ) : (
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      display: 'inline-block',
                      borderRadius: '50%',
                      backgroundColor: 'transparent',
                    }}
                  />
                );
              },
            },
            {
              title: '下',
              dataIndex: 'planFlag52',
              align: 'center',
              render: (value, row, index) => {
                if (index % 2 === 1) {
                  return {
                    props: {
                      colSpan: 0,
                    },
                  };
                }
                return value === 1 ? (
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      display: 'inline-block',
                      borderRadius: '50%',
                      backgroundColor: 'black',
                    }}
                  />
                ) : (
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      display: 'inline-block',
                      borderRadius: '50%',
                      backgroundColor: 'transparent',
                    }}
                  />
                );
              },
            },
            {
              title: '晚',
              dataIndex: 'planFlag53',
              align: 'center',
              render: (value, row, index) => {
                if (index % 2 === 1) {
                  return {
                    props: {
                      colSpan: 0,
                    },
                  };
                }
                return value === 1 ? (
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      display: 'inline-block',
                      borderRadius: '50%',
                      backgroundColor: 'black',
                    }}
                  />
                ) : (
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      display: 'inline-block',
                      borderRadius: '50%',
                      backgroundColor: 'transparent',
                    }}
                  />
                );
              },
            },
          ],
        },
        {
          title: `周六(${moment(formData.thisWeekStartDate)
            .add(5, 'days')
            .format('MM-DD')})`,
          dataIndex: 'planFlag6',
          width: 150,
          align: 'center',
          render: (value, row, index) => {
            if (index % 2 === 1) {
              return row.workDesc6 && row.workDesc6.length > 5 ? (
                <Tooltip placement="left" title={<pre>{row.workDesc6}</pre>}>
                  <span>{`${row.workDesc6.substr(0, 5)}...`}</span>
                </Tooltip>
              ) : (
                <span>{row.workDesc6}</span>
              );
            }
            return value === 1 ? (
              <span
                style={{
                  width: 10,
                  height: 10,
                  display: 'inline-block',
                  borderRadius: '50%',
                  backgroundColor: 'black',
                }}
              />
            ) : (
              <span
                style={{
                  width: 10,
                  height: 10,
                  display: 'inline-block',
                  borderRadius: '50%',
                  backgroundColor: 'transparent',
                }}
              />
            );
          },
        },
        {
          title: `周日(${moment(formData.thisWeekStartDate)
            .add(6, 'days')
            .format('MM-DD')})`,
          dataIndex: 'planFlag7',
          width: 150,
          align: 'center',
          render: (value, row, index) => {
            if (index % 2 === 1) {
              return row.workDesc7 && row.workDesc7.length > 5 ? (
                <Tooltip placement="left" title={<pre>{row.workDesc7}</pre>}>
                  <span>{`${row.workDesc7.substr(0, 5)}...`}</span>
                </Tooltip>
              ) : (
                <span>{row.workDesc7}</span>
              );
            }
            return value === 1 ? (
              <span
                style={{
                  width: 10,
                  height: 10,
                  display: 'inline-block',
                  borderRadius: '50%',
                  backgroundColor: 'black',
                }}
              />
            ) : (
              <span
                style={{
                  width: 10,
                  height: 10,
                  display: 'inline-block',
                  borderRadius: '50%',
                  backgroundColor: 'transparent',
                }}
              />
            );
          },
        },
        {
          title: '相关任务包',
          dataIndex: 'taskIdName',
          width: 200,
          render: (value, row, index) => {
            if (index % 2 === 1) {
              return {
                props: {
                  rowSpan: 0,
                },
              };
            }
            return {
              children: value,
              props: {
                rowSpan: 2,
              },
            };
          },
        },
        {
          title: '相关活动',
          dataIndex: 'activityIdName',
          width: 200,
          render: (value, row, index) => {
            if (index % 2 === 1) {
              return {
                props: {
                  colSpan: 0,
                },
              };
            }
            return {
              children: value,
              props: {
                rowSpan: 2,
              },
            };
          },
        },
      ],
    };

    const weekPlanTableProps = {
      sortBy: 'id',
      rowKey: 'id',
      loading: false,
      showSearch: false,
      showExport: false,
      showColumn: false,
      enableSelection: false,
      pagination: false,
      scroll: { x: 1750 },
      dataSource: nextWeekList,
      title: () => (
        <span>
          <span>
            期间：
            {nextWeek.period}
          </span>
          <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
          <span>
            年周：
            {nextWeek.yearWeek}
          </span>
        </span>
      ),
      columns: [
        {
          title: '任务', // 初始化 填写
          dataIndex: 'taskName',
          width: 200,
          fixed: 'left',
          render: (value, row, key) => value,
          // value && value.length > 10 ? (
          //   <Tooltip placement="left" title={<pre>{value}</pre>}>
          //     <span>{`${value.substr(0, 10)}...`}</span>
          //   </Tooltip>
          // ) : (
          //   <span>{value}</span>
          // ),
        },
        {
          title: '工作计划',
          dataIndex: 'planNo',
          align: 'center',
          width: 150,
          fixed: 'left',
        },
        {
          title: `周一(${moment(formData.nextWeekStartDate)
            .add(0, 'days')
            .format('MM-DD')})`,
          width: 150,
          children: [
            {
              title: '上',
              dataIndex: 'planFlag11',
              align: 'center',
              render: (value, row, index) =>
                value === 1 ? (
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      display: 'inline-block',
                      borderRadius: '50%',
                      backgroundColor: 'black',
                    }}
                  />
                ) : (
                  ''
                ),
            },
            {
              title: '下',
              dataIndex: 'planFlag12',
              align: 'center',
              render: (value, row, index) =>
                value === 1 ? (
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      display: 'inline-block',
                      borderRadius: '50%',
                      backgroundColor: 'black',
                    }}
                  />
                ) : (
                  ''
                ),
            },
            {
              title: '晚',
              dataIndex: 'planFlag13',
              align: 'center',
              render: (value, row, index) =>
                value === 1 ? (
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      display: 'inline-block',
                      borderRadius: '50%',
                      backgroundColor: 'black',
                    }}
                  />
                ) : (
                  ''
                ),
            },
          ],
        },
        {
          title: `周二(${moment(formData.nextWeekStartDate)
            .add(1, 'days')
            .format('MM-DD')})`,
          width: 150,
          children: [
            {
              title: '上',
              dataIndex: 'planFlag21',
              align: 'center',
              render: (value, row, index) =>
                value === 1 ? (
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      display: 'inline-block',
                      borderRadius: '50%',
                      backgroundColor: 'black',
                    }}
                  />
                ) : (
                  ''
                ),
            },
            {
              title: '下',
              dataIndex: 'planFlag22',
              align: 'center',
              render: (value, row, index) =>
                value === 1 ? (
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      display: 'inline-block',
                      borderRadius: '50%',
                      backgroundColor: 'black',
                    }}
                  />
                ) : (
                  ''
                ),
            },
            {
              title: '晚',
              dataIndex: 'planFlag23',
              align: 'center',
              render: (value, row, index) =>
                value === 1 ? (
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      display: 'inline-block',
                      borderRadius: '50%',
                      backgroundColor: 'black',
                    }}
                  />
                ) : (
                  ''
                ),
            },
          ],
        },
        {
          title: `周三(${moment(formData.nextWeekStartDate)
            .add(2, 'days')
            .format('MM-DD')})`,
          width: 150,
          children: [
            {
              title: '上',
              dataIndex: 'planFlag31',
              align: 'center',
              render: (value, row, index) =>
                value === 1 ? (
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      display: 'inline-block',
                      borderRadius: '50%',
                      backgroundColor: 'black',
                    }}
                  />
                ) : (
                  ''
                ),
            },
            {
              title: '下',
              dataIndex: 'planFlag32',
              align: 'center',
              render: (value, row, index) =>
                value === 1 ? (
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      display: 'inline-block',
                      borderRadius: '50%',
                      backgroundColor: 'black',
                    }}
                  />
                ) : (
                  ''
                ),
            },
            {
              title: '晚',
              dataIndex: 'planFlag33',
              align: 'center',
              render: (value, row, index) =>
                value === 1 ? (
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      display: 'inline-block',
                      borderRadius: '50%',
                      backgroundColor: 'black',
                    }}
                  />
                ) : (
                  ''
                ),
            },
          ],
        },
        {
          title: `周四(${moment(formData.nextWeekStartDate)
            .add(3, 'days')
            .format('MM-DD')})`,
          width: 150,
          children: [
            {
              title: '上',
              dataIndex: 'planFlag41',
              align: 'center',
              render: (value, row, index) =>
                value === 1 ? (
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      display: 'inline-block',
                      borderRadius: '50%',
                      backgroundColor: 'black',
                    }}
                  />
                ) : (
                  ''
                ),
            },
            {
              title: '下',
              dataIndex: 'planFlag42',
              align: 'center',
              render: (value, row, index) =>
                value === 1 ? (
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      display: 'inline-block',
                      borderRadius: '50%',
                      backgroundColor: 'black',
                    }}
                  />
                ) : (
                  ''
                ),
            },
            {
              title: '晚',
              dataIndex: 'planFlag43',
              align: 'center',
              render: (value, row, index) =>
                value === 1 ? (
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      display: 'inline-block',
                      borderRadius: '50%',
                      backgroundColor: 'black',
                    }}
                  />
                ) : (
                  ''
                ),
            },
          ],
        },
        {
          title: `周五(${moment(formData.nextWeekStartDate)
            .add(4, 'days')
            .format('MM-DD')})`,
          width: 150,
          children: [
            {
              title: '上',
              dataIndex: 'planFlag51',
              align: 'center',
              render: (value, row, index) =>
                value === 1 ? (
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      display: 'inline-block',
                      borderRadius: '50%',
                      backgroundColor: 'black',
                    }}
                  />
                ) : (
                  ''
                ),
            },
            {
              title: '下',
              dataIndex: 'planFlag52',
              align: 'center',
              render: (value, row, index) =>
                value === 1 ? (
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      display: 'inline-block',
                      borderRadius: '50%',
                      backgroundColor: 'black',
                    }}
                  />
                ) : (
                  ''
                ),
            },
            {
              title: '晚',
              dataIndex: 'planFlag53',
              align: 'center',
              render: (value, row, index) =>
                value === 1 ? (
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      display: 'inline-block',
                      borderRadius: '50%',
                      backgroundColor: 'black',
                    }}
                  />
                ) : (
                  ''
                ),
            },
          ],
        },
        {
          title: `周六(${moment(formData.nextWeekStartDate)
            .add(5, 'days')
            .format('MM-DD')})`,
          dataIndex: 'planFlag6',
          width: 100,
          align: 'center',
          render: (value, row, index) =>
            value === 1 ? (
              <span
                style={{
                  width: 10,
                  height: 10,
                  display: 'inline-block',
                  borderRadius: '50%',
                  backgroundColor: 'black',
                }}
              />
            ) : (
              ''
            ),
        },
        {
          title: `周日(${moment(formData.nextWeekStartDate)
            .add(6, 'days')
            .format('MM-DD')})`,
          dataIndex: 'planFlag7',
          width: 100,
          align: 'center',
          render: (value, row, index) =>
            value === 1 ? (
              <span
                style={{
                  width: 10,
                  height: 10,
                  display: 'inline-block',
                  borderRadius: '50%',
                  backgroundColor: 'black',
                }}
              />
            ) : (
              ''
            ),
        },
        {
          title: '相关任务包',
          dataIndex: 'taskIdName',
          width: 200,
        },
        {
          title: '相关活动',
          dataIndex: 'activityIdName',
          width: 200,
        },
      ],
    };
    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => {
              const { from } = fromQs();
              closeThenGoto(markAsTab(from));
            }}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>

        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={<Title icon="profile" text="周报详情" />}
          bordered={false}
        >
          <DescriptionList size="large" col={2}>
            <Description term="周报开始日(周一)">{formData.thisWeekStartDate || ''}</Description>
            <Description term="填报人">{formData.reportResName || ''}</Description>
            <Description term="汇报对象">{formData.reportedResName || ''}</Description>
            <Description term="汇报时间">{formData.reportDate || ''}</Description>
          </DescriptionList>
          <Divider dashed />
          <DescriptionList title="周报" size="large" col={1} noReactive>
            <DataTable {...weeklyTableProps} />
          </DescriptionList>
          <Divider dashed />
          <DescriptionList title="周计划" size="large" col={1} noReactive>
            <DataTable {...weekPlanTableProps} />
          </DescriptionList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default weeklyReportView;
