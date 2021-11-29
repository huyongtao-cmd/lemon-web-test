import React, { PureComponent } from 'react';
import { Radio } from 'antd';
import { connect } from 'dva';
import Link from 'umi/link';
import DataTable from '@/components/common/DataTable';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { Selection, BuVersion, DatePicker } from '@/pages/gen/field';
import { createConfirm } from '@/components/core/Confirm';
import SyntheticField from '@/components/common/SyntheticField';
import ResType from '@/pages/gen/field/resType';
import InsertModal from './component/insertModal';
import CancelCheckModal from './component/cancelCheck';
import FitTrainModal from './component/fitTrainModal';
import createMessage from '@/components/core/AlertMessage';

const DOMAIN = 'trainAblityList';
const RadioGroup = Radio.Group;

@connect(({ loading, trainAblityList, dispatch, global }) => ({
  loading,
  trainAblityList,
  dispatch,
  global,
}))
class TrainAbilityList extends PureComponent {
  state = {
    insertVisible: false,
    cancelViaible: false,
    trainViaible: false,
    selectedTrain: [],
  };

  componentDidMount() {
    const { dispatch } = this.props;
    // 获取考核能力
    dispatch({
      type: `${DOMAIN}/getCapaSetList`,
    });

    dispatch({
      type: `${DOMAIN}/getTrainingProgList`,
    });
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

  // 新增适岗考核弹窗显示与隐藏
  insertToggleModal = flag => {
    const {
      trainAblityList: { searchForm },
    } = this.props;
    const { insertVisible } = this.state;
    this.setState({
      insertVisible: !insertVisible,
    });
    if (flag === 'YES') {
      createMessage({ type: 'success', description: '新增成功' });
      this.fetchData(searchForm);
    }
  };

  // 取消考核确认弹窗显示与隐藏
  cancelToggleModal = flag => {
    const {
      trainAblityList: { searchForm },
    } = this.props;
    const { cancelViaible } = this.state;
    this.setState({
      cancelViaible: !cancelViaible,
    });
    if (flag === 'YES') {
      createMessage({ type: 'success', description: '取消考核成功' });
      this.fetchData(searchForm);
    }
  };

  // 适岗考核培训弹窗显示与隐藏
  trainToggleModal = () => {
    const { trainViaible } = this.state;
    this.setState({
      trainViaible: !trainViaible,
    });
  };

  render() {
    const {
      loading,
      dispatch,
      trainAblityList: {
        searchForm,
        dataSource = [],
        total = 0,
        type2 = [],
        formData,
        capaSetList,
      },
      global: { userList },
    } = this.props;

    const { insertVisible, cancelViaible, trainViaible, selectedTrain } = this.state;

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      dispatch,
      loading: loading.effects[`${DOMAIN}/query`],
      total,
      showExport: false,
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
          title: '资源',
          dataIndex: 'resId',
          options: {
            initialValue: searchForm.resId || undefined,
          },
          tag: (
            <Selection.Columns
              source={userList}
              columns={[
                { dataIndex: 'code', title: '编号', span: 10 },
                { dataIndex: 'name', title: '名称', span: 14 },
              ]}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              placeholder="请选择资源"
              showSearch
            />
          ),
        },
        {
          title: '资源类型',
          dataIndex: 'resType',
          options: {
            initialValue: searchForm.resType || undefined,
          },
          tag: <ResType type2={type2} code="RES:RES_TYPE1" onChange={this.handleChangeType} />,
        },
        {
          title: '长期/短期',
          dataIndex: 'periodFlag',
          options: {
            initialValue: searchForm.periodFlag,
          },
          tag: (
            <Radio.Group>
              <Radio value="LONG">长期</Radio>
              <Radio value="SHORT">短期</Radio>
              <Radio value="">全部</Radio>
            </Radio.Group>
          ),
        },
        {
          title: '入职日期',
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
          title: 'BaseBU',
          dataIndex: 'baseBuId',
          options: {
            initialValue: searchForm.baseBuId || undefined,
          },
          tag: <Selection.ColumnsForBu />,
        },
        {
          title: '资源状态',
          dataIndex: 'resStatus',
          options: {
            initialValue: searchForm.resStatus || undefined,
          },
          tag: <Selection.UDC code="RES:RES_STATUS" placeholder="请选择状态" showSearch />,
        },
        {
          title: '考核状态',
          dataIndex: 'capaExamStatus',
          options: {
            initialValue: searchForm.capaExamStatus || undefined,
          },
          tag: (
            <Selection.UDC code="RES:CAPA_EXAM_STATUS" placeholder="请选择考核状态" showSearch />
          ),
        },
        {
          title: '考核完成时间',
          dataIndex: 'completeDate',
          options: {
            initialValue: searchForm.completeDate || [],
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
          title: '考核能力',
          dataIndex: 'capasetLevelId',
          options: {
            initialValue: searchForm.capasetLevelId || '',
          },
          tag: (
            <Selection.Columns
              source={capaSetList || []}
              placeholder="请选择适用复合能力"
              showSearch
            />
          ),
        },
      ],
      leftButtons: [
        {
          key: 'add',
          icon: 'plus-circle',
          title: '新增适岗考核',
          className: 'tw-btn-primary',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({
              type: `${DOMAIN}/clean`,
            });
            this.insertToggleModal();
          },
        },
        {
          key: 'update',
          title: '更新考核状态',
          className: 'tw-btn-primary',
          loading: false,
          hidden: false,
          // disabled: selectedRowKeys => selectedRowKeys.length !== 1,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            createConfirm({
              content: '确定要更新考核状态吗？',
              onOk: () =>
                dispatch({
                  type: `${DOMAIN}/updateCheckStatus`,
                }).then(({ status, response }) => {
                  if (status === 200) {
                    this.fetchData();
                  }
                }),
            });
          },
        },
        {
          key: 'cancel',
          title: '取消考核',
          className: 'tw-btn-info',
          icon: 'close',
          loading: false,
          hidden: false,
          disabled: selectedRowKeys => selectedRowKeys.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            if (selectedRows[0].capaExamStatus === 'NOT_FINISHED') {
              dispatch({
                type: `${DOMAIN}/updateState`,
                payload: {
                  cancelKey: selectedRowKeys.join(','),
                },
              });
              this.cancelToggleModal();
            } else {
              createMessage({ type: 'warn', description: '考核状态为未完成时可用' });
            }
          },
        },
      ],
      columns: [
        {
          title: '资源编号',
          dataIndex: 'resNo',
          align: 'center',
        },
        {
          title: '姓名',
          dataIndex: 'personName',
          align: 'center',
        },
        {
          title: '考核能力',
          dataIndex: 'capasetLevelName',
          align: 'center',
        },
        {
          title: '考核状态',
          dataIndex: 'capaExamStatusName',
          align: 'center',
        },
        {
          title: '考核完成时间',
          dataIndex: 'examLogEndDate',
          align: 'center',
        },
        {
          title: '入职日期',
          dataIndex: 'enRollDate',
          align: 'center',
        },
        {
          title: '资源类型一',
          dataIndex: 'resType1Name',
          align: 'center',
        },
        {
          title: '资源类型二',
          dataIndex: 'resType2Name',
          align: 'center',
        },
        {
          title: '长期/短期',
          dataIndex: 'periodFlag',
          align: 'center',
          // eslint-disable-next-line no-nested-ternary
          render: val => (val === 'LONG' ? '长期' : val === 'SHORT' ? '短期' : ''),
        },
        {
          title: 'BaseBu',
          dataIndex: 'baseBuName',
          align: 'center',
        },
        {
          title: '资源状态',
          dataIndex: 'resStatusName',
          align: 'center',
        },
        {
          title: '',
          className: 'text-center',
          width: 100,
          render: (value, row, key) => (
            <span
              style={{ color: '#008fdb', cursor: 'pointer' }}
              onClick={() => {
                dispatch({
                  type: `${DOMAIN}/getTrainingList`,
                  payload: {
                    id: row.id,
                  },
                });
                this.trainToggleModal();
                this.setState({
                  selectedTrain: row,
                });
              }}
            >
              适岗培训
            </span>
          ),
        },
      ],
    };

    return (
      <PageHeaderWrapper title="适岗考核能力">
        <DataTable {...tableProps} />
        {/* <CheckModal data={formData} visibleChange={() => this.visibleChange()} /> */}
        {insertVisible ? (
          <InsertModal visible={insertVisible} closeModal={this.insertToggleModal} />
        ) : null}
        {cancelViaible ? (
          <CancelCheckModal visible={cancelViaible} closeModal={this.cancelToggleModal} />
        ) : null}
        {trainViaible ? (
          <FitTrainModal
            visible={trainViaible}
            closeModal={this.trainToggleModal}
            row={selectedTrain}
          />
        ) : null}
      </PageHeaderWrapper>
    );
  }
}

export default TrainAbilityList;
