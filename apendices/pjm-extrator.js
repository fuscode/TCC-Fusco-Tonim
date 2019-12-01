// Pacotes Usados
const fetch = require('node-fetch');
const fs = require("fs");
const csv = require('fast-csv');

//Constantes do Projeto
const config = require('./config.json');
const nodes = config.nodes;
const markets = config.markets;
const years = Array.from({
    length: config.endYear - config.startYear + 1
}, (v, k) => k + config.startYear);
const options = {
    method: 'GET',
    headers: {
        'Ocp-Apim-Subscription-Key': '472eab67221f47328c41423a3ef45b40'
    },
};

// Iterações
var i = 0;
for (const market of markets) {
    for (const node of nodes) {
        for (const year of years) {
            setTimeout(function timer() {
                callApiAndSaveToCsv(market, node, year);
            }, i * 5 * 1000);
            i++;
        }
    }
}

// Main 
function callApiAndSaveToCsv(market, node, year) {

    console.log(`Iniciada aquisicao do nó ${node} do ano ${year}`);

    var dir = `./dados_${market}_hrl_lmps_csv`;
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    let filename = dir + '/' + node + '-' + year + '.csv';
    const ws = fs.createWriteStream(filename);

    var url = `https://api.pjm.com/api/v1/${market}_hrl_lmps?sort=datetime_beginning_ept&startRow=1&isActiveMetadata=true&fields=congestion_price_${market},datetime_beginning_ept,datetime_beginning_utc,equipment,marginal_loss_price_${market},pnode_id,pnode_name,system_energy_price_${market},total_lmp_${market},type,voltage,zone&datetime_beginning_ept=1/1/${year}%2000:00to12/31/${year}%2023:45&download=true&pnode_id=${node}`
    fetch(url, options)
        .then(res => res.json())
        .then(body => {
            csv.
            write(body, {
                headers: true
            }).pipe(ws);
            console.log(`Nó ${node} do ano ${year} salvo com sucesso!`);
        })
        .catch(err => {
            console.log(err);
            setTimeout(function timer() {
                callApiAndSaveToCsv(market, node, year);
            }, 60 * 1000);
        })
};