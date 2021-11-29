import React, { Component } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import moment from 'moment';
import { isEmpty, isNil, hasIn } from 'ramda';
import { Card, Form, Input, Radio, InputNumber, Switch, Divider, Row, Col, DatePicker } from 'antd';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import AsyncSelect from '@/components/common/AsyncSelect';
import update from 'immutability-helper';
import FieldList from '@/components/layout/FieldList';
import Title from '@/components/layout/Title';
import { createConfirm } from '@/components/core/Confirm';
import DataTable from '@/components/common/DataTable';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';
import { UdcSelect, FileManagerEnhance, Selection } from '@/pages/gen/field';
import { pushFlowTask } from '@/services/gen/flow';
import { stringify } from 'qs';
import { selectInternalOus } from '@/services/gen/list';
import { getUrl } from '@/utils/flowToRouter';
import createMessage from '@/components/core/AlertMessage';
import { formatDT } from '@/utils/tempUtils/DateTime';
import OfferAndResView from './OfferAndResView';
import OfferAndResITAndConfirm from './OfferAndResITAndConfirm';
import ResCapacity from './component/ResCapacity';
import { genFakeId } from '@/utils/mathUtils';
import EditableDataTable from '@/components/common/EditableDataTable';

const { Field, FieldLine } = FieldList;
const RadioGroup = Radio.Group;

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];
const jobInternalColumns = [
  { dataIndex: 'recommNo', title: '编号', span: 8 },
  { dataIndex: 'recommName', title: '名称', span: 16 },
];

const DOMAIN = 'offerAndResFlow';

@connect(({ loading, offerAndResFlow, dispatch, user }) => ({
  loading:
    loading.effects[`${DOMAIN}/query`] ||
    loading.effects[`${DOMAIN}/submit`] ||
    loading.effects[`${DOMAIN}/checkresultList`],
  offerAndResFlow,
  dispatch,
  user,
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    if (!isEmpty(changedFields)) {
      const { name, value } = Object.values(changedFields)[0];
      if (name === 'emailAddr' || name === 'mobile') {
        props.dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: { [name]: value.replace(/\s*/g, '') },
        });
      } else {
        props.dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: { [name]: value },
        });
      }
    }
  },
})
@mountToTab()
class offerAndResDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nowTitle: '',
      eqvaRatioRowKeys: [],
    };
  }

  componentDidMount() {
    const {
      dispatch,
      offerAndResFlow: {
        fieldsConfig: { taskKey },
      },
    } = this.props;
    const { id, taskId } = fromQs();

    id &&
      dispatch({ type: `${DOMAIN}/query`, payload: { resId: id } }).then(res => {
        res && dispatch({ type: `${DOMAIN}/oldSaleBu`, payload: { resId: res.resId } }); // 原销售BU
      });
    dispatch({
      type: `${DOMAIN}/cleanDate`,
    }).then(ress => {
      id &&
        dispatch({
          type: `${DOMAIN}/query`,
          payload: { resId: id },
        }).then(response => {
          // 拉取资源已有单项能力和复核能力
          response.resId &&
            dispatch({
              type: `${DOMAIN}/resAbility`,
              payload: { resId: response.resId },
            });
          response.jobClass1 &&
            dispatch({
              type: `${DOMAIN}/updateListType2`,
              payload: response.jobClass1,
            });
        });
      dispatch({ type: `${DOMAIN}/oldSaleBu`, payload: { resId: id } }); // 原销售BU
      // 获取复合能力
      dispatch({
        type: `${DOMAIN}/getCapaSetList`,
      });
      dispatch({
        type: `${DOMAIN}/entryItemList`,
        payload: {
          twofferId: id,
        },
      });

      taskId
        ? dispatch({
            type: `${DOMAIN}/fetchConfig`,
            payload: taskId,
          }).then(res => {
            const { taskKey: values } = res;
            this.getTitle(values);
          })
        : dispatch({
            type: `${DOMAIN}/updateState`,
            payload: {
              fieldsConfig: {
                buttons: [],
                panels: {
                  disabledOrHidden: {},
                },
              },
            },
          });
      dispatch({ type: `${DOMAIN}/res` });
      dispatch({ type: `${DOMAIN}/bu` });
      dispatch({ type: `${DOMAIN}/findJobIsUsed` });
      dispatch({
        type: `${DOMAIN}/typeChange`,
      });

      dispatch({
        type: `${DOMAIN}/checkresultList`,
        payload: {
          id,
          chkClass: 'ENTRY_RES_INFO_CHK',
        },
      });
    });
  }

  getTitle = taskkey => {
    const titleArr = [
      'ui.menu.hr.res.OfferApply', // Offer发放申请
      'ui.menu.hr.res.offerMsg', // Offer发放信息
      'ui.menu.hr.res.entryrMsg', // 入职信息
      'ui.menu.hr.res.entryrCheck', // 入职信息确认
    ];
    const taskArr = [
      [
        'ACC_A30_01_SUBMIT_i',
        'ACC_A30_02_BU_APPR_b',
        'ACC_A30_03_HR_APPR',
        'ACC_A30_04_PRESIDENT_AGREE',
      ],
      [
        'ACC_A30_05_INFORM_APPLICANT_b',
        'ACC_A30_09_COMPLETE_INFORMATION_b',
        'ACC_A30_10_REVIEW_INFORMATION',
        'ACC_A30_11_LEADER_CAPACITY',
      ],
      ['ACC_A30_06_MESSAGE_ENTERING', 'ACC_A30_07_CREATE_ACCOUNT'],
      ['ACC_A30_08_04_CONFIRMATION_b'],
    ];

    taskArr.map((items, indexs) =>
      items.map((item, index) => {
        if (taskkey === item) {
          this.setState({
            nowTitle: titleArr[indexs],
          });
        }
        return item;
      })
    );
  };

  // 行编辑触发事件
  onCellChanged = (index, value, name) => {
    const {
      offerAndResFlow: { dataSource },
      dispatch,
    } = this.props;

    const newDataSource = dataSource;
    newDataSource[index] = {
      ...newDataSource[index],
      [name]: value,
    };
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { dataSource: newDataSource },
    });
  };

  // 档案新完善检查表格编辑
  onResInfoChkCellChanged = (index, value, name) => {
    const {
      offerAndResFlow: { entryResInfoChk },
      dispatch,
    } = this.props;

    const newDataSource = entryResInfoChk;
    newDataSource[index] = {
      ...newDataSource[index],
      [name]: value,
    };
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { entryResInfoChk: newDataSource },
    });
  };

  // 当量系数可编辑列表
  onEqvaRatioCellChanged = (rowIndex, value, name) => {
    const {
      offerAndResFlow: { eqvaRatioList },
      dispatch,
    } = this.props;
    const newDataSource = eqvaRatioList;
    if (name === 'period') {
      const startDate =
        typeof value[0] !== 'undefined' ? moment(value[0]).format('YYYY-MM-DD') : null;
      const endDate =
        typeof value[1] !== 'undefined' ? moment(value[1]).format('YYYY-MM-DD') : null;
      newDataSource[rowIndex] = {
        ...newDataSource[rowIndex],
        [name]: startDate + '~' + endDate,
        startDate,
        endDate,
      };
    } else {
      newDataSource[rowIndex] = {
        ...newDataSource[rowIndex],
        [name]: value,
      };
    }

    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { eqvaRatioList: newDataSource },
    });
  };

  handleSubmit = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/submit`,
        });
      }
    });
  };

  handleResTypeChange = e => {
    const {
      dispatch,
      form: { setFieldsValue },
    } = this.props;
    dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: {
        baseBuId: null,
        baseBuName: null,
        buFlag: null,
        oldSaleBu: null,
      },
    });
    setFieldsValue({
      baseBuId: null,
      baseBuName: null,
      buFlag: null,
      oldSaleBu: null,
    });
    if (e.target.value === 'SALES_BU') {
      dispatch({ type: `${DOMAIN}/salesBu` });
    } else if (e.target.value === 'GENERAL') {
      dispatch({ type: `${DOMAIN}/bu` });
    }
  };

  // 岗位分类一 -> 岗位分类二
  handleChangeType1 = value => {
    const { dispatch, form } = this.props;
    dispatch({
      type: `${DOMAIN}/updateListType2`,
      payload: value,
    }).then(() => {
      form.setFieldsValue({
        jobClass2: null,
      });
    });
  };

  render() {
    const {
      loading,
      dispatch,
      form,
      offerAndResFlow: {
        formData,
        resDataSource,
        baseBuDataSource,
        fieldsConfig,
        flowForm,
        dataSource,
        entryResInfoChk,
        findJobIsUsedList,
        type2,
        oldSaleBuBuDataSource,
        jobClass2,
        dataList, // 单项能力列表
        dataListDel, // 删除的单项能力id
        capacityList, // 复合能力列表
        capacityListSelected, // 已选择的复合能力
        capacityListSelectedDelId, // 删除的已选复合能力Id
        eqvaRatioList,
        deleteKeys,
        capaSetList,
      },
    } = this.props;
    const { validateFieldsAndScroll, getFieldDecorator, setFieldsValue } = form;
    const { nowTitle, eqvaRatioRowKeys } = this.state;

    const {
      panels: { disabledOrHidden },
      taskKey,
    } = fieldsConfig;

    const { id, taskId, prcId, from, mode } = fromQs();
    const urls = getUrl();
    const offerFrom = stringify({ offerFrom: urls });
    const urlFrom = stringify({ urlFrom: urls });
    const {
      enrollDate,
      regularDate,
      contractSignDate,
      contractExpireDate,
      probationBeginDate,
      probationEndDate,
    } = formData;

    const tableProps = {
      sortBy: 'id',
      rowKey: 'id',
      sortDirection: 'DESC',
      columnsCache: DOMAIN,
      loading,
      dataSource,
      showColumn: false,
      onRow: () => {},
      showSearch: false,
      showExport: false,
      pagination: false,
      enableSelection: false,
      rowSelection: {
        getCheckboxProps: (rowKey, rows) => {
          if (rowKey.checkNethod === 'AUTO') {
            return false;
          }
          return true;
        },
      },
      enableDoubleClick: false,
      columns: [
        {
          title: '检查方式',
          align: 'center',
          dataIndex: '',
          width: '15%',
          render: (value, row, index) => {
            if (row.checkNethod === 'AUTO') {
              return '系统自动检查';
            }
            return '人工检查';
          },
        },
        {
          title: '检查事项',
          align: 'center',
          width: '15%',
          dataIndex: 'chkItemName',
        },
        {
          title: '检查说明',
          width: '30%',
          dataIndex: 'chkDesc',
          render: val => <pre>{val}</pre>,
        },
        {
          title: '完成状态',
          dataIndex: 'finishStatus',
          align: 'center',
          width: '10%',
          render: (val, row, index) => (
            <Switch
              checkedChildren="已完成"
              unCheckedChildren="未处理"
              checked={val === '已完成'}
              onChange={bool => {
                const parmas = bool ? '已完成' : '未处理';
                this.onCellChanged(index, parmas, 'finishStatus');
              }}
            />
          ),
        },
        {
          title: '备注',
          dataIndex: 'remark',
          width: '30%',
          render: (value, row, index) => (
            <Input.TextArea
              autosize={{ minRows: 1, maxRows: 3 }}
              className="x-fill-100"
              value={row.remark || ''}
              onChange={e => {
                this.onCellChanged(index, e.target.value, 'remark');
              }}
            />
          ),
        },
      ],
    };

    const entryResTableProps = {
      sortBy: 'id',
      rowKey: 'id',
      sortDirection: 'DESC',
      columnsCache: DOMAIN,
      dataSource: entryResInfoChk,
      loading,
      showColumn: false,
      onRow: () => {},
      showSearch: false,
      showExport: false,
      pagination: false,
      enableSelection: false,
      rowSelection: {
        getCheckboxProps: (rowKey, rows) => {
          if (rowKey.checkNethod === 'AUTO') {
            return false;
          }
          return true;
        },
      },
      enableDoubleClick: false,
      columns: [
        {
          title: '检查方式',
          align: 'center',
          dataIndex: '',
          width: '15%',
          render: (value, row, index) => {
            if (row.checkMethod === 'AUTO') {
              return '系统自动检查';
            }
            return '人工检查';
          },
        },
        {
          title: '检查事项',
          align: 'center',
          width: '15%',
          dataIndex: 'chkItemName',
        },
        {
          title: '检查说明',
          width: '30%',
          dataIndex: 'chkDesc',
          render: val => <pre>{val}</pre>,
        },
        {
          title: '完成状态',
          dataIndex: 'finishStatus',
          align: 'center',
          width: '10%',
          render: (val, row, index) => (
            <Switch
              checkedChildren="已完成"
              unCheckedChildren="未处理"
              checked={val === '已完成'}
              onChange={(bool, e) => {
                const parmas = bool ? '已完成' : '未处理';
                this.onResInfoChkCellChanged(index, parmas, 'finishStatus', row);
              }}
              disabled={row.checkMethod === 'AUTO'}
            />
          ),
        },
        {
          title: '备注',
          dataIndex: 'remark',
          width: '30%',
          render: (value, row, index) => (
            <Input.TextArea
              autosize={{ minRows: 1, maxRows: 3 }}
              className="x-fill-100"
              value={row.remark || ''}
              onChange={e => {
                this.onResInfoChkCellChanged(index, e.target.value, 'remark', row);
              }}
            />
          ),
        },
      ],
      leftButtons: [
        {
          key: 'reload',
          icon: 'sync',
          className: 'tw-btn-primary',
          title: '刷新',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({
              type: `${DOMAIN}/checkresultList`,
              payload: {
                id,
                chkClass: 'ENTRY_RES_INFO_CHK',
              },
            });
          },
        },
      ],
    };

    const editEqvaRatioTableProps = {
      sortBy: 'id',
      rowKey: 'id',
      total: 0,
      dataSource: eqvaRatioList,
      showColumn: false,
      showCopy: false,
      showSearch: false,
      showExport: false,
      loading,
      rowSelection: {
        selectedRowKeys: eqvaRatioRowKeys,
        onChange: (_selectedRowKeys, _selectedRows) => {
          this.setState({
            eqvaRatioRowKeys: _selectedRowKeys,
          });
        },
      },
      onAdd: newRow => {
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            eqvaRatioList: update(eqvaRatioList, {
              $unshift: [
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
        const unDeleteList = selectedRows.filter(row => row.resEqvaRatioId !== undefined); // 原有数据
        if (unDeleteList.length > 0) {
          createMessage({ type: 'warn', description: '原有的数据不能删除' });
          return;
        }
        const newDataSource = eqvaRatioList.filter(row => selectedRowKeys.indexOf(row.id) < 0);
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            eqvaRatioList: newDataSource,
            deleteKeys: [...deleteKeys, ...selectedRowKeys],
          },
        });
      },
      columns: [
        {
          title: '期间',
          dataIndex: 'period',
          required: true,
          width: 150,
          align: 'center',
          options: {
            rules: [
              {
                required: true,
                message: '请输入期间!',
              },
            ],
          },
          render: (value, row, index) => (
            <DatePicker.RangePicker
              defaultValue={[
                row.startDate ? moment(row.startDate) : undefined,
                row.endDate ? moment(row.endDate) : undefined,
              ]}
              format="YYYY-MM-DD"
              onChange={e => {
                this.onEqvaRatioCellChanged(index, e, 'period');
              }}
              className="x-fill-100"
            />
          ),
        },
        {
          title: '当量系数',
          dataIndex: 'eqvaRatio',
          required: true,
          align: 'center',
          width: 50,
          options: {
            rules: [
              {
                required: true,
                message: '请输入当量系数!',
              },
            ],
          },
          render: (value, row, index) => (
            <InputNumber
              defaultValue={value}
              size="small"
              min={0}
              step={0.1}
              precision={1}
              onChange={e => {
                this.onEqvaRatioCellChanged(index, e, 'eqvaRatio');
              }}
            />
          ),
        },
        {
          title: '备注',
          dataIndex: 'remark',
          align: 'center',
          width: 200,
          render: (value, row, index) => (
            <Input
              defaultValue={value}
              size="small"
              onChange={e => {
                this.onEqvaRatioCellChanged(index, e.target.value, 'remark');
              }}
            />
          ),
        },
      ],
      buttons: [],
    };

    const eqvaRatioTableProps = {
      sortBy: 'id',
      rowKey: 'id',
      total: 0,
      dataSource: eqvaRatioList,
      showColumn: false,
      showCopy: false,
      showSearch: false,
      showExport: false,
      pagination: false,
      enableSelection: false,
      loading,
      columns: [
        {
          title: '期间',
          dataIndex: 'period',
          className: 'text-center',
          width: 150,
          render: (value, row, index) => {
            if (row.startDate || row.endDate) {
              return `${row.startDate ? row.startDate : ''} ~ ${row.endDate ? row.endDate : ''}`;
            }
            return '';
          },
        },
        {
          title: '当量系数',
          dataIndex: 'eqvaRatio',
          className: 'text-center',
          width: 150,
        },
        {
          title: '备注',
          dataIndex: 'remark',
          className: 'text-center',
          width: 200,
        },
      ],
    };

    return (
      <PageHeaderWrapper>
        <BpmWrapper
          fieldsConfig={fieldsConfig}
          flowForm={flowForm}
          buttonLoading={loading}
          onBpmChanges={value => {
            dispatch({
              type: `${DOMAIN}/updateFlowForm`,
              payload: value,
            });
          }}
          onBtnClick={({ operation, bpmForm }) => {
            // const { taskKey } = fieldsConfig;
            const { remark } = bpmForm;
            const { key } = operation;
            if (key === 'REJECTED') {
              createConfirm({
                content: '确定要拒绝该流程吗？',
                onOk: () =>
                  pushFlowTask(taskId, {
                    remark,
                    result: key,
                  }).then(({ status, response }) => {
                    if (status === 200) {
                      createMessage({ type: 'success', description: '操作成功' });
                      const url = getUrl().replace('edit', 'view');
                      closeThenGoto(url);
                    }
                    return Promise.resolve(false);
                  }),
              });
            }
            if (key === 'CLOSE') {
              if (formData.deliverOffer === 'YES') {
                createMessage({
                  type: 'warn',
                  description: '资源确定入职的流程不能关闭(是否入职:是)',
                });
                return Promise.resolve(false);
              }
              createConfirm({
                content: '确定要关闭该流程吗？',
                onOk: () => {
                  if (taskKey === 'ACC_A30_06_MESSAGE_ENTERING') {
                    validateFieldsAndScroll((error, values) => {
                      if (!error) {
                        const { deliverOffer, noneOfferReason, offerReasonAccount } = formData;
                        dispatch({
                          type: `${DOMAIN}/closeFlowForTask6`,
                          payload: {
                            deliverOffer,
                            noneOfferReason,
                            offerReasonAccount,
                            procId: prcId,
                            closeReason: remark,
                          },
                        });
                      }
                    });
                  } else {
                    dispatch({
                      type: `${DOMAIN}/closeFlow`,
                      payload: {
                        prcId,
                        remark,
                      },
                    });
                  }
                },
              });
            }
            if (taskKey === 'ACC_A30_01_SUBMIT_i') {
              if (key === 'APPROVED') {
                validateFieldsAndScroll((error, values) => {
                  if (!error) {
                    dispatch({
                      type: `${DOMAIN}/submit`,
                      payload: { remark, result: key },
                    });
                  }
                });
              }
            }
            if (taskKey === 'ACC_A30_02_BU_APPR_b') {
              if (key === 'APPROVED') {
                if (
                  formData.resType === 'GENERAL' &&
                  (!Array.isArray(eqvaRatioList) || eqvaRatioList.length < 1)
                ) {
                  createMessage({ type: 'warn', description: '请完善当量系数列表' });
                  return Promise.resolve(false);
                }
                validateFieldsAndScroll((error, values) => {
                  if (!error) {
                    if (formData.resType === 'GENERAL' && Array.isArray(eqvaRatioList)) {
                      let dateFlag = false;
                      let eqvaRatioFlag = false;
                      eqvaRatioList.forEach(item => {
                        if (!item.startDate || !item.endDate) {
                          dateFlag = true;
                        }
                        if (!item.eqvaRatio) {
                          eqvaRatioFlag = true;
                        }
                      });
                      if (dateFlag) {
                        createMessage({ type: 'error', description: '当量系数期间不能为空' });
                        return;
                      }
                      if (eqvaRatioFlag) {
                        createMessage({ type: 'error', description: '当量系数不能为空' });
                        return;
                      }
                    }
                    dispatch({
                      type: `${DOMAIN}/submit`,
                      payload: { remark, result: key, isFlag: true, taskKey },
                    });
                  } else {
                    createMessage({ type: 'error', description: '必填项不能为空' });
                  }
                });
              }
            }
            if (taskKey === 'ACC_A30_03_HR_APPR') {
              if (key === 'APPROVED') {
                validateFieldsAndScroll((error, values) => {
                  if (!error) {
                    if (!values.ceoApprFlag) {
                      createMessage({ type: 'warn', description: '请选择是否需要总裁审批' });
                    } else {
                      dispatch({
                        type: `${DOMAIN}/submit`,
                        payload: { remark, result: key },
                      });
                    }
                  }
                });
              }
            }
            if (taskKey === 'ACC_A30_04_PRESIDENT_AGREE') {
              return Promise.resolve(true);
            }
            if (taskKey === 'ACC_A30_05_INFORM_APPLICANT_b') {
              if (key === 'APPROVED') {
                validateFieldsAndScroll((error, values) => {
                  if (!error) {
                    dispatch({
                      type: `${DOMAIN}/submit`,
                      payload: { remark, result: key },
                    });
                  }
                });
              }
            }
            if (taskKey === 'ACC_A30_06_MESSAGE_ENTERING') {
              if (key === 'APPROVED') {
                if (formData.deliverOffer === 'NO') {
                  createMessage({
                    type: 'warn',
                    description: '资源未入职的流程不能继续(是否入职:否)',
                  });
                  return Promise.resolve(false);
                }
                validateFieldsAndScroll((error, values) => {
                  if (!error) {
                    dispatch({
                      type: `${DOMAIN}/createBuSubmit`,
                      payload: { remark, result: key },
                    });
                  }
                });
              }
            }
            if (taskKey === 'ACC_A30_07_CREATE_ACCOUNT') {
              if (key === 'APPROVED') {
                validateFieldsAndScroll((error, values) => {
                  const { password, emailAddr, accessLevel } = values;
                  if (!error) {
                    dispatch({
                      type: `${DOMAIN}/itAdmin`,
                      payload: {
                        remark,
                        procTaskId: taskId,
                        procRemark: remark,
                        result: key,
                        emailAddr,
                        accessLevel,
                        password,
                      },
                    });
                  }
                });
              }
            }
            if (taskKey === 'ACC_A30_08_04_CONFIRMATION_b') {
              if (key === 'APPROVED') {
                validateFieldsAndScroll((error, values) => {
                  const check = dataSource.filter(
                    i =>
                      (i.finishStatus === '未处理' && i.allowContinue === false) ||
                      (i.finishStatus === '未处理' && !i.remark)
                  );

                  if (!isEmpty(check)) {
                    if (check[0].finishStatus === '未处理' && check[0].allowContinue === false) {
                      createMessage({
                        type: 'error',
                        description: `${check[0].chkItemName}必须完成` || '当期页面存在未处理事项',
                      });
                      return;
                    }
                    if (check[0].finishStatus === '未处理' && !check[0].remark) {
                      createMessage({
                        type: 'error',
                        description:
                          `请在${check[0].chkItemName}备注处填写未完成的原因` ||
                          '当期页面存在未处理事项',
                      });
                      return;
                    }
                    return;
                  }
                  dispatch({
                    type: `${DOMAIN}/checkResult`,
                    payload: {
                      dataSource,
                      remark,
                      result: key,
                    },
                  });
                });
              }
            }
            if (taskKey === 'ACC_A30_09_COMPLETE_INFORMATION_b') {
              const { resId } = formData;
              if (key === 'allResMsg') {
                router.push(`/user/center/infoEdit?id=${resId}&mode=update&tab=basic&${offerFrom}`);
              }
              if (key === 'APPROVED') {
                const check = entryResInfoChk.filter(
                  i =>
                    (i.finishStatus === '未处理' && i.allowContinue === false) ||
                    (i.finishStatus === '未处理' && !i.remark)
                );
                if (!isEmpty(check)) {
                  if (check[0].finishStatus === '未处理' && check[0].allowContinue === false) {
                    createMessage({
                      type: 'error',
                      description: `${check[0].chkItemName}必须完成` || '当期页面存在未处理事项',
                    });
                    return null;
                  }
                  if (check[0].finishStatus === '未处理' && !check[0].remark) {
                    createMessage({
                      type: 'error',
                      description:
                        `请在${check[0].chkItemName}备注处填写未完成的原因` ||
                        '当期页面存在未处理事项',
                    });
                    return null;
                  }
                  return null;
                }
                dispatch({
                  type: `${DOMAIN}/checkResult`,
                  payload: {
                    dataSource: entryResInfoChk,
                    remark,
                    result: key,
                  },
                });
              }
            }
            if (taskKey === 'ACC_A30_10_REVIEW_INFORMATION') {
              const { resId } = formData;
              if (key === 'resDetails') {
                router.push(`/hr/res/profile/list/resQuery?id=${resId}&${offerFrom}`);
              } else {
                return Promise.resolve(true);
              }
            }
            if (taskKey === 'ACC_A30_11_LEADER_CAPACITY_b') {
              const { resId, resNo, resName } = formData;
              if (isEmpty(dataList) && isEmpty(capacityListSelected)) {
                createMessage({
                  type: 'warn',
                  description: '请完善资源的能力信息，复合能力或单项能力至少有一项',
                });
                return Promise.resolve(false);
              }
              dispatch({
                type: `${DOMAIN}/saveEntityAbility`,
                payload: {
                  remark,
                  procTaskId: taskId,
                  procRemark: remark,
                  result: key,
                },
              });
              // if (key === 'resCompleteMsg') {
              //   router.push(
              //     `/hr/res/profile/list/resCapacity?id=${resId}&resNo=${resNo}&resName=${resName}&${urlFrom}`
              //   );
              // } else {
              //   dispatch({
              //     type: `${DOMAIN}/findCapa`,
              //     payload: {
              //       resId,
              //     },
              //   }).then(res => {
              //     if (res.ok) {
              //       dispatch({
              //         type: `${DOMAIN}/pushFlowTask`,
              //         payload: {
              //           remark,
              //           result: key,
              //         },
              //       });
              //     } else {
              //       createMessage({
              //         type: 'error',
              //         description:
              //           res.reason || '入职资源还没有任何能力信息，请维护至少一种复合能力',
              //       });
              //     }
              //   });
              // }
            }
            return Promise.resolve(false);
          }}
        >
          {mode === 'edit' &&
            (taskKey === 'ACC_A30_07_CREATE_ACCOUNT' ||
            taskKey === 'ACC_A30_08_04_CONFIRMATION_b' ? (
              <OfferAndResITAndConfirm nowTitle={nowTitle} form={form} />
            ) : (
              <>
                <Card
                  className="tw-card-adjust"
                  style={{ marginTop: '6px' }}
                  title={
                    <Title
                      icon="profile"
                      id={nowTitle || 'ui.menu.plat.res.OfferApply'}
                      defaultMessage="Offer发放申请"
                    />
                  }
                  bordered={false}
                >
                  <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
                    {hasIn('resId', disabledOrHidden) && (
                      <Field
                        name="resId"
                        label="资源"
                        decorator={{
                          initialValue: formData.resName || '',
                        }}
                      >
                        <Input disabled={!!disabledOrHidden.resId} placeholder="请选择资源" />
                      </Field>
                    )}
                    {hasIn('gender', disabledOrHidden) && (
                      <Field
                        name="gender"
                        label="性别"
                        decorator={{
                          initialValue: formData.gender || '',
                          rules: [
                            {
                              required: !disabledOrHidden.gender && true,
                              message: '请选择性别',
                            },
                          ],
                        }}
                      >
                        <UdcSelect
                          disabled={!!disabledOrHidden.gender}
                          code="COM.GENDER"
                          placeholder="请选择性别"
                        />
                      </Field>
                    )}
                    {hasIn('resType', disabledOrHidden) && (
                      <Field
                        name="resType"
                        label="资源类别"
                        decorator={{
                          initialValue: formData.resType || 'GENERAL',
                          rules: [
                            {
                              required: !disabledOrHidden.resType && true,
                              message: '请选择资源类别',
                            },
                          ],
                        }}
                      >
                        <RadioGroup
                          disabled={!!disabledOrHidden.resType}
                          initialValue={formData.resType || ''}
                          onChange={this.handleResTypeChange}
                        >
                          <Radio value="GENERAL">一般资源</Radio>
                          <Radio value="SALES_BU">销售BU</Radio>
                        </RadioGroup>
                      </Field>
                    )}
                    {hasIn('baseBuId', disabledOrHidden) && (
                      <Field
                        name="baseBuId"
                        label="BaseBU"
                        decorator={{
                          initialValue: formData.baseBuId || '',
                          rules: [
                            {
                              required: !disabledOrHidden.baseBuId && true,
                              message: '请选择BaseBU',
                            },
                          ],
                        }}
                      >
                        <Selection.Columns
                          className="x-fill-100"
                          source={baseBuDataSource}
                          columns={particularColumns}
                          transfer={{ key: 'id', code: 'id', name: 'name' }}
                          dropdownMatchSelectWidth={false}
                          showSearch
                          onColumnsChange={value => {}}
                          disabled={!!disabledOrHidden.baseBuId}
                        />
                      </Field>
                    )}
                    {hasIn('baseCity', disabledOrHidden) && (
                      <Field
                        name="baseCity"
                        label="Base地"
                        decorator={{
                          initialValue: formData.baseCity && formData.baseCity,
                          rules: [
                            {
                              required: !disabledOrHidden.baseCity && true,
                              message: '请选择Base地',
                            },
                          ],
                        }}
                      >
                        <UdcSelect
                          disabled={!!disabledOrHidden.baseCity}
                          code="COM.CITY"
                          placeholder="请选择Base地"
                        />
                      </Field>
                    )}
                    {hasIn('preEnrollDate', disabledOrHidden) && (
                      <Field
                        name="preEnrollDate"
                        label="预定入职日期"
                        decorator={{
                          initialValue: formData.preEnrollDate
                            ? moment(formData.preEnrollDate)
                            : null,
                        }}
                      >
                        <DatePicker
                          disabled={!!disabledOrHidden.preEnrollDate}
                          className="x-fill-100"
                        />
                      </Field>
                    )}
                    {hasIn('job', disabledOrHidden) && (
                      <Field
                        name="job"
                        label="岗位"
                        decorator={{
                          initialValue: formData.job || '',
                          rules: [
                            {
                              required: !disabledOrHidden.job && true,
                              message: '请输入岗位',
                            },
                          ],
                        }}
                      >
                        <Input disabled={!!disabledOrHidden.job} placeholder="请输入岗位" />
                      </Field>
                    )}
                    {hasIn('jobGrade', disabledOrHidden) && (
                      <Field
                        name="jobGrade"
                        label="职级"
                        decorator={{
                          initialValue: formData.jobGrade,
                          rules: [
                            {
                              required:
                                taskKey !== 'ACC_A30_01_SUBMIT_i' &&
                                !disabledOrHidden.jobGrade &&
                                true,
                              message: '请输入职级',
                            },
                          ],
                        }}
                      >
                        <Input disabled={!!disabledOrHidden.jobGrade} placeholder="请输入职级" />
                      </Field>
                    )}
                    {hasIn('eqvaRatio', disabledOrHidden) && (
                      <Field
                        name="eqvaRatio"
                        label="当量系数"
                        decorator={{
                          initialValue: formData.eqvaRatio,
                          rules: [
                            {
                              required:
                                taskKey !== 'ACC_A30_01_SUBMIT_i' &&
                                !disabledOrHidden.eqvaRatio &&
                                true,
                              message: '请输入当量系数',
                            },
                          ],
                        }}
                      >
                        <InputNumber
                          className="x-fill-100"
                          placeholder="请输入当量系数"
                          precision={1}
                          min={0}
                          max={999999999999}
                          disabled={!!disabledOrHidden.eqvaRatio}
                        />
                      </Field>
                    )}
                    {hasIn('coopType', disabledOrHidden) && (
                      <Field
                        name="coopType"
                        label="合作方式"
                        decorator={{
                          initialValue: formData.coopType,
                          rules: [
                            {
                              required:
                                taskKey !== 'ACC_A30_01_SUBMIT_i' &&
                                !disabledOrHidden.coopType &&
                                true,
                              message: '请选择合作方式',
                            },
                          ],
                        }}
                      >
                        <UdcSelect
                          disabled={!!disabledOrHidden.coopType}
                          code="COM.COOPERATION_MODE"
                          placeholder="请选择合作方式"
                        />
                      </Field>
                    )}
                    {hasIn('presId', disabledOrHidden) && (
                      <Field
                        name="presId"
                        label="直属领导"
                        decorator={{
                          initialValue: formData.presId || '',
                          rules: [
                            {
                              required:
                                taskKey !== 'ACC_A30_01_SUBMIT_i' &&
                                !disabledOrHidden.presId &&
                                true,
                              message: '请选择直属领导',
                            },
                          ],
                        }}
                      >
                        <Selection.Columns
                          className="x-fill-100"
                          source={resDataSource}
                          columns={particularColumns}
                          transfer={{ key: 'id', code: 'id', name: 'name' }}
                          dropdownMatchSelectWidth={false}
                          showSearch
                          onColumnsChange={value => {}}
                          disabled={!!disabledOrHidden.presId}
                        />
                      </Field>
                    )}
                    {hasIn('internal', disabledOrHidden) && (
                      <FieldLine
                        label="内部推荐"
                        fieldCol={2}
                        required={!disabledOrHidden.internal && true}
                      >
                        <Field
                          name="isJobInternalRecomm"
                          decorator={{
                            initialValue: formData.isJobInternalRecomm === 'YES' ? '是' : '否',
                          }}
                          wrapperCol={{ span: 23, xxl: 24 }}
                        >
                          <Input disabled />
                        </Field>
                        <Field
                          name="jobInternalRecommId"
                          decorator={{
                            initialValue: formData.jobInternalRecommId || undefined,
                            rules: [
                              {
                                required: !disabledOrHidden.internal && true,
                                message: '请选择内部推荐',
                              },
                            ],
                          }}
                          wrapperCol={{ span: 23, xxl: 24 }}
                        >
                          <Selection.Columns
                            className="x-fill-100"
                            value={formData.jobInternalRecommId}
                            source={findJobIsUsedList}
                            columns={jobInternalColumns}
                            transfer={{
                              key: 'jobInternalRecommId',
                              code: 'jobInternalRecommId',
                              name: 'jobDesc',
                            }}
                            dropdownMatchSelectWidth={false}
                            showSearch
                            onColumnsChange={value => {}}
                            placeholder="请选择内部推荐"
                            disabled
                          />
                        </Field>
                      </FieldLine>
                    )}
                    {hasIn('artThumb', disabledOrHidden) && (
                      <Field name="artThumb" label="简历附件">
                        <FileManagerEnhance
                          api="/api/person/v1/offer/sfs/token"
                          dataKey={formData.id}
                          listType="text"
                          disabled
                          preview={taskKey !== 'ACC_A30_01_SUBMIT_i'}
                        />
                      </Field>
                    )}
                    {hasIn('resId', disabledOrHidden) && (
                      <FieldLine
                        label="资源类型"
                        key="resType1"
                        fieldCol={2}
                        required={!disabledOrHidden.resId && true}
                      >
                        <Field
                          name="resType1"
                          key="resType1"
                          decorator={{
                            initialValue: formData.resType1 || undefined,
                            rules: [
                              {
                                required: !disabledOrHidden.resId && true,
                                message: '请选择资源类型一',
                              },
                            ],
                          }}
                          wrapperCol={{ span: 23, xxl: 24 }}
                        >
                          <Selection.UDC
                            code="RES:RES_TYPE1"
                            placeholder="请选择资源类型一"
                            disabled
                          />
                        </Field>
                        <Field
                          name="resType2"
                          key="resType2"
                          decorator={{
                            initialValue: formData.resType2 || undefined,
                            rules: [
                              {
                                required: !disabledOrHidden.resId && true,
                                message: '请选择资源类型二',
                              },
                            ],
                          }}
                          wrapperCol={{ span: 23, xxl: 24 }}
                        >
                          <Selection
                            source={type2}
                            placeholder="请选择资源类型二"
                            disabled={!!disabledOrHidden.resId}
                          />
                        </Field>
                      </FieldLine>
                    )}
                    {hasIn('entryType', disabledOrHidden) && (
                      <Field
                        name="entryType"
                        key="entryType"
                        label="入职类型"
                        decorator={{
                          initialValue: formData.entryType,
                          rules: [
                            {
                              required: !disabledOrHidden.entryType && true,
                              message: '请选择入职类型',
                            },
                          ],
                        }}
                      >
                        <Selection.UDC
                          code="RES:ENTRY_LEAVE_TYPE"
                          placeholder="请选择入职类型"
                          disabled={
                            taskKey === 'ACC_A30_01_SUBMIT_i'
                              ? formData.oldResStatus === 1
                              : !!disabledOrHidden.entryType
                          }
                          filters={[{ sphd1: 'ENTRY_INTERNAL' }]}
                          onChange={value => {
                            if (value !== 'AGAIN_INDUCTION' || value !== 'EXTERNAL_TO_INTERNAL') {
                              dispatch({
                                type: `${DOMAIN}/updateForm`,
                                payload: {
                                  buFlag: null,
                                  oldSaleBu: null,
                                },
                              });
                              setFieldsValue({ buFlag: null, oldSaleBu: null });
                            }
                          }}
                        />
                      </Field>
                    )}
                    {hasIn('buFlag', disabledOrHidden) && (
                      <Field
                        name="buFlag"
                        key="buFlag"
                        label="是否延用原销售BU"
                        decorator={{
                          initialValue: formData.buFlag,
                          rules: [
                            {
                              required:
                                taskKey === 'ACC_A30_01_SUBMIT_i'
                                  ? formData.resType === 'SALES_BU' &&
                                    (formData.entryType === 'AGAIN_INDUCTION' ||
                                      formData.entryType === 'EXTERNAL_TO_INTERNAL')
                                  : !disabledOrHidden.buFlag && true,
                              message: '请选择入职类型',
                            },
                          ],
                        }}
                      >
                        <RadioGroup
                          initialValue={formData.buFlag}
                          disabled={
                            taskKey === 'ACC_A30_01_SUBMIT_i'
                              ? !(
                                  formData.resType === 'SALES_BU' &&
                                  (formData.entryType === 'AGAIN_INDUCTION' ||
                                    formData.entryType === 'EXTERNAL_TO_INTERNAL')
                                )
                              : !!disabledOrHidden.buFlag
                          }
                          onChange={e => {
                            if (e.target.value === 'NO') {
                              dispatch({
                                type: `${DOMAIN}/updateForm`,
                                payload: {
                                  oldSaleBu: null,
                                },
                              });
                              setFieldsValue({ oldSaleBu: null });
                            }
                          }}
                        >
                          <Radio value="YES">是</Radio>
                          <Radio value="NO">否</Radio>
                        </RadioGroup>
                      </Field>
                    )}

                    {hasIn('oldSaleBu', disabledOrHidden) && (
                      <Field
                        name="oldSaleBu"
                        key="oldSaleBu"
                        label="原销售BU"
                        decorator={{
                          initialValue: formData.oldSaleBu || '',
                          rules: [
                            {
                              required:
                                taskKey === 'ACC_A30_01_SUBMIT_i'
                                  ? formData.buFlag === 'YES'
                                  : !disabledOrHidden.oldSaleBu && true,
                              message: '请选择原销售BU',
                            },
                          ],
                        }}
                      >
                        <Selection.Columns
                          className="x-fill-100"
                          source={oldSaleBuBuDataSource}
                          columns={particularColumns}
                          transfer={{ key: 'id', code: 'id', name: 'name' }}
                          dropdownMatchSelectWidth={false}
                          showSearch
                          onColumnsChange={value => {}}
                          disabled={
                            taskKey === 'ACC_A30_01_SUBMIT_i'
                              ? formData.buFlag !== 'YES'
                              : !!disabledOrHidden.oldSaleBu
                          }
                        />
                      </Field>
                    )}
                    {hasIn('inLieuFlag', disabledOrHidden) && (
                      <Field
                        name="inLieuFlag"
                        label="无加班人员"
                        decorator={{
                          initialValue: formData.inLieuFlag,
                          rules: [
                            {
                              required: !disabledOrHidden.inLieuFlag && true,
                              message: '请选择是否无加班人员',
                            },
                          ],
                        }}
                      >
                        <RadioGroup
                          disabled={!!disabledOrHidden.inLieuFlag}
                          initialValue={formData.inLieuFlag || ''}
                        >
                          <Radio value="NO">是</Radio>
                          <Radio value="YES">否</Radio>
                        </RadioGroup>
                      </Field>
                    )}
                    {hasIn('busiTrainFlag', disabledOrHidden) && (
                      <Field
                        name="busiTrainFlag"
                        label="参加商务基本资质培训"
                        decorator={{
                          initialValue: formData.busiTrainFlag,
                          rules: [
                            {
                              required: !disabledOrHidden.busiTrainFlag && true,
                              message: '参加商务基本资质培训',
                            },
                          ],
                        }}
                        labelCol={{ span: 8, xxl: 8 }}
                      >
                        <RadioGroup
                          disabled={!!disabledOrHidden.busiTrainFlag}
                          initialValue={formData.busiTrainFlag || ''}
                        >
                          <Radio value="YES">是</Radio>
                          <Radio value="NO">否</Radio>
                        </RadioGroup>
                      </Field>
                    )}
                    {hasIn('remark', disabledOrHidden) && (
                      <Field
                        name="remark"
                        label={formatMessage({ id: 'sys.system.remark', desc: '备注' })}
                        fieldCol={1}
                        labelCol={{ span: 4, xxl: 3 }}
                        wrapperCol={{ span: 19, xxl: 20 }}
                        decorator={{
                          initialValue: formData.remark || '',
                        }}
                      >
                        <Input.TextArea
                          disabled={!!disabledOrHidden.remark}
                          rows={3}
                          placeholder="请输入备注"
                        />
                      </Field>
                    )}

                    {hasIn('deliverOffer', disabledOrHidden) && (
                      <Field
                        name="deliverOffer"
                        label={
                          taskKey === 'ACC_A30_05_INFORM_APPLICANT_b' ? 'Offer是否发放' : '是否入职'
                        }
                        decorator={{
                          initialValue: formData.deliverOffer || undefined,
                          rules: [
                            {
                              required: true,
                              message: '请选择Offer是否发放',
                            },
                          ],
                        }}
                      >
                        <RadioGroup
                          initialValue={formData.deliverOffer || ''}
                          onChange={e => {
                            dispatch({
                              type: `${DOMAIN}/updateForm`,
                              payload: { noneOfferReason: undefined },
                            });
                            setFieldsValue({
                              noneOfferReason: null,
                            });
                          }}
                        >
                          <Radio value="YES">是</Radio>
                          <Radio value="NO">否</Radio>
                        </RadioGroup>
                      </Field>
                    )}
                    {hasIn('noneOfferReason', disabledOrHidden) && (
                      <Field
                        name="noneOfferReason"
                        label={
                          taskKey === 'ACC_A30_05_INFORM_APPLICANT_b'
                            ? 'Offer未发放原因'
                            : '未入职原因'
                        }
                        decorator={{
                          initialValue: formData.noneOfferReason,
                          rules: [
                            {
                              required: formData.deliverOffer === 'NO',
                              message: '请选择Offer未发放原因',
                            },
                          ],
                        }}
                      >
                        <Selection.UDC
                          code="RES:ABANDON_OFFER_REASON"
                          placeholder="请选择Offer未发放原因"
                          style={{ flex: 1 }}
                          disabled={formData.deliverOffer !== 'NO'}
                        />
                      </Field>
                    )}
                    {hasIn('offerReasonAccount', disabledOrHidden) && (
                      <Field
                        name="offerReasonAccount"
                        label={
                          taskKey === 'ACC_A30_05_INFORM_APPLICANT_b'
                            ? '未发原因说明'
                            : '未入职原因说明'
                        }
                        fieldCol={1}
                        labelCol={{ span: 4, xxl: 3 }}
                        wrapperCol={{ span: 19, xxl: 20 }}
                        decorator={{
                          initialValue: formData.offerReasonAccount || '',
                        }}
                      >
                        <Input.TextArea rows={3} placeholder="请输入备注" />
                      </Field>
                    )}
                    {hasIn('applyResId', disabledOrHidden) && (
                      <Field
                        name="applyResId"
                        label="申请人"
                        decorator={{
                          initialValue: formData.applyResName || '',
                        }}
                      >
                        <Input disabled />
                      </Field>
                    )}
                    {hasIn('applyDate', disabledOrHidden) && (
                      <Field
                        name="applyDate"
                        label="申请时间"
                        decorator={{
                          initialValue: formData.applyDate || '',
                        }}
                      >
                        <Input disabled />
                      </Field>
                    )}

                    {hasIn('ceoApprFlag', disabledOrHidden) && (
                      <Field
                        name="ceoApprFlag"
                        label="是否需要总裁审批"
                        fieldCol={1}
                        labelCol={{ span: 4, xxl: 3 }}
                        wrapperCol={{ span: 19, xxl: 20 }}
                        decorator={{
                          initialValue: formData.ceoApprFlag,
                          rules: [
                            {
                              required: !disabledOrHidden.ceoApprFlag && true,
                              message: '请选择是否需要总裁审批',
                            },
                          ],
                        }}
                      >
                        <RadioGroup disabled={!!disabledOrHidden.ceoApprFlag}>
                          <Radio value="YES">是</Radio>
                          <Radio value="NO">否</Radio>
                        </RadioGroup>
                      </Field>
                    )}
                    {hasIn('foreignName', disabledOrHidden) && (
                      <Field
                        name="foreignName"
                        label="英文名"
                        decorator={{
                          initialValue: formData.foreignName || '',
                          rules: [
                            {
                              required:
                                !disabledOrHidden.foreignName && formData.deliverOffer === 'YES',
                              message: '请输入英文名',
                            },
                          ],
                        }}
                      >
                        <Input
                          disabled={!!disabledOrHidden.foreignName}
                          placeholder="请输入英文名"
                        />
                      </Field>
                    )}
                    {hasIn('mobile', disabledOrHidden) && (
                      <Field
                        name="mobile"
                        label="手机号"
                        decorator={{
                          initialValue: formData.mobile || '',
                          rules: [
                            {
                              required: !disabledOrHidden.mobile && formData.deliverOffer === 'YES',
                              message: '请输入手机号！',
                            },
                            // {
                            //   pattern: /^1\d{10}$/,
                            //   message: '手机号格式错误',
                            // },
                          ],
                        }}
                      >
                        <Input disabled={!!disabledOrHidden.mobile} placeholder="请输入手机号" />
                      </Field>
                    )}
                    {hasIn('idType', disabledOrHidden) && (
                      <Field
                        name="idType"
                        label="证件类型"
                        decorator={{
                          initialValue: formData.idType,
                          rules: [
                            {
                              required: !disabledOrHidden.idType && formData.deliverOffer === 'YES',
                              message: '请选择证件类型',
                            },
                          ],
                        }}
                      >
                        <Selection.UDC
                          code="COM.ID_TYPE"
                          placeholder="请选择证件类型"
                          style={{ flex: 1 }}
                          disabled={!!disabledOrHidden.idType}
                          // onChange={value => {
                          //   setFieldsValue({ idType: value });
                          // }}
                        />
                      </Field>
                    )}

                    {hasIn('idType', disabledOrHidden) && (
                      <Field
                        name="idNo"
                        label="证件号码"
                        decorator={{
                          initialValue: formData.idNo,
                          rules: [
                            {
                              required: !disabledOrHidden.idType && formData.deliverOffer === 'YES',
                              message: '请输入证件号码',
                            },
                            // {
                            //   pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
                            //   message: '身份证号码格式错误',
                            // },
                          ],
                        }}
                      >
                        <Input
                          style={{ flex: 3 }}
                          disabled={!!disabledOrHidden.idType}
                          // onChange={(e, value) => {
                          //   dispatch({
                          //     type: `${DOMAIN}/updateForm`,
                          //     payload: { idNo: e.target.value },
                          //   });
                          // }}
                          placeholder="请输入证件号码"
                        />
                      </Field>
                    )}
                    {hasIn('birthday', disabledOrHidden) && (
                      <Field
                        name="birthday"
                        label="出生日期"
                        decorator={{
                          initialValue: formData.birthday ? moment(formData.birthday) : null,
                          rules: [
                            {
                              required:
                                !disabledOrHidden.birthday && formData.deliverOffer === 'YES',
                              message: '请选择出生日期',
                            },
                          ],
                        }}
                      >
                        <DatePicker disabled={!!disabledOrHidden.birthday} className="x-fill-100" />
                      </Field>
                    )}

                    {hasIn('periodFlag', disabledOrHidden) && (
                      <Field
                        name="periodFlag"
                        label="长期/短期"
                        decorator={{
                          initialValue: formData.periodFlag || undefined,
                          rules: [
                            {
                              required: false,
                              message: '请选择资源类别',
                            },
                          ],
                        }}
                      >
                        <RadioGroup
                          disabled={!!disabledOrHidden.periodFlag}
                          initialValue={formData.periodFlag || ''}
                        >
                          <Radio value="LONG">长期资源</Radio>
                          <Radio value="SHORT">短期资源</Radio>
                        </RadioGroup>
                      </Field>
                    )}
                    {hasIn('jobClass1', disabledOrHidden) && (
                      <Field
                        name="jobClass1"
                        key="jobClass1"
                        label="工种分类一"
                        decorator={{
                          initialValue: formData.jobClass1 || undefined,
                          rules: [
                            {
                              required: !disabledOrHidden.jobClass1,
                              message: '请选择工种分类一',
                            },
                          ],
                        }}
                      >
                        <Selection.UDC
                          code="RES:JOB_TYPE1"
                          placeholder="请选择工种分类一"
                          disabled={!!disabledOrHidden.jobClass1}
                          onChange={e => {
                            this.handleChangeType1(e);
                          }}
                        />
                      </Field>
                    )}
                    {hasIn('jobClass2', disabledOrHidden) && (
                      <Field
                        name="jobClass2"
                        key="jobClass2"
                        label="工种分类二"
                        decorator={{
                          initialValue: formData.jobClass2 || undefined,
                          rules: [
                            {
                              required: jobClass2.length > 0,
                              message: '请选择工种分类二',
                            },
                          ],
                        }}
                      >
                        <Selection
                          source={jobClass2}
                          placeholder="请选择工种分类二"
                          disabled={!!disabledOrHidden.jobClass2}
                        />
                      </Field>
                    )}
                    {hasIn('jobCapaSetId', disabledOrHidden) && (
                      <Field
                        name="jobCapaSetLevelDId"
                        key="jobCapaSetId"
                        label="复合能力"
                        decorator={{
                          initialValue: formData.jobCapaSetLevelDId || undefined,
                          rules: [
                            {
                              required: !(
                                formData.resType2 === '5' && formData.periodFlag === 'SHORT'
                              ),
                              message: '请选择复合能力',
                            },
                          ],
                        }}
                      >
                        <Selection
                          source={capaSetList}
                          placeholder="请选择复合能力"
                          disabled={!!disabledOrHidden.jobCapaSetId}
                          transfer={{ key: 'id', code: 'id', name: 'name' }}
                        />
                      </Field>
                    )}
                    {hasIn('accessLevel', disabledOrHidden) && (
                      <Field
                        name="accessLevel"
                        label="安全级别"
                        decorator={{
                          initialValue: formData.accessLevel || '10',
                          rules: [
                            {
                              required: false,
                              message: '请输入安全级别',
                            },
                            {
                              pattern: /^([1-9][0-9]{0,1}|100)$/,
                              message: '安全级别可输入值1-100',
                            },
                          ],
                        }}
                      >
                        <InputNumber
                          disabled={!!disabledOrHidden.accessLevel}
                          placeholder="请输入安全级别"
                          className="x-fill-100"
                        />
                      </Field>
                    )}
                    {hasIn('ouId', disabledOrHidden) && (
                      <Field
                        name="ouId"
                        label="所属公司"
                        decorator={{
                          initialValue: formData.ouId || '',
                          rules: [
                            {
                              required: !disabledOrHidden.ouId && formData.deliverOffer === 'YES',
                              message: '请选择所属公司',
                            },
                          ],
                        }}
                      >
                        <AsyncSelect
                          source={() => selectInternalOus().then(resp => resp.response)}
                          placeholder="请选择所属公司"
                          disabled={!!disabledOrHidden.ouId}
                        />
                      </Field>
                    )}
                    {hasIn('empNo', disabledOrHidden) && (
                      <Field
                        name="empNo"
                        label="工号"
                        decorator={{
                          initialValue: formData.empNo,
                          rules: [
                            {
                              required: !disabledOrHidden.empNo && formData.deliverOffer === 'YES',
                              message: '请输入工号',
                            },
                          ],
                        }}
                      >
                        <Input disabled={!!disabledOrHidden.empNo} placeholder="请输入工号" />
                      </Field>
                    )}
                    {formData.resType2 !== '5'
                      ? hasIn('enrollDate', disabledOrHidden) && (
                          // eslint-disable-next-line react/jsx-indent
                          <Field
                            name="enrollDate"
                            label="入职日期"
                            decorator={{
                              initialValue: formData.enrollDate
                                ? moment(formData.enrollDate)
                                : null,
                              rules: [
                                {
                                  required:
                                    !disabledOrHidden.enrollDate && formData.deliverOffer === 'YES',
                                  message: '请选择入职日期',
                                },
                                {
                                  validator: (rule, value, callback) => {
                                    if (
                                      isNil(value) ||
                                      isEmpty(value) ||
                                      isNil(regularDate) ||
                                      isEmpty(regularDate)
                                    )
                                      return callback();
                                    const timeCheck = moment(formatDT(value)).isSameOrBefore(
                                      formatDT(regularDate)
                                    );
                                    if (!timeCheck) {
                                      return callback(['入职日期不能大于转正日期']);
                                    }
                                    return callback();
                                  },
                                },
                              ],
                            }}
                          >
                            <DatePicker
                              disabled={!!disabledOrHidden.enrollDate}
                              className="x-fill-100"
                              format="YYYY-MM-DD"
                            />
                          </Field>
                        )
                      : null}

                    {formData.resType2 !== '5'
                      ? hasIn('regularDate', disabledOrHidden) && (
                          // eslint-disable-next-line react/jsx-indent
                          <Field
                            name="regularDate"
                            label="转正日期"
                            decorator={{
                              initialValue: formData.regularDate
                                ? moment(formData.regularDate)
                                : null,
                              rules: [
                                {
                                  required:
                                    !disabledOrHidden.regularDate &&
                                    formData.deliverOffer === 'YES',
                                  message: '请选择转正日期',
                                },
                                {
                                  validator: (rule, value, callback) => {
                                    if (
                                      isNil(value) ||
                                      isEmpty(value) ||
                                      isNil(enrollDate) ||
                                      isEmpty(enrollDate)
                                    )
                                      return callback();
                                    const timeCheck = moment(formatDT(value)).isSameOrAfter(
                                      formatDT(enrollDate)
                                    );
                                    if (!timeCheck) {
                                      return callback(['转正日期不能小于入职日期']);
                                    }
                                    return callback();
                                  },
                                },
                              ],
                            }}
                          >
                            <DatePicker
                              disabled={!!disabledOrHidden.regularDate}
                              className="x-fill-100"
                              format="YYYY-MM-DD"
                            />
                          </Field>
                        )
                      : null}
                    {formData.resType2 !== '5'
                      ? hasIn('contractSignDate', disabledOrHidden) && (
                          // eslint-disable-next-line react/jsx-indent
                          <Field
                            name="contractSignDate"
                            label="合同签订日期"
                            decorator={{
                              initialValue: formData.contractSignDate
                                ? moment(formData.contractSignDate)
                                : null,
                              rules: [
                                {
                                  required:
                                    !disabledOrHidden.contractSignDate &&
                                    formData.deliverOffer === 'YES',
                                  message: '请选择合同签订日期',
                                },
                                {
                                  validator: (rule, value, callback) => {
                                    if (
                                      isNil(value) ||
                                      isEmpty(value) ||
                                      isNil(contractExpireDate) ||
                                      isEmpty(contractExpireDate)
                                    )
                                      return callback();
                                    const timeCheck = moment(formatDT(value)).isSameOrBefore(
                                      formatDT(contractExpireDate)
                                    );
                                    if (!timeCheck) {
                                      return callback(['合同签订日期不能大于合同到期日期']);
                                    }
                                    return callback();
                                  },
                                },
                              ],
                            }}
                          >
                            <DatePicker
                              disabled={!!disabledOrHidden.contractSignDate}
                              className="x-fill-100"
                            />
                          </Field>
                        )
                      : null}
                    {formData.resType2 !== '5'
                      ? hasIn('contractExpireDate', disabledOrHidden) && (
                          // eslint-disable-next-line react/jsx-indent
                          <Field
                            name="contractExpireDate"
                            label="合同到期日期"
                            decorator={{
                              initialValue: formData.contractExpireDate
                                ? moment(formData.contractExpireDate)
                                : null,
                              rules: [
                                {
                                  required:
                                    !disabledOrHidden.contractExpireDate &&
                                    formData.deliverOffer === 'YES',
                                  message: '请选择合同到期日期',
                                },
                                {
                                  validator: (rule, value, callback) => {
                                    if (
                                      isNil(value) ||
                                      isEmpty(value) ||
                                      isNil(contractSignDate) ||
                                      isEmpty(contractSignDate)
                                    )
                                      return callback();
                                    const timeCheck = moment(formatDT(value)).isSameOrAfter(
                                      formatDT(contractSignDate)
                                    );
                                    if (!timeCheck) {
                                      return callback(['合同到期日期不能小于合同签订日期']);
                                    }
                                    return callback();
                                  },
                                },
                              ],
                            }}
                          >
                            <DatePicker
                              disabled={!!disabledOrHidden.contractExpireDate}
                              className="x-fill-100"
                            />
                          </Field>
                        )
                      : null}
                    {formData.resType2 !== '5'
                      ? hasIn('probationBeginDate', disabledOrHidden) && (
                          // eslint-disable-next-line react/jsx-indent
                          <Field
                            name="probationBeginDate"
                            label="试用期开始日期"
                            decorator={{
                              initialValue: formData.probationBeginDate
                                ? moment(formData.probationBeginDate)
                                : null,
                              rules: [
                                {
                                  required:
                                    !disabledOrHidden.probationBeginDate &&
                                    formData.deliverOffer === 'YES',
                                  message: '请选择试用期开始日期',
                                },
                                {
                                  validator: (rule, value, callback) => {
                                    if (
                                      isNil(value) ||
                                      isEmpty(value) ||
                                      isNil(probationEndDate) ||
                                      isEmpty(probationEndDate)
                                    )
                                      return callback();
                                    const timeCheck = moment(formatDT(value)).isSameOrBefore(
                                      formatDT(probationEndDate)
                                    );
                                    if (!timeCheck) {
                                      return callback(['试用期开始日期不能大于试用期结束日期']);
                                    }
                                    return callback();
                                  },
                                },
                              ],
                            }}
                          >
                            <DatePicker
                              disabled={!!disabledOrHidden.probationBeginDate}
                              className="x-fill-100"
                            />
                          </Field>
                        )
                      : null}
                    {formData.resType2 !== '5'
                      ? hasIn('probationEndDate', disabledOrHidden) && (
                          // eslint-disable-next-line react/jsx-indent
                          <Field
                            name="probationEndDate"
                            label="试用期结束日期"
                            decorator={{
                              initialValue: formData.probationEndDate
                                ? moment(formData.probationEndDate)
                                : null,
                              rules: [
                                {
                                  required:
                                    !disabledOrHidden.probationEndDate &&
                                    formData.deliverOffer === 'YES',
                                  message: '请选择试用期结束日期',
                                },
                                {
                                  validator: (rule, value, callback) => {
                                    if (
                                      isNil(value) ||
                                      isEmpty(value) ||
                                      isNil(probationBeginDate) ||
                                      isEmpty(probationBeginDate)
                                    )
                                      return callback();
                                    const timeCheck = moment(formatDT(value)).isSameOrAfter(
                                      formatDT(probationBeginDate)
                                    );
                                    if (!timeCheck) {
                                      return callback(['试用期结束日期不能小于试用期开始日期']);
                                    }
                                    return callback();
                                  },
                                },
                              ],
                            }}
                          >
                            <DatePicker
                              disabled={!!disabledOrHidden.probationEndDate}
                              className="x-fill-100"
                            />
                          </Field>
                        )
                      : null}
                    {hasIn('telfeeQuota', disabledOrHidden) && (
                      <Field
                        name="telfeeQuota"
                        label="话费额度"
                        decorator={{
                          initialValue: formData.telfeeQuota || '',
                          rules: [
                            {
                              required:
                                !disabledOrHidden.telfeeQuota && formData.deliverOffer === 'YES',
                              message: '请输入话费额度',
                            },
                          ],
                        }}
                      >
                        <Input
                          disabled={!!disabledOrHidden.telfeeQuota}
                          placeholder="请输入话费额度"
                        />
                      </Field>
                    )}
                    {hasIn('compfeeQuota', disabledOrHidden) && (
                      <Field
                        name="compfeeQuota"
                        label="电脑额度"
                        decorator={{
                          initialValue: formData.compfeeQuota || '',
                          rules: [
                            {
                              required:
                                !disabledOrHidden.compfeeQuota && formData.deliverOffer === 'YES',
                              message: '请输入电脑额度',
                            },
                          ],
                        }}
                      >
                        <Input
                          disabled={!!disabledOrHidden.compfeeQuota}
                          placeholder="请输入电脑额度"
                        />
                      </Field>
                    )}
                    {hasIn('salaryMethod', disabledOrHidden) && (
                      <Field
                        name="salaryMethod"
                        label="发薪方式"
                        decorator={{
                          initialValue: formData.salaryMethod,
                        }}
                      >
                        <UdcSelect
                          disabled={!!disabledOrHidden.salaryMethod}
                          code="COM.SALARY_METHOD"
                          placeholder="请选择发薪方式"
                        />
                      </Field>
                    )}

                    {hasIn('salaryPeriod', disabledOrHidden) && (
                      <Field
                        name="salaryPeriod"
                        label="发薪周期"
                        decorator={{
                          initialValue: formData.salaryPeriod || '',
                        }}
                      >
                        <UdcSelect
                          disabled={!!disabledOrHidden.salaryPeriod}
                          code="COM.SALARY_CYCLE"
                          placeholder="请选择发薪周期"
                        />
                      </Field>
                    )}

                    {formData.resType2 === '5'
                      ? hasIn('internDate', disabledOrHidden) && (
                          // eslint-disable-next-line react/jsx-indent
                          <Field
                            name="internDate"
                            label="实习入职时间"
                            decorator={{
                              initialValue: formData.internDate
                                ? moment(formData.internDate)
                                : null,
                              rules: [
                                {
                                  required:
                                    !disabledOrHidden.internDate &&
                                    formData.resType2 === '5' &&
                                    formData.deliverOffer === 'YES',
                                  message: '请选择实习入职时间',
                                },
                              ],
                            }}
                          >
                            <DatePicker
                              disabled={!!disabledOrHidden.internDate}
                              className="x-fill-100"
                              format="YYYY-MM-DD"
                            />
                          </Field>
                        )
                      : null}

                    {hasIn('emailAddr', disabledOrHidden) && (
                      <Field
                        name="emailAddr"
                        label="邮箱"
                        decorator={{
                          initialValue:
                            formData.emailAddr || `${formData.foreignName}@elitesland.com`,
                          rules: [
                            {
                              required: !disabledOrHidden.emailAddr && true,
                              message: '请输入邮箱',
                            },
                            {
                              type: 'email',
                              message: '请输入正确格式邮箱',
                            },
                          ],
                        }}
                      >
                        <Input
                          disabled={!!disabledOrHidden.emailAddr}
                          type="email"
                          placeholder="请输入邮箱"
                        />
                      </Field>
                    )}
                    {hasIn('password', disabledOrHidden) && (
                      <Field
                        name="password"
                        label="初始密码"
                        decorator={{
                          initialValue: formData.password || 'password',
                          rules: [
                            {
                              required: !disabledOrHidden.password && true,
                              message: '请输入初始密码',
                            },
                          ],
                        }}
                      >
                        <Input
                          disabled={!!disabledOrHidden.password}
                          placeholder="请输入初始密码"
                          className="x-fill-100"
                        />
                      </Field>
                    )}
                  </FieldList>

                  {hasIn('resCapacity', disabledOrHidden) && (
                    <>
                      <Divider dashed />
                      <ResCapacity />
                    </>
                  )}
                  {formData.resType === 'GENERAL' &&
                    hasIn('editEqvaRatioList', disabledOrHidden) && <Divider dashed />}
                  {formData.resType === 'GENERAL' &&
                    hasIn('editEqvaRatioList', disabledOrHidden) && (
                      <FieldList legend="当量系数" getFieldDecorator={getFieldDecorator}>
                        <EditableDataTable {...editEqvaRatioTableProps} />
                      </FieldList>
                    )}

                  {formData.resType === 'GENERAL' &&
                    hasIn('eqvaRatioList', disabledOrHidden) && <Divider dashed />}
                  {formData.resType === 'GENERAL' &&
                    hasIn('eqvaRatioList', disabledOrHidden) && (
                      <FieldList legend="当量系数" getFieldDecorator={getFieldDecorator}>
                        <DataTable {...eqvaRatioTableProps} />
                      </FieldList>
                    )}

                  {hasIn('entryItem', disabledOrHidden) && <Divider dashed />}
                  {hasIn('entryItem', disabledOrHidden) && (
                    <FieldList legend="入职事项办理">
                      <DataTable {...tableProps} scroll={{ y: 480 }} />
                    </FieldList>
                  )}

                  {hasIn('entryResInfoChk', disabledOrHidden) && <Divider dashed />}
                  {hasIn('entryResInfoChk', disabledOrHidden) && (
                    <FieldList legend="档案信息完善检查" getFieldDecorator={getFieldDecorator}>
                      <DataTable {...entryResTableProps} dataSource={entryResInfoChk} />
                    </FieldList>
                  )}
                </Card>
              </>
            ))}
          {mode === 'view' && (
            <OfferAndResView
              formData={formData}
              dataSource={dataSource}
              entryResInfoChk={entryResInfoChk}
              eqvaRatioList={eqvaRatioList}
            />
          )}
        </BpmWrapper>
      </PageHeaderWrapper>
    );
  }
}

export default offerAndResDetails;
