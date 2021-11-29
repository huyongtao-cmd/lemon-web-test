import React, { PureComponent } from 'react';
import { connect } from 'dva';
import Debounce from 'lodash-decorators/debounce';
import Bind from 'lodash-decorators/bind';
import { Button, Card, Tooltip, Form, Checkbox } from 'antd';
import FieldList from '@/components/layout/FieldList';

import { formatMessage } from 'umi/locale';
import { createConfirm } from '@/components/core/Confirm';
import createMessage from '@/components/core/AlertMessage';
import DataTable from '@/components/common/DataTable';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { queryUdc } from '@/services/gen/app';
import { isEmpty, isNil } from 'ramda';

import { fromQs } from '@/utils/stringUtils';
import { FileManagerEnhance, Selection } from '@/pages/gen/field';
import DescriptionList from '@/components/layout/DescriptionList';
import ResDefinitionModal from './ResDefinitionModal';

const columns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 8 },
  { dataIndex: 'ext1', title: '公司', span: 8 },
];
const { Field, FieldLine } = FieldList;
const DOMAIN = 'eqvaSalaryResDefinition';
// 资源当量收入明细初始化
const formDataModel = {
  id: null,
  buId: null,
  finYear: null, // 年度
  finPeriod: null, // 期间
  jobType: null, // 工种
  jobType2: null, // 工种子类
  coopType: null, // 合作方式
  cityLevel: null, // 城市级别
  resId: null, // 资源
  preeqvaAmt: null, // 单位当量收入
  lineStatus: 'ACTIVE', // 状态
  remark: null, // 备注
};

@Form.create({
  onValuesChange(props, changedValues) {
    if (!isEmpty(changedValues)) {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: changedValues,
      });
    }
  },
})
@connect(({ loading, eqvaSalaryResDefinition, user }) => ({
  eqvaSalaryResDefinition,
  loading: loading.effects[`${DOMAIN}/query`],
  user,
}))
class ResDefinition extends PureComponent {
  state = {
    buEqvaVisible: false, // 资源当量收入弹框显示
    formData: {
      ...formDataModel,
    },
  };

  componentDidMount() {
    const { dispatch, user } = this.props;
    dispatch({ type: `${DOMAIN}/queryBu`, payload: { closedFlag: false } }).then(res => {
      dispatch({
        type: `${DOMAIN}/query`,
        payload: res[0].id,
      });
    });
  }

  buChange = value => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: value,
    });
  };

  closedChange = value => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/queryBu`,
      payload: { closedFlag: value },
    });
  };

  // 资源当量收入新增弹出窗。
  buEqvaToggleModal = () => {
    const { buEqvaVisible } = this.state;
    this.setState({
      buEqvaVisible: !buEqvaVisible,
      formData: {
        ...formDataModel,
      },
    });
  };

  // 资源当量收入修改弹出窗。
  buEqvaEditModal = selectedRow => {
    const { dispatch } = this.props;
    const { buEqvaVisible } = this.state;
    if (selectedRow.finYear) {
      dispatch({
        type: `${DOMAIN}/updateFinPeriod`,
        payload: selectedRow.finYear,
      });
    }
    if (selectedRow.jobType) {
      dispatch({
        type: `${DOMAIN}/updateJobType2`,
        payload: selectedRow.jobType,
      });
    }
    this.setState({
      buEqvaVisible: !buEqvaVisible,
      formData: {
        ...selectedRow,
      },
    });
  };

  // 资源当量收入复制弹出窗。
  buEqvaCopyModal = selectedRow => {
    const { dispatch } = this.props;
    const { buEqvaVisible } = this.state;
    if (selectedRow.finYear) {
      dispatch({
        type: `${DOMAIN}/updateFinPeriod`,
        payload: selectedRow.finYear,
      });
    }
    if (selectedRow.jobType) {
      dispatch({
        type: `${DOMAIN}/updateJobType2`,
        payload: selectedRow.jobType,
      });
    }
    this.setState({
      buEqvaVisible: !buEqvaVisible,
      formData: {
        ...selectedRow,
        id: null,
      },
    });
  };

  // 资源当量收入保存按钮事件
  @Bind()
  @Debounce(400)
  buEqvaSubmitModal() {
    const { buEqvaVisible, formData } = this.state;
    const {
      dispatch,
      user,
      eqvaSalaryResDefinition: { buFormData },
    } = this.props;
    if (
      formData.settleMethod &&
      formData.settleMethod === 'MONTH' &&
      Number.parseFloat(formData.preeqvaAmt) !== 0
    ) {
      createMessage({ type: 'warn', description: '按月结算的资源单位当量收入必须是0' });
      return;
    }

    dispatch({
      type: `${DOMAIN}/save`,
      payload: { formData: { ...formData, buId: buFormData.buId } },
    }).then(reason => {
      if (!reason) {
        return;
      }
      this.setState({
        buEqvaVisible: !buEqvaVisible,
        formData,
      });
      dispatch({
        type: `${DOMAIN}/query`,
        payload: buFormData.buId,
      });
    });
  }

  render() {
    const {
      dispatch,
      loading,
      form: { getFieldDecorator, getFieldValue },
      eqvaSalaryResDefinition: { dataList, total, buList, buFormData },
      user,
    } = this.props;
    const { buEqvaVisible, formData } = this.state;
    // 获取url上的参数
    const param = fromQs();

    // 资源当量收入表格
    const buEqvaTableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      loading,
      pagination: false,
      total,
      dataSource: dataList,
      onChange: filters => {
        this.fetchData(filters);
      },
      onSearchBarChange: (changedValues, allValues) => {
        // console.log(changedValues, allValues);
      },
      showSearch: false,
      columns: [
        {
          title: '资源名称',
          dataIndex: 'resName',
        },
        {
          title: '年度',
          dataIndex: 'finYear',
          align: 'right',
        },
        {
          title: '期间',
          dataIndex: 'finPeriod',
          align: 'right',
        },
        {
          title: '项目',
          dataIndex: 'projName',
          align: 'right',
        },
        {
          title: '单位当量收入',
          dataIndex: 'preeqvaAmt',
          align: 'right',
        },
        {
          title: '结算方式',
          dataIndex: 'settleMethodDesc',
          align: 'right',
        },
        {
          title: '状态',
          dataIndex: 'lineStatusDesc',
          align: 'center',
        },
        {
          title: '备注',
          dataIndex: 'remark',
          render: (value, row, key) =>
            value && value.length > 15 ? (
              <Tooltip placement="left" title={value}>
                <pre>{`${value.substr(0, 15)}...`}</pre>
              </Tooltip>
            ) : (
              <pre>{value}</pre>
            ),
        },
      ],
      leftButtons: [
        {
          key: 'add',
          className: 'tw-btn-primary',
          icon: 'plus-circle',
          title: formatMessage({ id: `misc.insert`, desc: '新增' }),
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => this.buEqvaToggleModal(),
        },
        {
          key: 'edit',
          className: 'tw-btn-primary',
          icon: 'form',
          title: formatMessage({ id: `misc.update`, desc: '修改' }),
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => this.buEqvaEditModal(selectedRows[0]),
        },
        {
          key: 'copy',
          className: 'tw-btn-primary',
          icon: 'plus-circle',
          title: formatMessage({ id: `misc.copy`, desc: '复制' }),
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => this.buEqvaCopyModal(selectedRows[0]),
        },
        {
          key: 'remove',
          className: 'tw-btn-error',
          icon: 'file-excel',
          title: formatMessage({ id: `misc.delete`, desc: '删除' }),
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 2,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            createConfirm({
              content: '确认删除所选记录？',
              onOk: () =>
                dispatch({
                  type: `${DOMAIN}/delete`,
                  payload: { ids: selectedRowKeys, buId: buFormData.buId },
                }),
            });
          },
        },
      ],
    };
    return (
      <PageHeaderWrapper>
        <Card bordered={false} className="tw-card-adjust">
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={1}>
            <FieldLine key="bu" fieldCol={2} label="BU">
              <Field
                name="buId"
                decorator={{
                  initialValue: buFormData.buId,
                }}
                wrapperCol={{ span: 23 }}
              >
                <Selection.Columns
                  className="x-fill-100"
                  source={buList}
                  columns={columns}
                  dropdownMatchSelectWidth={false}
                  showSearch
                  transfer={{ key: 'id', code: 'id', name: 'name' }}
                  onColumnsChange={value => {}}
                  onChange={value => {
                    this.buChange(value);
                  }}
                />
              </Field>
              <Field
                name="closedFlag"
                decorator={{
                  initialValue: buFormData.closedFlag,
                }}
                wrapperCol={{ span: 23 }}
              >
                <Checkbox
                  // checked={checkScopeSearchForm.isOnly === 'TRUE'}
                  onChange={e => {
                    this.closedChange(e.target.checked);
                  }}
                >
                  包含关闭
                </Checkbox>
              </Field>
            </FieldLine>
          </FieldList>
          <DataTable {...buEqvaTableProps} />
          <ResDefinitionModal
            formData={formData}
            visible={buEqvaVisible}
            handleCancel={this.buEqvaToggleModal}
            handleOk={this.buEqvaSubmitModal}
            buId={buFormData.buId}
          />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default ResDefinition;
