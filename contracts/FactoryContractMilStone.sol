// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FactoryContact {
    event ContractCreated(address newContract, uint256 timestamp);

    MilestoneContractTestEvent[] public deployedContracts;

    function createContract(address payable _provider, address payable _mo_address) public {
        MilestoneContractTestEvent newContract = new MilestoneContractTestEvent(_provider,_mo_address);
        deployedContracts.push(newContract);
        emit ContractCreated(address(newContract), block.timestamp);
    }

    function getDeployedContracts() public view returns (MilestoneContractTestEvent[] memory) {
        return deployedContracts;
    }
}


struct Milestone{
   
    uint id;
    string name;
    uint resolveTime;
    uint budget;
    uint numberRevisions;
    
}



contract MilestoneContractTestEvent{
   address payable public purchaser;
   address payable public provider;
   address  payable public mo_address;
   uint public total_budget=0;
   Milestone[] public milestones;
   
   // Map provider=> MS
   mapping (uint=>Milestone) milestone;

   event milestoneList(uint id,string name, uint resolvetime, uint budget,uint norevision );
   
//    MilestoneReq msreq;

//    Milestone[] 
   constructor(address payable _provider, address payable _mo_address){
      purchaser =payable (msg.sender);
      provider = _provider;
      mo_address = _mo_address;
      //lockFund();

   }
   modifier onlyPurchaser {
      require(msg.sender == purchaser);
      _;
   }




    
   // add MS
    function addMilestone(uint _id,string memory _name,uint _resolvetime,uint _budget,uint _noRevision) public onlyPurchaser
     {
       Milestone memory ms;
       ms.id=_id;
       ms.name=_name;
       ms.resolveTime=_resolvetime;
       ms.budget=_budget;
       ms.numberRevisions=_noRevision;
       
       milestones.push(ms);

       emit milestoneList(_id, _name, _resolvetime, _budget, _noRevision);
    }
   
 // Get all MS
 function getAllMS() public view returns (Milestone[] memory msList){
     return milestones;
 }

 // Get  MS by id
 function getMSbyId(uint _id) public view returns (Milestone memory MS){
     for(uint i=0;i<milestones.length;i++){
       if(milestones[i].id==_id){
           return milestones[i];
       }
     }
     
 }

 // Get  MS by id
 function getMSbyIdInMap(uint _id) public view returns (Milestone memory MS){
     return milestone[_id];
     
 }
 

}