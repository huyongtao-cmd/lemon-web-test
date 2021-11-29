import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Input, Form, Tooltip, Modal, Icon, Button } from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import createMessage from '@/components/core/AlertMessage';
import { Selection, DatePicker } from '@/pages/gen/field';
import { selectInternalOus } from '@/services/gen/list';
import { formatMessage } from 'umi/locale';
import { fromQs } from '@/utils/stringUtils';
import { isEmpty } from 'ramda';

const { Field } = FieldList;

const DOMAIN = 'implement';

@connect(({ loading, implement, dispatch }) => ({
  implement,
  dispatch,
  loading,
}))
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
@mountToTab()
class Implement extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      targetVisible: false,
      submitConfirmStatus: false,
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const { _refresh } = fromQs();
    !(_refresh === '0') && dispatch({ type: `${DOMAIN}/clean` });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: { ...params } });
  };

  targetFetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/queryTarget`, payload: { ...params } });
  };

  toggleVisible = () => {
    const { visible } = this.state;
    this.setState({ visible: !visible });
  };

  targetToggleVisible = () => {
    const { targetVisible } = this.state;
    this.setState({ targetVisible: !targetVisible });
  };

  // 自己托管modal确定按钮的loading状态，避免多次快速点击确定会重复发送请求
  toggleSubmitConfirmStatus = () => {
    const { submitConfirmStatus } = this.state;
    this.setState({ submitConfirmStatus: !submitConfirmStatus });
  };

  handleSubmit = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        this.toggleSubmitConfirmStatus();
        dispatch({
          type: `${DOMAIN}/submit`,
        }).then(response => {
          if (response.ok) {
            this.toggleVisible();
            this.toggleSubmitConfirmStatus();
          }
        });
      }
    });
  };

  render() {
    const {
      dispatch,
      loading,
      form: { getFieldDecorator, setFieldsValue },
      implement: { list, total, searchForm, formData, targetList, targetTotal },
    } = this.props;
    const { visible, targetVisible, submitConfirmStatus } = this.state;
    const listLoading = loading.effects[`${DOMAIN}/query`];
    const targetLoading = loading.effects[`${DOMAIN}/queryTarget`];

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'DESC',
      loading: listLoading,
      total,
      dataSource: list,
      onChange: filters => this.fetchData(filters),
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      searchForm,
      searchBarForm: [
        {
          title: '周期名称',
          dataIndex: 'periodName',
          options: {
            initialValue: searchForm.periodName || undefined,
          },
          tag: <Input placeholder="请输入周期名称" />,
        },
        {
          title: '公司',
          dataIndex: 'company',
          options: {
            initialValue: searchForm.company || undefined,
          },
          tag: (
            <Selection
              key="COMPANY"
              className="x-fill-100"
              source={() => selectInternalOus()}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
              placeholder="请选择公司"
            />
          ),
        },
        {
          title: '开始/结束日期',
          dataIndex: 'date',
          options: {
            initialValue: [searchForm.beginDate, searchForm.endDate] || [],
          },
          tag: <DatePicker.RangePicker format="YYYY-MM-DD" />,
        },
      ],
      columns: [
        {
          title: '周期名称',
          dataIndex: 'periodName',
          align: 'center',
          width: '25%',
        },
        {
          title: '公司',
          dataIndex: 'companyName',
          align: 'center',
          width: '25%',
        },
        {
          title: '开始/结束日期',
          dataIndex: 'beginDate',
          align: 'center',
          width: '20%',
          render: (value, row, index) => `${row.beginDate} ~ ${row.endDate}`,
        },
        {
          title: '描述',
          dataIndex: 'periodDesc',
          width: '20%',
          render: (value, row, key) =>
            value && value.length > 15 ? (
              <Tooltip placement="left" title={value}>
                <pre>{`${value.substr(0, 15)}...`}</pre>
              </Tooltip>
            ) : (
              <pre>{value}</pre>
            ),
        },
        {
          title: '关联的目标',
          dataIndex: 'date',
          align: 'center',
          width: '10%',
          render: (value, row, index) => (
            <Button
              className="tw-btn-info"
              icon="trademark"
              key="makeSure"
              onClick={() => {
                this.targetToggleVisible();
                dispatch({
                  type: `${DOMAIN}/queryTarget`,
                  payload: {
                    okrPeriodId: row.id,
                  },
                });
              }}
            >
              &nbsp;
              {row.objTotal || 0}
            </Button>
          ),
        },
      ],
      leftButtons: [
        {
          key: 'create',
          icon: 'plus-circle',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.insert`, desc: '新增' }),
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            this.toggleVisible();
          },
        },
        {
          key: 'edit',
          icon: 'form',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.update`, desc: '修改' }),
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            this.toggleVisible();
            dispatch({
              type: `${DOMAIN}/updateForm`,
              payload: {
                ...selectedRows[0],
              },
            });
          },
        },
        {
          key: 'remove',
          className: 'tw-btn-error',
          title: formatMessage({ id: `misc.delete`, desc: '删除' }),
          loading: false,
          hidden: false,
          disabled: selectedRows => !selectedRows.length,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const tt = selectedRows.filter(v => v.objTotal);
            if (tt.length) {
              createMessage({ type: 'warn', description: '有关联目标的周期不能被删除！' });
              return;
            }
            dispatch({
              type: `${DOMAIN}/delete`,
              payload: { ids: selectedRowKeys.join(',') },
            });
          },
        },
      ],
    };

    const targetTableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'DESC',
      loading: targetLoading,
      total: targetTotal,
      dataSource: targetList.map(v => ({ ...v, children: null })),
      showSearch: false,
      showColumn: false,
      showExport: false,
      enableSelection: false,
      onChange: filters => this.targetFetchData(filters),
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      searchForm,
      searchBarForm: [],
      columns: [
        {
          title: '目标名称',
          dataIndex: 'objectiveName',
          align: 'center',
        },
        {
          title: '目标主体',
          dataIndex: 'objectiveSubjectName',
          align: 'center',
        },
        {
          title: '目标负责人',
          dataIndex: 'objectiveResName',
          align: 'center',
        },
        {
          title: '目标状态',
          dataIndex: 'objectiveStatusName',
          align: 'center',
        },
      ],
      leftButtons: [],
    };

    return (
      <>
        <PageHeaderWrapper title="实施周期列表">
          <DataTable {...tableProps} />
        </PageHeaderWrapper>
        <Modal
          title={`关联目标(${targetTotal})`}
          visible={targetVisible}
          onOk={() => this.targetToggleVisible()}
          onCancel={() => this.targetToggleVisible()}
          footer={[
            <Button
              className="tw-btn-primary"
              style={{ backgroundColor: '#284488' }}
              key="makeSure"
              onClick={() => this.targetToggleVisible()}
            >
              确定
            </Button>,
          ]}
          destroyOnClose
          // 蒙版完全关闭后清除数据
          afterClose={() => {
            dispatch({
              type: `${DOMAIN}/updateState`,
              payload: {
                targetList: [],
                targetTotal: 0,
              },
            });
          }}
          width="60%"
        >
          <DataTable {...targetTableProps} />
        </Modal>
        <Modal
          title="实施周期维护"
          visible={visible}
          onOk={() => {
            this.handleSubmit();
          }}
          onCancel={() => this.toggleVisible()}
          confirmLoading={submitConfirmStatus}
          maskClosable={false}
          destroyOnClose
          // 蒙版完全关闭后清除数据
          afterClose={() => {
            dispatch({
              type: `${DOMAIN}/updateState`,
              payload: {
                formData: {},
              },
            });
          }}
          width="60%"
        >
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="periodName"
              label="周期名称"
              decorator={{
                initialValue: formData.periodName || undefined,
                rules: [
                  {
                    required: true,
                    message: '请选择周期名称',
                  },
                ],
              }}
            >
              <Input placeholder="请选择周期名称" />
            </Field>
            <Field
              name="date"
              label="周期时间段"
              decorator={{
                initialValue: [formData.beginDate, formData.endDate] || [],
                rules: [
                  {
                    required: true,
                    message: '请选择周期时间段',
                  },
                ],
              }}
            >
              <DatePicker.RangePicker format="YYYY-MM-DD" />
            </Field>
            <Field
              name="company"
              label="公司"
              decorator={{
                initialValue: formData.company || undefined,
                rules: [
                  {
                    required: true,
                    message: '请选择公司',
                  },
                ],
              }}
            >
              <Selection
                key="COMPANY"
                className="x-fill-100"
                source={() => selectInternalOus()}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                dropdownMatchSelectWidth={false}
                showSearch
                onColumnsChange={value => {}}
                placeholder="请选择公司"
              />
            </Field>
            <Field
              name="periodDesc"
              label="描述"
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
              decorator={{
                initialValue: formData.periodDesc || '',
              }}
            >
              <Input.TextArea rows={3} placeholder="请输入描述" />
            </Field>
          </FieldList>
        </Modal>
      </>
    );
  }
}

export default Implement;
