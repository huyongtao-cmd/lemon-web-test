import React, { PureComponent } from 'react';
import { Button, Card, Form, Input, InputNumber, Radio, Divider, Checkbox, Tooltip } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import update from 'immutability-helper';
import classnames from 'classnames';
import { ascend, prop, sort, isEmpty } from 'ramda';

import { queryCapaLevelDetSel } from '@/services/plat/capa/capa';
import { closeThenGoto, mountToTab } from '@/layouts/routerControl';
import { genFakeId } from '@/utils/mathUtils';
import { UdcSelect, Selection } from '@/pages/gen/field';
import { reValidate } from '@/pages/gen/hint';
import { createConfirm } from '@/components/core/Confirm';
import Title from '@/components/layout/Title';
import FieldList from '@/components/layout/FieldList';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import EditableDataTable from '@/components/common/EditableDataTable';
import { selectUsersWithBu, selectCapasetLevel } from '@/services/gen/list';
import createMessage from '@/components/core/AlertMessage';
import { TreeSelect } from '@/pages/gen/modal';
import styles from './capa.less';

const DOMAIN = 'platCapaSetCreate';
const { Field, FieldLine } = FieldList;

@connect(({ loading, platCapaSetCreate }) => ({
  ...platCapaSetCreate,
}))
@Form.create({
  onValuesChange(props, changedValues, allValues) {
    if (!isEmpty(changedValues)) {
      // eslint-disable-next-line no-prototype-builtins
      if (changedValues.hasOwnProperty('requestApply') && changedValues.requestApply === 'NO') {
        // 首次申请是否审批为NO时 清掉首次申请审批人相关值
        props.dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: {
            ...changedValues,
            applyStatus: void 0,
            applyResId: void 0,
            above: false,
          },
        });
        // eslint-disable-next-line no-prototype-builtins
      } else if (changedValues.hasOwnProperty('applyStatus')) {
        props.dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: {
            ...changedValues,
            applyResId: void 0,
            above: false,
          },
        });
      } else {
        props.dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: changedValues,
        });
      }
    }
  },
})
@mountToTab()
class CapaSetCreate extends PureComponent {
  state = {
    visible: false,
  };

  componentDidMount() {
    const { dispatch } = this.props;

    dispatch({
      type: `${DOMAIN}/clean`,
    }).then(() => {
      dispatch({
        type: `${DOMAIN}/queryLevelList`,
      });

      dispatch({
        type: `${DOMAIN}/queryCapaTreeData`,
      });

      dispatch({
        type: `${DOMAIN}/queryRes`,
      });
    });
  }

  onCellChanged = (rowIndex, rowField) => rowFieldValue => {
    const { dispatch, dataList } = this.props;
    if (rowField === 'leveldId') {
      const haveSameId = dataList.find(
        item => parseInt(item.leveldId, 10) === parseInt(rowFieldValue, 10)
      );
      if (haveSameId) {
        createMessage({ type: 'warn', description: '级别不可重复定义' });
        return;
      }
    }
    const changeValue = {
      [rowIndex]: {
        [rowField]: {
          $set: rowFieldValue && rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue,
        },
      },
    };
    if (rowField === 'obtainMethod') {
      changeValue[rowIndex].apprType = {
        $set: '',
      };
      changeValue[rowIndex].apprRes = {
        $set: '',
      };
    }
    if (rowField === 'obtainMethod' && rowFieldValue === 'AUTO') {
      changeValue[rowIndex].apprType = {
        $set: 'NO_APPR',
      };
    }
    if (rowField === 'apprType') {
      changeValue[rowIndex].apprRes = {
        $set: '',
      };
    }
    // 更新单元格状态
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        dataList: update(dataList, changeValue),
      },
    });
  };

  capaResolve = res => {
    const levelCapaAbilityEntityList = res.map(row => {
      const keys = Object.keys(row);
      const newRow = {};
      newRow.capaSetLevelIdList = keys
        .filter(item => item.includes('leveldIdList-'))
        .filter(item => row[item] === true)
        .map(item => parseInt(item.split('-')[1], 10));
      newRow.capaLevelId = parseInt(row.capaLevelId, 10);
      newRow.id = null;
      return newRow;
    });

    return levelCapaAbilityEntityList;
  };

  levelResolve = res => {
    const levelCapaAbilityEntityList = res.map(row => {
      const newRow = Object.assign({}, row);
      if (
        newRow.apprType &&
        newRow.apprType === 'ASSIGN_RES' &&
        newRow.apprRes &&
        Array.isArray(newRow.apprRes)
      ) {
        newRow.apprRes = newRow.apprRes.join(',');
      }
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
      formData,
      dataList,
      dataList2,
    } = this.props;

    const cdDescError = dataList.filter(v => v.cdDesc && v.cdDesc.length > 500);
    if (cdDescError.length) {
      createMessage({ type: 'error', description: '能力描述字数不能超过500' });
      return;
    }
    validateFieldsAndScroll(error => {
      if (!error) {
        const hasLevelFlag = formData.hasLevelFlag === 1;
        if (hasLevelFlag) {
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

            const emptyObtainMethod = dataList.find(item => !item.obtainMethod);
            const emptyEqvaRatio = dataList.find(item => !item.eqvaRatio);

            const emptyApprType = dataList.find(item => !item.apprType);
            const emptyApprRes = dataList.find(
              item =>
                (!item.apprRes && item.apprType === 'BY_CAPASET') ||
                (!item.apprRes && item.apprType === 'ASSIGN_RES')
            );
            if (emptyObtainMethod) {
              createMessage({ type: 'warn', description: '获得方式不可为空' });
              return;
            }
            if (emptyEqvaRatio) {
              createMessage({ type: 'warn', description: '当量系数不可为空' });
              return;
            }
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
        }
        if (!(dataList2 && dataList2.length > 0)) {
          createMessage({ type: 'warn', description: '能力构成至少需要一条数据' });
          return;
        }
        const params = {
          ...formData,
          above: formData.above || false,
          hasLevelFlag,
          capasetLevelEntities: this.levelResolve(dataList),
          capasetCapaEntityList: this.capaResolve(dataList2),
        };
        if (
          formData.apprType &&
          formData.apprType === 'ASSIGN_RES' &&
          formData.apprRes &&
          Array.isArray(formData.apprRes)
        ) {
          params.apprRes = formData.apprRes.join(',');
        }
        const leavelIdArray = [];
        params.capasetLevelEntities.map(item => {
          leavelIdArray.push(item.leveldId);
          return item;
        });
        // console.error('leavelIdArray', leavelIdArray);
        let choseLeavelIdArray = [];
        params.capasetCapaEntityList.map(item => {
          choseLeavelIdArray = choseLeavelIdArray.concat(item.capaSetLevelIdList);
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
          createMessage({ type: 'warn', description: '各级别至少需要一个能力构成' });
          return;
        }
        const noChoose = params.capasetCapaEntityList.filter(i => !i.capaSetLevelIdList.length);
        if (params.hasLevelFlag && noChoose && noChoose.length) {
          const noChooseObj = dataList2.find(item => item.capaLevelId === noChoose[0].capaLevelId);
          let tips = '有考核点没有关联任何级别，请至少关联到一个';
          if (noChooseObj) {
            const { text } = noChooseObj;
            tips = ` 单项能力"${text}"未关联任何级别`;
          }
          createMessage({
            type: 'warn',
            description: tips,
          });

          return;
        }
        if (Array.isArray(params.applyResId)) {
          params.applyResId = params.applyResId.join(',');
        }
        // console.log('所有参数', params);
        dispatch({
          type: `${DOMAIN}/save`,
          payload: params,
        });
      }
    });
  };

  handleCancel = () => {
    createConfirm.warning({
      content: '确定要离开吗？您填写的数据将不会被保存。',
      onOk: () => closeThenGoto(`/hr/capacity/set`),
    });
  };

  handleChangeJobType1 = (value, target) => {
    const { dispatch, form, formData } = this.props;
    target &&
      dispatch({
        type: `${DOMAIN}/updateJobType2`,
        payload: {
          parentVal: value,
          jobType1Name: target.props.title,
        },
      }).then(() => {
        formData.jobType2 = null;
        form.setFieldsValue({
          jobType2: null,
        });
      });
  };

  handleChangeJobType2 = (value, target) => {
    const { dispatch, formData } = this.props;
    target &&
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          formData: { ...formData, jobType2Name: target.props.title },
        },
      });
  };

  apprResContent = (apprType, index, value) => {
    let apprResComponent = <></>;
    if (apprType === 'ASSIGN_RES') {
      apprResComponent = (
        <Selection.Columns
          value={value || []}
          source={selectUsersWithBu}
          onChange={this.onCellChanged(index, 'apprRes')}
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
            onChange={this.onCellChanged(index, 'apprRes')}
            source={selectCapasetLevel}
            transfer={{ key: 'id', code: 'id', name: 'name' }}
            placeholder="请选择审核人"
            showSearch
          />
          <Checkbox onClick={this.onCellChangedChecked2(index, 'levelFlag')} />
          <span className={styles['approval-text']}>以上</span>
        </div>
      );
    } else {
      apprResComponent = <Input type="text" disabled />;
    }
    return apprResComponent;
  };

  apprResContentField = apprType => {
    const { form } = this.props;
    let apprResComponent = <></>;
    if (apprType === 'ASSIGN_RES') {
      apprResComponent = (
        <Selection.Columns
          source={selectUsersWithBu}
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
        <Selection.Columns
          source={selectCapasetLevel}
          transfer={{ key: 'id', code: 'id', name: 'name' }}
          placeholder="请选择审核人"
          dropdownMatchSelectWidth={false}
          dropdownStyle={{ width: 240 }}
          showSearch
        />
      );
    } else {
      apprResComponent = <></>;
    }
    return apprResComponent;
  };

  onCellChanged2 = (rowIndex, rowField) => rowFieldValue => {
    const { dispatch, dataList2 } = this.props;
    // 更新单元格状态
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        dataList2: update(dataList2, {
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

  onCellChangedChecked = (rowIndex, rowField) => rowFieldValue => {
    const { dispatch, dataList2 } = this.props;
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

  onCellChangedChecked2 = (rowIndex, rowField) => rowFieldValue => {
    const { dispatch, dataList } = this.props;
    // 更新单元格状态
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        dataList: update(dataList, {
          [rowIndex]: {
            [rowField]: {
              $set: rowFieldValue.target.checked,
            },
          },
        }),
      },
    });
  };

  handleModelOk = (e, checkedKeys, checkRows) => {
    const { dataList2 = [], dispatch } = this.props;
    const newCheckRows = checkRows.map(item => {
      // eslint-disable-next-line no-param-reassign
      item.id = genFakeId(-1);
      return item;
    });
    const clearCheckRow = [];
    const dataList2CapaLevelIds = dataList2.map(item => item.capaLevelId);
    newCheckRows.forEach(item => {
      if (!dataList2CapaLevelIds.includes(item.capaLevelId)) {
        const newItem = Object.assign({}, item);
        newItem.text = item.textName;
        clearCheckRow.push(newItem);
      }
    });
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        dataList2: dataList2.concat(clearCheckRow),
      },
    });
    this.toggleVisible();
  };

  // 切换弹出窗。
  toggleVisible = () => {
    const { visible } = this.state;
    this.setState({
      visible: !visible,
    });
  };

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        capaTreeDataDetail: [],
        capaTreeDataDetailTotal: 0,
        fetchDataLoading: true,
      },
    });
    dispatch({
      type: `${DOMAIN}/queryCapaTreeDataDetail`,
      payload: { ...params },
    });
    this.setState({
      capaSearchValue: null,
    });
  };

  capaSearch = () => {
    const {
      dispatch,
      capaTreeDataDetail,
      capaTreeDataDetailTotal = 0,
      capaTreeDataDetailTmp,
      capaTreeDataDetailTotalTmp,
    } = this.props;
    const { capaSearchValue } = this.state;

    if (capaSearchValue) {
      if (!capaTreeDataDetailTotalTmp) {
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            fetchDataLoading: true,
          },
        });
        dispatch({
          type: `${DOMAIN}/searchCapaTreeDataDetail`,
          payload: { text: capaSearchValue },
        });
      } else {
        const newCapaTreeDataDetail = capaTreeDataDetailTmp.filter(
          item => item.text && item.text.includes(capaSearchValue)
        );
        const newCapaTreeDataDetailTotal = newCapaTreeDataDetail ? newCapaTreeDataDetail.length : 0;
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            capaTreeDataDetail: newCapaTreeDataDetail,
            capaTreeDataDetailTotal: newCapaTreeDataDetailTotal,
          },
        });
      }
    } else {
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          capaTreeDataDetail: capaTreeDataDetailTmp,
          capaTreeDataDetailTotal: capaTreeDataDetailTotalTmp,
        },
      });
    }
  };

  render() {
    const {
      form,
      loading,
      dispatch,
      form: { getFieldDecorator, setFieldsValue },
      formData,
      dataList,
      dataList2 = [],
      levelList,
      jobType2Data,
      leveDetaillList,
      capaTreeData,
      capaTreeDataDetail,
      capaTreeDataDetailTotal = 0,
      fetchDataLoading,
      resData = [],
    } = this.props;
    const { visible, capaSearchValue } = this.state;

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
              className={styles['special-checkbox']}
              onChange={this.onCellChangedChecked(index, `leveldIdList-${item.leveldId}`)}
            />
          ),
        };
        tablePropsCheckpointNewColumns.push(columns);
      }
    });

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
          width: 120,
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
          title: '获得方式',
          dataIndex: 'obtainMethod',
          key: 'obtainMethod',
          required: true,
          width: 180,
          render: (value, row, index) => (
            <Selection.UDC
              value={value}
              code="RES:CAPA_OBTAIN_METHOD"
              placeholder="请选择获得方式"
              onChange={this.onCellChanged(index, 'obtainMethod')}
            />
          ),
        },
        {
          title: '当量系数',
          dataIndex: 'eqvaRatio',
          key: 'eqvaRatio',
          required: true,
          width: 80,
          render: (value, row, index) => (
            <InputNumber
              value={value}
              min={0}
              step={0.1}
              precision={1}
              onChange={this.onCellChanged(index, 'eqvaRatio')}
            />
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
        {
          title: '审核人类型',
          dataIndex: 'apprType',
          key: 'apprType',
          required: true,
          width: 180,
          render: (value, row, index) => (
            <Selection.UDC
              disabled={row.obtainMethod === 'AUTO'}
              value={value}
              code="RES:APPR_TYPE"
              placeholder="请选择考核点"
              onChange={this.onCellChanged(index, 'apprType')}
            />
          ),
        },
        {
          title: '审核人',
          dataIndex: 'apprRes',
          key: 'apprRes',
          width: 300,
          render: (value, row, index) =>
            this.apprResContent(dataList[index].apprType, index, value),
        },
      ],
      buttons: [],
    };

    const tablePropsAbility = {
      rowKey: 'id',
      loading: false,
      pagination: false,
      dataSource: dataList2,
      total: dataList2.length || 0,
      showCopy: false,
      scroll: {
        x: 600 + tablePropsCheckpointNewColumns.length * 100,
      },
      onAdd: newRow => {
        this.setState({
          visible: true,
          capaSearchValue: null,
        });
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            capaTreeDataDetail: [],
            capaTreeDataDetailTotal: 0,
            capaTreeDataDetailTmp: [],
            capaTreeDataDetailTotalTmp: 0,
          },
        });
        // dispatch({
        //   type: `${DOMAIN}/updateState`,
        //   payload: {
        //     dataList2: update(dataList2, {
        //       $push: [
        //         {
        //           ...newRow,
        //           id: genFakeId(-1),
        //         },
        //       ],
        //     }),
        //   },
        // });
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
          title: '单项能力',
          dataIndex: 'text',
          key: 'text',
          align: 'center',
          width: 300,
        },
        {
          title: '分类',
          dataIndex: 'capaTypeName',
          key: 'capaTypeName',
          align: 'center',
          width: 300,
        },
        ...tablePropsCheckpointNewColumns,
      ],
      buttons: [],
    };
    const tableColumns = [
      {
        title: '分类',
        dataIndex: 'capaTypeName',
        key: 'capaTypeName',
        align: 'center',
        width: 240,
        render: (value, rowData, key) => <div style={{ whiteSpace: 'nowrap' }}>{value}</div>,
      },
      {
        title: '单项能力',
        dataIndex: 'textName',
        key: 'textName',
        align: 'center',
        width: 240,
      },
      {
        title: '能力描述',
        dataIndex: 'dsc',
        key: 'dsc',
        render: (value, rowData, key) => {
          let newValue = value;
          if (value && value.length > 30) {
            newValue = value.substring(0, 30) + '...';
          }
          return (
            <Tooltip title={<pre>{value}</pre>}>
              <div className={styles.dsc}>{newValue}</div>
            </Tooltip>
          );
        },
      },
    ];

    const rowSelection = {
      getCheckboxProps: record => ({
        disabled: dataList2.find(item => item.capaLevelId === record.capaLevelId), // Column configuration not to be checked
      }),
      selectedRowKeys: dataList2.map(item => item.capaLevelId),
    };
    const particularColumns = [
      { dataIndex: 'code', title: '编号', span: 8 },
      { dataIndex: 'name', title: '名称', span: 16 },
    ];

    return (
      <PageHeaderWrapper title="能力新增页">
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            type="primary"
            icon="save"
            size="large"
            onClick={() => this.handleSave(() => '/hr/capacity/set')}
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
              id="ui.menu.hr.capacity.capaSet.create"
              defaultMessage="复合能力新增"
            />
          }
          className="tw-card-adjust"
          bordered={false}
        >
          <FieldList
            layout="horizontal"
            // legend="复合能力"
            getFieldDecorator={getFieldDecorator}
            col={2}
          >
            <Field
              name="capasetNo"
              label="编号"
              decorator={{
                initialValue: formData.capasetNo,
              }}
            >
              <Input placeholder="请输入编号" />
            </Field>
            <FieldLine label="复合能力" required>
              <Field
                name="jobType1"
                wrapperCol={{ span: 23, xxl: 23 }}
                decorator={{
                  initialValue: formData.jobType1,
                  rules: [
                    {
                      required: true,
                      message: '请选择复合能力',
                    },
                  ],
                }}
              >
                <UdcSelect
                  code="COM:JOB_TYPE1"
                  placeholder="请选择复合能力"
                  onChange={this.handleChangeJobType1}
                />
              </Field>
              <Field
                name="jobType2"
                wrapperCol={{ span: 23, offset: 1, xxl: 23 }}
                decorator={{
                  initialValue: formData.jobType2,
                  rules: [
                    {
                      required: true,
                      message: '请选择复合能力',
                    },
                  ],
                }}
              >
                <UdcSelect
                  source={jobType2Data}
                  placeholder="请选择复合能力"
                  onChange={this.handleChangeJobType2}
                />
              </Field>
            </FieldLine>
            <Field
              label="有无级别"
              name="hasLevelFlag"
              decorator={{
                initialValue: formData.hasLevelFlag ? 1 : 0,
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
              label="级别"
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
              name="capasetStatus"
              label="状态"
              decorator={{
                initialValue: formData.capasetStatus || 'ACTIVE',
                rules: [
                  {
                    required: false,
                    message: '请选择一项',
                  },
                ],
              }}
            >
              <Radio.Group
                onChange={e => {
                  formData.capasetStatus = e.target.value;
                }}
              >
                <Radio value="ACTIVE">有效</Radio>
                <Radio value="INACTIVE">无效</Radio>
              </Radio.Group>
            </Field>
            <Field
              label="首次申请是否审批"
              name="requestApply"
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 12 }}
              decorator={{
                initialValue: void 0,
                rules: [
                  {
                    required: true,
                    message: '请选择一项',
                  },
                ],
              }}
            >
              <Radio.Group>
                <Radio value="YES">是</Radio>
                <Radio value="NO">否</Radio>
              </Radio.Group>
            </Field>
            {formData.requestApply === 'YES' ? (
              <FieldLine label="首次申请审核人" required>
                <Field
                  name="applyStatus"
                  fieldCol={formData.applyStatus === 'BY_CAPASET' ? 3 : 2}
                  wrapperCol={{ span: 23, xxl: 23 }}
                  decorator={{
                    initialValue: formData.apprStatus,
                    rules: [
                      {
                        required: true,
                        message: '请选择审核人类型',
                      },
                    ],
                  }}
                >
                  <Selection.UDC
                    code="RES:APPR_TYPE"
                    filters={[{ sphd1: 'FIRST_APPR' }]}
                    placeholder="请选择审核人类型"
                    onChange={() => {
                      setFieldsValue({ applyResId: void 0 });
                    }}
                  />
                </Field>
                {formData.applyStatus === 'ASSIGN_RES' ? (
                  <Field
                    name="applyResId"
                    fieldCol={formData.applyStatus === 'BY_CAPASET' ? 3 : 2}
                    wrapperCol={{ span: 23, offset: 1, xxl: 23 }}
                    decorator={{
                      // initialValue: formData.jobType2,
                      rules: [
                        {
                          required: true,
                          message: '请选择审批人',
                        },
                      ],
                    }}
                  >
                    <Selection.Columns
                      className="x-fill-100"
                      source={resData}
                      columns={particularColumns}
                      transfer={{ key: 'id', code: 'id', name: 'name' }}
                      dropdownMatchSelectWidth={false}
                      showSearch
                      mode="multiple"
                    />
                  </Field>
                ) : null}
                {formData.applyStatus === 'BY_CAPASET' ? (
                  <Field
                    name="applyResId"
                    fieldCol={formData.applyStatus === 'BY_CAPASET' ? 3 : 2}
                    wrapperCol={{ span: 23, offset: 1, xxl: 23 }}
                    decorator={{
                      // initialValue: formData.jobType2,
                      rules: [
                        {
                          required: true,
                          message: '请选择审批人',
                        },
                      ],
                    }}
                  >
                    <Selection.Columns
                      source={selectCapasetLevel}
                      transfer={{ key: 'id', code: 'id', name: 'name' }}
                      placeholder="请选择审核人"
                      showSearch
                      dropdownMatchSelectWidth={false}
                      dropdownStyle={{ width: 240 }}
                    />
                  </Field>
                ) : null}
                {formData.applyStatus === 'BY_CAPASET' ? (
                  <Field
                    fieldCol={formData.applyStatus === 'BY_CAPASET' ? 3 : 2}
                    wrapperCol={{ span: 22, offset: 2, xxl: 22 }}
                    name="above"
                    decorator={{
                      initialValue: formData.above,
                    }}
                    // style={{ textAlign: 'right' }}
                  >
                    <Checkbox checked={formData.above}>以上</Checkbox>
                  </Field>
                ) : null}
              </FieldLine>
            ) : null}
            {formData.hasLevelFlag === 1 ? (
              <Field
                label="是否可跨级别晋升"
                name="across"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 12 }}
                decorator={{
                  initialValue: void 0,
                  rules: [
                    {
                      required: true,
                      message: '请选择一项',
                    },
                  ],
                }}
              >
                <Radio.Group>
                  <Radio value="YES">是</Radio>
                  <Radio value="NO">否</Radio>
                </Radio.Group>
              </Field>
            ) : null}
            {formData.hasLevelFlag === 0 ? (
              <Field
                label="获得方式"
                name="obtainMethod"
                decorator={{
                  initialValue: formData.obtainMethod,
                  rules: [
                    {
                      required: true,
                      message: '请选择获得方式',
                    },
                  ],
                }}
              >
                <Selection.UDC
                  code="RES:CAPA_OBTAIN_METHOD"
                  placeholder="请选择获得方式"
                  onChange={e => {
                    form.setFieldsValue({
                      apprType: null,
                    });
                    if (e === 'AUTO') {
                      form.setFieldsValue({
                        apprType: 'NO_APPR',
                      });
                    }
                  }}
                />
              </Field>
            ) : (
              ''
            )}
            {formData.hasLevelFlag === 0 ? (
              <Field
                label="当量系数"
                name="eqvaRatio"
                decorator={{
                  initialValue: formData.eqvaRatio,
                  rules: [
                    {
                      required: true,
                      message: '请输入当量系数',
                    },
                  ],
                }}
              >
                <InputNumber min={0} step={0.1} precision={1} style={{ width: '100%' }} />
              </Field>
            ) : (
              ''
            )}
            {!formData.hasLevelFlag ? (
              <FieldLine label="能力获取审核人">
                <Field
                  // label="审核人类型"
                  name="apprType"
                  fieldCol={formData.apprType === 'BY_CAPASET' ? 3 : 2}
                  wrapperCol={{ span: 23, xxl: 23 }}
                  decorator={{
                    initialValue: formData.apprType,
                    rules: [
                      {
                        required: true,
                        message: '请选择审核人类型',
                      },
                    ],
                  }}
                >
                  <Selection.UDC
                    code="RES:APPR_TYPE"
                    placeholder="请选择审核人类型"
                    disabled={formData.obtainMethod === 'AUTO'}
                    onChange={e => {
                      if (e === 'ASSIGN_RES') {
                        form.setFieldsValue({
                          apprRes: [],
                          levelFlag: null,
                        });
                      } else {
                        form.setFieldsValue({
                          apprRes: '',
                          levelFlag: null,
                        });
                      }
                    }}
                  />
                </Field>
                {!formData.hasLevelFlag && formData.apprType === 'BY_CAPASET' ? (
                  <Field
                    fieldCol={formData.apprType === 'BY_CAPASET' ? 3 : 2}
                    wrapperCol={{ span: 23, offset: 1, xxl: 23 }}
                    name="apprRes"
                    decorator={{
                      initialValue: formData.apprRes,
                      rules: [
                        {
                          required: formData.apprType === 'BY_CAPASET',

                          message: '请选择审核人',
                        },
                      ],
                    }}
                  >
                    {this.apprResContentField(formData.apprType)}
                  </Field>
                ) : (
                  ''
                )}
                {!formData.hasLevelFlag && formData.apprType === 'BY_CAPASET' ? (
                  <Field
                    fieldCol={formData.apprType === 'BY_CAPASET' ? 3 : 2}
                    wrapperCol={{ span: 22, offset: 2, xxl: 22 }}
                    name="levelFlag"
                    decorator={{
                      initialValue: formData.levelFlag,
                    }}
                    // style={{ textAlign: 'right' }}
                  >
                    <Checkbox
                      checked={formData.levelFlag}
                      onChange={e => {
                        form.setFieldsValue({
                          levelFlag: e.target.checked,
                        });
                      }}
                    >
                      以上
                    </Checkbox>
                  </Field>
                ) : (
                  ''
                )}
                {!formData.hasLevelFlag && formData.apprType === 'ASSIGN_RES' ? (
                  <Field
                    name="apprRes"
                    // label="审核人"
                    fieldCol={2}
                    wrapperCol={{ span: 23, offset: 1, xxl: 23 }}
                    decorator={{
                      initialValue: formData.apprRes || [],
                      rules: [
                        {
                          required: formData.apprType === 'ASSIGN_RES',
                          message: '请选择审核人',
                        },
                      ],
                    }}
                  >
                    {this.apprResContentField(formData.apprType)}
                  </Field>
                ) : (
                  ''
                )}
              </FieldLine>
            ) : (
              ''
            )}
            {formData.hasLevelFlag === 0 ? (
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
          {formData.hasLevelFlag ? <Divider dashed /> : ''}
          {formData.hasLevelFlag ? (
            <FieldList legend="级别定义" noReactive>
              <EditableDataTable
                key={[formData.hasLevelFlag, formData.levelId].join('_')}
                {...tablePropsLevel}
              />
            </FieldList>
          ) : (
            ''
          )}
          <Divider dashed />
          <FieldList legend="能力构成" noReactive>
            <EditableDataTable
              key={[formData.hasLevelFlag, formData.levelId].join('_')}
              {...tablePropsAbility}
            />
          </FieldList>
        </Card>
        <TreeSelect
          title="单项能力添加"
          domain={DOMAIN}
          visible={visible}
          dispatch={dispatch}
          fetchData={this.fetchData}
          dataSource={capaTreeDataDetail}
          tableColumns={tableColumns}
          multiple
          loading={fetchDataLoading}
          total={capaTreeDataDetailTotal}
          onOk={this.handleModelOk}
          onCancel={this.toggleVisible}
          treeData={capaTreeData}
          tableRowKey="capaLevelId"
          rowSelection={rowSelection}
          searchContent={
            <div
              style={{
                textAlign: 'center',
              }}
            >
              能力名称
              <div
                style={{
                  display: 'inline-block',
                  margin: '0 15px',
                  width: '320px',
                }}
              >
                <Input
                  value={capaSearchValue}
                  placeholder="按能力名称查询"
                  onChange={e => {
                    this.setState({
                      capaSearchValue: e.target.value,
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
      </PageHeaderWrapper>
    );
  }
}

export default CapaSetCreate;
