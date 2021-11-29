import React, { PureComponent } from 'react';
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Radio,
  Divider,
  Checkbox,
  Icon,
  Tooltip,
} from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import update from 'immutability-helper';
import classnames from 'classnames';
import { ascend, prop, sort, isEmpty } from 'ramda';

import { queryCapaLevelDetSelNew } from '@/services/plat/capa/capa';
import { closeThenGoto, mountToTab } from '@/layouts/routerControl';
import { genFakeId } from '@/utils/mathUtils';
import { UdcSelect, Selection } from '@/pages/gen/field';
import { reValidate } from '@/pages/gen/hint';
import { createConfirm } from '@/components/core/Confirm';
import Title from '@/components/layout/Title';
import AsyncSelect from '@/components/common/AsyncSelect';
import FieldList from '@/components/layout/FieldList';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import EditableDataTable from '@/components/common/EditableDataTable';
import { selectUsersWithBu, selectCapasetLevel } from '@/services/gen/list';
import { TreeSelect } from '@/pages/gen/modal';
import createMessage from '@/components/core/AlertMessage';
import CourseDetail from '../Component/Modal/course';

import styles from './capa.less';

const DOMAIN = 'platCapaCreate';
const { Field, FieldLine } = FieldList;
const CheckboxGroup = Checkbox.Group;
const { Search } = Input;

@connect(({ platCapaCreate }) => ({
  platCapaCreate,
}))
@Form.create({
  onValuesChange(props, changedValues, allValues) {
    if (!isEmpty(changedValues)) {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: changedValues,
      });
    }
  },
})
@mountToTab()
class CapaCreate extends PureComponent {
  state = {
    visible: false,
    courseDetailShow: false,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/clean`,
    }).then(() => {
      dispatch({
        type: `${DOMAIN}/queryLevelList`,
      });
    });
    dispatch({
      type: `${DOMAIN}/queryCourseTreeData`,
    });
    dispatch({
      type: `${DOMAIN}/queryCapasetLevelData`,
    });
  }

  onCellChanged = (rowIndex, rowField) => rowFieldValue => {
    const {
      dispatch,
      platCapaCreate: { dataList },
    } = this.props;

    if (rowField === 'leveldId') {
      const haveSameId = dataList.find(
        item => parseInt(item.leveldId, 10) === parseInt(rowFieldValue, 10)
      );
      if (haveSameId) {
        createMessage({ type: 'warn', description: '级别不可重复定义' });
        return;
      }
    }
    // 更新单元格状态
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        dataList: update(dataList, {
          [rowIndex]: {
            [rowField]: {
              $set:
                rowFieldValue && rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue,
            },
          },
        }),
      },
    });
  };

  onCellChanged2 = (rowIndex, rowField) => rowFieldValue => {
    const {
      dispatch,
      platCapaCreate: { dataList2 },
    } = this.props;
    // if (rowField === 'examPoint') {
    //   const haveSameExamPoint = dataList2.find(item => item.examPoint === rowFieldValue);
    //   if (haveSameExamPoint) {
    //     createMessage({ type: 'warn', description: '考核点不可重复定义' });
    //     return;
    //   }
    // }
    const changeValue = {
      [rowIndex]: {
        [rowField]: {
          $set: rowFieldValue && rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue,
        },
      },
    };
    if (rowField === 'apprType') {
      changeValue[rowIndex].apprRes = {
        $set: '',
      };
    }
    if (rowField === 'examMethod') {
      changeValue[rowIndex].examPoint = {
        $set: '',
      };
      changeValue[rowIndex].apprType = {
        $set: '',
      };
      changeValue[rowIndex].apprRes = {
        $set: '',
      };
      changeValue[rowIndex].courseCertNo = {
        $set: '',
      };
    }
    if (
      (rowField === 'examMethod' && rowFieldValue === 'SYS') ||
      (rowField === 'examMethod' && rowFieldValue === 'ONLINE')
    ) {
      changeValue[rowIndex].apprType = {
        $set: 'NO_APPR',
      };
    }
    // 更新单元格状态
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        dataList2: update(dataList2, changeValue),
      },
    });
  };

  onCellChangedChecked = (rowIndex, rowField) => rowFieldValue => {
    const {
      dispatch,
      platCapaCreate: { dataList2 },
    } = this.props;
    // 更新单元格状态
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        dataList2: update(dataList2, {
          [rowIndex]: {
            [rowField]: {
              $set: rowFieldValue.target.checked,
            },
          },
        }),
      },
    });
  };

  // 行编辑触发事件
  onexamPointCellChanged = (index, value, name) => {
    const {
      platCapaCreate: { dataList2 },
      dispatch,
    } = this.props;

    const newDataSource = dataList2;
    newDataSource[index] = {
      ...newDataSource[index],
      [name]: value,
    };
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { dataList2: newDataSource },
    });
  };

  examPointContent = (examType, index, value, row) => {
    const { dispatch } = this.props;
    const { id, lessonId } = row;

    let examPointComponent = <></>;

    switch (examType) {
      case 'SYS':
        examPointComponent = (
          <Selection.UDC
            code="RES:SYS_EXAM_POINT"
            placeholder="请选择考核点"
            value={value}
            // onChange={this.onCellChanged2(index, 'examPoint')}
            onValueChange={e => {
              this.onexamPointCellChanged(index, e.code, 'examPointVal');
              this.onexamPointCellChanged(index, e.name, 'examPoint');
            }}
          />
        );
        break;
      case 'CERT':
        examPointComponent = (
          <Selection.UDC
            code="RES:EXAM_CERTIFICATE"
            placeholder="请选择考核点"
            value={value}
            // onChange={this.onCellChanged2(index, 'examPoint')}
            onValueChange={e => {
              this.onexamPointCellChanged(index, e.code, 'examPointVal');
              this.onexamPointCellChanged(index, e.name, 'examPoint');
            }}
          />
        );
        break;
      case 'ONLINE':
        examPointComponent = (
          <div className={styles.inputWrap}>
            <Input
              // value={value}
              disabled
              addonBefore={
                <span
                  className={styles.courseName}
                  onClick={() => {
                    this.setState({
                      courseDetailShow: true,
                    });
                    dispatch({
                      type: `${DOMAIN}/queryCourseDetail`,
                      payload: {
                        id: lessonId,
                      },
                    });
                  }}
                >
                  {value}
                </span>
              }
              addonAfter={
                <a
                  className="tw-link-primary"
                  onClick={() => {
                    this.setState({
                      visible: true,
                      onlinePonitId: id,
                      searchProgName: null,
                    });
                    dispatch({
                      type: `${DOMAIN}/updateState`,
                      payload: {
                        courseTreeDataDetail: [],
                        courseTreeDataDetailTotal: 0,
                        courseTreeDataDetailTmp: [],
                        courseTreeDataDetailTotalTmp: 0,
                      },
                    });
                  }}
                >
                  <Icon type="search" />
                </a>
              }
            />
          </div>
        );
        break;
      case 'MANUAL':
        examPointComponent = (
          <Input
            placeholder="请输入考核点"
            value={value}
            onChange={this.onCellChanged2(index, 'examPoint')}
          />
        );
        break;
      default:
        examPointComponent = <></>;
    }
    // console.error('------', examType, index, value, examPointComponent);

    return examPointComponent;
  };

  apprResContent = (apprType, index, value) => {
    let apprResComponent = <></>;
    const {
      platCapaCreate: { capasetLevelData = [] },
    } = this.props;
    if (apprType === 'ASSIGN_RES') {
      apprResComponent = (
        <Selection.Columns
          value={value || []}
          source={selectUsersWithBu}
          onChange={this.onCellChanged2(index, 'apprRes')}
          columns={[
            { dataIndex: 'code', title: '编号', span: 10 },
            { dataIndex: 'name', title: '名称', span: 14 },
          ]}
          transfer={{ key: 'id', code: 'id', name: 'name' }}
          placeholder="请选择审核人"
          showSearch
          mode="multiple"
        />
      );
    } else if (apprType === 'BY_CAPASET') {
      apprResComponent = (
        <div className={styles['approval-box']}>
          <Selection.Columns
            value={value}
            onChange={this.onCellChanged2(index, 'apprRes')}
            source={capasetLevelData || []}
            transfer={{ key: 'id', code: 'id', name: 'name' }}
            placeholder="请选择审核人"
            limit={20}
            showSearch
          />
          <Checkbox onClick={this.onCellChangedChecked(index, 'levelFlag')} />
          <span className={styles['approval-text']}>以上</span>
        </div>
      );
    } else {
      apprResComponent = <Input type="text" disabled />;
    }
    return apprResComponent;
  };

  levelCapaResolve = res => {
    const {
      platCapaCreate: { dataList, leveDetaillList },
    } = this.props;
    const levelCapaAbilityEntityList = res.map(row => {
      const keys = Object.keys(row);
      const newRow = Object.assign({}, row);
      newRow.leveldIdList = keys
        .filter(item => item.includes('leveldIdList-'))
        .filter(item => newRow[item] === true)
        .map(item => item.split('-')[1])
        .map(item => {
          const leveldId = parseInt(item, 10);
          const { name = '' } = leveDetaillList.find(
            levelItem => leveldId === parseInt(levelItem.id, 10)
          );
          const { cdDesc = '' } = dataList.find(
            levelItem => leveldId === parseInt(levelItem.leveldId, 10)
          );
          const itemObj = {
            id: '',
            leveldId,
            ddesc: cdDesc,
            leveldName: name,
          };
          return itemObj;
        });

      if (newRow.apprType && newRow.apprType === 'ASSIGN_RES') {
        newRow.apprRes = newRow.apprRes.join(',');
      }
      if (newRow.examMethod === 'SYS' || newRow.examMethod === 'ONLINE') {
        newRow.apprRes = '';
      }
      newRow.id = null;
      return newRow;
    });
    return levelCapaAbilityEntityList;
  };

  levelResolve = res => {
    const levelCapaAbilityEntityList = res.map(row => {
      const newRow = Object.assign({}, row);
      newRow.leveldId = parseInt(newRow.leveldId, 10);
      newRow.id = null;
      return newRow;
    });
    return levelCapaAbilityEntityList;
  };

  handleSave = jumpPath => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
      platCapaCreate: { formData, dataList, dataList2 },
    } = this.props;
    validateFieldsAndScroll(error => {
      if (!error) {
        if (formData.hasLevelFlag) {
          if (!(dataList && dataList.length > 0)) {
            createMessage({ type: 'warn', description: '级别定义至少需要一条数据' });
            return;
          }
          if (dataList && dataList.length > 0) {
            const emptyLeveldId = dataList.find(item => !item.leveldId);
            if (emptyLeveldId) {
              createMessage({ type: 'warn', description: '级别明细不可为空' });
              return;
            }
          }
        }
        if (!(dataList2 && dataList2.length > 0)) {
          createMessage({ type: 'warn', description: '考核点至少需要一条数据' });
          return;
        }
        // 考核点不可以重复

        if (dataList2 && dataList2.length > 0) {
          const emptyExamMethod = dataList2.find(item => !item.examMethod);
          const emptyExamPoint = dataList2.find(item => !item.examPoint);
          const emptyApprType = dataList2.find(
            item => !item.apprType && item.examMethod !== 'SYS' && item.examMethod !== 'ONLINE'
          );
          const emptyApprRes = dataList2.find(
            item =>
              (!item.apprRes && item.apprType === 'BY_CAPASET') ||
              (!item.apprRes && item.apprType === 'ASSIGN_RES')
          );
          const emptyCourseNo = dataList2.find(
            item => !item.lessonId && item.examMethod === 'ONLINE'
          );
          // const emptycourseCertNo = dataList2.find(
          //   item => !item.courseCertNo && item.examMethod === 'ONLINE'
          // );

          const clearDataList = new Set(
            dataList2.map(m => String(m.examMethod) + String(m.examPoint))
          );
          const repeatExamPoint = clearDataList.size !== dataList2.length;

          if (emptyExamMethod) {
            createMessage({ type: 'warn', description: '考核方式不可为空' });
            return;
          }
          if (emptyExamPoint) {
            createMessage({ type: 'warn', description: '考核点不可为空' });
            return;
          }
          if (repeatExamPoint) {
            createMessage({ type: 'warn', description: '考核点不可重复' });
            return;
          }
          if (emptyCourseNo) {
            createMessage({ type: 'warn', description: '考核方式为在线培训时,培训课程不可为空' });
            return;
          }
          // if (emptycourseCertNo) {
          //   createMessage({ type: 'warn', description: '培训证书不可为空' });
          //   return;
          // }
          if (emptyApprType) {
            createMessage({ type: 'warn', description: '审核人类型不可为空' });
            return;
          }
          if (emptyApprRes) {
            createMessage({
              type: 'warn',
              description: '审核人类型为指定资源或按能力时审核人不可为空',
            });
            return;
          }
        }
        const params = {
          ...formData,
          hasLevelFlag: formData.hasLevelFlag === 1,
          capaLevelNewViewList: this.levelResolve(dataList),
          capaAbilityEntityList: this.levelCapaResolve(dataList2),
        };
        // console.error('params', params);

        const leavelIdArray = [];
        params.capaLevelNewViewList.map(item => {
          leavelIdArray.push(item.leveldId);
          return item;
        });
        // console.error('leavelIdArray', leavelIdArray);
        const choseLeavelIdArray = [];
        params.capaAbilityEntityList.map(item => {
          item.leveldIdList.map(lItem => {
            choseLeavelIdArray.push(lItem.leveldId);
            return lItem;
          });

          return item;
        });
        // console.error('choseLeavelIdArray', choseLeavelIdArray);
        let allLeaveChose = true;
        for (let i = 0; i < leavelIdArray.length; i += 1) {
          if (choseLeavelIdArray.indexOf(leavelIdArray[i]) === -1) {
            allLeaveChose = false;
          }
        }

        if (!allLeaveChose && formData.hasLevelFlag) {
          createMessage({ type: 'warn', description: '各级别至少需要一个考核点' });
          return;
        }
        const ponitNoLeave = params.capaAbilityEntityList.find(
          item => !item.leveldIdList || (item.leveldIdList && item.leveldIdList.length === 0)
        );
        if (ponitNoLeave && formData.hasLevelFlag) {
          const ponitName = ponitNoLeave.examPoint;
          createMessage({ type: 'warn', description: `考核点“${ponitName}”未关联任何级别 ` });
          return;
        }

        dispatch({
          type: `${DOMAIN}/save`,
          payload: params,
        }).then(rst => rst && closeThenGoto(jumpPath(rst)));
      }
    });
  };

  handleCancel = () => {
    createConfirm.warning({
      content: '确定要离开吗？您填写的数据将不会被保存。',
      onOk: () => closeThenGoto(`/hr/capacity/main`),
    });
  };

  // 分类一 -> 分类二
  handleChangeType1 = value => {
    const { dispatch, form } = this.props;
    dispatch({
      type: `${DOMAIN}/updateListType2`,
      payload: value,
    }).then(() => {
      form.setFieldsValue({
        capaType2: null,
      });
    });
  };

  // 切换弹出窗。
  toggleVisible = () => {
    const { visible } = this.state;
    this.setState({
      visible: !visible,
    });
  };

  onToggle = () => {
    const { courseDetailShow } = this.state;
    this.setState({
      courseDetailShow: !courseDetailShow,
    });
  };

  fetchData = params => {
    const {
      dispatch,
      platCapaCreate: { courseTreeData = [] },
    } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        courseTreeDataDetail: [],
        courseTreeDataDetailTotal: 0,
        fetchDataLoading: true,
      },
    });
    const { id = [] } = params;
    let ctdItem = {};
    const getCtdItem = ctd => {
      ctd.forEach(cItem => {
        const haveCtd = parseInt(cItem.id, 10) === parseInt(id[0], 10);
        if (haveCtd) {
          ctdItem = cItem;
          return;
        }
        if (!haveCtd && cItem.child && cItem.child.length > 0) {
          getCtdItem(cItem.child);
        }
      });
    };
    getCtdItem(courseTreeData);
    const ids = [];
    ids.push(ctdItem.id);
    if (ctdItem.child && ctdItem.child.length > 0) {
      const getIdFn = ctd => {
        ctd.forEach(item => {
          ids.push(item.id);
          if (item.child && item.child.length > 0) {
            getIdFn(item.child);
          }
        });
      };
      getIdFn(ctdItem.child);
    }
    dispatch({
      type: `${DOMAIN}/queryCourseTreeDataDetail`,
      payload: { id: ids || [] },
    });
    this.setState({
      searchProgName: null,
    });
  };

  handleModelOk = (e, checkedKey, checkRow) => {
    const {
      platCapaCreate: { dataList2 = [] },
      dispatch,
    } = this.props;
    const { onlinePonitId } = this.state;
    const { progName, id, certNo } = checkRow;
    const newDataList2 = dataList2.map(item => {
      const newItem = Object.assign({}, item);
      if (onlinePonitId === item.id) {
        newItem.examPoint = progName;
        newItem.lessonId = id;
        newItem.courseCertNo = certNo;
      }
      return newItem;
    });

    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        dataList2: newDataList2,
      },
    });
    this.toggleVisible();
  };

  capaSearch = () => {
    const {
      dispatch,
      platCapaCreate: {
        courseTreeDataDetail,
        courseTreeDataDetailTotal = 0,
        courseTreeDataDetailTmp,
        courseTreeDataDetailTotalTmp,
      },
    } = this.props;
    const { searchProgName } = this.state;

    if (searchProgName) {
      if (!courseTreeDataDetailTotalTmp) {
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            fetchDataLoading: true,
          },
        });
        dispatch({
          type: `${DOMAIN}/searchCapaTreeDataDetail`,
          payload: { progName: searchProgName },
        });
      } else {
        const newCourseTreeDataDetail = courseTreeDataDetailTmp.filter(
          item =>
            (item.progName && item.progName.includes(searchProgName)) ||
            (item.certNo && item.certNo.includes(searchProgName))
        );
        const newCourseTreeDataDetailTotal = newCourseTreeDataDetail
          ? newCourseTreeDataDetail.length
          : 0;
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            courseTreeDataDetail: newCourseTreeDataDetail,
            courseTreeDataDetailTotal: newCourseTreeDataDetailTotal,
          },
        });
      }
    } else {
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          courseTreeDataDetail: courseTreeDataDetailTmp,
          courseTreeDataDetailTotal: courseTreeDataDetailTotalTmp,
        },
      });
    }
  };

  render() {
    const {
      form,
      loading,
      dispatch,
      form: { getFieldDecorator },
      platCapaCreate: {
        formData,
        dataList = [],
        dataList2 = [],
        levelList,
        type2Data,
        leveDetaillList,
        courseTreeData,
        courseTreeDataDetail,
        courseTreeDataDetailTotal = 0,
        fetchDataLoading,
        courseDetail = {},
      },
    } = this.props;
    const { visible, courseDetailShow, onlinePonitId, searchProgName } = this.state;
    const tablePropsCheckpointNewColumns = [];
    const byId = ascend(prop('leveldId'));
    let newDataList = dataList.map(item => {
      const newItem = Object.assign({}, item);
      newItem.leveldId = parseInt(newItem.leveldId, 10);
      return newItem;
    });
    newDataList = sort(byId)(newDataList);
    newDataList.forEach(item => {
      if (item.leveldId) {
        const leveldId = parseInt(item.leveldId, 10);
        const levelTitle = leveDetaillList.find(levelItem => leveldId === levelItem.id).name;
        const columns = {
          title: levelTitle,
          dataIndex: `leveldIdList-${leveldId}`,
          key: `leveldIdList-${leveldId}`,
          align: 'center',
          width: 100,
          render: (value, row, index) => (
            <Checkbox
              checked={value}
              className={styles['special-checkbox']}
              onChange={this.onCellChangedChecked(index, `leveldIdList-${item.leveldId}`)}
            />
          ),
        };
        tablePropsCheckpointNewColumns.push(columns);
      }
    });
    const tablePropsCheckpoint = {
      rowKey: 'id',
      loading: false,
      pagination: false,
      dataSource: dataList2,
      total: dataList2.length || 0,
      scroll: {
        x: 950 + tablePropsCheckpointNewColumns.length * 100,
      },
      showCopy: false,
      onAdd: newRow => {
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            dataList2: update(dataList2, {
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
      onDeleteItems: (selectedRowKeys, selectedRows) => {
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            dataList2: dataList2.filter(
              row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length
            ),
          },
        });
      },
      columns: [
        {
          title: '考核方式',
          dataIndex: 'examMethod',
          required: true,
          key: 'examMethod',
          width: 180,
          render: (value, row, index) => (
            <Selection.UDC
              value={value}
              code="RES:EXAM_METHOD"
              placeholder="请选择考核方式"
              onChange={this.onCellChanged2(index, 'examMethod')}
            />
          ),
        },
        {
          title: '考核点',
          dataIndex: 'examPoint',
          required: true,
          key: 'examPoint',
          width: 250,
          render: (value, row, index) =>
            this.examPointContent(dataList2[index].examMethod, index, value, row),
        },
        {
          title: '审核人类型',
          dataIndex: 'apprType',
          required: true,
          key: 'apprType',
          width: 160,
          render: (value, row, index) => (
            <Selection.UDC
              value={row.examMethod === 'SYS' || row.examMethod === 'ONLINE' ? 'NO_APPR' : value}
              code="RES:APPR_TYPE"
              placeholder="请选择考核点"
              onChange={this.onCellChanged2(index, 'apprType')}
              disabled={row.examMethod === 'SYS' || row.examMethod === 'ONLINE'}
            />
          ),
        },
        {
          title: '审核人',
          dataIndex: 'apprRes',
          key: 'apprRes',
          width: 360,
          render: (value, row, index) =>
            this.apprResContent(dataList2[index].apprType, index, value),
        },
        ...tablePropsCheckpointNewColumns,
      ],
      buttons: [],
    };

    const tablePropsLevel = {
      rowKey: 'id',
      loading: false,
      pagination: false,
      dataSource: dataList,
      total: dataList.length || 0,
      showCopy: false,
      onAdd: newRow => {
        if (formData.hasLevelFlag) {
          if (!formData.levelId) {
            createMessage({ type: 'warn', description: '请先选择级别' });
            return;
          }
          dispatch({
            type: `${DOMAIN}/updateState`,
            payload: {
              dataList: update(dataList, {
                $push: [
                  {
                    ...newRow,
                    id: genFakeId(-1),
                  },
                ],
              }),
            },
          });
        }
      },
      onDeleteItems: (selectedRowKeys, selectedRows) => {
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            dataList: dataList.filter(
              row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length
            ),
          },
        });
      },
      columns: [
        {
          title: '级别明细',
          dataIndex: 'leveldId',
          required: true,
          key: 'leveldId',
          render: (value, row, index) =>
            formData.hasLevelFlag && formData.levelId ? (
              <Selection.Columns
                key={formData.levelId}
                value={value}
                source={leveDetaillList}
                onChange={this.onCellChanged(index, 'leveldId')}
                transfer={{ key: 'id', code: 'code', name: 'name' }}
                placeholder="请选择级别明细"
              />
            ) : (
              <span>空</span>
            ),
        },

        {
          title: '能力描述',
          dataIndex: 'cdDesc',
          key: 'cdDesc',
          render: (value, row, index) => (
            <Input.TextArea value={value} onChange={this.onCellChanged(index, 'cdDesc')} rows={1} />
          ),
        },
      ],
      buttons: [],
    };

    const tableColumns = [
      {
        title: '培训项目',
        dataIndex: 'progName',
        key: 'progName',
        render: (value, rowData, key) => {
          const { id } = rowData;
          let newValue = value;
          if (value && value.length > 30) {
            newValue = value.substring(0, 30) + '...';
          }
          return (
            <Tooltip title={value}>
              <span
                className={styles.progName}
                onClick={() => {
                  this.setState({
                    courseDetailShow: true,
                  });
                  dispatch({
                    type: `${DOMAIN}/queryCourseDetail`,
                    payload: {
                      id,
                    },
                  });
                }}
              >
                {newValue}
              </span>
            </Tooltip>
          );
        },
      },
      {
        title: '证书编号',
        dataIndex: 'certNo',
        key: 'certNo',
        align: 'center',
        width: 200,
      },
      {
        title: '简介',
        dataIndex: 'progDesc',
        key: 'progDesc',
        width: 250,
        render: (value, rowData, key) => {
          let newValue = value;
          if (value && value.length > 20) {
            newValue = value.substring(0, 20) + '...';
          }
          return (
            <Tooltip title={<pre>{value}</pre>}>
              <div className={styles.progDesc}>{newValue}</div>
            </Tooltip>
          );
        },
      },
    ];

    const rowSelection = {
      selectedRowKeys: [onlinePonitId],
    };

    return (
      <PageHeaderWrapper title="能力新增页">
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            type="primary"
            icon="save"
            size="large"
            onClick={() => this.handleSave(() => '/hr/capacity/main')}
          >
            保存
          </Button>
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={this.handleCancel}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>

        <Card
          title={
            <Title
              icon="profile"
              id="ui.menu.hr.capacity.capa.create"
              defaultMessage="单项能力新增"
            />
          }
          className="tw-card-adjust"
          bordered={false}
        >
          <FieldList
            layout="horizontal"
            // legend="能力"
            getFieldDecorator={getFieldDecorator}
            col={2}
          >
            <Field
              name="capaNo"
              label="编号"
              decorator={{
                initialValue: formData.capaNo,
                rules: [
                  {
                    required: false,
                    message: '请输入编号',
                  },
                ],
              }}
            >
              <Input placeholder="请输入编号" />
            </Field>
            <Field
              name="capaName"
              label="能力名称"
              decorator={{
                initialValue: formData.capaName,
                rules: [
                  {
                    required: true,
                    message: '请输入能力名称',
                  },
                ],
              }}
            >
              <Input placeholder="请输入能力名称" />
            </Field>
            <FieldLine label="分类" required>
              <Field
                name="capaType1"
                wrapperCol={{ span: 23, xxl: 23 }}
                decorator={{
                  initialValue: formData.capaType1,
                  rules: [
                    {
                      required: true,
                      message: '请选择分类一',
                    },
                  ],
                }}
              >
                <UdcSelect
                  code="RES.CAPACITY_TYPE1"
                  placeholder="请选择分类一"
                  onChange={this.handleChangeType1}
                />
              </Field>
              <Field
                name="capaType2"
                wrapperCol={{ span: 23, offset: 1, xxl: 23 }}
                decorator={{
                  initialValue: formData.capaType2,
                  rules: [
                    {
                      required: true,
                      message: '请选择分类二',
                    },
                  ],
                }}
              >
                <Selection.Columns
                  className="x-fill-100"
                  source={type2Data}
                  transfer={{ key: 'code', code: 'code', name: 'name' }}
                  showSearch
                  placeholder="请选择分类二"
                />
              </Field>
            </FieldLine>
            <Field
              label="有无级别 "
              name="hasLevelFlag"
              decorator={{
                initialValue: formData.hasLevelFlag,
                rules: [
                  {
                    required: true,
                    message: '请选择一项',
                  },
                ],
              }}
            >
              <Radio.Group
                onChange={e => {
                  if (e.target.value === 1) {
                    dispatch({
                      type: `${DOMAIN}/queryLevelList`,
                    });
                  } else {
                    form.setFieldsValue({
                      levelId: null,
                    });
                    dispatch({
                      type: `${DOMAIN}/updateState`,
                      payload: {
                        levelList: [],
                        dataList: [],
                      },
                    });
                  }
                }}
              >
                <Radio value={0}>无</Radio>
                <Radio value={1}>有</Radio>
              </Radio.Group>
            </Field>
            <Field
              label="级别 "
              name="levelId"
              decorator={{
                initialValue: formData.levelId,
                rules: [
                  {
                    required: formData.hasLevelFlag,
                    message: '请选择级别名称',
                  },
                ],
              }}
            >
              <Selection.Columns
                className="x-fill-100"
                source={levelList}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                showSearch
                placeholder="请选择级别名称"
                disabled={!formData.hasLevelFlag}
                onChange={e => {
                  dispatch({
                    type: `${DOMAIN}/updateState`,
                    payload: {
                      dataList: [],
                      leveDetaillList: [],
                    },
                  });
                  if (e) {
                    dispatch({
                      type: `${DOMAIN}/queryLeveDetaillList`,
                      payload: {
                        id: e,
                      },
                    });
                  }
                }}
              />
            </Field>
            <Field
              name="capaStatus"
              label="状态"
              decorator={{
                initialValue: formData.capaStatus || 'ACTIVE',
                rules: [
                  {
                    required: true,
                    message: '请选择一项',
                  },
                ],
              }}
            >
              <Radio.Group
                onChange={e => {
                  formData.capaStatus = e.target.value;
                }}
              >
                <Radio value="ACTIVE">有效</Radio>
                <Radio value="INACTIVE">无效</Radio>
              </Radio.Group>
            </Field>
            {!formData.hasLevelFlag ? (
              <Field
                name="ddesc"
                label="能力描述"
                decorator={{
                  initialValue: formData.ddesc,
                  rules: [
                    {
                      required: false,
                      message: '请选择一项',
                    },
                  ],
                }}
                fieldCol={1}
                labelCol={{ span: 4, xxl: 3 }}
                wrapperCol={{ span: 19, xxl: 20 }}
              >
                <Input.TextArea placeholder="" rows={3} />
              </Field>
            ) : (
              ''
            )}
          </FieldList>
          <Divider dashed />
          {formData.hasLevelFlag === 1 ? (
            <FieldList legend="级别定义" noReactive>
              <EditableDataTable
                key={[formData.hasLevelFlag, formData.levelId].join('_')}
                {...tablePropsLevel}
              />
              <Divider dashed />
            </FieldList>
          ) : (
            ''
          )}

          <FieldList legend=" 考核点" noReactive>
            <EditableDataTable
              key={[formData.hasLevelFlag, formData.levelId].join('_')}
              {...tablePropsCheckpoint}
            />
          </FieldList>
        </Card>
        <TreeSelect
          title="培训项目"
          domain={DOMAIN}
          visible={visible}
          dispatch={dispatch}
          fetchData={this.fetchData}
          dataSource={courseTreeDataDetail}
          tableColumns={tableColumns}
          multiple={false}
          loading={fetchDataLoading}
          total={courseTreeDataDetailTotal}
          onOk={this.handleModelOk}
          onCancel={this.toggleVisible}
          treeData={courseTreeData}
          tableRowKey="id"
          rowSelection={rowSelection}
          checkable={false}
          searchContent={
            <div
              style={{
                textAlign: 'center',
              }}
            >
              培训项目/证书号码
              <div
                style={{
                  display: 'inline-block',
                  margin: '0 15px',
                  width: '320px',
                }}
              >
                <Input
                  placeholder="按培训项目/证书号码查询"
                  value={searchProgName}
                  onChange={e => {
                    this.setState({
                      searchProgName: e.target.value,
                    });
                  }}
                  onPressEnter={() => {
                    this.capaSearch();
                  }}
                />
              </div>
              <Button
                className="tw-btn-primary"
                icon="search"
                type="primary"
                size="large"
                onClick={() => {
                  this.capaSearch();
                }}
              >
                查询
              </Button>
            </div>
          }
        />
        <CourseDetail
          visible={courseDetailShow}
          courseDetail={courseDetail}
          onToggle={this.onToggle}
        />
      </PageHeaderWrapper>
    );
  }
}

export default CapaCreate;
