import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import img1 from '@/assets/img/productTheme/01.svg';
import img2 from '@/assets/img/productTheme/02.svg';
import img3 from '@/assets/img/productTheme/03.svg';
import img4 from '@/assets/img/productTheme/04.svg';
import img5 from '@/assets/img/productTheme/05.svg';
import img6 from '@/assets/img/productTheme/06.svg';
import styles from './index.less';

const menuBox = [
  {
    id: 1,
    img: img1,
    link: '/sale/productHouse/oldTheme/energize',
  },
  {
    id: 2,
    img: img2,
    link: '/sale/productHouse/oldTheme/activation',
  },
  {
    id: 3,
    img: img3,
    link: '/sale/productHouse/oldTheme/socialization',
  },
  {
    id: 4,
    img: img4,
    link: '/sale/productHouse/oldTheme/business',
  },
  {
    id: 5,
    img: img5,
    link: '/sale/productHouse/oldTheme/cooperation',
  },
  {
    id: 6,
    img: img6,
    link: '/sale/productHouse/oldTheme/electronicAsset',
  },
];

const DOMAIN = 'oldProductTheme';
@connect(({ loading, productTheme }) => ({
  productTheme,
  loading: loading.effects[`${DOMAIN}/query`],
}))
class Theme extends PureComponent {
  componentDidMount() {}

  render() {
    return (
      <PageHeaderWrapper title="合作伙伴">
        <div className={styles['menu-box']}>
          {menuBox.map(item => (
            <div
              className={styles['menu-item']}
              key={item.id}
              onClick={() => {
                router.push(item.link);
              }}
            >
              <img src={item.img} alt={item.id} />
            </div>
          ))}
          <div />
        </div>
      </PageHeaderWrapper>
    );
  }
}

export default Theme;
