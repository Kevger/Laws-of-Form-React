# Ⓞ  Laws of Form React 
<p align="center">
<a href="https://lof-react.web.app/" target="_blank">
  <img src="https://github.com/Kevger/Laws-of-Form-React/blob/8e090ce44a1a6fa00faf16fa3b9e2b60f1057ab3/docs/modulator.svg" />
  </br>
  ↻ LoF Website
</a>
</p>

This lightweight and fast react library allows you to convert expressions – including the reentry – from Spencer-Brown's Laws of Form (1969) into interactive and pure HTML/CSS graphics. Moreover, LoF syntax highlighting, parsing and input fields are available.

<p align="center">
<a href="https://lof-react.web.app/" target="_blank">
  <img src="https://github.com/Kevger/Laws-of-Form-React/blob/8e090ce44a1a6fa00faf16fa3b9e2b60f1057ab3/docs/demo.gif" />
  </a>
</p>


**[Github](https://github.com/Kevger/Laws-of-Form-React)**

**[NPM](https://www.npmjs.com/package/laws-of-form-react)**

**[Author Portfolio](https://kevingerman.de/)**


### 🚀 Features

1) Easily transform LoF bracket expressions into interactive and customizable  graphics.
2) Works with re-entries
3) Custom LoF input field with syntax highlighting
4) TS Support


### 👷 How to install

```
npm install laws-of-form-react
```

### 🔧 How to use
Full tutorial available on the **[LoF react website](https://lof-react.web.app/)**



#### Ⓞ Drawing distinctions 

First import the library
```jsx
import LoF from "laws-of-form-react"
```

1) A cross is marked with ()
```jsx
<LoF>
  ()
</LoF>
```

2) Any text in space is interpreted as the content of the space
```jsx
<LoF>
  ((Observer) Society)
</LoF>
```

3) You can nest crosses
```jsx
<LoF>
  ((())())
</LoF>
```

4) A Re-Entry is made out of two identifiers. $id and [id]. $id denotes the space that enters into [id]. id must be a number. There can be multiple $ids in a space, but only the rightmost counts.
```jsx
<LoF>
  (([0]a)$0b)
</LoF>

<LoF>
  (([42]$42) Autopoiesis)
</LoF>
```

5) A space can also re-enter into two locations (see limitations).
```jsx
<LoF>
  (([0]c)([0]a)$0b)
</LoF>
```

6) Multiple Re-Entries are also possible
```jsx
<LoF>
  ([3]([0]$0)([1]$1)$3)
</LoF>
```

7) This is how you could implement the modulator function (see the first image above)
```jsx
<LoF style={{fontSize: '20px'}}>
  (((((((([0]a$1)$6[2])[1]$3)[0]$4)a$5)$2[6])[5]) [4]$0)
</LoF>
```


#### 🌈 Syntax Highlighting
This library provides customizable syntax highlighting for Laws of Form expressions.
```jsx
import {SyntaxHighlighting} from "laws-of-form-react";
...
<SyntaxHighlighting>
  $3(Syntax (highlighting) [3])
</SyntaxHighlighting>
...
```

#### ⌨️ LoF Input field
Furthermore, the library offers an input field with LoF syntax highlighting.
```jsx
import {LoFInput} from "laws-of-form-react";
...
const [input, setInput] = useState("");
...
<LoFInput
    value={input}
    onChange={(e) => setInput(e.currentTarget.value)}
    className="foo"
/>
...
```

#### ⛓️ LoF Parser
In this library, there is also a Laws of Form parser available that can generate a Laws of Form expression tree from the expressions listed above. This tree can be used for prerendering (LoF takes expressionTree as a prop), to make modifications after the parsing process has finished or for calculations. As an example, the data fields can be filled with React components to provide custom content apart from text.

```jsx
import {parser} from "laws-of-form-react";
// Do stuff ...
const expression = "((a)(b))"
const expressionTree = parser.parse(expression);
expressionTree.data = <SomeReactComponent1/>
expressionTree.expressions[0].data = <SomeReactComponent2/>
// Do some things with the expressionTree ...
<LoF expressionTree={expressionTree}/>
```


### ⚠ Limitations
The entire drawing of the Crosses and Re-Entries is done using divs. Each cross is a div. This allows many degrees of freedom, for example dynamic updating, better debugging, embedding HTML/CSS content such as buttons, images, fonts, etc. But this also comes with limitations, especially for the Re-Entry. HTML/CSS permits to use at most one :before and :after peusdo element (which is used for the Re-Entry) per div. Thus for each Re-Entry we can have at most two spaces where it can re-enter. For the majority of cases, two re-enters per re-entry are perfectly sufficient. Sometimes using complicated nested Re-Entries it is necessary to rearrange expressions in case of display errors.

# 🥨 Other (LoF) projects

[Portfolio](https://kevingerman.de)

