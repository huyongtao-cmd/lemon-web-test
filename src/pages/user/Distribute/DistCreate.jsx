import React from 'react';
import { connect } from 'dva';
import { Button, Card, DatePicker, Form, Input, InputNumber, Divider, Table, Tooltip } from 'antd';
import { formatMessage } from 'umi/locale';
import classnames from 'classnames';
import { isEmpty } from 'ramda';
import moment from 'moment';
import { TreeSelect } from '@/pages/gen/modal';
import Loading from '@/components/core/DataLoading';
import FieldList from '@/components/layout/FieldList';
import AsyncSelect from '@/components/common/AsyncSelect';
import SelectWithCols from '@/components/common/SelectWithCols';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { createConfirm } from '@/components/core/Confirm';
import { fromQs } from '@/utils/stringUtils';
import Title from '@/components/layout/Title';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { UdcCheck, UdcSelect, Selection } from '@/pages/gen/field';
import { closeThenGoto, injectUdc, mountToTab } from '@/layouts/routerControl';
import { genFakeId } from '@/utils/mathUtils';
import SubTable from './SubTable';

const DOMAIN = 'userDistCreate';
const { Field, FieldLine } = FieldList;

// --------------- 需要的数据写在这里,或者由数据文件import进来(*.data.js) -----------------

const SEL_COL = [
  // span为宽度。 合计不要超过24
  { dataIndex: 'code', title: '编号', span: 6 },
  { dataIndex: 'name', title: '名称', span: 14 },
];

/**
 * 派发新增/编辑
 */
@connect(({ loading, userDistCreate }) => ({
  loading,
  ...userDistCreate,
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    if (isEmpty(changedFields)) return;
    const { name, value } = Object.values(changedFields)[0];
    if (value instanceof Object && name !== 'planStartDate' && name !== 'planEndDate') {
      const key = name.split('Id')[0];
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { [key + 'Id']: value.id, [key + 'Name']: value.name },
      });
    } else if (name === 'planStartDate' || name === 'planEndDate') {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { [name]: moment(value).toISOString() },
      });
    } else {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { [name]: value },
      });
    }
  },
})
@mountToTab()
class TaskEdit extends React.PureComponent {
  /**
   * 渲染完成后要做的事情
   */
  state = {
    capaSearchValue: null,
    visible: false,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const param = fromQs();
    const { respondentResId } = fromQs();
    if (respondentResId) {
      dispatch({
        type: `${DOMAIN}/queryResCapaSetHandle`,
        payload: {
          resId: parseInt(respondentResId, 10),
          limit: 0,
        },
      });
    }

    dispatch({
      type: `${DOMAIN}/clean`,
    });
    if (param.id) {
      // id 派发id 从派发列表->编辑和推动流程
      dispatch({
        type: `${DOMAIN}/query`,
        payload: param,
      }).then(() => {
        this.fetchResponseList();
        // this.fetchFlowInfo(param.id);
      });
    } else if (param.taskId) {
      // taskId 任务包id 从任务包派发->新建派发
      dispatch({
        type: `${DOMAIN}/queryTask`,
        payload: { id: param.taskId },
      });
      // .then(() => {
      //   const { formData } = this.props;
      //   formData.distId && this.fetchFlowInfo(formData.distId);
      // });
    } else if (param.projId) {
      // projId 项目id 从项目派发->新建派发
      dispatch({
        type: `${DOMAIN}/queryProject`,
        payload: { id: param.projId },
      });
      // .then(() => {
      //   const { formData } = this.props;
      //   formData.distId && this.fetchFlowInfo(formData.distId);
      // });
    }

    // 资源列表
    dispatch({
      type: `${DOMAIN}/queryResList`,
    });

    dispatch({
      type: `${DOMAIN}/queryCapaTreeData`,
    });
  }

  fetchResponseList = () => {
    const { dispatch, formData } = this.props;
    if (formData.distMethod === 'DESIGNATE') return;
    dispatch({ type: `${DOMAIN}/queryDistResponse`, payload: formData.id });
  };

  fetchFlowInfo = id => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/queryFlow`, payload: id });
  };
  // --------------- 剩下的私有函数写在这里 -----------------

  // 工种 -> 工种子类
  handleChangeJobType1 = value => {
    const { dispatch, form } = this.props;
    dispatch({
      type: `${DOMAIN}/updateJobType2`,
      payload: value,
    }).then(() => {
      form.setFieldsValue({
        jobType2: null,
        capabilitySet: null,
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
        capabilitySet: null,
      });
    });
  };

  // 国家 -> 省
  handleChangeC1 = value => {
    const { dispatch, form } = this.props;
    dispatch({
      type: `${DOMAIN}/updateListC2`,
      payload: value,
    }).then(() => {
      form.setFieldsValue({
        workProvince: null,
        workPlace: null,
      });
    });
  };

  // 省 -> 市
  handleChangeC2 = value => {
    const { dispatch, form } = this.props;
    dispatch({
      type: `${DOMAIN}/updateListC3`,
      payload: value,
    }).then(() => {
      form.setFieldsValue({
        workPlace: null,
      });
    });
  };

  // 保存并派发
  handleSaveDistribute = () => {
    const {
      form: { validateFieldsAndScroll },
      formData,
      flowInfo,
      dispatch,
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        const flag = fromQs();
        if (!formData.receiverResId && !flag) {
          createConfirm({
            content: '请选择接收资源',
          });
          return;
        }
        const { apprId = null } = fromQs();
        // if (isEmpty(flowInfo)) {
        // 新建、编辑、推流程集于一体
        dispatch({
          type: `${DOMAIN}/saveDistribute`,
          payload: { formData, apprId },
        });
        // } else {
        //   const { taskId } = flowInfo;
        //   dispatch({
        //     type: `${DOMAIN}/saveDistribute`,
        //     payload: { taskId, result: 'APPROVED', remark: null },
        //   });
        // }
      }
    });
  };

  // 保存并广播
  handleSaveDistBroadcast = () => {
    const {
      form: { validateFieldsAndScroll },
      formData,
      responseList,
      dispatch,
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      const { apprId = null } = fromQs();
      if (!error) {
        dispatch({
          type: `${DOMAIN}/saveDistBroadcastFn`,
          payload: { formData, responseList, apprId },
        });
      }
    });
  };

  // 取消广播
  handleCancelDistBroadcast = () => {
    const {
      form: { validateFieldsAndScroll },
      formData,
      dispatch,
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/cancelDistBroadcast`,
          payload: { distId: formData.id },
        });
      }
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

  groupByType = (arr, param) => {
    const map = {};
    const dest = [];
    for (let i = 0; i < arr.length; i += 1) {
      const ai = {
        ...arr[i],
        key: arr[i].capaNo,
      };

      if (ai[param] && !map[ai[param]]) {
        dest.push({
          capaName: ai[param],
          key: i,
          children: [ai],
        });
        map[ai[param]] = ai;
      } else {
        for (let j = 0; j < dest.length; j += 1) {
          const dj = dest[j];
          if (dj.capaName === ai[param]) {
            dj.children.push(ai);
            break;
          }
        }
      }
    }
    return dest;
  };

  handleModelOk = (e, checkedKeys, checkRows) => {
    const { dispatch, formData } = this.props;
    const capaLevelIds = checkRows.map(item => item.id);
    const { respondentResId } = fromQs();
    const resId = respondentResId || formData.receiverResId;
    dispatch({
      type: `${DOMAIN}/queryResCapaStatusHandle`,
      payload: {
        capaLevelIds: capaLevelIds.join(','),
        resId,
      },
    }).then(res => {
      if (res) {
        this.toggleVisible();
      }
    });
  };

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

  deleteCapa = () => {
    const { selectData = {} } = this.state;
    const { selectedRows = [], selectedAll = false } = selectData;
    const { capaDataList = [], dispatch, capaDataListTmp = [] } = this.props;
    if (selectedAll) {
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          capaDataList: [],
          capaDataListTmp: [],
        },
      });
      this.setState({
        selectData: {
          selectedAll: false,
          selectedRows: [],
        },
      });
      return;
    }
    const selectedRowsKeys = selectedRows.map(item => item.key);
    const newCapaDataListTmp = capaDataListTmp.filter(
      item => !selectedRowsKeys.includes(item.capaNo)
    );
    const newCapaDataList = this.groupByType(newCapaDataListTmp, 'capaTypeName');
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        capaDataList: newCapaDataList,
        capaDataListTmp: newCapaDataListTmp,
      },
    });
  };

  render() {
    const {
      loading,
      dispatch,
      form,
      form: { getFieldDecorator },
      formData,
      responseList,
      modalList,
      modalTotal,
      // 下拉数据
      c2Data,
      c3Data,
      jobType2List,
      capasetLeveldList,
      resSource,
      resList,
      capaTreeDataDetail = [],
      fetchDataLoading,
      capaTreeDataDetailTotal = 0,
      capaTreeData = [],
      capaDataList = [],
      capaDataListTmp = [],
      resCapaSetData = [],
    } = this.props;
    let { flag } = fromQs();
    const { respondentResId } = fromQs();
    flag = flag === 'true';
    const { capaSearchValue, visible, selectData = {} } = this.state;
    const { selectedRows = [], selectedAll = false } = selectData;

    const isDesignate = formData.distMethod && formData.distMethod === 'DESIGNATE';
    const disabledBtn =
      loading.effects[`${DOMAIN}/query`] ||
      loading.effects[`${DOMAIN}/queryTask`] ||
      loading.effects[`${DOMAIN}/queryProject`] ||
      loading.effects[`${DOMAIN}/saveDistribute`] ||
      loading.effects[`${DOMAIN}/saveDistBroadcast`] ||
      loading.effects[`${DOMAIN}/cancelDistBroadcast`];

    const resCapaSetDataTable = {
      rowKey: 'id',
      bordered: true,
      pagination: false,
      size: 'small',
      selectedRowKeys: null,
      dataSource: resCapaSetData,
      total: resCapaSetData ? resCapaSetData.length : 0,
      scroll: {
        x: 1050,
      },
      columns: [
        {
          title: '复合能力',
          dataIndex: 'capaName',
          key: 'capaName',
          align: 'center',
          width: '30%',
        },
        {
          title: '当量系数',
          dataIndex: 'eqvaRatio',
          key: 'eqvaRatio',
          align: 'center',
          width: '20%',
        },
        {
          title: '能力描述',
          dataIndex: 'capaDesc',
          key: 'capaDesc',
          width: '70%',
          render: (value, row, index) => <pre>{value}</pre>,
        },
      ],
    };

    const rowSelection = {
      getCheckboxProps: record => ({
        disabled: capaDataListTmp.find(item => item.capaNo === record.id) || false, // Column configuration not to be checked
      }),
      selectedRowKeys: capaDataListTmp.map(item => item.capaNo) || [],
    };
    const columns = [
      {
        title: '单项能力',
        dataIndex: 'capaName',
        key: 'capaName',
        align: 'center',
        width: '40%',
      },
      {
        title: '能力描述',
        dataIndex: 'ddesc',
        key: 'ddesc',
        align: 'center',
        width: '30%',
        render: (value, row, index) =>
          value && value.length > 20 ? (
            <Tooltip placement="left" title={<pre>{value}</pre>}>
              <pre style={{ padding: '0 12px' }}>{`${value.substr(0, 20)}...`}</pre>
            </Tooltip>
          ) : (
            <pre style={{ padding: '0 12px' }}>{value}</pre>
          ),
      },
      {
        title: '接收资源获得状态',
        dataIndex: 'obtainStatusName',
        width: '30%',
        align: 'center',
        key: 'obtainStatusName',
      },
    ];

    const rowSelectionHandle = {
      onSelect: (record, selected, selectedRowsArray) => {
        let selectedRowsTmp = selectData.selectedRows || [];
        if (selected) {
          if (record.capaNo) {
            selectedRowsTmp.push(record);
          }
          if (record.children) {
            selectedRowsTmp = selectedRowsTmp.concat(record.children);
          }
        }
        if (!selected) {
          if (record.capaNo) {
            selectedRowsTmp = selectedRowsTmp.filter(item => item.capaNo !== record.capaNo);
          }
          if (record.children) {
            const capaNoArray = record.children.map(item => item.capaNo);
            selectedRowsTmp = selectedRowsTmp.filter(item => !capaNoArray.includes(item.capaNo));
          }
        }

        this.setState({
          selectData: {
            selectedRows: selectedRowsTmp,
          },
        });
      },
      onSelectAll: (selected, selectedRowsArray, changeRows) => {
        this.setState({
          selectData: {
            selectedAll: selected,
            selectedRows: capaDataListTmp || [],
          },
        });
      },
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
              <div>{newValue}</div>
            </Tooltip>
          );
        },
      },
    ];

    return (
      <PageHeaderWrapper title="任务派发">
        <Card className="tw-card-rightLine">
          {(isDesignate || (formData.receiverResId && formData.receiverResName)) && (
            <Button
              className="tw-btn-primary"
              icon="save"
              size="large"
              disabled={disabledBtn}
              onClick={this.handleSaveDistribute}
            >
              保存并派发
            </Button>
          )}
          {!isDesignate &&
            (formData.apprStatus === 'NOTSUBMIT' ||
              formData.distStatus === 'BROADCASTING' ||
              formData.apprStatus === 'REJECTED') && (
              <Button
                className="tw-btn-primary"
                icon="save"
                size="large"
                disabled={disabledBtn}
                onClick={this.handleSaveDistBroadcast}
              >
                保存并广播
              </Button>
            )}
          {!isDesignate &&
            formData.distStatus === 'BROADCASTING' && (
              <Button
                className="tw-btn-primary"
                // icon="save"
                size="large"
                disabled={disabledBtn}
                onClick={this.handleCancelDistBroadcast}
              >
                取消广播
              </Button>
            )}
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            disabled={disabledBtn}
            onClick={() => closeThenGoto(`/user/distribute/list`)}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>

        <Card
          className="tw-card-adjust"
          bordered={false}
          title={
            <Title icon="profile" id="app.settings.menuMap.distribute" defaultMessage="派发策略" />
          }
        >
          {disabledBtn ? (
            <Loading />
          ) : (
            <>
              <FieldList
                layout="horizontal"
                legend="派发策略"
                getFieldDecorator={getFieldDecorator}
                col={2}
                hasSeparator
              >
                <Field label="派发对象" presentational>
                  <span>{formData.reasonName}</span>
                </Field>
                <Field label="派发人/派发时间" presentational>
                  <span>
                    {formData.disterResName}/
                    {formData.distTime
                      ? formatDT(formData.distTime, 'YYYY-MM-DD HH:mm:ss')
                      : formatDT(Date.now(), 'YYYY-MM-DD HH:mm:ss')}
                  </span>
                </Field>
                <Field
                  name="distMethod"
                  label="派发方式"
                  decorator={{
                    initialValue: formData.distMethod,
                    rules: [{ required: true, message: '请选择派发方式' }],
                  }}
                >
                  <UdcCheck
                    disabled={flag}
                    multiple={false}
                    code="TSK.DISTRIBUTE_METHOD"
                    placeholder="请选择派发方式"
                    onChange={e => {
                      const { value } = e.target;
                      if (!value) return;

                      if (value === 'DESIGNATE') {
                        dispatch({
                          type: `${DOMAIN}/updateForm`,
                          payload: { respNumber: null, broadcastDays: null },
                        });
                      }
                      if (value === 'BROADCAST') {
                        form.setFieldsValue({ receiverResId: null });
                        dispatch({
                          type: `${DOMAIN}/updateState`,
                          payload: {
                            responseList: [],
                            formData: { ...formData, receiverResId: null, receiverResName: null },
                          },
                        });
                      }
                    }}
                  />
                </Field>
                <Field
                  name="receiverResId"
                  label="接收资源"
                  decorator={{
                    initialValue: flag ? parseInt(respondentResId, 10) : formData.receiverResId,
                    rules: [
                      {
                        required: isDesignate && !flag,
                        message: '请选择接收资源',
                      },
                    ],
                  }}
                >
                  <Selection.Columns
                    className="x-fill-100"
                    source={resSource}
                    columns={SEL_COL}
                    transfer={{ key: 'id', code: 'id', name: 'name' }}
                    dropdownMatchSelectWidth={false}
                    showSearch
                    onColumnsChange={value => {}}
                    onChange={val => {
                      if (val) {
                        dispatch({
                          type: `${DOMAIN}/queryResCapaSetHandle`,
                          payload: {
                            resId: parseInt(val, 10),
                            limit: 0,
                          },
                        });
                      } else {
                        dispatch({
                          type: `${DOMAIN}/updateState`,
                          payload: {
                            resCapaSetData: [],
                          },
                        });
                      }
                      dispatch({
                        type: `${DOMAIN}/updateState`,
                        payload: {
                          capaDataList: [],
                          capaDataListTmp: [],
                        },
                      });
                      dispatch({
                        type: `${DOMAIN}/updateForm`,
                        payload: { receiverResId: val },
                      });
                    }}
                    disabled={!isDesignate || flag}
                  />
                </Field>
                <Field
                  name="distDesc"
                  label="派发说明"
                  decorator={{
                    initialValue: formData.distDesc,
                  }}
                >
                  <Input maxLength={35} placeholder="请输入派发说明" />
                </Field>
                {!isDesignate && (
                  <Field
                    name="respNumber"
                    label="应答人数(上限)"
                    decorator={{
                      initialValue: formData.respNumber,
                      rules: [
                        {
                          required: false,
                          message: '请输入应答人数',
                        },
                      ],
                    }}
                  >
                    <InputNumber
                      className="x-fill-100"
                      placeholder="请输入应答人数"
                      precision={0}
                      min={0}
                      max={999999999999}
                    />
                  </Field>
                )}
                {!isDesignate && (
                  <Field
                    name="broadcastDays" // RESP_NUMBER
                    label="广播天数"
                    decorator={{
                      initialValue: formData.broadcastDays,
                      rules: [
                        {
                          required: false,
                          message: '请输入广播天数',
                        },
                      ],
                    }}
                  >
                    <InputNumber
                      className="x-fill-100"
                      placeholder="请输入广播天数"
                      precision={0}
                      min={0}
                      max={999999999999}
                    />
                  </Field>
                )}
                <Field
                  name="distStatus"
                  label="派发状态"
                  decorator={{
                    initialValue: formData.distStatus ? formData.distStatusDesc : '未派发',
                  }}
                >
                  <Input disabled />
                </Field>
              </FieldList>
              {!isDesignate && (
                <div>
                  <div className="tw-card-title">
                    {formatMessage({ id: `app.settings.menuMap.distResponse`, desc: '派发响应' })}
                  </div>
                  <SubTable
                    domain={DOMAIN}
                    loading={loading}
                    dispatch={dispatch}
                    formData={formData}
                    responseList={responseList}
                    modalList={modalList}
                    modalTotal={modalTotal}
                  />
                  <Divider dashed />
                </div>
              )}
              {formData.distMethod === 'DESIGNATE' && (
                <FieldList legend="能力要求" noReactive>
                  <div style={{ color: '#000', margin: '10px 0', fontSize: '17px' }}>
                    接收资源已获得复合能力
                  </div>
                  <Table {...resCapaSetDataTable} />
                  <div style={{ color: '#000', marginTop: '30px', fontSize: '17px' }}>
                    其他能力要求
                  </div>
                  <div style={{ color: '#1890ff', margin: '10px 0' }}>
                    接收资源获得以下单项能力后才可接任务包
                  </div>
                  <div style={{ margin: '10px 0' }}>
                    <Button
                      className="tw-btn-primary"
                      size="large"
                      disabled={!formData.receiverResId && !respondentResId}
                      onClick={() => {
                        this.setState({
                          visible: true,
                        });
                      }}
                      style={{
                        marginRight: '20px',
                      }}
                    >
                      添加
                    </Button>
                    <Button
                      disabled={
                        (!formData.receiverResId && !respondentResId) || selectedRows.length === 0
                      }
                      className="tw-btn-error"
                      size="large"
                      onClick={() => {
                        this.deleteCapa();
                      }}
                    >
                      删除
                    </Button>
                  </div>
                  <Table
                    bordered
                    dataSource={capaDataList || []}
                    columns={columns}
                    rowSelection={rowSelectionHandle}
                  />
                </FieldList>
              )}
              {formData.distMethod === 'BROADCAST' && (
                <FieldList
                  layout="horizontal"
                  legend="接包资源要求"
                  getFieldDecorator={getFieldDecorator}
                  col={2}
                >
                  <FieldLine label="复合能力" fieldCol={2} required>
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
                      name="capabilitySet"
                      decorator={{
                        initialValue: formData.capabilitySet,
                        rules: [{ required: true, message: '请选择级别' }],
                      }}
                      wrapperCol={{ span: 24 }}
                    >
                      <AsyncSelect source={capasetLeveldList} placeholder="请选择级别" />
                    </Field>
                  </FieldLine>

                  <Field
                    name="languageRequirement"
                    label="语言能力要求"
                    decorator={{
                      initialValue: formData.languageRequirement,
                      rules: [
                        {
                          required: false,
                          message: '请选择语言能力要求',
                        },
                      ],
                    }}
                  >
                    <Input maxLength={35} placeholder="请选择语言能力要求" />
                  </Field>
                  <Field
                    name="workStyle"
                    label="现场|远程"
                    decorator={{
                      initialValue: formData.workStyle,
                      rules: [
                        {
                          required: true,
                          message: '请选择现场|远程',
                        },
                      ],
                    }}
                  >
                    <UdcSelect code="RES.WORK_STYLE" placeholder="请选择现场|远程" />
                  </Field>
                  <Field
                    name="otherCapability"
                    label="其他能力要求"
                    decorator={{
                      initialValue: formData.otherCapability,
                      rules: [
                        {
                          required: false,
                          message: '请输入其他能力要求',
                        },
                      ],
                    }}
                  >
                    <Input maxLength={35} placeholder="请输入其他能力要求" />
                  </Field>
                  <Field
                    name="timeRequirement"
                    label="时间要求"
                    decorator={{
                      initialValue: formData.timeRequirement,
                      rules: [
                        {
                          required: true,
                          message: '请选择时间要求',
                        },
                      ],
                    }}
                  >
                    <UdcSelect code="TSK.TIME_REQUIREMENT" placeholder="请选择时间要求" />
                  </Field>
                  <Field
                    name="resBase"
                    label="资源所在地"
                    decorator={{
                      initialValue: formData.resBase,
                      rules: [
                        {
                          required: false,
                          message: '请选择资源所在地',
                        },
                      ],
                    }}
                  >
                    <UdcSelect code="COM:CITY" placeholder="请选择资源所在地" />
                  </Field>

                  <Field
                    name="workMethod"
                    label="兼职|全职"
                    decorator={{
                      initialValue: formData.workMethod,
                      rules: [
                        {
                          required: false,
                          message: '请选择兼职|全职',
                        },
                      ],
                    }}
                  >
                    <UdcSelect code="TSK.WORK_METHOD" placeholder="请选择资源所在地" />
                  </Field>
                  <Field
                    name="resType"
                    label="资源类型"
                    decorator={{
                      initialValue: formData.resType,
                      rules: [
                        {
                          required: false,
                          message: '请选择资源类型',
                        },
                      ],
                    }}
                  >
                    <UdcSelect multiple={false} code="RES.RES_TYPE1" placeholder="请选择资源类型" />
                  </Field>

                  <FieldLine label="工作地" fieldCol={2}>
                    <Field
                      name="workCountry"
                      decorator={{
                        initialValue: formData.workCountry,
                        rules: [{ required: false, message: '请选择国家' }],
                      }}
                      wrapperCol={{ span: 20, xxl: 23 }}
                    >
                      <UdcSelect
                        code="COM.COUNTRY"
                        placeholder="请选择国家"
                        onChange={this.handleChangeC1}
                      />
                    </Field>
                    <Field
                      name="workProvince"
                      decorator={{
                        initialValue: formData.workProvince,
                        rules: [{ required: false, message: '请选择省' }],
                      }}
                      wrapperCol={{ span: 20, xxl: 23 }}
                    >
                      <AsyncSelect
                        source={c2Data}
                        placeholder="请选择省"
                        onChange={this.handleChangeC2}
                      />
                    </Field>
                    <Field
                      name="workPlace"
                      decorator={{
                        initialValue: formData.workPlace,
                        rules: [{ required: false, message: '请选择市' }],
                      }}
                      wrapperCol={{ span: 20, xxl: 23 }}
                    >
                      <AsyncSelect source={c3Data} placeholder="请选择市" />
                    </Field>
                  </FieldLine>

                  <Field
                    name="workDetailaddr"
                    label="工作地说明"
                    decorator={{
                      initialValue: formData.workDetailaddr,
                      rules: [{ required: false, message: '请输入工作地说明' }],
                    }}
                  >
                    <Input maxLength={35} placeholder="请输入工作地说明" />
                  </Field>

                  <Field
                    name="planStartDate"
                    label="预计开始日期"
                    decorator={{
                      initialValue: formData.planStartDate ? moment(formData.planStartDate) : null,
                      rules: [
                        { required: false, message: '请选择预计开始日期' },
                        {
                          validator: (rule, value, callback) => {
                            if (
                              value &&
                              formData.planEndDate &&
                              moment(formData.planEndDate).isBefore(value)
                            ) {
                              callback('预计开始日期应该早于结束日期');
                            }
                            // Note: 必须总是返回一个 callback，否则 validateFieldsAndScroll 无法响应
                            callback();
                          },
                        },
                      ],
                    }}
                  >
                    <DatePicker placeholder="请选择预计开始日期" className="x-fill-100" />
                  </Field>
                  <Field
                    name="minCreditPoint"
                    label="最低信用积分"
                    decorator={{
                      initialValue: formData.minCreditPoint,
                      rules: [
                        {
                          required: false,
                          message: '请输入最低信用积分',
                        },
                      ],
                    }}
                  >
                    <Input maxLength={35} placeholder="请输入最低信用积分" />
                  </Field>
                  <Field
                    name="planEndDate"
                    label="预计结束日期"
                    decorator={{
                      initialValue: formData.planEndDate ? moment(formData.planEndDate) : null,
                      rules: [
                        { required: false, message: '请选择预计结束日期' },
                        {
                          validator: (rule, value, callback) => {
                            if (
                              value &&
                              formData.planStartDate &&
                              moment(value).isBefore(formData.planStartDate)
                            ) {
                              callback('预计结束日期应该晚于开始日期');
                            }
                            // Note: 必须总是返回一个 callback，否则 validateFieldsAndScroll 无法响应
                            callback();
                          },
                        },
                      ],
                    }}
                  >
                    <DatePicker placeholder="请选择预计结束日期" className="x-fill-100" />
                  </Field>
                  <Field
                    name="minSecurityLevel"
                    label="最低信用级别"
                    decorator={{
                      initialValue: +formData.minSecurityLevel,
                      rules: [
                        {
                          required: false,
                          message: '请输入最低信用级别',
                        },
                        {
                          min: 1,
                          max: 100,
                          type: 'number',
                          required: true,
                          message: '请输入1-100之间的整数',
                        },
                      ],
                    }}
                  >
                    <InputNumber
                      className="x-fill-100"
                      min={1}
                      max={100}
                      precision={0}
                      placeholder="请输入最低信用级别"
                    />
                  </Field>
                  <Field
                    name="remark"
                    label="备注"
                    decorator={{
                      initialValue: formData.remark,
                      rules: [{ required: false }],
                    }}
                    fieldCol={1}
                    labelCol={{ span: 4, xxl: 3 }}
                    wrapperCol={{ span: 19, xxl: 20 }}
                  >
                    <Input.TextArea placeholder="请输入备注" rows={3} maxLength={400} />
                  </Field>
                </FieldList>
              )}
            </>
          )}
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

export default TaskEdit;
