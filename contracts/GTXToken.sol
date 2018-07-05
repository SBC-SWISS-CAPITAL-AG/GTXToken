pragma solidity 0.4.24;


/**
*  Open Zepplin SafeMath Library used for overflow detection.
*
*/
library SafeMath {

    /**
    * @dev Multiplies two numbers, throws on overflow.
    */
    function mul(uint256 a, uint256 b) internal pure returns (uint256 c) {
        // Gas optimization: this is cheaper than asserting 'a' not being zero, but the
        // benefit is lost if 'b' is also tested.
        // See: https://github.com/OpenZeppelin/openzeppelin-solidity/pull/522
        if (a == 0) {
            return 0;
        }

        c = a * b;
        assert(c / a == b);
        return c;
    }

    /**
    * @dev Integer division of two numbers, truncating the quotient.
    */
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        // assert(b > 0); // Solidity automatically throws when dividing by 0
        // uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold
        return a / b;
    }

    /**
    * @dev Subtracts two numbers, throws on overflow (i.e. if subtrahend is greater than minuend).
    */
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        assert(b <= a);
        return a - b;
    }

    /**
    * @dev Adds two numbers, throws on overflow.
    */
    function add(uint256 a, uint256 b) internal pure returns (uint256 c) {
        c = a + b;
        assert(c >= a);
        return c;
    }
}

/*
* ERC20 Token
* based on the Hunter Long ERC20 token
* @repo https://github.com/hunterlong/ethereum-ico-contract
*/

contract BasicToken {
    using SafeMath for uint256;

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
        balances[msg.sender] = balances[msg.sender].sub(_value);
        balances[_to] = balances[_to].add(_value);
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(allowTransfer);
        require(balances[_from] >= _value && allowed[_from][msg.sender] >= _value);
        balances[_to] = balances[_to].add(_value);
        balances[_from] = balances[_from].sub(_value);
        allowed[_from][msg.sender] = allowed[_from][msg.sender].sub(_value);
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

interface tokenRecipient { function receiveApproval(address _from, uint256 _value, address _token, bytes _extraData) external; }

contract Token is StandardToken {

    string public name = "GTX Travel";
    string public symbol = "GTX";
    uint256 public decimals = 18;
    string public version = "GTX 0.1.4";
    uint256 private constant million = 10**6;
    mapping(address => bool) public admins;
    address constant private test_wallet1 = 0x8198660ea9296F728802d29c3E68d3Fc65ca9316;
    address constant private test_wallet2 = 0x931Eeaf550e7b9dB943Be1f8C441a6B63c53166C;
    address constant private test_wallet3 = 0x2085d89EdE3271809962ba018dFCDE09952a1bCE;
    address constant private test_wallet4 = 0xa8Fd1968C3002AeC4bbC27BC248120E6C0660CeE;
    address constant private test_wallet5 = 0x9e4eC2c2608eD71ED5Dd135aEe45A6f233F6719b;
    address constant private test_wallet6 = 0x88463961C66f759477943762dE5d17969f8A5360;
    address constant private wallet1 = 0xDaa70996F99D046152477aA9f1739604e0e4011F;
    address constant private wallet2 = 0x768E83529eF73f16C856644748f709D5AcBF2ce2;
    address constant private wallet3 = 0xDb07b0c66984e6A5a0A6408e5851D7479b459804;
    address constant private wallet4 = 0x7271b26275B8fFd77b562cf7A6BB00E90C78a784;
    address constant private wallet5 = 0x950f4cbA1221c2561493199dc8f87051EaFD8CB4;
    address constant private wallet6 = 0xA29544AB0105Af632b7c56616b8cf517c78164c3;

    event adminEvent(address indexed _callingAdmin, address indexed _affectedAdmin, string action);
    event allowTransfers(address indexed _callingAdmin, bool _transfersAllowed);
    event Burn(address indexed from, uint256 value);

    //deny access to methods, from accounts that aren't admins.
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
        require(totalSupply == 0);
        uint256 initial_expected_total = 750*million*(10**decimals);
        uint256 created = 0;

        if (testMode) {
            mintToken(test_wallet1, 200*million*(10**decimals));
            created = created.add(balances[test_wallet1]);

            mintToken(test_wallet2, 200*million*(10**decimals));
            created = created.add(balances[test_wallet2]);

            mintToken(test_wallet3, 100*million*(10**decimals));
            created = created.add(balances[test_wallet3]);

            mintToken(test_wallet4, 100*million*(10**decimals));
            created = created.add(balances[test_wallet4]);

            mintToken(test_wallet5, 75*million*(10**decimals));
            created = created.add(balances[test_wallet5]);

            mintToken(test_wallet6, 75*million*(10**decimals));
            created = created.add(balances[test_wallet6]);
        } else {
            mintToken(wallet1, 200*million*(10**decimals));
            created = created.add(balances[wallet1]);

            mintToken(wallet2, 200*million*(10**decimals));
            created = created.add(balances[wallet2]);

            mintToken(wallet3, 100*million*(10**decimals));
            created = created.add(balances[wallet3]);

            mintToken(wallet4, 100*million*(10**decimals));
            created = created.add(balances[wallet4]);

            mintToken(wallet5, 75*million*(10**decimals));
            created = created.add(balances[wallet5]);

            mintToken(wallet6, 75*million*(10**decimals));
            created = created.add(balances[wallet6]);
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
        require(totalSupply <= (totalSupply.add(amount))); //overflow check
        balances[to] = balances[to].add(amount);
        totalSupply = totalSupply.add(amount);
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

    /**
    * allows an admin to delete / burn tokens from an account.
    * reduces the total supply of tokens in circulation
    *
    * @param _from the address of the account to burn the tokens from
    * @param _value the amount of tokens to burn
    */
    function burnFrom(address _from, uint256 _value) onlyAdmins external returns (bool success) {
        require(balances[_from] >= _value);                     // Check if the targeted balance is enough
        balances[_from] = balances[_from].sub(_value);          // Subtract from the targeted balance
        totalSupply = totalSupply.sub(_value);                  // Update totalSupply
        emit Burn(_from, _value);
        return true;
    }


    /**
    * Set allowance for other address and notify
    *
    * Allows `_spender` to spend no more than `_value` tokens in your behalf, and then ping the contract about it
    */
    function approveAndCall(address _spender, uint256 _value, bytes _extraData) external returns (bool success) {
        require(_spender != address(0));
        tokenRecipient spender = tokenRecipient(_spender);
        if (approve(_spender, _value)) {
            spender.receiveApproval(msg.sender, _value, this, _extraData);
            return true;
        }
    }
}