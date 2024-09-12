const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;
const crypto = require('crypto');

app.use(cors()); // Разрешение запросов с других доменов (для разработки)

app.use(express.json()); // Для работы с JSON

const private_key = "sandbox_SksoMN0YVr98god4OEGjSe3Cl71EENvVTgI60XCE";


// Маршрут для получения данных, шифрования и отправки назад
app.post('/api/encrypt', (req, res) => {
    const {data2} = req.body;
    console.log(data2);

    const sign_string = private_key + data2 + private_key;
    console.log(sign_string);

    // Шифрование данных в Base64
    //const encryptedData = Buffer.from(data).toString('base64');
    const signature = crypto.createHash('sha1').update(sign_string).digest('base64');


    console.log('SIGNATURE:', signature);
    // Отправляем обратно зашифрованные данные
    res.json({signature});
});

app.get('/hello', (req, res) => {
    res.send({ message: 'Hello from the server!' });
})

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});

