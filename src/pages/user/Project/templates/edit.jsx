import React, { PureComponent } from 'react';
import {
  Button,
  Card,
  Input,
  Select,
  Form,
  InputNumber,
  Tooltip,
  Checkbox,
  Switch,
  Icon,
  Popover,
} from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { isEmpty, isNil, mapObjIndexed } from 'ramda';
import { mountToTab, closeThenGoto, markAsTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';
import FieldList from '@/components/layout/FieldList';
import EditableDataTable from '@/components/common/EditableDataTable';
import Title from '@/components/layout/Title';
import Link from 'umi/link';
import router from 'umi/router';
import { Selection, DatePicker, UdcSelect } from '@/pages/gen/field';
import { genFakeId } from '@/utils/mathUtils';
import moment from 'moment';
import { formatDT } from '@/utils/tempUtils/DateTime';
import update from 'immutability-helper';
import { createConfirm } from '@/components/core/Confirm';
import classnames from 'classnames';

const { Option } = Select;
const { Field, FieldLine } = FieldList;

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

const DOMAIN = 'businessTmplEdit';

@connect(({ loading, businessTmplEdit, dispatch, user, businessTmplList }) => ({
  loading: loading.effects[`${DOMAIN}/query`] || loading.effects[`${DOMAIN}/save`],
  businessTmplEdit,
  dispatch,
  user,
  businessTmplList,
}))
@Form.create({
  onValuesChange(props, changedValues, allValues) {
    if (isEmpty(changedValues)) return;
    props.dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: changedValues,
    });
  },
})
@mountToTab()
class BusinessTmplEdit extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      ...blankState,
    };
  }

  componentDidMount() {
    const param = fromQs();
    const {
      dispatch,
      user: {
        user: {
          extInfo: { resId },
        },
      },
    } = this.props;
    // 先更新以下数据
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        formData: {},
        dataSource: [],
      },
    });
    dispatch({ type: `${DOMAIN}/fetchSelectCapasetLevel` });
    dispatch({ type: `${DOMAIN}/fetchSourceSelectList` });
    if (param.id) {
      // 编辑模式   创建人由formData带过来
      this.fetchData(param);
    } else {
      // 新增模式  创建人回填
      this.clearExtraCols();
      dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: {
          createResId: resId,
        },
      });
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/clearForm`,
    });
  }

  fetchData = params => {
    const { selectedRowKeys } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: { id: params.id },
    }).then(res => {
      const {
        businessTmplEdit: { formData },
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
            moment(new Date(0))
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
              <Input
                value={row[dataIndex] ? row[dataIndex] : 0}
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
  };

  clearExtraCols = () => {
    extraCols = [];
  };

  // 行编辑触发事件
  onCellChanged = (rowIndex, rowField) => rowFieldValue => {
    const {
      businessTmplEdit: { dataSource },
      dispatch,
    } = this.props;

    const newDataSource = dataSource;
    newDataSource[rowIndex] = {
      ...newDataSource[rowIndex],
      [rowField]:
        rowFieldValue && rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue,
    };
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
  changeDurationWeek = (bool, newDate) => {
    const {
      dispatch,
      businessTmplEdit: { formData },
    } = this.props;
    const { selectedRowKeys } = this.state;
    const value = formData.durationWeek;
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
              value={row[dataIndex] ? row[dataIndex] : 0}
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

  handleSave = () => {
    const {
      dispatch,
      form: { validateFieldsAndScroll },
      businessTmplEdit: { formData, dataSource },
      businessTmplList: { searchForm },
    } = this.props;
    // 获取url上的参数
    const param = fromQs();
    const { operationkey } = this.state;
    // 校验明细项

    const roleError = dataSource.filter(v => isNil(v.role) || isEmpty(v.role));
    const capasetLevelIdError = dataSource.filter(
      v => isNil(v.capasetLevelId) || isEmpty(v.capasetLevelId)
    );
    // 浮点数校验
    const re = /^[0-9]+.?[0-9]*$/;
    const distributeRateNotNumError = dataSource.filter(
      v => v.distributeRate && !re.test(v.distributeRate)
    );
    if (roleError.length) {
      createMessage({ type: 'error', description: `请填写角色` });
      return;
    }
    if (capasetLevelIdError.length) {
      createMessage({ type: 'error', description: `请填写复合能力（系数）` });
      return;
    }
    if (distributeRateNotNumError.length) {
      createMessage({ type: 'error', description: `派发系数为浮点数` });
      return;
    }
    // 校验创建周不为空
    const notSatisfyList = dataSource.filter(item => {
      const filteredItem = Object.keys(item)
        .filter(key => key.includes('yearWeek'))
        .filter(key => isNil(item[key]) || isEmpty(item[key]));
      return !isEmpty(filteredItem);
    });
    if (!isEmpty(notSatisfyList)) {
      createMessage({ type: 'error', description: `请将必填信息和创建的周数填写完整！` });
      return;
    }
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/save`,
          payload: { id: param.id },
        }).then(res => {
          if (res.ok) {
            createMessage({ type: 'success', description: '保存成功' });
            closeThenGoto('/user/Project/templates?_refresh=0');
            dispatch({
              type: `businessTmplList/query`,
              payload: { ...searchForm, personalFlag: true },
            });
          } else {
            createMessage({ type: 'success', description: '保存失败' });
          }
        });
      }
    });
  };

  render() {
    const {
      loading,
      dispatch,
      businessTmplEdit: { dataSource, formData, abilityList, selectSorceList, deleteKeys },
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
      user: {
        user: { extInfo = {} }, // 取当前登录人的resId
      },
    } = this.props;

    const param = fromQs();
    const { selectedRowKeys, columnNum, loadingStatus } = this.state;
    const editTableProps = {
      sortBy: 'id',
      rowKey: 'id',
      total: 0,
      dataSource,
      showCopy: true,
      showDelete: true,
      loading,
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
      onCopyItem: copied => {
        const newDataSource = update(dataSource, {
          $push: copied.map(item => ({
            ...item,
            id: genFakeId(-1),
          })),
        });
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            dataSource: newDataSource,
          },
        });
      },
      onDeleteItems: (_selectedRowKeys, selectedRows) => {
        const newDataSource = dataSource.filter(row => _selectedRowKeys.indexOf(row.id) < 0);
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            dataSource: newDataSource,
            deleteKeys: [...deleteKeys, ..._selectedRowKeys],
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
      buttons: [],
    };

    return (
      <PageHeaderWrapper title="商机模板编辑">
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            type="primary"
            icon="save"
            size="large"
            loading={loading}
            onClick={this.handleSave}
          >
            保存
          </Button>
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
          title={<Title icon="profile" id="sys.system.basicInfo" defaultMessage="基本信息" />}
          bordered={false}
          className="tw-card-adjust"
        >
          <FieldList getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="tmplName"
              label="名称"
              decorator={{
                initialValue: formData.tmplName || '',
                rules: [{ required: true, message: '请输入名称' }],
              }}
            >
              <Input placeholder="请输入名称" />
            </Field>
            <Field
              name="createResName"
              label="创建人"
              decorator={{
                initialValue: formData.createResName || (extInfo && extInfo.resId),
              }}
            >
              <Select disabled>
                <Option value={extInfo.resId}>{extInfo.resName}</Option>
              </Select>
            </Field>
            <Field
              name="permissionType"
              label="权限类型"
              decorator={{
                initialValue: formData.permissionType,
                rules: [{ required: true, message: '请选择权限类型' }],
              }}
            >
              <UdcSelect code="TSK:TASK_TMPL_PERMISSION_TYPE" placeholder="权限类型" />
            </Field>
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
          </FieldList>
        </Card>
        <br />
        <Card title="任务活动" bordered={false} className="tw-card-adjust">
          <EditableDataTable {...editTableProps} />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default BusinessTmplEdit;
