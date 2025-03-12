"use strict";(self.webpackChunkbrads_boilerplate_theme=self.webpackChunkbrads_boilerplate_theme||[]).push([[428],{1428:(e,t,l)=>{l.r(t),l.d(t,{default:()=>s});var a=l(1609);const s=()=>{const[e,t]=(0,a.useState)(0),l=[{id:0,title:"რეგისტრაცია და ვერიფიკაცია",content:{title:"რეგისტრაცია და ვერიფიკაცია",items:["რეგისტრაცია: მომხმარებელი რეგისტრირდება საიტზე, სადაც უნდა მიუთითოს შემდეგი პირადი ინფორმაცია: სახელი, გვარი, პირადი ნომერი, მობილური ტელეფონი და ელფოსტა.","ვერიფიკაცია: თუ მომხმარებელს სურს თავად განათავსოს აუქციონები, საჭიროა დამატებითი ვერიფიკაცია:",{subItems:["ტელეფონის ნომრის დადასტურება: მომხმარებელი მიიღებს SMS კოდს, რომელიც შეჰყავს საიტზე.","პირადობის დოკუმენტის ატვირთვა: მომხმარებელმა უნდა ატვირთოს საკუთარი პირადობის დამადასტურებელი დოკუმენტის ფოტო.","საკუთარი სურათი პირადობით ხელში: მომხმარებელმა უნდა ატვირთოს ფოტო, სადაც პირადობის დამადასტურებელი დოკუმენტი უჭირავს ხელში."]}]}},{id:1,title:"სასურველი აუქციონის ძებნა",content:{title:"სასურველი აუქციონის ძებნა",items:["რეგისტრაციის ან ავტორიზაციის შემდეგ, მომხმარებელი შეძლებს მოძებნოს, დაათვალიეროს და მონაწილეობა მიიღოს სასურველი აუქციონებში, რომლებიც გამოქვეყნებულია გადამოწმებული აუქციონერების მიერ."]}},{id:2,title:"შერჩევა და მონაწილეობის არჩევანი",content:{title:"შერჩევა და მონაწილეობის არჩევანი",items:["მომხმარებელს აქვს ორი არჩევანი:",{subItems:["მომენტალური შეძენა: მომხმარებელი შეძლებს პირდაპირ შეიძინოს ბილეთი მითითებულ ფასად.","აუქციონში მონაწილეობა: მომხმარებელი შეუძლია განათავსოს საკუთარი ბიდი და ჩაერთოს აუქციონში."]}]}},{id:3,title:"აუქციონის გამარჯვებულის განსაზღვრა",content:{title:"აუქციონის გამარჯვებულის განსაზღვრა",items:["აუქციონის დასრულებისას გამარჯვებულად გამოცხადდება ის მომხმარებელი, რომელმაც ბოლო ბიდი განათავსა."]}},{id:4,title:"გადახდა და ბილეთის მიღება",content:{title:"გადახდა და ბილეთის მიღება",items:["გამარჯვებული ვალდებულია გადახდა განახორციელოს აუქციონის დასრულებიდან 3 საათის განმავლობაში საიტზე მითითებული ონლაინ გადახდის მეთოდით.","გადახდის დასრულების შემდეგ, მომხმარებელი მიიღებს ბილეთის შტრიხ კოდს.","ფიზიკური ბილეთის შემთხვევაში, ის გაგზავნილი იქნება მომხმარებლისთვის მოსახერხებელ ადგილას."]}}];(0,a.useEffect)((()=>{document.title="ინსტრუქცია"}),[]);const s=(e,t)=>"string"==typeof e?(0,a.createElement)("li",{key:t,className:"text-gray-700"},e):e.title?(0,a.createElement)("li",{key:t,className:"space-y-2"},(0,a.createElement)("h3",{className:"font-medium text-lg text-gray-900"},e.title),e.items&&(0,a.createElement)("ul",{className:"pl-6 space-y-2"},e.items.map(((e,t)=>s(e,t)))),e.subItems&&(0,a.createElement)("ul",{className:"pl-6 space-y-2"},e.subItems.map(((e,t)=>(0,a.createElement)("li",{key:t,className:"text-gray-600 flex items-center"},(0,a.createElement)("span",{className:"inline-block w-2 h-2 rounded-full border border-gray-400 mr-3 flex-shrink-0"}),(0,a.createElement)("span",null,e)))))):e.subItems?(0,a.createElement)("ul",{className:"pl-6 space-y-2 mt-2"},e.subItems.map(((e,t)=>(0,a.createElement)("li",{key:t,className:"text-gray-600 flex items-center"},(0,a.createElement)("span",{className:"inline-block w-2 h-2 rounded-full border border-gray-400 mr-3 flex-shrink-0"}),(0,a.createElement)("span",null,e))))):null;return(0,a.createElement)("div",{className:"w-full px-4 md:px-8 lg:px-16 py-10"},(0,a.createElement)("div",{className:"w-full bg-white rounded-2xl flex flex-col md:flex-row"},(0,a.createElement)("div",{className:"w-full md:w-1/4 border-r flex flex-col gap-2 p-4"},l.map((l=>(0,a.createElement)("button",{key:l.id,onClick:()=>t(l.id),className:"w-full text-left px-4 py-3 transition-colors rounded-xl "+(e===l.id?"bg-[#00AEEF] text-white":"hover:bg-gray-100")},(0,a.createElement)("span",{className:"text-lg font-medium"},l.title))))),(0,a.createElement)("div",{className:"w-full md:w-3/4 p-6 md:p-4 overflow-y-auto"},(m=l[e].content).title?(0,a.createElement)("div",{className:"space-y-8"},(0,a.createElement)("h2",{className:"text-2xl font-bold text-gray-900"},m.title),(0,a.createElement)("ul",{className:"list-disc pl-6 space-y-4"},m.items.map(((e,t)=>s(e,t))))):(0,a.createElement)("div",{className:"space-y-8"},(0,a.createElement)("ul",{className:"list-disc pl-6 space-y-4"},m.items.map(((e,t)=>s(e,t))))))));var m}}}]);