import React from 'react';
import Link from 'umi/link';
import Exception from '@/components/layout/Exception';

export default () => (
  <Exception type="404" style={{ minHeight: 500, height: '100%' }} linkElement={Link} />
);
