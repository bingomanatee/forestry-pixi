import{_ as F,o as A,s as u,c as G,d as R,e as f,n as T,T as W,B as N,C as x,f as U,g as $,h as P,i as O,A as b,j as S,k as j,l as X}from"./TickerForest-7hloE1rI.js";import"./preload-helper-PPVm8Dsz.js";const Y=F(["icon","iconVertical","text","inline"]);A({id:u(),sprite:f().optional(),icon:f().optional(),iconUrl:u().optional(),rightSprite:f().optional(),rightIcon:f().optional(),rightIconUrl:u().optional(),label:u().optional(),mode:Y.optional(),isDisabled:R().optional().default(!1),onClick:G().optional(),variant:u().optional(),bitmapFont:u().optional()});A({r:T().min(0).max(1),g:T().min(0).max(1),b:T().min(0).max(1)});function k(e){const t=Math.round(e.r*255),n=Math.round(e.g*255),i=Math.round(e.b*255);return t<<16|n<<8|i}function q(e){return!!e&&typeof e=="object"&&"renderer"in e&&"ticker"in e}function J(e){return q(e)?{app:e}:{ticker:e.ticker}}class l extends W{#g;#n;#t;#p=!1;#i;#r;#o;#a;#h;#l;#c;#s;#u;#b;constructor(t,n,i,o){super({value:{dirty:!0}},J(i)),this.id=t.id,this.#g=n,this.#n=t,this.#t=l.#I(t),this.#i=t.isDisabled??!1,this.#r=new N({id:t.id,area:{x:0,y:0,width:{mode:"px",value:0},height:{mode:"px",value:0},px:"s",py:"s"},align:{x:"s",y:"s",direction:this.#t==="iconVertical"?"column":"row"}}),this.#o=new x({label:`button-${this.id}`,...o}),this.#a=new U,this.#h=new x({label:`button-content-${this.id}`}),this.#o.addChild(this.#a),this.#o.addChild(this.#h),this.#M(),this.#A()}static#I(t){return t.mode?t.mode:!t.sprite&&!t.icon&&t.label?"text":(t.sprite||t.icon)&&t.label?"inline":"icon"}get#B(){return this.#t==="icon"||this.#t==="iconVertical"||this.#t==="inline"&&!!(this.#n.sprite||this.#n.icon)}get#T(){return this.#t==="inline"&&!!(this.#n.rightSprite||this.#n.rightIcon)}get#P(){return!!this.#n.label&&this.#t!=="icon"}get container(){return this.#o}get rect(){return this.#r.rect}get children(){return this.#r.children}get isHovered(){return this.#p}get isDisabled(){return this.#i}get mode(){return this.#t}static#d(t){if(typeof t!="string")return;const n=t.trim();return n.length?n:void 0}#x(t){if(!t)return;const n=t.texture,i=n?.source;return l.#d(i?.resource?.src)??l.#d(i?.src)??l.#d(n?.resource?.src)??l.#d(n?.url)}#V(t){if(!t)return;const n=t.children?.[0];return this.#x(n)}#D(t,n,i){const o=t==="right"?this.#n.rightIconUrl:this.#n.iconUrl;return l.#d(o)??this.#x(n)??this.#V(i)}#k(t,n){return this.#r.addChild(t,{id:`${this.id}-${t}`,order:n,area:{x:0,y:0,width:{mode:"px",value:0},height:{mode:"px",value:0},px:"s",py:"s"},align:{x:"s",y:"s",direction:"column"}})}#w(t,n){const i=t==="left"?"icon-left":"icon-right",o=t==="right"?this.#n.rightSprite:this.#n.sprite,r=t==="right"?this.#n.rightIcon:this.#n.icon,s=this.#k(i,n),c=this.#D(t,o,r);c&&s.setContent({type:"url",value:c});const a=new x({label:`${this.id}-${i}-host`});return o?("anchor"in o&&o.anchor&&o.anchor.set(0),a.addChild(o)):r&&a.addChild(r),this.#h.addChild(a),{tree:s,host:a,sprite:o,container:r,role:t}}#z(t){const n=this.#k("label",t);n.setContent({type:"text",value:this.#n.label??""});const i=new x({label:`${this.id}-label-host`}),o=new $({text:this.#n.label??"",style:new P({fontSize:13,fill:16777215,align:"center",fontFamily:this.#n.bitmapFont??"Arial"})});return i.addChild(o),this.#h.addChild(i),{tree:n,host:i,textDisplay:o}}#M(){let t=0;this.#B&&(this.#l=this.#w("left",t),t+=1),this.#P&&(this.#s=this.#z(t),t+=1),this.#T&&(this.#c=this.#w("right",t))}#A(){this.#o.eventMode=this.#i?"none":"static",this.#o.cursor=this.#i?"default":"pointer",this.#o.on("pointerenter",this.#m),this.#o.on("pointerleave",this.#y),this.#o.on("pointertap",this.#C)}#m=()=>{this.#i||this.setHovered(!0)};#y=()=>{this.#i||this.setHovered(!1)};#C=()=>{!this.#i&&this.#n.onClick&&this.#n.onClick()};#L(){return this.#i?["disabled"]:this.#p?["hover"]:[]}#e(...t){const n=this.#L(),i=this.#n.variant;let o=[];if(this.#t==="text"?o=["text"]:this.#t==="inline"?o=["inline"]:this.#t==="iconVertical"&&(o=["iconVertical"]),i){const r=this.#g.match({nouns:["button",i,...o,...t],states:n});if(r!==void 0)return r}return this.#g.match({nouns:["button",...o,...t],states:n})}#E(){return this.#t==="text"||this.#t==="inline"?12:4}#H(){return this.#t==="text"||this.#t==="inline"?6:4}#F(){return this.#t==="text"||this.#t==="inline"?4:0}#G(){return this.#t==="inline"?{x:16,y:16}:{x:32,y:32}}#R(){return this.#t==="text"||this.#t==="inline"?{r:1,g:1,b:1}:{r:0,g:0,b:0}}#W(){return this.#t==="text"||this.#t==="inline"?1:.5}#N(){return this.#t==="text"||this.#t==="inline"?0:1}#U(){const t=this.#e("borderRadius")??this.#F(),n=this.#e("stroke","color")??{r:.5,g:.5,b:.5},i=this.#e("stroke","alpha")??1,o=this.#e("stroke","width")??this.#N(),r=this.#e("fill","color"),s=this.#e("fill","alpha"),c={borderRadius:t};return r&&(s??1)>0?c.fill={color:r,alpha:this.#i?(s??1)*.5:s??1}:(this.#t==="text"||this.#t==="inline")&&(c.fill={color:{r:.33,g:.67,b:.6},alpha:this.#i?.5:1}),n&&o>0&&(c.stroke={color:n,width:o,alpha:i}),c}#f(t){const n=this.#G(),i=t.role==="right",o=i?this.#e("rightIcon","size","x")??this.#e("icon","size","x")??n.x:this.#e("icon","size","x")??n.x,r=i?this.#e("rightIcon","size","y")??this.#e("icon","size","y")??n.y:this.#e("icon","size","y")??n.y,s=i?this.#e("rightIcon","alpha")??this.#e("icon","alpha")??1:this.#e("icon","alpha")??1,c=i?this.#e("rightIcon","tint")??this.#e("icon","tint"):this.#e("icon","tint");return{width:o,height:r,alpha:s,tint:c}}#v(){const t=this.#e("label","fontSize")??13,n=this.#e("label","color")??this.#R(),i=this.#e("label","alpha")??this.#W();return{textStyle:{fontSize:t,fill:k(n),align:"center",fontFamily:this.#n.bitmapFont??"Arial"},alpha:this.#i?i*.5:i}}#$(t){const n=this.#n.label??"",i=typeof t.fontSize=="number"?t.fontSize:13,o=Math.max(0,n.length*i*.6),r=Math.max(0,i*1.2);let s=o,c=r;if(this.#s)try{this.#s.textDisplay.text=n,this.#s.textDisplay.style=new P(t);const a=this.#s.textDisplay.getLocalBounds();Number.isFinite(a.width)&&a.width>=0&&(s=a.width),Number.isFinite(a.height)&&a.height>=0&&(c=a.height)}catch{}try{const a=O.measureText(n,t);Number.isFinite(a.width)&&a.width>=0&&(s=a.width),Number.isFinite(a.height)&&a.height>=0&&(c=a.height)}catch{}return{width:s,height:c}}#O(){const n=(this.#t==="iconVertical"?"column":"row")==="row",i=this.#t==="iconVertical"?this.#e("iconGap")??4:this.#t==="inline"?this.#e("iconGap")??8:0,o=this.#e("padding","x")??this.#E(),r=this.#e("padding","y")??this.#H();this.#r.setDirection(n?"row":"column");const s=[];if(this.#l){const h=this.#f(this.#l);s.push({tree:this.#l.tree,width:h.width,height:h.height})}if(this.#s){const{textStyle:h}=this.#v(),d=this.#$(h);s.push({tree:this.#s.tree,width:d.width,height:d.height})}if(this.#c){const h=this.#f(this.#c);s.push({tree:this.#c.tree,width:h.width,height:h.height})}const c=n?s.reduce((h,d)=>h+d.width,0)+Math.max(0,s.length-1)*i:s.reduce((h,d)=>Math.max(h,d.width),0),a=n?s.reduce((h,d)=>Math.max(h,d.height),0):s.reduce((h,d)=>h+d.height,0)+Math.max(0,s.length-1)*i;for(const[h,d]of s.entries()){const z=h*i,H=n?z:0;let M=n?0:z;n&&this.#t==="inline"&&(M=Math.max(0,(a-d.height)/2)),d.tree.setPosition(H,M),d.tree.setWidthPx(d.width),d.tree.setHeightPx(d.height)}const I=c+o*2,B=a+r*2,V=this.#u===void 0?I:Math.max(this.#u,I),D=this.#b===void 0?B:Math.max(this.#b,B);this.#r.setWidthPx(V),this.#r.setHeightPx(D);const L=o+Math.max(0,(V-I)/2),E=r+Math.max(0,(D-B)/2);this.#h.position.set(L,E)}#j(){const t=this.#U(),{width:n,height:i}=this.#r.rect;this.#a.clear();const o=t.borderRadius??0;t.fill?.color&&(this.#a.roundRect(0,0,n,i,o),this.#a.fill({color:k(t.fill.color),alpha:t.fill.alpha??1})),t.stroke?.color&&t.stroke.width&&t.stroke.width>0&&(this.#a.roundRect(0,0,n,i,o),this.#a.stroke({color:k(t.stroke.color),alpha:t.stroke.alpha??1,width:t.stroke.width}))}#S(t){const n=this.#f(t);if(t.host.position.set(t.tree.x,t.tree.y),t.sprite){t.sprite.width=n.width,t.sprite.height=n.height,t.sprite.alpha=this.#i?n.alpha*.5:n.alpha,t.sprite.tint=n.tint?k(n.tint):16777215;return}if(t.container){const i=t.container.getLocalBounds();i.width>0&&i.height>0&&t.container.scale.set(n.width/i.width,n.height/i.height),t.container.alpha=this.#i?n.alpha*.5:n.alpha}}#X(){if(!this.#s)return;const{textStyle:t,alpha:n}=this.#v();this.#s.host.position.set(this.#s.tree.x,this.#s.tree.y),this.#s.textDisplay.text=this.#n.label??"",this.#s.tree.setContent({type:"text",value:this.#n.label??""}),this.#s.textDisplay.style=new P(t),this.#s.textDisplay.alpha=n}isDirty(){return this.value.dirty}clearDirty(){this.set("dirty",!1)}markDirty(){this.value.dirty||this.set("dirty",!0),this.queueResolve()}resolve(){this.#O(),this.#o.position.set(this.#r.x,this.#r.y),this.#j(),this.#l&&this.#S(this.#l),this.#c&&this.#S(this.#c),this.#X()}setHovered(t){this.#p!==t&&(this.#p=t,this.markDirty())}setDisabled(t){this.#i!==t&&(this.#i=t,this.#o.eventMode=t?"none":"static",this.#o.cursor=t?"default":"pointer",this.markDirty())}setPosition(t,n){this.#r.value.area.x===t&&this.#r.value.area.y===n||(this.#r.setPosition(t,n),this.markDirty())}setForcedSize(t,n){const i=s=>{if(s!==void 0){if(!Number.isFinite(s)||s<0)throw new Error(`${this.id}: forced size must be finite and >= 0`);return s}},o=i(t),r=i(n);return this.#u===o&&this.#b===r?!1:(this.#u=o,this.#b=r,this.markDirty(),!0)}getConfig(){return this.#n}getPreferredSize(){const{width:t,height:n}=this.#r.rect;return{width:t,height:n}}cleanup(){this.#o.off("pointerenter",this.#m),this.#o.off("pointerleave",this.#y),this.#o.off("pointertap",this.#C),super.cleanup()}}function g(){const e=new j;return e.set("button.padding.x",[],8),e.set("button.padding.y",[],8),e.set("button.borderRadius",[],4),e.set("button.icon.size.x",[],32),e.set("button.icon.size.y",[],32),e.set("button.icon.alpha",[],1),e.set("button.stroke.color",[],{r:.6,g:.6,b:.6}),e.set("button.stroke.width",[],1),e.set("button.stroke.alpha",[],1),e.set("button.label.fontSize",[],11),e.set("button.label.color",[],{r:.2,g:.2,b:.2}),e.set("button.label.alpha",[],.8),e.set("button.label.padding",[],8),e.set("button.fill.color",["hover"],{r:.9,g:.95,b:1}),e.set("button.fill.alpha",["hover"],1),e.set("button.stroke.color",["hover"],{r:.4,g:.6,b:.9}),e.set("button.icon.alpha",["disabled"],.4),e.set("button.stroke.alpha",["disabled"],.4),e.set("button.iconVertical.padding.x",[],8),e.set("button.iconVertical.padding.y",[],8),e.set("button.iconVertical.borderRadius",[],4),e.set("button.iconVertical.icon.size.x",[],32),e.set("button.iconVertical.icon.size.y",[],32),e.set("button.iconVertical.icon.alpha",[],1),e.set("button.iconVertical.iconGap",[],6),e.set("button.iconVertical.stroke.color",[],{r:.6,g:.6,b:.6}),e.set("button.iconVertical.stroke.width",[],1),e.set("button.iconVertical.stroke.alpha",[],1),e.set("button.iconVertical.label.fontSize",[],11),e.set("button.iconVertical.label.color",[],{r:.2,g:.2,b:.2}),e.set("button.iconVertical.label.alpha",[],.8),e.set("button.iconVertical.fill.color",["hover"],{r:.9,g:.95,b:1}),e.set("button.iconVertical.fill.alpha",["hover"],1),e.set("button.iconVertical.stroke.color",["hover"],{r:.4,g:.6,b:.9}),e.set("button.iconVertical.icon.alpha",["disabled"],.4),e.set("button.iconVertical.stroke.alpha",["disabled"],.4),e.set("button.iconVertical.label.alpha",["disabled"],.4),e.set("button.text.padding.x",[],16),e.set("button.text.padding.y",[],8),e.set("button.text.borderRadius",[],6),e.set("button.text.fill.color",[],{r:.2,g:.5,b:.8}),e.set("button.text.fill.alpha",[],1),e.set("button.text.label.fontSize",[],14),e.set("button.text.label.color",[],{r:1,g:1,b:1}),e.set("button.text.label.alpha",[],1),e.set("button.text.fill.color",["hover"],{r:.3,g:.6,b:.9}),e.set("button.text.fill.alpha",["disabled"],.5),e.set("button.text.label.alpha",["disabled"],.5),e.set("button.inline.padding.x",[],12),e.set("button.inline.padding.y",[],8),e.set("button.inline.borderRadius",[],6),e.set("button.inline.iconGap",[],8),e.set("button.inline.icon.size.x",[],20),e.set("button.inline.icon.size.y",[],20),e.set("button.inline.icon.alpha",[],1),e.set("button.inline.fill.color",[],{r:.15,g:.65,b:.45}),e.set("button.inline.fill.alpha",[],1),e.set("button.inline.label.fontSize",[],14),e.set("button.inline.label.color",[],{r:1,g:1,b:1}),e.set("button.inline.label.alpha",[],1),e.set("button.inline.fill.color",["hover"],{r:.1,g:.8,b:.6}),e.set("button.inline.stroke.color",["hover"],{r:.2,g:.4,b:.9}),e.set("button.inline.stroke.width",["hover"],1),e.set("button.inline.stroke.alpha",["hover"],1),e.set("button.inline.fill.alpha",["disabled"],.5),e.set("button.inline.icon.alpha",["disabled"],.5),e.set("button.inline.label.alpha",["disabled"],.5),e.set("button.primary.text.fill.color",[],{r:.8,g:.2,b:.2}),e.set("button.primary.text.fill.color",["hover"],{r:.9,g:.3,b:.3}),e}function p(e,t){const n=new X(e);return t!==void 0&&(n.tint=t),n}const Z={title:"Button",args:{mode:"icon"},argTypes:{mode:{control:"select",options:["icon","iconVertical","text","inline"]}}},w={render:()=>{const e=document.createElement("div");e.style.width="100%",e.style.height="400px",e.style.position="relative";const t=new b;return t.init({width:800,height:400,backgroundColor:16119285,antialias:!0}).then(async()=>{e.appendChild(t.canvas);const n=await S.load("/placeholder-art.png"),i=g(),o=new l({id:"btn-1",mode:"icon",sprite:p(n,4491468),onClick:()=>console.log("Blue clicked")},i,t);o.setPosition(50,50);const r=new l({id:"btn-2",mode:"icon",sprite:p(n,4508808),onClick:()=>console.log("Green clicked")},i,t);r.setPosition(110,50);const s=new l({id:"btn-3",mode:"icon",sprite:p(n,13404228),isDisabled:!0},i,t);s.setPosition(170,50),t.stage.addChild(o.container),t.stage.addChild(r.container),t.stage.addChild(s.container),o.kickoff(),r.kickoff(),s.kickoff()}),e}},m={render:()=>{const e=document.createElement("div");e.style.width="100%",e.style.height="400px",e.style.position="relative";const t=new b;return t.init({width:800,height:400,backgroundColor:16119285,antialias:!0}).then(async()=>{e.appendChild(t.canvas);const n=await S.load("/placeholder-art.png"),i=g(),o=new l({id:"btn-1",mode:"iconVertical",sprite:p(n,4491468),label:"Blue",onClick:()=>console.log("Blue clicked")},i,t);o.setPosition(50,50);const r=new l({id:"btn-2",mode:"iconVertical",sprite:p(n,4508808),label:"Green",onClick:()=>console.log("Green clicked")},i,t);r.setPosition(130,50);const s=new l({id:"btn-3",mode:"iconVertical",sprite:p(n,13404228),label:"Orange",isDisabled:!0},i,t);s.setPosition(210,50),t.stage.addChild(o.container),t.stage.addChild(r.container),t.stage.addChild(s.container),o.kickoff(),r.kickoff(),s.kickoff()}),e}},y={render:()=>{const e=document.createElement("div");e.style.width="100%",e.style.height="400px",e.style.position="relative";const t=new b;return t.init({width:800,height:400,backgroundColor:16119285,antialias:!0}).then(()=>{e.appendChild(t.canvas);const n=g(),i=new l({id:"text-btn-1",label:"Submit",mode:"text",onClick:()=>console.log("Submit clicked")},n,t);i.setPosition(50,50);const o=new l({id:"text-btn-2",label:"Cancel",mode:"text",onClick:()=>console.log("Cancel clicked")},n,t);o.setPosition(180,50);const r=new l({id:"text-btn-3",label:"Disabled",mode:"text",isDisabled:!0},n,t);r.setPosition(310,50),t.stage.addChild(i.container),t.stage.addChild(o.container),t.stage.addChild(r.container),i.kickoff(),o.kickoff(),r.kickoff()}),e}},C={render:()=>{const e=document.createElement("div");e.style.width="100%",e.style.height="400px",e.style.position="relative";const t=new b;return t.init({width:800,height:400,backgroundColor:16119285,antialias:!0}).then(async()=>{e.appendChild(t.canvas);const n=await S.load("/placeholder-art.png"),i=g(),o=new l({id:"inline-btn-1",sprite:p(n,4491468),label:"Add Item",mode:"inline",onClick:()=>console.log("Add Item clicked")},i,t);o.setPosition(50,50);const r=new l({id:"inline-btn-2",sprite:p(n,13386820),label:"Delete",mode:"inline",onClick:()=>console.log("Delete clicked")},i,t);r.setPosition(200,50);const s=new l({id:"inline-btn-3",sprite:p(n,8947848),label:"Disabled",mode:"inline",isDisabled:!0},i,t);s.setPosition(330,50);const c=new l({id:"inline-btn-4",label:"Dropdown",rightSprite:p(n,16777215),mode:"inline",onClick:()=>console.log("Dropdown clicked")},i,t);c.setPosition(50,120);const a=new l({id:"inline-btn-5",sprite:p(n,4491468),label:"Both Icons",rightSprite:p(n,16777215),mode:"inline",onClick:()=>console.log("Both Icons clicked")},i,t);a.setPosition(200,120),t.stage.addChild(o.container),t.stage.addChild(r.container),t.stage.addChild(s.container),t.stage.addChild(c.container),t.stage.addChild(a.container),o.kickoff(),r.kickoff(),s.kickoff(),c.kickoff(),a.kickoff()}),e}},v={render:()=>{const e=document.createElement("div");e.style.width="100%",e.style.height="400px",e.style.position="relative";const t=new b;return t.init({width:800,height:400,backgroundColor:16119285,antialias:!0}).then(async()=>{e.appendChild(t.canvas);const n=await S.load("/placeholder-art.png"),i=g(),o=new l({id:"icon-demo",mode:"icon",sprite:p(n,4491468),onClick:()=>console.log("Icon clicked")},i,t);o.setPosition(50,30);const r=new l({id:"icon-vertical-demo",mode:"iconVertical",sprite:p(n,8930508),label:"Vertical",onClick:()=>console.log("IconVertical clicked")},i,t);r.setPosition(50,100);const s=new l({id:"text-demo",mode:"text",label:"Text Mode",onClick:()=>console.log("Text clicked")},i,t);s.setPosition(50,190);const c=new l({id:"inline-demo",mode:"inline",sprite:p(n,4508808),label:"Inline Mode",onClick:()=>console.log("Inline clicked")},i,t);c.setPosition(50,250),t.stage.addChild(o.container),t.stage.addChild(r.container),t.stage.addChild(s.container),t.stage.addChild(c.container),o.kickoff(),r.kickoff(),s.kickoff(),c.kickoff()}),e}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: () => {
    const wrapper = document.createElement('div');
    wrapper.style.width = '100%';
    wrapper.style.height = '400px';
    wrapper.style.position = 'relative';
    const app = new Application();
    app.init({
      width: 800,
      height: 400,
      backgroundColor: 0xf5f5f5,
      antialias: true
    }).then(async () => {
      wrapper.appendChild(app.canvas);

      // Load placeholder texture
      const texture = await Assets.load('/placeholder-art.png');
      const styleTree = createDefaultStyleTree();

      // Icon-only buttons (no labels) using sprites
      const button1 = new ButtonStore({
        id: 'btn-1',
        mode: 'icon',
        sprite: createIconSprite(texture, 0x4488cc),
        onClick: () => console.log('Blue clicked')
      }, styleTree, app);
      button1.setPosition(50, 50);
      const button2 = new ButtonStore({
        id: 'btn-2',
        mode: 'icon',
        sprite: createIconSprite(texture, 0x44cc88),
        onClick: () => console.log('Green clicked')
      }, styleTree, app);
      button2.setPosition(110, 50);
      const button3 = new ButtonStore({
        id: 'btn-3',
        mode: 'icon',
        sprite: createIconSprite(texture, 0xcc8844),
        isDisabled: true
      }, styleTree, app);
      button3.setPosition(170, 50);
      app.stage.addChild(button1.container);
      app.stage.addChild(button2.container);
      app.stage.addChild(button3.container);
      button1.kickoff();
      button2.kickoff();
      button3.kickoff();
    });
    return wrapper;
  }
}`,...w.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => {
    const wrapper = document.createElement('div');
    wrapper.style.width = '100%';
    wrapper.style.height = '400px';
    wrapper.style.position = 'relative';
    const app = new Application();
    app.init({
      width: 800,
      height: 400,
      backgroundColor: 0xf5f5f5,
      antialias: true
    }).then(async () => {
      wrapper.appendChild(app.canvas);

      // Load placeholder texture
      const texture = await Assets.load('/placeholder-art.png');
      const styleTree = createDefaultStyleTree();

      // IconVertical buttons (icon with label below) using sprites
      const button1 = new ButtonStore({
        id: 'btn-1',
        mode: 'iconVertical',
        sprite: createIconSprite(texture, 0x4488cc),
        label: 'Blue',
        onClick: () => console.log('Blue clicked')
      }, styleTree, app);
      button1.setPosition(50, 50);
      const button2 = new ButtonStore({
        id: 'btn-2',
        mode: 'iconVertical',
        sprite: createIconSprite(texture, 0x44cc88),
        label: 'Green',
        onClick: () => console.log('Green clicked')
      }, styleTree, app);
      button2.setPosition(130, 50);
      const button3 = new ButtonStore({
        id: 'btn-3',
        mode: 'iconVertical',
        sprite: createIconSprite(texture, 0xcc8844),
        label: 'Orange',
        isDisabled: true
      }, styleTree, app);
      button3.setPosition(210, 50);
      app.stage.addChild(button1.container);
      app.stage.addChild(button2.container);
      app.stage.addChild(button3.container);
      button1.kickoff();
      button2.kickoff();
      button3.kickoff();
    });
    return wrapper;
  }
}`,...m.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => {
    const wrapper = document.createElement('div');
    wrapper.style.width = '100%';
    wrapper.style.height = '400px';
    wrapper.style.position = 'relative';
    const app = new Application();
    app.init({
      width: 800,
      height: 400,
      backgroundColor: 0xf5f5f5,
      antialias: true
    }).then(() => {
      wrapper.appendChild(app.canvas);
      const styleTree = createDefaultStyleTree();

      // Create text buttons
      const button1 = new ButtonStore({
        id: 'text-btn-1',
        label: 'Submit',
        mode: 'text',
        onClick: () => console.log('Submit clicked')
      }, styleTree, app);
      button1.setPosition(50, 50);
      const button2 = new ButtonStore({
        id: 'text-btn-2',
        label: 'Cancel',
        mode: 'text',
        onClick: () => console.log('Cancel clicked')
      }, styleTree, app);
      button2.setPosition(180, 50);
      const button3 = new ButtonStore({
        id: 'text-btn-3',
        label: 'Disabled',
        mode: 'text',
        isDisabled: true
      }, styleTree, app);
      button3.setPosition(310, 50);
      app.stage.addChild(button1.container);
      app.stage.addChild(button2.container);
      app.stage.addChild(button3.container);
      button1.kickoff();
      button2.kickoff();
      button3.kickoff();
    });
    return wrapper;
  }
}`,...y.parameters?.docs?.source}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => {
    const wrapper = document.createElement('div');
    wrapper.style.width = '100%';
    wrapper.style.height = '400px';
    wrapper.style.position = 'relative';
    const app = new Application();
    app.init({
      width: 800,
      height: 400,
      backgroundColor: 0xf5f5f5,
      antialias: true
    }).then(async () => {
      wrapper.appendChild(app.canvas);

      // Load placeholder texture
      const texture = await Assets.load('/placeholder-art.png');
      const styleTree = createDefaultStyleTree();

      // Row 1: Inline buttons with left icon
      const button1 = new ButtonStore({
        id: 'inline-btn-1',
        sprite: createIconSprite(texture, 0x4488cc),
        label: 'Add Item',
        mode: 'inline',
        onClick: () => console.log('Add Item clicked')
      }, styleTree, app);
      button1.setPosition(50, 50);
      const button2 = new ButtonStore({
        id: 'inline-btn-2',
        sprite: createIconSprite(texture, 0xcc4444),
        label: 'Delete',
        mode: 'inline',
        onClick: () => console.log('Delete clicked')
      }, styleTree, app);
      button2.setPosition(200, 50);
      const button3 = new ButtonStore({
        id: 'inline-btn-3',
        sprite: createIconSprite(texture, 0x888888),
        label: 'Disabled',
        mode: 'inline',
        isDisabled: true
      }, styleTree, app);
      button3.setPosition(330, 50);

      // Row 2: Inline buttons with right icon
      const button4 = new ButtonStore({
        id: 'inline-btn-4',
        label: 'Dropdown',
        rightSprite: createIconSprite(texture, 0xffffff),
        mode: 'inline',
        onClick: () => console.log('Dropdown clicked')
      }, styleTree, app);
      button4.setPosition(50, 120);
      const button5 = new ButtonStore({
        id: 'inline-btn-5',
        sprite: createIconSprite(texture, 0x4488cc),
        label: 'Both Icons',
        rightSprite: createIconSprite(texture, 0xffffff),
        mode: 'inline',
        onClick: () => console.log('Both Icons clicked')
      }, styleTree, app);
      button5.setPosition(200, 120);
      app.stage.addChild(button1.container);
      app.stage.addChild(button2.container);
      app.stage.addChild(button3.container);
      app.stage.addChild(button4.container);
      app.stage.addChild(button5.container);
      button1.kickoff();
      button2.kickoff();
      button3.kickoff();
      button4.kickoff();
      button5.kickoff();
    });
    return wrapper;
  }
}`,...C.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => {
    const wrapper = document.createElement('div');
    wrapper.style.width = '100%';
    wrapper.style.height = '400px';
    wrapper.style.position = 'relative';
    const app = new Application();
    app.init({
      width: 800,
      height: 400,
      backgroundColor: 0xf5f5f5,
      antialias: true
    }).then(async () => {
      wrapper.appendChild(app.canvas);

      // Load placeholder texture
      const texture = await Assets.load('/placeholder-art.png');
      const styleTree = createDefaultStyleTree();

      // Row 1: Icon button (icon only, no label)
      const iconBtn = new ButtonStore({
        id: 'icon-demo',
        mode: 'icon',
        sprite: createIconSprite(texture, 0x4488cc),
        onClick: () => console.log('Icon clicked')
      }, styleTree, app);
      iconBtn.setPosition(50, 30);

      // Row 2: IconVertical button (icon with label below)
      const iconVerticalBtn = new ButtonStore({
        id: 'icon-vertical-demo',
        mode: 'iconVertical',
        sprite: createIconSprite(texture, 0x8844cc),
        label: 'Vertical',
        onClick: () => console.log('IconVertical clicked')
      }, styleTree, app);
      iconVerticalBtn.setPosition(50, 100);

      // Row 3: Text button
      const textBtn = new ButtonStore({
        id: 'text-demo',
        mode: 'text',
        label: 'Text Mode',
        onClick: () => console.log('Text clicked')
      }, styleTree, app);
      textBtn.setPosition(50, 190);

      // Row 4: Inline button (icon + text side-by-side)
      const inlineBtn = new ButtonStore({
        id: 'inline-demo',
        mode: 'inline',
        sprite: createIconSprite(texture, 0x44cc88),
        label: 'Inline Mode',
        onClick: () => console.log('Inline clicked')
      }, styleTree, app);
      inlineBtn.setPosition(50, 250);
      app.stage.addChild(iconBtn.container);
      app.stage.addChild(iconVerticalBtn.container);
      app.stage.addChild(textBtn.container);
      app.stage.addChild(inlineBtn.container);
      iconBtn.kickoff();
      iconVerticalBtn.kickoff();
      textBtn.kickoff();
      inlineBtn.kickoff();
    });
    return wrapper;
  }
}`,...v.parameters?.docs?.source}}};const _=["IconButtons","IconVerticalButtons","TextButtons","InlineButtons","AllModes"];export{v as AllModes,w as IconButtons,m as IconVerticalButtons,C as InlineButtons,y as TextButtons,_ as __namedExportsOrder,Z as default};
