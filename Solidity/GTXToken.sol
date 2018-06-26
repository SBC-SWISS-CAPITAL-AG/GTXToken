pragma solidity 0.4.24;


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

    function balanceOf(address _owner) view public returns (uint256 balance);
    function transfer(address _to, uint256 _value) public returns (bool success);
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success);
    function approve(address _spender, uint256 _value) public returns (bool success);
    function allowance(address _owner, address _spender) view public returns (uint256 remaining);

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

    function balanceOf(address _owner) view public returns (uint256 balance) {
        return balances[_owner];
    }

    function approve(address _spender, uint256 _value) public returns (bool success) {
        require(allowTransfer);
        allowed[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function allowance(address _owner, address _spender) view public returns (uint256 remaining) {
        return allowed[_owner][_spender];
    }

    mapping (address => uint256) balances;
    mapping (address => mapping (address => uint256)) allowed;
}


contract Token is StandardToken {

    string public name = "GTX Travel";
    string public symbol = "GTX";
    uint256 public decimals = 18;
    string public version = "GTX 0.1.2";
    uint256 private  million = 10**6;
    mapping(address => bool) public admins;
    address constant private test_wallet1 = 0xDaa70996F99D046152477aA9f1739604e0e4011F;
    address constant private test_wallet2 = 0x768E83529eF73f16C856644748f709D5AcBF2ce2;
    address constant private test_wallet3 = 0xDb07b0c66984e6A5a0A6408e5851D7479b459804;
    address constant private test_wallet4 = 0x7271b26275B8fFd77b562cf7A6BB00E90C78a784;
    address constant private test_wallet5 = 0x950f4cbA1221c2561493199dc8f87051EaFD8CB4;
    address constant private test_wallet6 = 0xA29544AB0105Af632b7c56616b8cf517c78164c3;
    address constant private wallet1 = 0xDaa70996F99D046152477aA9f1739604e0e4011F;
    address constant private wallet2 = 0x768E83529eF73f16C856644748f709D5AcBF2ce2;
    address constant private wallet3 = 0xDb07b0c66984e6A5a0A6408e5851D7479b459804;
    address constant private wallet4 = 0x7271b26275B8fFd77b562cf7A6BB00E90C78a784;
    address constant private wallet5 = 0x950f4cbA1221c2561493199dc8f87051EaFD8CB4;
    address constant private wallet6 = 0xA29544AB0105Af632b7c56616b8cf517c78164c3;

    event adminEvent(address indexed _callingAdmin, address indexed _affectedAdmin, string action);
    event allowTransfers(address indexed _callingAdmin, bool _transfersAllowed);


    modifier onlyAdmins {
        require(admins[msg.sender] == true);
        _;
    }

    constructor (bool testMode) public {
        require(msg.sender != address(0));
        assert(balances[msg.sender] == 0);
        assert(totalSupply == 0);
        allowTransfer = true;
        admins[msg.sender] = true;
        createTokens(testMode);
    }

    // creates all 750,000,000 (750M) tokens
    // allocate the tokens to the hard coded accounts
    function createTokens(bool testMode) internal {
        uint256 initial_expected_total = 750*million*(10**decimals);
        uint256 created = 0;

        if (testMode) {
            mintToken(test_wallet1, 200*million*(10**decimals));
            created += balances[test_wallet1];

            mintToken(test_wallet2, 200*million*(10**decimals));
            created += balances[test_wallet2];

            mintToken(test_wallet3, 100*million*(10**decimals));
            created += balances[test_wallet3];

            mintToken(test_wallet4, 100*million*(10**decimals));
            created += balances[test_wallet4];

            mintToken(test_wallet5, 75*million*(10**decimals));
            created += balances[test_wallet5];

            mintToken(test_wallet6, 75*million*(10**decimals));
            created += balances[test_wallet6];
        } else {
            mintToken(wallet1, 200*million*(10**decimals));
            created += balances[wallet1];

            mintToken(wallet2, 200*million*(10**decimals));
            created += balances[wallet2];

            mintToken(wallet3, 100*million*(10**decimals));
            created += balances[wallet3];

            mintToken(wallet4, 100*million*(10**decimals));
            created += balances[wallet4];

            mintToken(wallet5, 75*million*(10**decimals));
            created += balances[wallet5];

            mintToken(wallet6, 75*million*(10**decimals));
            created += balances[wallet6];
        }

        require(created == initial_expected_total);
        require(totalSupply == created);
    }

    //mints amount new tokens and transfers them to to address.
    //only admins can mint new tokens.
    //maximum amount of tokens you can mint at any one time is 250M
    function mintToken(address to, uint256 amount) onlyAdmins public returns (bool success) {
        require(allowTransfer);
        require(to != address(0)); //check an address was entered.
        require((amount > 0) && (amount < (250*million*(10**decimals))));
        require(totalSupply <= (totalSupply + amount)); //overflow check
        balances[to] += amount;
        totalSupply += amount;
        emit Transfer(address(0), to, amount);
        return true;
    }

    //Turn on / off the transfer of tokens
    function changeTransfer(bool allowed) onlyAdmins external {
        allowTransfer = allowed;
        emit allowTransfers(msg.sender, allowTransfer);
    }

    //add admin to the list of approved admins
    function addAdmin(address newAdmin) onlyAdmins external {
        require (newAdmin != address(0) && admins[newAdmin] == false);
        admins[newAdmin] = true;
        emit adminEvent(msg.sender, newAdmin, "added");
    }

    //remove an admin from the list of approved admins
    function removeAdmin(address oldAdmin) onlyAdmins external {
        require(oldAdmin != address(0));
        require(admins[oldAdmin] == true);
        require(msg.sender != oldAdmin); //prevents removing your self, and removing the last admin on the contract.
        admins[oldAdmin] = false;
        emit adminEvent(msg.sender, oldAdmin, "removed");
    }

    function approveAndCall(address _spender, uint256 _value, bytes _extraData) external returns (bool success) {
        allowed[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        require(_spender.call(bytes4(bytes32(sha3("receiveApproval(address,uint256,address,bytes)"))), msg.sender, _value, this, _extraData));
        return true;
    }
}