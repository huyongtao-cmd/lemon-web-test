import React, { PureComponent } from 'react';
import { connect } from 'dva';
import classnames from 'classnames';
import { isEmpty } from 'ramda';
import { Button, Card, Form, Input, Divider } from 'antd';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto, markAsTab } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import AsyncSelect from '@/components/common/AsyncSelect';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';
import { Selection, DatePicker, FileManagerEnhance } from '@/pages/gen/field';
import createMessage from '@/components/core/AlertMessage';
import { selectProjectTmpl } from '@/services/user/project/project';
import moment from 'moment';

const { Field } = FieldList;

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

const DOMAIN = 'setUpProjectCreate';
@connect(({ loading, setUpProjectCreate, dispatch, user, projectSetUpList }) => ({
  loading,
  setUpProjectCreate,
  dispatch,
  user,
  projectSetUpList,
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
class SetUpProjectFlowCreate extends PureComponent {
  componentDidMount() {
    const {
      dispatch,
      user: {
        user: {
          extInfo: { resId },
        },
      },
    } = this.props;
    const { id, mode } = fromQs();
    dispatch({ type: `${DOMAIN}/clean` });
    dispatch({ type: `${DOMAIN}/res` });
    dispatch({ type: `${DOMAIN}/bu` });

    // 项目立项列表的修改页面和申请页面用的是同一个  有id存在并且mode为update时为修改，查询
    id &&
      mode === 'update' &&
      dispatch({
        type: `${DOMAIN}/queryProjList`,
        payload: {
          id,
        },
      });
    // 申请人重新申请
    id &&
      mode === 'edit' &&
      dispatch({
        type: `${DOMAIN}/queryProjList`,
        payload: {
          id,
        },
      });
    // 申请人为当前登录人，申请日期为当前日期
    !id &&
      dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: {
          resId,
          applyDate: moment().format('YYYY-MM-DD'),
        },
      });
  }

  handleSubmit = submit => {
    // flag为空 保存按钮  跳到列表页  为true 跳到我的流程页
    const {
      projectSetUpList: { searchForm },
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        // 点击提交按钮
        dispatch({
          type: `${DOMAIN}/submit`,
          payload: {
            submit,
          },
        }).then(response => {
          if (response && response.ok) {
            if (!submit) {
              createMessage({ type: 'success', description: '保存成功' });
              closeThenGoto('/user/project/setUpProject?_refresh=0');
              dispatch({ type: 'projectSetUpList/query', payload: searchForm });
            } else {
              createMessage({ type: 'success', description: '操作成功' });
              closeThenGoto(`/user/flow/process?type=procs`);
            }
          } else {
            createMessage({ type: 'error', description: response.reason || '操作失败' });
          }
        });
      }
    });
  };

  render() {
    const {
      loading,
      dispatch,
      form: { getFieldDecorator },
      setUpProjectCreate: { formData, resDataSource, baseBuDataSource },
    } = this.props;
    const { mode } = fromQs();
    // loading完成之前将按钮设为禁用
    const submitBtn = loading.effects[`${DOMAIN}/submit`];
    const queryBtn = loading.effects[`${DOMAIN}/queryProjList`];
    return (
      <PageHeaderWrapper>
        {mode === 'edit' ? null : (
          <Card className="tw-card-rightLine">
            <Button
              className="tw-btn-primary"
              icon="save"
              size="large"
              onClick={e => this.handleSubmit(null)}
              disabled={submitBtn || queryBtn}
              loading={loading.effects[`${DOMAIN}/submit`]}
            >
              {formatMessage({ id: `misc.save`, desc: '保存' })}
            </Button>
            <Button
              className="tw-btn-primary"
              icon="upload"
              size="large"
              onClick={e => this.handleSubmit(true)}
              disabled={submitBtn || queryBtn}
              loading={loading.effects[`${DOMAIN}/submit`]}
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
        )}

        <Card className="tw-card-adjust" style={{ marginTop: '6px' }} bordered={false}>
          <FieldList
            layout="horizontal"
            getFieldDecorator={getFieldDecorator}
            col={2}
            legend="项目立项申请"
          >
            <Field
              name="projName"
              label="项目名称"
              decorator={{
                initialValue: formData.projName || undefined,
                rules: [
                  {
                    required: true,
                    message: '请输入项目名称',
                  },
                ],
              }}
            >
              <Input placeholder="请输入项目名称" />
            </Field>
            <Field
              name="projNo"
              label="编号"
              decorator={{
                initialValue: formData.projNo || undefined,
              }}
            >
              <Input placeholder="系统自动生成" disabled />
            </Field>
            <Field
              name="planStartDate"
              label="计划开始日期"
              decorator={{
                initialValue: formData.planStartDate || undefined,
                rules: [
                  {
                    required: true,
                    message: '请选择计划开始日期',
                  },
                ],
              }}
            >
              <DatePicker
                className="x-fill-100"
                format="YYYY-MM-DD"
                placeholder="请选择计划开始日期"
              />
            </Field>
            <Field
              name="planEndDate"
              label="计划结束日期"
              decorator={{
                initialValue: formData.planEndDate || undefined,
                rules: [
                  {
                    required: true,
                    message: '请选择计划结束日期',
                  },
                ],
              }}
            >
              <DatePicker
                className="x-fill-100"
                format="YYYY-MM-DD"
                placeholder="请选择计划结束日期"
              />
            </Field>
            <Field
              name="projTempId"
              label="项目模板"
              decorator={{
                initialValue: formData.projTempId && formData.projTempId + '',
                rules: [
                  {
                    required: true,
                    message: '请选择项目模板',
                  },
                ],
              }}
            >
              <AsyncSelect
                source={() => selectProjectTmpl().then(resp => resp.response)}
                placeholder="请选择项目模板"
                showSearch
                filterOption={(input, option) =>
                  option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              />
            </Field>
            <Field name="sow" label="SOW节选">
              <FileManagerEnhance
                api="/api/op/v1/projectRequest/project/projectRequestSow/sfs/token"
                dataKey={formData.id}
                listType="text"
                disabled={false}
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
              name="resId"
              label="申请人"
              decorator={{
                initialValue: formData.resId || undefined,
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
          <FieldList
            legend="相关人员"
            layout="horizontal"
            getFieldDecorator={getFieldDecorator}
            col={2}
          >
            <Field
              name="deliBuId"
              label="交付BU"
              decorator={{
                initialValue: formData.deliBuId || undefined,
                rules: [
                  {
                    required: true,
                    message: '请选择交付BU',
                  },
                ],
              }}
            >
              <Selection.ColumnsForBu />
            </Field>
            <Field
              name="deliResId"
              label="交付负责人"
              decorator={{
                initialValue: formData.deliResId || undefined,
                rules: [
                  {
                    required: true,
                    message: '请选择交付负责人',
                  },
                ],
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
              />
            </Field>
            <Field
              name="salesmanResId"
              label="销售负责人"
              decorator={{
                initialValue: formData.salesmanResId || undefined,
                rules: [
                  {
                    required: true,
                    message: '请选择销售负责人',
                  },
                ],
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
              />
            </Field>
          </FieldList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default SetUpProjectFlowCreate;
