import React, { PureComponent } from 'react';
import { Radio, Input, InputNumber, Tooltip, Modal, Button, Card, Form } from 'antd';
import { connect } from 'dva';
import DataTable from '@/components/common/DataTable';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { Selection, DatePicker } from '@/pages/gen/field';
import SyntheticField from '@/components/common/SyntheticField';
import ResType from '@/pages/gen/field/resType';
import createMessage from '@/components/core/AlertMessage';
import { isEmpty } from 'ramda';
import FieldList from '@/components/layout/FieldList';
import { createConfirm } from '@/components/core/Confirm';
import moment from 'moment';

const DOMAIN = 'tarinResult';
const { Field } = FieldList;
const RadioGroup = Radio.Group;

@connect(({ loading, tarinResult, dispatch, global }) => ({
  loading,
  tarinResult,
  dispatch,
  global,
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
class TarinResultList extends PureComponent {
  state = {
    visible: false,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    // dispatch({ type: `${DOMAIN}/queryCapaTreeData` });
    // dispatch({ type: `${DOMAIN}/getCapacityList` });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: { ...params } });
  };

  handleChangeType = (value, index) => {
    if (index === 0) {
      const { dispatch } = this.props;
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: { type2: [] },
      });
      dispatch({
        type: `${DOMAIN}/typeChange`,
        payload: value[0],
      });
    }
  };

  toggleVisible = () => {
    const { visible } = this.state;
    this.setState({ visible: !visible });
  };

  handleSave = () => {
    const {
      form,
      dispatch,
      tarinResult: { searchForm },
    } = this.props;
    dispatch({
      type: `${DOMAIN}/updateEndDate`,
    }).then(data => {
      this.toggleVisible();
      this.fetchData(searchForm);
    });
  };

  render() {
    const {
      loading,
      dispatch,
      form: { getFieldDecorator },
      tarinResult: {
        searchForm,
        dataSource = [],
        total = 0,
        type2 = [],
        capacityList,
        capaTreeData,
        formData,
        selectedDate,
      },
      global: { userList },
    } = this.props;
    const { visible } = this.state;
    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      dispatch,
      loading: loading.effects[`${DOMAIN}/query`],
      total,
      // showExport: false,
      showColumn: false,
      dataSource,
      onChange: filters => {
        this.fetchData(filters);
      },
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      searchBarForm: [
        {
          title: '????????????',
          dataIndex: 'progName',
          options: {
            initialValue: searchForm.progName || undefined,
          },
          tag: <Input placeholder="?????????????????????" />,
        },
        {
          title: '??????/??????',
          dataIndex: 'requiredFlag',
          options: {
            initialValue: searchForm.requiredFlag || '',
          },
          tag: (
            <RadioGroup>
              <Radio value="REQUIRED">??????</Radio>
              <Radio value="OPTIONAL">??????</Radio>
              <Radio value="">??????</Radio>
            </RadioGroup>
          ),
        },
        {
          title: '????????????',
          dataIndex: 'trnStatus',
          options: {
            initialValue: searchForm.trnStatus || undefined,
          },
          tag: <Selection.UDC code="RES:TRN_STATUS" placeholder="???????????????" showSearch />,
        },
        {
          title: '????????????',
          dataIndex: 'entryType',
          options: {
            initialValue: searchForm.entryType || undefined,
          },
          tag: <Selection.UDC code="RES:TRN_REASON_TYPE" placeholder="?????????????????????" showSearch />,
        },
        {
          title: '????????????',
          dataIndex: 'trnCurProg',
          options: {
            initialValue: searchForm.trnCurProg,
          },
          tag: (
            <SyntheticField className="tw-field-group">
              <InputNumber className="x-fill-100" placeholder="" />
              <span style={{ padding: '0 5px' }}>~</span>
              <InputNumber className="x-fill-100" placeholder="" />
            </SyntheticField>
          ),
        },
        {
          title: '????????????',
          dataIndex: 'sDate',
          options: {
            initialValue: searchForm.sDate || [],
          },
          tag: (
            <SyntheticField className="tw-field-group">
              <DatePicker format="YYYY-MM-DD" />
              <span style={{ padding: '0 5px' }}>~</span>
              <DatePicker format="YYYY-MM-DD" />
            </SyntheticField>
          ),
        },
        {
          title: '????????????',
          dataIndex: 'date',
          options: {
            initialValue: searchForm.date || [],
          },
          tag: (
            <SyntheticField className="tw-field-group">
              <DatePicker format="YYYY-MM-DD" />
              <span style={{ padding: '0 5px' }}>~</span>
              <DatePicker format="YYYY-MM-DD" />
            </SyntheticField>
          ),
        },
        {
          title: '??????/??????',
          dataIndex: 'periodFlag',
          options: {
            initialValue: searchForm.periodFlag,
          },
          tag: (
            <Radio.Group>
              <Radio value="LONG">????????????</Radio>
              <Radio value="SHORT">????????????</Radio>
              <Radio value="">??????</Radio>
            </Radio.Group>
          ),
        },
        {
          title: '????????????',
          dataIndex: 'resStatus',
          options: {
            initialValue: searchForm.resStatus || undefined,
          },
          tag: <Selection.UDC code="RES:RES_STATUS" placeholder="???????????????" showSearch />,
        },
        {
          title: '????????????',
          dataIndex: 'resType',
          options: {
            initialValue: searchForm.resType || undefined,
          },
          tag: <ResType type2={type2} code="RES:RES_TYPE1" onChange={this.handleChangeType} />,
        },
        {
          title: 'BaseBU',
          dataIndex: 'buId',
          options: {
            initialValue: searchForm.buId || undefined,
          },
          tag: <Selection.ColumnsForBu />,
        },
        {
          title: '??????',
          dataIndex: 'resId',
          options: {
            initialValue: searchForm.resId || undefined,
          },
          tag: (
            <Selection.Columns
              source={userList}
              columns={[
                { dataIndex: 'code', title: '??????', span: 10 },
                { dataIndex: 'name', title: '??????', span: 14 },
              ]}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              placeholder="???????????????"
              showSearch
            />
          ),
        },
      ],
      leftButtons: [
        {
          key: 'edit',
          title: '??????????????????',
          className: 'tw-btn-primary',
          loading: false,
          hidden: false,
          disabled: selectedRowKeys => selectedRowKeys.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({
              type: `${DOMAIN}/updateState`,
              payload: {
                selectedDate: selectedRowKeys.join(','),
              },
            });
            dispatch({
              type: `${DOMAIN}/updateForm`,
              payload: {
                endDate: selectedRows[0].endDate,
              },
            });
            this.setState({
              visible: true,
            });
          },
        },
        {
          key: 'update',
          title: '??????????????????',
          className: 'tw-btn-primary',
          loading: false,
          hidden: false,
          // disabled: selectedRows => !selectedRows.length,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            createConfirm({
              content: '?????????????????????????????????',
              onOk: () =>
                dispatch({
                  type: `${DOMAIN}/updateLearningPro`,
                }).then(({ status, response }) => {
                  if (status === 200) {
                    this.fetchData();
                  }
                }),
            });
          },
        },
        {
          key: 'close',
          title: '??????',
          className: 'tw-btn-error',
          icon: 'close',
          loading: false,
          hidden: false,
          disabled: selectedRows => !selectedRows.length,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const tt = selectedRows.filter(
              v => v.trnStatus !== 'NOT_STARTED' && v.trnStatus !== 'IN_PROCESS'
            );
            if (!isEmpty(tt)) {
              createMessage({
                type: 'warn',
                description: '???????????????????????????????????????????????????????????????',
              });
              return;
            }
            dispatch({ type: `${DOMAIN}/close`, payload: { ids: selectedRowKeys.join(',') } });
          },
        },
      ],
      columns: [
        {
          title: '????????????',
          dataIndex: 'resNo',
          align: 'center',
        },
        {
          title: '??????',
          dataIndex: 'personName',
          align: 'center',
        },
        {
          title: '????????????',
          dataIndex: 'progName',
          align: 'center',
          render: (value, row, index) =>
            value && value.length > 15 ? (
              <Tooltip placement="left" title={<pre>{value}</pre>}>
                <span>{`${value.substr(0, 15)}...`}</span>
              </Tooltip>
            ) : (
              <span>{value}</span>
            ),
        },
        {
          title: '????????????',
          dataIndex: 'entryTypeName',
          align: 'center',
        },
        {
          title: '????????????',
          dataIndex: 'trnStatusName',
          align: 'center',
        },
        {
          title: '??????/??????',
          dataIndex: 'requiredFlag',
          align: 'center',
          // eslint-disable-next-line no-nested-ternary
          render: val => (val === 'REQUIRED' ? '??????' : val === 'OPTIONAL' ? '??????' : ''),
        },
        {
          title: '????????????',
          dataIndex: 'trnCurProg',
          align: 'center',
          render: val => `${val}%`,
        },
        {
          title: '????????????',
          dataIndex: 'startDate',
          align: 'center',
        },
        {
          title: '????????????',
          dataIndex: 'endDate',
          align: 'center',
        },
        {
          title: '????????????',
          dataIndex: 'resStatusName',
          align: 'center',
        },
        {
          title: '???????????????',
          dataIndex: 'resType1Name',
          align: 'center',
        },
        {
          title: '???????????????',
          dataIndex: 'resType2Name',
          align: 'center',
        },
        {
          title: '??????/??????',
          dataIndex: 'periodFlag',
          align: 'center',
          // eslint-disable-next-line no-nested-ternary
          render: val => (val === 'LONG' ? '????????????' : val === 'SHORT' ? '????????????' : ''),
        },
        {
          title: 'BaseBU',
          dataIndex: 'buName',
          align: 'center',
        },
      ],
    };

    return (
      <PageHeaderWrapper title="??????????????????">
        <DataTable {...tableProps} />
        {visible ? (
          <Modal
            centered
            title="??????????????????"
            visible={visible}
            destroyOnClose
            onCancel={() => this.toggleVisible()}
            width="30%"
            footer={[
              <Button
                key="confirm"
                type="primary"
                size="large"
                htmlType="button"
                onClick={() => this.handleSave()}
                loading={loading.effects[`${DOMAIN}/updateEndDate`]}
              >
                ??????
              </Button>,
              <Button key="cancel" type="primary" size="large" onClick={() => this.toggleVisible()}>
                ??????
              </Button>,
            ]}
          >
            <Card bordered={false} className="tw-card-adjust">
              <FieldList getFieldDecorator={getFieldDecorator} col={1}>
                <Field
                  name="endDate"
                  label="????????????"
                  fieldCol={1}
                  labelCol={{ span: 10 }}
                  wrapperCol={{ span: 14 }}
                  decorator={{
                    initialValue: formData.endDate ? moment(formData.endDate) : null,
                    rules: [{ required: false, message: '?????????????????????' }],
                  }}
                >
                  <DatePicker className="x-fill-100" placeholder="????????????" format="YYYY-MM-DD" />
                </Field>
              </FieldList>
            </Card>
          </Modal>
        ) : null}
      </PageHeaderWrapper>
    );
  }
}

export default TarinResultList;
