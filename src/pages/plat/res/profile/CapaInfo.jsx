import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { Button, Card, Divider } from 'antd';
import classnames from 'classnames';
import { fromQs } from '@/utils/stringUtils';
import { closeThenGoto, markAsTab, closeTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import Title from '@/components/layout/Title';
import FieldList from '@/components/layout/FieldList';
import DescriptionList from '@/components/layout/DescriptionList';
import { formatMessage } from 'umi/locale';
import { stringify } from 'qs';
import CapaTreeTransfer from './CapaTreeTransfer';
import CapasetTreeTransfer from './CapasetTreeTransfer';

const DOMAIN = 'platResProfileCapa';

const { Description } = DescriptionList;

@connect(({ loading, platResProfileCapa }) => ({
  platResProfileCapa,
  loading: loading.effects[`${DOMAIN}/query`],
}))
class CapaInfo extends PureComponent {
  componentDidMount() {
    this.fetchData();
  }

  fetchData = params => {
    const { dispatch } = this.props;
    const { id } = fromQs();
    dispatch({
      type: `${DOMAIN}/query`,
      payload: { resId: id },
    });
    dispatch({
      type: `${DOMAIN}/queryApprStatus`,
      payload: { resId: id },
    });
  };

  render() {
    // 获取url上的参数
    const {
      platResProfileCapa: { apprStatus },
    } = this.props;
    const param = fromQs();
    return (
      <PageHeaderWrapper>
        {param.resNo ? (
          <Card className="tw-card-rightLine">
            <Button
              className={classnames('separate', 'tw-btn-default')}
              icon="undo"
              size="large"
              onClick={() => {
                const { urlFrom, from } = fromQs();
                if (urlFrom) {
                  closeThenGoto(markAsTab(urlFrom));
                } else if (from) {
                  closeThenGoto(markAsTab(from));
                } else {
                  closeThenGoto('/hr/res/profile/list');
                }
              }}
            >
              {formatMessage({ id: `misc.rtn`, desc: '返回' })}
            </Button>
          </Card>
        ) : (
          <Card className="tw-card-rightLine">
            <Button
              className="tw-btn-primary"
              icon="save"
              size="large"
              onClick={() => {
                const { from } = fromQs();
                if (from) {
                  const fromUrl = stringify({ from });
                  closeThenGoto(`/hr/res/profile/list/projectExperience?id=${param.id}&${fromUrl}`);
                } else {
                  closeThenGoto(`/hr/res/profile/list/projectExperience?id=${param.id}`);
                }
              }}
            >
              {formatMessage({ id: `misc.prevstep`, desc: '上一步' })}
            </Button>
            <Button
              className="tw-btn-primary"
              icon="save"
              size="large"
              onClick={() => {
                const { from } = fromQs();
                if (from && from.includes('internalFlow')) {
                  const record = window.location.pathname + window.location.search;
                  router.push(markAsTab(from));
                  closeTab(record);
                } else {
                  closeThenGoto('/hr/res/profile/list');
                }
              }}
            >
              完成
            </Button>
            {/* <Button
              className="tw-btn-primary"
              icon="save"
              size="large"
              disabled={apprStatus !== 'NOTSUBMIT'}
              onClick={() => closeThenGoto(`/hr/res/profile/list/resEnroll?id=${param.id}`)}
            >
              入职申请
            </Button> */}
          </Card>
        )}

        <Card
          className="tw-card-adjust"
          title={
            <Title icon="profile" id="ui.menu.plat.res.resCapacity" defaultMessage="资源能力信息" />
          }
          bordered={false}
        >
          {param.resNo ? (
            <>
              <DescriptionList size="large" title="基本信息" col={2}>
                <Description term="资源编号">{param.resNo}</Description>
                <Description term="姓名">{param.resName}</Description>
              </DescriptionList>
              <Divider dashed />
            </>
          ) : (
            ''
          )}
          <FieldList legend="复合能力" noReactive>
            <CapasetTreeTransfer resId={param.id} />
          </FieldList>
          <Divider dashed />
          <FieldList legend="单项能力" noReactive>
            <CapaTreeTransfer resId={param.id} />
          </FieldList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default CapaInfo;
