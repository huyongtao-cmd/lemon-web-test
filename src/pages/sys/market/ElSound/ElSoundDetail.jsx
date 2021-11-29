import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import classnames from 'classnames';
import { Button, Card, Tag } from 'antd';
import { FileManagerEnhance, UdcSelect } from '@/pages/gen/field';

import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DescriptionList from '@/components/layout/DescriptionList';
import { fromQs } from '@/utils/stringUtils';
import styles from '../../../user/center/message/index.less';
import FormItem from '@/components/production/business/FormItem.tsx';

const { Description } = DescriptionList;
const DOMAIN = 'sysMarketElSoundEdit';

@connect(({ loading, dispatch, sysMarketElSoundEdit }) => ({
  loading,
  dispatch,
  sysMarketElSoundEdit,
}))
@mountToTab()
class SystemRoleDetail extends PureComponent {
  componentDidMount() {
    const param = fromQs().id;
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/getDetails`,
      payload: param,
    });
  }

  handleCancel = () => {
    closeThenGoto('/workTable/home');
  };

  render() {
    const {
      dispatch,
      loading,
      sysMarketElSoundEdit: { formData, attachments },
      // form: { getFieldDecorator, setFieldsValue, getFieldValue },
    } = this.props;
    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
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
          <DescriptionList size="large" col={2} title="基本信息">
            <Description term="新闻标题">
              {formData.artTitle}
              &nbsp;&nbsp;&nbsp;
              <span
                style={{
                  display: 'inline-block',
                  width: '15px',
                  height: '15px',
                  backgroundColor: formData.artTitleColor,
                  verticalAlign: 'middle',
                }}
              />
            </Description>
            <Description term="摘要">{formData.artSubTitle}</Description>
          </DescriptionList>
          <DescriptionList size="large" col={2}>
            <Description term="分类">{formData.categoryCodeName}</Description>
            <Description term="类型">{formData.artTypeName}</Description>
          </DescriptionList>
          <DescriptionList size="large" col={2}>
            <Description style={{ display: 'none' }} term="链接">
              {formData.artUrl}
            </Description>
            <Description term="作者">{formData.artAuthor}</Description>
          </DescriptionList>
          <DescriptionList size="large" col={2}>
            <Description term="来源">{formData.artSource}</Description>
            <Description term="是否置顶">{formData.artOrtop ? '是' : '否'}</Description>
          </DescriptionList>
          <DescriptionList size="large" col={2}>
            <Description term="排序">{formData.artSort}</Description>
            <Description term="阅读次数">{formData.readCount}</Description>
          </DescriptionList>
          <DescriptionList size="large" col={2}>
            <Description term="公告范围类型">{formData.noticeScopeDes}</Description>
            <Description term="公告范围">{formData.objIdDes}</Description>
          </DescriptionList>
          <DescriptionList style={{ display: 'none' }} size="large" col={2}>
            <Description term="缩略图">
              {/* <FileManagerEnhance
                api="/api/op/v1/article/sfs/token"
                dataKey={formData.id}
                listType="picture"
                disabled
                preview
              /> */}
              <FormItem
                fieldType="FileUpload"
                fieldKey="attach"
                label="缩略图"
                fileList={attachments}
                preview
              />
            </Description>
          </DescriptionList>
          <DescriptionList size="large" col={1}>
            <Description term="备注">{formData.remark}</Description>
          </DescriptionList>
          <div
            className={`${
              styles.paper
            } ant-col-xs-20 ant-col-sm-20 ant-col-md-20 ant-col-lg-20 ant-col-xl-18 ant-col-xxl-15`}
            dangerouslySetInnerHTML={{ __html: formData.artContent }}
          />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default SystemRoleDetail;
