import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { mountToTab } from '@/layouts/routerControl';

import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { Selection } from '@/pages/gen/field';
import { queryCascaderUdc } from '@/services/gen/app';
import AddMainModal from './modal/AddMain';
import DetailMainModal from './modal/DetailMain';

const DOMAIN = 'sysEvalMain';

@connect(({ loading, sysEvalMain, dispatch }) => ({
  dispatch,
  loading: loading.effects[`${DOMAIN}/query`],
  sysEvalMain,
}))
@mountToTab()
class EvalMain extends PureComponent {
  state = {
    visible: false,
    visibleDetail: false,
    modalTitle: 1,
    evalTypeData: [],
    evalTypeModalData: [],
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/updateState`, payload: { searchForm: {} } });
    this.fetchData({
      limit: 10,
      offset: 0,
      sortBy: 'id',
      sortDirection: 'DESC',
    });
  }

  fetchData = async params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: { ...params } });
  };

  toggle = () => {
    const { visible } = this.state;
    this.setState({
      visible: !visible,
    });
  };

  toggleDetail = () => {
    const { visibleDetail } = this.state;
    this.setState({
      visibleDetail: !visibleDetail,
    });
  };

  render() {
    const {
      dispatch,
      loading,
      sysEvalMain: { dataSource, total, searchForm },
    } = this.props;
    const { visible, visibleDetail, modalTitle, evalTypeData, evalTypeModalData } = this.state;

    const tableProps = {
      columnsCache: DOMAIN,
      dispatch,
      loading,
      expirys: 0,
      rowKey: 'id',
      sortBy: 'id',
      sortDirection: 'DESC',
      showColumn: false,
      showExport: false,
      dataSource,
      total,
      searchForm,
      rowSelection: {
        type: 'radio',
      },
      onChange: filters => {
        this.fetchData(filters);
      },
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: changedValues,
        });
      },
      searchBarForm: [
        {
          title: '????????????',
          dataIndex: 'evalClass',
          options: {
            initialValue: searchForm.evalClass,
          },
          tag: (
            <Selection.UDC
              code="TSK:EVAL_CLASS"
              placeholder="????????????"
              onChange={v => {
                dispatch({
                  type: `${DOMAIN}/updateSearchForm`,
                  payload: {
                    evalType: '',
                  },
                });
                if (v) {
                  queryCascaderUdc({
                    defId: 'TSK:EVAL_TYPE',
                    parentDefId: 'TSK:EVAL_CLASS',
                    parentVal: v,
                  }).then(({ response }) =>
                    this.setState({
                      evalTypeData: response,
                    })
                  );
                } else {
                  this.setState({
                    evalTypeData: [],
                  });
                }
              }}
            />
          ),
        },
        {
          title: '????????????',
          dataIndex: 'evalType',
          options: {
            initialValue: searchForm.evalType,
          },
          tag: <Selection source={evalTypeData} placeholder="????????????" />,
          // <Selection.UDC code="TSK:EVAL_TYPE" placeholder="????????????" />,
        },
      ],
      leftButtons: [
        {
          key: 'add',
          title: '??????',
          className: 'tw-btn-primary',
          icon: 'plus-circle',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            this.setState({ modalTitle: 1 });
            this.toggle();
          },
        },
        {
          key: 'edit',
          title: '??????',
          className: 'tw-btn-primary',
          icon: 'form',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            this.setState({ modalTitle: 0 });
            dispatch({
              type: `${DOMAIN}/infoById`,
              payload: selectedRowKeys[0],
            }).then(() => {
              this.toggle();
            });
          },
        },
      ],
      columns: [
        {
          title: '????????????',
          dataIndex: 'evalClassName',
          align: 'center',
        },
        {
          title: '????????????',
          dataIndex: 'evalTypeName',
          align: 'center',
          render: (val, row) => (
            <a
              onClick={() => {
                dispatch({
                  type: `${DOMAIN}/infoById`,
                  payload: row.id,
                }).then(() => this.toggleDetail());
              }}
            >
              {val}
            </a>
          ),
        },
        {
          title: '????????????',
          dataIndex: 'evalDesc',
          width: '40%',
          render: value => <pre>{value}</pre>,
        },
      ],
    };

    return (
      <PageHeaderWrapper title="???????????????">
        <DataTable {...tableProps} />
        <AddMainModal
          visible={visible}
          toggle={this.toggle}
          title={modalTitle}
          data={evalTypeModalData}
        />
        <DetailMainModal visible={visibleDetail} toggle={this.toggleDetail} />
      </PageHeaderWrapper>
    );
  }
}

export default EvalMain;
