import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {
  Table,
  Icon,
  Card,
  Button,
  Checkbox,
  Select,
  Tooltip,
  InputNumber,
  Input,
  Form,
  DatePicker,
  Row,
} from 'antd';
import { UdcSelect } from '@/pages/gen/field';
import AsyncSelect from '@/components/common/AsyncSelect';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { fromQs } from '@/utils/stringUtils';
import moment from 'moment';
import { formatDT } from '@/utils/tempUtils/DateTime';
import router from 'umi/router';
import { mountToTab } from '@/layouts/routerControl';
import createMessage from '@/components/core/AlertMessage';
import { formatMessage } from 'umi/locale';
import Link from 'umi/link';

import EditTableContext from './workbench/EditTableContext';
import EditTableCell from './workbench/EditableCell';

import './Workbench.less';

const { Option } = Select;
const FormItem = Form.Item;
const { RangePicker } = DatePicker;

const DOMAIN = 'workbench';
const colSpan0 = () => ({ props: { colSpan: 0 } });

function TaskResTitle(props) {
  const {
    data: {
      taskId,
      taskName,
      role,
      tasks,
      capasetLevelName,
      capasetLevelRatio,
      receiverResName,
      receiverResRatio,
      acceptMethodName,
      eqvaRatio,
      planStartDate,
      planEndDate,
      projShId,
      guaranteeRate,
      allowTransferFlag,
      taskStatus,
      changeTaskId,
      changeTaskStatus,
    },
    onResTaskChange,
    onCollapseClick,
    onEditClick,
    onDistClick,
  } = props;

  let distFlag = false;
  if (taskStatus === 'CREATE') {
    distFlag = true;
  }
  if (taskStatus === 'IN PROCESS' && changeTaskId && !changeTaskStatus) {
    distFlag = true;
  }

  let options;
  if (tasks) {
    const taskList = tasks.split('_+');
    options = taskList
      ? taskList.map((d, i) => (
          // eslint-disable-next-line
          <Option key={d.split('_=')[0]} value={d.split('_=')[0]}>
            {d.split('_=')[1]}
          </Option>
        ))
      : '';
    options.push(
      <Option key="-1" value="-1">
        ??????
      </Option>
    );
  } else {
    options = <Option value={taskId}>{taskName}</Option>;
  }
  return (
    <div>
      <div style={{ float: 'right' }}>
        <Tooltip title="??????">
          <Icon
            type="caret-left"
            className="workbench_title_i"
            onClick={() => {
              onCollapseClick();
            }}
          />
        </Tooltip>
        <Tooltip title="??????">
          <Icon
            type="edit"
            className="workbench_title_i"
            onClick={() => {
              onEditClick();
            }}
          />
        </Tooltip>
        {distFlag === true ? (
          <Tooltip title="??????">
            <Icon
              type="cluster"
              className="workbench_title_i"
              onClick={() => {
                onDistClick({ taskId, taskStatus, changeTaskId, changeTaskStatus });
              }}
            />
          </Tooltip>
        ) : (
          ''
        )}
      </div>

      <div className="workbench_title_div">
        <Tooltip title="?????????">
          <Select
            style={{ width: '80%' }}
            defaultValue={taskId || taskName}
            // source={dataSource.map(d => ({ ...d, name: `${d.name} ${d.code}` }))}
            // showSearch
            // onSearch={this.onSearch}
            onChange={e => {
              if (!tasks) {
                return;
              }
              onResTaskChange({ projShId, taskId: e });
            }}
          >
            {options}
          </Select>
        </Tooltip>
      </div>

      <div className="workbench_title_div">
        <Tooltip title="????????????">{role || '???'}</Tooltip>
      </div>

      <div className="workbench_title_div">
        <Tooltip title="????????????/??????????????????">
          {(capasetLevelName || '???') + '/' + (capasetLevelRatio || '???')}
        </Tooltip>
      </div>

      <div className="workbench_title_div">
        <Tooltip title="??????/????????????">
          {(receiverResName || '???') + '/' + (receiverResRatio || '???')}
        </Tooltip>
      </div>

      <div className="workbench_title_div">
        <Tooltip title="????????????/??????????????????">
          {(acceptMethodName || '???') + '/' + (eqvaRatio || '???')}
        </Tooltip>
      </div>

      <div className="workbench_title_div">
        <Tooltip title="????????????">{(planStartDate || ' ') + '~' + (planEndDate || ' ')}</Tooltip>
      </div>

      <div className="workbench_title_div">
        <Tooltip title="???????????????">{guaranteeRate ? guaranteeRate + '%' : '???'}</Tooltip> /{' '}
        <Tooltip title="?????????">{allowTransferFlag === 1 ? '?????????' : '????????????'}</Tooltip>
      </div>
    </div>
  );
}

function TaskResLeftTitle(props) {
  const {
    style,
    onTaskResCollapseAll,
    onTaskResExpendAll,
    data: { planDays, planEqva, usedDays, distedEqva, settledEqva },
  } = props;
  return (
    <div style={style}>
      <div style={{ float: 'right', marginTop: '6px' }}>
        <Tooltip title="????????????">
          <Icon type="double-left" onClick={onTaskResCollapseAll} />
        </Tooltip>
        <Tooltip title="????????????">
          <Icon type="double-right" onClick={onTaskResExpendAll} />
        </Tooltip>
      </div>

      <div className="workbench_title_div">
        <Tooltip title="???????????????">{'???????????????: ' + (planDays || '???')}</Tooltip>
        <br />
        <Tooltip title="???????????????">{'???????????????: ' + (planEqva || '???')}</Tooltip>
        <br />

        <Tooltip title="???????????????">{'???????????????: ' + (usedDays || '???')}</Tooltip>
        <br />
        <Tooltip title="???????????????">{'???????????????: ' + (distedEqva || '???')}</Tooltip>
        <br />
        <Tooltip title="???????????????">{'???????????????: ' + (settledEqva || '???')}</Tooltip>
        <br />
      </div>
    </div>
  );
}

function TaskResTitleHidden(props) {
  const {
    data: { role, receiverResName },
    onCollapseClick,
  } = props;

  return (
    <div>
      <div className="workbench_title_div">
        <div>
          <Tooltip title="??????">
            <Icon
              type="caret-right"
              className="workbench_title_i"
              onClick={() => {
                onCollapseClick();
              }}
            />
          </Tooltip>
        </div>
        <div style={{ textAlign: 'center' }}>{receiverResName}</div>
      </div>
    </div>
  );
}

function TaskResTitleEdit(props) {
  const {
    data: {
      taskId,
      taskName,
      role,
      tasks,
      capasetLevelId,
      capasetLevelName,
      capasetLevelRatio,
      receiverResName,
      receiverResRatio,
      planStartDate,
      planEndDate,
      projShId,
      acceptMethod,
      acceptMethodName,
      eqvaRatio,
      jobType1,
      jobType2,
      jobType2List,
      capasetLevelList,
      guaranteeRate,
      allowTransferFlag,
    },
    onCollapseClick,
    onEditClick,
    onEditSaveClick,
    onEditCancelClick,
    handleSave,
    handleChangeJobType1,
    handleChangeJobType2,
  } = props;
  let momentStart;
  let momentEnd;
  if (planStartDate) {
    momentStart = moment(planStartDate);
  }
  if (planEndDate) {
    momentEnd = moment(planEndDate);
  }
  return (
    <EditTableContext.Consumer>
      {form => (
        <div>
          <div style={{ float: 'right' }}>
            <Tooltip title="??????">
              <Icon
                type="save"
                className="workbench_title_i"
                onClick={() => {
                  onEditSaveClick();
                }}
              />
            </Tooltip>

            <Tooltip title="??????">
              <Icon
                type="close"
                className="workbench_title_i"
                onClick={() => {
                  onEditCancelClick(taskId);
                }}
              />
            </Tooltip>
          </div>

          <div className="workbench_title_div">
            <Tooltip title="????????????">
              <Input
                style={{ width: '60%' }}
                // ref={node => {this.input = node;}}
                // onPressEnter={this.save}
                value={taskName}
                onChange={e => {
                  const field = 'taskName';
                  const newValue = e.currentTarget.value;
                  handleSave({ field, projShId, newValue });
                }}
              />
            </Tooltip>
          </div>

          <div className="workbench_title_div">
            <Tooltip title="????????????">
              {role || '???'}
              {/* <FormItem style={{ margin: 0 }}>
                {form.getFieldDecorator('role_' + projShId, {
                  rules: [
                    {
                      required: true,
                      message: `???????????????.`,
                    },
                  ],
                  initialValue: role,
                })(
                  <Input
                    style={{ width: '60%' }}
                    // ref={node => {this.input = node;}}
                    // onPressEnter={this.save}
                    onBlur={e => {
                      form.validateFields((error, values) => {
                        if (error && error[e.currentTarget.id]) {
                          return;
                        }
                        const field = 'role';
                        const newValue = values['role_' + projShId];
                        handleSave({ field, projShId, newValue });
                      });
                    }}
                  />
                )}
              </FormItem> */}
            </Tooltip>
          </div>

          <div className="workbench_title_div">
            <Tooltip title="????????????">
              <Form layout="inline">
                <FormItem style={{ margin: 0 }} wrapperCol={{ span: 24 }}>
                  {form.getFieldDecorator('jobType1_' + projShId, {
                    rules: [
                      {
                        required: true,
                        message: `???????????????.`,
                      },
                    ],
                    initialValue: jobType1,
                  })(
                    <UdcSelect
                      className="workbench_fake"
                      style={{ width: '100px' }}
                      code="COM.JOB_TYPE1"
                      placeholder="??????"
                      onChange={e => {
                        const temp = {};
                        temp['jobType2_' + projShId] = null;
                        temp['capasetLevelId_' + projShId] = '';
                        form.setFieldsValue(temp);
                        const newValue = e;
                        if (e) {
                          handleChangeJobType1({ projShId, newValue });
                        }
                      }}
                    />
                  )}
                </FormItem>
                <FormItem style={{ margin: 0 }}>
                  {form.getFieldDecorator('jobType2_' + projShId, {
                    rules: [
                      {
                        required: true,
                        message: `?????????????????????.`,
                      },
                    ],
                    initialValue: jobType2,
                  })(
                    <AsyncSelect
                      className="workbench_fake"
                      style={{ width: '110px' }}
                      source={jobType2List || []}
                      placeholder="????????????"
                      onChange={e => {
                        const temp = {};
                        temp['capasetLevelId_' + projShId] = '';
                        form.setFieldsValue(temp);
                        const newValue = e;
                        if (e) {
                          handleChangeJobType2({ projShId, newValue });
                        }
                      }}
                    />
                  )}
                </FormItem>
                <FormItem style={{ margin: 0 }}>
                  {form.getFieldDecorator('capasetLevelId_' + projShId, {
                    rules: [
                      {
                        required: true,
                        message: `???????????????.`,
                      },
                    ],
                    initialValue: capasetLevelId,
                  })(
                    <AsyncSelect
                      className="workbench_fake"
                      style={{ width: '90px' }}
                      source={capasetLevelList || []}
                      placeholder="??????"
                      onChange={e => {
                        const field = 'capasetLevelId';
                        const newValue = e;
                        handleSave({ field, projShId, newValue });
                      }}
                    />
                  )}
                </FormItem>
              </Form>
            </Tooltip>
          </div>

          <div className="workbench_title_div">
            <Tooltip title="??????/????????????">
              {(receiverResName || '???') + '/' + (receiverResRatio || '???')}
            </Tooltip>
          </div>

          <div className="workbench_title_div">
            <Tooltip title="????????????/??????????????????">
              <UdcSelect
                className="workbench_fake"
                style={{ width: '100px' }}
                code="TSK.ACCEPT_METHOD"
                placeholder="????????????"
                value={acceptMethod}
                onChange={e => {
                  const field = 'acceptMethod';
                  const newValue = e;
                  handleSave({ field, projShId, newValue });
                }}
              />
              /
              <InputNumber
                defaultValue={eqvaRatio}
                onChange={e => {
                  const field = 'eqvaRatio';
                  const newValue = e;
                  handleSave({ field, projShId, newValue });
                }}
              />
            </Tooltip>
          </div>

          <div className="workbench_title_div">
            <Tooltip title="????????????">
              <DatePicker.RangePicker
                className="workbench_fake"
                style={{ width: '300px' }}
                format="YYYY-MM-DD"
                defaultValue={[momentStart, momentEnd]}
                onChange={e => {
                  const field = 'planStartDate';
                  const newValue = formatDT(e[0]);
                  handleSave({ field, projShId, newValue });

                  const field2 = 'planEndDate';
                  const newValue2 = formatDT(e[1]);
                  handleSave({ field: field2, projShId, newValue: newValue2 });
                }}
              />
            </Tooltip>
          </div>

          <div className="workbench_title_div">
            <Tooltip title="???????????????">
              <InputNumber
                formatter={value => `${value}%`}
                parser={value => value.replace('%', '')}
                min={0}
                max={100}
                defaultValue={guaranteeRate}
                onChange={e => {
                  const field = 'guaranteeRate';
                  const newValue = e;
                  handleSave({ field, projShId, newValue });
                }}
              />
            </Tooltip>
            &nbsp;&nbsp;
            <Tooltip title="?????????">
              <Checkbox
                checked={allowTransferFlag === 1}
                onClick={() => {
                  const field = 'allowTransferFlag';
                  const newValue = allowTransferFlag === 1 ? 0 : 1;
                  handleSave({ field, projShId, newValue });
                }}
              />
            </Tooltip>
          </div>
        </div>
      )}
    </EditTableContext.Consumer>
  );
}

/**
 * footer??????
 * @param props
 * @returns {XML}
 * @constructor
 */
function TaskResFooter(props) {
  const {
    data: {
      taskId,
      taskNo,
      taskName,
      eqvaQty,
      settledEqva,
      guaranteeRate,
      taskStatus,
      taskStatusName,
      allowTransferFlag,
      settlePrice,
      amt,
    },
    projId,
  } = props;

  return (
    <div>
      <div className="workbench_title_div">
        <Tooltip title="??????/????????????">
          {taskId ? (
            <Link
              className="tw-link"
              to={`/user/task/view?id=${taskId}&from=/user/project/workbench?id=${projId}`}
            >
              {(taskNo || '???') + '/' + (taskName || '???')}
            </Link>
          ) : (
            (taskNo || '???') + '/' + (taskName || '???')
          )}
        </Tooltip>

        <div style={{ float: 'right' }}>
          {/* <Button
            className="tw-btn-primary"
            size="default"
            // onClick={() => router.push(`/user/project/projectActivityList?id=${projId}`)}
          >
            ????????????
          </Button>
          <Button
            className="tw-btn-primary"
            size="default"
            // onClick={() => router.push(`/user/project/projectActivityList?id=${projId}`)}
          >
            ????????????
          </Button> */}
        </div>
      </div>

      <div className="workbench_title_div">
        <Tooltip title="????????????/????????????">{(eqvaQty || '0') + '/' + (settledEqva || '0')}</Tooltip>
      </div>

      <div className="workbench_title_div">
        <Tooltip title="??????">{taskStatusName || '???'}</Tooltip>
      </div>

      <div className="workbench_title_div">
        <Tooltip title="??????????????????/??????">{(settlePrice || '0') + '/' + (amt || '0')}</Tooltip>
      </div>
    </div>
  );
}

function TaskResLeftFooter(props) {
  const { style } = props;
  return (
    <div style={style}>
      <div className="workbench_title_div">??????/????????????</div>
      <div className="workbench_title_div">????????????/????????????</div>
      <div className="workbench_title_div">??????</div>
      <div className="workbench_title_div">??????????????????/??????</div>
    </div>
  );
}

/**
 * footer??????????????????
 * @param props
 * @returns {XML}
 * @constructor
 */
function TaskResFooterEdit(props) {
  const {
    data: {
      taskId,
      taskNo,
      taskName,
      eqvaQty,
      settledEqva,
      guaranteeRate,
      taskStatus,
      taskStatusName,
      allowTransferFlag,
      settlePrice,
      amt,
      projShId,
    },
    handleSave,
    projId,
  } = props;

  return (
    <div>
      <div className="workbench_title_div">
        <Tooltip title="????????????">
          {taskId ? (
            <Link
              className="tw-link"
              to={`/user/task/view?id=${taskId}&from=/user/project/workbench?id=${projId}`}
            >
              {(taskNo || '???') + '/' + (taskName || '???')}
            </Link>
          ) : (
            (taskNo || '???') + '/' + (taskName || '???')
          )}
        </Tooltip>

        <div style={{ float: 'right' }}>
          {/* <Button
            className="tw-btn-primary"
            size="default"
            // onClick={() => router.push(`/user/project/projectActivityList?id=${projId}`)}
          >
            ????????????
          </Button>
          <Button
            className="tw-btn-primary"
            size="default"
            // onClick={() => router.push(`/user/project/projectActivityList?id=${projId}`)}
          >
            ????????????
          </Button> */}
        </div>
      </div>

      <div className="workbench_title_div">
        <Tooltip title="????????????/????????????">{(eqvaQty || '0') + '/' + (settledEqva || '0')}</Tooltip>
      </div>

      <div className="workbench_title_div">
        <Tooltip title="??????">{taskStatusName || '???'}</Tooltip>
      </div>

      <div className="workbench_title_div">
        <Tooltip title="??????????????????/??????">{(settlePrice || '0') + '/' + (amt || '0')}</Tooltip>
      </div>
    </div>
  );
}

const EditableRow = ({ form, index, ...props }) => (
  <EditTableContext.Provider value={form}>
    <tr {...props} />
  </EditTableContext.Provider>
);

const EditableFormRow = Form.create()(EditableRow);

@connect(({ loading, workbench }) => ({
  loading:
    loading.effects[`${DOMAIN}/queryWorkBenchProjectActivities`] ||
    loading.effects[`${DOMAIN}/taskResSave`] ||
    loading.effects[`${DOMAIN}/taskChangeDist`],
  workbench,
}))
@Form.create({})
@mountToTab()
class Workbench extends PureComponent {
  projActivityCol = [
    {
      title: (
        <span>
          ????????????&nbsp;
          {/* <Tooltip title="????????????"><Icon type="bars" onClick={()=>{console.log(11111111)}} /></Tooltip>&nbsp;&nbsp; */}
          <Tooltip title="??????/????????????">
            <Icon
              type="ordered-list"
              onClick={() => {
                this.switchActNoVisible();
              }}
            />
          </Tooltip>
        </span>
      ),
      dataIndex: 'actName',
      width: 200,
      // fixed: 'left',
      render: (value, row, index) => value,
    },
    {
      title: '????????????/??????',
      dataIndex: 'days',
      width: 100,
      render: (value, row, index) => {
        const { days, planEqva } = row;
        let returnDaysValue = 0;
        let returnPlanEqva = 0;
        if (days && !Number.isNaN(days)) {
          returnDaysValue = days.toFixed(2);
        }
        if (planEqva && !Number.isNaN(planEqva)) {
          returnPlanEqva = planEqva.toFixed(2);
        }
        return returnDaysValue + '/' + returnPlanEqva;
      },
    },
    {
      title: (
        <div>
          <span>??????/????????????</span>
          <div
            className="workbench_act_expend_right"
            onClick={() => {
              this.actCollapseLeft();
            }}
          />
        </div>
      ),
      dataIndex: 'planEqva',
      width: 120,
      render: (value, row, index) => {
        let { totalDistedEqva, totalSettledEqva } = row;

        if (totalDistedEqva && !Number.isNaN(totalDistedEqva)) {
          totalDistedEqva = totalDistedEqva.toFixed(2);
        } else {
          totalDistedEqva = 0;
        }

        if (totalSettledEqva && !Number.isNaN(totalSettledEqva)) {
          totalSettledEqva = totalSettledEqva.toFixed(2);
        } else {
          totalSettledEqva = 0;
        }
        return totalDistedEqva + '/' + totalSettledEqva;
      },
    },
  ];

  projActivityColFold = [
    {
      title: (
        <span>
          ????????????&nbsp;
          {/* <Tooltip title="????????????"><Icon type="bars" onClick={()=>{console.log(11111111)}} /></Tooltip>&nbsp;&nbsp; */}
          <Tooltip title="??????/????????????">
            <Icon
              type="ordered-list"
              onClick={() => {
                this.switchActNoVisible();
              }}
            />
          </Tooltip>
        </span>
      ),
      className: 'workbench_act_expand_right',
      dataIndex: 'actName',
      width: 200,
      render: (value, row, index) => value,
    },
  ];

  /* taskColTmpl = [
    {
      title: '??????',
      className: 'workbench_task_border',
      dataIndex: 'task1',
      width: 60,
      render: (value, row, index) => value
    },
    {
      title: '??????',
      dataIndex: 'task2',
      width: 60,
      render: (value, row, index) => value
    },
    {
      title: '??????',
      dataIndex: 'task3',
      width: 60,
      render: (value, row, index) => value
    },
    {
      title: '??????',
      dataIndex: 'task4',
      width: 60,
      render: (value, row, index) => value
    },
    {
      title: '??????',
      dataIndex: 'task5',
      width: 60,
      render: (value, row, index) => value
    },
    {
      title: '??????',
      dataIndex: 'task6',
      width: 60,
      render: (value, row, index) => value
    },
  ]; */

  taskColTmpl = [
    {
      title: '??????',
      className: 'workbench_task_border',
      dataIndex: 'res',
      width: 60,
      render: (value, row, index) => {
        if (row.phaseFlag === 1) {
          return undefined;
        }
        return row.sumFlag ? (
          ''
        ) : (
          <Checkbox disabled className="x-fill-100" checked={value === 'checked'} />
        );
      },
    },
    {
      title: '??????',
      dataIndex: 'act_status',
      width: 60,
      align: 'center',
      render: (value, row, index) => {
        if (!value) {
          return '';
        }
        if (value === 'TO BE STARTED') {
          return <i className="workbench_legend_i" style={{ backgroundColor: 'gray' }} />;
        }
        if (value === 'DELAYED') {
          return <i className="workbench_legend_i" style={{ backgroundColor: 'orange' }} />;
        }
        if (value === 'IN PROCESS') {
          return <i className="workbench_legend_i" style={{ backgroundColor: 'yellow' }} />;
        }
        if (value === 'ACCEPTING') {
          return <i className="workbench_legend_i" style={{ backgroundColor: 'blue' }} />;
        }
        if (value === 'FINISHED') {
          return <i className="workbench_legend_i" style={{ backgroundColor: 'green' }} />;
        }
        return '';
      },
    },
    {
      title: <Tooltip title="????????????">??????</Tooltip>,
      dataIndex: 'days',
      width: 70,
      render: (value, row, index) => value,
    },
    {
      title: <Tooltip title="????????????">??????</Tooltip>,
      dataIndex: 'plan_eqva',
      width: 70,
      render: (value, row, index) => (value && !Number.isNaN(value) ? value.toFixed(2) : value),
    },
    {
      title: <Tooltip title="???????????????">??????</Tooltip>,
      dataIndex: 'dist_eqva',
      width: 60,
      render: (value, row, index) => (value && !Number.isNaN(value) ? value.toFixed(2) : value),
    },
    {
      title: <Tooltip title="???????????????">??????</Tooltip>,
      dataIndex: 'settled_eqva',
      width: 60,
      render: (value, row, index) => (value && !Number.isNaN(value) ? value.toFixed(2) : value),
    },
  ];

  taskColEditTmpl = [
    {
      title: '??????',
      className: 'workbench_task_border',
      dataIndex: 'res',
      width: 60,
    },
    {
      title: '??????',
      dataIndex: 'act_status',
      width: 60,
      align: 'center',
      render: (value, row, index) => {
        if (!value) {
          return '';
        }
        if (value === 'TO BE STARTED') {
          return <i className="workbench_legend_i" style={{ backgroundColor: 'gray' }} />;
        }
        if (value === 'DELAYED') {
          return <i className="workbench_legend_i" style={{ backgroundColor: 'orange' }} />;
        }
        if (value === 'IN PROCESS') {
          return <i className="workbench_legend_i" style={{ backgroundColor: 'yellow' }} />;
        }
        if (value === 'ACCEPTING') {
          return <i className="workbench_legend_i" style={{ backgroundColor: 'blue' }} />;
        }
        if (value === 'FINISHED') {
          return <i className="workbench_legend_i" style={{ backgroundColor: 'green' }} />;
        }
        return '';
      },
    },
    {
      title: <Tooltip title="????????????">??????</Tooltip>,
      className: 'workbench_input_edit',
      dataIndex: 'days',
      width: 70,
      editable: true,
      // render: (value, row, index) => <InputNumber min={0} max={1000} defaultValue={0} onChange={()=>{console.log(111)}} />
    },
    {
      title: <Tooltip title="????????????">??????</Tooltip>,
      dataIndex: 'plan_eqva',
      editable: true,
      width: 70,
      render: (value, row, index) => (value && !Number.isNaN(value) ? value.toFixed(2) : value),
    },
    {
      title: <Tooltip title="???????????????">??????</Tooltip>,
      dataIndex: 'dist_eqva',
      width: 60,
      render: (value, row, index) => (value && !Number.isNaN(value) ? value.toFixed(2) : value),
    },
    {
      title: <Tooltip title="???????????????">??????</Tooltip>,
      dataIndex: 'settled_eqva',
      width: 60,
      render: (value, row, index) => (value && !Number.isNaN(value) ? value.toFixed(2) : value),
    },
  ];

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const { dispatch } = this.props;

    const projId = fromQs().id;
    dispatch({
      type: `${DOMAIN}/queryWorkBenchProjectActivities`,
      payload: {
        projId,
        isFold: false,
        projActivityCol: this.projActivityCol,
      },
    });

    // ??????????????????
    // dispatch({
    //   type: `${DOMAIN}/queryWorkBenchTaskRes`,
    //   payload: {
    //     projId,
    //   },
    // });
  }

  componentDidUpdate = () => {
    const rootNode = document.getElementById('workbenchTable');
    const dataNode = rootNode.children[1].firstChild.firstChild;
    const titleNode = rootNode.children[0].getElementsByTagName('table')[0].parentNode;
    let footerNode;
    if (
      rootNode.children[1].firstChild.children[1] &&
      rootNode.children[1].firstChild.children[1].getElementsByTagName('table')[0]
    ) {
      footerNode = rootNode.children[1].firstChild.children[1].getElementsByTagName('table')[0]
        .parentNode;
    }

    if (dataNode) {
      dataNode.onscroll = e => {
        const left = e.target.scrollLeft;
        // titleNode.style.overflow="hidden";
        titleNode.scrollLeft = left;
        // footerNode.style.overflow="hidden";
        footerNode.scrollLeft = left;
      };
    }

    if (titleNode) {
      titleNode.onscroll = e => {
        const left = e.target.scrollLeft;
        dataNode.scrollLeft = left;
        footerNode.scrollLeft = left;
      };
    }

    if (footerNode) {
      footerNode.onscroll = e => {
        const left = e.target.scrollLeft;
        dataNode.scrollLeft = left;
        titleNode.scrollLeft = left;
      };
    }
  };

  refresh = projId => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/queryWorkBenchProjectActivities`,
      payload: {
        projId,
        refresh: true,
      },
    });
  };

  // ??????title columns
  handleTitleColumns = columns => {
    if (columns.length === 1) {
      return [];
    }
    const {
      workbench: { isFold, projTaskRes, hiddenTaskRes, editTaskRes, profile },
    } = this.props;
    const temp = this.taskColTmpl;
    const titleColumns = [];
    const activityColimn0 = Object.assign({}, columns[0]);
    activityColimn0.className += ' workbench_hidden_title';
    let activityColSpan = 3;
    if (isFold === true) {
      // ?????????????????????
      activityColSpan = 1;
      activityColimn0.render = (text, row, index) => ({
        children: (
          <TaskResLeftTitle
            onTaskResCollapseAll={this.taskResCollapseAll}
            onTaskResExpendAll={this.taskResExpendAll}
            data={profile}
          />
        ),
        props: {
          colSpan: activityColSpan,
        },
      });
      titleColumns.push(activityColimn0);
    } else {
      // ????????????????????????
      activityColimn0.render = (text, row, index) => ({
        children: (
          <TaskResLeftTitle
            onTaskResCollapseAll={this.taskResCollapseAll}
            onTaskResExpendAll={this.taskResExpendAll}
            data={profile}
          />
        ),
        props: {
          colSpan: activityColSpan,
        },
      });
      titleColumns.push(activityColimn0);

      const activityColimn1 = Object.assign({}, columns[1]);
      activityColimn1.render = colSpan0;
      titleColumns.push(activityColimn1);

      const activityColimn2 = Object.assign({}, columns[2]);
      activityColimn2.render = colSpan0;
      activityColimn2.className = '';
      titleColumns.push(activityColimn2);
    }

    const cacheJson = {};
    projTaskRes.forEach((taskRes, i) => {
      cacheJson[taskRes.projShId] = taskRes;
    });

    columns.forEach((t, i) => {
      if (i >= activityColSpan && i < columns.length - 1) {
        const tempColumn = Object.assign({}, t);
        const tempArray = tempColumn.dataIndex.split('_');
        const projShId = tempArray[tempArray.length - 1];
        const taskRes = cacheJson[projShId];

        // ????????????????????????
        if (hiddenTaskRes.indexOf(projShId + '') > -1) {
          const hiddenColumn = Object.assign({}, temp[0]);
          hiddenColumn.dataIndex = hiddenColumn.dataIndex + '_' + projShId;
          hiddenColumn.className += ' workbench_hidden_title';
          hiddenColumn.render = (text, row, index) => ({
            children: (
              <TaskResTitleHidden
                data={taskRes}
                onCollapseClick={() => {
                  this.taskResExpendRight(projShId);
                }}
              />
            ),
          });

          titleColumns.push(hiddenColumn);
        } else {
          // ????????????
          let taskResTitle;
          if (editTaskRes.indexOf(projShId + '') > -1) {
            taskResTitle = (
              <TaskResTitleEdit
                data={taskRes}
                onCollapseClick={() => {
                  this.taskResCollapseLeft(projShId);
                }}
                onEditClick={() => {
                  this.taskResEdit(projShId);
                }}
                onEditSaveClick={() => {
                  this.taskResEditSave(projShId);
                }}
                onEditCancelClick={taskId => {
                  this.taskResEditCancel(projShId, taskId);
                }}
                handleSave={data => {
                  this.resTaskEditSave(data);
                }}
                handleChangeJobType1={data => {
                  this.handleChangeJobType1(data);
                }}
                handleChangeJobType2={data => {
                  this.handleChangeJobType2(data);
                }}
              />
            );
          } else {
            taskResTitle = (
              <TaskResTitle
                data={taskRes}
                onCollapseClick={() => {
                  this.taskResCollapseLeft(projShId);
                }}
                onEditClick={() => {
                  this.taskResEdit(projShId);
                }}
                onResTaskChange={data => this.handleResTaskChange(data)}
                onDistClick={data => this.handleDistClick(data)}
              />
            );
          }
          // if ((i - activityColSpan) % 6 === 0) {
          if (tempColumn.dataIndex.indexOf('res') === 0) {
            tempColumn.render = (text, row, index) => ({
              children: taskResTitle,
              props: {
                colSpan: 6,
              },
            });
            tempColumn.className = 'workbench_task_border';
          } else {
            tempColumn.render = colSpan0;
          }
          titleColumns.push(tempColumn);
        }
      }
    });
    const finalCol = Object.assign({}, columns[columns.length - 1]);
    // finalCol.render = (text, row, index) => (
    //   <Button
    //     type="primary"
    //     size="large"
    //     onClick={() => {
    //       this.loadMore();
    //     }}
    //   >
    //     More...
    //   </Button>
    // );
    titleColumns.push(finalCol);
    // ????????????
    // const tempLastColumn = Object.assign({}, titleColumns[titleColumns.length-1]);
    // tempLastColumn.className = "workbench_task_border";
    // titleColumns[titleColumns.length-1] = tempLastColumn;
    return titleColumns;
  };

  // footer columns
  handleFooterColumns = columns => {
    if (columns.length === 1) {
      return [];
    }
    const {
      workbench: { projId, isFold, projTaskRes, hiddenTaskRes, editTaskRes },
    } = this.props;
    const temp = this.taskColTmpl;
    const footerColumns = [];
    const activityColimn0 = Object.assign({}, columns[0]);
    let activityColSpan = 3;
    if (isFold === true) {
      // ?????????????????????
      activityColSpan = 1;
      activityColimn0.render = (text, row, index) => ({
        children: <TaskResLeftFooter style={{ textAlign: 'right' }} />,
        props: {
          colSpan: activityColSpan,
        },
      });
      footerColumns.push(activityColimn0);
    } else {
      // ????????????????????????
      activityColimn0.render = (text, row, index) => ({
        children: <TaskResLeftFooter style={{ textAlign: 'right' }} />,
        props: {
          colSpan: activityColSpan,
        },
      });
      footerColumns.push(activityColimn0);

      const activityColimn1 = Object.assign({}, columns[1]);
      activityColimn1.render = colSpan0;
      footerColumns.push(activityColimn1);

      const activityColimn2 = Object.assign({}, columns[2]);
      activityColimn2.render = colSpan0;
      activityColimn2.className = '';
      footerColumns.push(activityColimn2);
    }

    const cacheJson = {};
    projTaskRes.forEach((taskRes, i) => {
      cacheJson[taskRes.projShId] = taskRes;
    });

    columns.forEach((t, i) => {
      if (i >= activityColSpan && i < columns.length - 1) {
        const tempColumn = Object.assign({}, t);
        const tempArray = tempColumn.dataIndex.split('_');
        const projShId = tempArray[tempArray.length - 1];
        const taskRes = cacheJson[projShId];

        // ????????????????????????
        if (hiddenTaskRes.indexOf(projShId + '') > -1) {
          const hiddenColumn = Object.assign({}, temp[0]);
          hiddenColumn.dataIndex = hiddenColumn.dataIndex + '_' + projShId;
          hiddenColumn.render = (text, row, index) => '';
          footerColumns.push(hiddenColumn);
        } else {
          // ????????????
          let taskResFooter;
          if (editTaskRes.indexOf(projShId + '') > -1) {
            taskResFooter = (
              <TaskResFooterEdit
                data={taskRes}
                projId={projId}
                handleSave={data => {
                  this.resTaskEditSave(data);
                }}
              />
            );
          } else {
            taskResFooter = (
              <TaskResFooter
                data={taskRes}
                projId={projId}
                handleSave={data => {
                  this.resTaskEditSave(data);
                }}
              />
            );
          }
          if (tempColumn.dataIndex.indexOf('res') === 0) {
            tempColumn.render = (text, row, index) => ({
              children: taskResFooter,
              props: {
                colSpan: 6,
              },
            });
            tempColumn.className = 'workbench_task_border';
          } else {
            tempColumn.render = colSpan0;
          }
          footerColumns.push(tempColumn);
        }
      }
    });

    footerColumns.push(Object.assign({}, columns[columns.length - 1]));
    // ????????????
    // const tempLastColumn = Object.assign({}, footerColumns[footerColumns.length-1]);
    // tempLastColumn.className = "workbench_task_border";
    // footerColumns[footerColumns.length-1] = tempLastColumn;

    return footerColumns;
  };

  actExpendRight = () => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        isFold: false,
        projActivityCol: this.projActivityCol,
      },
    });
  };

  actCollapseLeft = () => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        isFold: true,
        projActivityCol: this.projActivityColFold,
      },
    });
  };

  taskResExpendRight = projShId => {
    const {
      dispatch,
      workbench: { hiddenTaskRes },
    } = this.props;
    const index = hiddenTaskRes.indexOf(projShId);
    if (index > -1) {
      hiddenTaskRes.splice(index, 1);
    }
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        hiddenTaskRes,
      },
    });
  };

  taskResCollapseLeft = projShId => {
    const {
      dispatch,
      workbench: { hiddenTaskRes },
    } = this.props;
    hiddenTaskRes.push(projShId);
    const hiddenTaskResSet = Array.from(new Set(hiddenTaskRes));
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        hiddenTaskRes: hiddenTaskResSet,
      },
    });
  };

  taskResExpendAll = () => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        hiddenTaskRes: [],
      },
    });
  };

  taskResCollapseAll = () => {
    const {
      dispatch,
      workbench: { projTaskRes },
    } = this.props;
    const projShIds = projTaskRes.map(res => res.projShId + '');
    const hiddenTaskResSet = Array.from(new Set(projShIds));
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        hiddenTaskRes: hiddenTaskResSet,
      },
    });
  };

  handleTaskResColumns = res => {
    const {
      workbench: { isFold, hiddenTaskRes, editTaskRes },
    } = this.props;

    const columns = [];
    res.forEach((resource, index1) => {
      let temp;
      const editFlag = editTaskRes.indexOf(resource.projShId + '') > -1;
      if (editFlag) {
        temp = this.taskColEditTmpl;
      } else {
        temp = this.taskColTmpl;
      }
      if (hiddenTaskRes.indexOf(resource.projShId + '') > -1) {
        // ?????????????????????
        const hiddenColumn = Object.assign({}, temp[1]);
        hiddenColumn.dataIndex = hiddenColumn.dataIndex + '_' + resource.projShId;
        if (index1 === 0 && isFold) {
          // <div><div className="workbench_act_expend_left" onClick={()=>{this.actExpendRight();}} /><span> ??????</span></div>
          hiddenColumn.title = (
            <div>
              <div
                className="workbench_act_expend_left"
                onClick={() => {
                  this.actExpendRight();
                }}
              />
              <span>{hiddenColumn.title}</span>
            </div>
          );
          hiddenColumn.className += ' workbench_act_expend_left_th';
        }
        hiddenColumn.className += ' workbench_task_border';
        columns.push(hiddenColumn);
      } else {
        // ?????????????????????
        temp.forEach((tempCol, index2) => {
          const clone = Object.assign({}, tempCol);
          clone.dataIndex = tempCol.dataIndex + '_' + resource.projShId;
          if (editFlag && clone.dataIndex.indexOf('res_') > -1) {
            clone.render = (value, row, index) => {
              if (row.phaseFlag === 1) {
                return undefined;
              }
              return row.sumFlag ? (
                ''
              ) : (
                <Checkbox
                  className="x-fill-100"
                  checked={value === 'checked'}
                  onClick={() => {
                    this.resActCheckedToggle(resource.projShId, row, value);
                  }}
                />
              );
            };
          }

          if (index1 === 0 && index2 === 0 && isFold) {
            // <div><div className="workbench_act_expend_left" onClick={()=>{this.actExpendRight();}} /><span> ??????</span></div>
            clone.title = (
              <div>
                <div
                  className="workbench_act_expend_left"
                  onClick={() => {
                    this.actExpendRight();
                  }}
                />
                <span> ??????</span>
              </div>
            );
            clone.className = tempCol.className + ' workbench_act_expend_left_th';
          }
          columns.push(clone);
        });
      }
    });

    return columns;
  };

  /**
   * ?????????????????????
   * @param projShId
   */
  taskResEdit = projShId => {
    const {
      dispatch,
      workbench: { editTaskRes, projTaskResCacheJson },
    } = this.props;
    // ???????????????????????????
    const { tasks, taskId, taskStatus } = projTaskResCacheJson[projShId];
    if (tasks && tasks.length > 0 && !taskId) {
      createMessage({ type: 'warn', description: '????????????????????????!' });
      return;
    }
    if (!taskId) {
      projTaskResCacheJson[projShId].taskName = undefined;
    } else {
      if (taskStatus !== 'CREATE' && taskStatus !== 'IN PROCESS') {
        createMessage({ type: 'warn', description: '?????????????????????????????????!' });
        return;
      }
      if (taskStatus === 'IN PROCESS' && false) {
        createMessage({ type: 'warn', description: '?????????????????????????????????!' });
        return;
      }
    }
    editTaskRes.push(projShId);
    const editTaskResSet = Array.from(new Set(editTaskRes));
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        editTaskRes: editTaskResSet,
      },
    });
    dispatch({
      type: `${DOMAIN}/handleTaskResEditCapasetLevel`,
      payload: {
        projShId,
      },
    });
  };

  /**
   * ??????????????????(??????????????????,??????????????????)
   * @param projShId
   */
  taskResEditSave = projShId => {
    const {
      dispatch,
      workbench: { editTaskRes },
      form,
    } = this.props;

    dispatch({
      type: `${DOMAIN}/taskResSave`,
      payload: {
        projShId,
      },
    });
  };

  taskResEditCancel = (projShId, taskId) => {
    const {
      dispatch,
      workbench: { editTaskRes },
      form,
    } = this.props;

    dispatch({
      type: `${DOMAIN}/refreshTaskRes`,
      payload: {
        projShId,
        taskId,
      },
    });
  };

  switchActNoVisible = () => {
    const {
      dispatch,
      workbench: { actNoVisible },
    } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        actNoVisible: !actNoVisible,
      },
    });
  };

  getColumnSearchProps = dataIndex => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div className="ant-table-filter-dropdown" style={{ padding: 8 }}>
        <Input
          ref={node => {
            this.searchInput = node;
          }}
          placeholder="????????????/??????"
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => this.handleSearch(selectedKeys, confirm)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Button
          type="primary"
          onClick={() => this.handleSearch(selectedKeys, confirm)}
          icon="search"
          size="small"
          style={{ width: 90, marginRight: 8 }}
        >
          ??????
        </Button>
        <Button onClick={() => this.handleReset(clearFilters)} size="small" style={{ width: 90 }}>
          ??????
        </Button>
      </div>
    ),
    filterIcon: filtered => (
      <Icon type="search" style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value, record) => {
      const nameAndNo = record[dataIndex] + record.actNo;
      return nameAndNo
        .toString()
        .toLowerCase()
        .includes(value.toLowerCase());
    },
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => this.searchInput.select());
      }
    },
  });

  handleSearch = (selectedKeys, confirm) => {
    confirm();
    // this.setState({ searchText: selectedKeys[0] });
  };

  handleReset = clearFilters => {
    clearFilters();
    // this.setState({ searchText: '' });
  };

  resActCheckedToggle = (projShId, row, value) => {
    const taskId = row['task_id_' + projShId];
    const taskStatus = row['task_status_' + projShId];
    const resActId = row['res_act_id_' + projShId];
    if (value === 'checked' && taskId && taskStatus && taskStatus !== 'CREATE' && resActId) {
      createMessage({ type: 'warn', description: '?????????????????????!' });
      return;
    }
    const {
      dispatch,
      workbench: { editTaskRes },
      form,
    } = this.props;

    dispatch({
      type: `${DOMAIN}/addOrRemoveResAct`,
      payload: {
        checked: value,
        projShId,
        taskStatus,
        taskId,
        projActId: row.id,
      },
    });
  };

  resActEditSave = data => {
    const { dispatch } = this.props;

    dispatch({
      type: `${DOMAIN}/updateResAct`,
      payload: {
        data,
      },
    });
  };

  resTaskEditSave = data => {
    const { dispatch } = this.props;

    dispatch({
      type: `${DOMAIN}/updateResTask`,
      payload: {
        data,
      },
    });
  };

  handleChangeJobType1 = data => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateJobType1`,
      payload: data,
    });
  };

  handleChangeJobType2 = data => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateJobType2`,
      payload: data,
    });
  };

  /**
   * ?????????????????????
   * @param data
   */
  handleResTaskChange = data => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/refreshTaskRes`,
      payload: { ...data },
    });
  };

  /**
   * ????????????????????????
   * @param data
   */
  handleDistClick = data => {
    const { dispatch } = this.props;
    const { taskId, taskStatus, changeTaskId, changeTaskStatus } = data;
    if (taskId && taskStatus === 'CREATE') {
      dispatch({
        type: `${DOMAIN}/taskDist`,
        payload: { id: taskId, reasonId: taskId, reasonType: 'TASK' },
      });
    } else if (taskStatus === 'IN PROCESS' && changeTaskId && !changeTaskStatus) {
      dispatch({
        type: `${DOMAIN}/taskChangeDist`,
        payload: { changeTaskId },
      });
    }
  };

  /**
   * ??????????????????
   */
  loadMore = () => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/loadMore`,
    });
  };

  render() {
    const {
      workbench: {
        projId,
        isFold,
        workbenchProjectActivities,
        projActivityCol,
        actNoVisible,
        projTaskRes,
        hiddenTaskRes,
        profile,
      },
      form,
      loading,
    } = this.props;

    const columns = [];
    if (projActivityCol[0]) {
      Object.assign(projActivityCol[0], this.getColumnSearchProps('actName'));

      if (actNoVisible) {
        projActivityCol[0].render = (value, row, index) => row.actNo + '-' + value;
      } else {
        projActivityCol[0].render = undefined;
      }
    }

    Array.prototype.push.apply(columns, projActivityCol);

    Array.prototype.push.apply(columns, this.handleTaskResColumns(projTaskRes));

    // ????????????????????????
    // this.handleTaskResData();

    columns.push({
      title: '',
      className: 'workbench_task_border',
      dataIndex: 'faker',
      render: (value, row, index) => value,
    });

    // const titleColumns = [];
    const titleColumns = this.handleTitleColumns(columns);

    // ??????footer columns
    // const footerColumns = [];
    const footerColumns = this.handleFooterColumns(columns);
    const hiddenSize = hiddenTaskRes.length;
    const offsetX =
      (isFold ? 200 : 500) + hiddenSize * 51 + (projTaskRes.length - hiddenSize) * 400;

    const components = {
      body: {
        row: EditableFormRow,
        cell: EditTableCell,
      },
    };

    const editColumns = columns.map(col => {
      if (!col.editable) {
        return {
          ...col,
          onCell: record => ({
            record,
            dataIndex: col.dataIndex,
            title: col.title,
          }),
        };
      }
      return {
        ...col,
        onCell: record => ({
          record,
          dataIndex: col.dataIndex,
          title: col.title,
          editable: true,
          handleSave: this.resActEditSave,
        }),
      };
    });

    const tableProps = {
      rowKey: 'id',
      className: 'workbench_table',
      columns: editColumns,
      // dataSource: [{id: 1,actName:"????????????"}],
      dataSource: workbenchProjectActivities || [{ id: -1, actName: '?????????' }],
      bordered: true,
      pagination: false,
      scroll: { x: offsetX },
      components,
      rowClassName: (record, index) => (record.phaseFlag === 1 ? 'workbench_phase' : '-even-row'),

      title: () => (
        <Table
          className="workbench_table_title"
          columns={titleColumns}
          dataSource={[{ id: 0, actName: '?????????' }]}
          pagination={false}
          rowKey="id"
          scroll={{ x: offsetX }}
          components={components}
          // style={{overflow:"hidden"}}
          // style={{width:"3121px"}}
        />
      ),
      footer: () => (
        <Table
          className="workbench_table_footer"
          columns={footerColumns}
          dataSource={[{ id: 0, actName: '?????????' }]}
          pagination={false}
          rowKey="id"
          scroll={{ x: offsetX }}
          components={components}
          // scroll={{ x: 3121 }}
          // style={{width:"3121px"}}
        />
      ),
    };

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button className="tw-btn-primary" size="large" onClick={() => this.refresh(projId)}>
            ??????
          </Button>
          <Button
            className="tw-btn-primary"
            size="large"
            onClick={() => router.push(`/user/project/projectActivityList?id=${projId}`)}
          >
            {formatMessage({ id: `misc.activity.mgt`, desc: '????????????' })}
          </Button>
          <Button
            className="tw-btn-primary"
            size="large"
            onClick={() => router.push(`/user/project/projectShList?id=${projId}`)}
          >
            {formatMessage({ id: `misc.member.mgt`, desc: '????????????' })}
          </Button>
          <Button
            type="primary"
            size="large"
            onClick={() => {
              this.loadMore();
            }}
          >
            ????????????...
          </Button>
        </Card>
        <Card>
          <Row>
            <span>{profile.projName}</span>
          </Row>
          <Row className="workbench_legend">
            <span>????????????????????????:&nbsp; </span>
            <ul>
              <li>??????--????????????????????????</li>
              <li>
                <i style={{ backgroundColor: 'gray' }} />
                --?????????
              </li>
              <li>
                <i style={{ backgroundColor: 'orange' }} />
                --?????????
              </li>
              <li>
                <i style={{ backgroundColor: 'yellow' }} />
                --?????????
              </li>
              <li>
                <i style={{ backgroundColor: 'blue' }} />
                --?????????
              </li>
              <li>
                <i style={{ backgroundColor: 'green' }} />
                --?????????
              </li>
            </ul>
          </Row>
        </Card>
        <Card className="tw-card-rightLine">
          <EditTableContext.Provider value={form}>
            <Table {...tableProps} id="workbenchTable" loading={loading} />
          </EditTableContext.Provider>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default Workbench;
