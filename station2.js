const fetch = require('node-fetch');
var request = require('request');


const requestData = {
  sessionID: "1Wo1O5_eOKojeoTL4lShzSvh2xKIlBQW"
};

const requestOptions = {
  method: 'POST',
  headers: {
    'Accept': '*/*',
    'Accept-Language': 'sr-ME,sr-RS;q=0.9,sr;q=0.8,en-US;q=0.7,en;q=0.6',
    'Content-Type': 'application/json',
    'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"macOS"',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    'Cookie': 'connect.sid=s%3A1Wo1O5_eOKojeoTL4lShzSvh2xKIlBQW.6yoKqsA5MhHFB%2FLXUisFzFRjS5J9AmOh4WX8MUC6UY0; sessionID=1Wo1O5_eOKojeoTL4lShzSvh2xKIlBQW',
    'Referer': 'https://meteorastation.com/dashboard/Station2',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  },
  body: JSON.stringify(requestData)
};

fetch('https://meteorastation.com/api/getStationData/Station2', requestOptions)
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    console.log('Response:', data);
  })
  .catch(error => {
    console.error('Error:', error);
  });

var options = {
  'method': 'POST',
  'url': 'http://localhost:3000/uploadData',
  'headers': {
    'Content-Type': 'text/plain',
    'Cookie': 'connect.sid=s%3A2aWKd7nT7WE6tiua26D3Qm1962lJDVSa.C%2F2fWr47P85IOU%2FfxheeomMYsjiru%2BEWA1BkkBLQA%2Bs'
  },
  body: '{\n  "commonlist": [\n    { "id": "0x02", "val": "11.6", "unit": "C" },\n    { "id": "0x07", "val": "79" },\n    { "id": "3", "val": "11.6", "unit": "C" },\n    { "id": "0x05", "val": "13.0", "unit": "C" },\n    { "id": "0x03", "val": "8.1", "unit": "C" },\n    { "id": "0x04", "val": "11.6", "unit": "C" },\n    { "id": "0x0B", "val": "0.0ms" },\n    { "id": "0x0C", "val": "0.0ms" },\n    { "id": "0x19", "val": "0.5ms" },\n    { "id": "0x15", "val": "2.72Wm2" },\n    { "id": "0x17", "val": "0" },\n    { "id": "0x0A", "val": "215" }\n  ],\n  "rain": [\n    { "id": "0x0D", "val": "0.0mm" },\n    { "id": "0x0E", "val": "0.0mmHr" },\n    { "id": "0x10", "val": "0.0mm" },\n    { "id": "0x11", "val": "0.0mm" },\n    { "id": "0x12", "val": "0.0mm" },\n    { "id": "0x13", "val": "0.0mm", "battery": "0" }\n  ],\n  "wh25": [\n    {\n      "intemp": "15.4",\n      "unit": "C",\n      "inhumi": "73",\n      "abs": "981.4hPa",\n      "rel": "981.4hPa"\n    }\n  ],\n  "signal": "ATCSQCSQ:17,99OK",\n  "imei": "868715034997514",\n  "battery": "0.00",\n  "spanel": "0.00",\n  "sht1": "18.0:98.6",\n  "sht2": "15.0:100.0"\n}\n'

};
request(options, function (error, response) {
  if (error) throw new Error(error);
  console.log(response.body);
});

