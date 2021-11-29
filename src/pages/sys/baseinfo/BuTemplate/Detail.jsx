import React, { PureComponent } from 'react';
import router from 'umi/router';
import classnames from 'classnames';
import { Button, Form, Card, Input } from 'antd';
import { UdcSelect } from '@/pages/gen/field';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { isEmpty } from 'ramda';
import FieldList from '@/components/layout/FieldList';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import Loading from '@/components/core/DataLoading';
import component from './component/index';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab } from '@/layouts/routerControl';
// import { operationTabList } from './config/index';

const { Finance, Role, Eqva, Income, Operation } = component;
const { Field } = FieldList;

const DOMAIN = 'sysButempEdit';
@connect(({ loading, sysButempEdit }) => ({
  loading,
  sysButempEdit,
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    if (isEmpty(changedFields)) return;
    const { name, value } = Object.values(changedFields)[0];
    if (value instanceof Object) {
      const key = name.split('Id')[0];
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { [key + 'Id']: value.id, [key + 'No']: value.code, [key + 'Name']: value.name },
      });
    } else {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { [name]: value },
      });
    }
  },
})
@mountToTab()
class BuTmplDetail extends PureComponent {
  state = {
    operationkey: 'basic',
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const param = fromQs();
    const { id, tab, mode } = param;
    if (mode && mode !== 'create') {
      dispatch({
        type: `${DOMAIN}/query`,
        payload: { id, mode, tab },
      });

      this.setState({
        operationkey: tab,
      });
    }
  }

  onOperationTabChange = key => {
    // 如果是新增界面，只能操作第一个tab页
    const {
      sysButempEdit: { mode },
    } = this.props;
    if (mode !== 'create') {
      this.setState({ operationkey: key });
    }
  };

  handleSave = () => {
    const {
      dispatch,
      form: { validateFieldsAndScroll },
      sysButempEdit: { formData },
    } = this.props;
    const { operationkey } = this.state;

    if (operationkey === 'basic' || operationkey === 'finance') {
      validateFieldsAndScroll((error, values) => {
        if (!error) {
          dispatch({
            type: `${DOMAIN}/${operationkey}Save`,
          });
        }
      });
    } else {
      dispatch({
        type: `sysButemp${operationkey}/save`,
        payload: { tmplId: formData.id },
      });
    }
  };

  render() {
    const {
      loading,
      form,
      form: { getFieldDecorator },
      sysButempEdit,
      sysButempEdit: { formData, mode },
    } = this.props;
    const { operationkey } = this.state;

    const operationTabList = [
      {
        key: 'basic',
        tab: formatMessage({ id: `app.settings.menuMap.basic`, desc: '基本信息' }),
      },
      {
        key: 'finance',
        tab: (
          <span className={mode === 'create' ? 'tw-card-multiTab-disabled' : undefined}>
            {formatMessage({ id: `app.settings.menuMap.finance`, desc: '财务信息' })}
          </span>
        ),
      },
      {
        key: 'role',
        tab: (
          <span className={mode === 'create' ? 'tw-card-multiTab-disabled' : undefined}>
            {formatMessage({ id: `app.settings.menuMap.role`, desc: '角色信息' })}
          </span>
        ),
      },
      {
        key: 'income',
        tab: (
          <span className={mode === 'create' ? 'tw-card-multiTab-disabled' : undefined}>
            {formatMessage({ id: `app.settings.menuMap.income`, desc: '资源当量收入' })}
          </span>
        ),
      },
      // {
      //   key: 'eqva',
      //   tab: (
      //     <span className={mode === 'create' ? 'tw-card-multiTab-disabled' : undefined}>
      //       {formatMessage({ id: `app.settings.menuMap.eqva`, desc: '结算当量' })}
      //     </span>
      //   ),
      // },
      {
        key: 'operation',
        tab: (
          <span className={mode === 'create' ? 'tw-card-multiTab-disabled' : undefined}>
            {formatMessage({ id: `app.settings.menuMap.operation`, desc: '经营信息' })}
          </span>
        ),
      },
    ];
    const contentList = {
      basic: (
        <FieldList
          layout="horizontal"
          legend={formatMessage({ id: `app.settings.menuMap.basic`, desc: '基本信息' })}
          getFieldDecorator={getFieldDecorator}
          col={2}
        >
          <Field
            name="tmplNo"
            label={formatMessage({ id: `sys.baseinfo.buTemplate.tmplNo`, desc: '模板编号' })}
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
            label={formatMessage({ id: `sys.baseinfo.buTemplate.tmplName`, desc: '模板名称' })}
            decorator={{
              initialValue: formData.tmplName,
              rules: [
                {
                  required: true,
                  message:
                    formatMessage({ id: `app.hint.input`, desc: '请输入' }) +
                    formatMessage({ id: `sys.baseinfo.buTemplate.tmplName`, desc: '模板名称' }),
                },
              ],
            }}
          >
            <Input
              placeholder={
                formatMessage({ id: `app.hint.input`, desc: '请输入' }) +
                formatMessage({ id: `sys.baseinfo.buTemplate.tmplName`, desc: '模板名称' })
              }
            />
          </Field>

          <Field
            name="tmplType"
            label={formatMessage({ id: `sys.baseinfo.buTemplate.tmplType`, desc: '类别' })}
            decorator={{
              initialValue: formData.tmplType,
              rules: [
                {
                  required: true,
                  message:
                    formatMessage({ id: `app.hint.input`, desc: '请输入' }) +
                    formatMessage({ id: `sys.baseinfo.buTemplate.tmplType`, desc: '类别' }),
                },
              ],
            }}
          >
            <UdcSelect code="ORG.BUTMPL_TYPE" />
          </Field>
          <Field
            name="remark"
            label={formatMessage({ id: `sys.baseinfo.buTemplate.remark`, desc: '备注' })}
            decorator={{
              initialValue: formData.remark,
              rules: [
                {
                  required: false,
                  message:
                    formatMessage({ id: `app.hint.input`, desc: '请输入' }) +
                    formatMessage({ id: `sys.baseinfo.buTemplate.remark`, desc: '备注' }),
                },
              ],
            }}
            fieldCol={1}
            labelCol={{ span: 4, xxl: 3 }}
            wrapperCol={{ span: 19, xxl: 20 }}
          >
            <Input.TextArea
              placeholder={
                formatMessage({ id: `app.hint.input`, desc: '请输入' }) +
                formatMessage({ id: `sys.baseinfo.buTemplate.remark`, desc: '备注' })
              }
              rows={3}
              maxLength={400}
            />
          </Field>
        </FieldList>
      ),
      finance: (
        <div>
          {!!formData.id && <Finance form={form} domain={DOMAIN} sysButempDetail={sysButempEdit} />}
        </div>
      ),
      role: <Role domain={DOMAIN} sysButempDetail={sysButempEdit} />,
      income: <Income domain={DOMAIN} sysButempDetail={sysButempEdit} />,
      eqva: <Eqva domain={DOMAIN} sysButempDetail={sysButempEdit} />,
      operation: <Operation domain={DOMAIN} sysButempDetail={sysButempEdit} />,
    };
    const disabledBtn =
      !!loading.effects[`${DOMAIN}/query`] ||
      !!loading.effects[`${DOMAIN}/${operationkey}Save`] ||
      loading.effects[`sysButemp${operationkey}/save`];

    return (
      <PageHeaderWrapper title="BU模板编辑">
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
            onClick={() => router.push('/plat/buMgmt/butemplate')}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        <Card
          className="tw-card-multiTab"
          bordered={false}
          activeTabKey={operationkey}
          tabList={operationTabList}
          onTabChange={this.onOperationTabChange}
        >
          {formData.id ? contentList[operationkey] : <Loading />}
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default BuTmplDetail;
