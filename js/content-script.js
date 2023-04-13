function addCopyButton() {
  // 获取产品标题元素
  var productTitleElem = document.querySelector('#title_feature_div');
  // 创建按钮元素
  const copyButton = document.createElement('a');
  copyButton.innerHTML = '<img id="copy-button" src="' + chrome.extension.getURL("images/copy_button.png") + '">';
  
  // 找到产品标题元素的父级元素，将按钮元素插入到适当位置
  var titleWrapper = productTitleElem.parentNode;
  titleWrapper.insertBefore(copyButton, productTitleElem.nextSibling);

  const clipboardTable = new ClipboardJS(copyButton, {
    text: ''
  });

  copyButton.addEventListener('click', async function (){
    try {
      // 使用 await 等待异步操作完成, info 是一个 Promise,不是一个直接可用的值
      const data =  await serveWithGGScript();
      
      console.log('data'+data);
      //剪贴板
      clipboardTable.text=data;
      console.log(clipboardTable.text);
     
      clipboardTable.on("success", function() {
        console.log("Copied to clipboard");
        $.notify("Copied data to clipboard !!!", "success");
        clipboardTable.destroy(); // 销毁 ClipboardJS 实例
      });
  
      clipboardTable.on("error", function() {
        console.error("Failed to copy to clipboard");
        $.notify("Failed to copy data to clipboard", "error");
      });
    
    } catch (error) {
      console.error(error);
    }
 
  });

}

async function getProductInfo() {
      let productInfo = {};
      try {
      // 获取首图链接
      const $image = $('#landingImage');
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
        for (let i = 0, ilen = spans.length; i < ilen; i++) {
          if ($(spans[i]).text().trim()) {
            let key = $(spans[i]).text().split(':')[0].match(/[0-9a-zA-Z]/g).join('').toLowerCase()
            //let name = this.filedMap[key]
            if (!!key) {
              if (key == 'review_rating') {
                let reviews_score = $(spans[i]).find('.a-icon-star .a-icon-alt').text().replace(/‎/g, '').trim().match(/\d+[\.|\,]\d+/g)[0]
                let reviews_count = $(spans[i]).find('#acrCustomerReviewText').text().replace(/‎/g, '').match(/\d+/g).join('')
                productInfo[key] = reviews_score + '/' + reviews_count
              } else {
                productInfo[key] = $(spans[i]).text().split(':')[1].replace(/‎/g, '').trim()
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
          //console.log(key)
          //let name = this.filedMap[key]
          if (!!key) {
            if (key == 'review_rating') {
              let reviews_score = $(trs[i]).find('.a-icon-star .a-icon-alt').text().replace(/‎/g, '').trim().match(/\d+[\.|\,]\d+/g)[0]
              let reviews_count = $(trs[i]).find('#acrCustomerReviewText').text().replace(/‎/g, '').match(/\d+/g).join('')
              productInfo[key] = reviews_score + '/' + reviews_count
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
      
      // 获取是否是变体，变体类型和变体数量
      /*const $variationSummary = $('#twister');
      if ($variationSummary.length > 0) {
        const $variationType = $variationSummary.find('.variationStyleName');
        if ($variationType.length > 0) {
          productInfo.variationType = $variationType.text().trim();
        }
        const $variationCount = $variationSummary.find('.variation_count');
        if ($variationCount.length > 0) {
          productInfo.variationCount = $variationCount.text().trim();
        }
      }*/
  
      // 获取评分和评论数量
      /*const $rating = $('#averageCustomerReviews');
      if ($rating.length > 0) {
        // 评分
        const ratingText = $rating.find('span').first().text().trim();
        productInfo.rating = parseFloat(ratingText.substring(0, ratingText.indexOf(' ')));
  
        // 评论数量
        const reviewCountText = $rating.find('span').last().text().trim();
        productInfo.reviewCount = parseInt(reviewCountText.replace(/[^0-9]/g, ''));
      }*/

  }catch (error) {
    // 异常处理
    console.error(error);
    alert('Error: ' + error.message);
    return null;
  }
  console.log(productInfo);
  alert('Product information successfully retrieved!');
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
      const asin = `HYPERLINK("${productURL}",${data.asin})`;
      const bsrMatch = data.bestsellersrank.match(/#([\d,]+)\s+in\s+([\w\s&-]+)/i);
      const bestsellersrank = bsrMatch ? bsrMatch[1] : '';
      const category = bsrMatch ? bsrMatch[2] : '';
      const datefirstavailable =new Date(data.datefirstavailable);
      const formattedDate = datefirstavailable.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
      const now = new Date();
      const daysOnMarket = Math.floor((now - formattedDate) / (1000 * 60 * 60 * 24));
     
      // 将商品信息转换为csv格式

      const header = [
        "Image",
        "Name",
        "Brand",
        "ASIN",
        "Price",
        "Best Sellers Rank",
        "category",
        "Date First Available",
        "daysOnMarket",
        "KEEPA",
        "A+ Content",
        "Video",
        "ImageAmount"
      ];
      const rowData = [
        image,
        data.name,
        data.brand,
        asin,
        price,
        bestsellersrank,
        category,
        formattedDate,
        daysOnMarket,
        keepaImg,
        hasAPlusContent,
        hasVideo,
        data.imageAmount
      ];
      const csv = `${header.join(",")}\n${rowData.join(",")}`;
      
    
  
      console.log('rowData:'+rowData);
    console.log('csv:'+csv);
    return csv;

     /* const result = 
        `
      <table>
        <tr>
          <td>图片</td>
          <td>产品名称</td>
          <td>品牌</td>
          <td>ASIN</td> 
          <td>销售排名</td>
          <td>价格</td>          
          <td>上架时间</td>
          <td>KEEPA</td>
          <td>A+内容</td>
          <td>视频情况</td>
          <td>图片数量</td>
        </tr>
        <tr>
          <td>${image}</td>
          <td>${data.name}</td>
          <td>${data.brand}</td>
          <td><a href="${productURL}">${data.asin}</a></td>
          <td>${data.bestsellersrank}</td>
          <td>$ ${price}</td>
          <td>=IMAGE("${keepaImg}")</td>
          <td>${data.datefirstavailable}</td>
          <td>${hasAPlusContent}</td>
          <td>${hasVideo}</td>
          <td>图片有${data.imageAmount}张</td>
        </tr>
      </table>
    `;*/
     
     
    } catch (error) {
      console.error('An error occurred:', error);
      throw error; // 将错误抛出以便在调用该方法的地方处理
    }
  }

//复制数据
/*
function copyData(data) {
  chrome.storage.sync.get("activated_sort", function(syncData) {
    const activatedSort = syncData.activated_sort || []; // 处理返回值为空的情况
    const copiedData = activatedSort.map(sortKey => data[sortKey] || " "); // 如果返回数据中没有指定的排序键，则将其值设置为空格

    /*const clipboardData = copiedData.map((item) => [item]);
    const clipboardTable = new ClipboardJS(".copy-button", {
      text: function(trigger) {
        return clipboardData.map((row) => row.join("\t")).join("\n");
      }
    });/

    const table = document.createElement("table");
    const row = table.insertRow();
    copiedData.forEach((item) => {
      const cell = row.insertCell();
      cell.innerHTML = item;
    });

    const clipboardTable = new ClipboardJS(".qcopy-btn", {
      text: function(trigger) {
        return copiedData.join("\t");
      }
    });

    

    clipboardTable.on("success", function() {
      console.log("Copied to clipboard");
      $.notify("Copied data to clipboard !!!", "success");
      e.clearSelection();
    });

    clipboardTable.on("error", function() {
      console.error("Failed to copy to clipboard");
      $.notify("Failed to copy data to clipboard", "error");
    });

    const copyButton = document.createElement("button");
    copyButton.classList.add("qcopy-btn");
    copyButton.dataset.clipboardTarget = "table";
    copyButton.click();
 
/*
    // 添加复制按钮到表格中
    const copyBtn = $('<button>').addClass('copy-btn btn btn-primary').text('Copy');
    table.prepend($('<tr>').append($('<th>').append(copyBtn)));

    // 将表格添加到页面
    $('body').append(table);

   /
  });
}
*/


// 在页面加载完成后调用 addCopyButton 函数
window.addEventListener('load', addCopyButton);




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