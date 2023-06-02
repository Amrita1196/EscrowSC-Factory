const {
    AccountId,
    PrivateKey,
    Client,
    ContractCreateFlow,
    ContractExecuteTransaction,
    ContractFunctionParameters,
    ContractCallQuery,
    Hbar,
} = require("@hashgraph/sdk");
require("dotenv").config();
const fs = require("fs");

// Configure accounts and keys (testnet credentials)
const operatorId = AccountId.fromString(process.env.MY_ACCOUNT_ID);
const operatorPrivateKey = PrivateKey.fromString(process.env.MY_PRIVATE_KEY);

if (operatorId == null || operatorPrivateKey == null) {
    throw new Error("Environment variables OPERATOR_ID and OPERATOR_KEY are required.");
}

const client = Client.forTestnet().setOperator(operatorId, operatorPrivateKey);

async function main() {
    // Deploy the Factory Contract
    console.info("========== Deploying Factory Contract ===========");
    const factoryContractByteCode = fs.readFileSync("FactoryContract_sol_FactoryContact.bin", "utf8");

    const factoryContractInstantiateTx = new ContractCreateFlow()
        .setBytecode(factoryContractByteCode)
        .setGas(100000);

    const factoryContractInstantiateSubmit = await factoryContractInstantiateTx.execute(client);
    const factoryContractInstantiateRx = await factoryContractInstantiateSubmit.getReceipt(client);
    const factoryContractId = factoryContractInstantiateRx.contractId;
    const factoryContractAddress = factoryContractId.toSolidityAddress();

    console.log(`- The Factory Contract ID is: ${factoryContractId}`);
    console.log(`- The Factory Contract address in Solidity format is: ${factoryContractAddress}`);
    console.log("================================================");

    // Deploy the Child Contract using the Factory Contract
    console.info("========== Deploying Child Contract ===========");
    const childContractCreateFunctionParams = new ContractFunctionParameters()
        .addUint256(30); // Pass the initial value for the Child Contract

    const childContractCreateTx = new ContractExecuteTransaction()
        .setContractId(factoryContractId)
        .setGas(1000000)
        .setFunction("createContract", childContractCreateFunctionParams);

    const childContractCreateSubmit = await childContractCreateTx.execute(client);
    const childContractCreateRx = await childContractCreateSubmit.getReceipt(client);
    const childContractId = childContractCreateRx.contractId;
    const childContractAddress = childContractId.toSolidityAddress();

    console.log(`- The Child Contract ID is: ${childContractId}`);
    console.log(`- The Child Contract address in Solidity format is: ${childContractAddress}`);
    console.log("================================================");

    // Call the getDeployedContracts function of the Factory Contract
    console.info("========== Calling Factory Contract getDeployedContracts Function ===========");
    const factoryContractQueryTx = new ContractCallQuery()
        .setContractId(factoryContractId)
        .setGas(100000)
        .setFunction("getDeployedContracts");

    const factoryContractQuerySubmit = await factoryContractQueryTx.execute(client);
    const deployedContracts = factoryContractQuerySubmit.getString(0);
    console.log("- Deployed Contracts:", deployedContracts);
    console.log("================================================");

    // Call the getValue function of the Child Contract
    console.info("========== Calling Child Contract getValue Function ===========");
    const childContractQueryTx = new ContractCallQuery()
        .setContractId(childContractId)
        .setGas(100000)
        .setFunction("getValue");

    const childContractQuerySubmit = await childContractQueryTx.execute(client);
    const childValue = childContractQuerySubmit.getUint256(0);
    console.log("- Child Contract Value:", childValue);
    console.log("================================================");

    process.exit();
}

// Call the async function
main();
