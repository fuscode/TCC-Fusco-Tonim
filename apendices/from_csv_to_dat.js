const fs = require("fs");
const csv = require('fast-csv');

//Constantes do Projeto
const config = require('./config.json');
const nodes = config.nodes;
const markets = config.markets;
const years = Array.from({
    length: config.endYear - config.startYear + 1
}, (v, k) => k + config.startYear);

//Iteracoes
var t = 0;
for (const market of markets) {
    for (const node of nodes) {
        for (const year of years) {
            setTimeout(function timer() {
                createDatFile(market, node, year);
            }, t * 100);
            t++;
        }
    }
}

function createDatFile(market, node, year) {

    var dirCsv = `./dados_${market}_hrl_lmps_csv/`;
    var csv_filename = dirCsv + node + '-' + year + '.csv';
    var stream = fs.createReadStream(csv_filename);
    stream.on('error', function () {
        return;
    });
    var dat_file = 'param p :=\n';

    var index = 1;
    csv
        .fromStream(stream, {
            headers: true
        })
        .on("data", function (data) {
            dat_file += '\n ' + index + ' ' + data[`total_lmp_${market}`] + "\n";
            index++;
        })
        .on("end", function () {
            var dirDat = `./dados_${market}_hrl_lmps_dat`;
            if (!fs.existsSync(dirDat)) {
                fs.mkdirSync(dirDat);
            }
            var dat_filename = dirDat + '/' + node + '-' + year + '.dat';
            dat_file += '\n;';

            fs.writeFile(dat_filename, dat_file, function (err) {
                if (err) {
                    return console.log(err);
                }
                console.log(`The ${node} of ${year} was saved!`);
            });
        });
}