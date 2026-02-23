import{A as r,B as p,G as d}from"./BoxLeafStore-BrDG2RJT.js";import"./preload-helper-PPVm8Dsz.js";const s={title:"Box/BoxLeafStore",argTypes:{padding:{control:{type:"range",min:0,max:50,step:5},description:"Uniform padding around content"},alignX:{control:{type:"select"},options:["start","center","end"],description:"Horizontal alignment of content"},alignY:{control:{type:"select"},options:["start","center","end"],description:"Vertical alignment of content"},boxWidth:{control:{type:"range",min:100,max:500,step:10},description:"Box width"},boxHeight:{control:{type:"range",min:100,max:400,step:10},description:"Box height"},contentWidth:{control:{type:"range",min:20,max:200,step:10},description:"Content box width"},contentHeight:{control:{type:"range",min:20,max:200,step:10},description:"Content box height"}},args:{padding:20,alignX:"center",alignY:"center",boxWidth:300,boxHeight:200,contentWidth:80,contentHeight:60}},a={render:n=>{const t=document.createElement("div");t.style.width="100%",t.style.height="600px",t.style.position="relative";let e;const o=new r;return o.init({width:800,height:600,backgroundColor:1710638,antialias:!0}).then(()=>{t.appendChild(o.canvas),e=new p({id:"demo-box",x:250,y:200,xDef:{size:n.boxWidth,align:n.alignX,sizeMode:"px"},yDef:{size:n.boxHeight,align:n.alignY,sizeMode:"px"},padding:{top:n.padding,right:n.padding,bottom:n.padding,left:n.padding},style:{fill:{color:{r:.2,g:.3,b:.5},alpha:1},stroke:{color:{r:.4,g:.5,b:.8},alpha:1,width:2},borderRadius:8}},o);const i=new d({label:"content-box"});i.roundRect(0,0,n.contentWidth,n.contentHeight,4),i.fill({color:16739179,alpha:.9}),i.stroke({color:16777215,alpha:.5,width:1}),e.setContent(i),o.stage.addChild(e.container),e.markDirty()}),t}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: args => {
    const wrapper = document.createElement('div');
    wrapper.style.width = '100%';
    wrapper.style.height = '600px';
    wrapper.style.position = 'relative';
    let boxStore: BoxLeafStore | undefined;
    const app = new Application();
    app.init({
      width: 800,
      height: 600,
      backgroundColor: 0x1a1a2e,
      antialias: true
    }).then(() => {
      wrapper.appendChild(app.canvas);

      // Create the box store with new config format
      boxStore = new BoxLeafStore({
        id: 'demo-box',
        x: 250,
        y: 200,
        xDef: {
          size: args.boxWidth,
          align: args.alignX,
          sizeMode: 'px'
        },
        yDef: {
          size: args.boxHeight,
          align: args.alignY,
          sizeMode: 'px'
        },
        padding: {
          top: args.padding,
          right: args.padding,
          bottom: args.padding,
          left: args.padding
        },
        style: {
          fill: {
            color: {
              r: 0.2,
              g: 0.3,
              b: 0.5
            },
            alpha: 1
          },
          stroke: {
            color: {
              r: 0.4,
              g: 0.5,
              b: 0.8
            },
            alpha: 1,
            width: 2
          },
          borderRadius: 8
        }
      }, app);

      // Create content graphics
      const contentBox = new Graphics({
        label: 'content-box'
      });
      contentBox.roundRect(0, 0, args.contentWidth, args.contentHeight, 4);
      contentBox.fill({
        color: 0xff6b6b,
        alpha: 0.9
      });
      contentBox.stroke({
        color: 0xffffff,
        alpha: 0.5,
        width: 1
      });

      // Set content on the leaf store
      boxStore.setContent(contentBox);

      // Add box to stage
      app.stage.addChild(boxStore.container);

      // Trigger initial render
      boxStore.markDirty();
    });
    return wrapper;
  }
}`,...a.parameters?.docs?.source}}};const g=["AlignmentDemo"];export{a as AlignmentDemo,g as __namedExportsOrder,s as default};
