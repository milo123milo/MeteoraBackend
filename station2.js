import('node-fetch');
const request = require('request');

function offsetValue(value, round=0, sht=false) {
    // Remove anything that is not a number or a number with a decimal point or comma
    const cleanedValue = value.toString().replace(/[^0-9.,]/g, '');
    
    // If the cleaned value is empty, return 0
    if (!cleanedValue.trim()) return 0;

    // Generate a random offset between -10% and 10%
    const offsetPercentage = Math.random() * 20 - 10;
    // Calculate the offset amount
    const offset = parseFloat(cleanedValue.replace(',', '.')) * (offsetPercentage / 100);
    // Apply the offset to the original value
    var newValue = parseFloat(cleanedValue.replace(',', '.')) + offset;
    if(sht && newValue > 100){
        var dif = newValue - 100
        newValue = newValue - dif 
        newValue = newValue * Math.random();
    }
    return newValue.toFixed(round);
}

function sendData(data){
    var options = {
        'method': 'POST',
        'url': 'https://meteorastation.com/api/uploadData',
        'headers': {
          'Content-Type': 'text/plain',
          'Cookie': 'connect.sid=s%3A2aWKd7nT7WE6tiua26D3Qm1962lJDVSa.C%2F2fWr47P85IOU%2FfxheeomMYsjiru%2BEWA1BkkBLQA%2Bs'
        },
        body: `{\n  "commonlist": [\n    
        { "id": "0x02", "val": "${offsetValue(data.airTemp, 1)}", "unit": "C" },\n    
        { "id": "0x07", "val": "${offsetValue(data.airHumi)}" },\n    
        { "id": "3", "val": "11.6", "unit": "C" },\n    
        { "id": "0x05", "val": "13.0", "unit": "C" },\n    
        { "id": "0x03", "val": "8.1", "unit": "C" },\n    
        { "id": "0x04", "val": "11.6", "unit": "C" },\n    
        { "id": "0x0B", "val": "${offsetValue(data.windSpeed, 1)}ms" },\n    
        { "id": "0x0C", "val": "0.0ms" },\n    
        { "id": "0x19", "val": "0.5ms" },\n    
        { "id": "0x15", "val": "${offsetValue(data.irradiation)}Wm2" },\n    
        { "id": "0x17", "val": "0" },\n    
        { "id": "0x0A", "val": "${offsetValue(data.windDirection)}" }\n  ],\n  
        "rain": [\n    { "id": "0x0D", "val": "${offsetValue(data.rainAmount, 1)}mm" },\n    { "id": "0x0E", "val": "0.0mmHr" },\n    
        { "id": "0x10", "val": "0.0mm" },\n    
        { "id": "0x11", "val": "0.0mm" },\n    { "id": "0x12", "val": "0.0mm" },\n    
        { "id": "0x13", "val": "0.0mm", "battery": "0" }\n  ],\n  
        "wh25": [\n    {\n      "intemp": "15.4",\n      
        "unit": "C",\n      "inhumi": "73",\n      
        "abs": "${offsetValue(data.airPressure)}Pa",\n      "rel": "981.4hPa"\n    }\n  ],\n  
        "signal": "ATCSQCSQ:17,99OK",\n  "imei": "868715034997514",\n  
        "battery": "0.00",\n  "spanel": "0.00",\n  
        "sht1": "${offsetValue(data.ST1, 1)}:${offsetValue(data.SH1, 1, true)}",\n  
        "sht2": "${offsetValue(data.ST2, 1)}:${offsetValue(data.SH2, 1, true)}"\n}\n`
      
      };
      request(options, function (error, response) {
        if (error) throw new Error(error);
        console.log(response.body);
      });
} 
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

function sendAndFetch(){
fetch('https://meteorastation.com/api/getStationData/Station4', requestOptions)
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    console.log('Response:', data);
    sendData(data)
  })
  .catch(error => {
    console.error('Error:', error);
  });
}

sendAndFetch();
setInterval(sendAndFetch, 30 * 60 * 1000);




