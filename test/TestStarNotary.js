
const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;
var userOne;
var userTwo;

var nhutnh5_star_contract;

var latest_star_id = 0;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
    userOne = accounts[1];
    userTwo = accounts[2];
});

before(async () => {
    nhutnh5_star_contract = await StarNotary.deployed();
});

/*
This function will create new id for a star
Parameters: None
Returns:
    A integer star id
*/
function create_new_star_id(){
    latest_star_id++;
    return latest_star_id;
}

it('can Create a Star', async() => {
    const tokenId = create_new_star_id();
    // let instance = await StarNotary.deployed();
    await nhutnh5_star_contract.createStar('Awesome Star!', tokenId, {from: accounts[0]});
    assert.equal(await nhutnh5_star_contract.tokenIdToStarInfo.call(tokenId), 'Awesome Star!');
});

it('lets user1 put up their star for sale', async() => {
    // let instance = await StarNotary.deployed();
    // let user1 = accounts[1];
    const starId = create_new_star_id();
    let starPrice = web3.utils.toWei(".01", "ether");
    await nhutnh5_star_contract.createStar('awesome star', starId, {from: userOne});
    await nhutnh5_star_contract.putStarUpForSale(starId, starPrice, {from: userOne});
    assert.equal(await nhutnh5_star_contract.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    // let instance = await StarNotary.deployed();
    // let user1 = accounts[1];
    // let user2 = accounts[2];
    const starId = create_new_star_id();
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await nhutnh5_star_contract.createStar('awesome star aaaaaa', starId, {from: userOne});
    await nhutnh5_star_contract.putStarUpForSale(starId, starPrice, {from: userOne});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(userOne);
    await nhutnh5_star_contract.buyStar(starId, {from: userTwo, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(userOne);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    // let instance = await StarNotary.deployed();
    // let user1 = accounts[1];
    // let user2 = accounts[2];
    const starId = create_new_star_id();
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await nhutnh5_star_contract.createStar('awesome star', starId, {from: userOne});
    await nhutnh5_star_contract.putStarUpForSale(starId, starPrice, {from: userOne});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(userTwo);
    await nhutnh5_star_contract.buyStar(starId, {from: userTwo, value: balance});
    assert.equal(await nhutnh5_star_contract.ownerOf.call(starId), userTwo);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    // let instance = await StarNotary.deployed();
    // let user1 = accounts[1];
    // let user2 = accounts[2];
    const starId = create_new_star_id();
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await nhutnh5_star_contract.createStar('awesome star', starId, {from: userOne});
    await nhutnh5_star_contract.putStarUpForSale(starId, starPrice, {from: userOne});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(userTwo);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(userTwo);
    await nhutnh5_star_contract.buyStar(starId, {from: userTwo, value: balance, gasPrice:0});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(userTwo);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {
    // 1. create a Star with different tokenId
    const star_id = create_new_star_id();
    await nhutnh5_star_contract.createStar("New star is created!", star_id, {from: accounts[0]});

    //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
    assert.equal(await nhutnh5_star_contract.symbol(), "NSC");
    assert.equal(await nhutnh5_star_contract.name(), "NhutNH5 Star Crypto");
});

it('lookUptokenIdToStarInfo test', async() => {
    // 1. create a Star with different tokenId
    const star_id = create_new_star_id();
    await nhutnh5_star_contract.createStar("It is the 7th star!", star_id, {from: accounts[0]});

    // 2. Call your method lookUptokenIdToStarInfo
    // 3. Verify if you Star name is the same
    assert.equal(await nhutnh5_star_contract.lookUptokenIdToStarInfo(star_id), "It is the 7th star!");
});

it('lets 2 users exchange stars', async() => {
    // 1. create 2 Stars with different tokenId
    const star_id_one = create_new_star_id();
    await nhutnh5_star_contract.createStar("It is the 8th star!", star_id_one, {from: userOne});

    const star_id_two = create_new_star_id();
    await nhutnh5_star_contract.createStar("It is the 9th star!", star_id_two, {from: userTwo});

    assert.equal(await nhutnh5_star_contract.ownerOf.call(star_id_one), userOne);
    assert.equal(await nhutnh5_star_contract.ownerOf.call(star_id_two), userTwo);

    // 2. Call the exchangeStars functions implemented in the Smart Contract
    await nhutnh5_star_contract.exchangeStars(star_id_one, star_id_two, {from: userOne});

    // 3. Verify that the owners changed
    assert.equal(await nhutnh5_star_contract.ownerOf.call(star_id_one), userTwo);
    assert.equal(await nhutnh5_star_contract.ownerOf.call(star_id_two), userOne);
});

it('lets a user transfer a star', async() => {
    // 1. create a Star with different tokenId
    const star_id = create_new_star_id();
    await nhutnh5_star_contract.createStar("It is the 10th star!", star_id, {from: userOne});

    assert.equal(await nhutnh5_star_contract.ownerOf.call(star_id), userOne);
    assert.notEqual(await nhutnh5_star_contract.ownerOf.call(star_id), userTwo);

    // 2. use the transferStar function implemented in the Smart Contract
    await nhutnh5_star_contract.transferStar(userTwo, star_id, {from: userOne});

    // 3. Verify the star owner changed.
    assert.notEqual(await nhutnh5_star_contract.ownerOf.call(star_id), userOne);
    assert.equal(await nhutnh5_star_contract.ownerOf.call(star_id), userTwo);
});

