const Token = artifacts.require("Token");

contract('Token', function(accounts) {

    describe("Constructor Setup", function(){

        it("Confirm Token was initialised properly, and all initial wallet balances were set correctly.", function () {
            let tokenInstance;
            return Token.deployed().then(function (instance) {
                tokenInstance = instance;
                return tokenInstance.name();
            }).then(function (tokenName) {
                assert.equal(tokenName, "GTX Travel", "Token name not set correctly. Should be GTX Travel");
                return tokenInstance.symbol();
            }).then(function (tokenSymbol) {
                assert.equal(tokenSymbol, "GTX", "Token Symbol not set correctly. Should be GTX");
                return tokenInstance.decimals();
            }).then(function (tokenDecimals) {
                assert.equal(tokenDecimals, 18, "Token Decimals not set correctly. Should be 18");
                return tokenInstance.balanceOf(accounts[0], {
                    from: accounts[0]
                });
            }).then(function (accountBalance) {
                assert.equal(accountBalance.toNumber(), 200000000000000000000000000, "Initial balance of test_wallet1 not minted properly.");
                return tokenInstance.balanceOf(accounts[1], {
                    from:accounts[1]
                });
            }).then(function (accountBalance) {
                assert.equal(accountBalance.toNumber(), 200000000000000000000000000, "Initial balance of test_wallet2 not minted properly.");
                return tokenInstance.balanceOf(accounts[2], {
                    from: accounts[2]
                });
            }).then(function (accountBalance) {
                assert.equal(accountBalance.toNumber(), 100000000000000000000000000, "Initial balance of test_wallet3 not minted properly.");
                return tokenInstance.balanceOf(accounts[3], {
                    from: accounts[3]
                });
            }).then(function (accountBalance) {
                assert.equal(accountBalance.toNumber(), 100000000000000000000000000, "Initial balance of test_wallet4 not minted properly.");
                return tokenInstance.balanceOf(accounts[4], {
                    from: accounts[4]
                });
            }).then(function (accountBalance) {
                assert.equal(accountBalance.toNumber(), 75000000000000000000000000, "Initial balance of test_wallet5 not minted properly.");
                return tokenInstance.balanceOf(accounts[5], {
                    from: accounts[5]
                });
            }).then(function (accountBalance) {
                assert.equal(accountBalance.toNumber(), 75000000000000000000000000, "Initial balance of test_wallet6 not minted properly.");
                return tokenInstance.totalSupply();
            }).then(function (tokenTotal) {
                assert.equal(tokenTotal.toNumber(), 750000000000000000000000000, "Total initial supply of tokens not minted correctly. Should be 750M.");
            });
        });

    });

    describe("Admin Functions", function (){

        it("Test switching allowTransfer on / off", function () {
            let tokenInstance;
            return Token.deployed().then(function(instance){
                tokenInstance = instance;
                return tokenInstance.allowTransfer();
            }).then(function (allowTransfer) {
                assert(allowTransfer === true, "allowTransfer should be on by default");
                return tokenInstance.changeTransfer(false, {from: accounts[0]});
            }).then(function () {
                //put after a then() so as to remove the race condition on the transaction
                return tokenInstance.allowTransfer();
            }).then(function (allowTransfer){
                assert(allowTransfer === false, "allowTransfer should be turned off");
                tokenInstance.changeTransfer(true, {from: accounts[0]});
            }).then(function () {

            });
        });

        it("Test correctly adding an admin", function () {
            let tokenInstance;
            return Token.deployed().then(function(instance) {
                tokenInstance = instance;
                return tokenInstance.admins(accounts[0], {from: accounts[0]});
            }).then(function(isAdmin) {
                assert(isAdmin, "The account that deployed the Token should automatically be added as an admin");
                return tokenInstance.addAdmin(accounts[1], {from: accounts[0]});
            }).then(function (result) {
                assert.equal(result.logs.length, 1, 'Only one event should be triggered.');
                assert.equal(result.logs[0].event, "adminEvent", "Event Should be the adminEvent event." );
                assert.equal(result.logs[0].args._callingAdmin, accounts[0], "Event callingAdmin should be accounts[0]");
                assert.equal(result.logs[0].args._affectedAdmin, accounts[1], "Event affectedAdmin should be accounts[1]");
                assert.equal(result.logs[0].args.action,"added", "Event Amount announced should be amount sent");
            });
        });

        it("Test correctly removing an admin", function () {
            let tokenInstance;
            return Token.deployed().then(function(instance) {
                tokenInstance = instance;
                return tokenInstance.admins(accounts[0], {from: accounts[0]});
            }).then(function(isAdmin) {
                assert(isAdmin, "The account that deployed the Token should automatically be added as an admin");
                return tokenInstance.admins(accounts[1], {from: accounts[1]});
            }).then (function (isAdmin) {
                assert(isAdmin === true, "The new admin should have been added");
                return tokenInstance.removeAdmin(accounts[0], {from: accounts[1]});
            }).then(function (result) {
                assert.equal(result.logs.length, 1, 'Only one event should be triggered.');
                assert.equal(result.logs[0].event, "adminEvent", "Event Should be the adminEvent event." );
                assert.equal(result.logs[0].args._callingAdmin, accounts[1], "Event callingAdmin should be accounts[1]");
                assert.equal(result.logs[0].args._affectedAdmin, accounts[0], "Event affectedAdmin should be accounts[0]");
                assert.equal(result.logs[0].args.action,"removed", "Event Amount announced should be amount sent");
                return tokenInstance.admins(accounts[0], {from: accounts[1]});
            }).then (function (isAdmin) {
                assert(isAdmin === false, "The original admin should have been able to be removed by the new Admin");
                return tokenInstance.addAdmin(accounts[0], {from: accounts[1]});
            }).then(function () {
                //put after a then() so as to remove the race condition on the transaction
                return tokenInstance.admins(accounts[0], {from: accounts[0]});
            }).then(function (isAdmin) {
                assert(isAdmin, "Original Admin added back");
            });
        });

        it("Test removing your self as admin", function() {
            let tokenInstance;
            return Token.deployed().then(function(instance){
                tokenInstance = instance;
                return tokenInstance.admins(accounts[0], {from: accounts[0]});
            }).then (function (isAdmin) {
                assert(isAdmin === true, "Confirm default account is an admin");
                //Test removing self. Should not be able to, should throw error and revert.
                return tokenInstance.removeAdmin(accounts[0], {from: accounts[0]});
            }).then(function (error) {
                assert.fail("Should throw error trying to remove self");
            }).catch(function (error) {
                assert(error.message.indexOf('revert') >= 0, "Should throw revert error");
            });
        });

        it("Test removing an Admin while not an Admin", function () {
            let tokenInstance;
            return Token.deployed().then(function(instance){
                tokenInstance = instance;
                return tokenInstance.admins(accounts[0], {from: accounts[0]});
            }).then (function (isAdmin) {
                assert(isAdmin === true, "Confirming that account 0 is still admin");
                return tokenInstance.admins(accounts[2], {from: accounts[2]});
            }).then(function (isAdmin) {
                assert(isAdmin === false, "accounts[2] Should not be an admin account.");
                return tokenInstance.removeAdmin(accounts[0], {from: accounts[2]});
            }).then(function () {
                assert.fail("accounts[2] is not an admin, and removed an Admin account. This should have failed.");
            }).catch(function (error) {
                assert(error.message.indexOf('revert') >= 0, "Non-admin was not able to remove an Admin");

            });
        });

        it("Test double adding an admin (adding existing admin)", function () {
            let tokenInstance;
            return Token.deployed().then(function(instance){
                tokenInstance = instance;
                return tokenInstance.admins(accounts[0], {from: accounts[0]});
            }).then (function (isAdmin) {
                assert(isAdmin === true, "accounts[0] should still be an admin");
                return tokenInstance.addAdmin(accounts[0], {from: accounts[0]});
            }).then(function () {
                assert.fail("Should not be able to add existing Admin.");
            }).catch(function (error) {
                assert(error.message.indexOf('revert') >= 0, "Was not able to re-add existing admin. Correct.");
            });
        });

        it("Test adding an admin from a non-admin", function () {
            let tokenInstance;
            return Token.deployed().then(function(instance){
                tokenInstance = instance;
                return tokenInstance.admins(accounts[2], {from: accounts[2]});
            }).then (function (isAdmin) {
                assert(isAdmin === false, "accounts[2] should not be an admin.");
                return tokenInstance.addAdmin(accounts[2], {from: accounts[2]});
            }).then(function () {
                assert.fail("Was able to add Admin from a non-admin account. Should fail.");
            }).catch(function (error) {
                assert(error.message.indexOf('revert') >= 0, "Was not able to add Admin from a non-admin account.");
            });
        });

    });

    describe("transfer", function () {

        it("Test the correct transfer of tokens form one wallet to another.", function () {
            let transferAmount = web3.toWei(web3.toBigNumber("500"), "ether");
            let tokenInstance;
            let wallet1InitialBalance;
            let wallet2InitialBalance;
            return Token.deployed().then(function (instance) {
                tokenInstance = instance;
                return tokenInstance.balanceOf(accounts[0], {from: accounts[0]})
                    .then((balance) => {return web3.toBigNumber(balance);});
            }).then(function(wallet1Balance) {
                wallet1InitialBalance = wallet1Balance;
                assert(wallet1Balance.gt(transferAmount) , "Not enough balance in wallet 1");
                return tokenInstance.balanceOf(accounts[1], {from: accounts[1]})
                    .then((balance) => { return web3.toBigNumber(balance);});
            }).then (function(wallet2Balance) {
                wallet2InitialBalance = wallet2Balance;
                return tokenInstance.transfer.call(accounts[1], transferAmount, {from: accounts[0]});
            }).then (function(result) {
                assert(result === true, "transfer should return a true boolean");
                return tokenInstance.transfer(accounts[1], transferAmount, {from: accounts[0]});
            }).then(function(result){
                //Test the emitted event
                assert.equal(result.logs.length, 1, 'Only one event should be triggered.');
                assert.equal(result.logs[0].event, "Transfer", "Event Should be the Transfer event." );
                assert.equal(result.logs[0].args._from, accounts[0], "Event Sender should be accounts[0]");
                assert.equal(result.logs[0].args._to, accounts[1], "Event Receiver should be accounts[1]");
                assert(transferAmount.eq(result.logs[0].args._value), "Event Amount announced should be amount sent");
                return tokenInstance.balanceOf(accounts[0], {from: accounts[0]})
                    .then((bal) => {return web3.toBigNumber(bal)});
            }).then (function (walletBalance) {
                let correctNewBalance = wallet1InitialBalance.minus(transferAmount);
                assert(correctNewBalance.eq(walletBalance), "The transfered tokens weren't deducted from the sending wallet.");
                return tokenInstance.balanceOf(accounts[1],{from: accounts[1]})
                    .then((bal) => {return web3.toBigNumber(bal)});
            }).then(function (walletBalance) {
                let correctNewBalance = wallet2InitialBalance.plus(transferAmount);
                assert(correctNewBalance.eq(walletBalance), "The transfered tokens weren't added to the receiving wallet.")
            });
        });

        it("Test transfer by sending more tokens than in the wallet", function () {
            let tokenInstance;
            return Token.deployed().then(function(instance) {
                tokenInstance = instance;
                return tokenInstance.allowTransfer({from: accounts[0]});
            }).then (function(allowTransfer) {
                assert(allowTransfer === true, "allowTransfer should be set to true");
                return tokenInstance.balanceOf(accounts[0], {from: accounts[0]})
                    .then((bal) => {return web3.toBigNumber(bal)});
            }).then(function (walletBalance) {
                let amountToSend = walletBalance.plus(web3.toWei(web3.toBigNumber("500"),"ether"));
                return tokenInstance.transfer(accounts[1], amountToSend.toString(10), {from: accounts[0]});
            }).then(function() {
                assert.fail("More tokens than existed in the account were transferred.");
            }).catch(function (error) {
                assert(error.message.indexOf('revert') >= 0, "transfer should throw error when trying to send more tokens than exist, and revert.");
            });
        });

        it("Test transfer when allowTransfer is turned off",function () {
            let tokenInstance;
            return Token.deployed().then(function (instance) {
                tokenInstance = instance;
                return tokenInstance.changeTransfer(false, {from: accounts[0]});
            }).then (function () {
                //put after a then() so as to remove the race condition on the transaction
                return tokenInstance.allowTransfer();
            }).then (function(allowTransfer) {
                assert(!allowTransfer, "allowTransfer should be set to false");
                return tokenInstance.balanceOf(accounts[0], {from: accounts[0]})
                    .then((bal) => {return web3.toBigNumber(bal)});
            }).then (function(walletBalance) {
                let transferAmount = web3.toWei(web3.toBigNumber(100),"ether");
                assert(walletBalance.gt(transferAmount), "There aren't enough tokens to test transferring");
                return tokenInstance.transfer(accounts[1], transferAmount, {from: accounts[0]});
            }).then (function() {
                assert.fail("Transfer should not succeed. allowTransfer is off");
            }).catch(function(error) {
                assert(error.message.indexOf('revert') >= 0, "transfer Should throw error when allowTransfer is off");
                tokenInstance.changeTransfer(true, {from: accounts[0]});
            });
        });

        it("Test transfer by sending negative token values", function() {
            let tokenInstance;
            let transferAmount = web3.toWei(web3.toBigNumber("-500"), "ether");
            return Token.deployed().then(function (instance) {
                tokenInstance = instance;
                return tokenInstance.transfer(accounts[1], transferAmount, {from: accounts[0]});
            }).then (function() {
                assert.fail("Transfer should not allow sending negative amounts");
            }).catch(function(error) {
                assert(error.message.indexOf('revert') >= 0, "Transfer should not allow sending negative amounts");
            });
        });

        it("Test transfer with buffer overflow", function () {
            const maxUint = "115792089237316195423570985008687907853269984665640564039457584007913129639936";
            //TODO: find a simple way to get enough tokens to test the overflow
            /* Have not been able to come up with a good way to test overflow, given these starting parameters.
             * mintToken only lets you mint 2.5x10^27 tokens at a time.
             * max value is 1.1x10^77
             * would require a loop that calls mintToken 4x10^49 times. or with exact numbers
             * 463168356949264781694283940034751631413079938662563 calls to mintToken.
             * not sure it's even realistic, given that every call would cost ether / gas.
             *
             *    115792089237316195423570985008687907853269984665640564039457584007913129639936
             *  / 250000000000000000000000000
             *  =~40000000000000000000000000000000000000000000000000
             *
             *   or more precisely
             *   463168356949264781694283940034751631413079938662562 × 250000000000000000000000000 + 64039457584007913129639936
             *
             */
        });
    });

    describe('mintToken', function() {

        it("Test Minting Tokens", function() {
            let tokenInstance;
            let amountToMint = web3.toWei(web3.toBigNumber("200000000") ,"ether"); //200M
            let walletOpeningBalance;
            let totalSupplyOpeningBalance;
            return Token.deployed().then(function(instance) {
                tokenInstance = instance;
                //Test minting new tokens.
                return tokenInstance.admins(accounts[0], {from: accounts[0]});
            }).then(function(isAdmin) {
                assert(isAdmin === true, "accounts[0] should be an admin account");
                return tokenInstance.balanceOf(accounts[0], {from: accounts[0]})
                    .then((balance) => {return web3.toBigNumber(balance);});
            }).then(function (balance) {
                walletOpeningBalance = balance;
                return tokenInstance.totalSupply()
                    .then((balance) => {return web3.toBigNumber(balance);});
            }).then(function (totalSupply) {
                totalSupplyOpeningBalance = totalSupply;
                return tokenInstance.allowTransfer();
            }).then(function (allowTransfers) {
                assert(allowTransfers === true, "Transfers have to be turned on to mint tokens.");
                return tokenInstance.mintToken.call(accounts[0], amountToMint);
            }).then(function(result) {
                assert(result === true, "mintToken should return true");
                return tokenInstance.mintToken(accounts[0], amountToMint, {from: accounts[0]});
            }).then(function (result) {
                assert.equal(result.logs.length, 1, 'Only one event should be triggered.');
                assert.equal(result.logs[0].event, "Transfer", "Event Should be the transfer event." );
                assert.equal(result.logs[0].args._from, "0x0000000000000000000000000000000000000000", "Event _from should be the null / 0 account");
                assert.equal(result.logs[0].args._to, accounts[0], "Event affectedAdmin should be accounts[0]");
                assert(amountToMint.eq(result.logs[0].args._value), "Amount transferred should be the amount minted.");
                return tokenInstance.balanceOf(accounts[0])
                    .then((balance) => {return web3.toBigNumber(balance);});
            }).then(function (newBalance) {
                let correctBalance = walletOpeningBalance.plus(amountToMint);
                assert(correctBalance.eq(newBalance), "New Wallet balance should be exactly equal to the opening balance plus the amount of new tokens minted." );
                return tokenInstance.totalSupply()
                    .then((balance) => {return web3.toBigNumber(balance)});
            }).then(function (totalSupply) {
                let corrctSupply = totalSupplyOpeningBalance.plus(amountToMint);
                assert(corrctSupply.eq(totalSupply), "totalSupply should be exactly equal to the old totalSupply plus the new tokens minted.")
            });
        });

        it("Test that a non-admin can't call mintToken", function() {
            let tokenInstance;
            let amountToMint = web3.toWei(web3.toBigNumber("500"), "ether");
            return Token.deployed().then(function(instance) {
                tokenInstance = instance;
                return tokenInstance.admins(accounts[2], {from: accounts[2]})
            }).then(function(isAdmin) {
                assert(isAdmin === false, "accounts[2] should not be set as an Admin.");
                return tokenInstance.allowTransfer();
            }).then(function(allowTransfer) {
                assert(allowTransfer === true, "allowTransfer should be set to on");
                return tokenInstance.mintToken(accounts[2], amountToMint , {from: accounts[2]});
            }).then (function (){
                assert.fail("Calling mintToken from a non-admin account should throw error and revert. This is incorrect.");
            }).catch( function(error) {
                assert(error.message.indexOf('revert') >= 0, "Calling mintToken from a non-admin SHOULD throw an error");
            });
        });

        it("Test that mintToken fails when allowTransfer is false", function () {
            let tokenInstance;
            let amountToMint = web3.toWei(web3.toBigNumber("500"), "ether");
            return Token.deployed().then(function(instance) {
                tokenInstance = instance;
                return tokenInstance.admins(accounts[0], {from: accounts[0]});
            }).then(function (isAdmin) {
                assert(isAdmin === true, "mintToken can only be called by an Admin");
                tokenInstance.changeTransfer(false, {from: accounts[0]});
                return tokenInstance.allowTransfer();
            }).then(function (allowTransfer) {
                assert(allowTransfer === false, "allowTransfer should be set to false");
                return tokenInstance.mintToken(accounts[0], amountToMint, {from: accounts[0]});
            }).then(function () {
                assert.fail("mintToken should not work, when allowTransfer is false. This is incorrect.");
            }).catch(function (error) {
                assert(error.message.indexOf('revert') >= 0,"mintToken should not work when allowTranser if false.");
            });
        });

        it("Test that mintToken fails if trying to mint more then 250M tokens.", function () {
            let tokenInstance;
            let amountToMint = web3.toWei(web3.toBigNumber("500000000"), "ether");//500M tokens
            return Token.deployed().then(function (instance) {
                tokenInstance = instance;
                tokenInstance.changeTransfer(true, {from: accounts[0]});
                return tokenInstance.allowTransfer();
            }).then(function (allowTransfer) {
                assert(allowTransfer === true, "allowTransfers should be set to true");
                return tokenInstance.admins(accounts[0], {from: accounts[0]});
            }).then(function (isAdmin) {
                assert(isAdmin === true, "mintToken can only be called by an Admin");
                return tokenInstance.mintToken(accounts[0], amountToMint, {from: accounts[0]});
            }).then(function () {
                assert.fail("mintToken should not allow more then 250M tokens to be minted at a time. This is incorrect.");
            }).catch(function (error) {
                assert(error.message.indexOf('revert') >= 0, "mintToken should not allow more than 250M tokens to be minted at a time.");
            });
        });

        it("Test that mintToken fails if trying to mint negative tokens.", function () {
            let tokenInstance;
            let amountToMint = web3.toWei(web3.toBigNumber("-100"), "ether");
            return Token.deployed().then(function (instance) {
                tokenInstance = instance;
                return tokenInstance.admins(accounts[0]);
            }).then (function (isAdmin) {
                assert(isAdmin === true, "accounts[0] should be an Admin");
                return tokenInstance.allowTransfer();
            }).then(function (allowTransfer) {
                assert(allowTransfer === true, "allowTransfers should be set to true");
                return tokenInstance.mintToken(accounts[0], amountToMint, {from: accounts[0]});
            }).then(function () {
                assert.fail("mintToken should not allow more then 250M tokens to be minted at a time. This is incorrect.");
            }).catch(function (error) {
                assert(error.message.indexOf('revert') >= 0, "mintToken should not allow more than 250M tokens to be minted at a time.");
            });
        });

        it("Test mintToken with buffer overflow", function () {
            const maxUint = "115792089237316195423570985008687907853269984665640564039457584007913129639936";
            //TODO: see "Test transfer with buffer overflow"
        });
    });

    describe("burnToken", function () {

        it("Test Burning (deleting) Tokens", function () {
            let tokenInstance;
            let initialWalletBalance;
            let initialTotalSupply;
            let amountToBurn = web3.toWei(web3.toBigNumber("100000"), "ether");

            return Token.deployed().then(function (instance) {
                tokenInstance = instance;
                return tokenInstance.admins(accounts[0], {from: accounts[0]});
            }).then (function (isAdmin) {
                assert(isAdmin === true, "Only an Admin can call burnFrom");
                return tokenInstance.balanceOf(accounts[0], {from: accounts[0]})
                    .then((balance) => {return web3.toBigNumber(balance)});
            }).then(function(walletBalance) {
                assert(walletBalance.gt(amountToBurn), "Wallet balance needs to be >= amount of tokens to burn.");
                initialWalletBalance = walletBalance;
                return tokenInstance.totalSupply()
                    .then((balance) => {return web3.toBigNumber(balance)});
            }).then(function(totalSupply) {
                initialTotalSupply = totalSupply;
                assert(totalSupply.gt(amountToBurn), "totalSupply needs to be >= amount of tokens to burn.");
                return tokenInstance.burnFrom.call(accounts[0], amountToBurn, {from: accounts[0]});
            }).then(function(result) {
                assert(result === true, "Burn should succeed.");
                return tokenInstance.burnFrom(accounts[0], amountToBurn, {from: accounts[0]});
            }).then(function(result) {
                //Test the emitted event
                assert.equal(result.logs.length, 1, 'Only one event should be triggered.');
                assert.equal(result.logs[0].event, "Burn", "Event Should be the Transfer event." );
                assert.equal(result.logs[0].args.from, accounts[0], "Event Sender should be accounts[0]");
                assert(amountToBurn.eq(result.logs[0].args.value), "Event Amount announced should be amount sent");
                return tokenInstance.balanceOf(accounts[0], {from: accounts[0]})
                    .then((balance) => {return web3.toBigNumber(balance)});
            }).then(function(walletBalance) {
                let newWalletBalance = initialWalletBalance.minus(amountToBurn);
                assert(walletBalance.eq(newWalletBalance), "Wallet balance should be reduced by the amount of tokens Burnt");
                return tokenInstance.totalSupply();
            }).then(function (totalSupply) {
                let newTotalsupply = initialTotalSupply.minus(amountToBurn);
                assert(totalSupply.eq(newTotalsupply), "totalSupply should be reduced by the amount of tokens Burnt")
            });
        });

        it("Test burning tokens from non-Admin", function () {
            let tokenInstance;
            let initialWalletBalance;
            let amountToBurn = web3.toWei(web3.toBigNumber("100000"), "ether");

            return Token.deployed().then(function (instance) {
                tokenInstance = instance;
                return tokenInstance.admins(accounts[2]);
            }).then(function (isAdmin) {
                assert(isAdmin === false, "accoutns[2] should not be an admin");
                return tokenInstance.balanceOf(accounts[2])
                    .then((balance) => {return web3.toBigNumber(balance)});
            }).then(function(walletBalance) {
                assert(walletBalance.gt(amountToBurn), "Wallet balance needs to be >= amount of tokens to burn.");
                initialWalletBalance = walletBalance;
                return tokenInstance.burnFrom(accounts[2], amountToBurn, {from: accounts[2]});
            }).then (function () {
                assert.fail("Should throw error when a non-admin calls burnFrom");
            }).catch(function (error) {
                assert(error.message.indexOf('revert') >= 0, "Should revert when a non-admin trys to call burnFrom");
            });
        });

        it("Test burning more tokens than exist in the account", function () {
            let tokenInstance;
            let burnWalletBalance;
            let amountToBurn = web3.toWei(web3.toBigNumber("100000"), "ether");

            return Token.deployed().then(function (instance) {
                tokenInstance = instance;
                return tokenInstance.admins(accounts[0]);
            }).then(function (isAdmin) {
               assert(isAdmin === true, "accounts[0] should be an admin");
               return tokenInstance.balanceOf(accounts[0])
                   .then((balance) => {return web3.toBigNumber(balance)});
            }).then(function(walletBalance) {
                burnWalletBalance = walletBalance.plus(amountToBurn);
                return tokenInstance.burnFrom(accounts[0], burnWalletBalance, {from: accounts[0]});
            }).then (function () {
                assert.fail("Should throw revert when bunAmount exceeds walletBalance");
            }).catch(function (error) {
                assert(error.message.indexOf('revert') >= 0, "Should revert when bunAmount exceeds walletBalance");
            });
        });
    })

});