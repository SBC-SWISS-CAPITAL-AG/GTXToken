pragma solidity ^0.4.24;


/*

BASIC ERC20 Crowdsale ICO ERC20 Token

Create this Token contract AFTER you already have the Sale contract created.

   Token(address sale_address)   // creates token and links the Sale contract

@author Hunter Long
@repo https://github.com/hunterlong/ethereum-ico-contract

*/


contract BasicToken {
    uint256 public totalSupply;
    bool public allowTransfer;

    function balanceOf(address _owner) constant  public returns (uint256 balance);
    function transfer(address _to, uint256 _value) public returns (bool success);
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success);
    function approve(address _spender, uint256 _value) public returns (bool success);
    function allowance(address _owner, address _spender) constant public returns (uint256 remaining);

    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);
}

contract StandardToken is BasicToken {

    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(allowTransfer);
        require(balances[msg.sender] >= _value);
        balances[msg.sender] -= _value;
        balances[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(allowTransfer);
        require(balances[_from] >= _value && allowed[_from][msg.sender] >= _value);
        balances[_to] += _value;
        balances[_from] -= _value;
        allowed[_from][msg.sender] -= _value;
        emit Transfer(_from, _to, _value);
        return true;
    }

    function balanceOf(address _owner) constant public returns (uint256 balance) {
        return balances[_owner];
    }

    function approve(address _spender, uint256 _value) public returns (bool success) {
        require(allowTransfer);
        allowed[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function allowance(address _owner, address _spender) constant public returns (uint256 remaining) {
        return allowed[_owner][_spender];
    }

    mapping (address => uint256) balances;
    mapping (address => mapping (address => uint256)) allowed;
}


contract Token is StandardToken {

    string public name = "GTXTest";
    uint8 public decimals = 18;
    string public symbol = "GTX";
    string public version = 'GTX 0.1.1';
    mapping(address => bool) public admins;

    modifier onlyAdmins {
        require(admins[msg.sender] == true);
        _;
    }

    constructor () public {
        require(msg.sender != 0x0);
        balances[msg.sender] = 0;
        totalSupply = 0;
        name = name;
        decimals = decimals;
        symbol = symbol;
        allowTransfer = true;
        admins[msg.sender] = true;
        createTokens();

    }

    // creates all 750,000,000 tokens
    // allocate the tokens to the hard coded accoutns
    function createTokens() internal {
        uint256 total = 750000000000000000000000000;
        uint256 created = 0;
        //200M Bruce
        balances[0xDaa70996F99D046152477aA9f1739604e0e4011F] = 200000000000000000000000000;
        created += balances[0x8F03F3B6D3475bBB47361e9d0181449399E1817B];
        //200M Mal
        balances[0x768E83529eF73f16C856644748f709D5AcBF2ce2] = 200000000000000000000000000;
        created += balances[0x768E83529eF73f16C856644748f709D5AcBF2ce2];
        //100M Geena Desktop
        balances[0xDb07b0c66984e6A5a0A6408e5851D7479b459804] = 100000000000000000000000000;
        created += balances[0xDb07b0c66984e6A5a0A6408e5851D7479b459804];
        //100M Geena website
        balances[0x7271b26275B8fFd77b562cf7A6BB00E90C78a784] = 100000000000000000000000000;
        created += balances[0x7271b26275B8fFd77b562cf7A6BB00E90C78a784];
        //75M Geoff MetaMask
        balances[0x950f4cbA1221c2561493199dc8f87051EaFD8CB4] = 75000000000000000000000000;
        created += balances[0xD5F345857c6A291dd019466571618DB34597E7eC];
        //75M Geoff Mist
        balances[0xA29544AB0105Af632b7c56616b8cf517c78164c3] = 75000000000000000000000000;
        created += balances[0xA29544AB0105Af632b7c56616b8cf517c78164c3];
        // require(created == total);
        totalSupply = total;
    }

    //Turn on / off the transfer of tokens
    function changeTransfer(bool allowed) onlyAdmins public {
        allowTransfer = allowed;
    }

    //mints amount new tokens and transfers them to to address.
    //only admins can mint new tokens.
    function mintToken(address to, uint256 amount) onlyAdmins public returns (bool success) {
        require(allowTransfer);
        require(to != 0x0);
        require(amount >0);
        require(totalSupply <= (totalSupply + amount));
        balances[to] += amount;
        totalSupply += amount;
        emit Transfer(this, to, amount);
        return true;
    }

    function approveAndCall(address _spender, uint256 _value, bytes _extraData) public returns (bool success) {
        allowed[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        require(_spender.call(bytes4(bytes32(sha3("receiveApproval(address,uint256,address,bytes)"))), msg.sender, _value, this, _extraData));
        return true;
    }

    //add admin to the list of approved admins
    function addAdmin(address newAdmin) onlyAdmins public {
        require (newAdmin != 0x0 && admins[newAdmin] == false);
        admins[newAdmin] = true;
    }

    //add admin to the list of approved admins
    function removeAdmin(address oldAdmin) onlyAdmins public {
        require (oldAdmin != 0x0) ;
        require (admins[oldAdmin] == true);
        require (msg.sender != oldAdmin);
        admins[oldAdmin] = false;
    }
}