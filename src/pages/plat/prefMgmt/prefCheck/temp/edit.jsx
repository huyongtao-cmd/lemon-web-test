import React, { PureComponent } from 'react';
import { connect } from 'dva';
import classnames from 'classnames';
import { isEmpty, isNil, indexOf } from 'ramda';
import { Button, Card, Form, Input, Radio, Divider, Row, InputNumber } from 'antd';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto, markAsTab } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import EditableDataTable from '@/components/common/EditableDataTable';
import { formatMessage } from 'umi/locale';
import { Selection, DatePicker } from '@/pages/gen/field';
import createMessage from '@/components/core/AlertMessage';
import { genFakeId, add } from '@/utils/mathUtils';
import update from 'immutability-helper';
import ScopeInput from '../../component/ScopeInput';

const { Field, FieldLine } = FieldList;
const RadioGroup = Radio.Group;

const DOMAIN = 'prefCheck';

@connect(({ loading, prefCheck, dispatch, user }) => ({
  loading,
  prefCheck,
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
class PrefCheckEdit extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { id } = fromQs();

    dispatch({ type: `${DOMAIN}/clean` }).then(res => {
      // 有id，修改
      id &&
        dispatch({
          type: `${DOMAIN}/queryDetail`,
          payload: {
            id,
          },
        });
    });
  }

  handleSubmit = () => {
    const {
      form: { validateFieldsAndScroll, setFields },
      prefCheck: { searchForm, gradeEntityList, pointEntityList },
      dispatch,
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        // ====================考核点数据校验=======================
        if (isEmpty(pointEntityList)) {
          createMessage({ type: 'warn', description: '至少要有一条考核点' });
          return;
        }
        if (!isEmpty(pointEntityList)) {
          // 考核点名称必填
          const noPointName = pointEntityList.filter(v => !v.pointName);
          if (noPointName.length) {
            createMessage({ type: 'warn', description: '请填写考核点名称' });
            return;
          }

          // 评分类型必填
          const noPointType = pointEntityList.filter(v => !v.poinType);
          if (noPointType.length) {
            createMessage({ type: 'warn', description: '请填写考核点评分类型' });
            return;
          }

          // 考核结果等级的等级名称不能重复
          let repeatNum = 0;
          // eslint-disable-next-line no-restricted-syntax
          for (const item of pointEntityList) {
            const repeatArr = pointEntityList.filter(obj => obj.pointName === item.pointName);
            if (repeatArr.length >= 2) {
              repeatNum += 1;
              break;
            }
          }
          if (repeatNum) {
            createMessage({ type: 'warn', description: '考核点名称不能重复' });
            return;
          }

          // 有多条考核点时权重必填，并且权重总和必须等于100%，排除一票否决项
          if (pointEntityList.filter(v => v.poinType !== '2' && v.poinType !== '3').length >= 2) {
            const tt = pointEntityList
              .filter(v => v.poinType !== '2' && v.poinType !== '3')
              .filter(v => isNil(v.weight));
            if (tt.length) {
              createMessage({ type: 'warn', description: '常规考核点权重必填' });
              return;
            }
            const allWeight = pointEntityList
              .filter(v => v.poinType !== '2')
              .reduce((x, y) => add(x, Number(y.weight)), 0);
            if (allWeight !== 100) {
              createMessage({ type: 'warn', description: '常规考核点权重总和必须等于100%' });
              return;
            }
          }
        }

        // ===================考核结果等级所有得分占比综合必须等于100%===================
        if (!isEmpty(gradeEntityList)) {
          // 考核结果等级所有信息必填
          const tt = gradeEntityList.filter(
            v => !v.gradeName || isNil(v.ratioStart) || isNil(v.ratio)
          );
          if (tt.length) {
            createMessage({ type: 'warn', description: '请补全考核结果等级所有必填信息' });
            return;
          }

          // 考核结果等级最后一条必须到达100%
          const lastRatio = gradeEntityList[gradeEntityList.length - 1].ratio;
          if (!isEmpty(gradeEntityList) && lastRatio !== 100) {
            createMessage({ type: 'warn', description: '考核结果等级最后一条必须到达100%' });
            return;
          }

          // 考核结果等级的等级名称不能重复
          let repeatNum = 0;
          // eslint-disable-next-line no-restricted-syntax
          for (const item of gradeEntityList) {
            const repeatArr = gradeEntityList.filter(obj => obj.gradeName === item.gradeName);
            if (repeatArr.length >= 2) {
              repeatNum += 1;
              break;
            }
          }
          if (repeatNum) {
            createMessage({ type: 'warn', description: '考核结果等级名称不能重复' });
            return;
          }
        }

        const { id, from } = fromQs();

        if (id) {
          dispatch({
            type: `${DOMAIN}/edit`,
          }).then(response => {
            if (response.ok) {
              createMessage({ type: 'success', description: '操作成功' });
              closeThenGoto(markAsTab(from));
              dispatch({ type: `prefCheck/query`, payload: searchForm });
            } else {
              createMessage({ type: 'error', description: response.reason || '操作失败' });
            }
          });
        } else {
          dispatch({
            type: `${DOMAIN}/save`,
          }).then(response => {
            if (response.ok) {
              createMessage({ type: 'success', description: '操作成功' });
              closeThenGoto(markAsTab(from));
              dispatch({ type: `prefCheck/query`, payload: searchForm });
            } else {
              createMessage({ type: 'error', description: response.reason || '操作失败' });
            }
          });
        }
      }
    });
  };

  // 行编辑触发事件
  onCheckGradeChanged = (index, value, name) => {
    const {
      prefCheck: { gradeEntityList },
      dispatch,
    } = this.props;

    const newDataSource = gradeEntityList;
    newDataSource[index] = {
      ...newDataSource[index],
      [name]: value,
    };
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { gradeEntityList: newDataSource },
    });
  };

  // 行编辑触发事件
  onCheckPointChanged = (index, value, name) => {
    const {
      prefCheck: { pointEntityList },
      dispatch,
    } = this.props;

    const newDataSource = pointEntityList;
    newDataSource[index] = {
      ...newDataSource[index],
      [name]: value,
    };

    // 切换评分类型导致只有一条常规评分类型，清除所有权重
    if (name === 'poinType' && newDataSource.filter(v => v.poinType === '1').length === 1) {
      const tt = newDataSource.map(v => ({ ...v, weight: null }));
      setTimeout(() => {
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: { pointEntityList: tt },
        });
      }, 100);
    } else {
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: { pointEntityList: newDataSource },
      });
    }
  };

  render() {
    const {
      loading,
      dispatch,
      form: { getFieldDecorator, setFieldsValue },
      prefCheck: { formData, gradeEntityList, pointEntityList },
    } = this.props;

    // loading完成之前将按钮设为禁用
    const submitBtn = loading.effects[`${DOMAIN}/submit`];
    const queryBtn = loading.effects[`${DOMAIN}/queryDetail`];
    const editBtn = loading.effects[`${DOMAIN}/edit`];

    const checkGradeTableProps = {
      title: () => <span style={{ color: 'red' }}>※ 得分占比: 考核综合得分占总分的比例</span>,
      sortBy: 'id',
      rowKey: 'id',
      loading: false,
      dataSource: gradeEntityList,
      showCopy: false,
      rowSelection: {
        type: 'radio',
      },
      onAdd: newRow => {
        // 考核结果等级最高分占比为100%
        if (!isEmpty(gradeEntityList) && gradeEntityList[gradeEntityList.length - 1].ratio >= 100) {
          createMessage({ type: 'warn', description: '考核结果等级最高得分占比已达到100%' });
          return;
        }
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            gradeEntityList: update(gradeEntityList, {
              $push: [
                {
                  ...newRow,
                  id: genFakeId(-1),
                  // 下一条得分占比开始值是上一条的结束值+1
                  // eslint-disable-next-line no-nested-ternary
                  ratioStart: isEmpty(gradeEntityList)
                    ? 0
                    : isNil(gradeEntityList[gradeEntityList.length - 1].ratio)
                      ? 0
                      : gradeEntityList[gradeEntityList.length - 1].ratio + 1,
                },
              ],
            }),
          },
        });
      },
      onDeleteItems: (selectedRowKeys, selectedRows) => {
        if (gradeEntityList.length !== 1) {
          // 第一条数据只能在所有数据被清除时删除
          // eslint-disable-next-line no-restricted-syntax
          for (const a of gradeEntityList) {
            if (a.id === selectedRowKeys[0] && indexOf(a, gradeEntityList) === 0) {
              createMessage({
                type: 'warn',
                description: '第一条数据只能在所有数据被清除时删除',
              });
              return;
            }
            // 当删除中间一条数据时，下一条数据得分占比开始值置为所删除行得分比开始值(最后一条数据除外)
            if (
              a.id === selectedRowKeys[0] &&
              indexOf(a, gradeEntityList) + 1 !== gradeEntityList.length
            ) {
              gradeEntityList[indexOf(a, gradeEntityList) + 1].ratioStart =
                gradeEntityList[indexOf(a, gradeEntityList)].ratioStart;
            }
          }
        }

        const newDataSource = gradeEntityList.filter(
          row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length
        );
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            gradeEntityList: newDataSource,
          },
        });
      },
      columns: [
        {
          title: '等级名称', // 初始化 填写
          dataIndex: 'gradeName',
          width: '35%',
          required: true,
          render: (value, row, index) => (
            <Input
              value={value}
              onChange={e => {
                this.onCheckGradeChanged(index, e.target.value, 'gradeName');
              }}
              placeholder="请输入等级名称"
            />
          ),
        },
        {
          title: '得分占比',
          dataIndex: 'ratio',
          width: '65%',
          required: true,
          render: (value, row, index) => (
            <Input.Group>
              <Row type="flex" align="middle" style={{ flexWrap: 'nowrap' }}>
                {index !== 0 ? (
                  <>
                    <InputNumber
                      style={{ flexGrow: 1 }}
                      onChange={e => {
                        this.onCheckGradeChanged(index, e, 'ratioStart');
                      }}
                      value={row.ratioStart}
                      min={0}
                      disabled
                    />
                    <span>%</span>
                    <span style={{ paddingLeft: 4, paddingRight: 4 }}>~</span>
                  </>
                ) : (
                  <>
                    <InputNumber
                      style={{
                        flexGrow: 1,
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: 'transparent',
                      }}
                      onChange={e => {
                        this.onCheckGradeChanged(index, e, 'ratioStart');
                      }}
                      value={row.ratioStart}
                      min={0}
                      max={100}
                      disabled
                    />
                    <span style={{ color: 'transparent' }}>%</span>
                    <span>≤ </span>
                  </>
                )}
                <InputNumber
                  style={{ flexGrow: 1 }}
                  onChange={e => {
                    if (e > 100) {
                      this.onCheckGradeChanged(index, 0, 'ratio');
                      createMessage({ type: 'warn', description: '得分占比不能超过100%' });
                      return;
                    }
                    this.onCheckGradeChanged(index, e || 0, 'ratio');
                    if (index < gradeEntityList.length - 1) {
                      this.onCheckGradeChanged(index + 1, e + 1 || 0, 'ratioStart');
                    }
                  }}
                  value={value}
                  min={row.ratioStart + 1 || 0}
                  max={100}
                />
                <span>%</span>
              </Row>
            </Input.Group>
          ),
        },
      ],
    };

    const checkPointTableProps = {
      sortBy: 'id',
      rowKey: 'id',
      loading: false,
      dataSource: pointEntityList,
      rowSelection: {
        selectedRowKeys: 0,
        onChange: (selectedRowKeys, selectedRows) => {},
      },
      onAdd: newRow => {
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            pointEntityList: update(pointEntityList, {
              $push: [
                {
                  ...newRow,
                  id: genFakeId(-1),
                  pointSource: 'SELF_DEF',
                },
              ],
            }),
          },
        });
      },
      onDeleteItems: (selectedRowKeys, selectedRows) => {
        const newDataSource = pointEntityList.filter(
          row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length
        );

        // 删除数据导致只有一条常规评分类型，则清除所有权重
        if (newDataSource.filter(v => v.poinType === '1').length === 1) {
          const tt = newDataSource.map(v => ({ ...v, weight: null }));
          dispatch({
            type: `${DOMAIN}/updateState`,
            payload: { pointEntityList: tt },
          });
        } else {
          dispatch({
            type: `${DOMAIN}/updateState`,
            payload: { pointEntityList: newDataSource },
          });
        }
      },
      onCopyItem: copied => {
        const newDataSource = copied.map(item => ({
          ...item,
          id: genFakeId(-1),
        }));
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: { pointEntityList: update(pointEntityList, { $push: newDataSource }) },
        });
      },
      columns: [
        {
          title: '考核点来源',
          dataIndex: 'pointSource',
          width: '20%',
          render: (value, row, index) => (
            <RadioGroup
              value={value}
              onChange={e => {
                this.onCheckPointChanged(index, e.target.value, 'pointSource');
                this.onCheckPointChanged(index, undefined, 'pointName');
              }}
            >
              <Row type="flex" align="middle" style={{ flexWrap: 'nowrap' }}>
                <Radio value="SELF_DEF">自定义</Radio>
                <Radio value="SYS">选择系统考评项</Radio>
              </Row>
            </RadioGroup>
          ),
        },
        {
          title: '考核点',
          dataIndex: 'pointName',
          required: true,
          width: '20%',
          render: (value, row, index) => {
            if (row.pointSource === 'SYS') {
              return (
                <Selection.UDC
                  className="x-fill-100"
                  value={value}
                  code="RES:SYS_EXAM_ITEMS"
                  showSearch
                  placeholder="请选择考核点"
                  onChange={e => {
                    this.onCheckPointChanged(index, e, 'pointName');
                  }}
                />
              );
            }

            if (row.pointSource === 'SELF_DEF') {
              return (
                <Input
                  value={value}
                  onChange={e => {
                    this.onCheckPointChanged(index, e.target.value, 'pointName');
                  }}
                  placeholder="请输入考核点"
                />
              );
            }
            return null;
          },
        },
        {
          title: '评分类型',
          dataIndex: 'poinType',
          width: '15%',
          required: true,
          render: (value, row, index) => (
            <Selection.UDC
              value={value}
              code="RES:GRADE_TYPE"
              placeholder="请选择评分类型"
              onChange={e => {
                this.onCheckPointChanged(index, e, 'poinType');
                this.onCheckPointChanged(index, null, 'weight');
              }}
            />
          ),
        },
        {
          title: '权重', // 初始化 填写
          dataIndex: 'weight',
          width: '15%',
          required: pointEntityList.filter(v => v.poinType === '1').length >= 2,
          render: (value, row, index) =>
            // 扣分制和一票否决制不输入权重，有多条常规考核点时才显示权重输入框
            // eslint-disable-next-line no-nested-ternary
            row.poinType === '2' || row.poinType === '3' ? null : pointEntityList.filter(
              v => v.poinType === '1'
            ).length >= 2 && row.poinType === '1' ? (
              <>
                <InputNumber
                  key={value}
                  value={value}
                  style={{ width: '80%' }}
                  onChange={e => {
                    this.onCheckPointChanged(index, e, 'weight');
                  }}
                  placeholder="请输入权重"
                />
                <span> %</span>
              </>
            ) : null,
        },
        {
          title: '评分标准',
          dataIndex: 'standardDesc',
          width: '25%',
          render: (value, row, index) => (
            <Input.TextArea
              value={value}
              onChange={e => {
                this.onCheckPointChanged(index, e.target.value, 'standardDesc');
              }}
              autosize={{ minRows: 1, maxRows: 3 }}
              placeholder="请输入评分标准"
            />
          ),
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
            disabled={submitBtn || editBtn || queryBtn}
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
          title={<Title icon="profile" text="绩效考核模板维护" />}
          bordered={false}
        >
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="tmplName"
              label="模板名称"
              decorator={{
                initialValue: formData.tmplName || '',
                rules: [
                  {
                    required: true,
                    message: '请输入模板名称',
                  },
                ],
              }}
            >
              <Input placeholder="请输入模板名称" />
            </Field>
            <Field
              name="evalScore"
              label="分数下限/上限"
              decorator={{
                initialValue: formData.evalScore || [],
                rules: [
                  { required: true, message: '请输入分数下限/上限' },
                  {
                    validator: (rule, value, callback) => {
                      const BEFORE = value[0];
                      const AFTER = value[1];
                      BEFORE < AFTER ? callback() : callback('分数上限必须大于分数下限');
                    },
                  },
                ],
              }}
            >
              <ScopeInput />
            </Field>

            <Field
              name="enabledFlag"
              label="是否启用"
              decorator={{
                initialValue: formData.enabledFlag || undefined,
              }}
            >
              <RadioGroup>
                <Radio value="YES">已启用</Radio>
                <Radio value="NO">未启用</Radio>
              </RadioGroup>
            </Field>
          </FieldList>
          <Divider dashed />

          <FieldList
            legend="考核点"
            layout="horizontal"
            getFieldDecorator={getFieldDecorator}
            col={2}
          >
            <EditableDataTable {...checkPointTableProps} />
          </FieldList>
          <Divider dashed />

          <FieldList
            legend="考核结果等级"
            layout="horizontal"
            getFieldDecorator={getFieldDecorator}
            col={2}
          >
            <EditableDataTable style={{ width: 700 }} {...checkGradeTableProps} />
          </FieldList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default PrefCheckEdit;
