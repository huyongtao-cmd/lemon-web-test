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
import FieldList from '@/components/layout/FieldList';
import { Button, Card, Form, Input, Select, TimePicker, Modal, Row, Col, InputNumber } from 'antd';
import classnames from 'classnames';
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

const { Field } = FieldList;
@Form.create()
class SetReportLogModel2 extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {}

  refactorColumns = () => {
    const { dispatch, DOMAIN, systemProductDetail } = this.props;
    const { XAxis2 } = systemProductDetail;
    let columnsData = [];
    if (XAxis2.length !== 0) {
      XAxis2.map((item, i) => {
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

  // // X轴的更改
  // onXCellChanged = (rowIndex, rowField) => rowFieldValue => {
  //   const {
  //     dispatch,
  //     DOMAIN,
  //     systemProductDetail: { Xdata2, XAxis2, dataSource2 },
  //   } = this.props;
  //   const value = rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue;
  //   if (Xdata2.filter(item => item.labelName === value).length !== 0) {
  //     const NewXdata2 = update(Xdata2, {
  //       [rowIndex]: {
  //         [rowField]: {
  //           $set: '',
  //         },
  //       },
  //     });
  //     dispatch({ type: `${DOMAIN}/updateState`, payload: { Xdata2: NewXdata2 } });
  //     createMessage({ type: 'warn', description: 'X轴标签不能重复' });
  //   } else {
  //     const NewXdata2 = update(Xdata2, {
  //       [rowIndex]: {
  //         [rowField]: {
  //           $set: value,
  //         },
  //       },
  //     });
  //     let temXAxis = [...XAxis2];
  //     temXAxis.push(value);
  //     let obj = {};
  //     obj[value] = 0;
  //     let temDataSource = [...dataSource2].map(_ => Object.assign({}, _, obj));
  //     dispatch({
  //       type: `${DOMAIN}/updateState`,
  //       payload: { Xdata2: NewXdata2, XAxis2: temXAxis, dataSource2: temDataSource },
  //     });
  //   }
  // };
  // X轴的更改
  onXCellChanged = (rowIndex, rowField) => rowFieldValue => {
    const {
      dispatch,
      DOMAIN,
      systemProductDetail: { Xdata2, XAxis2, YAxis2, Ydata2, dataSource2 },
    } = this.props;
    const value = rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue;
    if (Xdata2.filter(item => item.labelName === value).length !== 0) {
      // const NewXdata2 = update(Xdata2, {
      //   [rowIndex]: {
      //     [rowField]: {
      //       $set: value,
      //     },
      //   },
      // });
      // dispatch({ type: `${DOMAIN}/updateState`, payload: { Xdata2: NewXdata2 } });
      createMessage({ type: 'warn', description: 'X轴标签不能重复' });
    } else {
      const NewXdata2 = update(Xdata2, {
        [rowIndex]: {
          [rowField]: {
            $set: value,
          },
        },
      });
      let X = [];
      NewXdata2.map(_ => {
        if (_.labelName !== '') X.push(_.labelName);
      });

      let temXAxis = [...X];
      let newData = [];
      if (YAxis2.length !== 0) {
        YAxis2.map(item => {
          let obj = {};
          temXAxis.map(_ => {
            obj.id = item;
            obj[_] = 0;
          });
          newData.push(obj);
        });
      }
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          Xdata2: NewXdata2.filter(_ => _.labelName !== ''),
          XAxis2: temXAxis,
          dataSource2: newData,
        },
      });
    }
  };

  // // Y轴的更改
  // onYCellChanged = (rowIndex, rowField) => rowFieldValue => {
  //   const {
  //     dispatch,
  //     DOMAIN,
  //     systemProductDetail: { Ydata2, Xdata2, dataSource2 },
  //   } = this.props;
  //   const value = rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue;
  //   const NewYdata2 = update(Ydata2, {
  //     [rowIndex]: {
  //       [rowField]: {
  //         $set: value,
  //       },
  //     },
  //   });
  //   let obj = {};
  //   Xdata2.map(_ => {
  //     obj.id = value;
  //     obj[_.labelName] = 0;
  //   });
  //   dataSource2.push(obj);
  //   dispatch({ type: `${DOMAIN}/updateState`, payload: { Ydata2: NewYdata2, dataSource2 } });
  // };

  // Y轴的更改
  onYCellChanged = (rowIndex, rowField) => rowFieldValue => {
    const {
      dispatch,
      DOMAIN,
      systemProductDetail: { Ydata2, Xdata2, dataSource2 },
    } = this.props;
    const value = rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue;

    if (Ydata2.filter(item => item.labelName === value).length !== 0) {
      createMessage({ type: 'warn', description: 'Y轴标签不能重复' });
    } else {
      const NewYdata2 = update(Ydata2, {
        [rowIndex]: {
          [rowField]: {
            $set: value,
          },
        },
      }).filter(_ => _.labelName !== '');
      let Y = [];
      NewYdata2.map(_ => {
        Y.push(_.labelName);
      });
      let temYAxis = [...Y];
      let obj = {};
      Xdata2.map(_ => {
        obj.id = value;
        if (_.labelName !== '') obj[_.labelName] = 0;
      });
      if (value !== '') {
        dataSource2.push(obj);
      }
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          Ydata2: NewYdata2,
          YAxis2: temYAxis,
          dataSource2,
        },
      });
    }
  };

  onDataSourceCellChanged = (rowIndex, rowField) => rowFieldValue => {
    const {
      dispatch,
      DOMAIN,
      systemProductDetail: { dataSource2 },
    } = this.props;
    const value = rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue;
    const newDtaSource = update(dataSource2, {
      [rowIndex]: {
        [rowField]: {
          $set: value,
        },
      },
    });
    dispatch({ type: `${DOMAIN}/updateState`, payload: { dataSource2: newDtaSource } });
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
    const { Xdata2, Ydata2, XAxis2, dataSource2 } = systemProductDetail;
    // console.log('dataSource2', dataSource2);
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
      dataSource: Xdata2,
      showCopy: false,
      loading: false,
      size: 'small',
      onChange: filters => {},
      onAdd: newRow => {
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            Xdata2: update(Xdata2, {
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
        const newDataSource = Xdata2.filter(
          row => !selectedRowKeys.filter(keyValue => keyValue === row.labelName).length
        );
        const Source = dataSource2.map(item => {
          selectedRowKeys.map(_ => {
            delete item[_];
          });
          return item;
        });
        const arr = arryDiff(XAxis2, selectedRowKeys);
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            Xdata2: newDataSource,
            dataSource2: Source,
            XAxis2: arr,
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
      dataSource: Ydata2,
      showCopy: false,
      loading: false,
      size: 'small',
      onChange: filters => {},
      onAdd: newRow => {
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            Ydata2: update(Ydata2, {
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
        const newDataSource = Ydata2.filter(
          row => !selectedRowKeys.filter(keyValue => keyValue === row.labelName).length
        );
        const Source = [];
        dataSource2.map(item => {
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
            Ydata2: newDataSource,
            dataSource2: Source,
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
      dataSource: dataSource2,
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
            {XAxis2.length !== 0 && <EditableDataTable {...dataProps} />}
          </Card>
          {/* <Card className="tw-card-adjust" title={<Title text="预料效果" />} bordered={false}>
            这是预览效果
          </Card> */}
        </Modal>
      </PageHeaderWrapper>
    );
  }
}

export default SetReportLogModel2;
