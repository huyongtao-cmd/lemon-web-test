import React, { PureComponent } from 'react';
import { Button, Form, Card, Input, Switch, Upload, InputNumber } from 'antd';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import update from 'immutability-helper';
import classnames from 'classnames';
import { isEmpty } from 'ramda';

import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import FieldList from '@/components/layout/FieldList';
import Title from '@/components/layout/Title';
import EditableDataTable from '@/components/common/EditableDataTable';
import { genFakeId } from '@/utils/mathUtils';
import { editParam, addParam, delParam } from '@/utils/urlUtils';
import { Selection } from '@/pages/gen/field';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import { fromQs } from '@/utils/stringUtils';
import { selectReport } from '@/services/sys/system/report';
import { queryUdc } from '@/services/gen/app';

const DOMAIN = 'reportMgtEdit';
const { Field } = FieldList;

@connect(({ loading, reportMgtEdit, dispatch }) => ({
  loading,
  reportMgtEdit,
  dispatch,
}))
@Form.create({
  onValuesChange(props, changedValues, allValues) {
    if (isEmpty(changedValues)) return;
    props.dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: changedValues,
    });
  },
})
@mountToTab()
class ReportMgtEdit extends PureComponent {
  state = {
    fileList: [],
    udcData: [],
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const { id } = fromQs();
    dispatch({ type: `${DOMAIN}/clean` });
    queryUdc('TSK:SELECTOR_TYPE').then(({ response }) => this.setState({ udcData: response }));
    if (id) {
      dispatch({
        type: `${DOMAIN}/query`,
        payload: id,
      });
    } else {
      dispatch({
        type: `${DOMAIN}/baseUrl`,
      });
    }
  }

  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      reportMgtEdit: { formData, dataList },
      dispatch,
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/save`,
          payload: { formData, dataList },
        });
        // 报表上传
        const { fileList } = this.state;
        if (fileList.length) {
          const fileData = new FormData();
          fileList.forEach(file => {
            fileData.append('file', file);
          });
          dispatch({
            type: `${DOMAIN}/upload`,
            payload: fileData,
          });
        }
      }
    });
  };

  onCellChanged = (rowIndex, rowField) => rowFieldValue => {
    const {
      dispatch,
      reportMgtEdit: { formData, dataList, reportUrl },
    } = this.props;

    // 如果改变 [条件类型] 滞空 [条件定义]
    if (rowField === 'parameType') {
      dataList[rowIndex].parameDef = null;
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          dataList,
        },
      });
    }

    // 正常套路
    let value = null;
    if (rowField === 'showFlag') {
      value = rowFieldValue ? 'YES' : 'NO';
    } else {
      value = rowFieldValue && rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue;
    }

    // 如果改变 [条件定义] 带出 [特殊码]
    if (dataList[rowIndex].parameType === 'SELECTOR' && rowField === 'parameDef') {
      const { udcData } = this.state;
      const { sphd1 } = udcData.filter(v => v.code === value)[0];
      dataList[rowIndex]['sourceKey'] = sphd1;
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          dataList,
        },
      });
    }

    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        dataList: update(dataList, {
          [rowIndex]: {
            [rowField]: {
              $set: value,
            },
          },
        }),
      },
    });

    const val = rowFieldValue && rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue;

    // Key
    if (rowField === 'parameVar') {
      let url = reportUrl;
      dataList.forEach((v, i) => {
        const { parameVar, parameVal, showFlag } = v;
        if (showFlag === 'YES') {
          if (i === rowIndex) {
            url = addParam(url, val, parameVal);
          } else {
            url = addParam(url, parameVar, parameVal);
          }
        }
      });
      dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: {
          reportUrl: url,
        },
      });
    }
    // value
    if (rowField === 'parameVal') {
      let url = reportUrl;
      dataList.forEach((v, i) => {
        const { parameVar, parameVal, showFlag } = v;
        if (showFlag === 'YES') {
          if (i === rowIndex) {
            url = addParam(url, parameVar, val);
          } else {
            url = addParam(url, parameVar, parameVal);
          }
        }
      });
      dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: {
          reportUrl: url,
        },
      });
    }
    // 是否显示
    if (rowField === 'showFlag') {
      // 等于false 删除url params
      const { parameVar, parameVal } = dataList[rowIndex];
      if (rowFieldValue) {
        dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: {
            reportUrl: addParam(formData.reportUrl, parameVar, parameVal),
          },
        });
      } else {
        dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: {
            reportUrl: delParam(formData.reportUrl, parameVar),
          },
        });
      }
    }
  };

  render() {
    const {
      loading,
      dispatch,
      reportMgtEdit: { formData, dataList, reportUrl },
      form: { getFieldDecorator },
    } = this.props;
    const { fileList } = this.state;
    const { id } = fromQs();
    const disabledBtn = id ? loading.effects[`${DOMAIN}/query`] : false;

    const tableProps = {
      sortBy: 'id',
      rowKey: 'id',
      loading: disabledBtn,
      pagination: false,
      dataSource: dataList,
      total: dataList.length || 0,
      onAdd: newRow => {
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            dataList: update(dataList, {
              $push: [
                {
                  ...newRow,
                  id: genFakeId(-1),
                  showFlag: 'YES',
                },
              ],
            }),
          },
        });
      },
      onDeleteItems: (selectedRowKeys, selectedRows) => {
        const { delParameIds } = formData;
        const newDataList = dataList.filter(
          row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length
        );
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            dataList: newDataList,
          },
        });
        dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: {
            delParameIds: selectedRowKeys.filter(row => row > 0).concat(delParameIds),
          },
        });

        let url = reportUrl;
        newDataList.forEach((v, i) => {
          const { parameVar, parameVal, showFlag } = v;
          if (showFlag === 'YES') {
            url = addParam(url, parameVar, parameVal);
          }
        });
        dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: {
            reportUrl: url,
          },
        });
      },
      onCopyItem: copied => {
        const newDataList = update(dataList, {
          $push: copied.map(item => ({
            ...item,
            id: genFakeId(-1),
          })),
        });
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            dataList: newDataList,
          },
        });

        let url = reportUrl;
        newDataList.forEach((v, i) => {
          const { parameVar, parameVal, showFlag } = v;
          if (showFlag === 'YES') {
            url = addParam(url, parameVar, parameVal);
          }
        });
        dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: {
            reportUrl: url,
          },
        });
      },
      columns: [
        {
          title: '条件名称',
          dataIndex: 'parameName',
          required: true,
          options: {
            rules: [
              {
                required: true,
                message: '请选择条件名称',
              },
            ],
          },
          render: (value, row, index) => (
            <Input value={value} onChange={this.onCellChanged(index, 'parameName')} />
          ),
        },
        {
          title: '条件变量',
          dataIndex: 'parameVar',
          required: true,
          options: {
            rules: [
              {
                required: true,
                message: '请选择条件变量',
              },
            ],
          },
          render: (value, row, index) => (
            <Input value={value} onChange={this.onCellChanged(index, 'parameVar')} />
          ),
        },
        {
          title: '默认值',
          dataIndex: 'parameVal',
          render: (value, row, index) => (
            <Input value={value} onChange={this.onCellChanged(index, 'parameVal')} />
          ),
        },
        {
          title: '条件类型',
          dataIndex: 'parameType',
          align: 'center',
          width: 180,
          required: true,
          options: {
            rules: [
              {
                required: true,
                message: '请选择条件类型',
              },
            ],
          },
          render: (value, row, index) => (
            <Selection.UDC
              value={value}
              code="OPE_REPORT_PARAME_TYPE"
              placeholder="请选择条件类型"
              onChange={this.onCellChanged(index, 'parameType')}
            />
          ),
        },
        {
          title: '条件定义',
          dataIndex: 'parameDef',
          align: 'center',
          width: 180,
          required: true,
          render: (value, row, index) => {
            const { parameType } = row;
            if (parameType === 'UDC') {
              return (
                <Input
                  value={value}
                  onChange={this.onCellChanged(index, 'parameDef')}
                  placeholder="请输入UDC"
                />
              );
            }
            if (parameType === 'SELECTOR') {
              return (
                <Selection.UDC
                  value={value}
                  code="TSK:SELECTOR_TYPE"
                  placeholder="请选择下拉"
                  onChange={this.onCellChanged(index, 'parameDef')}
                />
              );
            }
            return null;
          },
        },
        {
          title: '是否启用',
          dataIndex: 'showFlag',
          align: 'center',
          width: 100,
          render: (value, row, index) => (
            <Switch checked={value === 'YES'} onChange={this.onCellChanged(index, 'showFlag')} />
          ),
        },
      ],
      buttons: [],
    };

    const uploadProps = {
      multiple: true,
      onRemove: file => {
        this.setState(state => {
          const index = state.fileList.indexOf(file);
          const newFileList = state.fileList.slice();
          newFileList.splice(index, 1);
          return {
            fileList: newFileList,
          };
        });
      },
      beforeUpload: file => {
        this.setState(state => ({
          fileList: [...state.fileList, file],
        }));
      },
      fileList,
    };

    return (
      <PageHeaderWrapper title="报表维护">
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            type="primary"
            icon="save"
            size="large"
            disabled={disabledBtn}
            onClick={this.handleSave}
          >
            {formatMessage({ id: `misc.save`, desc: '保存' })}
          </Button>
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => closeThenGoto('/sys/system/report')}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>

        <Card
          className="tw-card-adjust"
          bordered={false}
          title={<Title icon="profile" text="报表信息" />}
        >
          <FieldList
            layout="horizontal"
            getFieldDecorator={getFieldDecorator}
            col={2}
            hasSeparator={1}
          >
            <Field
              name="reportTitle"
              label="报表名称"
              decorator={{
                initialValue: formData.reportTitle,
                rules: [
                  {
                    required: true,
                    message: '请输入报表名称',
                  },
                ],
              }}
            >
              <Input placeholder="请输入报表名称" />
            </Field>

            <Field
              name="showMode"
              label="显示模式"
              decorator={{
                initialValue: formData.showMode,
                rules: [
                  {
                    required: true,
                    message: '请选择显示模式',
                  },
                ],
              }}
            >
              <Selection.UDC
                code="TSK:REPORT_SHOW_MODE"
                placeholder="请选择显示模式"
                onChange={value => {
                  dispatch({
                    type: `${DOMAIN}/updateForm`,
                    payload: {
                      reportUrl: editParam(formData.reportUrl, 'op', value),
                    },
                  });
                  dispatch({
                    type: `${DOMAIN}/updateState`,
                    payload: {
                      reportUrl: editParam(reportUrl, 'op', value),
                    },
                  });
                }}
              />
            </Field>

            <Field
              name="reportCode"
              label="报表编码"
              decorator={{
                initialValue: formData.reportCode,
                rules: [
                  {
                    required: true,
                    message: '请输入报表名称',
                  },
                ],
              }}
            >
              <Input placeholder="请输入报表编码" />
            </Field>

            <Field
              name="reportStatus"
              label="是否显示"
              decorator={{
                initialValue: formData.reportStatus,
                rules: [
                  {
                    required: true,
                    message: '请选择是否显示',
                  },
                ],
              }}
            >
              <Selection.UDC code="TSK:SHOW_FLAG" placeholder="请选择是否显示" />
            </Field>

            <Field
              name="reportType"
              label="报表类型"
              decorator={{
                initialValue: formData.reportType,
                rules: [
                  {
                    required: true,
                    message: '请选择报表类型',
                  },
                ],
              }}
            >
              <Selection.UDC code="OPE:REPORT_TYPE" placeholder="请选择报表类型" />
            </Field>

            <Field
              name="reportSort"
              label="排序(倒序)"
              decorator={{
                initialValue: formData.reportSort,
              }}
            >
              <InputNumber className="x-fill-100" placeholder="请输入排序" />
            </Field>

            <Field name="attache" label="报表文件">
              <Upload {...uploadProps}>
                <Button className="tw-btn-primary" type="primary" icon="upload">
                  上传报表
                </Button>
              </Upload>
            </Field>

            <Field
              name="reportUrl"
              label="链接预览"
              decorator={{
                initialValue: formData.reportUrl,
              }}
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
            >
              <Input placeholder="请输入报表链接" />
            </Field>

            {/* <Field
              name="remark"
              label="报表权限"
              decorator={{
                initialValue: formData.remark,
              }}
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
            >
              <Selection.Columns
                transfer={{ code: 'id', name: 'name' }}
                source={() => selectReport()}
                placeholder="请选择报表权限"
                mode="multiple"
                columns={[
                  { dataIndex: 'code', title: '编号', span: 10 },
                  { dataIndex: 'name', title: '名称', span: 14 },
                ]}
                showSearch
                allowClear
              />
            </Field> */}

            <Field
              name="reportMark"
              label="备注"
              decorator={{
                initialValue: formData.reportMark,
              }}
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
            >
              <Input.TextArea placeholder="请输入备注" rows={3} />
            </Field>
          </FieldList>
        </Card>

        {formData.reportType === 'SHOW_ROOM' && (
          <Card
            className="tw-card-adjust"
            bordered={false}
            title={<Title icon="profile" text="报表配置" />}
            style={{ marginTop: 6 }}
          >
            <EditableDataTable {...tableProps} />
          </Card>
        )}

        <Card
          className="tw-card-adjust"
          bordered={false}
          title={<Title icon="profile" text="相关联报表" />}
          style={{ marginTop: 6 }}
        >
          <FieldList
            layout="horizontal"
            getFieldDecorator={getFieldDecorator}
            col={1}
            hasSeparator={1}
          >
            <Field
              name="relatedIds"
              label="相关报表"
              decorator={{
                initialValue: Array.isArray(formData.relatedIds) ? formData.relatedIds : [],
              }}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
            >
              <Selection.Columns
                transfer={{ code: 'id', name: 'name' }}
                source={() => selectReport()}
                placeholder="请选择相关报表"
                mode="multiple"
                columns={[
                  { dataIndex: 'code', title: '编号', span: 10 },
                  { dataIndex: 'name', title: '名称', span: 14 },
                ]}
                showSearch
                allowClear
              />
            </Field>
          </FieldList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default ReportMgtEdit;
