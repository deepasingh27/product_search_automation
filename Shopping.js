const fs = require("fs");
const puppeteer = require("puppeteer");
const searchItem = "iphone mini";
let allData = [];

(async function getFlipkart(){
    let browser = await puppeteer.launch({
        headless :false,
        defaultViewport: null,
        args: ["--start-maximized"]
    });
    let pages = await browser.pages();
    let tab = pages[0];
    await tab.goto("https://www.flipkart.com");
    await tab.waitForSelector("._2KpZ6l._2doB4z");
    await tab.click("._2KpZ6l._2doB4z");
    // await tab.waitForSelector("._3704LK");
    await tab.type("._3704LK",searchItem);
    await tab.click(".L0Z3Pu"); 
    await tab.waitForSelector("._1fQZEK");
    let allLinksTags = await tab.$$("._1fQZEK");
    let allLinks = [];
    for(i=0;i<6;i++){
        let oneLink = await tab.evaluate(function(elem){return elem.getAttribute("href")},allLinksTags[i]);
        oneLink= "https://www.flipkart.com" + oneLink;
        allLinks.push(oneLink);
    }
    //await getDataFlip(allLinks[0],browser);
    //console.log(allLinks);
    for(let i=0;i<allLinks.length;i++){
        await getDataFlip(allLinks[i],browser);   
    }

    allData = allData.sort(compare_prices);
    await fs.promises.writeFile("./products.json",JSON.stringify(allData));
    await tab.close();

})();

// flipkart data scrapper
async function getDataFlip(plink,browser){
    let dataObj = {
        "name": "",
        "price": "",
        "link": "",
    };
    let tab = await browser.newPage();
    await tab.goto(plink);
    await tab.waitForSelector(".B_NuCI");
    let nameTag = await tab.$(".B_NuCI");
    let name = await tab.evaluate(function(elem){return elem.textContent},nameTag);
    dataObj["name"]=name;
    let prodPriceTag = await tab.$("._30jeq3._16Jk6d");
    let prodPrice = await tab.evaluate(function(elem){return elem.textContent},prodPriceTag);
    dataObj["price"]=prodPrice;
    dataObj["link"]=plink;
    console.log(`##################### ${dataObj["name"]}###################################`);
    allData.push(dataObj);
    await tab.close();
}

// amazon function
(async function get(){
    let browser=await puppeteer.launch({
        headless :false,
        defaultViewport: null,
        args: ["--start-maximized"]
    });
    let pages =await browser.pages();
    let tab=pages[0];
    await tab.goto("https://www.amazon.in/");
    await tab.waitForSelector("#twotabsearchtextbox", {visible:true});
    await tab.type('#twotabsearchtextbox',searchItem);
    await tab.click("#nav-search-submit-button");
    await tab.waitForSelector(".a-size-mini.a-spacing-none.a-color-base.s-line-clamp-2 a" , {visible:true});
    let linkTags = await tab.$$(".a-size-mini.a-spacing-none.a-color-base.s-line-clamp-2 a");
    let allLinks = [];
    for(let i=0;i<5;i++){
        let oneLink = await tab.evaluate(function(element){ return element.getAttribute("href")}, linkTags[i]);
        oneLink = "https://www.amazon.in" + oneLink;
        allLinks.push(oneLink);
    }
     for(let i=0;i<allLinks.length;i++){

         await getPrice(allLinks[i],browser);
     }
    allData = allData.sort(compare_prices);
    await fs.promises.writeFile("./products.json",JSON.stringify(allData));
    await tab.close();
    //await getPrice(allLinks[0], browser);
     
})();
// amazon getdata
    async function getPrice(objLink , browser){
    let dataObj = {
        "name": "",
        "price": "",
        "link": "",
    };
    let tab = await browser.newPage();
    await tab.goto(objLink);
    await tab.waitForSelector("#productTitle");
     // dataObj

    let prodNameTag = await tab.$("#productTitle");
    let prodName = await tab.evaluate(function(element){ 
       return element.textContent;
    }, prodNameTag)
   let b= prodName.slice(8,prodName.length-7);
    dataObj["name"]=b;
    //console.log(b);
    let prodPriceTag = await tab.$('#priceblock_ourprice');
    if(prodPriceTag!=null){
        let prodPrice = await tab.evaluate(function(element){
            return element.textContent;
        }, prodPriceTag)
        dataObj["price"]=prodPrice;
    }else {
        let prodPriceSpan = await tab.$("#priceblock_saleprice");
        let prodPrice = await tab.evaluate(function(element){
            return element.textContent;
        }, prodPriceSpan);
        dataObj["price"]=prodPrice;
    }
    
    dataObj["link"]=objLink;
    console.log(`##################### ${dataObj["name"]}###################################`);
    allData.push(dataObj);
    await tab.close();
}

function compare_prices(a, b){
    if(a["price"] < b["price"]){
            return -1;
    }else if(a["price"] > b["price"]){
            return 1;
    }else{
            return 0;
    }
}