import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import classnames from 'classnames';
import { isEmpty, type, isNil, indexOf, findIndex, propEq } from 'ramda';
import { Button, Card, Form, Input, Radio, Divider, Row, Col, InputNumber, Switch } from 'antd';
import { mountToTab, closeThenGoto, markAsTab } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { formatMessage } from 'umi/locale';
import { Selection, DatePicker } from '@/pages/gen/field';
import createMessage from '@/components/core/AlertMessage';
import { createConfirm } from '@/components/core/Confirm';
import { genFakeId, add, mul } from '@/utils/mathUtils';
import { getUrl } from '@/utils/flowToRouter';
import { stringify } from 'qs';

const { Field, FieldLine } = FieldList;
const RadioGroup = Radio.Group;

const DOMAIN = 'benefitDistRule';
@connect(({ loading, benefitDistRule, dispatch, user }) => ({
  loading,
  benefitDistRule,
  dispatch,
  user,
}))
@Form.create({
  onValuesChange(props, changedValues) {
    if (!isEmpty(changedValues)) {
      props.dispatch({
        type: `${DOMAIN}/updateSearchForm`,
        payload: changedValues,
      });
    }
  },
})
@mountToTab()
class BenefitDistTempEdit extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;

    dispatch({ type: `${DOMAIN}/cleanList` }).then(res => {
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
                disabled={!row.disabled}
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
                        disabled={!row.disabled}
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
                        disabled={!row.disabled || value?.fieldBase === 'BALANCE'}
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
      benefitDistRule: {
        searchForm,
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
            initialValue: searchForm.busiFunctionId || undefined,
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
            initialValue: searchForm.templateId || undefined,
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
        <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={3}>
          {filterList}
        </FieldList>
      );
    }

    return '';
  };

  // 行编辑触发事件
  onCellChanged = (index, name, value, i) => {
    const {
      benefitDistRule: { proFitdistName },
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
      benefitDistRule: { benefitDistRuleList },
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
          benefitDistRule: { proFitdistName, objectProFitTemConList, benefitDistRuleList },
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
      benefitDistRule: { searchForm, benefitDistRuleList },
      dispatch,
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      if (!error) {
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

        dispatch({
          type: `${DOMAIN}/profitConditionSaveList`,
        }).then(response => {
          if (response.ok) {
            createMessage({ type: 'success', description: '操作成功' });
            this.fetchData();
          } else {
            createMessage({ type: 'error', description: response.reason || '操作失败' });
          }
        });
      }
    });
  };

  fetchData = params => {
    const {
      dispatch,
      benefitDistRule: { searchForm },
    } = this.props;
    const {
      id,
      tenantId,
      templateName,
      functionName,
      sortBy,
      sortDirection,
      selectedRowKeys,
      limit,
      offset,
      enabledFlag,
      busiFunctionId,
      templateId,
      ...newParmars
    } = searchForm;

    dispatch({
      type: `${DOMAIN}/query`,
      payload: {
        limit,
        offset,
        enabledFlag,
        busiFunctionId,
        templateId,
        selectMap: this.objToStrMap(newParmars),
      },
    });
  };

  objToStrMap = obj => {
    let strMap = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const k of Object.keys(obj)) {
      strMap = [...strMap, { [k]: obj[k] }];
    }
    return strMap;
  };

  render() {
    const {
      dispatch,
      loading,
      form: { getFieldDecorator, setFieldsValue },
      benefitDistRule: {
        searchForm,
        proFitdistName,
        objectProFitTemConColums,
        proFitdistNameColums,
        benefitDistRuleList,
      },
    } = this.props;

    const from = stringify({ from: getUrl() });

    // loading完成之前将按钮设为禁用
    const submitBtn =
      loading.effects[`${DOMAIN}/saveUpdateProConAndproFacRq`] ||
      loading.effects[`${DOMAIN}/query`];

    const benefitDistRuleTableProps = {
      sortBy: 'groupNo',
      rowKey: 'groupNo',
      loading: false,
      dataSource: benefitDistRuleList,
      showColumn: false,
      showExport: false,
      showSearch: false,
      scroll: {
        x:
          add(mul(proFitdistNameColums.length, 250), mul(objectProFitTemConColums.length, 370)) +
          200,
      },
      onChange: filters => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: { ...searchForm, ...filters },
        });
      },
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      searchForm,
      columns: [
        {
          title: '利益分配条件',
          children: !isEmpty(proFitdistNameColums)
            ? [
                ...proFitdistNameColums,
                {
                  title: '是否启用',
                  dataIndex: 'ENABLED_FLAG',
                  align: 'center',
                  width: 150,
                  render: (value, row, index) => (
                    <Switch
                      disabled={!row.disabled}
                      checkedChildren="已启用"
                      unCheckedChildren="未启用"
                      checked={value?.fieldValue === 'true'}
                      onChange={(bool, e) => {
                        const parmas = bool ? 'true' : 'false';
                        dispatch({
                          type: `${DOMAIN}/updateStatus`,
                          payload: { id: row.groupNo, state: parmas },
                        }).then(res => {
                          if (res.ok) {
                            benefitDistRuleList[index].ENABLED_FLAG = {
                              ...benefitDistRuleList[index].ENABLED_FLAG,
                              fieldValue: parmas,
                            };
                            dispatch({
                              type: `${DOMAIN}/updateState`,
                              payload: benefitDistRuleList,
                            });
                          }
                        });
                      }}
                    />
                  ),
                },
              ]
            : [],
        },
        {
          title: '利益分配对象及比例',
          children: objectProFitTemConColums,
        },
      ],
      leftButtons: [
        {
          key: 'search',
          icon: 'search',
          className: 'tw-btn-primary',
          title: '查询',
          loading: false,
          hidden: false,
          disabled: !searchForm.busiFunctionId || !searchForm.templateId,
          minSelections: 0,
          cb: (selectedRowKeyss, selectedRows, queryParams) => {
            this.fetchData();
          },
        },
        {
          key: 'add',
          icon: 'plus-circle',
          className: 'tw-btn-primary',
          title: formatMessage({ id: 'misc.insert', desc: '新增' }),
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push(`/plat/distInfoMgmt/distInfoMgmt/benefitDistRule/edit?${from}`);
          },
        },
        {
          key: 'edit',
          icon: 'form',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.update`, desc: '编辑' }),
          loading: false,
          hidden: false,
          disabled: selectedRows =>
            !searchForm.busiFunctionId ||
            !searchForm.templateId ||
            selectedRows.length !== 1 ||
            selectedRows.filter(v => v.activeFlag === '0').length,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const index = benefitDistRuleList.findIndex(v => v.groupNo === selectedRowKeys[0]);
            benefitDistRuleList[index].disabled = true;
            dispatch({
              type: `${DOMAIN}/updateState`,
              payload: benefitDistRuleList,
            });
          },
        },
        {
          key: 'remove',
          className: 'tw-btn-error',
          title: formatMessage({ id: `misc.delete`, desc: '删除' }),
          loading: false,
          hidden: false,
          disabled: selectedRows =>
            !searchForm.busiFunctionId ||
            !searchForm.templateId ||
            !selectedRows.length ||
            selectedRows.filter(v => v.activeFlag === '0').length,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({
              type: `${DOMAIN}/profitConditionDelete`,
              payload: { ids: selectedRowKeys.join(','), id: searchForm.id },
            }).then(res => {
              if (res.ok) {
                const newDataSource = benefitDistRuleList.filter(
                  row => !selectedRowKeys.filter(keyValue => keyValue === row.groupNo).length
                );
                dispatch({
                  type: `${DOMAIN}/updateState`,
                  payload: {
                    benefitDistRuleList: newDataSource,
                  },
                });
              }
            });
          },
        },
        {
          key: 'activeFlag',
          className: 'tw-btn-primary',
          title: '启用/不启用',
          loading: false,
          hidden: false,
          disabled: selectedRows =>
            !searchForm.busiFunctionId || !searchForm.templateId || selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const row = selectedRows[0];
            const index = benefitDistRuleList.findIndex(v => v.groupNo === selectedRowKeys[0]);

            const parmas = row?.ENABLED_FLAG?.fieldValue === 'false' ? 'true' : 'false';
            dispatch({
              type: `${DOMAIN}/updateStatus`,
              payload: { id: row.groupNo, state: parmas },
            }).then(res => {
              if (res.ok) {
                benefitDistRuleList[index].ENABLED_FLAG = {
                  ...benefitDistRuleList[index].ENABLED_FLAG,
                  fieldValue: parmas,
                };
                dispatch({
                  type: `${DOMAIN}/updateState`,
                  payload: benefitDistRuleList,
                });
              }
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
        </Card>

        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={<Title icon="profile" text="利益分配规则列表" />}
          bordered={false}
        >
          {this.renderPage()}
          <Divider dashed />
          <FieldList
            legend="利益分配条件"
            layout="horizontal"
            getFieldDecorator={getFieldDecorator}
            col={3}
          >
            {proFitdistName.map((v, i) => (
              <Field
                name={v.fieldEngName}
                label={v.fieldName}
                key={v.fieldEngName}
                decorator={{
                  initialValue: searchForm.fieldEngName || undefined,
                }}
              >
                <Selection
                  key={v.fieldEngName}
                  className="x-fill-100"
                  source={v.cdsUdcList}
                  transfer={{ key: 'udcTxt', code: 'udcTxt', name: 'fieldOptional' }}
                  dropdownMatchSelectWidth={false}
                  showSearch
                  onColumnsChange={value => {}}
                  placeholder={`请选择${v.fieldName}`}
                />
              </Field>
            ))}
            {!isEmpty(proFitdistName) ? (
              <Field
                name="enabledFlag"
                label="是否启用"
                key="enabledFlag"
                decorator={{
                  initialValue: searchForm.enabledFlag || undefined,
                }}
              >
                <RadioGroup>
                  <Radio value="true">已启用</Radio>
                  <Radio value="false">未启用</Radio>
                </RadioGroup>
              </Field>
            ) : null}
          </FieldList>

          <Divider dashed />

          <FieldList
            legend="利益分配规则"
            layout="horizontal"
            getFieldDecorator={() => {}}
            col={1}
            noReactive
          >
            <DataTable {...benefitDistRuleTableProps} />
          </FieldList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default BenefitDistTempEdit;
