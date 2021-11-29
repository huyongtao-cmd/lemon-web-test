/* eslint-disable no-nested-ternary */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {
  Input,
  Form,
  Button,
  Card,
  InputNumber,
  Divider,
  Radio,
  Switch,
  Row,
  Col,
  Upload,
  Icon,
} from 'antd';
import * as XLSX from 'xlsx';
import { mountToTab, closeThenGoto, markAsTab } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import EditableDataTable from '@/components/common/EditableDataTable';
import DataTable from '@/components/common/DataTable';
import classnames from 'classnames';
import { Selection, DatePicker } from '@/pages/gen/field';
import { formatMessage } from 'umi/locale';
import { fromQs, randomString } from '@/utils/stringUtils';
import Title from '@/components/layout/Title';
import { genFakeId, mul } from '@/utils/mathUtils';
import { isEmpty, isNil, indexOf, clone } from 'ramda';
import update from 'immutability-helper';
import createMessage from '@/components/core/AlertMessage';
import TopList from './components/TopList';
import Attach from '../../../../../public/template/topListDataTemplate.xlsx';

const { Field } = FieldList;

const RadioGroup = Radio.Group;

const DOMAIN = 'listTopMgmt';

@connect(({ loading, listTopMgmt, dispatch }) => ({
  listTopMgmt,
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
class listTopMgmtEdit extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { id } = fromQs();
    dispatch({ type: `${DOMAIN}/cleanFormData` }).then(res => {
      dispatch({
        type: `${DOMAIN}/queryUdcList`,
        payload: {
          code: 'COM:TOP_LIST_ITEM_TYPE',
        },
      });

      id &&
        dispatch({
          type: `${DOMAIN}/topListDetail`,
          payload: {
            id,
          },
        }).then(ress => {
          if (ress.dataSource !== 'SELF_DEF') {
            dispatch({
              type: `${DOMAIN}/getTopListDetail`,
              payload: {
                udcVal: ress.dataSource,
              },
            }).then(response => {
              dispatch({
                type: `${DOMAIN}/updateState`,
                payload: {
                  transformData: this.mockData(response),
                },
              });
            });
          } else {
            dispatch({
              type: `${DOMAIN}/updateState`,
              payload: {
                transformData: this.mockData(ress.list2),
              },
            });
          }
        });
    });
  }

  handleSubmit = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
      listTopMgmt: { searchForm, formData, getTopListByDataSource, customDataList, showTopList },
    } = this.props;

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        // ==========================榜单字段信息校验========================
        // 榜单字段信息必须要有数据，SORT_VAL只能有一个，至少有一个LABLE
        // 不为空
        if (isEmpty(getTopListByDataSource)) {
          createMessage({ type: 'warn', description: '榜单字段信息不能为空' });
          return;
        }
        // 只能用有一个SORT_VAL
        if (getTopListByDataSource.filter(v => v.type === 'SORT_VAL').length !== 1) {
          createMessage({ type: 'warn', description: '榜单字段信息只能包含一个排名值字段' });
          return;
        }
        // 至少要有一个LABLE
        if (!getTopListByDataSource.filter(v => v.type === 'LABEL').length) {
          createMessage({ type: 'warn', description: '榜单字段信息至少包含一个标签字段' });
          return;
        }
        // 榜单字段所有信息必填
        const tt = getTopListByDataSource.filter(v => isNil(v.field) || isNil(v.type));
        if (tt.length) {
          createMessage({ type: 'warn', description: '请补全榜单字段信息！' });
          return;
        }

        // 榜单字段信息字段名不能重复
        let repeatNum = 0;
        // eslint-disable-next-line no-restricted-syntax
        for (const item of getTopListByDataSource) {
          const repeatArr = getTopListByDataSource.filter(obj => obj.field === item.field);
          if (repeatArr.length >= 2) {
            repeatNum += 1;
            break;
          }
        }
        if (repeatNum) {
          createMessage({ type: 'warn', description: '榜单字段信息字段名不能重复！' });
          return;
        }

        // =========================榜单数据信息校验========================
        // 榜单数据中LABLE和SORT_VAL字段必填
        // 表格LABLE和SORT_VAL对应的字段
        // 只有自动以数据来源时才做检查
        if (formData.dataSource === 'SELF_DEF') {
          const tt1 = getTopListByDataSource
            .filter(v => v.type === 'SORT_VAL' || v.type === 'LABEL')
            .map(v => v.word);

          const a = tt1
            .map(item => {
              if (customDataList.filter(v => isNil(v[item]) || isEmpty(v[item])).length) {
                return true;
              }
              return false;
            })
            .filter(v => v);

          if (a.length) {
            createMessage({ type: 'warn', description: '请补全榜单数据必填信息！' });
            return;
          }
        }

        // =========================展示榜单信息校验========================
        // 不能为空
        if (isEmpty(showTopList)) {
          createMessage({ type: 'warn', description: '展示榜单数据不能为空！' });
          return;
        }
        // 榜单名称必填
        if (showTopList.filter(v => isNil(v.topListName) || isEmpty(v.topListName)).length) {
          createMessage({ type: 'warn', description: '请补全展示榜单中的榜单名称！' });
          return;
        }

        // 筛选条件一和筛选条件二要么全不填，要么全部填
        const noAllValue1 = showTopList.filter(
          v =>
            !(
              (v.filterName1 &&
                v.filterOperator1 &&
                v.filterValType1 &&
                !(isNil(v.filterVal1) || isEmpty(v.filterVal1))) ||
              (!v.filterName1 &&
                !v.filterOperator1 &&
                !v.filterValType1 &&
                (isNil(v.filterVal1) || isEmpty(v.filterVal1)))
            )
        );
        const noAllValue2 = showTopList.filter(
          v =>
            !(
              (v.filterName2 &&
                v.filterOperator2 &&
                v.filterValType2 &&
                !(isNil(v.filterVal2) || isEmpty(v.filterVal2))) ||
              (!v.filterName2 &&
                !v.filterOperator2 &&
                !v.filterValType2 &&
                (isNil(v.filterVal2) || isEmpty(v.filterVal2)))
            )
        );
        if (noAllValue1.length) {
          createMessage({
            type: 'warn',
            description: '展示榜单中筛选条件一必须填写完整或者全不填写！',
          });
          return;
        }

        if (noAllValue2.length) {
          createMessage({
            type: 'warn',
            description: '展示榜单中筛选条件二必须填写完整或者全不填写！',
          });
          return;
        }

        dispatch({
          type: `${DOMAIN}/submit`,
        }).then(response => {
          if (response.ok) {
            createMessage({ type: 'success', description: '保存成功' });
            closeThenGoto('/sys/system/ListTopMgmt?_refresh=0');
            dispatch({ type: `${DOMAIN}/query`, payload: searchForm });
          } else {
            createMessage({ type: 'error', description: response.reason || '操作失败' });
          }
        });
      }
    });
  };

  // 行编辑触发事件
  onCellChanged = (index, value, name) => {
    const {
      listTopMgmt: { getTopListByDataSource },
      dispatch,
    } = this.props;

    const newDataSource = getTopListByDataSource;
    newDataSource[index] = {
      ...newDataSource[index],
      [name]: value,
    };

    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { getTopListByDataSource: newDataSource },
    });

    // 根据数组list数据产生mock数据
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        transformData: this.mockData(newDataSource),
      },
    });
  };

  // 行编辑触发事件
  onCustomDataCellChanged = (index, value, name) => {
    const {
      listTopMgmt: { customDataList },
      dispatch,
    } = this.props;

    const newDataSource = clone(customDataList);
    newDataSource[index] = {
      ...newDataSource[index],
      [name]: value,
    };

    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { customDataList: newDataSource },
    });
  };

  // 行编辑触发事件
  onShowTopListCellChanged = (index, value, name) => {
    const {
      listTopMgmt: { showTopList },
      dispatch,
    } = this.props;

    const newDataSource = showTopList;
    newDataSource[index] = {
      ...newDataSource[index],
      [name]: value,
    };

    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { showTopList: newDataSource },
    });
  };

  // 表格行上移下移
  swapItems = (arr, index1, index2) => {
    // eslint-disable-next-line
    arr[index1] = arr.splice(index2, 1, arr[index1])[0];
    const tt = arr.map((v, index) => ({ ...v, sortNoTem: index + 1 }));
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        getTopListByDataSource: tt,
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

  // 生成展示数据
  mockData = (arr = []) => {
    const tt = [];
    for (let i = 0; i < 5; i += 1) {
      arr.forEach((item, indedx) => {
        tt[i] = {
          ...tt[i],
          [item.word]:
            item.type === 'SORT_NO'
              ? i + 1
              : item.type === 'SORT_VAL'
                ? ((5 - i) * 10).toFixed(2).replace(/\d{1,3}(?=(\d{3})+(\.\d*)?$)/g, '$&,')
                : item.type === 'LABEL'
                  ? `XXX${i + 1}`
                  : `XXX${i + 1}`,
          [item.field]:
            item.type === 'SORT_NO'
              ? i + 1
              : item.type === 'SORT_VAL'
                ? ((5 - i) * 10).toFixed(2).replace(/\d{1,3}(?=(\d{3})+(\.\d*)?$)/g, '$&,')
                : item.type === 'LABEL'
                  ? `XXX${i + 1}`
                  : `XXX${i + 1}`,
          id: genFakeId(-1),
          onlyKey: randomString(16),
        };
      });
    }
    return tt;
  };

  onImportExcel = file => {
    const {
      dispatch,
      listTopMgmt: { udcList, getTopListByDataSource, customDataList },
    } = this.props;
    let data = []; // 存储获取到的数据
    // 通过FileReader对象读取文件
    const fileReader = new FileReader();
    fileReader.readAsBinaryString(file); // 二进制
    fileReader.onload = event => {
      try {
        const { result } = event.target;
        // 以二进制流方式读取得到整份excel表格对象
        const workbook = XLSX.read(result, { type: 'binary' });
        // 遍历每张工作表进行读取（这里默认只读取第一张表）
        // eslint-disable-next-line no-restricted-syntax
        for (const sheet in workbook.Sheets) {
          // eslint-disable-next-line no-prototype-builtins
          if (workbook.Sheets.hasOwnProperty(sheet)) {
            // 利用 sheet_to_json 方法将 excel 转成 json 数据
            data = data.concat(XLSX.utils.sheet_to_json(workbook.Sheets[sheet]));
            // break; // 如果只取第一张表，就取消注释这行
          }
        }

        // excel表头信息，与UDC进行匹配
        const listFieldData = Object.entries(data[0])
          .map((v, i) => {
            const aa = udcList.filter(item => item.name === v[1]);
            if (aa.length) {
              return {
                field: v[0],
                id: genFakeId(-1),
                sortNoTem: i + 1,
                type: aa[0].code,
                typeName: aa[0].name,
                word: randomString(),
              };
            }
            return null;
          })
          .filter(v => !isNil(v))
          .map((v, i) => ({ ...v, sortNoTem: i + 1 }));

        // excel对应表头的表格数据
        const excelData = data.map((v, i) => (i > 0 ? v : null)).filter(v => !isNil(v));
        const tt = excelData.map((v, i) => {
          let obj = {};
          Object.entries(v).forEach((item, index) => {
            const aa = listFieldData.filter(item1 => item1.field === item[0]);
            const tt1 = aa[0];
            if (aa.length) {
              obj = { ...obj, [tt1.word]: item[1] };
            }
          });
          return { ...obj, groupNo: genFakeId(-1), onlyKey: randomString(16) };
        });

        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            getTopListByDataSourceDelList: getTopListByDataSource.map(v => v.id), // 全删
            getTopListByDataSource: listFieldData,
            customDataDelList: customDataList.map(v => v.groupNo), // 全删
            customDataList: tt,
          },
        });

        // 设置延迟再次更新数据，解决bizCharts提示Axis的name值不能change的错误
        setTimeout(() => {
          dispatch({
            type: `${DOMAIN}/updateState`,
            payload: {
              getTopListByDataSource: listFieldData,
              customDataList: tt,
            },
          });
        }, 0);
      } catch (e) {
        // 这里可以抛出文件类型错误不正确的相关提示
        createMessage({ type: 'error', description: '文件类型不正确' });
      }
    };
  };

  render() {
    const {
      dispatch,
      loading,
      form: { getFieldDecorator, setFieldsValue },
      listTopMgmt: {
        formData,
        getTopListByDataSource,
        getTopListByDataSourceDelList,
        transformData,
        customDataList,
        customDataDelList,
        showTopList,
        showTopDelList,
      },
    } = this.props;

    const submitBtn =
      loading.effects[`${DOMAIN}/submit`] ||
      loading.effects[`${DOMAIN}/topListDetail`] ||
      loading.effects[`${DOMAIN}/getTopListDetail`];

    const topListTableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'DESC',
      loading: false,
      pagination: false,
      dataSource: getTopListByDataSource,
      showSearch: false,
      showColumn: false,
      showExport: false,
      enableSelection: false,
      columns: [
        {
          title: '字段',
          dataIndex: 'field',
          align: 'center',
        },
        {
          title: '类型',
          dataIndex: 'typeName',
          align: 'center',
        },
      ],
    };

    const customTopListTableProps = {
      title: () => (
        <Row gutter={10}>
          <Col span={4}>
            <Button className="tw-btn-form" href={Attach} icon="download">
              下载模板
            </Button>
          </Col>
          <Col span={20}>
            <Upload
              name="excel"
              action=""
              listType="text"
              accept=".xlsx, .xls"
              beforeUpload={this.onImportExcel}
              showUploadList={false}
            >
              <Button className="tw-btn-primary" icon="upload">
                导入榜单数据
              </Button>
              &nbsp; &nbsp;
              <span style={{ color: 'red' }}>
                ※导入操作将会替换所有的榜单字段信息和榜单数据，请谨慎操作！
              </span>
            </Upload>
          </Col>
        </Row>
      ),
      sortBy: 'id',
      rowKey: 'id',
      loading: false,
      dataSource: getTopListByDataSource,
      showCopy: false,
      rowSelection: {
        type: 'radio',
      },
      onAdd: newRow => {
        // 更新数组list数据
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            getTopListByDataSource: update(getTopListByDataSource, {
              $push: [
                {
                  ...newRow,
                  id: genFakeId(-1),
                  word: randomString(),
                  field: null,
                  type: null,
                  sortNoTem: getTopListByDataSource.length + 1,
                },
              ],
            }),
          },
        });
      },
      onDeleteItems: (selectedRowKeys, selectedRows) => {
        const { word } = selectedRows[0];
        const newDataSource = getTopListByDataSource.filter(
          row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length
        );
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            getTopListByDataSource: newDataSource,
            getTopListByDataSourceDelList: [
              ...getTopListByDataSourceDelList,
              ...selectedRowKeys,
            ].filter(v => v > 0),
            customDataList: customDataList.map(v => {
              // eslint-disable-next-line no-param-reassign
              delete v[word];
              return v;
            }),
          },
        });
      },
      columns: [
        {
          title: '字段名',
          dataIndex: 'field',
          align: 'center',
          width: '40%',
          required: true,
          render: (value, row, index) => (
            <Input
              className="x-fill-100"
              value={value}
              onChange={e => {
                this.onCellChanged(index, e.target.value, 'field');
              }}
            />
          ),
        },
        {
          title: '类型',
          dataIndex: 'type',
          align: 'center',
          width: '40%',
          required: true,
          render: (value, row, index) => (
            <Selection.UDC
              className="x-fill-100"
              value={value}
              code="COM:TOP_LIST_ITEM_TYPE"
              showSearch
              onChange={e => {
                this.onCellChanged(index, e, 'type');
              }}
            />
          ),
        },
        {
          title: '顺序',
          dataIndex: 'sortNoTem',
          align: 'center',
          width: '20%',
        },
      ],
      buttons: [
        {
          key: 'up',
          title: '上移',
          className: 'tw-btn-primary',
          loading: false,
          hidden: false,
          disabled: selectedRowKeys => isEmpty(selectedRowKeys),
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows) => {
            let targetIndex;
            getTopListByDataSource.forEach((item, index) => {
              if (item.id === selectedRowKeys[0]) {
                targetIndex = index;
              }
            });
            this.upRecord(getTopListByDataSource, targetIndex);
          },
        },
        {
          key: 'down',
          title: '下移',
          className: 'tw-btn-primary',
          loading: false,
          hidden: false,
          disabled: selectedRowKeys => isEmpty(selectedRowKeys),
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows) => {
            let targetIndex;
            getTopListByDataSource.forEach((item, index) => {
              if (item.id === selectedRowKeys[0]) {
                targetIndex = index;
              }
            });
            this.downRecord(getTopListByDataSource, targetIndex);
          },
        },
      ],
    };

    // 榜单数据
    const customDataTableProps = {
      sortBy: 'groupNo',
      rowKey: 'groupNo',
      loading: false,
      dataSource: customDataList,
      showCopy: false,
      onAdd: newRow => {
        // 更新数组list数据
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            customDataList: update(customDataList, {
              $push: [
                {
                  ...newRow,
                  groupNo: genFakeId(-1),
                },
              ],
            }),
          },
        });
      },
      onDeleteItems: (selectedRowKeys, selectedRows) => {
        const newDataSource = customDataList.filter(
          row => !selectedRowKeys.filter(keyValue => keyValue === row.groupNo).length
        );
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            customDataList: newDataSource,
            customDataDelList: [...customDataDelList, ...selectedRowKeys].filter(v => v > 0),
          },
        });
      },
    };

    // 展示榜单
    const showTopListTableProps = {
      sortBy: 'topListDId',
      rowKey: 'topListDId',
      loading: false,
      dataSource: showTopList,
      showCopy: false,
      scroll: { x: 1850 },
      onAdd: newRow => {
        // 更新数组list数据
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            showTopList: update(showTopList, {
              $push: [
                {
                  ...newRow,
                  topListDId: genFakeId(-1),
                  showFlag: 'YES',
                },
              ],
            }),
          },
        });
      },
      onDeleteItems: (selectedRowKeys, selectedRows) => {
        const newDataSource = showTopList.filter(
          row => !selectedRowKeys.filter(keyValue => keyValue === row.topListDId).length
        );
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            showTopList: newDataSource,
            showTopDelList: [...showTopDelList, ...selectedRowKeys].filter(v => v > 0),
          },
        });
      },
      columns: [
        {
          title: '榜单名称',
          dataIndex: 'topListName',
          align: 'center',
          required: true,
          width: 200,
          render: (value, row, index) => (
            <Input
              className="x-fill-100"
              value={value}
              onChange={e => {
                this.onShowTopListCellChanged(index, e.target.value, 'topListName');
              }}
            />
          ),
        },
        {
          title: '筛选条件一',
          dataIndex: 'filter1',
          align: 'center',
          width: 700,
          render: (value, row, index) => (
            <Row gutter={8}>
              <Col span={8}>
                <Selection
                  className="x-fill-100"
                  source={getTopListByDataSource}
                  transfer={{ key: 'word', code: 'word', name: 'field' }}
                  showSearch
                  value={row.filterName1 || undefined}
                  onChange={e => {
                    this.onShowTopListCellChanged(index, e, 'filterName1');
                  }}
                  placeholder="请选择字段名"
                />
              </Col>
              <Col span={4}>
                <Selection.UDC
                  className="x-fill-100"
                  value={row.filterOperator1 || undefined}
                  code="COM:TOP_LIST_OPERATOR"
                  showSearch
                  onChange={e => {
                    this.onShowTopListCellChanged(index, e, 'filterOperator1');
                  }}
                  placeholder="比较符号"
                />
              </Col>
              <Col span={4}>
                <Selection.UDC
                  className="x-fill-100"
                  value={row.filterValType1 || undefined}
                  code="COM:VAL_TYPE"
                  showSearch
                  onChange={e => {
                    this.onShowTopListCellChanged(index, e, 'filterValType1');
                    this.onShowTopListCellChanged(index, null, 'filterVal1');
                  }}
                  placeholder="值类型"
                />
              </Col>
              <Col span={8}>
                {row.filterValType1 === 'CHAR' ? (
                  <Input
                    className="x-fill-100"
                    value={row.filterVal1}
                    onChange={e => {
                      this.onShowTopListCellChanged(
                        index,
                        !isNil(e.target.value) && !isEmpty(e.target.value)
                          ? e.target.value
                          : undefined,
                        'filterVal1'
                      );
                    }}
                  />
                ) : row.filterValType1 === 'NUM' ? (
                  <InputNumber
                    className="x-fill-100"
                    value={row.filterVal1}
                    onChange={e => {
                      this.onShowTopListCellChanged(
                        index,
                        !isNil(e) && !isEmpty(e) ? e : undefined,
                        'filterVal1'
                      );
                    }}
                  />
                ) : row.filterValType1 === 'DATE' ? (
                  <DatePicker
                    value={row.filterVal1}
                    onChange={e => {
                      this.onShowTopListCellChanged(index, e, 'filterVal1');
                    }}
                    format="YYYY-MM-DD"
                  />
                ) : (
                  <Input disabled type="text" placeholder="请先选择值类型" />
                )}
              </Col>
            </Row>
          ),
        },
        {
          title: '筛选条件二',
          dataIndex: 'filter2',
          align: 'center',
          width: 700,
          render: (value, row, index) => (
            <Row gutter={8}>
              <Col span={8}>
                <Selection
                  className="x-fill-100"
                  source={getTopListByDataSource}
                  transfer={{ key: 'word', code: 'word', name: 'field' }}
                  showSearch
                  value={row.filterName2 || undefined}
                  onChange={e => {
                    this.onShowTopListCellChanged(index, e, 'filterName2');
                  }}
                  placeholder="请选择字段名"
                />
              </Col>
              <Col span={4}>
                <Selection.UDC
                  className="x-fill-100"
                  value={row.filterOperator2 || undefined}
                  code="COM:TOP_LIST_OPERATOR"
                  showSearch
                  onChange={e => {
                    this.onShowTopListCellChanged(index, e, 'filterOperator2');
                  }}
                  placeholder="比较符号"
                />
              </Col>
              <Col span={4}>
                <Selection.UDC
                  className="x-fill-100"
                  value={row.filterValType2 || undefined}
                  code="COM:VAL_TYPE"
                  showSearch
                  onChange={e => {
                    this.onShowTopListCellChanged(index, e, 'filterValType2');
                    this.onShowTopListCellChanged(index, null, 'filterVal2');
                  }}
                  placeholder="值类型"
                />
              </Col>
              <Col span={8}>
                {row.filterValType2 === 'CHAR' ? (
                  <Input
                    className="x-fill-100"
                    value={row.filterVal2}
                    onChange={e => {
                      this.onShowTopListCellChanged(
                        index,
                        !isNil(e.target.value) && !isEmpty(e.target.value)
                          ? e.target.value
                          : undefined,
                        'filterVal2'
                      );
                    }}
                  />
                ) : row.filterValType2 === 'NUM' ? (
                  <InputNumber
                    className="x-fill-100"
                    value={row.filterVal2}
                    onChange={e => {
                      this.onShowTopListCellChanged(
                        index,
                        !isNil(e) && !isEmpty(e) ? e : undefined,
                        'filterVal2'
                      );
                    }}
                  />
                ) : row.filterValType2 === 'DATE' ? (
                  <DatePicker
                    value={row.filterVal2}
                    onChange={e => {
                      this.onShowTopListCellChanged(index, e, 'filterVal2');
                    }}
                    format="YYYY-MM-DD"
                  />
                ) : (
                  <Input disabled type="text" placeholder="请先选择值类型" />
                )}
              </Col>
            </Row>
          ),
        },
        {
          title: '是否显示',
          dataIndex: 'showFlag',
          align: 'center',
          width: 100,
          render: (value, row, index) => (
            <Switch
              checkedChildren="显示"
              unCheckedChildren="不显示"
              checked={value === 'YES'}
              onChange={(bool, e) => {
                const parmas = bool ? 'YES' : 'NO';
                this.onShowTopListCellChanged(index, parmas, 'showFlag');
              }}
            />
          ),
        },
        {
          title: '显示顺序',
          dataIndex: 'sortNo',
          align: 'center',
          width: 100,
          render: (value, row, index) => (
            <InputNumber
              className="x-fill-100"
              value={value}
              min={0}
              onChange={e => {
                this.onShowTopListCellChanged(index, e, 'sortNo');
              }}
            />
          ),
        },
      ],
    };

    let prescore = 0; // 预定义分数
    let ranking = 0; // 排名

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            icon="save"
            size="large"
            onClick={e => this.handleSubmit()}
            disabled={submitBtn}
          >
            保存
          </Button>

          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => {
              const { from } = fromQs();
              closeThenGoto(markAsTab(from));
            }}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>

        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={<Title icon="profile" text="榜单维护" />}
          bordered={false}
        >
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="dataSource"
              label="数据来源"
              decorator={{
                initialValue: formData.dataSource || undefined,
                rules: [
                  {
                    required: true,
                    message: '请选择数据来源',
                  },
                ],
              }}
            >
              <Selection.UDC
                code="COM:TOP_LIST_DATA_SOURCE"
                placeholder="请选择数据来源"
                onChange={e => {
                  dispatch({
                    type: `${DOMAIN}/updateForm`,
                    payload: {
                      layoutType: undefined,
                    },
                  });
                  setFieldsValue({
                    layoutType: undefined,
                  });
                  dispatch({
                    type: `${DOMAIN}/updateState`,
                    payload: {
                      showTopList: [],
                    },
                  });
                  if (e && e !== 'SELF_DEF') {
                    dispatch({
                      type: `${DOMAIN}/getTopListDetail`,
                      payload: {
                        udcVal: e,
                      },
                    }).then(res => {
                      dispatch({
                        type: `${DOMAIN}/updateState`,
                        payload: {
                          transformData: this.mockData(res),
                        },
                      });
                    });
                  } else {
                    dispatch({
                      type: `${DOMAIN}/updateState`,
                      payload: {
                        getTopListByDataSource: [],
                        transformData: [],
                      },
                    });
                  }
                }}
              />
            </Field>
            <Field
              name="layoutType"
              label="榜单形式"
              decorator={{
                initialValue: formData.layoutType || undefined,
                rules: [
                  {
                    required: true,
                    message: '请选择榜单形式',
                  },
                ],
              }}
            >
              <Selection.UDC code="COM:TOP_LIST_LAYOUT_TYPE" placeholder="请选择榜单形式" />
            </Field>
            <Field
              name="sortMethod"
              label="排名方式"
              decorator={{
                initialValue: formData.sortMethod || undefined,
                rules: [
                  {
                    required: true,
                    message: '请选择排名方式',
                  },
                ],
              }}
            >
              <RadioGroup>
                <Radio value="LARGE_TO_SMALL">从大到小</Radio>
                <Radio value="SMALL_TO_LARGE">从小到大</Radio>
              </RadioGroup>
            </Field>
            <Field
              name="defaultRank"
              label="默认显示名次数"
              decorator={{
                initialValue: formData.defaultRank || undefined,
                rules: [
                  {
                    required: true,
                    message: '请输入默认显示名次数',
                  },
                ],
              }}
            >
              <InputNumber className="x-fill-100" min={0} placeholder="请输入默认显示名次数" />
            </Field>
            <Field
              name="maxRank"
              label="最大显示名次数"
              decorator={{
                initialValue: formData.maxRank || undefined,
              }}
            >
              <InputNumber className="x-fill-100" min={0} placeholder="请输入最大显示名次数" />
            </Field>
            <Field
              name="publieEndDate"
              label="公示期截止日"
              decorator={{
                initialValue: formData.publieEndDate || undefined,
              }}
            >
              <DatePicker format="YYYY-MM-DD" />
            </Field>
          </FieldList>
          <br />
          <Divider dashed />

          {formData.dataSource === 'SELF_DEF' ? (
            <>
              <FieldList
                legend="榜单字段信息"
                layout="horizontal"
                getFieldDecorator={getFieldDecorator}
                col={2}
              >
                <EditableDataTable style={{ width: 800 }} {...customTopListTableProps} />
              </FieldList>
              <br />
              <Divider dashed />
              <FieldList
                legend="榜单数据"
                layout="horizontal"
                getFieldDecorator={getFieldDecorator}
                col={2}
              >
                <EditableDataTable
                  {...customDataTableProps}
                  columns={[
                    ...getTopListByDataSource.map((v, index) => ({
                      title: v.field,
                      dataIndex: v.word,
                      align: 'center',
                      required: v.type === 'SORT_VAL' || v.type === 'LABEL',
                      render: (value, row, indexs) =>
                        v.type === 'SORT_VAL' ? (
                          <InputNumber
                            className="x-fill-100"
                            value={value}
                            onChange={e => {
                              this.onCustomDataCellChanged(indexs, e, v.word);
                            }}
                            placeholder="请输入排名值"
                          />
                        ) : (
                          <Input
                            className="x-fill-100"
                            value={value}
                            onChange={e => {
                              this.onCustomDataCellChanged(indexs, e.target.value, v.word);
                            }}
                          />
                        ),
                    })),
                  ]}
                />
              </FieldList>
            </>
          ) : (
            <FieldList
              legend="榜单字段信息"
              layout="horizontal"
              getFieldDecorator={getFieldDecorator}
              col={2}
            >
              <DataTable style={{ width: '800px' }} {...topListTableProps} />
            </FieldList>
          )}

          <br />
          <Divider dashed />

          <FieldList
            legend="展示榜单"
            layout="horizontal"
            getFieldDecorator={getFieldDecorator}
            col={2}
            noReactive
          >
            <EditableDataTable {...showTopListTableProps} />
          </FieldList>

          <br />
          <Divider dashed />

          <FieldList
            legend="榜单预览"
            layout="horizontal"
            getFieldDecorator={getFieldDecorator}
            col={2}
          />
          <Card style={{ width: 800 }} bordered={false}>
            {formData.dataSource === 'SELF_DEF' &&
            customDataList.length &&
            getTopListByDataSource.length &&
            formData.layoutType &&
            getTopListByDataSource.filter(v => v.type === 'SORT_VAL').length ? (
              <TopList
                key={customDataList.length}
                item={{
                  ...formData,
                  list: customDataList
                    .map(v => ({ ...v, onlyKey: randomString(16) }))
                    .sort((a, b) => {
                      if (formData.sortMethod === 'LARGE_TO_SMALL') {
                        return (
                          b[getTopListByDataSource.filter(v => v.type === 'SORT_VAL')[0].word] -
                          a[getTopListByDataSource.filter(v => v.type === 'SORT_VAL')[0].word]
                        );
                      }
                      return (
                        a[getTopListByDataSource.filter(v => v.type === 'SORT_VAL')[0].word] -
                        b[getTopListByDataSource.filter(v => v.type === 'SORT_VAL')[0].word]
                      );
                    })
                    .slice(0, 5)
                    .map((item, index) => {
                      if (
                        item[getTopListByDataSource.filter(v => v.type === 'SORT_VAL')[0].word] ===
                        prescore
                      ) {
                        return { ...item, sort: ranking };
                      }
                      ranking += 1;
                      prescore =
                        item[getTopListByDataSource.filter(v => v.type === 'SORT_VAL')[0].word];
                      return { ...item, sort: ranking };
                    }),
                  list2: getTopListByDataSource,
                }}
              />
            ) : formData.dataSource !== 'SELF_DEF' &&
            transformData.length &&
            getTopListByDataSource.length &&
            formData.layoutType &&
            getTopListByDataSource.filter(v => v.type === 'SORT_VAL').length ? (
              <TopList
                key={customDataList.length}
                item={{
                  ...formData,
                  list: transformData
                    .sort((a, b) => {
                      if (formData.sortMethod === 'LARGE_TO_SMALL') {
                        return (
                          b[getTopListByDataSource.filter(v => v.type === 'SORT_VAL')[0].word] -
                          a[getTopListByDataSource.filter(v => v.type === 'SORT_VAL')[0].word]
                        );
                      }
                      return (
                        a[getTopListByDataSource.filter(v => v.type === 'SORT_VAL')[0].word] -
                        b[getTopListByDataSource.filter(v => v.type === 'SORT_VAL')[0].word]
                      );
                    })
                    .slice(0, 5)
                    .map((item, index) => {
                      if (
                        item[getTopListByDataSource.filter(v => v.type === 'SORT_VAL')[0].word] ===
                        prescore
                      ) {
                        return { ...item, sort: ranking };
                      }
                      ranking += 1;
                      prescore =
                        item[getTopListByDataSource.filter(v => v.type === 'SORT_VAL')[0].word];
                      return { ...item, sort: ranking };
                    }),
                  list2: getTopListByDataSource,
                }}
              />
            ) : (
              <div
                style={{
                  height: '100%',
                  width: '100%',
                  textAlign: 'center',
                  fontSize: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span>暂无数据</span>
              </div>
            )}
          </Card>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default listTopMgmtEdit;
