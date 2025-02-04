import dotenv from "dotenv";
dotenv.config();
import { PinataSDK } from "pinata-web3";

export function generateRandomWord(length) {
    const characters = "abcdefghijklmnopqrstuvwxyz";  // You can add more characters if needed
    let randomWord = "";
  
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);  // Random index from the characters string
      randomWord += characters[randomIndex];  // Append the random character to the word
    }
  
    return randomWord;
}

export const dataURLtoFile = (dataUrl) => {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1]; // Extract MIME type
    const bstr = atob(arr[1]); // Decode Base64
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    const filename = generateRandomWord(8);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
  
    return new File([u8arr], filename, { type: mime });
}

export const uploadToPinata = async (dataUrl) => {
    try {
        const file = dataURLtoFile(dataUrl);
      
        const parseToFile = new File([file], generateRandomWord(8) + '.jpg', {type: 'image/jpg'})
        
        const pinata = new PinataSDK({
            pinataJwt: process.env.PINATA_JWT,
            pinataGateway: process.env.PINATA_URL,
        });
    
        const res = await pinata.upload.file(parseToFile)
    
        return res?.IpfsHash; // Contains the IPFS hash (CID)
    } catch (error) {
        throw error;
    }
  }
