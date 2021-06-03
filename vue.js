class Vue extends EventTarget{
  constructor(option){
    super();
    this.option = option;
    this._data = this.option.data;
    this.el = document.querySelector(this.option.el);
    this.observe(this._data)
    this.compileNode(this.el);
  }
  observe(data){
    let _this = this
    this._data = new Proxy(data,{
      set(target,prop,newValue){
        let event = new CustomEvent(prop,{
          detail: newValue
        })
        _this.dispatchEvent(event)
        return Reflect.set(...arguments)
      }
    })
  }
  compileNode(el){
    let child = el.childNodes;
    [...child].forEach(node => {
      if(node.nodeType === 3){
        let text = node.textContent;
        let reg = /\{\{\s*([^\s\{\}]+)\s*\}\}/
        if(reg.test(text)){
          console.log(this._data[RegExp.$1])
          let $1 = RegExp.$1
          this._data[$1] && (node.textContent = text.replace(reg, this._data[$1]))
          this.addEventListener($1, e=>{
            node.textContent = text.replace(reg, e.detail)
          })
        }
      }else if(node.nodeType === 1){
        let attr = node.attributes;
        if(attr.hasOwnProperty('v-model')){
          let keyName = attr['v-model'].nodeValue;
          node.value = this._data[keyName]
          node.addEventListener('input',e=>{
            this._data[keyName] = node.value
          })
        }
        this.compileNode(node)
      }
    })
  }
}