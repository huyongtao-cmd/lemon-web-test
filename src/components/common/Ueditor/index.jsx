import React from 'react';
import PropTypes from 'prop-types';

export default class Ueditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      id: props.id ? props.id : null,
      ueditor: null,
    };
  }

  componentDidMount() {
    const { UE } = window;
    const { initialContent, width, height, onChange } = this.props;
    const { id } = this.state;
    if (id) {
      try {
        // 加载之前先执行删除操作，否则如果存在页面切换，再切回带编辑器页面重新加载时不刷新无法渲染出编辑器
        UE.delEditor(id);
      } catch (e) {
        // console.error(e);
      }
      const ueditor = UE.getEditor(id, {
        autoHeightEnabled: true,
        autoFloatEnabled: true,
        initialFrameWidth: width,
        initialFrameHeight: height,
        zIndex: '800',
        initialContent,
      });
      this.setState({ ueditor });

      ueditor.addListener('contentChange', editor => {
        const html = ueditor.getContent();
        onChange(html);
      });
    }
  }

  getContent = () => {
    const { ueditor } = this.state;
    return ueditor.getContent();
  };

  render() {
    const { id } = this.state;
    return (
      <div>
        <textarea id={id} />
      </div>
    );
  }
}

Ueditor.propTypes = {
  id: PropTypes.string.isRequired,
  initialContent: PropTypes.string,
  onChange: PropTypes.func,
};
Ueditor.defaultProps = {
  initialContent: '',
  onChange(content) {},
};
