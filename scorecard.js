const request = require('request');
const cheerio = require('cheerio');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

// const url = 'https://www.espncricinfo.com/series/ipl-2020-21-1210595/mumbai-indians-vs-chennai-super-kings-1st-match-1216492/full-scorecard';

function ith_match(url){
    request(url, function(err, response, html){
        if(err){
            console.log(err);
        }
        else{
            extractMatchDetails(html);
        }
    });
}

function extractMatchDetails(html){
    let $ = cheerio.load(html);

    // venue -->.header-info .description
    // result --> .match-info.match-info-MATCH  .status-text span

    let descElem = $(".header-info .description");
    let result = $(".match-info.match-info-MATCH  .status-text span");

    // console.log(descElem.text());
    // console.log(result.text());

    let venue = descElem.text().split(",")[1];
    venue = venue.trim();

    let date = descElem.text().split(",")[2];
    date = date.trim();

    // console.log(venue, " ", date);

    let innings = $(".card.content-block.match-scorecard-table>.Collapsible");
   
    for(let i = 0; i < innings.length; i++){
        let TeamName = $(innings[i]).find('.header-title.label');
        TeamName = TeamName.text().split("INNINGS")[0].trim(); 

        let opp_idx = (i == 0) ? 1 : 0;
        let opponentTeamName = $(innings[opp_idx]).find('.header-title.label');
        opponentTeamName = opponentTeamName.text().split("INNINGS")[0].trim(); 

        let currInnings = $(innings[i]);

        let batsmanDetails = currInnings.find('.table.batsman tbody tr');

        for(let idx = 0; idx < batsmanDetails.length; idx++){
            let allCols = $(batsmanDetails[idx]).find('td');
            let isPlayer = $(allCols[0]).hasClass('batsman-cell');
            if(isPlayer){
                let PlayerName = $(allCols[0]).text().trim();
                let runScored = $(allCols[2]).text().trim();
                let ballsPlayed = $(allCols[3]).text().trim();
                let fours = $(allCols[5]).text().trim();
                let sixes = $(allCols[6]).text().trim();
                let strikeRate = $(allCols[7]).text().trim();

                console.log(`${PlayerName} | ${runScored} | ${ballsPlayed} | ${fours} | ${sixes} | ${strikeRate}`);
                processPlayer(TeamName,PlayerName,runScored, ballsPlayed, fours, sixes, strikeRate, opponentTeamName);
            }
        }
        console.log(`-----------`);
    }
}

function processPlayer(TeamName,PlayerName,runScored, ballsPlayed, fours, sixes, strikeRate, opponentTeamName){

    let teamPath = path.join(__dirname,"ipl",TeamName);
    dirCreator(teamPath);
    let filePath = path.join(teamPath,PlayerName + ".xlsx");

    let content = excelReader(filePath,PlayerName);
    let playerObj = {
        TeamName,
        PlayerName,
        runScored,
        ballsPlayed,
        fours,
        sixes,
        fours,
        strikeRate,
        opponentTeamName
    }

    content.push(playerObj);
    excelWriter(filePath,content,PlayerName);
}

function dirCreator(filePath){
    if(fs.existsSync(filePath) == false){
        fs.mkdirSync(filePath);
    }
}

function excelWriter(filePath, json, sheetName){
    let newWB = xlsx.utils.book_new();
    let newWS = xlsx.utils.json_to_sheet(json);

    xlsx.utils.book_append_sheet(newWB,newWS,sheetName);
    xlsx.writeFile(newWB, filePath);
}

function excelReader(filePath, sheetName){
    if(fs.existsSync(filePath) == false){
        return [];
    }

    let wb = xlsx.readFile(filePath);
    let excelData = wb.Sheets[sheetName];
    let ans = xlsx.utils.sheet_to_json(excelData);
    return ans;
}

module.exports = {
    ith_match : ith_match
}