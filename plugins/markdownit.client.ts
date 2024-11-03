import markdownit from "markdown-it";
import hljs from 'highlight.js' // https://highlightjs.org
import 'highlight.js/styles/github-dark-dimmed.min.css';

export default defineNuxtPlugin(() => {
  const md = markdownit({
    highlight: function (str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return '<pre class="mt-2 mb-2"><code class="hljs">' +
                 hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
                 '</code></pre>';
        } catch (__) {}
      }
  
      return '<pre class="mt-2 mb-2"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
    }
  });

  return {
    provide: {
      mdRenderer: md,
    },
  };
});