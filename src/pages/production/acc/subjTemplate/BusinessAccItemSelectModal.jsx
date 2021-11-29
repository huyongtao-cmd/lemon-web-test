import React from 'react';
import { connect } from 'dva';
// 产品化组件
import Modal from '@/components/production/layout/Modal';
// service方法
import { genFakeId } from '@/utils/production/mathUtils.ts';
import TreeSearch from '@/components/production/business/TreeSearch.tsx';
import Loading from '@/components/production/basic/Loading.tsx';

// namespace声明
const DOMAIN = 'subjTemplateDisplayPage';

/**
 * 核算项目选择modal
 */
@connect(({ loading, dispatch, subjTemplateDisplayPage }) => ({
  loading: loading.effects[`${DOMAIN}/fetchTree`],
  dispatch,
  ...subjTemplateDisplayPage,
}))
class BusinessAccItemSelectModal extends React.PureComponent {
  componentDidMount() {
    this.callModelEffects('fetchTree');
  }

  /**
   * 修改model层state
   * 这个方法是仅是封装一个小方法,后续修改model的state时不需要每次都解构dispatch
   * @param params state参数
   */
  updateModelState = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: params,
    });
  };

  /**
   * 调用model层异步方法
   * 这个方法是仅是封装一个小方法,后续修改调异步方法时不需要每次都解构dispatch
   * @param method 异步方法名称
   * @param params 调用方法参数
   */
  callModelEffects = (method, params) => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/${method}`,
      payload: params,
    });
  };

  /**
   * 保存
   */
  handleSave = () => {
    const { form, formData } = this.props;
    form.validateFieldsAndScroll((error, values) => {
      if (!error) {
        this.callModelEffects('save', { formData: { ...formData, ...values } });
      }
    });
  };

  // onSelect = async selectedKeys => {
  //   console.log(selectedKeys)
  // };

  onCheck = (checkedKeys, info) => {
    const allCheckedKeys = checkedKeys.concat(info.halfCheckedKeys);
    this.updateModelState({ checkedKeys, allCheckedKeys });
  };

  onOk = () => {
    const { formData, allCheckedKeys, treeList } = this.props;
    const { details } = formData;
    const { length } = allCheckedKeys;
    const itemIds = details.map(detail => detail.busAccItemId + '');
    const repeatItemIds = [];
    const newDetails = [];
    for (let i = 0; i < length; i += 1) {
      const itemId = allCheckedKeys[i];
      if (itemIds.indexOf(itemId) > -1) {
        repeatItemIds.push(itemId);
      } else {
        const checkedNode = treeList.filter(item => item.id + '' === itemId)[0];
        newDetails.push({
          id: genFakeId(-1),
          busAccItemId: itemId,
          busAccItemCode: checkedNode.itemCode,
          busAccItemName: checkedNode.itemName,
          parentId: checkedNode.parentId,
          busAccItemType: checkedNode.itemType,
        });
      }
    }
    details.forEach(detail => {
      if (repeatItemIds.indexOf(detail.busAccItemId + '') > -1) {
        newDetails.push(detail);
      }
    });
    // this.callModelEffects('updateForm', { details: newDetails });

    // setTimeout(()=>{
    //   this.callModelEffects('updateForm', { details: newDetails });
    // },0);
    this.updateModelState({ modalVisible: false, formData: { ...formData, details: newDetails } });
  };

  render() {
    const { treeLoading, treeList, modalVisible, checkedKeys } = this.props;

    return (
      <Modal
        title="选择核算项目"
        visible={modalVisible}
        width="50%"
        onCancel={() => this.updateModelState({ modalVisible: false })}
        onOk={this.onOk}
      >
        {!treeLoading ? (
          <TreeSearch
            checkable
            selectable={false}
            options={treeList}
            onSelect={this.onSelect}
            onCheck={this.onCheck}
            checkedKeys={checkedKeys}
          />
        ) : (
          <Loading />
        )}
      </Modal>
    );
  }
}

export default BusinessAccItemSelectModal;
