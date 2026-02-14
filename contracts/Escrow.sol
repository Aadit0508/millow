//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

// interface IERC721 {
//     function transferFrom(
//         address _from,
//         address _to,
//         uint256 _id
//     ) external;
// }
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract Escrow {


    address public nftAddress;
    address payable public seller;
    address public inspector;
    address public lender;

    modifier onlySeller(){
        require(msg.sender==seller,"only seller can list the property");
        _; 
    }
    modifier onlyBuyer(uint256 _nftId){
        require(msg.sender==buyer[_nftId],"only buyer can deposit the earnest amount here");
        _;
    }
    modifier onlyInspector() {
        require(msg.sender == inspector, "Only inspector can call this method");
        _;
    }
    constructor(address _nftAddress , address payable _seller , address _inspector,address _lendor){
        nftAddress = _nftAddress;
        seller = _seller;
        inspector = _inspector;
        lender = _lendor;
    }

    mapping(uint256 => bool) public isListed;
    mapping(uint256 => uint256) public purchasePrice;
    mapping(uint256 => uint256) public escrowAmount;
    mapping(uint256 => address) public buyer;
    mapping(uint256=>bool)public inspectionPassed;
    mapping(uint256=>mapping(address=>bool)) public approval;

    function list(
        uint256 _nftID,
        address _buyer,
        uint256 _purchasePrice,
        uint256 _escrowAmount
    ) public payable onlySeller{
        // Transfer NFT from seller to this contract using the interface id provided above
        // This line moves an NFT from the caller to the Escrow contract, locking it inside the contract.
        IERC721(nftAddress).transferFrom(msg.sender, address(this), _nftID);
        
        isListed[_nftID] = true;
        purchasePrice[_nftID] = _purchasePrice;
        escrowAmount[_nftID] = _escrowAmount;
        buyer[_nftID] = _buyer;
    }

    function depositEarnest(uint256 _nftId) public payable onlyBuyer(_nftId){
        // ensures that only buyer can deposit the amount and it is greater than the escrow earnest amount???
        require(msg.value>=escrowAmount[_nftId]);
    }

     // Update Inspection Status (only inspector)
    function updateInspectionStatus(uint256 _nftID, bool _passed)
        public
        onlyInspector
    {
        inspectionPassed[_nftID] = _passed;
    }
    
    receive() external payable{}

    //For THIS property (_nftId), mark the caller as having approved the sale
    function approveSale(uint256 _nftId) public{
        approval[_nftId][msg.sender]=true;
    }

    function getBalance()public view returns(uint256){
        return address(this).balance; // address this is the address of the current amount and .balance is a built in function to return the balance

    }

    // Finalize Sale
    // -> Require inspection status (add more items here, like appraisal)
    // -> Require sale to be authorized
    // -> Require funds to be correct amount
    // -> Transfer NFT to buyer
    // -> Transfer Funds to Seller
    function finalizeSale(uint256 _nftID) public {
        require(inspectionPassed[_nftID]);
        require(approval[_nftID][buyer[_nftID]]);
        require(approval[_nftID][seller]);
        require(approval[_nftID][lender]);
        require(address(this).balance >= purchasePrice[_nftID]);

        isListed[_nftID] = false;

        (bool success, ) = payable(seller).call{value: address(this).balance}(
            ""
        );
        require(success);

        IERC721(nftAddress).transferFrom(address(this), buyer[_nftID], _nftID); 
        // address(this) refers to the Ethereum address of the contract itself
    }

    // Cancel Sale (handle earnest deposit)
    // -> if inspection status is not approved, then refund, otherwise send to seller
    function cancelSale(uint256 _nftID) public {
        if (inspectionPassed[_nftID] == false) {
            payable(buyer[_nftID]).transfer(address(this).balance);   //contract ka paisa to the buyer of the property
        } else { 
            payable(seller).transfer(address(this).balance);    //contract ka paisa to the seller of the property
        }
    }

}
