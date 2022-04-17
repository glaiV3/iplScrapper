const cheerio = require("cheerio")
const request = require("request")
const fs = require("fs");
const path = require("path")
const xlsx = require("xlsx")

function extractMatchDetails(html) {
    let $ = cheerio.load(html);

    //logic for venue and date
    let commonInfo = $(".ds-text-tight-m.ds-font-regular.ds-text-ui-typo-mid").text()
    // to get venue and date only
    commonInfo = commonInfo.split(",")
    let venue = commonInfo[1].trim();
    let date = commonInfo[2] + " " + commonInfo[3].trim();
    let result = $(".ds-text-tight-m.ds-font-regular.ds-truncate.ds-text-typo-title").text();
    extractPlayerDetails($, venue, date, result)
}

function extractPlayerDetails($, venue, date, result) {
    //selector for two innings Table
    let teamsData = $(".ds-bg-fill-content-prime.ds-rounded-lg")
    for (let i = 0; i < teamsData.length; i++) {
        let teamName = $(teamsData[i]).text().split("INNINGS")[0].trim()
        let opponentidx = i == 0 ? 1 : 0;
        opponentTeam = $(teamsData[opponentidx]).text().split("INNINGS")[0].trim()
        let batbowlArr = $(teamsData[i]).find(".ReactCollapse--content tbody")
        for (let j = 0; j < batbowlArr.length; j++) {
            //if j==0 batsman array
            // if j==1 bowler array
            extractPlayerData($(batbowlArr[j]), teamName, opponentTeam, $, j, venue, date, result)
        }

    }

}
let count = 0;
function extractPlayerData(playerDataTable, teamName, opponentTeam, $, index, venue, date, result) {
    //first index correspond to batting players of teamName

    count++;
    teamName = index == 0 ? teamName : opponentTeam
    opponentTeam = index == 0 ? opponentTeam : teamName

    let playerDataarr = $(playerDataTable).find("tr")
    for (let i = 0; i < playerDataarr.length; i++) {
        let dataArr = $(playerDataarr[i]).find("td");

        if (dataArr.length > 4) {
            if (index == 0) {
                //index=0 means batting table
                let playerName = ($(dataArr[0]).text()).trim();
                let run = $(dataArr[2]).text();
                let ballsPLayed = $(dataArr[3]).text();
                let fours = $(dataArr[5]).text();
                let sixes = $(dataArr[6]).text();
                let strikerate = $(dataArr[7]).text();
                battingProcessPlayer("Battting Stats", teamName, playerName, run, ballsPLayed, fours, sixes, strikerate, date, result, venue)
            } else {
                //index!=0 means bowling table
                let playerName = ($(dataArr[0]).text()).trim();
                let overs = $(dataArr[1]).text();
                let Maiden = $(dataArr[2]).text();
                let Runs = $(dataArr[3]).text();
                let Wickets = $(dataArr[4]).text();
                let Economy = $(dataArr[5]).text();
                let Zeros = $(dataArr[6]).text();
                let fours = $(dataArr[7]).text();
                let six = $(dataArr[8]).text();
                let WD = $(dataArr[9]).text();
                let nb = $(dataArr[10]).text();
                bowlingProcessPlayer("Bowling Stats", opponentTeam, playerName, overs, Maiden, Runs, Wickets, Economy, Zeros, fours, six, WD, nb, date, result, venue);
            }

        }
    }
    if (count == 240) {
        console.log("PROCESS FINISHED");
    }




}

function battingProcessPlayer(folderName, teamName, playerName, run, ballsPLayed, fours, sixes, strikerate, date, result, venue) {
    let folderPath = path.join(__dirname, "ipl")
    dirCreator(folderPath)
    let teamPath = path.join(folderPath, teamName)
    dirCreator(teamPath)
    let dirPath = path.join(teamPath, folderName);
    dirCreator(dirPath)
    let filePath = path.join(dirPath, playerName + ".xlsx")
    let content = excelReader(filePath, playerName)
    let playerObj = {
        "Team Name": teamName,
        "Player Name": playerName,
        "Runs": run,
        "Balls Played": ballsPLayed,
        "4s": fours,
        "6s": sixes,
        "S.R": strikerate,
        "Date": date,
        "Result": result,
        "Venue": venue
    }
    content.push(playerObj)
    excelWriter(filePath, content, playerName)
}

function bowlingProcessPlayer(folderName, opponentTeam, playerName, overs, Maiden, Runs, Wickets, Economy, Zeros, fours, six, WD, nb, date, result, venue) {
    let folderPath = path.join(__dirname, "ipl")
    dirCreator(folderPath)
    let teamPath = path.join(folderPath, opponentTeam)
    dirCreator(teamPath)
    let dirPath = path.join(teamPath, folderName);
    dirCreator(dirPath)
    let filePath = path.join(dirPath, playerName + ".xlsx")
    let content = excelReader(filePath, playerName)
    let playerObj = {
        "Team Name": opponentTeam,
        "overs": overs,
        "Maiden": Maiden,
        "Runs": Runs,
        "Wickets": Wickets,
        "Economy": Economy,
        "0s": Zeros,
        "4s": fours,
        "6s": six,
        "Wide Balls": WD,
        "No Ball": nb,
        "Date": date,
        "Result": result,
        "Venue": venue
    }
    content.push(playerObj)
    excelWriter(filePath, content, playerName)
}

function dirCreator(filePath) {
    if (fs.existsSync(filePath) == false) {
        fs.mkdirSync(filePath)
    }
}

function excelWriter(filePath, json, sheetName) {

    let newWb = xlsx.utils.book_new();
    let newWS = xlsx.utils.json_to_sheet(json)
    xlsx.utils.book_append_sheet(newWb, newWS, sheetName)
    xlsx.writeFile(newWb, filePath)
}

function excelReader(filePath, sheetName) {
    if (fs.existsSync(filePath) == false) {
        return [];
    }
    let wb = xlsx.readFile(filePath)
    let excelData = wb.Sheets[sheetName]
    let ans = xlsx.utils.sheet_to_json(excelData)
    return ans;

}
module.exports = {
    matchDetails: extractMatchDetails
}