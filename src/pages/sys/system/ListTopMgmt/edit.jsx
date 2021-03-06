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
        // ==========================????????????????????????========================
        // ???????????????????????????????????????SORT_VAL?????????????????????????????????LABLE
        // ?????????
        if (isEmpty(getTopListByDataSource)) {
          createMessage({ type: 'warn', description: '??????????????????????????????' });
          return;
        }
        // ??????????????????SORT_VAL
        if (getTopListByDataSource.filter(v => v.type === 'SORT_VAL').length !== 1) {
          createMessage({ type: 'warn', description: '???????????????????????????????????????????????????' });
          return;
        }
        // ??????????????????LABLE
        if (!getTopListByDataSource.filter(v => v.type === 'LABEL').length) {
          createMessage({ type: 'warn', description: '????????????????????????????????????????????????' });
          return;
        }
        // ??????????????????????????????
        const tt = getTopListByDataSource.filter(v => isNil(v.field) || isNil(v.type));
        if (tt.length) {
          createMessage({ type: 'warn', description: '??????????????????????????????' });
          return;
        }

        // ???????????????????????????????????????
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
          createMessage({ type: 'warn', description: '??????????????????????????????????????????' });
          return;
        }

        // =========================????????????????????????========================
        // ???????????????LABLE???SORT_VAL????????????
        // ??????LABLE???SORT_VAL???????????????
        // ??????????????????????????????????????????
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
            createMessage({ type: 'warn', description: '????????????????????????????????????' });
            return;
          }
        }

        // =========================????????????????????????========================
        // ????????????
        if (isEmpty(showTopList)) {
          createMessage({ type: 'warn', description: '?????????????????????????????????' });
          return;
        }
        // ??????????????????
        if (showTopList.filter(v => isNil(v.topListName) || isEmpty(v.topListName)).length) {
          createMessage({ type: 'warn', description: '??????????????????????????????????????????' });
          return;
        }

        // ??????????????????????????????????????????????????????????????????
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
            description: '?????????????????????????????????????????????????????????????????????',
          });
          return;
        }

        if (noAllValue2.length) {
          createMessage({
            type: 'warn',
            description: '?????????????????????????????????????????????????????????????????????',
          });
          return;
        }

        dispatch({
          type: `${DOMAIN}/submit`,
        }).then(response => {
          if (response.ok) {
            createMessage({ type: 'success', description: '????????????' });
            closeThenGoto('/sys/system/ListTopMgmt?_refresh=0');
            dispatch({ type: `${DOMAIN}/query`, payload: searchForm });
          } else {
            createMessage({ type: 'error', description: response.reason || '????????????' });
          }
        });
      }
    });
  };

  // ?????????????????????
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

    // ????????????list????????????mock??????
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        transformData: this.mockData(newDataSource),
      },
    });
  };

  // ?????????????????????
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

  // ?????????????????????
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

  // ?????????????????????
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

  // ??????????????????
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
    let data = []; // ????????????????????????
    // ??????FileReader??????????????????
    const fileReader = new FileReader();
    fileReader.readAsBinaryString(file); // ?????????
    fileReader.onload = event => {
      try {
        const { result } = event.target;
        // ???????????????????????????????????????excel????????????
        const workbook = XLSX.read(result, { type: 'binary' });
        // ????????????????????????????????????????????????????????????????????????
        // eslint-disable-next-line no-restricted-syntax
        for (const sheet in workbook.Sheets) {
          // eslint-disable-next-line no-prototype-builtins
          if (workbook.Sheets.hasOwnProperty(sheet)) {
            // ?????? sheet_to_json ????????? excel ?????? json ??????
            data = data.concat(XLSX.utils.sheet_to_json(workbook.Sheets[sheet]));
            // break; // ????????????????????????????????????????????????
          }
        }

        // excel??????????????????UDC????????????
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

        // excel???????????????????????????
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
            getTopListByDataSourceDelList: getTopListByDataSource.map(v => v.id), // ??????
            getTopListByDataSource: listFieldData,
            customDataDelList: customDataList.map(v => v.groupNo), // ??????
            customDataList: tt,
          },
        });

        // ???????????????????????????????????????bizCharts??????Axis???name?????????change?????????
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
        // ????????????????????????????????????????????????????????????
        createMessage({ type: 'error', description: '?????????????????????' });
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
          title: '??????',
          dataIndex: 'field',
          align: 'center',
        },
        {
          title: '??????',
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
              ????????????
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
                ??????????????????
              </Button>
              &nbsp; &nbsp;
              <span style={{ color: 'red' }}>
                ??????????????????????????????????????????????????????????????????????????????????????????
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
        // ????????????list??????
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
          title: '?????????',
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
          title: '??????',
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
          title: '??????',
          dataIndex: 'sortNoTem',
          align: 'center',
          width: '20%',
        },
      ],
      buttons: [
        {
          key: 'up',
          title: '??????',
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
          title: '??????',
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

    // ????????????
    const customDataTableProps = {
      sortBy: 'groupNo',
      rowKey: 'groupNo',
      loading: false,
      dataSource: customDataList,
      showCopy: false,
      onAdd: newRow => {
        // ????????????list??????
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

    // ????????????
    const showTopListTableProps = {
      sortBy: 'topListDId',
      rowKey: 'topListDId',
      loading: false,
      dataSource: showTopList,
      showCopy: false,
      scroll: { x: 1850 },
      onAdd: newRow => {
        // ????????????list??????
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
          title: '????????????',
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
          title: '???????????????',
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
                  placeholder="??????????????????"
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
                  placeholder="????????????"
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
                  placeholder="?????????"
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
                  <Input disabled type="text" placeholder="?????????????????????" />
                )}
              </Col>
            </Row>
          ),
        },
        {
          title: '???????????????',
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
                  placeholder="??????????????????"
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
                  placeholder="????????????"
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
                  placeholder="?????????"
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
                  <Input disabled type="text" placeholder="?????????????????????" />
                )}
              </Col>
            </Row>
          ),
        },
        {
          title: '????????????',
          dataIndex: 'showFlag',
          align: 'center',
          width: 100,
          render: (value, row, index) => (
            <Switch
              checkedChildren="??????"
              unCheckedChildren="?????????"
              checked={value === 'YES'}
              onChange={(bool, e) => {
                const parmas = bool ? 'YES' : 'NO';
                this.onShowTopListCellChanged(index, parmas, 'showFlag');
              }}
            />
          ),
        },
        {
          title: '????????????',
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

    let prescore = 0; // ???????????????
    let ranking = 0; // ??????

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
            ??????
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
            {formatMessage({ id: `misc.rtn`, desc: '??????' })}
          </Button>
        </Card>

        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={<Title icon="profile" text="????????????" />}
          bordered={false}
        >
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="dataSource"
              label="????????????"
              decorator={{
                initialValue: formData.dataSource || undefined,
                rules: [
                  {
                    required: true,
                    message: '?????????????????????',
                  },
                ],
              }}
            >
              <Selection.UDC
                code="COM:TOP_LIST_DATA_SOURCE"
                placeholder="?????????????????????"
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
              label="????????????"
              decorator={{
                initialValue: formData.layoutType || undefined,
                rules: [
                  {
                    required: true,
                    message: '?????????????????????',
                  },
                ],
              }}
            >
              <Selection.UDC code="COM:TOP_LIST_LAYOUT_TYPE" placeholder="?????????????????????" />
            </Field>
            <Field
              name="sortMethod"
              label="????????????"
              decorator={{
                initialValue: formData.sortMethod || undefined,
                rules: [
                  {
                    required: true,
                    message: '?????????????????????',
                  },
                ],
              }}
            >
              <RadioGroup>
                <Radio value="LARGE_TO_SMALL">????????????</Radio>
                <Radio value="SMALL_TO_LARGE">????????????</Radio>
              </RadioGroup>
            </Field>
            <Field
              name="defaultRank"
              label="?????????????????????"
              decorator={{
                initialValue: formData.defaultRank || undefined,
                rules: [
                  {
                    required: true,
                    message: '??????????????????????????????',
                  },
                ],
              }}
            >
              <InputNumber className="x-fill-100" min={0} placeholder="??????????????????????????????" />
            </Field>
            <Field
              name="maxRank"
              label="?????????????????????"
              decorator={{
                initialValue: formData.maxRank || undefined,
              }}
            >
              <InputNumber className="x-fill-100" min={0} placeholder="??????????????????????????????" />
            </Field>
            <Field
              name="publieEndDate"
              label="??????????????????"
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
                legend="??????????????????"
                layout="horizontal"
                getFieldDecorator={getFieldDecorator}
                col={2}
              >
                <EditableDataTable style={{ width: 800 }} {...customTopListTableProps} />
              </FieldList>
              <br />
              <Divider dashed />
              <FieldList
                legend="????????????"
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
                            placeholder="??????????????????"
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
              legend="??????????????????"
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
            legend="????????????"
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
            legend="????????????"
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
                <span>????????????</span>
              </div>
            )}
          </Card>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default listTopMgmtEdit;
