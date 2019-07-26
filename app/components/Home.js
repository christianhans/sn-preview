import React from 'react';
import ComponentManager from 'sn-components-api';
const MarkdownIt = require('markdown-it');

export default class Home extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.preview = document.getElementById("preview");

    this.configureMarkdown();
    this.connectToBridge();
  }

  componentWillUpdate(nextProps, nextState) {
    // pass
  }

  configureMarkdown() {
    var markdownitOptions = {
        // automatically render raw links as anchors.
        linkify: true,
        breaks: true,
    };

    this.markdown = MarkdownIt(markdownitOptions)
      .use(require('markdown-it-footnote'))
      .use(require('markdown-it-task-lists'))
      .use(require('markdown-it-highlightjs'));

      // Remember old renderer, if overriden, or proxy to default renderer
      var defaultRender = this.markdown.renderer.rules.link_open || function(tokens, idx, options, env, self) {
        return self.renderToken(tokens, idx, options);
      };

      this.markdown.renderer.rules.link_open = function (tokens, idx, options, env, self) {
        // If you are sure other plugins can't add `target` - drop check below
        var aIndex = tokens[idx].attrIndex('target');

        if (aIndex < 0) {
          tokens[idx].attrPush(['target', '_blank']); // add new attribute
        } else {
          tokens[idx].attrs[aIndex][1] = '_blank';    // replace value of existing attr
        }

        // pass token to default renderer.
        return defaultRender(tokens, idx, options, env, self);
      };
  }

  connectToBridge() {
    var permissions = [
      {
        name: "stream-context-item"
      }
    ]

    this.componentManager = new ComponentManager(permissions, () => {
      // this.setState({platform: this.componentManager.platform});
    });

    // this.componentManager.loggingEnabled = true;

    this.componentManager.streamContextItem((note) => {
      // this.note = note;

       // Only update UI on non-metadata updates.
      if(note.isMetadataUpdate) {
        return;
      }

      this.preview.innerHTML = this.markdown.render(note.content.text);

      // note.content.text = this.updatePreviewText();
      // note.content.preview_plain = this.truncateString(this.preview.textContent || this.preview.innerText);
      // note.content.preview_html = null;
    });

  }

  truncateString(string, limit = 80) {
    if(!string) {
      return null;
    }
    if(string.length <= limit) {
      return string;
    } else {
      return string.substring(0, limit) + "...";
    }
  }

    render() {
      return (
        <div id="sn-preview" className={"sn-component " /*+ this.state.platform*/}>
          <div id="preview"></div>
        </div>
      )
    }

}
