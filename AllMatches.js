const request = require('request');
const cheerio = require('cheerio');
const singleMatch = require('./scorecard');

// All matches
function match_result(url){
    request(url, function(err, response, html){
        if(err){
            console.log(err);
        }
        else{
            extractMatches(html);
        }
    });
}


function extractMatches(html){
    let $ = cheerio.load(html);

    let MatchesArr = $('a[data-hover="Scorecard"]');
    
    for(let i = 0; i < MatchesArr.length ; i++){
        let link = $(MatchesArr[i]).attr("href");
        let fullLink = "https://www.espncricinfo.com" + link;
        singleMatch.ith_match(fullLink);
        // console.log(fullLink);
    }
}

module.exports = {
    matchResult : match_result
}