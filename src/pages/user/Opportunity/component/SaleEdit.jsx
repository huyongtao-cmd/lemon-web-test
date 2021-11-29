import React, { PureComponent } from 'react';
import { Input, InputNumber, TreeSelect } from 'antd';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import update from 'immutability-helper';
import EditableDataTable from '@/components/common/EditableDataTable';
import SelectWithCols from '@/components/common/SelectWithCols';
import AsyncSelect from '@/components/common/AsyncSelect';
import { Selection } from '@/pages/gen/field';
import { fromQs } from '@/utils/stringUtils';
import { add, sub, div, genFakeId } from '@/utils/mathUtils';
import { isNil } from 'ramda';
import { commonCol } from '../config';

const DOMAIN = 'userOppsDetailsale';

@connect(({ loading, userOppsDetailsale, dispatch }) => ({
  loading,
  userOppsDetailsale,
  dispatch,
}))
class BuTemplateDetail extends PureComponent {
  state = {
    _selectedRowKeys: [],
    suppSource: [],
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const param = fromQs();
    dispatch({ type: `${DOMAIN}/query`, payload: { oppoId: param.id } });
    dispatch({ type: `${DOMAIN}/querySelectSupp` });
    // dispatch({ type: `${DOMAIN}/queryUdcSaleType1` });
    // dispatch({ type: `${DOMAIN}/queryUdcSaleType2` });
    // 页面可配置化
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'BUSINESS_EDIT_SALES_LIST' },
    });
    this.fetchData();

    // 产品列表
    dispatch({
      type: `${DOMAIN}/queryProdListFun`,
      payload: { offset: 0, limit: 999 },
    });

    // 产品大类
    dispatch({
      type: `${DOMAIN}/tree`,
    });
  }

  fetchData = () => {
    const {
      userOppsDetailsale: { suppList },
    } = this.props;
    this.setState({ suppSource: suppList });
  };

  // 销售大类 -> 销售小类
  // handleChangeType1 = (index, value) => {
  //   const { dispatch } = this.props;
  //   dispatch({
  //     type: `${DOMAIN}/updateSaleType2`,
  //     payload: { index, value },
  //   });
  // };

  // 行编辑触发事件
  onCellChanged = (index, value, name) => {
    const {
      userOppsDetailsale: { saleList },
      dispatch,
    } = this.props;

    const newDataSource = saleList;
    newDataSource[index] = {
      ...newDataSource[index],
      [name]: value,
    };
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { saleList: newDataSource },
    });
  };

  render() {
    const {
      loading,
      dispatch,
      userOppsDetail: { formData },
      userOppsDetailsale: {
        saleList,
        saleTotal,
        suppList,
        saleType1Source,
        saleType2Source,
        salePageConfig,
        prodList,
        treeData,
      },
    } = this.props;

    // 页面配置数据处理
    if (!salePageConfig.pageBlockViews || salePageConfig.pageBlockViews.length < 1) {
      return <div />;
    }
    const currentBlockConfig = salePageConfig.pageBlockViews[0];
    const { pageFieldViews } = currentBlockConfig;
    const pageFieldJson = {};
    pageFieldViews.forEach(field => {
      pageFieldJson[field.fieldKey] = field;
    });
    // console.log(pageFieldJson, 'pageFieldJson');

    const { _selectedRowKeys, suppSource } = this.state;
    const tableProps = {
      rowKey: 'id',
      loading: loading.effects[`${DOMAIN}/query`] || loading.effects[`${DOMAIN}/getPageConfig`],
      total: saleTotal,
      dataSource: saleList,
      showCopy: false,
      onAdd: newRow => {
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            saleList: update(saleList, {
              $push: [
                {
                  ...newRow,
                  id: genFakeId(-1),
                  oppoId: formData.id,
                  subTreeData: [],
                },
              ],
            }),
          },
        });
      },
      onDeleteItems: (selectedRowKeys, selectedRows) => {
        const newDataSource = saleList.filter(
          row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length
        );
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: { saleList: newDataSource },
        });
      },
      columns: [
        pageFieldJson.prodId.visibleFlag && {
          title: `${pageFieldJson.prodId.displayName}`,
          sortNo: `${pageFieldJson.prodId.sortNo}`,
          dataIndex: 'prodId',
          key: 'prodId',
          width: 250,
          fixed: 'left',
          required: !!pageFieldJson.prodId.requiredFlag,
          render: (value, row, index) => (
            <Selection
              key="prodId"
              value={value}
              className="x-fill-100"
              source={prodList}
              transfer={{ key: 'id', code: 'id', name: 'prodName' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onValueChange={v => {
                if (v) {
                  const { id, classId, subClassId, taxRate, prodName } = v;
                  this.onCellChanged(index, id, 'prodId');
                  this.onCellChanged(index, prodName, 'prodName');
                  this.onCellChanged(index, classId, 'classId');
                  this.onCellChanged(index, subClassId, 'subClassId');
                  this.onCellChanged(index, taxRate, 'saleTaxRate');
                  classId &&
                    dispatch({
                      type: `${DOMAIN}/subTree`,
                      payload: {
                        pId: classId,
                      },
                    }).then(res => {
                      this.onCellChanged(index, res, 'subTreeData');
                    });
                } else {
                  this.onCellChanged(index, null, 'prodId');
                  this.onCellChanged(index, null, 'classId');
                  this.onCellChanged(index, null, 'subClassId');
                  this.onCellChanged(index, [], 'subTreeData');
                  this.onCellChanged(index, null, 'saleTaxRate');
                }
              }}
              placeholder={`请选择${pageFieldJson.prodId.displayName}`}
              disabled={pageFieldJson.prodId.fieldMode === 'UNEDITABLE'}
            />
          ),
        },
        pageFieldJson.classId.visibleFlag && {
          title: `${pageFieldJson.classId.displayName}`,
          sortNo: `${pageFieldJson.classId.sortNo}`,
          dataIndex: 'classId',
          key: 'classId',
          width: 200,
          required: !!pageFieldJson.classId.requiredFlag,
          render: (value, row, index) => (
            <TreeSelect
              disabled={row.prodId}
              className="x-fill-100"
              dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              value={value}
              treeData={treeData}
              placeholder="请选择产品大类"
              onChange={e => {
                this.onCellChanged(index, e, 'classId');
                if (e) {
                  dispatch({
                    type: `${DOMAIN}/subTree`,
                    payload: {
                      pId: e,
                    },
                  }).then(res => {
                    this.onCellChanged(index, res, 'subTreeData');
                  });
                } else {
                  this.onCellChanged(index, [], 'subTreeData');
                }
              }}
            />
          ),
        },
        pageFieldJson.subClassId.visibleFlag && {
          title: `${pageFieldJson.subClassId.displayName}`,
          sortNo: `${pageFieldJson.subClassId.sortNo}`,
          dataIndex: 'subClassId',
          key: 'subClassId',
          width: 200,
          required: !!pageFieldJson.subClassId.requiredFlag,
          render: (value, row, index) => (
            <Selection
              disabled={row.prodId}
              value={value}
              className="x-fill-100"
              source={row.subTreeData || []}
              transfer={{ key: 'id', code: 'id', name: 'className' }}
              dropdownMatchSelectWidth={false}
              showSearch
              placeholder={`请选择${pageFieldJson.subClassId.displayName}`}
              onChange={e => {
                this.onCellChanged(index, e, 'subClassId');
              }}
            />
          ),
        },
        pageFieldJson.saleTaxedAmt.visibleFlag && {
          title: `${pageFieldJson.saleTaxedAmt.displayName}`,
          sortNo: `${pageFieldJson.saleTaxedAmt.sortNo}`,
          dataIndex: 'saleTaxedAmt',
          key: 'saleTaxedAmt',
          required: !!pageFieldJson.saleTaxedAmt.requiredFlag,
          render: (value, row, index) => (
            <InputNumber
              value={value}
              className="x-fill-100"
              max={999999999999}
              precision={2} // 小数点两位
              onChange={e => {
                this.onCellChanged(index, e, 'saleTaxedAmt');
                const { saleTaxedAmt, saleTaxRate, purNetAmt } = row;
                const tt =
                  saleTaxedAmt && !isNil(saleTaxRate)
                    ? div(+saleTaxedAmt * 100, add(100, +saleTaxRate)).toFixed(2)
                    : null;
                this.onCellChanged(index, tt, 'saleNetAmt');

                // const tt1 = sub(+tt, +purNetAmt).toFixed(2);
                // this.onCellChanged(index, tt1, 'effectiveAmt');
              }}
            />
          ),
        },
        pageFieldJson.saleTaxRate.visibleFlag && {
          title: `${pageFieldJson.saleTaxRate.displayName}`,
          sortNo: `${pageFieldJson.saleTaxRate.sortNo}`,
          dataIndex: 'saleTaxRate',
          key: 'saleTaxRate',
          width: 100,
          required: !!pageFieldJson.saleTaxRate.requiredFlag,
          render: (value, row, index) => (
            <InputNumber
              disabled={row.prodId}
              value={value}
              className="x-fill-100"
              min={0}
              max={100}
              onChange={e => {
                this.onCellChanged(index, e, 'saleTaxRate');
              }}
            />
          ),
        },
        pageFieldJson.saleNetAmt.visibleFlag && {
          title: `${pageFieldJson.saleNetAmt.displayName}`,
          sortNo: `${pageFieldJson.saleNetAmt.sortNo}`,
          dataIndex: 'saleNetAmt',
          key: 'saleNetAmt',
          align: 'right',
          width: 120,
          required: !!pageFieldJson.saleNetAmt.requiredFlag,
          render: (value, row, index) => (
            <InputNumber
              disabled={row.prodId}
              value={value}
              className="x-fill-100"
              max={999999999999}
              precision={2} // 小数点两位
              onChange={e => {
                this.onCellChanged(index, e, 'saleNetAmt');
              }}
            />
          ),
        }, // 销售项含税*100/(100+销售税率)
        pageFieldJson.purTaxedAmt.visibleFlag && {
          title: `${pageFieldJson.purTaxedAmt.displayName}`,
          sortNo: `${pageFieldJson.purTaxedAmt.sortNo}`,
          dataIndex: 'purTaxedAmt',
          key: 'purTaxedAmt',
          required: !!pageFieldJson.purTaxedAmt.requiredFlag,
          render: (value, row, index) => (
            <InputNumber
              value={value}
              className="x-fill-100"
              max={999999999999}
              precision={2} // 小数点两位
              onChange={e => {
                this.onCellChanged(index, e, 'purTaxedAmt');
                const { purTaxedAmt, purTaxRate, saleNetAmt } = row;
                const tt =
                  purTaxedAmt && !isNil(purTaxRate)
                    ? div(+purTaxedAmt * 100, add(100, +purTaxRate)).toFixed(2)
                    : null;
                this.onCellChanged(index, tt, 'purNetAmt');

                // const tt1 = sub(+tt, +saleNetAmt).toFixed(2);
                // this.onCellChanged(index, tt1, 'effectiveAmt');
              }}
            />
          ),
        },
        pageFieldJson.purTaxRate.visibleFlag && {
          title: `${pageFieldJson.purTaxRate.displayName}`,
          sortNo: `${pageFieldJson.purTaxRate.sortNo}`,
          dataIndex: 'purTaxRate',
          key: 'purTaxRate',
          width: 100,
          required: !!pageFieldJson.purTaxRate.requiredFlag,
          render: (value, row, index) => (
            <InputNumber
              disabled={row.prodId}
              value={value}
              className="x-fill-100"
              min={0}
              max={100}
              precision={2}
              onChange={e => {
                this.onCellChanged(index, e, 'purTaxRate');
              }}
            />
          ),
        },
        pageFieldJson.purNetAmt.visibleFlag && {
          title: `${pageFieldJson.purNetAmt.displayName}`,
          sortNo: `${pageFieldJson.purNetAmt.sortNo}`,
          dataIndex: 'purNetAmt',
          key: 'purNetAmt',
          align: 'right',
          width: 120,
          required: !!pageFieldJson.purNetAmt.requiredFlag,
          render: (value, row, index) => (
            <InputNumber
              disabled={row.prodId}
              value={value}
              className="x-fill-100"
              max={999999999999}
              precision={2} // 小数点两位
              onChange={e => {
                this.onCellChanged(index, e, 'purNetAmt');
              }}
            />
          ),
        }, // 采购项含税*100/(100+采购税率)
        pageFieldJson.effectiveAmt.visibleFlag && {
          title: `${pageFieldJson.effectiveAmt.displayName}`,
          sortNo: `${pageFieldJson.effectiveAmt.sortNo}`,
          dataIndex: 'effectiveAmt',
          key: 'effectiveAmt',
          align: 'right',
          width: 120,
          required: !!pageFieldJson.effectiveAmt.requiredFlag,
        },
        pageFieldJson.supplierId.visibleFlag && {
          title: `${pageFieldJson.supplierId.displayName}`,
          sortNo: `${pageFieldJson.supplierId.sortNo}`,
          dataIndex: 'supplierId',
          key: 'supplierId',
          width: 300,
          required: !!pageFieldJson.supplierId.requiredFlag,
          render: (value, row, index) => (
            <SelectWithCols
              // 选择框里展示的那个字段
              labelKey="name"
              value={{ name: row.supplierName, code: value }}
              columns={commonCol}
              dataSource={suppSource}
              onChange={v => {
                const newDataSource = update(saleList, {
                  [index]: {
                    supplierId: {
                      $set: v ? v.id : null,
                    },
                    supplierName: {
                      $set: v ? v.name : null,
                    },
                  },
                });
                dispatch({
                  type: `${DOMAIN}/updateState`,
                  payload: { saleList: newDataSource },
                });
                this.setState({ suppSource: suppList });
              }}
              selectProps={{
                trrigger: 'onBlur',
                showSearch: true,
                onSearch: v => {
                  this.setState({
                    suppSource:
                      suppList && suppList.length
                        ? suppList.filter(
                            d =>
                              (d.code && d.code.indexOf(v) > -1) ||
                              (d.name && d.name.toLowerCase().indexOf(v.toLowerCase()) > -1)
                          )
                        : [],
                  });
                },
                allowClear: true,
                style: { width: '100%' },
              }}
            />
          ),
        }, // 供应商下拉(T_SUPPLIER)
        pageFieldJson.remark.visibleFlag && {
          title: `${pageFieldJson.remark.displayName}`,
          sortNo: `${pageFieldJson.remark.sortNo}`,
          dataIndex: 'remark',
          key: 'remark',
          width: 300,
          required: !!pageFieldJson.remark.requiredFlag,
          render: (value, row, index) => (
            <Input
              defaultValue={value}
              maxLength={400}
              onChange={e => {
                this.onCellChanged(index, e.target.value, 'remark');
              }}
            />
          ),
        },
      ]
        .filter(Boolean)
        .sort((field1, field2) => field1.sortNo - field2.sortNo),
      buttons: [],
    };

    return (
      <div>
        <div className="tw-card-title">
          {formatMessage({ id: `user.management.oppo.sale`, desc: '销售清单' })}
        </div>
        <div style={{ margin: 12 }}>
          <EditableDataTable scroll={{ x: 2300 }} {...tableProps} />
        </div>
      </div>
    );
  }
}

export default BuTemplateDetail;
