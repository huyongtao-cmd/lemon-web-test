import React from 'react';
import { Layout } from 'antd';
import GlobalFooter from '@/components/layout/GlobalFooter';
import CopyRight from './CopyRight';

const { Footer } = Layout;
const FooterView = () => (
  <Footer className="p-a-0">
    <GlobalFooter
      links={[
        {
          key: 'Dev Doc',
          title: 'Dev Doc',
          href: 'https://doc.elitescloud.com',
          blankTarget: true,
        },
        {
          key: 'GitLab',
          title: 'GitLab',
          href: 'https://git.elitescloud.com',
          blankTarget: true,
        },
        {
          key: 'Yapi',
          title: 'Yapi',
          href: 'http://192.168.0.159/project/46/interface/api',
          blankTarget: true,
        },
        {
          key: 'KMS',
          title: 'KMS',
          href: 'https://kms.elitesland.com:8899',
          blankTarget: true,
        },
        {
          key: 'Rep Classic',
          title: 'Rep Classic',
          href: 'https://rep.elitesland.com',
          blankTarget: true,
        },
      ]}
      copyright={<CopyRight />}
    />
  </Footer>
);

export default FooterView;
