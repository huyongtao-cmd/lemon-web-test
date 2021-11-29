import React, { PureComponent } from 'react';
import { connect } from 'dva';
import DescriptionList from '@/components/layout/DescriptionList';
import Loading from '@/components/core/DataLoading';

const DOMAIN = 'orgbu';

const { Description } = DescriptionList;

@connect(({ orgbu }) => ({ orgbu }))
class BuCatsInfo extends PureComponent {
  componentDidMount() {
    const { dispatch, buId } = this.props;
    dispatch({
      type: `${DOMAIN}/findCats`,
      payload: buId,
    });
  }

  render() {
    const { orgbu } = this.props;
    const { catData } = orgbu;

    return (
      <>
        {catData ? (
          <DescriptionList size="large">
            <Description term="管理区域">{catData.regionCodeDesc}</Description>
            <Description term="结算类型码">{catData.settleTypeDesc}</Description>
            <Description term="类别1">{catData.buCat1Desc}</Description>
            <Description term="类别2">{catData.buCat2Desc}</Description>
            <Description term="类别3">{catData.buCat3Desc}</Description>
            <Description term="类别4">{catData.buCat4Desc}</Description>
            <Description term="类别5">{catData.buCat5Desc}</Description>
            <Description term="类别6">{catData.buCat6Desc}</Description>
            <Description term="类别7">{catData.buCat7Desc}</Description>
            <Description term="类别8">{catData.buCat8Desc}</Description>
            <Description term="类别9">{catData.buCat9Desc}</Description>
            <Description term="类别10">{catData.buCat10Desc}</Description>
            <Description term="类别11">{catData.buCat11Desc}</Description>
            <Description term="类别12">{catData.buCat12Desc}</Description>
            <Description term="类别13">{catData.buCat13Desc}</Description>
            <Description term="类别14">{catData.buCat14Desc}</Description>
            <Description term="类别15">{catData.buCat15Desc}</Description>
            <Description term="类别16">{catData.buCat16Desc}</Description>
            <Description term="类别17">{catData.buCat17Desc}</Description>
            <Description term="类别18">{catData.buCat18Desc}</Description>
            <Description term="类别19">{catData.buCat19Desc}</Description>
            <Description term="类别20">{catData.buCat20Desc}</Description>
          </DescriptionList>
        ) : (
          <Loading />
        )}
      </>
    );
  }
}

export default BuCatsInfo;
