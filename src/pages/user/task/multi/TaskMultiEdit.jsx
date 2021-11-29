// 最常用的引入,基本每个页面都需要的组件
import React, { PureComponent } from 'react';
import { Button, Card, Input, Select, Form, InputNumber, Tooltip, Checkbox, Switch } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { isEmpty, isNil } from 'ramda';

// 比较常用的本框架的组件
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
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

import SelectWithCols from '@/components/common/SelectWithCols';
import AsyncSelect from '@/components/common/AsyncSelect';
import { selectUsersWithBu } from '@/services/gen/list';

const { Option } = Select;
const { Field, FieldLine } = FieldList;

const SEL_COL = [
  // span为宽度。 合计不要超过24
  { dataIndex: 'code', title: '编号', span: 10 },
  { dataIndex: 'name', title: '名称', span: 14 },
];

const DOMAIN = 'taskMultiEdit';

@connect(({ loading, taskMultiEdit, dispatch, user }) => ({
  loading: loading.effects[`${DOMAIN}/query`] || loading.effects[`${DOMAIN}/save`],
  ...taskMultiEdit,
  dispatch,
  user,
}))
@Form.create({
  onValuesChange(props, changedValues, allValues) {
    if (isEmpty(changedValues)) return;
    const name = Object.keys(changedValues)[0];
    const value = changedValues[name];
    const newFieldData = { [name]: value };
    switch (name) {
      default:
        break;
      // 事由号带出名称
      case 'reasonId':
        Object.assign(newFieldData, {
          reasonId: value ? value.id : null,
          reasonNo: value ? value.code : null,
          reasonName: value ? value.name : '',
          expenseBuId: value ? value.expenseBuId : null,
          expenseBuName: value ? value.expenseBuName : null,
        });
        break;
      // 事由类型清空事由号
      case 'reasonType':
        Object.assign(newFieldData, {
          reasonId: null,
          reasonNo: null,
          reasonName: null,
          expenseBuId: null,
          expenseBuName: null,
        });
        break;
    }
    props.dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: newFieldData,
    });
  },
})
@mountToTab()
class TaskMultiEdit extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const param = fromQs();
    if (param.id) {
      // 编辑模式
      this.fetchData(param);
    } else {
      // 新增模式
    }

    // 项目列表
    dispatch({
      type: `${DOMAIN}/queryProjList`,
    });
    // BU列表
    dispatch({
      type: `${DOMAIN}/queryBuList`,
    });
    // 售前列表
    dispatch({
      type: `${DOMAIN}/queryPreSaleList`,
    });
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/clearForm`,
    });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: { id: params.id },
    });
  };

  // 行编辑触发事件
  onCellChanged = (rowIndex, rowField) => rowFieldValue => {
    const { dataSource, dispatch } = this.props;

    let value = rowFieldValue;

    // input框赋值转换
    value = value && value.target ? value.target.value : value;

    const newDataSource = update(dataSource, {
      [rowIndex]: {
        [rowField]: {
          $set: value,
        },
      },
    });
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { dataSource: newDataSource },
    });
  };

  // checkbox触发事件
  onCellCheckBoxChanged = (rowIndex, rowField) => rowFieldValue => {
    const { dataSource, dispatch } = this.props;
    const val = rowFieldValue.target.checked ? 1 : 0;

    const newDataSource = update(dataSource, {
      [rowIndex]: {
        [rowField]: {
          $set: val,
        },
      },
    });

    dispatch({ type: `${DOMAIN}/updateState`, payload: { dataSource: newDataSource } });
  };

  // 工种 -> 工种子类
  handleChangeJobType1 = value => {
    const { dispatch, form, formData } = this.props;
    const { expenseBuId, receiverBuId, receiverResId, settlePriceFlag, buSettlePrice } = formData;
    const params = {
      jobType1: value,
      expenseBuId,
      receiverBuId,
      receiverResId,
      settlePriceFlag,
      buSettlePrice,
      reasonType: formData.reasonType,
      reasonId: formData.reasonId,
    };
    dispatch({
      type: `${DOMAIN}/queryTaskSettleByCondition`,
      payload: params,
    });
    dispatch({
      type: `${DOMAIN}/updateJobType2`,
      payload: value,
    }).then(() => {
      form.setFieldsValue({
        jobType2: null,
        capasetLeveldId: null,
      });
    });
  };

  handleChangeJobType2 = value => {
    const { dispatch, form, formData } = this.props;
    dispatch({
      type: `${DOMAIN}/updateCapasetLeveldList`,
      payload: {
        jobType1: formData.jobType1,
        jobType2: value,
      },
    }).then(() => {
      form.setFieldsValue({
        capasetLeveldId: null,
      });
    });
  };

  // 选择事由号
  handleChangeReasonId = value => {
    const { dispatch, form, formData } = this.props;
    if (value && formData.reasonType === '01') {
      dispatch({
        type: `${DOMAIN}/queryActList`,
        payload: value.id,
      });
    }
    form.setFieldsValue({
      expenseBuName: value ? value.expenseBuName : null,
    });
  };

  handleSave = () => {
    const { form, dispatch, formData, dataSource, deleteKeys } = this.props;

    const unLegalRows = dataSource.filter(
      data => isEmpty(data.taskName) || isNil(data.receiverResId)
    );
    if (!isEmpty(unLegalRows)) {
      createMessage({ type: 'warn', description: '行编辑未通过，请检查输入项。' });
      return;
    }
    const dtlEntities = dataSource;
    form.validateFields((error, values) => {
      if (error) {
        return;
      }
      const formValues = values;
      delete formValues.reasonId;
      dispatch({
        type: `${DOMAIN}/save`,
        payload: {
          entity: {
            ...formData,
            ...formValues,
          },
          dtlEntities,
          deleteKeys,
        },
      });
    });
  };

  render() {
    const {
      loading,
      dataSource,
      formData,
      deleteKeys,
      buSource,
      buList,
      taskProjSource,
      taskProjList,
      preSaleSource,
      preSaleList,
      jobType2List,
      capasetLeveldList,
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
      user: {
        user: { extInfo = {} }, // 取当前登录人的resId
      },
      dispatch,
    } = this.props;

    const editTableProps = {
      sortBy: 'id',
      rowKey: 'id',
      total: 0,
      dataSource,
      showCopy: true,
      onAdd: newRow => {
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            dataSource: update(dataSource, {
              $push: [
                {
                  ...newRow,
                  id: genFakeId(-1),
                },
              ],
            }),
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
      columns: [
        {
          title: '任务名称',
          dataIndex: 'taskName',
          required: true,
          align: 'center',
          width: 100,
          options: {
            rules: [
              {
                required: true,
                message: '请输入任务名称!',
              },
            ],
          },
          render: (value, row, index) => (
            <Input
              defaultValue={value}
              size="small"
              onChange={this.onCellChanged(index, 'taskName')}
            />
          ),
        },
        {
          title: '任务备注',
          dataIndex: 'taskContent',
          width: 300,
          render: (value, row, index) => (
            <Input
              defaultValue={value}
              size="small"
              onChange={this.onCellChanged(index, 'taskContent')}
            />
          ),
        },
        {
          title: '负责人',
          dataIndex: 'receiverResId',
          required: true,
          align: 'right',
          width: 50,
          options: {
            rules: [
              {
                required: true,
                message: '请输入负责人!',
              },
            ],
          },
          render: (value, row, index) => (
            <Selection.Columns
              className="x-fill-100"
              source={() => selectUsersWithBu({})}
              columns={SEL_COL}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              dropdownStyle={{ width: 440 }}
              showSearch
              onChange={this.onCellChanged(index, 'receiverResId')}
            />
          ),
        },
        {
          title: '预计开始日期',
          dataIndex: 'planStartDate',
          required: false,
          align: 'center',
          width: 50,
          render: (value, row, index) => (
            <DatePicker
              format="YYYY-MM-DD"
              value={value}
              onChange={this.onCellChanged(index, 'planStartDate')}
            />
          ),
        },
        {
          title: '预计结束日期',
          dataIndex: 'planEndDate',
          required: false,
          align: 'center',
          width: 50,
          render: (value, row, index) => (
            <DatePicker
              format="YYYY-MM-DD"
              value={value}
              onChange={this.onCellChanged(index, 'planEndDate')}
            />
          ),
        },
        {
          title: '关联实际任务',
          dataIndex: 'taskId',
          required: false,
          align: 'center',
          width: 50,
          render: (value, row, index) =>
            value ? (
              <Link className="tw-link" to={`/user/task/view?id=${value}`}>
                查看任务
              </Link>
            ) : (
              ''
            ),
        },
      ],
      buttons: [],
    };

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            type="primary"
            icon="save"
            size="large"
            loading={loading}
            onClick={this.handleSave}
          >
            保存并派发
          </Button>
        </Card>
        <Card
          title={<Title icon="profile" id="sys.system.basicInfo" defaultMessage="基本信息" />}
          bordered={false}
          className="tw-card-adjust"
        >
          <FieldList getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="multiName"
              label="名称"
              decorator={{
                initialValue: formData.multiName,
                rules: [{ required: true, message: '请输入名称' }],
              }}
            >
              <Input style={{ width: '100%' }} />
            </Field>

            <Field
              name="disterResId"
              label="发包人"
              decorator={{
                initialValue: formData.disterResId || (extInfo && extInfo.resId),
              }}
            >
              <Select disabled>
                <Option value={extInfo.resId}>{extInfo.resName}</Option>
              </Select>
            </Field>

            {/* <FieldLine label="复合能力" fieldCol={2} required>
              <Field
                name="jobType1"
                decorator={{
                  initialValue: formData.jobType1,
                  rules: [{ required: true, message: '请选择工种' }],
                }}
                wrapperCol={{ span: 23 }}
              >
                <UdcSelect
                  code="COM.JOB_TYPE1"
                  placeholder="请选择工种"
                  onChange={this.handleChangeJobType1}
                />
              </Field>
              <Field
                name="jobType2"
                decorator={{
                  initialValue: formData.jobType2,
                  rules: [{ required: true, message: '请选择工种子类' }],
                }}
                wrapperCol={{ span: 23 }}
              >
                <AsyncSelect
                  source={jobType2List}
                  placeholder="请选择工种子类"
                  onChange={this.handleChangeJobType2}
                />
              </Field>
              <Field
                name="capasetLeveldId"
                decorator={{
                  initialValue: formData.capasetLeveldId,
                  rules: [{ required: true, message: '请选择级别' }],
                }}
                wrapperCol={{ span: 24 }}
              >
                <AsyncSelect
                  source={capasetLeveldList}
                  placeholder="请选择级别"
                  // onChange={this.handleChangeCapasetLeveldId}
                />
              </Field>
            </FieldLine> */}

            <Field
              name="reasonType"
              label="事由类型"
              decorator={{
                initialValue: formData.reasonType,
                rules: [{ required: true, message: '请选择事由类型' }],
              }}
            >
              <UdcSelect
                code="TSK:TASK_REASON_TYPE"
                placeholder="事由类型"
                onChange={value => {
                  setFieldsValue({
                    reasonId: null,
                    expenseBuName: null,
                  });
                }}
              />
            </Field>
            <Field
              name="reasonId"
              label="事由号"
              decorator={{
                initialValue: {
                  code: formData.reasonId,
                  name: formData.reasonName,
                },
                rules: [
                  {
                    required: true,
                    message: '请选择事由号',
                  },
                ],
              }}
            >
              {{
                '01': (
                  <SelectWithCols
                    labelKey="name"
                    className="x-fill-100"
                    placeholder="请选择事由号"
                    columns={SEL_COL}
                    dataSource={taskProjSource}
                    onChange={value => {
                      this.handleChangeReasonId(value);
                    }}
                    selectProps={{
                      showSearch: true,
                      onSearch: value => {
                        dispatch({
                          type: `${DOMAIN}/updateState`,
                          payload: {
                            taskProjSource: taskProjList.filter(
                              d =>
                                d.code.indexOf(value) > -1 ||
                                d.name.toLowerCase().indexOf(value.toLowerCase()) > -1
                            ),
                          },
                        });
                      },
                      allowClear: true,
                    }}
                  />
                ),
                '02': (
                  <SelectWithCols
                    labelKey="name"
                    className="x-fill-100"
                    placeholder="请选择事由号"
                    columns={SEL_COL}
                    dataSource={preSaleSource}
                    onChange={value => {
                      this.handleChangeReasonId(value);
                    }}
                    selectProps={{
                      showSearch: true,
                      onSearch: value => {
                        dispatch({
                          type: `${DOMAIN}/updateState`,
                          payload: {
                            preSaleSource: preSaleList.filter(
                              d =>
                                d.code.indexOf(value) > -1 ||
                                d.name.toLowerCase().indexOf(value.toLowerCase()) > -1
                            ),
                          },
                        });
                      },
                      allowClear: true,
                    }}
                  />
                ),
                '03': (
                  <SelectWithCols
                    labelKey="name"
                    className="x-fill-100"
                    placeholder="请选择事由号"
                    columns={SEL_COL}
                    dataSource={buSource.filter(item => item.buStatus === 'ACTIVE') || []}
                    onChange={value => {
                      this.handleChangeReasonId(value);
                    }}
                    selectProps={{
                      showSearch: true,
                      onSearch: value => {
                        dispatch({
                          type: `${DOMAIN}/updateState`,
                          payload: {
                            buSource: buList.filter(
                              d =>
                                d.code.indexOf(value) > -1 ||
                                d.name.toLowerCase().indexOf(value.toLowerCase()) > -1
                            ),
                          },
                        });
                      },
                      allowClear: true,
                    }}
                  />
                ),
              }[formData.reasonType] || <span className="text-disable">请先选择事由类型</span>}
            </Field>

            <Field
              name="expenseBuName"
              label="费用承担BU"
              decorator={{
                initialValue: formData.expenseBuName, // <UdcSelect code="ACC:REIM_EXP_BY" placeholder="请选择费用承担方" />
                rules: [
                  {
                    required: true,
                    message: '请补充事由的BU信息',
                  },
                ],
              }}
            >
              <Input placeholder="选择事由号带出" disabled />
            </Field>

            <Field
              name="remark"
              label="备注"
              decorator={{
                initialValue: formData.remark,
              }}
            >
              <Input.TextArea rows={1} placeholder="备注" />
            </Field>
          </FieldList>
        </Card>
        <br />
        <Card title="任务分配编辑" bordered={false} className="tw-card-adjust">
          <EditableDataTable {...editTableProps} />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default TaskMultiEdit;
