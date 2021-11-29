import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { formatMessage } from 'umi/locale';
import { isEmpty } from 'ramda';
import classnames from 'classnames';
import { Button, Form, Card, Input, Select, Divider } from 'antd';
import AsyncSelect from '@/components/common/AsyncSelect';
import { FileManagerEnhance, UdcSelect } from '@/pages/gen/field';
import DescriptionList from '@/components/layout/DescriptionList';
import Title from '@/components/layout/Title';
import { getUrl } from '@/utils/flowToRouter';
import { stringify } from 'qs';

import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import FieldList from '@/components/layout/FieldList';
import { fromQs } from '@/utils/stringUtils';

const { Field } = FieldList;
const DOMAIN = 'customer';
const { Option } = Select;
const { Description } = DescriptionList;

@connect(({ loading, dispatch, customer }) => ({
  loading,
  dispatch,
  customer,
}))
@mountToTab()
class CustomerDetail extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { id } = fromQs();
    dispatch({
      type: `${DOMAIN}/customerDetails`,
      payload: id,
    });
  }

  handleCancel = () => {
    const { from } = fromQs();
    closeThenGoto(from);
  };

  render() {
    const {
      loading,
      form,
      customer: { formData },
    } = this.props;
    const urls = getUrl();
    const from = stringify({ from: urls });

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            type="primary"
            icon="save"
            size="large"
            onClick={() => {
              const { id } = fromQs();
              const { abNo } = formData;
              if (abNo) {
                router.push(`/sale/management/customerInfoEdit?id=${id}&no=${abNo}&${from}`);
              } else {
                router.push(`/sale/management/customerInfoEdit?id=${id}&${from}`);
              }
            }}
          >
            {formatMessage({ id: `misc.update`, desc: '修改' })}
          </Button>
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
        <Card
          className="tw-card-adjust"
          bordered={false}
          style={{ marginTop: '6px' }}
          title={
            <Title
              icon="profile"
              id="ui.menu.user.management.customerDetails"
              defaultMessage="客户详情"
            />
          }
        >
          <DescriptionList size="large" col={2} title="企业基本信息">
            <Description term="公司名称">{formData.custName || ''}</Description>
            <Description term="区域/省份/城市">
              {formData.custRegIonName ? formData.custRegIonName + '/' : ''}
              {formData.provInceName ? formData.provInceName + '/' : ''}
              {formData.cityName}
            </Description>
            <Description term="总机固话">{formData.switchBoard || ''}</Description>
            <Description term="公司邮箱">{formData.companyEmail || ''}</Description>
          </DescriptionList>
          <DescriptionList size="large" col={1}>
            <Description term="公司总部地址">
              <pre>{formData.headOfficeAddr || ''}</pre>
            </Description>
          </DescriptionList>
          <DescriptionList size="large" col={2}>
            <Description term="客户标签1">{formData.custLabel1 || ''}</Description>
            <Description term="客户标签2">{formData.custLabel2 || ''}</Description>
            <Description term="客户标签3">{formData.custLabel3 || ''}</Description>
            <Description term="客户标签4">{formData.custLabel4 || ''}</Description>
            <Description term="客户标签5">{formData.custLabel5 || ''}</Description>
            <Description term="客户标签6">{formData.custLabel6 || ''}</Description>
            <Description term="客户标签7">{formData.custLabel7 || ''}</Description>
            <Description term="客户标签8">{formData.custLabel8 || ''}</Description>
            <Description term="客户标签9">{formData.custLabel9 || ''}</Description>
            <Description term="客户标签10">{formData.custLabel10 || ''}</Description>
          </DescriptionList>
          <DescriptionList size="large" col={1}>
            <Description term="数据来源">{formData.dataFrom || ''}</Description>
          </DescriptionList>
          <DescriptionList size="large" col={1}>
            <Description term="备注">
              <pre>{formData.remark || ''}</pre>
            </Description>
          </DescriptionList>
          <Divider dashed />
          <DescriptionList size="large" col={2} title="企业主要联系人">
            <Description term="董事长(总经理)-姓名/电话/邮箱" labelWidth="260">
              {formData.chairManName ? formData.chairManName + '/' : ''}
              {formData.chairManTel ? formData.chairManTel + '/' : ''}
              {formData.chairManEmail}
            </Description>
            <Description term="IT负责人-姓名/电话/邮箱" labelWidth="260">
              {formData.itAdminName ? formData.itAdminName + '/' : ''}
              {formData.itAdminTel ? formData.itAdminTel + '/' : ''}
              {formData.itAdminEmail}
            </Description>
            <Description term="其他负责人-姓名/电话/邮箱" labelWidth="260">
              {formData.otherPicName ? formData.otherPicName + '/' : ''}
              {formData.otherPicTel ? formData.otherPicTel + '/' : ''}
              {formData.otherPicEmail}
            </Description>
          </DescriptionList>
          <Divider dashed />
          <DescriptionList size="large" col={2} title="管理信息">
            <Description term="状态">{formData.custStatusName || ''}</Description>
            <Description term="数据完善度(%)">{formData.dataInteGrity || ''}</Description>
            <Description term="数据校验人">{formData.dataCheckerName || ''}</Description>
            <Description term="销售VP">{formData.saleVpName || ''}</Description>
            <Description term="销售负责人">{formData.salePicName || ''}</Description>
            <Description term="数据派发日期">{formData.assingDate || ''}</Description>
          </DescriptionList>
          <DescriptionList size="large" col={2}>
            <Description term="数据最后校验日期">{formData.lastCheckDate || ''}</Description>
            <Description term="数据最后更新日期">{formData.lastModifyDate || ''}</Description>
          </DescriptionList>
          <DescriptionList size="large" col={1}>
            <Description term="更新履历">
              <pre>{formData.modifyRecord || ''}</pre>
            </Description>
          </DescriptionList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default CustomerDetail;
