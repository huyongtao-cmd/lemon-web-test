import React from 'react';
import { connect } from 'dva';
import {
  Button,
  Card,
  Checkbox,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Radio,
} from 'antd';
import { formatMessage } from 'umi/locale';
import classnames from 'classnames';
import update from 'immutability-helper';
import moment from 'moment';
import { isNil, sum, isEmpty } from 'ramda';
import TaskTmplModal from './TaskTmplModal';
import { fromQs } from '@/utils/stringUtils';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { FileManagerEnhance, UdcSelect } from '@/pages/gen/field';
import { closeThenGoto, mountToTab } from '@/layouts/routerControl';
import AsyncSelect from '@/components/common/AsyncSelect';
import createMessage from '@/components/core/AlertMessage';
import SelectWithCols from '@/components/common/SelectWithCols';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import EditableDataTable from '@/components/common/EditableDataTable';
import FieldList from '@/components/layout/FieldList';
import { genFakeId, checkIfNumber, add, div, mul } from '@/utils/mathUtils';
import Loading from '@/components/core/DataLoading';

const DOMAIN = 'userTaskEdit';
const { Field, FieldLine } = FieldList;

// --------------- 需要的数据写在这里,或者由数据文件import进来(*.data.js) -----------------

const REQ_REPO = '/api/op/v1/taskManager/task/requirement/sfs/token';
const DEL_REPO = '/api/op/v1/taskManager/task/deliverable/sfs/token';

const SEL_COL = [
  // span为宽度。 合计不要超过24
  { dataIndex: 'code', title: '编号', span: 6 },
  { dataIndex: 'name', title: '名称', span: 14 },
];

const checkResSourceType = rst => rst === 'EXTERNAL_RES';

// 'jobType1,ExpenseBuId,receiverBuId,receiverResId';
const REQUEST_SETTLE = 'jobType1,reasonId,receiverResId';

/**
 * 任务新增/编辑
 */
@connect(({ loading, userTaskEdit, user }) => ({
  loading,
  ...userTaskEdit,
  user: user.user,
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    const { formData, dispatch, form } = props;
    if (changedFields && Object.values(changedFields)[0]) {
      const { name, value } = Object.values(changedFields)[0];
      const newFieldData = { [name]: value };
      switch (name) {
        default:
          break;
        // 接收资源 - 数据拆分
        case 'receiverResId':
          Object.assign(newFieldData, {
            receiverResId: value ? value.id : null,
            receiverResName: value ? value.name : null,
            receiverBuId: value ? value.receiverBuId : null,
            receiverBuName: value ? value.receiverBuName : null,
            resSourceType: value ? value.resSourceType : null,
          });
          if (value && checkResSourceType(value.resSourceType)) {
            Object.assign(newFieldData, {
              eqvaRatio: 1,
            });
          }
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
        // 允许转包用0/1替代布尔类型
        case 'allowTransferFlag':
          Object.assign(newFieldData, {
            [name]: +value,
          });
          break;
        // case 'resSourceType': // 外部资源当量恒定为1
        //   if (checkResSourceType('EXTERNAL_RES')) {
        //     Object.assign(newFieldData, {
        //       eqvaRatio: 1,
        //     });
        //   }
        //   break;
        // antD 时间组件返回的是moment对象 转成字符串提交
        case 'distDate':
        case 'planStartDate':
        case 'planEndDate':
          Object.assign(newFieldData, {
            [name]: formatDT(value),
          });
          break;
        case 'settlePriceFlag':
          // 当自定义BU结算价格为1，则自己手动输入实际BU结算价格；否则实际BU结算价格=参考BU结算价
          if (value && value === '1') {
            // 自定义BU结算价时，管理费相关操作
            // Object.assign(newFieldData, {
            //   ohfeePriceFlag: '0',
            //   ohfeePrice: null,
            // });
          } else {
            // 非自定义BU结算价时，实际BU结算价等于参考BU结算价
            Object.assign(newFieldData, {
              buSettlePrice: formData.suggestSettlePrice, // 实际BU结算价格
              settlePrice: div(
                formData.suggestSettlePrice * 100,
                add(100, formData.taxRate)
              ).toFixed(2), // 最终结算单价
            });
          }
          break;
        case 'buSettlePrice':
          {
            // div(mul(newForm.buSettlePrice, add(100, newForm.taxRate)), 100).toFixed(2)
            const settlePrice = value
              ? div(mul(value, add(100, formData.taxRate || 0)), 100).toFixed(2)
              : 0;
            const amt =
              formData.eqvaQty && settlePrice ? mul(formData.eqvaQty, settlePrice).toFixed(2) : 0;
            Object.assign(newFieldData, {
              [name]: value,
              settlePrice,
              amt,
            });
          }
          break;
      }
      // 更新表单
      dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: newFieldData,
      });
    }
  },
})
@mountToTab()
class TaskEdit extends React.PureComponent {
  state = {
    _selectedRowKeys: [],
    taskTmplVisible: false,
  };

  /**
   * 渲染完成后要做的事情
   */
  componentDidMount() {
    const {
      dispatch,
      formData: { acceptMethod },
    } = this.props;
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'TASK_MANAGER_SAVE' },
    });
    const param = fromQs();
    if (param.id) {
      dispatch({
        type: `${DOMAIN}/query`,
        payload: param,
      });
    } else if (param.applyId) {
      dispatch({
        type: `${DOMAIN}/queryTaskApply`,
        payload: param,
      });
    } else if (param.subpackId) {
      // 如果为转包任务
      dispatch({
        type: `${DOMAIN}/querySubpack`,
        payload: param.subpackId,
      });
      // 任务包活动信息 新增固定数据
      this.handleChangeAcceptMethod(acceptMethod);
    } else if (param.lodIds && param.mode === 'generatePackage') {
      // 项目日志 生成任务包
      dispatch({
        type: `${DOMAIN}/queryProInfoByLogIds`,
        payload: param.lodIds,
      });
    } else if (param.lodIds && param.mode === 'updatePackage') {
      // 项目日志 当量调整
      dispatch({
        type: `${DOMAIN}/updateProInfoByLogIds`,
        payload: param.lodIds,
      });
    } else {
      dispatch({
        type: `${DOMAIN}/clean`,
      });
    }

    // 资源列表
    dispatch({
      type: `${DOMAIN}/queryResList`,
    });
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

  // --------------- 剩下的私有函数写在这里 -----------------

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
      distDate: formData.distDate,
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

  // handleChangeCapasetLeveldId = (value, a, b) => {
  //   const { dispatch, form, formData } = this.props;
  // };

  handleChangeAcceptMethod = value => {
    const {
      dataList,
      dispatch,
      form: { setFieldsValue },
    } = this.props;
    // 验收方式为任务包时，给第一行赋默认值‘任务包结算特殊活动’
    if (value && value === '01' && !dataList.filter(item => item.actNo === '0000').length) {
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          dataList: [
            {
              id: genFakeId(-1),
              actNo: '0000',
              projActivityId: 0,
              actName: '任务包结算特殊活动',
              milestoneFlag: 1,
              settledEqva: 0,
              eqvaQty: 0,
              finishDesc: null,
              finishDate: null,
              requiredDocList: null,
              actStatus: null,
              planStartDate: moment(Date.now()),
              planEndDate: moment(Date.now()).add(1, 'days'),
            },
          ].concat(dataList),
        },
      });
    }
    // 验收方式不为任务包时，给去除‘任务包结算特殊活动’列
    if (value && value !== '01' && dataList.map(item => item.actNo === '0000').length) {
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: { dataList: dataList.filter(item => item.actNo !== '0000') },
      });
    }
    if (value !== '04') {
      dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { autoSettleFlag: 0 },
      });
      setFieldsValue({ autoSettleFlag: 0 });
    } else {
      dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { autoSettleFlag: 1 },
      });
      setFieldsValue({ autoSettleFlag: 1 });
    }
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
    dispatch({
      type: `${DOMAIN}/queryTaskSettleByCondition`,
      payload: {
        jobType1: formData.jobType1,
        expenseBuId: value.expenseBuId || null,
        receiverBuId: formData.receiverBuId,
        receiverResId: formData.receiverResId,
        settlePriceFlag: formData.settlePriceFlag,
        buSettlePrice: formData.buSettlePrice,
        reasonType: formData.reasonType,
        reasonId: value.id || null,
        distDate: formData.distDate,
      },
    });
  };

  // 选择接收资源
  handleChangeReceiverResId = value => {
    const { dispatch, formData } = this.props;
    dispatch({
      type: `${DOMAIN}/queryTaskSettleByCondition`,
      payload: {
        jobType1: formData.jobType1,
        expenseBuId: formData.expenseBuId,
        receiverBuId: value ? value.receiverBuId : null,
        receiverResId: value ? value.id : null,
        settlePriceFlag: formData.settlePriceFlag,
        buSettlePrice: formData.buSettlePrice,
        reasonType: formData.reasonType,
        reasonId: formData.reasonId,
        distDate: formData.distDate,
      },
    });
  };

  // 选择派发期间
  handleDistDate = value => {
    const { dispatch, formData } = this.props;
    dispatch({
      type: `${DOMAIN}/queryTaskSettleByCondition`,
      payload: {
        jobType1: formData.jobType1,
        expenseBuId: formData.expenseBuId,
        receiverBuId: formData.receiverBuId,
        receiverResId: formData.receiverResId,
        settlePriceFlag: formData.settlePriceFlag,
        buSettlePrice: formData.buSettlePrice,
        reasonType: formData.reasonType,
        reasonId: formData.reasonId,
        distDate: formatDT(value),
      },
    });
  };

  // 行编辑
  onCellChanged = (rowIndex, rowField) => rowFieldValue => {
    const { dispatch, dataList, form, formData } = this.props;
    let preparedData = {};
    let val = rowFieldValue && rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue;
    if (rowField === 'milestoneFlag') {
      val = rowFieldValue.target.checked ? 1 : 0;
    }
    if (rowField === 'planEndDate' || rowField === 'planStartDate') {
      val = formatDT(val);
    }
    preparedData = {
      [rowIndex]: {
        [rowField]: {
          $set: val,
        },
      },
    };

    // 选择项目活动切换数据
    if (rowField === 'actId') {
      preparedData = {
        [rowIndex]: {
          actName: {
            $set: val && val.actName ? val.actName : null,
          },
          actNo: {
            $set: val && val.actNo ? val.actNo : null,
          },
          projActivityId: {
            $set: val && val.id ? val.id : null,
          },
          milestoneFlag: {
            $set: val && val.milestoneFlag ? val.milestoneFlag : 0,
          },
        },
      };
    }

    if (rowField === 'eqvaQty') {
      // 总金额 = 总当量 * 最终结算单价
      const newDataList = update(dataList, preparedData);
      const arr = newDataList.map(item => item.eqvaQty).filter(value => value && value > 0);
      const eqvaQty = sum(arr);
      const amt =
        eqvaQty && formData.settlePrice ? mul(eqvaQty, formData.settlePrice).toFixed(2) : 0;
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: { dataList: newDataList, formData: { ...formData, eqvaQty, amt } },
      });
      form.setFieldsValue({
        eqvaQty,
        amt,
      });
    } else {
      // 更新单元格状态
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          dataList: update(dataList, preparedData),
        },
      });
    }
  };

  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
      dataList,
    } = this.props;
    const param = fromQs();
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        // check dataList
        const unLegalRows = dataList.filter(data => isNil(data.actName) || isNil(data.eqvaQty));
        if (!isEmpty(unLegalRows)) {
          createMessage({ type: 'warn', description: '行编辑未通过，请检查输入项。' });
        } else {
          if (param.lodIds) {
            dispatch({
              type: `${DOMAIN}/updateForm`,
              payload: { projectLogIds: param.lodIds.split(',') },
            });
          }
          const params = fromQs();
          // params 参数与派发的流程
          dispatch({
            type: `${DOMAIN}/save`,
            payload: params,
          });
        }
      }
    });
  };

  getTableProps = () => {
    const {
      loading,
      form,
      dispatch,
      formData,
      dataList,
      // 查询列表
      // 表格
      actSource,
      actList,
      pageConfig,
    } = this.props;
    const { _selectedRowKeys } = this.state;
    const param = fromQs();
    // 页面配置信息数据处理
    if (!pageConfig.pageBlockViews || pageConfig.pageBlockViews.length < 1) {
      return <div />;
    }
    let currentConfig = [];
    pageConfig.pageBlockViews.forEach(view => {
      if (view.tableName === 'T_RES_ACTIVITY') {
        currentConfig = view;
      }
    });
    const { pageFieldViews } = currentConfig;
    const pageFieldJson = {};
    if (pageFieldViews) {
      pageFieldViews.forEach(field => {
        pageFieldJson[field.fieldKey] = field;
      });
    }
    const {
      actNo = {},
      actName = {},
      actStatus = {},
      planStartDate = {},
      planEndDate = {},
      settledEqva = {},
      milestoneFlag = {},
      finishDate = {},
      finishDesc = {},
      requiredDocList = {},
    } = pageFieldJson;
    return {
      rowKey: 'id',
      scroll: { x: 2000 },
      loading: loading.effects[`${DOMAIN}/query`] || loading.effects[`${DOMAIN}/queryTaskApply`],
      pagination: false,
      dataSource: dataList,
      total: dataList.length || 0,
      showCopy: false,
      rowSelection: {
        selectedRowKeys: _selectedRowKeys,
        onChange: (selectedRowKeys, selectedRows) => {
          this.setState({
            _selectedRowKeys: selectedRowKeys,
          });
        },
        getCheckboxProps: record => ({
          disabled: record.actNo === '0000',
        }),
      },
      onAdd: newRow => {
        const genId = genFakeId(-1);
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            dataList: update(dataList, {
              $push: [
                {
                  ...newRow,
                  id: genId,
                  settledEqva: 0,
                  eqvaQty: 0,
                  planStartDate: moment(Date.now()),
                  planEndDate: moment(Date.now()).add(1, 'days'),
                },
              ],
            }),
          },
        });
        return genId;
      },
      onSave: (rowForm, record, index) => {
        let isValid = false;
        rowForm.validateFields((error, row) => {
          if (error) {
            createMessage({ type: 'warn', description: '行编辑未通过，请检查输入项。' });
            return;
          }
          // const { dispatch, dataList } = this.props;
          row.planEndDate = formatDT(row.planEndDate); // eslint-disable-line
          row.planStartDate = formatDT(row.planStartDate); // eslint-disable-line
          // 更新单元格状态 - 异步
          dispatch({
            type: `${DOMAIN}/updateState`,
            payload: {
              dataList: update(dataList, {
                [index]: {
                  $merge: row,
                },
              }),
            },
          });
          // 注意 不一定保存成功 但是校验已经可以返回了。
          // 数据保存成功或者失败会提示用户，并且可能会导致表格刷新。
          isValid = true;
        });
        return isValid;
      },
      onDeleteItems: (selectedRowKeys, selectedRows) => {
        // 被减数
        const eqvaQty = dataList
          .filter(row => !selectedRowKeys.includes(row.id))
          .map(item => item.eqvaQty || 0)
          .reduce((total, num) => total + Math.round(num), 0);
        const min = sum(
          dataList.filter(row => !selectedRowKeys.includes(row.id)).map(item => item.eqvaQty || 0)
        );
        const amt =
          eqvaQty && formData.settlePrice ? mul(eqvaQty, formData.settlePrice).toFixed(2) : 0;

        // console.log('----------delete---form', formData.eqvaQty, selectedRowKeys, min, eqvaQty, amt)
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            dataList: dataList.filter(row => !selectedRowKeys.includes(row.id)),
            formData: { ...formData, eqvaQty, amt },
          },
        });
        this.setState({
          _selectedRowKeys: [],
        });
        form.setFieldsValue({
          eqvaQty,
          amt,
        });
      },
      columns: [
        actNo.visibleFlag && {
          title: `${actNo.displayName}`,
          dataIndex: 'actNo',
          key: 'actNo',
          sortNo: `${actNo.sortNo}`,
          className: 'text-center',
          required: !!actNo.requiredFlag,
          options: {
            rules: [
              {
                required: !!actNo.requiredFlag,
                message: `请输入${actNo.displayName}`,
              },
            ],
          },
          render: (value, row, index) => (
            <Input
              disabled={formData.reasonType === '01' || row.actNo === '0000'}
              value={value}
              placeholder={formData.reasonType === '01' ? '[由项目活动带出]' : '请输入活动编号'}
              onChange={this.onCellChanged(index, 'actNo')}
            />
          ),
        },
        actName.visibleFlag && {
          title: `${actName.displayName}`,
          dataIndex: 'actName',
          key: 'actName',
          sortNo: `${actName.sortNo}`,
          width: 200,
          required: !!actName.requiredFlag,
          options: {
            rules: [
              {
                required: !!actName.requiredFlag,
                message: `请输入${actName.displayName}`,
              },
            ],
          },
          render: (value, row, index) => {
            if (formData.reasonType === '01' || formData.sourceReasonType === '01') {
              return (
                <SelectWithCols
                  labelKey="name"
                  valueKey="code"
                  value={value ? { name: value, code: row.actNo } : undefined}
                  columns={SEL_COL}
                  dataSource={actSource}
                  onChange={this.onCellChanged(index, 'actId')}
                  selectProps={{
                    showSearch: true,
                    disabled: row.actNo === '0000',
                    onSearch: val => {
                      dispatch({
                        type: `${DOMAIN}/updateState`,
                        payload: {
                          actSource: actList.filter(
                            d =>
                              d.code.indexOf(val) > -1 ||
                              d.name.toLowerCase().indexOf(val.toLowerCase()) > -1
                          ),
                        },
                      });
                    },
                    allowClear: true,
                    style: { width: '100%' },
                  }}
                />
              );
            }

            return (
              <Input
                value={value}
                disabled={row.actNo === '0000'}
                onChange={this.onCellChanged(index, 'actName')}
              />
            );
          },
        },
        planStartDate.visibleFlag && {
          title: `${planStartDate.displayName}`,
          dataIndex: 'planStartDate',
          key: 'planStartDate',
          sortNo: `${planStartDate.sortNo}`,
          required: !!planStartDate.requiredFlag,
          className: 'text-center',
          render: (value, row, index) => (
            <DatePicker
              className="x-fill-100"
              value={moment(value || Date.now())}
              placeholder={`${planStartDate.displayName}`}
              format="YYYY-MM-DD"
              onChange={this.onCellChanged(index, 'planStartDate')}
            />
          ),
        },
        planEndDate.visibleFlag && {
          title: `${planEndDate.displayName}`,
          dataIndex: 'planEndDate',
          key: 'planEndDate',
          sortNo: `${planEndDate.sortNo}`,
          required: !!planEndDate.requiredFlag,
          className: 'text-center',
          render: (value, row, index) => (
            <DatePicker
              className="x-fill-100"
              value={value ? moment(value) : moment(Date.now()).add(1, 'days')}
              placeholder={`${planEndDate.displayName}`}
              format="YYYY-MM-DD"
              onChange={this.onCellChanged(index, 'planEndDate')}
            />
          ),
        },
        pageFieldJson.eqvaQty.visibleFlag && {
          title: `${pageFieldJson.eqvaQty.displayName}`, // 小于1000
          dataIndex: 'eqvaQty',
          key: 'eqvaQty',
          sortNo: `${pageFieldJson.eqvaQty.sortNo}`,
          required: !!pageFieldJson.eqvaQty.requiredFlag,
          options: {
            rules: [
              {
                required: !!pageFieldJson.eqvaQty.requiredFlag,
                message: `请输入${pageFieldJson.eqvaQty.displayName}`,
              },
              {
                validator: (rule, value, callback) => {
                  if (isNil(value)) {
                    callback([`请输入${pageFieldJson.eqvaQty.displayName}`]);
                  } else {
                    const error = [];
                    if (!checkIfNumber(value)) error.push('输入类型不正确');
                    callback(error);
                  }
                },
              },
            ],
          },
          className: 'text-right',
          render: (value, row, index) => (
            <InputNumber
              className="x-fill-100"
              precision={2}
              min={0}
              max={999999999999}
              value={value}
              onChange={this.onCellChanged(index, 'eqvaQty')}
            />
          ),
        },
        settledEqva.visibleFlag && {
          title: `${settledEqva.displayName}`,
          dataIndex: 'settledEqva',
          key: 'settledEqva',
          sortNo: `${settledEqva.sortNo}`,
          required: !!settledEqva.requiredFlag,
          className: 'text-right',
          render: (value, row, index) => (
            <InputNumber disabled value={value} onBlur={this.onCellChanged(index, 'settledEqva')} />
          ),
        },
        actStatus.visibleFlag && {
          title: `${actStatus.displayName}`,
          dataIndex: 'actStatusName',
          key: 'actStatusName',
          sortNo: `${actStatus.sortNo}`,
          required: !!actStatus.requiredFlag,
          className: 'text-center',
          render: (value, row, index) => value || '未开始',
        },
        milestoneFlag.visibleFlag && {
          title: `${milestoneFlag.displayName}`,
          dataIndex: 'milestoneFlag',
          key: 'milestoneFlag',
          sortNo: `${milestoneFlag.sortNo}`,
          required: !!milestoneFlag.requiredFlag,
          className: 'text-center',
          render: (value, row, index) => (
            <Checkbox
              disabled={formData.reasonType === '01'}
              checked={!!value}
              onChange={this.onCellChanged(index, 'milestoneFlag')}
            />
          ),
        },
        requiredDocList.visibleFlag && {
          title: `${requiredDocList.displayName}`,
          dataIndex: 'requiredDocList',
          key: 'requiredDocList',
          sortNo: `${requiredDocList.sortNo}`,
          required: !!requiredDocList.requiredFlag,
          render: (value, row, index) => (
            <Input.TextArea
              value={value}
              placeholder={`${requiredDocList.displayName}`}
              rows={1}
              onChange={this.onCellChanged(index, 'requiredDocList')}
            />
          ),
        },
        finishDate.visibleFlag && {
          title: `${finishDate.displayName}`,
          dataIndex: 'finishDate',
          key: 'finishDate',
          sortNo: `${finishDate.sortNo}`,
          required: !!finishDate.requiredFlag,
          className: 'text-center',
          render: value => formatDT(value),
        },
        finishDesc.visibleFlag && {
          title: `${finishDesc.displayName}`,
          dataIndex: 'finishDesc',
          key: 'finishDesc',
          sortNo: `${finishDesc.sortNo}`,
          required: !!finishDesc.requiredFlag,
          render: (value, row, index) => (
            <Input
              disabled
              value={value}
              placeholder={`${finishDesc.displayName}`}
              onBlur={this.onCellChanged(index, 'finishDesc')}
            />
          ),
        },
      ]
        .filter(Boolean)
        .sort((field1, field2) => field1.sortNo - field2.sortNo),
      buttons: [],
    };
  };

  toggleModal = () => {
    const { taskTmplVisible } = this.state;
    this.setState({
      taskTmplVisible: !taskTmplVisible,
    });
  };

  onTaskTmplCheck = taskTmpl => {
    const { dispatch, formData, dataList } = this.props;

    const tmplActs = taskTmpl.dtlViews || [];
    const newList = tmplActs.map(act => ({
      id: genFakeId(-1),
      settledEqva: 0,
      eqvaQty: act.eqvaQty,
      actNo: act.actNo,
      actName: act.actName,
      requiredDocList: act.requiredDocList,
      milestoneFlag: act.milestoneFlag,
      planStartDate: moment(Date.now()),
      planEndDate: moment(Date.now()).add(1, 'days'),
    }));

    const newFormData = { ...formData, attachuploadMethod: taskTmpl.attachuploadMethod };
    const newDataList = [...dataList, ...newList];

    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { formData: newFormData, dataList: newDataList },
    });
    this.toggleModal();
  };

  // --------------- 私有函数区域结束 -----------------

  renderPage = () => {
    const {
      loading,
      dispatch,
      form,
      form: { getFieldDecorator },
      formData,
      dataList,
      // 查询列表
      jobType2List,
      capasetLeveldList,
      resSource,
      resList,
      buSource,
      buList,
      taskProjSource,
      taskProjList,
      preSaleSource,
      preSaleList,
      // 表格
      actList,
      // 权限
      user,
      pageConfig,
    } = this.props;
    const { subpackId } = fromQs();
    const readOnly = true;

    const fromSubpack = (formData && formData.transferFlag) || !!subpackId;

    // 页面配置信息数据处理
    if (!pageConfig.pageBlockViews || pageConfig.pageBlockViews.length < 1) {
      return <div />;
    }
    let currentTaskConfig = [];
    let currentSettlementConfig = [];
    pageConfig.pageBlockViews.forEach(view => {
      if (view.tableName === 'T_TASK') {
        currentTaskConfig = view;
      } else if (view.tableName === 'T_TASK_TRANSFER') {
        currentSettlementConfig = view;
      }
    });
    const { pageFieldViews: pageFieldViewsTask } = currentTaskConfig; // 任务信息
    const { pageFieldViews: pageFieldViewsSettlement } = currentSettlementConfig; // 结算信息

    const pageFieldJsonTask = {}; // 任务信息
    const pageFieldJsonSettlement = {}; // 结算信息
    if (pageFieldViewsTask) {
      pageFieldViewsTask.forEach(field => {
        pageFieldJsonTask[field.fieldKey] = field;
      });
    }
    if (pageFieldViewsSettlement) {
      pageFieldViewsSettlement.forEach(field => {
        pageFieldJsonSettlement[field.fieldKey] = field;
      });
    }
    const {
      disterResId = {},
      taskName = {},
      taskStatus = {},
      taskNo = {},
      expenseBuId = {},
      receiverBuId = {},
      receiverResId = {},
      reasonType = {},
      reasonId = {},
      allowTransferFlag = {},
      planStartDate = {},
      planEndDate = {},
      acceptMethod = {},
      buSettlePrice = {},
      eqvaRatio = {},
      eqvaQty = {},
      taxRate = {},
      guaranteeRate = {},
      cooperationType = {},
      attachuploadMethod = {},
      remark = {},
      capasetLeveldId = {},
      suggestSettlePrice = {},
      settlePriceFlag = {},
      taskPackageType = {},
      autoSettleFlag = {},
      distDate = {},
      createUserId = {},
      createTime = {},
    } = pageFieldJsonTask;
    const { pid = {} } = pageFieldJsonSettlement;
    const taskFields = [
      <Field
        // 发包人
        name="disterResName"
        key="disterResId"
        label={disterResId.displayName}
        sortNo={disterResId.sortNo}
        decorator={{
          initialValue: formData.disterResName || (user.extInfo && user.extInfo.resName),
          rules: [
            {
              required: !!disterResId.requiredFlag,
              message: `请输入${disterResId.displayName}`,
            },
          ],
        }}
      >
        <Input disabled placeholder="[默认]" />
      </Field>,
      <Field
        name="taskNo"
        key="taskNo"
        label={taskNo.displayName}
        sortNo={taskNo.sortNo}
        decorator={{
          initialValue: formData.taskNo,
        }}
      >
        <Input disabled placeholder="系统生成" />
      </Field>,
      <Field
        name="taskName"
        key="taskName"
        label={taskName.displayName}
        sortNo={taskName.sortNo}
        decorator={{
          initialValue: formData.taskName,
          rules: [
            {
              required: !!taskName.requiredFlag,
              message: `请输入${taskName.displayName}`,
            },
          ],
        }}
      >
        <Input placeholder={`请输入${taskName.displayName}`} />
      </Field>,
      // 复合能力
      <FieldLine
        key="capasetLeveldId"
        label={capasetLeveldId.displayName}
        sortNo={capasetLeveldId.sortNo}
        fieldCol={2}
        required
      >
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
            disabled={fromSubpack}
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
            disabled={fromSubpack}
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
            disabled={fromSubpack}
            // onChange={this.handleChangeCapasetLeveldId}
          />
        </Field>
      </FieldLine>,
      <Field
        name="receiverResId"
        key="receiverResId"
        label={receiverResId.displayName}
        sortNo={receiverResId.sortNo}
        decorator={{
          initialValue: formData.receiverResId
            ? // warn: 后端其实没有存code，并不需要, 但是这里必须要一个值，所以只要name匹配就可以了。
              { code: formData.receiverResId, name: formData.receiverResName }
            : void 0,
          rules: [
            {
              required: !!receiverResId.requiredFlag,
              message: `请输入${receiverResId.displayName}`,
            },
          ],
        }}
      >
        <SelectWithCols
          labelKey="name"
          className="x-fill-100"
          columns={SEL_COL}
          dataSource={resSource}
          onChange={value => {
            this.handleChangeReceiverResId(value);
          }}
          selectProps={{
            disabled: fromSubpack,
            showSearch: true,
            onSearch: value => {
              dispatch({
                type: `${DOMAIN}/updateState`,
                payload: {
                  resSource: resList.filter(
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
      </Field>,
      <Field
        name="receiverBuName"
        key="receiverBuId"
        label={receiverBuId.displayName}
        sortNo={receiverBuId.sortNo}
        decorator={{
          initialValue: formData.receiverBuName, // formData.receiverBuId,
        }}
      >
        <Input placeholder="[由接收资源带出]" disabled />
      </Field>,
      <Field
        name="resSourceType"
        key="cooperationType"
        label={cooperationType.displayName}
        sortNo={cooperationType.sortNo}
        decorator={{
          initialValue: formData.resSourceType,
          rules: [
            {
              required: !!cooperationType.requiredFlag,
              message: `请输入${cooperationType.displayName}`,
            },
          ],
        }}
      >
        <UdcSelect
          code="RES.RES_TYPE1"
          placeholder={`请输入${cooperationType.displayName}`}
          disabled
        />
      </Field>,
      <Field
        name="distDate"
        key="distDate"
        label={distDate.displayName}
        sortNo={distDate.sortNo}
        decorator={{
          initialValue: formData.distDate ? moment(formData.distDate) : moment(Date.now()),
          rules: [
            {
              required: !!distDate.requiredFlag,
              message: `请输入${distDate.displayName}`,
            },
          ],
        }}
      >
        <DatePicker className="x-fill-100" format="YYYY-MM-DD" onChange={this.handleDistDate} />
      </Field>,
      <Field
        name="reasonType"
        key="reasonType"
        label={reasonType.displayName}
        sortNo={reasonType.sortNo}
        decorator={{
          initialValue: formData.reasonType,
          rules: [
            {
              required: !!reasonType.requiredFlag,
              message: `请选择${reasonType.displayName}`,
            },
          ],
        }}
      >
        <UdcSelect
          code="TSK.TASK_REASON_TYPE"
          placeholder={`请选择${reasonType.displayName}`}
          onChange={value => {
            form.setFieldsValue({
              reasonId: null,
              expenseBuName: null,
            });
          }}
          disabled={fromSubpack}
        />
      </Field>,
      <Field
        name="reasonId"
        key="reasonId"
        label={reasonId.displayName}
        sortNo={reasonId.sortNo}
        decorator={{
          initialValue: {
            code: formData.reasonId,
            name: formData.reasonName,
          },
          rules: [
            {
              required: !!reasonId.requiredFlag,
              message: `请选择${reasonId.displayName}`,
            },
          ],
        }}
      >
        {{
          '01': (
            <SelectWithCols
              labelKey="name"
              className="x-fill-100"
              placeholder={`请选择${reasonId.displayName}`}
              columns={SEL_COL}
              dataSource={taskProjSource}
              onChange={value => {
                this.handleChangeReasonId(value);
              }}
              selectProps={{
                disabled: fromSubpack,
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
              placeholder={`请选择${reasonId.displayName}`}
              columns={SEL_COL}
              dataSource={preSaleSource}
              onChange={value => {
                this.handleChangeReasonId(value);
              }}
              selectProps={{
                disabled: fromSubpack,
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
              placeholder={`请选择${reasonId.displayName}`}
              columns={SEL_COL}
              dataSource={buSource.filter(item => item.buStatus === 'ACTIVE') || []}
              onChange={value => {
                this.handleChangeReasonId(value);
              }}
              selectProps={{
                disabled: fromSubpack,
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
        }[formData.reasonType] || <span className="text-disable">不可选择</span>}
      </Field>,
      // 费用承担BU
      <Field
        name="expenseBuName"
        key="expenseBuId"
        label={expenseBuId.displayName}
        sortNo={expenseBuId.sortNo}
        decorator={{
          initialValue: formData.expenseBuName, // <UdcSelect code="ACC:REIM_EXP_BY" placeholder="请选择费用承担方" />
          rules: [
            {
              required: !!expenseBuId.requiredFlag,
              message: '请补充事由的BU信息',
            },
          ],
        }}
      >
        <Input placeholder="选择事由号带出" disabled />
      </Field>,
      <Field
        name="allowTransferFlag"
        key="allowTransferFlag"
        label={allowTransferFlag.displayName}
        sortNo={allowTransferFlag.sortNo}
        decorator={{
          initialValue: formData.allowTransferFlag,
          rules: [
            {
              required: !!allowTransferFlag.requiredFlag,
            },
          ],
        }}
      >
        <Checkbox
          placeholder={`${allowTransferFlag.displayName}`}
          checked={formData.allowTransferFlag}
          disabled={fromSubpack}
        >
          是
        </Checkbox>
      </Field>,
      <Field
        name="planStartDate"
        key="planStartDate"
        label={planStartDate.displayName}
        sortNo={planStartDate.sortNo}
        decorator={{
          initialValue: formData.planStartDate ? moment(formData.planStartDate) : null,
          rules: [
            {
              required: !!planStartDate.requiredFlag,
              message: `请填写${planStartDate.displayName}`,
            },
            {
              validator: (rule, value, callback) => {
                if (
                  value &&
                  formData.planEndDate &&
                  moment(formData.planEndDate).isBefore(value.format('YYYY-MM-DD'))
                ) {
                  callback('计划开始日期应该早于结束日期');
                }
                // Note: 必须总是返回一个 callback，否则 validateFieldsAndScroll 无法响应
                callback();
              },
            },
          ],
        }}
      >
        <DatePicker
          className="x-fill-100"
          placeholder={`${planStartDate.displayName}`}
          format="YYYY-MM-DD"
        />
      </Field>,
      <Field
        name="planEndDate"
        key="planEndDate"
        label={planEndDate.displayName}
        sortNo={planEndDate.sortNo}
        decorator={{
          initialValue: formData.planEndDate ? moment(formData.planEndDate) : null,
          rules: [
            {
              required: !!planEndDate.requiredFlag,
              message: `请填写${planEndDate.displayName}`,
            },
            {
              validator: (rule, value, callback) => {
                if (
                  value &&
                  formData.planStartDate &&
                  moment(value.format('YYYY-MM-DD')).isBefore(formData.planStartDate)
                ) {
                  callback('计划结束日期应该晚于开始日期');
                }
                // Note: 必须总是返回一个 callback，否则 validateFieldsAndScroll 无法响应
                callback();
              },
            },
          ],
        }}
      >
        <DatePicker
          className="x-fill-100"
          placeholder={`${planEndDate.displayName}`}
          format="YYYY-MM-DD"
        />
      </Field>,
      <Field name="requirement" label="任务需求附件">
        <FileManagerEnhance api={REQ_REPO} dataKey={formData.id} listType="text" disabled={false} />
      </Field>,
      <Field name="deliverable" label="提交物模版附件">
        <FileManagerEnhance api={DEL_REPO} dataKey={formData.id} listType="text" disabled={false} />
      </Field>,
      <Field
        name="attachuploadMethod"
        key="attachuploadMethod"
        label={attachuploadMethod.displayName}
        sortNo={attachuploadMethod.sortNo}
        decorator={{
          initialValue: formData.attachuploadMethod,
          rules: [
            {
              required: !!attachuploadMethod.requiredFlag,
              message: `${attachuploadMethod.displayName}`,
            },
          ],
        }}
      >
        <Input placeholder={`完工${attachuploadMethod.displayName}`} />
      </Field>,
      <Field
        name="taskStatus"
        key="taskStatus"
        label={taskStatus.displayName}
        sortNo={taskStatus.sortNo}
        decorator={{
          initialValue: formData.taskStatus,
          rules: [
            {
              required: !!taskStatus.requiredFlag,
              message: `${taskStatus.displayName}`,
            },
          ],
        }}
        popover={{
          placement: 'topLeft',
          trigger: 'hover',
          content: '该状态由系统更新，不可修改。',
        }}
      >
        <UdcSelect disabled code="TSK:TASK_STATUS" placeholder={`${taskStatus.displayName}`} />
      </Field>,
      <Field
        name="remark"
        key="remark"
        label={remark.displayName}
        sortNo={remark.sortNo}
        decorator={{
          initialValue: formData.remark,
          rules: [
            {
              required: !!remark.requiredFlag,
              message: `${remark.displayName}`,
            },
          ],
        }}
      >
        <Input.TextArea rows={1} placeholder={`${remark.displayName}`} />
      </Field>,
      <Field
        name="taskPackageType"
        key="taskPackageType"
        label={taskPackageType.displayName}
        sortNo={taskPackageType.sortNo}
        decorator={{
          initialValue: formData.taskPackageType,
          rules: [
            {
              required: !!taskPackageType.requiredFlag,
              message: `${taskPackageType.displayName}`,
            },
          ],
        }}
      >
        <UdcSelect
          code="TSK:TASK_PACKAGE_TYPE"
          placeholder={`请选择${taskPackageType.displayName}`}
        />
      </Field>,
      <Field
        name="pname"
        key="pid"
        label={pid.displayName}
        sortNo={pid.sortNo}
        decorator={{
          initialValue: formData.pname,
          rules: [
            {
              required: !!pid.requiredFlag,
              message: `${pid.displayName}`,
            },
          ],
        }}
      >
        <Input disabled placeholder="自动带出" />
      </Field>,
      <Field presentational />,
      <Field
        name="createUserName"
        key="createUserId"
        label={createUserId.displayName}
        sortNo={createUserId.sortNo}
        decorator={{
          initialValue: formData.createUserName || (user.info && user.info.name),
        }}
      >
        <Input disabled placeholder="[当前用户]" />
      </Field>,
      <Field
        name="createTime"
        key="createTime"
        label={createTime.displayName}
        sortNo={createTime.sortNo}
        decorator={{
          initialValue: formData.createTime || formatDT(Date.now()),
        }}
      >
        <Input disabled placeholder="[系统生成]" />
      </Field>,
    ];
    const filterList1 = taskFields
      .filter(
        field =>
          !field.key ||
          (pageFieldJsonTask[field.key] && pageFieldJsonTask[field.key].visibleFlag === 1) ||
          (pageFieldJsonSettlement[field.key] &&
            pageFieldJsonSettlement[field.key].visibleFlag === 1)
      )
      .sort((field1, field2) => field1.props.sortNo - field2.props.sortNo);
    const settlementFields = [
      <FieldLine
        key="acceptMethod"
        label={acceptMethod.displayName}
        sortNo={acceptMethod.sortNo}
        fieldCol={2}
        required={!!acceptMethod.requiredFlag}
      >
        <Field
          name="acceptMethod"
          decorator={{
            initialValue: formData.acceptMethod,
            rules: [
              {
                required: true,
                message: '请输入验收方式',
              },
            ],
          }}
          wrapperCol={{ span: 24 }}
        >
          <UdcSelect
            code="TSK.ACCEPT_METHOD"
            placeholder="请选择验收方式"
            onChange={value => {
              this.handleChangeAcceptMethod(value);
            }}
            disabled={fromSubpack}
          />
        </Field>

        <Field
          name="pricingMethod"
          decorator={{
            initialValue:
              {
                '04': '单价',
              }[formData.acceptMethod] || '总价',
          }}
          wrapperCol={{ span: 24 }}
        >
          <Input disabled placeholder="[由验收方式带出]" />
        </Field>
      </FieldLine>,
      <Field
        name="autoSettleFlag"
        key="autoSettleFlag"
        label={autoSettleFlag.displayName}
        sortNo={autoSettleFlag.sortNo}
        decorator={{
          initialValue: isNil(formData.autoSettleFlag) ? 1 : formData.autoSettleFlag,
        }}
      >
        <Radio.Group disabled={formData.acceptMethod !== '04'}>
          <Radio value={1}>是</Radio>
          <Radio value={0}>否</Radio>
        </Radio.Group>
      </Field>,
      <Field
        name="eqvaRatio"
        key="eqvaRatio"
        label={eqvaRatio.displayName}
        sortNo={eqvaRatio.sortNo}
        decorator={{
          initialValue: formData.eqvaRatio,
          rules: [
            {
              required: !!eqvaRatio.requiredFlag,
              message: `${eqvaRatio.displayName}`,
            },
          ],
        }}
        popover={{
          placement: 'topLeft',
          trigger: 'hover',
          content: (
            <>
              <div>
                1、验收方式为人天时，必填；结算时 填写
                <span style={{ color: 'red' }}>工时天数*该当量系数=资源收入当量</span>。
              </div>
              <div>
                2、其他验收方式不需要填写，以该任务包下
                <span style={{ color: 'red' }}>活动的当量数</span>
                为准。
              </div>
              <div>
                3、资源来源为
                <span style={{ color: 'red' }}>外部时</span>
                不需要填写。
              </div>
            </>
          ),
        }}
      >
        <Input
          placeholder={`请输入${eqvaRatio.displayName}`}
          disabled={subpackId ? readOnly : checkResSourceType(formData.resSourceType)}
        />
      </Field>,
      <Field
        name="guaranteeRate"
        key="guaranteeRate"
        label={guaranteeRate.displayName}
        sortNo={guaranteeRate.sortNo}
        decorator={{
          initialValue: formData.guaranteeRate,
          rules: [
            {
              required: !!guaranteeRate.requiredFlag,
              message: `${guaranteeRate.displayName}`,
            },
          ],
        }}
        popover={{
          placement: 'topLeft',
          trigger: 'hover',
          content: '结算时会按照该比例冻结当量/费用，到项目结束后释放！',
        }}
      >
        <InputNumber
          className="x-fill-100"
          min={0}
          max={100}
          placeholder={`${guaranteeRate.displayName}`}
          disabled={fromSubpack}
        />
      </Field>,
      <Field
        name="suggestSettlePrice"
        key="suggestSettlePrice"
        label={suggestSettlePrice.displayName}
        sortNo={suggestSettlePrice.sortNo}
        decorator={{
          initialValue: formData.suggestSettlePrice,
          rules: [
            {
              required: !!suggestSettlePrice.requiredFlag,
              message: `${suggestSettlePrice.displayName}`,
            },
          ],
        }}
      >
        <Input disabled placeholder={`${suggestSettlePrice.displayName}`} />
      </Field>,
      <Field
        name="taxRate"
        key="taxRate"
        label={taxRate.displayName}
        sortNo={taxRate.sortNo}
        decorator={{
          initialValue: formData.taxRate,
          rules: [
            {
              required: !!taxRate.requiredFlag,
              message: `请输入${taxRate.displayName}`,
            },
          ],
        }}
      >
        <Input placeholder={taxRate.displayName} disabled />
      </Field>,
      <Field
        name="settlePriceFlag"
        key="settlePriceFlag"
        label={settlePriceFlag.displayName}
        sortNo={settlePriceFlag.sortNo}
        decorator={{
          initialValue: formData.settlePriceFlag ? '' + formData.settlePriceFlag : '0',
          rules: [
            {
              required: !!settlePriceFlag.requiredFlag,
              message: `请计算${settlePriceFlag.displayName}`,
            },
          ],
        }}
      >
        <Select
          placeholder={`请计算${settlePriceFlag.displayName}`}
          onChange={value => {
            // 不自定义BU结算价格时，默认按参考价处理
            if (value === '0') {
              form.setFieldsValue({
                buSettlePrice: formData.suggestSettlePrice, // 实际BU结算价格
                settlePrice: div(
                  formData.suggestSettlePrice * 100,
                  add(100, formData.taxRate)
                ).toFixed(2), // 最终结算单价
              });
            }
          }}
          // disabled // 让暂时变成 disabled 了
        >
          <Select.Option value="1">是</Select.Option>
          <Select.Option value="0">否</Select.Option>
        </Select>
      </Field>,
      <Field
        name="buSettlePrice"
        key="buSettlePrice"
        label={buSettlePrice.displayName}
        sortNo={buSettlePrice.sortNo}
        decorator={{
          initialValue: formData.buSettlePrice,
          rules: [
            {
              required: !!buSettlePrice.requiredFlag,
              message: `请输入${buSettlePrice.displayName}`,
            },
          ],
        }}
      >
        <InputNumber
          className="x-fill-100"
          placeholder={`${buSettlePrice.displayName}`}
          precision={2}
          min={0}
          max={999999999999}
          disabled={formData.settlePriceFlag !== '1'}
          onChange={value => {
            const settlePrice = value
              ? div(mul(value, add(100, formData.taxRate || 0)), 100).toFixed(2)
              : 0;
            const amt =
              formData.eqvaQty && settlePrice ? mul(formData.eqvaQty, settlePrice).toFixed(2) : 0;
            const newFieldData = {
              buSettlePrice: value,
              settlePrice,
              amt,
            };
            form.setFieldsValue(newFieldData);
            // dispatch({ type: `${DOMAIN}/updateForm`, payload: newFieldData })
          }}
        />
      </Field>,
      <Field
        name="settlePrice"
        key="settlePrice"
        label={pageFieldJsonTask.settlePrice.displayName}
        sortNo={pageFieldJsonTask.settlePrice.sortNo}
        decorator={{
          initialValue: formData.settlePrice,
          rules: [
            {
              required: !!pageFieldJsonTask.settlePrice.requiredFlag,
              message: `请输入${pageFieldJsonTask.settlePrice.displayName}`,
            },
          ],
        }}
      >
        <Input disabled placeholder={`${pageFieldJsonTask.settlePrice.displayName}`} />
      </Field>,

      <FieldLine label={eqvaQty.displayName} key="eqvaQty" sortNo={eqvaQty.sortNo}>
        <Field
          name="eqvaQty"
          decorator={{
            initialValue: formData.eqvaQty,
            rules: [{ required: false, message: '请输入总当量' }],
          }}
          wrapperCol={{ span: 23, xxl: 23 }}
        >
          <Input placeholder="自动计算得出" disabled />
        </Field>
        <Field
          name="amt"
          decorator={{
            initialValue: formData.amt,
            rules: [{ required: false, message: '请输入总金额' }],
          }}
          wrapperCol={{ span: 23, offset: 1, xxl: 23 }}
        >
          <Input placeholder="自动计算得出" disabled />
        </Field>
      </FieldLine>,
    ];
    const filterList2 = settlementFields
      .filter(
        field =>
          !field.key ||
          (pageFieldJsonTask[field.key] && pageFieldJsonTask[field.key].visibleFlag === 1)
      )
      .sort((field1, field2) => field1.props.sortNo - field2.props.sortNo);
    return (
      <>
        <Card className="tw-card-adjust" bordered={false} title="任务编辑">
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
            {filterList1}
          </FieldList>
        </Card>
        <br />
        <Card className="tw-card-adjust" bordered={false} title="结算信息">
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
            {filterList2}
          </FieldList>
        </Card>
      </>
    );
  };

  render() {
    const {
      loading,
      dispatch,
      form,
      form: { getFieldDecorator },
      formData,
      dataList,
      // 查询列表
      jobType2List,
      capasetLeveldList,
      resSource,
      resList,
      buSource,
      buList,
      taskProjSource,
      taskProjList,
      preSaleSource,
      preSaleList,
      // 表格
      actList,
      actSource,
      // 权限
      user,
      pageConfig,
    } = this.props;

    const disabledBtn =
      loading.effects[`${DOMAIN}/query`] ||
      loading.effects[`${DOMAIN}/queryTaskApply`] ||
      loading.effects[`${DOMAIN}/save`];
    const { subpackId } = fromQs();
    const readOnly = true;

    const fromSubpack = (formData && formData.transferFlag) || !!subpackId;

    const { taskTmplVisible } = this.state;
    const { _selectedRowKeys } = this.state;

    // 页面配置信息数据处理
    if (!pageConfig.pageBlockViews || pageConfig.pageBlockViews.length < 1) {
      return <div />;
    }
    let currentConfig = [];
    pageConfig.pageBlockViews.forEach(view => {
      if (view.tableName === 'T_RES_ACTIVITY') {
        currentConfig = view;
      }
    });
    const { pageFieldViews } = currentConfig;
    const pageFieldJson = {};
    if (pageFieldViews) {
      pageFieldViews.forEach(field => {
        pageFieldJson[field.fieldKey] = field;
      });
    }
    const {
      actNo = {},
      actName = {},
      actStatus = {},
      planStartDate = {},
      planEndDate = {},
      settledEqva = {},
      milestoneFlag = {},
      finishDate = {},
      finishDesc = {},
      requiredDocList = {},
    } = pageFieldJson;

    return (
      <PageHeaderWrapper title="任务包信息">
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            icon="save"
            size="large"
            disabled={disabledBtn}
            onClick={this.handleSave}
          >
            {formatMessage({ id: `misc.save`, desc: '保存' })}
          </Button>
          <Button
            className="tw-btn-primary"
            size="large"
            disabled={disabledBtn}
            onClick={this.toggleModal}
          >
            从模板导入
          </Button>
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            disabled={disabledBtn}
            onClick={() => {
              const { from } = fromQs();
              from ? closeThenGoto(from) : closeThenGoto(`/user/task/originated`);
            }}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        {!loading.effects[`${DOMAIN}/getPageConfig`] ? this.renderPage() : <Loading />}
        {!loading.effects[`${DOMAIN}/getPageConfig`] ? (
          <Card className="tw-card-adjust" bordered={false} title="任务包活动信息">
            <EditableDataTable {...this.getTableProps()} />
          </Card>
        ) : null}

        <TaskTmplModal
          {...{
            visible: taskTmplVisible,
            toggleModal: this.toggleModal,
            onCheck: this.onTaskTmplCheck,
          }}
        />
      </PageHeaderWrapper>
    );
  }
}

export default TaskEdit;
