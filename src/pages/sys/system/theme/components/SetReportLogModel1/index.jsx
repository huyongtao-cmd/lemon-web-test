/* eslint-disable eqeqeq */
/* eslint-disable no-param-reassign */
/* eslint-disable array-callback-return */
/* eslint-disable prefer-const */
/* eslint-disable react/no-unused-state */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import Title from '@/components/layout/Title';
import update from 'immutability-helper';
import { isEmpty, isNil } from 'ramda';

import { Button, Card, Form, Input, Select, TimePicker, Modal, Row, Col, InputNumber } from 'antd';
import classnames from 'classnames';
import FieldList from '@/components/layout/FieldList';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import EditableDataTable from '@/components/common/EditableDataTable';
import createMessage from '@/components/core/AlertMessage';
// import styles from './styles.less';
function arryDiff(arr1, arr2) {
  let newArr = [];

  let arr3 = arr1.concat(arr2); // 将arr1和arr2合并为arr3
  function isContain(value) {
    return arr1.indexOf(value) === -1 || arr2.indexOf(value) === -1;
  }
  newArr = arr3.filter(isContain);
  return newArr;
}

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};
const { Field } = FieldList;
@Form.create()
class SetReportLogModel1 extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {}

  refactorColumns = () => {
    const { dispatch, DOMAIN, systemProductDetail } = this.props;
    const { XAxis1 } = systemProductDetail;
    let columnsData = [];
    if (XAxis1.length !== 0) {
      XAxis1.map((item, i) => {
        if (i === 0) {
          columnsData.push({
            title: '',
            dataIndex: 'id',
            align: 'center',
            width: 100,
            render: (value, row, index) => <span>{value}</span>,
          });
        }
        columnsData.push({
          title: item,
          dataIndex: item,
          align: 'center',
          render: (value, row, index) => (
            <InputNumber
              className="x-fill-100"
              defaultValue={value}
              onBlur={this.onDataSourceCellChanged(index, item)}
            />
          ),
        });
      });
    }
    return columnsData;
  };

  // X轴的更改
  onXCellChanged = (rowIndex, rowField) => rowFieldValue => {
    const {
      dispatch,
      DOMAIN,
      systemProductDetail: { Xdata1, XAxis1, YAxis1, Ydata1, dataSource1 },
    } = this.props;
    const value = rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue;
    if (Xdata1.filter(item => item.labelName === value).length !== 0) {
      // const NewXdata1 = update(Xdata1, {
      //   [rowIndex]: {
      //     [rowField]: {
      //       $set: value,
      //     },
      //   },
      // });
      // dispatch({ type: `${DOMAIN}/updateState`, payload: { Xdata1: NewXdata1 } });
      createMessage({ type: 'warn', description: 'X轴标签不能重复' });
    } else {
      const NewXdata1 = update(Xdata1, {
        [rowIndex]: {
          [rowField]: {
            $set: value,
          },
        },
      });
      let X = [];
      NewXdata1.map(_ => {
        if (_.labelName !== '') X.push(_.labelName);
      });

      let temXAxis = [...X];
      let newData = [];
      if (YAxis1.length !== 0) {
        YAxis1.map(item => {
          let obj = {};
          temXAxis.map(_ => {
            obj.id = item;
            obj[_] = 0;
          });
          newData.push(obj);
        });
      }
      // if (value !== '') {
      //   temXAxis.push(value);
      //   let obj = {};
      //   obj[value] = 0;
      //   let temDataSource = [...dataSource1].map(_ => Object.assign({}, _, obj));
      console.log('这是X轴列表', temXAxis);
      console.log('这是X轴数据', NewXdata1.filter(_ => _.labelName !== ''));
      console.log('数据', newData);

      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          Xdata1: NewXdata1.filter(_ => _.labelName !== ''),
          XAxis1: temXAxis,
          dataSource1: newData,
        },
      });
    }
  };

  // Y轴的更改
  onYCellChanged = (rowIndex, rowField) => rowFieldValue => {
    const {
      dispatch,
      DOMAIN,
      systemProductDetail: { Ydata1, Xdata1, dataSource1 },
    } = this.props;
    const value = rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue;

    if (Ydata1.filter(item => item.labelName === value).length !== 0) {
      createMessage({ type: 'warn', description: 'Y轴标签不能重复' });
    } else {
      const NewYdata1 = update(Ydata1, {
        [rowIndex]: {
          [rowField]: {
            $set: value,
          },
        },
      }).filter(_ => _.labelName !== '');
      let Y = [];
      NewYdata1.map(_ => {
        Y.push(_.labelName);
      });
      let temYAxis = [...Y];
      let obj = {};
      console.log('这是NewYdata1', NewYdata1);
      Xdata1.map(_ => {
        obj.id = value;
        if (_.labelName !== '') obj[_.labelName] = 0;
      });
      if (value !== '') {
        dataSource1.push(obj);
      }

      console.log('这是Y轴列表', temYAxis);
      console.log('这是Y轴数据', NewYdata1);
      console.log('数据', dataSource1);

      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          Ydata1: NewYdata1,
          YAxis1: temYAxis,
          dataSource1,
        },
      });
    }
  };

  // 数据图标显示的数据
  onDataSourceCellChanged = (rowIndex, rowField) => rowFieldValue => {
    const {
      dispatch,
      DOMAIN,
      systemProductDetail: { dataSource1 },
    } = this.props;
    const value = Number(rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue);
    const newDtaSource = update(dataSource1, {
      [rowIndex]: {
        [rowField]: {
          $set: value,
        },
      },
    });
    dispatch({ type: `${DOMAIN}/updateState`, payload: { dataSource1: newDtaSource } });
  };

  render() {
    const {
      title,
      onCancel,
      onOk,
      dispatch,
      DOMAIN,
      systemProductDetail,
      form: { getFieldDecorator, setFieldsValue, getFieldValue, validateFieldsAndScroll },
      ...rest
    } = this.props;
    const { Xdata1, Ydata1, XAxis1, dataSource1 } = systemProductDetail;

    const modalOpts = {
      ...rest,
      title,
      maskClosable: false,
      centered: false,
      onCancel,
      onOk,
    };
    const XProps = {
      rowSelection: {},
      rowKey: 'labelName',
      sortBy: 'labelName',
      dataSource: Xdata1,
      showCopy: false,
      loading: false,
      size: 'small',
      onChange: filters => {},
      onAdd: newRow => {
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            Xdata1: update(Xdata1, {
              $push: [
                {
                  ...newRow,
                },
              ],
            }),
          },
        });
      },
      onDeleteItems: (selectedRowKeys, selectedRows) => {
        // labelName
        const newDataSource = Xdata1.filter(
          row => !selectedRowKeys.filter(keyValue => keyValue === row.labelName).length
        );
        const Source = dataSource1.map(item => {
          selectedRowKeys.map(_ => {
            delete item[_];
          });
          return item;
        });
        const arr = arryDiff(XAxis1, selectedRowKeys);
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            Xdata1: newDataSource,
            dataSource1: Source,
            XAxis1: arr,
          },
        });
      },

      columns: [
        {
          title: '序号',
          dataIndex: 'id',
          align: 'center',
          width: 20,
          render: (value, row, index) => <span>{index + 1}</span>,
        },
        {
          title: 'X轴标签',
          dataIndex: 'labelName',
          align: 'center',
          options: {
            rules: [
              {
                validator: (rule, value, callback) => {
                  // if (Xdata1.filter(item => item.labelName === value).length !== 0) {
                  //   // console.log('是否为空', value, isNil(value));
                  //   callback(['不能有相同']);
                  // }
                  // if (isNil(value) && value == '') {
                  //   callback(['不能为空']);
                  // } else {
                  // }
                },
              },
            ],
          },
          render: (value, row, index) => (
            <Input
              className="x-fill-100"
              defaultValue={value}
              onBlur={this.onXCellChanged(index, 'labelName')}
            />
          ),
        },
      ],
    };
    const YProps = {
      rowSelection: {},
      rowKey: 'labelName',
      sortBy: 'labelName',
      dataSource: Ydata1,
      showCopy: false,
      loading: false,
      size: 'small',
      onChange: filters => {},
      onAdd: newRow => {
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            Ydata1: update(Ydata1, {
              $push: [
                {
                  ...newRow,
                },
              ],
            }),
          },
        });
      },
      onDeleteItems: (selectedRowKeys, selectedRows) => {
        const newDataSource = Ydata1.filter(
          row => !selectedRowKeys.filter(keyValue => keyValue === row.labelName).length
        );
        const Source = [];
        dataSource1.map(item => {
          selectedRowKeys.map(_ => {
            if (item.id !== _) {
              if (Source.length === 0) {
                Source.push(item);
                return;
              }
              Source.map(row => {
                if (row.id !== _) {
                  Source.push(item);
                }
              });
            }
          });
        });
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            Ydata1: newDataSource,
            dataSource1: Source,
          },
        });
      },
      columns: [
        {
          title: '序号',
          dataIndex: 'id',
          align: 'center',
          width: 20,
          render: (value, row, index) => <span>{index + 1}</span>,
        },
        {
          title: 'Y轴标签',
          dataIndex: 'labelName',
          align: 'center',
          render: (value, row, index) => (
            <Input
              className="x-fill-100"
              defaultValue={value}
              onBlur={this.onYCellChanged(index, 'labelName')}
            />
          ),
        },
      ],
    };

    const dataProps = {
      rowSelection: false,
      rowKey: 'id',
      sortBy: 'id',
      dataSource: dataSource1,
      showCopy: false,
      loading: false,
      showAdd: false,
      showDelete: false,
      size: 'small',
      onChange: filters => {},
      columns: this.refactorColumns(),
    };
    return (
      <PageHeaderWrapper title={title}>
        <Modal {...modalOpts}>
          <Card className="tw-card-adjust" bordered={false}>
            {/* <Form {...formItemLayout}> */}
            <FieldList getFieldDecorator={getFieldDecorator} col={2}>
              <Field
                name="themeEnName"
                label="数据形式"
                labelCol={{ span: 6, xxl: 6 }}
                wrapperCol={{ span: 12, xxl: 12 }}
                decorator={{
                  initialValue: '1',
                }}
              >
                <Select>
                  <Select.Option value="1">柱状图</Select.Option>
                </Select>
              </Field>
            </FieldList>
          </Card>
          <Card className="tw-card-adjust" title={<Title text="数据源-x轴设置" />} bordered={false}>
            <div style={{ color: 'red' }}>*注意:先填完X轴再填Y轴；X轴数据新增时不能为空</div>
            <EditableDataTable {...XProps} />
          </Card>
          <Card className="tw-card-adjust" title={<Title text="数据源-Y轴设置" />} bordered={false}>
            <EditableDataTable {...YProps} />
          </Card>
          <Card className="tw-card-adjust" title={<Title text="数据维护" />} bordered={false}>
            {XAxis1.length !== 0 && <EditableDataTable {...dataProps} />}
          </Card>
          {/* <Card className="tw-card-adjust" title={<Title text="预料效果" />} bordered={false}>
            这是预览效果
          </Card> */}
        </Modal>
      </PageHeaderWrapper>
    );
  }
}

export default SetReportLogModel1;
