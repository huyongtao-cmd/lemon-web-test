import React, { PureComponent } from 'react';
import { connect } from 'dva';
import classnames from 'classnames';
import { isEmpty, isNil } from 'ramda';
import { Button, Card, Form, Input, Divider, Switch } from 'antd';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto, markAsTab } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import DataTable from '@/components/common/DataTable';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';
import { Selection } from '@/pages/gen/field';
import createMessage from '@/components/core/AlertMessage';
import moment from 'moment';

const { Field } = FieldList;

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

const DOMAIN = 'finishProject';

@connect(({ loading, finishProject, dispatch, user, userProject }) => ({
  loading,
  finishProject,
  dispatch,
  user,
  userProject,
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
class FinishProjectFlowCreate extends PureComponent {
  componentDidMount() {
    const {
      dispatch,
      user: {
        user: {
          extInfo: { resId },
        },
      },
    } = this.props;
    const { id, list } = fromQs();

    dispatch({ type: `${DOMAIN}/clean` });
    dispatch({ type: `${DOMAIN}/res` });
    dispatch({ type: `${DOMAIN}/bu` });

    id && dispatch({ type: `${DOMAIN}/queryProjList` });
    !id &&
      dispatch({
        type: `${DOMAIN}/pmProject`,
        payload: id,
      });

    // 申请人为当前登录人，申请日期为当前日期
    dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: {
        applyResId: resId,
        applyDate: moment().format('YYYY-MM-DD'),
      },
    });

    // 从项目列表页进入，调用项目详情接口
    if (list === 'true') {
      // 有id，获取详情
      id &&
        dispatch({
          type: `${DOMAIN}/findProjectDetailsById`,
          payload: id,
        });
      id &&
        dispatch({
          type: `${DOMAIN}/getResultsByProj`,
          payload: { projId: id, chkClass: 'PROJ_CLOSURE_SELF_CHK' },
        });
    } else {
      // 从结项列表页进入，调用结项详情接口
      id &&
        dispatch({
          type: `${DOMAIN}/projClosureApplyDetails`,
          payload: { id },
        });
      id &&
        dispatch({
          type: `${DOMAIN}/checkresult`,
          payload: { id, chkClass: 'PROJ_CLOSURE_SELF_CHK' },
        });
    }
  }

  handleSubmit = submit => {
    const {
      form: { validateFieldsAndScroll },
      userProject: { searchForm },
      finishProject: { selfChkList },
      dispatch,
    } = this.props;

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        if (submit) {
          const check = selfChkList.filter(
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
        }

        dispatch({
          type: `${DOMAIN}/submit`,
          payload: {
            submit,
          },
        }).then(response => {
          if (response.ok) {
            const tt = selfChkList.filter(v => isNil(v.idenId));
            const {
              datum: { id: idenId },
            } = response;
            if (tt.length) {
              // eslint-disable-next-line
              selfChkList.map(v => (v.idenId = idenId));
            }

            dispatch({
              type: `${DOMAIN}/checkresultUpdate`,
              payload: selfChkList,
            }).then(res => {
              if (res.ok) {
                if (!submit) {
                  createMessage({ type: 'success', description: '保存成功' });
                  closeThenGoto('/user/project/finishProject?_refresh=0');
                  dispatch({ type: `finishProject/query`, payload: searchForm });
                } else {
                  createMessage({ type: 'success', description: '操作成功' });
                  closeThenGoto(`/user/flow/process?type=procs`);
                }
              } else {
                createMessage({ type: 'error', description: response.reason || '操作失败' });
              }
            });
          } else {
            createMessage({ type: 'error', description: response.reason || '操作失败' });
          }
        });
      }
    });
  };

  // 行编辑触发事件
  onCellChanged = (index, value, name) => {
    const {
      finishProject: { selfChkList },
      dispatch,
    } = this.props;

    const newDataSource = selfChkList;
    newDataSource[index] = {
      ...newDataSource[index],
      [name]: value,
    };
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { selfChkList: newDataSource },
    });
  };

  render() {
    const {
      loading,
      dispatch,
      form: { getFieldDecorator },
      finishProject: { formData, resDataSource, baseBuDataSource, projList, selfChkList },
    } = this.props;

    // loading完成之前将按钮设为禁用
    const submitBtn = loading.effects[`${DOMAIN}/submit`];
    const queryBtn = loading.effects[`${DOMAIN}/findProjectDetailsById`];
    const checkBtn = loading.effects[`${DOMAIN}/checkresultUpdate`];

    const tableBtn =
      loading.effects[`${DOMAIN}/getResultsByProj`] || loading.effects[`${DOMAIN}/checkresult`];

    const tableProps = {
      sortBy: 'id',
      rowKey: 'chkItemId',
      sortDirection: 'DESC',
      columnsCache: DOMAIN,
      loading: tableBtn,
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
          disabled: tableBtn || !formData.projId,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const {
              finishProject: {
                formData: { projId },
              },
            } = this.props;
            dispatch({
              type: `${DOMAIN}/getResultsByProj`,
              payload: { projId, chkClass: 'PROJ_CLOSURE_SELF_CHK' },
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
            onClick={e => this.handleSubmit(null)}
            disabled={submitBtn || queryBtn || checkBtn}
          >
            {formatMessage({ id: `misc.save`, desc: '保存' })}
          </Button>
          <Button
            className="tw-btn-primary"
            icon="upload"
            size="large"
            onClick={e => this.handleSubmit(true)}
            disabled={submitBtn || queryBtn || checkBtn}
          >
            提交
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
          title={<Title icon="profile" text="项目结项申请" />}
          bordered={false}
        >
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="applyNo"
              label="结项编号"
              decorator={{
                initialValue: formData.applyNo || undefined,
              }}
            >
              <Input placeholder="系统自动生成" disabled />
            </Field>
            <Field
              name="projId"
              label="项目"
              decorator={{
                initialValue: formData.projId || undefined,
                rules: [
                  {
                    required: isNil(fromQs().id),
                    message: '请选择项目',
                  },
                ],
              }}
            >
              <Selection.Columns
                className="x-fill-100"
                source={projList}
                columns={particularColumns}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                dropdownMatchSelectWidth={false}
                showSearch
                onColumnsChange={value => {}}
                onChange={value => {
                  if (value) {
                    dispatch({
                      type: `${DOMAIN}/findProjectDetailsById`,
                      payload: value,
                    });
                    dispatch({
                      type: `${DOMAIN}/getResultsByProj`,
                      payload: { projId: value, chkClass: 'PROJ_CLOSURE_SELF_CHK' },
                    });
                  } else {
                    dispatch({ type: `${DOMAIN}/clean` });
                  }
                }}
                placeholder="请选择项目"
                disabled={!isNil(fromQs().id)}
              />
            </Field>
            <Field
              name="projStatus"
              label="项目状态"
              decorator={{
                initialValue: formData.projStatus || undefined,
              }}
            >
              <Selection.UDC code="TSK:PROJ_STATUS" placeholder="系统自动生成" disabled />
            </Field>
            <Field
              name="workType"
              label="工作类型"
              decorator={{
                initialValue: formData.workType || undefined,
              }}
            >
              <Selection.UDC code="TSK:WORK_TYPE" placeholder="系统自动生成" disabled />
            </Field>
            <Field
              name="pmResId"
              label="项目经理"
              decorator={{
                initialValue: formData.pmResId || undefined,
              }}
            >
              <Selection.Columns
                className="x-fill-100"
                source={resDataSource}
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
              name="deliBuId"
              label="交付BU"
              decorator={{
                initialValue: formData.deliBuId || undefined,
              }}
            >
              <Selection.Columns
                className="x-fill-100"
                source={baseBuDataSource}
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
              name="deliResId"
              label="交付负责人"
              decorator={{
                initialValue: formData.deliResId || undefined,
              }}
            >
              <Selection.Columns
                className="x-fill-100"
                source={resDataSource}
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
              name="salesmanResId"
              label="销售负责人"
              decorator={{
                initialValue: formData.salesmanResId || undefined,
              }}
            >
              <Selection.Columns
                className="x-fill-100"
                source={resDataSource}
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
              name="remark"
              label="备注"
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
              decorator={{
                initialValue: formData.remark || undefined,
              }}
            >
              <Input.TextArea rows={3} placeholder="请输入备注" />
            </Field>
            <Field
              name="applyResId"
              label="申请人"
              decorator={{
                initialValue: formData.applyResId || undefined,
              }}
            >
              <Selection.Columns
                className="x-fill-100"
                source={resDataSource}
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
              name="applyDate"
              label="申请日期"
              decorator={{
                initialValue: formData.applyDate || undefined,
              }}
            >
              <Input placeholder="系统自动生成" disabled />
            </Field>
          </FieldList>
          <Divider dashed />
          <FieldList legend="结项检查事项" getFieldDecorator={getFieldDecorator} col={2}>
            <DataTable {...tableProps} dataSource={selfChkList} />
          </FieldList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default FinishProjectFlowCreate;
