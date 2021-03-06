import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Input, Select, Radio, Switch } from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import { isEmpty } from 'ramda';
import { mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { TagOpt } from '@/utils/tempUtils';

import DetailModal from './modal/detailModal';
import { reValidate } from '@/pages/gen/hint';
import { convertCode } from '@/components/core/I18n/convert';
import createMessage from '@/components/core/AlertMessage';
import ExcelImportExport from '@/components/common/ExcelImportExport';

const RadioGroup = Radio.Group;

const DOMAIN = 'platCapaCourse';

@connect(({ loading, platCapaCourse }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  ...platCapaCourse,
}))
@mountToTab()
class CourseList extends PureComponent {
  state = {
    modalVisible: false,
    canEdit: false,
    canEditDet: true,
    confirmLoading: false,
    // formData: {
    //   levelStatus: '1',
    //   defFlag: 1,
    //   ...formDataModel,
    // },
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/clean`,
    });
    this.fetchPageData();
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: {
        pageNo: 'TRAINING_COURSE_PAGE',
      },
    });
  }

  fetchPageData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: params,
    });
  };

  onCellChanged = (index, value, name) => {
    const { dataSource = [], dispatch } = this.props;

    const newDataSource = dataSource;
    newDataSource[index] = {
      ...newDataSource[index],
      [name]: value,
    };
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { dataSource: newDataSource },
    });
  };

  modalClose = () => {
    this.setState({
      modalVisible: false,
    });
  };

  handleUpload = fileList => {
    this.setState({
      uploading: true,
    });

    const fileData = new FormData();
    fileList.forEach(file => {
      fileData.append('file', file);
    });

    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/upload`,
      payload: fileData,
    }).then(res => {
      this.setState({
        uploading: false,
      });
      if (res.ok) {
        this.setState({
          visible: false,
        });
        this.fetchPageData();
        return null;
      }
      if (Array.isArray(res.datum) && !isEmpty(res.datum)) {
        createMessage({ type: 'error', description: res.reason || '????????????' });
        this.setState({
          failedList: res.datum,
        });
      } else {
        createMessage({ type: 'error', description: res.reason || '????????????,??????????????????' });
        this.toggleVisible();
      }
      return null;
    });
  };

  sortObj = (obj1, obj2) => {
    const a = obj1.sortNo;
    const b = obj2.sortNo;
    if (a > b) {
      return 1;
    }
    if (a < b) {
      return -1;
    }
    return 0;
  };

  render() {
    const {
      modalVisible,
      canEdit,
      canEditDet,
      confirmLoading,
      visible,
      failedList = [],
      uploading,
    } = this.state;
    const {
      loading,
      dispatch,
      dataSource,
      total,
      formData,
      searchForm,
      pageConfig = {},
    } = this.props;

    const { pageBlockViews = [] } = pageConfig;
    let columns = [];
    let searchBar = [];
    if (pageBlockViews && pageBlockViews.length > 0) {
      const { pageFieldViews = [] } = pageBlockViews[0];
      const pageFieldViewsSearch = pageBlockViews[1].pageFieldViews || [];

      columns = pageFieldViews
        .filter(item => item.visibleFlag === 1)
        .sort(this.sortObj)
        .map(item => {
          const columnsItem = {
            title: item.displayName,
            dataIndex: item.fieldKey,
            align: 'center',
            width: '20%',
          };

          if (item.fieldKey === 'courseStatus') {
            columnsItem.render = (value, rowData, key) => (
              <Switch
                checked={value === 'IN_USE'}
                checkedChildren="??????"
                unCheckedChildren="??????"
                onChange={e => {
                  dispatch({
                    type: `${DOMAIN}/changeCourseState`,
                    payload: { id: rowData.id, progStatus: e ? 'IN_USE' : 'NOT_USED' },
                  }).then(res => {
                    res && this.onCellChanged(key, e ? 'IN_USE' : 'NOT_USED', 'courseStatus');
                  });
                }}
              />
            );
          }

          return columnsItem;
        });

      searchBar = pageFieldViewsSearch
        .filter(item => item.visibleFlag === 1)
        .sort(this.sortObj)
        .map(item => {
          const columnsItem = {
            title: item.displayName,
            dataIndex: item.fieldKey,
            options: {
              initialValue: searchForm[item.fieldKey],
            },
          };

          if (item.fieldKey === 'courseNo') {
            columnsItem.dataIndex = 'keyword';
            columnsItem.options = {
              initialValue: searchForm.keyword,
            };
          }

          if (item.fieldKey === 'courseStatus') {
            columnsItem.tag = (
              <RadioGroup>
                <Radio value="IN_USE">??????</Radio>
                <Radio value="NOT_USED">??????</Radio>
                <Radio value="">??????</Radio>
              </RadioGroup>
            );
          }

          return columnsItem;
        });
    }

    const excelImportProps = {
      templateUrl: location.origin + `/template/courseTemplate.xlsx`, // eslint-disable-line
      option: {
        fileName: '??????????????????????????????',
        datas: [
          {
            sheetName: '????????????_??????????????????????????????', // ??????
            sheetFilter: [
              'courseNo',
              'courseName',
              'classHour',
              'credit',
              'courseStatusName',
              'errMsg',
            ], // ?????????
            sheetHeader: ['????????????', '????????????', '??????', '??????', '??????', '????????????'], // ???????????????
            columnWidths: [8, 8, 8, 8, 8, 8], // ?????? ?????????????????????
          },
        ],
      },
      controlModal: {
        visible,
        failedList,
        uploading,
      },
    };

    // console.log('----formData', formData);
    const tableProps = {
      rowKey: 'id',
      sortBy: 'id',
      // limit: stringUtils.queryURL('limit'),
      // offset: stringUtils.queryURL('offset'),
      sortDirection: 'DESC',
      scroll: {
        x: '40%',
        // y: 900,
      },
      columnsCache: DOMAIN,
      total,
      dataSource,
      loading: !!loading,
      expirys: 0,
      dispatch,
      showColumn: false,
      onRow: () => {},
      // rowSelection: {
      //   type: 'radio',
      // },
      onChange: filters => {
        this.fetchPageData(filters);
      },
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      enableDoubleClick: false,
      searchBarForm: [...searchBar],
      columns: [...columns],
      leftButtons: [
        {
          key: 'add',
          className: 'tw-btn-primary',
          icon: 'plus-circle',
          title: '??????',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({
              type: `${DOMAIN}/updateState`,
              payload: { formData: { courseStatus: 'IN_USE' } },
            });
            this.setState({
              modalVisible: true,
            });
          },
        },
        {
          key: 'edit',
          className: 'tw-btn-primary',
          title: '??????',
          loading: false,
          hidden: false,
          disabled: selectedRowKeys => selectedRowKeys.length !== 1,
          minSelections: 0,
          icon: 'form',
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({
              type: `${DOMAIN}/updateState`,
              payload: { formData: selectedRows[0] },
            });
            this.setState({
              modalVisible: true,
            });
          },
        },
        {
          key: 'excel',
          className: 'tw-btn-primary',
          title: 'EXCEL??????',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          icon: 'form',
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            this.setState({ visible: true });
          },
        },
        {
          key: 'delete',
          className: 'tw-btn-error',
          title: '??????',
          loading: false,
          hidden: false,
          disabled: selectedRowKeys => selectedRowKeys.length === 0,
          minSelections: 0,
          icon: 'form',
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({
              type: `${DOMAIN}/deleteHandle`,
              payload: { ids: selectedRowKeys.join(',') },
            });
          },
        },
      ],
    };

    // console.log('formData ->', formData);

    return (
      <PageHeaderWrapper title="????????????">
        <DataTable {...tableProps} />
        {/* -- modal -- */}
        <DetailModal
          visible={modalVisible}
          close={() => {
            this.modalClose();
          }}
        />
        <ExcelImportExport
          {...excelImportProps}
          closeModal={() => {
            this.setState({ visible: false });
          }}
          handleUpload={this.handleUpload}
        />
      </PageHeaderWrapper>
    );
  }
}

export default CourseList;
