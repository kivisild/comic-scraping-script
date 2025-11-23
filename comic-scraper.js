const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const request = require("request");



async function main(maxPages = 29, downloadPath = "comics"){
    const urlsToVisit = ["https://www.monkeyuser.com"]
    const visitedUrls = [];


    while(visitedUrls.length <= maxPages){
        const paginationURL = urlsToVisit.pop();
        const baseURL = paginationURL;
        const pageHTML = await axios.get(paginationURL);
        visitedUrls.push(paginationURL);

        const $ = cheerio.load(pageHTML.data);

        $(".pagination a").each((index, element) => {
            let paginationURL = new URL($(element).attr("href"), baseURL);

            if(!visitedUrls.includes(paginationURL.href) && !urlsToVisit.includes(paginationURL.href)){
                urlsToVisit.push(paginationURL.href);
            }
        });

        if (!fs.existsSync(downloadPath)){
            fs.mkdirSync(downloadPath);
        }

        $(".comic .content p img").each((index, image) => {
            const imageURL = new URL($(image).attr("src"), paginationURL);
            const filename = imageURL.pathname.split('/').pop();
            request(imageURL.href).pipe(fs.createWriteStream(downloadPath + '/' + filename));
        })



    }
}

main().then(()=> {
    return 0;
}).catch((e) => {
    console.error(e);
    return 1;
});