import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Divider, Icon, Input } from 'antd';
import { formatMessage } from 'umi/locale';
import DataTable from '@/components/common/DataTable';
import FieldList from '@/components/layout/FieldList';
import SelectWithCols from '@/components/common/SelectWithCols';
import { UdcSelect } from '@/pages/gen/field';
import { financeColumns, subjCol } from '../config/index';

const { Field } = FieldList;

@connect(({ loading, dispatch }) => ({
  loading,
  dispatch,
}))
class BuTemplateDetail extends PureComponent {
  state = {
    dataSource: [],
  };

  componentDidMount() {
    const {
      dispatch,
      domain,
      sysButempDetail: { formData },
    } = this.props;
    dispatch({ type: `${domain}/queryFinanceCalendarSelect` });
    dispatch({ type: `${domain}/queryAccTmplSelect`, payload: { tmplClass: 'BU_ACC' } }).then(
      () => {
        this.fetchData(formData.accTmplId);
      }
    );
  }

  // param需传入accTmplId
  fetchData = param => {
    const {
      dispatch,
      domain,
      sysButempDetail: { subjtempList },
    } = this.props;
    dispatch({ type: `${domain}/queryFinanceList`, payload: { accTmplId: param } });
    this.setState({
      dataSource: subjtempList,
    });
  };

  render() {
    const {
      loading,
      domain,
      form: { getFieldDecorator },
      sysButempDetail: { formData, subjtempList, financeList, finCalendarList },
    } = this.props;
    const { dataSource } = this.state;
    return (
      <div>
        <FieldList
          layout="horizontal"
          legend={formatMessage({ id: `app.settings.menuMap.basic`, desc: '基本信息' })}
          getFieldDecorator={getFieldDecorator}
          col={2}
        >
          <Field
            name="accTmplId"
            label={formatMessage({ id: `sys.baseinfo.buTemplate.accTmpl`, desc: '科目模板' })}
            prefix={<Icon type="user" />}
            decorator={{
              trigger: 'onBlur',
              initialValue: formData.accTmplId
                ? { code: formData.accTmplNo, name: formData.accTmplName }
                : undefined,
              rules: [
                {
                  required: true,
                  message:
                    formatMessage({ id: `app.hint.select`, desc: '请选择' }) +
                    formatMessage({ id: `sys.baseinfo.buTemplate.accTmpl`, desc: '科目模板' }),
                },
              ],
            }}
          >
            <SelectWithCols
              // 选择框里展示的那个字段
              labelKey="name"
              columns={subjCol}
              dataSource={dataSource}
              onChange={value => {
                value ? this.fetchData(value.id) : this.fetchData(null);
              }}
              selectProps={{
                showSearch: true,
                onSearch: value => {
                  this.setState({
                    dataSource: subjtempList.filter(
                      d =>
                        d.code.indexOf(value) > -1 ||
                        d.name.toLowerCase().indexOf(value.toLowerCase()) > -1
                    ),
                  });
                },
                allowClear: true,
                style: { width: '100%' },
              }}
            />
          </Field>

          <Field
            name="finCalendarId"
            label={formatMessage({
              id: `sys.baseinfo.buTemplate.finCalendar`,
              desc: '财务日历格式',
            })}
            decorator={{
              initialValue: formData.finCalendarId,
              rules: [
                {
                  required: true,
                  message:
                    formatMessage({ id: `app.hint.input`, desc: '请输入' }) +
                    formatMessage({
                      id: `sys.baseinfo.buTemplate.finCalendar`,
                      desc: '财务日历格式',
                    }),
                },
              ],
            }}
          >
            <UdcSelect source={finCalendarList} />
            {/* <Input
              placeholder={
                formatMessage({ id: `app.hint.input`, desc: '请输入' }) +
                formatMessage({ id: `sys.baseinfo.buTemplate.finCalendar`, desc: '财务日历格式' })
              }
            /> */}
          </Field>

          <Field
            name="currCode"
            label={formatMessage({ id: `sys.baseinfo.buTemplate.currCode`, desc: '币种' })}
            decorator={{
              initialValue: formData.currCode,
              rules: [
                {
                  required: true,
                  message:
                    formatMessage({ id: `app.hint.input`, desc: '请输入' }) +
                    formatMessage({ id: `sys.baseinfo.buTemplate.currCode`, desc: '币种' }),
                },
              ],
            }}
          >
            <UdcSelect code="COM.CURRENCY_KIND" />
          </Field>
        </FieldList>

        <div>
          <Divider dashed />
          <div className="tw-card-title">
            {formatMessage({ id: `app.settings.menuMap.financeSubj`, desc: '财务科目' })}
          </div>
          <div style={{ margin: 12 }}>
            <DataTable
              showColumn={false}
              showSearch={false}
              enableSelection={false}
              domain={domain}
              loading={loading.effects[`${domain}/queryFinanceList`]}
              dataSource={financeList}
              columns={financeColumns}
              rowKey="id"
            />
          </div>
        </div>
      </div>
    );
  }
}

export default BuTemplateDetail;
