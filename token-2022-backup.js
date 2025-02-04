import dotenv from "dotenv";
dotenv.config();
import {
    Connection,
    Keypair,
    LAMPORTS_PER_SOL,
    SystemProgram,
    Transaction,
    clusterApiUrl,
    sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
    ExtensionType,
    TOKEN_2022_PROGRAM_ID,
    createInitializeMintInstruction,
    getMintLen,
    createInitializeMetadataPointerInstruction,
    getMint,
    getMetadataPointerState,
    getTokenMetadata,
    TYPE_SIZE,
    LENGTH_SIZE,
} from "@solana/spl-token";
import {
    createInitializeInstruction,
    createUpdateFieldInstruction,
    createRemoveKeyInstruction,
    pack,
} from "@solana/spl-token-metadata";
import { mintTo } from "@solana/spl-token";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { createAssociatedTokenAccountInstruction } from "@solana/spl-token";

// Playground wallet
const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

// const connection = new Connection("https://fittest-smart-shadow.solana-mainnet.quiknode.pro/72cf440b36fc0ff7c5ae92a46f6c5a66defabfc0/", 'confirmed');
const parsedSecret = process.env.DEV_1.split(",");
const payer = Keypair.fromSecretKey(new Uint8Array(parsedSecret));
const balance = await connection.getBalance(payer.publicKey)
console.log(balance / LAMPORTS_PER_SOL, 'SOL');
// Transaction to send
let transaction;
// Transaction signature returned from sent transaction
let transactionSignature;

// Generate new keypair for Mint Account
const mintKeypair = Keypair.generate();
// Address for Mint Account
const mint = mintKeypair.publicKey;
// Decimals for Mint Account
const decimals = 9;
// Authority that can mint new tokens
const mintAuthority = payer.publicKey;
// Authority that can update the metadata pointer and token metadata
const updateAuthority = payer.publicKey;

// Metadata to store in Mint Account
const responsePinata = await fetch('https://ipfs.io/ipfs/bafkreidyqtddte6563macmzk7h7awsbws4jgtgfbjh5r5nmevhpaazelaq');
const pinataData = await responsePinata.json();

const metaData = {
    updateAuthority: updateAuthority,
    mint: mint,
    name: "ZORP",
    symbol: "ZORP",
    uri: process.env.PINATA_FETCH_URL + "bafkreiaqagwilddgcbmbmxy56iviqpl2jizhfbu7xcdxinwkiz3dm4h4cq",
    additionalMetadata: [["description", "VERP ZORP VORP ZIP ZIP ZAP"]],
};

console.log(`Mint: ${mint}`)

const metadataExtension = TYPE_SIZE + LENGTH_SIZE;
const metadataLen = pack(metaData).length;

const mintLen = getMintLen([ExtensionType.MetadataPointer]);

const lamports = await connection.getMinimumBalanceForRentExemption(
    mintLen + metadataExtension + metadataLen,
);

const tokenAccount = await getAssociatedTokenAddress(
    mint,
    payer.publicKey,
    false,
    TOKEN_2022_PROGRAM_ID
);

const createAccountInstruction = SystemProgram.createAccount({
    fromPubkey: payer.publicKey,
    newAccountPubkey: mint,
    space: mintLen,
    lamports,
    programId: TOKEN_2022_PROGRAM_ID,
});

const createTokenAccountInstruction = createAssociatedTokenAccountInstruction(
    payer.publicKey, // Payer who funds the account
    tokenAccount, // Token account to be created
    payer.publicKey, // Owner of the token account
    mint, // Associated mint
    TOKEN_2022_PROGRAM_ID
);

// Instruction to initialize the MetadataPointer Extension
const initializeMetadataPointerInstruction =
    createInitializeMetadataPointerInstruction(
        mint, // Mint Account address
        updateAuthority, // Authority that can set the metadata address
        mint, // Account address that holds the metadata
        TOKEN_2022_PROGRAM_ID,
    );

// Instruction to initialize Mint Account data
const initializeMintInstruction = createInitializeMintInstruction(
    mint,
    decimals,
    mintAuthority, // Designated Mint Authority
    null, // Optional Freeze Authority
    TOKEN_2022_PROGRAM_ID,
);

// Instruction to initialize Metadata Account data
const initializeMetadataInstruction = createInitializeInstruction({
    programId: TOKEN_2022_PROGRAM_ID, // Token Extension Program as Metadata Program
    metadata: mint, // Account address that holds the metadata
    updateAuthority: updateAuthority, // Authority that can update the metadata
    mint: mint, // Mint Account address
    mintAuthority: mintAuthority, // Designated Mint Authority
    name: metaData.name,
    symbol: metaData.symbol,
    uri: metaData.uri,
});

// Instruction to update metadata, adding custom field
const updateFieldInstruction = createUpdateFieldInstruction({
    programId: TOKEN_2022_PROGRAM_ID, // Token Extension Program as Metadata Program
    metadata: mint, // Account address that holds the metadata
    updateAuthority: updateAuthority, // Authority that can update the metadata
    field: metaData.additionalMetadata[0][0], // key
    value: metaData.additionalMetadata[0][1], // value
});

// Add instructions to new transaction
transaction = new Transaction().add(
    createAccountInstruction,
    initializeMetadataPointerInstruction,
    // note: the above instructions are required before initializing the mint
    initializeMintInstruction,
    initializeMetadataInstruction,
    updateFieldInstruction,
    createTokenAccountInstruction
);

// Send transaction
transactionSignature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [payer, mintKeypair], // Signers
);

console.log(
    "\nCreate Mint Account:",
    `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`,
);

const mintAmount = 1000000000 * 10 ** decimals; // Example: 1000 tokens

const mintTxSignature = await mintTo(
    connection,
    payer, // Fee payer
    mint, // Token Mint
    tokenAccount, // Associated Token Account
    mintAuthority, // Must match the authority set earlier
    mintAmount, // Amount of tokens to mint
    [], // Signers (empty if mintAuthority is a keypair)
    undefined, // Commitment (optional)
    TOKEN_2022_PROGRAM_ID // Token 2022 Program
);

console.log(
    `✅ Tokens Minted: https://solana.fm/tx/${mintTxSignature}?cluster=devnet-solana`
);

const afterBalance = await connection.getBalance(payer.publicKey)
console.log(afterBalance / LAMPORTS_PER_SOL, 'SOL');

console.log("Cost: ", balance / LAMPORTS_PER_SOL - afterBalance / LAMPORTS_PER_SOL)