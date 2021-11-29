import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Button, Card, Form, Input, Checkbox, DatePicker, Switch } from 'antd';
import classnames from 'classnames';
import update from 'immutability-helper';
import createMessage from '@/components/core/AlertMessage';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import EditableDataTable from '@/components/common/EditableDataTable';
import { formatMessage } from 'umi/locale';
import { genFakeId } from '@/utils/mathUtils';
import { fromQs } from '@/utils/stringUtils';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { closeThenGoto } from '@/layouts/routerControl';
import CsvImportFront from '@/components/common/CsvImportFront';

const DOMAIN = 'userProjectActivity';

@Form.create({
  onFieldsChange(props, changedFields) {
    const { name, value } = Object.values(changedFields)[0];
    props.dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: { [name]: value },
    });
  },
})
@connect(({ loading, userProjectActivity, dispatch }) => ({
  loading,
  userProjectActivity,
  dispatch,
}))
class ProjectActivity extends React.Component {
  componentDidMount() {
    const { dispatch } = this.props;
    const param = fromQs();
    dispatch({
      type: `${DOMAIN}/query`,
      payload: { projId: param.id },
    });
  }

  // 行编辑触发事件
  onCellChanged = (rowIndex, rowField) => rowFieldValue => {
    const {
      userProjectActivity: { dataSource },
      dispatch,
    } = this.props;

    let value = rowFieldValue;
    if (rowField === 'endDate') {
      const { startDate } = dataSource[rowIndex];
      if (startDate && moment(value).isBefore(startDate)) {
        createMessage({ type: 'error', description: '日期不应该早于`起日期`' });
        value = null;
      } else {
        // 日期组件赋值转换
        value = formatDT(value);
      }
    } else if (rowField === 'startDate') {
      const { endDate } = dataSource[rowIndex];
      if (endDate && moment(endDate).isBefore(value)) {
        createMessage({ type: 'error', description: '日期不应该晚于`止日期`' });
        value = null;
      } else {
        // 日期组件赋值转换
        value = formatDT(value);
      }
    } else if (rowField === 'workbenchFlag') {
      value = value === true ? 1 : 0;
    } else {
      // input框赋值转换
      value = value && value.target ? value.target.value : value;
    }

    const newDataSource = update(dataSource, {
      [rowIndex]: {
        [rowField]: {
          $set: value && value.target ? value.target.value : value,
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
    const {
      userProjectActivity: { dataSource },
      dispatch,
    } = this.props;
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

  // 保存按钮事件
  handleSave = () => {
    const {
      dispatch,
      userProjectActivity: { dataSource },
    } = this.props;
    // 获取url上的参数
    const param = fromQs();
    // 校验明细项
    const actNoError = dataSource.filter(v => !v.actNo);
    const actNameError = dataSource.filter(v => !v.actName);
    // const daysError = dataSource.filter(v => !v.days);
    // const eqvaRateError = dataSource.filter(v => !v.eqvaRate);
    const milestoneFlagError = dataSource.filter(
      v => v.milestoneFlag === null || v.milestoneFlag === ''
    );
    const phaseFlagError = dataSource.filter(v => v.phaseFlag === null || v.phaseFlag === '');
    const fromtmplFlagError = dataSource.filter(
      v => v.fromtmplFlag === null || v.fromtmplFlag === ''
    );
    // 浮点数校验
    const re = /^[0-9]+.?[0-9]*$/;
    const daysNotNumError = dataSource.filter(v => !re.test(v.days));
    const eqvaRateNotNumError = dataSource.filter(v => !re.test(v.eqvaRate));

    if (actNoError.length) {
      createMessage({ type: 'error', description: `请填写活动编号` });
      return;
    }
    if (actNameError.length) {
      createMessage({ type: 'error', description: `请填写活动名称` });
      return;
    }
    // if (daysError.length) {
    //   createMessage({ type: 'error', description: `请填写规划时长` });
    //   return;
    // }
    // if (eqvaRateError.length) {
    //   createMessage({ type: 'error', description: `请填写计算当量系数` });
    //   return;
    // }
    if (milestoneFlagError.length) {
      createMessage({ type: 'error', description: `请填写是否里程碑` });
      return;
    }
    if (phaseFlagError.length) {
      createMessage({ type: 'error', description: `请填写是否阶段` });
      return;
    }
    if (fromtmplFlagError.length) {
      createMessage({ type: 'error', description: `请填写模板活动` });
      return;
    }
    // if (daysNotNumError.length) {
    //   createMessage({ type: 'error', description: `规划时长为浮点数` });
    //   return;
    // }
    // if (eqvaRateNotNumError.length) {
    //   createMessage({ type: 'error', description: `计算当量系数为浮点数` });
    //   return;
    // }
    dispatch({
      type: `${DOMAIN}/save`,
      projId: param.id,
    });
  };

  // 自动计算当量
  autoPlanEqva = () => {
    const {
      dispatch,
      userProjectActivity: { dataSource },
    } = this.props;

    dataSource.forEach(data => {
      const { eqvaRate, days } = data;
      if (eqvaRate && days && !Number.isNaN(eqvaRate) && !Number.isNaN(days)) {
        data.planEqva = data.eqvaRate * data.days; // eslint-disable-line
      }
    });
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { dataSource },
    });
  };

  render() {
    const {
      loading,
      dispatch,
      userProjectActivity: { dataSource, deleteList },
    } = this.props;

    // 获取url上的参数
    const param = fromQs();
    const disabledBtn = loading.effects[`${DOMAIN}/query`] || loading.effects[`${DOMAIN}/save`];

    const editTableProps = {
      sortBy: 'id',
      rowKey: 'id',
      total: 0,
      scroll: {
        x: 1340,
      },
      dataSource,
      showCopy: false,
      onAdd: newRow => {
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            dataSource: update(dataSource, {
              $push: [
                {
                  ...newRow,
                  id: genFakeId(-1),
                  milestoneFlag: 0,
                  phaseFlag: 0,
                  fromtmplFlag: 0,
                },
              ],
            }),
          },
        });
      },
      onDeleteItems: (_selectedRowKeys, selectedRows) => {
        // 是否阶段, 选择谁的不可以删
        const isPhaseFlag = selectedRows.filter(row => row.id > 0 && row.phaseFlag === 1);
        if (isPhaseFlag.length)
          createMessage({ type: 'warn', description: '是否阶段为是的不能删除' });
        const filterIsPhaseFlagRowKeys = selectedRows
          .filter(row => !row.phaseFlag)
          .map(row => row.id);
        const newDataSource = dataSource.filter(
          row => !filterIsPhaseFlagRowKeys.filter(keyValue => keyValue === row.id).length
        );
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            dataSource: newDataSource.map((item, index) => ({ ...item })),
            deleteList: [...deleteList, ...filterIsPhaseFlagRowKeys], // 删除可能分多次的。。。直接赋值不对
          },
        });
      },
      columns: [
        {
          title: '活动编码',
          dataIndex: 'actNo',
          required: true,
          align: 'center',
          width: 100,
          render: (value, row, index) => (
            <Input
              defaultValue={value}
              size="small"
              onChange={this.onCellChanged(index, 'actNo')}
            />
          ),
        },
        {
          title: '活动名称',
          dataIndex: 'actName',
          required: true,
          width: 300,
          render: (value, row, index) => (
            <Input
              defaultValue={value}
              size="small"
              onChange={this.onCellChanged(index, 'actName')}
            />
          ),
        },
        {
          title: '规划天数',
          dataIndex: 'days',
          // required: true,
          align: 'right',
          width: 50,
          render: (value, row, index) => (
            <Input defaultValue={value} size="small" onChange={this.onCellChanged(index, 'days')} />
          ),
        },
        {
          title: '当量系数',
          dataIndex: 'eqvaRate',
          // required: true,
          align: 'right',
          width: 50,
          render: (value, row, index) => (
            <Input
              defaultValue={value}
              size="small"
              onChange={this.onCellChanged(index, 'eqvaRate')}
            />
          ),
        },
        {
          title: '规划当量',
          dataIndex: 'planEqva',
          align: 'right',
          width: 50,
          render: (value, row, index) => (
            <Input
              defaultValue={value}
              value={value}
              size="small"
              onChange={this.onCellChanged(index, 'planEqva')}
            />
          ),
        },
        {
          title: '里程碑',
          dataIndex: 'milestoneFlag',
          required: true,
          align: 'center',
          width: 50,
          render: (value, row, index) => (
            <Checkbox
              checked={value === 1}
              onChange={this.onCellCheckBoxChanged(index, 'milestoneFlag')}
            />
          ),
        },
        {
          title: '阶段',
          dataIndex: 'phaseFlag',
          required: false,
          align: 'center',
          width: 50,
          render: (value, row, index) => (
            <Checkbox
              checked={value === 1}
              onChange={this.onCellCheckBoxChanged(index, 'phaseFlag')}
            />
          ),
        },
        {
          title: '模板活动',
          align: 'center',
          dataIndex: 'fromtmplFlag',
          required: false,
          width: 50,
          render: (value, row, index) => <Checkbox checked={value === 1} disabled />,
        },
        {
          title: '起日期',
          dataIndex: 'startDate',
          width: 130,
          render: (value, row, index) => (
            <DatePicker
              value={value && moment(value)}
              size="small"
              onChange={this.onCellChanged(index, 'startDate')}
            />
          ),
        },
        {
          title: '止日期',
          dataIndex: 'endDate',
          width: 130,
          render: (value, row, index) => (
            <DatePicker
              value={value && moment(value)}
              size="small"
              onChange={this.onCellChanged(index, 'endDate')}
            />
          ),
        },
        {
          title: '工作台显示',
          dataIndex: 'workbenchFlag',
          width: 130,
          render: (value, row, index) => (
            <Switch checked={value !== 0} onChange={this.onCellChanged(index, 'workbenchFlag')} />
          ),
        },
        {
          title: '备注',
          dataIndex: 'remark',
          width: 200,
          render: (value, row, index) => (
            <Input value={value} size="small" onChange={this.onCellChanged(index, 'remark')} />
          ),
        },
      ],
      buttons: [
        {
          key: 'upper',
          title: '上移',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 1,
          cb: (_selectedRowKeys, selectedRows) => {
            let targetIndex = 0;

            dataSource.forEach((data, index) => {
              if (data.id === _selectedRowKeys[0]) {
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
            let targetIndex = 0;

            dataSource.forEach((data, index) => {
              if (data.id === _selectedRowKeys[0]) {
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
      ],
    };

    const csvImportProps = {
      fileName: '项目活动导入结果',
      validKeyField: 'actNo',
      validKeyDesc: '活动编码',
      templateUrl: location.origin + `/template/projActivityTemplate.csv`, // eslint-disable-line
      fieldsMap: {
        '*活动编码': 'actNo',
        '*活动名称': 'actName',
        规划天数: 'days',
        当量系数: 'eqvaRate',
        规划当量: 'planEqva',
        起日期: 'startDate',
        止日期: 'endDate',
        备注: 'remark',
        导入结果: 'validFlag',
        导入描述: 'validMsg',
      },
      complete(data) {
        const addList = data.map(insertData => ({
          id: genFakeId(-1),
          milestoneFlag: 0,
          phaseFlag: 0,
          fromtmplFlag: 0,
          ...insertData,
          startDate:
            insertData.startDate && insertData.startDate.length > 0
              ? formatDT(moment(insertData.startDate))
              : undefined,
          endDate:
            insertData.endDate && insertData.endDate.length > 0
              ? formatDT(moment(insertData.endDate))
              : undefined,
        }));
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            dataSource: update(dataSource, {
              $push: addList,
            }),
          },
        });
      },
      valid(data) {
        const actNoList = dataSource.map(dataTemp => dataTemp.actNo);
        const actNameList = dataSource.map(dataTemp => dataTemp.actName);
        data.forEach(row => {
          /* eslint-disable */
          if (actNoList.indexOf(row.actNo) !== -1) {
            row.validFlag = false;
            row.validMsg = '活动编码重复';
          }
          if (actNameList.indexOf(row.actName) !== -1) {
            row.validFlag = false;
            row.validMsg = '活动名称重复';
          }
          actNoList.push(row.actNo);
          actNameList.push(row.actName);
          /* eslint-enable */
        });
      },
    };

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            icon="save"
            size="large"
            loading={disabledBtn}
            onClick={this.handleSave}
          >
            {formatMessage({ id: `misc.save`, desc: '保存' })}
          </Button>
          <Button
            className="tw-btn-primary"
            size="large"
            loading={disabledBtn}
            onClick={this.autoPlanEqva}
          >
            自动计算规划当量
          </Button>
          <CsvImportFront
            className="ant-btn tw-btn-primary ant-btn-lg"
            size="large"
            loading={disabledBtn}
            {...csvImportProps}
          >
            上传活动
          </CsvImportFront>
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => closeThenGoto(`/user/project/projectDetail?id=${param.id}`)}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        <Card
          className="tw-card-adjust"
          title={
            <Title
              icon="profile"
              id="ui.menu.user.project.projectActivityList"
              defaultMessage="活动管理"
            />
          }
        >
          <EditableDataTable loading={disabledBtn} {...editTableProps} scroll={{ x: 1600 }} />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default ProjectActivity;
