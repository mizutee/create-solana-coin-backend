require("dotenv").config();
const { PinataSDK } = require("pinata-web3");
const { generateRandomWord } = require("./parseImage");
// Uploading File to PINATA IPFS
const uploadPinata = async (metadata) => {
    try {
        const metadataJson = {
            name: metadata.name,
            symbol: metadata.symbol,
            image: metadata.image, // Could point to your image file hosted elsewhere or use IPFS CID for image
            description: metadata.description
        };
        const pinata = new PinataSDK({
            pinataJwt: process.env.PINATA_JWT,
            pinataGateway: process.env.PINATA_URL
        })
        const metadataBlob = new Blob([JSON.stringify(metadataJson)], { type: 'application/json' });
        const file = new File([metadataBlob], generateRandomWord(10) + '.json', { type: 'application/json' });
        const upload = await pinata.upload.file(file);
        console.log('ke upload gak?', upload)
        return upload?.IpfsHash;
    } catch (error) {
        console.log(error)
    }
}

module.exports = { uploadPinata };

