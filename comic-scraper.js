const Axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const request = require("request");
const { setupCache } = require("axios-cache-interceptor");



async function main(URLInput = "https://www.monkeyuser.com/", maxPages = 29){
    const URLSToVisit = [URLInput];

    let visitedUrls = [];
    let images = [];
    
    if (Array.isArray(URLSToVisit) && URLSToVisit.length){
        while(visitedUrls.length < maxPages){
            const currentURL = URLSToVisit.pop();
            visitedUrls.push(currentURL);
        
            scrapingData = await scrapePage(currentURL, visitedUrls, URLSToVisit);
            images.push(scrapingData[0]);
            URLSToVisit.push(scrapingData[1]);
        } 
    }

    console.log(`Images: ${images}, Length: ${images.length}`);
    for (let i = 0; i < images.length - 1; i++){
            currentImage = images.pop() + '';
            if (currentImage != ''){
                downloadImage(currentImage);
            }
            
        }
    

    
}
async function scrapePage(url,visitedUrls, urlsToVisit, downloadPath = "comics"){
    
    const instance = Axios.create();
    const axios = setupCache(instance);
    let ImgURLOutput = [];
    let NavURLOutput = null;
    const pageHTML = await axios.get(url);
    const $ = cheerio.load(pageHTML.data);
    const paginationURL = url;
    
    $(".pagination a").each((index, element) => {
         url = new URL($(element).attr("href"), url);
        if(!visitedUrls.includes(url.href) && 
        !urlsToVisit.includes(url.href)){
            NavURLOutput = (url.href);
        }
    });

    if (!fs.existsSync(downloadPath)){
        fs.mkdirSync(downloadPath);
    }

    $(".comic .content p img").each((index, image) => {
        
        const imageURL = new URL($(image).attr("src"), paginationURL);
        const filename = imageURL.href.split('/').pop();
        if (!fs.existsSync(`${downloadPath}/${filename}`)){
            ImgURLOutput.push(imageURL.href)
            }       
        });
    
    return [ImgURLOutput, NavURLOutput];
    
    }


function downloadImage(url, downloadPath = "comics"){
    console.log(`Downloading image: ${url}`);
    const filename = url.split('/').pop();
    request(url).pipe(fs.createWriteStream(downloadPath + '/' + filename));
}

main().then(()=> {
    return 0;
}).catch((e) => {
    console.error(e);
    return 1;
});