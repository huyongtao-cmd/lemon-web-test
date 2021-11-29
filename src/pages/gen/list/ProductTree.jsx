import React from 'react';
import { formatMessage, FormattedMessage } from 'umi/locale';
import { queryProdClassesTree } from '@/services/sys/baseinfo/productClass';
import TreeSearch from '@/components/common/TreeSearch';
import Loading from '@/components/core/DataLoading';
// import update from 'immutability-helper';
// import * as R from 'ramda';

// 深拷贝合并 - 真蛋疼，本来想找api的，找了半天都没找到好用的。。。
const mergeDeep = child =>
  Array.isArray(child)
    ? child.map(item => ({
        ...item,
        text: item.className,
        child: item.child ? mergeDeep(item.child) : null,
      }))
    : [];

// Stateless function components cannot be given refs. Attempts to access this ref will fail.
class ProductTree extends React.PureComponent {
  state = {
    treeData: null,
  };

  componentDidMount() {
    queryProdClassesTree().then(
      resp =>
        resp.response &&
        this.setState({
          treeData: mergeDeep(Array.isArray(resp.response) ? resp.response : []),
        })
    );
  }

  // onNodeSelect = (selectedKeys, e) => {
  //   console.log('onNodeSelect ->', e);
  // };

  render() {
    const { ...restProps } = this.props;
    const { treeData } = this.state;
    return treeData ? (
      <TreeSearch
        treeData={treeData}
        placeholder={formatMessage({ id: 'sys.baseinfo.productClass.search' })}
        showSearch
        defaultExpandedKeys={treeData.map(item => `${item.id}`)}
        {...restProps}
      />
    ) : (
      <Loading />
    );
  }
}

export default ProductTree;
