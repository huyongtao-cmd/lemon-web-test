import React from 'react';
import { Modifier, EditorState, convertToRaw, ContentState } from 'draft-js';
import { getSelectedBlock } from 'draftjs-utils'; // eslint-disable-line
import { Editor } from 'react-draft-wysiwyg';
import { stateFromHTML } from 'draft-js-import-html';
import { getLocale } from 'umi/locale';
import { type, isNil, isEmpty, omit } from 'ramda';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';

import ColorPic from './Color';
import styles from './index.less';

class RichText extends React.Component {
  constructor(props) {
    super(props);
    const { value } = props;
    if (isNil(value) || isEmpty(value)) {
      this.state = {
        editorState: EditorState.createEmpty(),
      };
    } else {
      const contentBlock = htmlToDraft(value);
      if (contentBlock) {
        const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
        const editorState = EditorState.createWithContent(contentState);
        this.state = {
          editorState,
        };
      }
    }
  }

  // componentDidUpdate(prevProps, prevState, snapshot) {
  //   if (snapshot !== null) {
  //     if (isNil(snapshot) || isEmpty(snapshot)) {
  //       setTimeout(() => {
  //         this.setState({
  //           editorState: EditorState.createEmpty(),
  //         });
  //       }, 0);
  //     } else {
  //       const contentBlock = htmlToDraft(snapshot);
  //       if (contentBlock) {
  //         const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
  //         const editorState = EditorState.createWithContent(contentState);
  //         setTimeout(() => {
  //           this.setState({
  //             editorState,
  //           });
  //         }, 0);
  //       }
  //     }
  //   }
  // }

  // getSnapshotBeforeUpdate(prevProps, prevState) {
  //   const { value } = this.props;
  //   if (prevProps.value !== value) {
  //     return value;
  //   }
  //   return null;
  // }

  onEditorStateChange = editorState => {
    const { onChange } = this.props;
    this.setState(
      {
        editorState,
      },
      () => {
        const html = draftToHtml(convertToRaw(editorState.getCurrentContent()));
        type(onChange) === 'Function' && onChange(html);
      }
    );
  };

  handlePastedText = (text, html, editorState, onChange) => {
    const selectedBlock = getSelectedBlock(editorState);
    if (selectedBlock && selectedBlock.type === 'code') {
      const contentState = Modifier.replaceText(
        editorState.getCurrentContent(),
        editorState.getSelection(),
        text,
        editorState.getCurrentInlineStyle()
      );
      onChange(EditorState.push(editorState, contentState, 'insert-characters'));
      return true;
      // eslint-disable-next-line
    } else if (html) {
      const blockMap = stateFromHTML(html).blockMap; // eslint-disable-line
      const newState = Modifier.replaceWithFragment(
        editorState.getCurrentContent(),
        editorState.getSelection(),
        blockMap
      );
      onChange(EditorState.push(editorState, newState, 'insert-fragment'));
      return true;
    }
    return false;
  };

  imageUploadCallBack = file =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      const img = new Image();
      // eslint-disable-next-line
      reader.onload = function(e) {
        img.src = this.result;
        resolve({
          data: {
            link: img.src,
          },
        });
      };
    });

  render() {
    const { editorState } = this.state;

    return (
      <Editor
        editorState={editorState}
        toolbarClassName={styles.toolbarClassName}
        wrapperClassName={styles.wrapperClassName}
        editorClassName={styles.editorClassName}
        onEditorStateChange={this.onEditorStateChange}
        handlePastedText={this.handlePastedText}
        onChange={() => {}}
        localization={{
          locale: getLocale() === 'en-US' ? 'en' : 'zh',
        }}
        toolbar={{
          colorPicker: { component: ColorPic },
          options: [
            'inline',
            'blockType',
            'fontSize',
            'fontFamily',
            'list',
            'textAlign',
            'colorPicker',
            'link',
            'embedded',
            'image',
            'remove',
            'history',
          ],
          image: {
            uploadCallback: this.imageUploadCallBack,
            previewImage: true,
            inputAccept: 'image/gif,image/jpeg,image/jpg,image/png,image/svg',
            alt: { present: false, mandatory: false },
          },
        }}
      />
    );
  }
}

// eslint-disable-next-line
class WrapperRichText extends React.Component {
  handleChange = html => {
    const { onChange } = this.props;
    type(onChange) === 'Function' && onChange(html);
  };

  render() {
    return <RichText onChange={this.handleChange} {...omit(['onChange'], this.props)} />;
  }
}

export default WrapperRichText;
