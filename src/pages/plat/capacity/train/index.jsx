import React, { PureComponent } from 'react';
import { Button, Card, Divider, Table, Row, Col, Radio, Switch, Input, Tooltip } from 'antd';
import { connect } from 'dva';
import router from 'umi/router';
import Link from 'umi/link';
import DataTable from '@/components/common/DataTable';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DescriptionList from '@/components/layout/DescriptionList';
import TreeSearch from '@/components/common/TreeSearch';
import { Selection } from '@/pages/gen/field';
import createMessage from '@/components/core/AlertMessage';
import { mountToTab } from '@/layouts/routerControl';
import styles from './index.less';
import Modal from './modal';

const DOMAIN = 'platTrain';
const { Description } = DescriptionList;
const RadioGroup = Radio.Group;

@connect(({ loading, platTrain }) => ({
  loading: loading.effects[`${DOMAIN}/query`] || loading.effects[`${DOMAIN}/queryList`],
  platTrain,
}))
@mountToTab()
class CapaTrain extends PureComponent {
  state = {
    visible: false,
    selectedRow: {},
  };

  componentDidMount() {
    // this.fetchData();
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/clean`,
    });
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: {
        pageNo: 'TRAINING_PROG_LIST',
      },
    });
    dispatch({
      type: `${DOMAIN}/query`,
    });
    dispatch({
      type: `${DOMAIN}/getCapaUdcTree`,
    });
    dispatch({
      type: `${DOMAIN}/getCapaSetList`,
    });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/queryList`,
      payload: params,
    });
  };

  onCellChanged = (index, value, name) => {
    const {
      platTrain: { dataSource = [] },
      dispatch,
    } = this.props;

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

  onSelect = selectedKeys => {
    const {
      dispatch,
      platTrain: { formData },
    } = this.props;
    this.fetchData({ trainingClassId: selectedKeys[0] });
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { searchForm: { progStatus: 'IN_USE' } },
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

  // ????????????????????????
  toggleVislble = () => {
    const { visible } = this.state;
    this.setState({
      visible: !visible,
    });
  };

  render() {
    const { loading, dispatch, platTrain = {} } = this.props;
    const {
      dataSource = [],
      total = 0,
      searchForm = {},
      treeData = [],
      pageConfig = {},
      capaUdcTree = [],
      capaList = [],
      capaSetList = [],
      jobType2Data = [],
    } = platTrain;
    const { visible, selectedRow } = this.state;
    const { pageBlockViews = [] } = pageConfig;
    let columns = [];
    if (pageBlockViews && pageBlockViews.length > 0) {
      const { pageFieldViews = [] } = pageBlockViews[0];

      columns = pageFieldViews
        .filter(item => item.visibleFlag === 1)
        .sort(this.sortObj)
        .map(item => {
          const columnsItem = {
            title: item.displayName,
            dataIndex: item.fieldKey,
            align: 'center',
          };
          if (item.fieldKey === 'progName') {
            columnsItem.render = (value, rowData, key) => (
              <Link to={`/hr/capacity/train/detail?id=${rowData.id}`}>{value}</Link>
            );
          }
          if (item.fieldKey === 'entryType') {
            columnsItem.dataIndex = 'entryTypeName';
          }
          if (item.fieldKey === 'progStatus') {
            columnsItem.render = (value, rowData, key) => (
              <Switch
                checkedChildren="??????"
                unCheckedChildren="??????"
                checked={value === 'IN_USE'}
                onChange={e => {
                  dispatch({
                    type: `${DOMAIN}/changeCourseState`,
                    payload: { id: rowData.id, progStatus: e ? 'IN_USE' : 'NOT_USED' },
                  }).then(res => {
                    res && this.onCellChanged(key, e ? 'IN_USE' : 'NOT_USED', 'progStatus');
                  });
                }}
              />
            );
          }
          if (item.fieldKey === 'jobClass1') {
            columnsItem.dataIndex = 'jobClass1Name';
          }
          if (item.fieldKey === 'jobClass2') {
            columnsItem.dataIndex = 'jobClass2Name';
          }
          if (item.fieldKey === 'jobCapasetIds') {
            columnsItem.width = '20%';
            columnsItem.dataIndex = 'jobCapaSetNames';
            columnsItem.render = (val, row, index) =>
              val && val.length > 30 ? (
                <Tooltip placement="top" title={val}>
                  <span
                    style={{
                      display: 'inline-block',
                      width: '250px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {val}
                  </span>
                </Tooltip>
              ) : (
                <pre>{val}</pre>
              );
          }
          if (item.fieldKey === 'relevance') {
            columnsItem.width = '10%';
            columnsItem.render = (val, row, index) => (
              <span
                style={{ cursor: 'pointer', color: '#1890ff' }}
                onClick={() => {
                  this.toggleVislble();
                  this.setState({
                    selectedRow: row,
                  });
                }}
              >
                ????????????
              </span>
            );
          }
          return columnsItem;
        });
    }

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      dispatch,
      loading,
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
      // ??????????????????????????????????????????
      searchBarForm: [
        {
          title: '????????????',
          dataIndex: 'progName',
          options: {
            initialValue: searchForm.progName,
          },
        },
        {
          title: '????????????',
          dataIndex: 'entryType',
          options: {
            initialValue: searchForm.entryType,
          },
          tag: <Selection.UDC code="RES:TRN_REASON_TYPE" placeholder="?????????????????????" />,
        },
        {
          title: '????????????',
          dataIndex: 'jobClass',
          options: {
            initialValue: searchForm.jobClass,
          },
          tag: (
            <Input.Group className="tw-field-group" compact>
              <Selection.UDC
                className="tw-field-group-field"
                code="RES:JOB_TYPE1"
                placeholder="???????????????"
                value={searchForm.jobClass ? searchForm.jobClass[0] : undefined}
                onChange={v => {
                  dispatch({
                    type: `${DOMAIN}/updateSearchForm`,
                    payload: {
                      jobClass: [v, searchForm.jobClass ? searchForm.jobClass[1] : undefined],
                    },
                  });
                  dispatch({
                    type: `${DOMAIN}/getJob2`,
                    payload: v,
                  });
                }}
              />
              <Selection.Columns
                className="tw-field-group-field"
                source={jobType2Data || []}
                placeholder="???????????????"
                value={searchForm.jobClass ? searchForm.jobClass[1] : undefined}
                showSearch
                onChange={v => {
                  dispatch({
                    type: `${DOMAIN}/updateSearchForm`,
                    payload: {
                      jobClass: [searchForm.jobClass ? searchForm.jobClass[0] : undefined, v],
                    },
                  });
                }}
              />
            </Input.Group>
          ),
        },
        {
          title: '??????????????????',
          dataIndex: 'jobCapaSetId',
          options: {
            initialValue: searchForm.jobCapaSetId,
          },
          tag: (
            <Selection.Columns
              source={capaSetList || []}
              placeholder="???????????????????????????"
              showSearch
            />
          ),
        },
        // {
        //   title: '??????????????????',
        //   dataIndex: 'compoundAbilityId',
        //   options: {
        //     initialValue: searchForm.compoundAbilityId,
        //   },
        //   tag: (
        //     <Selection.Columns
        //       source={capaSetList || []}
        //       placeholder="???????????????????????????"
        //       showSearch
        //     />
        //   ),
        // },
        // {
        //   title: '??????????????????',
        //   dataIndex: 'singleAbilityId',
        //   options: {
        //     initialValue: searchForm.singleAbilityId,
        //   },
        //   tag: (
        //     <Input.Group className="tw-field-group" compact>
        //       <TreeSelect
        //         className="tw-field-group-field"
        //         treeData={Array.isArray(capaUdcTree) ? capaUdcTree : []}
        //         placeholder="??????"
        //         style={{
        //           maxWidth: '50%',
        //         }}
        //         onChange={v => {
        //           const catArray = v ? v.split('-') : [];
        //           const catParam = {};
        //           if (catArray && catArray.length === 1) {
        //             [catParam.cat1Code] = catArray;
        //           }
        //           if (catArray && catArray.length === 2) {
        //             [catParam.cat2Code, catParam.cat1Code] = catArray;
        //           }
        //           dispatch({
        //             type: `${DOMAIN}/getCapaList`,
        //             payload: {
        //               ...catParam,
        //             },
        //           });
        //         }}
        //       />
        //       <Selection
        //         style={{
        //           maxWidth: '50%',
        //         }}
        //         value={searchForm.singleAbilityId}
        //         className="tw-field-group-field"
        //         source={Array.isArray(capaList) ? capaList : []}
        //         placeholder="????????????"
        //         onChange={v => {
        //           dispatch({
        //             type: `${DOMAIN}/updateSearchForm`,
        //             payload: {
        //               singleAbilityId: v,
        //             },
        //           });
        //         }}
        //       />
        //     </Input.Group>
        //   ),
        // },
        {
          title: '??????',
          dataIndex: 'progStatus',
          options: {
            initialValue: searchForm.progStatus,
          },
          tag: (
            <RadioGroup>
              <Radio value="IN_USE">??????</Radio>
              <Radio value="NOT_USED">??????</Radio>
              <Radio value="">??????</Radio>
            </RadioGroup>
          ),
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
            router.push(`/hr/capacity/train/edit`);
          },
        },
        {
          key: 'edit',
          title: '??????',
          className: 'tw-btn-primary',
          icon: 'form',
          loading: false,
          hidden: false,
          disabled: selectedRowKeys => selectedRowKeys.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push(`/hr/capacity/train/edit?id=${selectedRowKeys[0]}`);
          },
        },
        {
          key: 'push',
          title: '??????',
          className: 'tw-btn-primary',
          icon: 'form',
          loading: false,
          hidden: false,
          disabled: selectedRowKeys => selectedRowKeys.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push(`/hr/capacity/train/push?id=${selectedRowKeys[0]}`);
          },
        },
        {
          key: 'delete',
          title: '??????',
          className: 'tw-btn-error',
          icon: 'form',
          loading: false,
          hidden: false,
          disabled: selectedRowKeys => selectedRowKeys.length === 0,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({
              type: `${DOMAIN}/deleteClass`,
              payload: {
                ids: selectedRowKeys.join(','),
              },
            });
          },
        },
      ],
      columns: [...columns],
    };

    return (
      <>
        <Row gutter={5} className={styles.trainListWrap}>
          <Col span={5} className={styles.trainListTree}>
            <TreeSearch
              showSearch
              placeholder="??????????????????"
              treeData={treeData}
              onSelect={this.onSelect}
              defaultExpandedKeys={treeData.map(item => `${item.id}`)}
            />
          </Col>
          <Col span={19} className={styles.trainListTable}>
            <DataTable {...tableProps} />
          </Col>
        </Row>
        {visible ? (
          <Modal closeModal={this.toggleVislble} selectedRow={selectedRow} visible={visible} />
        ) : null}
      </>
    );
  }
}

export default CapaTrain;
