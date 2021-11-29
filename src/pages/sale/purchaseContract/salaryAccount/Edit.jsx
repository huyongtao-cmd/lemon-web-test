import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { isEmpty } from 'ramda';
import classnames from 'classnames';
import { Button, Form, Card, Input, Select, InputNumber } from 'antd';
import AsyncSelect from '@/components/common/AsyncSelect';
import { FileManagerEnhance, Selection } from '@/pages/gen/field';

import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import FieldList from '@/components/layout/FieldList';
import { fromQs } from '@/utils/stringUtils';
import { selectAbOus } from '@/services/gen/list';

const { Field } = FieldList;
const DOMAIN = 'salaryAccountEdit';
const { Option } = Select;

@connect(({ loading, dispatch, salaryAccountEdit }) => ({
  loading,
  dispatch,
  salaryAccountEdit,
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
class SalaryAccountEdit extends PureComponent {
  componentDidMount() {
    const { id } = fromQs();
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/clearForm`,
    });
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: {
        pageNo: 'SALARY_ACCOUNT_CONFIG',
      },
    });
    id &&
      dispatch({
        type: `${DOMAIN}/getDetails`,
        payload: { id },
      });
  }

  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      const param = fromQs().id;
      const { adjunct, ...params } = values;
      if (!error) {
        dispatch({
          type: `${DOMAIN}/save`,
          payload: { id: param, ...params },
        });
      }
    });
  };

  handleCancel = () => {
    closeThenGoto('/sale/purchaseContract/purchaseSalaryAccount');
  };

  sortObj = (obj1, obj2) => {
    const a = obj1.sortNo;
    const b = obj2.sortNo;
    if (a > b) {
      return 1;
    }
    if (a < b) {
      return -1;
    }
    return 0;
  };

  render() {
    const {
      loading,
      form,
      dispatch,
      salaryAccountEdit: { formData, paymentOuList, collectionList, pageConfig = {} },
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
    } = this.props;
    const { mode } = fromQs();
    const submitting = loading.effects[`${DOMAIN}/save`];
    const disabled = mode && mode === 'view';
    let { pageBlockViews = [] } = pageConfig;
    pageBlockViews = pageBlockViews.sort(this.sortObj);
    let FieldListItemArray = [];
    if (pageBlockViews && pageBlockViews.length > 2) {
      const { pageFieldViews = [] } = pageBlockViews[2];
      FieldListItemArray = pageFieldViews
        .filter(item => item.visibleFlag === 1)
        .sort(this.sortObj)
        .map(item => {
          let FieldListItem = (
            <Field
              name={item.fieldKey}
              label={item.displayName}
              decorator={{
                initialValue: formData[item.fieldKey] || '',
                rules: [{ required: item.requiredFlag, message: `请输入${item.displayName}` }],
              }}
            >
              <Input placeholder={`请输入${item.displayName}`} disabled={disabled} />
            </Field>
          );

          if (item.fieldKey === 'paymentOuId') {
            FieldListItem = (
              <Field
                name={item.fieldKey}
                label={item.displayName}
                decorator={{
                  initialValue: formData[item.fieldKey] || '',
                  rules: [{ required: item.requiredFlag, message: `请选择${item.displayName}` }],
                }}
              >
                <Selection.Columns
                  className="x-fill-100"
                  source={() => selectAbOus()}
                  transfer={{ key: 'id', code: 'id', name: 'name' }}
                  dropdownMatchSelectWidth
                  showSearch
                  disabled={disabled}
                  onValueChange={e => {
                    if (e && e.code) {
                      dispatch({
                        type: `${DOMAIN}/selectAccountByNo`,
                        payload: {
                          val: e.code,
                          type: 'paymentOu',
                        },
                      });
                      dispatch({
                        type: `${DOMAIN}/updateForm`,
                        payload: {
                          paymentOuId: e.id,
                          relatedId: undefined,
                          relatedBank: undefined,
                        },
                      });
                    } else {
                      dispatch({
                        type: `${DOMAIN}/updateForm`,
                        payload: {
                          paymentOuId: undefined,
                          relatedId: undefined,
                          relatedBank: undefined,
                        },
                      });
                    }

                    setFieldsValue({
                      relatedId: undefined,
                      relatedBank: undefined,
                    });
                  }}
                  placeholder={`请选择${item.displayName}`}
                />
              </Field>
            );
          }
          if (item.fieldKey === 'collectionAbId') {
            FieldListItem = (
              <Field
                name={item.fieldKey}
                label={item.displayName}
                decorator={{
                  initialValue: formData[item.fieldKey] || '',
                  rules: [{ required: item.requiredFlag, message: `请选择${item.displayName}` }],
                }}
                style={{ letterSpacing: '-2px' }}
              >
                <Selection.Columns
                  className="x-fill-100"
                  source={() => selectAbOus()}
                  // columns={}
                  transfer={{ key: 'valSphd1', code: 'valSphd1', name: 'name' }}
                  dropdownMatchSelectWidth
                  showSearch
                  disabled={disabled}
                  onValueChange={e => {
                    if (e && e.code) {
                      dispatch({
                        type: `${DOMAIN}/selectAccountByNo`,
                        payload: {
                          val: e.code,
                          type: 'collection',
                        },
                      });
                      dispatch({
                        type: `${DOMAIN}/updateForm`,
                        payload: {
                          collectionAbId: e.valSphd1,
                          collectionId: undefined,
                          collectionBank: undefined,
                        },
                      });
                    } else {
                      dispatch({
                        type: `${DOMAIN}/updateForm`,
                        payload: {
                          collectionAbId: undefined,
                          collectionId: undefined,
                          collectionBank: undefined,
                        },
                      });
                    }
                    setFieldsValue({
                      collectionId: undefined,
                      collectionBank: undefined,
                    });
                  }}
                  placeholder={`请选择${item.displayName}`}
                />
              </Field>
            );
          }

          if (item.fieldKey === 'relatedId') {
            FieldListItem = (
              <Field
                name={item.fieldKey}
                label={item.displayName}
                decorator={{
                  initialValue: formData[item.fieldKey] || '',
                  rules: [{ required: item.requiredFlag, message: `请选择${item.displayName}` }],
                }}
              >
                <Selection.Columns
                  className="x-fill-100"
                  source={paymentOuList || []}
                  transfer={{ key: 'id', code: 'id', name: 'name' }}
                  dropdownMatchSelectWidth
                  showSearch
                  placeholder={`请选择${item.displayName}`}
                  disabled={disabled}
                  onChange={val => {
                    dispatch({
                      type: `${DOMAIN}/updateForm`,
                      payload: {
                        relatedId: val,
                      },
                    });
                    if (val) {
                      dispatch({
                        type: `${DOMAIN}/selectApplyAccounts`,
                        payload: {
                          val,
                          type: 'paymentOu',
                        },
                      }).then(res => {
                        setFieldsValue({
                          relatedBank: res,
                        });
                      });
                    } else {
                      dispatch({
                        type: `${DOMAIN}/updateForm`,
                        payload: {
                          relatedBank: undefined,
                        },
                      });
                      setFieldsValue({
                        relatedBank: undefined,
                      });
                    }
                  }}
                />
              </Field>
            );
          }

          if (item.fieldKey === 'collectionId') {
            FieldListItem = (
              <Field
                name={item.fieldKey}
                label={item.displayName}
                decorator={{
                  initialValue: formData[item.fieldKey] || '',
                  rules: [{ required: item.requiredFlag, message: `请选择${item.displayName}` }],
                }}
              >
                <Selection.Columns
                  className="x-fill-100"
                  source={collectionList || []}
                  transfer={{ key: 'id', code: 'id', name: 'name' }}
                  dropdownMatchSelectWidth
                  showSearch
                  placeholder={`请选择${item.displayName}`}
                  disabled={disabled}
                  onChange={val => {
                    dispatch({
                      type: `${DOMAIN}/updateForm`,
                      payload: {
                        collectionId: val,
                      },
                    });
                    if (val) {
                      dispatch({
                        type: `${DOMAIN}/selectApplyAccounts`,
                        payload: {
                          val,
                          type: 'collection',
                        },
                      }).then(res => {
                        setFieldsValue({
                          collectionBank: res,
                        });
                      });
                    } else {
                      dispatch({
                        type: `${DOMAIN}/updateForm`,
                        payload: {
                          collectionBank: undefined,
                        },
                      });
                      setFieldsValue({
                        collectionBank: undefined,
                      });
                    }
                  }}
                />
              </Field>
            );
          }

          if (item.fieldKey === 'relatedBank' || item.fieldKey === 'collectionBank') {
            FieldListItem = (
              <Field
                name={item.fieldKey}
                label={item.displayName}
                decorator={{
                  initialValue: formData[item.fieldKey] || '',
                }}
              >
                <Input placeholder={`请输入${item.displayName}`} disabled />
              </Field>
            );
          }

          if (item.fieldKey === 'costNote') {
            FieldListItem = (
              <Field
                name={item.fieldKey}
                label={item.displayName}
                decorator={{
                  initialValue: formData[item.fieldKey] || '',
                }}
                style={{ letterSpacing: '-2px' }}
              >
                <Input placeholder={`请输入${item.displayName}`} disabled={disabled} />
              </Field>
            );
          }

          if (item.fieldKey === 'payWay') {
            FieldListItem = (
              <Field
                name={item.fieldKey}
                label={item.displayName}
                decorator={{
                  initialValue: formData[item.fieldKey] || '',
                  rules: [{ required: item.requiredFlag, message: `请选择${item.displayName}` }],
                }}
              >
                <Selection.UDC
                  code="ACC:PAY_METHOD"
                  placeholder={`请选择${item.displayName}`}
                  disabled={disabled}
                />
              </Field>
            );
          }

          if (item.fieldKey === 'acceptanceType') {
            FieldListItem = (
              <Field
                name={item.fieldKey}
                label={item.displayName}
                decorator={{
                  initialValue: formData[item.fieldKey] || '',
                  rules: [{ required: item.requiredFlag, message: `请选择${item.displayName}` }],
                }}
              >
                <Selection.UDC
                  code="TSK:ACCEPTANCE_TYPE"
                  placeholder={`请选择${item.displayName}`}
                  disabled={disabled}
                />
              </Field>
            );
          }

          return FieldListItem;
        });
    }
    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          {!disabled && (
            <Button
              className="tw-btn-primary"
              type="primary"
              icon="save"
              size="large"
              disabled={submitting}
              onClick={this.handleSave}
            >
              {formatMessage({ id: `misc.save`, desc: '保存' })}
            </Button>
          )}

          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            disabled={false}
            onClick={this.handleCancel}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        <Card className="tw-card-adjust" bordered={false}>
          <FieldList
            getFieldDecorator={getFieldDecorator}
            col={2}
            legend="薪资福利支付账户信息配置表"
          >
            {FieldListItemArray && FieldListItemArray.map(item => item)}
          </FieldList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default SalaryAccountEdit;
