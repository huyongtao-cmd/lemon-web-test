import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
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
import { getUrl } from '@/utils/flowToRouter';
import { stringify } from 'qs';

const { Field, FieldLine } = FieldList;
const RadioGroup = Radio.Group;
const { Description } = DescriptionList;

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

const DOMAIN = 'recruitEdit';

@connect(({ loading, recruitEdit, dispatch }) => ({
  loading,
  recruitEdit,
  dispatch,
}))
@mountToTab()
class RecruitView extends PureComponent {
  componentDidMount() {
    const { dispatch, user } = this.props;
    const { id } = fromQs();
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        formData: {},
      },
    });
    dispatch({
      type: `${DOMAIN}/queryDetail`,
      payload: {
        id,
      },
    });
  }

  handleSubmit = () => {
    const { id } = fromQs();
    const url = stringify({ from: getUrl() });
    router.push(`/hr/res/profile/internal/edit?id=${id}&${url}`);
  };

  render() {
    const {
      loading,
      dispatch,
      recruitEdit: { formData },
    } = this.props;

    // loading完成之前将按钮设为禁用
    const innerQueryBtn = loading.effects[`${DOMAIN}/queryDetail`];

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            icon="save"
            size="large"
            onClick={this.handleSubmit}
            disabled={innerQueryBtn}
          >
            内部推荐
          </Button>

          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => {
              const { from } = fromQs();
              closeThenGoto(`${from}?_refresh=0`);
            }}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>

        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={
            <Title icon="profile" id="ui.menu.plat.res.recruitView" defaultMessage="招聘岗位详情" />
          }
          bordered={false}
        >
          <DescriptionList size="large" col={2}>
            <Description term="编号">{formData.jobNo || ''}</Description>
            <Description term="岗位名称">{formData.jobName || ''}</Description>
            <Description term="招聘部门">{formData.buName || ''}</Description>
            <Description term="分类">
              {formData.jobType1Name || ''}
              {formData.jobType2Name ? '-' : ''}
              {formData.jobType2Name || ''}
            </Description>
            <Description term="工作地">{formData.workplaceDesc || ''}</Description>
            <Description term="工作地补充说明">{formData.workplaceAdd || ''}</Description>
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
            <Description term="外部资源可见">
              {formData.canSee && formData.canSee === 'YES' && '是'}
              {formData.canSee && formData.canSee === 'NO' && '否'}
            </Description>
            <Description term="状态">{formData.recruitStatusDesc || ''}</Description>
            <Description term="招聘负责人">{formData.recommPicName || ''}</Description>
            <Description term="创建日期">{formData.createTime || ''}</Description>
          </DescriptionList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default RecruitView;
