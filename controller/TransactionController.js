import { ObjectId } from "mongodb"
import { db } from "../helpers/mongodb.js"

export const InsertTransaction = async (publicKey) => {
    try {
        const insertTransactionToDB = await db.collection('Transaction').insertOne({
            user: publicKey,
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date()
        })

        return insertTransactionToDB?.insertedId
    } catch (error) {
        console.log(`Error from InsertTransaction: ${error}`)
        throw error;
    }
}

export const checkExistingTransaction = async (code) => {
    try {
        const existCode = await db.collection('Transaction').findOne({
            _id: new ObjectId(code)
        });
        console.log(existCode, '<< ini exist??')
        if (!existCode || existCode.status !== 'active') {
            throw {
                error: "Invalid Code",
                status: 400
            }
        }

        const updateTrans = await db.collection('Transaction').findOneAndUpdate(
            {_id: existCode._id},
            {$set: {status: 'claimed', updatedAt: new Date()}}
        );

        if (!updateTrans) {
            console.log(`FAILED UPDATE TRANSACTION STATUS`)
        }
        
        return true
    } catch (error) {
        throw error;
    }
}