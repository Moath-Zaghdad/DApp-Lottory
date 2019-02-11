pragma solidity ^0.4.17;

contract Lottery{
    address public manager;
    address[] public player;
    
    function Lottery() public {
        manager = msg.sender;
    }
    
    function enter() public  payable{
        require(msg.value > 10 ether );
        player.push(msg.sender);
    }
    
    function random() private view returns (uint256){
        return uint256(keccak256(block.difficulty, now, player));
    }
    
    function pickWinner() public restricted {
        uint256 index = random() % player.length;
        player[index].transfer(this.balance);
        player = new address[](0);
    }
    
    modifier restricted (){
        require(msg.sender == manager);
        _;
    }

}

