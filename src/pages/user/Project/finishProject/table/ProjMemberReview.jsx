import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Rate, Input, Row, Col } from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import DataTable from '@/components/common/DataTable';
import update from 'immutability-helper';
import { isEmpty } from 'ramda';

const DOMAIN = 'finishProjectFlow';

@connect(({ loading, finishProjectFlow, dispatch }) => ({
  loading,
  finishProjectFlow,
  dispatch,
}))
@mountToTab()
class ProjMemberReview extends Component {
  state = {
    expendKeys: [],
    flag: true,
  };

  // 行编辑触发事件
  onCellChanged = (rowIndex, rowField, children, fatherIndex) => rowFieldValue => {
    const {
      dispatch,
      finishProjectFlow: { evalInfoList },
    } = this.props;
    let newDataSource = evalInfoList;
    if (!children) {
      newDataSource = update(evalInfoList, {
        [rowIndex]: {
          [rowField]: {
            $set:
              rowFieldValue && rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue,
          },
        },
      });
    } else {
      const newEvalDEntities = update(evalInfoList[fatherIndex].evalDEntities, {
        [rowIndex]: {
          [rowField]: {
            $set:
              rowFieldValue && rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue,
          },
        },
      });
      newDataSource[fatherIndex].evalDEntities = newEvalDEntities;
    }

    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { evalInfoList: newDataSource },
    });
  };

  detailEntityTable = (record, fatherIndex, indent, expanded) => {
    const columns = [
      {
        title: '评价点',
        dataIndex: 'evalItemName',
        align: 'center',
        width: '19.8%',
      },
      {
        title: '评分',
        dataIndex: 'evalScore',
        align: 'center',
        width: '40.3%',
        render: (value, row, index) => (
          <Rate
            count={Number(row.scoreTo)}
            allowHalf
            value={Number(row.evalScore) || Number(row.defaultScore)}
            onChange={this.onCellChanged(index, 'evalScore', 'children', fatherIndex)}
          />
        ),
      },
      {
        title: '简评',
        dataIndex: 'evalComment',
        width: '39.9%',
        render: (value, row, index) => (
          <Row>
            <Col span={4} style={{ lineHeight: '32px', textAlign: 'right' }}>
              简评：
            </Col>
            <Col span={20}>
              <Input.TextArea
                autosize={{ minRows: 1, maxRows: 3 }}
                className="x-fill-100"
                value={row.evalComment || row.standardDesc}
                onChange={this.onCellChanged(index, 'evalComment', 'children', fatherIndex)}
              />
            </Col>
          </Row>
        ),
      },
    ];

    return (
      <Table
        rowKey="iden"
        style={{ marginLeft: '-8px', marginRight: '-8px' }}
        columns={columns}
        dataSource={record.evalDEntities}
        pagination={false}
        showHeader={false}
      />
    );
  };

  render() {
    const {
      loading,
      finishProjectFlow: { evalInfoList },
    } = this.props;

    const { flag, expendKeys } = this.state;

    if (!isEmpty(evalInfoList) && flag) {
      this.setState({
        expendKeys: [evalInfoList[0].iden],
        flag: false,
      });
    }

    const tableProps = {
      sortBy: 'id',
      rowKey: 'iden',
      columnsCache: DOMAIN,
      sortDirection: 'DESC',
      showColumn: false,
      loading: loading.effects[`${DOMAIN}/evalInfo`],
      dataSource: evalInfoList,
      expandedRowRender: this.detailEntityTable,
      expandedRowKeys: expendKeys,
      onExpand: (expanded, record) => {
        const tt = expendKeys;
        if (expanded) {
          tt.push(record.iden);
        } else {
          tt.splice(tt.indexOf(record.iden), 1);
        }
        this.setState({
          expendKeys: tt,
        });
      },
      onRow: () => {},
      showSearch: false,
      showExport: false,
      pagination: false,
      enableSelection: false,
      columns: [
        {
          title: '资源',
          dataIndex: 'evaledResInfo',
          align: 'center',
          width: '20%',
        },
        {
          title: '项目角色',
          dataIndex: 'role',
          align: 'center',
          width: '15%',
        },
        {
          title: '复核能力',
          dataIndex: 'capasetLevelName',
          align: 'center',
          width: '25%',
        },
        {
          title: '总评',
          dataIndex: 'evalComment',
          width: '40%',
          render: (value, row, index) => (
            <Row>
              <Col span={4} style={{ lineHeight: '32px', textAlign: 'right' }}>
                总评：
              </Col>
              <Col span={20}>
                <Input.TextArea
                  autosize={{ minRows: 1, maxRows: 3 }}
                  className="x-fill-100"
                  value={value}
                  onChange={this.onCellChanged(index, 'evalComment')}
                />
              </Col>
            </Row>
          ),
        },
      ],
    };

    return <DataTable {...tableProps} />;
  }
}

export default ProjMemberReview;
