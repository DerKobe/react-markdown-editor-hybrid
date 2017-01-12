import React from 'react';
import ReactMarkdown from 'react-markdown';
import objectAssign from 'object-assign';

var MDEditor = React.createClass({
  getDefaultProps(){
    return {
      enableHTML: true,
      textAreaStyle: {},
      buttonStyle: {},
      buttonContainerStyle: {}
    };
  },
  propTypes: {
    value: React.PropTypes.string.isRequired,
    enableHTML: React.PropTypes.bool,
    onChange: React.PropTypes.func.isRequired,
    textAreaStyle: React.PropTypes.object,
    buttonStyle: React.PropTypes.object,
    buttonContainerStyle: React.PropTypes.object
  },
  getInitialState(){
    return {
      preview: false
    };
  },
  setCaretPosition(caretPos) {
    var textarea = this.refs.text;
    if (textarea !== null) {
      if (textarea.createTextRange) {
        var range = textarea.createTextRange();
        range.move('character', caretPos);
        range.select();
      } else {
        if (textarea.selectionStart) {
          textarea.focus();
          textarea.setSelectionRange(caretPos, caretPos);
        } else {
          textarea.focus();
        }
      }
    }
  },
  getSelection(value){
    var cursorIndexStart = this.refs.text.selectionStart;
    var cursorIndexEnd = this.refs.text.selectionEnd;
    var selection = value.substring(cursorIndexStart, cursorIndexEnd);
    return {
      cursorIndexStart: cursorIndexStart,
      cursorIndexEnd: cursorIndexEnd,
      selection: selection
    };
  },
  insertAtCursor(e, markdownLeftOrLR, right, _selection, markdownRight, cursorPosOffset) {
    if (e) {
      e.preventDefault();
    }
    var value = this.props.value;
    var selectionProps = this.getSelection(value);
    var cursorIndexStart = selectionProps.cursorIndexStart;
    var cursorIndexEnd = selectionProps.cursorIndexEnd;
    var selection = _selection ? _selection : selectionProps.selection;
    value = value.substring(0, cursorIndexStart)
      + `${markdownLeftOrLR}${selection.length > 0 ? selection : ''}${right ? markdownRight ? markdownRight :  markdownLeftOrLR : ''}`
      + value.substring(cursorIndexEnd, value.length);
    this.props.onChange(value);
    if (selection.length === 0) {
      setTimeout(()=>{
        this.setCaretPosition(cursorIndexStart + markdownRight ? cursorIndexEnd + cursorPosOffset : markdownLeftOrLR.length);
      }, 0);
    }
  },
  handleList(e, ordered){
    e.preventDefault();
    var list = this.getSelection(this.props.value).selection.split(/\r?\n/);
    var newList = [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].length > 0) {
        newList.push(`${ordered ? i + 1 + '.' : '-'} ${list[i]}`); 
      }
    }
    newList = newList.join('\n');
    this.insertAtCursor(null, '', false, newList);
  },
  handleYoutube(e){
    e.preventDefault();
    var url = prompt('Enter a YouTube URL.');
    var videoId = url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/);
    if (videoId === null) {
      return;
    }
    this.insertAtCursor(null, `[![](https://img.youtube.com/vi/${videoId[1]}/0.jpg)](https://www.youtube.com/watch?v=${videoId[1]}`, true, null, ')', 4);
  },
  handleTogglePreview(e){
    e.preventDefault();
    this.setState({preview: !this.state.preview});
  },
  handleTextChange(e){
    this.props.onChange(e.target.value);
  },
  render:function(){
    var p = this.props;
    var s = this.state;
    const textAreaStyle = {
      width: '100%',
      outline: '0',
      border: '1px solid #cccccc',
      height: '500px',
      padding: '4px 8px'
    };
    objectAssign(textAreaStyle, p.textAreaStyle);
    const buttonStyle = {
      outline: '0',
      border: '1px solid #cccccc',
      margin: '0px 2px',
      padding: '4px 8px',
      cursor: 'pointer',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#FFF',
      marginLeft: '4px',
      lineHeight: '1'
    };
    objectAssign(buttonStyle, p.buttonStyle);
    const buttonContainerStyle = {
      marginLeft: '-4px',
      marginBottom: '4px'
    };
    objectAssign(buttonContainerStyle, p.buttonContainerStyle);
    return (
      <div>
        <div style={buttonContainerStyle}>
          <button style={buttonStyle} onClick={(e)=>this.insertAtCursor(e, '**', true)}><i className="fa fa-bold" /></button>
          <button style={buttonStyle} onClick={(e)=>this.insertAtCursor(e, '_', true)}><i className="fa fa-italic" /></button>
          <button style={buttonStyle} onClick={(e)=>this.insertAtCursor(e, '### ', false)}><i className="fa fa-header" /></button>
          <button style={buttonStyle} onClick={(e)=>this.handleList(e, false)}><i className="fa fa-list" /></button>
          <button style={buttonStyle} onClick={(e)=>this.handleList(e, true)}><i className="fa fa-list-ol" /></button>
          {p.enableHTML ? <button style={buttonStyle} onClick={(e)=>this.insertAtCursor(e, '<blockquote>', true, null, '</blockquote>', 12)}><i className="fa fa-quote-right" /></button> : null}
          <button style={buttonStyle} onClick={(e)=>this.insertAtCursor(e, '```', true, null, '```', 3)}><i className="fa fa-code" /></button>
          <button style={buttonStyle} onClick={(e)=>this.insertAtCursor(e, '[', true, null, ']()', 3)}><i className="fa fa-link" /></button>
          <button style={buttonStyle} onClick={(e)=>this.insertAtCursor(e, '![](', true, null, ')', 4)}><i className="fa fa-file-image-o" /></button>
          <button style={buttonStyle} onClick={this.handleYoutube}><i className="fa fa-youtube" /></button>
          <button style={buttonStyle} onClick={this.handleTogglePreview}><i className={`fa fa-${s.preview ? 'pencil' : 'eye'}`} /><span style={{marginLeft: '6px'}}>{s.preview ? 'Editor' : 'Preview'}</span></button>
        </div>
        <div>
          {s.preview ?
          <ReactMarkdown source={p.value} escapeHtml={!p.enableHTML}/>
          :
          <textarea ref="text" style={textAreaStyle} value={p.value} onChange={this.handleTextChange} placeholder={`Use Markdown ${p.enableHTML ? 'or HTML ' : ''}for formatting...`}/>}
        </div>
      </div>
    );
  }
});

window.MDEditor = MDEditor;
export default MDEditor;