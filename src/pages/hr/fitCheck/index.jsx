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
import CheckModal from './CheckModal';

const DOMAIN = 'fitCheck';
const RadioGroup = Radio.Group;

@connect(({ loading, fitCheck, dispatch, global }) => ({
  loading,
  fitCheck,
  dispatch,
  global,
}))
class TarinResultList extends PureComponent {
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

  // visibleChange = () => {
  //   const {
  //     dispatch,
  //     fitCheck: {
  //       formData: { visible },
  //     },
  //   } = this.props;

  //   dispatch({
  //     type: `${DOMAIN}/updateState`,
  //     payload: {
  //       formData: {
  //         visible: !visible,
  //       },
  //     },
  //   });
  // };

  // resCapaReviewChecked = row => {
  //   const { dispatch } = this.props;
  //   this.visibleChange();
  //   dispatch({
  //     type: `${DOMAIN}/capaAbility`,
  //     payload: {
  //       abilityId: row.id,
  //       entryType: row.entryType,
  //     },
  //   }).then(res => {
  //     if (res.ok) {
  //       dispatch({
  //         type: `${DOMAIN}/updateForm`,
  //         payload: {
  //           ...row,
  //           flag: 1,
  //         },
  //       });
  //     }
  //   });
  // };

  render() {
    const {
      loading,
      dispatch,
      fitCheck: { searchForm, dataSource = [], total = 0, type2 = [], formData },
      global: { userList },
    } = this.props;

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
          title: 'BaseBU',
          dataIndex: 'buId',
          options: {
            initialValue: searchForm.buId || undefined,
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
          title: '入职时间',
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
          title: '能力类型',
          dataIndex: 'capaAblity',
          options: {
            initialValue: searchForm.capaAblity || '',
          },
          tag: (
            <RadioGroup>
              <Radio value="REQUIRED">单项能力</Radio>
              <Radio value="OPTIONAL">复合能力</Radio>
              <Radio value="">全部</Radio>
            </RadioGroup>
          ),
        },
      ],
      leftButtons: [
        {
          key: 'cancel',
          title: '取消考核',
          className: 'tw-btn-info',
          icon: 'close',
          loading: false,
          hidden: false,
          disabled: selectedRows => !selectedRows.length,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            createConfirm({
              content: '确认取消适岗考核，恢复能力状态为“有效”？',
              onOk: () =>
                dispatch({ type: `${DOMAIN}/cancel`, payload: { ids: selectedRowKeys.join(',') } }),
            });
          },
        },
        {
          key: 'delete',
          title: '删除能力',
          className: 'tw-btn-error',
          icon: 'delete',
          loading: false,
          hidden: false,
          disabled: selectedRows => !selectedRows.length,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            createConfirm({
              content: '确认删除选择资源的该项能力？',
              onOk: () =>
                dispatch({ type: `${DOMAIN}/delete`, payload: { ids: selectedRowKeys.join(',') } }),
            });
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
          dataIndex: 'capaAblity',
          align: 'center',
          // render: (val, row) => (
          //   <span
          //     style={{ color: '#1890ff', cursor: 'pointer', textDecoration: 'underline ' }}
          //     onClick={() => {
          //       this.resCapaReviewChecked(row);
          //     }}
          //   >
          //     {val}
          //   </span>
          // ),
        },
        {
          title: '能力类型',
          dataIndex: 'entryType',
          align: 'center',
          // eslint-disable-next-line no-nested-ternary
          render: val => (val === '2' ? '复合能力' : val === '1' ? '单项能力' : ''),
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
          title: 'BaseBu',
          dataIndex: 'buName',
          align: 'center',
        },
        {
          title: '入职时间',
          dataIndex: 'enrollDate',
          align: 'center',
        },
        {
          title: '资源状态',
          dataIndex: 'resStatusName',
          align: 'center',
        },
      ],
    };

    return (
      <PageHeaderWrapper title="适岗考核列表">
        <DataTable {...tableProps} />
        {/* <CheckModal data={formData} visibleChange={() => this.visibleChange()} /> */}
      </PageHeaderWrapper>
    );
  }
}

export default TarinResultList;
