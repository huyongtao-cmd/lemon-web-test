import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { isEmpty, isNil, indexOf } from 'ramda';
import { Input, Radio, Divider, Row, InputNumber } from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import EditableDataTable from '@/components/common/EditableDataTable';
import { Selection } from '@/pages/gen/field';
import createMessage from '@/components/core/AlertMessage';
import { genFakeId } from '@/utils/mathUtils';
import update from 'immutability-helper';

const RadioGroup = Radio.Group;

const DOMAIN = 'prefCheckFlow';

@connect(({ loading, prefCheckFlow, dispatch }) => ({
  loading,
  prefCheckFlow,
  dispatch,
}))
@mountToTab()
class PrefCheckEdit extends PureComponent {
  // 行编辑触发事件
  onCheckGradeChanged = (index, value, name) => {
    const {
      prefCheckFlow: { gradeEntityList },
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
      prefCheckFlow: { pointEntityList },
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
      dispatch,
      form: { getFieldDecorator, setFieldsValue },
      prefCheckFlow: { formData, gradeEntityList, pointEntityList },
    } = this.props;

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
      </PageHeaderWrapper>
    );
  }
}

export default PrefCheckEdit;
