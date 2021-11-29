import React, { Component, PureComponent } from 'react';
import FormItem from '@/components/production/business/FormItem';
import PageWrapper from '@/components/production/layout/PageWrapper';
import EditTable from '@/components/production/business/EditTable';
import update from 'immutability-helper';
import { genFakeId } from '@/utils/production/mathUtils';
import { ProductTableColumnsBlockConfig } from '@/utils/pageConfigUtils';

class FormComponent extends PureComponent {
  componentDidMount() {}

  // 配置所需要的内容
  renderColumns = () => {
    const { dispatch, form, pageConfig } = this.props;

    const fields = [
      {
        title: '收支项目编码',
        align: 'center',
        dataIndex: 'szxmid',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInput"
            fieldKey={`detailEntities[${index}].szxmid`}
            disabled
          />
        ),
      },
      {
        title: '摘要',
        align: 'center',
        dataIndex: 'zy',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInput"
            fieldKey={`detailEntities[${index}].zy`}
            disabled
          />
        ),
      },
      {
        title: '交易对象类型',
        align: 'center',
        dataIndex: 'tradertype',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInput"
            fieldKey={`detailEntities[${index}].tradertype`}
            disabled
          />
        ),
      },
      {
        title: '部门',
        align: 'center',
        dataIndex: 'deptid',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInput"
            fieldKey={`detailEntities[${index}].deptid`}
            disabled
          />
        ),
      },
      {
        title: '业务员',
        align: 'center',
        dataIndex: 'ywybm',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInput"
            fieldKey={`detailEntities[${index}].ywybm`}
            disabled
          />
        ),
      },
      {
        title: '本币汇率',
        align: 'center',
        dataIndex: 'bbhl',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInputNumber"
            fieldKey={`detailEntities[${index}].bbhl`}
            formatter={value => (value ? `${value}` : '')}
            disabled
          />
        ),
      },
      {
        title: '借方本币金额',
        align: 'center',
        dataIndex: 'jfbbje',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInputAmt"
            fieldKey={`detailEntities[${index}].jfbbje`}
            disabled
          />
        ),
      },
      {
        title: '贷方原币金额',
        align: 'center',
        dataIndex: 'dfybje',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInputAmt"
            fieldKey={`detailEntities[${index}].dfybje`}
            disabled
          />
        ),
      },
      {
        title: '贷方原币税金',
        align: 'center',
        dataIndex: 'dfybsj',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInputAmt"
            fieldKey={`detailEntities[${index}].dfybsj`}
            disabled
          />
        ),
      },
      {
        title: '贷方原币无税金额',
        align: 'center',
        dataIndex: 'dfybwsje',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInputAmt"
            fieldKey={`detailEntities[${index}].dfybwsje`}
            disabled
          />
        ),
      },
      {
        title: '贷方本币金额',
        align: 'center',
        dataIndex: 'dfbbje',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInputAmt"
            fieldKey={`detailEntities[${index}].dfbbje`}
            disabled
          />
        ),
      },
      {
        title: '贷方本币税金',
        align: 'center',
        dataIndex: 'dfbbsj',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInputAmt"
            fieldKey={`detailEntities[${index}].dfbbsj`}
            disabled
          />
        ),
      },
      {
        title: '贷方本币无税金额',
        align: 'center',
        dataIndex: 'dfbbwsje',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInputAmt"
            fieldKey={`detailEntities[${index}].dfbbwsje`}
            disabled
          />
        ),
      },
      {
        title: '存货编码',
        align: 'center',
        dataIndex: 'cinventoryid',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInput"
            fieldKey={`detailEntities[${index}].cinventoryid`}
            disabled
          />
        ),
      },
      {
        title: '订单号',
        align: 'center',
        dataIndex: 'ddh',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInput"
            fieldKey={`detailEntities[${index}].ddh`}
            disabled
          />
        ),
      },
      {
        title: '贷方数量',
        align: 'center',
        dataIndex: 'dfshl',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInputNumber"
            fieldKey={`detailEntities[${index}].dfshl`}
            disabled
          />
        ),
      },
      {
        title: '单价',
        align: 'center',
        dataIndex: 'dj',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInputAmt"
            fieldKey={`detailEntities[${index}].dj`}
            disabled
          />
        ),
      },
      {
        title: '发票号',
        align: 'center',
        dataIndex: 'fph',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInput"
            fieldKey={`detailEntities[${index}].fph`}
            disabled
          />
        ),
      },
      {
        title: '含税单价',
        align: 'center',
        dataIndex: 'hsdj',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInputAmt"
            fieldKey={`detailEntities[${index}].hsdj`}
            disabled
          />
        ),
      },
      {
        title: '借方本币税金',
        align: 'center',
        dataIndex: 'jfbbsj',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInputAmt"
            fieldKey={`detailEntities[${index}].jfbbsj`}
            disabled
          />
        ),
      },
      {
        title: '借方数量',
        align: 'center',
        dataIndex: 'jfshl',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInputNumber"
            fieldKey={`detailEntities[${index}].jfshl`}
            disabled
          />
        ),
      },
      {
        title: '借方原币税金',
        align: 'center',
        dataIndex: 'jfybje',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInputAmt"
            fieldKey={`detailEntities[${index}].jfybje`}
            disabled
          />
        ),
      },
      {
        title: '借方原币金额',
        align: 'center',
        dataIndex: 'jfybsj',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInputAmt"
            fieldKey={`detailEntities[${index}].jfybsj`}
            disabled
          />
        ),
      },
      {
        title: '借方原币无税金额',
        align: 'center',
        dataIndex: 'jfybwsje',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInputAmt"
            fieldKey={`detailEntities[${index}].jfybwsje`}
            disabled
          />
        ),
      },
      {
        title: '项目编码',
        align: 'center',
        dataIndex: 'kmbm',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInput"
            fieldKey={`detailEntities[${index}].kmbm`}
            disabled
          />
        ),
      },
      {
        title: '扣税类别',
        align: 'center',
        dataIndex: 'kslb',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInput"
            fieldKey={`detailEntities[${index}].kslb`}
            disabled
          />
        ),
      },
      {
        title: '收付款协议',
        align: 'center',
        dataIndex: 'sfkxyh',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInput"
            fieldKey={`detailEntities[${index}].sfkxyh`}
            disabled
          />
        ),
      },
      {
        title: '税率',
        align: 'center',
        dataIndex: 'sl',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInputNumber"
            fieldKey={`detailEntities[${index}].sl`}
            max={100}
            min={0}
            formatter={value => (value ? `${value}%` : '')}
            parser={value => value.replace('%', '')}
            disabled
          />
        ),
      },
      {
        title: '借方本币无税金额',
        align: 'center',
        dataIndex: 'wbfbbje',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInputAmt"
            fieldKey={`detailEntities[${index}].wbfbbje`}
            disabled
          />
        ),
      },
      {
        title: '固定资产编号',
        align: 'center',
        dataIndex: 'facardbh',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInput"
            fieldKey={`detailEntities[${index}].facardbh`}
            disabled
          />
        ),
      },
    ];
    const fieldsConfig = pageConfig
      ? ProductTableColumnsBlockConfig(pageConfig, 'blockKey', 'EXPENSE_QUOTA_D_TABLT', fields)
      : fields;

    return fieldsConfig;
  };

  render() {
    const { dispatch, detailEntities, form, domain, delIds, loading } = this.props;
    return (
      <PageWrapper>
        <EditTable
          title="应收单明细"
          form={form}
          columns={this.renderColumns()}
          dataSource={detailEntities}
          // onAddClick={() => {
          //   dispatch({
          //     type: `${domain}/updateForm`,
          //     payload: {
          //       detailEntities: update(detailEntities, {
          //         $push: [
          //           {
          //             id: genFakeId(-1),
          //           },
          //         ],
          //       }),
          //     },
          //   });
          // }}
          // onDeleteConfirm={keys => {
          //   const newDataSource = detailEntities.filter(row => keys.indexOf(row.id) < 0);
          //   dispatch({
          //     type: `${domain}/updateForm`,
          //     payload: {
          //       detailEntities: newDataSource,
          //     },
          //   });
          //   dispatch({
          //     type: `${domain}/updateState`,
          //     payload: {
          //       delIds: [...delIds, ...keys],
          //     },
          //   });
          // }}
          scroll={{ x: 4500 }}
          loading={loading || false}
        />
      </PageWrapper>
    );
  }
}

export default FormComponent;
