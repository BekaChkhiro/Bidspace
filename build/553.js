"use strict";(globalThis.webpackChunkbrads_boilerplate_theme=globalThis.webpackChunkbrads_boilerplate_theme||[]).push([[553],{553:(e,t,a)=>{a.r(t),a.d(t,{default:()=>g});var l=a(609);const r=({title:e,value:t,change:a,icon:r})=>(0,l.createElement)("div",{className:"bg-white p-6 rounded-lg shadow-sm"},(0,l.createElement)("div",{className:"flex justify-between items-start"},(0,l.createElement)("div",null,(0,l.createElement)("p",{className:"text-sm font-medium text-gray-600"},e),(0,l.createElement)("h3",{className:"text-2xl font-bold mt-2"},t),(0,l.createElement)("p",{className:"text-sm text-green-600 mt-1"},a)),(0,l.createElement)("div",{className:"p-2 bg-black bg-opacity-5 rounded-full"},r)));var s=a(951);const n=[{title:"დაგეგმილი აუქციონები",value:"7",change:"+2 წინა თვესთან შედარებით",icon:(0,l.createElement)("svg",{className:"w-6 h-6",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24"},(0,l.createElement)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"}))},{title:"მიმდინარე აუქციონები",value:"3",change:"+1 წინა თვესთან შედარებით",icon:(0,l.createElement)("svg",{className:"w-6 h-6",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24"},(0,l.createElement)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"}))},{title:"დასრულებული აუქციონები",value:"4",change:"+2 ბოლო თვეში",icon:(0,l.createElement)("svg",{className:"w-6 h-6",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24"},(0,l.createElement)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"}))}];var m=a(767),c=a(976);const i=()=>(0,l.createElement)("div",{className:"flex justify-center items-center p-4"},(0,l.createElement)("div",{className:"animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"})),o=({message:e})=>(0,l.createElement)("div",{className:"p-4 text-red-700 bg-red-100 rounded-lg"},(0,l.createElement)("p",null,e)),d=({startTime:e,dueTime:t})=>{const a=(new Date).getTime(),r=new Date(e).getTime(),s=new Date(t).getTime();return a<r?(0,l.createElement)("span",{className:"px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800"},"მოლოდინში"):a>=r&&a<=s?(0,l.createElement)("span",{className:"px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800"},"აქტიური"):(0,l.createElement)("span",{className:"px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800"},"დასრულებული")},u=e=>new Date(e).toLocaleString("ka-GE",{year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit"}),p=()=>{(0,m.Zp)();const[e,t]=(0,l.useState)([]),[a,r]=(0,l.useState)(!0),[s,n]=(0,l.useState)(null);(0,l.useEffect)((()=>{p()}),[]);const p=async()=>{try{r(!0),n(null);const e=await fetch("/wp-json/wp/v2/auction?per_page=5&orderby=date&order=desc&_embed",{headers:{Accept:"application/json","Content-Type":"application/json","X-API-Key":window.wpApiSettings?.apiKey||"","X-WP-Admin":"true"},credentials:"include"});if(!e.ok)throw new Error("ბოლოს დამატებული აუქციონების ჩატვირთვა ვერ მოხერხდა");const a=await e.json();t(a)}catch(e){console.error("Error:",e),n(e.message)}finally{r(!1)}};return a?(0,l.createElement)(i,null):s?(0,l.createElement)(o,{message:s}):(0,l.createElement)("div",{className:"bg-white rounded-xl shadow-sm border border-gray-100"},(0,l.createElement)("div",{className:"border-b border-gray-100 p-4 sm:p-6"},(0,l.createElement)("div",{className:"flex flex-col sm:flex-row gap-4 sm:gap-0 items-start sm:items-center justify-between"},(0,l.createElement)("h2",{className:"text-lg font-semibold text-gray-900"},"ბოლოს დამატებული აუქციონები"),(0,l.createElement)(c.N_,{to:"/admin/auctions",className:"w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"},(0,l.createElement)("span",null,"ყველა აუქციონი"),(0,l.createElement)("svg",{className:"w-5 h-5 ml-2",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24"},(0,l.createElement)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"2",d:"M13 7l5 5m0 0l-5 5m5-5H6"}))))),(0,l.createElement)("div",{className:"overflow-x-auto"},(0,l.createElement)("div",{className:"hidden sm:block"},(0,l.createElement)("table",{className:"min-w-full divide-y divide-gray-200"},(0,l.createElement)("thead",{className:"bg-gray-50"},(0,l.createElement)("tr",null,(0,l.createElement)("th",{className:"px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"},"აუქციონი"),(0,l.createElement)("th",{className:"px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"},"სტატუსი"),(0,l.createElement)("th",{className:"px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"},"ფასი"),(0,l.createElement)("th",{className:"px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"},"თარიღი"),(0,l.createElement)("th",{className:"px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"},"სტატუსი"))),(0,l.createElement)("tbody",{className:"divide-y divide-gray-200"},e.map((e=>(0,l.createElement)("tr",{key:e.id,className:"group hover:bg-gray-50 transition-colors duration-200"},(0,l.createElement)("td",{className:"px-3 sm:px-6 py-3"},(0,l.createElement)("div",{className:"flex items-center space-x-3"},(0,l.createElement)("div",{className:"h-10 w-10 flex-shrink-0"},e._embedded?.["wp:featuredmedia"]?.[0]?.source_url&&(0,l.createElement)("img",{src:e._embedded["wp:featuredmedia"][0].source_url,alt:"",className:"h-full w-full object-cover rounded-md"})),(0,l.createElement)("div",{className:"flex-1 min-w-0"},(0,l.createElement)("p",{className:"text-sm font-medium text-gray-900 truncate"},e.title.rendered)))),(0,l.createElement)("td",{className:"px-3 sm:px-6 py-3"},(0,l.createElement)(d,{startTime:e.meta.start_time,dueTime:e.meta.due_time})),(0,l.createElement)("td",{className:"px-3 sm:px-6 py-3 text-sm text-gray-500"},"₾",e.meta.auction_price),(0,l.createElement)("td",{className:"px-3 sm:px-6 py-3 text-sm text-gray-500"},u(e.meta.start_time)),(0,l.createElement)("td",{className:"px-3 sm:px-6 py-3"},e.meta.visibility?(0,l.createElement)("span",{className:"px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800"},"დადასტურებული"):(0,l.createElement)("span",{className:"px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800"},"დასადასტურებელი")))))))),(0,l.createElement)("div",{className:"sm:hidden"},(0,l.createElement)("div",{className:"space-y-4 p-4"},e.map((e=>(0,l.createElement)("div",{key:e.id,className:"bg-white rounded-lg border border-gray-200 p-4 space-y-3"},(0,l.createElement)("div",{className:"flex items-center space-x-3"},(0,l.createElement)("div",{className:"h-16 w-16 flex-shrink-0"},e._embedded?.["wp:featuredmedia"]?.[0]?.source_url&&(0,l.createElement)("img",{src:e._embedded["wp:featuredmedia"][0].source_url,alt:"",className:"h-full w-full object-cover rounded-md"})),(0,l.createElement)("div",{className:"flex-1 min-w-0"},(0,l.createElement)("p",{className:"text-sm font-medium text-gray-900"},e.title.rendered),(0,l.createElement)("p",{className:"text-sm text-gray-500 mt-1"},"₾",e.meta.auction_price))),(0,l.createElement)("div",{className:"flex items-center justify-between pt-2"},(0,l.createElement)("div",{className:"text-xs text-gray-500"},u(e.meta.start_time)),(0,l.createElement)(d,{startTime:e.meta.start_time,dueTime:e.meta.due_time})),(0,l.createElement)("div",{className:"pt-2 border-t border-gray-100"},e.meta.visibility?(0,l.createElement)("span",{className:"px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800"},"დადასტურებული"):(0,l.createElement)("span",{className:"px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800"},"დასადასტურებელი")))))))))},x=()=>{const[e,t]=(0,l.useState)([]),[a,r]=(0,l.useState)(!0);(0,m.Zp)(),(0,l.useEffect)((()=>{s()}),[]);const s=async()=>{try{const e=await fetch("/wp-json/wp/v2/users?per_page=5");if(!e.ok)throw new Error("Failed to fetch users");const a=await e.json();t(a)}catch(e){console.error("Error:",e)}finally{r(!1)}};return a?(0,l.createElement)("div",{className:"flex items-center justify-center h-48"},(0,l.createElement)("div",{className:"animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"})):(0,l.createElement)("div",{className:"bg-white rounded-lg p-4 sm:p-6"},(0,l.createElement)("div",{className:"flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6"},(0,l.createElement)("h2",{className:"text-lg sm:text-xl font-semibold"},"ბოლოს დარეგისტრირებული მომხმარებლები"),(0,l.createElement)(c.N_,{to:"/admin/users",className:"w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"},(0,l.createElement)("span",null,"ყველას ნახვა"),(0,l.createElement)("svg",{className:"w-5 h-5 ml-2",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24"},(0,l.createElement)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"2",d:"M13 7l5 5m0 0l-5 5m5-5H6"})))),(0,l.createElement)("div",{className:"space-y-4"},e.map((e=>(0,l.createElement)("div",{key:e.id,className:"flex items-center justify-between py-2 px-2 sm:px-0 hover:bg-gray-50 rounded-lg transition-colors"},(0,l.createElement)("div",{className:"flex items-center space-x-2 sm:space-x-4"},(0,l.createElement)("div",{className:"h-8 w-8 sm:h-10 sm:w-10 bg-gray-200 rounded-full overflow-hidden flex-shrink-0"},e.avatar_urls&&(0,l.createElement)("img",{src:e.avatar_urls[96],alt:e.name,className:"h-full w-full object-cover"})),(0,l.createElement)("div",null,(0,l.createElement)("div",{className:"text-sm font-medium text-gray-900"},e.name),(0,l.createElement)("div",{className:"text-xs sm:text-sm text-gray-500"},e.slug))),(0,l.createElement)("span",{className:"px-2 py-1 text-xs leading-4 sm:leading-5 font-semibold rounded-full bg-green-100 text-green-800"},"აქტიური"))))))},g=()=>{const{loading:e,stats:t,recentSales:a}=(()=>{const[e,t]=(0,l.useState)(!0),[a,r]=(0,l.useState)(null),s={recentSales:[{name:"გიორგი მაისურაძე",email:"giorgi@email.com",amount:"+₾1,999.00"},{name:"ნინო კაპანაძე",email:"nino@email.com",amount:"+₾39.00"},{name:"ლევან ბერიძე",email:"levan@email.com",amount:"+₾299.00"},{name:"თამარ დვალი",email:"tamar@email.com",amount:"+₾99.00"},{name:"ანა გიორგაძე",email:"ana@email.com",amount:"+₾39.00"}]};return(0,l.useEffect)((()=>{(async()=>{t(!0);try{await new Promise((e=>setTimeout(e,500))),r(s)}catch(e){console.error("Error loading overview data:",e)}finally{t(!1)}})()}),[]),{loading:e,stats:n,recentSales:a?.recentSales||[]}})();return e?(0,l.createElement)("div",{className:"flex items-center justify-center h-[50vh]"},(0,l.createElement)(s.A,null)):(0,l.createElement)("div",{className:"space-y-8"},(0,l.createElement)("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-6"},t.map(((e,t)=>(0,l.createElement)(r,{key:t,...e})))),(0,l.createElement)(p,null),(0,l.createElement)(x,null))}}}]);