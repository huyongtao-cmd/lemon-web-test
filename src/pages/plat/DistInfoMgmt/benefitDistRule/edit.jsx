import React, { PureComponent } from 'react';
import { connect } from 'dva';
import classnames from 'classnames';
import { isEmpty, type, isNil, indexOf, findIndex, propEq } from 'ramda';
import {
  Button,
  Card,
  Form,
  Input,
  Radio,
  Divider,
  Row,
  Col,
  Table,
  InputNumber,
  Checkbox,
  Tooltip,
} from 'antd';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto, markAsTab } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import EditableDataTable from '@/components/common/EditableDataTable';
import { formatMessage } from 'umi/locale';
import { Selection, DatePicker } from '@/pages/gen/field';
import createMessage from '@/components/core/AlertMessage';
import { createConfirm } from '@/components/core/Confirm';
import { genFakeId, add, mul } from '@/utils/mathUtils';
import update from 'immutability-helper';
import moment from 'moment';

const { Field, FieldLine } = FieldList;
const RadioGroup = Radio.Group;

const DOMAIN = 'benefitDistRuleEdit';

@connect(({ loading, benefitDistRuleEdit, dispatch, user }) => ({
  loading,
  benefitDistRuleEdit,
  dispatch,
  user,
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
class BenefitDistTempEdit extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;

    dispatch({ type: `${DOMAIN}/cleanView` }).then(res => {
      dispatch({ type: `${DOMAIN}/functionList`, payload: { limit: 0 } });
      // 获取页面配置信息
      dispatch({
        type: `${DOMAIN}/getPageConfig`,
        payload: { pageNo: 'T_PROFITDIST_FUNCTION' },
      });
    });
  }

  // 动态生成表头
  createTableCol = id => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/profitConditionTableCol`,
      payload: { id },
    }).then(response => {
      const { objectProFitTemConList, proFitdistName } = response;
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          // 动态生成利益分配条件表头
          proFitdistNameColums: proFitdistName.map(v => ({
            title: v.fieldName,
            dataIndex: v.fieldEngName,
            align: 'center',
            width: 250,
            render: (value, row, index) => (
              <Selection
                className="x-fill-100"
                value={value?.fieldValue}
                source={v.cdsUdcList}
                dropdownMatchSelectWidth={false}
                showSearch
                transfer={{ key: 'udcTxt', code: 'udcTxt', name: 'fieldOptional' }}
                placeholder={`请选择${v.fieldName}`}
                onChange={e1 => {
                  this.onBenefitDistRuleCellChanged(index, e1, v.fieldEngName, 'fieldValue');
                  this.onBenefitDistRuleCellChanged(index, v.id, v.fieldEngName, 'fieldId');
                  this.onBenefitDistRuleCellChanged(index, 'CONDITION', v.fieldEngName, 'markType');
                  this.onBenefitDistRuleCellChanged(index, row?.groupNo, v.fieldEngName, 'groupNo');
                }}
              />
            ),
          })),
          // 动态生成利益分配对象及比例表头
          objectProFitTemConColums: objectProFitTemConList.map(v => ({
            title: v.profitFieldName,
            dataIndex: v.condEngName,
            align: 'center',
            width: 370,
            render: (value, row, index) => (
              <Row gutter={16} type="flex" align="middle">
                <Col span={14}>
                  <Row gutter={1} type="flex" align="middle">
                    <Col span={6}>基于</Col>
                    <Col span={18}>
                      <Selection.UDC
                        className="x-fill-100"
                        value={value?.fieldBase}
                        code="ACC:PROFIT_SHARE_BASE"
                        showSearch
                        onChange={e1 => {
                          this.onBenefitDistRuleCellChanged(index, e1, v.condEngName, 'fieldBase');
                          this.onBenefitDistRuleCellChanged(
                            index,
                            'ROLE',
                            v.condEngName,
                            'markType'
                          );
                          this.onBenefitDistRuleCellChanged(index, v.id, v.condEngName, 'fieldId');
                          this.onBenefitDistRuleCellChanged(
                            index,
                            row?.groupNo,
                            v.condEngName,
                            'groupNo'
                          );
                          // 选择余额时清空比例字段
                          if (e1 === 'BALANCE') {
                            this.onBenefitDistRuleCellChanged(
                              index,
                              null,
                              v.condEngName,
                              'fieldProportion'
                            );
                          }
                        }}
                      />
                    </Col>
                  </Row>
                </Col>
                <Col span={10}>
                  <Row gutter={1} type="flex" align="middle">
                    <Col span={8}>比例</Col>
                    <Col span={14}>
                      <InputNumber
                        className="x-fill-100"
                        min={0}
                        max={100}
                        step={0.1}
                        precision={2}
                        value={value?.fieldProportion}
                        disabled={value?.fieldBase === 'BALANCE'}
                        onChange={e1 => {
                          this.onBenefitDistRuleCellChanged(
                            index,
                            e1,
                            v.condEngName,
                            'fieldProportion'
                          );
                          this.onBenefitDistRuleCellChanged(
                            index,
                            row?.groupNo,
                            v.condEngName,
                            'groupNo'
                          );
                          this.onBenefitDistRuleCellChanged(
                            index,
                            'ROLE',
                            v.condEngName,
                            'markType'
                          );
                          this.onBenefitDistRuleCellChanged(index, v.id, v.condEngName, 'fieldId');
                        }}
                      />
                    </Col>
                    <Col span={2}>%</Col>
                  </Row>
                </Col>
              </Row>
            ),
          })),
        },
      });
    });
  };

  // 配置所需要的内容1
  renderPage = () => {
    const {
      dispatch,
      benefitDistRuleEdit: {
        formData,
        pageConfig: { pageBlockViews = [] },
        businessFunList,
        templateNameList,
      },
      form: { getFieldDecorator, setFieldsValue },
    } = this.props;

    if (!pageBlockViews || pageBlockViews.length < 1) {
      return <div />;
    }
    const currentListConfig = pageBlockViews.filter(v => v.blockPageName === '利益分配规则编辑');
    // 修改之前的可配置化
    const { pageFieldViews = [] } = currentListConfig[0];
    const pageFieldJson = {};
    if (pageFieldViews) {
      pageFieldViews.forEach(field => {
        pageFieldJson[field.fieldKey] = field;
      });
      const { busiFunctionId = {}, templateId = {}, activeFlag = {} } = pageFieldJson;
      const fields = [
        <Field
          name="busiFunctionId"
          label={busiFunctionId.displayName}
          key="busiFunctionId"
          decorator={{
            initialValue: formData.busiFunctionId || undefined,
            rules: [{ required: busiFunctionId.requiredFlag, message: '必填' }],
          }}
          sortNo={busiFunctionId.sortNo}
        >
          <Selection
            key="busiFunctionId"
            className="x-fill-100"
            source={businessFunList}
            transfer={{ key: 'id', code: 'id', name: 'functionName' }}
            dropdownMatchSelectWidth={false}
            showSearch
            onColumnsChange={value => {}}
            placeholder={`请选择${busiFunctionId.displayName}`}
            onChange={e => {
              if (e) {
                dispatch({
                  type: `${DOMAIN}/templateName`,
                  payload: {
                    id: e,
                  },
                });
              } else {
                dispatch({
                  type: `${DOMAIN}updateState`,
                  payload: {
                    templateNameList: [],
                  },
                });
              }
            }}
          />
        </Field>,
        <Field
          name="templateId"
          label={templateId.displayName}
          key="templateId"
          decorator={{
            initialValue: formData.templateId || undefined,
            rules: [{ required: templateId.requiredFlag, message: '必填' }],
          }}
          sortNo={templateId.sortNo}
        >
          <Selection
            key="templateId"
            className="x-fill-100"
            source={templateNameList}
            transfer={{ key: 'id', code: 'id', name: 'templateName' }}
            dropdownMatchSelectWidth={false}
            showSearch
            onColumnsChange={value => {}}
            placeholder={`请选择${templateId.displayName}`}
            onChange={e => {
              if (e) {
                this.createTableCol(e);
                dispatch({
                  type: `${DOMAIN}/queryDetail`,
                  payload: {
                    templateId: e,
                  },
                });
              } else {
                dispatch({
                  type: `${DOMAIN}updateState`,
                  payload: {
                    profitConditionTableCol: [],
                    profitFactorTableCol: [],
                  },
                });
              }
            }}
          />
        </Field>,
      ];

      const filterList = fields
        .filter(field => !field.key || pageFieldJson[field.key].visibleFlag === 1)
        .sort((field1, field2) => field1.props.sortNo - field2.props.sortNo);
      return (
        <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
          {filterList}
        </FieldList>
      );
    }

    return '';
  };

  // 行编辑触发事件
  onCellChanged = (index, name, value, i) => {
    const {
      benefitDistRuleEdit: { proFitdistName },
      dispatch,
    } = this.props;

    const newDataSource = proFitdistName;
    newDataSource[i].cdsUdcList[index][name] = value;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { proFitdistName: newDataSource },
    });
  };

  // 行编辑触发事件
  onBenefitDistRuleCellChanged = (index, value, objName, name) => {
    const {
      benefitDistRuleEdit: { benefitDistRuleList },
      dispatch,
    } = this.props;

    const newDataSource = benefitDistRuleList;
    newDataSource[index][objName] = { ...newDataSource[index][objName], [name]: value };
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { benefitDistRuleList: newDataSource },
    });
  };

  // 生成利益分配规则
  createproFitdist = () => {
    createConfirm({
      content: '生成的利益分配数据将直接追加到利益分配规则中，是否继续？',
      onOk: () => {
        const {
          benefitDistRuleEdit: { proFitdistName, objectProFitTemConList, benefitDistRuleList },
          dispatch,
        } = this.props;
        const proFitdistCondSelected = proFitdistName.map(v => ({
          ...v,
          cdsUdcList: v?.cdsUdcList?.filter(item => item?.checked),
        }));

        const array = this.getArrayByArrays(proFitdistCondSelected);
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            benefitDistRuleList: benefitDistRuleList.concat(array),
          },
        });
      },
    });
  };

  /**
   * 获取【二维数组】的【排列组合】
   */
  getArrayByArrays = arrays => {
    let arr = ['']; // 初始化第一个内层数组
    /**
     * 遍历外层数组
     */
    for (let index = 0; index < arrays.length; index += 1) {
      // console.log('外层数组索引 = ' + index);
      arr = this.getValuesByArray(arr, arrays[index]);
    }
    return arr;
  };

  getValuesByArray = (arr1, arr2) => {
    const newArr = [];
    /**
     * 遍历外层数组
     */
    for (let index = 0; index < arr1.length; index += 1) {
      const value1 = arr1[index];
      /**
       * 遍历内层数组
       */
      if (arr2?.cdsUdcList?.length) {
        for (let cursor = 0; cursor < arr2.cdsUdcList.length; cursor += 1) {
          const value2 = arr2.cdsUdcList[cursor];
          const obj = {};
          obj[arr2.fieldEngName] = {
            fieldValue: value2.udcTxt,
            markType: 'CONDITION',
            fieldId: arr2.id,
          };
          newArr.push({ ...value1, ...obj, groupNo: genFakeId(-1) });
        }
      } else {
        // 对arr2.cdsUdcList为空做兼容
        const obj = {};
        obj[arr2.fieldEngName] = {
          fieldValue: null,
          markType: 'CONDITION',
          fieldId: arr2.id,
        };
        newArr.push({ ...value1, ...obj, groupNo: genFakeId(-1) });
      }
    }
    return newArr;
  };

  // 保存提交
  handleSubmit = () => {
    const {
      form: { validateFieldsAndScroll, setFields },
      benefitDistRuleEdit: { searchForm, benefitDistRuleList },
      dispatch,
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        // const notFull = benefitDistRuleList.map(
        //   // v => Object.values(v).filter(obj => type(obj) === 'Object')
        //   // .map(item => Object.entries(item))
        //   // .map(item => item.filter(item1 => item1[0] === 'fieldProportion'))
        //   // .filter(item => !isEmpty(item))
        //   // .map(item => item.map(item1 => item1[1]))
        //   // .flat(3)
        // );
        const notFull = benefitDistRuleList
          .map(v =>
            Object.values(v)
              .filter(item => type(item) === 'Object')
              .filter(item => item.fieldBase)
          )
          .map(
            v =>
              v.filter(item => item.fieldBase === 'BALANCE').length === 1 ||
              (!isEmpty(v) &&
                v.reduce(
                  (acc, cur) => Number(acc.fieldProportion) + Number(cur.fieldProportion)
                ) === 100)
          );
        if (notFull.filter(v => v).length !== benefitDistRuleList.length) {
          createMessage({
            type: 'warn',
            description: (
              <pre style={{ textAlign: 'left' }}>
                {`利益分配规则第${notFull.findIndex(v => !v) +
                  1}条数据不符合数据规范。\n需满足以下任意一条：\n1、所有利益分配对象和比例之和为100%\n2、只有一个利益分配对象的【基于】为【余额】`}
              </pre>
            ),
          });
          return;
        }

        const { from } = fromQs();
        dispatch({
          type: `${DOMAIN}/profitConditionSave`,
        }).then(response => {
          if (response.ok) {
            createMessage({ type: 'success', description: '操作成功' });
            // closeThenGoto(markAsTab(from));
            // dispatch({ type: `benefitDistRuleEdit/query`, payload: searchForm });
          } else {
            createMessage({ type: 'error', description: response.reason || '操作失败' });
          }
        });
      }
    });
  };

  render() {
    const {
      dispatch,
      loading,
      form: { getFieldDecorator, setFieldsValue },
      benefitDistRuleEdit: {
        proFitdistName,
        objectProFitTemConColums,
        proFitdistNameColums,
        benefitDistRuleList,
        deleteList,
      },
    } = this.props;

    // loading完成之前将按钮设为禁用
    const submitBtn =
      loading.effects[`${DOMAIN}/saveUpdateProConAndproFacRq`] ||
      loading.effects[`${DOMAIN}/queryDetail`];

    const tableProps = {
      rowKey: 'id',
      dataSource: [],
      pagination: false,
      bordered: true,
      columns: [],
      scroll: { y: 400 },
    };

    const benefitDistRuleTableProps = {
      title: () => (
        <div style={{ color: 'red' }}>
          <div>每条规则的数据至少满足以下任一条件：</div>
          <div>1、所有利益分配对象和比例之和为100%</div>
          <div>2、只有一个利益分配对象的【基于】为【余额】</div>
        </div>
      ),
      sortBy: 'groupNo',
      rowKey: 'groupNo',
      loading: false,
      dataSource: benefitDistRuleList,
      scroll: {
        x:
          add(mul(proFitdistNameColums.length, 250), mul(objectProFitTemConColums.length, 370)) +
          50,
      },
      showCopy: false,
      onAdd: newRow => {
        // eslint-disable-next-line
        delete newRow.undefined;
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            benefitDistRuleList: update(benefitDistRuleList, {
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
        const newDataSource = benefitDistRuleList.filter(
          row => !selectedRowKeys.filter(keyValue => keyValue === row.groupNo).length
        );
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            benefitDistRuleList: newDataSource,
            deleteList: [...deleteList, ...selectedRowKeys],
          },
        });
      },
      columns: [
        {
          title: '利益分配条件',
          children: proFitdistNameColums,
        },
        {
          title: '利益分配对象及比例',
          children: objectProFitTemConColums,
        },
      ],
      leftButtons: [
        {
          key: 'reset',
          title: '初始化',
          className: 'tw-btn-primary',
          loading: false,
          hidden: false,
          disabled: !proFitdistName?.filter(
            v => v?.cdsUdcList && !isEmpty(v?.cdsUdcList?.filter(item => item.checked))
          ).length,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows) => {
            createConfirm({
              content: (
                <span style={{ color: 'red', fontSize: '18px', fontWeight: 'bolder' }}>
                  将按照选中的利益分配条件重新生成数据并替换掉当前数据，是否继续？
                </span>
              ),
              width: 660,
              onOk: () => {
                const proFitdistCondSelected = proFitdistName.map(v => ({
                  ...v,
                  cdsUdcList: v?.cdsUdcList?.filter(item => item?.checked),
                }));

                const array = this.getArrayByArrays(proFitdistCondSelected);
                dispatch({
                  type: `${DOMAIN}/updateState`,
                  payload: {
                    benefitDistRuleList: array,
                  },
                });
              },
            });
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            icon="save"
            size="large"
            onClick={this.handleSubmit}
            disabled={submitBtn}
          >
            {formatMessage({ id: `misc.save`, desc: '保存' })}
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
          title={<Title icon="profile" text="利益分配规则维护" />}
          bordered={false}
        >
          {this.renderPage()}
          <Divider dashed />
          <FieldList legend="利益分配条件" layout="horizontal" getFieldDecorator={() => {}} col={1}>
            <div
              ref={e => {
                this.boxHeight = e;
              }}
            >
              <Row type="flex" align="top" style={{ flexWrap: 'nowrap' }} gutter={12}>
                {proFitdistName.map((v, i) => (
                  <Col key={v.id} span={4}>
                    <Table
                      {...tableProps}
                      rowSelection={{
                        selectedRowKeys:
                          v.cdsUdcList &&
                          v.cdsUdcList
                            .filter(selectedCol => selectedCol.checked)
                            .map(selectedCol => selectedCol.id),
                        onChange: (selectedRowKeys, selectedRows) => {
                          v.cdsUdcList.forEach((vItem, vKey) => {
                            if (selectedRowKeys.includes(vItem.id)) {
                              this.onCellChanged(vKey, 'checked', true, i);
                            } else {
                              this.onCellChanged(vKey, 'checked', false, i);
                            }
                          });
                        },
                      }}
                      columns={[
                        {
                          title: v.fieldName,
                          dataIndex: v.fieldEngName,
                          align: 'center',
                          render: (val, row, index) =>
                            row.fieldOptional && row.fieldOptional.length > 6 ? (
                              <Tooltip placement="left" title={<pre>{row.fieldOptional}</pre>}>
                                <span>{`${row.fieldOptional.substr(0, 6)}...`}</span>
                              </Tooltip>
                            ) : (
                              <span>{row.fieldOptional}</span>
                            ),
                        },
                      ]}
                      dataSource={v.cdsUdcList}
                    />
                  </Col>
                ))}
                <Col
                  span={3}
                  style={{
                    marginTop: !isEmpty(proFitdistName)
                      ? this?.boxHeight?.clientHeight / 2 - 25
                      : 0,
                  }}
                >
                  <Button
                    className="tw-btn-primary"
                    style={{ margin: '0 15px', width: '150px', height: '50px' }}
                    disabled={
                      !proFitdistName?.filter(
                        v => v?.cdsUdcList && !isEmpty(v?.cdsUdcList?.filter(item => item.checked))
                      ).length
                    }
                    onClick={() => {
                      this.createproFitdist();
                    }}
                  >
                    生成利益分配规则
                  </Button>
                </Col>
              </Row>
            </div>
          </FieldList>
          <br />
          <Divider dashed />

          <FieldList
            legend="利益分配规则"
            layout="horizontal"
            getFieldDecorator={() => {}}
            col={1}
            noReactive
          >
            <EditableDataTable {...benefitDistRuleTableProps} />
          </FieldList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default BenefitDistTempEdit;
