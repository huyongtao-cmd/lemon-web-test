import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { isEmpty } from 'ramda';
import classnames from 'classnames';
import {
  Button,
  Form,
  Card,
  Input,
  List,
  Row,
  Col,
  Radio,
  DatePicker,
  Icon,
  Divider,
  Popover,
  Rate,
  Tooltip,
} from 'antd';

import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import FieldList from '@/components/layout/FieldList';
import { FileManagerEnhance, UdcSelect, Selection } from '@/pages/gen/field';
import DataTable from '@/components/common/DataTable';
import EditableDataTable from '@/components/common/EditableDataTable';
import Title from '@/components/layout/Title';
import { fromQs } from '@/utils/stringUtils';
import { selectUsersWithBu } from '@/services/gen/list';
import { genFakeId } from '@/utils/mathUtils';
import update from 'immutability-helper';
import createMessage from '@/components/core/AlertMessage';

const { Field } = FieldList;
const DOMAIN = 'growthCheckPoint';
const RadioGroup = Radio.Group;

@connect(({ growthCheckPoint }) => ({ growthCheckPoint }))
@Form.create({
  onFieldsChange(props, changedFields) {
    if (isEmpty(changedFields)) return;
    const { name, value } = Object.values(changedFields)[0];
    props.dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: { [name]: value },
    });
  },
})
@mountToTab()
class CheckPoint extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/clean`,
    }).then(res => {
      this.fetchData();
    });
  }

  fetchData = () => {
    const { dispatch } = this.props;
    const { id } = fromQs();
    dispatch({
      type: `${DOMAIN}/getPointFnHandle`,
      payload: {
        id,
      },
    });
    dispatch({
      type: `${DOMAIN}/getSelectProj`,
    });
    dispatch({
      type: `${DOMAIN}/getSelectTaskEval`,
    });
  };

  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
      growthCheckPoint: { formData = {}, aboutProject, taskDataSource },
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        let flag = true;
        aboutProject.forEach(i => {
          if (!i.projectId) {
            flag = false;
            createMessage({ type: 'warn', description: '请填写所有必填项' });
          }
        });
        taskDataSource.forEach(i => {
          if (!i.id) {
            flag = false;
            createMessage({ type: 'warn', description: '请填写所有必填项' });
          }
        });
        if (flag) {
          const examProjectList = aboutProject.map(item => ({
            projectId: item.projectId,
            startDate: item.time && item.time[0] && item.time[0].format('YYYY-MM-DD'),
            endDate: item.time && item.time[1] && item.time[1].format('YYYY-MM-DD'),
            relatedField: item.relatedField,
            projectBrief: item.projectBrief,
            dutyDesc: item.dutyDesc,
          }));
          let taskString = [];
          taskDataSource.forEach(i => {
            taskString.push(i.id);
          });
          taskString = taskString.join(',');
          dispatch({
            type: `${DOMAIN}/savePoint`,
            payload: {
              ...formData,
              ...values,
              examProjectList,
              taskString,
            },
          });
        }
      }
    });
  };

  handleCancel = () => {
    closeThenGoto('/user/center/growth');
  };

  // 行编辑触发事件 - 相关项目经验
  onCellChanged = (index, value, name) => {
    const {
      growthCheckPoint: { aboutProject },
      dispatch,
    } = this.props;

    const newDataSource = aboutProject;
    newDataSource[index] = {
      ...newDataSource[index],
      [name]: value,
    };
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { aboutProject: newDataSource },
    });
  };

  onTaskCellChanged = (index, value) => {
    const {
      growthCheckPoint: { taskList, taskDataSource },
      dispatch,
    } = this.props;
    const obj = taskList.filter(i => String(i.id) === value)[0];
    const newData = [...taskDataSource];
    newData[index] = { ...newData[index], ...obj }; // 避免丢失myFakeId
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        taskDataSource: newData,
      },
    });
  };

  render() {
    const { form, growthCheckPoint, loading, dispatch } = this.props;
    const { getFieldDecorator } = form;
    const {
      formData = {},
      aboutProject,
      aboutTask,
      projectList,
      taskList,
      taskDataSource,
    } = growthCheckPoint;
    const { listIds = [] } = formData;
    const tableProps = {
      sortBy: 'id',
      rowKey: 'myFakeId',
      sortDirection: 'ASC',
      dataSource: taskDataSource,
      rowSelection: {
        // selectedRowKeys: _selectedRowKeys,
        // onChange: (selectedRowKeys, selectedRows) => {
        //   this.setState({
        //     _selectedRowKeys: selectedRowKeys,
        //   });
        // },
      },
      showCopy: false,
      onAdd: newRow => {
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            taskDataSource: update(taskDataSource, {
              $push: [
                {
                  ...newRow,
                  myFakeId: genFakeId(-1),
                },
              ],
            }),
          },
        });
      },
      onDeleteItems: (selectedRowKeys, selectedRows) => {
        const newData = taskDataSource.filter(i => !selectedRowKeys.includes(i.myFakeId));
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            taskDataSource: newData,
          },
        });
      },
      columns: [
        {
          title: '任务',
          dataIndex: 'task',
          required: true,
          width: '20%',
          render: (value, row, index) => (
            <Selection.Columns
              source={taskList}
              value={row.id > 0 ? row.id : void 0}
              transfer={{ key: 'id', code: 'id', name: 'taskName' }}
              placeholder="请选择任务"
              showSearch
              allowClear={false}
              onChange={val => {
                this.onTaskCellChanged(index, val);
              }}
            />
          ),
        },
        {
          title: '事由类型',
          dataIndex: 'reasonTypeName',
          align: 'center',
          width: '8%',
          render: (value, row, index) => <Input value={value} disabled />,
        },
        {
          title: '事由',
          dataIndex: 'evalTarget',
          width: '20%',
          render: (value, row, index) => <Input value={value} disabled />,
        },
        {
          title: '复合能力',
          dataIndex: 'ability',
          width: '20%',
          render: (value, row, index) => (
            <Input
              value={
                row.jobType1Name
                  ? `${row.jobType1Name} - ${row.jobType2Name} - ${row.leveldName}`
                  : ''
              }
              disabled
            />
          ),
        },
        {
          title: '评价得分',
          dataIndex: 'avg',
          align: 'center',
          render: (value, row, index) => (
            <div>
              <Input style={{ width: '70%' }} value={value} disabled />
              {row.projEvalViewList && row.projEvalViewList.length ? (
                <Popover
                  placement="left"
                  content={<EvalContent type="task" item={row} list={row.projEvalViewList} />}
                  trigger="hover"
                >
                  <span style={{ color: '#1890FF', cursor: 'pointer' }}>&nbsp;&nbsp;评价详情</span>
                </Popover>
              ) : null}
            </div>
          ),
        },
      ],
    };
    const EvalContent = props => {
      const { type, item, list } = props;
      return (
        <div>
          <div style={{ fontWeight: 'bold', marginLeft: 10, marginBottom: 10 }}>
            {item.evalTarget}
            <span style={{ fontSize: '12px', color: '#999', marginLeft: 20 }}>
              &nbsp;&nbsp;评价时间:&nbsp;&nbsp;
              {item.evalDate}
            </span>
          </div>
          <div style={{ marginLeft: 10 }}>
            <Rate disabled count={10} value={Number(item.avg) || 0} />
            <div style={{ fontSize: 12 }}>
              <pre>{item.evalComment}</pre>
              <Divider />
            </div>
          </div>
          <div style={{ paddingBottom: 15 }}>
            {list &&
              list.map(score => (
                <div key={score.id}>
                  <span
                    style={{
                      display: 'inline-block',
                      width: 120,
                      textAlign: 'right',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      verticalAlign: 'middle',
                    }}
                  >
                    <Tooltip title={score.evalPoint}>{score.evalPoint}</Tooltip>
                  </span>
                  &nbsp;&nbsp;
                  <Rate disabled count={10} value={score.evalScore || 0} />
                  <Tooltip placement="topLeft" title={<pre>{score.evalComment}</pre>}>
                    <span
                      style={{
                        display: 'inline-block',
                        width: 120,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        verticalAlign: 'top',
                        paddingTop: 5,
                      }}
                    >
                      {score.evalComment}
                    </span>
                  </Tooltip>
                </div>
              ))}
          </div>
        </div>
      );
    };
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
            {formatMessage({ id: `misc.submit`, desc: '提交' })}
          </Button>
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            disabled={false}
            onClick={this.handleCancel}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={<Title icon="profile" text="能力考核点审核申请" />}
          bordered={false}
        >
          <FieldList getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="applyResName"
              label="申请人"
              decorator={{
                initialValue: formData.applyResName,
              }}
            >
              <Input placeholder="" disabled />
            </Field>
            <Field
              name="applyDate"
              label="申请日期"
              decorator={{
                initialValue: formData.applyDate,
              }}
            >
              <Input placeholder="" disabled />
            </Field>
            <Field
              name="capaLevelName"
              label="相关能力"
              decorator={{
                initialValue: formData.capaLevelName,
              }}
            >
              <Input placeholder="" disabled />
            </Field>

            <Field
              name="capaAbilityName"
              label="考核点"
              decorator={{
                initialValue: formData.capaAbilityName,
              }}
            >
              <Input placeholder="" disabled />
            </Field>

            {formData.apprType === 'ASSIGN_RES' || formData.apprType === 'BY_CAPASET' ? (
              <Field
                name="apprRes"
                label="审核人"
                decorator={{
                  initialValue: formData.apprRes ? parseInt(formData.apprRes, 10) : '',
                  rules: [{ required: true, message: '请选择审核人' }],
                }}
              >
                <Selection.Columns
                  source={listIds}
                  columns={[
                    { dataIndex: 'code', title: '编号', span: 10 },
                    { dataIndex: 'name', title: '名称', span: 14 },
                  ]}
                  transfer={{ key: 'id', code: 'id', name: 'name' }}
                  placeholder="请选择审核人"
                  showSearch
                />
              </Field>
            ) : (
              ''
            )}

            <Field name="attache" label="附件">
              <FileManagerEnhance
                api="/api/base/v1/resCapaExamApply/sfs/token"
                listType="text"
                dataKey={formData.id}
                disabled={false}
              />
            </Field>

            <Field
              name="selfDesc"
              label="自评"
              decorator={{
                initialValue: formData.selfDesc,
              }}
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
            >
              <Input.TextArea rows={3} placeholder="请输入自评" />
            </Field>
          </FieldList>
          <Divider dashed />
          相关项目经验
          {aboutProject.map((item, index) => (
            <Card
              key={item.myFakeId}
              bordered
              style={{
                borderRadius: '6px',
                marginBottom: '10px',
                width: '80%',
              }}
            >
              <Icon
                type="close-circle"
                theme="filled"
                style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '-10px',
                  fontSize: '20px',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  const newDataSource = aboutProject.filter(row => row.projId !== item.projId);
                  dispatch({
                    type: `${DOMAIN}/updateState`,
                    payload: {
                      aboutProject: newDataSource,
                    },
                  });
                }}
              />
              <FieldList getFieldDecorator={getFieldDecorator} col={2}>
                <Field
                  name="projectId"
                  label={<span className="ant-form-item-required">项目</span>}
                  presentational
                >
                  <Selection.Columns
                    source={projectList}
                    value={item.projectId}
                    transfer={{ key: 'id', code: 'id', name: 'code' }}
                    placeholder="请选择项目"
                    showSearch
                    onChange={val => {
                      this.onCellChanged(index, val, 'projectId');
                      dispatch({
                        type: `${DOMAIN}/getSelectProjRole`,
                        payload: { id: val, index },
                      });
                    }}
                  />
                </Field>
                <Field name="role" label="项目角色" presentational>
                  <Input value={item.role} disabled />
                </Field>
                <Field name="mulAbility" label="复合能力" presentational>
                  <Input
                    value={
                      (item.jobType1Name &&
                        `${item.jobType1Name} - ${item.jobType2Name} - ${item.leveldName}`) ||
                      ''
                    }
                    disabled
                  />
                </Field>
                <Field name="avg" label="评价得分" presentational>
                  <Input value={item.avg} disabled />
                  {item.projEvalViewList && item.projEvalViewList.length ? (
                    <div
                      style={{
                        position: 'absolute',
                        cursor: 'pointer',
                        color: '#1890FF',
                        top: -10,
                        right: -70,
                      }}
                    >
                      <Popover
                        placement="left"
                        content={<EvalContent item={item} list={item.projEvalViewList} />}
                        trigger="hover"
                      >
                        评价详情
                      </Popover>
                    </div>
                  ) : null}
                </Field>
                <Field name="time" label="期间" presentational>
                  <DatePicker.RangePicker
                    format="YYYY-MM-DD"
                    onChange={val => {
                      this.onCellChanged(index, val, 'time');
                    }}
                  />
                </Field>
                <Field name="relatedField" label="相关行业/产品" presentational>
                  <Input
                    onChange={e => {
                      this.onCellChanged(index, e.target.value, 'relatedField');
                    }}
                  />
                </Field>
                <Field
                  name="projectBrief"
                  label="项目简介"
                  fieldCol={1}
                  labelCol={{ span: 4, xxl: 3 }}
                  wrapperCol={{ span: 19, xxl: 20 }}
                  presentational
                >
                  <Input.TextArea
                    rows={3}
                    placeholder="请输入项目简介"
                    onChange={e => {
                      this.onCellChanged(index, e.target.value, 'projectBrief');
                    }}
                  />
                </Field>
                <Field
                  name="dutyDesc"
                  label="职责&业绩"
                  fieldCol={1}
                  labelCol={{ span: 4, xxl: 3 }}
                  wrapperCol={{ span: 19, xxl: 20 }}
                  presentational
                >
                  <Input.TextArea
                    rows={3}
                    placeholder="请输入职责&业绩"
                    onChange={e => {
                      this.onCellChanged(index, e.target.value, 'dutyDesc');
                    }}
                  />
                </Field>
              </FieldList>
            </Card>
          ))}
          <div>
            <a
              style={{ cursor: 'pointer' }}
              onClick={() => {
                dispatch({
                  type: `${DOMAIN}/updateState`,
                  payload: {
                    aboutProject: update(aboutProject, {
                      $push: [
                        {
                          myFakeId: genFakeId(-1),
                        },
                      ],
                    }),
                  },
                });
              }}
            >
              <Icon type="plus-circle" />
              &nbsp; 添加项目经验
            </a>
          </div>
          <Divider dashed />
          <div>
            相关任务经验
            <EditableDataTable {...tableProps} />
          </div>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default CheckPoint;
