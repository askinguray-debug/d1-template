var xt=Object.defineProperty;var He=e=>{throw TypeError(e)};var wt=(e,t,s)=>t in e?xt(e,t,{enumerable:!0,configurable:!0,writable:!0,value:s}):e[t]=s;var f=(e,t,s)=>wt(e,typeof t!="symbol"?t+"":t,s),Ce=(e,t,s)=>t.has(e)||He("Cannot "+s);var o=(e,t,s)=>(Ce(e,t,"read from private field"),s?s.call(e):t.get(e)),g=(e,t,s)=>t.has(e)?He("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,s),m=(e,t,s,r)=>(Ce(e,t,"write to private field"),r?r.call(e,s):t.set(e,s),s),v=(e,t,s)=>(Ce(e,t,"access private method"),s);var Fe=(e,t,s,r)=>({set _(a){m(e,t,a,s)},get _(){return o(e,t,r)}});var Le=(e,t,s)=>(r,a)=>{let n=-1;return i(0);async function i(d){if(d<=n)throw new Error("next() called multiple times");n=d;let l,c=!1,u;if(e[d]?(u=e[d][0][0],r.req.routeIndex=d):u=d===e.length&&a||void 0,u)try{l=await u(r,()=>i(d+1))}catch(p){if(p instanceof Error&&t)r.error=p,l=await t(p,r),c=!0;else throw p}else r.finalized===!1&&s&&(l=await s(r));return l&&(r.finalized===!1||c)&&(r.res=l),r}},Et=Symbol(),_t=async(e,t=Object.create(null))=>{const{all:s=!1,dot:r=!1}=t,n=(e instanceof at?e.raw.headers:e.headers).get("Content-Type");return n!=null&&n.startsWith("multipart/form-data")||n!=null&&n.startsWith("application/x-www-form-urlencoded")?Tt(e,{all:s,dot:r}):{}};async function Tt(e,t){const s=await e.formData();return s?Rt(s,t):{}}function Rt(e,t){const s=Object.create(null);return e.forEach((r,a)=>{t.all||a.endsWith("[]")?At(s,a,r):s[a]=r}),t.dot&&Object.entries(s).forEach(([r,a])=>{r.includes(".")&&(St(s,r,a),delete s[r])}),s}var At=(e,t,s)=>{e[t]!==void 0?Array.isArray(e[t])?e[t].push(s):e[t]=[e[t],s]:t.endsWith("[]")?e[t]=[s]:e[t]=s},St=(e,t,s)=>{let r=e;const a=t.split(".");a.forEach((n,i)=>{i===a.length-1?r[n]=s:((!r[n]||typeof r[n]!="object"||Array.isArray(r[n])||r[n]instanceof File)&&(r[n]=Object.create(null)),r=r[n])})},Ze=e=>{const t=e.split("/");return t[0]===""&&t.shift(),t},jt=e=>{const{groups:t,path:s}=Ot(e),r=Ze(s);return Ct(r,t)},Ot=e=>{const t=[];return e=e.replace(/\{[^}]+\}/g,(s,r)=>{const a=`@${r}`;return t.push([a,s]),a}),{groups:t,path:e}},Ct=(e,t)=>{for(let s=t.length-1;s>=0;s--){const[r]=t[s];for(let a=e.length-1;a>=0;a--)if(e[a].includes(r)){e[a]=e[a].replace(r,t[s][1]);break}}return e},we={},Dt=(e,t)=>{if(e==="*")return"*";const s=e.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);if(s){const r=`${e}#${t}`;return we[r]||(s[2]?we[r]=t&&t[0]!==":"&&t[0]!=="*"?[r,s[1],new RegExp(`^${s[2]}(?=/${t})`)]:[e,s[1],new RegExp(`^${s[2]}$`)]:we[r]=[e,s[1],!0]),we[r]}return null},Ie=(e,t)=>{try{return t(e)}catch{return e.replace(/(?:%[0-9A-Fa-f]{2})+/g,s=>{try{return t(s)}catch{return s}})}},Nt=e=>Ie(e,decodeURI),et=e=>{const t=e.url,s=t.indexOf("/",t.indexOf(":")+4);let r=s;for(;r<t.length;r++){const a=t.charCodeAt(r);if(a===37){const n=t.indexOf("?",r),i=t.slice(s,n===-1?void 0:n);return Nt(i.includes("%25")?i.replace(/%25/g,"%2525"):i)}else if(a===63)break}return t.slice(s,r)},Pt=e=>{const t=et(e);return t.length>1&&t.at(-1)==="/"?t.slice(0,-1):t},se=(e,t,...s)=>(s.length&&(t=se(t,...s)),`${(e==null?void 0:e[0])==="/"?"":"/"}${e}${t==="/"?"":`${(e==null?void 0:e.at(-1))==="/"?"":"/"}${(t==null?void 0:t[0])==="/"?t.slice(1):t}`}`),tt=e=>{if(e.charCodeAt(e.length-1)!==63||!e.includes(":"))return null;const t=e.split("/"),s=[];let r="";return t.forEach(a=>{if(a!==""&&!/\:/.test(a))r+="/"+a;else if(/\:/.test(a))if(/\?/.test(a)){s.length===0&&r===""?s.push("/"):s.push(r);const n=a.replace("?","");r+="/"+n,s.push(r)}else r+="/"+a}),s.filter((a,n,i)=>i.indexOf(a)===n)},De=e=>/[%+]/.test(e)?(e.indexOf("+")!==-1&&(e=e.replace(/\+/g," ")),e.indexOf("%")!==-1?Ie(e,rt):e):e,st=(e,t,s)=>{let r;if(!s&&t&&!/[%+]/.test(t)){let i=e.indexOf("?",8);if(i===-1)return;for(e.startsWith(t,i+1)||(i=e.indexOf(`&${t}`,i+1));i!==-1;){const d=e.charCodeAt(i+t.length+1);if(d===61){const l=i+t.length+2,c=e.indexOf("&",l);return De(e.slice(l,c===-1?void 0:c))}else if(d==38||isNaN(d))return"";i=e.indexOf(`&${t}`,i+1)}if(r=/[%+]/.test(e),!r)return}const a={};r??(r=/[%+]/.test(e));let n=e.indexOf("?",8);for(;n!==-1;){const i=e.indexOf("&",n+1);let d=e.indexOf("=",n);d>i&&i!==-1&&(d=-1);let l=e.slice(n+1,d===-1?i===-1?void 0:i:d);if(r&&(l=De(l)),n=i,l==="")continue;let c;d===-1?c="":(c=e.slice(d+1,i===-1?void 0:i),r&&(c=De(c))),s?(a[l]&&Array.isArray(a[l])||(a[l]=[]),a[l].push(c)):a[l]??(a[l]=c)}return t?a[t]:a},Mt=st,It=(e,t)=>st(e,t,!0),rt=decodeURIComponent,qe=e=>Ie(e,rt),ne,O,L,nt,it,Pe,B,We,at=(We=class{constructor(e,t="/",s=[[]]){g(this,L);f(this,"raw");g(this,ne);g(this,O);f(this,"routeIndex",0);f(this,"path");f(this,"bodyCache",{});g(this,B,e=>{const{bodyCache:t,raw:s}=this,r=t[e];if(r)return r;const a=Object.keys(t)[0];return a?t[a].then(n=>(a==="json"&&(n=JSON.stringify(n)),new Response(n)[e]())):t[e]=s[e]()});this.raw=e,this.path=t,m(this,O,s),m(this,ne,{})}param(e){return e?v(this,L,nt).call(this,e):v(this,L,it).call(this)}query(e){return Mt(this.url,e)}queries(e){return It(this.url,e)}header(e){if(e)return this.raw.headers.get(e)??void 0;const t={};return this.raw.headers.forEach((s,r)=>{t[r]=s}),t}async parseBody(e){var t;return(t=this.bodyCache).parsedBody??(t.parsedBody=await _t(this,e))}json(){return o(this,B).call(this,"text").then(e=>JSON.parse(e))}text(){return o(this,B).call(this,"text")}arrayBuffer(){return o(this,B).call(this,"arrayBuffer")}blob(){return o(this,B).call(this,"blob")}formData(){return o(this,B).call(this,"formData")}addValidatedData(e,t){o(this,ne)[e]=t}valid(e){return o(this,ne)[e]}get url(){return this.raw.url}get method(){return this.raw.method}get[Et](){return o(this,O)}get matchedRoutes(){return o(this,O)[0].map(([[,e]])=>e)}get routePath(){return o(this,O)[0].map(([[,e]])=>e)[this.routeIndex].path}},ne=new WeakMap,O=new WeakMap,L=new WeakSet,nt=function(e){const t=o(this,O)[0][this.routeIndex][1][e],s=v(this,L,Pe).call(this,t);return s&&/\%/.test(s)?qe(s):s},it=function(){const e={},t=Object.keys(o(this,O)[0][this.routeIndex][1]);for(const s of t){const r=v(this,L,Pe).call(this,o(this,O)[0][this.routeIndex][1][s]);r!==void 0&&(e[s]=/\%/.test(r)?qe(r):r)}return e},Pe=function(e){return o(this,O)[1]?o(this,O)[1][e]:e},B=new WeakMap,We),kt={Stringify:1},ot=async(e,t,s,r,a)=>{typeof e=="object"&&!(e instanceof String)&&(e instanceof Promise||(e=e.toString()),e instanceof Promise&&(e=await e));const n=e.callbacks;return n!=null&&n.length?(a?a[0]+=e:a=[e],Promise.all(n.map(d=>d({phase:t,buffer:a,context:r}))).then(d=>Promise.all(d.filter(Boolean).map(l=>ot(l,t,!1,r,a))).then(()=>a[0]))):Promise.resolve(e)},Ht="text/plain; charset=UTF-8",Ne=(e,t)=>({"Content-Type":e,...t}),he,ge,I,ie,k,S,be,oe,le,K,ve,ye,U,re,ze,Ft=(ze=class{constructor(e,t){g(this,U);g(this,he);g(this,ge);f(this,"env",{});g(this,I);f(this,"finalized",!1);f(this,"error");g(this,ie);g(this,k);g(this,S);g(this,be);g(this,oe);g(this,le);g(this,K);g(this,ve);g(this,ye);f(this,"render",(...e)=>(o(this,oe)??m(this,oe,t=>this.html(t)),o(this,oe).call(this,...e)));f(this,"setLayout",e=>m(this,be,e));f(this,"getLayout",()=>o(this,be));f(this,"setRenderer",e=>{m(this,oe,e)});f(this,"header",(e,t,s)=>{this.finalized&&m(this,S,new Response(o(this,S).body,o(this,S)));const r=o(this,S)?o(this,S).headers:o(this,K)??m(this,K,new Headers);t===void 0?r.delete(e):s!=null&&s.append?r.append(e,t):r.set(e,t)});f(this,"status",e=>{m(this,ie,e)});f(this,"set",(e,t)=>{o(this,I)??m(this,I,new Map),o(this,I).set(e,t)});f(this,"get",e=>o(this,I)?o(this,I).get(e):void 0);f(this,"newResponse",(...e)=>v(this,U,re).call(this,...e));f(this,"body",(e,t,s)=>v(this,U,re).call(this,e,t,s));f(this,"text",(e,t,s)=>!o(this,K)&&!o(this,ie)&&!t&&!s&&!this.finalized?new Response(e):v(this,U,re).call(this,e,t,Ne(Ht,s)));f(this,"json",(e,t,s)=>v(this,U,re).call(this,JSON.stringify(e),t,Ne("application/json",s)));f(this,"html",(e,t,s)=>{const r=a=>v(this,U,re).call(this,a,t,Ne("text/html; charset=UTF-8",s));return typeof e=="object"?ot(e,kt.Stringify,!1,{}).then(r):r(e)});f(this,"redirect",(e,t)=>{const s=String(e);return this.header("Location",/[^\x00-\xFF]/.test(s)?encodeURI(s):s),this.newResponse(null,t??302)});f(this,"notFound",()=>(o(this,le)??m(this,le,()=>new Response),o(this,le).call(this,this)));m(this,he,e),t&&(m(this,k,t.executionCtx),this.env=t.env,m(this,le,t.notFoundHandler),m(this,ye,t.path),m(this,ve,t.matchResult))}get req(){return o(this,ge)??m(this,ge,new at(o(this,he),o(this,ye),o(this,ve))),o(this,ge)}get event(){if(o(this,k)&&"respondWith"in o(this,k))return o(this,k);throw Error("This context has no FetchEvent")}get executionCtx(){if(o(this,k))return o(this,k);throw Error("This context has no ExecutionContext")}get res(){return o(this,S)||m(this,S,new Response(null,{headers:o(this,K)??m(this,K,new Headers)}))}set res(e){if(o(this,S)&&e){e=new Response(e.body,e);for(const[t,s]of o(this,S).headers.entries())if(t!=="content-type")if(t==="set-cookie"){const r=o(this,S).headers.getSetCookie();e.headers.delete("set-cookie");for(const a of r)e.headers.append("set-cookie",a)}else e.headers.set(t,s)}m(this,S,e),this.finalized=!0}get var(){return o(this,I)?Object.fromEntries(o(this,I)):{}}},he=new WeakMap,ge=new WeakMap,I=new WeakMap,ie=new WeakMap,k=new WeakMap,S=new WeakMap,be=new WeakMap,oe=new WeakMap,le=new WeakMap,K=new WeakMap,ve=new WeakMap,ye=new WeakMap,U=new WeakSet,re=function(e,t,s){const r=o(this,S)?new Headers(o(this,S).headers):o(this,K)??new Headers;if(typeof t=="object"&&"headers"in t){const n=t.headers instanceof Headers?t.headers:new Headers(t.headers);for(const[i,d]of n)i.toLowerCase()==="set-cookie"?r.append(i,d):r.set(i,d)}if(s)for(const[n,i]of Object.entries(s))if(typeof i=="string")r.set(n,i);else{r.delete(n);for(const d of i)r.append(n,d)}const a=typeof t=="number"?t:(t==null?void 0:t.status)??o(this,ie);return new Response(e,{status:a,headers:r})},ze),E="ALL",Lt="all",qt=["get","post","put","delete","options","patch"],lt="Can not add a route since the matcher is already built.",dt=class extends Error{},Bt="__COMPOSED_HANDLER",Ut=e=>e.text("404 Not Found",404),Be=(e,t)=>{if("getResponse"in e){const s=e.getResponse();return t.newResponse(s.body,s)}return console.error(e),t.text("Internal Server Error",500)},C,_,ut,D,Y,Ee,_e,Ve,ct=(Ve=class{constructor(t={}){g(this,_);f(this,"get");f(this,"post");f(this,"put");f(this,"delete");f(this,"options");f(this,"patch");f(this,"all");f(this,"on");f(this,"use");f(this,"router");f(this,"getPath");f(this,"_basePath","/");g(this,C,"/");f(this,"routes",[]);g(this,D,Ut);f(this,"errorHandler",Be);f(this,"onError",t=>(this.errorHandler=t,this));f(this,"notFound",t=>(m(this,D,t),this));f(this,"fetch",(t,...s)=>v(this,_,_e).call(this,t,s[1],s[0],t.method));f(this,"request",(t,s,r,a)=>t instanceof Request?this.fetch(s?new Request(t,s):t,r,a):(t=t.toString(),this.fetch(new Request(/^https?:\/\//.test(t)?t:`http://localhost${se("/",t)}`,s),r,a)));f(this,"fire",()=>{addEventListener("fetch",t=>{t.respondWith(v(this,_,_e).call(this,t.request,t,void 0,t.request.method))})});[...qt,Lt].forEach(n=>{this[n]=(i,...d)=>(typeof i=="string"?m(this,C,i):v(this,_,Y).call(this,n,o(this,C),i),d.forEach(l=>{v(this,_,Y).call(this,n,o(this,C),l)}),this)}),this.on=(n,i,...d)=>{for(const l of[i].flat()){m(this,C,l);for(const c of[n].flat())d.map(u=>{v(this,_,Y).call(this,c.toUpperCase(),o(this,C),u)})}return this},this.use=(n,...i)=>(typeof n=="string"?m(this,C,n):(m(this,C,"*"),i.unshift(n)),i.forEach(d=>{v(this,_,Y).call(this,E,o(this,C),d)}),this);const{strict:r,...a}=t;Object.assign(this,a),this.getPath=r??!0?t.getPath??et:Pt}route(t,s){const r=this.basePath(t);return s.routes.map(a=>{var i;let n;s.errorHandler===Be?n=a.handler:(n=async(d,l)=>(await Le([],s.errorHandler)(d,()=>a.handler(d,l))).res,n[Bt]=a.handler),v(i=r,_,Y).call(i,a.method,a.path,n)}),this}basePath(t){const s=v(this,_,ut).call(this);return s._basePath=se(this._basePath,t),s}mount(t,s,r){let a,n;r&&(typeof r=="function"?n=r:(n=r.optionHandler,r.replaceRequest===!1?a=l=>l:a=r.replaceRequest));const i=n?l=>{const c=n(l);return Array.isArray(c)?c:[c]}:l=>{let c;try{c=l.executionCtx}catch{}return[l.env,c]};a||(a=(()=>{const l=se(this._basePath,t),c=l==="/"?0:l.length;return u=>{const p=new URL(u.url);return p.pathname=p.pathname.slice(c)||"/",new Request(p,u)}})());const d=async(l,c)=>{const u=await s(a(l.req.raw),...i(l));if(u)return u;await c()};return v(this,_,Y).call(this,E,se(t,"*"),d),this}},C=new WeakMap,_=new WeakSet,ut=function(){const t=new ct({router:this.router,getPath:this.getPath});return t.errorHandler=this.errorHandler,m(t,D,o(this,D)),t.routes=this.routes,t},D=new WeakMap,Y=function(t,s,r){t=t.toUpperCase(),s=se(this._basePath,s);const a={basePath:this._basePath,path:s,method:t,handler:r};this.router.add(t,s,[r,a]),this.routes.push(a)},Ee=function(t,s){if(t instanceof Error)return this.errorHandler(t,s);throw t},_e=function(t,s,r,a){if(a==="HEAD")return(async()=>new Response(null,await v(this,_,_e).call(this,t,s,r,"GET")))();const n=this.getPath(t,{env:r}),i=this.router.match(a,n),d=new Ft(t,{path:n,matchResult:i,env:r,executionCtx:s,notFoundHandler:o(this,D)});if(i[0].length===1){let c;try{c=i[0][0][0][0](d,async()=>{d.res=await o(this,D).call(this,d)})}catch(u){return v(this,_,Ee).call(this,u,d)}return c instanceof Promise?c.then(u=>u||(d.finalized?d.res:o(this,D).call(this,d))).catch(u=>v(this,_,Ee).call(this,u,d)):c??o(this,D).call(this,d)}const l=Le(i[0],this.errorHandler,o(this,D));return(async()=>{try{const c=await l(d);if(!c.finalized)throw new Error("Context is not finalized. Did you forget to return a Response object or `await next()`?");return c.res}catch(c){return v(this,_,Ee).call(this,c,d)}})()},Ve),mt=[];function $t(e,t){const s=this.buildAllMatchers(),r=(a,n)=>{const i=s[a]||s[E],d=i[2][n];if(d)return d;const l=n.match(i[0]);if(!l)return[[],mt];const c=l.indexOf("",1);return[i[1][c],l]};return this.match=r,r(e,t)}var Re="[^/]+",pe=".*",fe="(?:|/.*)",ae=Symbol(),Wt=new Set(".\\+*[^]$()");function zt(e,t){return e.length===1?t.length===1?e<t?-1:1:-1:t.length===1||e===pe||e===fe?1:t===pe||t===fe?-1:e===Re?1:t===Re?-1:e.length===t.length?e<t?-1:1:t.length-e.length}var J,X,N,Ye,Me=(Ye=class{constructor(){g(this,J);g(this,X);g(this,N,Object.create(null))}insert(t,s,r,a,n){if(t.length===0){if(o(this,J)!==void 0)throw ae;if(n)return;m(this,J,s);return}const[i,...d]=t,l=i==="*"?d.length===0?["","",pe]:["","",Re]:i==="/*"?["","",fe]:i.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);let c;if(l){const u=l[1];let p=l[2]||Re;if(u&&l[2]&&(p===".*"||(p=p.replace(/^\((?!\?:)(?=[^)]+\)$)/,"(?:"),/\((?!\?:)/.test(p))))throw ae;if(c=o(this,N)[p],!c){if(Object.keys(o(this,N)).some(h=>h!==pe&&h!==fe))throw ae;if(n)return;c=o(this,N)[p]=new Me,u!==""&&m(c,X,a.varIndex++)}!n&&u!==""&&r.push([u,o(c,X)])}else if(c=o(this,N)[i],!c){if(Object.keys(o(this,N)).some(u=>u.length>1&&u!==pe&&u!==fe))throw ae;if(n)return;c=o(this,N)[i]=new Me}c.insert(d,s,r,a,n)}buildRegExpStr(){const s=Object.keys(o(this,N)).sort(zt).map(r=>{const a=o(this,N)[r];return(typeof o(a,X)=="number"?`(${r})@${o(a,X)}`:Wt.has(r)?`\\${r}`:r)+a.buildRegExpStr()});return typeof o(this,J)=="number"&&s.unshift(`#${o(this,J)}`),s.length===0?"":s.length===1?s[0]:"(?:"+s.join("|")+")"}},J=new WeakMap,X=new WeakMap,N=new WeakMap,Ye),Ae,xe,Ge,Vt=(Ge=class{constructor(){g(this,Ae,{varIndex:0});g(this,xe,new Me)}insert(e,t,s){const r=[],a=[];for(let i=0;;){let d=!1;if(e=e.replace(/\{[^}]+\}/g,l=>{const c=`@\\${i}`;return a[i]=[c,l],i++,d=!0,c}),!d)break}const n=e.match(/(?::[^\/]+)|(?:\/\*$)|./g)||[];for(let i=a.length-1;i>=0;i--){const[d]=a[i];for(let l=n.length-1;l>=0;l--)if(n[l].indexOf(d)!==-1){n[l]=n[l].replace(d,a[i][1]);break}}return o(this,xe).insert(n,t,r,o(this,Ae),s),r}buildRegExp(){let e=o(this,xe).buildRegExpStr();if(e==="")return[/^$/,[],[]];let t=0;const s=[],r=[];return e=e.replace(/#(\d+)|@(\d+)|\.\*\$/g,(a,n,i)=>n!==void 0?(s[++t]=Number(n),"$()"):(i!==void 0&&(r[Number(i)]=++t),"")),[new RegExp(`^${e}`),s,r]}},Ae=new WeakMap,xe=new WeakMap,Ge),Yt=[/^$/,[],Object.create(null)],Te=Object.create(null);function pt(e){return Te[e]??(Te[e]=new RegExp(e==="*"?"":`^${e.replace(/\/\*$|([.\\+*[^\]$()])/g,(t,s)=>s?`\\${s}`:"(?:|/.*)")}$`))}function Gt(){Te=Object.create(null)}function Kt(e){var c;const t=new Vt,s=[];if(e.length===0)return Yt;const r=e.map(u=>[!/\*|\/:/.test(u[0]),...u]).sort(([u,p],[h,w])=>u?1:h?-1:p.length-w.length),a=Object.create(null);for(let u=0,p=-1,h=r.length;u<h;u++){const[w,j,y]=r[u];w?a[j]=[y.map(([A])=>[A,Object.create(null)]),mt]:p++;let x;try{x=t.insert(j,p,w)}catch(A){throw A===ae?new dt(j):A}w||(s[p]=y.map(([A,ee])=>{const ce=Object.create(null);for(ee-=1;ee>=0;ee--){const[P,je]=x[ee];ce[P]=je}return[A,ce]}))}const[n,i,d]=t.buildRegExp();for(let u=0,p=s.length;u<p;u++)for(let h=0,w=s[u].length;h<w;h++){const j=(c=s[u][h])==null?void 0:c[1];if(!j)continue;const y=Object.keys(j);for(let x=0,A=y.length;x<A;x++)j[y[x]]=d[j[y[x]]]}const l=[];for(const u in i)l[u]=s[i[u]];return[n,l,a]}function te(e,t){if(e){for(const s of Object.keys(e).sort((r,a)=>a.length-r.length))if(pt(s).test(t))return[...e[s]]}}var $,W,Se,ft,Ke,Jt=(Ke=class{constructor(){g(this,Se);f(this,"name","RegExpRouter");g(this,$);g(this,W);f(this,"match",$t);m(this,$,{[E]:Object.create(null)}),m(this,W,{[E]:Object.create(null)})}add(e,t,s){var d;const r=o(this,$),a=o(this,W);if(!r||!a)throw new Error(lt);r[e]||[r,a].forEach(l=>{l[e]=Object.create(null),Object.keys(l[E]).forEach(c=>{l[e][c]=[...l[E][c]]})}),t==="/*"&&(t="*");const n=(t.match(/\/:/g)||[]).length;if(/\*$/.test(t)){const l=pt(t);e===E?Object.keys(r).forEach(c=>{var u;(u=r[c])[t]||(u[t]=te(r[c],t)||te(r[E],t)||[])}):(d=r[e])[t]||(d[t]=te(r[e],t)||te(r[E],t)||[]),Object.keys(r).forEach(c=>{(e===E||e===c)&&Object.keys(r[c]).forEach(u=>{l.test(u)&&r[c][u].push([s,n])})}),Object.keys(a).forEach(c=>{(e===E||e===c)&&Object.keys(a[c]).forEach(u=>l.test(u)&&a[c][u].push([s,n]))});return}const i=tt(t)||[t];for(let l=0,c=i.length;l<c;l++){const u=i[l];Object.keys(a).forEach(p=>{var h;(e===E||e===p)&&((h=a[p])[u]||(h[u]=[...te(r[p],u)||te(r[E],u)||[]]),a[p][u].push([s,n-c+l+1]))})}}buildAllMatchers(){const e=Object.create(null);return Object.keys(o(this,W)).concat(Object.keys(o(this,$))).forEach(t=>{e[t]||(e[t]=v(this,Se,ft).call(this,t))}),m(this,$,m(this,W,void 0)),Gt(),e}},$=new WeakMap,W=new WeakMap,Se=new WeakSet,ft=function(e){const t=[];let s=e===E;return[o(this,$),o(this,W)].forEach(r=>{const a=r[e]?Object.keys(r[e]).map(n=>[n,r[e][n]]):[];a.length!==0?(s||(s=!0),t.push(...a)):e!==E&&t.push(...Object.keys(r[E]).map(n=>[n,r[E][n]]))}),s?Kt(t):null},Ke),z,H,Je,Xt=(Je=class{constructor(e){f(this,"name","SmartRouter");g(this,z,[]);g(this,H,[]);m(this,z,e.routers)}add(e,t,s){if(!o(this,H))throw new Error(lt);o(this,H).push([e,t,s])}match(e,t){if(!o(this,H))throw new Error("Fatal error");const s=o(this,z),r=o(this,H),a=s.length;let n=0,i;for(;n<a;n++){const d=s[n];try{for(let l=0,c=r.length;l<c;l++)d.add(...r[l]);i=d.match(e,t)}catch(l){if(l instanceof dt)continue;throw l}this.match=d.match.bind(d),m(this,z,[d]),m(this,H,void 0);break}if(n===a)throw new Error("Fatal error");return this.name=`SmartRouter + ${this.activeRouter.name}`,i}get activeRouter(){if(o(this,H)||o(this,z).length!==1)throw new Error("No active router has been determined yet.");return o(this,z)[0]}},z=new WeakMap,H=new WeakMap,Je),me=Object.create(null),V,R,Q,de,T,F,G,Xe,ht=(Xe=class{constructor(e,t,s){g(this,F);g(this,V);g(this,R);g(this,Q);g(this,de,0);g(this,T,me);if(m(this,R,s||Object.create(null)),m(this,V,[]),e&&t){const r=Object.create(null);r[e]={handler:t,possibleKeys:[],score:0},m(this,V,[r])}m(this,Q,[])}insert(e,t,s){m(this,de,++Fe(this,de)._);let r=this;const a=jt(t),n=[];for(let i=0,d=a.length;i<d;i++){const l=a[i],c=a[i+1],u=Dt(l,c),p=Array.isArray(u)?u[0]:l;if(p in o(r,R)){r=o(r,R)[p],u&&n.push(u[1]);continue}o(r,R)[p]=new ht,u&&(o(r,Q).push(u),n.push(u[1])),r=o(r,R)[p]}return o(r,V).push({[e]:{handler:s,possibleKeys:n.filter((i,d,l)=>l.indexOf(i)===d),score:o(this,de)}}),r}search(e,t){var d;const s=[];m(this,T,me);let a=[this];const n=Ze(t),i=[];for(let l=0,c=n.length;l<c;l++){const u=n[l],p=l===c-1,h=[];for(let w=0,j=a.length;w<j;w++){const y=a[w],x=o(y,R)[u];x&&(m(x,T,o(y,T)),p?(o(x,R)["*"]&&s.push(...v(this,F,G).call(this,o(x,R)["*"],e,o(y,T))),s.push(...v(this,F,G).call(this,x,e,o(y,T)))):h.push(x));for(let A=0,ee=o(y,Q).length;A<ee;A++){const ce=o(y,Q)[A],P=o(y,T)===me?{}:{...o(y,T)};if(ce==="*"){const q=o(y,R)["*"];q&&(s.push(...v(this,F,G).call(this,q,e,o(y,T))),m(q,T,P),h.push(q));continue}const[je,ke,ue]=ce;if(!u&&!(ue instanceof RegExp))continue;const M=o(y,R)[je],yt=n.slice(l).join("/");if(ue instanceof RegExp){const q=ue.exec(yt);if(q){if(P[ke]=q[0],s.push(...v(this,F,G).call(this,M,e,o(y,T),P)),Object.keys(o(M,R)).length){m(M,T,P);const Oe=((d=q[0].match(/\//))==null?void 0:d.length)??0;(i[Oe]||(i[Oe]=[])).push(M)}continue}}(ue===!0||ue.test(u))&&(P[ke]=u,p?(s.push(...v(this,F,G).call(this,M,e,P,o(y,T))),o(M,R)["*"]&&s.push(...v(this,F,G).call(this,o(M,R)["*"],e,P,o(y,T)))):(m(M,T,P),h.push(M)))}}a=h.concat(i.shift()??[])}return s.length>1&&s.sort((l,c)=>l.score-c.score),[s.map(({handler:l,params:c})=>[l,c])]}},V=new WeakMap,R=new WeakMap,Q=new WeakMap,de=new WeakMap,T=new WeakMap,F=new WeakSet,G=function(e,t,s,r){const a=[];for(let n=0,i=o(e,V).length;n<i;n++){const d=o(e,V)[n],l=d[t]||d[E],c={};if(l!==void 0&&(l.params=Object.create(null),a.push(l),s!==me||r&&r!==me))for(let u=0,p=l.possibleKeys.length;u<p;u++){const h=l.possibleKeys[u],w=c[l.score];l.params[h]=r!=null&&r[h]&&!w?r[h]:s[h]??(r==null?void 0:r[h]),c[l.score]=!0}}return a},Xe),Z,Qe,Qt=(Qe=class{constructor(){f(this,"name","TrieRouter");g(this,Z);m(this,Z,new ht)}add(e,t,s){const r=tt(t);if(r){for(let a=0,n=r.length;a<n;a++)o(this,Z).insert(e,r[a],s);return}o(this,Z).insert(e,t,s)}match(e,t){return o(this,Z).search(e,t)}},Z=new WeakMap,Qe),gt=class extends ct{constructor(e={}){super(e),this.router=e.router??new Xt({routers:[new Jt,new Qt]})}},Zt=e=>{const s={...{origin:"*",allowMethods:["GET","HEAD","PUT","POST","DELETE","PATCH"],allowHeaders:[],exposeHeaders:[]},...e},r=(n=>typeof n=="string"?n==="*"?()=>n:i=>n===i?i:null:typeof n=="function"?n:i=>n.includes(i)?i:null)(s.origin),a=(n=>typeof n=="function"?n:Array.isArray(n)?()=>n:()=>[])(s.allowMethods);return async function(i,d){var u;function l(p,h){i.res.headers.set(p,h)}const c=await r(i.req.header("origin")||"",i);if(c&&l("Access-Control-Allow-Origin",c),s.credentials&&l("Access-Control-Allow-Credentials","true"),(u=s.exposeHeaders)!=null&&u.length&&l("Access-Control-Expose-Headers",s.exposeHeaders.join(",")),i.req.method==="OPTIONS"){s.origin!=="*"&&l("Vary","Origin"),s.maxAge!=null&&l("Access-Control-Max-Age",s.maxAge.toString());const p=await a(i.req.header("origin")||"",i);p.length&&l("Access-Control-Allow-Methods",p.join(","));let h=s.allowHeaders;if(!(h!=null&&h.length)){const w=i.req.header("Access-Control-Request-Headers");w&&(h=w.split(/\s*,\s*/))}return h!=null&&h.length&&(l("Access-Control-Allow-Headers",h.join(",")),i.res.headers.append("Vary","Access-Control-Request-Headers")),i.res.headers.delete("Content-Length"),i.res.headers.delete("Content-Type"),new Response(null,{headers:i.res.headers,status:204,statusText:"No Content"})}await d(),s.origin!=="*"&&i.header("Vary","Origin",{append:!0})}},es=/^\s*(?:text\/(?!event-stream(?:[;\s]|$))[^;\s]+|application\/(?:javascript|json|xml|xml-dtd|ecmascript|dart|postscript|rtf|tar|toml|vnd\.dart|vnd\.ms-fontobject|vnd\.ms-opentype|wasm|x-httpd-php|x-javascript|x-ns-proxy-autoconfig|x-sh|x-tar|x-virtualbox-hdd|x-virtualbox-ova|x-virtualbox-ovf|x-virtualbox-vbox|x-virtualbox-vdi|x-virtualbox-vhd|x-virtualbox-vmdk|x-www-form-urlencoded)|font\/(?:otf|ttf)|image\/(?:bmp|vnd\.adobe\.photoshop|vnd\.microsoft\.icon|vnd\.ms-dds|x-icon|x-ms-bmp)|message\/rfc822|model\/gltf-binary|x-shader\/x-fragment|x-shader\/x-vertex|[^;\s]+?\+(?:json|text|xml|yaml))(?:[;\s]|$)/i,Ue=(e,t=ss)=>{const s=/\.([a-zA-Z0-9]+?)$/,r=e.match(s);if(!r)return;let a=t[r[1]];return a&&a.startsWith("text")&&(a+="; charset=utf-8"),a},ts={aac:"audio/aac",avi:"video/x-msvideo",avif:"image/avif",av1:"video/av1",bin:"application/octet-stream",bmp:"image/bmp",css:"text/css",csv:"text/csv",eot:"application/vnd.ms-fontobject",epub:"application/epub+zip",gif:"image/gif",gz:"application/gzip",htm:"text/html",html:"text/html",ico:"image/x-icon",ics:"text/calendar",jpeg:"image/jpeg",jpg:"image/jpeg",js:"text/javascript",json:"application/json",jsonld:"application/ld+json",map:"application/json",mid:"audio/x-midi",midi:"audio/x-midi",mjs:"text/javascript",mp3:"audio/mpeg",mp4:"video/mp4",mpeg:"video/mpeg",oga:"audio/ogg",ogv:"video/ogg",ogx:"application/ogg",opus:"audio/opus",otf:"font/otf",pdf:"application/pdf",png:"image/png",rtf:"application/rtf",svg:"image/svg+xml",tif:"image/tiff",tiff:"image/tiff",ts:"video/mp2t",ttf:"font/ttf",txt:"text/plain",wasm:"application/wasm",webm:"video/webm",weba:"audio/webm",webmanifest:"application/manifest+json",webp:"image/webp",woff:"font/woff",woff2:"font/woff2",xhtml:"application/xhtml+xml",xml:"application/xml",zip:"application/zip","3gp":"video/3gpp","3g2":"video/3gpp2",gltf:"model/gltf+json",glb:"model/gltf-binary"},ss=ts,rs=(...e)=>{let t=e.filter(a=>a!=="").join("/");t=t.replace(new RegExp("(?<=\\/)\\/+","g"),"");const s=t.split("/"),r=[];for(const a of s)a===".."&&r.length>0&&r.at(-1)!==".."?r.pop():a!=="."&&r.push(a);return r.join("/")||"."},bt={br:".br",zstd:".zst",gzip:".gz"},as=Object.keys(bt),ns="index.html",is=e=>{const t=e.root??"./",s=e.path,r=e.join??rs;return async(a,n)=>{var u,p,h,w;if(a.finalized)return n();let i;if(e.path)i=e.path;else try{if(i=decodeURIComponent(a.req.path),/(?:^|[\/\\])\.\.(?:$|[\/\\])/.test(i))throw new Error}catch{return await((u=e.onNotFound)==null?void 0:u.call(e,a.req.path,a)),n()}let d=r(t,!s&&e.rewriteRequestPath?e.rewriteRequestPath(i):i);e.isDir&&await e.isDir(d)&&(d=r(d,ns));const l=e.getContent;let c=await l(d,a);if(c instanceof Response)return a.newResponse(c.body,c);if(c){const j=e.mimes&&Ue(d,e.mimes)||Ue(d);if(a.header("Content-Type",j||"application/octet-stream"),e.precompressed&&(!j||es.test(j))){const y=new Set((p=a.req.header("Accept-Encoding"))==null?void 0:p.split(",").map(x=>x.trim()));for(const x of as){if(!y.has(x))continue;const A=await l(d+bt[x],a);if(A){c=A,a.header("Content-Encoding",x),a.header("Vary","Accept-Encoding",{append:!0});break}}}return await((h=e.onFound)==null?void 0:h.call(e,d,a)),a.body(c)}await((w=e.onNotFound)==null?void 0:w.call(e,d,a)),await n()}},os=async(e,t)=>{let s;t&&t.manifest?typeof t.manifest=="string"?s=JSON.parse(t.manifest):s=t.manifest:typeof __STATIC_CONTENT_MANIFEST=="string"?s=JSON.parse(__STATIC_CONTENT_MANIFEST):s=__STATIC_CONTENT_MANIFEST;let r;t&&t.namespace?r=t.namespace:r=__STATIC_CONTENT;const a=s[e]||e;if(!a)return null;const n=await r.get(a,{type:"stream"});return n||null},ls=e=>async function(s,r){return is({...e,getContent:async n=>os(n,{manifest:e.manifest,namespace:e.namespace?e.namespace:s.env?s.env.__STATIC_CONTENT:void 0})})(s,r)},ds=e=>ls(e);const b=new gt;b.use("/api/*",Zt());b.use("/static/*",ds({root:"./public"}));b.get("/api/agencies",async e=>{const{DB:t}=e.env,s=await t.prepare("SELECT * FROM agencies ORDER BY name").all();return e.json(s.results||[])});b.get("/api/agencies/active",async e=>{const{DB:t}=e.env,s=await t.prepare("SELECT * FROM agencies WHERE is_active = 1 ORDER BY name").all();return e.json(s.results||[])});b.get("/api/agencies/:id",async e=>{const{DB:t}=e.env,s=e.req.param("id"),r=await t.prepare("SELECT * FROM agencies WHERE id = ?").bind(s).first();return e.json(r||{})});b.post("/api/agencies",async e=>{const{DB:t}=e.env,s=await e.req.json(),r=await t.prepare("INSERT INTO agencies (name, email, phone, address, logo_url, is_active) VALUES (?, ?, ?, ?, ?, ?)").bind(s.name,s.email||null,s.phone||null,s.address||null,s.logo_url||null,s.is_active!==void 0?s.is_active:1).run();return e.json({id:r.meta.last_row_id,...s})});b.put("/api/agencies/:id",async e=>{const{DB:t}=e.env,s=e.req.param("id"),r=await e.req.json();return await t.prepare("UPDATE agencies SET name = ?, email = ?, phone = ?, address = ?, logo_url = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(r.name,r.email||null,r.phone||null,r.address||null,r.logo_url||null,r.is_active!==void 0?r.is_active:1,s).run(),e.json({id:s,...r})});b.delete("/api/agencies/:id",async e=>{const{DB:t}=e.env,s=e.req.param("id");return await t.prepare("DELETE FROM agencies WHERE id = ?").bind(s).run(),e.json({success:!0})});b.get("/api/customers",async e=>{const{DB:t}=e.env,s=await t.prepare("SELECT * FROM customers ORDER BY name").all();return e.json(s.results||[])});b.get("/api/customers/:id",async e=>{const{DB:t}=e.env,s=e.req.param("id"),r=await t.prepare("SELECT * FROM customers WHERE id = ?").bind(s).first();return e.json(r||{})});b.post("/api/customers",async e=>{const{DB:t}=e.env,s=await e.req.json(),r=await t.prepare("INSERT INTO customers (name, email, phone, address, company, tax_id) VALUES (?, ?, ?, ?, ?, ?)").bind(s.name,s.email,s.phone||null,s.address||null,s.company||null,s.tax_id||null).run();return e.json({id:r.meta.last_row_id,...s})});b.put("/api/customers/:id",async e=>{const{DB:t}=e.env,s=e.req.param("id"),r=await e.req.json();return await t.prepare("UPDATE customers SET name = ?, email = ?, phone = ?, address = ?, company = ?, tax_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(r.name,r.email,r.phone||null,r.address||null,r.company||null,r.tax_id||null,s).run(),e.json({id:s,...r})});b.delete("/api/customers/:id",async e=>{const{DB:t}=e.env,s=e.req.param("id");return await t.prepare("DELETE FROM customers WHERE id = ?").bind(s).run(),e.json({success:!0})});b.get("/api/templates",async e=>{const{DB:t}=e.env,s=await t.prepare("SELECT * FROM agreement_templates ORDER BY name").all();return e.json(s.results||[])});b.get("/api/templates/:id",async e=>{const{DB:t}=e.env,s=e.req.param("id"),r=await t.prepare("SELECT * FROM agreement_templates WHERE id = ?").bind(s).first();return e.json(r||{})});b.post("/api/templates",async e=>{const{DB:t}=e.env,s=await e.req.json(),r=await t.prepare("INSERT INTO agreement_templates (name, description, content, signature_required) VALUES (?, ?, ?, ?)").bind(s.name,s.description||null,s.content,s.signature_required!==void 0?s.signature_required:1).run();return e.json({id:r.meta.last_row_id,...s})});b.put("/api/templates/:id",async e=>{const{DB:t}=e.env,s=e.req.param("id"),r=await e.req.json();return await t.prepare("UPDATE agreement_templates SET name = ?, description = ?, content = ?, signature_required = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(r.name,r.description||null,r.content,r.signature_required!==void 0?r.signature_required:1,s).run(),e.json({id:s,...r})});b.delete("/api/templates/:id",async e=>{const{DB:t}=e.env,s=e.req.param("id");return await t.prepare("DELETE FROM agreement_templates WHERE id = ?").bind(s).run(),e.json({success:!0})});b.get("/api/agreements",async e=>{const{DB:t}=e.env,s=await t.prepare(`
    SELECT a.*, ag.name as agency_name, c.name as customer_name, c.email as customer_email
    FROM agreements a
    LEFT JOIN agencies ag ON a.agency_id = ag.id
    LEFT JOIN customers c ON a.customer_id = c.id
    ORDER BY a.created_at DESC
  `).all();return e.json(s.results||[])});b.get("/api/agreements/:id",async e=>{const{DB:t}=e.env,s=e.req.param("id"),r=await t.prepare(`
    SELECT a.*, ag.name as agency_name, ag.email as agency_email, ag.address as agency_address,
           c.name as customer_name, c.email as customer_email, c.company as customer_company
    FROM agreements a
    LEFT JOIN agencies ag ON a.agency_id = ag.id
    LEFT JOIN customers c ON a.customer_id = c.id
    WHERE a.id = ?
  `).bind(s).first();if(!r)return e.json({});const a=await t.prepare("SELECT * FROM service_sections WHERE agreement_id = ? ORDER BY sort_order").bind(s).all();return e.json({...r,services:a.results||[]})});b.post("/api/agreements",async e=>{const{DB:t}=e.env,s=await e.req.json(),r=`AGR-${Date.now()}-${Math.floor(Math.random()*1e3)}`,n=(await t.prepare(`
    INSERT INTO agreements (
      agreement_number, agency_id, customer_id, template_id, title, content,
      monthly_payment, payment_day, start_date, end_date, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(r,s.agency_id,s.customer_id,s.template_id||null,s.title,s.content,s.monthly_payment||null,s.payment_day||1,s.start_date,s.end_date||null,s.status||"draft").run()).meta.last_row_id;if(s.services&&Array.isArray(s.services))for(let i=0;i<s.services.length;i++){const d=s.services[i];await t.prepare("INSERT INTO service_sections (agreement_id, title, description, price, sort_order) VALUES (?, ?, ?, ?, ?)").bind(n,d.title,d.description||null,d.price||null,i).run()}return e.json({id:n,agreement_number:r,...s})});b.put("/api/agreements/:id",async e=>{const{DB:t}=e.env,s=e.req.param("id"),r=await e.req.json();if(await t.prepare(`
    UPDATE agreements SET
      agency_id = ?, customer_id = ?, template_id = ?, title = ?, content = ?,
      monthly_payment = ?, payment_day = ?, start_date = ?, end_date = ?, status = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(r.agency_id,r.customer_id,r.template_id||null,r.title,r.content,r.monthly_payment||null,r.payment_day||1,r.start_date,r.end_date||null,r.status||"draft",s).run(),r.services&&Array.isArray(r.services)){await t.prepare("DELETE FROM service_sections WHERE agreement_id = ?").bind(s).run();for(let a=0;a<r.services.length;a++){const n=r.services[a];await t.prepare("INSERT INTO service_sections (agreement_id, title, description, price, sort_order) VALUES (?, ?, ?, ?, ?)").bind(s,n.title,n.description||null,n.price||null,a).run()}}return e.json({id:s,...r})});b.post("/api/agreements/:id/sign",async e=>{const{DB:t}=e.env,s=e.req.param("id"),r=await e.req.json();if(r.party==="agency")await t.prepare("UPDATE agreements SET agency_signed = 1, agency_signature = ?, agency_signed_at = CURRENT_TIMESTAMP WHERE id = ?").bind(r.signature,s).run();else if(r.party==="customer"){await t.prepare("UPDATE agreements SET customer_signed = 1, customer_signature = ?, customer_signed_at = CURRENT_TIMESTAMP WHERE id = ?").bind(r.signature,s).run();const a=await t.prepare("SELECT * FROM agreements WHERE id = ?").bind(s).first();a&&a.agency_signed===1&&await t.prepare("UPDATE agreements SET status = ? WHERE id = ?").bind("active",s).run()}return e.json({success:!0})});b.delete("/api/agreements/:id",async e=>{const{DB:t}=e.env,s=e.req.param("id");return await t.prepare("DELETE FROM service_sections WHERE agreement_id = ?").bind(s).run(),await t.prepare("DELETE FROM payment_reminders WHERE agreement_id = ?").bind(s).run(),await t.prepare("DELETE FROM agreements WHERE id = ?").bind(s).run(),e.json({success:!0})});b.get("/api/reminders",async e=>{const{DB:t}=e.env,s=await t.prepare(`
    SELECT pr.*, a.title as agreement_title, a.agreement_number, c.name as customer_name, c.email as customer_email
    FROM payment_reminders pr
    LEFT JOIN agreements a ON pr.agreement_id = a.id
    LEFT JOIN customers c ON a.customer_id = c.id
    ORDER BY pr.due_date DESC
  `).all();return e.json(s.results||[])});b.get("/api/reminders/pending",async e=>{const{DB:t}=e.env,s=await t.prepare(`
    SELECT pr.*, a.title as agreement_title, a.agreement_number, c.name as customer_name, c.email as customer_email
    FROM payment_reminders pr
    LEFT JOIN agreements a ON pr.agreement_id = a.id
    LEFT JOIN customers c ON a.customer_id = c.id
    WHERE pr.status = 'pending'
    ORDER BY pr.due_date ASC
  `).all();return e.json(s.results||[])});b.post("/api/reminders",async e=>{const{DB:t}=e.env,s=await e.req.json(),r=await t.prepare("INSERT INTO payment_reminders (agreement_id, due_date, amount, status) VALUES (?, ?, ?, ?)").bind(s.agreement_id,s.due_date,s.amount,s.status||"pending").run();return e.json({id:r.meta.last_row_id,...s})});b.put("/api/reminders/:id/mark-paid",async e=>{const{DB:t}=e.env,s=e.req.param("id");return await t.prepare("UPDATE payment_reminders SET status = ?, paid_at = CURRENT_TIMESTAMP WHERE id = ?").bind("paid",s).run(),e.json({success:!0})});b.put("/api/reminders/:id/mark-sent",async e=>{const{DB:t}=e.env,s=e.req.param("id");return await t.prepare("UPDATE payment_reminders SET sent_at = CURRENT_TIMESTAMP WHERE id = ?").bind(s).run(),e.json({success:!0})});b.get("/api/email-settings",async e=>{const{DB:t}=e.env,s=await t.prepare("SELECT * FROM email_settings WHERE is_active = 1 LIMIT 1").first();return e.json(s||{})});b.post("/api/email-settings",async e=>{const{DB:t}=e.env,s=await e.req.json();await t.prepare("UPDATE email_settings SET is_active = 0").run();const r=await t.prepare("INSERT INTO email_settings (provider, api_key, from_email, from_name, reminder_days_before, is_active) VALUES (?, ?, ?, ?, ?, 1)").bind(s.provider,s.api_key,s.from_email,s.from_name||null,s.reminder_days_before||3).run();return e.json({id:r.meta.last_row_id,...s})});b.put("/api/email-settings/:id",async e=>{const{DB:t}=e.env,s=e.req.param("id"),r=await e.req.json();return await t.prepare("UPDATE email_settings SET provider = ?, api_key = ?, from_email = ?, from_name = ?, reminder_days_before = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(r.provider,r.api_key,r.from_email,r.from_name||null,r.reminder_days_before||3,s).run(),e.json({id:s,...r})});b.get("/",e=>e.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Agreement Management System</title>
        <script src="https://cdn.tailwindcss.com"><\/script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <script src="https://cdn.jsdelivr.net/npm/signature_pad@4.1.7/dist/signature_pad.umd.min.js"><\/script>
        <style>
            .signature-pad { border: 2px solid #e5e7eb; border-radius: 8px; }
            .tab-content { display: none; }
            .tab-content.active { display: block; }
            .nav-tab.active { background-color: #3b82f6; color: white; }
        </style>
    </head>
    <body class="bg-gray-50">
        <div class="min-h-screen">
            <!-- Header -->
            <header class="bg-white shadow-sm border-b border-gray-200">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <h1 class="text-2xl font-bold text-gray-900">
                                <i class="fas fa-file-contract mr-2 text-blue-600"></i>
                                Agreement Management
                            </h1>
                            <p class="text-sm text-gray-600 mt-1">Manage agencies, customers, and agreements</p>
                        </div>
                        <button onclick="showTab('new-agreement')" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                            <i class="fas fa-plus mr-2"></i>New Agreement
                        </button>
                    </div>
                </div>
            </header>

            <!-- Navigation Tabs -->
            <div class="bg-white border-b border-gray-200">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav class="flex space-x-4 py-4">
                        <button onclick="showTab('dashboard')" class="nav-tab px-4 py-2 rounded-lg font-medium transition-colors active">
                            <i class="fas fa-home mr-2"></i>Dashboard
                        </button>
                        <button onclick="showTab('agreements')" class="nav-tab px-4 py-2 rounded-lg font-medium transition-colors hover:bg-gray-100">
                            <i class="fas fa-file-contract mr-2"></i>Agreements
                        </button>
                        <button onclick="showTab('customers')" class="nav-tab px-4 py-2 rounded-lg font-medium transition-colors hover:bg-gray-100">
                            <i class="fas fa-users mr-2"></i>Customers
                        </button>
                        <button onclick="showTab('templates')" class="nav-tab px-4 py-2 rounded-lg font-medium transition-colors hover:bg-gray-100">
                            <i class="fas fa-file-alt mr-2"></i>Templates
                        </button>
                        <button onclick="showTab('reminders')" class="nav-tab px-4 py-2 rounded-lg font-medium transition-colors hover:bg-gray-100">
                            <i class="fas fa-bell mr-2"></i>Reminders
                        </button>
                        <button onclick="showTab('settings')" class="nav-tab px-4 py-2 rounded-lg font-medium transition-colors hover:bg-gray-100">
                            <i class="fas fa-cog mr-2"></i>Settings
                        </button>
                    </nav>
                </div>
            </div>

            <!-- Main Content -->
            <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <!-- Dashboard Tab -->
                <div id="dashboard" class="tab-content active">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div class="bg-white rounded-lg shadow p-6">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm text-gray-600">Active Agreements</p>
                                    <p id="stat-active" class="text-3xl font-bold text-gray-900 mt-2">0</p>
                                </div>
                                <div class="bg-blue-100 p-3 rounded-full">
                                    <i class="fas fa-file-contract text-2xl text-blue-600"></i>
                                </div>
                            </div>
                        </div>
                        <div class="bg-white rounded-lg shadow p-6">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm text-gray-600">Total Customers</p>
                                    <p id="stat-customers" class="text-3xl font-bold text-gray-900 mt-2">0</p>
                                </div>
                                <div class="bg-green-100 p-3 rounded-full">
                                    <i class="fas fa-users text-2xl text-green-600"></i>
                                </div>
                            </div>
                        </div>
                        <div class="bg-white rounded-lg shadow p-6">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm text-gray-600">Pending Reminders</p>
                                    <p id="stat-reminders" class="text-3xl font-bold text-gray-900 mt-2">0</p>
                                </div>
                                <div class="bg-yellow-100 p-3 rounded-full">
                                    <i class="fas fa-bell text-2xl text-yellow-600"></i>
                                </div>
                            </div>
                        </div>
                        <div class="bg-white rounded-lg shadow p-6">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm text-gray-600">Monthly Revenue</p>
                                    <p id="stat-revenue" class="text-3xl font-bold text-gray-900 mt-2">$0</p>
                                </div>
                                <div class="bg-purple-100 p-3 rounded-full">
                                    <i class="fas fa-dollar-sign text-2xl text-purple-600"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white rounded-lg shadow p-6">
                        <h2 class="text-xl font-bold text-gray-900 mb-4">Recent Agreements</h2>
                        <div id="recent-agreements" class="space-y-4"></div>
                    </div>
                </div>

                <!-- Agreements Tab -->
                <div id="agreements" class="tab-content">
                    <div class="bg-white rounded-lg shadow p-6">
                        <h2 class="text-xl font-bold text-gray-900 mb-4">All Agreements</h2>
                        <div id="agreements-list" class="space-y-4"></div>
                    </div>
                </div>

                <!-- Customers Tab -->
                <div id="customers" class="tab-content">
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex justify-between items-center mb-4">
                            <h2 class="text-xl font-bold text-gray-900">Customers</h2>
                            <button onclick="showCustomerForm()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                                <i class="fas fa-plus mr-2"></i>Add Customer
                            </button>
                        </div>
                        <div id="customers-list" class="space-y-4"></div>
                    </div>
                    <div id="customer-form-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div class="bg-white rounded-lg p-6 w-full max-w-2xl">
                            <h3 class="text-xl font-bold mb-4">Customer Information</h3>
                            <form id="customer-form" class="space-y-4">
                                <input type="hidden" id="customer-id">
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                        <input type="text" id="customer-name" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                        <input type="email" id="customer-email" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                        <input type="tel" id="customer-phone" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Company</label>
                                        <input type="text" id="customer-company" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Tax ID</label>
                                        <input type="text" id="customer-tax-id" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    </div>
                                    <div class="col-span-2">
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                        <textarea id="customer-address" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-lg"></textarea>
                                    </div>
                                </div>
                                <div class="flex justify-end space-x-3 mt-6">
                                    <button type="button" onclick="closeCustomerForm()" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                                    <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <!-- Templates Tab -->
                <div id="templates" class="tab-content">
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex justify-between items-center mb-4">
                            <h2 class="text-xl font-bold text-gray-900">Agreement Templates</h2>
                            <button onclick="showTemplateForm()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                                <i class="fas fa-plus mr-2"></i>Add Template
                            </button>
                        </div>
                        <div id="templates-list" class="space-y-4"></div>
                    </div>
                    <div id="template-form-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div class="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                            <h3 class="text-xl font-bold mb-4">Template Information</h3>
                            <form id="template-form" class="space-y-4">
                                <input type="hidden" id="template-id">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Template Name *</label>
                                    <input type="text" id="template-name" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <input type="text" id="template-description" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Content *</label>
                                    <textarea id="template-content" rows="15" required class="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"></textarea>
                                    <p class="text-xs text-gray-500 mt-1">Available placeholders: {{AGENCY_NAME}}, {{CUSTOMER_NAME}}, {{SERVICES}}, {{MONTHLY_PAYMENT}}, {{PAYMENT_DAY}}, {{START_DATE}}, {{END_DATE}}</p>
                                </div>
                                <div class="flex justify-end space-x-3">
                                    <button type="button" onclick="closeTemplateForm()" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                                    <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <!-- Reminders Tab -->
                <div id="reminders" class="tab-content">
                    <div class="bg-white rounded-lg shadow p-6">
                        <h2 class="text-xl font-bold text-gray-900 mb-4">Payment Reminders</h2>
                        <div id="reminders-list" class="space-y-4"></div>
                    </div>
                </div>

                <!-- Settings Tab -->
                <div id="settings" class="tab-content">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <!-- Agencies Section -->
                        <div class="bg-white rounded-lg shadow p-6">
                            <div class="flex justify-between items-center mb-4">
                                <h2 class="text-xl font-bold text-gray-900">Agencies</h2>
                                <button onclick="showAgencyForm()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">
                                    <i class="fas fa-plus mr-2"></i>Add Agency
                                </button>
                            </div>
                            <div id="agencies-list" class="space-y-3"></div>
                        </div>

                        <!-- Email Settings Section -->
                        <div class="bg-white rounded-lg shadow p-6">
                            <h2 class="text-xl font-bold text-gray-900 mb-4">Email Settings</h2>
                            <form id="email-settings-form" class="space-y-4">
                                <input type="hidden" id="email-settings-id">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Email Provider</label>
                                    <select id="email-provider" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                        <option value="sendgrid">SendGrid</option>
                                        <option value="mailgun">Mailgun</option>
                                        <option value="ses">Amazon SES</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                                    <input type="password" id="email-api-key" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">From Email</label>
                                    <input type="email" id="email-from" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">From Name</label>
                                    <input type="text" id="email-from-name" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Days Before Due Date</label>
                                    <input type="number" id="email-reminder-days" min="1" max="30" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                </div>
                                <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                                    Save Email Settings
                                </button>
                            </form>
                        </div>
                    </div>

                    <!-- Agency Form Modal -->
                    <div id="agency-form-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div class="bg-white rounded-lg p-6 w-full max-w-2xl">
                            <h3 class="text-xl font-bold mb-4">Agency Information</h3>
                            <form id="agency-form" class="space-y-4">
                                <input type="hidden" id="agency-id">
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                        <input type="text" id="agency-name" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input type="email" id="agency-email" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                        <input type="tel" id="agency-phone" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <select id="agency-active" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                            <option value="1">Active</option>
                                            <option value="0">Inactive</option>
                                        </select>
                                    </div>
                                    <div class="col-span-2">
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                        <textarea id="agency-address" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-lg"></textarea>
                                    </div>
                                </div>
                                <div class="flex justify-end space-x-3 mt-6">
                                    <button type="button" onclick="closeAgencyForm()" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                                    <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <!-- New Agreement Tab -->
                <div id="new-agreement" class="tab-content">
                    <div class="bg-white rounded-lg shadow p-6">
                        <h2 class="text-xl font-bold text-gray-900 mb-6">Create New Agreement</h2>
                        <form id="new-agreement-form" class="space-y-6">
                            <div class="grid grid-cols-2 gap-6">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Agency *</label>
                                    <select id="agreement-agency" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                        <option value="">Select Agency</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
                                    <select id="agreement-customer" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                        <option value="">Select Customer</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Template</label>
                                    <select id="agreement-template" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                        <option value="">No Template</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                                    <input type="text" id="agreement-title" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Monthly Payment</label>
                                    <input type="number" id="agreement-payment" step="0.01" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Payment Day</label>
                                    <input type="number" id="agreement-payment-day" min="1" max="31" value="1" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                                    <input type="date" id="agreement-start-date" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                    <input type="date" id="agreement-end-date" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                </div>
                            </div>

                            <div>
                                <div class="flex justify-between items-center mb-2">
                                    <label class="block text-sm font-medium text-gray-700">Service Sections</label>
                                    <button type="button" onclick="addServiceSection()" class="text-blue-600 hover:text-blue-700 text-sm">
                                        <i class="fas fa-plus mr-1"></i>Add Service
                                    </button>
                                </div>
                                <div id="service-sections" class="space-y-3"></div>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Agreement Content *</label>
                                <textarea id="agreement-content" rows="15" required class="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"></textarea>
                            </div>

                            <div class="flex justify-end space-x-3">
                                <button type="button" onclick="showTab('agreements')" class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                                <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Create Agreement</button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"><\/script>
        <script src="/static/app.js"><\/script>
    </body>
    </html>
  `));const $e=new gt,cs=Object.assign({"/src/index.tsx":b});let vt=!1;for(const[,e]of Object.entries(cs))e&&($e.all("*",t=>{let s;try{s=t.executionCtx}catch{}return e.fetch(t.req.raw,t.env,s)}),$e.notFound(t=>{let s;try{s=t.executionCtx}catch{}return e.fetch(t.req.raw,t.env,s)}),vt=!0);if(!vt)throw new Error("Can't import modules from ['/src/index.ts','/src/index.tsx','/app/server.ts']");export{$e as default};
