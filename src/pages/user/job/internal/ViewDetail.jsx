import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import classnames from 'classnames';
import { isEmpty } from 'ramda';
import { Button, Card, Form, Input, Radio, InputNumber, Select } from 'antd';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';
import { FileManagerEnhance, Selection } from '@/pages/gen/field';
import DescriptionList from '@/components/layout/DescriptionList';

const { Field, FieldLine } = FieldList;
const RadioGroup = Radio.Group;
const { Description } = DescriptionList;

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

const DOMAIN = 'internalFlow';

@connect(({ loading, internalFlow, dispatch }) => ({
  loading,
  internalFlow,
  dispatch,
}))
@mountToTab()
class ViewDetail extends PureComponent {
  componentDidMount() {
    const { dispatch, user } = this.props;
    const { id } = fromQs();
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        formData: {},
      },
    });
    !id && dispatch({ type: `${DOMAIN}/queryUserMessage` }); // 无id，新增，拉去个人信息
    // 有id，修改
    id &&
      dispatch({
        type: `${DOMAIN}/queryDetail`,
        payload: {
          id,
        },
      });
  }

  render() {
    const {
      loading,
      dispatch,
      internalFlow: { formData },
    } = this.props;

    // loading完成之前将按钮设为禁用
    const innerQueryBtn = loading.effects[`${DOMAIN}/queryDetail`];

    return (
      <PageHeaderWrapper>
        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={
            <Title icon="profile" id="ui.menu.plat.res.jobInternal" defaultMessage="岗位内部推荐" />
          }
          bordered={false}
        >
          <DescriptionList title="招聘岗位" size="large" col={2}>
            <Description term="岗位">
              {formData.jobNo || ''}
              {formData.jobNo ? '-' : ''}
              {formData.jobName}
            </Description>
            <Description term="招聘部门">{formData.buName || ''}</Description>
            <Description term="分类">
              {formData.jobType1Name || ''}
              {formData.jobType2Name ? '-' : ''}
              {formData.jobType2Name || ''}
            </Description>
            <Description term="工作地">
              {formData.workplaceDesc || ''}
              {formData.workplaceDesc ? '-' : ''}
              {formData.workplaceAdd || ''}
            </Description>
            <Description term="招聘人数">{formData.recruitment || ''}</Description>
            <Description term="兼职|全职">
              {formData.fullPart && formData.fullPart === 'FULL' && '全职'}
              {formData.fullPart && formData.fullPart === 'PART' && '兼职'}
            </Description>
            <Description term="服务方式">{formData.workStyleDesc || ''}</Description>
            <Description term="时间要求">{formData.timeRequirementDesc || ''}</Description>
          </DescriptionList>
          <DescriptionList size="large" col={1}>
            <Description term="岗位简介">
              <pre>{formData.jobInfo || ''}</pre>
            </Description>
          </DescriptionList>
          <DescriptionList size="large" col={1}>
            <Description term="岗位要求">
              <pre>{formData.requirements || ''}</pre>
            </Description>
          </DescriptionList>
          <DescriptionList size="large" col={2}>
            <Description term="内部推荐">
              {formData.ntFlag && formData.ntFlag === 'YES' && '接受'}
              {formData.ntFlag && formData.ntFlag === 'NO' && '不接受'}
            </Description>
            <Description term="招聘状态">{formData.recruitStatusDesc || ''}</Description>
            <Description term="招聘负责人">{formData.recommPicName || ''}</Description>
            <Description term="创建日期">{formData.createTime || ''}</Description>
          </DescriptionList>
          <DescriptionList title="推荐信息" size="large" col={2}>
            <Description term="被推荐人">{formData.recommName || ''}</Description>
            <Description term="被推荐人手机号">{formData.recommMobile || ''}</Description>
            <Description term="被推荐人简历">
              <FileManagerEnhance
                api="/api/person/v1/jobInternalRecomm/sfs/token"
                dataKey={formData.id}
                listType="text"
                preview
              />
            </Description>
            <Description term="与推荐人关系">{formData.relationship || ''}</Description>
          </DescriptionList>
          <DescriptionList size="large" col={1}>
            <Description term="推荐理由">
              <pre>{formData.recommReason || ''}</pre>
            </Description>
          </DescriptionList>
          <DescriptionList size="large" col={2}>
            <Description term="推荐号">{formData.recommNo || ''}</Description>
            <Description term="推荐人">{formData.resName || ''}</Description>
            <Description term="推荐日期">{formData.recommDate || ''}</Description>
          </DescriptionList>
          <DescriptionList title="简历筛选结果" size="large" col={2}>
            <Description term="简历筛选结果">{formData.resumeResultDesc || ''}</Description>
            <Description term="奖励金额">{formData.resumeReward || ''}</Description>
            <Description term="是否已有档案">
              {formData.resFlag && formData.resFlag === 'YES' && '是'}
              {formData.resFlag && formData.resFlag === 'NO' && '否'}
            </Description>
            <Description term="关联档案">{formData.relatedResName || ''}</Description>
          </DescriptionList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default ViewDetail;
