import React, { PureComponent, Component } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { mapObjIndexed, isNil, isEmpty } from 'ramda';
import { Divider, Input, DatePicker, Icon, Popover, InputNumber, Card, Button } from 'antd';
import update from 'immutability-helper';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { createConfirm } from '@/components/core/Confirm';
import FieldList from '@/components/layout/FieldList';
import createMessage from '@/components/core/AlertMessage';
import EditableDataTable from '@/components/common/EditableDataTable';
import { genFakeId, mul, add } from '@/utils/mathUtils';
import { fromQs } from '@/utils/stringUtils';
import { Selection } from '@/pages/gen/field';
import { selectCapasetLevel, selectUsersWithBu } from '@/services/gen/list';
import { mountToTab } from '@/layouts/routerControl';
import { isNumber } from 'min-dash';

const { Field, FieldLine } = FieldList;

const DOMAIN = 'userResPlanning';

const applyColumns = [
  { dataIndex: 'code', title: '编号', span: 12 },
  { dataIndex: 'name', title: '名称', span: 12 },
];

// 动态列属性初始化
const columnTempl = {
  title: 'W',
  dataIndex: 'yearWeek_',
  align: 'center',
  width: 50,
  render: '',
};
// 动态列数组初始化
let extraCols = [];

const blankState = {
  selectedRowKeys: [],
  columnNum: 0, // 记录动态列的数量
  loadingStatus: false,
};

@connect(({ loading, userResPlanning, dispatch }) => ({
  loading,
  userResPlanning,
  dispatch,
}))
@mountToTab()
class Planning extends Component {
  constructor(props) {
    super(props);
    const { switchWeek } = props;
    switchWeek(this.changeDurationWeek);
    this.state = {
      ...blankState,
    };
  }

  componentDidMount() {
    const { dispatch, didMountFlag } = this.props;
    const { selectedRowKeys } = this.state;
    const param = fromQs();
    if (didMountFlag) {
      return;
    }

    dispatch({
      type: `${DOMAIN}/query`,
      payload: { objid: param.id, planType: param.planType },
    }).then(result => {
      // 初始化动态列
      const {
        userResPlanning: { formData },
      } = this.props;
      const temp = [];
      if (formData.durationWeek) {
        for (let index = 0; index < parseInt(formData.durationWeek, 10); index += 1) {
          const dataIndex = columnTempl.dataIndex + index;
          const styles = {
            cursor: 'pointer',
          };
          if (
            moment(formData.startDate)
              .add(index, 'weeks')
              .startOf('week')
              .format('YYYY-MM-DD') ===
            moment(new Date())
              .startOf('week')
              .format('YYYY-MM-DD')
          ) {
            styles.color = '#f5222d'; // 红色
          } else {
            styles.color = '#008FDB'; // 蓝色
          }
          temp.push({
            ...columnTempl,
            title: (
              <Popover
                content={`${moment(formData.startDate)
                  .add(index, 'weeks')
                  .format('YYYY-MM-DD')}~${moment(formData.startDate)
                  .add(index, 'weeks')
                  .add(6, 'days')
                  .format('YYYY-MM-DD')}`}
                trigger="hover"
              >
                <span style={styles}>
                  {index === 0 ? columnTempl.title : columnTempl.title + index}
                </span>
              </Popover>
            ),
            dataIndex: columnTempl.dataIndex + index,
            width: 50,
            // eslint-disable-next-line no-loop-func
            render: (v, row, i) => (
              <InputNumber
                style={{ width: '50px' }}
                value={row[dataIndex] ? row[dataIndex] : 0}
                size="small"
                min={0}
                onChange={this.onCellChanged(i, dataIndex)}
                onFocus={() => {
                  const { id } = row;
                  if (selectedRowKeys.indexOf(id) > -1) {
                    // return false;
                  } else {
                    this.setState({
                      selectedRowKeys: [id],
                    });
                  }
                }}
              />
            ),
          });
        }
      }
      extraCols = temp;
      dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { key: 'durationWeek', value: formData.durationWeek },
      });
      this.setState({
        columnNum: parseInt(formData.durationWeek, 10),
      });
    });
  }

  clearState = () => {
    this.setState(blankState);
  };

  // 行编辑触发事件
  onCellChanged = (rowIndex, rowField) => rowFieldValue => {
    const {
      userResPlanning: { dataSource, formData },
      dispatch,
    } = this.props;
    let totalEqva = 0;
    let totalDays = 0;
    let sum = 0;
    const newDataSource = dataSource;
    newDataSource[rowIndex] = {
      ...newDataSource[rowIndex],
      [rowField]:
        rowFieldValue && rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue,
    };

    // 如果修改的是w之类的
    if (rowField.includes('yearWeek_')) {
      const { distributeRate } = newDataSource[rowIndex];
      if (!isNil(formData.durationWeek)) {
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < Number(formData.durationWeek); i++) {
          if (
            isNil(newDataSource[rowIndex]['yearWeek_' + i]) ||
            !isNumber(newDataSource[rowIndex]['yearWeek_' + i])
          ) {
            sum += 0;
          } else {
            sum += Number(newDataSource[rowIndex]['yearWeek_' + i]);
          }
        }
        totalDays = sum;
        newDataSource[rowIndex].totalDays = totalDays;
      }
      if (!isNil(distributeRate) && isNumber(distributeRate)) {
        totalEqva = mul(distributeRate, sum).toFixed(2); // 总当量=系数*人天
      }
    } else if (
      rowField.includes('distributeRate') &&
      !isNil(rowFieldValue) &&
      isNumber(rowFieldValue)
    ) {
      // 如果改变的是系数   就要考虑总当量的问题
      totalEqva = mul(rowFieldValue, newDataSource[rowIndex].totalDays).toFixed(2);
    }
    newDataSource[rowIndex].totalEqva = totalEqva;

    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { dataSource: newDataSource },
    });
  };

  // 只能选周一
  disabledDate = current =>
    moment(current).format('YYYY-MM-DD') !==
    moment(current)
      .startOf('week')
      .format('YYYY-MM-DD');

  // 持续周数change事件
  changeDurationWeek = (bool, newDate, weeks) => {
    const {
      dispatch,
      userResPlanning: { formData },
    } = this.props;
    const { selectedRowKeys } = this.state;
    const value = weeks || formData.durationWeek;
    const temp = [];
    // 判断value值是否符合要求
    if (!/^([1-9][0-9]{0,1}|100)$/.test(value)) {
      return;
    }
    const startDate = newDate || formData.startDate;
    const render = date => {
      // 表格添加列
      formData.durationWeek = value;
      for (let index = 0; index < parseInt(value, 10); index += 1) {
        const dataIndex = columnTempl.dataIndex + index;
        const styles = {
          cursor: 'pointer',
        };
        if (
          moment(startDate)
            .add(index, 'weeks')
            .startOf('week')
            .format('YYYY-MM-DD') ===
          moment(new Date())
            .startOf('week')
            .format('YYYY-MM-DD')
        ) {
          styles.color = '#f5222d';
        } else {
          styles.color = '#008FDB';
        }
        temp.push({
          ...columnTempl,
          title: (
            <Popover
              content={`${moment(startDate)
                .add(index, 'weeks')
                .format('YYYY-MM-DD')}~${moment(startDate)
                .add(index, 'weeks')
                .add(6, 'days')
                .format('YYYY-MM-DD')}`}
              trigger="hover"
            >
              <span style={styles}>
                {index === 0 ? columnTempl.title : columnTempl.title + index}
              </span>
            </Popover>
          ),
          dataIndex: columnTempl.dataIndex + index,
          width: 50,
          render: (v, row, i) => (
            <Input
              value={row[dataIndex] ? row[dataIndex] : null}
              size="small"
              onChange={this.onCellChanged(i, dataIndex)}
              onFocus={() => {
                const { id } = row;
                if (selectedRowKeys.indexOf(id) > -1) {
                  // return false;
                } else {
                  this.setState({
                    selectedRowKeys: [id],
                  });
                }
              }}
            />
          ),
        });
      }
      extraCols = temp;
      dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { key: 'durationWeek', value },
      });
      this.setState({
        columnNum: parseInt(value, 10),
      });
    };

    bool
      ? createConfirm({
          content: '确定要把周数修改为' + value + '周吗?',
          onOk: () => {
            render();
          },
        })
      : render(startDate);
  };

  render() {
    const {
      dispatch,
      loading,
      userResPlanning: { dataSource, formData = {}, abilityList, selectSorceList, importStatus },
      form: { getFieldDecorator },
    } = this.props;
    const { selectedRowKeys, columnNum, loadingStatus } = this.state;
    // 获取url上的参数
    const param = fromQs();
    // 行编辑表格
    const editTableProps = {
      sortBy: 'id',
      rowKey: 'id',
      total: 0,
      dataSource,
      showCopy: false,
      showDelete: false,
      loading: loading.effects[`${DOMAIN}/query`],
      scroll: { x: 1000 + columnNum * 50 },
      rowSelection: {
        selectedRowKeys,
        onChange: (_selectedRowKeys, _selectedRows) => {
          this.setState({
            selectedRowKeys: _selectedRowKeys,
          });
        },
      },
      onAdd: newRow => {
        const rows = mapObjIndexed((value, key) => {
          if (key.includes('yearWeek')) return '0';
          return value;
        }, newRow);
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            dataSource: update(dataSource, {
              $push: [
                {
                  ...rows,
                  id: genFakeId(-1),
                },
              ],
            }),
          },
        });
      },
      columns: [
        {
          title: '角色',
          dataIndex: 'role',
          required: true,
          width: 100,
          fixed: true,
          render: (value, row, index) => (
            <Input
              value={value}
              onChange={this.onCellChanged(index, 'role')}
              onFocus={() => {
                const { id } = row;
                if (selectedRowKeys.indexOf(id) > -1) {
                  // return false;
                } else {
                  this.setState({
                    selectedRowKeys: [id],
                  });
                }
              }}
            />
          ),
        },
        {
          title: '资源',
          dataIndex: 'resId',
          width: 150,
          fixed: true,
          render: (value, row, index) => (
            <Selection.Columns
              value={isNil(value) || isEmpty(value) ? undefined : +value}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              columns={applyColumns}
              source={selectSorceList}
              placeholder="请选择资源"
              onChange={this.onCellChanged(index, 'resId')}
              dropdownMatchSelectWidth={false}
              showSearch
              onFocus={() => {
                const { id } = row;
                if (selectedRowKeys.indexOf(id) > -1) {
                  // return false;
                } else {
                  this.setState({
                    selectedRowKeys: [id],
                  });
                }
              }}
            />
          ),
        },
        {
          title: '复合能力（系数）',
          dataIndex: 'capasetLevelId',
          required: true,
          render: (value, row, index) => (
            <Selection
              value={value}
              source={abilityList}
              placeholder="请选择复合能力（系数）"
              onChange={this.onCellChanged(index, 'capasetLevelId')}
            />
          ),
        },
        {
          title: '系数',
          dataIndex: 'distributeRate',
          align: 'right',
          width: 70,
          render: (value, row, index) => (
            <InputNumber
              value={value || 0}
              size="small"
              min={0}
              precision={1}
              onChange={this.onCellChanged(index, 'distributeRate')}
              onFocus={() => {
                const { id } = row;
                if (selectedRowKeys.indexOf(id) > -1) {
                  // return false;
                } else {
                  this.setState({
                    selectedRowKeys: [id],
                  });
                }
              }}
            />
          ),
        },
        {
          title: '开始日期',
          dataIndex: 'startDate',
          width: 140,
          render: (value, row, index) => (
            <DatePicker
              value={value && moment(value)}
              size="small"
              onChange={this.onCellChanged(index, 'startDate')}
              onOpenChange={status => {
                const { id } = row;
                if (status) {
                  if (selectedRowKeys.indexOf(id) > -1) {
                    // return false;
                  } else {
                    this.setState({
                      selectedRowKeys: [id],
                    });
                  }
                }
              }}
            />
          ),
        },
        {
          title: '结束日期',
          dataIndex: 'endDate',
          width: 140,
          render: (value, row, index) => (
            <DatePicker
              value={value && moment(value)}
              size="small"
              onChange={this.onCellChanged(index, 'endDate')}
              onOpenChange={status => {
                const { id } = row;
                if (status) {
                  if (selectedRowKeys.indexOf(id) > -1) {
                    // return false;
                  } else {
                    this.setState({
                      selectedRowKeys: [id],
                    });
                  }
                }
              }}
            />
          ),
        },
        {
          title: '总人天',
          dataIndex: 'totalDays',
          align: 'right',
          width: 60,
          render: (value, row, index) =>
            !isNil(value) && !isEmpty(value) ? (+value).toFixed(2) : (0).toFixed(2),
        },
        {
          title: '总当量',
          dataIndex: 'totalEqva',
          align: 'right',
          width: 70,
          render: (value, row, index) =>
            !isNil(value) && !isEmpty(value) ? (+value).toFixed(2) : (0).toFixed(2),
        },
        ...extraCols,
      ],
      buttons: [
        {
          key: 'import',
          title: '导入项目成员',
          loading: loadingStatus,
          hidden: param.planType === '1',
          className: 'tw-btn-primary',
          disabled: false,
          minSelections: 0,
          cb: (_selectedRowKeys, selectedRows) => {
            createConfirm({
              content: '确定要导入项目成员吗?',
              onOk: () => {
                // 请求项目成员接口
                const { id } = fromQs();
                this.setState(
                  {
                    loadingStatus: true,
                  },
                  () => {
                    dispatch({
                      type: `${DOMAIN}/projectShList`,
                      payload: { sortBy: 'id', sortDirection: 'DESC', projId: id, limit: 0 },
                    }).then(({ ok }) => {
                      if (ok) {
                        this.setState({
                          loadingStatus: false,
                        });
                      }
                    });
                  }
                );
              },
            });
          },
        },

        {
          key: 'week',
          title: '一周五天',
          loading: false,
          hidden: false,
          className: 'tw-btn-primary',
          disabled: () => selectedRowKeys.length < 1,
          minSelections: 0,
          cb: (_selectedRowKeys, selectedRows) => {
            // 这里过滤数据
            let $selectedRowKeys = null;
            if (isEmpty(_selectedRowKeys)) {
              $selectedRowKeys = selectedRowKeys;
            } else {
              $selectedRowKeys = _selectedRowKeys;
            }

            const checkDatas = dataSource.filter(i => $selectedRowKeys.includes(i.id));
            const modifiedSelectedRows = checkDatas
              .map(row =>
                mapObjIndexed((value, key) => {
                  if (key.includes('yearWeek')) return '5';
                  return value;
                }, row)
              )
              .map(row => ({ [row.id]: row }))
              .reduce((prev, curr) => ({ ...prev, ...curr }), {});

            const newDataSource = dataSource.map((item, index) => {
              if ($selectedRowKeys.filter(key => `${key}` === `${item.id}`).length > 0)
                return modifiedSelectedRows[item.id];
              return item;
            });
            dispatch({
              type: `${DOMAIN}/updateState`,
              payload: {
                dataSource: newDataSource,
              },
            });
          },
        },
        {
          key: 'clearWeek',
          title: '清除天数',
          loading: false,
          hidden: false,
          className: 'tw-btn-primary',
          disabled: () => selectedRowKeys.length < 1,
          minSelections: 0,
          cb: (_selectedRowKeys, selectedRows) => {
            let $selectedRowKeys = null;
            if (isEmpty(_selectedRowKeys)) {
              $selectedRowKeys = selectedRowKeys;
            } else {
              $selectedRowKeys = _selectedRowKeys;
            }
            const checkDatas = dataSource.filter(i => $selectedRowKeys.includes(i.id));

            const modifiedSelectedRows = checkDatas
              .map(row =>
                mapObjIndexed((value, key) => {
                  if (key.includes('yearWeek')) return '0';
                  return value;
                }, row)
              )
              .map(row => ({ [row.id]: row }))
              .reduce((prev, curr) => ({ ...prev, ...curr }), {});

            const newDataSource = dataSource.map((item, index) => {
              if ($selectedRowKeys.filter(key => `${key}` === `${item.id}`).length > 0)
                return modifiedSelectedRows[item.id];
              return item;
            });

            dispatch({
              type: `${DOMAIN}/updateState`,
              payload: {
                dataSource: newDataSource,
              },
            });
          },
        },
        {
          key: 'upper',
          title: '上移',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 1,
          cb: (_selectedRowKeys, selectedRows) => {
            // 这里过滤数据
            let $selectedRowKeys = null;
            if (isEmpty(_selectedRowKeys)) {
              $selectedRowKeys = selectedRowKeys;
            } else {
              $selectedRowKeys = _selectedRowKeys;
            }
            let targetIndex = 0;

            dataSource.forEach((data, index) => {
              if (data.id === $selectedRowKeys[0]) {
                targetIndex = index;
              }
            });

            if (targetIndex > 0) {
              const obj = dataSource.splice(targetIndex, 1);
              dataSource.splice(targetIndex - 1, 0, obj[0]);

              dispatch({
                type: `${DOMAIN}/updateState`,
                payload: {
                  dataSource,
                },
              });
            }
          },
        },
        {
          key: 'lower',
          title: '下移',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 1,
          cb: (_selectedRowKeys, selectedRows) => {
            // 这里过滤数据
            let $selectedRowKeys = null;
            if (isEmpty(_selectedRowKeys)) {
              $selectedRowKeys = selectedRowKeys;
            } else {
              $selectedRowKeys = _selectedRowKeys;
            }
            let targetIndex = 0;

            dataSource.forEach((data, index) => {
              if (data.id === $selectedRowKeys[0]) {
                targetIndex = index;
              }
            });

            if (targetIndex !== dataSource.length - 1) {
              const obj = dataSource.splice(targetIndex, 1);
              dataSource.splice(targetIndex + 1, 0, obj[0]);
              dispatch({
                type: `${DOMAIN}/updateState`,
                payload: {
                  dataSource,
                },
              });
            }
          },
        },
        {
          key: 'deletes',
          title: '删除',
          loading: false,
          hidden: false,
          disabled: false,
          className: 'tw-btn-error',
          minSelections: 1,
          cb: (_selectedRowKeys, selectedRows) => {
            // 从模板带过来的不能删除,判读标识fromtmplFlag=1
            let $selectedRowKeys = null;
            let $selectedRows = null;
            if (isEmpty(_selectedRowKeys)) {
              $selectedRowKeys = selectedRowKeys;
              $selectedRows = dataSource.filter(item => item.id === selectedRowKeys[0]);
            } else {
              $selectedRowKeys = _selectedRowKeys;
              $selectedRows = selectedRows;
            }

            const isFromtmplFlag = $selectedRows.filter(
              row => row.id > 0 && row.fromtmplFlag === 1
            );
            if (isFromtmplFlag.length) {
              createMessage({ type: 'error', description: '从模板带过来的不允许删除' });
              return;
            }
            const newDataSource = dataSource.filter(
              row => !$selectedRowKeys.filter(keyValue => keyValue === row.id).length
            );
            dispatch({
              type: `${DOMAIN}/updateState`,
              payload: {
                dataSource: newDataSource.map((item, index) => ({ ...item })),
                deleteList: $selectedRowKeys,
              },
            });
            this.setState({
              selectedRowKeys: [],
            });
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper>
        <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
          <Field
            name="modifyUserIdName"
            label="创建人"
            decorator={{
              initialValue: formData.modifyUserIdName || '',
            }}
          >
            <Input disabled />
          </Field>
          <Field
            name="modifyTime"
            label="资源规划更新日"
            decorator={{
              initialValue: formData.modifyTime || '',
            }}
          >
            <Input disabled />
          </Field>

          <Field
            name="planTypeDesc"
            label="计划类型"
            decorator={{
              initialValue: formData.planTypeDesc || '', // 2表示计划类型为“项目”
            }}
          >
            <Input disabled />
          </Field>

          <Field
            name="objName"
            label="计划对象"
            decorator={{
              initialValue: formData.objName || '',
            }}
          >
            <Input disabled />
          </Field>

          <FieldLine label="开始周（W）" required>
            <Field
              name="startDate"
              decorator={{
                initialValue: (formData.startDate && moment(formData.startDate)) || '',
                rules: [
                  {
                    required: true,
                    message: '请输入开始周（W）',
                  },
                ],
              }}
              wrapperCol={{ span: 23, xxl: 23 }}
            >
              <DatePicker
                disabledDate={this.disabledDate}
                onChange={value => this.changeDurationWeek(false, value)}
              />
            </Field>
            <Field
              name="startWeek"
              decorator={{
                initialValue: formData.startWeek || '',
              }}
              wrapperCol={{ span: 23, xxl: 23 }}
            >
              <Input placeholder="周数" disabled />
            </Field>
          </FieldLine>
          <Field
            name="durationWeek"
            label="持续周数"
            decorator={{
              initialValue: formData.durationWeek || '',
              rules: [
                {
                  required: true,
                  message: '请输入持续周数',
                },
                {
                  pattern: /^([1-9][0-9]{0,1}|100)$/,
                  message: '持续周数可输入值1-100',
                },
              ],
            }}
          >
            <Input
              addonAfter={
                <a className="tw-link" onClick={() => this.changeDurationWeek(true)}>
                  <Icon type="plus-circle" style={{ color: 'red' }} />
                </a>
              }
            />
          </Field>
          <FieldLine label="结束周（W）" required>
            <Field
              name="endDate"
              decorator={{
                initialValue:
                  moment(formData.startDate).add(Number(formData.durationWeek || 0), 'weeks') || '',
                rules: [
                  {
                    required: true,
                    message: '请输入结束周（W）',
                  },
                ],
              }}
              wrapperCol={{ span: 23, xxl: 23 }}
            >
              <DatePicker disabled />
            </Field>
            <Field
              name="endWeek"
              decorator={{
                initialValue: String(
                  Number(formData.startWeek || 0) + Number(formData.durationWeek || 0)
                ),
              }}
              wrapperCol={{ span: 23, xxl: 23 }}
            >
              <Input placeholder="周数" disabled />
            </Field>
          </FieldLine>

          {param.planType !== '2' && [
            <Field
              name="salePhase"
              label="销售阶段"
              decorator={{
                initialValue: formData.salePhaseDesc || '',
              }}
            >
              <Input disabled />
            </Field>,
            <Field
              name="probability"
              label="成单概率(交付角度)"
              decorator={{
                initialValue: formData.probability || '',
                rules: [
                  {
                    required: false,
                    message: '请选择成单概率',
                  },
                ],
              }}
            >
              <Selection.UDC code="TSK.WIN_PROBABLITY" placeholder="请选择成单概率" />
            </Field>,
          ]}
          <Field
            name="planningStatus"
            label="资源规划状态"
            decorator={{
              initialValue: formData.planningStatus || '',
            }}
          >
            <Selection.UDC disabled code="TSK.PLANNING_STATUS" placeholder="请选择资源规划状态" />
          </Field>
          <Field
            name="remark"
            label="备注"
            decorator={{
              initialValue: formData.remark || '',
              rules: [{ required: false }],
            }}
            fieldCol={1}
            labelCol={{ span: 4, xxl: 3 }}
            wrapperCol={{ span: 19, xxl: 20 }}
          >
            <Input.TextArea placeholder="" rows={2} maxLength={400} />
          </Field>
        </FieldList>
        <Divider dashed />
        <EditableDataTable {...editTableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default Planning;
