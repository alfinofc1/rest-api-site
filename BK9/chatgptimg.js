const axios = require("axios")
const cheerio = require('cheerio')

chatgptimg = async(url) =>{
    let {data} = await axios.post("https://chat-gpt.pictures/api/generateImage",{"captionInput":url,"captionModel":"default"})
    return data
   }

module.exports = { chatgptimg }