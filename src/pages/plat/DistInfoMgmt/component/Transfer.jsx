import React from 'react';
import { Icon, Row, Col, Table, Button } from 'antd';
import { equals, type } from 'ramda';

class Transfer extends React.Component {
  constructor(props) {
    super(props);
    const { data = {}, leftColumns = [], rightColumns = [] } = props;
    this.state = {
      data,
      selectedColRows: [],
      leftColumns,
      rightColumns,
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot !== null) {
      setTimeout(() => {
        this.setState({ data: snapshot });
      }, 0);
    }
  }

  getSnapshotBeforeUpdate(prevProps, prevState, snapshot) {
    const { data } = this.props;
    if (!equals(prevState.data, data)) {
      return data;
    }
    return null;
  }

  btnClick = data => {
    const { onChange } = this.props;
    type(onChange) === 'Function' && onChange(data);
  };

  render() {
    const {
      data: { leftData = [], rightData = [] },
      selectedColRows,
      leftColumns,
      rightColumns,
    } = this.state;

    const tableProps = {
      rowKey: 'id',
      dataSource: leftData,
      pagination: false,
      columns: leftColumns,
    };

    const selectedTableProps = {
      rowKey: 'id',
      dataSource: rightData,
      pagination: false,
      columns: [
        ...rightColumns,
        {
          title: '操作',
          dataIndex: 'age',
          align: 'center',
          render: (value, row, index) => (
            <Icon
              type="close"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                this.btnClick(rightData.filter(v => v.id !== row.id));
              }}
            />
          ),
        },
      ],
    };

    return (
      <Row type="flex" align="middle" style={{ flexWrap: 'nowrap' }}>
        <Col span={10}>
          <Table
            {...tableProps}
            rowSelection={{
              selectedRowKeys: selectedColRows.map(v => v.id),
              onChange: (selectedRowKeys, selectedRows) => {
                this.setState({
                  selectedColRows: selectedRows,
                });
              },
              getCheckboxProps: record => ({
                disabled: !!rightData.filter(v => v.id === record.id).length, // Column configuration not to be checked
                name: record.name,
              }),
            }}
          />
        </Col>
        <Button
          icon="caret-right"
          disabled={!selectedColRows.length}
          style={{ margin: '0 15px' }}
          onClick={() => {
            this.setState(
              {
                selectedColRows: [],
              },
              () => {
                this.btnClick(rightData.concat(selectedColRows));
              }
            );
          }}
        />
        <Col span={10}>
          <Table {...selectedTableProps} />
        </Col>
      </Row>
    );
  }
}

export default Transfer;
