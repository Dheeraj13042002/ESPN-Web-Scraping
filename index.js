const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const Path = require('path');
const allMatchObj = require('./AllMatches');

const url = 'https://www.espncricinfo.com/series/ipl-2020-21-1210595';

const iplPath = Path.join(__dirname,"ipl");
dirCreator(iplPath);

request(url, function(err, response, html){
    if(err){
        console.log(err);
    }
    else{
        extractHtml(html);
    }
});

function extractHtml(html){
    let $ = cheerio.load(html);
    let viewAllResult = $(".widget-items.cta-link").find("a").attr("href");
    let prefix = 'https://www.espncricinfo.com';
    let link = prefix + viewAllResult;
    allMatchObj.matchResult(link);
}


function dirCreator(filePath){
    if(fs.existsSync(filePath) == false){
        fs.mkdirSync(filePath);
    }
}
