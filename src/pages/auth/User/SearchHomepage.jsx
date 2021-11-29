import React, { Component } from 'react';
import { connect } from 'dva';
import router from 'umi/router';

@connect(({ global }) => ({
  global,
}))
class SearchHomepage extends Component {
  componentDidMount() {
    const {
      global: { homepage },
    } = this.props;
    // console.error('homepage', homepage);
    router.replace(homepage);
  }

  render() {
    return <div />;
  }
}

export default SearchHomepage;
