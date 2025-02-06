import dotenv from "dotenv";
dotenv.config();
import {
    Connection,
    Keypair,
    LAMPORTS_PER_SOL,
    PublicKey,
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
    mintTo,
    setAuthority,
    getAssociatedTokenAddress,
    createAssociatedTokenAccountInstruction,
    AuthorityType,
    createSetAuthorityInstruction
} from "@solana/spl-token";
import {
    createInitializeInstruction,
    createUpdateFieldInstruction,
    createRemoveKeyInstruction,
    pack,
} from "@solana/spl-token-metadata";
import { createMintToInstruction } from "@solana/spl-token";

// export const CreateAndMintToken = async (payload) => {
//     try {
//         // Playground wallet
//         // const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
//         const connection = new Connection("https://fittest-smart-shadow.solana-mainnet.quiknode.pro/72cf440b36fc0ff7c5ae92a46f6c5a66defabfc0/", 'confirmed');
//         const parsedSecret = process.env.SECRET_KEY.split(",");
//         const payer = Keypair.fromSecretKey(new Uint8Array(parsedSecret));
//         const owner = new PublicKey(payload.publicKey);
//         const balance = await connection.getBalance(payer.publicKey)
//         console.log(balance / LAMPORTS_PER_SOL, 'SOL');
//         // Transaction to send
//         let transaction;
//         // Transaction signature returned from sent transaction
//         let transactionSignature;

//         // Generate new keypair for Mint Account
//         const mintKeypair = Keypair.generate();
//         // Address for Mint Account
//         const mint = mintKeypair.publicKey;
//         // Decimals for Mint Account
//         const decimals = 9;
//         // Authority that can mint new tokens
//         const mintAuthority = owner;
//         // Authority that can update the metadata pointer and token metadata
//         const updateAuthority = owner;

//         const metaData = {
//             updateAuthority: updateAuthority,
//             mint: mint,
//             name: payload.name,
//             symbol: payload.symbol,
//             uri: process.env.PINATA_FETCH_URL + payload.pinataHash,
//             additionalMetadata: [["description", payload.description]],
//         };

//         console.log(`Mint: ${mint}`)

//         const metadataExtension = TYPE_SIZE + LENGTH_SIZE;
//         const metadataLen = pack(metaData).length;

//         const mintLen = getMintLen([ExtensionType.MetadataPointer]);

//         const lamports = await connection.getMinimumBalanceForRentExemption(
//             mintLen + metadataExtension + metadataLen,
//         );

//         const tokenAccount = await getAssociatedTokenAddress(
//             mint,
//             owner,
//             false,
//             TOKEN_2022_PROGRAM_ID
//         );

//         console.log("Token Account:", tokenAccount?.toString())

//         const createAccountInstruction = SystemProgram.createAccount({
//             fromPubkey: payer.publicKey,
//             newAccountPubkey: mint,
//             space: mintLen,
//             lamports,
//             programId: TOKEN_2022_PROGRAM_ID,
//         });

//         const createTokenAccountInstruction = createAssociatedTokenAccountInstruction(
//             payer.publicKey, // Payer who funds the account
//             tokenAccount, // Token account to be created
//             owner, // Owner of the token account
//             mint, // Associated mint
//             TOKEN_2022_PROGRAM_ID
//         );

//         // Instruction to initialize the MetadataPointer Extension
//         const initializeMetadataPointerInstruction =
//             createInitializeMetadataPointerInstruction(
//                 mint, // Mint Account address
//                 null, // Authority that can set the metadata address
//                 mint, // Account address that holds the metadata
//                 TOKEN_2022_PROGRAM_ID,
//             );

//         const initializeMintInstruction = createInitializeMintInstruction(
//             mint,
//             decimals,
//             mintAuthority,
//             payload.revokeFreezeAuthority ? null : owner,
//             TOKEN_2022_PROGRAM_ID,
//         );

//         const initializeMetadataInstruction = createInitializeInstruction({
//             programId: TOKEN_2022_PROGRAM_ID,
//             metadata: mint,
//             updateAuthority: updateAuthority,
//             mint: mint,
//             mintAuthority: mintAuthority,
//             name: metaData.name,
//             symbol: metaData.symbol,
//             uri: metaData.uri,
//         });

//         transaction = new Transaction().add(
//             createAccountInstruction,
//             initializeMetadataPointerInstruction,
//             initializeMintInstruction,
//             initializeMetadataInstruction,
//             createTokenAccountInstruction
//         );

//         // Send transaction
//         transactionSignature = await sendAndConfirmTransaction(
//             connection,
//             transaction,
//             [payer, mintKeypair], // Signers
//         );

//         console.log(
//             "\nCreate Mint Account:",
//             `https://solana.fm/tx/${transactionSignature}`,
//         );

//         const mintAmount = 1000000000 * 10 ** decimals; // Example: 1000 tokens

//         const mintTxSignature = await mintTo(
//             connection,
//             payer, // Fee payer
//             mint, // Token Mint
//             tokenAccount, // Associated Token Account
//             mintAuthority, // Must match the authority set earlier
//             mintAmount, // Amount of tokens to mint
//             [], // Signers (empty if mintAuthority is a keypair)
//             undefined, // Commitment (optional)
//             TOKEN_2022_PROGRAM_ID // Token 2022 Program
//         );

//         console.log(
//             `✅ Tokens Minted: https://solana.fm/tx/${mintTxSignature}`
//         );

//         const afterBalance = await connection.getBalance(payer.publicKey)

//         if (payload.revokeMintAuthority) {
//             let revokeMintAuthorityTransaction = new Transaction().add(
//                 createSetAuthorityInstruction(
//                     mint,
//                     mintAuthority,
//                     AuthorityType.MintTokens,
//                     null,
//                     [],
//                     TOKEN_2022_PROGRAM_ID
//                 )
//             );

//             // Send the transaction to revoke the mint authority
//             const revokeTransactionSignature = await sendAndConfirmTransaction(
//                 connection,
//                 revokeMintAuthorityTransaction,
//                 [payer],
//             );

//             console.log(
//                 `✅ Mint Authority Revoked: https://solana.fm/tx/${revokeTransactionSignature}`
//             );

//         }

//         console.log(afterBalance / LAMPORTS_PER_SOL, 'SOL');

//         console.log("Cost: ", balance / LAMPORTS_PER_SOL - afterBalance / LAMPORTS_PER_SOL)
//         return mint;
//     } catch (error) {
//         console.log(error);
//         throw error;
//     }
// }

export const CreateAndMintToken = async (payload) => {
    try {
        // const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
        const connectionConfig = payload.network === 'mainnet' ? process.env.MAINNET_URL : clusterApiUrl("devnet");
        const connection = new Connection(connectionConfig, "confirmed");
        const payer = new PublicKey(payload.publicKey); // User's wallet
        const recipientWallet = new PublicKey("6L5AHVRw6FsrSLPXtCvPMruZaM2cyDbZijmyp8jqPZcm"); // Your wallet
        const {blockhash} = await connection.getLatestBlockhash();
        const transaction = new Transaction({
            feePayer: payer,
            recentBlockhash: blockhash
        });

        // send fee to our wallet
        transaction.add(SystemProgram.transfer({
            fromPubkey: payer, // ✅ Use converted PublicKey
            toPubkey: recipientWallet,
            lamports: 0.1 * 1e9
        }))

        const mintKeypair = Keypair.generate();
        const mint = mintKeypair.publicKey;
        const decimals = payload.decimals;
        const mintAuthority = payer;
        const updateAuthority = payer;

        const metaData = {
            updateAuthority: updateAuthority,
            mint: mint,
            name: payload.name,
            symbol: payload.symbol,
            uri: process.env.PINATA_FETCH_URL + payload.pinataHash,
            additionalMetadata: [["description", payload.description]],
        };

        const metadataExtension = TYPE_SIZE + LENGTH_SIZE;
        const metadataLen = pack(metaData).length;
        const mintLen = getMintLen([ExtensionType.MetadataPointer]);

        const lamports = await connection.getMinimumBalanceForRentExemption(
            mintLen + metadataExtension + metadataLen,
        );

        const tokenAccount = await getAssociatedTokenAddress(
            mint,
            payer,
            false,
            TOKEN_2022_PROGRAM_ID
        )

        // create account for token
        transaction.add(SystemProgram.createAccount({
            fromPubkey: payer,
            newAccountPubkey: mint,
            space: mintLen,
            lamports,
            programId: TOKEN_2022_PROGRAM_ID
        }))

        // instruction to initialize the metadatapointer extension
        transaction.add(createInitializeMetadataPointerInstruction(
            mint,
            null,
            mint,
            TOKEN_2022_PROGRAM_ID
        ))
        
        // instruction to initialize mint
        transaction.add(createInitializeMintInstruction(
            mint,
            decimals,
            mintAuthority,
            payload.revokeFreezeAuthority ? null : payer,
            TOKEN_2022_PROGRAM_ID
        ))

        // initialize instruction
        transaction.add(createInitializeInstruction({
            programId: TOKEN_2022_PROGRAM_ID,
            metadata: mint,
            updateAuthority: updateAuthority,
            mint: mint,
            mintAuthority: mintAuthority,
            name: metaData.name,
            symbol: metaData.symbol,
            uri: metaData.uri
        }));

        const accountInfo = await connection.getAccountInfo(tokenAccount);
        if (!accountInfo) {
            // create associated account instruction (?)
            transaction.add(createAssociatedTokenAccountInstruction(
                payer,
                tokenAccount,
                payer,
                mint,
                TOKEN_2022_PROGRAM_ID
            ))
        }

        const mintAmount = payload.supply * 10 ** decimals; // Example: 1000 tokens

        transaction.add(createMintToInstruction(
            mint,          // Mint account
            tokenAccount,  // Associated Token Account
            payer,         // Mint authority (payer)
            mintAmount,    // Amount to mint
            [],            // No additional signers
            TOKEN_2022_PROGRAM_ID
        ));

        if (payload.revokeMintAuthority) {
            transaction.add(createSetAuthorityInstruction(
                mint,
                mintAuthority,
                AuthorityType.MintTokens,
                null,
                [],
                TOKEN_2022_PROGRAM_ID
            ))
        }

        transaction.partialSign(mintKeypair)

        const serializedTransaction = transaction.serialize({requireAllSignatures: false});

        return {serializedTransaction, mintKeypair: mintKeypair.publicKey};
    } catch (error) {
        console.log(error);
        return error;
    }
}

export const FeePayment = async (publicKey) => {
    try {
        const payer = new PublicKey(publicKey);
        const transaction = new Transaction();
        const connection = new Connection(process.env.MAINNET_URL, "confirmed");
        const recipient = new PublicKey("6L5AHVRw6FsrSLPXtCvPMruZaM2cyDbZijmyp8jqPZcm");

        transaction.add(
            SystemProgram.transfer({
                fromPubkey: payer, // ✅ Use converted PublicKey
                toPubkey: recipient,
                lamports: 0.1 * 1e9
            })
        );

        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = payer;
        const serializedTransaction = transaction.serialize({ requireAllSignatures: false });
        return serializedTransaction;
    } catch (error) {
        console.log(`Error from FeePayment: ${error}`);
    }
}