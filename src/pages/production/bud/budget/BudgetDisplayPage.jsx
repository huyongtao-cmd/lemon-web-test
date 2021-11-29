import React from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { isEmpty, isNil, omit, map } from 'ramda';
import { Form, Tooltip } from 'antd';
import { add, genFakeId } from '@/utils/mathUtils';
import message from '@/components/production/layout/Message';
// 产品化组件
import BusinessForm from '@/components/production/business/BusinessForm.tsx';
import FormItem from '@/components/production/business/FormItem.tsx';
import PageWrapper from '@/components/production/layout/PageWrapper.tsx';
import ButtonCard from '@/components/production/layout/ButtonCard.tsx';
import Button from '@/components/production/basic/Button.tsx';

import { fromQs } from '@/utils/production/stringUtil.ts';

// service方法
import EditTable from '@/components/production/business/EditTable.tsx';
import DataTable from '@/components/production/business/DataTable.tsx';

import { listToTreePlus } from '@/utils/production/TreeUtil.ts';
import moment from 'moment';
import { createConfirm } from '@/components/core/Confirm';
import { pushFlowTask } from '@/services/gen/flow';
import createMessage from '@/components/core/AlertMessage';
import { getUrl } from '@/utils/flowToRouter';
import { closeThenGoto } from '@/layouts/routerControl';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import BudgetProgress from '@/pages/production/bud/budget/BudgetProgress';
import BpmConnection from '@/pages/gen/BpmMgmt/BpmConnection';
import styles from './budgetDisplayPage.less';
import CsvImportFront from '@/components/common/CsvImportFront';
import Link from '@/components/production/basic/Link.tsx';

export const exportToCsv = (filename, rows) => {
  const processRow = row => {
    let finalVal = '';
    for (let j = 0; j < row.length; j += 1) {
      let innerValue = isNil(row[j]) ? '' : row[j].toString();
      if (row[j] instanceof Date) {
        innerValue = row[j].toLocaleString();
      }

      let result = innerValue.replace(/"/g, '""');
      if (result.search(/("|,|\n)/g) >= 0) result = '"' + result + '"';
      if (j > 0) finalVal += ',';
      finalVal += result;
    }
    return finalVal + '\n';
  };

  let csvFile = '\ufeff';
  for (let i = 0; i < rows.length; i += 1) {
    csvFile += processRow(rows[i]);
  }

  const blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
  if (navigator.msSaveBlob) {
    // IE 10+
    navigator.msSaveBlob(blob, filename);
  } else {
    const link = document.createElement('a');
    if (link.download !== undefined) {
      // feature detection
      // Browsers that support HTML5 download attribute
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
};

export const treeToList = treeList =>
  treeList.reduce((initialArray, current) => {
    initialArray.push(current);
    if (current.children) {
      treeToList(current.children).forEach(item => {
        // 加空格用来展示层级关系
        const newBudgetItemName = '    ' + item.budgetItemName;
        initialArray.push({ ...item, budgetItemName: newBudgetItemName });
      });
    }
    return initialArray;
  }, []);

export const compileCsvData = (dataSource, columns) => {
  const csvDataTitle = columns.map(column => column.title);
  const csvValueOrFunction = map(({ dataIndex, render }) => {
    if (isNil(render)) return dataIndex;
    return [dataIndex, render];
  }, columns);

  const newdataSource = treeToList(dataSource);
  const csvContentData = newdataSource.map((data, index) => {
    const pickValues = csvValueOrFunction.map(operation => {
      if (Array.isArray(operation)) {
        const [dataIndex, render] = operation;
        const result = render(data[dataIndex], data, index);
        return React.isValidElement(result) ? data[dataIndex] : result;
      }

      let eachOperation = data[operation];
      if (data[operation] === false) {
        eachOperation = '否';
      } else if (data[operation] === true) {
        eachOperation = '是';
      }
      return eachOperation;
    });
    return pickValues;
  });
  const csvData = [csvDataTitle, ...csvContentData];
  return csvData;
};

// namespace声明
const DOMAIN = 'budgetDisplayPage';

/**
 * 预算 综合展示页面
 */
@connect(({ loading, dispatch, budgetDisplayPage, user: { user } }) => ({
  loading: loading.effects[`${DOMAIN}/init`] || loading.effects[`${DOMAIN}/fetchConfig`],
  saveLoading: loading.effects[`${DOMAIN}/save`],
  dispatch,
  ...budgetDisplayPage,
  user,
}))
@Form.create({
  mapPropsToFields(props) {
    const { formData } = props;
    const fields = {};
    Object.keys(formData).forEach(key => {
      const tempValue = formData[key];
      if (Array.isArray(tempValue)) {
        tempValue.forEach((temp, index) => {
          Object.keys(temp).forEach(detailKey => {
            fields[`${key}[${index}].${detailKey}`] = Form.createFormField({
              value: temp[detailKey],
            });
          });
        });
      } else {
        fields[key] = Form.createFormField({ value: tempValue });
      }
    });
    return fields;
  },
  onValuesChange(props, changedValues, allValues) {
    if (isEmpty(changedValues)) return;
    const name = Object.keys(changedValues)[0];
    const value = changedValues[name];
    const newFieldData = { [name]: value };

    switch (name) {
      default:
        break;
    }
    props.dispatch({
      type: `${DOMAIN}/updateFormForEditTable`,
      payload: newFieldData,
    });
  },
})
class BudgetDisplayPage extends React.PureComponent {
  state = {
    handlerImportFalse: false,
    validFlaseIdList: [],
  };

  componentDidMount() {
    // 调用页面载入初始化方法,一般是请求页面数据
    // fromQs 方法从url获取路径参数，仅能在组件加载时调用一次，且只能在一级组件调用，后续在组件内部维护自己的url参数。否则多TAB体系可能会出BUG
    const { id, copy, mode, taskId } = fromQs();
    const formMode = mode === 'edit' || mode === 'EDIT' ? 'EDIT' : 'DESCRIPTION';
    // 把url的参数保存到state
    this.updateModelState({ formMode, copy, taskId });
    this.callModelEffects('updateForm', { id });
    this.callModelEffects('init');
    this.callModelEffects('fetchBudgetType');
    this.callModelEffects('fetchBudgetControlType');
    this.callModelEffects('fetchTmplList');
    taskId && this.callModelEffects('fetchConfig', taskId);
  }

  componentWillUnmount() {
    // 页面卸载时清理model层state,防止再次进入时错误显示
    this.callModelEffects('cleanState');
  }

  /**
   * 修改model层state
   * 这个方法是仅是封装一个小方法,后续修改model的state时不需要每次都解构dispatch
   * @param params state参数
   */
  updateModelState = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: params,
    });
  };

  turnFalse = async data => {
    await this.setState({
      handlerImportFalse: true,
    });
  };

  handleDataSource = dataSource => {
    const { form } = this.props;
    // detailBudgetAmt parentId
    const totalAmt = dataSource
      .filter(e => e.parentId === null)
      .map(item => item.detailBudgetAmt)
      .reduce((prev, curr) => add(prev || 0, curr || 0), 0);
    this.callModelEffects('updateForm', { details: dataSource, totalBudgetAmt: totalAmt }).then(
      res => {
        form && form.setFieldsValue({ editTableSpecial_: true });
      }
    );
  };

  treeToList = treeList =>
    treeList.reduce((initialArray, current) => {
      initialArray.push(current);
      const { validFlaseIdList } = this.state;
      if (current.children) {
        let sum = 0;
        this.treeToList(current.children).forEach(item => {
          // 加空格用来展示层级关系
          if (item.parentId === current.budgetItemId) {
            sum += Number(item.detailBudgetAmt);
          }
          initialArray.push(item);
        });
        if (sum !== Number(current.detailBudgetAmt)) {
          // eslint-disable-next-line no-param-reassign
          current.validFlag = false;
          // eslint-disable-next-line no-param-reassign
          current.validMsg = '父项不等于子项之和';
          validFlaseIdList.push(current.budgetItemCode);
          this.setState({
            validFlaseIdList,
          });
          this.turnFalse();
        }
      }
      return initialArray;
    }, []);

  /**
   * 调用model层异步方法
   * 这个方法是仅是封装一个小方法,后续修改调异步方法时不需要每次都解构dispatch
   * @param method 异步方法名称
   * @param params 调用方法参数
   */
  callModelEffects = async (method, params) => {
    const { dispatch } = this.props;
    return dispatch({
      type: `${DOMAIN}/${method}`,
      payload: params,
    });
  };

  /**
   * 保存
   */
  handleSave = () => {
    const { form, formData } = this.props;
    form.validateFieldsAndScroll((error, values) => {
      if (!error) {
        if (formData.budgetDate) {
          [formData.budgetStartDate, formData.budgetEndDate] = formData.budgetDate;
        }
        this.callModelEffects('save', {
          formData: {
            ...formData,
            ...omit(['details'], values),
          },
        });
      }
    });
  };

  /**
   * 提交
   */
  handleSubmit = (param, cb) => {
    const { form, formData } = this.props;
    form.validateFieldsAndScroll((error, values) => {
      if (!error) {
        if (formData.budgetDate) {
          [formData.budgetStartDate, formData.budgetEndDate] = formData.budgetDate;
        }
        this.callModelEffects('save', {
          formData: {
            ...formData,
            ...omit(['details'], values),
            ...param,
            submit: true,
          },
        }).then(data => {
          cb && cb();
        });
      }
    });
  };

  /**
   * 切换编辑模式
   */
  switchEdit = () => {
    this.callModelEffects('init');
    this.updateModelState({ formMode: 'EDIT' });
  };

  onExpand = (expanded, record) => {
    const { unExpandedRowKeys } = this.props;
    const set = new Set(unExpandedRowKeys);
    if (!expanded) {
      set.add(record.id);
    } else {
      set.delete(record.id);
    }
    this.updateModelState({ unExpandedRowKeys: [...set] });
  };

  // 计算某元素在数组中出现的次数
  counts = (arr, value) => arr.reduce((a, v) => (v === value ? a + 1 : a + 0), 0);

  handleExpand = () => {
    const {
      formData: { details },
      unExpandedRowKeys,
    } = this.props;
    const set = [];
    this.updateModelState({ unExpandedRowKeys: [...set] });
  };

  handleNorrow = () => {
    const {
      formData: { details },
      unExpandedRowKeys,
    } = this.props;
    const set = new Set(unExpandedRowKeys);
    details.forEach(item => {
      set.add(item.id);
    });
    this.updateModelState({ unExpandedRowKeys: [...set] });
  };

  exportBudgetList = () => {
    const { formData } = this.props;
    if (!formData.tmplId) {
      message({
        type: 'info',
        content: '请先选择需要下载的科目模板！',
      });
      return;
    }
    const {
      formData: { details },
    } = this.props;
    const tempDetails = details
      .sort((d1, d2) => d1.budgetItemCode.localeCompare(d2.budgetItemCode))
      .map(d => ({ ...d, parentId: d.parentId + '' }));
    const wrappedDetails = listToTreePlus(tempDetails, undefined, 'budgetItemId');

    const editColumns = [
      {
        title: '预算项目名称',
        dataIndex: 'budgetItemName',
      },
      {
        title: '预算项目编码',
        dataIndex: 'budgetItemCode',
      },
      {
        title: '是否控制',
        dataIndex: 'detailControlFlag',
      },
      {
        title: '预算金额',
        dataIndex: 'detailBudgetAmt',
      },
      {
        title: '参考单价',
        dataIndex: 'configurableField1',
      },
      {
        title: '参考数量',
        dataIndex: 'configurableField2',
      },
      {
        title: '备注',
        dataIndex: 'remark',
      },
    ];
    const csvData = compileCsvData(wrappedDetails, editColumns);
    exportToCsv('export.csv', csvData);
  };

  detailExport = () => {
    const {
      formData: { details },
    } = this.props;
    const tempDetails = details
      .sort((d1, d2) => d1.budgetItemCode.localeCompare(d2.budgetItemCode))
      .map(d => ({ ...d, parentId: d.parentId + '' }));
    const wrappedDetails = listToTreePlus(tempDetails, undefined, 'budgetItemId');

    const editColumns = [
      {
        title: '预算项目名称',
        dataIndex: 'budgetItemName',
      },
      {
        title: '预算项目编码',
        dataIndex: 'budgetItemCode',
      },
      {
        title: '是否控制',
        dataIndex: 'detailControlFlag',
      },
      {
        title: '预算金额',
        dataIndex: 'detailBudgetAmt',
      },
      {
        title: '预算比例',
        dataIndex: 'budgetRatio',
        width: '50px',
        render: (text, record, index) => (text ? text + '%' : ''),
      },
      {
        title: '参考单价',
        dataIndex: 'configurableField1',
      },
      {
        title: '参考数量',
        dataIndex: 'configurableField2',
      },
      {
        title: '占用金额',
        dataIndex: 'detailOccupiedAmt',
        className: 'prod-number-description',
        render: (value, record, index) => (isNil(value) ? '' : value.toFixed(2)),
      },
      {
        title: '已使用金额',
        dataIndex: 'detailUsedAmt',
        className: 'prod-number-description',
        render: (value, record, index) => (isNil(value) ? '' : value.toFixed(2)),
      },
      {
        title: '备注',
        dataIndex: 'remark',
      },
    ];
    const csvData = compileCsvData(wrappedDetails, editColumns);
    exportToCsv('export.csv', csvData);
  };

  /**
   * 级联修改上级金额
   */
  recursionUpdateAmt = (record, amt) => {
    const {
      formData: { details },
    } = this.props;
    // eslint-disable-next-line eqeqeq
    const parentRecord = details.filter(item => item.budgetItemId + '' == record.parentId)[0];
    const index = details.indexOf(parentRecord);
    if (parentRecord) {
      this.callModelEffects('recursionUpdateAmt', {
        index,
        detailBudgetAmt: (parentRecord.detailBudgetAmt || 0) + amt,
      });
      this.recursionUpdateAmt(parentRecord, amt);
    }
  };

  render() {
    const {
      form,
      formData,
      formMode,
      unExpandedRowKeys,
      loading,
      saveLoading,
      budgetTypeList,
      budgetControlTypeList,
      tmplList,
      taskId,
      fieldsConfig,
      flowForm,
      dispatch,
      user: { extInfo = {} }, // 取当前登录人的resId
      attachments,
    } = this.props;
    // 其他流程
    const allBpm = [{ docId: formData.id, procDefKey: 'BUD_B01', title: '预算申请流程' }];
    const { handlerImportFalse } = this.state;
    const { details } = formData;
    const expandedRowKeys = details
      .map(d => d.id)
      .filter(detail => unExpandedRowKeys.indexOf(detail) === -1);

    const tempDetails = details
      .sort((d1, d2) => d1.budgetItemCode.localeCompare(d2.budgetItemCode))
      .map(d => ({ ...d, parentId: d.parentId + '' }));
    const wrappedDetails = listToTreePlus(tempDetails, undefined, 'budgetItemId');
    const editColumns = [
      {
        title: '预算项目编码',
        dataIndex: 'budgetItemCode',
      },
      {
        title: '预算项目名称',
        dataIndex: 'budgetItemName',
      },
      {
        title: '是否控制',
        dataIndex: 'detailControlFlag',
        descriptionRender: text => (text ? '是' : '否'),
        width: '50px',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseSwitch"
            fieldKey={`details[${details.indexOf(
              details.filter(item => item.id === record.id)[0]
            )}].detailControlFlag`}
          />
        ),
      },
      {
        title: '预算金额',
        dataIndex: 'detailBudgetAmt',
        required: true,
        render: (text, record, index) => (
          <FormItem
            form={form}
            disabled={record.children && record.children.length > 0}
            fieldType="BaseInputAmt"
            required
            fieldKey={`details[${details.indexOf(
              details.filter(item => item.id === record.id)[0]
            )}].detailBudgetAmt`}
            onChange={value => {
              const changeAmt = value - (record.detailBudgetAmt || 0);
              if (!Number.isNaN(changeAmt)) {
                this.recursionUpdateAmt(record, changeAmt);
                this.callModelEffects('updateForm', {
                  totalBudgetAmt: (formData.totalBudgetAmt || 0) + changeAmt,
                });
              }
            }}
          />
        ),
      },
      {
        title: '预算比例',
        dataIndex: 'budgetRatio',
        width: '50px',
        render: (text, record, index) => (text ? text + '%' : ''),
      },
      {
        title: '参考单价',
        dataIndex: 'configurableField1',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInputAmt"
            fieldKey={`details[${details.indexOf(
              details.filter(item => item.id === record.id)[0]
            )}].configurableField1`}
          />
        ),
      },
      {
        title: '参考数量',
        dataIndex: 'configurableField2',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInputNumber"
            fieldKey={`details[${details.indexOf(
              details.filter(item => item.id === record.id)[0]
            )}].configurableField2`}
          />
        ),
      },
      {
        title: '备注',
        dataIndex: 'remark',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInputTextArea"
            fieldKey={`details[${details.indexOf(
              details.filter(item => item.id === record.id)[0]
            )}].remark`}
          />
        ),
      },
    ];

    const descriptionColumns = [
      {
        title: '预算项目编码',
        dataIndex: 'budgetItemCode',
      },
      {
        title: '预算项目名称',
        dataIndex: 'budgetItemName',
      },
      {
        title: '是否控制',
        dataIndex: 'detailControlFlagDesc',
        width: '50px',
      },
      {
        title: '预算金额',
        dataIndex: 'detailBudgetAmt',
        className: 'prod-number-description',
        render: (value, record, index) => (isNil(value) ? '' : value.toFixed(2)),
      },
      {
        title: '预算比例',
        dataIndex: 'budgetRatio',
        width: '50px',
        render: (text, record, index) => (text ? text + '%' : ''),
      },
      {
        title: '参考单价',
        dataIndex: 'configurableField1',
      },
      {
        title: '参考数量',
        dataIndex: 'configurableField2',
      },
      {
        title: '占用金额',
        dataIndex: 'detailOccupiedAmt',
        className: 'prod-number-description',
        render: (value, record, index) => (
          <Link
            twUri={`/workTable/bud/budgetOccupy?budgetId=${formData.id}&budgetItemId=${
              record.budgetItemId
            }`}
          >
            {isNil(value) ? '' : value.toFixed(2)}
          </Link>
        ),
      },
      {
        title: '已使用金额',
        dataIndex: 'detailUsedAmt',
        className: 'prod-number-description',
        render: (value, record, index) => (isNil(value) ? '' : value.toFixed(2)),
      },
      {
        title: '备注',
        dataIndex: 'remark',
      },
    ];

    const rightButtons = [
      <Tooltip key="expand" placement="top" title="全部展开">
        <Button
          className={styles.expandBtns}
          size="large"
          icon="plus"
          style={{ marginRight: 4 }}
          onClick={this.handleExpand}
        />
      </Tooltip>,
      <Tooltip key="norrow" placement="top" title="全部缩起">
        <Button
          className={styles.expandBtns}
          size="large"
          icon="minus"
          style={{ marginRight: 4 }}
          onClick={this.handleNorrow}
        />
      </Tooltip>,
      <Tooltip key="download" placement="top" title="导出">
        <Button
          icon="download"
          size="large"
          style={{ marginRight: 4 }}
          onClick={this.detailExport}
        />
      </Tooltip>,
    ];

    const that = this;
    const csvImportProps = {
      fileName: '预算详情导入结果',
      validKeyField: 'budgetItemCode',
      validKeyDesc: 'budgetItemName',
      customBtn: (
        <Button key="downloadBudgetTemplate" onClick={this.exportBudgetList}>
          下载模板
        </Button>
      ),
      templateUrl: '',
      fieldsMap: {
        预算项目编码: 'budgetItemCode',
        预算项目名称: 'budgetItemName',
        是否控制: 'detailControlFlag',
        预算金额: 'detailBudgetAmt',
        参考单价: 'configurableField1',
        参考数量: 'configurableField2',
        备注: 'remark',
        导入结果: 'validFlag',
        导入描述: 'validMsg',
      },

      async complete(data) {
        if (!formData.tmplId) {
          message({
            type: 'info',
            content: '请先选择需要下载的科目模板！',
          });
          return;
        }

        const addList = data.map(insertData => ({
          id: genFakeId(-1),
          ...insertData,
          // eslint-disable-next-line no-unneeded-ternary
          detailControlFlag: insertData.detailControlFlag === '是' ? true : false,
        }));
        const newDetails = addList.map(fileItem => {
          let current = details.find(item => fileItem.budgetItemCode === item.budgetItemCode);
          current = { ...current, ...fileItem };
          return current;
        });
        // eslint-disable-next-line no-shadow
        const { handlerImportFalse } = that.state;
        if (!handlerImportFalse) {
          that.handleDataSource(newDetails);
        }
      },
      valid(data) {
        /* eslint-enable */

        const newDetails = data.map(fileItem => {
          let current = details.find(item => fileItem.budgetItemCode === item.budgetItemCode);
          current = { ...current, ...fileItem };
          return current;
        });

        // toTree 检查子节点的金额之和是否等于父节点
        const newDetailsTree = listToTreePlus(newDetails, undefined, 'budgetItemId');
        that.treeToList(newDetailsTree);

        const { validFlaseIdList } = that.state;
        const codeList = data.map(dataTemp => dataTemp.budgetItemCode);
        const nameList = data.map(dataTemp => dataTemp.budgetItemName);
        data.forEach(row => {
          /* eslint-disable */
          if (that.counts(codeList, row.budgetItemCode) > 1) {
            row.validFlag = false;
            row.validMsg = '预算项目编码重复';
            that.turnFalse(data);
          }
          if (that.counts(validFlaseIdList, row.budgetItemCode) > 0) {
            row.validFlag = false;
            row.validMsg = '父项不等于子项之和';
          }
          codeList.push(row.actNo);
          nameList.push(row.actName);
        });
      },
      handlerImportFalse,
    };

    return (
      <PageWrapper loading={loading}>
        <BpmWrapper
          fieldsConfig={fieldsConfig}
          flowForm={flowForm}
          buttonLoading={loading || saveLoading}
          onBpmChanges={value => {
            this.callModelEffects('updateFlowForm', { value });
          }}
          onBtnClick={({ operation, bpmForm }) => {
            const { branch, remark } = bpmForm;
            const { key } = operation;
            const { taskKey } = fieldsConfig;
            if (key === 'FLOW_COUNTERSIGN') {
              return Promise.resolve(true);
            }
            if (taskKey === 'BUD_B01_01_SUBMIT_i') {
              if (key === 'FLOW_COMMIT' || key === 'FLOW_PASS') {
                this.handleSubmit(
                  {
                    result: 'APPROVED',
                    taskId,
                    procRemark: remark,
                    branch,
                  },
                  () => {
                    const url = getUrl().replace('edit', 'view');
                    closeThenGoto(url);
                  }
                );
                return Promise.resolve(false);
              }
            } else {
              if (key === 'FLOW_RETURN') {
                createConfirm({
                  content: '确定要拒绝该流程吗？',
                  onOk: () =>
                    pushFlowTask(taskId, {
                      remark,
                      result: 'REJECTED',
                      branch,
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
              if (key === 'FLOW_PASS') {
                return Promise.resolve(true);
              }
            }

            return Promise.resolve(false);
          }}
        >
          <ButtonCard>
            {formMode === 'EDIT' && [
              <Button
                key="save"
                size="large"
                type="primary"
                onClick={this.handleSave}
                loading={saveLoading}
              >
                保存
              </Button>,
              <Button
                key="submit"
                size="large"
                type="primary"
                onClick={() =>
                  this.handleSubmit({ result: 'APPROVED' }, () => {
                    closeThenGoto(`/user/flow/process?type=procs`);
                  })
                }
                loading={saveLoading}
              >
                提交
              </Button>,
              <CsvImportFront
                className="ant-btn tw-btn-primary ant-btn-lg"
                size="large"
                loading={false}
                {...csvImportProps}
              >
                导入
              </CsvImportFront>,
            ]}
            {formMode === 'DESCRIPTION' &&
              formData.budgetStatus === 'CREATE' && (
                <Button key="edit" size="large" type="primary" onClick={this.switchEdit}>
                  编辑
                </Button>
              )}
            {formMode === 'DESCRIPTION' &&
              formData.budgetStatus === 'ACTIVE' && [
                <Button
                  key="appropriation"
                  size="large"
                  type="primary"
                  onClick={() =>
                    router.push(
                      `/workTable/bud/appropriationDisplayPage?budgetId=${formData.id}&mode=EDIT`
                    )
                  }
                >
                  申请拨款
                </Button>,
                <Button
                  key="budgetAdjust"
                  size="large"
                  type="primary"
                  onClick={() =>
                    router.push(
                      `/workTable/bud/budgetAdjustDisplayPage?budgetId=${formData.id}&mode=EDIT`
                    )
                  }
                >
                  申请调整
                </Button>,
              ]}
            {formMode === 'DESCRIPTION' && [
              <Button
                key="appropriationList"
                size="large"
                type="primary"
                onClick={() =>
                  router.push(`/workTable/bud/appropriationList?budgetId=${formData.id}`)
                }
              >
                拨款记录
              </Button>,
              <Button
                key="budgetAdjustList"
                size="large"
                type="primary"
                onClick={() =>
                  router.push(`/workTable/bud/budgetAdjustList?budgetId=${formData.id}`)
                }
              >
                调整记录
              </Button>,
            ]}
          </ButtonCard>
          <BusinessForm
            title="基本信息"
            form={form}
            formData={formData}
            formMode={formMode}
            defaultColumnStyle={8}
          >
            <FormItem
              fieldType="BaseRadioSelect"
              label="费用归属"
              fieldKey="chargeClassification"
              parentKey="CUS:CHARGE_CLASSIFICATION"
              options={budgetTypeList}
              required
              // initialValue="DAILY"
              onChange={value => {
                const { chargeBuId } = formData;
                this.callModelEffects('fetchTmplList', {
                  chargeClassification: value,
                  chargeBuId: chargeBuId,
                });
                this.callModelEffects('updateForm', {
                  tmplId: undefined,
                });
              }}
            />

            <FormItem fieldType="BaseInput" label="预算名称" fieldKey="budgetName" required />

            <FormItem fieldType="BaseInput" label="预算编码" fieldKey="budgetCode" disabled />

            <FormItem
              fieldType="BuSimpleSelect"
              label="预算部门"
              fieldKey="chargeBuId"
              descriptionField="chargeBuName"
              required
              initialValue={fromQs().chargeBuId}
              onChange={value => {
                const { chargeClassification } = formData;
                this.callModelEffects('fetchTmplList', {
                  chargeClassification: chargeClassification,
                  chargeBuId: value,
                });
                this.callModelEffects('updateForm', {
                  tmplId: undefined,
                });
              }}
            />

            <FormItem
              fieldType="ProjectSimpleSelect"
              label="预算项目"
              fieldKey="chargeProjectId"
              descriptionField="chargeProjectName"
              initialValue={fromQs().chargeProjectId}
              queryParam={{
                projectStatus: 'ACTIVE',
              }}
              required={
                formData.chargeClassification === 'PROJECT' ||
                formData.chargeClassification === 'SPECIAL'
              }
            />

            <FormItem
              fieldType="BaseSelect"
              label="科目模板"
              fieldKey="tmplId"
              descriptionField="tmplName"
              descList={tmplList}
              required
              onChange={value => {
                const { tmplId } = formData;
                createConfirm({
                  content: '修改科目模板将清空预算明细，确认继续操作吗？',
                  onOk: () => {
                    this.callModelEffects('fetchBudgetTree', { tmplId: value });
                    this.callModelEffects('updateForm', { totalBudgetAmt: 0 });
                  },
                  onCancel: () => {
                    this.callModelEffects('updateForm', { tmplId });
                  },
                });
              }}
            />

            <FormItem
              fieldType="BaseRadioSelect"
              label="控制策略"
              fieldKey="controlType"
              options={budgetControlTypeList}
              required
              initialValue="RIGID"
            />

            <FormItem
              fieldType="BaseDateRangePicker"
              label="起止日期"
              fieldKey="budgetDate"
              descriptionRender={`${formData.budgetStartDate || ''} ~ ${formData.budgetEndDate ||
                ''}`}
            />

            {/* <FormItem
              fieldType="BaseFileManagerEnhance"
              label="附件"
              fieldKey="file"
              api="/api/production/bud/budget/sfs/token"
              dataKey={formData.id}
            /> */}

            <FormItem
              fieldType="FileUpload"
              fieldKey="file"
              label="附件"
              fileList={attachments}
              multiple
            />

            <FormItem
              fieldType="BaseSelect"
              label="预算状态"
              fieldKey="budgetStatus"
              parentKey="COM:DOC_STATUS"
              disabled
            />

            <FormItem
              fieldType="ResSimpleSelect"
              label="申请人"
              fieldKey="applyResId"
              descriptionField="applyResName"
              disabled
              initialValue={extInfo.resId}
              descList={[{ value: extInfo.resId, title: extInfo.resName }]}
            />

            <FormItem
              fieldType="BaseDatePicker"
              label="申请日期"
              fieldKey="applyDate"
              disabled
              initialValue={moment().format('YYYY-MM-DD')}
            />

            <FormItem
              fieldType="BaseInputAmt"
              label="预算总金额"
              fieldKey="totalBudgetAmt"
              disabled
            />

            <FormItem
              fieldType="Custom"
              label="使用进度"
              fieldKey="custom1"
              descriptionRender={<BudgetProgress row={formData} />}
            >
              <BudgetProgress row={formData} />
            </FormItem>

            <FormItem
              fieldType="BaseInputAmt"
              label="已拨款"
              fieldKey="totalAppropriationAmt"
              disabled
            />

            <FormItem fieldType="BaseInputAmt" label="已使用" fieldKey="usedAmt" disabled />

            <FormItem fieldType="BaseInputAmt" label="已占用" fieldKey="occupiedAmt" disabled />

            <FormItem fieldType="BaseInputTextArea" label="备注" fieldKey="remark" />
          </BusinessForm>

          {formMode === 'EDIT' && (
            <EditTable
              title="预算明细"
              form={form}
              columns={editColumns}
              dataSource={wrappedDetails}
              expandedRowKeys={expandedRowKeys}
              onExpand={this.onExpand}
              rowSelectAble={false}
            />
          )}

          {formMode === 'DESCRIPTION' && (
            <DataTable
              title="预算明细"
              columns={descriptionColumns}
              dataSource={wrappedDetails}
              expandedRowKeys={expandedRowKeys}
              prodSelection={false}
              onExpand={this.onExpand}
              showExport={false}
              buttons={rightButtons}
            />
          )}
        </BpmWrapper>
        {!taskId && <BpmConnection source={allBpm} />}
      </PageWrapper>
    );
  }
}

export default BudgetDisplayPage;
