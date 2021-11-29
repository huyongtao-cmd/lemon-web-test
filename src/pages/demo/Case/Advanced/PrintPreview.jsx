/* eslint-disable */
import React from 'react';
// import Handlebars from 'handlebars';
import tmpl from './tmpl.hbs';

class PrintPreview extends React.PureComponent {
  // constructor(props) {
  //   super(props);
  // }

  render() {
    const data = {
      name: 'Alan',
      hometown: 'Somewhere, TX',
      kids: [{ name: 'Jimmy', age: '12' }, { name: 'Sally', age: '4' }],
    };
    const result = tmpl(data);
    // console.log(result);
    // 渲染loading，同时拉取数据并渲染模版
    return (
      <div
        style={{
          background: '#eee',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div>
          <p>
            点击
            <button
              onClick={() => {
                const content = document.getElementById('print-frame');
                const pri = document.getElementById('fake-window').contentWindow;
                pri.document.open();
                pri.document.write(content.innerHTML);
                pri.document.close();
                pri.focus();
                pri.print();
              }}
            >
              打印
            </button>
            调起浏览器打印
          </p>
        </div>

        <br />

        <div
          id="print-frame"
          style={{
            background: '#FFF',
            padding: 24,
            height: 1754,
            width: 1240,
            border: '1px solid black',
          }}
        >
          <div dangerouslySetInnerHTML={{ __html: result }} />
        </div>

        <iframe id="fake-window" style={{ height: 0, width: 0, position: 'absolute' }} />
      </div>
    );
  }
}

export default PrintPreview;
