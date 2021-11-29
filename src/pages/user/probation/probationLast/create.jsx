import React, { Component } from 'react';
import { connect } from 'dva';
import { isEmpty, isNil } from 'ramda';
import classnames from 'classnames';
import { Button, Card, Form, Input, Divider, Switch } from 'antd';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import createMessage from '@/components/core/AlertMessage';
import { formatMessage } from 'umi/locale';
import { Selection } from '@/pages/gen/field';

const { Field } = FieldList;

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

const DOMAIN = 'probationLast';

@connect(({ loading, probationLast, dispatch }) => ({
  loading,
  probationLast,
  dispatch,
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    if (isEmpty(changedFields)) return;
    const { name, value } = Object.values(changedFields)[0];
    if (value) {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { [name]: value },
      });
    }
  },
})
@mountToTab()
class probationLastCreate extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        formData: {},
        resultChkList: [],
      },
    });
    dispatch({
      type: `${DOMAIN}/queryUserPrincipal`,
    });
    dispatch({ type: `${DOMAIN}/res` });
    dispatch({ type: `${DOMAIN}/bu` });
  }

  handleSubmit = () => {
    const {
      form: { validateFieldsAndScroll },
      probationLast: { resultChkList },
      dispatch,
    } = this.props;

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        const check = resultChkList.filter(
          i =>
            (i.finishStatus === '未处理' && i.allowContinue === false) ||
            (i.finishStatus === '未处理' && !i.remark)
        );

        if (!isEmpty(check)) {
          if (check[0].finishStatus === '未处理' && check[0].allowContinue === false) {
            createMessage({
              type: 'error',
              description: `${check[0].chkItemName}必须完成` || '当期页面存在未处理事项',
            });
            return;
          }
          if (check[0].finishStatus === '未处理' && !check[0].remark) {
            createMessage({
              type: 'error',
              description:
                `请在${check[0].chkItemName}备注处填写未完成的原因` || '当期页面存在未处理事项',
            });
            return;
          }
          return;
        }
        dispatch({
          type: `${DOMAIN}/createSubmit`,
        }).then(res => {
          if (res.ok) {
            const tt = resultChkList.filter(v => isNil(v.idenId));
            const {
              datum: { id: idenId },
            } = res;
            if (tt.length) {
              // eslint-disable-next-line
              resultChkList.map(v => (v.idenId = idenId));
            }
            dispatch({
              type: `${DOMAIN}/checkresultUpdate`,
              payload: resultChkList,
            }).then(response => {
              if (response.ok) {
                createMessage({ type: 'success', description: '操作成功' });
                closeThenGoto(`/user/flow/process?type=procs`);
              }
            });
          }
        });
      }
    });
  };

  // 行编辑触发事件
  onCellChanged = (index, value, name) => {
    const {
      probationLast: { resultChkList },
      dispatch,
    } = this.props;

    const newDataSource = resultChkList;
    newDataSource[index] = {
      ...newDataSource[index],
      [name]: value,
    };
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { resultChkList: newDataSource },
    });
  };

  render() {
    const {
      loading,
      dispatch,
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
      probationLast: { formData, resData, baseBuData, resultChkList },
    } = this.props;

    const disabledBtn =
      loading.effects[`${DOMAIN}/queryResDetail`] || loading.effects[`${DOMAIN}/getResults`];

    const tableProps = {
      sortBy: 'id',
      rowKey: 'chkItemId',
      sortDirection: 'DESC',
      columnsCache: DOMAIN,
      loading: disabledBtn,
      showColumn: false,
      onRow: () => {},
      showSearch: false,
      showExport: false,
      pagination: false,
      enableSelection: false,
      rowSelection: {
        getCheckboxProps: (rowKey, rows) => {
          if (rowKey.checkMethod === 'AUTO') {
            return false;
          }
          return true;
        },
      },
      enableDoubleClick: false,
      columns: [
        {
          title: '检查方式',
          align: 'center',
          dataIndex: '',
          width: '15%',
          render: (value, row, index) => {
            if (row.checkMethod === 'AUTO') {
              return '系统自动检查';
            }
            return '人工检查';
          },
        },
        {
          title: '检查事项',
          align: 'center',
          width: '15%',
          dataIndex: 'chkItemName',
        },
        {
          title: '检查说明',
          width: '30%',
          dataIndex: 'chkDesc',
        },
        {
          title: '完成状态',
          dataIndex: 'finishStatus',
          align: 'center',
          width: '15%',
          render: (val, row, index) => (
            <Switch
              checkedChildren="已完成"
              unCheckedChildren="未处理"
              checked={val === '已完成'}
              onChange={(bool, e) => {
                const parmas = bool ? '已完成' : '未处理';
                this.onCellChanged(index, parmas, 'finishStatus', row);
              }}
              disabled={row.checkMethod === 'AUTO'}
            />
          ),
        },
        {
          title: '备注',
          dataIndex: 'remark',
          width: '25%',
          render: (value, row, index) => (
            <Input.TextArea
              autosize={{ minRows: 1, maxRows: 3 }}
              className="x-fill-100"
              value={row.remark || ''}
              onChange={e => {
                this.onCellChanged(index, e.target.value, 'remark', row);
              }}
            />
          ),
        },
      ],
      leftButtons: [
        {
          key: 'reload',
          icon: 'sync',
          className: 'tw-btn-primary',
          title: '刷新',
          loading: false,
          hidden: false,
          disabled: disabledBtn,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const {
              probationLast: {
                formData: { resId },
              },
            } = this.props;
            dispatch({
              type: `${DOMAIN}/getResults`,
              payload: { resId, chkClasses: 'PROBATION_FINAL_CHK' },
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
            disabled={disabledBtn}
          >
            {formatMessage({ id: `misc.submit`, desc: '提交' })}
          </Button>

          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => closeThenGoto('/user/flow/panel')}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>

        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={<Title icon="profile" text="试用期考核(末期)" />}
          bordered={false}
        >
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="resId"
              label="资源"
              decorator={{
                initialValue: formData.resId || undefined,
                rules: [
                  {
                    required: true,
                    message: '请选择资源',
                  },
                ],
              }}
            >
              <Selection.Columns
                className="x-fill-100"
                source={resData}
                columns={particularColumns}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                dropdownMatchSelectWidth={false}
                showSearch
                onColumnsChange={value => {
                  if (value && value.id) {
                    const { id } = value;
                    dispatch({
                      type: `${DOMAIN}/queryResDetail`,
                      payload: id,
                    }).then(res => {
                      dispatch({
                        type: `${DOMAIN}/getResults`,
                        payload: {
                          resId: id,
                          chkClasses: 'PROBATION_FINAL_CHK',
                        },
                      });
                    });
                  }
                }}
                placeholder="请选择考核资源"
              />
            </Field>
            <Field
              name="baseBuId"
              label="BaseBU"
              decorator={{
                initialValue: formData.baseBuId || undefined,
              }}
            >
              <Selection.Columns
                className="x-fill-100"
                source={baseBuData}
                columns={particularColumns}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                dropdownMatchSelectWidth={false}
                showSearch
                onColumnsChange={value => {}}
                placeholder="系统自动生成"
                disabled
              />
            </Field>
            <Field
              name="presId"
              label="直属领导"
              decorator={{
                initialValue: formData.presId || undefined,
              }}
            >
              <Selection.Columns
                className="x-fill-100"
                source={resData}
                columns={particularColumns}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                dropdownMatchSelectWidth={false}
                showSearch
                onColumnsChange={value => {}}
                placeholder="系统自动生成"
                disabled
              />
            </Field>
            <Field
              name="probationPeriod"
              label="试用期"
              decorator={{
                initialValue: formData.probationPeriod || '',
              }}
            >
              <Input placeholder="系统自动生成" disabled />
            </Field>
            <Field
              name="mobile"
              label="手机号码"
              decorator={{
                initialValue: formData.mobile || '',
              }}
            >
              <Input placeholder="系统自动生成" disabled />
            </Field>
            <Field
              name="emailAddr"
              label="平台邮箱"
              decorator={{
                initialValue: formData.emailAddr || '',
              }}
            >
              <Input placeholder="系统自动生成" disabled />
            </Field>

            <Field
              name="remark"
              label="备注"
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
              decorator={{
                initialValue: formData.remark || '',
              }}
            >
              <Input.TextArea rows={3} placeholder="请输入备注" />
            </Field>
            <Field
              name="applyResName"
              label="申请人"
              decorator={{
                initialValue: formData.applyResName || '',
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="applyDate"
              label="申请日期"
              decorator={{
                initialValue: formData.applyDate || '',
              }}
            >
              <Input disabled />
            </Field>
          </FieldList>
          <Divider dashed />
          <FieldList legend="入职培训完成情况" getFieldDecorator={getFieldDecorator} col={2}>
            <DataTable {...tableProps} dataSource={resultChkList} />
          </FieldList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default probationLastCreate;
