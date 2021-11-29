import React, { PureComponent } from 'react';
import { Col, Icon, Input, Row, Switch } from 'antd';
import { connect } from 'dva';
import router from 'umi/router';
import Link from 'umi/link';
import { formatMessage } from 'umi/locale';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { mountToTab } from '@/layouts/routerControl';
import DataTable from '@/components/common/DataTable';
import createMessage from '@/components/core/AlertMessage';
import { createConfirm } from '@/components/core/Confirm';
import { fromQs } from '@/utils/stringUtils';
import DataPresentEditModal from './DataPresentEditModal';

const DOMAIN = 'dataPresentList';

@connect(({ loading, dataPresentList, dispatch, user }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  ...dataPresentList,
  dispatch,
  user,
}))
@mountToTab()
class DataPresentList extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { extractId } = fromQs();
    this.callModelEffects('handleDataColumn', { id: extractId });
    dispatch({ type: 'cleanSearchForm' }); // 进来选初始化搜索条件，再查询
    this.fetchData({ offset: 0, limit: 10 });
  }

  fetchData = params => {
    const { presentNo } = fromQs();
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: { ...params, presentNo } });
  };

  tablePropsConfig = () => {
    const { loading, dataSource, total, searchForm, dispatch, extractInfo } = this.props;
    const columns = [];
    const searchBarForm = [];

    if (extractInfo && extractInfo.detailViews && extractInfo.detailViews[0]) {
      searchBarForm.push({
        title: extractInfo.detailViews[0].columnTitle,
        dataIndex: extractInfo.detailViews[0].databaseColumn,
        tag: <Input placeholder="请输入" />,
      });
      extractInfo.detailViews.forEach(column => {
        columns.push({ title: column.columnTitle, dataIndex: column.databaseColumn });
      });
    }

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      loading,
      total,
      dataSource,
      showSearch: true,
      onChange: filters => this.fetchData(filters),
      searchForm, // 把这个注入，可以切 tab 保留table状态
      onSearchBarChange: (changedValues, allValues) => {
        // 搜索条件变化，通过这里更新到 redux
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues || {},
        });
      },
      searchBarForm,
      columns,
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
          cb: () => {
            this.updateModelState({ dataPresentEditModalVisible: true });
            dispatch({ type: `dataPresentEdit/updateForm`, payload: {} });
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
            if (selectedRowKeys.length !== 1) {
              createMessage({ type: 'warn', description: '请选择一条记录修改！' });
              return;
            }
            this.updateModelState({ dataPresentEditModalVisible: true });
            dispatch({ type: `dataPresentEdit/updateForm`, payload: selectedRows[0] });
          },
        },
        {
          key: 'copy',
          className: 'tw-btn-primary',
          icon: 'plus-circle',
          title: formatMessage({ id: `misc.copy`, desc: '复制' }),
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            if (selectedRowKeys.length !== 1) {
              createMessage({ type: 'warn', description: '请选择一条记录复制！' });
              return;
            }
            this.updateModelState({
              dataPresentEditModalVisible: true,
              currentDataPresent: { ...selectedRows[0], copy: true },
            });
            dispatch({
              type: `dataPresentEdit/updateForm`,
              payload: { ...selectedRows[0], copy: true },
            });
          },
        },
        {
          key: 'remove',
          className: 'tw-btn-error',
          icon: 'file-excel',
          title: formatMessage({ id: `misc.delete`, desc: '删除' }),
          loading,
          hidden: false,
          disabled: selectedRows => selectedRows.length < 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            if (selectedRowKeys.length < 1) {
              createMessage({ type: 'warn', description: '请至少选择一条记录删除！' });
              return;
            }
            createConfirm({
              content: '确认删除所选记录？',
              onOk: () =>
                dispatch({
                  type: `${DOMAIN}/delete`,
                  payload: { keys: selectedRowKeys.join(',') },
                }),
            });
          },
        },
      ],
    };

    return tableProps;
  };

  callModelEffects = (method, params) => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/${method}`,
      payload: params,
    });
  };

  updateModelState = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: params,
    });
  };

  handlePageConfirm = data => {
    this.updateModelState({
      dataPresentEditModalVisible: false,
    });
    this.fetchData({ offset: 0, limit: 10 });
  };

  render() {
    const { loading, extractInfo, dataPresentEditModalVisible, currentDataPresent } = this.props;
    const { presentNo } = fromQs();
    return (
      <PageHeaderWrapper>
        <DataTable {...this.tablePropsConfig()} />
        <DataPresentEditModal
          visible={dataPresentEditModalVisible}
          // formData={currentDataPresent}
          extractInfo={extractInfo}
          presentNo={presentNo}
          onCancel={() => this.updateModelState({ dataPresentEditModalVisible: false })}
          onOk={this.handlePageConfirm}
        />
      </PageHeaderWrapper>
    );
  }
}

export default DataPresentList;
