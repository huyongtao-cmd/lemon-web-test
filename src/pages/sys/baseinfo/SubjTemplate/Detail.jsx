import React, { PureComponent } from 'react';
import router from 'umi/router';
import classnames from 'classnames';
import { Button, Form, Card, Input, InputNumber, Divider } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { isEmpty } from 'ramda';
import { fromQs } from '@/utils/stringUtils';
import AsyncSelect from '@/components/common/AsyncSelect';
import FieldList from '@/components/layout/FieldList';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import Loading from '@/components/core/DataLoading';
import SubTable from './SubTable';
import Title from '@/components/layout/Title';
import { queryUdc } from '@/services/gen/app';
import { mountToTab } from '@/layouts/routerControl';

const { Field } = FieldList;

const DOMAIN = 'sysSubjtempEdit';

@connect(({ loading, sysSubjtempEdit, dispatch }) => ({
  loading,
  sysSubjtempEdit,
  dispatch,
}))
@Form.create({
  // form只能取值一次，新增保存之后需要刷新页面，否则changedFields为{}, 会报错
  onFieldsChange(props, changedFields) {
    if (isEmpty(changedFields)) return;
    const { name, value } = Object.values(changedFields)[0];
    props.dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: { [name]: value },
    });
  },
})
@mountToTab()
class SubjTemplateDetail extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const param = fromQs();
    if (param.mode && param.mode !== 'create') {
      dispatch({
        type: `${DOMAIN}/query`,
        payload: param,
      });
    }
  }

  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/save`,
        });
      }
    });
  };

  budgetLevelChange = () => {
    const {
      sysSubjtempEdit: { dataSource },
      dispatch,
    } = this.props;
    const newDataSource = dataSource.map(data => ({ ...data, budgetFlag: 0 }));
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { dataSource: newDataSource },
    });
  };

  render() {
    const {
      loading,
      dispatch,
      sysSubjtempEdit,
      form: { getFieldDecorator },
    } = this.props;
    const { formData, dataSource, total, modalTreeData, deleteList } = sysSubjtempEdit;
    const disabledBtn =
      !!loading.effects[`${DOMAIN}/query`] ||
      !!loading.effects[`${DOMAIN}/queryDetails`] ||
      !!loading.effects[`${DOMAIN}/save`];

    return (
      <PageHeaderWrapper title="科目模板编辑">
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
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
            onClick={() => router.push('/plat/finAccout/subjtemplate')}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>

        <Card
          className="tw-card-adjust"
          title={<Title icon="profile" id="app.settings.menuMap.basic" defaultMessage="基础设置" />}
          bordered={false}
        >
          {formData.id ? (
            <>
              <FieldList
                layout="horizontal"
                legend={formatMessage({ id: `app.settings.menuMap.basic`, desc: '基本信息' })}
                getFieldDecorator={getFieldDecorator}
                col={2}
              >
                <Field
                  name="tmplNo"
                  label={formatMessage({
                    id: `sys.baseinfo.subjTemplate.tmplNo`,
                    desc: '模版编号',
                  })}
                  decorator={{
                    initialValue: formData.tmplNo,
                  }}
                >
                  <Input
                    disabled
                    placeholder={formatMessage({ id: `app.hint.systemcreate`, desc: '系统生成' })}
                  />
                </Field>

                <Field
                  name="tmplName"
                  label={formatMessage({
                    id: `sys.baseinfo.subjTemplate.tmplName`,
                    desc: '模版名称',
                  })}
                  decorator={{
                    initialValue: formData.tmplName,
                    rules: [
                      {
                        required: true,
                        message:
                          formatMessage({ id: `app.hint.input`, desc: '请输入' }) +
                          formatMessage({
                            id: `sys.baseinfo.subjTemplate.tmplName`,
                            desc: '模版名称',
                          }),
                      },
                    ],
                  }}
                >
                  <Input
                    placeholder={
                      formatMessage({ id: `app.hint.input`, desc: '请输入' }) +
                      formatMessage({ id: `sys.baseinfo.subjTemplate.tmplName`, desc: '模版名称' })
                    }
                  />
                </Field>

                <Field
                  name="tmplIndustry"
                  label={formatMessage({
                    id: `sys.baseinfo.subjTemplate.tmplIndustry`,
                    desc: '适用行业',
                  })}
                  decorator={{
                    initialValue: formData.tmplIndustry,
                    rules: [
                      {
                        required: true,
                        message:
                          formatMessage({ id: `app.hint.input`, desc: '请输入' }) +
                          formatMessage({
                            id: `sys.baseinfo.subjTemplate.tmplIndustry`,
                            desc: '适用行业',
                          }),
                      },
                    ],
                  }}
                >
                  <AsyncSelect
                    disabled
                    source={() => queryUdc('ACC.ACC_IDST').then(resp => resp.response)}
                    placeholder={
                      formatMessage({ id: `app.hint.input`, desc: '请输入' }) +
                      formatMessage({
                        id: `sys.baseinfo.subjTemplate.tmplIndustry`,
                        desc: '适用行业',
                      })
                    }
                  />
                </Field>

                <Field
                  name="tmplStatus"
                  label={formatMessage({
                    id: `sys.baseinfo.subjTemplate.tmplStatus`,
                    desc: '模版状态',
                  })}
                  decorator={{
                    initialValue: formData.tmplStatusName ? formData.tmplStatusName : '有效',
                  }}
                >
                  <Input disabled />
                </Field>

                <Field
                  name="tmplClass"
                  label={formatMessage({
                    id: `sys.baseinfo.subjTemplate.tmplClass`,
                    desc: '模板类别',
                  })}
                  decorator={{
                    initialValue: formData.tmplClass,
                    rules: [
                      {
                        required: true,
                        message:
                          formatMessage({ id: `app.hint.input`, desc: '请输入' }) +
                          formatMessage({
                            id: `sys.baseinfo.subjTemplate.tmplClass`,
                            desc: '模板类别',
                          }),
                      },
                    ],
                  }}
                >
                  <AsyncSelect
                    source={() => queryUdc('ACC.TMPL_CLASS').then(resp => resp.response)}
                    placeholder={
                      formatMessage({ id: `app.hint.input`, desc: '请输入' }) +
                      formatMessage({ id: `sys.baseinfo.subjTemplate.tmplClass`, desc: '模板类别' })
                    }
                  />
                </Field>
                <Field
                  name="tmplType"
                  label={formatMessage({
                    id: `sys.baseinfo.subjTemplate.tmplType`,
                    desc: '适用类型',
                  })}
                  decorator={{
                    initialValue: formData.tmplType,
                    rules: [
                      {
                        required: false,
                        message:
                          formatMessage({ id: `app.hint.input`, desc: '请输入' }) +
                          formatMessage({
                            id: `sys.baseinfo.subjTemplate.tmplType`,
                            desc: '适用类型',
                          }),
                      },
                    ],
                  }}
                >
                  <Input
                    placeholder={
                      formatMessage({ id: `app.hint.input`, desc: '请输入' }) +
                      formatMessage({ id: `sys.baseinfo.subjTemplate.tmplType`, desc: '适用类型' })
                    }
                  />
                </Field>

                <Field
                  name="budgetLevel"
                  label="预算控制级别"
                  decorator={{
                    initialValue: formData.budgetLevel,
                    rules: [
                      {
                        required: false,
                        message: '请输入预算控制级别',
                      },
                    ],
                  }}
                >
                  <InputNumber
                    className="x-fill-100"
                    placeholder="请输入预算控制级别"
                    onChange={this.budgetLevelChange}
                  />
                </Field>

                <Field
                  name="remark"
                  label={formatMessage({ id: `sys.baseinfo.subjTemplate.remark`, desc: '备注' })}
                  decorator={{
                    initialValue: formData.remark,
                    rules: [{ required: false }],
                  }}
                  fieldCol={1}
                  labelCol={{ span: 4, xxl: 3 }}
                  wrapperCol={{ span: 19, xxl: 20 }}
                >
                  <Input.TextArea placeholder="" rows={3} maxLength={400} />
                </Field>
              </FieldList>

              <div>
                <Divider dashed />
                <div className="tw-card-title">
                  {formatMessage({ id: `app.settings.menuMap.subjtemplate`, desc: '科目信息' })}
                </div>

                <SubTable
                  tmplId={formData.id}
                  domain={DOMAIN}
                  dispatch={dispatch}
                  loading={loading}
                  formData={formData}
                  dataSource={dataSource}
                  total={total}
                  modalTreeData={modalTreeData}
                  deleteList={deleteList}
                />
              </div>
            </>
          ) : (
            <Loading />
          )}
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default SubjTemplateDetail;
