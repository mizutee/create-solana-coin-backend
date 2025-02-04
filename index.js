const dotenv = require('dotenv');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { FeePayment, CreateAndMintToken } = require('./helpers/token-2022');
const { uploadToPinata } = require('./helpers/parseImage');
const { uploadPinata } = require('./helpers/pinata');
const { InsertTransaction, checkExistingTransaction } = require('./controller/TransactionController');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(
    cors({
        origin: ["http://localhost:3000"],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    })
);

app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post("/pay-fee", async (req, res) => {
    try {
        const { publicKey } = req.body;
        const transaction = await FeePayment(publicKey)
        const transactionCode = await InsertTransaction(publicKey)
        res.status(200).json({ transaction: transaction.toString("base64"), code: transactionCode });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post("/api/v1/create-token", async (req, res) => {
    try {
        let { name, symbol, description, supply, decimals, image, revokeFreezeAuthority, revokeMintAuthority, publicKey, code } = req.body
        await checkExistingTransaction(code)
        const imageURI = await uploadToPinata(image);
        image = process.env.PINATA_FETCH_URL + imageURI

        const payload = {
            name,
            symbol,
            description,
            supply,
            decimals,
            revokeFreezeAuthority,
            revokeMintAuthority,
            image,
            publicKey
        }
        const uploadMetadata = await uploadPinata({ name, symbol, image, description });
        payload.pinataHash = uploadMetadata;

        const result = await CreateAndMintToken(payload)
        res.status(200).json({ address: result })
    } catch (error) {
        console.log(error, '<<< mautau error nya apa :(')
        res.status(500).json({ error: "Internal Server Error" })
    }
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});