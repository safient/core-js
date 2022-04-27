"use strict";(self.webpackChunkcore_js_docs=self.webpackChunkcore_js_docs||[]).push([[597],{3905:function(e,t,n){n.d(t,{Zo:function(){return p},kt:function(){return m}});var r=n(7294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var s=r.createContext({}),u=function(e){var t=r.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},p=function(e){var t=u(e.components);return r.createElement(s.Provider,{value:t},e.children)},c={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},d=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,i=e.originalType,s=e.parentName,p=l(e,["components","mdxType","originalType","parentName"]),d=u(n),m=a,f=d["".concat(s,".").concat(m)]||d[m]||c[m]||i;return n?r.createElement(f,o(o({ref:t},p),{},{components:n})):r.createElement(f,o({ref:t},p))}));function m(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=n.length,o=new Array(i);o[0]=d;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l.mdxType="string"==typeof e?e:a,o[1]=l;for(var u=2;u<i;u++)o[u]=n[u];return r.createElement.apply(null,o)}return r.createElement.apply(null,n)}d.displayName="MDXCreateElement"},7926:function(e,t,n){n.r(t),n.d(t,{assets:function(){return p},contentTitle:function(){return s},default:function(){return m},frontMatter:function(){return l},metadata:function(){return u},toc:function(){return c}});var r=n(7462),a=n(3366),i=(n(7294),n(3905)),o=["components"],l={id:"index",title:"@safient/core",slug:"/api/",sidebar_label:"Readme",sidebar_position:0,custom_edit_url:null},s="Safient Core SDK",u={unversionedId:"api/index",id:"api/index",title:"@safient/core",description:"JavaScript SDK to manage and interact with the safes on Safient protocol.",source:"@site/docs/api/index.md",sourceDirName:"api",slug:"/api/",permalink:"/api/",editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"index",title:"@safient/core",slug:"/api/",sidebar_label:"Readme",sidebar_position:0,custom_edit_url:null}},p={},c=[{value:"Getting started",id:"getting-started",level:2},{value:"Local installation",id:"local-installation",level:2},{value:"Running Tests",id:"running-tests",level:2},{value:"Building docs",id:"building-docs",level:2},{value:"Technologies used:",id:"technologies-used",level:2},{value:"Contributing",id:"contributing",level:2},{value:"Resources:",id:"resources",level:2}],d={toc:c};function m(e){var t=e.components,n=(0,a.Z)(e,o);return(0,i.kt)("wrapper",(0,r.Z)({},d,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("h1",{id:"safient-core-sdk"},"Safient Core SDK"),(0,i.kt)("p",null,"JavaScript SDK to manage and interact with the safes on Safient protocol."),(0,i.kt)("p",null,"Trustless crypto asset safe and inheritance protocol"),(0,i.kt)("h2",{id:"getting-started"},"Getting started"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-bash"},"  npm i @safient/core\n")),(0,i.kt)("h2",{id:"local-installation"},"Local installation"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-bash"},"  git clone https://github.com/safient/safient-core.git\n  cd safient-core\n  npm install\n  npm run build\n")),(0,i.kt)("h2",{id:"running-tests"},"Running Tests"),(0,i.kt)("p",null,"Create an ",(0,i.kt)("inlineCode",{parentName:"p"},".env")," file in the ",(0,i.kt)("inlineCode",{parentName:"p"},"middleware")," and ",(0,i.kt)("inlineCode",{parentName:"p"},"root")," folder with ",(0,i.kt)("inlineCode",{parentName:"p"},"USER_API_KEY"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"USER_API_SECRET")," and ",(0,i.kt)("inlineCode",{parentName:"p"},"DB_FILE_NAME='./thread.config'")),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-bash"},"  cd ..\n  npm run test\n")),(0,i.kt)("h2",{id:"building-docs"},"Building docs"),(0,i.kt)("p",null,"Update the docs markdown"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre"},"npm run build:docs\n")),(0,i.kt)("p",null,"Run the docusaurus website locally"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre"},"npm run serve:docs\n")),(0,i.kt)("h2",{id:"technologies-used"},"Technologies used:"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"https://idx.xyz/"},"Ceramic IDX")),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"https://docs.textile.io/threads/"},"Textile ThreadDb"))),(0,i.kt)("h2",{id:"contributing"},"Contributing"),(0,i.kt)("p",null,"You are welcome to submit issues and enhancement requests and work on any of the existing issues. Follow this simple guide to contribute to the repository."),(0,i.kt)("ol",null,(0,i.kt)("li",{parentName:"ol"},(0,i.kt)("strong",{parentName:"li"},"Create")," or pick an existing issue to work on"),(0,i.kt)("li",{parentName:"ol"},(0,i.kt)("strong",{parentName:"li"},"Fork")," the repo on GitHub"),(0,i.kt)("li",{parentName:"ol"},(0,i.kt)("strong",{parentName:"li"},"Clone")," the forked project to your own machine"),(0,i.kt)("li",{parentName:"ol"},(0,i.kt)("strong",{parentName:"li"},"Commit")," changes to your own branch"),(0,i.kt)("li",{parentName:"ol"},(0,i.kt)("strong",{parentName:"li"},"Push")," your work back up to your forked repo"),(0,i.kt)("li",{parentName:"ol"},"Submit a ",(0,i.kt)("strong",{parentName:"li"},"Pull request")," from the forked repo to our repo so that we can review your changes")),(0,i.kt)("h2",{id:"resources"},"Resources:"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"https://safient.io"},"Website")),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"https://app.safient.io"},"Web App")),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"https://twitter.con/safientio"},"Twitter")),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"https://discord.safient.io"},"Discord"))))}m.isMDXComponent=!0}}]);