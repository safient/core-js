"use strict";(self.webpackChunkcore_js_docs=self.webpackChunkcore_js_docs||[]).push([[32],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>m});var r=n(7294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var c=r.createContext({}),s=function(e){var t=r.useContext(c),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},p=function(e){var t=s(e.components);return r.createElement(c.Provider,{value:t},e.children)},u="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},f=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,o=e.originalType,c=e.parentName,p=l(e,["components","mdxType","originalType","parentName"]),u=s(n),f=a,m=u["".concat(c,".").concat(f)]||u[f]||d[f]||o;return n?r.createElement(m,i(i({ref:t},p),{},{components:n})):r.createElement(m,i({ref:t},p))}));function m(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=n.length,i=new Array(o);i[0]=f;var l={};for(var c in t)hasOwnProperty.call(t,c)&&(l[c]=t[c]);l.originalType=e,l[u]="string"==typeof e?e:a,i[1]=l;for(var s=2;s<o;s++)i[s]=n[s];return r.createElement.apply(null,i)}return r.createElement.apply(null,n)}f.displayName="MDXCreateElement"},2979:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>c,contentTitle:()=>i,default:()=>d,frontMatter:()=>o,metadata:()=>l,toc:()=>s});var r=n(7462),a=(n(7294),n(3905));const o={id:"core-getting-started",title:"Safient Core",sidebar_label:"Getting started",custom_edit_url:null},i=void 0,l={unversionedId:"core-getting-started",id:"core-getting-started",title:"Safient Core",description:"Safient Core is a JavaScript/ TypeScript SDK that allows anyone to interact with the Safient protocol to perform any action.",source:"@site/docs/core-getting-started.md",sourceDirName:".",slug:"/core-getting-started",permalink:"/core-getting-started",draft:!1,editUrl:null,tags:[],version:"current",frontMatter:{id:"core-getting-started",title:"Safient Core",sidebar_label:"Getting started",custom_edit_url:null},sidebar:"docs",previous:{title:"Build on Safient",permalink:"/dev-overview"},next:{title:"SafientCore",permalink:"/api/classes/SafientCore"}},c={},s=[{value:"Getting started",id:"getting-started",level:2},{value:"Import the library",id:"import-the-library",level:3},{value:"Local installation",id:"local-installation",level:2},{value:"Running Tests",id:"running-tests",level:2}],p={toc:s},u="wrapper";function d(e){let{components:t,...n}=e;return(0,a.kt)(u,(0,r.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"Safient Core is a JavaScript/ TypeScript SDK that allows anyone to interact with the Safient protocol to perform any action.\nYou can easily integrate Safient on any client or server applications."),(0,a.kt)("h2",{id:"getting-started"},"Getting started"),(0,a.kt)("p",null,"Install the ",(0,a.kt)("inlineCode",{parentName:"p"},"@safient/core")," node package to your project."),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-bash"},"  npm i @safient/core\n")),(0,a.kt)("h3",{id:"import-the-library"},"Import the library"),(0,a.kt)("p",null,"Once the package is installed successfully in your project, import ",(0,a.kt)("inlineCode",{parentName:"p"},"SafientCore")," to instantiate a Safient objet and start invoking all the APIs."),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-bash"},'import { SafientCore } from "@safient/core";\n')),(0,a.kt)("p",null,"Check out the ",(0,a.kt)("a",{parentName:"p",href:"./api/classes/SafientCore"},"API")," section to explore and use all the available APIs to start building on Safient \ud83d\ude80."),(0,a.kt)("h2",{id:"local-installation"},"Local installation"),(0,a.kt)("p",null,"You can also install the latest or the development version of ",(0,a.kt)("inlineCode",{parentName:"p"},"@safient/core")," directly from the repo."),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-bash"},"  git clone https://github.com/safient/core-js.git\n  cd core-js\n  npm install\n  npm run build\n")),(0,a.kt)("h2",{id:"running-tests"},"Running Tests"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-bash"},"  npm run test\n")))}d.isMDXComponent=!0}}]);