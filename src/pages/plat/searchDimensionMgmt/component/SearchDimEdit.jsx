import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { equals, type, isEmpty } from 'ramda';
import { Form, Input, Modal, Radio } from 'antd';
import { Selection } from '@/pages/gen/field';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import EditableDataTable from '@/components/common/EditableDataTable';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';
import update from 'immutability-helper';
import { genFakeId } from '@/utils/mathUtils';
import { selectInternalOus } from '@/services/gen/list';

const { Field } = FieldList;
const RadioGroup = Radio.Group;

const DOMAIN = 'searchDimensionMgmt';

@connect(({ loading, dispatch, searchDimensionMgmt }) => ({
  loading,
  dispatch,
  searchDimensionMgmt,
}))
@Form.create({})
@mountToTab()
class searchDimAddModal extends PureComponent {
  constructor(props) {
    super(props);
    const { visible, selectId } = props;
    this.state = {
      visible,
      selectId,
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot !== null) {
      setTimeout(() => {
        this.setState({ visible: snapshot });
      }, 0);
    }
  }

  getSnapshotBeforeUpdate(prevProps, prevState, snapshot) {
    const { visible } = this.props;
    if (!equals(prevState.visible, visible)) {
      return visible;
    }
    return null;
  }

  toggleVisible = () => {
    const { visible } = this.state;
    this.setState({ visible: !visible });
  };

  handleSubmit = () => {
    const {
      form: { validateFieldsAndScroll },
      searchDimensionMgmt: { detailEditList },
      dispatch,
    } = this.props;

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        const tt = detailEditList.filter(v => !v.categoryDId);
        if (tt.length) {
          createMessage({ type: 'warn', description: '类别码必填' });
          return;
        }
        dispatch({
          type: `${DOMAIN}/SearchDimDEntity`,
          payload: detailEditList,
        }).then(response => {
          if (response && response.ok) {
            this.onChange();
          }
        });
      }
    });
  };

  onChange = values => {
    const { visible } = this.state;
    this.setState({ visible }, () => {
      const { onChange } = this.props;
      type(onChange) === 'Function' && onChange();
    });
  };

  // 表格行上移下移
  swapItems = (arr, index1, index2) => {
    // eslint-disable-next-line
    arr[index1] = arr.splice(index2, 1, arr[index1])[0];
    const tt = arr.map((v, index) => ({ ...v, dimNo: index + 1 }));
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        detailEditList: tt.map((v, index) => ({ ...v, dimNo: index + 1 })),
      },
    });
  };

  upRecord = (arr, index) => {
    if (index === 0) {
      return;
    }
    this.swapItems(arr, index, index - 1);
  };

  downRecord = (arr, index) => {
    if (index === arr.length - 1) {
      return;
    }
    this.swapItems(arr, index, index + 1);
  };

  onCellChanged = (index, value, name) => {
    const {
      searchDimensionMgmt: { detailEditList },
      dispatch,
    } = this.props;

    const newDataSource = detailEditList;
    newDataSource[index] = {
      ...newDataSource[index],
      [name]: value,
    };

    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { detailEditList: newDataSource },
    });
  };

  render() {
    const {
      loading,
      dispatch,
      searchDimensionMgmt: {
        pageConfig: { pageBlockViews = [] },
        detailEditList,
        dimDCatCodeList,
        formData,
      },
      form: { getFieldDecorator },
    } = this.props;
    const { visible, selectId } = this.state;

    if (!pageBlockViews || pageBlockViews.length < 1) {
      return <div />;
    }
    const currentListConfig = pageBlockViews.filter(v => v.blockPageName === '查询维度明细新增');
    const { pageFieldViews } = currentListConfig[0];
    const pageFieldJson = {};
    if (pageFieldViews) {
      pageFieldViews.forEach(field => {
        pageFieldJson[field.fieldKey] = field;
      });
    }
    const { dimNo = {}, categoryDId = {} } = pageFieldJson;

    const btnLoading =
      loading.effects[`${DOMAIN}/saveSearchDimEntity`] ||
      loading.effects[`${DOMAIN}/SearchDimDList`];

    const tableProps = {
      title: () => (
        <span style={{ color: '#284488', fontSize: '16px' }}>{formData.selectName || ''}</span>
      ),
      rowKey: 'id',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'DESC',
      loading: loading.effects[`${DOMAIN}/SearchDimDList`],
      dataSource: detailEditList,
      enableSelection: true,
      showSearch: false,
      showColumn: false,
      showExport: false,
      pagination: false,
      showCopy: false,
      onAdd: newRow => {
        // 更新数组list数据
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            detailEditList: update(detailEditList, {
              $push: [
                {
                  ...newRow,
                  id: genFakeId(-1),
                  searchDimId: selectId,
                  dimNo: detailEditList.length + 1,
                },
              ],
            }),
          },
        });
      },
      onDeleteItems: (selectedRowKeys, selectedRows) => {
        // 未保存新输入的数据,执行删除时前端执行假删除，后端接口直接删除。
        const newDataSource = detailEditList.filter(
          row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length
        );
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            detailEditList: newDataSource.map((v, index) => ({ ...v, dimNo: index + 1 })),
          },
        });
        // 如果有id为正的执行删除接口
        if (selectedRowKeys.filter(v => v > 0).length) {
          dispatch({
            type: `${DOMAIN}/SearchDimDDelete`,
            payload: { ids: selectedRowKeys.filter(v => v > 0).join(',') },
          });
        }
      },
      columns: [
        {
          title: (
            <span className={dimNo.requiredFlag && 'ant-form-item-required'}>
              {dimNo.displayName}
            </span>
          ),
          dataIndex: 'dimNo',
          align: 'center',
          width: 150,
          render: (val, row, index) => `第${val}维度`,
        },
        {
          title: (
            <span className={categoryDId.requiredFlag && 'ant-form-item-required'}>
              {categoryDId.displayName}
            </span>
          ),
          dataIndex: 'categoryDId',
          align: 'center',
          width: 100,
          render: (val, row, index) => (
            <Selection
              key="categoryDId"
              value={val}
              className="x-fill-100"
              source={dimDCatCodeList}
              transfer={{ key: 'id', code: 'id', name: 'showName' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
              placeholder={`请选择${categoryDId.displayName}`}
              onChange={e => {
                this.onCellChanged(index, e, 'categoryDId');
              }}
            />
          ),
        },
      ]
        .filter(Boolean)
        .sort((field1, field2) => field1.sortNo - field2.sortNo),
      buttons: [
        {
          key: 'up',
          title: '上移',
          className: 'tw-btn-primary',
          loading: false,
          hidden: false,
          disabled: selectedRowKeys => selectedRowKeys.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows) => {
            let targetIndex;
            detailEditList.forEach((item, index) => {
              if (item.id === selectedRowKeys[0]) {
                targetIndex = index;
              }
            });
            this.upRecord(detailEditList, targetIndex);
          },
        },
        {
          key: 'down',
          title: '下移',
          className: 'tw-btn-primary',
          loading: false,
          hidden: false,
          disabled: selectedRowKeys => selectedRowKeys.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows) => {
            let targetIndex;
            detailEditList.forEach((item, index) => {
              if (item.id === selectedRowKeys[0]) {
                targetIndex = index;
              }
            });
            this.downRecord(detailEditList, targetIndex);
          },
        },
      ],
    };

    return (
      <Modal
        title="查询维度明细"
        key="查询维度明细新增"
        visible={visible}
        onOk={() => {
          this.handleSubmit();
        }}
        onCancel={() => {
          this.onChange();
        }}
        confirmLoading={btnLoading}
        maskClosable={false}
        destroyOnClose
        width="60%"
        afterClose={() => {
          dispatch({
            type: `${DOMAIN}/updateState`,
            payload: {
              detailEditList: [],
            },
          });
        }}
      >
        <EditableDataTable {...tableProps} />
      </Modal>
    );
  }
}

export default searchDimAddModal;
