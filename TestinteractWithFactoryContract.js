const { Client, AccountId, PrivateKey,ContractId, ContractExecuteTransaction, ContractFunctionParameters, ContractCallQuery } = require("@hashgraph/sdk");
require("dotenv").config();
const fs = require("fs");

const Web3 = require('web3');
const web3 = new Web3;
let abi;
let newcontractID;

// Configure accounts and keys (testnet credentials)
const operatorId = AccountId.fromString(process.env.MY_ACCOUNT_ID);
const operatorPrivateKey = PrivateKey.fromString(process.env.MY_PRIVATE_KEY);

if (operatorId == null || operatorPrivateKey == null) {
    throw new Error("Environment variables MY_ACCOUNT_ID and MY_PRIVATE_KEY are required.");
}

const client = Client.forTestnet().setOperator(operatorId, operatorPrivateKey);

async function interactWithFactoryContract() {
    const factoryContractAddress = process.env.FACTORY_CONTACT_ADDRESS;
    // Call the createContract function
    const initialValue = 10;
    const createContractTx = new ContractExecuteTransaction()
        .setContractId(factoryContractAddress)
        .setGas(1000000)
        .setFunction("createContract", new ContractFunctionParameters().addAddress('0x5B38Da6a701c568545dCfcB03FcB875f56beddC4').addAddress('0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2'));

    const createContractSubmit = await createContractTx.execute(client);

    console.log("=============================================================");
    const createTokenRx = await createContractSubmit.getRecord(client);
    const log = createTokenRx.contractFunctionResult.logs[0]; // Get the first log from the "logs" array

    // convert the log.data (uint8Array) to a string
    let logStringHex = '0x'.concat(Buffer.from(log.data).toString('hex'));
    
    // get topics from log
    let logTopics = [];
    log.topics.forEach(topic => {
        logTopics.push('0x'.concat(Buffer.from(topic).toString('hex')));
    });
    
    // decode the event data
    decodeEvent("ContractCreated", logStringHex, logTopics.slice(1));
    

    console.log("TransactionId:", createTokenRx.transactionId.toString());
    console.log("Instance Contract ID:", createTokenRx.contractFunctionResult.createdContractIds.toString());
   // console.log("contract log info:\n", result);

//*****************Calling Child Function **************************

//**************************calling child Function************************************ */

const contractExecuteTx = new ContractExecuteTransaction()
.setContractId(newcontractID)
.setGas(300000)
.setFunction(
  "addMilestone",
  new ContractFunctionParameters().addUint256(0).addString("amrita").addUint256(14).addUint256(15).addUint256(1)
);
const contractExecuteSubmit = await contractExecuteTx.execute(client);
const contractExecuteRx = await contractExecuteSubmit.getReceipt(client);
// console.log("The transaction status is " +receipt2.status.toString());
console.log(`- Contract function call status: ${contractExecuteRx.status} \n`);

// //////************************GET FUNCTION CALL******************************** */


// console.info("========== Calling get Function from childContract ===========");
// //Add Function Call
// console.info("========== Calling get Add Function ===========");
// const contractQueryTx2 = new ContractCallQuery()
//   .setContractId(newcontractID)
//   .setGas(100000)
//   .setFunction("getValue", new ContractFunctionParameters());
// const contractQuerySubmit2 = await contractQueryTx2.execute(client);
// const contractQueryResult2 = contractQuerySubmit2.getUint256(0);
// console.log(`- get value== ${contractQueryResult2} \n`);
// //console.log(`- Get Fuction Result ${contractQueryResult1.s} \n`);



    process.exit();

}

/**
 * Decodes event contents using the ABI definition of the event
 * @param eventName the name of the event
 * @param log log data as a Hex string
 * @param topics an array of event topics
 */
function decodeEvent(eventName, log, topics) {
    const abiFile = require("./FactoryContact.json");
    abi = abiFile.abi;
    // abi = fs.readFileSync("FactoryContract_sol_FactoryContact.abi", "utf8");
    // console.log(abi);
    const eventAbi = abi.find(event => (event.name === eventName && event.type === "event"));
    const decodedLog = web3.eth.abi.decodeLog(eventAbi.inputs, log, topics);
    const newContractSolidityAddress = decodedLog.newContract
    newcontractID = ContractId.fromSolidityAddress(newContractSolidityAddress).toString();
    console.log(newcontractID);
    return decodedLog;
}


interactWithFactoryContract();





// const result = await createTokenRx.contractFunctionResult.logs.forEach(log => {
//     // convert the log.data (uint8Array) to a string
//     let logStringHex = '0x'.concat(Buffer.from(log.data).toString('hex'));

//     // get topics from log
//     let logTopics = [];
//     log.topics.forEach(topic => {
//         logTopics.push('0x'.concat(Buffer.from(topic).toString('hex')));
//     });

//     // decode the event data
//     decodeEvent("ContractCreated", logStringHex, logTopics.slice(1));
// });


