async function initPage() {
  // 获取产品标题元素
  var productTitleElem = document.querySelector('#title_feature_div');
  // 创建按钮元素
  const copyButton = document.createElement('a');
  copyButton.innerHTML = '<img id="copy-button" src="' + chrome.extension.getURL("images/copy_button.png") + '">';
  
  // 找到产品标题元素的父级元素，将按钮元素插入到适当位置
  var titleWrapper = productTitleElem.parentNode;
  titleWrapper.insertBefore(copyButton, productTitleElem.nextSibling);
  

  //页面初始化时就获取数据，防止第一次点击出现无法复制问题
  let data = await serveWithGGScript()
  //格式化csv
  let csv = convertToCSV(data);

  //console.log('inited csv：'+csv); 

  copyButton.setAttribute('data-clipboard-text',csv)
  

  let clipboardTable = new ClipboardJS(copyButton, {
    text: function(trigger) {
      return trigger.getAttribute('data-clipboard-text');
    }
  });

  clipboardTable.on("success", function(e) {
  //console.log("Copied to clipboard");
  //console.log('e.text='+e.text);
  // 弹出提示消息
  $.notify("Copied data to clipboard !!!", "success");  
  });

  clipboardTable.on("error", function() {
  console.error("Failed to copy to clipboard");
  $.notify("Failed to copy data to clipboard", "error");
  });


  // 监听地址栏哈希值的变化
    window.onhashchange = async function() {
      // 当哈希值发生变化时，更新data-clipboard-text
      //console.log('URL hash changed. Reloading myElement...');
      data = await serveWithGGScript()
      csv = convertToCSV(data);
      copyButton.setAttribute('data-clipboard-text',csv)
    }
    
}



// 将数据格式化为 CSV 格式
function convertToCSV(data) {
  const headers = Object.keys(data[0]);
  const rows = data.map(obj => headers.map(header => obj[header]));
  //return [headers.join('\t'), ...rows.map(row => row.join('\t'))].join('\n');
  return [rows.map(row => row.join('\t'))];
}

async function getProductInfo() {
      let productInfo = {};
      try {
      // 获取首图链接
      // const $image = $('#landingImage');

      //$("#imageBlock_feature_div li.item span > img").attr("src") 这个是缩略图，尺寸仅有38x50px
      const $image =$('#landingImage')||$(".a-dynamic-image");
          if ($image.length > 0) {
        productInfo.image = $image.attr('src');
      }

      // 获取图片数量
      productInfo.imageAmount = $('.item.imageThumbnail').length || 0 ;

      // 获取产品名称
      const $title = $('#productTitle');
      if ($title.length > 0) {
        productInfo.name = $title.text().trim();
      }
  

      // 获取产品品牌、排名、评分和评价数量以及上架时间
      let ProductDetail = $('#detailBulletsWrapper_feature_div')
    

      if (ProductDetail.length > 0) {
        //说明当前产品是Product details的产品详情
        let spans = ProductDetail.find('.a-list-item')
        console.log('Product details')
        for (let i = 0, ilen = spans.length; i < ilen; i++) {
          if ($(spans[i]).text().trim()) {
            let key = $(spans[i]).text().split(/:(.*)/)[0].match(/[0-9a-zA-Z]/g).join('').toLowerCase()
            console.log(key)
            //let name = this.filedMap[key]
            if (!!key) {
              if (key == 'review_rating') {
                let reviews_score = $(spans[i]).find('.a-icon-star .a-icon-alt').text().replace(/‎/g, '').trim().match(/\d+[\.|\,]\d+/g)[0]
                let reviews_count = $(spans[i]).find('#acrCustomerReviewText').text().replace(/‎/g, '').match(/\d+/g).join('')
                productInfo.rating = reviews_score 
                productInfo.reviewCount = reviews_count
              }else if(key == 'customerreviews') {
                let $rating = $('#averageCustomerReviews');
                if ($rating.length > 0) {
                  // 评分
                  let ratingText = $rating.find('span').first().text().trim();
                  let reviews_score = parseFloat(ratingText.substring(0, ratingText.indexOf(' ')));
            
                  // 评论数量
                  let reviewCountText = $rating.find('span').last().text().trim();
                  let reviews_count = parseInt(reviewCountText.replace(/[^0-9]/g, ''));

                  productInfo.rating = reviews_score 
                  productInfo.reviewCount = reviews_count
                }
              }else if(key == 'bestsellersrank') {
                productInfo[key] = $(spans[i]).text().replace(/‎/g, '').trim();i++;
              }else {
                //productInfo[key] = $(spans[i]).text().split(/:\s*(.*)/)[1].replace(/‎/g, '').trim()
                productInfo[key] = $(spans[i]).text().split(/:(.*)/)[1].replace(/‎/g, '').trim()
                if(productInfo[key]==''){
                  productInfo[key] = $(spans[i]).text().split(':')[1].replace(/‎/g, '').trim();
                }
              }
            }
          }
        }
        productInfo['page_type'] = 'detail'
        
      
      } else {
        //当前产品是product information的产品详情
        let trs = $('#productDetails_detailBullets_sections1 tbody tr')
        let temps = $('#productDetails_techSpec_section_1 tbody tr')
        trs = [...trs, ...temps]
        for (let i = 0, ilen = trs.length; i < ilen; i++) {
          let key = $(trs[i]).find('th').text().match(/[0-9a-zA-Z]/g).join('').toLowerCase()
          console.log(key)
          //let name = this.filedMap[key]
          if (!!key) {
            if (key == 'review_rating') {
              let reviews_score = $(spans[i]).find('.a-icon-star .a-icon-alt').text().replace(/‎/g, '').trim().match(/\d+[\.|\,]\d+/g)[0]
              let reviews_count = $(spans[i]).find('#acrCustomerReviewText').text().replace(/‎/g, '').match(/\d+/g).join('')
              productInfo.rating = reviews_score 
              productInfo.reviewCount = reviews_count
            }else if(key == 'customerreviews') {
              let $rating = $('#averageCustomerReviews');
              if ($rating.length > 0) {
                console.log('customerreviews存在，且找到#averageCustomerReviews')
                // 评分
                let ratingText = $rating.find('span').first().text().trim();
                let reviews_score = parseFloat(ratingText.substring(0, ratingText.indexOf(' ')));
          
                // 评论数量
                let reviewCountText = $rating.find('span').last().text().trim();
                let reviews_count = parseInt(reviewCountText.replace(/[^0-9]/g, ''));

                productInfo.rating = reviews_score 
                productInfo.reviewCount = reviews_count
              }
            } else {
              productInfo[key] = $(trs[i]).find('td').text().replace(/[\n+\:]/g, '').trim()
            }
          }
        }
        productInfo['page_type'] = 'info'
      
      }


      // 品牌二次判断

      if(!productInfo.brand){
        const brand = $('#bylineInfo').text().trim();
        productInfo.brand = brand.replace(/^Visit the\s+|\s+Store$/g, '')||'';
        console.log(productInfo.brand)
      }

      
        // 是否有A+内容
        productInfo.hasAPlusContent =$('#aplus').length > 0
  
        // 是否有视频
        productInfo.hasVideo = $('#videoCount').length > 0
      
  
      
      // 获取价格
        const $price = $('#priceblock_ourprice');
        if ($price.length > 0) {
          productInfo.price = $price.text().trim();
        } else {
          const $price2 = $('.a-lineitem .a-offscreen');
          if ($price2.length > 0) {
            productInfo.price = $price2.text().trim();
          } else {
            const $price3 = $('.priceToPay');
            if ($price3.length > 0) {
              productInfo.price = $price3.text().trim();
            }
          }
        }
  }catch (error) {
    // 异常处理
    console.error(error);
    alert('Error: ' + error.message);
    return null;
  }
  console.log(productInfo);
  //alert('Product information successfully retrieved!');
  return productInfo;
}

async function serveWithGGScript() {
 
  try {
      const data = await getProductInfo();
      const productURL = `https://www.amazon.com/dp/${data.asin}`;
      const image = `=IMAGE("${data.image}")`;
      const hasAPlusContent = data.hasAPlusContent ? '有A+' : '无A+';
      const hasVideo = data.hasVideo ? '有视频' : '无视频';
      const price = data.price ? data.price.match(/\d+[\,|\.]\d+/g)[0]: '';
      const keepaImg = `=IMAGE("https://dyn.keepa.com/pricehistory.png?domain=com&asin=${data.asin}&salesrank=1&range=90&width=700&height=265")`;
      const asin = `=HYPERLINK("${productURL}","${data.asin}")`;
      const bsrMatch = data.bestsellersrank.match(/#([\d,]+)\s+in\s+([\w\s,&-]+)/i);
      const bestsellersrank = bsrMatch ? bsrMatch[1] : '';
      const category = bsrMatch ? bsrMatch[2] : '';
      const datefirstavailable =data.datefirstavailable?new Date(data.datefirstavailable):'null';
      let formattedDate = '无'
      if(data.datefirstavailable){
       formattedDate = datefirstavailable.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }); }
      //const now = new Date();
      //const daysOnMarket = Math.floor((now - formattedDate) / (1000 * 60 * 60 * 24));

     
      const result = [{
        IMAGE: image,
    TITLE: data.name,
    BRAND: data.brand,
    ASIN: asin,
    PRICE: price,
    BSR: bestsellersrank,
    CATEGORY: category,
    TrackingSince: formattedDate,
    KEEPAIMG: keepaImg,
    RATING: data.rating,
    ReviewCount: data.reviewCount,
    hasAPlus: hasAPlusContent,
    hasVideo: hasVideo,
    ImageAmount: data.imageAmount
  }]
    return result;
     
    } catch (error) {
      console.error('An error occurred:', error);
      throw error; // 将错误抛出以便在调用该方法的地方处理
    }
  }


// 在页面加载完成后调用 initPage 函数
window.addEventListener('load', initPage);




/**
// 等待页面加载完成
if (document.readyState === 'complete') {
  // 页面已经加载完成，直接添加复制按钮
  console.log('页面加载完成'),
  addCopyButton
} else {
  // 页面尚未加载完成，等待 DOMContentLoaded 事件
  document.addEventListener('DOMContentLoaded', () => {
    console.log('页面加载ing'),
    // 添加复制按钮
    addCopyButton
  });
}
 */