import React, { Component } from 'react';
import { Select } from 'antd';
import PropTypes from 'prop-types';
import leveld4 from '@/assets/img/growth/icon_zhuli_default.svg';
import leveldSelect4 from '@/assets/img/growth/icon_zhuli_selected.svg';
import leveld3 from '@/assets/img/growth/icon_chuji_default.svg';
import leveldSelect3 from '@/assets/img/growth/icon_chuji_selected.svg';
import leveld2 from '@/assets/img/growth/icon_zhongji_default.svg';
import leveldSelect2 from '@/assets/img/growth/icon_zhongji_selected.svg';
import leveld1 from '@/assets/img/growth/icon_gaoji_default.svg';
import leveldSelect1 from '@/assets/img/growth/icon_gaoji_selected.svg';
import leveld0 from '@/assets/img/growth/icon_zhuanjia_default.svg';
import leveldSelect0 from '@/assets/img/growth/icon_zhuanjia_selected.svg';
import styles from '../../index.less';

class Tag extends Component {
  render() {
    const { item, index, selectTagIds, tagSelect, capaSetId, capasetLevelId } = this.props;
    const tagImg = [leveld0, leveld1, leveld2, leveld3, leveld4];
    const tagImgSelect = [
      leveldSelect0,
      leveldSelect1,
      leveldSelect2,
      leveldSelect3,
      leveldSelect4,
    ];
    const selectStatus = selectTagIds.includes(`${capaSetId},${item.leveldId},${capasetLevelId}`);
    const selectId = `${capaSetId},${item.leveldId},${capasetLevelId}`;
    let tagComponent = (
      <div
        className={
          selectStatus
            ? `${styles['level-tag-select']} ${styles['level-tag-wrap']}`
            : `${styles['level-tag-wrap']}`
        }
        onClick={() => {
          tagSelect(selectId);
        }}
      >
        <div className={styles['level-tag']}>
          <img src={tagImg[index] || tagImg[4]} alt="" />
          {item.leveldName}
        </div>
      </div>
    );
    if (item.haveLeveld) {
      tagComponent = (
        <div
          className={
            selectStatus
              ? `${styles['level-tag-select']} ${styles['level-tag-wrap']}`
              : `${styles['level-tag-wrap']}`
          }
          onClick={() => {
            tagSelect(selectId);
          }}
        >
          <div className={`${styles['level-tag-get']} ${styles['level-tag']}`}>
            <img src={tagImg[index] || tagImg[4]} alt="" />
            {item.leveldName}
          </div>
        </div>
      );
    }

    if (item.haveNextLeveld) {
      tagComponent = (
        <div
          className={
            selectStatus
              ? `${styles['level-tag-select']} ${styles['level-tag-wrap']}`
              : `${styles['level-tag-wrap']}`
          }
          onClick={() => {
            tagSelect(selectId);
          }}
        >
          <div className={`${styles['level-tag-next']} ${styles['level-tag']}`}>
            <img src={tagImg[index] || tagImg[4]} alt="" />
            {item.leveldName}
          </div>
        </div>
      );
    }

    if (item.approvedIngLeveld) {
      tagComponent = (
        <div
          className={
            selectStatus
              ? `${styles['level-tag-select']} ${styles['level-tag-wrap']}`
              : `${styles['level-tag-wrap']}`
          }
          onClick={() => {
            tagSelect(selectId);
          }}
        >
          <div className={`${styles['level-tag-approval']} ${styles['level-tag']} `}>
            <img src={tagImg[index] || tagImg[4]} alt="" />
            {item.leveldName}
          </div>
        </div>
      );
    }

    return tagComponent;
  }
}

export default Tag;
