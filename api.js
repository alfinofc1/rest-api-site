/**
 * Copyright (C) 2024.
 * Licensed under the License;
 * You may not use this file except in compliance with the License.
 * It is supplied in the hope that it may be useful.
 * @project_name : BK9-API
 * @author : BK9 <https://github.com/BK9dev>
 * @description : API website with multiple endpoints and modern UI dashboard.
 * @version 0.0.1
 **/


//=================npm======================
const express = require("express");
const router = express.Router();
const fs = require("fs");
const axios = require("axios")
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI('your-gemini-api-key'); // add ur api key from https://aistudio.google.com/
const model = genAI.getGenerativeModel({ model: "gemini-pro"});

//========================lib============================
const errmg = 'Server is busy now. Try again later. Please report to the help center !!'
const l = console.log
const {fbdown, fbreg} = require("./BK9/fb");
const { chatgptimg } = require("./BK9/chatgptimg");


//======================== M O N G O D_B ============================


const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb+srv://zanssxploit:pISqUYgJJDfnLW9b@cluster0.fgram.mongodb.net/?retryWrites=true&w=majority';
const dbName = 'counts';

const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(function(err) {
    if (err) {
        console.error('Failed to connect to MongoDB:', err);
        return;
    }
    console.log('Connected successfully to MongoDB');
});

function count() {
    let num = Number(fs.readFileSync('count.txt', 'utf8'));
    let newum = num + 1;
    fs.writeFileSync('count.txt', newum.toString());

    let num2 = Number(fs.readFileSync('today.txt', 'utf8'));
    let newum2 = num2 + 1;
    fs.writeFileSync('today.txt', newum2.toString());

    const db = client.db(dbName);
    const countsCollection = db.collection('counts');

    countsCollection.findOneAndUpdate(
        { _id: 'total_requests' },
        { $inc: { count: 1 } },
        { upsert: true },
        function(err, result) {
            if (err) {
                console.error('Failed to update total requests count in MongoDB:', err);
                return;
            }
            console.log('Total requests count updated in MongoDB');
        }
    );

    countsCollection.findOneAndUpdate(
        { _id: 'today_requests' },
        { $inc: { count: 1 } },
        { upsert: true },
        function(err, result) {
            if (err) {
                console.error('Failed to update today\'s requests count in MongoDB:', err);
                return;
            }
            console.log('Today\'s requests count updated in MongoDB');
        }
    );
}

function visit() {
    let num = Number(fs.readFileSync('visit.txt', 'utf8'));
    let newum = num + 1;
    fs.writeFileSync('visit.txt', newum.toString());

    const db = client.db(dbName);
    const countsCollection = db.collection('visitors');

    countsCollection.findOneAndUpdate(
        { _id: 'visitors' },
        { $inc: { count: 1 } },
        { upsert: true },
        function(err, result) {
            if (err) {
                console.error('Failed to update visitors count in MongoDB:', err);
                return;
            }
            console.log('Visitors count updated in MongoDB');
        }
    );
}


router.get("/count", async (req, res) => {
    try {
        const db = client.db(dbName);
        const countsCollection = db.collection('counts');

        const totalCountDoc = await countsCollection.findOne({ _id: 'total_requests' });
        const todayCountDoc = await countsCollection.findOne({ _id: 'today_requests' });

        const RequestCount = totalCountDoc ? totalCountDoc.count : 0;
        const RequestToday = todayCountDoc ? todayCountDoc.count : 0;

        res.send({ Request_count: RequestCount, Request_today: RequestToday });
    } catch (error) {
        console.error('Error fetching counts from MongoDB:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
});

router.get("/visit", async (req, res) => {
    try {
        const db = client.db(dbName);
        const countsCollection = db.collection('visitors');

        const totalCountDoc = await countsCollection.findOne({ _id: 'visitors' });

        const visitorCount = totalCountDoc ? totalCountDoc.count : 0;

        res.send({ visitors: visitorCount });
    } catch (error) {
        console.error('Error fetching visitors count from MongoDB:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
});

//====================================functions===========================
  
const runtime = (seconds) => {
	seconds = Number(seconds)
	var d = Math.floor(seconds / (3600 * 24))
	var h = Math.floor(seconds % (3600 * 24) / 3600)
	var m = Math.floor(seconds % 3600 / 60)
	var s = Math.floor(seconds % 60)
	var dDisplay = d > 0 ? d + (d == 1 ? ' day, ' : ' days, ') : ''
	var hDisplay = h > 0 ? h + (h == 1 ? ' hour, ' : ' hours, ') : ''
	var mDisplay = m > 0 ? m + (m == 1 ? ' minute, ' : ' minutes, ') : ''
	var sDisplay = s > 0 ? s + (s == 1 ? ' second' : ' seconds') : ''
	return dDisplay + hDisplay + mDisplay + sDisplay;
}


router.get("/", (req, res) => {
    res.send("./html/index.html");
    visit()
});

router.get("/changelog", (req, res) => {
    fs.readFile("./html/changelog.html", 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error reading file');
            return;
        }
        res.send(data);
        visit()
    });
});

router.get("/status", (req, res) => {
        res.send({runtime: `${runtime(process.uptime())}`,ram: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${Math.round(require('os').totalmem / 1024 / 1024)}MB`});
});

//================================================= D O W N L O A D E R =================================================
router.get("/downloader", (req, res) => {
    fs.readFile("./html/downloader.html", 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error reading file');
            return;
        }
        res.send(data);
        visit()
    });
});

router.get("/downloader/fb", (req, res) => {
    const url = req.query.url || req.query.link;
    if(!fbreg(url)) return res.send({status: false, owner: '@BK9dev', err: 'Please give me a valid fb url !'});
    fbdown(url)
        .then((dadsta) => {
            res.send({status: true, owner: '@BK9dev', BK9: dadsta});
            count()
        })
        .catch((err) => {
            res.send({status: false, owner: '@BK9dev', err: errmg});
            l(err)
        });
});
///====================textpro=============
router.get("/xnxx", (req, res) => {
    const text = req.query.q || req.query.query;

    // Di sini Anda meletakkan variabel untuk teks,
    // Artinya daripada menulis kalimat ini setiap kali req.query.q || permintaan.permintaan.permintaan 
    //Tulis teks saja

    if(!text) return res.send({status: false, owner: '@alfinofc', err: 'Tulis sesuatu!'});
  // if(!text) berarti jika dia menulis sesuatu, kirimkan dia baris ini yang mengatakan tulis sesuatu

    axios.get('https://archive-ui.tanakadomp.biz.id/search/xnxx?q='+text)
        .then((response) => {
            const responseData = response.data; //Di sini mengambil informasi dari tautan di atas dan menaruhnya di sana untuk Anda
            res.send({alfin: responseData});
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({status: false, owner: '@alfinof ', err: 'Server sedang sibuk sekarang. Coba lagi nanti'});
        });
});

router.get("/ai/lilychan", (req, res) => {
    const text = req.query.q || req.query.query;

    // Di sini Anda meletakkan variabel untuk teks,
    // Artinya daripada menulis kalimat ini setiap kali req.query.q || permintaan.permintaan.permintaan 
    //Tulis teks saja

    if(!text) return res.send({status: false, owner: '@alfinofc', err: 'Tulis sesuatu!'});
  // if(!text) berarti jika dia menulis sesuatu, kirimkan dia baris ini yang mengatakan tulis sesuatu

    axios.get('https://archive-ui.tanakadomp.biz.id/ai/lilychan?text='+text)
        .then((response) => {
            const responseData = response.data; //Di sini mengambil informasi dari tautan di atas dan menaruhnya di sana untuk Anda
            res.send({alfin: responseData});
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({status: false, owner: '@alfinof ', err: 'Server sedang sibuk sekarang. Coba lagi nanti'});
        });
});

router.get("/ai/luminai", (req, res) => {
    const text = req.query.q || req.query.query;

    // Di sini Anda meletakkan variabel untuk teks,
    // Artinya daripada menulis kalimat ini setiap kali req.query.q || permintaan.permintaan.permintaan 
    //Tulis teks saja

    if(!text) return res.send({status: false, owner: '@alfinofc', err: 'Tulis sesuatu!'});
  // if(!text) berarti jika dia menulis sesuatu, kirimkan dia baris ini yang mengatakan tulis sesuatu

    axios.get('https://archive-ui.tanakadomp.biz.id/ai/luminai?text='+text)
        .then((response) => {
            const responseData = response.data; //Di sini mengambil informasi dari tautan di atas dan menaruhnya di sana untuk Anda
            res.send({alfin: responseData});
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({status: false, owner: '@alfinof ', err: 'Server sedang sibuk sekarang. Coba lagi nanti'});
        });
});

router.get("/liputan6", (req, res) => {

    axios.get('https://api.siputzx.my.id/api/berita/liputan6')
        .then((response) => {
            const responseData = response.data; //Di sini mengambil informasi dari tautan di atas dan menaruhnya di sana untuk Anda
            res.send({alfin: responseData});
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({status: false, owner: '@alfinof ', err: 'Server sedang sibuk sekarang. Coba lagi nanti'});
        });
});

router.get("/PlayStore", (req, res) => {
    const text = req.query.q || req.query.query;

    // Di sini Anda meletakkan variabel untuk teks,
    // Artinya daripada menulis kalimat ini setiap kali req.query.q || permintaan.permintaan.permintaan 
    //Tulis teks saja

    if(!text) return res.send({status: false, owner: '@alfinofc', err: 'Tulis sesuatu!'});
  // if(!text) berarti jika dia menulis sesuatu, kirimkan dia baris ini yang mengatakan tulis sesuatu

    axios.get('https://api.siputzx.my.id/api/apk/playstore?query='+text)
        .then((response) => {
            const responseData = response.data; //Di sini mengambil informasi dari tautan di atas dan menaruhnya di sana untuk Anda
            res.send({alfin: responseData});
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({status: false, owner: '@alfinof ', err: 'Server sedang sibuk sekarang. Coba lagi nanti'});
        });
});

router.get("/apkpure", (req, res) => {
    const text = req.query.q || req.query.query;

    // Di sini Anda meletakkan variabel untuk teks,
    // Artinya daripada menulis kalimat ini setiap kali req.query.q || permintaan.permintaan.permintaan 
    //Tulis teks saja

    if(!text) return res.send({status: false, owner: '@alfinofc', err: 'Tulis sesuatu!'});
  // if(!text) berarti jika dia menulis sesuatu, kirimkan dia baris ini yang mengatakan tulis sesuatu

    axios.get('https://api.siputzx.my.id/api/apk/apkpure?search='+text)
        .then((response) => {
            const responseData = response.data; //Di sini mengambil informasi dari tautan di atas dan menaruhnya di sana untuk Anda
            res.send({alfin: responseData});
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({status: false, owner: '@alfinof ', err: 'Server sedang sibuk sekarang. Coba lagi nanti'});
        });
});

router.get("/subdomains", (req, res) => {
    const text = req.query.q || req.query.query;

    // Di sini Anda meletakkan variabel untuk teks,
    // Artinya daripada menulis kalimat ini setiap kali req.query.q || permintaan.permintaan.permintaan 
    //Tulis teks saja

    if(!text) return res.send({status: false, owner: '@alfinofc', err: 'Tulis sesuatu!'});
  // if(!text) berarti jika dia menulis sesuatu, kirimkan dia baris ini yang mengatakan tulis sesuatu

    axios.get('https://api.siputzx.my.id/api/tools/subdomains?domain='+text)
        .then((response) => {
            const responseData = response.data; //Di sini mengambil informasi dari tautan di atas dan menaruhnya di sana untuk Anda
            res.send({alfin: responseData});
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({status: false, owner: '@alfinof ', err: 'Server sedang sibuk sekarang. Coba lagi nanti'});
        });
});

router.get("/text2base64", (req, res) => {
    const text = req.query.q || req.query.query;

    // Di sini Anda meletakkan variabel untuk teks,
    // Artinya daripada menulis kalimat ini setiap kali req.query.q || permintaan.permintaan.permintaan 
    //Tulis teks saja

    if(!text) return res.send({status: false, owner: '@alfinofc', err: 'Tulis sesuatu!'});
  // if(!text) berarti jika dia menulis sesuatu, kirimkan dia baris ini yang mengatakan tulis sesuatu

    axios.get('https://api.siputzx.my.id/api/tools/text2base64?text='+text)
        .then((response) => {
            const responseData = response.data; //Di sini mengambil informasi dari tautan di atas dan menaruhnya di sana untuk Anda
            res.send({alfin: responseData});
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({status: false, owner: '@alfinof ', err: 'Server sedang sibuk sekarang. Coba lagi nanti'});
        });
});

router.get("/ai/lepton", (req, res) => {
    const text = req.query.q || req.query.query;

    // Di sini Anda meletakkan variabel untuk teks,
    // Artinya daripada menulis kalimat ini setiap kali req.query.q || permintaan.permintaan.permintaan 
    //Tulis teks saja

    if(!text) return res.send({status: false, owner: '@alfinofc', err: 'Tulis sesuatu!'});
  // if(!text) berarti jika dia menulis sesuatu, kirimkan dia baris ini yang mengatakan tulis sesuatu

    axios.get('https://api.siputzx.my.id/api/ai/lepton?text='+text)
        .then((response) => {
            const responseData = response.data; //Di sini mengambil informasi dari tautan di atas dan menaruhnya di sana untuk Anda
            res.send({alfin: responseData});
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({status: false, owner: '@alfinof ', err: 'Server sedang sibuk sekarang. Coba lagi nanti'});
        });
});

/////==========waifu====
router.get("/ai/chat", (req, res) => {
    const text = req.query.q || req.query.query;

    // Di sini Anda meletakkan variabel untuk teks,
    // Artinya daripada menulis kalimat ini setiap kali req.query.q || permintaan.permintaan.permintaan 
    //Tulis teks saja

    if(!text) return res.send({status: false, owner: '@alfinofc', err: 'Tulis sesuatu!'});
  // if(!text) berarti jika dia menulis sesuatu, kirimkan dia baris ini yang mengatakan tulis sesuatu

    axios.get('https://api.siputzx.my.id/api/ai/qwq-32b-preview?content='+text)
        .then((response) => {
            const responseData = response.data; //Di sini mengambil informasi dari tautan di atas dan menaruhnya di sana untuk Anda
            res.send({responseData});
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({status: false, owner: '@alfinof ', err: 'Server sedang sibuk sekarang. Coba lagi nanti'});
        });
});

router.get("/spotify", (req, res) => {
    const text = req.query.q || req.query.query;

    // Di sini Anda meletakkan variabel untuk teks,
    // Artinya daripada menulis kalimat ini setiap kali req.query.q || permintaan.permintaan.permintaan 
    //Tulis teks saja

    if(!text) return res.send({status: false, owner: '@alfinofc', err: 'Tulis sesuatu!'});
  // if(!text) berarti jika dia menulis sesuatu, kirimkan dia baris ini yang mengatakan tulis sesuatu

    axios.get('https://api.siputzx.my.id/api/s/spotify?query='+text)
        .then((response) => {
            const responseData = response.data; //Di sini mengambil informasi dari tautan di atas dan menaruhnya di sana untuk Anda
            res.send({responseData});
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({status: false, owner: '@alfinof ', err: 'Server sedang sibuk sekarang. Coba lagi nanti'});
        });
});

router.get("/primbon/artinama", (req, res) => {
    const text = req.query.q || req.query.query;

    // Di sini Anda meletakkan variabel untuk teks,
    // Artinya daripada menulis kalimat ini setiap kali req.query.q || permintaan.permintaan.permintaan 
    //Tulis teks saja

    if(!text) return res.send({status: false, owner: '@alfinofc', err: 'Tulis sesuatu!'});
  // if(!text) berarti jika dia menulis sesuatu, kirimkan dia baris ini yang mengatakan tulis sesuatu

    axios.get('https://api.siputzx.my.id/api/s/spotify?query='+text)
        .then((response) => {
            const responseData = response.data; //Di sini mengambil informasi dari tautan di atas dan menaruhnya di sana untuk Anda
            res.send({responseData});
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({status: false, owner: '@alfinof ', err: 'Server sedang sibuk sekarang. Coba lagi nanti'});
        });
});

router.get("/primbon/nomorhoki", (req, res) => {
    const text = req.query.q || req.query.query;

    // Di sini Anda meletakkan variabel untuk teks,
    // Artinya daripada menulis kalimat ini setiap kali req.query.q || permintaan.permintaan.permintaan 
    //Tulis teks saja

    if(!text) return res.send({status: false, owner: '@alfinofc', err: 'Tulis sesuatu!'});
  // if(!text) berarti jika dia menulis sesuatu, kirimkan dia baris ini yang mengatakan tulis sesuatu

    axios.get('https://api.siputzx.my.id/api/primbon/nomorhoki?phoneNumber='+text)
        .then((response) => {
            const responseData = response.data; //Di sini mengambil informasi dari tautan di atas dan menaruhnya di sana untuk Anda
            res.send({responseData});
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({status: false, owner: '@alfinof ', err: 'Server sedang sibuk sekarang. Coba lagi nanti'});
        });
});

router.get("/primbon/zodiak", (req, res) => {
    const text = req.query.q || req.query.query;

    // Di sini Anda meletakkan variabel untuk teks,
    // Artinya daripada menulis kalimat ini setiap kali req.query.q || permintaan.permintaan.permintaan 
    //Tulis teks saja

    if(!text) return res.send({status: false, owner: '@alfinofc', err: 'Tulis sesuatu!'});
  // if(!text) berarti jika dia menulis sesuatu, kirimkan dia baris ini yang mengatakan tulis sesuatu

    axios.get('https://api.siputzx.my.id/api/primbon/zodiak?zodiak='+text)
        .then((response) => {
            const responseData = response.data; //Di sini mengambil informasi dari tautan di atas dan menaruhnya di sana untuk Anda
            res.send({responseData});
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({status: false, owner: '@alfinof ', err: 'Server sedang sibuk sekarang. Coba lagi nanti'});
        });
});

router.get("/ai/meta", (req, res) => {
    const text = req.query.q || req.query.query;

    // Di sini Anda meletakkan variabel untuk teks,
    // Artinya daripada menulis kalimat ini setiap kali req.query.q || permintaan.permintaan.permintaan 
    //Tulis teks saja

    if(!text) return res.send({status: false, owner: '@alfinofc', err: 'Tulis sesuatu!'});
  // if(!text) berarti jika dia menulis sesuatu, kirimkan dia baris ini yang mengatakan tulis sesuatu

    axios.get('https://api.siputzx.my.id/api/ai/metaai?query='+text)
        .then((response) => {
            const responseData = response.data; //Di sini mengambil informasi dari tautan di atas dan menaruhnya di sana untuk Anda
            res.send({responseData});
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({status: false, owner: '@alfinof ', err: 'Server sedang sibuk sekarang. Coba lagi nanti'});
        });
});

router.get("/ai/muslim", (req, res) => {
    const text = req.query.q || req.query.query;

    // Di sini Anda meletakkan variabel untuk teks,
    // Artinya daripada menulis kalimat ini setiap kali req.query.q || permintaan.permintaan.permintaan 
    //Tulis teks saja

    if(!text) return res.send({status: false, owner: '@alfinofc', err: 'Tulis sesuatu!'});
  // if(!text) berarti jika dia menulis sesuatu, kirimkan dia baris ini yang mengatakan tulis sesuatu

    axios.get('https://api.siputzx.my.id/api/ai/muslimai?query='+text)
        .then((response) => {
            const responseData = response.data; //Di sini mengambil informasi dari tautan di atas dan menaruhnya di sana untuk Anda
            res.send({responseData});
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({status: false, owner: '@alfinof ', err: 'Server sedang sibuk sekarang. Coba lagi nanti'});
        });
});

router.get("/ai/khodam", (req, res) => {
    const text = req.query.q || req.query.query;

    // Di sini Anda meletakkan variabel untuk teks,
    // Artinya daripada menulis kalimat ini setiap kali req.query.q || permintaan.permintaan.permintaan 
    //Tulis teks saja

    if(!text) return res.send({status: false, owner: '@alfinofc', err: 'Tulis sesuatu!'});
  // if(!text) berarti jika dia menulis sesuatu, kirimkan dia baris ini yang mengatakan tulis sesuatu

    axios.get('https://api.siputzx.my.id/api/ai/dukun?content='+text)
        .then((response) => {
            const responseData = response.data; //Di sini mengambil informasi dari tautan di atas dan menaruhnya di sana untuk Anda
            res.send({responseData});
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({status: false, owner: '@alfinof ', err: 'Server sedang sibuk sekarang. Coba lagi nanti'});
        });
});

router.get("/ai/llama", (req, res) => {
    const text = req.query.q || req.query.query;

    // Di sini Anda meletakkan variabel untuk teks,
    // Artinya daripada menulis kalimat ini setiap kali req.query.q || permintaan.permintaan.permintaan 
    //Tulis teks saja

    if(!text) return res.send({status: false, owner: '@alfinofc', err: 'Tulis sesuatu!'});
  // if(!text) berarti jika dia menulis sesuatu, kirimkan dia baris ini yang mengatakan tulis sesuatu

    axios.get('https://api.siputzx.my.id/api/ai/meta-llama-33-70B-instruct-turbo?content='+text)
        .then((response) => {
            const responseData = response.data; //Di sini mengambil informasi dari tautan di atas dan menaruhnya di sana untuk Anda
            res.send({responseData});
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({status: false, owner: '@alfinof ', err: 'Server sedang sibuk sekarang. Coba lagi nanti'});
        });
});

router.get("/ai/dbrx-instruct", (req, res) => {
    const text = req.query.q || req.query.query;

    // Di sini Anda meletakkan variabel untuk teks,
    // Artinya daripada menulis kalimat ini setiap kali req.query.q || permintaan.permintaan.permintaan 
    //Tulis teks saja

    if(!text) return res.send({status: false, owner: '@alfinofc', err: 'Tulis sesuatu!'});
  // if(!text) berarti jika dia menulis sesuatu, kirimkan dia baris ini yang mengatakan tulis sesuatu

    axios.get('https://api.siputzx.my.id/api/ai/dbrx-instruct?content='+text)
        .then((response) => {
            const responseData = response.data; //Di sini mengambil informasi dari tautan di atas dan menaruhnya di sana untuk Anda
            res.send({responseData});
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({status: false, owner: '@alfinof ', err: 'Server sedang sibuk sekarang. Coba lagi nanti'});
        });
});

router.get("/ai/deepseek-r1", (req, res) => {
    const text = req.query.q || req.query.query;

    // Di sini Anda meletakkan variabel untuk teks,
    // Artinya daripada menulis kalimat ini setiap kali req.query.q || permintaan.permintaan.permintaan 
    //Tulis teks saja

    if(!text) return res.send({status: false, owner: '@alfinofc', err: 'Tulis sesuatu!'});
  // if(!text) berarti jika dia menulis sesuatu, kirimkan dia baris ini yang mengatakan tulis sesuatu

    axios.get('https://api.siputzx.my.id/api/ai/deepseek-r1?content='+text)
        .then((response) => {
            const responseData = response.data; //Di sini mengambil informasi dari tautan di atas dan menaruhnya di sana untuk Anda
            res.send({responseData});
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({status: false, owner: '@alfinof ', err: 'Server sedang sibuk sekarang. Coba lagi nanti'});
        });
});

router.get("/otakudesu/search", (req, res) => {
    const text = req.query.q || req.query.query;

    // Di sini Anda meletakkan variabel untuk teks,
    // Artinya daripada menulis kalimat ini setiap kali req.query.q || permintaan.permintaan.permintaan 
    //Tulis teks saja

    if(!text) return res.send({status: false, owner: '@alfinofc', err: 'Tulis sesuatu!'});
  // if(!text) berarti jika dia menulis sesuatu, kirimkan dia baris ini yang mengatakan tulis sesuatu

    axios.get('https://api.siputzx.my.id/api/anime/otakudesu/search?s='+text)
        .then((response) => {
            const responseData = response.data; //Di sini mengambil informasi dari tautan di atas dan menaruhnya di sana untuk Anda
            res.send({responseData});
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({status: false, owner: '@alfinof ', err: 'Server sedang sibuk sekarang. Coba lagi nanti'});
        });
});

router.get("/info/bmkg", (req, res) => {

    axios.get('https://api.siputzx.my.id/api/info/bmkg')
        .then((response) => {
            const responseData = response.data; //Di sini mengambil informasi dari tautan di atas dan menaruhnya di sana untuk Anda
            res.send({responseData});
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({status: false, owner: '@alfinof ', err: 'Server sedang sibuk sekarang. Coba lagi nanti'});
        });
});

router.get("/cekml", (req, res) => {
    const text = req.query.id || req.query.query;
    const text2 = req.query.zoneid || req.query.query;

    // Di sini Anda meletakkan variabel untuk teks,
    // Artinya daripada menulis kalimat ini setiap kali req.query.q || permintaan.permintaan.permintaan 
    //Tulis teks saja

    if(!text) return res.send({status: false, owner: '@alfinofc', err: 'Tulis sesuatu!'});
    if(!text2) return res.send({status: false, owner: '@alfinofc', err: 'Tulis sesuatu!'});
  // if(!text) berarti jika dia menulis sesuatu, kirimkan dia baris ini yang mengatakan tulis sesuatu

    axios.get('https://api.ryzendesu.vip/api/stalk/cekml?userId=+text&zoneId='+text2)
        .then((response) => {
            const responseData = response.data; //Di sini mengambil informasi dari tautan di atas dan menaruhnya di sana untuk Anda
            res.send({responseData});
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({status: false, owner: '@alfinof ', err: 'Server sedang sibuk sekarang. Coba lagi nanti'});
        });
});
//
//================================================= A I =================================================
router.get("/ai", (req, res) => {
    fs.readFile("./html/ai.html", 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error reading file');
            return;
        }
        res.send(data);
        visit()
    });
});


router.get("/ai/gemini", (req, res) => {
const url = req.query.q || req.query.query;
if(!url) return res.send({status: false, owner: '@BK9dev', err: 'Please give me a prompt !'});
async function gemini(dd) {
let dadsta = await model.generateContent(dd) 
const response = await dadsta.response;
return response.text()
}

gemini(url)
.then(async (dadsta) => {
res.send({status: true, owner: '@BK9dev', BK9: dadsta});
count()
})
.catch(async (err) => {
    gemini(url)
    .then(async (dadsta) => {
    res.send({status: true, owner: '@BK9dev', BK9: dadsta});
    count()
    })
    .catch(async (err) => {
        res.send({status: false, owner: '@BK9dev', err: errmg});
        l(err)
    });
});
});

router.get("/ai/gptimg", (req, res) => {
    const url = req.query.q || req.query.query;
    if(!url) return res.send({status: false, owner: '@BK9dev', err: 'Please give me a prompt !'});
    chatgptimg(url)
        .then((dadsta) => {
            res.send({status: true, owner: '@BK9dev', BK9: dadsta});
            count()
        })
        .catch((err) => {
            res.send({status: false, owner: '@BK9dev', err: errmg});
            l(err)
        });
});

//================================================= T O O L S =================================================
router.get("/tools", (req, res) => {
    fs.readFile("./html/tools.html", 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error reading file');
            return;
        }
        res.send(data);
        visit()
    });
});


router.get("/tools/Shortlink", async (req, res) => {
    const url = req.query.url;
    const alias = req.query.alias;

    if (!url) {
        return res.status(400).json({ status: false, owner: '@BK9dev', err: 'URL is required.' });
    }

    try {
        let apiUrl = `https://bk9.site/api/create?url=${encodeURIComponent(url)}`;
        if (alias) {
            apiUrl += `&alias=${encodeURIComponent(alias)}`;
        }

        const response = await axios.get(apiUrl);
        res.json({ status: true, owner: '@BK9dev', BK9: response.data.BK9 });
        count()
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, owner: '@BK9dev', err: 'Failed to create shortlink.' });
    }
});


module.exports = router;
