import React from 'react';
import PropTypes from 'prop-types';

export default class LogEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      id: props.id ? props.id : null,
      logEditor: null,
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
      const logEditor = UE.getEditor(id, {
        autoHeightEnabled: true,
        autoFloatEnabled: true,
        initialFrameWidth: width,
        initialFrameHeight: height,
        zIndex: '800',
        initialContent,
        toolbars: [
          [
            'forecolor',
            'backcolor',
            'bold',
            'italic',
            'underline',
            '|',
            'justifyleft',
            'justifycenter',
            'justifyright',
            'insertorderedlist',
            'insertunorderedlist',
            '|',
            'simpleupload',
            'insertimage',
            'emotion',
            'link',
            'inserttable',
            'template',
            'insertcode',
            '|',
            'paragraph',
            'fontfamily',
            'fontsize',
            '|',
            'undo',
            'redo',
            'source',
            'help',
          ],
        ],
      });
      this.setState({ logEditor });

      logEditor.addListener('contentChange', editor => {
        const html = logEditor.getContent();
        onChange(html);
      });
    }
  }

  getContent = () => {
    const { logEditor } = this.state;
    return logEditor.getContent();
  };

  getConTextLength = () => {
    const { logEditor } = this.state;
    return logEditor.getContentTxt().length;
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

LogEditor.propTypes = {
  id: PropTypes.string.isRequired,
  initialContent: PropTypes.string,
  onChange: PropTypes.func,
};
LogEditor.defaultProps = {
  initialContent: '',
  onChange(content) {},
};
