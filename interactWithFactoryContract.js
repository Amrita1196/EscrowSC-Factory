const { Client, AccountId, PrivateKey, ContractExecuteTransaction, ContractFunctionParameters, ContractCallQuery } = require("@hashgraph/sdk");
require("dotenv").config();
const fs = require("fs");

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
        .setFunction("createContract", new ContractFunctionParameters().addUint256(initialValue));

    const createContractSubmit = await createContractTx.execute(client);

    console.log("=============================================================");
    const createTokenRx = await createContractSubmit.getRecord(client);
    const result = await createTokenRx.contractFunctionResult.logs[0].data


    console.log("TransactionId:", createTokenRx.transactionId.toString());
    console.log("Instance Contract ID:", createTokenRx.contractFunctionResult.createdContractIds.toString());
    console.log("contract log info:\n",  result.newContract);
    // Call the getDeployedContracts function
    const getDeployedContractsQuery = new ContractCallQuery()
        .setContractId(factoryContractAddress)
        .setGas(100000)
        .setFunction("getDeployedContracts");

    const getDeployedContractsSubmit = await getDeployedContractsQuery.execute(client);
    const deployedContracts = getDeployedContractsSubmit.getString(0);
    console.log("Deployed Contracts:", deployedContracts);
    process.exit();

}

interactWithFactoryContract();



    
