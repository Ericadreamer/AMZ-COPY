//针对localstorage的封装
/*class LS{
  constructor(){}
  //获取
  getItem(type){
    return localStorage.getItem(type)?JSON.parse(localStorage.getItem(type)):null
  }
  //设置
  setItem(type,data){
    localStorage.setItem(type,JSON.stringify(data));
  }
  //新增
  addItem(type,data,filed){
    let temp = this.getItem(type);
    if(temp){
      temp[data[filed]]=data;
    }else{
      temp={
        [data[filed]]:data
      }
    }
    this.setItem(type,temp)
  }
  removeItem(type){
    localStorage.removeItem(type)
  }
  del(type,curr){
    let temp = this.getItem(type);
    if(temp&&temp[curr]){
      delete temp[curr];
      this.setItem(type,temp)
    }
  }
}
let ls = new LS();
//页面切换
chrome.tabs.onSelectionChanged.addListener(function(tabId, selectInfo) {
  let data={
    asin:ls.getItem('amazon_asin'),
    supplier:ls.getItem('supplier'),
    showFlag:ls.getItem('showFlag')||'0',
  }
  chrome.tabs.sendMessage(tabId, data)
});
//监听脚本发送过来的消息
// 监听来自content-script的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
  if(request.type){
    switch(request.type){
      case 'init':
        let data={
          type:'init',
          asin:ls.getItem('amazon_asin'),
          supplier:ls.getItem('supplier'),
          showFlag:ls.getItem('showFlag')||'0',
        }
        sendResponse(data)
        break;
      case 'showFlag':
        ls.setItem('showFlag',request.result)
        break;
      case 'del_asin':
        ls.del('amazon_asin',request.result)
        break;
      case 'del_supplier':
        ls.del('supplier',request.result)
        break;
      case 'del_asin_all':
        ls.removeItem('amazon_asin')
        sendResponse({type:'del_asin_all'})
        break;
      case 'del_supplier_all':
        ls.removeItem('supplier')
        sendResponse({type:'del_supplier_all'})
        break;
      case 'save_asin':
        ls.addItem('amazon_asin',request.result,'asin')
        console.log(ls.getItem('amazon_asin'))
        sendResponse({
          type:'save_asin',
          asin:ls.getItem('amazon_asin')
        })
        break;
      case 'save_supplier':
        ls.addItem('supplier',request.result,'supplier')
        sendResponse({
          type:'save_supplier',
          supplier:ls.getItem('supplier')
        })
        break;
      case 'get_asin_to_page':
        //获取单个asin数据
        let tempAsin=ls.getItem('amazon_asin');
        sendResponse({
          type:'get_asin_to_page',
          asin:tempAsin[request.asin]
        })
        break;
      case 'asin_copy':
        //获取单个asin数据
        let tempAsinOne=ls.getItem('amazon_asin');
        sendResponse({
          type:'asin_copy',
          asin:tempAsinOne[request.asin]
        })
        break;
      case 'copy_asin_all':
        //获取单个asin数据
        let tempAsinCopy=ls.getItem('amazon_asin');
        sendResponse({
          type:'copy_asin_all',
          data:tempAsinCopy
        })
        break;
      case 'get_supplier_to_page':
        //获取单个供应商数据
        let tempSupplier=ls.getItem('supplier');
        sendResponse({
          type:'get_supplier_to_page',
          supplier:tempSupplier[request.supplier]
        })
        break;
    }
  }
});*/