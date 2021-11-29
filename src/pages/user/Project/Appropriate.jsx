import React, { Component } from 'react';
import { connect } from 'dva';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import { fromQs } from '@/utils/stringUtils';

const DOMAIN = 'userProjectAppropriate';

@connect(({ loading }) => ({
  loading,
}))
@mountToTab()
class Appropriate extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    const { id } = fromQs();
    dispatch({
      type: `${DOMAIN}/query`,
      payload: id,
    });
  }

  render() {
    return (
      <PageHeaderWrapper title="拨付申请">
        <span>拨付申请待开发</span>
      </PageHeaderWrapper>
    );
  }
}

export default Appropriate;
