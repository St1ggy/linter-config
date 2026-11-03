const component = 'export const View = () => <p>Hello</p>\n'
const view = (jsx) => `export const View = () => ${jsx}\n`
const classView = (body) =>
  `import React from 'react'\nexport class View extends React.Component { ${body} render() { return null } }\n`
const children = (method) => `import { Children } from 'react'\nexport const value = Children.${method}(items)\n`
const cleanEffect = (setup, cleanup) =>
  `import { useEffect } from 'react'\nexport function View() { useEffect(() => { ${setup}; return () => { ${cleanup} } }, []); return <p>Hello</p> }\n`
const leakedEffect = (setup) =>
  `import { useEffect } from 'react'\nexport function View() { useEffect(() => { ${setup} }, []); return <p>Hello</p> }\n`

export const reactModernCases = {
  'dom-no-dangerously-set-innerhtml': [component, view('<p dangerouslySetInnerHTML={{ __html: html }} />')],
  'dom-no-dangerously-set-innerhtml-with-children': [
    view('<p dangerouslySetInnerHTML={{ __html: html }} />'),
    view('<p dangerouslySetInnerHTML={{ __html: html }}>Hello</p>'),
  ],
  'dom-no-find-dom-node': [component, "import { findDOMNode } from 'react-dom'\nfindDOMNode(instance)\n"],
  'dom-no-flush-sync': [component, "import { flushSync } from 'react-dom'\nflushSync(() => {})\n"],
  'dom-no-hydrate': [component, "import { hydrate } from 'react-dom'\nhydrate(<p>Hello</p>, container)\n"],
  'dom-no-missing-button-type': [view('<button type="button">Hello</button>'), view('<button>Hello</button>')],
  'dom-no-render': [component, "import { render } from 'react-dom'\nrender(<p>Hello</p>, container)\n"],
  'dom-no-render-return-value': [
    "import { render } from 'react-dom'\nrender(<p>Hello</p>, container)\n",
    "import { render } from 'react-dom'\nexport const value = render(<p>Hello</p>, container)\n",
  ],
  'dom-no-script-url': [view('<a href="/">Home</a>'), view('<a href="javascript:alert(1)">Home</a>')],
  'dom-no-unsafe-iframe-sandbox': [
    view('<iframe sandbox="allow-scripts" />'),
    view('<iframe sandbox="allow-scripts allow-same-origin" />'),
  ],
  'dom-no-use-form-state': [
    component,
    "import { useFormState } from 'react-dom'\nexport function View() { useFormState(action, initial); return <p>Hello</p> }\n",
  ],
  'dom-no-void-elements-with-children': [view('<img src="image.png" />'), view('<img src="image.png">Hello</img>')],
  'jsx-no-children-prop': [view('<p>Hello</p>'), view('<p children="Hello" />')],
  'jsx-no-children-prop-with-children': [view('<p children="Hello" />'), view('<p children="Hello">World</p>')],
  'jsx-no-comment-textnodes': [component, view('<p>// comment</p>')],
  'jsx-no-key-after-spread': [view('<Item key="item" {...props} />'), view('<Item {...props} key="item" />')],
  'jsx-no-leaked-dollar': [view('<p>Value: {value}</p>'), view('<p>Value: ${value}</p>')],
  'jsx-no-leaked-semicolon': [view('<p><Item /></p>'), view('<p><Item />;\n</p>')],
  'jsx-no-namespace': [component, view('<svg:path />')],
  'jsx-no-useless-fragment': [component, view('<><p>Hello</p></>')],
  'naming-convention-context-name': [
    "import { createContext } from 'react'\nexport const ThemeContext = createContext(null)\n",
    "import { createContext } from 'react'\nexport const theme = createContext(null)\n",
  ],
  'naming-convention-id-name': [
    "import { useId } from 'react'\nexport function View() { const inputId = useId(); return <input id={inputId} /> }\n",
    "import { useId } from 'react'\nexport function View() { const value = useId(); return <input id={value} /> }\n",
  ],
  'naming-convention-ref-name': [
    "import { useRef } from 'react'\nexport function View() { const inputRef = useRef(null); return <input ref={inputRef} /> }\n",
    "import { useRef } from 'react'\nexport function View() { const value = useRef(null); return <input ref={value} /> }\n",
  ],
  'no-access-state-in-setstate': [
    classView('update() { this.setState((state) => ({ count: state.count + 1 })) }'),
    classView('update() { this.setState(() => ({ count: this.state.count + 1 })) }'),
  ],
  'no-array-index-key': [
    view('<ul>{items.map((item) => <li key={item.id}>{item.name}</li>)}</ul>'),
    view('<ul>{items.map((item, index) => <li key={index}>{item.name}</li>)}</ul>'),
  ],
  'no-children-count': [component, children('count')],
  'no-children-for-each': [component, "import { Children } from 'react'\nChildren.forEach(items, visit)\n"],
  'no-children-map': [component, "import { Children } from 'react'\nexport const value = Children.map(items, visit)\n"],
  'no-children-only': [component, children('only')],
  'no-children-to-array': [component, children('toArray')],
  'no-clone-element': [
    component,
    "import { cloneElement } from 'react'\nexport const value = cloneElement(element, {})\n",
  ],
  'no-context-provider': [
    component,
    "import { createContext } from 'react'\nconst Context = createContext(null)\nexport const View = () => <Context.Provider value={null}><p>Hello</p></Context.Provider>\n",
  ],
  'no-create-ref': [
    component,
    "import { createRef } from 'react'\nexport function View() { const inputRef = createRef(); return <input ref={inputRef} /> }\n",
  ],
  'no-direct-mutation-state': [
    classView('state = { count: 0 }; update() { this.setState({ count: 1 }) }'),
    classView('state = { count: 0 }; update() { this.state.count = 1 }'),
  ],
  'no-forward-ref': [
    component,
    "import { forwardRef } from 'react'\nexport const View = forwardRef((props, ref) => <input ref={ref} />)\n",
  ],
  'no-missing-component-display-name': [
    "import { memo } from 'react'\nexport const View = memo(function View() { return <p>Hello</p> })\n",
    "import { memo } from 'react'\nexport const View = memo(() => <p>Hello</p>)\n",
  ],
  'no-missing-key': [
    view('<ul>{items.map((item) => <li key={item.id}>{item.name}</li>)}</ul>'),
    view('<ul>{items.map((item) => <li>{item.name}</li>)}</ul>'),
  ],
  'no-nested-component-definitions': [
    'const Child = () => <p>Hello</p>\nexport const View = () => <Child />\n',
    'export function View() { const Child = () => <p>Hello</p>; return <Child /> }\n',
  ],
  'no-nested-lazy-component-declarations': [
    "import { lazy } from 'react'\nconst Child = lazy(() => import('./child'))\nexport const View = () => <Child />\n",
    "import { lazy } from 'react'\nexport function View() { const Child = lazy(() => import('./child')); return <Child /> }\n",
  ],
  'no-unnecessary-use-prefix': ['export function label() { return 1 }\n', 'export function useLabel() { return 1 }\n'],
  'no-unstable-context-value': [
    "import { createContext } from 'react'\nconst Context = createContext(null)\nconst value = {}\nexport const View = () => <Context.Provider value={value}><p>Hello</p></Context.Provider>\n",
    "import { createContext } from 'react'\nconst Context = createContext(null)\nexport const View = () => <Context.Provider value={{}}><p>Hello</p></Context.Provider>\n",
  ],
  'no-unused-class-component-members': [
    classView('label() { return 1 } componentDidMount() { this.label() }').replace('export class', 'class'),
    classView('label() { return 1 }').replace('export class', 'class'),
  ],
  'no-use-context': [
    component,
    "import { createContext, useContext } from 'react'\nconst Context = createContext(null)\nexport function View() { const value = useContext(Context); return <p>{value}</p> }\n",
  ],
  'rsc-function-definition': [
    '"use server"\nexport async function action() { return 1 }\n',
    '"use server"\nexport function action() { return 1 }\n',
  ],
  'use-state': [
    'import { useState } from \'react\'\nexport function View() { const [count, setCount] = useState(0); return <button type="button" onClick={() => setCount(count + 1)}>{count}</button> }\n',
    "import { useState } from 'react'\nexport function View() { const state = useState(0); return <p>{state}</p> }\n",
  ],
  'web-api-no-leaked-event-listener': [
    cleanEffect('window.addEventListener("resize", handler)', 'window.removeEventListener("resize", handler)'),
    leakedEffect('window.addEventListener("resize", handler)'),
  ],
  'web-api-no-leaked-fetch': [
    cleanEffect(
      'const controller = new AbortController(); fetch("/api", { signal: controller.signal })',
      'controller.abort()',
    ),
    leakedEffect('fetch("/api")'),
  ],
  'web-api-no-leaked-intersection-observer': [
    cleanEffect(
      'const observer = new IntersectionObserver(handler); observer.observe(element)',
      'observer.disconnect()',
    ),
    leakedEffect('const observer = new IntersectionObserver(handler); observer.observe(element)'),
  ],
  'web-api-no-leaked-interval': [
    cleanEffect('const timer = setInterval(handler, 1000)', 'clearInterval(timer)'),
    leakedEffect('setInterval(handler, 1000)'),
  ],
  'web-api-no-leaked-resize-observer': [
    cleanEffect('const observer = new ResizeObserver(handler); observer.observe(element)', 'observer.disconnect()'),
    leakedEffect('const observer = new ResizeObserver(handler); observer.observe(element)'),
  ],
  'web-api-no-leaked-timeout': [
    cleanEffect('const timer = setTimeout(handler, 1000)', 'clearTimeout(timer)'),
    leakedEffect('setTimeout(handler, 1000)'),
  ],
}

for (const name of ['componentWillMount', 'componentWillReceiveProps', 'componentWillUpdate']) {
  const suffix = name.replaceAll(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)

  reactModernCases[`no-${suffix}`] = [classView('componentDidMount() {}'), classView(`${name}() {}`)]
  reactModernCases[`no-unsafe-${suffix}`] = [classView('componentDidMount() {}'), classView(`UNSAFE_${name}() {}`)]
}

for (const [suffix, method] of [
  ['did-mount', 'componentDidMount'],
  ['did-update', 'componentDidUpdate'],
  ['will-update', 'componentWillUpdate'],
]) {
  reactModernCases[`no-set-state-in-component-${suffix}`] = [
    classView(`${method}() {}`),
    classView(`${method}() { this.setState({ count: 1 }) }`),
  ]
}
