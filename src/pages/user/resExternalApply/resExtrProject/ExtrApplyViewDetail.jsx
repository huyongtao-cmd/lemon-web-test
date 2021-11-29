import React, { Component } from 'react';
import { connect } from 'dva';
import { Card } from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DescriptionList from '@/components/layout/DescriptionList';
import { fromQs } from '@/utils/stringUtils';

const { Description } = DescriptionList;

const DOMAIN = 'extrApplyflowCreate';

@connect(({ loading, extrApplyflowCreate, dispatch }) => ({
  dispatch,
  loading,
  extrApplyflowCreate,
}))
@mountToTab()
class ExtrApplyViewDetail extends Component {
  componentDidMount() {
    const { dispatch } = this.props;

    dispatch({ type: `${DOMAIN}/clean` });

    const { id } = fromQs();
    id &&
      dispatch({
        type: `${DOMAIN}/query`,
        payload: { id },
      });
  }

  render() {
    const {
      loading,
      dispatch,
      extrApplyflowCreate: { formData, resultChkList },
    } = this.props;

    const tableProps = {
      sortBy: 'id',
      rowKey: 'id',
      sortDirection: 'DESC',
      columnsCache: DOMAIN,
      loading: loading.effects[`${DOMAIN}/checkresult`],
      showColumn: false,
      onRow: () => {},
      showSearch: false,
      showExport: false,
      // pagination: false,
      enableSelection: false,
      rowSelection: {
        getCheckboxProps: (rowKey, rows) => {
          if (rowKey.checkNethod === 'AUTO') {
            return false;
          }
          return true;
        },
      },
      enableDoubleClick: false,
    };
    return (
      <PageHeaderWrapper>
        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={<Title icon="profile" text="外部资源引入申请流程" />}
          bordered={false}
        >
          <DescriptionList size="large" col={2}>
            <Description term="姓名">{formData.personName || ''}</Description>
            <Description term="性别">{formData.genderName || ''}</Description>
            <Description term="手机号">{formData.mobile || ''}</Description>
            <Description term="资源类型">
              {formData.resType1Name || ''}-{formData.resType2Name || ''}
            </Description>
            <Description term="BaseBU">{formData.buName || ''}</Description>
            <Description term="上级">{formData.presName || ''}</Description>
            <Description term="合作方式">{formData.coopTypeName || ''}</Description>
            <Description term="当量系数">{formData.eqvaRatio || ''}</Description>
            <Description term="开通邮箱">
              {formData.emailFlag && formData.emailFlag === '1' && <pre>是</pre>}
              {formData.emailFlag && formData.emailFlag === '0' && <pre>否</pre>}
              {!formData.emailFlag && <pre />}
            </Description>
            <Description term="开通E-Learning账号">
              {formData.elpFlag && formData.elpFlag === '1' && <pre>是</pre>}
              {formData.elpFlag && formData.elpFlag === '0' && <pre>否</pre>}
              {!formData.elpFlag && <pre />}
            </Description>
            <Description term="入职类型">{formData.entryTypeName || ''}</Description>
            <Description term="长期/短期">
              {formData.periodFlag === 'LONG' && '长期资源'}
              {formData.periodFlag === 'SHORT' && '短期资源'}
            </Description>
            <Description term="工种分类一">{formData.jobClass1Name || ''}</Description>
            <Description term="工种分类二">{formData.jobClass2Name || ''}</Description>
            <Description term="复合能力">{formData.jobCapaSetName || ''}</Description>
            <Description term="邮箱">{formData.email || ''}</Description>
            <Description term="E-Learning账号">{formData.elpId || ''}</Description>
            <Description term="TW账号">{formData.mobile || ''}</Description>
          </DescriptionList>
          <DescriptionList size="large" col={1}>
            <Description term="备注">
              <pre>{formData.remark}</pre>
            </Description>
          </DescriptionList>
          <DescriptionList size="large" col={2}>
            <Description term="申请人">{formData.applyResName || ''}</Description>
            <Description term="申请时间">{formData.applyDate || ''}</Description>
          </DescriptionList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default ExtrApplyViewDetail;
