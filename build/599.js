"use strict";(globalThis.webpackChunkbrads_boilerplate_theme=globalThis.webpackChunkbrads_boilerplate_theme||[]).push([[599],{599:(e,t,a)=>{a.r(t),a.d(t,{default:()=>d});var l=a(609),r=a.n(l);const s=({children:e})=>{const[t,a]=r().useState(!1),s=r().useRef(null);return r().useEffect((()=>{const e=e=>{s.current&&!s.current.contains(e.target)&&a(!1)};return document.addEventListener("mousedown",e),()=>document.removeEventListener("mousedown",e)}),[]),(0,l.createElement)("div",{className:"relative",ref:s},r().Children.map(e,(e=>e.type===n?r().cloneElement(e,{onClick:()=>a(!t)}):e.type===m?t?e:null:e)))},n=({children:e,onClick:t})=>r().cloneElement(e,{onClick:t}),m=({children:e,align:t="end"})=>(0,l.createElement)("div",{className:`absolute z-10 mt-1 ${{start:"left-0",end:"right-0"}[t]} min-w-[140px] bg-white shadow-lg rounded-md border border-gray-200`},e),c=({children:e,className:t=""})=>(0,l.createElement)("div",{className:`border-b border-gray-100 ${t}`},e),o=({children:e,onClick:t,className:a=""})=>(0,l.createElement)("button",{className:`block w-full text-left ${a}`,onClick:t},e),i=({user:e,isOpen:t,onClose:a})=>{if(!t)return null;const r=e=>e?new Date(e).toLocaleString("ka-GE"):"N/A";return(0,l.createElement)(l.Fragment,null,(0,l.createElement)("div",{className:"fixed inset-0 bg-black bg-opacity-30 z-40",onClick:a}),(0,l.createElement)("div",{className:"fixed top-0 left-0 w-96 h-full bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out "+(t?"translate-x-0":"-translate-x-full")},(0,l.createElement)("div",{className:"flex flex-col h-full"},(0,l.createElement)("div",{className:"flex items-center justify-between p-4 border-b"},(0,l.createElement)("h2",{className:"text-lg font-medium"},"მომხმარებლის დეტალები"),(0,l.createElement)("button",{onClick:a,className:"p-2 hover:bg-gray-100 rounded-full"},(0,l.createElement)("svg",{className:"w-5 h-5 text-gray-500",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24"},(0,l.createElement)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M6 18L18 6M6 6l12 12"})))),(0,l.createElement)("div",{className:"flex-1 overflow-y-auto p-4"},e&&(0,l.createElement)("div",{className:"space-y-6"},(0,l.createElement)("div",{className:"flex items-center space-x-4 pb-4 border-b"},(0,l.createElement)("div",{className:"h-20 w-20 bg-gray-200 rounded-full overflow-hidden"},e.avatar_urls&&(0,l.createElement)("img",{src:e.avatar_urls[96],alt:e.name||"User avatar",className:"h-full w-full object-cover"})),(0,l.createElement)("div",null,(0,l.createElement)("h3",{className:"text-xl font-medium text-gray-900"},e.name),(0,l.createElement)("p",{className:"text-sm text-gray-500"},"@",e.slug),(0,l.createElement)("span",{className:"mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800"},"აქტიური"))),(0,l.createElement)("div",{className:"space-y-4"},(0,l.createElement)("h4",{className:"text-sm font-medium text-gray-900"},"ძირითადი ინფორმაცია"),(0,l.createElement)("div",{className:"grid grid-cols-2 gap-4"},(0,l.createElement)("div",null,(0,l.createElement)("label",{className:"text-xs font-medium text-gray-500"},"ID"),(0,l.createElement)("p",{className:"mt-1 text-sm text-gray-900"},e.id)),(0,l.createElement)("div",null,(0,l.createElement)("label",{className:"text-xs font-medium text-gray-500"},"როლი"),(0,l.createElement)("p",{className:"mt-1 text-sm text-gray-900"},Array.isArray(e.roles)?e.roles.join(", "):e.roles))),(0,l.createElement)("div",null,(0,l.createElement)("label",{className:"text-xs font-medium text-gray-500"},"ელ-ფოსტა"),(0,l.createElement)("p",{className:"mt-1 text-sm text-gray-900"},e.email||"N/A")),(0,l.createElement)("div",{className:"grid grid-cols-2 gap-4"},(0,l.createElement)("div",null,(0,l.createElement)("label",{className:"text-xs font-medium text-gray-500"},"რეგისტრაციის თარიღი"),(0,l.createElement)("p",{className:"mt-1 text-sm text-gray-900"},r(e.registered_date))),(0,l.createElement)("div",null,(0,l.createElement)("label",{className:"text-xs font-medium text-gray-500"},"ბოლო შესვლა"),(0,l.createElement)("p",{className:"mt-1 text-sm text-gray-900"},e.last_login?r(e.last_login):"N/A")))),e.meta&&Object.keys(e.meta).length>0&&(0,l.createElement)("div",{className:"space-y-4"},(0,l.createElement)("h4",{className:"text-sm font-medium text-gray-900"},"მეტა მონაცემები"),Object.entries(e.meta).map((([e,t])=>(0,l.createElement)("div",{key:e},(0,l.createElement)("label",{className:"text-xs font-medium text-gray-500"},e),(0,l.createElement)("p",{className:"mt-1 text-sm text-gray-900"},"object"==typeof t?JSON.stringify(t):t||"N/A"))))))))))},d=()=>{const[e,t]=(0,l.useState)([]),[a,r]=(0,l.useState)(!0),[d,u]=(0,l.useState)(""),[x,g]=(0,l.useState)(null),[p,E]=(0,l.useState)(!1);(0,l.useEffect)((()=>{f()}),[]);const f=async()=>{try{const e=await fetch("/wp-json/wp/v2/users");if(!e.ok)throw new Error("Failed to fetch users");const a=await e.json();console.log("Users data:",a),t(a)}catch(e){console.error("Error:",e)}finally{r(!1)}},y=e.filter((e=>e?.name?.toLowerCase().includes(d.toLowerCase())||e?.slug?.toLowerCase().includes(d.toLowerCase())));return a?(0,l.createElement)("div",{className:"flex items-center justify-center h-96"},(0,l.createElement)("div",{className:"animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"})):(0,l.createElement)("div",{className:"bg-white p-6 rounded-lg"},(0,l.createElement)("div",{className:"flex justify-between items-center mb-6"},(0,l.createElement)("h2",{className:"text-xl font-semibold"},"მომხმარებლები"),(0,l.createElement)("div",{className:"relative"},(0,l.createElement)("input",{type:"text",placeholder:"ძებნა...",value:d,onChange:e=>u(e.target.value),className:"pl-10 pr-4 py-2 border border-gray-300 rounded-md"}),(0,l.createElement)("svg",{className:"absolute left-3 top-2.5 h-5 w-5 text-gray-400",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24"},(0,l.createElement)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"})))),(0,l.createElement)("div",{className:"overflow-x-auto"},(0,l.createElement)("table",{className:"min-w-full divide-y divide-gray-200"},(0,l.createElement)("thead",null,(0,l.createElement)("tr",null,(0,l.createElement)("th",{className:"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"},"მომხმარებელი"),(0,l.createElement)("th",{className:"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"},"როლი"),(0,l.createElement)("th",{className:"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"},"რეგისტრაციის თარიღი"),(0,l.createElement)("th",{className:"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"},"სტატუსი"),(0,l.createElement)("th",{className:"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"},"მოქმედება"))),(0,l.createElement)("tbody",{className:"bg-white divide-y divide-gray-200"},y.map((e=>(0,l.createElement)("tr",{key:e.id},(0,l.createElement)("td",{className:"px-6 py-4 whitespace-nowrap"},(0,l.createElement)("div",{className:"flex items-center"},(0,l.createElement)("div",{className:"h-10 w-10 bg-gray-200 rounded-full overflow-hidden"},e.avatar_urls&&(0,l.createElement)("img",{src:e.avatar_urls[96]||e.avatar_urls[48]||e.avatar_urls[24],alt:e.name||"User avatar",className:"h-full w-full object-cover"})),(0,l.createElement)("div",{className:"ml-4"},(0,l.createElement)("div",{className:"text-sm font-medium text-gray-900"},e.name||e.slug),(0,l.createElement)("div",{className:"text-sm text-gray-500"},e.slug)))),(0,l.createElement)("td",{className:"px-6 py-4 whitespace-nowrap text-sm"},(0,l.createElement)("div",{className:"font-medium text-gray-900"},(e=>{if(!e||!Array.isArray(e)||0===e.length)return"";const t={administrator:"ადმინისტრატორი",editor:"რედაქტორი",author:"ავტორი",contributor:"კონტრიბუტორი",subscriber:"გამომწერი"};return e.map((e=>t[e]||e)).join(", ")})(e.roles))),(0,l.createElement)("td",{className:"px-6 py-4 whitespace-nowrap text-sm"},(0,l.createElement)("div",{className:"font-medium text-gray-900"},(e=>{if(!e)return"";try{return new Date(e).toLocaleDateString("ka-GE",{year:"numeric",month:"2-digit",day:"2-digit"})}catch(t){return e}})(e.registered_date))),(0,l.createElement)("td",{className:"px-6 py-4 whitespace-nowrap"},(0,l.createElement)("span",{className:"px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800"},"აქტიური")),(0,l.createElement)("td",{className:"px-6 py-4 whitespace-nowrap text-sm font-medium"},(0,l.createElement)(s,null,(0,l.createElement)(n,null,(0,l.createElement)("button",{className:"h-8 w-8 p-0 hover:bg-gray-100 rounded-full flex items-center justify-center"},(0,l.createElement)("svg",{className:"w-5 h-5 text-gray-500 transform rotate-90",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24"},(0,l.createElement)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"})))),(0,l.createElement)(m,null,(0,l.createElement)(c,{className:"px-3 py-2 text-sm font-medium"},"მოქმედებები"),(0,l.createElement)(o,{onClick:()=>{g(e),E(!0)},className:"w-full px-3 py-2 text-sm hover:bg-gray-50"},(0,l.createElement)("div",{className:"flex items-center gap-2 text-gray-700"},(0,l.createElement)("svg",{className:"w-4 h-4",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24"},(0,l.createElement)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"})),"ნახვა")),(0,l.createElement)(o,{onClick:()=>console.log("Delete",e.id),className:"w-full px-3 py-2 text-sm hover:bg-gray-50"},(0,l.createElement)("div",{className:"flex items-center gap-2 text-red-600"},(0,l.createElement)("svg",{className:"w-4 h-4",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24"},(0,l.createElement)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"})),"წაშლა"))))))))))),(0,l.createElement)(i,{user:x,isOpen:p,onClose:()=>{E(!1),g(null)}}))}}}]);